import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeDocument } from '@/lib/services/knowledge-service'
import { FileText, Printer, Download, Copy, Edit2, X, RefreshCw, Trash2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const handleClose = () => onOpenChange(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-[90vw] max-w-[1200px] h-[85vh] max-h-[90vh]",
            "bg-background border shadow-lg rounded-lg",
            "flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Accessibility */}
          <DialogPrimitive.Title className="sr-only">Document Viewer</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">View and edit document content</DialogPrimitive.Description>

          {/* Header - fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 dark:bg-slate-800/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">View Document</h2>
                <p className="text-sm text-muted-foreground">View and edit your document content</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDownload(editing)} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
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
              <Button variant="ghost" size="icon" onClick={handleClose} className="ml-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content - scrollable */}
          {!document ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No document selected
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Title */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!editing}
                  className="text-lg font-medium h-12 bg-background"
                  placeholder="Document title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Content {!editing && <span className="text-xs">(Markdown rendered)</span>}
                </label>
                {editing ? (
                  <textarea
                    className="w-full min-h-[400px] rounded-lg border p-4 bg-background dark:bg-slate-900/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-relaxed font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Document content (supports Markdown)..."
                  />
                ) : (
                  <div className="rounded-lg border p-4 bg-background dark:bg-slate-900/50 prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 prose-strong:text-foreground">
                    <ReactMarkdown>{content || 'No content'}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer - fixed */}
          {document && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30 dark:bg-slate-800/50 flex-shrink-0">
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
                <Button onClick={handleSave} disabled={!editing || saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
