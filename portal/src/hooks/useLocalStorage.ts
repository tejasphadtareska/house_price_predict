'use client'

import { useEffect, useRef, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialValueRef = useRef(initialValue)
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(key)
      if (rawValue) {
        setValue(JSON.parse(rawValue) as T)
      }
    } catch {
      setValue(initialValueRef.current)
    } finally {
      setHydrated(true)
    }
  }, [key])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [hydrated, key, value])

  return { value, setValue, hydrated }
}
