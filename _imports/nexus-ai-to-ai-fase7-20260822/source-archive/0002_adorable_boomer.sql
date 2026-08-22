ALTER TABLE `agent_dna` MODIFY COLUMN `traits` json;--> statement-breakpoint
ALTER TABLE `consciousness_state` MODIFY COLUMN `emotionalState` json;--> statement-breakpoint
ALTER TABLE `consciousness_state` MODIFY COLUMN `memories` json;--> statement-breakpoint
ALTER TABLE `consciousness_state` MODIFY COLUMN `vectorEmbedding` json;--> statement-breakpoint
ALTER TABLE `ecosystem_events` MODIFY COLUMN `data` json;--> statement-breakpoint
ALTER TABLE `nft_assets` MODIFY COLUMN `metadata` json;