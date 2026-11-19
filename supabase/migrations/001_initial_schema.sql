-- ============================================================================
-- Khoj — IIITA Lost & Found Platform
-- Initial Database Migration (001_initial_schema.sql)
-- ============================================================================
--
-- TARGET: Supabase Cloud (PostgreSQL 15+)
--
-- FIRST ADMIN PROMOTION:
--   After signing in for the first time via Google OAuth (@iiita.ac.in),
--   run this query in the Supabase SQL Editor to promote your account:
--
--     UPDATE public.profiles
--     SET role = 'admin'
--     WHERE email = 'your.institutional.email@iiita.ac.in';
--
-- ============================================================================


-- ============================================================================
-- 0. CLEANUP (Safe teardown for re-runnable execution)
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.check_email_domain(TEXT) CASCADE;

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.claims CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ============================================================================
-- 1. BASE HELPER FUNCTIONS (Independent of tables)
-- ============================================================================

-- handle_updated_at(): Trigger function that sets updated_at to current timestamp.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- check_email_domain(): Validates that an email ends with @iiita.ac.in.
CREATE OR REPLACE FUNCTION public.check_email_domain(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email LIKE '%@iiita.ac.in';
END;
$$;


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL,
  full_name       TEXT        NOT NULL,
  roll_number     TEXT        NOT NULL,
  department      TEXT        NOT NULL,
  academic_batch  TEXT        NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  role            TEXT        NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student', 'admin')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT profiles_email_unique       UNIQUE (email),
  CONSTRAINT profiles_roll_number_unique UNIQUE (roll_number),
  CONSTRAINT profiles_email_domain_check CHECK (email LIKE '%@iiita.ac.in')
);

COMMENT ON TABLE  public.profiles IS 'User profiles linked to Supabase Auth. Every authenticated user has one row.';
COMMENT ON COLUMN public.profiles.role IS 'student or admin. Default is student; first admin must be promoted manually.';

-- ----------------------------------------------------------------------------
-- items
-- ----------------------------------------------------------------------------
CREATE TABLE public.items (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT        NOT NULL,
  category                TEXT        NOT NULL
                                      CHECK (category IN (
                                        'electronics', 'documents', 'wallets', 'keys',
                                        'books', 'clothing', 'bottles', 'other'
                                      )),
  description             TEXT        NOT NULL,
  report_type             TEXT        NOT NULL
                                      CHECK (report_type IN ('found', 'lost')),
  location                TEXT        NOT NULL,
  date_occurred           DATE        NOT NULL,
  time_occurred           TIME,
  photo_url               TEXT,
  distinguishing_details  TEXT,
  status                  TEXT        NOT NULL DEFAULT 'active'
                                      CHECK (status IN (
                                        'active', 'claimed', 'returned', 'archived'
                                      )),
  reported_by             UUID        NOT NULL REFERENCES public.profiles(id),
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.items IS 'Lost or found item reports posted by campus users.';

-- ----------------------------------------------------------------------------
-- claims
-- ----------------------------------------------------------------------------
CREATE TABLE public.claims (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id                 UUID        NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id             UUID        NOT NULL REFERENCES public.profiles(id),
  claim_message           TEXT        NOT NULL,
  proof_details           TEXT,
  proof_photo_url         TEXT,
  location_lost           TEXT,
  date_lost               DATE,
  status                  TEXT        NOT NULL DEFAULT 'pending_review'
                                      CHECK (status IN (
                                        'pending_review', 'approved', 'rejected',
                                        'awaiting_handover', 'returned'
                                      )),
  reviewed_by             UUID        REFERENCES public.profiles(id),
  reviewed_at             TIMESTAMPTZ,
  review_note             TEXT,
  admin_message           TEXT,
  handover_confirmed_at   TIMESTAMPTZ,
  handover_confirmed_by   UUID        REFERENCES public.profiles(id),
  recipient_name          TEXT,
  recipient_roll_number   TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate active claims by the same user on the same item
  CONSTRAINT claims_item_claimant_unique UNIQUE (item_id, claimant_id)
);

COMMENT ON TABLE public.claims IS 'Ownership claims submitted against items. Reviewed and managed by campus administrators.';

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  message           TEXT        NOT NULL,
  type              TEXT        NOT NULL
                                CHECK (type IN (
                                  'claim_approved', 'claim_rejected', 'admin_message',
                                  'item_returned', 'new_claim', 'general'
                                )),
  related_item_id   UUID        REFERENCES public.items(id) ON DELETE CASCADE,
  related_claim_id  UUID        REFERENCES public.claims(id) ON DELETE CASCADE,
  is_read           BOOLEAN     DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app real-time notifications delivered to users.';

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action        TEXT        NOT NULL,
  entity_type   TEXT        NOT NULL,
  entity_id     TEXT        NOT NULL,
  performed_by  UUID        NOT NULL REFERENCES public.profiles(id),
  details       JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail of administrator and desk handover actions.';


-- ============================================================================
-- 3. FUNCTIONS DEPENDING ON TABLES
-- ============================================================================

-- is_admin(): Returns true if the current authenticated user has role='admin'.
-- Created AFTER public.profiles exists so PostgreSQL can resolve the table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;


-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- items
CREATE INDEX idx_items_category    ON public.items (category);
CREATE INDEX idx_items_status      ON public.items (status);
CREATE INDEX idx_items_report_type ON public.items (report_type);
CREATE INDEX idx_items_reported_by ON public.items (reported_by);
CREATE INDEX idx_items_created_at  ON public.items (created_at DESC);

-- claims
CREATE INDEX idx_claims_item_id    ON public.claims (item_id);
CREATE INDEX idx_claims_claimant   ON public.claims (claimant_id);
CREATE INDEX idx_claims_status     ON public.claims (status);

-- notifications
CREATE INDEX idx_notifications_user_id    ON public.notifications (user_id);
CREATE INDEX idx_notifications_is_read    ON public.notifications (is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- audit_logs
CREATE INDEX idx_audit_logs_performed_by ON public.audit_logs (performed_by);
CREATE INDEX idx_audit_logs_created_at   ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_entity_type  ON public.audit_logs (entity_type);


-- ============================================================================
-- 5. TRIGGERS (Auto-update updated_at timestamps)
-- ============================================================================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs    ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- profiles policies
-- ----------------------------------------------------------------------------

-- Students can read their own profile
CREATE POLICY "profiles: users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Students can insert their own profile
CREATE POLICY "profiles: users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Students can update their own profile EXCEPT the role field
CREATE POLICY "profiles: users can update own profile (no role change)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "profiles: admins can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- items policies
-- ----------------------------------------------------------------------------

-- Anyone authenticated can read active, claimed, or returned items (public listings)
CREATE POLICY "items: authenticated can read public listings"
  ON public.items FOR SELECT
  TO authenticated
  USING (status IN ('active', 'claimed', 'returned'));

-- Authenticated users can insert items they report
CREATE POLICY "items: authenticated can insert own items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

-- Users can update their own items only if the item is still active
CREATE POLICY "items: users can update own active items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (reported_by = auth.uid() AND status = 'active')
  WITH CHECK (reported_by = auth.uid());

-- Admins can read all items (including archived)
CREATE POLICY "items: admins can read all"
  ON public.items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update any item
CREATE POLICY "items: admins can update any"
  ON public.items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete any item (lost notices or found items)
CREATE POLICY "items: admins can delete any"
  ON public.items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- claims policies
-- ----------------------------------------------------------------------------

-- Claimants can read their own claims
CREATE POLICY "claims: claimants can read own claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (claimant_id = auth.uid());

-- Claimants can insert claims for themselves
CREATE POLICY "claims: claimants can insert own claims"
  ON public.claims FOR INSERT
  TO authenticated
  WITH CHECK (claimant_id = auth.uid());

-- Item reporters can see claims on their items
CREATE POLICY "claims: reporters can read claims on their items"
  ON public.claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = claims.item_id
        AND items.reported_by = auth.uid()
    )
  );

