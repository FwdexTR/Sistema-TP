# Configuração de Ambiente - DroneCore

## Variáveis de Ambiente Configuradas

### Para Railway Deployment:

```bash
NODE_ENV=production
JWT_SECRET=cc1222b125383dd07b4afc0c74cc05dae54e62728e3d4c4acfdd20c8788e4d6437e8fb730e45821719a92de148de49286ed6f064e2b9f482bba8926e3887ff7e
DATABASE_URL="mysql://tpdron91_tpdron91:Fwdex10TpDron@localhost:3306/tpdron91_dronecore"
```

### Para Desenvolvimento Local:

Crie um arquivo `.env` na pasta `server/` com:

```bash
JWT_SECRET=cc1222b125383dd07b4afc0c74cc05dae54e62728e3d4c4acfdd20c8788e4d6437e8fb730e45821719a92de148de49286ed6f064e2b9f482bba8926e3887ff7e
DATABASE_URL="mysql://tpdron91_tpdron91:Fwdex10TpDron@localhost:3306/tpdron91_dronecore"
NODE_ENV=development
```

## Configuração do Banco de Dados

- **Host**: localhost
- **Porta**: 3306
- **Database**: tpdron91_dronecore
- **Usuário**: tpdron91_tpdron91
- **Senha**: Fwdex10TpDron

## Credenciais de Acesso Padrão

- **Email**: admin@dronecore.com
- **Senha**: admin123
- **Role**: ADMIN

## Como Configurar no Railway

1. Acesse o projeto no Railway
2. Vá para a aba "Variables"
3. Adicione as seguintes variáveis:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `cc1222b125383dd07b4afc0c74cc05dae54e62728e3d4c4acfdd20c8788e4d6437e8fb730e45821719a92de148de49286ed6f064e2b9f482bba8926e3887ff7e`
   - `DATABASE_URL` = `mysql://tpdron91_tpdron91:Fwdex10TpDron@localhost:3306/tpdron91_dronecore`

## Notas Importantes

- O JWT_SECRET é uma chave de 128 caracteres para segurança
- O DATABASE_URL aponta para o banco MySQL no Hostgator
- Certifique-se de que o banco de dados está acessível externamente
- Para produção, considere usar um banco de dados na nuvem (como PlanetScale ou Railway PostgreSQL) 