-- Update point_summaries view to subtract redeemed points
-- This view should show actual available points (earned - spent)

DROP VIEW IF EXISTS point_summaries;

CREATE OR REPLACE VIEW point_summaries AS
WITH earned_points AS (
  SELECT
    profile_id,
    SUM(points) AS total_earned,
    SUM(CASE WHEN timestamp >= DATE_TRUNC('week', CURRENT_TIMESTAMP) THEN points ELSE 0 END) AS weekly_earned,
    SUM(CASE WHEN timestamp >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN points ELSE 0 END) AS monthly_earned
  FROM events
  WHERE is_active = true AND profile_id IS NOT NULL
  GROUP BY profile_id
),
spent_points AS (
  SELECT
    profile_id,
    SUM(points_spent) AS total_spent,
    SUM(CASE WHEN redeemed_at >= DATE_TRUNC('week', CURRENT_TIMESTAMP) THEN points_spent ELSE 0 END) AS weekly_spent,
    SUM(CASE WHEN redeemed_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN points_spent ELSE 0 END) AS monthly_spent
  FROM redemptions
  WHERE status = 'active' AND profile_id IS NOT NULL
  GROUP BY profile_id
)
SELECT
  COALESCE(e.profile_id, s.profile_id) AS profile_id,
  COALESCE(e.total_earned, 0) - COALESCE(s.total_spent, 0) AS total_points,
  COALESCE(e.weekly_earned, 0) - COALESCE(s.weekly_spent, 0) AS weekly_points,
  COALESCE(e.monthly_earned, 0) - COALESCE(s.monthly_spent, 0) AS monthly_points
FROM earned_points e
FULL OUTER JOIN spent_points s ON e.profile_id = s.profile_id; 