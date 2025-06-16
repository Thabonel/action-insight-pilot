
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function SettingsForm() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your account settings have been updated.",
    })
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <Button onClick={handleSave} className="w-full">
        Save Changes
      </Button>
    </div>
  )
}
