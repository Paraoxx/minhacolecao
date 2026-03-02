# Projeto de Coleções (Físicas e Digitais)

Uma plataforma de micro-frontends inspirada no Letterboxd/MyAnimeList para gerenciar coleções pessoais de Mangás, Figures e Jogos.

## Arquitetura

O sistema moderno é composto por três partes distintas e desacopladas que se comunicam através de requisições REST:
1. **Banco de Dados (json-server):** Um servidor local leve que mantém o estado da aplicação e simula persistência.
2. **Painel de Admin (Vite/React):** Sistema restrito para gerenciar a adição estrutural de itens globais ao banco de dados.
3. **Site do Usuário (Vite/React):** O frontend principal da aplicação (A "vitrine"), de onde o usuário explora, pesquisa globalmente e adiciona itens em sua coleção.

---

## Como Rodar o Projeto

Siga os passos rigorosamente abaixo para iniciar os 3 servidores de forma orquestrada, abrindo terminais separados para cada camada:

### Passo 1 (Backend)
Abra um terminal e navegue para a pasta `colecoes-app`. Inicialize o banco de dados rodando o seguinte comando exato (mantenha este terminal aberto):
```bash
npx json-server --watch backend/db.json --port 3000
```

### Passo 2 (Frontend do Usuário)
Abra um **novo terminal**, navegue para a pasta `colecoes-app` e instale as dependências (se for a primeira vez). Em seguida, inicie o app principal:
```bash
npm install
npm run dev
```
> O site irá rodar na porta `5173`.

### Passo 3 (Frontend Admin)
Abra um **terceiro terminal**, navegue para a pasta `admin-panel`. Da mesma forma, instale as dependências e inicie o painel:
```bash
npm install
npm run dev
```
> O painel irá rodar na porta `5174`.

---

⚠️ **Aviso sobre a API de Jogos**

A busca moderna de jogos ('Jogos') dentro do Frontend do Usuário utiliza a integração externa da **RAWG API**. 
Se for rodar o sistema localmente ou criar sua própria build, você precisará gerar uma API Key gratuita no site [rawg.io](https://api.rawg.io) e substituir a query `&key=SUA_CHAVE` no fetch da função de busca global no código do App.
