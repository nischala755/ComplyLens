import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db=new PrismaClient(); const future=new Date("2028-12-31"), past=new Date("2024-01-01"), granted=new Date("2025-01-01");
const rules=[
  ["DPDP-001","Consent Validation","Active, non-expired consent record exists","Critical",30],
  ["DPDP-002","Purpose Validation","Active lawful processing purpose exists","High",20],
  ["DPDP-003","Retention Validation","Retention period has not expired","High",20],
  ["DPDP-004","Transparency Notice","Transparency notice was provided","Medium",15],
  ["DPDP-005","Data Minimization","Data minimization is compliant","Medium",15]
] as const;
const people=[
  {name:"Aisha Mehta",email:"aisha@example.com",department:"Legal",ret:future,notice:true,min:"compliant",consent:true,purpose:true,links:[["integration","CRM sync","low"]]},
  {name:"Rahul Sharma",email:"rahul@example.com",department:"Marketing",ret:future,notice:true,min:"compliant",consent:false,purpose:true,links:[["campaign","Renewal campaign","high"],["workflow","Lead scoring","medium"]]},
  {name:"Priya Nair",email:"priya@example.com",department:"Finance",ret:past,notice:true,min:"compliant",consent:true,purpose:true,links:[["integration","Data warehouse","high"],["department","Finance","medium"]]},
  {name:"Arjun Rao",email:"arjun@example.com",department:"Sales",ret:past,notice:true,min:"non_compliant",consent:false,purpose:true,links:[["department","Sales","high"],["department","Customer Support","high"],["workflow","Email nurture","high"],["workflow","Billing automation","high"],["workflow","Lead routing","medium"],["workflow","Renewal alerts","medium"]]},
  {name:"Neha Kapoor",email:"neha@example.com",department:"Operations",ret:future,notice:true,min:"compliant",consent:true,purpose:false,links:[["workflow","Onboarding","medium"],["integration","Support desk","low"]]},
  {name:"Imran Khan",email:"imran@example.com",department:"Support",ret:future,notice:false,min:"compliant",consent:true,purpose:true,links:[["department","Customer Support","medium"],["campaign","Service updates","low"]]}
] as const;
async function main(){
 await db.auditLog.deleteMany(); await db.rightsRequest.deleteMany(); await db.blastRadiusLink.deleteMany(); await db.complianceRecommendation.deleteMany(); await db.complianceResult.deleteMany(); await db.complianceAssessment.deleteMany(); await db.consentRecord.deleteMany(); await db.processingPurpose.deleteMany(); await db.contact.deleteMany(); await db.complianceRuleVersion.deleteMany(); await db.complianceRule.deleteMany();
 for(const [code,name,description,severity,scoreDeduction] of rules){await db.complianceRule.create({data:{code,name,description,severity,scoreDeduction,versions:{create:{version:1,logicSummary:description}}}})}
 for(const p of people){await db.contact.create({data:{name:p.name,email:p.email,department:p.department,dataRetentionEndDate:p.ret,transparencyNoticeGiven:p.notice,dataMinimizationStatus:p.min,consentRecords:p.consent?{create:{status:"active",source:"web",grantedAt:granted,expiresAt:future,purpose:"Service delivery"}}:undefined,processingPurposes:p.purpose?{create:{purpose:"Service delivery",lawfulBasis:"Consent",active:true}}:undefined,blastRadiusLinks:{create:p.links.map(([type,name,impactLevel])=>({type,name,impactLevel,description:`${name} may process this contact's data.`}))}}})}
 const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD||"ComplyLens123!",12); await db.user.upsert({where:{email:process.env.ADMIN_EMAIL||"admin@complylens.local"},update:{passwordHash:hash},create:{email:process.env.ADMIN_EMAIL||"admin@complylens.local",passwordHash:hash,role:"compliance_officer"}});
 console.log("Seeded ComplyLens demo data. Run assessments from the app.");
}
main().finally(()=>db.$disconnect());
