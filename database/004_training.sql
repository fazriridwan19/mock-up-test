-- ============================================================
-- Table: training_histories
-- Description: Stores training / certification history for each biodata
-- ============================================================

CREATE TABLE IF NOT EXISTS `training_histories` (
  `id`           VARCHAR(36)  NOT NULL,
  `biodata_id`   VARCHAR(36)  NOT NULL,
  `name`         VARCHAR(255) NOT NULL,
  `organizer`    VARCHAR(255) NOT NULL,
  `year`         YEAR         NOT NULL,
  `duration`     VARCHAR(100) NULL COMMENT 'e.g. 3 days, 2 weeks',
  `certificate`  VARCHAR(255) NULL COMMENT 'Certificate number or name',
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`   DATETIME     NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_training_biodata_id` (`biodata_id`),
  INDEX `idx_training_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_training_biodata_id` FOREIGN KEY (`biodata_id`) REFERENCES `biodata` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
