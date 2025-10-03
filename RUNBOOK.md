# AI Tools Management System - Runbook

This document provides step-by-step instructions to set up and run the AI Tools Management System.

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Setup Instructions

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd full-stack-starter-kit
```

### 2. Backend Setup

#### Install Dependencies
```bash
# Dependencies are already installed via Docker, but if you need to add more:
docker compose exec php_fpm composer install
```

#### Environment Configuration
The `.env` file should already be configured, but verify these key settings:
```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=user
DB_PASSWORD=password
```

#### Run Migrations and Seeders
```bash
# Run all migrations (including spatie permissions)
docker compose exec php_fpm php artisan migrate

# Run seeders to populate initial data
docker compose exec php_fpm php artisan db:seed
```

This will create:
- **Roles**: owner, pm, developer, designer, analyst
- **Categories**: Development Tools, AI & Machine Learning, Design & UI/UX, Data & Analytics, Productivity, DevOps & Infrastructure
- **Users**: Various test users with different roles

### 3. Frontend Setup

#### Install Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies (if not already done)
npm install
```

### 4. Start the Application

```bash
# From the root directory, start all services
docker compose up -d

# Or use the npm script for development
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:8201
- **MySQL**: localhost:8203
- **Redis**: localhost:8204

## Test Credentials

Use these credentials to test different user roles:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Owner | owner@example.com | password123 | Create tools, edit/delete own tools |
| PM | pm@example.com | password123 | Create tools, edit/delete own tools |
| Developer | developer@example.com | password123 | Create tools, edit/delete own tools |
| Designer | designer@example.com | password123 | Create tools, edit/delete own tools |
| Analyst | analyst@example.com | password123 | Create tools, edit/delete own tools |

**Note**: All users currently have the same permissions. The role field is maintained for future admin panel implementation.

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Tools Management
- `GET /api/tools` - List all tools (with filtering)
  - Query parameters: `category`, `role`, `difficulty`, `search`, `page`
- `POST /api/tools` - Create new tool (owner/pm only)
- `GET /api/tools/{id}` - Get tool details
- `PUT /api/tools/{id}` - Update tool (owner/pm or creator)
- `DELETE /api/tools/{id}` - Delete tool (owner/pm or creator)

### Categories Management
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category (owner/pm only)
- `GET /api/categories/{id}` - Get category details

## Frontend Features

### Pages Available

1. **Home Page** (`/`)
   - Welcome page with user info
   - Navigation to tools section

2. **Login Page** (`/login`)
   - User authentication
   - Test credentials provided

3. **Tools List** (`/tools`)
   - View all tools with filtering
   - Filter by category, role, difficulty
   - Search functionality
   - Pagination

4. **Add New Tool** (`/tools/new`)
   - Create new tools (owner/pm only)
   - Multi-select categories and roles
   - Form validation

5. **Tool Details** (`/tools/[id]`)
   - View tool information
   - Edit/delete tools (if authorized)
   - Links to tool, documentation, videos

### Authorization System

The application implements a simple permission system where all users have equal access:

- **View Tools**: All authenticated users
- **Create Tools**: All authenticated users
- **Edit Tools**: Tool creator only
- **Delete Tools**: Tool creator only
- **Admin Panel**: Separate admin system (to be implemented) for managing all tools

## Database Schema

### Key Tables

- `users` - User accounts with roles
- `categories` - Tool categories
- `tools` - AI tools with metadata
- `tool_category` - Many-to-many: tools ↔ categories
- `tool_role` - Many-to-many: tools ↔ roles
- `roles` - Spatie permission roles
- `permissions` - Spatie permissions

### Tool Fields

- `name` - Tool name
- `description` - Tool description
- `url` - Main tool URL
- `docs_url` - Documentation URL (optional)
- `video_url` - Video tutorial URL (optional)
- `difficulty` - beginner, intermediate, advanced
- `created_by` - User who created the tool

## Development Commands

### Backend (Laravel)

```bash
# Run migrations
docker compose exec php_fpm php artisan migrate

# Run seeders
docker compose exec php_fpm php artisan db:seed

# Clear cache
docker compose exec php_fpm php artisan cache:clear

# Run tests (if you add them)
docker compose exec php_fpm php artisan test

# Generate API documentation (if you add swagger)
docker compose exec php_fpm php artisan l5-swagger:generate
```

### Frontend (Next.js)

```bash
# Install new dependencies
npm install <package-name>

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL container is running: `docker compose ps`
   - Check database credentials in `.env`
   - Run: `docker compose restart mysql`

2. **Permission Denied Errors**
   - Ensure Laravel has write permissions: `docker compose exec php_fpm chown -R www-data:www-data storage bootstrap/cache`

3. **Frontend API Calls Failing**
   - Verify backend is running on port 8201
   - Check browser console for CORS errors
   - Ensure user is authenticated (check localStorage for token)

4. **Migrations Fail**
   - Drop all tables and re-run: `docker compose exec php_fpm php artisan migrate:fresh --seed`

### Logs

```bash
# Backend logs
docker compose logs php_fpm

# Frontend logs
docker compose logs frontend

# Database logs
docker compose logs mysql
```

## Production Deployment

For production deployment, you'll need to:

1. Update environment variables for production
2. Use a production database (not Docker MySQL)
3. Configure proper SSL certificates
4. Set up proper session and cache storage
5. Configure email services for password resets
6. Set up proper backup strategies

## Security Considerations

- All API endpoints require authentication except login
- Role-based authorization prevents unauthorized actions
- Input validation on both frontend and backend
- SQL injection protection via Eloquent ORM
- XSS protection via proper output escaping
- CSRF protection for API calls

## Data Model

The system allows:
- **Tools** can belong to multiple **Categories**
- **Tools** can be targeted for multiple **Roles**
- **Users** can create multiple **Tools**
- **Categories** and **Roles** are managed by admins (owner/pm)

This flexible structure allows for complex filtering and organization of AI tools based on use case and target audience.