# 📋 Tipos MIME Suportados para Configuração no Supabase

Com base nos formatos de arquivo que o **PLAN DE VITALIDAD** suporta, aqui está a lista de tipos MIME que você deve inserir no campo "Allowed MIME types" no Supabase, separados por vírgula:

```
image/jpeg, image/png, image/gif, image/webp, video/mp4, video/webm, video/ogg, application/pdf
```

## Detalhamento por Tipo de Mídia:

### 🖼️ Imagens
- `image/jpeg` (para arquivos .jpg e .jpeg)
- `image/png` (para arquivos .png)
- `image/gif` (para arquivos .gif)
- `image/webp` (para arquivos .webp)

### 🎬 Vídeos
- `video/mp4` (para arquivos .mp4)
- `video/webm` (para arquivos .webm)
- `video/ogg` (para arquivos .ogg)

### 📄 Documentos (PDF)
- `application/pdf` (para arquivos .pdf)

## Como Inserir no Supabase:

1.  Vá para o seu projeto no Supabase.
2.  No menu lateral, clique em **Storage**.
3.  Clique no bucket **content-media**.
4.  Vá na aba **Settings** (Configurações).
5.  No campo **"Allowed MIME types"**, cole a string abaixo:

    ```
    image/jpeg, image/png, image/gif, image/webp, video/mp4, video/webm, video/ogg, application/pdf
    ```

6.  Clique em **Save** para aplicar as alterações.

---

**Observação:** Se você preferir permitir *qualquer* tipo de imagem, vídeo ou áudio, você pode usar curingas (wildcards) como `image/*`, `video/*`, `audio/*`. No entanto, para maior controle e segurança, é recomendado listar os tipos específicos. Para o seu caso, a lista acima é a mais adequada.

