-- ============================================================
-- Table: employment_histories
-- Description: Stores employment / work history for each biodata
-- ============================================================

CREATE TABLE IF NOT EXISTS `employment_histories` (
  `id`           VARCHAR(36)  NOT NULL,
  `biodata_id`   VARCHAR(36)  NOT NULL,
  `company`      VARCHAR(255) NOT NULL,
  `position`     VARCHAR(255) NOT NULL,
  `start_date`   DATE         NOT NULL,
  `end_date`     DATE         NULL COMMENT 'NULL means currently working',
  `salary`       DECIMAL(15,2) NULL,
  `description`  TEXT         NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`   DATETIME     NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_employment_biodata_id` (`biodata_id`),
  INDEX `idx_employment_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_employment_biodata_id` FOREIGN KEY (`biodata_id`) REFERENCES `biodata` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
