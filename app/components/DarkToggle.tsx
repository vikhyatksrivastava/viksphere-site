"use client"

import { useEffect, useState } from 'react'

export default function DarkToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dark') === 'true'
    setOn(stored)
    document.documentElement.classList.toggle('dark', stored)
  }, [])

  useEffect(() => {
    localStorage.setItem('dark', String(on))
    document.documentElement.classList.toggle('dark', on)
  }, [on])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOn(!on)}
        className="bg-slate-800 text-white px-3 py-2 rounded shadow-lg"
      >
        {on ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}
