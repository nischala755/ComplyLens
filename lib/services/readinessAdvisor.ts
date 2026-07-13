import { db } from "@/lib/db";
const actions:Record<string,string>={"DPDP-001":"Renew and record explicit consent","DPDP-002":"Document an active lawful processing purpose","DPDP-003":"Review, delete, or lawfully extend retained data","DPDP-004":"Issue and record the transparency notice","DPDP-005":"Reduce collected fields and confirm minimization"};
const deductions:Record<string,number>={"DPDP-001":30,"DPDP-002":20,"DPDP-003":20,"DPDP-004":15,"DPDP-005":15};
export async function generateRecommendations(assessmentId:string){
  const a=await db.complianceAssessment.findUnique({where:{id:assessmentId},include:{results:true}}); if(!a) throw new Error("Assessment not found");
  const failed=a.results.filter(r=>!r.passed).sort((x,y)=>deductions[y.ruleCode]-deductions[x.ruleCode]);
  await db.complianceRecommendation.deleteMany({where:{assessmentId}});
  if(!failed.length) return [];
  await db.complianceRecommendation.createMany({data:failed.map((r,i)=>({assessmentId,ruleCode:r.ruleCode,action:actions[r.ruleCode],expectedScoreImprovement:deductions[r.ruleCode],priority:i+1}))});
  return db.complianceRecommendation.findMany({where:{assessmentId},orderBy:{priority:"asc"}});
}
