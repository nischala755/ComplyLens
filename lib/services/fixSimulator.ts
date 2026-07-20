import { statusFor } from "./riskScoring";
import { RULE_CATALOG } from "@/lib/ruleCatalog";
const deductions=Object.fromEntries(Object.values(RULE_CATALOG).map(rule=>[rule.code,rule.deduction]));
export function projectFix(currentScore:number, results:{ruleCode:string;passed:boolean}[], ruleCodes:string[]) { const delta=results.filter(r=>!r.passed&&ruleCodes.includes(r.ruleCode)).reduce((n,r)=>n+(deductions[r.ruleCode]||0),0); const projectedScore=Math.min(100,currentScore+delta); return {currentScore,projectedScore,delta:projectedScore-currentScore,projectedStatus:statusFor(projectedScore)}; }
export async function simulateFix(assessmentId:string, proposedFixes:string[]){ const {db}=await import("@/lib/db"); const a=await db.complianceAssessment.findUnique({where:{id:assessmentId},include:{results:true}}); if(!a) throw new Error("Assessment not found"); return projectFix(a.riskScore,a.results,proposedFixes); }
