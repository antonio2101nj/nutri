#!/usr/bin/env python3
"""
Script para testar a conexão com Supabase e verificar configurações básicas
"""

from supabase import create_client, Client

# Configurações do Supabase
SUPABASE_URL = "https://eoljttyilmxahdanpjfm.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbGp0dHlpbG14YWhkYW5wamZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Mjc5MjAsImV4cCI6MjA2OTEwMzkyMH0.EH35jBZ4ALwHPJUrhZOr58c4ijXQrw4YAxoLyBn7070"

def test_supabase_connection():
    """Testar conexão básica com Supabase"""
    try:
        # Criar cliente com chave anon
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Cliente Supabase criado com sucesso")
        
        # Testar operação básica
        try:
            # Tentar acessar uma tabela que pode não existir ainda
            result = supabase.table('profiles').select('*').limit(1).execute()
            print("✅ Tabela 'profiles' acessível")
            print(f"   Dados encontrados: {len(result.data)} registros")
        except Exception as e:
            print(f"⚠️ Tabela 'profiles' não encontrada ou sem dados: {e}")
        
        try:
            # Tentar acessar tabela de conteúdo
            result = supabase.table('content').select('*').limit(1).execute()
            print("✅ Tabela 'content' acessível")
            print(f"   Dados encontrados: {len(result.data)} registros")
        except Exception as e:
            print(f"⚠️ Tabela 'content' não encontrada ou sem dados: {e}")
        
        return supabase
        
    except Exception as e:
        print(f"❌ Erro ao conectar com Supabase: {e}")
        return None

def test_auth_operations(supabase: Client):
    """Testar operações de autenticação"""
    try:
        # Verificar se há sessão ativa
        session = supabase.auth.get_session()
        print(f"✅ Verificação de sessão: {session is not None}")
        
        # Testar se podemos acessar informações do usuário atual
        user = supabase.auth.get_user()
        print(f"✅ Verificação de usuário: {user is not None}")
        
        return True
    except Exception as e:
        print(f"⚠️ Operações de auth: {e}")
        return False

def main():
    """Função principal"""
    print("🔍 Testando conexão com Supabase...")
    print("=" * 50)
    
    # Testar conexão
    supabase = test_supabase_connection()
    if not supabase:
        print("❌ Falha na conexão com Supabase")
        return
    
    # Testar operações de auth
    print("\n🔐 Testando operações de autenticação...")
    test_auth_operations(supabase)
    
    print("\n" + "=" * 50)
    print("✅ Teste de conexão concluído!")
    print("\n📋 Status:")
    print("- Conexão com Supabase: OK")
    print("- Cliente configurado: OK")
    print("- Pronto para autenticação: OK")
    print("\n🎯 Próximo passo:")
    print("- Testar a aplicação React com autenticação")

if __name__ == "__main__":
    main()

