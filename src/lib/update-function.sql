-- Function to update a rental property directly
CREATE OR REPLACE FUNCTION update_rental_property(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_furnishing TEXT,
  p_property_type TEXT,
  p_kitchen INTEGER,
  p_bathrooms INTEGER,
  p_tenants INTEGER,
  p_rooms INTEGER,
  p_balcony INTEGER,
  p_tenant_type TEXT,
  p_city TEXT,
  p_pincode TEXT,
  p_house_number TEXT,
  p_country TEXT,
  p_room_size DECIMAL,
  p_available_from DATE,
  p_available_to DATE,
  p_rent DECIMAL,
  p_deposit DECIMAL,
  p_liability_insurance TEXT,
  p_household_insurance TEXT,
  p_mobile TEXT,
  p_whatsapp TEXT,
  p_street TEXT,
  p_media_urls TEXT[],
  p_additional TEXT[],
  p_rent_duration TEXT[]
)
RETURNS SETOF rental_properties
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE rental_properties
  SET 
    title = p_title,
    description = p_description,
    furnishing = p_furnishing,
    property_type = p_property_type,
    kitchen = p_kitchen,
    bathrooms = p_bathrooms,
    tenants = p_tenants,
    rooms = p_rooms,
    balcony = p_balcony,
    tenant_type = p_tenant_type,
    city = p_city,
    pincode = p_pincode,
    house_number = p_house_number,
    country = p_country,
    room_size = p_room_size,
    available_from = p_available_from,
    available_to = p_available_to,
    rent = p_rent,
    deposit = p_deposit,
    liability_insurance = p_liability_insurance,
    household_insurance = p_household_insurance,
    mobile = p_mobile,
    whatsapp = p_whatsapp,
    street = p_street,
    media_urls = p_media_urls,
    additional = p_additional,
    rent_duration = p_rent_duration,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING *;
END;
$$;

