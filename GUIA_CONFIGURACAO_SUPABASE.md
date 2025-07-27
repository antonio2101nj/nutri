# 🚀 Guia Passo a Passo - Configuração do Supabase

Este guia te ajudará a configurar o banco de dados e storage no Supabase para as funcionalidades de upload.

## 📋 Pré-requisitos
- Acesso ao dashboard do Supabase: https://supabase.com/dashboard
- Projeto já criado (eoljttyilmxahdanpjfm)

---

## 🗄️ PASSO 1: Criar a Tabela `content`

### 1.1 Acessar o SQL Editor
1. Faça login no Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: `eoljttyilmxahdanpjfm`
3. No menu lateral esquerdo, clique em **SQL Editor** (ícone `>_`)

### 1.2 Executar Script de Criação da Tabela
Copie e cole o script abaixo no SQL Editor e clique em **RUN**:

```sql
-- Criar tabela content
CREATE TABLE public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('text', 'video', 'pdf', 'image')),
    content_text TEXT,
    media_url TEXT,
    thumbnail_url TEXT
);
```

**✅ Resultado esperado:** Mensagem "Success. No rows returned"

---

## 🔒 PASSO 2: Configurar Políticas de RLS para a Tabela `content`

### 2.1 Executar Script de Políticas
No mesmo SQL Editor, execute este script:

```sql
-- Habilitar RLS na tabela content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Política para que todos os usuários autenticados possam ler o conteúdo
CREATE POLICY "Authenticated users can view content" ON public.content
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que admins possam gerenciar (CRUD) o conteúdo
CREATE POLICY "Admins can manage content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**✅ Resultado esperado:** Mensagem "Success. No rows returned"

---

## 📁 PASSO 3: Criar o Bucket de Storage

### 3.1 Acessar o Storage
1. No menu lateral esquerdo, clique em **Storage**
2. Clique no botão **Create bucket** (ou **New bucket**)

### 3.2 Configurar o Bucket
- **Name:** `content_media`
- **Public bucket:** ✅ **Marque esta opção** (importante!)
- **File size limit:** Deixe o padrão ou aumente se necessário
- Clique em **Create bucket**

**✅ Resultado esperado:** Bucket `content_media` aparece na lista

---

## 🔐 PASSO 4: Configurar Políticas de RLS para o Storage

### 4.1 Executar Script de Políticas do Storage
Volte ao **SQL Editor** e execute este script:

```sql
-- Permitir que usuários autenticados leiam arquivos no bucket 'content_media'
CREATE POLICY "Authenticated users can read content media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'content_media');

-- Permitir que admins façam upload, atualização e exclusão de arquivos no bucket 'content_media'
CREATE POLICY "Admins can manage content media" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'content_media' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

**✅ Resultado esperado:** Mensagem "Success. No rows returned"

---

## ✅ PASSO 5: Verificar a Configuração

### 5.1 Verificar a Tabela
1. Vá em **Table Editor** no menu lateral
2. Você deve ver a tabela `content` na lista
3. Clique nela para ver as colunas criadas

### 5.2 Verificar o Bucket
1. Vá em **Storage** no menu lateral
2. Você deve ver o bucket `content_media`
3. Clique nele - deve estar vazio por enquanto

### 5.3 Verificar as Políticas
1. Na tabela `content`, clique na aba **Auth policies**
2. Você deve ver 2 políticas criadas
3. No Storage, clique no bucket `content_media` e vá em **Policies**
4. Você deve ver 2 políticas criadas

---

## 🎯 Resumo do que foi Configurado

✅ **Tabela `content`** - Para armazenar metadados dos uploads
✅ **Políticas RLS da tabela** - Usuários podem ler, admins podem gerenciar
✅ **Bucket `content_media`** - Para armazenar arquivos (vídeos, PDFs, imagens)
✅ **Políticas RLS do storage** - Usuários podem baixar, admins podem fazer upload

---

## 🆘 Problemas Comuns

### Erro: "relation 'public.profiles' does not exist"
- **Solução:** A tabela `profiles` precisa existir (já foi criada anteriormente)
- Verifique se ela existe em **Table Editor**

### Erro: "bucket 'content_media' does not exist"
- **Solução:** Certifique-se de que criou o bucket com o nome exato `content_media`

### Políticas não funcionam
- **Solução:** Verifique se o bucket foi marcado como **Public** na criação

---

## 📞 Próximo Passo

Após executar todos os passos acima, me avise que a configuração foi concluída para que eu possa prosseguir com os testes das funcionalidades de upload!

