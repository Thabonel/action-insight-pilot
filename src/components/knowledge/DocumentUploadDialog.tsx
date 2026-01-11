
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKnowledgeDocuments } from '@/hooks/useKnowledge'
import { KnowledgeBucket, KnowledgeService } from '@/lib/services/knowledge-service'
import { useToast } from '@/hooks/use-toast'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buckets: KnowledgeBucket[]
  defaultBucketId?: string
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  buckets,
  defaultBucketId
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedBucket, setSelectedBucket] = useState(defaultBucketId || '')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Update selected bucket when defaultBucketId changes (e.g., opening from different bucket)
  React.useEffect(() => {
    if (open && defaultBucketId) {
      setSelectedBucket(defaultBucketId)
    }
  }, [open, defaultBucketId])

  const { uploadDocument } = useKnowledgeDocuments()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')) // Remove file extension

    try {
      const extractedContent = await KnowledgeService.extractTextFromFile(selectedFile)
      setContent(extractedContent)
    } catch (error) {
      toast({
        title: "File Processing Error",
        description: "Could not extract text from file. Please enter content manually.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !selectedBucket) return

    try {
      setIsSubmitting(true)
      await uploadDocument(
        selectedBucket,
        title.trim(),
        content.trim(),
        file?.name,
        file?.type,
        file?.size
      )

      // Reset form
      setTitle('')
      setContent('')
      setSelectedBucket('')
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Add knowledge content for your AI agents - upload a file or type directly
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bucket">Knowledge Bucket</Label>
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bucket" />
              </SelectTrigger>
              <SelectContent>
                {buckets.map(bucket => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    {bucket.name} ({bucket.bucket_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File (Optional)</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,.json,.csv"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: .txt, .md, .json, .csv
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Social Media Best Practices"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your knowledge content here..."
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              Content will be automatically chunked and processed for AI consumption
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim() || !selectedBucket}>
              {isSubmitting ? 'Adding...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
