import { Mistral } from "@mistralai/mistralai";
import { db } from "@/lib/db";
import { getBlastRadius } from "./blastRadius";
import { simulateFix } from "./fixSimulator";
const SYSTEM=`You are the ComplyLens compliance explainer. You explain DPDP (India's Digital Personal Data Protection Act, 2023) results already computed by a deterministic rule engine. Only reference facts in the supplied JSON. Explain rules in plain language and recommendations in priority order. What-if numbers must come only from supplied simulation data. You MUST NOT assert or change compliance status, provide legal interpretation beyond rule descriptions, invent data, or suggest the engine's decision could differ. If asked outside scope, say so plainly.`;
export async function explainCompliance(contactId:string,question:string,actor="user"){
  const contact=await db.contact.findUnique({where:{id:contactId},select:{id:true,name:true,department:true,assessments:{orderBy:{assessedAt:"desc"},take:1,include:{results:true,recommendations:{orderBy:{priority:"asc"}}}}}}); if(!contact||!contact.assessments[0]) throw new Error("Run an assessment before asking a question.");
  const assessment=contact.assessments[0]; const blastRadius=await getBlastRadius(contactId); let simulation;
  if(/consent|renew/i.test(question)&&/improve|score|what if/i.test(question)) simulation=await simulateFix(assessment.id,["DPDP-001"]);
  const context={contact:{name:contact.name,department:contact.department},assessment,blastRadius,simulation};
  await db.auditLog.create({data:{eventType:"ai_question",contactId,actor,detail:question}});
  if(!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is not configured.");
  const client=new Mistral({apiKey:process.env.MISTRAL_API_KEY});
  const response=await client.chat.complete({model:"mistral-large-latest",messages:[{role:"system",content:SYSTEM},{role:"user",content:`Context:\n${JSON.stringify(context)}\n\nQuestion: ${question}`}]});
  const content=response.choices?.[0]?.message?.content; const answer=typeof content==="string"?content:"I could not produce an explanation.";
  await db.auditLog.create({data:{eventType:"ai_answer",contactId,actor:"ai",detail:answer}}); return answer;
}
