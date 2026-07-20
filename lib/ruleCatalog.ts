export type RuleDefinition = {
  code: "DPDP-001" | "DPDP-002" | "DPDP-003" | "DPDP-004" | "DPDP-005";
  name: string;
  severity: "Critical" | "High" | "Medium";
  deduction: number;
  legalReference: string;
  legalRequirement: string;
  mappingType: "direct" | "operational_proxy";
  testMethod: string;
  scoringRationale: string;
};

export const RULE_CATALOG: Record<RuleDefinition["code"], RuleDefinition> = {
  "DPDP-001": {
    code: "DPDP-001", name: "Consent Validation", severity: "Critical", deduction: 30,
    legalReference: "DPDP Act 2023, s.4(1)(a), s.5(1), s.6(1), s.6(4)",
    legalRequirement: "Processing must have a lawful purpose and consent where consent is the chosen ground; consent must be free, specific, informed, unconditional and unambiguous, and withdrawal must be as easy as giving consent.",
    mappingType: "direct",
    testMethod: "Pass only when at least one ConsentRecord has status = active and expiresAt is null or later than the assessment time. Expired and withdrawn records do not qualify.",
    scoringRationale: "Highest weighting because consent is a primary statutory processing ground in this implementation."
  },
  "DPDP-002": {
    code: "DPDP-002", name: "Purpose Validation", severity: "High", deduction: 20,
    legalReference: "DPDP Act 2023, s.4(1)–(2), s.5(1)(i)",
    legalRequirement: "Personal data may be processed only for a lawful purpose; the notice accompanying or preceding a consent request must identify the personal data and purpose.",
    mappingType: "direct",
    testMethod: "Pass only when at least one ProcessingPurpose has active = true and a non-empty lawfulBasis. This is an operational check for a recorded purpose and basis, not a legal conclusion that the basis is valid.",
    scoringRationale: "High weighting because a documented active purpose supports lawful-purpose accountability."
  },
  "DPDP-003": {
    code: "DPDP-003", name: "Retention Validation", severity: "High", deduction: 20,
    legalReference: "DPDP Act 2023, s.8(7)",
    legalRequirement: "A Data Fiduciary must erase personal data when consent is withdrawn or when it is reasonable to assume the specified purpose is no longer being served, unless retention is necessary for compliance with law.",
    mappingType: "operational_proxy",
    testMethod: "Pass only when dataRetentionEndDate exists and is on or after the assessment time. This is a configurable internal retention-schedule proxy; it does not itself determine every statutory erasure exception.",
    scoringRationale: "High weighting because overdue retention can expose data to unnecessary processing and erasure obligations."
  },
  "DPDP-004": {
    code: "DPDP-004", name: "Transparency Notice", severity: "Medium", deduction: 15,
    legalReference: "DPDP Act 2023, s.5(1)–(2)",
    legalRequirement: "A consent request must be accompanied or preceded by notice of the personal data and purpose, rights-exercise method, and Board complaint method; pre-Act consent requires a corresponding notice when reasonably practicable.",
    mappingType: "direct",
    testMethod: "Pass only when transparencyNoticeGiven = true. The current field confirms a recorded delivery event; future versions should store notice version, language, timestamp and delivery evidence.",
    scoringRationale: "Medium weighting because the rule measures notice evidence, while consent and purpose controls capture more direct processing-ground risk."
  },
  "DPDP-005": {
    code: "DPDP-005", name: "Data Minimization", severity: "Medium", deduction: 15,
    legalReference: "Internal operational control; related accountability context: DPDP Act 2023, s.8(1)–(2)",
    legalRequirement: "The Act does not create a standalone rule called “data minimization” in these sections. Section 8 requires reasonable security safeguards and reasonable efforts to ensure data is complete, accurate and consistent where it is used to make a decision or disclosed. This rule is therefore an internal privacy-control proxy, not a direct statutory test.",
    mappingType: "operational_proxy",
    testMethod: "Pass only when dataMinimizationStatus = compliant. The status is supplied by an approved internal data-inventory review and should be supported by a recorded review evidence source in a future release.",
    scoringRationale: "Medium weighting because the control is valuable for privacy risk reduction but is an internal operational proxy rather than an independent DPDP Act requirement."
  }
};

export const SCORING_RATIONALE = {
  model: "Internal risk-prioritization heuristic — not a statutory penalty formula or legal determination.",
  deductions: "30/20/20/15/15 reflects the team’s prioritization of consent as the primary processing-ground evidence, followed by purpose and retention accountability, then notice evidence and an internal minimization control.",
  bands: "80–100 is a monitored baseline with no more than one medium/high deduction; 50–79 signals remediation is needed; below 50 signals multiple or critical control failures. These thresholds must be calibrated against expert-labelled cases before production use."
} as const;
