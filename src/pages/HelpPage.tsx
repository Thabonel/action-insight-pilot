import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GettingStartedGuide } from '../components/help/GettingStartedGuide';
import { HelpDocumentation } from '../components/help/HelpDocumentation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  BookOpen, 
  PlayCircle, 
  MessageSquare,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" data-onboarding="welcome">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed with Marketing Hub. Find guides, tutorials, and get support when you need it.
          </p>
        </div>

        {/* Contact Support Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-6 w-6" />
              Need Immediate Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-sm">Live Chat</h4>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-sm">Email Support</h4>
                  <p className="text-xs text-muted-foreground">Response in 2-4 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-sm">Phone Support</h4>
                  <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger 
              value="getting-started" 
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger 
              value="documentation" 
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <GettingStartedGuide />
          </TabsContent>

          <TabsContent value="documentation">
            <HelpDocumentation />
          </TabsContent>
        </Tabs>

        {/* Business Hours */}
        <Card className="mt-12 text-center">
          <CardContent className="p-6">
            <Clock className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-2">Support Hours</h3>
            <p className="text-sm text-muted-foreground">
              Monday - Friday: 9:00 AM - 6:00 PM (EST) <br />
              Saturday - Sunday: 10:00 AM - 4:00 PM (EST)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;