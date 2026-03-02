# Minha Coleção

Repositório de gerenciador de coleções. 
Projeto para catalogar coleções fisicas e digitais.

O sistema é dividido em 3 partes. 
## Como rodar o projeto

Você vai precisar abrir **3 terminais diferentes** no seu VSCode, Antigravity ou qualquer outro editor de código. Cada um vai rodar uma parte da aplicação.

### Passo 1: Ligar o Banco de Dados 
 O banco dados no momento está sendo setado no `json-server` pra simular um banco de dados real. Ele lê o arquivo `backend/db.json`.
1. Abra o primeiro terminal na pasta raiz do projeto.
2. Rode o comando:
   ```bash
   npx json-server --watch backend/db.json --port 3000
   ```
3. Deixe esse terminal aberto.

### Passo 2: Rode o site a nivel de usuário.
Aqui será a parte da aplicação a nivel de usuário.
1. Abra um SEGUNDO terminal.
2. Entre na pasta do app principal: `cd colecoes-app`
3. Instale as dependências: `npm install`
4. Ligue o motor: 
   ```bash
   npm run dev
   ```
5. Ele vai rodar no link: `http://localhost:5173`

### Passo 3: Painel de Admin 
Painel para gerenciar e cadastrar informações na nivel de usuário.
1. Abra um terceiro terminal.
2. Entre na pasta do painel: `cd admin-panel` *(Nota: ajuste o nome da pasta se for diferente)*
3. Instale as dependências: `npm install`
4. Ligue o motor:
   ```bash
   npm run dev
   ```
5. Ele vai rodar no link: `http://localhost:5174`

## Avisos importantes sobre as APIs
- **Mangás:** Usei a **Jikan API**. É de graça e não precisa de chave.
- **Jogos:** Usei a **RAWG API**. Não fiz pesquisas em outras máquina usando o RAGW API, então caso a busca não funcione no seu computador, você precisará criar uma conta grátis lá no [rawg.io](https://rawg.io/), pegar a sua API Key e substituir a minha lá no arquivo de busca (`SearchResultsView` no frontend).
-**Figures** Por não achar um banco ou acesso a API envolvendo figures na internet, estou populando por conta própria, esses dados estão sendo salvados por enquanto em json em "db.json" na pasta bankend do projeto
