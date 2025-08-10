-- PHASE 6: DATABASE CLEANUP QUERIES
-- Removes orphaned data and optimizes storage

-- Remove orphaned service images
DELETE FROM service_images WHERE service_id NOT IN (SELECT id FROM services);

-- Remove orphaned booking records
DELETE FROM bookings WHERE customer_id NOT IN (SELECT id FROM users);
DELETE FROM bookings WHERE provider_id NOT IN (SELECT id FROM users);
DELETE FROM bookings WHERE service_id NOT IN (SELECT id FROM services);

-- Remove orphaned review records
DELETE FROM reviews WHERE customer_id NOT IN (SELECT id FROM users);
DELETE FROM reviews WHERE provider_id NOT IN (SELECT id FROM users);
DELETE FROM reviews WHERE service_id NOT IN (SELECT id FROM services);
DELETE FROM reviews WHERE booking_id NOT IN (SELECT id FROM bookings);

-- Remove orphaned chat messages
DELETE FROM messages WHERE chat_id NOT IN (SELECT id FROM chats);
DELETE FROM messages WHERE sender_id NOT IN (SELECT id FROM users);

-- Remove orphaned notifications
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users);

-- Remove orphaned payments
DELETE FROM payments WHERE booking_id NOT IN (SELECT id FROM bookings);
DELETE FROM payments WHERE customer_id NOT IN (SELECT id FROM users);

-- Update statistics after cleanup
ANALYZE users;
ANALYZE services;
ANALYZE bookings;
ANALYZE reviews;
ANALYZE messages;
ANALYZE notifications;
ANALYZE payments;

-- Database cleanup complete - orphaned data removed
