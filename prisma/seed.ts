import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { RULE_CATALOG } from "../lib/ruleCatalog";
const db=new PrismaClient(); const future=new Date("2028-12-31"), past=new Date("2024-01-01"), granted=new Date("2025-01-01");
const people=[
  {name:"Aisha Mehta",email:"aisha@example.com",department:"Legal",ret:future,notice:true,min:"compliant",consent:true,purpose:true,links:[["integration","CRM sync","low"]]},
  {name:"Rahul Sharma",email:"rahul@example.com",department:"Marketing",ret:future,notice:true,min:"compliant",consent:false,purpose:true,links:[["campaign","Renewal campaign","high"],["workflow","Lead scoring","medium"]]},
  {name:"Priya Nair",email:"priya@example.com",department:"Finance",ret:past,notice:true,min:"compliant",consent:true,purpose:true,links:[["integration","Data warehouse","high"],["department","Finance","medium"]]},
  {name:"Arjun Rao",email:"arjun@example.com",department:"Sales",ret:past,notice:true,min:"non_compliant",consent:false,purpose:true,links:[["department","Sales","high"],["department","Customer Support","high"],["workflow","Email nurture","high"],["workflow","Billing automation","high"],["workflow","Lead routing","medium"],["workflow","Renewal alerts","medium"]]},
  {name:"Neha Kapoor",email:"neha@example.com",department:"Operations",ret:future,notice:true,min:"compliant",consent:true,purpose:false,links:[["workflow","Onboarding","medium"],["integration","Support desk","low"]]},
  {name:"Imran Khan",email:"imran@example.com",department:"Support",ret:future,notice:false,min:"compliant",consent:true,purpose:true,links:[["department","Customer Support","medium"],["campaign","Service updates","low"]]}
] as const;
async function main(){
 await db.rightsRequest.deleteMany(); await db.blastRadiusLink.deleteMany(); await db.complianceRecommendation.deleteMany(); await db.complianceResult.deleteMany(); await db.complianceAssessment.deleteMany(); await db.consentRecord.deleteMany(); await db.processingPurpose.deleteMany(); await db.contact.deleteMany(); await db.complianceRuleVersion.deleteMany(); await db.complianceRule.deleteMany();
 for(const rule of Object.values(RULE_CATALOG)){await db.complianceRule.create({data:{code:rule.code,name:rule.name,description:rule.testMethod,severity:rule.severity,scoreDeduction:rule.deduction,legalReference:rule.legalReference,legalRequirement:rule.legalRequirement,mappingType:rule.mappingType,testMethod:rule.testMethod,scoringRationale:rule.scoringRationale,versions:{create:{version:1,logicSummary:rule.testMethod}}}})}
 for(const p of people){await db.contact.create({data:{name:p.name,email:p.email,department:p.department,dataRetentionEndDate:p.ret,transparencyNoticeGiven:p.notice,dataMinimizationStatus:p.min,consentRecords:p.consent?{create:{status:"active",source:"web",grantedAt:granted,expiresAt:future,purpose:"Service delivery"}}:undefined,processingPurposes:p.purpose?{create:{purpose:"Service delivery",lawfulBasis:"Consent",active:true}}:undefined,blastRadiusLinks:{create:p.links.map(([type,name,impactLevel])=>({type,name,impactLevel,description:`${name} may process this contact's data.`}))}}})}
 const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD||"ComplyLens123!",12); await db.user.upsert({where:{email:process.env.ADMIN_EMAIL||"admin@complylens.local"},update:{passwordHash:hash},create:{email:process.env.ADMIN_EMAIL||"admin@complylens.local",passwordHash:hash,role:"compliance_officer"}});
 console.log("Seeded ComplyLens demo data. Run assessments from the app.");
}
main().finally(()=>db.$disconnect());
