import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeDocument, KnowledgeService } from '@/lib/services/knowledge-service'
import { useKnowledgeDocuments } from '@/hooks/useKnowledge'

interface DocumentsListProps {
  bucketId: string
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ bucketId }) => {
  const { documents, reload, reprocessDocument } = useKnowledgeDocuments(bucketId)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<KnowledgeDocument | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (editing) {
      setEditTitle(editing.title)
      setEditContent(editing.content)
    }
  }, [editing])

  const onSave = async () => {
    if (!editing) return
    await KnowledgeService.updateDocument(editing.id, { title: editTitle, content: editContent })
    setEditing(null)
    await reload()
  }

  const onDelete = async (doc: KnowledgeDocument) => {
    if (!confirm(`Delete document “${doc.title}”?`)) return
    await KnowledgeService.deleteDocument(doc.id)
    await reload()
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
                    <Button size="sm" variant="outline" onClick={() => setEditing(doc)}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => reprocessDocument(doc.id)}>Reprocess</Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDelete(doc)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border rounded-lg p-4 bg-card">
            <div className="mb-3">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <textarea
              className="w-full h-64 rounded-md border p-3 bg-background"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <Button onClick={onSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Close</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
