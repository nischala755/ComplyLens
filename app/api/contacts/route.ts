import {NextResponse} from "next/server"; import {db} from "@/lib/db";
export async function GET(){const rows=await db.contact.findMany({include:{assessments:{orderBy:{assessedAt:"desc"},take:1}},orderBy:{name:"asc"}});return NextResponse.json(rows.map(({assessments,...c})=>({...c,latestAssessment:assessments[0]||null})))}
