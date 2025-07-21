# Fixia API Documentation

## Overview

Fixia is a comprehensive service marketplace platform designed specifically for Chubut, Argentina. This REST API powers both provider (AS - Agentes de Servicios) and client (Exploradores) functionality, enabling seamless service discovery, booking, and management.

## 🚀 Quick Start

### Base URLs
- **Production**: `https://api.fixia.com.ar`
- **Staging**: `https://staging-api.fixia.com.ar`
- **Development**: `http://localhost:5000`

### Interactive Documentation
- **Swagger UI**: `/api-docs`
- **OpenAPI Spec**: `/api-docs/swagger.json`

## 🔐 Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer your-jwt-token-here
```

### Obtaining a Token
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use the returned `token` for authenticated requests

## 📋 Core Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Services
- `GET /api/services` - List services with filters
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create new service (providers only)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/categories/list` - Get service categories

### Service Requests & Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create service request
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Users & Profiles
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `GET /api/professionals` - List service providers

### Reviews & Ratings
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/service/:serviceId` - Get service reviews

### Real-time Chat
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message
- WebSocket connection for real-time messaging

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🏷️ User Types

### Providers (AS - Agentes de Servicios)
- Can create and manage services
- Receive service requests from clients
- Manage bookings and availability
- Access to analytics and reports

### Clients (Exploradores)
- Browse and search services
- Request services from providers
- Leave reviews and ratings
- Manage booking history

## 🔍 Search & Filtering

### Service Search Parameters
- `category` - Filter by service category
- `location` - Filter by location
- `min_price` / `max_price` - Price range
- `search` - Text search in title/description
- `page` / `limit` - Pagination

### Advanced Features
- Smart search with relevance scoring
- Geolocation-based results
- Category-based filtering
- Price range filtering

## 📊 Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

## 📁 File Uploads

### Service Images
- Endpoint: `POST /api/services` (with multipart/form-data)
- Supported formats: JPEG, JPG, PNG, WebP
- Max file size: 10MB
- Multiple images supported

### Profile Images
- Endpoint: `PUT /api/auth/profile` (with multipart/form-data)
- Same format restrictions as service images

## ⚡ Caching

The API implements Redis-based caching for improved performance:

- Service lists cached for 15 minutes
- Service details cached for 1 hour
- User profiles cached for 30 minutes
- Categories cached for 24 hours

Cache headers include `X-Cache-Status` indicating HIT/MISS.

## 🔒 Security Features

### Rate Limiting
- 100 requests per 15-minute window per IP
- Higher limits for authenticated users
- Special limits for sensitive operations

### Security Headers
- CORS protection
- XSS protection
- CSRF protection
- Content type validation
- File upload validation

### Data Validation
- Input sanitization
- SQL injection prevention
- Email format validation
- Password strength requirements

## 📈 Monitoring & Observability

### Health Check
- `GET /health` - Service health status
- Returns uptime, version, and system status

### Error Tracking
- Sentry integration for error monitoring
- Structured logging with Winston
- Performance monitoring

## 🌐 Localization

### Supported Regions
- Primary: Chubut Province, Argentina
- Cities: Comodoro Rivadavia, Puerto Madryn, Trelew, Esquel
- Language: Spanish (Argentina)
- Currency: Argentine Peso (ARS)

### Location Data
- `GET /api/localities` - Get supported localities
- Geolocation support for service discovery

## 📱 Real-time Features

### WebSocket Events
- `connect` - User connects to chat
- `join_chat` - Join specific chat room
- `send_message` - Send message
- `new_message` - Receive message
- `disconnect` - User disconnects

### Notifications
- Real-time push notifications
- Email notifications for important events
- In-app notification system

## 🧪 Testing

### Test Data
- Use `/api/test-email` for email testing
- Sandbox mode available for payments
- Test user accounts for development

### Example Requests

#### Register User
```bash
curl -X POST https://api.fixia.com.ar/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "user_type": "provider",
    "location": "Comodoro Rivadavia"
  }'
```

#### Search Services
```bash
curl "https://api.fixia.com.ar/api/services?category=Limpieza&location=Comodoro Rivadavia&page=1&limit=10"
```

#### Create Service (requires auth)
```bash
curl -X POST https://api.fixia.com.ar/api/services \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Limpieza de hogar",
    "description": "Servicio completo de limpieza",
    "price": 2500,
    "category": "Limpieza",
    "duration": 120,
    "location": "Comodoro Rivadavia"
  }'
```

## 🐛 Error Handling

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Rate Limited
- `500` - Internal Server Error

## 📞 Support

For API support and questions:
- Email: dev@fixia.com.ar
- Documentation: https://docs.fixia.com.ar
- Status Page: https://status.fixia.com.ar

## 📝 Changelog

### v1.0.0
- Initial API release
- User authentication and profiles
- Service management
- Booking system
- Chat functionality
- Review system
- Real-time notifications

---

*Last updated: July 2025*