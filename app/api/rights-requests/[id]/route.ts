import {NextResponse} from "next/server";import {db} from "@/lib/db";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params,{status}=await req.json();return NextResponse.json(await db.rightsRequest.update({where:{id},data:{status}}))}
