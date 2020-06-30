# Gameland - Back end

Webapp para divulgação e avaliação de games. Principais tecnologias de **Back-end** utilizadas foram:

 - Javascript;
 - Node js;
 - Express js;
 - MongoDb;
 - Mongoose;
 - Mailtrap  para testar email (server smtp)

Para rodar a aplicação localmente, faz-se necessário ter o mongo instalado na sua máquina. Para isso, faça:

    $ sudo apt update && sudo apt install -y mongodb

Para configurar o recebimento de email, faz-se necessário mudar as variáveis de ambiente no arquivo .env na raiz do projeto. São elas:

    MAIL_HOST
    MAIL_PORT
    MAIL_USER
    MAIL_PASS

Para acessar como **master**, os valores de acesso estão também no dotenv com os seguintes valores:

    MASTER_LOGIN = dev
    SENHA = gameland@$1
    
A aplicação foi separada em models, controllers, database, middlewares, basicamente. Há apenas um middleware para autenticação, que é feita por meio de um token jwt, quatro controllers (user, product, rating e note) e quatro model scheme correspondentes aos quatro controllers e com os mesmos nomes. 
Por se tratar de uma aplicação pequena e para fins educativos,  utilizou-se a hospedagem de imagem no próprio banco.
O token foi guardado localmente quando o usuário acessa o sistema, cria cadastro ou redefine a senha (todas três telas dão acesso ao produto).

## Melhorias
Alguns pontos de melhorias podem ser inseridos, a exemplo de:

 1. Utilização de serviço para armazenamento de imagens como o aws S3;
 2. Não armazenamento de arquivos de imagem em banco como base64;
 3. Criação de esquema de thread para comentários, a exemplo do twitter (muito mais trabalhoso);
 4. Armazenamento de token em cookies com httpsOnly para aumentar a segurança;
 5. Etc.
