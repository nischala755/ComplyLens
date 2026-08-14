import{NextResponse}from"next/server";import{db}from"@/lib/db";
export async function GET(){return NextResponse.json(await db.incidentLog.findMany({orderBy:{occurredAt:"desc"}}))}
export async function POST(req:Request){const b=await req.json();return NextResponse.json(await db.incidentLog.create({data:{occurredAt:new Date(b.occurredAt),description:String(b.description),affectedContacts:Number(b.affectedContacts),notificationStatus:"open"}}),{status:201})}
