-- Add status field to redemptions table
ALTER TABLE redemptions 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn'));

-- Create index for status queries
CREATE INDEX idx_redemptions_status ON redemptions(status);

-- Update point_summaries view to exclude withdrawn redemptions
DROP VIEW IF EXISTS point_summaries;

CREATE OR REPLACE VIEW point_summaries AS
WITH event_points AS (
  SELECT 
    COALESCE(SUM(points), 0) AS total_earned,
    COALESCE(SUM(CASE
      WHEN timestamp >= DATE_TRUNC('week', CURRENT_TIMESTAMP)
      THEN points
      ELSE 0
    END), 0) AS weekly_earned,
    COALESCE(SUM(CASE
      WHEN timestamp >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
      THEN points
      ELSE 0
    END), 0) AS monthly_earned
  FROM events
  WHERE is_active = true
),
redemption_points AS (
  SELECT 
    COALESCE(SUM(points_spent), 0) AS total_spent,
    COALESCE(SUM(CASE
      WHEN redeemed_at >= DATE_TRUNC('week', CURRENT_TIMESTAMP)
      THEN points_spent
      ELSE 0
    END), 0) AS weekly_spent,
    COALESCE(SUM(CASE
      WHEN redeemed_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
      THEN points_spent
      ELSE 0
    END), 0) AS monthly_spent
  FROM redemptions
  WHERE status = 'active'  -- Only count active redemptions
)
SELECT
  (e.total_earned - r.total_spent) AS total_points,
  (e.weekly_earned - r.weekly_spent) AS weekly_points,
  (e.monthly_earned - r.monthly_spent) AS monthly_points
FROM event_points e
CROSS JOIN redemption_points r; 