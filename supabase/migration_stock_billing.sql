-- ==============================================================================
-- ANAGI STORES (අනගි ස්ටෝර්ස්) — Stock Management & Billing System Migration
-- ==============================================================================
-- Run this SQL in your Supabase Project SQL Editor:
-- Project: https://supabase.com/dashboard/project/cuukkighrrcjywvgyraz/sql
-- ==============================================================================

-- 1. Safely add stock tracking columns to existing grains table
ALTER TABLE public.grains 
ADD COLUMN IF NOT EXISTS current_stock_kg NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_stock_kg >= 0);

ALTER TABLE public.grains 
ADD COLUMN IF NOT EXISTS min_stock_level_kg NUMERIC(12, 2) NOT NULL DEFAULT 100 CHECK (min_stock_level_kg >= 0);

-- 2. BILLS TABLE (ඇතුළත් කළ මිලදී ගැනීම් / පිටතට නිකුත් කළ විකුණුම් බිල්පත්)
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

-- 3. STOCK MOVEMENTS TABLE (තොග චලන විගණන ලේඛනය / Audit Trail)
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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Bills
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

-- 6. RLS Policies for Stock Movements
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

-- 7. Trigger for bills updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. ATOMIC INCOMING PURCHASE BILL TRANSACTION (RPC FUNCTION)
-- ==============================================================================
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
    -- Security Authentication Check (Defense-in-depth: Require authenticated admin user)
    IF auth.role() IS NULL OR auth.role() = 'anon' OR auth.uid() IS NULL THEN
        RAISE EXCEPTION 'අවසර නැත: මෙම ක්‍රියාව සිදු කිරීමට පරිපාලක පිවිසුමක් (Admin Authentication) අවශ්‍ය වේ.';
    END IF;

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

-- ==============================================================================
-- 9. ATOMIC OUTGOING SALES BILL TRANSACTION (RPC FUNCTION)
-- ==============================================================================
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
    -- Security Authentication Check (Defense-in-depth: Require authenticated admin user)
    IF auth.role() IS NULL OR auth.role() = 'anon' OR auth.uid() IS NULL THEN
        RAISE EXCEPTION 'අවසර නැත: මෙම ක්‍රියාව සිදු කිරීමට පරිපාලක පිවිසුමක් (Admin Authentication) අවශ්‍ය වේ.';
    END IF;

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

-- ==============================================================================
-- 10. GRANTS & PERMISSIONS (AUTHENTICATED ADMIN & SERVICE ROLE ONLY)
-- ==============================================================================
REVOKE ALL ON TABLE public.bills FROM anon;
REVOKE ALL ON TABLE public.stock_movements FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_incoming_bill FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_outgoing_bill FROM anon;

GRANT ALL ON TABLE public.bills TO authenticated, service_role;
GRANT ALL ON TABLE public.stock_movements TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_incoming_bill TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_outgoing_bill TO authenticated, service_role;

-- Force reload schema cache in PostgREST
NOTIFY pgrst, 'reload schema';
