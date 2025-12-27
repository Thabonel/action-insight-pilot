import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GettingStartedGuide } from '../components/help/GettingStartedGuide';
import { HelpDocumentation } from '../components/help/HelpDocumentation';
import { HelpCircle, BookOpen, PlayCircle } from 'lucide-react';

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

      </div>
    </div>
  );
};

export default HelpPage;