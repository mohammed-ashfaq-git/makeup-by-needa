CREATE TABLE `admin_users` (
	`id` varchar(30) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `artist_profiles` (
	`id` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Needa',
	`profile_image` varchar(500),
	`short_bio` text,
	`full_bio` text,
	`experience` text,
	`specialties` text,
	`qualifications` text,
	`location` varchar(255),
	`instagram` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` varchar(30) NOT NULL,
	`enquiry_number` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`service` varchar(255),
	`event_date` datetime,
	`event_date_raw` varchar(100),
	`preferred_time` varchar(100),
	`location` varchar(255),
	`people` int,
	`people_raw` varchar(50),
	`message` text NOT NULL,
	`enquiry_status` enum('NEW','CONTACTED','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `enquiries_enquiry_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` varchar(30) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_images` (
	`id` varchar(30) NOT NULL,
	`image` varchar(500) NOT NULL,
	`title` varchar(255),
	`caption` text,
	`alt_text` varchar(500),
	`gallery_category` enum('Makeup','Bridal','Hair','Nails'),
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`short_description` text,
	`description` text NOT NULL,
	`price` decimal(10,2),
	`price_text` varchar(255) DEFAULT 'Enquire for pricing',
	`duration` varchar(255),
	`image` varchar(500),
	`service_category` enum('Makeup','Hair','Nails') NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` varchar(30) NOT NULL,
	`business_name` varchar(255) NOT NULL DEFAULT 'Makeup by Needa',
	`logo` varchar(500),
	`phone` varchar(50),
	`email` varchar(255),
	`whatsapp` varchar(50),
	`whatsapp_display` varchar(50),
	`whatsapp_message` text,
	`location` varchar(255),
	`address` varchar(500),
	`hours` varchar(255),
	`instagram` varchar(255),
	`instagram_url` varchar(500),
	`instagram_makeup` varchar(255),
	`instagram_makeup_url` varchar(500),
	`instagram_nails` varchar(255),
	`instagram_nails_url` varchar(500),
	`facebook` varchar(500),
	`homepage_title` text,
	`homepage_description` text,
	`footer_text` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(30) NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`testimonial` text NOT NULL,
	`rating` tinyint NOT NULL DEFAULT 5,
	`client_photo` varchar(500),
	`service` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
