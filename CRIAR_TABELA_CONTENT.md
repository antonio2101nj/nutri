# 🎯 CRIAR TABELA CONTENT - PROBLEMA IDENTIFICADO!

## 🚨 PROBLEMA ENCONTRADO
A tabela `public.content` **NÃO EXISTE** no seu banco de dados Supabase. Por isso o upload não funciona!

## ✅ SOLUÇÃO: CRIAR A TABELA

Execute o seguinte script no **SQL Editor** do Supabase:

```sql
-- Criar a tabela content
CREATE TABLE public.content (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'pdf')),
    file_url TEXT,
    text_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Ativar RLS na tabela
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.content
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela content
DROP TRIGGER IF EXISTS content_updated_at ON public.content;
CREATE TRIGGER content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 🔍 VERIFICAR SE A TABELA FOI CRIADA

Após executar o script acima, execute este comando para verificar:

```sql
-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content' AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 📋 VERIFICAR POLÍTICAS

Execute este comando para verificar se as políticas foram criadas:

```sql
-- Verificar políticas da tabela content
SELECT * FROM pg_policies WHERE tablename = 'content';
```

---

**Depois de criar a tabela, teste o upload novamente!**

