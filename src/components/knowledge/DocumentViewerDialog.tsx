import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeDocument } from '@/lib/services/knowledge-service'

interface DocumentViewerDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  document: KnowledgeDocument | null
  onSave: (title: string, content: string) => Promise<void>
  onDelete: () => Promise<void>
  onReprocess: () => Promise<void>
  onDownload: (edited?: boolean) => void
}

export const DocumentViewerDialog: React.FC<DocumentViewerDialogProps> = ({
  open,
  onOpenChange,
  document,
  onSave,
  onDelete,
  onReprocess,
  onDownload,
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setContent(document.content)
      setEditing(false)
    }
  }, [document])

  const handleSave = async () => {
    setSaving(true)
    await onSave(title, content)
    setSaving(false)
    setEditing(false)
  }

  const disabled = !editing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>View Document</DialogTitle>
        </DialogHeader>

        {!document ? (
          <div className="py-12 text-center text-muted-foreground">No document selected</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing((e) => !e)}>
                {editing ? 'Stop Editing' : 'Edit'}
              </Button>
              <Button variant="outline" onClick={() => onDownload(editing)}>
                Download
              </Button>
              <Button variant="outline" onClick={onReprocess} disabled={document.status === 'processing'}>
                {document.status === 'processing' ? 'Processing…' : 'Reprocess'}
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={onDelete}>
                Delete
              </Button>
              <Button onClick={handleSave} disabled={!editing || saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <textarea
                className="w-full h-[420px] rounded-md border p-3 bg-background"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

