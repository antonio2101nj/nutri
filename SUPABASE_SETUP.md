# Configuração do Supabase - Guia Completo

Este guia detalha como configurar o banco de dados Supabase para o PWA Admin Panel.

## 🔗 Acesso ao Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `eoljttyilmxahdanpjfm`

## 📊 Criação das Tabelas

### 1. Tabela `profiles`

No SQL Editor do Supabase, execute:

```sql
-- Criar tabela profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### 2. Tabela `content`

```sql
-- Criar tabela content
CREATE TABLE public.content (
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

-- Habilitar RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Everyone can view published content" ON public.content
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create content" ON public.content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## ⚙️ Funções e Triggers

### 1. Função para criar perfil automaticamente

```sql
-- Função para criar perfil quando usuário se registra
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

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Função para atualizar timestamps

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
DROP TRIGGER IF EXISTS content_updated_at ON public.content;
CREATE TRIGGER content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 🔐 Configuração de Autenticação

### 1. Configurações de Auth

No dashboard do Supabase:

1. Vá para **Authentication > Settings**
2. Configure:
   - **Site URL**: `http://localhost:5173` (desenvolvimento)
   - **Redirect URLs**: `http://localhost:5173/**`
   - **Email Confirmation**: Habilitado (recomendado)
   - **Email Templates**: Personalize se necessário

### 2. Providers de Auth

- **Email**: Habilitado por padrão
- **OAuth**: Configure se necessário (Google, GitHub, etc.)

## 📁 Storage (Opcional)

Para upload de arquivos, configure um bucket:

1. Vá para **Storage**
2. Crie um bucket chamado `content-files`
3. Configure políticas de acesso:

```sql
-- Política para admins fazerem upload
CREATE POLICY "Admins can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'content-files' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para todos visualizarem arquivos públicos
CREATE POLICY "Public files are viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'content-files');
```

## ✅ Verificação da Configuração

### 1. Teste as Tabelas

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'content');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. Teste a Aplicação

1. Execute a aplicação: `pnpm run dev --host`
2. Registre um usuário administrador
3. Verifique se o perfil foi criado automaticamente
4. Teste o login e redirecionamento

## 🚨 Troubleshooting

### Problema: Tabela profiles não existe
**Solução**: Execute o SQL de criação da tabela no SQL Editor

### Problema: RLS bloqueando acesso
**Solução**: Verifique se as políticas foram criadas corretamente

### Problema: Trigger não funciona
**Solução**: Verifique se a função e trigger foram criados

### Problema: Email não confirmado
**Solução**: 
- Verifique a configuração de email no dashboard
- Para desenvolvimento, desabilite a confirmação de email temporariamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no dashboard do Supabase
2. Consulte a documentação oficial: https://supabase.com/docs
3. Abra um issue no repositório do projeto

---

**Importante**: Mantenha as credenciais do Supabase seguras e nunca as compartilhe publicamente.

