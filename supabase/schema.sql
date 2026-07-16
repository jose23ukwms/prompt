-- ========================================
-- START DIGITAL - AI PROMPT PREMIUM
-- Supabase Complete Schema Script
-- ========================================
-- File ini berisi SEMUA tabel yang diperlukan
-- untuk menjalankan aplikasi Start Digital AI Prompt Premium
-- ========================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project Anda
-- 3. Buka menu "SQL Editor"
-- 4. Copy-paste seluruh isi file ini
-- 5. Klik "Run" atau tekan Ctrl+Enter
-- ========================================

-- ========================================
-- EXTENSION SETUP
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. TABEL: categories
-- Menyimpan kategori prompt (Marketing, Coding, UI/UX, dll)
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  icon VARCHAR(16) DEFAULT '✨' NOT NULL,
  color VARCHAR(32) DEFAULT '#6366f1' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

COMMENT ON TABLE categories IS 'Kategori prompt (Marketing, Coding, UI/UX, dll)';
COMMENT ON COLUMN categories.slug IS 'Slug unik untuk URL (e.g., marketing, coding)';
COMMENT ON COLUMN categories.icon IS 'Emoji icon kategori';
COMMENT ON COLUMN categories.color IS 'Hex color untuk UI badge';

-- ========================================
-- 2. TABEL: plans
-- Menyimpan paket membership (Gratis, Pro Bulanan, Pro Tahunan, Enterprise)
-- ========================================
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  price INTEGER DEFAULT 0 NOT NULL,
  period VARCHAR(32) DEFAULT 'bulan' NOT NULL,
  highlighted BOOLEAN DEFAULT false NOT NULL,
  features JSONB DEFAULT '[]' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_sort_order ON plans(sort_order);

COMMENT ON TABLE plans IS 'Paket membership (Gratis, Pro Bulanan, Pro Tahunan, Enterprise)';
COMMENT ON COLUMN plans.price IS 'Harga dalam Rupiah (0 untuk gratis/custom)';
COMMENT ON COLUMN plans.period IS 'Periode pembayaran (bulan, tahun, selamanya, custom)';
COMMENT ON COLUMN plans.features IS 'Array JSON fitur yang didapat';

