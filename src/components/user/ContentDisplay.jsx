import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Video, 
  FileImage, 
  FileType, 
  Calendar,
  Loader2
} from 'lucide-react'
import { PDFViewer, VideoViewer, ImageViewer, TextViewer } from './IntegratedViewer'

export const ContentDisplay = ({ contentType }) => {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContent()
  }, [contentType])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError('')
      
      let query = supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      // Filtrar por tipo se especificado
      if (contentType && contentType !== 'all') {
        query = query.eq('type', contentType)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setContent(data || [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  const getContentIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'image':
        return <FileImage className="h-5 w-5" />
      case 'pdf':
        return <FileType className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getContentTypeBadge = (type) => {
    const variants = {
      text: 'default',
      video: 'destructive',
      image: 'secondary',
      pdf: 'outline'
    }

    const labels = {
      text: 'Texto',
      video: 'Vídeo',
      image: 'Imagem',
      pdf: 'PDF'
    }

    return (
      <Badge variant={variants[type] || 'default'}>
        {labels[type] || type}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderContentItem = (item) => {
    return (
      <div key={item.id} className="space-y-6">
        {/* Header com informações do item */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getContentIcon(item.type)}
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {getContentTypeBadge(item.type)}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(item.created_at)}
              </div>
            </div>
            {item.description && (
              <CardDescription>{item.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Visualizador integrado baseado no tipo */}
        {item.type === 'text' && item.text_content && (
          <TextViewer 
            content={item.text_content}
            title={item.title}
            description={item.description}
          />
        )}

        {item.type === 'image' && item.file_url && (
          <ImageViewer 
            url={item.file_url}
            title={item.title}
          />
        )}

        {item.type === 'video' && item.file_url && (
          <VideoViewer 
            url={item.file_url}
            title={item.title}
          />
        )}

        {item.type === 'pdf' && item.file_url && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                <FileType className="h-8 w-8" />
                <span className="text-lg font-medium">Documento PDF</span>
              </div>
              <PDFViewer 
                url={item.file_url}
                title={item.title}
              />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando conteúdo...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (content.length === 0) {
    const emptyMessages = {
      text: 'Nenhum texto disponível no momento',
      video: 'Nenhum vídeo disponível no momento',
      image: 'Nenhuma imagem disponível no momento',
      pdf: 'Nenhum documento PDF disponível no momento',
      all: 'Nenhum conteúdo disponível no momento'
    }

    const emptyIcons = {
      text: FileText,
      video: Video,
      image: FileImage,
      pdf: FileType,
      all: FileText
    }

    const IconComponent = emptyIcons[contentType] || FileText

    return (
      <div className="text-center py-8 text-gray-500">
        <IconComponent className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>{emptyMessages[contentType] || emptyMessages.all}</p>
        <p className="text-sm mt-2">O conteúdo compartilhado aparecerá aqui automaticamente</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {content.map(renderContentItem)}
    </div>
  )
}

