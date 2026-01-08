ALTER TABLE `tasks` RENAME COLUMN `description` TO `notes`;
ALTER TABLE `lists` ADD `notes` text;