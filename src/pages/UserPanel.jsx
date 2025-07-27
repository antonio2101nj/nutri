import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, FileText, Video, Download, FileImage } from 'lucide-react'
import { ContentDisplay } from '../components/user/ContentDisplay'

export const UserPanel = () => {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Painel do Usuário
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {profile?.full_name || user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao seu Painel
          </h2>
          <p className="text-gray-600">
            Acesse conteúdos, vídeos e documentos compartilhados pelos administradores
          </p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Textos</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <FileImage className="h-4 w-4" />
              <span>Imagens</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>PDFs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Textos Disponíveis</CardTitle>
                <CardDescription>
                  Textos e artigos compartilhados pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay contentType="text" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vídeos Disponíveis</CardTitle>
                <CardDescription>
                  Vídeos compartilhados pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay contentType="video" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imagens Disponíveis</CardTitle>
                <CardDescription>
                  Imagens compartilhadas pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay contentType="image" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos PDF Disponíveis</CardTitle>
                <CardDescription>
                  PDFs e outros documentos compartilhados pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentDisplay contentType="pdf" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

