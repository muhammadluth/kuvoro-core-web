import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"Kuvoro — Your work, together", description:"A cozy virtual office to connect, focus, and work together." };
export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
