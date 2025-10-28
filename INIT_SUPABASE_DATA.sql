-- Initialize seat inventory for Timeless Organics Founding 100
-- Run this in Supabase SQL Editor after running npm run db:push

-- Clear existing seats (if any)
DELETE FROM seats;

-- Insert Founder and Patron seat inventory
-- Price set to R10 (1000 cents) for testing
-- Change to production prices when ready: Founder=300000, Patron=500000
INSERT INTO seats (id, type, price, total_available, sold, updated_at)
VALUES 
  (gen_random_uuid(), 'founder', 1000, 50, 0, NOW()),
  (gen_random_uuid(), 'patron', 1000, 50, 0, NOW());

-- Verify
SELECT * FROM seats;
