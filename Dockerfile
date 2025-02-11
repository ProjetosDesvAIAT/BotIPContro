# Usa uma imagem oficial do Node.js como base
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependências para o contêiner
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o restante do código para o contêiner
COPY . .

# Expor uma porta (caso sua aplicação use alguma)
EXPOSE 3000

# Comando para rodar o bot automaticamente
CMD ["npm", "run", "dev"]
