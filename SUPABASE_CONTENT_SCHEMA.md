## Esquema do Banco de Dados para Conteúdo

Para armazenar os diferentes tipos de conteúdo (textos, vídeos, PDFs, imagens), propomos a seguinte estrutura de tabela no Supabase:

### Tabela: `content`

Esta tabela armazenará todos os tipos de conteúdo que serão exibidos no painel do usuário. A flexibilidade é alcançada através da coluna `type` e do armazenamento de URLs para mídias.

| Coluna        | Tipo de Dados      | Descrição                                                              | Restrições/Notas                                        |
|---------------|--------------------|------------------------------------------------------------------------|---------------------------------------------------------|
| `id`          | `UUID`             | Identificador único para cada item de conteúdo.                        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`              |
| `created_at`  | `TIMESTAMPZ`       | Carimbo de data/hora da criação do registro.                           | `DEFAULT now()`                                         |
| `updated_at`  | `TIMESTAMPZ`       | Carimbo de data/hora da última atualização do registro.                | `DEFAULT now()`                                         |
| `title`       | `TEXT`             | Título do conteúdo.                                                    | `NOT NULL`                                              |
| `description` | `TEXT`             | Breve descrição ou resumo do conteúdo.                                 | `NULLABLE`                                              |
| `type`        | `TEXT`             | Tipo de conteúdo (e.g., 'text', 'video', 'pdf', 'image').              | `NOT NULL`, `CHECK (type IN ('text', 'video', 'pdf', 'image'))` |
| `content_text`| `TEXT`             | Conteúdo textual (para tipo 'text').                                   | `NULLABLE`                                              |
| `media_url`   | `TEXT`             | URL do arquivo de mídia (para 'video', 'pdf', 'image').                | `NULLABLE`                                              |
| `thumbnail_url`| `TEXT`            | URL da thumbnail para vídeos ou PDFs (opcional).                       | `NULLABLE`                                              |

### Políticas de Row Level Security (RLS) para `content`

Para garantir que apenas usuários autenticados possam visualizar o conteúdo e que administradores possam gerenciar (criar, ler, atualizar, deletar) todo o conteúdo:

```sql
-- Habilitar RLS na tabela content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Política para que todos os usuários autenticados possam ler o conteúdo
CREATE POLICY "Authenticated users can view content" ON public.content
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que admins possam gerenciar (CRUD) o conteúdo
CREATE POLICY "Admins can manage content" ON public.content
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

### Considerações para Upload de Arquivos

O Supabase Storage será utilizado para armazenar os arquivos de vídeo, PDF e imagem. Será necessário configurar `buckets` e políticas de segurança para o Storage.

- **Bucket `content_media`**: Para armazenar vídeos, PDFs e imagens.

```sql
-- Políticas de Storage para o bucket 'content_media'

-- Permitir que usuários autenticados leiam arquivos
CREATE POLICY "Authenticated users can read content media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'content_media');

-- Permitir que admins façam upload, atualização e exclusão de arquivos
CREATE POLICY "Admins can manage content media" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'content_media' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

### Próximos Passos:

1.  **Criar a tabela `content` no Supabase** usando o SQL acima.
2.  **Configurar as políticas de RLS** para a tabela `content`.
3.  **Criar o bucket `content_media` no Supabase Storage**.
4.  **Configurar as políticas de RLS para o bucket `content_media`**.
5.  **Implementar a interface de upload** no painel de admin (`AdminPanel.jsx`).
6.  **Implementar a exibição do conteúdo** no painel de usuário (`UserPanel.jsx`).


