import { db } from "@/lib/db";

function consentRenewalDraft(name:string, purpose:string){
  return `Subject: Please renew your consent\n\nHello ${name},\n\nWe would like to continue processing your personal data for ${purpose}. Please review the current privacy notice and confirm your consent using the approved consent channel. You may withdraw consent as easily as you give it.\n\nThis is a draft only. A compliance approver must review it before it is sent.`;
}

export async function createConsentRenewal(contactId:string, actor:string){
  const contact=await db.contact.findUnique({where:{id:contactId},include:{processingPurposes:{where:{active:true},take:1}}});
  if(!contact) throw new Error("Contact not found");
  const purpose=contact.processingPurposes[0]?.purpose||"the recorded service purpose";
  const request=await db.remediationRequest.create({data:{contactId,ruleCode:"DPDP-001",type:"consent_renewal",draftContent:consentRenewalDraft(contact.name,purpose),requestedBy:actor}});
  await db.auditLog.create({data:{eventType:"remediation_drafted",contactId,actor,detail:JSON.stringify({remediationId:request.id,ruleCode:"DPDP-001",type:request.type,status:request.status})}});
  return request;
}

export async function updateRemediation(id:string,action:"approve"|"reject"|"apply",actor:string){
  const request=await db.remediationRequest.findUnique({where:{id}}); if(!request) throw new Error("Remediation request not found");
  if(action==="approve"&&request.status!=="pending_approval") throw new Error("Only pending drafts can be approved.");
  if(action==="apply"&&request.status!=="approved") throw new Error("Only approved drafts can be applied.");
  if(action==="reject"&&request.status!=="pending_approval") throw new Error("Only pending drafts can be rejected.");
  const data=action==="approve"?{status:"approved",approvedBy:actor}:action==="reject"?{status:"rejected"}:{status:"applied",appliedBy:actor,appliedAt:new Date()};
  const updated=await db.remediationRequest.update({where:{id},data});
  await db.auditLog.create({data:{eventType:`remediation_${action}`,contactId:request.contactId,actor,detail:JSON.stringify({remediationId:id,ruleCode:request.ruleCode,status:updated.status})}});
  return updated;
}
