-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema kosangeu
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema kosangeu
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `kosangeu` DEFAULT CHARACTER SET utf8 COLLATE utf8_estonian_ci ;
-- -----------------------------------------------------
-- Schema kosan
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema kosan
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `kosan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `kosangeu` ;

-- -----------------------------------------------------
-- Table `kosangeu`.`system_configs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`system_configs` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `config_key` VARCHAR(100) NOT NULL,
  `config_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`config_key` ASC) ,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`users` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('guest', 'admin', 'manager') NOT NULL DEFAULT 'guest',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`email` ASC) ,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role` ASC) ,
  INDEX `idx_users_email` (`email` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`rooms` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `room_number` VARCHAR(20) NOT NULL,
  `type` ENUM('standard', 'deluxe', 'suite') NOT NULL DEFAULT 'standard',
  `base_price` DECIMAL(12,2) NOT NULL,
  `status` ENUM('available', 'occupied', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
  `floor` TINYINT NOT NULL DEFAULT 1,
  `area_sqm` DECIMAL(5,1) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`room_number` ASC) ,
  PRIMARY KEY (`id`),
  INDEX `idx_rooms_status` (`status` ASC) ,
  INDEX `idx_rooms_floor` (`floor` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`room_photos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`room_photos` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `room_id` CHAR(36) NOT NULL,
  `photo_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_room_photos_room` (`room_id` ASC) ,
  INDEX (`room_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`room_id`)
    REFERENCES `kosangeu`.`rooms` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`room_facilities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`room_facilities` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `room_id` CHAR(36) NOT NULL,
  `facility_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_room_facilities_room` (`room_id` ASC) ,
  INDEX (`room_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`room_id`)
    REFERENCES `kosangeu`.`rooms` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`pricing_configs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`pricing_configs` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `strategy_name` VARCHAR(100) NOT NULL,
  `type` ENUM('fixed', 'seasonal', 'discount') NOT NULL DEFAULT 'fixed',
  `modifier_value` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `valid_from` DATE NULL DEFAULT NULL,
  `valid_until` DATE NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pricing_active` (`is_active` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`bookings` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `room_id` CHAR(36) NOT NULL,
  `guest_id` CHAR(36) NOT NULL,
  `pricing_config_id` CHAR(36) NULL DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `total_price` DECIMAL(12,2) NOT NULL,
  `pricing_strategy` VARCHAR(100) NOT NULL DEFAULT 'Harga Normal',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_bookings_room` (`room_id` ASC) ,
  INDEX `idx_bookings_guest` (`guest_id` ASC) ,
  INDEX `idx_bookings_status` (`status` ASC) ,
  INDEX (`room_id` ASC) ,
  INDEX (`guest_id` ASC) ,
  INDEX (`pricing_config_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`room_id`)
    REFERENCES `kosangeu`.`rooms` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`guest_id`)
    REFERENCES `kosangeu`.`users` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`pricing_config_id`)
    REFERENCES `kosangeu`.`pricing_configs` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`tenants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`tenants` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `user_id` CHAR(36) NOT NULL,
  `room_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `move_in_date` DATE NOT NULL,
  `move_out_date` DATE NULL DEFAULT NULL,
  `status` ENUM('active', 'moved_out', 'terminated') NOT NULL DEFAULT 'active',
  `emergency_contact` VARCHAR(200) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`booking_id` ASC) ,
  PRIMARY KEY (`id`),
  INDEX `idx_tenants_user` (`user_id` ASC) ,
  INDEX `idx_tenants_room` (`room_id` ASC) ,
  INDEX `idx_tenants_status` (`status` ASC) ,
  INDEX (`user_id` ASC) ,
  INDEX (`room_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`user_id`)
    REFERENCES `kosangeu`.`users` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`room_id`)
    REFERENCES `kosangeu`.`rooms` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`booking_id`)
    REFERENCES `kosangeu`.`bookings` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`payments` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `booking_id` CHAR(36) NOT NULL,
  `tenant_id` CHAR(36) NULL DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `method` ENUM('transfer_bank', 'gopay', 'ovo', 'qris', 'cash') NOT NULL DEFAULT 'transfer_bank',
  `status` ENUM('pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
  `due_date` DATE NOT NULL,
  `paid_date` DATE NULL DEFAULT NULL,
  `receipt_url` VARCHAR(500) NULL DEFAULT NULL,
  `payment_strategy` VARCHAR(50) NOT NULL DEFAULT 'transfer_bank',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_booking` (`booking_id` ASC) ,
  INDEX `idx_payments_status` (`status` ASC) ,
  INDEX `idx_payments_due_date` (`due_date` ASC) ,
  INDEX (`booking_id` ASC) ,
  INDEX (`tenant_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`booking_id`)
    REFERENCES `kosangeu`.`bookings` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`tenant_id`)
    REFERENCES `kosangeu`.`tenants` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`complaints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`complaints` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `tenant_id` CHAR(36) NOT NULL,
  `handled_by` CHAR(36) NULL DEFAULT NULL,
  `category` ENUM('facility', 'administration', 'environment') NOT NULL DEFAULT 'facility',
  `description` TEXT NOT NULL,
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `routing_strategy` VARCHAR(50) NOT NULL DEFAULT 'facility',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_complaints_tenant` (`tenant_id` ASC) ,
  INDEX `idx_complaints_status` (`status` ASC) ,
  INDEX `idx_complaints_category` (`category` ASC) ,
  INDEX (`tenant_id` ASC) ,
  INDEX (`handled_by` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`tenant_id`)
    REFERENCES `kosangeu`.`tenants` (`id`),
  CONSTRAINT ``
    FOREIGN KEY (`handled_by`)
    REFERENCES `kosangeu`.`users` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`notifications` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `user_id` CHAR(36) NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `channel` ENUM('email', 'whatsapp', 'push') NOT NULL DEFAULT 'push',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `is_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `sent_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id` ASC) ,
  INDEX `idx_notifications_unread` (`user_id` ASC, `is_read` ASC) ,
  INDEX `idx_notifications_event` (`event_type` ASC) ,
  INDEX (`user_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`user_id`)
    REFERENCES `kosangeu`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosangeu`.`activity_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosangeu`.`activity_logs` (
  `id` CHAR(36) NOT NULL DEFAULT UUID(),
  `user_id` CHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` CHAR(36) NULL DEFAULT NULL,
  `old_value` JSON NULL DEFAULT NULL,
  `new_value` JSON NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_logs_user` (`user_id` ASC) ,
  INDEX `idx_logs_entity` (`entity_type` ASC, `entity_id` ASC) ,
  INDEX `idx_logs_created_at` (`created_at` ASC) ,
  INDEX (`user_id` ASC) ,
  CONSTRAINT ``
    FOREIGN KEY (`user_id`)
    REFERENCES `kosangeu`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

USE `kosan` ;

-- -----------------------------------------------------
-- Table `kosan`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`users` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('guest', 'admin', 'manager') NOT NULL DEFAULT 'guest',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) ,
  INDEX `idx_users_role` (`role` ASC) ,
  INDEX `idx_users_email` (`email` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`activity_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`activity_logs` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `user_id` CHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` CHAR(36) NULL DEFAULT NULL,
  `old_value` JSON NULL DEFAULT NULL,
  `new_value` JSON NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_logs_user` (`user_id` ASC) ,
  INDEX `idx_logs_entity` (`entity_type` ASC, `entity_id` ASC) ,
  INDEX `idx_logs_created_at` (`created_at` ASC) ,
  CONSTRAINT `activity_logs_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `kosan`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`rooms` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `room_number` VARCHAR(20) NOT NULL,
  `type` ENUM('standard', 'deluxe', 'suite') NOT NULL DEFAULT 'standard',
  `base_price` DECIMAL(12,2) NOT NULL,
  `status` ENUM('available', 'occupied', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
  `floor` TINYINT NOT NULL DEFAULT '1',
  `area_sqm` DECIMAL(5,1) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `room_number` (`room_number` ASC) ,
  INDEX `idx_rooms_status` (`status` ASC) ,
  INDEX `idx_rooms_floor` (`floor` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`pricing_configs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`pricing_configs` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `strategy_name` VARCHAR(100) NOT NULL,
  `type` ENUM('fixed', 'seasonal', 'discount') NOT NULL DEFAULT 'fixed',
  `modifier_value` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `is_active` TINYINT(1) NOT NULL DEFAULT '0',
  `valid_from` DATE NULL DEFAULT NULL,
  `valid_until` DATE NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pricing_active` (`is_active` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`bookings` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `room_id` CHAR(36) NOT NULL,
  `guest_id` CHAR(36) NOT NULL,
  `pricing_config_id` CHAR(36) NULL DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `total_price` DECIMAL(12,2) NOT NULL,
  `pricing_strategy` VARCHAR(100) NOT NULL DEFAULT 'Harga Normal',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `pricing_config_id` (`pricing_config_id` ASC) ,
  INDEX `idx_bookings_room` (`room_id` ASC) ,
  INDEX `idx_bookings_guest` (`guest_id` ASC) ,
  INDEX `idx_bookings_status` (`status` ASC) ,
  CONSTRAINT `bookings_ibfk_1`
    FOREIGN KEY (`room_id`)
    REFERENCES `kosan`.`rooms` (`id`),
  CONSTRAINT `bookings_ibfk_2`
    FOREIGN KEY (`guest_id`)
    REFERENCES `kosan`.`users` (`id`),
  CONSTRAINT `bookings_ibfk_3`
    FOREIGN KEY (`pricing_config_id`)
    REFERENCES `kosan`.`pricing_configs` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`tenants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`tenants` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `user_id` CHAR(36) NOT NULL,
  `room_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `move_in_date` DATE NOT NULL,
  `move_out_date` DATE NULL DEFAULT NULL,
  `status` ENUM('active', 'moved_out', 'terminated') NOT NULL DEFAULT 'active',
  `emergency_contact` VARCHAR(200) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `booking_id` (`booking_id` ASC) ,
  INDEX `idx_tenants_user` (`user_id` ASC) ,
  INDEX `idx_tenants_room` (`room_id` ASC) ,
  INDEX `idx_tenants_status` (`status` ASC) ,
  CONSTRAINT `tenants_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `kosan`.`users` (`id`),
  CONSTRAINT `tenants_ibfk_2`
    FOREIGN KEY (`room_id`)
    REFERENCES `kosan`.`rooms` (`id`),
  CONSTRAINT `tenants_ibfk_3`
    FOREIGN KEY (`booking_id`)
    REFERENCES `kosan`.`bookings` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`complaints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`complaints` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `tenant_id` CHAR(36) NOT NULL,
  `handled_by` CHAR(36) NULL DEFAULT NULL,
  `category` ENUM('facility', 'administration', 'environment') NOT NULL DEFAULT 'facility',
  `description` TEXT NOT NULL,
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `routing_strategy` VARCHAR(50) NOT NULL DEFAULT 'facility',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `handled_by` (`handled_by` ASC) ,
  INDEX `idx_complaints_tenant` (`tenant_id` ASC) ,
  INDEX `idx_complaints_status` (`status` ASC) ,
  INDEX `idx_complaints_category` (`category` ASC) ,
  CONSTRAINT `complaints_ibfk_1`
    FOREIGN KEY (`tenant_id`)
    REFERENCES `kosan`.`tenants` (`id`),
  CONSTRAINT `complaints_ibfk_2`
    FOREIGN KEY (`handled_by`)
    REFERENCES `kosan`.`users` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`notifications` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `user_id` CHAR(36) NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `channel` ENUM('email', 'whatsapp', 'push') NOT NULL DEFAULT 'push',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT '0',
  `is_sent` TINYINT(1) NOT NULL DEFAULT '0',
  `sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id` ASC) ,
  INDEX `idx_notifications_unread` (`user_id` ASC, `is_read` ASC) ,
  INDEX `idx_notifications_event` (`event_type` ASC) ,
  CONSTRAINT `notifications_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `kosan`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`payments` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `booking_id` CHAR(36) NOT NULL,
  `tenant_id` CHAR(36) NULL DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `method` ENUM('transfer_bank', 'gopay', 'ovo', 'qris', 'cash') NOT NULL DEFAULT 'transfer_bank',
  `status` ENUM('pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
  `due_date` DATE NOT NULL,
  `paid_date` DATE NULL DEFAULT NULL,
  `receipt_url` VARCHAR(500) NULL DEFAULT NULL,
  `payment_strategy` VARCHAR(50) NOT NULL DEFAULT 'transfer_bank',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `tenant_id` (`tenant_id` ASC) ,
  INDEX `idx_payments_booking` (`booking_id` ASC) ,
  INDEX `idx_payments_status` (`status` ASC) ,
  INDEX `idx_payments_due_date` (`due_date` ASC) ,
  CONSTRAINT `payments_ibfk_1`
    FOREIGN KEY (`booking_id`)
    REFERENCES `kosan`.`bookings` (`id`),
  CONSTRAINT `payments_ibfk_2`
    FOREIGN KEY (`tenant_id`)
    REFERENCES `kosan`.`tenants` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`room_facilities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`room_facilities` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `room_id` CHAR(36) NOT NULL,
  `facility_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_room_facilities_room` (`room_id` ASC) ,
  CONSTRAINT `room_facilities_ibfk_1`
    FOREIGN KEY (`room_id`)
    REFERENCES `kosan`.`rooms` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`room_photos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`room_photos` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `room_id` CHAR(36) NOT NULL,
  `photo_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT '0',
  `sort_order` TINYINT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  INDEX `idx_room_photos_room` (`room_id` ASC) ,
  CONSTRAINT `room_photos_ibfk_1`
    FOREIGN KEY (`room_id`)
    REFERENCES `kosan`.`rooms` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kosan`.`system_configs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kosan`.`system_configs` (
  `id` CHAR(36) NOT NULL DEFAULT uuid(),
  `config_key` VARCHAR(100) NOT NULL,
  `config_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `config_key` (`config_key` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
