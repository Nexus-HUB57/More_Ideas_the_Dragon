CREATE TABLE `creditHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`creditsUsed` int NOT NULL,
	`description` text,
	`bindCodeId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `monthlyCredits` int DEFAULT 40000 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditResetDate` timestamp DEFAULT (now()) NOT NULL;