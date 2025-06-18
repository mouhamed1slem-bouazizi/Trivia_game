"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categories, achievements } from "@/lib/game-data"
import { useGame } from "@/components/game-provider"
import { useAudio } from "@/components/audio-provider"
import { Trophy, Music, MicOffIcon as MusicOff, Star } from "lucide-react"

export default function HomePage() {
  const { state } = useGame()
  const { toggleMusic, isMusicPlaying, playClick } = useAudio()
  const [showAchievements, setShowAchievements] = useState(false)

  const handleCategoryClick = () => {
    playClick()
  }

  const unlockedAchievements = achievements.filter((achievement) => state.achievements.includes(achievement.id))

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 bounce-in">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Trivia Mania</h1>
          <p className="text-white/80 text-lg">Test your brain, have a laugh!</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{state.totalScore}</div>
              <div className="text-sm opacity-80">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{state.correctAnswers}</div>
              <div className="text-sm opacity-80">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{state.categoriesCompleted.length}</div>
              <div className="text-sm opacity-80">Categories</div>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleMusic} className="text-white hover:bg-white/20">
              {isMusicPlaying ? <Music className="w-5 h-5" /> : <MusicOff className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Achievements Button */}
        <Button
          onClick={() => setShowAchievements(!showAchievements)}
          className="w-full mb-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </Button>

        {/* Achievements Panel */}
        {showAchievements && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 bounce-in">
            <h3 className="text-white font-bold mb-3">🏆 Your Achievements</h3>
            <div className="space-y-2">
              {achievements.map((achievement) => {
                const isUnlocked = state.achievements.includes(achievement.id)
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center p-2 rounded-lg ${isUnlocked ? "bg-yellow-500/20" : "bg-gray-500/20"}`}
                  >
                    <span className="text-2xl mr-3">{achievement.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${isUnlocked ? "text-yellow-300" : "text-gray-400"}`}>
                        {achievement.name}
                      </div>
                      <div className={`text-sm ${isUnlocked ? "text-white/80" : "text-gray-500"}`}>
                        {achievement.description}
                      </div>
                    </div>
                    {isUnlocked && <Star className="w-5 h-5 text-yellow-400" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Choose Your Challenge!</h2>
          {categories.map((category, index) => {
            const isCompleted = state.categoriesCompleted.includes(category.id)
            return (
              <Link key={category.id} href={`/${category.id}`} onClick={handleCategoryClick} className="block">
                <Card
                  className={`bg-gradient-to-r ${category.color} hover:scale-105 transition-all duration-300 bounce-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{category.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">{category.name}</h3>
                          <p className="text-white/80 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {isCompleted && <Badge className="bg-green-500 text-white">✓ Complete</Badge>}
                        <div className="text-white/80 text-sm">{category.questions.length} questions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-8 text-white/60">
          <p className="text-sm">🎯 Ready to become a trivia legend? 🎯</p>
        </div>
      </div>
    </div>
  )
}
