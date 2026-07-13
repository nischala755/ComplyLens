import { db } from "@/lib/db";
import { evaluateRules } from "./ruleEngine";
import { calculateScore } from "./riskScoring";
import { generateRecommendations } from "./readinessAdvisor";
export async function runAssessment(contactId:string,actor="system"){
  const contact=await db.contact.findUnique({where:{id:contactId},include:{consentRecords:true,processingPurposes:true}}); if(!contact) throw new Error("Contact not found");
  const results=evaluateRules(contact), summary=calculateScore(results);
  const assessment=await db.complianceAssessment.create({data:{contactId,riskScore:summary.score,status:summary.status,violationCount:results.filter(r=>!r.passed).length,results:{create:results.map(r=>({ruleCode:r.ruleCode,passed:r.passed,reasonCode:r.reasonCode,detail:r.detail}))}},include:{results:true}});
  const recommendations=await generateRecommendations(assessment.id);
  await db.auditLog.create({data:{eventType:"assessment_run",contactId,actor,detail:JSON.stringify({assessmentId:assessment.id,score:summary.score,status:summary.status,failedRules:results.filter(r=>!r.passed).map(r=>r.ruleCode)})}});
  return {...assessment,recommendations};
}
export async function runBatchAssessment(ids:string[],actor="system"){ return Promise.all(ids.map(id=>runAssessment(id,actor))); }
