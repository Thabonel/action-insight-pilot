
import React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-8 px-2"
    >
      <span className="text-xs">{theme === 'light' ? 'Dark' : 'Light'}</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
