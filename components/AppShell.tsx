"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, ScrollText, UsersRound, BookOpenCheck, LogOut } from "lucide-react";

const links=[
  ["/dashboard","Overview",LayoutDashboard],
  ["/rules","Rule mapping",BookOpenCheck],
  ["/rights","Rights requests",UsersRound],
  ["/audit","Audit trail",ScrollText]
] as const;

export function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname(),router=useRouter();
  return <div className="min-h-screen"><header className="h-16 bg-[#102747] text-white flex items-center px-5 md:px-8 justify-between sticky top-0 z-20"><Link href="/dashboard" className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-[#1ba399] flex items-center justify-center"><ShieldCheck size={21}/></span><div><div className="font-bold tracking-tight">ComplyLens</div><div className="text-[10px] text-slate-300 tracking-widest uppercase">DPDP Copilot</div></div></Link><nav className="hidden md:flex gap-1">{links.map(([href,label,Icon])=><Link key={href} href={href} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${pathname.startsWith(href)?"bg-white/12 text-white":"text-slate-300 hover:text-white"}`}><Icon size={16}/>{label}</Link>)}</nav><button aria-label="Log out" className="p-2 text-slate-300 hover:text-white" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.push("/login")}}><LogOut size={19}/></button></header><main className="max-w-[1400px] mx-auto p-4 md:p-8">{children}</main></div>;
}
