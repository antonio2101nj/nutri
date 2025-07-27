# 🔧 Correção das Políticas de RLS para a Tabela `content`

## ❌ Problema Identificado

O erro "new row violates row-level security policy" indica que as políticas de RLS da tabela `content` estão muito restritivas e não permitem que admins insiram novos registros.

## 🔍 Análise do Problema

As políticas atuais podem ter problemas com:
1. **Verificação de role:** A política pode não estar encontrando corretamente o role 'admin' na tabela `profiles`
2. **Sintaxe da política:** A condição pode estar mal formulada
3. **Ordem das políticas:** Pode haver conflito entre políticas

## 🛠️ Solução: Scripts de Correção

### PASSO 1: Remover Políticas Existentes

Execute no **SQL Editor** do Supabase:

```sql
-- Remover políticas existentes da tabela content
DROP POLICY IF EXISTS "Authenticated users can view content" ON public.content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
```

### PASSO 2: Criar Políticas Corrigidas

Execute no **SQL Editor** do Supabase:

```sql
-- Política para leitura: todos os usuários autenticados podem ler
CREATE POLICY "content_select_policy" ON public.content
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para inserção: apenas admins podem inserir
CREATE POLICY "content_insert_policy" ON public.content
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para atualização: apenas admins podem atualizar
CREATE POLICY "content_update_policy" ON public.content
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para exclusão: apenas admins podem deletar
CREATE POLICY "content_delete_policy" ON public.content
    FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### PASSO 3: Verificar se o Usuário Admin Existe

Execute no **SQL Editor** do Supabase para verificar:

```sql
-- Verificar se o usuário admin existe na tabela profiles
SELECT id, email, role, created_at 
FROM auth.users 
WHERE email = 'antonio.n.21lsantos@gmail.com';

-- Verificar se o perfil admin existe na tabela profiles
SELECT id, full_name, role, created_at 
FROM public.profiles 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'antonio.n.21lsantos@gmail.com'
);
```

### PASSO 4: Criar Perfil Admin se Necessário

Se o perfil não existir ou não tiver role 'admin', execute:

```sql
-- Inserir ou atualizar o perfil do admin
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    auth.users.id,
    'Antonio Santos',
    'admin'
FROM auth.users 
WHERE auth.users.email = 'antonio.n.21lsantos@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = now();
```

## 🎯 Resultado Esperado

Após executar esses scripts:
1. ✅ O usuário `antonio.n.21lsantos@gmail.com` terá role 'admin'
2. ✅ As políticas de RLS permitirão que admins insiram conteúdo
3. ✅ Usuários comuns poderão apenas ler o conteúdo
4. ✅ O upload de arquivos funcionará corretamente

## 📝 Ordem de Execução

1. **PASSO 1:** Remover políticas antigas
2. **PASSO 2:** Criar políticas corrigidas
3. **PASSO 3:** Verificar usuário admin
4. **PASSO 4:** Criar/atualizar perfil admin (se necessário)

Execute os passos na ordem indicada no dashboard do Supabase.

