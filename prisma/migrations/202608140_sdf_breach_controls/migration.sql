ALTER TABLE "IncidentLog" ADD COLUMN "dpbiNotifiedAt" TIMESTAMP(3), ADD COLUMN "principalNotifiedAt" TIMESTAMP(3);
CREATE TABLE "OrganizationSettings" ("id" TEXT NOT NULL DEFAULT 'default', "sdfMode" BOOLEAN NOT NULL DEFAULT false, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id"));
INSERT INTO "OrganizationSettings" ("id", "sdfMode", "updatedAt") VALUES ('default', false, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;
