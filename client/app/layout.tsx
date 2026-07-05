import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import "./globals.css"
import SupportButton from "@/components/supportButton"  // ✅ add this import
import Translator from "@/components/Translator";

export const metadata: Metadata = {
  title: "EasyLearn - Financial Literacy for All",
  description: "Empowering underprivileged communities through accessible financial education, tools, and resources.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          
          <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          {/* Add this just above <Footer /> inside <div className="min-h-screen flex flex-col"> */}
          <SupportButton />
          <Translator />
          <Suspense fallback={<div>Loading...</div>}>
            <Footer />
          </Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
