-- Create custom users table for username-only authentication
CREATE TABLE public.custom_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  mobile_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;

-- Custom users policies - allow all operations for authenticated users
CREATE POLICY "Custom users are viewable by everyone" 
ON public.custom_users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own account" 
ON public.custom_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own account" 
ON public.custom_users 
FOR UPDATE 
USING (true);

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Using a simple hash function for demo purposes
  -- In production, use a proper password hashing library
  RETURN encode(digest(password || 'salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash_password(password) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to authenticate user
CREATE OR REPLACE FUNCTION public.authenticate_user(username TEXT, password TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  mobile_number TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cu.id,
    cu.username,
    cu.mobile_number,
    cu.display_name,
    cu.created_at
  FROM public.custom_users cu
  WHERE cu.username = authenticate_user.username 
    AND verify_password(authenticate_user.password, cu.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register user
CREATE OR REPLACE FUNCTION public.register_user(
  username TEXT,
  password TEXT,
  mobile_number TEXT,
  display_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  mobile_number TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.custom_users WHERE custom_users.username = register_user.username) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  -- Check if mobile number already exists
  IF EXISTS (SELECT 1 FROM public.custom_users WHERE custom_users.mobile_number = register_user.mobile_number) THEN
    RAISE EXCEPTION 'Mobile number already exists';
  END IF;
  
  -- Insert new user
  INSERT INTO public.custom_users (username, password_hash, mobile_number, display_name)
  VALUES (register_user.username, hash_password(register_user.password), register_user.mobile_number, register_user.display_name);
  
  -- Return the created user
  RETURN QUERY
  SELECT 
    cu.id,
    cu.username,
    cu.mobile_number,
    cu.display_name,
    cu.created_at
  FROM public.custom_users cu
  WHERE cu.username = register_user.username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_users_updated_at
  BEFORE UPDATE ON public.custom_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_custom_users_username ON public.custom_users(username);
CREATE INDEX idx_custom_users_mobile_number ON public.custom_users(mobile_number);
