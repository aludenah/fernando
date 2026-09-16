CREATE TABLE `classroom` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher` text NOT NULL,
	`teacher_email` text NOT NULL,
	`student_email` text DEFAULT '' NOT NULL,
	`student` text
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`task` text NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	FOREIGN KEY (`task`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_files_task` ON `files` (`task`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`task` text PRIMARY KEY NOT NULL,
	`student` text NOT NULL,
	`answers` text DEFAULT '{}' NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`submitted` text,
	`score` real,
	`feedback` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`task`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subject` text NOT NULL,
	`instructions` text NOT NULL,
	`due` text NOT NULL,
	`questions` text NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
