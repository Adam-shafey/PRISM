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

### Airtable/Attio-Style Table Layout (July 25, 2025)
- **Table View Component**: Created comprehensive IdeasTable component with sortable columns and inline editing
- **View Toggle**: Added Grid/Table view switcher in dashboard with visual toggle buttons
- **Inline Editing**: Implemented click-to-edit functionality for all idea fields (title, status, category, owner, reach, description)
- **Dropdown Selectors**: Added dropdown menus for status, category, and owner assignments with real-time updates
- **Professional Design**: Zebra-striped rows, hover effects, and Airtable-like visual styling with sort indicators

### Team Management & Role-Based Permissions (July 25, 2025)
- **Database Schema**: Extended schema with teams, roles, and teamMemberships tables including relations
- **Permission System**: Created comprehensive permission constants and role definitions (Administrator, Product Manager, Contributor, Viewer)
- **Team Management UI**: Built teams page with team cards, member management, and role assignment interfaces
- **Role Management**: Implemented system roles and custom role creation with granular permissions
- **Access Control**: Prepared framework for enforcing permissions across all modules (Ideas, Insights, Validation, Prioritization)
- **UI Improvements**: Converted roles from card grid to professional list view format with table headers and zebra-striped rows

### Feature Wiki Module (July 25, 2025)
- **Database Schema**: Created comprehensive features, feature_versions, and feature_comments tables with full relations
- **Feature Management**: Built complete CRUD operations for features with versioning and change tracking
- **Grid/Table View**: Implemented dual view modes matching Ideas module with professional table layout and inline editing
- **Detail Modal**: Created comprehensive feature detail modal with tabbed interface (Overview, Details, Versions, Comments)
- **Comment System**: Added fully functional commenting system with user attribution and timestamps
- **Search & Filtering**: Implemented search functionality and status-based filtering (All, Active, Draft, Deprecated, Archived)
- **Version History**: Automatic version tracking with change notes and historical data preservation
- **API Integration**: Complete RESTful API endpoints for features, versions, and comments with proper validation
- **Modules Integration**: Added support for feature modules (groups of features) with visual distinctions using blue coloring and package icons

### PRISM Product Suite (July 25, 2025)
- **Product Switcher**: Created dropdown header component for switching between Discovery and Planning products
- **Permission System**: Extended user schema with separate permission arrays for each product (discoveryPermissions, planningPermissions)
- **Product Architecture**: Defined product configurations and permission constants for both Discovery and Planning
- **Planning Product**: Built initial Planning product with Roadmap and Stories modules
- **Dynamic Navigation**: Sidebar navigation adapts based on current product context with different menu items
- **Access Control**: Product switcher only shows products the user has permissions to access