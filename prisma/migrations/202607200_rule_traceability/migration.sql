ALTER TABLE "ComplianceRule"
  ADD COLUMN "legalReference" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "legalRequirement" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "mappingType" TEXT NOT NULL DEFAULT 'operational_proxy',
  ADD COLUMN "testMethod" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "scoringRationale" TEXT NOT NULL DEFAULT '';

ALTER TABLE "ComplianceResult"
  ADD COLUMN "legalReference" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "legalRequirement" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "mappingType" TEXT NOT NULL DEFAULT 'operational_proxy',
  ADD COLUMN "testMethod" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "ruleVersion" INTEGER NOT NULL DEFAULT 1;
