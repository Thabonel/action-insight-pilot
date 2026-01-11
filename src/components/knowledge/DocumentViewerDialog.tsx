import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeDocument } from '@/lib/services/knowledge-service'
import { FileText, Printer, Download, Copy, Edit2, X, RefreshCw, Trash2, Save } from 'lucide-react'

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

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${title}</title></head>
          <body style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">${title}</h1>
            <div style="white-space: pre-wrap; line-height: 1.6;">${content}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const disabled = !editing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">View Document</h2>
              <p className="text-sm text-muted-foreground">View and edit your document content</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(editing)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={() => setEditing((e) => !e)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {editing ? 'Editing' : 'Edit'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!document ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No document selected
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={disabled}
                className="text-lg font-medium h-12 bg-background"
                placeholder="Document title"
              />
            </div>

            {/* Content Section */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[400px] h-[calc(100vh-420px)] rounded-lg border p-4 bg-background dark:bg-slate-900/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={disabled}
                  placeholder="Document content..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {document && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReprocess}
                disabled={document.status === 'processing'}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${document.status === 'processing' ? 'animate-spin' : ''}`} />
                {document.status === 'processing' ? 'Processing...' : 'Reprocess'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                {document.status === 'ready' && 'Ready'}
                {document.status === 'processing' && 'Processing...'}
                {document.status === 'failed' && 'Failed'}
              </span>
              <Button
                onClick={handleSave}
                disabled={!editing || saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

