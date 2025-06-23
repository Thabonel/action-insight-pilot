
import React, { useState, useEffect } from 'react';
import { Upload, FileText, MessageCircle, Send, ChevronLeft, ChevronRight, Plus, Trash2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KnowledgeService } from '@/lib/services/knowledge-service';

interface Document {
  id: string;
  title: string;
  content: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  status: 'processing' | 'ready' | 'failed';
  created_at: string;
  metadata: Record<string, any>;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: string;
}

interface ChatApiResponse {
  message?: string;
  response?: string;
  [key: string]: any;
}

interface BrandContext {
  name: string;
  description: string;
  guidelines: string[];
  recentInsights: string[];
}

const BrandAmbassador: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brandContextOpen, setBrandContextOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('brandAmbassadorSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      // Load the most recent session if available
      if (parsedSessions.length > 0) {
        const mostRecent = parsedSessions[0];
        setCurrentSessionId(mostRecent.id);
        setChatHistory(mostRecent.messages || []);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('brandAmbassadorSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update current session when chat history changes
  useEffect(() => {
    if (currentSessionId && chatHistory.length > 0) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: chatHistory, timestamp: new Date().toISOString() }
          : session
      ));
    }
  }, [chatHistory, currentSessionId]);

  const loadDocuments = async () => {
    try {
      const buckets = await KnowledgeService.getBuckets();
      const brandBucket = buckets.find(b => b.bucket_type === 'general');
      if (brandBucket) {
        const docs = await KnowledgeService.getDocuments(brandBucket.id);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Create or get brand bucket
      let buckets = await KnowledgeService.getBuckets();
      let brandBucket = buckets.find(b => b.bucket_type === 'general');
      
      if (!brandBucket) {
        brandBucket = await KnowledgeService.createBucket(
          'Brand Knowledge',
          'general',
          'Brand guidelines, voice, and context documents'
        );
      }

      // Upload each file
      for (const file of Array.from(files)) {
        const content = await KnowledgeService.extractTextFromFile(file);
        await KnowledgeService.uploadDocument(
          brandBucket.id,
          file.name,
          content,
          file.name,
          file.type,
          file.size
        );
      }

      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setIsProcessing(true);

    // Add user message to chat
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newMessage]);

    try {
      // Search knowledge base for relevant context
      const searchResults = await KnowledgeService.searchKnowledge(
        userMessage,
        'general',
        undefined,
        5
      );

      // Simulate AI response with brand context
      const contextPrompt = searchResults.length > 0 
        ? `Based on the brand knowledge: ${searchResults.map(r => r.chunk_content).join(' ')}\n\nUser question: ${userMessage}`
        : userMessage;

      // Mock AI response - in real implementation, this would call your AI service
      const aiResponse = `Based on your brand guidelines, here's my recommendation for: "${userMessage}". I've considered your brand voice, target audience, and key messaging pillars from the uploaded documents.`;

      // Update the message with AI response
      setChatHistory(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, response: aiResponse }
          : msg
      ));

    } catch (error) {
      console.error('Failed to send message:', error);
      setChatHistory(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, response: 'Sorry, I encountered an error processing your request.' }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Session ${new Date().toLocaleDateString()}`,
      messages: [],
      timestamp: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setChatHistory([]);
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setChatHistory(session.messages || []);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setChatHistory([]);
    }
  };

  const exportSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const transcript = session.messages.map(msg => 
        `User: ${msg.message}\nAI: ${msg.response}\n---\n`
      ).join('');
      
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Generate brand context from documents
  const generateBrandContext = (): BrandContext => {
    const processedDocs = documents.filter(doc => doc.status === 'ready');
    
    return {
      name: 'Your Brand',
      description: 'AI-powered brand ambassador trained on your guidelines and voice.',
      guidelines: processedDocs.length > 0 
        ? ['Brand voice consistency', 'Target audience alignment', 'Key messaging pillars']
        : ['Upload brand documents to see guidelines'],
      recentInsights: chatHistory.slice(-3).map(msg => {
        const content = typeof msg === 'object' && msg !== null && 'response' in msg 
          ? (msg as any).response || 'No response available'
          : 'Invalid message format';
        return content.substring(0, 100) + '...';
      })
    };
  };

  const brandContext = generateBrandContext();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sessions Sidebar */}
      <div className={`${sessionsOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Chat Sessions</h3>
            <Button onClick={createNewSession} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="group">
                <Card className={`cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                  <CardContent className="p-3" onClick={() => loadSession(session.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {session.messages.length} messages
                        </p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSession(session.id);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSessionsOpen(!sessionsOpen)}
        className="fixed left-2 top-4 z-10 bg-white shadow-md"
      >
        {sessionsOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brand Ambassador AI</h1>
                <p className="text-gray-600">Your AI assistant trained on brand guidelines and voice</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {documents.filter(doc => doc.status === 'ready').length} Documents Active
              </Badge>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Brand Knowledge Base</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.doc,.docx,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Documents'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Documents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <Badge 
                        variant={doc.status === 'ready' ? 'default' : doc.status === 'processing' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {doc.file_name && `${doc.file_name} • `}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    {doc.status === 'processing' && (
                      <Progress value={75} className="h-1" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">Ask me anything about your brand guidelines, voice, or marketing strategy.</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-md">
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    {chat.response && (
                      <div className="flex justify-start">
                        <Card className="max-w-2xl">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-900">{chat.response}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(chat.timestamp).toLocaleTimeString()}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <Card className="max-w-md">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <p className="text-sm text-gray-600">Thinking...</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex space-x-4">
                <Textarea
                  placeholder="Ask about brand guidelines, voice, messaging strategy..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isProcessing}
                  className="flex-1 min-h-[80px] resize-none"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim() || isProcessing}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Context Sidebar */}
        <div className={`${brandContextOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-l border-gray-200 overflow-hidden`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Brand Context</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setBrandContextOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Brand Overview */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Brand Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{brandContext.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{brandContext.description}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">
                    Documents Active
                  </p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {documents.filter(doc => doc.status === 'ready').length} Ready
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Key Guidelines */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Key Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {brandContext.guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{guideline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {brandContext.recentInsights.length > 0 ? (
                    brandContext.recentInsights.map((insight, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {insight}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">Start a conversation to see insights</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Brand Brief
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Voice Analysis
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Brand Context Toggle Button */}
        {!brandContextOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBrandContextOpen(true)}
            className="fixed right-2 top-4 z-10 bg-white shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BrandAmbassador;
