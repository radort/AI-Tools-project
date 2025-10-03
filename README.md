# AI Tools Platform - Full-Stack Starter Kit

A comprehensive full-stack application for managing and discovering AI tools with comments, ratings, and role-based access control.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS (Port 8200)
- **Backend**: Laravel 11 + PHP 8.2 + Nginx (Port 8201)
- **Database**: MySQL 8.0 (Port 8203)
- **Cache**: Redis 7 (Port 8204)
- **Development Tools**: Alpine container (Port 8205)

## ✨ Features

### Core Features
- 🔧 **Tool Management**: Create, edit, and manage AI tools
- ⭐ **Rating System**: 5-star rating system with aggregated scores
- 💬 **Comments System**: Threaded comments with moderation
- 👥 **Role-Based Access**: User roles (Owner, PM, Developer, Designer, Analyst)
- 🏷️ **Categories**: Organize tools by categories
- 🔍 **Search & Filter**: Advanced filtering by category, difficulty, role
- ✅ **Approval Workflow**: Admin approval system for new tools

### Authentication & Security
- 🔐 **Two-Factor Authentication**: TOTP-based 2FA for users and admins
- 🛡️ **Role-Based Permissions**: Fine-grained access control
- 🔑 **API Authentication**: Laravel Sanctum for secure API access
- 📝 **Activity Logging**: Comprehensive audit trail

### Admin Features
- 📊 **Admin Dashboard**: Statistics and management interface
- ✅ **Tool Approval**: Review and approve/reject submitted tools
- 🗑️ **Content Moderation**: Manage comments and user content
- 📈 **Analytics**: Usage statistics and metrics

## 📋 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-tools-platform
   ```

2. **Start the environment:**
   ```bash
   ./start.sh
   ```

3. **Access your applications:**
   - **Frontend**: http://localhost:8200
   - **Backend API**: http://localhost:8201/api
   - **Admin Panel**: http://localhost:8200/admin

4. **Default Admin Credentials:**
   - Email: `admin@example.com`
   - Password: `password`

### First Steps

1. **Create a User Account**: Visit http://localhost:8200/login to register
2. **Add a Tool**: Navigate to "Add Tool" and submit your first AI tool
3. **Admin Approval**: Login to admin panel to approve the tool
4. **Rate and Comment**: Test the rating and comment features

## 🐳 Docker Setup

The application uses Docker Compose for easy development setup:

```yaml
services:
  frontend:    # Next.js (Port 8200)
  backend:     # Nginx reverse proxy (Port 8201)
  php_fpm:     # Laravel PHP-FPM
  mysql:       # MySQL 8.0 (Port 8203)
  redis:       # Redis cache (Port 8204)
  tools:       # Development utilities (Port 8205)
```

### Environment Configuration

The application comes pre-configured for development. Key configuration files:

- **Frontend**: `frontend/.env.local`
- **Backend**: `backend/.env`
- **Docker**: `docker-compose.yml`

## 💻 Development Workflow

### Backend Development (Laravel)

```bash
# Access PHP container
docker compose exec php_fpm sh

# Laravel Artisan commands
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan make:controller ApiController
docker compose exec php_fpm php artisan make:model ToolComment -m

# Composer commands
docker compose exec php_fpm composer install
docker compose exec php_fpm composer require package-name

# Run tests
docker compose exec php_fpm php artisan test

# Clear caches
docker compose exec php_fpm php artisan route:clear
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan cache:clear
```

### Frontend Development (Next.js)

```bash
# Access frontend container
docker compose exec frontend sh

# NPM commands
docker compose exec frontend npm install
docker compose exec frontend npm run build
docker compose exec frontend npm run lint

# View frontend logs
docker compose logs frontend -f
```

### Database Operations

```bash
# Database management script
./db-manage.sh connect    # Connect to MySQL
./db-manage.sh backup     # Create backup
./db-manage.sh redis      # Connect to Redis

# Direct MySQL access
docker compose exec mysql mysql -u root -p<password> <database_name>

# Run migrations
docker compose exec php_fpm php artisan migrate

# Seed database
docker compose exec php_fpm php artisan db:seed
```

## 🛠️ Adding New Tools

### User Workflow

1. **Register/Login**: Create account or login
2. **Navigate to "Add Tool"**: Use the main navigation
3. **Fill Tool Information**:
   - Tool name and description
   - Tool URL (required)
   - Documentation URL (optional)
   - Video tutorial URL (optional)
   - Difficulty level (Beginner/Intermediate/Advanced)
   - Categories (select multiple)
   - Target roles (select multiple)
4. **Submit for Review**: Tool enters "pending" status
5. **Admin Approval**: Admin reviews and approves/rejects
6. **Published**: Approved tools are visible to all users

### Tool Categories

- Development Tools
- Design Tools
- Analytics Tools
- Productivity Tools
- Communication Tools
- Custom categories (admin-configurable)

## 👥 Role System & Permissions

### User Roles

| Role | Permissions |
|------|-------------|
| **Guest** | View approved tools, ratings, comments |
| **User** | All guest permissions + create tools, rate, comment |
| **Admin** | All permissions + approve tools, moderate content |

### Permission Matrix

| Action | Guest | User | Admin |
|--------|-------|------|-------|
| View approved tools | ❌ | ✅ | ✅ |
| View comments/ratings | ❌ | ✅ | ✅ |
| Create account | ❌ | ✅ | ✅ |
| Submit tools | ❌ | ✅ | ✅ |
| Rate tools | ❌ | ✅ | ✅ |
| Comment on tools | ❌ | ✅ | ✅ |
| Edit own content | ❌ | ✅ | ✅ |
| Approve tools | ❌ | ❌ | ✅ |
| Moderate content | ❌ | ❌ | ✅ |
| Access admin panel | ❌ | ❌ | ✅ |

### Role Assignment

- **Default**: New users get "User" role automatically
- **Admin**: Must be assigned manually in database or by existing admin
- **Role-based tool visibility**: Tools can be restricted to specific roles

## 🔐 Security Features

### Authentication
- Email/password authentication
- Two-Factor Authentication (TOTP)
- Password reset functionality
- Account verification

### Authorization
- Laravel Gates and Policies
- Role-based access control
- API token authentication (Sanctum)
- CORS protection

### Data Protection
- Input validation and sanitization
- SQL injection protection
- XSS protection
- CSRF protection
- Rate limiting

## 📊 API Documentation

### Base URL
```
http://localhost:8201/api
```

### Authentication
```bash
# Login
POST /api/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "token": "1|abc123...",
  "user": { ... }
}

