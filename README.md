# WS24 Dev - Web Development Services Platform

A comprehensive helpdesk platform for web development services that provides advanced task management, specialist evaluation, and integrated billing solutions.

## 🏗️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries and configurations
│   │   └── utils/          # Helper functions and utilities
├── server/                 # Express.js backend application
│   ├── db.ts              # Database connection and configuration
│   ├── storage.ts         # Data access layer and storage interface
│   ├── routes.ts          # API route definitions and handlers
│   ├── replitAuth.ts      # Authentication middleware and setup
│   └── index.ts           # Server entry point and configuration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and TypeScript types
└── components.json        # shadcn/ui component configuration
```

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **API Pattern**: RESTful endpoints with JSON responses

### Database
- **ORM**: Drizzle with TypeScript-first schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon PostgreSQL via connection pooling

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Replit environment with proper environment variables

## 🔧 Setup Instructions

### 1. Environment Configuration

Create environment variables in your Replit secrets:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.replit.app
ISSUER_URL=https://replit.com/oidc
```

### 2. Database Setup

The application uses Drizzle ORM with PostgreSQL. Database tables are automatically created through schema definitions.

```bash
# Push schema to database
npm run db:push
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏛️ Architecture Overview

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Storage**: PostgreSQL sessions table (mandatory for Replit Auth)
- **User Management**: Role-based access (client/specialist/admin)
- **Security**: Secure HTTP-only cookies with session expiration

### Task Management Workflow
1. **Created**: Client creates new task with requirements
2. **Evaluating**: Specialist reviews and estimates cost
3. **Evaluated**: Cost estimate provided to client
4. **Paid**: Client accepts and payment is processed
5. **In Progress**: Specialist begins work
6. **Completed**: Task finished and delivered

### Data Flow
1. **Authentication**: OIDC flow → Session creation → Role-based routing
2. **Task Creation**: Form validation → Database storage → Notifications
3. **Task Evaluation**: Cost calculation → Evaluation submission → Client notification
4. **Task Execution**: Payment processing → Status updates → Progress tracking

## 📊 Key Features

### User Management
- Role-based access control (Client, Specialist, Admin)
- Profile management with custom fields
- User authentication via Replit Auth

### Task Management
- Comprehensive task creation and tracking
- Specialist evaluation system with cost estimation
- Real-time status updates and notifications
- File attachments and communication history

### Billing & Finance
- Integrated payment processing
- Transaction tracking and reporting
- Financial analytics and statistics
- Revenue and expense management

### Analytics Dashboard
- Task performance metrics
- Revenue analysis and trends
- User activity statistics
- Exportable reports with date filtering

### Knowledge Base
- Categorized articles and documentation
- Search functionality
- View tracking and analytics
- Admin content management

### System Administration
- Comprehensive admin panel
- User management and role assignment
- System settings configuration
- Announcement management

## 🔒 Security Features

- Input validation using Zod schemas
- Parameterized database queries via Drizzle ORM
- Session-based authentication with secure cookies
- Role-based access control
- Environment variable configuration
- Error handling without stack trace exposure

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### UI Audit
Run the automated UI audit script in browser console:
```javascript
// Navigate to the application and run in DevTools console
// Script available at: client/src/utils/uiAudit.js
```

## 📚 API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user information
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout and clear session

### Task Management
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `GET /api/tasks/:id/evaluations` - Get task evaluations

### Admin Operations
- `GET /api/admin/stats` - Administrative statistics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/:id/role` - Update user role

### Analytics
- `GET /api/analytics` - General analytics data
- `GET /api/analytics/tasks` - Task-specific metrics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/users` - User activity metrics

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Ensure all required environment variables are set:
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID`
- `REPLIT_DOMAINS`

### Deployment Checklist
- ✅ All environment variables configured
- ✅ Database schema deployed
- ✅ SSL certificates configured
- ✅ Error monitoring setup
- ✅ Performance monitoring enabled

## 📈 Performance Considerations

- React Query for efficient data fetching and caching
- Component-based architecture for optimal re-renders
- Database connection pooling
- Optimized PostgreSQL queries with proper indexing
- Static asset optimization via Vite

## 🔍 Monitoring & Logging

- Server request logging via Morgan
- Error tracking and reporting
- Performance metrics collection
- User activity analytics
- Security event monitoring

## 🤝 Contributing

1. Follow TypeScript strict mode requirements
2. Use ESLint and Prettier for code formatting
3. Write unit tests for new features
4. Document all functions with JSDoc
5. Follow the established architecture patterns

## 📄 License

This project is proprietary software for TaskFlow Pro platform.

## 📞 Support

For technical support and documentation, refer to the Knowledge Base within the application or contact the development team.