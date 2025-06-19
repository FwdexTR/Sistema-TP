# Configuração do Frontend no Vercel

## Passo a Passo para Deploy no Vercel

### 1. Preparação do Projeto

O projeto já está configurado para o Vercel com:
- ✅ `vercel.json` configurado
- ✅ API URL apontando para `https://sistema.tpdrones.com.br/api`
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`

### 2. Deploy no Vercel

#### Opção A: Via GitHub (Recomendado)

1. **Acesse o Vercel**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Importe o repositório**: `FwdexTR/Sistema-TP`
5. **Configure o projeto**:
   - **Framework Preset**: Vite
   - **Root Directory**: `dronecore-dashboard-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar para o diretório do frontend
cd dronecore-dashboard-ui

# Deploy
vercel
```

### 3. Configuração de Variáveis de Ambiente

No Vercel, configure as seguintes variáveis:

```
VITE_API_URL=https://sistema.tpdrones.com.br/api
```

### 4. Configuração do Domínio

#### Domínio Personalizado (Opcional)

Se quiser usar um domínio personalizado:

1. **No Vercel**, vá para "Settings" → "Domains"
2. **Adicione domínio**: `sistema.tpdrones.com.br`
3. **Configure DNS** no Hostgator:
   ```
   Tipo: CNAME
   Nome: sistema
   Valor: [URL do Vercel]
   TTL: 300
   ```

### 5. Estrutura Final

```
Frontend: https://[vercel-url].vercel.app
Backend: https://sistema.tpdrones.com.br/api
```

## Configuração do Banco de Dados (Hostgator)

### 1. Verificar Configuração no Railway

No Railway, certifique-se de que as variáveis estão configuradas:

```
DATABASE_URL=mysql://tpdron91_tpdron91:Fwdex10TpDron@tpdrones.com.br:3306/tpdron91_dronecore
JWT_SECRET=cc1222b125383dd07b4afc0c74cc05dae54e62728e3d4c4acfdd20c8788e4d6437e8fb730e45821719a92de148de49286ed6f064e2b9f482bba8926e3887ff7e
NODE_ENV=production
```

### 2. Configurar Hostgator para Conexões Externas

Se o banco não estiver acessível externamente:

1. **Acesse o painel do Hostgator**
2. **Vá para "Databases"** → "Remote MySQL"
3. **Adicione o IP do Railway** na lista de IPs permitidos
4. **Ou use o IP público** do servidor Hostgator

### 3. Alternativa: Banco na Nuvem

Se o Hostgator não permitir conexões externas:

1. **Use PlanetScale** (gratuito):
   ```
   DATABASE_URL=mysql://[user]:[password]@[host]/[database]
   ```

2. **Ou Railway PostgreSQL**:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
   ```

## Teste Final

Após configurar tudo:

1. **Teste o backend**: https://sistema.tpdrones.com.br/api/health
2. **Teste o frontend**: [URL do Vercel]
3. **Login**: admin@dronecore.com / admin123

## Troubleshooting

### Se o frontend não conectar ao backend:

1. **Verifique CORS** no backend
2. **Confirme a URL da API** no frontend
3. **Teste a API** diretamente

### Se o banco não conectar:

1. **Verifique as credenciais** do Hostgator
2. **Teste a conexão** externamente
3. **Considere usar um banco na nuvem**

### Se o domínio não funcionar:

1. **Aguarde propagação DNS** (até 24h)
2. **Verifique configuração DNS** no Hostgator
3. **Use a URL do Vercel** diretamente 