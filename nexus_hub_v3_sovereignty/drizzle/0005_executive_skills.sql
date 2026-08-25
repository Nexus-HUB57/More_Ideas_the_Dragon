CREATE TABLE `executive_skills` (
  `id` int AUTO_INCREMENT NOT NULL,
  `skill_key` varchar(96) NOT NULL,
  `role` enum('CEO','CTO','CPO','COO','CFO','CRO') NOT NULL,
  `name` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `artifact` varchar(160) NOT NULL,
  `risk` enum('low','medium','high') NOT NULL,
  `autonomy` enum('recommend','execute_reversible','execute_guarded') NOT NULL,
  `kpis` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
  CONSTRAINT `executive_skills_id` PRIMARY KEY(`id`),
  CONSTRAINT `executive_skills_skill_key_unique` UNIQUE(`skill_key`)
);
--> statement-breakpoint
CREATE INDEX `executive_skills_role_idx` ON `executive_skills` (`role`);
--> statement-breakpoint
CREATE INDEX `executive_skills_risk_idx` ON `executive_skills` (`risk`);
