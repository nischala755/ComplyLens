CREATE TABLE "RemediationRequest" (
  "id" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending_approval',
  "draftContent" TEXT NOT NULL,
  "requestedBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "appliedBy" TEXT,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RemediationRequest_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "RemediationRequest" ADD CONSTRAINT "RemediationRequest_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "RemediationRequest_contactId_status_idx" ON "RemediationRequest"("contactId", "status");
