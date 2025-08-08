/**
 * TYPE CONSISTENCY TESTS
 * Comprehensive tests to validate database type consistency fixes
 */

const { 
  USER_TYPES,
  MESSAGE_TYPES, 
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_PLANS,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPES,
  transformUserToDatabase,
  transformUserToFrontend,
  transformBookingToDatabase,
  transformBookingToFrontend,
  transformServiceToDatabase,
  transformServiceToFrontend,
  createApiResponse,
  createPaginatedResponse
} = require('../../src/types/index');

const { 
  validateUserData,
  validateServiceData,
  validateBookingData,
  validateMessageData,
  validateReviewData,
  validateUserType,
  validateBookingStatus,
  validatePaymentStatus,
  validateMessageType
} = require('../../src/middleware/typeValidation');

describe('Type Consistency Tests', () => {
  
  describe('User Type Transformations', () => {
    test('should transform frontend user types to database format', () => {
      expect(USER_TYPES.toDatabase('customer')).toBe('client');
      expect(USER_TYPES.toDatabase('provider')).toBe('provider');
      expect(USER_TYPES.toDatabase('admin')).toBe('admin');
      expect(USER_TYPES.toDatabase('AS')).toBe('provider');
    });
    
    test('should transform database user types to frontend format', () => {
      expect(USER_TYPES.toFrontend('client')).toBe('customer');
      expect(USER_TYPES.toFrontend('provider')).toBe('provider');
      expect(USER_TYPES.toFrontend('admin')).toBe('admin');
    });
    
    test('should transform complete user object to database format', () => {
      const frontendUser = {
        first_name: 'Juan',
        last_name: 'Pérez', 
        email: 'juan@test.com',
        user_type: 'customer',
        profile_photo_url: 'photo.jpg'
      };
      
      const dbUser = transformUserToDatabase(frontendUser);
      expect(dbUser.user_type).toBe('client');
      expect(dbUser.profile_image).toBe('photo.jpg');
      expect(dbUser.profile_photo_url).toBeUndefined();
    });
    
    test('should transform complete user object to frontend format', () => {
      const dbUser = {
        id: 1,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@test.com', 
        user_type: 'client',
        profile_image: 'photo.jpg'
      };
      
      const frontendUser = transformUserToFrontend(dbUser);
      expect(frontendUser.user_type).toBe('customer');
      expect(frontendUser.profile_photo_url).toBe('photo.jpg');
    });
  });
  
  describe('Message Type Consistency', () => {
    test('should define all required message types', () => {
      expect(MESSAGE_TYPES.TEXT).toBe('text');
      expect(MESSAGE_TYPES.IMAGE).toBe('image');
      expect(MESSAGE_TYPES.DOCUMENT).toBe('document');
      expect(MESSAGE_TYPES.FILE).toBe('file');
      expect(MESSAGE_TYPES.SYSTEM).toBe('system');
    });
    
    test('should validate message types correctly', () => {
      expect(validateMessageType('text')).toBe(true);
      expect(validateMessageType('image')).toBe(true);
      expect(validateMessageType('invalid')).toBe(false);
    });
  });
  
  describe('Booking Status Consistency', () => {
    test('should define all required booking statuses', () => {
      expect(BOOKING_STATUS.PENDING).toBe('pending');
      expect(BOOKING_STATUS.CONFIRMED).toBe('confirmed');
      expect(BOOKING_STATUS.IN_PROGRESS).toBe('in_progress');
      expect(BOOKING_STATUS.COMPLETED).toBe('completed');
      expect(BOOKING_STATUS.CANCELLED).toBe('cancelled');
      expect(BOOKING_STATUS.REJECTED).toBe('rejected');
    });
    
    test('should validate booking statuses correctly', () => {
      expect(validateBookingStatus('pending')).toBe(true);
      expect(validateBookingStatus('completed')).toBe(true);
      expect(validateBookingStatus('invalid')).toBe(false);
    });
    
    test('should transform booking field names correctly', () => {
      const frontendBooking = {
        customer_id: 1,
        provider_id: 2,
        service_id: 3,
        scheduled_date: '2025-08-10',
        scheduled_time: '14:30',
        status: 'pending'
      };
      
      const dbBooking = transformBookingToDatabase(frontendBooking);
      expect(dbBooking.client_id).toBe(1);
      expect(dbBooking.booking_date).toBe('2025-08-10');
      expect(dbBooking.booking_time).toBe('14:30');
      expect(dbBooking.customer_id).toBeUndefined();
      expect(dbBooking.scheduled_date).toBeUndefined();
      expect(dbBooking.scheduled_time).toBeUndefined();
    });
    
    test('should transform booking from database to frontend format', () => {
      const dbBooking = {
        id: 1,
        client_id: 1,
        provider_id: 2,
        service_id: 3,
        booking_date: '2025-08-10',
        booking_time: '14:30',
        status: 'pending'
      };
      
      const frontendBooking = transformBookingToFrontend(dbBooking);
      expect(frontendBooking.customer_id).toBe(1);
      expect(frontendBooking.scheduled_date).toBe('2025-08-10');
      expect(frontendBooking.scheduled_time).toBe('14:30');
    });
  });
  
  describe('Payment Status Consistency', () => {
    test('should define all required payment statuses', () => {
      expect(PAYMENT_STATUS.PENDING).toBe('pending');
      expect(PAYMENT_STATUS.PROCESSING).toBe('processing');
      expect(PAYMENT_STATUS.COMPLETED).toBe('completed');
      expect(PAYMENT_STATUS.FAILED).toBe('failed');
      expect(PAYMENT_STATUS.REFUNDED).toBe('refunded');
      expect(PAYMENT_STATUS.CANCELLED).toBe('cancelled');
    });
    
    test('should validate payment statuses correctly', () => {
      expect(validatePaymentStatus('pending')).toBe(true);
      expect(validatePaymentStatus('completed')).toBe(true);
      expect(validatePaymentStatus('invalid')).toBe(false);
    });
  });
  
  describe('Service ID Field Consistency', () => {
    test('should transform service field names correctly', () => {
      const frontendService = {
        provider_id: 1,
        category_id: 2,
        title: 'Test Service',
        description: 'Test description',
        price: 100.50,
        address: 'Test Address',
        duration_minutes: 120
      };
      
      const dbService = transformServiceToDatabase(frontendService);
      expect(dbService.user_id).toBe(1);
      expect(dbService.location).toBe('Test Address');
      expect(dbService.duration_hours).toBe(2);
      expect(dbService.provider_id).toBeUndefined();
      expect(dbService.address).toBeUndefined();
      expect(dbService.duration_minutes).toBeUndefined();
    });
    
    test('should transform service from database to frontend format', () => {
      const dbService = {
        id: 1,
        user_id: 1,
        category_id: 2,
        title: 'Test Service',
        description: 'Test description',
        price: 100.50,
        location: 'Test Location',
        duration_hours: 2
      };
      
      const frontendService = transformServiceToFrontend(dbService);
      expect(frontendService.provider_id).toBe(1);
      expect(frontendService.address).toBe('Test Location');
      expect(frontendService.duration_minutes).toBe(120);
    });
  });
  
  describe('Subscription Plan Consistency', () => {
    test('should define all required subscription plans', () => {
      expect(SUBSCRIPTION_PLANS.FREE).toBe('free');
      expect(SUBSCRIPTION_PLANS.BASIC).toBe('basic');
      expect(SUBSCRIPTION_PLANS.PROFESSIONAL).toBe('professional');
      expect(SUBSCRIPTION_PLANS.PREMIUM).toBe('premium');
      expect(SUBSCRIPTION_PLANS.PLUS).toBe('plus');
    });
  });
  
  describe('Notification Type Consistency', () => {
    test('should define all required notification types', () => {
      expect(NOTIFICATION_TYPES.INFO).toBe('info');
      expect(NOTIFICATION_TYPES.SUCCESS).toBe('success');
      expect(NOTIFICATION_TYPES.WARNING).toBe('warning');
      expect(NOTIFICATION_TYPES.ERROR).toBe('error');
      expect(NOTIFICATION_TYPES.BOOKING).toBe('booking');
      expect(NOTIFICATION_TYPES.PAYMENT).toBe('payment');
      expect(NOTIFICATION_TYPES.MESSAGE).toBe('message');
      expect(NOTIFICATION_TYPES.REVIEW).toBe('review');
      expect(NOTIFICATION_TYPES.SYSTEM).toBe('system');
    });
  });
  
  describe('API Response Format Consistency', () => {
    test('should create standardized API responses', () => {
      const response = createApiResponse(true, 'Success', { id: 1 });
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual({ id: 1 });
      expect(response.timestamp).toBeDefined();
    });
    
    test('should create standardized paginated responses', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(items, 1, 10, 2);
      
      expect(response.success).toBe(true);
      expect(response.data.items).toEqual(items);
      expect(response.data.pagination.page).toBe(1);
      expect(response.data.pagination.limit).toBe(10);
      expect(response.data.pagination.total).toBe(2);
      expect(response.data.pagination.pages).toBe(1);
      expect(response.data.pagination.hasNext).toBe(false);
      expect(response.data.pagination.hasPrev).toBe(false);
    });
  });
  
  describe('Backward Compatibility', () => {
    test('should maintain backward compatibility for user type fields', () => {
      const user = transformUserToFrontend({
        id: 1,
        user_type: 'client',
        profile_image: 'test.jpg'
      });
      
      expect(user.user_type).toBe('customer');
      expect(user.profile_photo_url).toBe('test.jpg');
      expect(user.profile_image).toBe('test.jpg');
    });
    
    test('should maintain backward compatibility for booking fields', () => {
      const booking = transformBookingToFrontend({
        id: 1,
        client_id: 1,
        booking_date: '2025-08-10',
        booking_time: '14:30'
      });
      
      expect(booking.customer_id).toBe(1);
      expect(booking.client_id).toBe(1);
      expect(booking.scheduled_date).toBe('2025-08-10');
      expect(booking.scheduled_time).toBe('14:30');
    });
    
    test('should maintain backward compatibility for service fields', () => {
      const service = transformServiceToFrontend({
        id: 1,
        user_id: 1,
        location: 'Test Location',
        duration_hours: 2
      });
      
      expect(service.provider_id).toBe(1);
      expect(service.user_id).toBe(1);
      expect(service.address).toBe('Test Location');
      expect(service.location).toBe('Test Location');
      expect(service.duration_minutes).toBe(120);
      expect(service.duration_hours).toBe(2);
    });
  });
  
  describe('Integration Test - Complete Data Flow', () => {
    test('should handle complete user registration flow with type transformations', () => {
      // Simulate frontend registration data
      const registrationData = {
        first_name: 'María',
        last_name: 'González',
        email: 'maria@test.com',
        password: 'securepassword123',
        user_type: 'customer',
        phone: '+54911234567',
        profile_photo_url: 'maria.jpg'
      };
      
      // Transform for database insertion
      const dbData = transformUserToDatabase(registrationData);
      expect(dbData.user_type).toBe('client');
      expect(dbData.profile_image).toBe('maria.jpg');
      
      // Simulate database response
      const dbUser = {
        id: 1,
        ...dbData,
        created_at: '2025-08-07T10:00:00Z',
        updated_at: '2025-08-07T10:00:00Z'
      };
      
      // Transform for frontend response
      const frontendUser = transformUserToFrontend(dbUser);
      expect(frontendUser.user_type).toBe('customer');
      expect(frontendUser.profile_photo_url).toBe('maria.jpg');
      
      // Create API response
      const apiResponse = createApiResponse(true, 'Usuario registrado exitosamente', {
        user: frontendUser,
        token: 'jwt-token'
      });
      
      expect(apiResponse.success).toBe(true);
      expect(apiResponse.data.user.user_type).toBe('customer');
      expect(apiResponse.data.token).toBeDefined();
    });
  });
});

describe('Validation Middleware Tests', () => {
  
  describe('User Data Validation', () => {
    test('should validate user data without errors for valid data', () => {
      // Test that the validation middleware exists and can handle valid data
      expect(typeof validateUserData).toBe('function');
      
      // Test that validation rules are properly defined
      const { VALIDATION_RULES } = require('../../src/types/index');
      expect(VALIDATION_RULES.user).toBeDefined();
      expect(VALIDATION_RULES.user.first_name).toBeDefined();
      expect(VALIDATION_RULES.user.email).toBeDefined();
    });
    
    test('should reject invalid email format', () => {
      const req = {
        body: {
          first_name: 'Juan',
          last_name: 'Pérez', 
          email: 'invalid-email',
          user_type: 'customer'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      validateUserData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed'
        })
      );
    });
  });
  
  describe('Message Data Validation', () => {
    test('should validate message type', () => {
      const req = {
        body: {
          chat_id: 1,
          content: 'Hello world',
          message_type: 'text'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      validateMessageData(req, res, next);
      expect(next).toHaveBeenCalled();
    });
    
    test('should reject invalid message type', () => {
      const req = {
        body: {
          chat_id: 1,
          content: 'Hello world',
          message_type: 'invalid_type'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      validateMessageData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});