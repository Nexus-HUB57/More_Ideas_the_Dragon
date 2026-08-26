ALTER TABLE `orchestrator_missions`
  ADD COLUMN `executive_role` varchar(16),
  ADD COLUMN `skill_key` varchar(96),
  ADD COLUMN `evidence_ref` varchar(512),
  ADD COLUMN `approval_ref` varchar(255),
  ADD COLUMN `rollback_plan` text,
  ADD COLUMN `idempotency_key` varchar(255),
  ADD COLUMN `security_review_ref` varchar(255),
  ADD COLUMN `audit_ref` varchar(255),
  ADD COLUMN `external_side_effect` boolean NOT NULL DEFAULT false;
