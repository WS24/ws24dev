# TaskFlow Pro - Web Development Services Platform

## Overview

TaskFlow Pro is a full-stack web application that connects clients with web development specialists. The platform facilitates project task creation, evaluation, payment processing, and project management through a modern, responsive interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **API Pattern**: RESTful endpoints with JSON responses

### Database Design
- **ORM**: Drizzle with TypeScript-first schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon PostgreSQL via connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Storage**: PostgreSQL sessions table (mandatory for Replit Auth)
- **User Management**: Role-based access (client/specialist)
- **Security**: Secure HTTP-only cookies with session expiration

### Task Management
- **Task Lifecycle**: Created → Evaluating → Evaluated → Paid → In Progress → Completed
- **Role Separation**: Clients create tasks, specialists evaluate and execute
- **Evaluation System**: Cost estimation with hourly rate calculations
- **Status Tracking**: Real-time updates and notifications

### User Interface
- **Design System**: Consistent UI using shadcn/ui components
- **Responsive**: Mobile-first design with Tailwind CSS
- **Navigation**: Fixed header with role-based sidebar navigation
- **Forms**: Validated forms with real-time feedback
- **Notifications**: Toast notifications for user feedback

### Data Storage
- **Users**: Profile information, roles, and authentication data
- **Tasks**: Project details, status, assignments, and metadata
- **Evaluations**: Cost estimates and specialist assessments
- **Payments**: Transaction tracking and status management
- **Updates**: Activity logs and communication history

## Data Flow

1. **User Authentication**: OIDC flow with Replit → Session creation → Role-based routing
2. **Task Creation**: Client fills form → Validation → Database storage → Specialist notification
3. **Task Evaluation**: Specialist reviews → Cost calculation → Evaluation submission → Client notification
4. **Task Execution**: Client accepts → Payment processing → Status updates → Progress tracking
5. **Real-time Updates**: Database changes → Query invalidation → UI refresh

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service
- **UI Components**: Radix UI primitives via shadcn/ui
- **Validation**: Zod schema validation
- **Date Handling**: date-fns for date operations

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast production builds
- **PostCSS**: CSS processing with Tailwind
- **Vite Plugins**: Runtime error overlay and development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds client-side assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served by Express in production

### Environment Configuration
- **Development**: Vite dev server with HMR and Express API
- **Production**: Single Express server serving both API and static assets
- **Database**: Environment-based connection string configuration

### Production Serving
- **Static Assets**: Express serves built frontend from `dist/public`
- **API Routes**: Express handles `/api/*` requests
- **Fallback**: SPA routing handled by serving `index.html`

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. MySQL backup integration completed:
  * Added new database entities from MySQL backup (announcements, knowledge_articles, knowledge_categories, ticket_categories, ticket_replies, custom_fields, user_custom_fields, ticket_files)
  * Created Knowledge Base system with categories and articles
  * Implemented Announcements system for service updates
  * Added comprehensive admin panel with task management interface matching original design
  * Extended storage layer with full CRUD operations for new entities
  * Added frontend components for Knowledge Base and Announcements
  * Updated navigation with Resources section
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```