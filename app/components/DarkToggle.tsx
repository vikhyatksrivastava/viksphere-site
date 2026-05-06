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
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => setOn(!on)}
        aria-label={on ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-100 shadow-lg shadow-slate-900/20 dark:shadow-slate-400/10 flex items-center justify-center text-white dark:text-slate-900 transition-all hover:scale-110 active:scale-95 hover:bg-slate-700 dark:hover:bg-white"
      >
        {on ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>
    </div>
  )
}
