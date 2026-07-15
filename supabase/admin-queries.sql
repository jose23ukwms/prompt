-- ========================================
-- START DIGITAL - ADMIN QUERIES
-- Query-query berguna untuk monitoring dan manajemen
-- ========================================

-- ========================================
-- 1. DASHBOARD STATISTICS
-- ========================================

-- Total prompts breakdown
SELECT 
  COUNT(*) AS total_prompts,
  COUNT(*) FILTER (WHERE is_premium = false) AS free_prompts,
  COUNT(*) FILTER (WHERE is_premium = true) AS premium_prompts,
  COUNT(*) FILTER (WHERE slug LIKE 'app-%') AS app_builder_prompts,
  COUNT(*) FILTER (WHERE is_trending = true) AS trending_prompts,
  COUNT(*) FILTER (WHERE is_best_seller = true) AS best_seller_prompts
FROM prompts;

-- User breakdown by plan
SELECT 
  plan_slug,
  status,
  COUNT(*) AS total_users
FROM profiles
GROUP BY plan_slug, status
ORDER BY plan_slug, status;

-- Order statistics
SELECT 
  status,
  COUNT(*) AS total_orders,
  SUM(amount) AS total_revenue,
  AVG(amount) AS avg_order_value
FROM orders
GROUP BY status;

-- ========================================
-- 2. PROMPT ANALYTICS
-- ========================================

-- Top 10 prompts by users_count
SELECT 
  title,
  slug,
  category_id,
  users_count,
  copy_count,
  calculate_avg_rating(rating_sum, rating_count) AS avg_rating,
  is_premium
FROM prompts
ORDER BY users_count DESC
LIMIT 10;

-- Top 10 prompts by copy_count
SELECT 
  title,
  slug,
  users_count,
  copy_count,
  calculate_avg_rating(rating_sum, rating_count) AS avg_rating,
  is_premium
FROM prompts
ORDER BY copy_count DESC
LIMIT 10;

-- Prompts by category
SELECT 
  c.name AS category_name,
  c.icon,
  COUNT(p.id) AS total_prompts,
  SUM(p.users_count) AS total_users,
  SUM(p.copy_count) AS total_copies,
  COUNT(*) FILTER (WHERE p.is_premium = true) AS premium_count
FROM categories c
LEFT JOIN prompts p ON p.category_id = c.id
GROUP BY c.id, c.name, c.icon, c.color
ORDER BY total_prompts DESC;

-- ========================================
-- 3. USER ANALYTICS
-- ========================================

-- New users this month
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS new_users
FROM profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Premium conversion rate
SELECT 
  COUNT(*) FILTER (WHERE plan_slug != 'free' AND status = 'active') AS premium_users,
  COUNT(*) AS total_users,
  ROUND(
    COUNT(*) FILTER (WHERE plan_slug != 'free' AND status = 'active')::NUMERIC 
    / COUNT(*) * 100, 2
  ) AS conversion_rate_percent
FROM profiles;

-- User activity summary
SELECT * FROM user_activity ORDER BY total_orders DESC LIMIT 20;

-- ========================================
-- 4. ORDER MANAGEMENT
-- ========================================

-- Pending orders (perlu approval)
SELECT 
  o.id,
  p.name AS user_name,
  p.email AS user_email,
  pl.name AS plan_name,
  o.amount,
  o.created_at,
  o.payment_proof
FROM orders o
JOIN profiles p ON p.id = o.profile_id
JOIN plans pl ON pl.id = o.plan_id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC;

-- Recent orders
SELECT 
  o.id,
  p.name AS user_name,
  p.email AS user_email,
  pl.name AS plan_name,
  o.amount,
  o.status,
  o.created_at
FROM orders o
JOIN profiles p ON p.id = o.profile_id
JOIN plans pl ON pl.id = o.plan_id
ORDER BY o.created_at DESC
LIMIT 50;

-- Revenue this month
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_orders,
  SUM(amount) FILTER (WHERE status = 'approved') AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC
LIMIT 12;

-- ========================================
-- 5. NOTIFICATION MANAGEMENT
-- ========================================

-- Unread notifications per user
SELECT 
  p.email,
  p.name,
  COUNT(*) AS unread_count
FROM notifications n
JOIN profiles p ON p.id = n.profile_id
WHERE n.is_read = false
GROUP BY p.email, p.name
ORDER BY unread_count DESC
LIMIT 20;

-- Recent notifications
SELECT 
  n.id,
  p.email,
  p.name,
  n.title,
  n.type,
  n.is_read,
  n.created_at
FROM notifications n
JOIN profiles p ON p.id = n.profile_id
ORDER BY n.created_at DESC
LIMIT 50;

-- ========================================
-- 6. COPY TRACKING
-- ========================================

-- Copy tracking summary
SELECT 
  COUNT(*) AS total_copies,
  COUNT(DISTINCT prompt_id) AS unique_prompts_copied,
  COUNT(DISTINCT COALESCE(client_id, profile_id::text)) AS unique_users
FROM prompt_copies;

-- Prompts with most copies (tracking)
SELECT 
  p.title,
  p.slug,
  COUNT(pc.id) AS tracked_copies,
  p.copy_count AS total_copies
FROM prompt_copies pc
JOIN prompts p ON p.id = pc.prompt_id
GROUP BY p.id, p.title, p.slug, p.copy_count
ORDER BY tracked_copies DESC
LIMIT 20;

-- ========================================
-- 7. MAINTENANCE QUERIES
-- ========================================

-- Update rating untuk semua prompts berdasarkan reviews
UPDATE prompts p
SET 
  rating_sum = COALESCE(sub.total_rating, 0),
  rating_count = COALESCE(sub.review_count, 0)
FROM (
  SELECT 
    prompt_id,
    SUM(rating) AS total_rating,
    COUNT(*) AS review_count
  FROM reviews
  GROUP BY prompt_id
) sub
WHERE p.id = sub.prompt_id;

-- Update users_count berdasarkan unique copiers
UPDATE prompts p
SET users_count = COALESCE(sub.unique_users, 0)
FROM (
  SELECT 
    prompt_id,
    COUNT(DISTINCT COALESCE(client_id, profile_id::text)) AS unique_users
  FROM prompt_copies
  GROUP BY prompt_id
) sub
WHERE p.id = sub.prompt_id;

-- Hapus notifications lama (> 90 hari)
DELETE FROM notifications 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days' 
  AND is_read = true;

-- ========================================
-- 8. DATA EXPORT QUERIES
-- ========================================

-- Export all prompts (untuk backup)
SELECT 
  slug,
  title,
  description,
  (SELECT slug FROM categories WHERE id = category_id) AS category_slug,
  content,
  usage,
  example_output,
  level,
  language,
  supported_ai,
  tags,
  follow_ups,
  is_premium,
  is_trending,
  is_best_seller,
  version
FROM prompts
ORDER BY id;

-- Export categories
SELECT * FROM categories ORDER BY id;

-- Export plans
SELECT * FROM plans ORDER BY sort_order;

-- ========================================
-- 9. HEALTH CHECK
-- ========================================

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- Connection stats
SELECT 
  datname,
  numbackends,
  xact_commit,
  xact_rollback,
  blks_read,
  blks_hit,
  tup_returned,
  tup_fetched,
  tup_inserted,
  tup_updated,
  tup_deleted
FROM pg_stat_database
WHERE datname = current_database();
