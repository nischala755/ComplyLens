import { db } from "@/lib/db";
export async function getBlastRadius(contactId:string){
  const [links,assessment]=await Promise.all([db.blastRadiusLink.findMany({where:{contactId},orderBy:[{impactLevel:"asc"},{type:"asc"}]}),db.complianceAssessment.findFirst({where:{contactId},orderBy:{assessedAt:"desc"}})]);
  const count=(t:string)=>links.filter(x=>x.type===t).length; const highs=links.filter(x=>x.impactLevel==="high").length;
  const exposureLevel=assessment?.status==="Non-Compliant"&&highs>=2?"high":(assessment?.status!=="Compliant"&&(highs>0||links.length>=3)?"medium":"low");
  return {counts:{departments:count("department"),workflows:count("workflow"),campaigns:count("campaign"),integrations:count("integration")},items:links,exposureLevel};
}
