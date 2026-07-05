import { useState } from "react"

export const useLocalStorage = <T>(
  key: string
): {
  value: T | null
  setValue: (value: T) => void
  removeValue: () => void
} => {
  const [value, setValueState] = useState<T | null>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : null
  })

  const setValue = (newValue: T) => {
    localStorage.setItem(key, JSON.stringify(newValue))
    setValueState(newValue)
  }

  const removeValue = () => {
    localStorage.removeItem(key)
    setValueState(null)
  }

  return { value, setValue, removeValue }
}
