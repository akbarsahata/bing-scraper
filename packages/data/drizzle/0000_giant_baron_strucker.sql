CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_id_account_id_unique` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `scraping_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`search_query_id` text NOT NULL,
	`uploaded_file_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`workflow_id` text,
	`queue_message_id` text,
	`started_at` integer,
	`completed_at` integer,
	`duration_ms` integer,
	`error_message` text,
	`retry_count` integer DEFAULT 0,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`search_query_id`) REFERENCES `search_queries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_file_id`) REFERENCES `uploaded_files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `search_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`uploaded_file_id` text NOT NULL,
	`user_id` text NOT NULL,
	`query_text` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`retry_count` integer DEFAULT 0,
	`max_retries` integer DEFAULT 3,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`uploaded_file_id`) REFERENCES `uploaded_files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `search_result_items` (
	`id` text PRIMARY KEY NOT NULL,
	`search_result_id` text NOT NULL,
	`query_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`display_url` text,
	`snippet` text,
	`type` text DEFAULT 'organic',
	`domain` text,
	`is_ad` integer DEFAULT false,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`search_result_id`) REFERENCES `search_results`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`query_id`) REFERENCES `search_queries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `search_results` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`query_id` text NOT NULL,
	`user_id` text NOT NULL,
	`query_text` text NOT NULL,
	`total_results` integer DEFAULT 0,
	`page_title` text,
	`search_url` text,
	`scraped_at` integer NOT NULL,
	`r2_screenshot_key` text,
	`r2_html_key` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `scraping_tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`query_id`) REFERENCES `search_queries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_results_task_id_query_id_unique` ON `search_results` (`task_id`,`query_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`file_name` text NOT NULL,
	`r2_key` text NOT NULL,
	`r2_bucket` text NOT NULL,
	`total_queries` integer DEFAULT 0,
	`processed_queries` integer DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`uploaded_at` integer NOT NULL,
	`processed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_files_r2_key_unique` ON `uploaded_files` (`r2_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`name` text,
	`email_verified` integer DEFAULT false,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);