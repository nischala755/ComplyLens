export type Consent = { status: string; expiresAt?: Date | string | null };
export type Purpose = { active: boolean; lawfulBasis?: string };
export type AssessableContact = { dataRetentionEndDate?: Date | string | null; transparencyNoticeGiven: boolean; dataMinimizationStatus: string; consentRecords: Consent[]; processingPurposes: Purpose[] };
export type RuleResult = { ruleCode: string; name: string; severity: "Critical"|"High"|"Medium"; deduction: number; passed: boolean; reasonCode: string; detail: string; legalReference: string; legalRequirement: string; mappingType: string; testMethod: string; ruleVersion: number };
