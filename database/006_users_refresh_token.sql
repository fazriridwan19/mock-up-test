-- ============================================================
-- Migration: Add refresh_token_hash to users table
-- ============================================================

ALTER TABLE `users` ADD COLUMN `refresh_token_hash` VARCHAR(255) NULL AFTER `role`;
