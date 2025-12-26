ALTER TABLE `accounts` ADD `password` text;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;