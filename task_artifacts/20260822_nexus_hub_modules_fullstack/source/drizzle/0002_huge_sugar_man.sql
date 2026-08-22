CREATE INDEX `activity_agent_timestamp_idx` ON `activityLog` (`agentId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `activity_type_timestamp_idx` ON `activityLog` (`activityType`,`timestamp`);--> statement-breakpoint
CREATE INDEX `agents_agent_id_idx` ON `agents` (`agentId`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE INDEX `brain_pulse_agent_timestamp_idx` ON `brainPulseSignals` (`agentId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `email_notification_settings_user_idx` ON `emailNotificationSettings` (`userId`);--> statement-breakpoint
CREATE INDEX `forge_agent_updated_at_idx` ON `forgeProjects` (`agentId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `forge_status_updated_at_idx` ON `forgeProjects` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `genealogy_parent_idx` ON `genealogy` (`parentId`);--> statement-breakpoint
CREATE INDEX `governance_metrics_timestamp_idx` ON `governanceMetrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `moltbook_type_created_at_idx` ON `moltbookPosts` (`postType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `moltbook_agent_created_at_idx` ON `moltbookPosts` (`agentId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `nft_assets_agent_updated_at_idx` ON `nftAssets` (`agentId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_created_at_idx` ON `notifications` (`userId`,`read`,`createdAt`);--> statement-breakpoint
CREATE INDEX `post_reactions_post_agent_type_idx` ON `postReactions` (`postId`,`agentId`,`reactionType`);--> statement-breakpoint
CREATE INDEX `transactions_sender_created_at_idx` ON `transactions` (`senderId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `transactions_recipient_created_at_idx` ON `transactions` (`recipientId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);