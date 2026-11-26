# 🤖 Botverse

**Botverse** es un marketplace unificado de bots y workflows de automatización. Recopila automáticamente bots publicados en distintas plataformas (**Discord, Slack, Microsoft Teams y GitHub**), los normaliza en un catálogo común y permite a los usuarios explorarlos, guardarlos como favoritos, combinarlos en *workflows* reutilizables y recibir recomendaciones mediante un asistente basado en **IA (LLM)**.

> Proyecto desarrollado como Trabajo de Fin de Grado (TFG).

---

## 📑 Índice

- [Utilidad y funcionalidades](#-utilidad-y-funcionalidades)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Modelo de datos](#-modelo-de-datos)
- [API](#-api)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Docker](#-docker)
- [Tests](#-tests)
- [CI / Gestión del proyecto](#-ci--gestión-del-proyecto)

---

## 💡 Utilidad y funcionalidades

Encontrar el bot adecuado hoy obliga a recorrer marketplaces distintos, cada uno con su formato. Botverse resuelve esto centralizando la información:

| Funcionalidad | Descripción |
|---|---|
| 🕷️ **Scraping multiplataforma** | Extrae bots de Discord App Directory, Slack Marketplace y Microsoft AppSource (Teams) con **Puppeteer**, y de GitHub mediante su **API REST**. |
| 🗂️ **Catálogo unificado** | Todos los bots se guardan con un esquema común: descripción, categorías, imágenes, enlaces, permisos, detalles técnicos, funcionalidades y precios. |
| 🔍 **Búsqueda y filtrado** | Listado de bots con barra de búsqueda, filtros por plataforma/categoría (chips) y vista de detalle de cada bot. |
| ⭐ **Favoritos** | Los usuarios autenticados pueden marcar bots como favoritos y consultarlos desde su perfil. |
| 🔗 **Workflows** | Creación y publicación de workflows que combinan varios bots para un caso de uso, con configuración JSON, etiquetas y visibilidad pública/privada. Incluye un marketplace de workflows. |
| 🧠 **Asistente IA** | Chat con LLM (vía **OpenRouter**, modelo por defecto `meta-llama/llama-4-maverick:free`, o **LM Studio** en local) que describe bots, mantiene sesiones de conversación persistentes y **recomienda workflows** según las necesidades del usuario. |
| 🔐 **Autenticación y roles** | Registro e inicio de sesión con **JWT**, contraseñas cifradas con **bcrypt** y roles `SUPERUSER`, `ADMIN` y `USER`. Rutas protegidas en el frontend con guards. |
| 📘 **Documentación de API** | Swagger UI para la API REST y Playground para GraphQL. |

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Uso |
|---|---|
| **Node.js 20** + **TypeScript 5** | Entorno de ejecución y lenguaje |
| **NestJS 11** | Framework del servidor (módulos, controladores, servicios, guards) |
| **GraphQL** + **Apollo Server** (`@nestjs/graphql`, `@nestjs/apollo`) | API GraphQL code-first |
| **Prisma 6** | ORM, migraciones y cliente tipado |
| **prisma-nestjs-graphql** | Generación de tipos GraphQL a partir del esquema Prisma |
| **PostgreSQL 16** | Base de datos relacional |
| **Puppeteer** | Web scraping de marketplaces (Discord, Slack, Teams) |
| **Axios** / `@nestjs/axios` | Llamadas HTTP (GitHub API, OpenRouter) |
| **@nestjs/jwt** + **bcrypt-ts** | Autenticación y hashing de contraseñas |
| **@nestjs/config** | Gestión de variables de entorno |
| **Swagger** (`@nestjs/swagger`) | Documentación de la API REST |
| **Jest** + **Supertest** | Tests unitarios y e2e |
| **ESLint** + **Prettier** | Linter y formato de código |

### Frontend
| Tecnología | Uso |
|---|---|
| **Angular 19** | Framework SPA (componentes standalone, router, guards) |
| **Angular SSR** + **Express** | Renderizado en servidor |
| **Apollo Angular** + **@apollo/client** | Cliente GraphQL |
| **GraphQL Code Generator** | Generación de tipos TypeScript para operaciones GraphQL |
| **@auth0/angular-jwt** | Gestión del token JWT |
| **RxJS** | Programación reactiva |
| **SCSS** | Estilos |
| **Karma** + **Jasmine** | Tests unitarios |

### Infraestructura y servicios
- **Docker** y **Docker Compose** (PostgreSQL + backend), **Nginx** para servir el frontend compilado.
- **OpenRouter** / **LM Studio** como proveedores de LLM.
- **GitHub Actions** integradas con **Trello** para la gestión de tareas.

---

## 🏗️ Arquitectura

```
┌──────────────────────┐   GraphQL / REST   ┌────────────────────────────┐      ┌──────────────┐
│   Frontend Angular   │ ─────────────────▶ │       Backend NestJS       │ ───▶ │  PostgreSQL  │
│  (SSR, Apollo, JWT)  │ ◀───────────────── │  REST + GraphQL + Swagger  │ ◀─── │   (Prisma)   │
│   localhost:4200     │                    │      localhost:3000        │      └──────────────┘
└──────────────────────┘                    └─────────────┬──────────────┘
                                                          │
                     ┌────────────────────┬───────────────┼────────────────┬─────────────────┐
                     ▼                    ▼               ▼                ▼                 ▼
               Discord (Puppeteer)  Slack (Puppeteer)  Teams/AppSource  GitHub REST API   OpenRouter /
                                                       (Puppeteer)                         LM Studio (LLM)
```

### Módulos del backend
| Módulo | Responsabilidad |
|---|---|
| `bots` | Consulta/borrado del catálogo y resolvers GraphQL. Submódulos `discord`, `slack`, `teams`, `github` con los scrapers de cada plataforma. |
| `workflows` | CRUD de workflows (REST + GraphQL). |
| `favorites` | Gestión de bots favoritos por usuario. |
| `llm` | Chat con LLM, descripción de bots, sesiones de chat y recomendación de workflows. |
| `user` | Gestión de usuarios. |
| `auth` | Login, emisión de JWT y guard de autorización por roles. |
| `prisma` | Servicio de acceso a base de datos. |

### Páginas del frontend
| Ruta | Página | Protegida |
|---|---|---|
| `/` | Home | No |
| `/auth/login`, `/auth/register` | Login / Registro | No |
| `/bots` | Marketplace de bots | No |
| `/bots/:id` | Detalle de bot | No |
| `/workflows` | Marketplace de workflows | ✅ |
| `/upload-workflow` | Subir un workflow | ✅ |
| `/perfil` | Perfil de usuario (favoritos, workflows) | ✅ |

---

## 📁 Estructura del repositorio

```
Botverse/
├── backend/                  # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema de la base de datos
│   │   └── migrations/       # Migraciones
│   ├── src/
│   │   ├── auth/             # JWT, login, guards
│   │   ├── bots/             # Catálogo + scrapers (discord, slack, teams, github)
│   │   ├── dto/              # DTOs de respuesta de cada plataforma
│   │   ├── favorites/
│   │   ├── llm/              # Integración con LLM
│   │   ├── prisma/
│   │   ├── user/
│   │   ├── utils/            # Seguridad, validaciones, decoradores
│   │   └── workflows/
│   ├── test/                 # Tests e2e
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/                 # Aplicación Angular
│   ├── public/               # Iconos y recursos estáticos
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Servicios globales
│   │   │   └── shared/       # Componentes reutilizables y GraphQL
│   │   └── features/         # auth, home, market-list, workflows, llm-chat, user-profile
│   └── Dockerfile
└── .github/workflows/        # Automatizaciones GitHub ↔ Trello
```

---

## 🗄️ Modelo de datos

Entidades principales definidas en `backend/prisma/schema.prisma`:

- **Bot** — nombre, descripción, plataforma de origen (`discord`, `github`, `slack`, `teams`, `microsoft_store`), categorías, web oficial, documentación, precios.
  - **BotImage**, **BotLink**, **BotPermission**, **Feature**, **TechnicalDetails** — información asociada al bot.
- **User** — email, contraseña cifrada, nombre y rol (`SUPERUSER`, `ADMIN`, `USER`).
- **Workflow** — nombre, descripción, caso de uso, `configJson`, etiquetas, visibilidad; relación N:M con bots y creador.
- **FavoriteBot** — relación usuario ↔ bot (única por pareja).
- **ChatSession** — historial de conversación con el LLM por usuario.

---

## 🔌 API

Con el backend en marcha:

- **Swagger UI:** http://localhost:3000/docs
- **GraphQL Playground:** http://localhost:3000/graphql

### Endpoints REST principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión (devuelve JWT) |
| `POST` | `/user` | Registrar usuario |
| `GET` | `/user/:id`, `/user/all`, `/user/by-email` | Consultar usuarios |
| `PATCH` / `DELETE` | `/user/:id` | Editar / eliminar usuario |
| `GET` | `/bots?sourcePlatform=` | Listar bots (filtrable por plataforma) |
| `DELETE` | `/bots?sourcePlatform=` | Borrar bots de una plataforma |
| `POST` | `/discord/save`, `/discord/details` | Scraping de Discord |
| `GET`/`POST` | `/slack/slack`, `/slack/scrape`, `/slack/updateSlackBots` | Scraping de Slack |
| `POST`/`GET` | `/teams/teams`, `/teams/updateTeams` | Scraping de Microsoft Teams |
| `GET`/`POST` | `/github`, `/github/save` | Importación desde GitHub |
| `POST` / `DELETE` | `/favorites/:userId/:botId` | Añadir / quitar favorito |
| `GET` | `/favorites/:userId`, `/favorites/:userId/check?botId=` | Consultar favoritos |
| `POST` / `GET` | `/workflow`, `/workflow/:id` | Crear / listar / ver workflows |
| `POST` | `/llm/chat` | Chat directo con el LLM |
| `POST` | `/llm/describe-bots?sourcePlatform=` | Resumen de bots generado por IA |
| `POST` | `/llm/start`, `/llm/continue` | Iniciar / continuar una sesión de chat |
| `POST` | `/llm/recommend-workflow` | Recomendación de workflow por IA |

### GraphQL
Queries disponibles para bots (listado y detalle) y workflows, consumidas por el frontend mediante Apollo.

---

## 🚀 Instalación y ejecución

### Requisitos
- Node.js 20+
- npm
- PostgreSQL 14+ (o Docker)
- Angular CLI (`npm i -g @angular/cli`)
- Clave de API de [OpenRouter](https://openrouter.ai) (o LM Studio en local) para las funciones de IA
- Token de GitHub para la importación de bots desde GitHub

### 1. Clonar el repositorio
```bash
git clone https://github.com/Manuelgruiz/Botverse.git
cd Botverse
```

### 2. Base de datos
Crea una base de datos PostgreSQL llamada `botverse`, o levanta solo la base de datos con Docker:
```bash
cd backend
docker compose up -d db
```

### 3. Backend
Crea `backend/.env`:
```env
DATABASE_URL=postgresql://usuario:clave@localhost:5432/botverse
JWT_SECRET=clave_super_secreta
JWT_EXPIRES_IN=3600
GITHUB_TOKEN=tu_token_github
GITHUB_API_URL=https://api.github.com
OPENROUTER_API_KEY=tu_api_key_openrouter
USE_LM_STUDIO=false
LM_STUDIO_MODEL=llama3
```

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```
El backend queda disponible en **http://localhost:3000**.

### 4. Frontend
```bash
cd frontend
npm install
npm start
```
La aplicación queda disponible en **http://localhost:4200**. La URL del backend se configura en `frontend/src/enviorenment.ts`.

### 5. Poblar el catálogo
Lanza los scrapers desde Swagger, Postman o `curl`, por ejemplo:
```bash
curl -X POST http://localhost:3000/discord/save
curl -X POST http://localhost:3000/slack/slack
curl -X POST http://localhost:3000/teams/teams
curl -X POST http://localhost:3000/github/save
```
> Algunos scrapers abren Chromium en modo visible (`headless: false`) para facilitar la depuración.

---

## 🐳 Docker

El backend incluye un `docker-compose.yml` que levanta PostgreSQL 16 y la API, aplicando las migraciones automáticamente:

```bash
cd backend
# Rellena las variables de .env.docker antes de arrancar
docker compose up --build
```

El frontend dispone de un `Dockerfile` multi-stage (build con Node 20 → servido con Nginx).

---

## 🧪 Tests

```bash
# Backend
cd backend
npm run test        # unitarios
npm run test:e2e    # end-to-end
npm run test:cov    # cobertura

# Frontend
cd frontend
npm test
```

---

## ⚙️ CI / Gestión del proyecto

El desarrollo siguió un flujo **Git Flow** (ramas `master`, `develop`, `epic/*`, `feature/*`, `fix/*`) y se gestionó con un tablero de **Trello** sincronizado mediante **GitHub Actions**:

- `trello-sync.yml` — crea una tarjeta en Trello al abrir una issue.
- `move-trello-cards.yml`, `move-review-cards.yml`, `move-done-cards.yml` — mueven las tarjetas según el estado de ramas y pull requests.

---

## 👤 Autor

[@Manuelgruiz](https://github.com/Manuelgruiz)
