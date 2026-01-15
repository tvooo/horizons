PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'list' NOT NULL,
	`user_id` text NOT NULL,
	`parent_list_id` text,
	`archived` integer DEFAULT false NOT NULL,
	`scheduled_period_type` text,
	`scheduled_anchor_date` integer,
	`on_ice` integer DEFAULT false NOT NULL,
	`notes` text,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_lists`("id", "name", "type", "user_id", "parent_list_id", "archived", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "notes", "archived_at", "created_at", "updated_at") SELECT "id", "name", "type", "user_id", "parent_list_id", "archived", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "notes", "archived_at", "created_at", "updated_at" FROM `lists`;--> statement-breakpoint
DROP TABLE `lists`;--> statement-breakpoint
ALTER TABLE `__new_lists` RENAME TO `lists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`user_id` text NOT NULL,
	`list_id` text,
	`completed` integer DEFAULT false NOT NULL,
	`scheduled_period_type` text,
	`scheduled_anchor_date` integer,
	`on_ice` integer DEFAULT false NOT NULL,
	`schedule_order` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "title", "notes", "user_id", "list_id", "completed", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "schedule_order", "completed_at", "created_at", "updated_at") SELECT "id", "title", "notes", "user_id", "list_id", "completed", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "schedule_order", "completed_at", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;