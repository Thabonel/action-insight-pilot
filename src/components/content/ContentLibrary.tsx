
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Archive, 
  RefreshCw, 
  Link, 
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText,
  Tag,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  performance: {
    views: number;
    shares: number;
    engagementRate: number;
  };
  status: 'draft' | 'published' | 'archived';
  category: 'evergreen' | 'timely';
  lastUpdated: string;
  seriesId?: string;
}

interface ContentSeries {
  id: string;
  name: string;
  posts: string[];
  description: string;
}

interface KnowledgeExtraction {
  faqs: { question: string; answer: string; sourcePostIds: string[] }[];
  topicClusters: { topic: string; posts: string[] }[];
  linkingSuggestions: { fromPostId: string; toPostId: string; anchor: string }[];
  reusableSnippets: { content: string; sourcePostId: string; uses: number }[];
}

interface ContentLibraryProps {
  onPostSelect: (post: BlogPost) => void;
  currentContent?: string;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onPostSelect,
  currentContent
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [series, setSeries] = useState<ContentSeries[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeExtraction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [activeTab, setActiveTab] = useState<'archive' | 'knowledge' | 'lifecycle'>('archive');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Complete Guide to Content Marketing Strategy',
      content: 'This comprehensive guide covers...',
      tags: ['content-marketing', 'strategy', 'guide'],
      createdAt: '2024-01-15',
      performance: { views: 1250, shares: 45, engagementRate: 8.5 },
      status: 'published',
      category: 'evergreen',
      lastUpdated: '2024-01-15',
      seriesId: 'content-series-1'
    },
    {
      id: '2',
      title: '2024 Social Media Trends',
      content: 'The latest trends in social media...',
      tags: ['social-media', 'trends', '2024'],
      createdAt: '2024-01-10',
      performance: { views: 890, shares: 32, engagementRate: 6.2 },
      status: 'published',
      category: 'timely',
      lastUpdated: '2024-01-10'
    }
  ];

  const mockSeries: ContentSeries[] = [
    {
      id: 'content-series-1',
      name: 'Content Marketing Mastery',
      posts: ['1', '3', '5'],
      description: 'A comprehensive series on content marketing'
    }
  ];

  const mockKnowledge: KnowledgeExtraction = {
    faqs: [
      {
        question: 'What is content marketing?',
        answer: 'Content marketing is a strategic approach focused on creating and distributing valuable, relevant content...',
        sourcePostIds: ['1', '2']
      }
    ],
    topicClusters: [
      {
        topic: 'Content Strategy',
        posts: ['1', '3', '4']
      }
    ],
    linkingSuggestions: [
      {
        fromPostId: '2',
        toPostId: '1',
        anchor: 'content marketing strategy'
      }
    ],
    reusableSnippets: [
      {
        content: 'Content marketing generates 3x more leads than traditional marketing...',
        sourcePostId: '1',
        uses: 5
      }
    ]
  };

  useEffect(() => {
    setPosts(mockPosts);
    setSeries(mockSeries);
    setKnowledge(mockKnowledge);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => post.tags.includes(tag));
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesTags && matchesStatus;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const handleDuplicateCheck = async () => {
    if (!currentContent) return;
    
    setIsLoading(true);
    try {
      // Simulate duplicate detection
      const duplicates = posts.filter(post => 
        post.content.toLowerCase().includes(currentContent.toLowerCase().substring(0, 100))
      );
      
      if (duplicates.length > 0) {
        toast({
          title: "Potential duplicates found",
          description: `Found ${duplicates.length} similar posts`
        });
      } else {
        toast({
          title: "No duplicates found",
          description: "Your content appears to be unique"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check for duplicates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentRefresh = (postId: string) => {
    toast({
      title: "Refresh reminder set",
      description: "You'll be notified when this content needs updating"
    });
  };

  const handleArchivePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status: 'archived' as const } : post
    ));
    toast({
      title: "Post archived",
      description: "Post moved to archive"
    });
  };

  const renderArchiveTab = () => (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
        <Button onClick={handleDuplicateCheck} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Check Duplicates
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-1 border rounded"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredPosts.map(post => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={post.category === 'evergreen' ? 'default' : 'secondary'}>
                    {post.category}
                  </Badge>
                  <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                    {post.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {post.performance.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {post.performance.shares} shares
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onPostSelect(post)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleContentRefresh(post.id)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Set Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleArchivePost(post.id)}>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderKnowledgeTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto-Generated FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledge?.faqs.map((faq, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">{faq.question}</h4>
                  <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                  <div className="flex gap-1 mt-2">
                    <span className="text-xs text-gray-500">Sources:</span>
                    {faq.sourcePostIds.map(id => (
                      <Badge key={id} variant="outline" className="text-xs">
                        Post {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topic Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledge?.topicClusters.map((cluster, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium">{cluster.topic}</h4>
                  <div className="flex gap-1 mt-2">
                    {cluster.posts.map(postId => (
                      <Badge key={postId} variant="secondary" className="text-xs">
                        {posts.find(p => p.id === postId)?.title.substring(0, 20)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Internal Linking Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {knowledge?.linkingSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <Link className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">
                      Link "<span className="font-medium">{suggestion.anchor}</span>" 
                      from Post {suggestion.fromPostId} to Post {suggestion.toPostId}
                    </p>
                  </div>
                  <Button size="sm">Apply</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reusable Snippets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {knowledge?.reusableSnippets.map((snippet, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <p className="text-sm">{snippet.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">
                      Used {snippet.uses} times
                    </Badge>
                    <Button size="sm" variant="outline">
                      Insert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLifecycleTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Refresh Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.filter(post => {
                const daysSinceUpdate = Math.floor(
                  (new Date().getTime() - new Date(post.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysSinceUpdate > 90 && post.category === 'timely';
              }).map(post => (
                <div key={post.id} className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-medium text-sm">{post.title}</h4>
                  <p className="text-xs text-gray-600">
                    Last updated: {new Date(post.lastUpdated).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="mt-2">
                    Update Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Low Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.filter(post => post.performance.engagementRate < 5).map(post => (
                <div key={post.id} className="border-l-4 border-red-500 pl-3">
                  <h4 className="font-medium text-sm">{post.title}</h4>
                  <p className="text-xs text-gray-600">
                    Engagement: {post.performance.engagementRate}%
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline">
                      Optimize
                    </Button>
                    <Button size="sm" variant="outline">
                      Archive
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Content Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-medium text-sm">Email Marketing</h4>
                <p className="text-xs text-gray-600">Only 1 post in last 6 months</p>
                <Button size="sm" className="mt-2">
                  Create Content
                </Button>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-medium text-sm">Video Marketing</h4>
                <p className="text-xs text-gray-600">No recent content</p>
                <Button size="sm" className="mt-2">
                  Create Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Series Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {series.map(s => (
              <div key={s.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{s.name}</h4>
                  <Badge variant="outline">{s.posts.length} posts</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Manage Series
                  </Button>
                  <Button size="sm" variant="outline">
                    Add Post
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('archive')}
          className={`pb-2 px-1 ${activeTab === 'archive' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Content Archive
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`pb-2 px-1 ${activeTab === 'knowledge' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Knowledge Extraction
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`pb-2 px-1 ${activeTab === 'lifecycle' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Lifecycle Management
        </button>
      </div>

      {activeTab === 'archive' && renderArchiveTab()}
      {activeTab === 'knowledge' && renderKnowledgeTab()}
      {activeTab === 'lifecycle' && renderLifecycleTab()}
    </div>
  );
};
