-- ==============================================================================
-- ANAGI STORES (අනගි ස්ටෝර්ස්) — Phase 2 Supabase PostgreSQL Database Schema
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. GRAINS TABLE (ධාන්‍ය වර්ග සහ මිල ගණන්)
CREATE TABLE IF NOT EXISTS public.grains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_sinhala TEXT NOT NULL,
    name_english TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('PADDY', 'CEREALS', 'PULSES', 'OILSEEDS', 'SPICES', 'OTHER')),
    category_sinhala TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'කි.ග්‍රෑ. 1ක් සඳහා',
    is_buying BOOLEAN NOT NULL DEFAULT true,
    status_label_sinhala TEXT NOT NULL DEFAULT 'දැනට මිලදී ගනී',
    last_updated TEXT NOT NULL DEFAULT 'අද යාවත්කාලීන විය',
    min_quantity_kg NUMERIC(10, 2) NOT NULL DEFAULT 10,
    grade_description_sinhala TEXT DEFAULT 'තෙතමනය 14% ට අඩු, පිරිසිදු තත්ත්වය',
    trend TEXT DEFAULT 'STABLE' CHECK (trend IN ('UP', 'DOWN', 'STABLE')),
    trend_value NUMERIC(10, 2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    notes_sinhala TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SELL REQUESTS TABLE (පාරිභෝගික ධාන්‍ය අලෙවි ඉල්ලීම්)
CREATE TABLE IF NOT EXISTS public.sell_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    grain_id UUID REFERENCES public.grains(id) ON DELETE SET NULL,
    grain_name_sinhala TEXT NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estimated_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    area TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. HOME PICKUP REQUESTS TABLE (විශාල තොග නිවසටම පැමිණ රැගෙන යාමේ ඉල්ලීම්)
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    grain_id UUID REFERENCES public.grains(id) ON DELETE SET NULL,
    grain_name_sinhala TEXT NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg >= 100),
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CONTACT MESSAGES TABLE (විමසීම් සහ පණිවිඩ)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT DEFAULT 'සාමාන්‍ය විමසීමක්',
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.grains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- GRAINS POLICIES:
-- Public can read all grains (pricing & availability).
-- Authenticated users (Admin) can insert, update, or delete grains.
-- ------------------------------------------------------------------------------
CREATE POLICY "Public grains are viewable by everyone" 
ON public.grains FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert grains" 
ON public.grains FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update grains" 
ON public.grains FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete grains" 
ON public.grains FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- SELL REQUESTS POLICIES:
-- Anyone (anonymous customer) can submit a sell request.
-- Only Authenticated users (Admin) can view, update or delete sell requests.
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can submit sell request" 
ON public.sell_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view sell requests" 
ON public.sell_requests FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can update sell requests" 
ON public.sell_requests FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Only admins can delete sell requests" 
ON public.sell_requests FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- PICKUP REQUESTS POLICIES:
-- Anyone can submit a bulk pickup request.
-- Only Authenticated users (Admin) can view, update or delete pickup requests.
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can submit pickup request" 
ON public.pickup_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view pickup requests" 
ON public.pickup_requests FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can update pickup requests" 
ON public.pickup_requests FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Only admins can delete pickup requests" 
ON public.pickup_requests FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- CONTACT MESSAGES POLICIES:
-- Anyone can submit contact messages.
-- Only Admins can view/update contact messages.
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" 
ON public.contact_messages FOR SELECT 
TO authenticated 
USING (true);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grains_updated_at
BEFORE UPDATE ON public.grains
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sell_requests_updated_at
BEFORE UPDATE ON public.sell_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pickup_requests_updated_at
BEFORE UPDATE ON public.pickup_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
