# 🔍 Diagnóstico dos Problemas no Vercel - PLAN DE VITALIDAD

## ❌ Problemas Identificados

### 1. Erro 401 no manifest.json
- **Erro:** `Failed to load resource: the server responded with a status of 401 ()`
- **Arquivo:** `manifest.json`
- **Causa:** Problema de CORS com o arquivo manifest em PWAs

### 2. Erro 400 no PDF do Supabase
- **Erro:** `Failed to load resource: the server responded with a status of 400 ()`
- **Arquivo:** PDF do Supabase Storage
- **Causa:** Problema de acesso ao bucket `content-media` do Supabase

### 3. Carregamento Infinito
- **Sintoma:** Aplicativo fica na tela "Carregando aplicação..."
- **Causa:** Combinação dos erros acima impedindo o carregamento completo

## 🔍 Análise Detalhada

### Problema 1: Manifest.json 401 Error

**Pesquisa realizada:** Artigo do Medium sobre erro 401 em webmanifest
**Fonte:** https://medium.com/@aurelien.delogu/401-error-on-a-webmanifest-file-cb9e3678b9f3

**Descoberta importante:**
- Manifests são governados por CORS (como `<img>`, `<video>` ou `<script>`)
- Precisam do atributo `crossorigin`, mesmo se o arquivo vem da mesma origem
- **Solução:** Adicionar `crossorigin="use-credentials"` na tag do manifest

### Problema 2: Supabase Storage 400 Error

**Possíveis causas:**
1. Bucket `content-media` não está configurado como público
2. Políticas de RLS do Storage estão bloqueando o acesso
3. URL do arquivo está malformada
4. Problema de autenticação com o Supabase

### Problema 3: Row Level Security (RLS)

**Erro persistente:** "new row violates row-level security policy"
**Causa:** Políticas de RLS não estão permitindo inserção de dados por admins

## 🛠️ Plano de Correção

### Correção 1: Manifest.json CORS
```html
<!-- No index.html, alterar de: -->
<link rel="manifest" href="/manifest.json" />

<!-- Para: -->
<link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
```

### Correção 2: Verificar Bucket Supabase
1. Confirmar que o bucket `content-media` existe
2. Verificar se está marcado como "Public"
3. Testar URL pública do bucket

### Correção 3: Simplificar RLS (Temporariamente)
```sql
-- Desabilitar RLS temporariamente para testar
ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;

-- Ou criar política mais permissiva
CREATE POLICY "temp_allow_all" ON public.content
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

### Correção 4: Verificar Variáveis de Ambiente
- Confirmar se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas no Vercel
- Verificar se as chaves não expiraram

## 🎯 Ordem de Implementação

1. **Primeiro:** Corrigir manifest.json (mais simples)
2. **Segundo:** Verificar configuração do Supabase Storage
3. **Terceiro:** Simplificar RLS temporariamente
4. **Quarto:** Testar upload básico
5. **Quinto:** Reconfigurar RLS corretamente

## 📝 Próximos Passos

1. Implementar correção do manifest.json
2. Verificar configuração do bucket no Supabase
3. Fazer deploy e testar
4. Se necessário, simplificar RLS temporariamente
5. Testar funcionalidades de upload

## 🔗 Referências

- [Medium: How to solve a 401 error on a webmanifest file](https://medium.com/@aurelien.delogu/401-error-on-a-webmanifest-file-cb9e3678b9f3)
- [GitHub: Vercel Next.js Discussion #62867](https://github.com/vercel/next.js/discussions/62867)
- [Supabase Docs: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

