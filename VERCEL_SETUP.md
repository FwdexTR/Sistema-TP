# Guia de Deploy - Frontend na Vercel

Este guia detalha os passos para fazer o deploy do frontend (`dronecore-dashboard-ui`) na Vercel.

## 1. Importar o Projeto na Vercel

-   **Framework Preset**: `Vite`
-   **Root Directory**: `dronecore-dashboard-ui` (Importante: Vercel deve olhar para a subpasta)
-   **Build & Development Settings**: Mantenha os padrões.

## 2. Configurar Variáveis de Ambiente

Na Vercel, vá para **Settings -> Environment Variables**. Adicione a seguinte variável:

-   `VITE_API_URL`
    -   **Valor**: A URL pública do seu backend no Railway (Ex: `https://seu-backend-123.up.railway.app`).
    -   **Como encontrar**: No seu projeto Railway, clique no serviço do backend. A URL pública estará visível no topo da página. Se não estiver, gere uma em **Settings -> Domains**.

## 3. Fazer o Deploy

Clique em **Deploy**. A Vercel irá construir e publicar seu site.

## 4. Conectar um Domínio Personalizado (Opcional)

Se você tem um domínio (ex: `sistema.seusite.com.br`), pode conectá-lo na Vercel em **Settings -> Domains**.

## 5. Pronto!

Seu frontend estará no ar, conectado ao backend que está rodando no Railway.

## Solução de Problemas

-   **Erros de CORS**: Verifique se a variável `VITE_API_URL` na Vercel está correta e não tem uma `/` no final.
-   **Falha no Build**: Confirme que o "Root Directory" na Vercel está configurado como `dronecore-dashboard-ui`.

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