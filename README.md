# Website de Reações Químicas

![GitHub Tamanho do Repo](https://img.shields.io/github/repo-size/ifmg-rn/reacoes-quimicas?label=Tamanho%20do%20Repo&style=flat)

Este repositório é um projeto escolar e contém o código-fonte por trás do [Banco de Dados de Reações Quimicas](https://ifmg-rn.github.io/reacoes-quimicas).

O principal foco do projeto é disponibilizar um banco de dados de moléculas em português (brasileiro), baseado no [PubChem](https://pubchem.ncbi.nlm.nih.gov/).

Além disso, ele se propõe a oferecer uma tabela periódica interativa e uma forma para o usuário catalogar reações químicas usando o formato que desejar.

Esta versão do website funciona totalmente no lado do cliente, permitindo interações off-line.

## Guia de Instalação

### Forma automatizada (recomendada caso você esteja num computador escolar)

Você pode baixar e executar este [script](setup_helper.ps1) através deste comando no Powershell:

```powershell
# Defina a localização para a pasta de Downloads
Set-Location (New-Object -ComObject Shell.Application).Namespace('shell:Downloads').Self.Path
# Baixa o script com o nome "reacoes_quimicas.ps1"
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/ifmg-rn/reacoes-quimicas/refs/heads/main/setup_helper.ps1' -OutFile reacoes_quimicas.ps1
# Roda o script ignorando a política de execução
powershell -ep Bypass .\reacoes_quimicas.ps1
```

O script fará o seguinte:

- Configurará o Powershell
  - Fará o Powershell priorizar o PATH do usuário sobre o PATH do sistema
  - Isso permitirá com que você utilize aplicativos atualizados na linha de comando sem depender do acesso de administrador (para atualizá-los)
- Baixará o [Git](https://git-scm.com/) caso necessário
  - Caso o Git não esteja no PATH, baixará o Git portátil (não necessariamente a versão mais recente, você pode consultar no script para ver qual é)
  - Depois de baixá-lo, irá adicionar ele ao PATH do usuário e configurar o user.name e o user.email conforme a entrada do usuário
- Baixará o [Node.js](https://nodejs.org/) e o [pnpm](https://pnpm.io/) caso necessário
  - Caso o Node.js não esteja no PATH ou não seja no mínimo uma versão específica (que você pode olhar no script), baixará o Node.js portátil (não necessariamente a versão mais recente)
  - Depois de baixá-lo, adicionará-lo ao PATH do usuário e atualizará o npm para a versão mais nova (possível)
  - Caso o pnpm não esteja no PATH, baixará e instalará a versão mais nova possível usando o npm
- Clonará o repositório e baixará suas dependências usando o pnpm
- Te dará a opção de baixar a versão portátil do [Visual Studio Code](https://code.visualstudio.com/) (a versão mais atualizada), e adicioná-lo ao PATH do usuário e na sua área de trabalho

### Forma manual

Faça isso no Powershell (assumindo que você tenha Git, Node.js e pnpm instalados):

```powershell
# Clona o repositório
git clone 'https://github.com/ifmg-rn/reacoes-quimicas'
# Baixa as dependências do projeto
pnpm --dir 'reacoes-quimicas' install
# Roda um servidor local de desenvolvimento
pnpm --dir 'reacoes-quimicas' run dev
```

## Documentação

Veja a [documentação](docs/README.md) para conhecer a estrutura do repositório e seu funcionamento.

Também veja a aba ["Projetos"](https://github.com/users/ifmg-rn/projects/1) do GitHub para acompanhar o progresso das tarefas e o "roadmap".

## Guia de Contribuição
[John Aldo](https://github.com/ifmg-rn), [Arthur Gabriel](https://github.com/calmecalabreso), [Davi Almeida](https://github.com/davialmeida02), [Nicolas Caua](https://github.com/Nilas09), [Nicolas Samuel](https://github.com/0focomaisansiedade), [Isadora Alves](HTTPS://github.com/doraaventura), [Luiz Fernando](https://github.com/soqueroentrar), [Luiz Henrique](https://github.com/FravioMatuto)

## Licença

Esse repositório está sob a licença AGPL v3. Veja o arquivo [LICENSE.txt](LICENSE.txt) para mais detalhes.
