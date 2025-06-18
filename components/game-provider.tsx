"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { type GameStats, achievements } from "@/lib/game-data"

interface GameState extends GameStats {
  currentStreak: number
}

type GameAction =
  | { type: "ANSWER_QUESTION"; correct: boolean; points: number }
  | { type: "COMPLETE_CATEGORY"; categoryId: string }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; state: GameState }

const initialState: GameState = {
  totalScore: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  categoriesCompleted: [],
  achievements: [],
  currentStreak: 0,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ANSWER_QUESTION":
      const newState = {
        ...state,
        questionsAnswered: state.questionsAnswered + 1,
        correctAnswers: action.correct ? state.correctAnswers + 1 : state.correctAnswers,
        totalScore: action.correct ? state.totalScore + action.points : state.totalScore,
        currentStreak: action.correct ? state.currentStreak + 1 : 0,
      }

      // Check for new achievements
      const newAchievements = achievements
        .filter((achievement) => !state.achievements.includes(achievement.id) && achievement.condition(newState))
        .map((achievement) => achievement.id)

      return {
        ...newState,
        achievements: [...state.achievements, ...newAchievements],
      }

    case "COMPLETE_CATEGORY":
      return {
        ...state,
        categoriesCompleted: [...state.categoriesCompleted, action.categoryId],
      }

    case "RESET_GAME":
      return initialState

    case "LOAD_GAME":
      return action.state

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("trivia-game-state")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        dispatch({ type: "LOAD_GAME", state: parsedState })
      } catch (error) {
        console.error("Failed to load game state:", error)
      }
    }
  }, [])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("trivia-game-state", JSON.stringify(state))
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
