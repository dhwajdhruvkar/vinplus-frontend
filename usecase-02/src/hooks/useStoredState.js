import { useEffect, useRef, useState } from 'react'

function read(key, fallback, validate) {
  try {
    const saved = validate(JSON.parse(localStorage.getItem(key)))
    if (saved !== undefined) return saved
  } catch {
    // unreadable or blocked storage falls back to the default
  }
  return typeof fallback === 'function' ? fallback() : fallback
}

export function useStoredState(key, fallback, validate) {
  const [value, setValue] = useState(() => read(key, fallback, validate))
  const initial = useRef(value)
  useEffect(() => {
    if (value === initial.current) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage may be unavailable; the in-memory state still works
    }
  }, [key, value])
  return [value, setValue]
}
