# Guia de Configuração do Banco de Dados com PlanetScale

Este guia irá te ajudar a criar um banco de dados MySQL na nuvem usando o PlanetScale, que oferece um plano gratuito generoso e é perfeitamente compatível com o Railway e Vercel.

## Passo 1: Criar sua Conta no PlanetScale

1.  **Acesse o site**: [https://planetscale.com/](https://planetscale.com/)
2.  Clique em **"Get started"** para criar uma conta nova. Você pode se registrar usando sua conta do GitHub para facilitar.
3.  Siga as instruções para completar o cadastro.

## Passo 2: Criar um Novo Banco de Dados

1.  Após fazer login, você será levado ao seu painel de controle.
2.  Clique no botão **"Create a new database"**.
3.  **Nome do Banco de Dados**: Dê um nome, por exemplo, `dronecore-db`.
4.  **Escolha uma Região**: Escolha a região mais próxima de você ou do servidor do Railway (por exemplo, `us-east`).
5.  Clique em **"Create database"**.

## Passo 3: Obter a URL de Conexão

1.  Após criar o banco, você será levado ao painel desse banco.
2.  Clique no botão **"Connect"** no canto superior direito.
3.  Na janela que aparecer, na opção **"Connect with"**, selecione **`Prisma`**.
4.  O PlanetScale vai gerar uma variável de ambiente completa para você, que se parece com isso:
    ```
    DATABASE_URL="mysql://<USUARIO>:<SENHA>@<HOST>/<NOME_DO_BANCO>?sslaccept=strict"
    ```
5.  **Copie essa linha inteira**. Esta é a sua nova `DATABASE_URL`.

## Passo 4: Aplicar o Schema do Banco de Dados

O PlanetScale usa um sistema de "branches" (como o Git) para o seu schema.

1.  **Volte ao painel do seu banco de dados** no PlanetScale.
2.  Clique na aba **"Schema"**.
3.  Você verá uma notificação para **"Promote a branch to production"**.
4.  Clique em **"Promote branch"**. Isso vai preparar seu banco de dados para aceitar o schema.

Agora, precisamos enviar nosso schema do Prisma para o PlanetScale.

1.  **No seu computador local**, abra o terminal no diretório do projeto (`DroneCore`).
2.  Certifique-se de que você tem o Prisma instalado (`npm install prisma` no diretório `server`).
3.  Crie um arquivo `.env` dentro da pasta `server` e cole a `DATABASE_URL` que você copiou do PlanetScale.
4.  Execute o seguinte comando para "empurrar" seu schema para o PlanetScale:
    ```bash
    cd server
    npx prisma db push
    ```
5.  O Prisma vai analisar seu `schema.prisma` e criar todas as tabelas (Users, Tasks, etc.) no seu banco de dados PlanetScale.

## Passo 5: Usar a Nova DATABASE_URL

Agora que seu banco de dados está criado e o schema aplicado, você tem a `DATABASE_URL` pronta para usar.

-   **Guarde essa URL**. Nós vamos usá-la para configurar as variáveis de ambiente no Railway.

Com o PlanetScale, seu banco de dados estará acessível de qualquer lugar, resolvendo o problema de bloqueio do Hostgator. 