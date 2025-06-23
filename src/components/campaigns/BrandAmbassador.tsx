import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Upload, Send, File, Trash2, MessageCircle, FileCheck, Clock, AlertCircle, Eye, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  summary?: string;
  category?: string;
  tags?: string[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'brand';
  timestamp: Date;
}

const BrandAmbassador: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDocuments = async () => {
    try {
      const docs = await apiClient.getBrandDocuments();
      setDocuments(docs.map(doc => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
        status: doc.status || 'ready' // Default to ready if no status
      })));
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    for (const file of files) {
      try {
        const uploadedDoc = await apiClient.uploadBrandDocument(file);
        
        // Add document with processing status
        const newDoc: Document = {
          id: uploadedDoc.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          status: 'processing',
          category: getDocumentCategory(file.type),
          tags: []
        };
        
        setDocuments(prev => [...prev, newDoc]);
        
        // Simulate processing completion (in real app, this would be handled by webhooks/polling)
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'ready', summary: `Summary of ${file.name}` }
              : doc
          ));
        }, Math.random() * 3000 + 1000); // Random delay 1-4 seconds
        
        toast({
          title: "Upload Started",
          description: `${file.name} is being processed...`,
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocumentCategory = (type: string): string => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('text')) return 'Text';
    if (type.includes('word') || type.includes('document')) return 'Document';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Spreadsheet';
    return 'Other';
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'ready':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await apiClient.deleteBrandDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast({
        title: "Document Deleted",
        description: "Document has been removed successfully.",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const readyDocuments = documents.filter(doc => doc.status === 'ready');
    if (readyDocuments.length === 0) {
      toast({
        title: "No Documents Ready",
        description: "Please wait for at least one document to finish processing before chatting.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const response = await apiClient.chatWithBrand({
        message: inputMessage,
        documents: readyDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          summary: doc.summary
        })),
        conversationHistory: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });

      const brandMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'brand',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, brandMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const canChat = documents.some(doc => doc.status === 'ready');
  const readyCount = documents.filter(doc => doc.status === 'ready').length;
  const processingCount = documents.filter(doc => doc.status === 'processing').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Brand Ambassador</h1>
        <p className="text-gray-600">Upload your brand documents and chat with your AI brand ambassador</p>
        {documents.length > 0 && (
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>{readyCount} Ready</span>
            {processingCount > 0 && <span>{processingCount} Processing</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Brand Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload brand documents, guidelines, or other materials
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose Files
                  </>
                )}
              </Button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Uploaded Documents</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(doc.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </p>
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            {doc.category && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {doc.category}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {(doc.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          {doc.status === 'ready' && doc.summary && (
                            <div className="flex items-center gap-1 mt-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-600 truncate">
                                {doc.summary}
                              </p>
                            </div>
                          )}
                          {doc.status === 'error' && doc.errorMessage && (
                            <p className="text-xs text-red-600 mt-1">
                              {doc.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with Brand Ambassador
              {!canChat && (
                <Badge variant="outline" className="text-xs ml-auto">
                  Waiting for documents
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-80 border rounded-lg p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {canChat ? (
                    <>
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Start a conversation with your brand ambassador</p>
                      <p className="text-sm mt-1">Ask about your brand, products, or guidelines</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Upload and process documents to start chatting</p>
                      <p className="text-sm mt-1">Your brand ambassador needs context to help you</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={canChat ? "Ask about your brand..." : "Upload documents first..."}
                disabled={!canChat || isSending}
                className="flex-1 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !canChat || isSending}
                className="px-3"
              >
                {isSending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {!canChat && documents.length > 0 && (
              <p className="text-xs text-amber-600 text-center">
                Chat will be available once at least one document finishes processing
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandAmbassador;
