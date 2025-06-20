# 📖 Guia de Variáveis de Ambiente - DroneCore

Este documento descreve as variáveis de ambiente essenciais para rodar o projeto em produção, utilizando a stack Railway + Vercel.

---

## ⚙️ Backend (Serviço no Railway)

Acesse o painel do seu projeto no Railway, clique no serviço do backend (ex: `Sistema-TP`) e configure as seguintes variáveis na aba **"Variables"**:

| Variável         | Valor                                                                  | Descrição                                                                                               |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | `${{MySQL.DATABASE_URL}}`                                              | **Referência Automática**. Conecta o backend ao serviço de banco de dados MySQL criado no mesmo projeto. |
| `JWT_SECRET`     | `sua_chave_secreta_aqui`                                               | Uma chave secreta forte e aleatória para assinar os tokens de autenticação (JWT). Use um gerador online. |
| `NODE_ENV`       | `production`                                                           | Define o ambiente de execução para `production`, otimizando a performance e segurança.                |

---

## 🎨 Frontend (Projeto no Vercel)

Acesse o painel do seu projeto no Vercel e vá em **"Settings" -> "Environment Variables"**. Adicione a seguinte variável:

| Variável       | Valor                                     | Descrição                                                                      |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `VITE_API_URL` | `https://seu-backend.up.railway.app`      | A URL pública do seu backend no Railway. **Importante**: Não inclua `/api` no final. |

---

## 🔐 Credenciais de Acesso Padrão

Após o deploy e a execução automática das migrações do Prisma, as credenciais padrão para o primeiro acesso são:

-   **Email**: `admin@dronecore.com`
-   **Senha**: `admin123`
