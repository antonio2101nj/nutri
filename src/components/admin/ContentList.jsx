import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Video, 
  FileImage, 
  FileType, 
  Trash2, 
  Eye, 
  Calendar,
  Loader2
} from 'lucide-react'

export const ContentList = () => {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

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

  const handleDelete = async (id, mediaUrl) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) {
      return
    }

    try {
      setDeleteLoading(id)

      // Se há um arquivo de mídia, deletar do storage primeiro
      if (mediaUrl) {
        const urlParts = mediaUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const contentType = urlParts[urlParts.length - 2]
        const filePath = `${contentType}/${fileName}`

        const { error: storageError } = await supabase.storage
         .from(\'content-media\')          .remove([filePath])

        if (storageError) {
          console.warn('Erro ao deletar arquivo do storage:', storageError)
        }
      }

      // Deletar registro da tabela
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Atualizar lista local
      setContent(content.filter(item => item.id !== id))
      
    } catch (err) {
      setError(err.message || 'Erro ao excluir conteúdo')
    } finally {
      setDeleteLoading(null)
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

  const handlePreview = (item) => {
    if (item.type === 'text') {
      alert(`Título: ${item.title}\n\nConteúdo:\n${item.content_text}`)
    } else if (item.media_url) {
      window.open(item.media_url, '_blank')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando conteúdo...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo Publicado</CardTitle>
        <CardDescription>
          Gerencie todo o conteúdo que aparece no painel do usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {content.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum conteúdo publicado ainda</p>
            <p className="text-sm mt-2">Use o formulário acima para adicionar conteúdo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getContentIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      {getContentTypeBadge(item.type)}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      
                      {item.type === 'text' && item.content_text && (
                        <span>{item.content_text.length} caracteres</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(item)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver</span>
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.media_url)}
                    disabled={deleteLoading === item.id}
                    className="flex items-center space-x-1"
                  >
                    {deleteLoading === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>Excluir</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

