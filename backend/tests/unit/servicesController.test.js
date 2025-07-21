const request = require('supertest');
const express = require('express');
const servicesController = require('../../src/controllers/servicesController');
const { query } = require('../../src/config/database');
const { authenticate } = require('../../src/middleware/auth');

// Mock database
jest.mock('../../src/config/database');

// Mock authentication middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, user_type: 'provider' };
    next();
  })
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.get('/services', servicesController.getServices);
app.post('/services', authenticate, servicesController.createService);
app.get('/services/:id', servicesController.getServiceById);
app.put('/services/:id', authenticate, servicesController.updateService);
app.delete('/services/:id', authenticate, servicesController.deleteService);

describe('Services Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /services', () => {
    it('should return paginated services list', async () => {
      const mockServices = {
        rows: [
          {
            id: 1,
            title: 'Test Service 1',
            description: 'Test description 1',
            price: 100.00,
            category: 'plumbing',
            user_id: 1,
            provider_name: 'John Doe',
            average_rating: 4.5,
            review_count: 10,
            is_active: true
          },
          {
            id: 2,
            title: 'Test Service 2',
            description: 'Test description 2',
            price: 150.00,
            category: 'electrical',
            user_id: 2,
            provider_name: 'Jane Smith',
            average_rating: 4.8,
            review_count: 15,
            is_active: true
          }
        ]
      };

      query.mockResolvedValueOnce(mockServices);

      const response = await request(app)
        .get('/services')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.services).toHaveLength(2);
      expect(response.body.services[0].title).toBe('Test Service 1');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter services by category', async () => {
      const mockServices = {
        rows: [
          {
            id: 1,
            title: 'Plumbing Service',
            description: 'Test plumbing service',
            price: 100.00,
            category: 'plumbing',
            user_id: 1,
            provider_name: 'John Doe',
            average_rating: 4.5,
            review_count: 10,
            is_active: true
          }
        ]
      };

      query.mockResolvedValueOnce(mockServices);

      const response = await request(app)
        .get('/services')
        .query({ category: 'plumbing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.services).toHaveLength(1);
      expect(response.body.services[0].category).toBe('plumbing');
    });

    it('should filter services by price range', async () => {
      const mockServices = {
        rows: [
          {
            id: 1,
            title: 'Affordable Service',
            description: 'Test affordable service',
            price: 75.00,
            category: 'cleaning',
            user_id: 1,
            provider_name: 'John Doe',
            average_rating: 4.0,
            review_count: 5,
            is_active: true
          }
        ]
      };

      query.mockResolvedValueOnce(mockServices);

      const response = await request(app)
        .get('/services')
        .query({ min_price: 50, max_price: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.services).toHaveLength(1);
      expect(response.body.services[0].price).toBe(75.00);
    });

    it('should search services by title and description', async () => {
      const mockServices = {
        rows: [
          {
            id: 1,
            title: 'Kitchen Repair Service',
            description: 'Professional kitchen appliance repair',
            price: 120.00,
            category: 'repair',
            user_id: 1,
            provider_name: 'John Doe',
            average_rating: 4.7,
            review_count: 8,
            is_active: true
          }
        ]
      };

      query.mockResolvedValueOnce(mockServices);

      const response = await request(app)
        .get('/services')
        .query({ search: 'kitchen' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.services).toHaveLength(1);
      expect(response.body.services[0].title).toContain('Kitchen');
    });

    it('should handle database errors gracefully', async () => {
      query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/services')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Error interno del servidor');
    });
  });

  describe('GET /services/:id', () => {
    it('should return service by ID', async () => {
      const mockService = {
        rows: [
          {
            id: 1,
            title: 'Test Service',
            description: 'Test description',
            price: 100.00,
            category: 'plumbing',
            user_id: 1,
            provider_name: 'John Doe',
            provider_email: 'john@example.com',
            provider_phone: '+1234567890',
            average_rating: 4.5,
            review_count: 10,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      };

      query.mockResolvedValueOnce(mockService);

      const response = await request(app)
        .get('/services/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBeDefined();
      expect(response.body.service.id).toBe(1);
      expect(response.body.service.title).toBe('Test Service');
    });

    it('should return 404 for non-existent service', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/services/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Servicio no encontrado');
    });

    it('should return 400 for invalid service ID', async () => {
      const response = await request(app)
        .get('/services/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ID de servicio inválido');
    });
  });

  describe('POST /services', () => {
    it('should create a new service successfully', async () => {
      const serviceData = {
        title: 'New Service',
        description: 'New service description',
        price: 200.00,
        category: 'electrical',
        duration: 120,
        location: 'Test Location',
        requirements: 'Test requirements'
      };

      const mockCreatedService = {
        rows: [
          {
            id: 1,
            ...serviceData,
            user_id: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      };

      query.mockResolvedValueOnce(mockCreatedService);

      const response = await request(app)
        .post('/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Servicio creado exitosamente');
      expect(response.body.service).toBeDefined();
      expect(response.body.service.title).toBe(serviceData.title);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        title: 'New Service'
        // Missing required fields
      };

      const response = await request(app)
        .post('/services')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    it('should return 400 for invalid price', async () => {
      const serviceData = {
        title: 'New Service',
        description: 'New service description',
        price: -50, // Invalid negative price
        category: 'electrical',
        duration: 120,
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/services')
        .send(serviceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('precio debe ser mayor a 0');
    });
  });

  describe('PUT /services/:id', () => {
    it('should update service successfully', async () => {
      const updateData = {
        title: 'Updated Service',
        description: 'Updated description',
        price: 250.00
      };

      // Mock service exists and belongs to user
      query
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, user_id: 1, title: 'Original Service' }] 
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              ...updateData,
              user_id: 1,
              category: 'electrical',
              duration: 120,
              location: 'Test Location',
              is_active: true,
              updated_at: new Date()
            }
          ]
        });

      const response = await request(app)
        .put('/services/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Servicio actualizado exitosamente');
      expect(response.body.service.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent service', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/services/999')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Servicio no encontrado');
    });

    it('should return 403 if user does not own the service', async () => {
      // Mock service exists but belongs to different user
      query.mockResolvedValueOnce({ 
        rows: [{ id: 1, user_id: 2, title: 'Other User Service' }] 
      });

      const response = await request(app)
        .put('/services/1')
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No tienes permisos');
    });
  });

  describe('DELETE /services/:id', () => {
    it('should delete service successfully', async () => {
      // Mock service exists and belongs to user
      query
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, user_id: 1, title: 'Service to Delete' }] 
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/services/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Servicio eliminado exitosamente');
    });

    it('should return 404 for non-existent service', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/services/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Servicio no encontrado');
    });

    it('should return 403 if user does not own the service', async () => {
      // Mock service exists but belongs to different user
      query.mockResolvedValueOnce({ 
        rows: [{ id: 1, user_id: 2, title: 'Other User Service' }] 
      });

      const response = await request(app)
        .delete('/services/1')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No tienes permisos');
    });
  });
});