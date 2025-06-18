# 🚀 DroneCore - Início Rápido

Este guia te ajudará a colocar o DroneCore no ar em menos de 30 minutos!

## ⚡ Deploy Super Rápido (3 Passos)

### 1. 🗄️ Configure o Banco de Dados

**Opção A: PlanetScale (Recomendado - Gratuito)**
1. Acesse [planetscale.com](https://planetscale.com)
2. Crie conta gratuita
3. Crie um novo banco
4. Copie a string de conexão

**Opção B: Hostgator**
1. Acesse o painel da Hostgator
2. Vá em "Bancos de Dados" > "MySQL Databases"
3. Crie banco `dronecore`
4. Crie usuário e associe ao banco
5. String: `mysql://usuario:senha@localhost:3306/seu_usuario_dronecore`

### 2. 🚀 Deploy Backend (Railway)

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique "New Project" > "Deploy from GitHub repo"
4. Selecione seu repositório
5. Configure variáveis:
   - `DATABASE_URL`: Sua string de conexão
   - `JWT_SECRET`: `sua-chave-seuper-segura-123`
   - `NODE_ENV`: `production`

### 3. 🌐 Deploy Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique "New Project"
4. Selecione seu repositório
5. Configure:
   - Framework: Vite
   - Root Directory: `dronecore-dashboard-ui`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Adicione variável:
   - `VITE_API_URL`: URL do seu backend (ex: `https://seu-backend.railway.app/api`)

## 🎉 Pronto!

Acesse a URL do Vercel e faça login com:
- **Email**: `admin@dronecore.com`
- **Senha**: `admin123`

## 🔧 Desenvolvimento Local

### Com Docker (Mais Fácil)
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dronecore.git
cd dronecore

# Execute com Docker
docker-compose up -d

# Acesse: http://localhost:5173
```

### Sem Docker
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dronecore.git
cd dronecore

# Execute o script de deploy
chmod +x deploy.sh
./deploy.sh

# Configure o .env no servidor com suas credenciais
# Execute as migrações
cd server
npm run prisma:migrate
npm run prisma:init

# Inicie os serviços
cd ../server && npm run dev
cd ../dronecore-dashboard-ui && npm run dev
```

## 📋 Checklist de Deploy

- [ ] Banco de dados configurado
- [ ] Backend deployado no Railway
- [ ] Frontend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Login funcionando
- [ ] Dados de exemplo carregados

## 🆘 Problemas Comuns

### Erro de CORS
- Verifique se a `VITE_API_URL` está correta
- Confirme se o backend está rodando

### Erro de Banco
- Verifique a string de conexão
- Confirme se o banco está ativo

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme a versão do Node.js (18+)

## 💰 Custos

**Total: $0/mês** para começar!
- Railway: Gratuito (até $5/mês)
- Vercel: Sempre gratuito
- PlanetScale: Gratuito até 1GB

## 📞 Suporte

- 📖 [Guia Completo](DEPLOY_GUIDE.md)
- 🐛 [Issues no GitHub](https://github.com/seu-usuario/dronecore/issues)
- 💬 [Discord/Slack] (se disponível)

---

**🎯 Dica**: Use o script `deploy.sh` para automatizar todo o processo local! 