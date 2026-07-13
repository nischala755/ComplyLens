import type { RuleResult } from "@/lib/types";
export function statusFor(score:number){ return score>=80?"Compliant":score>=50?"At Risk":"Non-Compliant"; }
export function calculateScore(results:RuleResult[]){ const score=Math.max(0,100-results.filter(r=>!r.passed).reduce((n,r)=>n+r.deduction,0)); return {score,status:statusFor(score)}; }
