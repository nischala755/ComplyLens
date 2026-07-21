import type { RuleResult } from "@/lib/types";
import { SCORING_RATIONALE } from "@/lib/ruleCatalog";
export { SCORING_RATIONALE };
export function statusFor(score:number,hasOpenHighOrCritical=false){
  const band=score>=80?"Compliant":score>=50?"At Risk":"Non-Compliant";
  return band==="Compliant"&&hasOpenHighOrCritical?"At Risk":band;
}
export function calculateScore(results:RuleResult[]){
  const failed=results.filter(r=>!r.passed),score=Math.max(0,100-failed.reduce((n,r)=>n+r.deduction,0));
  return {score,status:statusFor(score,failed.some(r=>r.severity==="Critical"||r.severity==="High"))};
}
