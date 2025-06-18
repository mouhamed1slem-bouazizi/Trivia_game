import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AudioProvider } from "@/components/audio-provider"
import { GameProvider } from "@/components/game-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trivia Mania - The Ultimate Quiz Game",
  description: "Test your knowledge with our hilarious trivia game!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AudioProvider>
          <GameProvider>{children}</GameProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
