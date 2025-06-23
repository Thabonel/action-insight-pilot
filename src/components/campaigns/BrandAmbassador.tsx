import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MessageSquare, CheckCircle, Clock, AlertCircle, Send, Loader2 } from 'lucide-react';
import { HttpClient } from '@/lib/http-client';
import ChatResponse from '@/components/dashboard/ChatResponse';

const httpClient = new HttpClient();

interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  category?: string;
  uploadedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  message?: string;
  response?: string;
}

const BrandAmbassador: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const response = await httpClient.get('/api/brand-documents');
      if (response.success && response.data) {
        setDocuments(response.data as Document[]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await httpClient.post('/api/brand-documents/upload', formData);
        
        if (response.success && response.data) {
          const uploadedDoc = response.data as Document;
          setDocuments(prev => [...prev, {
            id: uploadedDoc.id,
            name: file.name,
            status: 'processing',
            uploadedAt: new Date().toISOString()
          }]);
        }
      }
      
      // Refresh documents after upload
      setTimeout(() => {
        loadDocuments();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to upload documents:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
    }
  };

  const hasReadyDocuments = documents.some(doc => doc.status === 'ready');

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !hasReadyDocuments) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const readyDocs = documents
        .filter(doc => doc.status === 'ready')
        .map(doc => ({
          id: doc.id,
          name: doc.name,
          summary: doc.summary || ''
        }));

      const response = await httpClient.post('/api/brand-ambassador/chat', {
        message: userMessage,
        documents: readyDocs,
        conversationHistory: chatMessages
      });

      if (response.success && response.data) {
        const chatResponse = response.data as ChatApiResponse;
        const assistantMessage = chatResponse.message || chatResponse.response || 'No response received';
        setChatMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Brand Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Documents
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                Upload brand guidelines, product docs, marketing materials
              </span>
            </div>

            {documents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Uploaded Documents</h3>
                <div className="grid gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          {doc.summary && (
                            <div className="text-sm text-gray-600">{doc.summary}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.category && (
                          <Badge variant="outline">{doc.category}</Badge>
                        )}
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            {getStatusText(doc.status)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Brand Ambassador Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasReadyDocuments && (
              <div className="text-center p-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload and process documents to start chatting with your brand ambassador</p>
              </div>
            )}

            {chatMessages.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <ChatResponse response={message.content} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasReadyDocuments && (
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about your brand, products, or marketing strategy..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandAmbassador;
