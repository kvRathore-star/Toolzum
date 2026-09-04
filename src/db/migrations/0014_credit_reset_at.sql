-- Add creditResetAt column for monthly credit renewal
ALTER TABLE user ADD COLUMN creditResetAt INTEGER DEFAULT NULL;
