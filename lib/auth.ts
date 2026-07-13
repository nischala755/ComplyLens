import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const key=()=>{
 const secret=process.env.SESSION_SECRET;
 if(!secret&&process.env.NODE_ENV==="production") throw new Error("SESSION_SECRET must be configured in production.");
 return new TextEncoder().encode(secret||"development-only-change-this-secret");
};
export type Session={email:string;role:string};
export async function createSession(session:Session){return new SignJWT(session).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(key());}
export async function getSession(){const token=(await cookies()).get("complylens_session")?.value;if(!token)return null;try{return (await jwtVerify(token,key())).payload as unknown as Session}catch{return null}}
