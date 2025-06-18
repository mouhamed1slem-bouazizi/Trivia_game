"use client"

import type React from "react"
import { createContext, useContext, useRef, useEffect, useState } from "react"

interface AudioContextType {
  playCorrect: () => void
  playIncorrect: () => void
  playComplete: () => void
  playClick: () => void
  toggleMusic: () => void
  isMusicPlaying: boolean
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements
    backgroundMusicRef.current = new Audio("/placeholder.mp3?query=upbeat background music")
    backgroundMusicRef.current.loop = true
    backgroundMusicRef.current.volume = 0.3

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
      }
    }
  }, [])

  const playSound = (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
    if (typeof window !== "undefined" && "AudioContext" in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    }
  }

  const playCorrect = () => {
    // Play a pleasant ascending tone
    playSound(523, 0.2) // C5
    setTimeout(() => playSound(659, 0.2), 100) // E5
    setTimeout(() => playSound(784, 0.3), 200) // G5
  }

  const playIncorrect = () => {
    // Play a descending "wrong" sound
    playSound(200, 0.5, "square")
  }

  const playComplete = () => {
    // Play a victory fanfare
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => playSound(note, 0.3), index * 150)
    })
  }

  const playClick = () => {
    playSound(800, 0.1, "triangle")
  }

  const toggleMusic = () => {
    if (backgroundMusicRef.current) {
      if (isMusicPlaying) {
        backgroundMusicRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        backgroundMusicRef.current.play().catch(console.error)
        setIsMusicPlaying(true)
      }
    }
  }

  return (
    <AudioContext.Provider
      value={{
        playCorrect,
        playIncorrect,
        playComplete,
        playClick,
        toggleMusic,
        isMusicPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
