
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCampaigns } from '@/hooks/useCampaigns'
import { KnowledgeBucket } from '@/lib/services/knowledge-service'

interface CreateBucketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBucket: (name: string, type: 'campaign' | 'general', description?: string, campaignId?: string) => Promise<KnowledgeBucket>
}

export const CreateBucketDialog: React.FC<CreateBucketDialogProps> = ({
  open,
  onOpenChange,
  onCreateBucket
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bucketType, setBucketType] = useState<'campaign' | 'general'>('general')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { campaigns } = useCampaigns()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      await onCreateBucket(
        name.trim(),
        bucketType,
        description.trim() || undefined,
        bucketType === 'campaign' ? selectedCampaign : undefined
      )
      
      // Reset form
      setName('')
      setDescription('')
      setBucketType('general')
      setSelectedCampaign('')
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Bucket</DialogTitle>
          <DialogDescription>
            Create a new knowledge bucket to organize your marketing information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bucket Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q4 Campaign Knowledge"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Bucket Type</Label>
            <Select value={bucketType} onValueChange={(value: 'campaign' | 'general') => setBucketType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Marketing Knowledge</SelectItem>
                <SelectItem value="campaign">Campaign-Specific Knowledge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bucketType === 'campaign' && (
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what kind of knowledge this bucket will contain..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Bucket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
