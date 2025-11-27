-- Create brand_sliders table
CREATE TABLE IF NOT EXISTS public.brand_sliders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_brand_sliders_created_at ON public.brand_sliders(created_at); 