import "./globals.css";import type{Metadata}from"next";
export const metadata:Metadata={title:"ComplyLens — DPDP Compliance Copilot",description:"Deterministic DPDP compliance monitoring and remediation"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
