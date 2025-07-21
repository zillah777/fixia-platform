// Try to require Swagger modules, gracefully handle if not available
let swaggerJsdoc, swaggerUi;
try {
  swaggerJsdoc = require('swagger-jsdoc');
  swaggerUi = require('swagger-ui-express');
} catch (error) {
  console.warn('Swagger modules not available, API documentation disabled:', error.message);
  swaggerJsdoc = null;
  swaggerUi = null;
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fixia API',
      version: '1.0.0',
      description: 'API documentation for Fixia - Service marketplace platform for Chubut, Argentina',
      contact: {
        name: 'Fixia Support',
        email: 'contact@fixia.com.ar',
        url: 'https://fixia.com.ar'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.fixia.com.ar' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      },
      {
        url: 'https://staging-api.fixia.com.ar',
        description: 'Staging server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            first_name: {
              type: 'string',
              example: 'Juan'
            },
            last_name: {
              type: 'string',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com'
            },
            user_type: {
              type: 'string',
              enum: ['provider', 'client'],
              example: 'provider'
            },
            phone: {
              type: 'string',
              example: '+54 280 1234567'
            },
            location: {
              type: 'string',
              example: 'Comodoro Rivadavia, Chubut'
            },
            profile_image: {
              type: 'string',
              example: 'https://example.com/profile.jpg'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: 'Limpieza de hogar'
            },
            description: {
              type: 'string',
              example: 'Servicio completo de limpieza para el hogar'
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 2500.00
            },
            category: {
              type: 'string',
              example: 'Limpieza'
            },
            duration: {
              type: 'integer',
              example: 120,
              description: 'Duration in minutes'
            },
            location: {
              type: 'string',
              example: 'Comodoro Rivadavia'
            },
            provider_id: {
              type: 'integer',
              example: 1
            },
            provider: {
              $ref: '#/components/schemas/User'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['https://example.com/service1.jpg']
            },
            rating: {
              type: 'number',
              format: 'decimal',
              example: 4.5
            },
            review_count: {
              type: 'integer',
              example: 25
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ServiceRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            service_id: {
              type: 'integer',
              example: 1
            },
            client_id: {
              type: 'integer',
              example: 2
            },
            provider_id: {
              type: 'integer',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
              example: 'pending'
            },
            scheduled_date: {
              type: 'string',
              format: 'date-time'
            },
            message: {
              type: 'string',
              example: 'Necesito el servicio para el próximo fin de semana'
            },
            total_amount: {
              type: 'number',
              format: 'decimal',
              example: 2500.00
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 50
            },
            total_pages: {
              type: 'integer',
              example: 5
            },
            has_next_page: {
              type: 'boolean',
              example: true
            },
            has_prev_page: {
              type: 'boolean',
              example: false
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Services',
        description: 'Service management and discovery'
      },
      {
        name: 'Service Requests',
        description: 'Service booking and management'
      },
      {
        name: 'Users',
        description: 'User profile management'
      },
      {
        name: 'Categories',
        description: 'Service categories'
      },
      {
        name: 'Reviews',
        description: 'Service reviews and ratings'
      },
      {
        name: 'Chat',
        description: 'Real-time messaging between users'
      },
      {
        name: 'Notifications',
        description: 'User notifications management'
      },
      {
        name: 'Health',
        description: 'API health and monitoring endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './server.js'
  ]
};

// Generate specs and options only if Swagger is available
let specs, swaggerOptions;

if (swaggerJsdoc && swaggerUi) {
  specs = swaggerJsdoc(options);
  
  swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
    `,
    customSiteTitle: 'Fixia API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        req.headers['Accept'] = 'application/json';
        return req;
      }
    }
  };
} else {
  // Fallback when Swagger is not available
  specs = null;
  swaggerOptions = null;
}

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions,
  isAvailable: !!(swaggerJsdoc && swaggerUi)
};