-- Admins can read all claims
CREATE POLICY "claims: admins can read all"
  ON public.claims FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update claims (approve, reject, handover)
CREATE POLICY "claims: admins can update"
  ON public.claims FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- notifications policies
-- ----------------------------------------------------------------------------

-- Users can read their own notifications
CREATE POLICY "notifications: users can read own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications: users can update own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can insert notifications for any user
CREATE POLICY "notifications: admins can insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can delete notifications
CREATE POLICY "notifications: admins can delete"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- audit_logs policies
-- ----------------------------------------------------------------------------

-- Only admins can read audit logs
CREATE POLICY "audit_logs: admins can read"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can insert audit logs
CREATE POLICY "audit_logs: admins can insert"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- No UPDATE or DELETE policies: audit logs are permanently immutable.


-- ============================================================================
-- 7. STORAGE BUCKET CONFIGURATION (Supabase Dashboard manual setup)
-- ============================================================================
--
-- In the Supabase Dashboard, go to "Storage" and create these two buckets:
--
-- 1. Bucket: item-photos
--    - Public: YES
--    - File size limit: 5 MB (5242880 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. Bucket: claim-evidence
--    - Public: NO (Private)
--    - File size limit: 5 MB (5242880 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- STORAGE POLICIES TO PASTE IN SQL EDITOR (Optional - if setting via SQL):
--
--   CREATE POLICY "item-photos: public read"
--     ON storage.objects FOR SELECT TO public
--     USING (bucket_id = 'item-photos');
--
--   CREATE POLICY "item-photos: authenticated upload"
--     ON storage.objects FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'item-photos');
--
--   CREATE POLICY "claim-evidence: authenticated upload"
--     ON storage.objects FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'claim-evidence');
--
--   CREATE POLICY "claim-evidence: owner and admin read"
--     ON storage.objects FOR SELECT TO authenticated
--     USING (bucket_id = 'claim-evidence' AND (public.is_admin() OR auth.uid()::text = (storage.foldername(name))[1]));
--
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
