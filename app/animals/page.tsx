"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { categories } from "@/lib/game-data"
import { useGame } from "@/components/game-provider"
import { useAudio } from "@/components/audio-provider"
import { ArrowLeft, Home, Lightbulb, Zap } from "lucide-react"

export default function AnimalsPage() {
  const router = useRouter()
  const { state, dispatch } = useGame()
  const { playCorrect, playIncorrect, playComplete, playClick } = useAudio()

  const category = categories.find((cat) => cat.id === "animals")!
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showFunFact, setShowFunFact] = useState(false)
  const [categoryScore, setCategoryScore] = useState(0)
  const [categoryCorrect, setCategoryCorrect] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = category.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / category.questions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    playClick()
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === currentQuestion.correctAnswer
    const points = isCorrect ? 100 + state.currentStreak * 10 : 0

    if (isCorrect) {
      playCorrect()
      setCategoryScore((prev) => prev + points)
      setCategoryCorrect((prev) => prev + 1)
    } else {
      playIncorrect()
    }

    dispatch({
      type: "ANSWER_QUESTION",
      correct: isCorrect,
      points,
    })

    setTimeout(() => {
      if (currentQuestion.funFact) {
        setShowFunFact(true)
      }
    }, 1500)
  }

  const handleNextQuestion = () => {
    playClick()

    if (currentQuestionIndex < category.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setShowFunFact(false)
    } else {
      setIsComplete(true)
      playComplete()

      if (categoryCorrect + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0) === category.questions.length) {
        dispatch({ type: "COMPLETE_CATEGORY", categoryId: category.id })
      }
    }
  }

  const handleReturnHome = () => {
    playClick()
    router.push("/")
  }

  if (isComplete) {
    const finalCorrect = categoryCorrect + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)
    const accuracy = Math.round((finalCorrect / category.questions.length) * 100)

    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card className={`bg-gradient-to-r ${category.color} bounce-in`}>
            <CardContent className="p-8 text-center text-white">
              <div className="text-6xl mb-4">
                {accuracy === 100 ? "🏆" : accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👏" : "🤔"}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {accuracy === 100
                  ? "Perfect!"
                  : accuracy >= 80
                    ? "Excellent!"
                    : accuracy >= 60
                      ? "Good Job!"
                      : "Keep Trying!"}
              </h1>
              <div className="space-y-2 mb-6">
                <p className="text-xl">Score: {categoryScore} points</p>
                <p className="text-lg">Accuracy: {accuracy}%</p>
                <p className="text-lg">
                  {finalCorrect}/{category.questions.length} correct
                </p>
              </div>

              {accuracy === 100 && (
                <div className="bg-yellow-500/20 rounded-lg p-4 mb-6">
                  <p className="font-bold">🎯 Category Mastered!</p>
                  <p className="text-sm">You've unlocked the Category Master achievement!</p>
                </div>
              )}

              <Button onClick={handleReturnHome} className="w-full bg-white text-black hover:bg-gray-100 font-bold">
                <Home className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80 text-sm">
              Question {currentQuestionIndex + 1} of {category.questions.length}
            </p>
          </div>
          <div className="text-white text-sm">Score: {categoryScore}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className={`bg-gradient-to-r ${category.color} mb-6 bounce-in`}>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <span className="text-4xl mb-4 block">{category.emoji}</span>
              <h2 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass =
                  "w-full p-4 text-left bg-white/20 hover:bg-white/30 text-white border-2 border-transparent transition-all duration-300"

                if (showResult) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += " bg-green-500 border-green-300 pulse-success"
                  } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass += " bg-red-500 border-red-300 pulse-error shake"
                  }
                }

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                )
              })}
            </div>

            {/* Fun Fact */}
            {showFunFact && currentQuestion.funFact && (
              <div className="mt-6 bg-white/20 rounded-lg p-4 bounce-in">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-300 font-bold text-sm">Fun Fact!</p>
                    <p className="text-white text-sm">{currentQuestion.funFact}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            {showResult && (
              <Button
                onClick={handleNextQuestion}
                className="w-full mt-6 bg-white text-black hover:bg-gray-100 font-bold bounce-in"
              >
                {currentQuestionIndex < category.questions.length - 1 ? "Next Question" : "Finish Category"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Streak Indicator */}
        {state.currentStreak > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 mr-2" />
              <span className="font-bold">Streak: {state.currentStreak}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
