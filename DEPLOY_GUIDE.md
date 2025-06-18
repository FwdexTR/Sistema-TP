# DroneCore - Guia Completo de Deploy

Este guia te ensinará como colocar o DroneCore no ar usando plataformas gratuitas e como configurar o banco de dados na Hostgator.

## Pré-requisitos

- Conta no GitHub
- Conta na Vercel (gratuita)
- Conta na Railway ou Render (gratuita)
- Conta na Hostgator (para banco de dados)
- Node.js instalado localmente

## Configuração do Banco de Dados na Hostgator

### 1. Acesse o Painel da Hostgator

1. Faça login no painel da Hostgator
2. Vá para "Bancos de Dados" > "MySQL Databases"

### 2. Criar o Banco de Dados

1. Clique em "Create Database"
2. Digite o nome: `dronecore`
3. Anote o nome completo do banco (ex: `seu_usuario_dronecore`)

### 3. Criar Usuário do Banco

1. Vá para "MySQL Users"
2. Clique em "Create User"
3. Crie um usuário com senha forte
4. Anote as credenciais

### 4. Associar Usuário ao Banco

1. Vá para "Add User To Database"
2. Selecione o usuário e o banco criados
3. Dê todas as permissões (ALL PRIVILEGES)

### 5. Obter String de Conexão

A string de conexão será:
```
mysql://usuario:senha@localhost:3306/seu_usuario_dronecore
```

## 🚀 Deploy do Backend (Railway - Gratuito)

### 1. Preparar o Código

1. Crie um arquivo `.env` na pasta `server/`:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/seu_usuario_dronecore"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
PORT=3001
NODE_ENV=production
```

2. Atualize o `package.json` do servidor:
```json
{
  "scripts": {
    "start": "node index.js",
    "build": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

### 2. Deploy no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project" > "Deploy from GitHub repo"
4. Selecione seu repositório
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão da Hostgator
   - `JWT_SECRET`: Sua chave secreta
   - `NODE_ENV`: production

### 3. Configurar Banco de Dados

1. No Railway, vá em "Variables"
2. Adicione a variável `DATABASE_URL` com a string da Hostgator
3. Deploy será feito automaticamente

### 4. Executar Migrações

1. No Railway, vá em "Deployments"
2. Clique no deployment mais recente
3. Vá em "Logs" e execute:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 🌐 Deploy do Frontend (Vercel - Gratuito)

### 1. Preparar o Frontend

1. Crie um arquivo `.env` na pasta `dronecore-dashboard-ui/`:
```env
VITE_API_URL=https://seu-backend.railway.app/api
```

2. Atualize o `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `dronecore-dashboard-ui`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3. Configurar Variáveis de Ambiente

1. No Vercel, vá em "Settings" > "Environment Variables"
2. Adicione:
   - `VITE_API_URL`: URL do seu backend no Railway

## 🔧 Configuração Alternativa - Render

Se preferir usar Render ao invés do Railway:

### Backend no Render

1. Acesse [render.com](https://render.com)
2. Crie uma "Web Service"
3. Conecte com GitHub
4. Configure:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Environment: Node

### Variáveis no Render

Adicione as mesmas variáveis de ambiente:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`

## 🗄️ Alternativas Gratuitas para Banco de Dados

### 1. PlanetScale (Recomendado)

1. Acesse [planetscale.com](https://planetscale.com)
2. Crie conta gratuita
3. Crie um novo banco
4. Use a string de conexão fornecida

### 2. Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie projeto gratuito
3. Use PostgreSQL (gratuito até 500MB)

### 3. Neon

1. Acesse [neon.tech](https://neon.tech)
2. Crie projeto gratuito
3. Use PostgreSQL

## 🚀 Deploy Completo - Passo a Passo

### 1. Preparar Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dronecore.git
cd dronecore

# Instalar dependências
cd server && npm install
cd ../dronecore-dashboard-ui && npm install
```

### 2. Configurar Banco de Dados

```bash
# No servidor
cd server
# Crie o arquivo .env com as configurações do banco
npm run prisma:generate
npm run prisma:migrate
npm run prisma:init
```

### 3. Deploy Backend

1. Faça push para GitHub
2. Deploy no Railway/Render
3. Configure variáveis de ambiente
4. Execute migrações

### 4. Deploy Frontend

1. Configure a URL do backend no `.env`
2. Deploy no Vercel
3. Configure variáveis de ambiente

### 5. Testar Aplicação

1. Acesse a URL do frontend
2. Faça login com:
   - Email: `admin@dronecore.com`
   - Senha: `admin123`

## 🔒 Configurações de Segurança

### 1. JWT Secret

Use uma chave forte:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. CORS

Configure CORS no backend para aceitar apenas seu domínio:
```javascript
app.use(cors({
  origin: ['https://seu-frontend.vercel.app'],
  credentials: true
}));
```

### 3. Rate Limiting

Adicione rate limiting:
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});

app.use('/api/', limiter);
```

## 📊 Monitoramento

### 1. Logs

- Railway: Acesse "Deployments" > "Logs"
- Vercel: Acesse "Functions" > "Logs"

### 2. Métricas

- Railway: Dashboard com métricas de uso
- Vercel: Analytics gratuitos

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique a string de conexão
   - Confirme se o banco está ativo na Hostgator

2. **Erro de CORS**
   - Configure corretamente o CORS no backend
   - Verifique se as URLs estão corretas

3. **Erro de build**
   - Verifique se todas as dependências estão instaladas
   - Confirme se o Node.js está na versão correta

### Comandos Úteis

```bash
# Verificar logs do Railway
railway logs

# Verificar logs do Vercel
vercel logs

# Testar conexão com banco
npx prisma db pull

# Resetar banco (cuidado!)
npx prisma migrate reset
```

## 💰 Custos

### Gratuito (Limites)

- **Railway**: $5/mês após uso gratuito
- **Vercel**: Sempre gratuito para projetos pessoais
- **Hostgator**: Plano básico ~$3/mês
- **PlanetScale**: Gratuito até 1GB

### Recomendação

Para começar, use:
1. **Backend**: Railway (gratuito)
2. **Frontend**: Vercel (gratuito)
3. **Banco**: PlanetScale (gratuito)

Total: **$0/mês** para começar!

## 🎯 Próximos Passos

1. Configure domínio personalizado
2. Implemente backup automático
3. Adicione monitoramento
4. Configure CI/CD
5. Implemente testes automatizados

---

**🎉 Parabéns! Seu DroneCore está no ar!**

Para suporte, consulte a documentação ou abra uma issue no GitHub. 