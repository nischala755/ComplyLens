import {NextResponse} from "next/server";import {db} from "@/lib/db";
export async function GET(){return NextResponse.json(await db.rightsRequest.findMany({include:{contact:{select:{name:true}}},orderBy:{dueDate:"asc"}}))}
export async function POST(req:Request){const b=await req.json();const due=new Date(Date.now()+Number(b.slaHours||72)*3600000);return NextResponse.json(await db.rightsRequest.create({data:{contactId:b.contactId,type:b.type,status:"open",slaHours:Number(b.slaHours||72),dueDate:due}}),{status:201})}
