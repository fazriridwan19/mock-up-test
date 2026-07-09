-- ============================================================
-- Table: biodata
-- Description: Stores personal biodata for each user (1:1 with users)
-- ============================================================

CREATE TABLE IF NOT EXISTS `biodata` (
  `id`                      VARCHAR(36)     NOT NULL,
  `user_id`                 VARCHAR(36)     NOT NULL,
  `applied_position`        VARCHAR(255)    NOT NULL,
  `full_name`               VARCHAR(255)    NOT NULL,
  `national_id_number`      VARCHAR(16)     NOT NULL,
  `birth_place`             VARCHAR(255)    NOT NULL,
  `birth_date`              DATE            NOT NULL,
  `gender`                  ENUM('MALE', 'FEMALE') NOT NULL,
  `religion`                ENUM('ISLAM', 'CHRISTIAN', 'CATHOLIC', 'HINDU', 'BUDDHA', 'KONGHUCU') NOT NULL,
  `blood_type`              ENUM('A', 'B', 'AB', 'O') NULL,
  `marital_status`          ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') NOT NULL,
  `ktp_address`             TEXT            NOT NULL,
  `current_address`         TEXT            NOT NULL,
  `email`                   VARCHAR(255)    NOT NULL,
  `phone_number`            VARCHAR(20)     NOT NULL,
  `emergency_contact`       VARCHAR(20)     NOT NULL,
  `skills`                  TEXT            NULL,
  `willing_to_be_placed`    TINYINT(1)      NOT NULL DEFAULT 0,
  `expected_salary`         DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
  `created_at`              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`              DATETIME        NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_biodata_user_id` (`user_id`),
  UNIQUE KEY `uq_biodata_national_id` (`national_id_number`),
  INDEX `idx_biodata_full_name` (`full_name`),
  INDEX `idx_biodata_applied_position` (`applied_position`),
  INDEX `idx_biodata_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_biodata_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
