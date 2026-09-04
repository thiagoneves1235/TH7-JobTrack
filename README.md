# TH7 JobTrack

**TH7 JobTrack** é um Career OS responsivo para organizar a busca por oportunidades de tecnologia. O projeto demonstra uma experiência de produto completa: dashboard, pipeline de candidaturas, preparação de entrevistas, assistente de carreira, perfil profissional, configurações e API REST.

## Demo online

[**Abrir TH7 JobTrack no navegador →**](https://thiagoneves1235.github.io/TH7-JobTrack/)

O código-fonte fica neste repositório e cada atualização na branch `main` publica automaticamente uma nova versão pelo GitHub Pages.

## Produto

- Dashboard com métricas, meta semanal e próximas tarefas
- Pipeline completo com busca, filtros, criação e remoção de candidaturas
- Agenda de entrevistas com checklist de preparação
- Chatbot **TH7 Copilot** com sugestões e respostas contextuais simuladas
- Perfil profissional com score e edição de dados
- Configurações com preferências, notificações e exportação
- Interface azul e branca, responsiva para desktop, tablet e celular
- Persistência local imediata via `localStorage`
- Login, cadastro, sessão persistente e logout para o workspace

## Arquitetura

```text
index.html              # Shell da aplicação e seis views roteadas por hash
styles.css              # Design system azul, componentes e breakpoints
mobile.css              # Ajustes dedicados para telas de até 650px
polish.css              # Camada visual premium, microinterações e profundidade
auth.css                # Tela de autenticação e estados mobile
auth-fix.css            # Estados exclusivos entre login e cadastro
notifications.css       # Painel de notificações responsivo
dashboard-polish.css    # Destaque de prioridade e contexto da agenda
responsive-fix.css      # Correções finais de fluxo e posicionamento mobile
accessibility.css       # Foco de teclado, skip link e movimento reduzido
app.js                  # Roteamento, interações, métricas e chatbot
api.js                  # Repositório local que abstrai a persistência da UI
backend/server.js       # API HTTP nativa sem dependências externas
database/schema.sql     # Modelo PostgreSQL para produção
package.json            # Script de inicialização do backend
.github/workflows/       # Publicação automática no GitHub Pages
```

A interface funciona abrindo o `index.html` diretamente. Para executar a API e servir o frontend pelo mesmo processo:

```bash
npm start
```

Depois acesse `http://localhost:3000`. Endpoints disponíveis:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/applications`
- `POST /api/applications`
- `DELETE /api/applications/:id`

O banco de dados está modelado em `database/schema.sql`, com usuários, candidaturas, entrevistas e tarefas. A demo usa um adaptador local para continuar simples de executar; a API pode ser conectada ao PostgreSQL substituindo a camada de persistência do servidor.

## Autenticação

A tela de login e cadastro funciona localmente para demonstrar o fluxo completo de produto. Usuários e sessão são armazenados no navegador para a demo. Em produção, as credenciais devem ser tratadas no backend com hash de senha, sessão segura ou JWT, validação de e-mail e recuperação de acesso.

## Validação

O projeto foi validado com o analisador do VS Code. O navegador pode executar a versão estática sem instalação. O comando `npm start` requer Node.js 18 ou superior.

## Próximas evoluções

- Autenticação com sessões ou JWT
- Conectar `api.js` aos endpoints REST
- Integração real com PostgreSQL e migrations
- Modelo de linguagem real no TH7 Copilot
- Drag-and-drop entre etapas do pipeline

## Licença

Projeto de portfólio pessoal, livre para estudo e adaptação.
