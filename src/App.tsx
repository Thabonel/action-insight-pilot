import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SettingsForm } from '@/components/settings/SettingsForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Link } from 'react-router-dom'
import { usePlatformDocumentation } from '@/hooks/usePlatformDocumentation'

function App() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  // Initialize platform documentation for AI assistance
  usePlatformDocumentation()

  return (
    <div className="flex items-center justify-between space-x-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className='w-96'>
          <SheetHeader>
            <SheetTitle>Account Settings</SheetTitle>
            <SheetDescription>
              Make changes to your account here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <SettingsForm />
        </SheetContent>
      </Sheet>

      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/campaigns">Campaigns</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/conversational">AI Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/user-manual">User Manual</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut()
                  .then(() => {
                    apiClient.post('/api/logout')
                    toast({
                      title: 'Success',
                      description: 'Signed out successfully.',
                    })
                  })
                  .catch(() => {
                    toast({
                      title: 'Error',
                      description: 'There was an error signing out.',
                      variant: 'destructive',
                    })
                  })
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default App
