# 🔍 Diagnóstico dos Problemas no Vercel - PLAN DE VITALIDAD (V2)

## ❌ Problemas Persistentes

### 1. Erro 401 no manifest.json
- **Erro:** `Failed to load resource: the server responded with a status of 401 ()`
- **Arquivo:** `manifest.json`
- **Status:** Persiste mesmo após adicionar `crossorigin="use-credentials"`.
- **Causa Potencial:** Pode ser um problema de cache do Vercel, ou alguma configuração de segurança mais profunda que está bloqueando o acesso a arquivos estáticos em preview deployments.

### 2. Erro 400 no PDF/Imagens do Supabase Storage
- **Erro:** `Failed to load resource: the server responded with a status of 400 ()`
- **Arquivo:** PDF/Imagens do Supabase Storage
- **Status:** Persiste mesmo após corrigir o nome do bucket para `content-media`.
- **Causa Potencial:** As políticas de RLS do Storage podem estar incorretas, ou o bucket não está verdadeiramente público/acessível para uploads autenticados.

### 3. Erro "new row violates row-level security policy"
- **Erro:** `new row violates row-level security policy`
- **Status:** Persiste mesmo após múltiplas tentativas de correção das políticas de RLS da tabela `content` e verificação do perfil `admin`.
- **Causa Potencial:** A lógica da política de RLS para `INSERT` na tabela `content` ainda não está correta ou o `auth.uid()` não está retornando o ID do usuário autenticado no contexto da política de forma esperada.

### 4. Carregamento Infinito
- **Sintoma:** Aplicativo fica na tela "Carregando aplicação..."
- **Causa:** Combinação dos erros acima impedindo o carregamento completo do aplicativo.

## 🔍 Análise Detalhada e Novas Hipóteses

### RLS na Tabela `content`
- A política de `INSERT` é a mais crítica aqui. O `EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')` deveria funcionar.
- **Hipótese:** Pode haver um problema com o `auth.uid()` dentro do contexto da política, ou o `auth.jwt()` não está sendo corretamente validado pelo Supabase para a sessão do Vercel.
- **Teste:** Desabilitar RLS temporariamente na tabela `content` para isolar o problema.

### RLS no Supabase Storage (`content-media` bucket)
- O erro 400 no upload sugere que a política de RLS para o bucket está bloqueando a escrita, ou o bucket não está configurado como público para escrita.
- **Hipótese:** As políticas de Storage RLS precisam ser revisadas para garantir que `authenticated` users com `admin` role possam `INSERT` (upload) e `SELECT` (download).
- **Teste:** Desabilitar RLS temporariamente no bucket `content-media` para isolar o problema.

### Erro 401 no `manifest.json`
- É muito estranho um arquivo estático dar 401. O `crossorigin="use-credentials"` é a solução padrão.
- **Hipótese:** Pode ser um problema de cache do Vercel ou uma configuração de segurança global no projeto Vercel que está interceptando requisições para arquivos estáticos.
- **Teste:** Verificar as configurações de deploy do Vercel para ver se há alguma regra de autenticação aplicada a assets estáticos.

## 🛠️ Plano de Ação (Revisado)

Vamos adotar uma abordagem mais agressiva para isolar os problemas de RLS e depois voltar aos erros 401/400.

### PASSO 1: Desabilitar RLS Temporariamente (Tabela `content` e Bucket `content-media`)

**Atenção:** Esta é uma medida temporária para diagnóstico. Não use em produção.

**No SQL Editor do Supabase:**

```sql
-- Desabilitar RLS na tabela content
ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS no bucket content-media (via SQL, se possível, ou via UI)
-- Para desabilitar via SQL, você precisaria de permissões de superusuário ou usar a API de Storage Admin.
-- Alternativamente, na UI do Supabase, vá em Storage -> content-media -> Policies e remova todas as políticas.
```

**No Dashboard do Supabase (UI):**
1. Vá em `Storage`.
2. Clique no bucket `content-media`.
3. Vá na aba `Policies`.
4. **Remova TODAS as políticas existentes** para o bucket `content-media`.

### PASSO 2: Testar Upload e Exibição

Após desabilitar o RLS, tente novamente:
1. Fazer login no aplicativo.
2. Acessar o painel de admin.
3. Tentar fazer o upload de um PDF, imagem ou vídeo.
4. Verificar se o conteúdo aparece no painel do usuário.

**Se o upload funcionar:** Isso confirmará que o problema era de RLS. Precisaremos então re-implementar as políticas de RLS com muito cuidado.

**Se o upload NÃO funcionar:** O problema é mais profundo e pode estar relacionado à configuração do Supabase no código ou às variáveis de ambiente no Vercel.

### PASSO 3: Re-habilitar RLS e Corrigir (Se o PASSO 2 funcionar)

Se o upload funcionar com RLS desabilitado, vamos re-habilitar e corrigir as políticas.

### PASSO 4: Investigar Erros 401/400 (Se persistirem)

Se os erros 401/400 no `manifest.json` e no PDF persistirem mesmo com RLS desabilitado, precisaremos investigar as configurações do Vercel e as URLs de acesso.

## 📝 Próximos Passos

1.  **Instruir o usuário a desabilitar RLS** na tabela `content` e no bucket `content-media`.
2.  **Aguardar a confirmação** do usuário.
3.  **Testar o aplicativo** no Vercel. 

