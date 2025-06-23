
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  Share2, 
  Mail, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Mic, 
  Save,
  Zap,
  Globe,
  BarChart3,
  Users,
  Link2,
  Lightbulb,
  Edit3,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BlogWorkflowAutomation: React.FC = () => {
  const [writingGoals, setWritingGoals] = useState({
    dailyWords: 500,
    weeklyPosts: 2,
    currentStreak: 7
  });
  const [automationSettings, setAutomationSettings] = useState({
    autoPublish: false,
    socialGeneration: true,
    emailExcerpts: true,
    crossPlatform: false
  });
  const [contentIdeas, setContentIdeas] = useState([
    { id: 1, title: "AI in Content Marketing", trending: 85, source: "Twitter" },
    { id: 2, title: "Remote Work Productivity", trending: 72, source: "LinkedIn" },
    { id: 3, title: "Sustainable Business Practices", trending: 68, source: "Google Trends" }
  ]);
  const [platforms, setPlatforms] = useState([
    { name: "WordPress", connected: true, autoPublish: false },
    { name: "Medium", connected: false, autoPublish: false },
    { name: "LinkedIn", connected: true, autoPublish: true },
    { name: "Twitter", connected: true, autoPublish: true },
    { name: "Facebook", connected: false, autoPublish: false }
  ]);
  const [voiceNotes, setVoiceNotes] = useState([
    { id: 1, text: "Remember to include case study about client success", timestamp: "2 hours ago" },
    { id: 2, text: "Add section about ROI calculations", timestamp: "1 day ago" }
  ]);
  const { toast } = useToast();

  const handleCreateContentSeries = () => {
    toast({
      title: "Content Series Created",
      description: "5 related blog posts have been planned for the next month",
    });
  };

  const handleOptimalTimeAnalysis = () => {
    toast({
      title: "Analysis Complete",
      description: "Best publishing times: Tue 10 AM, Thu 2 PM, Sat 9 AM",
    });
  };

  const handleSocialGeneration = () => {
    toast({
      title: "Social Posts Generated",
      description: "Created 8 social media variants across platforms",
    });
  };

  const handleConnectPlatform = (platformName: string) => {
    setPlatforms(platforms.map(p => 
      p.name === platformName ? { ...p, connected: true } : p
    ));
    toast({
      title: "Platform Connected",
      description: `Successfully connected to ${platformName}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Smart Automation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Publishing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Smart Publishing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-publish">Auto-publish at optimal times</Label>
              <Switch 
                id="auto-publish"
                checked={automationSettings.autoPublish}
                onCheckedChange={(checked) => 
                  setAutomationSettings({...automationSettings, autoPublish: checked})
                }
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleOptimalTimeAnalysis}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Optimal Times
            </Button>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Next optimal slot:</strong> Tuesday, 10:00 AM
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on your audience activity patterns
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Series Creator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>Content Series</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Series topic (e.g., 'Digital Marketing Guide')" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Series length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 posts</SelectItem>
                <SelectItem value="5">5 posts</SelectItem>
                <SelectItem value="7">7 posts</SelectItem>
                <SelectItem value="10">10 posts</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="w-full"
              onClick={handleCreateContentSeries}
            >
              <Target className="h-4 w-4 mr-2" />
              Create Series Plan
            </Button>
          </CardContent>
        </Card>

        {/* Social Media Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              <span>Social Media</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="social-gen">Auto-generate social posts</Label>
              <Switch 
                id="social-gen"
                checked={automationSettings.socialGeneration}
                onCheckedChange={(checked) => 
                  setAutomationSettings({...automationSettings, socialGeneration: checked})
                }
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSocialGeneration}
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Social Variants
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Twitter Thread</Badge>
              <Badge variant="outline">LinkedIn Post</Badge>
              <Badge variant="outline">Instagram Caption</Badge>
              <Badge variant="outline">Facebook Update</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Email Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <span>Email Newsletter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-excerpts">Auto-create excerpts</Label>
              <Switch 
                id="email-excerpts"
                checked={automationSettings.emailExcerpts}
                onCheckedChange={(checked) => 
                  setAutomationSettings({...automationSettings, emailExcerpts: checked})
                }
              />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Email template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digest">Weekly Digest</SelectItem>
                <SelectItem value="highlight">Content Highlight</SelectItem>
                <SelectItem value="teaser">Blog Teaser</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="w-full">
              <Edit3 className="h-4 w-4 mr-2" />
              Preview Email
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Personal Productivity Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Writing Streak & Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-600" />
              <span>Writing Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Streak</span>
              <Badge variant="default">{writingGoals.currentStreak} days</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Words Goal</span>
                <span>350/500</span>
              </div>
              <Progress value={70} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Posts Goal</span>
                <span>1/2</span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Adjust Goals
            </Button>
          </CardContent>
        </Card>

        {/* Content Ideas Bank */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>Content Ideas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentIdeas.map((idea) => (
              <div key={idea.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium">{idea.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {idea.trending}% trending
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Source: {idea.source}</p>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Ideas
            </Button>
          </CardContent>
        </Card>

        {/* Quick Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Save className="h-5 w-5 text-indigo-600" />
              <span>Quick Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea 
              placeholder="Jot down ideas, research links, or thoughts..."
              className="min-h-[100px]"
            />
            <Button size="sm" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </CardContent>
        </Card>

        {/* Voice Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-pink-600" />
              <span>Voice Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voiceNotes.map((note) => (
              <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                <p>{note.text}</p>
                <span className="text-xs text-gray-500">{note.timestamp}</span>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Cross-Platform Publishing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-cyan-600" />
            <span>Cross-Platform Publishing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{platform.name}</h4>
                  <Badge variant={platform.connected ? "default" : "secondary"}>
                    {platform.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                {platform.connected ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`auto-${platform.name}`} className="text-sm">
                        Auto-publish
                      </Label>
                      <Switch 
                        id={`auto-${platform.name}`}
                        checked={platform.autoPublish}
                        onCheckedChange={(checked) => {
                          setPlatforms(platforms.map(p => 
                            p.name === platform.name ? {...p, autoPublish: checked} : p
                          ));
                        }}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Link2 className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleConnectPlatform(platform.name)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button className="w-full" size="lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Publish to All Connected Platforms
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogWorkflowAutomation;
