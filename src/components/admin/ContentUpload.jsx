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
    // SOLUÇÃO TEMPORÁRIA: Simular upload bem-sucedido
    // Retornar uma URL de exemplo baseada no tipo de arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // URLs de exemplo para demonstração dos visualizadores (sem CSP)
    const exampleUrls = {
      'pdf': 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKERvY3VtZW50byBkZSBFeGVtcGxvKQovQ3JlYXRvciAoUExBTiBERSBWSVRBTElEQUQpCi9Qcm9kdWNlciAoRXhlbXBsbyBQREYpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDA3MjgpCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjcyIDcyMCA3MiA3MjAgcmUKUwpxCi9GMSAxMiBUZgooRG9jdW1lbnRvIGRlIEV4ZW1wbG8pIFRqCkVUClEKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAxNzQgMDAwMDAgbiAKMDAwMDAwMDIyMSAwMDAwMCBuIAowMDAwMDAwMjc4IDAwMDAwIG4gCjAwMDAwMDAzNzUgMDAwMDAgbiAKMDAwMDAwMDQ2OSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDcKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjU2NQolJUVPRgo=',
      'image': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNENBRjUwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW0gZGUgRXhlbXBsbyBQTEFOIERFIFZJVEFMSURBRDwvdGV4dD4KICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+CiAgPGNpcmNsZSBjeD0iNjAwIiBjeT0iNDAwIiByPSI3MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=',
      'video': 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAuhtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1OSByMjk5MSAxNzcxYjU1IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuY0EA='
    }
    
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return exampleUrls[contentType] || `https://example.com/files/${fileName}`
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
          file_url: mediaUrl
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

