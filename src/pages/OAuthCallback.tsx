import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const OAuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // The oauth-callback edge function handles the OAuth flow
    // and redirects back to the connect-platforms page
    // This component is just a fallback in case the redirect doesn't work
    const timer = setTimeout(() => {
      navigate('/app/connect-platforms')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Processing OAuth callback...</h2>
        <p className="text-muted-foreground">
          You will be redirected shortly.
        </p>
      </div>
    </div>
  )
}

export default OAuthCallback