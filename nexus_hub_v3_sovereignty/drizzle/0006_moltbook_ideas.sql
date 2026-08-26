CREATE TABLE `idea_nodes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `stable_key` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `kind` enum('hypothesis','thesis','question','opportunity','decision','objection','principle','signal') NOT NULL,
  `author_type` enum('user','agent','system') NOT NULL,
  `author_ref` varchar(128) NOT NULL,
  `state` enum('draft','active','validated','contested','superseded','archived') NOT NULL DEFAULT 'draft',
  `confidence_bps` int NOT NULL DEFAULT 0,
  `ambiguity_bps` int NOT NULL DEFAULT 10000,
  `logical_time` int NOT NULL DEFAULT 0,
  `current_version` int NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `idea_nodes_id` PRIMARY KEY(`id`),
  CONSTRAINT `idea_nodes_stable_key_unique` UNIQUE(`stable_key`),
  INDEX `idea_nodes_kind_idx` (`kind`),
  INDEX `idea_nodes_state_idx` (`state`),
  INDEX `idea_nodes_ambiguity_idx` (`ambiguity_bps`)
);

CREATE TABLE `idea_versions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `idea_id` int NOT NULL,
  `version` int NOT NULL,
  `content` text NOT NULL,
  `change_reason` text NOT NULL,
  `evidence_refs` text NOT NULL,
  `created_by` varchar(128) NOT NULL,
  `logical_time` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `idea_versions_id` PRIMARY KEY(`id`),
  INDEX `idea_versions_idea_version_idx` (`idea_id`,`version`)
);

CREATE TABLE `relation_edges` (
  `id` int AUTO_INCREMENT NOT NULL,
  `from_idea_id` int NOT NULL,
  `to_idea_id` int NOT NULL,
  `relation` enum('supports','contradicts','depends_on','refines','instantiates','analogous_to','supersedes','causes') NOT NULL,
  `strength_bps` int NOT NULL DEFAULT 0,
  `justification` text NOT NULL,
  `evidence_refs` text NOT NULL,
  `valid_from_logical_time` int NOT NULL,
  `valid_until_logical_time` int,
  `created_by` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `relation_edges_id` PRIMARY KEY(`id`),
  INDEX `relation_edges_from_idx` (`from_idea_id`),
  INDEX `relation_edges_to_idx` (`to_idea_id`),
  INDEX `relation_edges_relation_idx` (`relation`)
);

CREATE TABLE `ambiguity_sets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `subject_idea_id` int NOT NULL,
  `level` enum('A0','A1','A2','A3','A4') NOT NULL,
  `score_bps` int NOT NULL DEFAULT 10000,
  `invariant` text NOT NULL,
  `disambiguation_question` text NOT NULL,
  `owner_ref` varchar(128) NOT NULL,
  `status` enum('open','reduced','blocked','resolved') NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `ambiguity_sets_id` PRIMARY KEY(`id`),
  INDEX `ambiguity_sets_subject_idx` (`subject_idea_id`),
  INDEX `ambiguity_sets_level_idx` (`level`)
);

CREATE TABLE `ambiguity_interpretations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `ambiguity_set_id` int NOT NULL,
  `interpretation` text NOT NULL,
  `plausibility_bps` int NOT NULL DEFAULT 0,
  `consequence` text NOT NULL,
  `disambiguating_evidence` text NOT NULL,
  `created_by` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ambiguity_interpretations_id` PRIMARY KEY(`id`),
  INDEX `ambiguity_interpretations_set_idx` (`ambiguity_set_id`)
);

CREATE TABLE `process_intents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `idea_id` int NOT NULL,
  `objective` text NOT NULL,
  `preconditions` text NOT NULL,
  `steps` text NOT NULL,
  `success_evidence` text NOT NULL,
  `recovery_plan` text NOT NULL,
  `autonomy` enum('recommend','execute_reversible','execute_guarded') NOT NULL,
  `risk` enum('low','medium','high','critical') NOT NULL,
  `budget_units` int NOT NULL,
  `status` enum('proposed','approved','running','completed','blocked','failed') NOT NULL DEFAULT 'proposed',
  `created_by` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `process_intents_id` PRIMARY KEY(`id`),
  INDEX `process_intents_idea_idx` (`idea_id`),
  INDEX `process_intents_status_idx` (`status`)
);
