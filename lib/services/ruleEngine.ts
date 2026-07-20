import type { AssessableContact, RuleResult } from "@/lib/types";
import { RULE_CATALOG } from "@/lib/ruleCatalog";

export function evaluateRules(contact: AssessableContact, now = new Date()): RuleResult[] {
  const validConsent = contact.consentRecords.some(c => c.status === "active" && (!c.expiresAt || new Date(c.expiresAt) > now));
  const activePurpose = contact.processingPurposes.some(p => p.active && Boolean(p.lawfulBasis));
  const retentionValid = Boolean(contact.dataRetentionEndDate && new Date(contact.dataRetentionEndDate!) >= now);
  const row = (ruleCode:keyof typeof RULE_CATALOG,passed:boolean,reasonCode:string,detail:string):RuleResult => {
    const rule=RULE_CATALOG[ruleCode];
    return {...rule,ruleCode:rule.code,deduction:rule.deduction,passed,reasonCode,detail,ruleVersion:1};
  };
  return [
    row("DPDP-001",validConsent,validConsent?"CONSENT_VALID":"CONSENT_MISSING_OR_EXPIRED",validConsent?"Active, non-expired consent is on record.":"No active, non-expired consent record was found."),
    row("DPDP-002",activePurpose,activePurpose?"PURPOSE_ACTIVE":"PURPOSE_MISSING",activePurpose?"An active processing purpose with a lawful basis exists.":"No active processing purpose with a lawful basis was found."),
    row("DPDP-003",retentionValid,retentionValid?"RETENTION_VALID":"RETENTION_EXPIRED",retentionValid?"The data retention period is current.":"The data retention period is missing or has expired."),
    row("DPDP-004",contact.transparencyNoticeGiven,contact.transparencyNoticeGiven?"NOTICE_GIVEN":"NOTICE_MISSING",contact.transparencyNoticeGiven?"The transparency notice was provided.":"The transparency notice has not been recorded as provided."),
    row("DPDP-005",contact.dataMinimizationStatus==="compliant",contact.dataMinimizationStatus==="compliant"?"MINIMIZATION_COMPLIANT":"MINIMIZATION_FAILED","Data minimization status is "+contact.dataMinimizationStatus.replace("_"," ")+".")
  ];
}
