import{NextResponse}from"next/server";import{db}from"@/lib/db";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params,b=await req.json(),data=b.action==="dpbi"?{dpbiNotifiedAt:new Date()}:b.action==="principal"?{principalNotifiedAt:new Date()}:{notificationStatus:"closed"};return NextResponse.json(await db.incidentLog.update({where:{id},data}))}
