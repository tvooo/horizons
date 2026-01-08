ALTER TABLE `tasks` RENAME COLUMN "description" TO "notes";--> statement-breakpoint
ALTER TABLE `lists` ADD `notes` text;