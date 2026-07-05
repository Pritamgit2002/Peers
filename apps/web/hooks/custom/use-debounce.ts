import { useEffect, useState } from "react"

export const useDebounce = <T>(
  initialValue?: T | undefined,
  delay: number = 300
) => {
  const [rawValue, setRawValue] = useState<T | undefined>(
    initialValue || undefined
  )
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(
    initialValue || undefined
  )

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(rawValue), delay)
    return () => clearTimeout(timeout)
  }, [rawValue, delay])

  return { rawValue, debouncedValue, setRawValue }
}
