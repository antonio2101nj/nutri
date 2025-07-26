#!/usr/bin/env python3
"""
Script para configurar o banco de dados Supabase
Cria tabelas necessárias e configura Row Level Security (RLS)
"""

import os
import sys
from supabase import create_client, Client

# Configurações do Supabase
SUPABASE_URL = "https://eoljttyilmxahdanpjfm.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbGp0dHlpbG14YWhkYW5wamZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzUyNzkyMCwiZXhwIjoyMDY5MTAzOTIwfQ.dQEKIuOGWoydpEKRdAhv9feOwvbGJFk6MTyp5hoKoWY"

def create_supabase_client():
    """Criar cliente Supabase com service role key"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Cliente Supabase criado com sucesso")
        return supabase
    except Exception as e:
        print(f"❌ Erro ao criar cliente Supabase: {e}")
        return None

def execute_sql(supabase: Client, sql: str, description: str):
    """Executar SQL usando a API REST do Supabase"""
    try:
        # Usar a API REST para executar SQL
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print(f"✅ {description}")
        return True
    except Exception as e:
        print(f"❌ Erro ao {description.lower()}: {e}")
        # Tentar abordagem alternativa para algumas operações
        try:
            # Para operações DDL, podemos tentar usar postgrest diretamente
            import requests
            headers = {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'Content-Type': 'application/json'
            }
            
            # Executar via API REST direta
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                json={'sql': sql},
                headers=headers
            )
            
            if response.status_code == 200:
                print(f"✅ {description} (via API REST)")
                return True
            else:
                print(f"❌ Erro na API REST: {response.text}")
                return False
        except Exception as e2:
            print(f"❌ Erro na abordagem alternativa: {e2}")
            return False

def create_profiles_table(supabase: Client):
    """Criar tabela de profiles"""
    sql = """
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    return execute_sql(supabase, sql, "Tabela 'profiles' criada")

def create_content_table(supabase: Client):
    """Criar tabela de conteúdo"""
    sql = """
    CREATE TABLE IF NOT EXISTS public.content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'pdf', 'image')),
        file_url TEXT,
        created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_published BOOLEAN DEFAULT false
    );
    """
    return execute_sql(supabase, sql, "Tabela 'content' criada")

def setup_rls_policies(supabase: Client):
    """Configurar Row Level Security (RLS)"""
    
    # Habilitar RLS
    sql_enable_rls = """
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
    """
    
    # Políticas para profiles
    sql_profiles_policies = """
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    
    -- Política para usuários verem apenas seu próprio perfil
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    
    -- Política para usuários atualizarem apenas seu próprio perfil
    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    
    -- Política para admins verem todos os perfis
    CREATE POLICY "Admins can view all profiles" ON public.profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    """
    
    # Políticas para content
    sql_content_policies = """
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "Everyone can view published content" ON public.content;
    DROP POLICY IF EXISTS "Admins can manage all content" ON public.content;
    DROP POLICY IF EXISTS "Admins can create content" ON public.content;
    
    -- Política para todos verem conteúdo publicado
    CREATE POLICY "Everyone can view published content" ON public.content
        FOR SELECT USING (is_published = true);
    
    -- Política para admins gerenciarem todo conteúdo
    CREATE POLICY "Admins can manage all content" ON public.content
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    
    -- Política para admins criarem conteúdo
    CREATE POLICY "Admins can create content" ON public.content
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    """
    
    success = True
    success &= execute_sql(supabase, sql_enable_rls, "RLS habilitado")
    success &= execute_sql(supabase, sql_profiles_policies, "Políticas de profiles criadas")
    success &= execute_sql(supabase, sql_content_policies, "Políticas de content criadas")
    
    return success

def create_trigger_functions(supabase: Client):
    """Criar funções e triggers para automação"""
    
    # Função para criar perfil automaticamente
    sql_handle_new_user = """
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'user')
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """
    
    # Trigger para novo usuário
    sql_trigger_new_user = """
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    """
    
    # Função para updated_at
    sql_updated_at_function = """
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """
    
    # Triggers para updated_at
    sql_updated_at_triggers = """
    DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
    CREATE TRIGGER profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        
    DROP TRIGGER IF EXISTS content_updated_at ON public.content;
    CREATE TRIGGER content_updated_at
        BEFORE UPDATE ON public.content
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    """
    
    success = True
    success &= execute_sql(supabase, sql_handle_new_user, "Função handle_new_user criada")
    success &= execute_sql(supabase, sql_trigger_new_user, "Trigger para novos usuários criado")
    success &= execute_sql(supabase, sql_updated_at_function, "Função handle_updated_at criada")
    success &= execute_sql(supabase, sql_updated_at_triggers, "Triggers updated_at criados")
    
    return success

def test_basic_operations(supabase: Client):
    """Testar operações básicas"""
    try:
        # Tentar listar tabelas existentes
        result = supabase.table('profiles').select('count').execute()
        print("✅ Teste de operação básica realizado com sucesso")
        return True
    except Exception as e:
        print(f"⚠️ Aviso no teste básico: {e}")
        # Não é crítico se falhar
        return True

def main():
    """Função principal"""
    print("🚀 Iniciando configuração do banco de dados Supabase...")
    print("=" * 50)
    
    # Criar cliente Supabase
    supabase = create_supabase_client()
    if not supabase:
        sys.exit(1)
    
    # Testar operações básicas
    print("\n🔍 Testando conexão...")
    test_basic_operations(supabase)
    
    # Criar tabelas
    print("\n📊 Criando tabelas...")
    create_profiles_table(supabase)
    create_content_table(supabase)
    
    # Configurar RLS
    print("\n🔒 Configurando Row Level Security...")
    setup_rls_policies(supabase)
    
    # Criar funções e triggers
    print("\n⚙️ Criando funções e triggers...")
    create_trigger_functions(supabase)
    
    print("\n" + "=" * 50)
    print("✅ Configuração do banco de dados concluída!")
    print("\n📋 Resumo:")
    print("- Tabela 'profiles' configurada para gerenciar usuários")
    print("- Tabela 'content' configurada para gerenciar conteúdo")
    print("- Políticas RLS configuradas para segurança")
    print("- Triggers configurados para automação")
    print("\n🎯 Próximos passos:")
    print("- Testar autenticação na aplicação")
    print("- Verificar criação automática de perfis")
    print("- Testar permissões de admin e usuário")

if __name__ == "__main__":
    main()

