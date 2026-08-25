CREATE TABLE `executive_agents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `role` enum('CEO','CTO','CPO','COO','CFO','CRO') NOT NULL,
  `nucleus` enum('CEO','CTO','COO','CFO','CRO') NOT NULL,
  `name` varchar(128) NOT NULL,
  `mandate` text NOT NULL,
  `reports_to` varchar(32) NOT NULL,
  `authority_tier` int NOT NULL,
  `autonomy_mode` varchar(64) NOT NULL,
  `max_budget_bps` int NOT NULL,
  `status` enum('active','paused','quarantined') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
  CONSTRAINT `executive_agents_id` PRIMARY KEY(`id`),
  CONSTRAINT `executive_agents_role_unique` UNIQUE(`role`)
);
--> statement-breakpoint
CREATE INDEX `executive_agents_nucleus_idx` ON `executive_agents` (`nucleus`);
--> statement-breakpoint
CREATE INDEX `executive_agents_status_idx` ON `executive_agents` (`status`);
