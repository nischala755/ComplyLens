export const PENALTY_CRORE:Record<string,number>={"DPDP-001":50,"DPDP-002":50,"DPDP-003":50,"DPDP-004":50,"DPDP-005":50};
export const SDF_OBLIGATIONS=["Appoint a Data Protection Officer based in India","Undertake periodic Data Protection Impact Assessments and audits","Implement additional measures prescribed for Significant Data Fiduciaries"];
export const PHASES=[
 {id:"active",date:"2025-11-13",title:"Foundation rules active",detail:"Rules 1, 2 and 17–21 commenced on publication."},
 {id:"consent",date:"2026-11-13",title:"Consent Manager regime",detail:"Rule 4 commences one year after notification."},
 {id:"full",date:"2027-05-13",title:"Full operational rules",detail:"Rules 3, 5–16, 22 and 23 commence eighteen months after notification."}
];
export const daysUntil=(date:string)=>Math.ceil((new Date(date+"T00:00:00+05:30").getTime()-Date.now())/86400000);
