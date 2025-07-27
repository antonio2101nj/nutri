# 🔍 Diagnóstico dos Problemas no Vercel - PLAN DE VITALIDAD (V3)

## ❌ Problemas Persistentes

### 1. Erro 401 no manifest.json
- **Erro:** `Failed to load resource: the server responded with a status of 401 ()`
- **Arquivo:** `manifest.json`
- **Status:** Persiste mesmo após adicionar `crossorigin="use-credentials"` e desabilitar a proteção de deploy do Vercel.
- **Causa Potencial:** O log de build do Vercel mostra que o `manifest.json` está sendo gerado e incluído no build. O problema não parece ser de build. A persistência do 401 para um arquivo estático é altamente incomum e sugere um problema de configuração no Vercel que afeta o acesso a assets estáticos, ou um cache muito agressivo.

### 2. Erro "new row violates row-level security policy"
- **Erro:** `new row violates row-level security policy`
- **Status:** Persiste mesmo após múltiplas tentativas de correção das políticas de RLS da tabela `content` e verificação do perfil `admin`.
- **Causa Potencial:** Embora o perfil `admin` esteja correto no Supabase, a política de RLS para `INSERT` na tabela `content` pode não estar avaliando corretamente o `auth.uid()` ou a `role` do usuário autenticado no contexto da requisição do aplicativo. Isso pode ser devido a:
    - **Token JWT:** O token JWT do Supabase não está sendo passado corretamente na requisição de inserção, ou está expirado/inválido.
    - **Contexto da Função:** A função que executa a inserção não está sendo executada com as permissões corretas ou o contexto de autenticação.
    - **Política de RLS:** A política em si pode ter uma condição sutil que não está sendo atendida.

### 3. Erro 400 no PDF/Imagens do Supabase Storage
- **Erro:** `Failed to load resource: the server responded with a status of 400 ()`
- **Arquivo:** PDF/Imagens do Supabase Storage
- **Status:** Persiste mesmo após corrigir o nome do bucket para `content-media` e desabilitar RLS no bucket.
- **Causa Potencial:** O erro 400 (Bad Request) para upload de arquivos no Supabase Storage, mesmo com RLS desabilitado no bucket, é muito preocupante. Isso sugere que o problema não é de permissão, mas sim da requisição em si. Pode ser:
    - **URL do Storage:** A URL de upload está incorreta ou malformada.
    - **Formato da Requisição:** O corpo da requisição (payload) não está no formato esperado pelo Supabase Storage API.
    - **Chave de API:** A chave `VITE_SUPABASE_ANON_KEY` ou `VITE_SUPABASE_URL` não está sendo usada corretamente ou está incorreta no ambiente do Vercel.

### 4. Carregamento Infinito
- **Sintoma:** Aplicativo fica na tela "Carregando aplicação..."
- **Causa:** Combinação dos erros acima impedindo o carregamento completo do aplicativo. O erro 401 no `manifest.json` é um forte candidato a causar isso, pois o PWA pode não inicializar corretamente.

## 🔍 Análise dos Logs do Vercel

O log de build fornecido (`pasted_content.txt`) mostra que o build foi **bem-sucedido**:
- `✓ built in 14.70s`
- `Deployment completed`

Isso significa que o problema não está na fase de build, mas sim na fase de **runtime** (quando o aplicativo está rodando no Vercel).

## 🛠️ Plano de Ação (Revisado e Aprofundado)

Vamos atacar esses problemas em ordem de prioridade, começando pelo que impede o carregamento do app e depois os uploads.

### PASSO 1: Foco no Erro 401 do `manifest.json`

Este erro é o mais crítico, pois impede o carregamento completo do PWA. Já tentamos `crossorigin` e desabilitar a proteção de deploy. A próxima etapa é garantir que o `manifest.json` seja servido sem autenticação.

**Ação:** Adicionar uma regra de `headers` no `vercel.json` para o `manifest.json` e outros assets estáticos, garantindo que não haja cache e que o `crossorigin` seja aplicado corretamente.

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, proxy-revalidate" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    }
  ]
}
```

### PASSO 2: Re-verificar Variáveis de Ambiente do Supabase no Vercel

Os erros 400 (Storage) e "violates RLS" (Database) podem estar relacionados a chaves de API incorretas ou ausentes no ambiente do Vercel.

**Ação:** Pedir ao usuário para verificar as variáveis de ambiente no Vercel.

1.  Acesse o **Dashboard do Vercel**.
2.  Selecione o seu projeto (`nutri-weld`).
3.  Vá em **Settings** (Configurações) -> **Environment Variables** (Variáveis de Ambiente).
4.  Confirme se as seguintes variáveis estão presentes e com os valores **corretos**:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

### PASSO 3: Simplificar Políticas de RLS (Última Tentativa)

Se o problema de RLS persistir após a verificação das variáveis de ambiente, vamos tentar uma política de RLS ainda mais simples para `INSERT` na tabela `content`.

**Ação:** Fornecer uma política de RLS de `INSERT` que permita a inserção por qualquer usuário autenticado (temporariamente).

```sql
-- Política de INSERT para a tabela content (temporariamente mais permissiva)
CREATE POLICY "Allow authenticated users to insert content" ON public.content
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### PASSO 4: Testar e Validar

Após aplicar as correções, faremos um novo deploy e testaremos o aplicativo no Vercel.

## 📝 Próximos Passos

1.  **Atualizar o `vercel.json`** com as novas regras de `headers`.
2.  **Instruir o usuário a verificar as variáveis de ambiente** no Vercel.
3.  **Instruir o usuário a aplicar a nova política de RLS** (se necessário).
4.  **Aguardar a confirmação** do usuário.
5.  **Testar o aplicativo** no Vercel.

