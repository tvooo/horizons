-- Custom migration: Add workspace-based collaboration model
-- This migration:
-- 1. Creates workspace tables
-- 2. Creates personal workspaces for existing users
-- 3. Migrates lists and tasks from user_id to workspace_id

-- Create workspaces table
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'shared' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
-- Create workspace_members table
CREATE TABLE `workspace_members` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`invited_by` text,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
-- Create workspace_invites table
CREATE TABLE `workspace_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`code` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer,
	`usage_limit` integer,
	`usage_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_invites_code_unique` ON `workspace_invites` (`code`);
--> statement-breakpoint
-- Data migration: Create a personal workspace for each existing user
INSERT INTO `workspaces` (`id`, `name`, `type`, `created_at`, `updated_at`)
SELECT 'ws_' || `id`, 'Personal', 'personal', `created_at`, `created_at`
FROM `users`;
--> statement-breakpoint
-- Data migration: Add each user as owner of their personal workspace
INSERT INTO `workspace_members` (`id`, `workspace_id`, `user_id`, `role`, `created_at`)
SELECT 'wm_' || `id`, 'ws_' || `id`, `id`, 'owner', `created_at`
FROM `users`;
--> statement-breakpoint
-- Recreate lists table with workspace_id instead of user_id
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'list' NOT NULL,
	`workspace_id` text NOT NULL,
	`parent_list_id` text,
	`archived` integer DEFAULT false NOT NULL,
	`scheduled_period_type` text,
	`scheduled_anchor_date` integer,
	`on_ice` integer DEFAULT false NOT NULL,
	`notes` text,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
-- Data migration: Copy lists with workspace_id derived from user_id
INSERT INTO `__new_lists`("id", "name", "type", "workspace_id", "parent_list_id", "archived", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "notes", "archived_at", "created_at", "updated_at")
SELECT "id", "name", "type", 'ws_' || "user_id", "parent_list_id", "archived", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "notes", "archived_at", "created_at", "updated_at" FROM `lists`;
--> statement-breakpoint
DROP TABLE `lists`;
--> statement-breakpoint
ALTER TABLE `__new_lists` RENAME TO `lists`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
CREATE INDEX `idx_lists_workspace` ON `lists` (`workspace_id`);
--> statement-breakpoint
-- Recreate tasks table with workspace_id instead of user_id
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`workspace_id` text NOT NULL,
	`list_id` text,
	`completed` integer DEFAULT false NOT NULL,
	`scheduled_period_type` text,
	`scheduled_anchor_date` integer,
	`on_ice` integer DEFAULT false NOT NULL,
	`schedule_order` text,
	`list_order` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Data migration: Copy tasks with workspace_id derived from user_id
INSERT INTO `__new_tasks`("id", "title", "notes", "workspace_id", "list_id", "completed", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "schedule_order", "list_order", "completed_at", "created_at", "updated_at")
SELECT "id", "title", "notes", 'ws_' || "user_id", "list_id", "completed", "scheduled_period_type", "scheduled_anchor_date", "on_ice", "schedule_order", "list_order", "completed_at", "created_at", "updated_at" FROM `tasks`;
--> statement-breakpoint
DROP TABLE `tasks`;
--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
CREATE INDEX `idx_tasks_workspace` ON `tasks` (`workspace_id`);
