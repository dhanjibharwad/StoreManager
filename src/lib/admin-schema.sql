-- Admin credentials tables for different admin roles

-- Table for superadmin credentials
CREATE TABLE superadmin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for rental admin credentials
CREATE TABLE rentaladmin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for event admin credentials
CREATE TABLE eventadmin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for ecommerce admin credentials
CREATE TABLE ecomadmin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_superadmin_credentials_user_id ON superadmin_credentials(user_id);
CREATE INDEX idx_rentaladmin_credentials_user_id ON rentaladmin_credentials(user_id);
CREATE INDEX idx_eventadmin_credentials_user_id ON eventadmin_credentials(user_id);
CREATE INDEX idx_ecomadmin_credentials_user_id ON ecomadmin_credentials(user_id);

-- Add triggers to automatically update the updated_at column
CREATE TRIGGER update_superadmin_credentials_updated_at
BEFORE UPDATE ON superadmin_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentaladmin_credentials_updated_at
BEFORE UPDATE ON rentaladmin_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventadmin_credentials_updated_at
BEFORE UPDATE ON eventadmin_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecomadmin_credentials_updated_at
BEFORE UPDATE ON ecomadmin_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 