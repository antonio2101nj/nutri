import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, FileText, Video, FileImage, FileType } from 'lucide-react'

export const ContentUpload = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('')
  const [contentText, setContentText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Validar tipo de arquivo baseado no contentType selecionado
      if (contentType === 'video' && !selectedFile.type.startsWith('video/')) {
        setError('Por favor, selecione um arquivo de vídeo válido')
        setFile(null)
        return
      }
      if (contentType === 'pdf' && selectedFile.type !== 'application/pdf') {
        setError('Por favor, selecione um arquivo PDF válido')
        setFile(null)
        return
      }
      if (contentType === 'image' && !selectedFile.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido')
        setFile(null)
        return
      }
      
      setError('')
    }
  }

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${contentType}s/${fileName}`

    const { data, error } = await supabase.storage
      .from('content_media')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('content_media')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validações
      if (!title.trim()) {
        throw new Error('Título é obrigatório')
      }
      if (!contentType) {
        throw new Error('Tipo de conteúdo é obrigatório')
      }
      if (contentType === 'text' && !contentText.trim()) {
        throw new Error('Conteúdo do texto é obrigatório')
      }
      if (contentType !== 'text' && !file) {
        throw new Error('Arquivo é obrigatório para este tipo de conteúdo')
      }

      let mediaUrl = null
      
      // Upload do arquivo se necessário
      if (file && contentType !== 'text') {
        mediaUrl = await uploadFile(file)
      }

      // Inserir registro na tabela content
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          type: contentType,
          text_content: contentType === 'text' ? contentText.trim() : null,
          media_url: mediaUrl
        })

      if (insertError) {
        throw insertError
      }

      setSuccess('Conteúdo enviado com sucesso!')
      
      // Limpar formulário
      setTitle('')
      setDescription('')
      setContentType('')
      setContentText('')
      setFile(null)
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('file-upload')
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (err) {
      setError(err.message || 'Erro ao enviar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'text':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'image':
        return <FileImage className="h-5 w-5" />
      case 'pdf':
        return <FileType className="h-5 w-5" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'video':
        return 'video/*'
      case 'image':
        return 'image/*'
      case 'pdf':
        return '.pdf'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getContentTypeIcon()}
          <span>Enviar Novo Conteúdo</span>
        </CardTitle>
        <CardDescription>
          Adicione textos, vídeos, PDFs ou imagens que aparecerão no painel do usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content-type">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conteúdo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Texto</span>
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Vídeo</span>
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-4 w-4" />
                    <span>Imagem</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center space-x-2">
                    <FileType className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
              placeholder="Digite o título do conteúdo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Digite uma breve descrição do conteúdo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Conteúdo de Texto (apenas para tipo 'text') */}
          {contentType === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="content-text">Conteúdo do Texto</Label>
              <Textarea
                id="content-text"
                placeholder="Digite o conteúdo do texto aqui..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                required
                disabled={loading}
                rows={8}
                className="min-h-[200px]"
              />
            </div>
          )}

          {/* Upload de Arquivo (para tipos que não sejam 'text') */}
          {contentType && contentType !== 'text' && (
            <div className="space-y-2">
              <Label htmlFor="file-upload">
                Arquivo {contentType === 'video' ? 'de Vídeo' : 
                         contentType === 'image' ? 'de Imagem' : 
                         contentType === 'pdf' ? 'PDF' : ''}
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={handleFileChange}
                required
                disabled={loading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              {file && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Mensagens de Erro e Sucesso */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Envio */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Enviando...' : 'Enviar Conteúdo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

