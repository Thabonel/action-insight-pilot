import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeDocument, KnowledgeService } from '@/lib/services/knowledge-service'
import { useKnowledgeDocuments } from '@/hooks/useKnowledge'
import { DocumentViewerDialog } from './DocumentViewerDialog'

interface DocumentsListProps {
  bucketId: string
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ bucketId }) => {
  const { documents, reload, reprocessDocument } = useKnowledgeDocuments(bucketId)
  const [filter, setFilter] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeDoc, setActiveDoc] = useState<KnowledgeDocument | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (activeDoc) {
      setEditTitle(activeDoc.title)
      setEditContent(activeDoc.content)
    }
  }, [activeDoc])

  const onSave = async () => {
    if (!activeDoc) return
    await KnowledgeService.updateDocument(activeDoc.id, { title: editTitle, content: editContent })
    setViewerOpen(false)
    await reload()
  }

  const onDelete = async (doc: KnowledgeDocument) => {
    if (!confirm(`Delete document “${doc.title}”?`)) return
    await KnowledgeService.deleteDocument(doc.id)
    await reload()
  }

  const downloadDoc = (doc: KnowledgeDocument, edited = false) => {
    const nameBase = (doc.file_name || doc.title || 'document').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'document'
    const ext = doc.file_type?.includes('json') ? 'json' : 'txt'
    const content = edited ? editContent : doc.content
    const blob = new Blob([content], { type: ext === 'json' ? 'application/json' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nameBase}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const visible = documents.filter(d =>
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.content.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Documents</span>
          <Input
            placeholder="Filter documents"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No documents found</div>
        ) : (
          <div className="space-y-3">
            {visible.map(doc => (
              <div key={doc.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{doc.content}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setActiveDoc(doc); setViewerOpen(true) }}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadDoc(doc)}>Download</Button>
                    <Button size="sm" variant="outline" onClick={() => reprocessDocument(doc.id)}>Reprocess</Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDelete(doc)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DocumentViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          document={activeDoc}
          onSave={async (t, c) => { setEditTitle(t); setEditContent(c); await onSave(); }}
          onDelete={async () => { if (activeDoc) await onDelete(activeDoc) }}
          onReprocess={async () => { if (activeDoc) await reprocessDocument(activeDoc.id) }}
          onDownload={(edited) => activeDoc && downloadDoc({ ...activeDoc, title: editTitle, content: editContent }, edited)}
        />
      </CardContent>
    </Card>
  )
}
