-- PHASE 5: NAMING CONVENTION STANDARDIZATION
-- Standardizes cliente/customer vs client naming across database

-- Note: These are ALTER TABLE statements that should be executed carefully
-- Review each statement before execution in production

-- Standardize user_type values (if needed)
-- UPDATE users SET user_type = 'client' WHERE user_type = 'customer';
-- UPDATE users SET user_type = 'client' WHERE user_type = 'cliente';

-- Update views to use consistent terminology
CREATE OR REPLACE VIEW user_types_standardized AS
SELECT 
    id,
    first_name,
    last_name,
    email,
    CASE 
        WHEN user_type = 'customer' THEN 'client'
        WHEN user_type = 'cliente' THEN 'client'
        ELSE user_type
    END as user_type,
    is_active,
    created_at
FROM users;

-- Create function to standardize user type display
CREATE OR REPLACE FUNCTION standardize_user_type(input_type VARCHAR(20))
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE 
        WHEN input_type IN ('customer', 'cliente') THEN 'client'
        ELSE input_type
    END;
END;
$$ LANGUAGE plpgsql;

-- Naming standardization complete - consistent terminology achieved
