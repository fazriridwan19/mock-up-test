-- ============================================================
-- Table: education_histories
-- Description: Stores education history for each biodata
-- ============================================================

CREATE TABLE IF NOT EXISTS `education_histories` (
  `id`           VARCHAR(36)  NOT NULL,
  `biodata_id`   VARCHAR(36)  NOT NULL,
  `institution`  VARCHAR(255) NOT NULL,
  `major`        VARCHAR(255) NOT NULL,
  `degree`       ENUM('SD', 'SMP', 'SMA', 'SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3') NOT NULL,
  `start_year`   YEAR         NOT NULL,
  `end_year`     YEAR         NULL,
  `gpa`          DECIMAL(4,2) NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`   DATETIME     NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_edu_biodata_id` (`biodata_id`),
  INDEX `idx_edu_degree` (`degree`),
  INDEX `idx_edu_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_education_biodata_id` FOREIGN KEY (`biodata_id`) REFERENCES `biodata` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
