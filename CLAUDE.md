# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nerón Inventory is a fee tracking system (sistema de tracking de honorarios) for managing clients and their employees. Built with Next.js 16 and React 19, it tracks monthly fees and payment statuses for accounting/administrative purposes.

The application is entirely in Spanish (UI text, comments, variable names in domain logic).

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Data Layer

**Storage**: Uses Firebase Firestore for cloud persistence. The storage service in `src/lib/storage-firestore.ts` abstracts all CRUD operations. The original localStorage implementation (`src/lib/storage.ts`) is preserved for reference/rollback. All storage operations are async and return Promises.

**Core Types** (`src/lib/types.ts`):
- `Client`: Has name, CUIT (Argentine tax ID), ARCA password, contact info, monthly fee records, and an array of `Employee`s
- `Employee`: Nested under clients, has similar structure but no employees of its own
- `MonthlyRecords`: Year-keyed object containing month-keyed records with amount and paid status

**Fee Propagation Logic** (`src/lib/honorarios-logic.ts`): When displaying fees for a month without an explicit record, the system looks back to find the most recent recorded amount. This allows setting a fee once and having it apply to future months until changed.

**Firebase Configuration** (`src/lib/firebase.ts`): Initializes Firebase app and exports Firestore instance. Requires environment variables in `.env.local` (see `.env.local.example`). The storage adapter includes a 5-second cache to minimize Firestore reads.

**Firestore Schema**:
- Collection: `clients` - Each document represents a Client with nested employees and monthlyRecords as maps/arrays
- Document structure matches the Client type exactly (see `FIRESTORE_DESIGN.md` for details)

### State Management

The `useClients` hook (`src/hooks/useClients.ts`) is the central state manager. All components consume this hook rather than accessing storage directly. It provides reactive state and all async CRUD operations for clients, employees, and their monthly records.

### AI Integration

**Gemini Chat** (`src/components/GeminiChat.tsx`): A floating chat interface powered by Google Gemini 2.5 Flash. The chat fetches all clients data from Firestore and sends it as context in the system instruction, allowing the AI to answer questions about clients, payments, and fees. API route: `/api/chat/route.ts`.

### Pages (App Router)

- `/` - Main fee tracking table with month selector, search, and debtor filter
- `/tareas` - Task management with drag-and-drop client selection and free-form text editor
- `/ganancias` - Placeholder "coming soon" page for future earnings analytics

### Component Patterns

- Uses styled-jsx for component-scoped CSS (no CSS modules or Tailwind classes in markup)
- Tailwind is configured but primarily used through CSS variables defined in `globals.css`
- Animations via Framer Motion
- Icons via Lucide React

### Key Domain Terms

- **Honorario**: Fee/payment amount
- **CUIT**: Argentine tax identification number (format: XX-XXXXXXXX-X)
- **ARCA**: Argentine tax authority (formerly AFIP) - the arcaPassword field stores credentials
- **Deudor**: Debtor (unpaid client/employee)