# Use token in headers
Authorization: Bearer 1|abc123...
```

### Tools Endpoints

```bash
# Get all tools
GET /api/tools

# Get specific tool
GET /api/tools/{id}

# Create tool (authenticated)
POST /api/tools
{
  "name": "Tool Name",
  "description": "Tool description",
  "url": "https://tool.com",
  "difficulty": "beginner",
  "categories": [1, 2],
  "roles": [1, 3]
}

# Update tool (authenticated, own tools only)
PUT /api/tools/{id}

# Delete tool (authenticated, own tools only)
DELETE /api/tools/{id}
```

### Comments Endpoints

```bash
# Get tool comments
GET /api/tools/{toolId}/comments

# Create comment (authenticated)
POST /api/tools/{toolId}/comments
{
  "content": "This is a great tool!"
}

# Update comment (authenticated, own comments only)
PUT /api/tools/{toolId}/comments/{commentId}

# Delete comment (authenticated, own comments or admin)
DELETE /api/tools/{toolId}/comments/{commentId}
```

### Ratings Endpoints

```bash
# Get tool ratings summary
GET /api/tools/{toolId}/ratings

# Submit/update rating (authenticated)
POST /api/tools/{toolId}/ratings
{
  "value": 5
}

# Get user's rating
GET /api/tools/{toolId}/my-rating

# Delete user's rating
DELETE /api/tools/{toolId}/my-rating
```

## 🧪 Testing

### Backend Tests (PHPUnit)

```bash
# Run all tests
docker compose exec php_fpm php artisan test

# Run specific test file
docker compose exec php_fpm php artisan test tests/Feature/CommentApiTest.php

# Run with coverage
docker compose exec php_fpm php artisan test --coverage
```

### Test Categories

- **Unit Tests**: Model relationships, business logic
- **Feature Tests**: API endpoints, authentication
- **Database Tests**: Migrations, seeders, factories

### Frontend Tests (Jest/React Testing Library)

```bash
# Run frontend tests
docker compose exec frontend npm test

# Run with coverage
docker compose exec frontend npm run test:coverage

# E2E tests (if implemented)
docker compose exec frontend npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
APP_NAME="AI Tools Platform"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8201

DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=ai_tools_app
DB_USERNAME=root
DB_PASSWORD=your_password

REDIS_HOST=redis
REDIS_PORT=6379

FRONTEND_URL=http://localhost:8200
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8201/api
NEXT_PUBLIC_APP_URL=http://localhost:8200
```

### Database Configuration

**MySQL Credentials:**
- Host: `mysql` (internal) / `localhost:8203` (external)
- Database: `ai_tools_app`
- Username: `root`
- Password: As configured in .env

**Redis Configuration:**
- Host: `redis` (internal) / `localhost:8204` (external)
- Password: As configured in .env

## 🚀 Deployment

### Production Checklist

1. **Environment Setup**
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Generate new `APP_KEY`
   - Configure production database
   - Set up SSL certificates

2. **Security Configuration**
   - Update CORS settings
   - Configure rate limiting
   - Set secure session settings
   - Review file permissions

3. **Performance Optimization**
   - Enable caching (`php artisan config:cache`)
   - Optimize autoloader (`composer install --optimize-autoloader`)
   - Configure Redis for sessions/cache
   - Set up queue workers

4. **Monitoring**
   - Configure logging
   - Set up error tracking
   - Monitor database performance
   - Set up backup strategy

### Docker Production

For production deployment, consider:
- Multi-stage Docker builds
- Separate containers for different environments
- Load balancer configuration
- Database replication
- Backup and recovery procedures

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8200

   # Kill process using port
   lsof -ti:8200 | xargs kill -9
   ```

2. **Database Connection Issues**
   ```bash
   # Check container status
   docker compose ps

   # View MySQL logs
   docker compose logs mysql

   # Test connection
   docker compose exec mysql mysql -u root -p
   ```

3. **Permission Issues**
   ```bash
   # Fix Laravel permissions
   ./laravel-setup.sh

   # Reset file permissions
   docker compose exec php_fpm chown -R www-data:www-data storage bootstrap/cache
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear Next.js cache
   docker compose exec frontend rm -rf .next

   # Reinstall dependencies
   docker compose exec frontend rm -rf node_modules
   docker compose exec frontend npm install
   ```

### Useful Commands

```bash
# Check service status
docker compose ps

# View all logs
docker compose logs -f

# Restart specific service
docker compose restart frontend

# Rebuild services
docker compose up -d --build

# Clean up (removes containers and volumes)
docker compose down -v

# Check Laravel logs
docker compose exec php_fpm tail -f storage/logs/laravel.log
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all new frontend code
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline documentation
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [radoslavrt@parketilazur.com](mailto:radoslavrt@parketilazur.com)

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- User authentication and 2FA
- Tool management system
- Comments and ratings
- Admin panel
- Role-based permissions

---

**AI Tools Platform Starter Kit**
**Last Updated**: October 2025
