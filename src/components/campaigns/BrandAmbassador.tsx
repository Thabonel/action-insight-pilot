import React, { useState, useRef, useCallback } from 'react';
import { Upload, Send, FileText, User, Bot, ChevronRight, ChevronLeft, Plus, Trash2, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HttpClient } from '@/lib/http-client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  summary?: string;
  category?: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser: boolean;
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  created: Date;
  updated: Date;
  messages: ChatMessage[];
}

interface ChatApiResponse {
  message?: string;
  response?: string;
  explanation?: string;
  insights?: string[];
}

const BrandAmbassador: React.FC = () => {
  // Session management state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('brand-ambassador-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isSessionSidebarOpen, setIsSessionSidebarOpen] = useState(true);
  
  // Existing state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandSidebarOpen, setIsBrandSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const httpClient = new HttpClient();

  // Save sessions to localStorage whenever sessions change
  const saveSessions = useCallback((updatedSessions: ChatSession[]) => {
    localStorage.setItem('brand-ambassador-sessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  }, []);

  // Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      created: new Date(),
      updated: new Date(),
      messages: []
    };
    
    const updatedSessions = [newSession, ...sessions];
    saveSessions(updatedSessions);
    setCurrentSession(newSession);
    setChatMessages([]);
    
    toast({
      title: "New Session Created",
      description: "Started a fresh conversation.",
    });
  }, [sessions, saveSessions, toast]);

  // Load session
  const loadSession = useCallback((session: ChatSession) => {
    setCurrentSession(session);
    setChatMessages(session.messages);
    
    toast({
      title: "Session Loaded",
      description: `Loaded "${session.title}"`,
    });
  }, [toast]);

  // Save current session
  const saveCurrentSession = useCallback(() => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: chatMessages,
      updated: new Date(),
      title: chatMessages.length > 0 ? 
        chatMessages[0].content.substring(0, 50) + (chatMessages[0].content.length > 50 ? '...' : '') :
        'New Conversation'
    };

    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    
    saveSessions(updatedSessions);
    setCurrentSession(updatedSession);
  }, [currentSession, chatMessages, sessions, saveSessions]);

  // Delete session
  const deleteSession = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setChatMessages([]);
    }
    
    toast({
      title: "Session Deleted",
      description: "Conversation has been removed.",
    });
  }, [sessions, currentSession, saveSessions, toast]);

  // Export session
  const exportSession = useCallback((session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const transcript = session.messages.map(msg => 
      `${msg.isUser ? 'User' : 'Assistant'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-conversation-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Session Exported",
      description: "Conversation transcript downloaded.",
    });
  }, [toast]);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setDocuments(prev => [...prev, {
        id: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading'
      }]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const summaryResponse = await httpClient.request('/api/summarize', {
            method: 'POST',
            body: JSON.stringify({ document: content })
          });

          if (summaryResponse.success && summaryResponse.data) {
            setDocuments(prev => prev.map(doc =>
              doc.id === documentId ? { ...doc, content, summary: summaryResponse.data.summary, status: 'ready' } : doc
            ));
          } else {
            setDocuments(prev => prev.map(doc =>
              doc.id === documentId ? { ...doc, content, summary: 'Failed to summarize document.', status: 'error' } : doc
            ));
            toast({
              title: "Summary Failed",
              description: `Failed to summarize ${file.name}.`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing file:', error);
          setDocuments(prev => prev.map(doc =>
            doc.id === documentId ? { ...doc, status: 'error' } : doc
          ));
          toast({
            title: "File Processing Error",
            description: `Error processing ${file.name}.`,
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId ? { ...doc, status: 'error' } : doc
        ));
        toast({
          title: "File Reading Error",
          description: `Could not read ${file.name}.`,
          variant: "destructive"
        });
        setIsLoading(false);
      };

      reader.readAsText(file);
    }

    await Promise.all(uploadPromises);
  };

  // Enhanced send message to save to current session
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Create session if none exists
    if (!currentSession) {
      createNewSession();
    }

    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: inputMessage,
      response: '',
      timestamp: new Date(),
      isUser: true,
      content: inputMessage
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setInputMessage('');

    try {
      const response = await httpClient.request('/api/brand-assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: inputMessage,
          context: documents.map(doc => ({ name: doc.name, summary: doc.summary })),
          conversation_history: chatMessages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      });

      if (response.success && response.data) {
        const apiResponse = response.data as ChatApiResponse;
        const assistantContent = apiResponse.response || apiResponse.message || apiResponse.explanation || 'I understand your request.';
        
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
          message: inputMessage,
          response: assistantContent,
          timestamp: new Date(),
          isUser: false,
          content: assistantContent
        };

        const finalMessages = [...newMessages, assistantMessage];
        setChatMessages(finalMessages);
        
        // Auto-save session after each message
        setTimeout(saveCurrentSession, 100);
        
        toast({
          title: "Response Generated",
          description: "Brand assistant has analyzed your message.",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from brand assistant.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentCategory = async (documentId: string, category: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, category } : doc
    ));
  };

  const generateBrandContext = () => {
    if (documents.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload documents to generate brand context.",
      });
      return;
    }

    setIsLoading(true);
    const contextGenerationPromises: Promise<void>[] = [];

    documents.forEach(doc => {
      if (doc.status === 'ready') {
        const contextPromise = new Promise<void>(async (resolve) => {
          try {
            const contextResponse = await httpClient.request('/api/context', {
              method: 'POST',
              body: JSON.stringify({ document: doc.content, category: doc.category || 'general' })
            });

            if (contextResponse.success && contextResponse.data) {
              setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, summary: contextResponse.data.summary } : d
              ));
              toast({
                title: "Context Generated",
                description: `Brand context generated for ${doc.name}.`,
              });
            } else {
              toast({
                title: "Context Generation Failed",
                description: `Failed to generate brand context for ${doc.name}.`,
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Error generating context:', error);
            toast({
              title: "Context Generation Error",
              description: `Error generating brand context for ${doc.name}.`,
              variant: "destructive"
            });
          } finally {
            resolve();
          }
        });
        contextGenerationPromises.push(contextPromise);
      }
    });

    Promise.all(contextGenerationPromises).then(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sessions Sidebar */}
      <div className={`bg-white border-r transition-all duration-300 flex flex-col ${
        isSessionSidebarOpen ? 'w-80' : 'w-12'
      }`}>
        <div className="p-4 border-b flex items-center justify-between">
          {isSessionSidebarOpen && (
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSessionSidebarOpen(!isSessionSidebarOpen)}
            className="p-1"
          >
            {isSessionSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {isSessionSidebarOpen && (
          <>
            <div className="p-4">
              <Button
                onClick={createNewSession}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group hover:bg-gray-50 ${
                        currentSession?.id === session.id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {session.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {session.updated.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {session.messages.length} messages
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => exportSession(session, e)}
                            className="p-1 h-6 w-6"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteSession(session.id, e)}
                            className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Ambassador</h1>
              <p className="text-gray-600 mt-1">
                Upload brand documents and get AI-powered insights
                {currentSession && (
                  <span className="ml-2 text-sm text-blue-600">
                    • {currentSession.title}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            isBrandSidebarOpen ? 'mr-80' : 'mr-12'
          }`}>
            {/* Documents Section */}
            {documents.length > 0 && (
              <div className="bg-white border-b p-4">
                <h3 className="font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{doc.name}</span>
                      <Badge variant={
                        doc.status === 'ready' ? 'default' :
                        doc.status === 'processing' ? 'secondary' :
                        doc.status === 'error' ? 'destructive' : 'outline'
                      }>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready to help with your brand</h3>
                  <p>Upload documents and start a conversation to get AI-powered brand insights.</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{message.isUser ? message.content : message.message}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    {!message.isUser && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about your brand, get insights, or request guidance..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Brand Context Sidebar */}
          <div className={`fixed right-0 top-0 h-full bg-white border-l transition-all duration-300 flex flex-col ${
            isBrandSidebarOpen ? 'w-80' : 'w-12'
          }`}>
            <div className="p-4 border-b flex items-center justify-between">
              {isBrandSidebarOpen && (
                <h2 className="font-semibold text-gray-900">Brand Context</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBrandSidebarOpen(!isBrandSidebarOpen)}
                className="p-1"
              >
                {isBrandSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {isBrandSidebarOpen && (
              <>
                <div className="p-4">
                  <Button
                    onClick={generateBrandContext}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Generate Context
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 border-b">
                      <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded: {doc.uploadedAt.toLocaleDateString()}
                      </p>
                      {doc.summary && (
                        <div className="mt-2">
                          <h4 className="text-xs font-semibold text-gray-700">Summary:</h4>
                          <p className="text-xs text-gray-600">{doc.summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAmbassador;
