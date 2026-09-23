ALTER TABLE `gallery_items` ADD `media_type` enum('image','video') DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `video_url` varchar(700);