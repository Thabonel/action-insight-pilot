
import React, { useState, useEffect } from 'react';
import { Upload, FileText, MessageCircle, Send, AlertCircle, CheckCircle, Loader2, X, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client-interface';

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
  timestamp: Date;
}

const BrandAmbassador = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await apiClient.getBrandDocuments();
      
      if (response.success && response.data) {
        setDocuments(response.data.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          status: doc.status || 'ready',
          summary: doc.summary,
          category: doc.category,
          uploadedAt: doc.uploadedAt || new Date().toISOString()
        })));
      }
    } catch (error) {
      toast({
        title: "Error loading documents",
        description: "Failed to load brand documents",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      setIsUploading(true);
      const response = await apiClient.uploadBrandDocument(file);
      
      if (response.success && response.data) {
        const newDoc: Document = {
          id: response.data.id,
          name: file.name,
          status: 'processing',
          uploadedAt: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDoc]);
        
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded and is being processed`,
        });

        // Refresh documents to get updated status
        setTimeout(() => {
          loadDocuments();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await apiClient.deleteBrandDocument(docId);
      
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        toast({
          title: "Document deleted",
          description: "Document has been removed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      processing: 'default',
      ready: 'default',
      error: 'destructive'
    } as const;

    const colors = {
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const canChat = documents.some(doc => doc.status === 'ready');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canChat) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsChatLoading(true);

    try {
      // Prepare context for the API call
      const readyDocuments = documents.filter(doc => doc.status === 'ready');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiClient.chatWithBrand(newMessage, {
        documents: readyDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          summary: doc.summary || ''
        })),
        conversationHistory
      });
      
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message || response.data,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast({
        title: "Chat error",
        description: "Failed to get response from brand ambassador",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Management Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Brand Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.md"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center ${
                    isUploading ? 'opacity-50' : ''
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isUploading ? 'Uploading...' : 'Click to upload brand documents'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX, TXT, MD files supported
                  </span>
                </label>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(doc.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.summary && (
                            <p className="text-xs text-gray-500 truncate">
                              {doc.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.category && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {doc.category}
                            </Badge>
                          )}
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Brand Ambassador Chat
              {!canChat && (
                <Badge variant="secondary" className="ml-2">
                  Upload documents to start
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  {canChat 
                    ? "Start a conversation about your brand!" 
                    : "Upload and process documents to begin chatting"
                  }
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={canChat ? "Ask about your brand..." : "Upload documents first"}
                disabled={!canChat || isChatLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !canChat || isChatLoading}
                className="px-4"
              >
                {isChatLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandAmbassador;