-- Simple function to update just the title
CREATE OR REPLACE FUNCTION update_rental_property_title(
  property_id UUID,
  new_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE rental_properties
  SET title = new_title
  WHERE id = property_id;
END;
$$;

-- Function that takes JSON data for direct update
CREATE OR REPLACE FUNCTION update_property_direct(
  p_id UUID,
  p_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE rental_properties
  SET 
    title = p_data->>'title',
    description = p_data->>'description',
    furnishing = p_data->>'furnishing',
    property_type = p_data->>'property_type',
    kitchen = (p_data->>'kitchen')::INTEGER,
    bathrooms = (p_data->>'bathrooms')::INTEGER,
    tenants = (p_data->>'tenants')::INTEGER,
    rooms = (p_data->>'rooms')::INTEGER,
    balcony = (p_data->>'balcony')::INTEGER,
    tenant_type = p_data->>'tenant_type',
    city = p_data->>'city',
    pincode = p_data->>'pincode',
    house_number = p_data->>'house_number',
    country = p_data->>'country',
    room_size = (p_data->>'room_size')::DECIMAL,
    available_from = (p_data->>'available_from')::DATE,
    available_to = (p_data->>'available_to')::DATE,
    rent = (p_data->>'rent')::DECIMAL,
    deposit = (p_data->>'deposit')::DECIMAL,
    liability_insurance = p_data->>'liability_insurance',
    household_insurance = p_data->>'household_insurance',
    mobile = p_data->>'mobile',
    whatsapp = p_data->>'whatsapp',
    street = p_data->>'street',
    media_urls = COALESCE((p_data->'media_urls')::TEXT[]::TEXT[], '{}'),
    additional = COALESCE((p_data->'additional')::TEXT[]::TEXT[], '{}'),
    rent_duration = COALESCE((p_data->'rent_duration')::TEXT[]::TEXT[], '{}'),
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Function to execute raw SQL (use with caution!)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Direct SQL update function for title
CREATE OR REPLACE FUNCTION direct_title_update(property_id UUID, new_title TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use raw SQL to bypass any potential triggers or policies
  EXECUTE 'UPDATE rental_properties SET title = $1, updated_at = NOW() WHERE id = $2'
  USING new_title, property_id;
  
  -- Return true if a row was affected
  RETURN FOUND;
END;
$$;

-- Function to check for RLS policies
CREATE OR REPLACE FUNCTION check_rls_policies(table_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'table_name', tablename,
    'policy_name', policyname,
    'roles', roles,
    'cmd', cmd,
    'qual', qual,
    'with_check', with_check
  ))
  INTO result
  FROM pg_policies
  WHERE tablename = table_name;
  
  RETURN result;
END;
$$;

-- Transaction-based update function
CREATE OR REPLACE FUNCTION update_with_transaction(p_id UUID, p_title TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Start a transaction
  BEGIN
    -- Verify ownership
    PERFORM 1 FROM rental_properties WHERE id = p_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Property not found or not owned by user';
    END IF;
    
    -- Perform the update
    UPDATE rental_properties
    SET title = p_title, updated_at = NOW()
    WHERE id = p_id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Commit the transaction
    RETURN affected_rows > 0;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error
    RAISE NOTICE 'Error in transaction: %', SQLERRM;
    RETURN FALSE;
  END;
END;
$$;

-- Complete update function
CREATE OR REPLACE FUNCTION update_complete_property(
  p_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_furnishing TEXT,
  p_property_type TEXT,
  p_kitchen INTEGER,
  p_bathrooms INTEGER,
  p_tenants INTEGER,
  p_rooms INTEGER,
  p_balcony INTEGER,
  p_tenant_type TEXT,
  p_city TEXT,
  p_pincode TEXT,
  p_house_number TEXT,
  p_country TEXT,
  p_room_size DECIMAL,
  p_available_from DATE,
  p_available_to DATE,
  p_rent DECIMAL,
  p_deposit DECIMAL,
  p_liability_insurance TEXT,
  p_household_insurance TEXT,
  p_mobile TEXT,
  p_whatsapp TEXT,
  p_street TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  updated_row rental_properties%ROWTYPE;
BEGIN
  -- Verify ownership
  PERFORM 1 FROM rental_properties WHERE id = p_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found or not owned by user';
  END IF;
  
  -- Update the property
  UPDATE rental_properties
  SET 
    title = p_title,
    description = p_description,
    furnishing = p_furnishing,
    property_type = p_property_type,
    kitchen = p_kitchen,
    bathrooms = p_bathrooms,
    tenants = p_tenants,
    rooms = p_rooms,
    balcony = p_balcony,
    tenant_type = p_tenant_type,
    city = p_city,
    pincode = p_pincode,
    house_number = p_house_number,
    country = p_country,
    room_size = p_room_size,
    available_from = p_available_from,
    available_to = p_available_to,
    rent = p_rent,
    deposit = p_deposit,
    liability_insurance = p_liability_insurance,
    household_insurance = p_household_insurance,
    mobile = p_mobile,
    whatsapp = p_whatsapp,
    street = p_street,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO updated_row;
  
  -- Convert the row to JSON
  SELECT row_to_json(updated_row)::jsonb INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role TEXT DEFAULT 'user';

-- Add constraint to validate role values
ALTER TABLE users
ADD CONSTRAINT check_user_role 
CHECK (role IN ('user', 'superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'));

-- Comment on the role column
COMMENT ON COLUMN users.role IS 'User role for access control (user, superadmin, rentaladmin, eventadmin, ecomadmin)';

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Add auto_deletion_config table
CREATE TABLE IF NOT EXISTS auto_deletion_config (
  post_type TEXT PRIMARY KEY,
  deletion_days INTEGER NOT NULL CHECK (deletion_days IN (30, 45, 60, 90)),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add a comment to explain the table's purpose
COMMENT ON TABLE auto_deletion_config IS 'Stores configuration for automatic deletion of posts based on their age';

-- Optional: Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auto_deletion_config_modtime
BEFORE UPDATE ON auto_deletion_config
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
