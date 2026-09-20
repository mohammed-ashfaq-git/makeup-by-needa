CREATE TABLE `admin_sessions` (
	`token_hash` varchar(64) NOT NULL,
	`admin_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `admin_sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	`last_login_at` datetime,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `artist_profile` (
	`id` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`photo_url` varchar(500),
	`short_bio` varchar(500) NOT NULL,
	`bio` text NOT NULL,
	`experience` varchar(255),
	`specialties` text,
	`qualifications` text,
	`location` varchar(120),
	`instagram` varchar(160),
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiry_number` varchar(20) NOT NULL,
	`name` varchar(120) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`email` varchar(255) NOT NULL,
	`service` varchar(200) NOT NULL,
	`event_date` date NOT NULL,
	`event_time` varchar(60),
	`location` varchar(160) NOT NULL,
	`people` varchar(40),
	`message` text NOT NULL,
	`status` enum('NEW','CONTACTED','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `enquiries_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(300) NOT NULL,
	`answer` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`title` varchar(160) NOT NULL,
	`caption` varchar(300),
	`alt_text` varchar(200),
	`category` enum('Makeup','Bridal','Hair','Nails') NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('Makeup','Hair','Nails') NOT NULL,
	`short_description` varchar(300),
	`description` text NOT NULL,
	`price` decimal(10,2),
	`price_display` varchar(100),
	`duration` varchar(100),
	`image_url` varchar(500),
	`featured` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mime_type` varchar(60) NOT NULL,
	`byte_size` int NOT NULL,
	`data` longblob NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `site_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int NOT NULL,
	`business_name` varchar(160) NOT NULL,
	`logo_url` varchar(500),
	`phone` varchar(50),
	`email` varchar(255) NOT NULL,
	`whatsapp_number` varchar(30) NOT NULL,
	`whatsapp_display` varchar(50) NOT NULL,
	`whatsapp_message` varchar(500) NOT NULL,
	`location` varchar(120) NOT NULL,
	`address` varchar(255),
	`hours` varchar(255),
	`instagram_makeup_handle` varchar(120) NOT NULL,
	`instagram_makeup_url` varchar(500) NOT NULL,
	`instagram_nails_handle` varchar(120) NOT NULL,
	`instagram_nails_url` varchar(500) NOT NULL,
	`facebook_url` varchar(500),
	`home_title` varchar(255) NOT NULL,
	`home_description` varchar(500) NOT NULL,
	`footer_text` varchar(500) NOT NULL,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_name` varchar(120) NOT NULL,
	`quote` text NOT NULL,
	`rating` tinyint NOT NULL DEFAULT 5,
	`photo_url` varchar(500),
	`service` varchar(160),
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_admin_id_admin_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_sessions_admin_id_idx` ON `admin_sessions` (`admin_id`);--> statement-breakpoint
CREATE INDEX `enquiries_status_idx` ON `enquiries` (`status`);--> statement-breakpoint
CREATE INDEX `enquiries_created_at_idx` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `faqs_display_order_idx` ON `faqs` (`display_order`);--> statement-breakpoint
CREATE INDEX `gallery_display_order_idx` ON `gallery_items` (`display_order`);--> statement-breakpoint
CREATE INDEX `services_display_order_idx` ON `services` (`display_order`);--> statement-breakpoint
CREATE INDEX `testimonials_display_order_idx` ON `testimonials` (`display_order`);