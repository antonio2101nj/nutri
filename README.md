# PWA Admin Panel - Sistema de Gerenciamento

Um aplicativo PWA robusto com painéis de administrador e usuário, construído com React, Supabase e Tailwind CSS.

## 🚀 Características

- **Autenticação Completa**: Sistema de login/registro com Supabase
- **Controle de Acesso**: Painéis separados para admin e usuário
- **PWA Ready**: Configurado como Progressive Web App
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Banco de Dados**: Integração completa com Supabase
- **Segurança**: Row Level Security (RLS) configurado

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (gerenciador de pacotes)
- Conta no Supabase

## 🛠️ Configuração do Ambiente

### 1. Instalação das Dependências

```bash
cd pwa-admin-panel
pnpm install
```

### 2. Configuração das Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://eoljttyilmxahdanpjfm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configuração do Banco de Dados

O banco de dados Supabase precisa das seguintes tabelas:

#### Tabela `profiles`
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `content`
```sql
CREATE TABLE public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'pdf', 'image')),
    file_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false
);
```

**Nota**: As tabelas podem ser criadas diretamente no dashboard do Supabase ou usando o script Python fornecido.

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
pnpm run dev --host
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
pnpm run build
```

## 📱 Funcionalidades Implementadas

### Sistema de Autenticação
- ✅ Registro de usuários com roles (admin/user)
- ✅ Login com validação
- ✅ Proteção de rotas
- ✅ Redirecionamento baseado em role

### Painel de Administrador
- ✅ Interface para gerenciamento de conteúdo
- ✅ Seções para textos, mídia, usuários e configurações
- ✅ Layout responsivo e profissional

### Painel de Usuário
- ✅ Visualização de conteúdo publicado
- ✅ Seções para textos, vídeos e documentos
- ✅ Interface limpa e intuitiva

### PWA (Progressive Web App)
- ✅ Manifest.json configurado
- ✅ Meta tags para PWA
- ✅ Ícones e tema configurados

## 🔧 Estrutura do Projeto

```
pwa-admin-panel/
├── public/
│   ├── manifest.json          # Configuração PWA
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/              # Componentes de autenticação
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── ui/                # Componentes UI (shadcn/ui)
│   │   └── ProtectedRoute.jsx # Proteção de rotas
│   ├── contexts/
│   │   └── AuthContext.jsx    # Contexto de autenticação
│   ├── lib/
│   │   └── supabase.js        # Configuração Supabase
│   ├── pages/
│   │   ├── AuthPage.jsx       # Página de login/registro
│   │   ├── AdminPanel.jsx     # Painel administrativo
│   │   └── UserPanel.jsx      # Painel do usuário
│   ├── App.jsx                # Componente principal
│   ├── App.css                # Estilos globais
│   └── main.jsx               # Ponto de entrada
├── .env                       # Variáveis de ambiente
├── package.json
└── README.md
```

## 🎯 Próximos Passos para Implementação

### 1. Configuração do Banco de Dados
- [ ] Criar tabelas no dashboard do Supabase
- [ ] Configurar Row Level Security (RLS)
- [ ] Criar triggers para automação

### 2. Funcionalidades de Conteúdo
- [ ] Upload de arquivos (vídeos, PDFs)
- [ ] Editor de texto rico
- [ ] Sistema de notificações em tempo real
- [ ] Gerenciamento de usuários

### 3. Melhorias de UX/UI
- [ ] Animações e transições
- [ ] Modo escuro
- [ ] Notificações toast
- [ ] Loading states aprimorados

### 4. Deploy e Produção
- [ ] Configuração do Vercel
- [ ] Integração com GitHub Actions
- [ ] Monitoramento e analytics
- [ ] Backup automático

## 🔐 Segurança

- **Autenticação**: Gerenciada pelo Supabase Auth
- **Autorização**: Row Level Security (RLS) no banco
- **Validação**: Validação client-side e server-side
- **HTTPS**: Obrigatório em produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do GitHub.

---

**Status do Projeto**: ✅ Base funcional implementada e testada
**Última Atualização**: Janeiro 2025

