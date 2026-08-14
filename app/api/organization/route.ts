import{NextResponse}from"next/server";import{db}from"@/lib/db";
export async function GET(){return NextResponse.json(await db.organizationSettings.upsert({where:{id:"default"},update:{},create:{id:"default"}}))}
export async function PATCH(req:Request){const{sdfMode}=await req.json();return NextResponse.json(await db.organizationSettings.upsert({where:{id:"default"},update:{sdfMode:!!sdfMode},create:{id:"default",sdfMode:!!sdfMode}}))}
