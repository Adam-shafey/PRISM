# PRISM Product Discovery App

## Overview

PRISM is a comprehensive product discovery platform designed to centralize insights from various sources, facilitate structured problem validation, and enable intelligent analysis and data-driven decision-making early in the product development process. The application helps product teams capture, validate, and prioritize product ideas and problems through a structured workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management

### Key Components

#### Database Schema
The application uses a relational PostgreSQL schema with the following main entities:
- **Users**: Product managers, designers, engineers, and stakeholders
- **Categories**: Organizational groupings for ideas (Growth, Retention, UX Improvement, New Market)
- **Ideas**: Core entity representing product ideas or problems with status tracking
- **Hypotheses**: Testable assumptions linked to ideas with validation tracking
- **Insights**: Research data, files, and notes supporting ideas
- **Comments**: Collaborative discussions on ideas
- **Activities**: Audit trail of changes and interactions

#### API Structure
RESTful API endpoints organized by resource:
- `/api/ideas` - CRUD operations for ideas with filtering and search
- `/api/hypotheses` - Hypothesis management linked to ideas
- `/api/insights` - Research data and file attachments
- `/api/comments` - Discussion threads
- `/api/categories` - Organizational categories
- `/api/users` - User management

#### Frontend Pages
- **Dashboard**: Main view with idea grid, filtering, and quick statistics
- **Idea Detail**: Comprehensive view of individual ideas with hypotheses, insights, and comments
- **Not Found**: 404 error handling

### Data Flow

1. **Idea Creation**: Users create ideas through a modal form with AI-assisted categorization and tagging
2. **Problem Validation**: Ideas progress through status workflow (New → In Discovery → Validated/Rejected → Prioritized → In Planning)
3. **Hypothesis Testing**: Teams add testable hypotheses with validation metrics and experiment tracking
4. **Insight Aggregation**: Research data, user feedback, and analytics are linked to ideas for validation
5. **Collaborative Review**: Comments and activities provide audit trail and team collaboration
6. **Prioritization**: RICE scoring framework (Reach, Impact, Confidence, Effort) for objective prioritization

### External Dependencies

#### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Extensive Radix UI component library for accessibility
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Date Handling**: date-fns for consistent date formatting and manipulation

#### Development Tools
- **Type Safety**: TypeScript throughout the stack with shared types
- **Linting/Formatting**: ESM modules with strict TypeScript configuration
- **Development**: Hot reload with Vite dev server and runtime error overlay

### Deployment Strategy

#### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server running concurrently for API endpoints
- PostgreSQL database integration with Drizzle ORM for data persistence
- Replit-specific plugins for development environment integration

#### Production Build
- Vite builds frontend to `dist/public` directory
- esbuild bundles backend server with external package resolution
- Environment-based configuration for database connections
- Static file serving for production deployment

#### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in shared TypeScript files
- Environment variable configuration for database URL
- PostgreSQL dialect with connection pooling support

The architecture emphasizes type safety, developer experience, and scalable data modeling to support the product discovery workflow from idea capture through validation and prioritization.

## Recent Changes

### Database Integration (July 24, 2025)
- **Added PostgreSQL Integration**: Successfully migrated from in-memory storage to PostgreSQL database using Neon serverless
- **Implemented Drizzle Relations**: Added comprehensive table relations for all entities (users, ideas, categories, hypotheses, insights, comments, activities)
- **Created DatabaseStorage Class**: Replaced MemStorage with database-backed storage implementation using Drizzle ORM
- **Schema Push**: Successfully deployed database schema with `npm run db:push`
- **Seed Data**: Added initial users (Sarah Chen, Mike Johnson, Emily Davis) and categories (Growth, Retention, UX Improvement, New Market)
- **Type Safety**: Fixed all TypeScript errors in database integration ensuring type compatibility between Drizzle schema and application types