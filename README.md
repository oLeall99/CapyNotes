# CapyNote - Aplicativo de Gestão de Notas e Tarefas

Este é um projeto desenvolvido para a disciplina de Computação Móvel, utilizando React Native e Expo para criar uma aplicação mobile completa para gerenciamento de notas, tarefas e metas pessoais.

## Sobre o Projeto

CapyNote é uma aplicação mobile que oferece uma interface simples e intuitiva para organização pessoal. O aplicativo permite que os usuários criem e gerenciem:

- **Notas**: Para registrar ideias, pensamentos e informações importantes
- **Tarefas**: Para organizar atividades com prazos e prioridades
- **Metas**: Para acompanhar objetivos de longo prazo
- **Tags**: Para organizar os itens com tags coloridas

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para facilitar o desenvolvimento React Native
- **SQLite**: Banco de dados relacional local para armazenamento persistente de notas, tarefas e metas
- **AsyncStorage**: Sistema de armazenamento de chave-valor para dados simples como histórico de pesquisa
- **Custom Fonts**: Tipografia personalizada para melhor experiência visual

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
   ou
   ```
   yarn install
   ```
3. Execute o projeto:
   ```
   npx expo start
   ```

## Download e Instalação

### Para dispositivos Android

1. Faça o download do APK através do link abaixo:
   - [Baixar CapyNotes (versão mais recente)](https://expo.dev/accounts/leall/projects/app-note/builds/6ac06fa8-ba6e-4846-9fa6-06e4d445c5db)

2. **Instruções de instalação**:
   - Ao baixar o arquivo, seu dispositivo pode alertar sobre a instalação de aplicativos de fontes desconhecidas
   - Permita a instalação nas configurações de segurança do seu dispositivo
   - Abra o arquivo APK baixado e siga as instruções na tela para concluir a instalação

### Requisitos mínimos
- Android 6.0 (Marshmallow) ou superior
- 50MB de armazenamento disponível

> **Nota**: Este é um aplicativo de teste em desenvolvimento e pode conter funcionalidades incompletas.

## Estrutura do Projeto

A arquitetura do projeto segue um padrão organizado para facilitar manutenção e escalabilidade:

```
src/
  ├── assets/           # Recursos estáticos (imagens, fontes)
  ├── components/       # Componentes reutilizáveis da UI
  │   ├── Footer/       # Navegação principal do app
  │   ├── Logo/         # Componentes de identidade visual
  │   ├── search/       # Barra de busca com histórico
  │   ├── TagSelector/  # Seleção de tags para filtro
  │   ├── NoteFormModal/# Formulário de criação/edição de notas
  │   ├── TaskFormModal/# Formulário de criação/edição de tarefas
  │   ├── GoalFormModal/# Formulário de criação/edição de metas
  │   └── ...          
  ├── db/               # Camada de acesso a dados
  │   ├── scripts/      # Scripts SQL para inicialização do banco
  │   └── services/     # Serviços para manipulação das entidades
  │       ├── noteService.ts    # Operações CRUD para notas
  │       ├── taskService.ts    # Operações CRUD para tarefas  
  │       ├── goalService.ts    # Operações CRUD para metas
  │       └── tagService.ts     # Operações CRUD para tags
  ├── screen/           # Telas principais do aplicativo
  │   ├── home/         # Tela inicial com favoritos
  │   ├── notes/        # Gerenciamento de notas
  │   ├── tasks/        # Gerenciamento de tarefas
  │   ├── goals/        # Gerenciamento de metas
  │   └── config/       # Configurações do aplicativo
  └── App.tsx           # Componente principal e configuração de rotas
```

A estrutura do projeto foi desenvolvida seguindo princípios de:

- **Separação de Responsabilidades**: Cada componente tem uma função específica
- **Reutilização de Código**: Componentes modulares que podem ser usados em diferentes contextos
- **Organização de Dados**: Separação clara entre UI e lógica de negócios

## Modelo de Dados

O aplicativo utiliza um banco de dados SQLite com as seguintes entidades principais:

### Notas (Notes)
```
- id: INTEGER (chave primária)
- titulo: TEXT (título da nota)
- conteudo: TEXT (conteúdo da nota)
- imagem: TEXT (caminho para imagem opcional)
- isFavorite: INTEGER (marcação de favorito)
- createdAt: DATETIME (data de criação)
- updatedAt: DATETIME (data de atualização)
```

### Tarefas (Tasks)
```
- id: INTEGER (chave primária)
- titulo: TEXT (título da tarefa)
- descricao: TEXT (descrição detalhada)
- status: TEXT ('TO_DO', 'IN_PROGRESS', 'DONE')
- isFavorite: INTEGER (marcação de favorito)
- taskGroupId: INTEGER (grupo de tarefas, opcional)
- createdAt: DATETIME (data de criação)
- updatedAt: DATETIME (data de atualização)
```

### Metas (Goals)
```
- id: INTEGER (chave primária)
- titulo: TEXT (título da meta)
- descricao: TEXT (descrição detalhada)
- valorInicial: REAL (valor inicial da meta)
- valorAtual: REAL (progresso atual)
- valorFinal: REAL (valor objetivo da meta)
- tipo: TEXT ('inteiro', 'dinheiro')
- isFavorite: INTEGER (marcação de favorito)
- createdAt: DATETIME (data de criação)
- updatedAt: DATETIME (data de atualização)
```

### Tags
```
- id: INTEGER (chave primária)
- titulo: TEXT (nome da tag)
- color: TEXT (código de cor da tag)
- descricao: TEXT (descrição opcional)
```

### Relacionamentos

O sistema implementa relacionamentos muitos-para-muitos entre as entidades principais e as tags através de tabelas de junção:

- **note_tags**: Relaciona notas com tags
- **task_tags**: Relaciona tarefas com tags
- **goal_tags**: Relaciona metas com tags

Esta estrutura permite uma organização flexível e categorização eficiente de todos os itens no aplicativo.

## Funcionalidades Principais

- Criação e edição de notas, tarefas e metas
- Navegação intuitiva entre diferentes seções do app
- Sistema de busca avançado com histórico de pesquisas recentes
- Armazenamento estruturado de dados:
  - **SQLite**: Para dados principais (notas, tarefas, metas e tags)
  - **AsyncStorage**: Para histórico de busca
- Organização com sistema de tags coloridas
- Marcação de itens como favoritos
- Acompanhamento de progresso em metas
- Gerenciamento de status de tarefas (A fazer, Em progresso, Concluído)
- Interface limpa e intuitiva para melhor experiência do usuário

## Contribuidores

Desenvolvido como projeto acadêmico para a disciplina de Computação Móvel.

---

*Este README.md faz parte da entrega do trabalho para a disciplina de Computação Móvel.* 