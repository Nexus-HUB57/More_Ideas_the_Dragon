CREATE TABLE `account_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`type` enum('comissao','saque','ajuste','bonus') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`relatedPaymentId` int,
	`relatedCommissionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `account_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`balance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`totalEarned` decimal(12,2) NOT NULL DEFAULT '0.00',
	`totalWithdrawn` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_affiliateId_unique` UNIQUE(`affiliateId`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int,
	`careerLevel` enum('inscrito','agente_autonomo','consultor','mentor','executivo','socio_investidor','socio_gestor','socio_jr_group') NOT NULL DEFAULT 'inscrito',
	`status` enum('ativo','inativo','suspenso') NOT NULL DEFAULT 'ativo',
	`accumulatedPoints` int NOT NULL DEFAULT 0,
	`monthlyPoints` int NOT NULL DEFAULT 0,
	`directDownlineCount` int NOT NULL DEFAULT 0,
	`totalDownlineCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `career_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`requiredPoints` int NOT NULL,
	`investmentAmount` decimal(10,2),
	`directCommissionRate` decimal(5,2) NOT NULL,
	`level2CommissionRate` decimal(5,2) NOT NULL,
	`level3CommissionRate` decimal(5,2) NOT NULL,
	`level4CommissionRate` decimal(5,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `career_levels_level_unique` UNIQUE(`level`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`paymentId` int NOT NULL,
	`level` int NOT NULL,
	`commissionRate` decimal(5,2) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('pendente','pago') NOT NULL DEFAULT 'pendente',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ebooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`fileUrl` text,
	`category` varchar(100),
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`downloadCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`paymentId` int,
	`ticketNumber` varchar(50) NOT NULL,
	`lotteryDrawDate` timestamp,
	`status` enum('ativo','sorteado','expirado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lottery_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`sponsorId` int NOT NULL,
	`level` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`bank` varchar(100),
	`accountNumber` varchar(50),
	`paymentDate` timestamp NOT NULL,
	`status` enum('pendente','identificado','confirmado') NOT NULL DEFAULT 'pendente',
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
