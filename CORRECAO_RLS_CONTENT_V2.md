# 🔧 Correção das Políticas de RLS para a Tabela `content` (Versão 2)

## ❌ Problema Persistente

O erro "new row violates row-level security policy" ainda ocorre, indicando que as políticas de RLS da tabela `content` ou a configuração do perfil admin não estão permitindo a inserção de novos registros como esperado.

## 🔍 Análise Adicional

Vamos simplificar a política de INSERT e garantir que o `auth.uid()` esteja funcionando corretamente em conjunto com a role `admin`.

## 🛠️ Solução: Scripts de Correção (V2)

### PASSO 1: Remover Políticas Existentes (Novamente)

Execute no **SQL Editor** do Supabase:

```sql
-- Remover todas as políticas existentes da tabela content
DROP POLICY IF EXISTS "content_select_policy" ON public.content;
DROP POLICY IF EXISTS "content_insert_policy" ON public.content;
DROP POLICY IF EXISTS "content_update_policy" ON public.content;
DROP POLICY IF EXISTS "content_delete_policy" ON public.content;

-- Remover políticas antigas caso ainda existam
DROP POLICY IF EXISTS "Authenticated users can view content" ON public.content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
```

### PASSO 2: Criar Políticas Corrigidas (V2)

Execute no **SQL Editor** do Supabase:

```sql
-- Política para leitura: todos os usuários autenticados podem ler
CREATE POLICY "content_select_policy" ON public.content
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para inserção: apenas admins podem inserir (simplificada)
CREATE POLICY "content_insert_policy" ON public.content
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Política para atualização: apenas admins podem atualizar
CREATE POLICY "content_update_policy" ON public.content
    FOR UPDATE 
    TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Política para exclusão: apenas admins podem deletar
CREATE POLICY "content_delete_policy" ON public.content
    FOR DELETE 
    TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
```

### PASSO 3: Verificar e Garantir o Perfil Admin

É CRUCIAL que o usuário `antonio.n.21lsantos@gmail.com` tenha a role `admin` na tabela `public.profiles`.

Execute no **SQL Editor** do Supabase para verificar:

```sql
-- Verificar se o perfil admin existe na tabela profiles
SELECT id, full_name, role, created_at 
FROM public.profiles 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'antonio.n.21lsantos@gmail.com'
);
```

Se a consulta acima não retornar `role = 'admin'`, execute o script abaixo para garantir:

```sql
-- Inserir ou atualizar o perfil do admin para garantir a role 'admin'
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
1. ✅ O usuário `antonio.n.21lsantos@gmail.com` terá a role `admin` garantida.
2. ✅ As políticas de RLS permitirão que admins insiram, atualizem e deletem conteúdo.
3. ✅ Usuários comuns poderão apenas ler o conteúdo.
4. ✅ O upload de arquivos funcionará corretamente.

## 📝 Ordem de Execução

1. **PASSO 1:** Remover políticas antigas (todas as listadas)
2. **PASSO 2:** Criar políticas corrigidas (V2)
3. **PASSO 3:** Verificar e garantir o perfil admin (executar o SELECT e, se necessário, o INSERT/UPDATE)

Execute os passos na ordem indicada no dashboard do Supabase. Após a execução, tente novamente o upload no aplicativo.

