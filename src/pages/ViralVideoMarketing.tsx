import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, MessageCircle, Mail, TrendingUp, Settings, Play, Users, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const ViralVideoMarketing: React.FC = () => {
  const [activeKeywords, setActiveKeywords] = useState(['YT', 'AI', 'GUIDE', 'FREE']);
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword && !activeKeywords.includes(newKeyword.toUpperCase())) {
      setActiveKeywords([...activeKeywords, newKeyword.toUpperCase()]);
      setNewKeyword('');
      toast.success('Keyword added successfully');
    }
  };

  const removeKeyword = (keyword: string) => {
    setActiveKeywords(activeKeywords.filter(k => k !== keyword));
    toast.success('Keyword removed');
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Viral Video Marketing</h1>
        <p className="text-muted-foreground mt-2">Automate video posting, comment monitoring, and email collection</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="emails">Email Collection</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos Posted</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comments Tracked</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+127 today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Collected</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">27.4% conversion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.4%</div>
                <p className="text-xs text-muted-foreground">+1.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Keywords
              </CardTitle>
              <CardDescription>
                Keywords that trigger email collection when commented
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {activeKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Post New Video
                </CardTitle>
                <CardDescription>Upload and schedule a new viral video</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  View New Leads
                </CardTitle>
                <CardDescription>Review recently collected email addresses</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <CardDescription>Configure comment monitoring and responses</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Management</CardTitle>
              <CardDescription>Manage your viral video content and scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Upload New Video</Button>
                
                {/* Video List */}
                <div className="space-y-3">
                  {[
                    { title: "AI Marketing Secrets Revealed", platform: "Instagram", comments: 89, emails: 23 },
                    { title: "5 ChatGPT Prompts That Changed My Business", platform: "TikTok", comments: 156, emails: 41 },
                    { title: "YouTube Growth Hack Nobody Talks About", platform: "YouTube", comments: 234, emails: 67 }
                  ].map((video, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{video.title}</h4>
                            <p className="text-sm text-muted-foreground">{video.platform}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{video.comments} comments</p>
                            <p className="text-sm text-green-600">{video.emails} emails collected</p>
                          </div>
                        </div>
                        <Progress value={(video.emails / video.comments) * 100} className="mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comment Monitoring</CardTitle>
              <CardDescription>Real-time comment tracking and keyword detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Comments */}
                {[
                  { user: "@sarah_marketer", comment: "YT please!", video: "AI Marketing Secrets", time: "2 mins ago", status: "responded" },
                  { user: "@digitaldan", comment: "This is amazing! AI", video: "ChatGPT Prompts", time: "5 mins ago", status: "pending" },
                  { user: "@growthhacker", comment: "GUIDE needed asap", video: "YouTube Growth Hack", time: "8 mins ago", status: "email_collected" }
                ].map((comment, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{comment.user}</p>
                          <p className="text-sm">{comment.comment}</p>
                          <p className="text-xs text-muted-foreground">On: {comment.video}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{comment.time}</p>
                          <Badge 
                            variant={comment.status === 'email_collected' ? 'default' : 
                                   comment.status === 'responded' ? 'secondary' : 'outline'}
                          >
                            {comment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Collection & Automation</CardTitle>
              <CardDescription>Manage collected emails and welcome sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Collection Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">342</p>
                        <p className="text-sm text-muted-foreground">Total Emails Collected</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">27.4%</p>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-sm text-muted-foreground">Email Open Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Email Segments */}
                <div>
                  <h4 className="font-semibold mb-3">Email Segments by Keyword</h4>
                  <div className="space-y-2">
                    {[
                      { keyword: "YT", count: 127, sequence: "YouTube Growth Sequence" },
                      { keyword: "AI", count: 89, sequence: "AI Marketing Sequence" },
                      { keyword: "GUIDE", count: 67, sequence: "Free Guide Sequence" },
                      { keyword: "FREE", count: 59, sequence: "Free Tools Sequence" }
                    ].map((segment) => (
                      <Card key={segment.keyword}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge variant="outline">{segment.keyword}</Badge>
                              <p className="text-sm mt-1">{segment.sequence}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{segment.count} subscribers</p>
                              <Button variant="outline" size="sm">Edit Sequence</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your viral video marketing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance by Platform */}
                <div>
                  <h4 className="font-semibold mb-3">Performance by Platform</h4>
                  <div className="space-y-3">
                    {[
                      { platform: "Instagram", videos: 8, comments: 456, emails: 124, rate: "27.2%" },
                      { platform: "TikTok", videos: 12, comments: 623, emails: 167, rate: "26.8%" },
                      { platform: "YouTube", videos: 4, comments: 168, emails: 51, rate: "30.4%" }
                    ].map((platform) => (
                      <Card key={platform.platform}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-5 gap-4 text-center">
                            <div>
                              <p className="font-semibold">{platform.platform}</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{platform.videos}</p>
                              <p className="text-xs text-muted-foreground">Videos</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{platform.comments}</p>
                              <p className="text-xs text-muted-foreground">Comments</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{platform.emails}</p>
                              <p className="text-xs text-muted-foreground">Emails</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-600">{platform.rate}</p>
                              <p className="text-xs text-muted-foreground">Conversion</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Top Performing Keywords */}
                <div>
                  <h4 className="font-semibold mb-3">Top Performing Keywords</h4>
                  <div className="space-y-2">
                    {[
                      { keyword: "YT", mentions: 234, emails: 127, rate: "54.3%" },
                      { keyword: "FREE", mentions: 189, emails: 89, rate: "47.1%" },
                      { keyword: "AI", mentions: 156, emails: 67, rate: "42.9%" },
                      { keyword: "GUIDE", mentions: 123, emails: 59, rate: "48.0%" }
                    ].map((keyword) => (
                      <div key={keyword.keyword} className="flex justify-between items-center p-3 border rounded">
                        <Badge variant="outline">{keyword.keyword}</Badge>
                        <div className="flex gap-8 text-sm">
                          <span>{keyword.mentions} mentions</span>
                          <span>{keyword.emails} emails</span>
                          <span className="font-semibold text-green-600">{keyword.rate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViralVideoMarketing;