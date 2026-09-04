# TH7 JobTrack

**TH7 JobTrack** é um Career OS responsivo para organizar a busca por oportunidades de tecnologia. O projeto demonstra uma experiência de produto completa: dashboard, pipeline de candidaturas, preparação de entrevistas, assistente de carreira, perfil profissional, configurações e API REST.

## Produto

- Dashboard com métricas, meta semanal e próximas tarefas
- Pipeline completo com busca, filtros, criação e remoção de candidaturas
- Agenda de entrevistas com checklist de preparação
- Chatbot **TH7 Copilot** com sugestões e respostas contextuais simuladas
- Perfil profissional com score e edição de dados
- Configurações com preferências, notificações e exportação
- Interface azul e branca, responsiva para desktop, tablet e celular
- Persistência local imediata via `localStorage`

## Arquitetura

```text
index.html              # Shell da aplicação e seis views roteadas por hash
styles.css              # Design system azul, componentes e breakpoints
mobile.css              # Ajustes dedicados para telas de até 650px
polish.css              # Camada visual premium, microinterações e profundidade
app.js                  # Roteamento, interações, métricas e chatbot
api.js                  # Repositório local que abstrai a persistência da UI
backend/server.js       # API HTTP nativa sem dependências externas
database/schema.sql     # Modelo PostgreSQL para produção
package.json            # Script de inicialização do backend
```

A interface funciona abrindo o `index.html` diretamente. Para executar a API e servir o frontend pelo mesmo processo:

```bash
npm start
```

Depois acesse `http://localhost:3000`. Endpoints disponíveis:

- `GET /api/health`
- `GET /api/applications`
- `POST /api/applications`
- `DELETE /api/applications/:id`

O banco de dados está modelado em `database/schema.sql`, com usuários, candidaturas, entrevistas e tarefas. A demo usa um adaptador local para continuar simples de executar; a API pode ser conectada ao PostgreSQL substituindo a camada de persistência do servidor.

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
