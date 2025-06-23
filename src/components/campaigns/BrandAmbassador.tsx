import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, MessageSquare, FileText, Send, ChevronRight, ChevronLeft, Building2, FileCheck, MessageCircle, Lightbulb } from 'lucide-react';
import { HttpClient } from '@/lib/http-client';
import { ApiResponse } from '@/lib/api/api-client-interface';

interface Document {
  id: string;
  name: string;
  summary: string;
  category?: string;
}

interface ChatMessage {
  message: string;
  response: string;
}

const BrandAmbassador: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    setDocuments([
      { id: '1', name: 'Brand Guidelines v1.2', summary: 'Comprehensive guidelines for brand usage', category: 'Guidelines' },
      { id: '2', name: 'Messaging Framework 2023', summary: 'Approved messaging for all communications', category: 'Messaging' },
    ]);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files).map((file, index) => ({
        id: String(Date.now() + index),
        name: file.name,
        summary: 'Uploaded document',
      }));
      setDocuments((prev) => [...prev, ...newDocuments]);
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    } else {
      setIsUploading(false);
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim()) {
      setIsLoading(true);
      setChatHistory((prev) => [...prev, { message: currentMessage, response: 'Thinking...' }]);
      setCurrentMessage('');

      // Simulate API call
      setTimeout(() => {
        const mockResponse = `Response to: ${currentMessage}. This is a simulated response from the Brand Assistant.`;
        setChatHistory((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1].response = mockResponse;
          return updatedHistory;
        });
        setIsLoading(false);
      }, 3000);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Brand Ambassador</h1>
        <p className="text-gray-600 mt-2">Upload brand documents and chat with your brand's knowledge base</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'flex-1' : 'flex-1 mr-80'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Document Upload Section */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Brand Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer mb-4">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">Upload Brand Documents</p>
                    <p className="text-gray-500">Drag and drop or click to select files</p>
                    <p className="text-sm text-gray-400 mt-2">Supports: TXT, PDF, DOC, DOCX, MD</p>
                  </label>
                </div>

                {isUploading && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-800">Uploading and processing documents...</p>
                  </div>
                )}

                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-600">{doc.summary}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {doc.category || 'General'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Brand Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <p className="font-medium text-blue-900">You:</p>
                          <p className="text-blue-800">{chat.message}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium text-gray-900">Brand Assistant:</p>
                          <p className="text-gray-700">{chat.response}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-gray-600">Thinking...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask about your brand guidelines, messaging, or get content suggestions..."
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!currentMessage.trim() || isLoading}
                    className="px-4 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Brand Context Sidebar */}
        <div className={`fixed right-0 top-0 h-full bg-white border-l shadow-lg transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-12' : 'w-80'
        }`}>
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="absolute left-2 top-20 z-10 p-2"
          >
            {sidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {/* Sidebar Content */}
          <div className={`p-4 pt-16 h-full overflow-hidden ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="space-y-6">
              {/* Brand Overview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Brand Overview</h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Your Brand</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {documents.length > 0 
                      ? `${documents.length} documents loaded with brand guidelines and context`
                      : 'Upload brand documents to see your brand overview here'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              {/* Key Guidelines */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Key Guidelines</h3>
                </div>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {documents.length > 0 ? (
                      documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="bg-green-50 p-3 rounded-lg">
                          <p className="font-medium text-green-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-green-700 mt-1">{doc.summary}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Guidelines will appear here after uploading brand documents
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Recent Decisions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Recent Insights</h3>
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {chatHistory.length > 0 ? (
                      chatHistory.slice(-2).map((chat, index) => (
                        <div key={index} className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-purple-700 font-medium">Recent Query:</p>
                          <p className="text-xs text-purple-600 mt-1 truncate">
                            {chat.message.substring(0, 60)}...
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Recent conversation insights will appear here
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentMessage("What are our key brand values?")}
                  >
                    Ask about brand values
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentMessage("Create a social media post")}
                  >
                    Generate content
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentMessage("Review messaging guidelines")}
                  >
                    Review guidelines
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAmbassador;
