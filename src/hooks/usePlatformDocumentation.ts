
import { useEffect } from 'react'
import { DocumentationKnowledgeService } from '@/lib/services/documentation-knowledge-service'
import { useToast } from '@/hooks/use-toast'

export function usePlatformDocumentation() {
  const { toast } = useToast()

  useEffect(() => {
    const initializeDocs = async () => {
      try {
        await DocumentationKnowledgeService.initializePlatformDocumentation()
        console.log('Platform documentation initialized successfully')
      } catch (error) {
        console.error('Failed to initialize platform documentation:', error)
        toast({
          title: "Documentation Setup",
          description: "Platform documentation is being set up in the background for AI assistance.",
          variant: "default"
        })
      }
    }

    // Initialize documentation on first load
    initializeDocs()
  }, [toast])

  return {
    searchPlatformDocs: DocumentationKnowledgeService.searchPlatformDocumentation
  }
}
