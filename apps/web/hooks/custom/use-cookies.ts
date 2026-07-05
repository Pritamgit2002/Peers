"use client"

import { useState, useCallback } from "react"

function getCookie(key: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : undefined
}

function setCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export function useCookies<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const raw = getCookie(key)
    if (raw === undefined) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value
        setCookie(key, JSON.stringify(next))
        return next
      })
    },
    [key]
  )

  return [state, setValue]
}
