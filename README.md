# Sn1tchApp
## Módulo do docs - google apps script
Para testar, basta abrir o google apps script, criar um arquivo do tipo .gs e colar o conteúdo do arquivo desse repertório ou instalar e fazer um upload<br>
Em seguida, tem que alterar a id do documento no código para a id do respectivo documento, que consta na própria url (https://docs.google.com/document/d/documentId/edit)<br>
Para finalizar, basta salvar, rodar e criar um deployment (pode ser de teste) <br>
É só abrir o link do deployment criado automaticamente pelo google apps script que o resultado será exibido

# Subindo o MongoDB

Navegue até o diretório do MongoDB e execute o comando iniciar o container:
cd /path/to/sn1tchapp-mongodb

docker compose up

# Compilando o código

Para compilar e executar os códigos do backend e frontend, você precisará seguir alguns passos. Aqui estão os comandos e instruções para cada parte:

## Backend
### Instale as dependências:

Navegue até o diretório do backend e execute o comando para instalar todas as dependências listadas no package.json.

cd /path/to/sn1tchapp-backend

npm install

### Configure o banco de dados:
Certifique-se de ter um banco de dados MongoDB em execução e configure a string de conexão no arquivo .env.

MONGO_URI=YOUR_MONGO_DB_CONNECTION_STRING

### Inicie o servidor:
Execute o comando para iniciar o servidor Express.

npm start

O backend deve agora estar em execução e ouvindo na porta definida.

## Frontend
### Instale as dependências:

Navegue até o diretório do frontend e execute o comando para instalar todas as dependências listadas no package.json.

cd /path/to/sn1tchapp-frontend

npm install

### Inicie o servidor de desenvolvimento:
Execute o comando para iniciar o servidor de desenvolvimento do React.

npm start
