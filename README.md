# Emotion Sense

Emotion Sense is a TypeScript monorepo for real-time facial and voice emotion telemetry. The project combines a React-based frontend, an Express API, shared generated client and schema packages, and a Drizzle-backed persistence layer for storing emotion detection history and aggregate statistics.I made this with the help of Replit.app.

Live deployment: [emotion-sense--jaadarsh143.replit.app](https://emotion-sense--jaadarsh143.replit.app/)

## Overview

The application exposes two primary user flows:

- Facial emotion capture and classification from image input
- Voice emotion capture and classification from audio input

Detection results are persisted as telemetry records and surfaced through a dashboard and history view. The frontend consumes the backend through generated API bindings, keeping request and response types aligned across the workspace.

## Architecture

This repository is organized as a `pnpm` workspace:

```text
.
|-- artifacts/
|   |-- emotion-sense/      # React + Vite frontend
|   |-- api-server/         # Express 5 API server
|   `-- mockup-sandbox/     # UI sandbox workspace
|-- lib/
|   |-- api-client-react/   # Generated React API client
|   |-- api-spec/           # OpenAPI source and codegen config
|   |-- api-zod/            # Generated Zod schemas and DTOs
|   `-- db/                 # Drizzle ORM database layer
|-- scripts/                # Workspace scripts
`-- package.json            # Root workspace commands
```

## Technical Stack

- Language: TypeScript 5.9
- Runtime: Node.js 24
- Package management: `pnpm` workspaces
- Frontend: React, Vite, Wouter, TanStack Query, Tailwind CSS
- Backend: Express 5, Zod, Pino
- Data layer: PostgreSQL, Drizzle ORM
- API contract: OpenAPI with generated client and validation packages

## Key Features

- Real-time face emotion detection workflow
- Real-time voice emotion detection workflow
- Persisted emotion telemetry records
- Session-level summary statistics for dominant face and voice signals
- Historical log view for the most recent detections
- Shared typed API surface between frontend and backend

## Repository Components

### Frontend

The frontend application lives in `artifacts/emotion-sense`. It provides:

- A dashboard view with live face and voice capture panels
- Session statistics and recent detection activity
- A historical archive page backed by the API
- React Query-based data fetching using the generated workspace client

### API Server

The backend lives in `artifacts/api-server`. It exposes endpoints for:

- `POST /detect-face`
- `POST /detect-voice`
- `GET /emotion-logs`
- `GET /emotion-stats`

Request and response validation is enforced through shared Zod schemas generated from the API contract.

### Shared Libraries

- `lib/api-spec` defines the API contract and code generation configuration
- `lib/api-client-react` provides generated client bindings for the frontend
- `lib/api-zod` provides generated DTO and schema types for runtime validation
- `lib/db` contains the Drizzle schema and database integration

## Local Development

### Prerequisites

- Node.js 24
- `pnpm`
- PostgreSQL for the API/database workflow

### Install Dependencies

```bash
pnpm install
```

### Workspace Validation

```bash
pnpm run typecheck
pnpm run build
```

### Run the Frontend

```bash
pnpm --filter @workspace/emotion-sense run dev
```

### Run the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

### Regenerate API Artifacts

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Notes on Detection Logic

The current API implementation derives emotion classifications from deterministic transformations of submitted image and audio payloads. This provides a stable end-to-end development flow for UI, transport, validation, and persistence without requiring an external inference service in the current repository state.


## License

MIT