-- ========================================
-- 3. TABEL: profiles
-- Menyimpan data user/pelanggan
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT '' NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(32) DEFAULT 'user' NOT NULL,
  plan_slug VARCHAR(64) DEFAULT 'free' NOT NULL,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  terms_accepted_at TIMESTAMP,
  privacy_accepted_at TIMESTAMP,
  legal_version VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_role CHECK (role IN ('user', 'admin', 'superadmin')),
  CONSTRAINT chk_status CHECK (status IN ('active', 'pending', 'rejected', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_slug ON profiles(plan_slug);

COMMENT ON TABLE profiles IS 'Data user/pelanggan';
COMMENT ON COLUMN profiles.role IS 'Role user: user, admin, superadmin';
COMMENT ON COLUMN profiles.plan_slug IS 'Slug paket (free, pro-bulanan, pro-tahunan, enterprise)';
COMMENT ON COLUMN profiles.status IS 'Status akun: active, pending, rejected, suspended';

-- Aman untuk database lama: kolom persetujuan legal dan password hash.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_version VARCHAR(32);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ========================================
-- 4. TABEL: orders
-- Menyimpan riwayat pesanan/pembayaran
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  payment_proof TEXT,
  midtrans_order_id VARCHAR(100),
  midtrans_token VARCHAR(200),
  midtrans_redirect_url TEXT,
  payment_method VARCHAR(64),
  payment_type VARCHAR(64),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_order_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired'))
);

-- Aman dijalankan pada database lama: tambahkan kolom Midtrans jika belum ada.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS midtrans_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS midtrans_token VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS midtrans_redirect_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_midtrans_order_id
  ON orders(midtrans_order_id) WHERE midtrans_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

COMMENT ON TABLE orders IS 'Riwayat pesanan/pembayaran membership';
COMMENT ON COLUMN orders.amount IS 'Nominal pembayaran dalam Rupiah';
COMMENT ON COLUMN orders.payment_proof IS 'Bukti transfer/URL bukti pembayaran';

-- ========================================
-- 5. TABEL: notifications
-- Menyimpan notifikasi untuk user
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  type VARCHAR(32) DEFAULT 'info' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_notification_type CHECK (type IN ('info', 'success', 'warning', 'order', 'payment'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

COMMENT ON TABLE notifications IS 'Notifikasi untuk user (status order, pembayaran, dll)';
COMMENT ON COLUMN notifications.type IS 'Tipe notifikasi: info, success, warning, order, payment';

-- ========================================
-- 6. TABEL: prompts
-- Menyimpan semua prompt AI (gratis, premium, app builder)
-- ========================================
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  usage TEXT DEFAULT '' NOT NULL,
  example_output TEXT DEFAULT '' NOT NULL,
  level VARCHAR(32) DEFAULT 'Pemula' NOT NULL,
  language VARCHAR(32) DEFAULT 'Indonesia' NOT NULL,
  supported_ai JSONB DEFAULT '[]' NOT NULL,
  tags JSONB DEFAULT '[]' NOT NULL,
  follow_ups JSONB DEFAULT '[]' NOT NULL,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  is_trending BOOLEAN DEFAULT false NOT NULL,
  is_best_seller BOOLEAN DEFAULT false NOT NULL,
  users_count INTEGER DEFAULT 0 NOT NULL,
  copy_count INTEGER DEFAULT 0 NOT NULL,
  rating_sum INTEGER DEFAULT 0 NOT NULL,
  rating_count INTEGER DEFAULT 0 NOT NULL,
  version VARCHAR(16) DEFAULT '1.0' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_premium ON prompts(is_premium);
CREATE INDEX IF NOT EXISTS idx_prompts_is_trending ON prompts(is_trending);
CREATE INDEX IF NOT EXISTS idx_prompts_is_best_seller ON prompts(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_prompts_users_count ON prompts(users_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_supported_ai ON prompts USING GIN(supported_ai);
CREATE INDEX IF NOT EXISTS idx_prompts_fulltext ON prompts USING GIN(to_tsvector('indonesian', title || ' ' || description));

COMMENT ON TABLE prompts IS 'Semua prompt AI (gratis, premium, app builder)';
COMMENT ON COLUMN prompts.slug IS 'Slug unik untuk URL (e.g., meta-ads-skincare)';
COMMENT ON COLUMN prompts.supported_ai IS 'Array model AI yang didukung (ChatGPT, Claude, dll)';
COMMENT ON COLUMN prompts.tags IS 'Array tag untuk filter/pencarian';
COMMENT ON COLUMN prompts.follow_ups IS 'Array prompt lanjutan untuk penyempurnaan';
COMMENT ON COLUMN prompts.rating_sum IS 'Total rating untuk kalkulasi average';
COMMENT ON COLUMN prompts.rating_count IS 'Jumlah rating untuk kalkulasi average';

-- ========================================
-- 7. TABEL: reviews
-- Menyimpan ulasan/rating user untuk prompt
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  author VARCHAR(120) DEFAULT 'Anonim' NOT NULL,
  rating INTEGER DEFAULT 5 NOT NULL,
  comment TEXT DEFAULT '' NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_reviews_prompt_id ON reviews(prompt_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

COMMENT ON TABLE reviews IS 'Ulasan dan rating user untuk prompt';

-- ========================================
-- 8. TABEL: favorites
-- Menyimpan prompt favorit user (bookmark)
-- ========================================
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_favorites_client_id ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON favorites(prompt_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(client_id, prompt_id);

COMMENT ON TABLE favorites IS 'Prompt favorit (bookmark) per user/client';
COMMENT ON COLUMN favorites.client_id IS 'ID unik client (anonymous ID atau user ID)';

-- ========================================
-- 9. TABEL: device_trials
-- Masa evaluasi 7 hari per perangkat/browser
-- ========================================
CREATE TABLE IF NOT EXISTS device_trials (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL UNIQUE,
  first_seen_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  blocked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_trials_expires_at ON device_trials(expires_at);
COMMENT ON TABLE device_trials IS 'Tracking masa akses gratis 7 hari berdasarkan cookie perangkat HTTP-only';

-- ========================================
-- 10. TABEL: prompt_copies
-- Tracking copy per-user per-prompt untuk limit user gratis
-- ========================================
CREATE TABLE IF NOT EXISTS prompt_copies (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(64),
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompt_copies_client_id ON prompt_copies(client_id);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_profile_id ON prompt_copies(profile_id);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_prompt_id ON prompt_copies(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_copies_created_at ON prompt_copies(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_copies_profile_prompt_unique
  ON prompt_copies(profile_id, prompt_id) WHERE profile_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_copies_client_prompt_unique
  ON prompt_copies(client_id, prompt_id) WHERE client_id IS NOT NULL;

COMMENT ON TABLE prompt_copies IS 'Tracking copy per-user untuk limit user gratis (1x copy)';
COMMENT ON COLUMN prompt_copies.client_id IS 'Client ID untuk user anonim';
COMMENT ON COLUMN prompt_copies.profile_id IS 'Profile ID untuk user login';

-- ========================================
-- FUNCTIONS: Auto-update updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTIONS: Calculate average rating
-- ========================================
CREATE OR REPLACE FUNCTION calculate_avg_rating(rating_sum INTEGER, rating_count INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  IF rating_count = 0 THEN RETURN 0;
  ELSE RETURN ROUND(rating_sum::NUMERIC / rating_count, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNCTIONS: Check if user can copy prompt
-- ========================================
CREATE OR REPLACE FUNCTION can_user_copy(
  p_client_id VARCHAR,
  p_profile_id INTEGER,
  p_prompt_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan VARCHAR;
  user_status VARCHAR;
  user_role VARCHAR;
  copy_count INTEGER;
BEGIN
  -- Cek jika user login
  IF p_profile_id IS NOT NULL THEN
    SELECT plan_slug, status, role INTO user_plan, user_status, user_role
    FROM profiles WHERE id = p_profile_id;
    
    -- Premium / admin / superadmin = unlimited
    IF user_plan != 'free' AND user_status = 'active' THEN
      RETURN true;
    END IF;
    
    IF user_role IN ('admin', 'superadmin') THEN
      RETURN true;
    END IF;
    
    -- Cek apakah sudah pernah copy
    SELECT COUNT(*) INTO copy_count
    FROM prompt_copies
    WHERE prompt_id = p_prompt_id AND profile_id = p_profile_id;
    
    RETURN copy_count = 0;
  END IF;
  
  -- User anonim
  IF p_client_id IS NOT NULL THEN
    SELECT COUNT(*) INTO copy_count
    FROM prompt_copies
    WHERE prompt_id = p_prompt_id AND client_id = p_client_id;
    
    RETURN copy_count = 0;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNCTIONS: Check if user is premium
-- ========================================
CREATE OR REPLACE FUNCTION is_user_premium(p_profile_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan VARCHAR;
  user_status VARCHAR;
  user_role VARCHAR;
BEGIN
  IF p_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT plan_slug, status, role INTO user_plan, user_status, user_role
  FROM profiles WHERE id = p_profile_id;
  
  RETURN (user_plan != 'free' AND user_status = 'active') 
      OR user_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VIEWS: Summary views untuk analytics
-- ========================================
CREATE OR REPLACE VIEW prompt_stats AS
SELECT 
  p.id,
  p.title,
  p.slug,
  p.is_premium,
  p.users_count,
  p.copy_count,
  p.rating_count,
  p.rating_sum,
  calculate_avg_rating(p.rating_sum, p.rating_count) AS avg_rating,
  c.name AS category_name,
  c.icon AS category_icon,
  (SELECT COUNT(*) FROM reviews r WHERE r.prompt_id = p.id) AS review_count,
  (SELECT COUNT(*) FROM favorites f WHERE f.prompt_id = p.id) AS favorite_count
FROM prompts p
LEFT JOIN categories c ON c.id = p.category_id;

CREATE OR REPLACE VIEW user_activity AS
SELECT 
  p.id AS profile_id,
  p.email,
  p.name,
  p.role,
  p.plan_slug,
  p.status,
  p.created_at AS registered_at,
  (SELECT COUNT(*) FROM orders o WHERE o.profile_id = p.id) AS total_orders,
  (SELECT COUNT(*) FROM notifications n WHERE n.profile_id = p.id) AS total_notifications,
  (SELECT COUNT(*) FROM notifications n WHERE n.profile_id = p.id AND n.is_read = false) AS unread_notifications
FROM profiles p;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Aktifkan RLS untuk tabel-tabel yang perlu diamankan
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_copies ENABLE ROW LEVEL SECURITY;

-- Policies untuk profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = email OR role IN ('admin', 'superadmin'));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = email)
  WITH CHECK (auth.uid()::text = email);

-- Policies untuk notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE email = auth.uid()::text
  ));

CREATE POLICY "Block direct notification inserts"
  ON notifications FOR INSERT
  WITH CHECK (false);

-- Policies untuk orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE email = auth.uid()::text
  ));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE email = auth.uid()::text
  ));

-- Data berbasis client_id hanya dikelola melalui API server. Akses REST publik ditutup.
CREATE POLICY "Block direct favorites access"
  ON favorites FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block direct device trial access"
  ON device_trials FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block direct prompt copy access"
  ON prompt_copies FOR ALL
  USING (false)
  WITH CHECK (false);

-- ========================================
-- STORAGE BUCKETS (untuk file uploads)
-- ========================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-proofs', 'payment-proofs', false),
  ('prompts-assets', 'prompts-assets', true),
  ('profiles-avatars', 'profiles-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view public assets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('prompts-assets', 'profiles-avatars'));

-- ========================================
-- REALTIME (untuk live updates)
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ========================================
-- INDEXES untuk performa (additional)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING GIN(
  to_tsvector('indonesian', title || ' ' || description || ' ' || COALESCE(content, ''))
);

-- ========================================
-- SEEDS: Data awal
-- ========================================
-- Categories
INSERT INTO categories (slug, name, description, icon, color) VALUES
  ('marketing', 'Marketing', 'Copywriting, Meta Ads, TikTok Ads, Instagram Ads & lainnya.', '📣', '#ec4899'),
  ('bisnis', 'Bisnis', 'SOP, Proposal, Pitch Deck, Business Plan.', '💼', '#6366f1'),
  ('customer-service', 'Customer Service', 'Auto reply, complaint handling, follow up, closing.', '💬', '#14b8a6'),
  ('coding', 'Coding', 'React, Next.js, Laravel, Node.js, Python, Flutter.', '💻', '#0ea5e9'),
  ('ui-ux', 'UI/UX', 'Landing page, dashboard, mobile app design.', '🎨', '#f59e0b'),
  ('desain', 'Desain', 'Canva, Photoshop, Midjourney, image prompt.', '🖼️', '#a855f7'),
  ('produktivitas', 'Produktivitas', 'Email, resume, CV, notulen, meeting.', '⚡', '#22c55e'),
  ('pendidikan', 'Pendidikan', 'Essay, skripsi, ringkasan, presentasi.', '🎓', '#3b82f6'),
  ('ai-automation', 'AI Automation', 'WhatsApp AI, CRM AI, Sales AI, Chatbot AI.', '🤖', '#ef4444'),
  ('prompt-engineering', 'Prompt Engineering', 'Chain of Thought, Role Prompt, Few Shot, Multi Agent.', '🧠', '#8b5cf6')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Plans
INSERT INTO plans (slug, name, price, period, highlighted, features, sort_order) VALUES
  ('free', 'Gratis', 0, 'selamanya', false,
   '["70 Prompt pilihan", "Copy 1x per prompt", "Update terbatas", "Akses kategori dasar"]', 1),
  ('pro-bulanan', 'Pro Bulanan', 99000, 'bulan', true,
   '["Semua prompt premium", "Prompt baru setiap minggu", "Template & AI Workflow", "AI Automation", "Prioritas dukungan"]', 2),
  ('pro-tahunan', 'Pro Tahunan', 890000, 'tahun', false,
   '["Semua fitur Pro Bulanan", "Hemat 25% dari bulanan", "Update selamanya", "Akses beta fitur baru"]', 3),
  ('enterprise', 'Enterprise', 0, 'custom', false,
   '["Lisensi tim & perusahaan", "Prompt kustom on-demand", "SOP & workflow internal", "Onboarding & pelatihan", "Dedicated support"]', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  period = EXCLUDED.period,
  highlighted = EXCLUDED.highlighted,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 'Schema berhasil dibuat!' AS status;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_plans FROM plans;
