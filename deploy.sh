#!/bin/bash

# 🚁 DroneCore - Script de Deploy Automatizado
# Este script automatiza o processo de deploy do DroneCore

set -e

echo "🚁 Iniciando deploy do DroneCore..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Instale o Node.js primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js encontrado: $NODE_VERSION"
}

# Verificar se o npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado. Instale o npm primeiro."
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm encontrado: $NPM_VERSION"
}

# Instalar dependências do backend
install_backend_deps() {
    print_status "Instalando dependências do backend..."
    cd server
    
    if [ ! -f "package.json" ]; then
        print_error "package.json não encontrado na pasta server/"
        exit 1
    fi
    
    npm install
    print_success "Dependências do backend instaladas"
    cd ..
}

# Instalar dependências do frontend
install_frontend_deps() {
    print_status "Instalando dependências do frontend..."
    cd dronecore-dashboard-ui
    
    if [ ! -f "package.json" ]; then
        print_error "package.json não encontrado na pasta dronecore-dashboard-ui/"
        exit 1
    fi
    
    npm install
    print_success "Dependências do frontend instaladas"
    cd ..
}

# Configurar banco de dados
setup_database() {
    print_status "Configurando banco de dados..."
    cd server
    
    # Verificar se o arquivo .env existe
    if [ ! -f ".env" ]; then
        print_warning "Arquivo .env não encontrado. Criando template..."
        cat > .env << EOF
# Configurações do Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/dronecore"

# Configurações JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui"

# Configurações do Servidor
PORT=3001

# Configurações de Produção (para deploy)
NODE_ENV=development
EOF
        print_warning "Arquivo .env criado. Configure as variáveis antes de continuar."
        print_warning "Especialmente a DATABASE_URL com suas credenciais da Hostgator."
        cd ..
        return 1
    fi
    
    # Gerar cliente Prisma
    print_status "Gerando cliente Prisma..."
    npx prisma generate
    
    # Executar migrações
    print_status "Executando migrações..."
    npx prisma migrate deploy
    
    # Inicializar dados de exemplo
    print_status "Inicializando dados de exemplo..."
    npm run prisma:init
    
    print_success "Banco de dados configurado"
    cd ..
}

# Build do frontend
build_frontend() {
    print_status "Fazendo build do frontend..."
    cd dronecore-dashboard-ui
    
    # Verificar se o arquivo .env existe
    if [ ! -f ".env" ]; then
        print_warning "Arquivo .env não encontrado no frontend. Criando template..."
        cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF
        print_warning "Configure a VITE_API_URL com a URL do seu backend em produção."
    fi
    
    npm run build
    print_success "Frontend buildado com sucesso"
    cd ..
}

# Verificar se o Git está configurado
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado. Instale o Git primeiro."
        exit 1
    fi
    
    if [ ! -d ".git" ]; then
        print_warning "Repositório Git não inicializado. Inicializando..."
        git init
        git add .
        git commit -m "Initial commit - DroneCore setup"
    fi
    
    print_success "Git configurado"
}

# Mostrar instruções de deploy
show_deploy_instructions() {
    echo ""
    echo "🎉 Setup local concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos para deploy:"
    echo ""
    echo "1. 🗄️  Configure o banco de dados na Hostgator:"
    echo "   - Acesse o painel da Hostgator"
    echo "   - Crie um banco MySQL chamado 'dronecore'"
    echo "   - Crie um usuário e associe ao banco"
    echo "   - Atualize a DATABASE_URL no arquivo server/.env"
    echo ""
    echo "2. 🚀 Deploy do Backend (Railway):"
    echo "   - Acesse https://railway.app"
    echo "   - Conecte seu repositório GitHub"
    echo "   - Configure as variáveis de ambiente:"
    echo "     * DATABASE_URL (sua string da Hostgator)"
    echo "     * JWT_SECRET (chave secreta)"
    echo "     * NODE_ENV=production"
    echo ""
    echo "3. 🌐 Deploy do Frontend (Vercel):"
    echo "   - Acesse https://vercel.com"
    echo "   - Conecte seu repositório GitHub"
    echo "   - Configure:"
    echo "     * Root Directory: dronecore-dashboard-ui"
    echo "     * Build Command: npm run build"
    echo "     * Output Directory: dist"
    echo "   - Adicione a variável VITE_API_URL com a URL do seu backend"
    echo ""
    echo "4. 🧪 Teste a aplicação:"
    echo "   - Acesse a URL do frontend"
    echo "   - Login: admin@dronecore.com"
    echo "   - Senha: admin123"
    echo ""
    echo "📖 Para instruções detalhadas, consulte o arquivo DEPLOY_GUIDE.md"
    echo ""
}

# Função principal
main() {
    echo "🚁 DroneCore - Script de Deploy Automatizado"
    echo "=============================================="
    echo ""
    
    # Verificações iniciais
    check_node
    check_npm
    check_git
    
    # Instalar dependências
    install_backend_deps
    install_frontend_deps
    
    # Setup do banco de dados
    if setup_database; then
        print_success "Setup do banco concluído"
    else
        print_warning "Setup do banco não concluído. Configure o .env primeiro."
    fi
    
    # Build do frontend
    build_frontend
    
    # Mostrar instruções
    show_deploy_instructions
}

# Executar função principal
main "$@" 