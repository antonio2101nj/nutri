# 🚨 SOLUÇÃO DRÁSTICA - DESABILITAR RLS TEMPORARIAMENTE

## 🎯 OBJETIVO
Desabilitar temporariamente o Row Level Security (RLS) para identificar se o problema está nas políticas ou em outro lugar.

## ⚠️ IMPORTANTE
Esta é uma solução **TEMPORÁRIA** apenas para diagnóstico. **NÃO use em produção!**

## 🔧 PASSOS PARA DESABILITAR RLS

### PASSO 1: Desabilitar RLS na Tabela Content
Execute no **SQL Editor** do Supabase:

```sql
-- Desabilitar RLS na tabela content (TEMPORÁRIO)
ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;
```

### PASSO 2: Remover Todas as Políticas do Storage
1. Vá em **Storage** → **content-media**
2. Clique na aba **Policies**
3. **DELETE/REMOVA todas as políticas existentes**
4. Deixe a aba **Policies** completamente vazia

### PASSO 3: Tornar o Bucket Público
1. Vá em **Storage** → **content-media**
2. Clique no ícone de **Settings** (engrenagem)
3. Certifique-se de que **"Public bucket"** está ✅ **ATIVADO**

### PASSO 4: Verificar se Funcionou
Execute no **SQL Editor** do Supabase para confirmar:

```sql
-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'content';
-- rowsecurity deve mostrar 'false'
```

## 🧪 TESTE APÓS DESABILITAR RLS

Após executar os passos acima:

1. **Acesse o aplicativo no Vercel**
2. **Faça login como admin**
3. **Tente fazer upload de um PDF**
4. **Se funcionar**, o problema estava nas políticas de RLS
5. **Se não funcionar**, o problema está em outro lugar (código, configuração do Supabase, etc.)

## 🔒 REABILITAR RLS DEPOIS DO TESTE

**IMPORTANTE:** Após identificar o problema, reabilite o RLS:

```sql
-- Reabilitar RLS na tabela content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Criar política simples que funciona
CREATE POLICY "Allow all operations for authenticated users" ON public.content
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

E recrie as políticas do Storage conforme necessário.

---

**Esta solução nos ajudará a identificar se o problema está nas políticas de RLS ou em outro lugar do sistema.**

