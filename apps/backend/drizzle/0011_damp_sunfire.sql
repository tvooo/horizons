ALTER TABLE `lists` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `completed_at` integer;--> statement-breakpoint
UPDATE `lists` SET `archived_at` = `updated_at` WHERE `archived` = 1 AND `archived_at` IS NULL;--> statement-breakpoint
UPDATE `tasks` SET `completed_at` = `updated_at` WHERE `completed` = 1 AND `completed_at` IS NULL;