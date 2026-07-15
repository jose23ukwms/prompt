-- ========================================
-- START DIGITAL - OWNER REGISTRATION
-- Registrasi email owner dengan akses penuh
-- ========================================
-- Jalankan ini SETELAH schema.sql sudah dieksekusi
-- ========================================

-- Daftarkan owner email sebagai superadmin dengan akses tanpa batas
INSERT INTO profiles (
  email, name, phone, role, plan_slug, status,
  terms_accepted_at, privacy_accepted_at, legal_version
)
VALUES (
  'ucidesya@gmail.com', 'Owner Start Digital', '', 'superadmin', 'enterprise', 'active',
  NOW(), NOW(), '2026-07-05'
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'superadmin',
  plan_slug = 'enterprise',
  status = 'active',
  name = 'Owner Start Digital',
  terms_accepted_at = COALESCE(profiles.terms_accepted_at, NOW()),
  privacy_accepted_at = COALESCE(profiles.privacy_accepted_at, NOW()),
  legal_version = '2026-07-05';

-- Verifikasi
SELECT 
  id,
  email,
  name,
  role,
  plan_slug,
  status,
  created_at
FROM profiles 
WHERE email = 'ucidesya@gmail.com';

-- Test fungsi is_user_premium
SELECT 
  email,
  is_user_premium(id) AS is_premium
FROM profiles 
WHERE email = 'ucidesya@gmail.com';
