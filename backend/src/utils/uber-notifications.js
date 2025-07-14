const { pool } = require('../config/database');

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Check if current time is within AS quiet hours
const isWithinQuietHours = (quietStart, quietEnd) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  
  const quietStartMinutes = parseInt(quietStart.split(':')[0]) * 60 + parseInt(quietStart.split(':')[1]);
  const quietEndMinutes = parseInt(quietEnd.split(':')[0]) * 60 + parseInt(quietEnd.split(':')[1]);
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (quietStartMinutes > quietEndMinutes) {
    return currentTime >= quietStartMinutes || currentTime <= quietEndMinutes;
  } else {
    return currentTime >= quietStartMinutes && currentTime <= quietEndMinutes;
  }
};

// Find available AS professionals for a service request (UBER-style matching)
const findAvailableAS = async (categoryId, locationLat, locationLng, urgency = 'medium') => {
  try {
    // Get all AS professionals who work in this category
    const [availableAS] = await pool.execute(`
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.phone, u.email,
        u.subscription_type, u.verification_status,
        awc.category_id, awc.subcategory,
        awl.locality, awl.travel_radius,
        ans.notification_radius, ans.quiet_hours_start, ans.quiet_hours_end,
        ans.push_new_requests, ans.email_new_requests, ans.sms_urgent_requests,
        (SELECT AVG(rating) FROM reviews WHERE provider_id = u.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE provider_id = u.id) as total_reviews
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      LEFT JOIN as_work_locations awl ON u.id = awl.user_id
      LEFT JOIN as_notification_settings ans ON u.id = ans.user_id
      WHERE u.user_type = 'provider' 
        AND u.subscription_type IN ('basic', 'premium')
        AND u.verification_status = 'verified'
        AND awc.category_id = ?
        AND awc.is_active = TRUE
        AND awl.is_active = TRUE
    `, [categoryId]);

    const eligibleAS = [];

    for (const as of availableAS) {
      // Check if AS is within notification radius
      if (locationLat && locationLng && as.locality) {
        // For now, we'll use a simple radius check
        // In production, you'd want to geocode the locality to get lat/lng
        const notificationRadius = as.notification_radius || 10; // Default 10km
        
        // Skip distance check for now if we don't have AS location coordinates
        // In production, implement proper geocoding
      }

      // Check quiet hours
      if (as.quiet_hours_start && as.quiet_hours_end) {
        if (isWithinQuietHours(as.quiet_hours_start, as.quiet_hours_end)) {
          // Only notify during quiet hours for emergency requests
          if (urgency !== 'emergency') {
            continue;
          }
        }
      }

      // Check notification preferences
      const shouldNotify = as.push_new_requests || 
                          as.email_new_requests || 
                          (urgency === 'emergency' && as.sms_urgent_requests);

      if (shouldNotify) {
        eligibleAS.push({
          ...as,
          priority_score: calculatePriorityScore(as, urgency)
        });
      }
    }

    // Sort by priority score (highest first)
    eligibleAS.sort((a, b) => b.priority_score - a.priority_score);

    return eligibleAS;

  } catch (error) {
    console.error('Error finding available AS:', error);
    return [];
  }
};

// Calculate priority score for AS ranking
const calculatePriorityScore = (as, urgency) => {
  let score = 0;

  // Rating factor (40% weight)
  if (as.avg_rating && as.total_reviews > 0) {
    score += (as.avg_rating / 5) * 40;
  }

  // Subscription factor (30% weight)
  const subscriptionWeight = { premium: 30, basic: 20, free: 5 };
  score += subscriptionWeight[as.subscription_type] || 0;

  // Experience factor (20% weight) - based on review count
  if (as.total_reviews > 0) {
    const experienceScore = Math.min(as.total_reviews / 10, 1) * 20; // Max 20 points for 10+ reviews
    score += experienceScore;
  }

  // Urgency factor (10% weight)
  const urgencyWeight = { emergency: 10, high: 7, medium: 5, low: 3 };
  score += urgencyWeight[urgency] || 5;

  return score;
};

// Send notifications to AS professionals (UBER-style)
const notifyAvailableAS = async (serviceRequest, io) => {
  try {
    const { category_id, location_lat, location_lng, urgency, id: requestId } = serviceRequest;
    
    const availableAS = await findAvailableAS(category_id, location_lat, location_lng, urgency);

    console.log(`Found ${availableAS.length} available AS for request ${requestId}`);

    for (const as of availableAS) {
      // Send real-time notification via Socket.IO
      if (as.push_new_requests && io) {
        io.to(`user_${as.id}`).emit('new_service_request', {
          request_id: requestId,
          title: serviceRequest.title,
          description: serviceRequest.description,
          urgency: urgency,
          location: serviceRequest.location_address,
          budget: `${serviceRequest.budget_min} - ${serviceRequest.budget_max} ARS`,
          expires_at: serviceRequest.expiry_date,
          client_rating: serviceRequest.client_rating || null
        });
      }

      // Send email notification
      if (as.email_new_requests) {
        // TODO: Implement email notification
        console.log(`Sending email notification to AS ${as.id}`);
      }

      // Send SMS for urgent requests
      if (urgency === 'emergency' && as.sms_urgent_requests) {
        // TODO: Implement SMS notification
        console.log(`Sending SMS notification to AS ${as.id}`);
      }

      // Log notification in database
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, data, created_at)
        VALUES (?, 'service_request', ?, ?, ?, NOW())
      `, [
        as.id,
        'Nueva solicitud de servicio',
        `${serviceRequest.title} - ${urgency.toUpperCase()}`,
        JSON.stringify({
          request_id: requestId,
          category_id: category_id,
          urgency: urgency,
          location: serviceRequest.location_address
        })
      ]);
    }

    return availableAS.length;

  } catch (error) {
    console.error('Error notifying available AS:', error);
    return 0;
  }
};

// Create service request and notify AS (main function)
const createServiceRequestWithNotifications = async (requestData, io) => {
  try {
    // Calculate expiry date based on urgency
    const expiryHours = { emergency: 1, high: 4, medium: 24, low: 48 };
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + (expiryHours[requestData.urgency] || 24));

    // Insert service request
    const [result] = await pool.execute(`
      INSERT INTO service_requests (
        client_id, provider_id, category_id, title, description,
        location_address, location_lat, location_lng,
        preferred_date, preferred_time, budget_min, budget_max,
        urgency, expiry_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      requestData.client_id,
      requestData.provider_id || null, // null for broadcast requests
      requestData.category_id,
      requestData.title,
      requestData.description,
      requestData.location_address,
      requestData.location_lat,
      requestData.location_lng,
      requestData.preferred_date,
      requestData.preferred_time,
      requestData.budget_min,
      requestData.budget_max,
      requestData.urgency,
      expiryDate
    ]);

    const requestId = result.insertId;

    // If it's a broadcast request (no specific provider), notify all available AS
    if (!requestData.provider_id) {
      const serviceRequest = {
        ...requestData,
        id: requestId,
        expiry_date: expiryDate
      };

      const notifiedCount = await notifyAvailableAS(serviceRequest, io);
      
      console.log(`Service request ${requestId} created and ${notifiedCount} AS notified`);
      
      return { requestId, notifiedCount };
    }

    return { requestId, notifiedCount: 1 }; // Direct request to specific AS

  } catch (error) {
    console.error('Error creating service request with notifications:', error);
    throw error;
  }
};

module.exports = {
  findAvailableAS,
  notifyAvailableAS,
  createServiceRequestWithNotifications,
  calculateDistance,
  isWithinQuietHours
};