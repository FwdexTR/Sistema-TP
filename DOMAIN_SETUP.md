# Configuração do Domínio - sistema.tpdrones.com.br

## Passo a Passo para Configurar o Domínio no Railway

### 1. Configuração no Railway

1. **Acesse o Railway** e vá para seu projeto
2. **Vá para a aba "Settings"**
3. **Em "Custom Domains", clique em "Add Domain"**
4. **Digite**: `sistema.tpdrones.com.br`
5. **Clique em "Add"**

### 2. Configuração DNS no Hostgator

#### Acesse o Painel do Hostgator:

1. **Faça login** no painel do Hostgator
2. **Vá para "Domains"** → "Zone Editor"
3. **Selecione o domínio**: `tpdrones.com.br`

#### Adicione o Registro CNAME:

```
Tipo: CNAME
Nome: sistema
Valor: [URL do Railway - será fornecida pelo Railway]
TTL: 300
```

### 3. URL do Railway

Após adicionar o domínio no Railway, você receberá uma URL como:
```
https://your-app-name.railway.app
```

Use essa URL como **Valor** no registro CNAME.

### 4. Verificação

Após configurar:

1. **Aguarde 5-10 minutos** para propagação do DNS
2. **Teste o acesso**: https://sistema.tpdrones.com.br
3. **Verifique o health check**: https://sistema.tpdrones.com.br/api/health

### 5. SSL/HTTPS

O Railway irá automaticamente:
- ✅ Gerar certificado SSL
- ✅ Configurar HTTPS
- ✅ Redirecionar HTTP para HTTPS

## Estrutura Final

```
Frontend: https://sistema.tpdrones.com.br
Backend API: https://sistema.tpdrones.com.br/api
Health Check: https://sistema.tpdrones.com.br/api/health
```

## Troubleshooting

### Se o domínio não funcionar:

1. **Verifique o DNS** no painel do Hostgator
2. **Aguarde mais tempo** para propagação (pode levar até 24h)
3. **Teste com**: `nslookup sistema.tpdrones.com.br`
4. **Verifique se o Railway está rodando**

### Se o banco não conectar:

1. **Verifique se o Hostgator permite conexões externas**
2. **Teste a conexão**: `mysql -h tpdrones.com.br -u tpdron91_tpdron91 -p`
3. **Verifique se o banco `tpdron91_dronecore` existe**

## Configuração Completa

Após configurar tudo, seu sistema estará disponível em:

- 🌐 **URL Principal**: https://sistema.tpdrones.com.br
- 🔧 **API Backend**: https://sistema.tpdrones.com.br/api
- 📊 **Dashboard**: https://sistema.tpdrones.com.br
- 🔐 **Login**: admin@dronecore.com / admin123 