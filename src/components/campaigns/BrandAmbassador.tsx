import React, { useState, useRef } from 'react';
import { Upload, FileText, MessageCircle, Send, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HttpClient } from '@/lib/http-client';

// Document interface and component types
interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  category?: string;
  error?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BrandAmbassador: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Create HttpClient instance
  const httpClient = new HttpClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add document with processing status
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          status: 'processing'
        };
        
        setDocuments(prev => [...prev, newDoc]);
        
        try {
          const response = await httpClient.post('/api/documents/upload', formData);
          
          if (response.success && response.data) {
            // Update document with ready status and metadata
            setDocuments(prev => prev.map(doc => 
              doc.id === newDoc.id 
                ? {
                    ...doc,
                    status: 'ready' as const,
                    summary: response.data.summary || 'Document processed successfully',
                    category: response.data.category || 'General'
                  }
                : doc
            ));
            
            toast({
              title: "Document uploaded",
              description: `${file.name} has been processed and is ready for chat.`,
            });
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (error) {
          // Update document with error status
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? {
                  ...doc,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : doc
          ));
          
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. ${error instanceof Error ? error.message : 'Please try again.'}`,
            variant: "destructive",
          });
        }
      });
      
      await Promise.all(uploadPromises);
    } catch (error) {
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const readyDocuments = documents.filter(doc => doc.status === 'ready');
    if (readyDocuments.length === 0) {
      toast({
        title: "No documents ready",
        description: "Please wait for documents to finish processing before chatting.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const chatData = {
        message: inputMessage,
        documents: readyDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          summary: doc.summary || ''
        })),
        conversationHistory: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      const response = await httpClient.post('/api/chat/brand', chatData);
      
      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: response.data.message || response.data.response || 'I received your message but had trouble generating a response.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      toast({
        title: "Chat error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const canChat = documents.some(doc => doc.status === 'ready');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Brand Ambassador Assistant</h1>
        <p className="text-gray-600">Upload your brand documents and chat to get personalized marketing insights</p>
      </div>

      {/* Document Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Brand Documents
        </h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">
              Upload your brand guidelines, marketing materials, or other relevant documents
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Choose Files'
              )}
            </Button>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Uploaded Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.summary && (
                          <p className="text-sm text-gray-600">{doc.summary}</p>
                        )}
                        {doc.error && (
                          <p className="text-sm text-red-600">{doc.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.category && (
                        <Badge variant="outline">{doc.category}</Badge>
                      )}
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Your Brand Assistant
        </h2>

        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                {!canChat ? (
                  <p>Upload and process documents to start chatting</p>
                ) : (
                  <p>Start a conversation about your brand and marketing strategy</p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={canChat ? "Ask me about your brand strategy..." : "Upload documents first to start chatting"}
              disabled={!canChat || isSending}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!canChat || !inputMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!canChat && documents.length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              Waiting for documents to finish processing...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandAmbassador;
