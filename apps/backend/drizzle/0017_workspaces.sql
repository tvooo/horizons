-- Create workspaces table
CREATE TABLE `workspaces` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `type` text DEFAULT 'shared' NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- Create workspace_members table
CREATE TABLE `workspace_members` (
  `id` text PRIMARY KEY NOT NULL,
  `workspace_id` text NOT NULL REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `role` text DEFAULT 'member' NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `invited_by` text REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Create workspace_invites table
CREATE TABLE `workspace_invites` (
  `id` text PRIMARY KEY NOT NULL,
  `workspace_id` text NOT NULL REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
  `code` text NOT NULL UNIQUE,
  `created_by` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `expires_at` integer,
  `usage_limit` integer,
  `usage_count` integer DEFAULT 0 NOT NULL
);

-- Create a personal workspace for each existing user
INSERT INTO `workspaces` (`id`, `name`, `type`, `created_at`, `updated_at`)
SELECT 'ws_' || `id`, 'Personal', 'personal', `created_at`, `created_at`
FROM `users`;

-- Add each user as owner of their personal workspace
INSERT INTO `workspace_members` (`id`, `workspace_id`, `user_id`, `role`, `created_at`)
SELECT 'wm_' || `id`, 'ws_' || `id`, `id`, 'owner', `created_at`
FROM `users`;

-- Add workspace_id column to lists
ALTER TABLE `lists` ADD COLUMN `workspace_id` text REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Update lists with workspace_id based on user_id
UPDATE `lists` SET `workspace_id` = 'ws_' || `user_id`;

-- Add workspace_id column to tasks
ALTER TABLE `tasks` ADD COLUMN `workspace_id` text REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Update tasks with workspace_id based on user_id
UPDATE `tasks` SET `workspace_id` = 'ws_' || `user_id`;
