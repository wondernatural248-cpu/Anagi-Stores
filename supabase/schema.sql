-- ==============================================================================
-- ANAGI STORES (අනගි ස්ටෝර්ස්) — PostgreSQL Database Schema + Stock & Billing System
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. GRAINS TABLE (ධාන්‍ය වර්ග, මිල ගණන් සහ තොග මට්ටම්)
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
    current_stock_kg NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_stock_kg >= 0),
    min_stock_level_kg NUMERIC(12, 2) NOT NULL DEFAULT 100 CHECK (min_stock_level_kg >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safely add stock columns if table already exists in existing database
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'grains' AND column_name = 'current_stock_kg') THEN
        ALTER TABLE public.grains ADD COLUMN current_stock_kg NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_stock_kg >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'grains' AND column_name = 'min_stock_level_kg') THEN
        ALTER TABLE public.grains ADD COLUMN min_stock_level_kg NUMERIC(12, 2) NOT NULL DEFAULT 100 CHECK (min_stock_level_kg >= 0);
    END IF;
END $$;

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

-- 6. BILLS TABLE (ඇතුළත් කළ / පිටතට නිකුත් කළ බිල්පත්)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number TEXT NOT NULL UNIQUE,
    bill_type TEXT NOT NULL CHECK (bill_type IN ('INCOMING', 'OUTGOING')),
    party_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    grain_id UUID NOT NULL REFERENCES public.grains(id) ON DELETE RESTRICT,
    grain_name_sinhala TEXT NOT NULL,
    quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg > 0),
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED')),
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. STOCK MOVEMENTS TABLE (තොග චලන ඉතිහාසය)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grain_id UUID NOT NULL REFERENCES public.grains(id) ON DELETE RESTRICT,
    grain_name_sinhala TEXT NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('INCOMING', 'OUTGOING', 'ADJUSTMENT')),
    bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
    bill_number TEXT,
    quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg > 0),
    stock_before_kg NUMERIC(12, 2) NOT NULL CHECK (stock_before_kg >= 0),
    stock_after_kg NUMERIC(12, 2) NOT NULL CHECK (stock_after_kg >= 0),
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_bills_type ON public.bills(bill_type);
CREATE INDEX IF NOT EXISTS idx_bills_date ON public.bills(bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_number ON public.bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_stock_movements_grain ON public.stock_movements(grain_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.grains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- GRAINS POLICIES:
-- Public can read all grains (pricing & availability).
-- Authenticated users (Admin) can insert, update, or delete grains.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public grains are viewable by everyone" ON public.grains;
CREATE POLICY "Public grains are viewable by everyone" 
ON public.grains FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert grains" ON public.grains;
CREATE POLICY "Admins can insert grains" 
ON public.grains FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update grains" ON public.grains;
CREATE POLICY "Admins can update grains" 
ON public.grains FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete grains" ON public.grains;
CREATE POLICY "Admins can delete grains" 
ON public.grains FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- SELL REQUESTS POLICIES:
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit sell request" ON public.sell_requests;
CREATE POLICY "Anyone can submit sell request" 
ON public.sell_requests FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view sell requests" ON public.sell_requests;
CREATE POLICY "Only admins can view sell requests" 
ON public.sell_requests FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Only admins can update sell requests" ON public.sell_requests;
CREATE POLICY "Only admins can update sell requests" 
ON public.sell_requests FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can delete sell requests" ON public.sell_requests;
CREATE POLICY "Only admins can delete sell requests" 
ON public.sell_requests FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- PICKUP REQUESTS POLICIES:
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit pickup request" ON public.pickup_requests;
CREATE POLICY "Anyone can submit pickup request" 
ON public.pickup_requests FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view pickup requests" ON public.pickup_requests;
CREATE POLICY "Only admins can view pickup requests" 
ON public.pickup_requests FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Only admins can update pickup requests" ON public.pickup_requests;
CREATE POLICY "Only admins can update pickup requests" 
ON public.pickup_requests FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can delete pickup requests" ON public.pickup_requests;
CREATE POLICY "Only admins can delete pickup requests" 
ON public.pickup_requests FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- CONTACT MESSAGES POLICIES:
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can view contact messages" 
ON public.contact_messages FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Only admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can delete contact messages" 
ON public.contact_messages FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- BILLS POLICIES (Admin Only - Public Has Zero Access):
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins can view bills" ON public.bills;
CREATE POLICY "Only admins can view bills" 
ON public.bills FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Only admins can insert bills" ON public.bills;
CREATE POLICY "Only admins can insert bills" 
ON public.bills FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update bills" ON public.bills;
CREATE POLICY "Only admins can update bills" 
ON public.bills FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STOCK MOVEMENTS POLICIES (Admin Only - Audit Trail):
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins can view stock movements" ON public.stock_movements;
CREATE POLICY "Only admins can view stock movements" 
ON public.stock_movements FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Only admins can insert stock movements" ON public.stock_movements;
CREATE POLICY "Only admins can insert stock movements" 
ON public.stock_movements FOR INSERT 
TO authenticated 
WITH CHECK (true);

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

DROP TRIGGER IF EXISTS update_grains_updated_at ON public.grains;
CREATE TRIGGER update_grains_updated_at
BEFORE UPDATE ON public.grains
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_sell_requests_updated_at ON public.sell_requests;
CREATE TRIGGER update_sell_requests_updated_at
BEFORE UPDATE ON public.sell_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_pickup_requests_updated_at ON public.pickup_requests;
CREATE TRIGGER update_pickup_requests_updated_at
BEFORE UPDATE ON public.pickup_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ATOMIC TRANSACTIONAL RPC FUNCTIONS (DATABASE-LEVEL STOCK MANAGEMENT)
-- ==============================================================================

-- 1. ATOMIC INCOMING PURCHASE BILL TRANSACTION
CREATE OR REPLACE FUNCTION public.create_incoming_bill(
    p_party_name TEXT,
    p_phone TEXT,
    p_grain_id UUID,
    p_quantity_kg NUMERIC,
    p_price_per_kg NUMERIC,
    p_bill_date DATE DEFAULT CURRENT_DATE,
    p_notes TEXT DEFAULT NULL,
    p_created_by TEXT DEFAULT NULL,
    p_bill_number TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_grain_record RECORD;
    v_stock_before NUMERIC;
    v_stock_after NUMERIC;
    v_total_amount NUMERIC;
    v_bill_num TEXT;
    v_bill_id UUID;
    v_now_time_str TEXT;
BEGIN
    -- Validation
    IF p_quantity_kg <= 0 THEN
        RAISE EXCEPTION 'වලංගු ධාන්‍ය ප්‍රමාණයක් ඇතුළත් කරන්න (0 ට වඩා වැඩි විය යුතුය).';
    END IF;

    IF p_price_per_kg < 0 THEN
        RAISE EXCEPTION 'වලංගු මිලක් ඇතුළත් කරන්න.';
    END IF;

    -- Lock grain row for update (Atomic Race-Condition Protection)
    SELECT id, name_sinhala, current_stock_kg 
    INTO v_grain_record 
    FROM public.grains 
    WHERE id = p_grain_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ධාන්‍ය වර්ගය සොයාගත නොහැක.';
    END IF;

    -- Calculate stock & total
    v_stock_before := COALESCE(v_grain_record.current_stock_kg, 0);
    v_stock_after := v_stock_before + p_quantity_kg;
    v_total_amount := ROUND(p_quantity_kg * p_price_per_kg, 2);

    -- Generate unique Bill Number if not provided
    IF p_bill_number IS NOT NULL AND p_bill_number <> '' THEN
        v_bill_num := p_bill_number;
    ELSE
        v_bill_num := 'IN-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
    END IF;

    -- Check duplicate bill number
    IF EXISTS (SELECT 1 FROM public.bills WHERE bill_number = v_bill_num) THEN
        RAISE EXCEPTION 'මෙම බිල්පත් අංකය (%) දැනටමත් පද්ධතියේ පවතී.', v_bill_num;
    END IF;

    -- Format Sinhala last updated time string
    v_now_time_str := 'අද ' || to_char(timezone('Asia/Colombo', now()), 'HH12:MI AM') || ' ට';

    -- Step 1: Update Grain Stock atomically
    UPDATE public.grains 
    SET 
        current_stock_kg = v_stock_after,
        last_updated = v_now_time_str,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_grain_id;

    -- Step 2: Insert into Bills table
    INSERT INTO public.bills (
        bill_number,
        bill_type,
        party_name,
        phone,
        grain_id,
        grain_name_sinhala,
        quantity_kg,
        price_per_kg,
        total_amount,
        bill_date,
        notes,
        status,
        created_by
    ) VALUES (
        v_bill_num,
        'INCOMING',
        p_party_name,
        p_phone,
        p_grain_id,
        v_grain_record.name_sinhala,
        p_quantity_kg,
        p_price_per_kg,
        v_total_amount,
        COALESCE(p_bill_date, CURRENT_DATE),
        p_notes,
        'COMPLETED',
        p_created_by
    ) RETURNING id INTO v_bill_id;

    -- Step 3: Insert into Stock Movements table (Audit Trail)
    INSERT INTO public.stock_movements (
        grain_id,
        grain_name_sinhala,
        movement_type,
        bill_id,
        bill_number,
        quantity_kg,
        stock_before_kg,
        stock_after_kg,
        notes,
        created_by
    ) VALUES (
        p_grain_id,
        v_grain_record.name_sinhala,
        'INCOMING',
        v_bill_id,
        v_bill_num,
        p_quantity_kg,
        v_stock_before,
        v_stock_after,
        COALESCE(p_notes, 'තොග මිලදී ගැනීමේ බිල්පත (' || p_party_name || ')'),
        p_created_by
    );

    RETURN jsonb_build_object(
        'success', true,
        'bill_id', v_bill_id,
        'bill_number', v_bill_num,
        'grain_name_sinhala', v_grain_record.name_sinhala,
        'quantity_kg', p_quantity_kg,
        'price_per_kg', p_price_per_kg,
        'total_amount', v_total_amount,
        'stock_before_kg', v_stock_before,
        'stock_after_kg', v_stock_after
    );
END;
$$;

-- 2. ATOMIC OUTGOING SALES BILL TRANSACTION (WITH INSUFFICIENT STOCK REJECTION)
CREATE OR REPLACE FUNCTION public.create_outgoing_bill(
    p_party_name TEXT,
    p_phone TEXT,
    p_grain_id UUID,
    p_quantity_kg NUMERIC,
    p_price_per_kg NUMERIC,
    p_bill_date DATE DEFAULT CURRENT_DATE,
    p_notes TEXT DEFAULT NULL,
    p_created_by TEXT DEFAULT NULL,
    p_bill_number TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_grain_record RECORD;
    v_stock_before NUMERIC;
    v_stock_after NUMERIC;
    v_total_amount NUMERIC;
    v_bill_num TEXT;
    v_bill_id UUID;
    v_now_time_str TEXT;
BEGIN
    -- Validation
    IF p_quantity_kg <= 0 THEN
        RAISE EXCEPTION 'වලංගු ධාන්‍ය ප්‍රමාණයක් ඇතුළත් කරන්න (0 ට වඩා වැඩි විය යුතුය).';
    END IF;

    IF p_price_per_kg < 0 THEN
        RAISE EXCEPTION 'වලංගු විකුණුම් මිලක් ඇතුළත් කරන්න.';
    END IF;

    -- Lock grain row for update (Atomic Race-Condition Protection)
    SELECT id, name_sinhala, current_stock_kg 
    INTO v_grain_record 
    FROM public.grains 
    WHERE id = p_grain_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ධාන්‍ය වර්ගය සොයාගත නොහැක.';
    END IF;

    v_stock_before := COALESCE(v_grain_record.current_stock_kg, 0);

    -- STRICT STOCK CHECK: Reject if insufficient stock!
    IF v_stock_before < p_quantity_kg THEN
        RAISE EXCEPTION 'ප්‍රමාණවත් තොගයක් නොමැත. (පවතින තොගය: % Kg, ඉල්ලූ ප්‍රමාණය: % Kg)', v_stock_before, p_quantity_kg;
    END IF;

    v_stock_after := v_stock_before - p_quantity_kg;
    v_total_amount := ROUND(p_quantity_kg * p_price_per_kg, 2);

    -- Generate unique Bill Number if not provided
    IF p_bill_number IS NOT NULL AND p_bill_number <> '' THEN
        v_bill_num := p_bill_number;
    ELSE
        v_bill_num := 'OUT-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
    END IF;

    -- Check duplicate bill number
    IF EXISTS (SELECT 1 FROM public.bills WHERE bill_number = v_bill_num) THEN
        RAISE EXCEPTION 'මෙම බිල්පත් අංකය (%) දැනටමත් පද්ධතියේ පවතී.', v_bill_num;
    END IF;

    -- Format Sinhala last updated time string
    v_now_time_str := 'අද ' || to_char(timezone('Asia/Colombo', now()), 'HH12:MI AM') || ' ට';

    -- Step 1: Update Grain Stock atomically
    UPDATE public.grains 
    SET 
        current_stock_kg = v_stock_after,
        last_updated = v_now_time_str,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_grain_id;

    -- Step 2: Insert into Bills table
    INSERT INTO public.bills (
        bill_number,
        bill_type,
        party_name,
        phone,
        grain_id,
        grain_name_sinhala,
        quantity_kg,
        price_per_kg,
        total_amount,
        bill_date,
        notes,
        status,
        created_by
    ) VALUES (
        v_bill_num,
        'OUTGOING',
        p_party_name,
        p_phone,
        p_grain_id,
        v_grain_record.name_sinhala,
        p_quantity_kg,
        p_price_per_kg,
        v_total_amount,
        COALESCE(p_bill_date, CURRENT_DATE),
        p_notes,
        'COMPLETED',
        p_created_by
    ) RETURNING id INTO v_bill_id;

    -- Step 3: Insert into Stock Movements table (Audit Trail)
    INSERT INTO public.stock_movements (
        grain_id,
        grain_name_sinhala,
        movement_type,
        bill_id,
        bill_number,
        quantity_kg,
        stock_before_kg,
        stock_after_kg,
        notes,
        created_by
    ) VALUES (
        p_grain_id,
        v_grain_record.name_sinhala,
        'OUTGOING',
        v_bill_id,
        v_bill_num,
        p_quantity_kg,
        v_stock_before,
        v_stock_after,
        COALESCE(p_notes, 'තොග විකිණීමේ බිල්පත (' || p_party_name || ')'),
        p_created_by
    );

    RETURN jsonb_build_object(
        'success', true,
        'bill_id', v_bill_id,
        'bill_number', v_bill_num,
        'grain_name_sinhala', v_grain_record.name_sinhala,
        'quantity_kg', p_quantity_kg,
        'price_per_kg', p_price_per_kg,
        'total_amount', v_total_amount,
        'stock_before_kg', v_stock_before,
        'stock_after_kg', v_stock_after
    );
END;
$$;

-- Grants & PostgREST Schema Cache Reload
GRANT ALL ON TABLE public.bills TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.stock_movements TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_incoming_bill TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_outgoing_bill TO authenticated, anon, service_role;

NOTIFY pgrst, 'reload schema';

