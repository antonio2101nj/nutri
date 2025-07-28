# 🎯 SOLUÇÃO FINAL PARA PROBLEMA DE RLS

## 🚨 PROBLEMA IDENTIFICADO
O erro "new row violates row-level security policy" indica que as políticas de RLS estão muito restritivas ou não estão reconhecendo corretamente o usuário admin.

## ✅ SOLUÇÃO DEFINITIVA

### PASSO 1: REMOVER TODAS AS POLÍTICAS EXISTENTES
Execute no **SQL Editor** do Supabase:

```sql
-- Remover todas as políticas da tabela content
DROP POLICY IF EXISTS "Allow authenticated users to view content" ON public.content;
DROP POLICY IF EXISTS "Allow admins to insert content" ON public.content;
DROP POLICY IF EXISTS "Allow admins to update content" ON public.content;
DROP POLICY IF EXISTS "Allow admins to delete content" ON public.content;
DROP POLICY IF EXISTS "Allow authenticated users to insert content" ON public.content;
DROP POLICY IF EXISTS "Authenticated users can view content" ON public.content;
DROP POLICY IF EXISTS "Admins can insert content" ON public.content;
DROP POLICY IF EXISTS "Admins can update content" ON public.content;
DROP POLICY IF EXISTS "Admins can delete content" ON public.content;
```

### PASSO 2: CRIAR POLÍTICA SIMPLES E FUNCIONAL
Execute no **SQL Editor** do Supabase:

```sql
-- Política simples para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.content
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

### PASSO 3: VERIFICAR SE O RLS ESTÁ ATIVADO
Execute no **SQL Editor** do Supabase:

```sql
-- Verificar se RLS está ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'content';

-- Se rowsecurity for false, ativar RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
```

### PASSO 4: VERIFICAR POLÍTICAS DO STORAGE
No **Storage** do Supabase:
1. Vá em **Storage** → **content-media**
2. Clique na aba **Policies**
3. **REMOVA TODAS as políticas existentes**
4. Clique em **New Policy**
5. Selecione **"For full customization"**
6. Configure:
   - **Policy name**: `Allow all operations`
   - **Allowed operation**: `ALL`
   - **Policy definition**: `true`
   - **WITH CHECK expression**: `true`

### PASSO 5: VERIFICAR CONFIGURAÇÃO DO BUCKET
No **Storage** do Supabase:
1. Vá em **Storage** → **content-media**
2. Clique em **Settings** (ícone de engrenagem)
3. Certifique-se de que:
   - **Public bucket**: ✅ ATIVADO
   - **File size limit**: 50 MB (ou maior)
   - **Allowed MIME types**: `*/*` (permitir todos os tipos)

## 🔍 VERIFICAÇÃO FINAL
Execute no **SQL Editor** do Supabase para confirmar:

```sql
-- Verificar políticas da tabela content
SELECT * FROM pg_policies WHERE tablename = 'content';

-- Verificar se o usuário admin existe
SELECT id, email, role FROM public.profiles 
WHERE email = 'antonio.n.21lsantos@gmail.com';
```

## 📝 IMPORTANTE
Esta solução usa uma política mais permissiva para fins de teste. Em produção, você pode refinar as políticas para ser mais restritiva baseada em roles específicas.

