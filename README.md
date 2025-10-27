# Aplicação de Gestão de Tarefas com Multi-Tenancy

## Introdução

Esta aplicação é uma solução para o teste técnico de Desenvolvedor Full Stack. O objetivo é construir uma aplicação web de gestão de tarefas com isolamento por organização (multi-tenancy). Cada organização tem seu próprio "espaço" isolado, garantindo que usuários de diferentes organizações não acessem dados uns dos outros. Isso é crítico para a segurança e privacidade.

A aplicação inclui:
- Autenticação com registro, login e logout.
- Gestão de tarefas: listagem, criação, edição, deleção e mudança de status.
- Isolamento rigoroso: Tarefas são filtradas pela organização do usuário logado.
- Extras que faltam ser terminados: Suporte a temas customizáveis por organização (cores primária/secundária e modo light/dark), paginação no frontend e validações.

O código segue o padrão Controller → Service → Repository para tarefas, garantindo organização e manutenção fácil.

## Tecnologias Utilizadas

- **Backend**: Laravel 12, MySQL (ou PostgreSQL), Laravel Sanctum para autenticação.
- **Frontend**: React com TypeScript, Inertia.js para integração com Laravel, Tailwind CSS para estilização.
- **Outros**: Docker para containerização, Axios para chamadas API, Vite para desenvolvimento frontend.
- **Padrão de Código**: Controller (coordenação), Service (lógica de negócio), Repository (acesso a dados).

## Configuração e Instalação

### Requisitos
- Docker e Docker Compose instalados.
- Git para clonar o repositório.

### Passos para Rodar o Projeto
1. **Clone o Repositório**:
   ```
   git clone https://github.com/GabrielR4SH/laravel_tenancy_project.git
   cd laravel_tenancy_project
   ```

2. **Configure o Ambiente**:
   - Copie `.env.example` para `.env` e ajuste variáveis se necessário (ex.: DB_HOST=db, DB_DATABASE=tenancy_db, DB_USERNAME=user, DB_PASSWORD=password).

3. **Construa e Inicie os Containers com Docker**:
   ```
   docker-compose up -d --build
   ```
   - Isso inicia: App (PHP/Laravel), DB (MySQL), Web (Nginx).

4. **Instale Dependências do Backend**:
   ```
   docker-compose exec app composer install
   ```

5. **Gere a Chave da Aplicação**:
   ```
   docker-compose exec app php artisan key:generate
   ```

6. **Execute as Migrations**:
   ```
   docker-compose exec app php artisan migrate
   ```

7. **Execute os Seeders** (para dados de teste):
   ```
   docker-compose exec app php artisan db:seed
   ```
   - Isso cria: Org A (user1@org1.com / password, 5 tarefas), Org B (user2@org2.com / password, 5 tarefas), Org C (user3@org3.com / password, 5 tarefas).

8. **Instale Dependências do Frontend**:
   ```
   docker-compose exec app npm install
   ```

9. **Inicie o Servidor de Desenvolvimento Frontend (Vite)**:
   ```
   docker-compose exec app npm run dev
   ```

10. **Acesse a Aplicação**:
    - Frontend: http://localhost:8080 (via Nginx).
    - API: http://localhost:8000/api (direto no Laravel).
    - Teste com usuários seedados para verificar multi-tenancy.

### Docker Configuração
- **docker-compose.yml**: Define serviços para app (Laravel), db (MySQL), web (Nginx).
- **Dockerfile**: Baseado em PHP 8.3-fpm, instala Composer, Node.js, e dependências para Laravel.
- **nginx.conf**: Configura proxy para o app PHP-FPM.

Para parar: `docker-compose down`.

## Endpoints da API

Todos os endpoints estão sob `/api`. Use Postman ou similar para testar. Endpoints protegidos requerem header `Authorization: Bearer {token}` (obtido via login/register).

### Autenticação
- **POST /api/register**
  - Body: `{ "name": "string", "email": "string", "password": "string", "organization_name": "string" }`
  - Retorna: `{ "user": {...}, "token": "string" }`

- **POST /api/login**
  - Body: `{ "email": "string", "password": "string" }`
  - Retorna: `{ "user": {...}, "token": "string" }`

- **POST /api/logout** (autenticado)
  - Retorna: `{ "message": "Logged out" }`

### Organizações (Auxiliares)
- **GET /api/organizations**
  - Retorna: Lista de organizações `{ id, name }` (para seleção no registro).

### Tarefas (Autenticadas, Isoladas por Organização)

- **GET /api/tasks**
  - Retorna: Lista de tarefas da organização do usuário.
  - Pré-requisito: Requer token de autenticação no header (Authorization: Bearer <token>) em todos endpoints abaixo.

- **POST /api/tasks**
  - Body: `{ "title": "string", "description": "string" }`
  - Retorna: Tarefa criada.

- **GET /api/tasks/{id}**
  - Retorna: Detalhes da tarefa.

- **PUT /api/tasks/{id}**
  - Body: `{ "title": "string", "description": "string" }`
  - Retorna: Tarefa atualizada.

- **DELETE /api/tasks/{id}**
  - Retorna: 204 No Content.

- **PATCH /api/tasks/{id}/status**
  - Body: `{ "status": "pending|in_progress|done" }`
  - Retorna: Tarefa com status atualizado.

## Testes Unitários

Como diferencial, implementei testes básicos usando PHPUnit (Laravel). Foco em multi-tenancy e endpoints críticos. Rode com `docker-compose exec app php artisan test`.

(mesmo que poucos, como pedido).

## Decisões Técnicas
- **Multi-Tenancy**: Implementado filtrando queries por `organization_id` do usuário logado no Service/Repository. Testado com seeders.
- **Padrão Controller-Service-Repository**: Aplicado apenas às tarefas, como exemplo no teste. Controllers enxutos, lógica no Service, dados no Repository.
- **Frontend**: React + TypeScript para tipagem segura. Axios para API. Temas como extra para customização por org.
- **Docker**: Adicionado para facilitar rodar (diferencial).
- **Outros**: Adicionei prioridades e datas nas tarefas como extras. Paginação client-side para simplicidade.


## O que Faria Diferente com Mais Tempo
- Implementar funcionalidades avançadas de customização por tenant (organização), como permitir que cada tenant defina um estilo de tema  único (claro ou escuro) 
- Testes end-to-end com Cypress + criação de outros testes.
- Adicionar CRUD completo para tenants (editar/deletar, criar tenant já funciona na tela de registro).
- Autenticação social ou roles (ex.: admin por org).

## Checklist Antes de Enviar
- [x] Rodei composer install e as migrations funcionaram.
- [x] Seeders criaram os dados de teste.
- [x] Login retorna um token.
- [x] User1 NÃO consegue ver tarefas do User2 (TESTE ISSO!).
- [x] Segui o padrão Controller → Service → Repository.
- [x] Frontend consome a API e funciona.
- [x] README tem instruções claras de como rodar.
- [x] .env.example está atualizado.
- [x] Projeto roda sem erros.
