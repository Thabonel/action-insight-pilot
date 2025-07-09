-- Fix enum constraint issues for campaign types
-- Add missing campaign type values that are used in the code
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'lead_generation';
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'brand_awareness';
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'product_launch';