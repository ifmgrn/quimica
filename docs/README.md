# Documentação

## Visão Gerão da Estrutura de Arquivos

Em geral, se você for do _Front-end_, deve se preocupar _especialmente_ com: index.html, .gitattributes, templates/, styles/ e public/. Se você for do _Back-end_, deve se preocupar _especialmente_ com: src/, package.json, eslint.config.mjs, tsconfig.json, vite.config.mjs, node_modules/ e dist/. Se você for do "Devops", deve se preocupar com todo o resto.

- .github: define automatizações para o GitHub Actions (como "compilar" o projeto e enviá-lo para o servidor toda que vez que uma alteração for feita na _branch main_)
- .husky: define automatizações para o Git (como garantir que o projeto está formatado corretamente e não contém erros antes de fazer um _commit_)
- .vscode: configurações e extensões recomendadas para o Visual Studio Code
- dist: não está no Git, mas é gerado como a versão "compilada" do projeto
- docs: documenta o projeto
- node_modules: não está no Git, mas é onde as dependências são baixadas localmente
- public: todo arquivo presente aqui será enviado para o servidor, então recursos como imagens e fontes usadas pelo _website_ devem ficar aqui
  - Na hora de referenciar esses arquivos no _HTML_, não use o prefixo "public". Referencie os arquivos como se eles estivessem na raiz (ex.: /images/imagem.png)
- src: contém o código-fonte em Typescript/Javascript, que define o "dinamismo" do _website_
  - main.ts é o arquivo principal (ponto de partida)
- styles: contém o código-fonte em SCSS/CSS, que define o estilo e o visual do _website_
  - main.scss é o arquivo principal (ponto de partida)
- templates: contém arquivos _HTML_ que serão adicionados no \<body\> da página principal sob certas condições
  - home.html: será adicionado quando o usuário estiver na página principal (ou seja, nenhuma reação foi especificada)
  - reaction.html: será adicionado quando uma reação for aberta (suporta variáveis)
- .gitattributes: especifica para o Git o que é binário e o que é texto (dentre outras coisas)
- .gitignore: especifica para o Git o que ele deve ignorar (o que não deve ser registrado no histórico)
- eslint.config.mjs: configura o Eslint (ferramenta que audita e complementa o Typescript)
- index.html: _HTML_ principal (ponto de partida), será copiado para o servidor
- LICENSE.txt: especifica a licença, será copiado para o servidor
- lint-staged.config.mjs: configura o Git para verificar e formatar apenas arquivos modificados quando for fazer _commit_ (caso contrário, o processo de fazer _commit_ seria muito lento)
- package.json: lista as dependências do projeto e alguns metadados (como scripts para "compilação")
- pnpm-lock.yaml: contém as versões exatas das dependências, nunca devem ser modificado diretamente
- prettier.config.mjs: configura o Prettier e as regras gerais de formatação do projeto
- README.md: apresenta o projeto
- setup_helper.ps1: script Powershell para baixar e configurar o projeto e suas dependências (incluindo ferramentas) no Windows (especialmente no computador da escola)
- stylelint.config.mjs: configura o Stylelint e as regras de verificação e formatação específicas para o CSS/SCSS
- stylelint.order.config.mjs: configura a ordem de propriedades internas do CSS/SCSS (usado pelo Stylelint)
- tsconfig.json: configura o Typescript para verificação de erros
- vite.config.mjs: configura o Vite e como o projeto deve ser "compilado"

## Workflow

Se o projeto ainda não estiver configurado no computador, confira o [README](/README.md#guia-de-instalação).

O _workflow_ geral no Visual Studio Code é este:

- Certifique-se que você está na versão mais recente do projeto:
  - Vá na aba "Controle de versão" (ou algo assim) no painel esquerdo (geralmente o terceiro botão)
  - No painel que abrir, na parte inferior dele, clique no segundo botão da direira para esquerda (o que tem uma seta para baixo, "Pull")
- Faça as modificações que você quer nos arquivos (ignore os avisos em amarelo, a não ser que sejam erros em vermelho)
- Conforme você for salvando os arquivos, ele irá formatá-los automaticamente (o que deve acabar com todos os avisos amarelos, excluindo erros vermelhos), então não se preocupe se os arquivos forem modificados subitamente
- Para testar o _website_, você pode executar o script de Powershell (se você o tiver baixado conforme o README) ou abrir um terminal e digitar `pnpm run dev`. Você só precisa fazer isso uma vez, modificações futuras serão refletidas automaticamente no _website_
- Depois que você fizer as modificações (de preferência, que não sejam várias modificações relacionadas a coisas diferentes), vá na aba "Controle de versão" de novo, clique no botão "+" do lado do texto "Mudanças", escreva uma mensagem na caixa de texto superior e clique em "Commit". Isso irá salvar as modificações que você fez no histórico local
- Depois que você fizer todos os _commits_ que precisar (por exemplo, depois que a aula da escola acabar), vá na aba "Controle de versão" e clique no primeiro botão da direita para esquerda (o que tem uma seta para cima, "Push"). Isso irá enviar os _commits_ para o GitHub
