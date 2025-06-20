# 🚀 DroneCore - Guia Rápido de Deploy (Nuvem)

Este guia explica como fazer o deploy completo do DroneCore, com o backend no **Railway** e o frontend no **Vercel**.

## ✨ Stack de Produção

-   **Backend**: Node.js + Express + Prisma (deploy no Railway)
-   **Frontend**: React + Vite (deploy no Vercel)
-   **Banco de Dados**: MySQL (serviço do Railway)

---

##  Passo 1: Deploy do Backend (Railway)

1.  **Crie um Projeto no Railway**
    -   Acesse [railway.app](https://railway.app) e faça login com sua conta do GitHub.
    -   Clique em **"New Project"** -> **"Deploy from GitHub repo"**.
    -   Selecione o seu repositório do DroneCore. O Railway irá detectar o `Dockerfile` na raiz e configurar o serviço automaticamente.

2.  **Adicione um Banco de Dados MySQL**
    -   Dentro do projeto no Railway, clique em **"+ New"** -> **"Database"** -> **"MySQL"**.
    -   Isso criará um serviço de banco de dados que se conecta automaticamente ao seu backend.

3.  **Configure as Variáveis de Ambiente**
    -   Vá para o serviço do seu backend (não o do banco de dados) e clique em **"Variables"**.
    -   Adicione as seguintes variáveis:
        -   `DATABASE_URL`: Clique em "Add a Variable Reference" e selecione `MySQL.DATABASE_URL`. O Railway preencherá o valor automaticamente.
        -   `JWT_SECRET`: Gere uma chave secreta forte (ex: use um gerador de senhas online) e cole aqui.
        -   `NODE_ENV`: Defina como `production`.

4.  **Verifique o Deploy**
    -   O Railway irá fazer o deploy automaticamente.
    -   Acesse a URL pública gerada (ex: `https://seu-backend.up.railway.app`) para confirmar que está no ar.

---

## Passo 2: Deploy do Frontend (Vercel)

1.  **Crie um Projeto no Vercel**
    -   Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
    -   Clique em **"Add New..."** -> **"Project"**.
    -   Selecione o seu repositório do DroneCore.

2.  **Configure o Projeto**
    -   **Framework Preset**: A Vercel deve detectar `Vite` automaticamente.
    -   **Root Directory**: **Importante!** Altere para `dronecore-dashboard-ui`.
    -   Deixe as outras configurações como padrão.

3.  **Adicione a Variável de Ambiente**
    -   Expanda a seção **"Environment Variables"**.
    -   Adicione a seguinte variável:
        -   `VITE_API_URL`: Cole a URL pública do seu backend no Railway (ex: `https://seu-backend.up.railway.app`). **Não** adicione `/api` no final.

4.  **Faça o Deploy**
    -   Clique em **"Deploy"**. A Vercel irá construir e publicar seu site.

---

## 🎉 Pronto!

Seu sistema está totalmente no ar.

-   **URL do Frontend**: Fornecida pelo Vercel.
-   **Credenciais de Admin Padrão**:
    -   **Email**: `admin@dronecore.com`
    -   **Senha**: `admin123`

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