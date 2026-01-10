
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LogoMarkIcon from '@/components/LogoMarkIcon';
import { useNavigate } from 'react-router-dom';
import SupportTicketDialog from '@/components/support/SupportTicketDialog';

const PublicHomepage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Campaign Management",
      description: "Create and manage your marketing campaigns in one place. AI helps optimize performance based on what's working.",
      benefits: ["Campaign planning tools", "Performance tracking", "Budget management"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Marketing analytics dashboard on computer screen"
    },
    {
      title: "Lead Management",
      description: "Track and organize your leads. See which ones are most engaged and ready to convert.",
      benefits: ["Lead tracking", "Activity monitoring", "Export to CSV"],
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Team collaborating around a laptop with charts and graphs"
    },
    {
      title: "AI Content Generator",
      description: "Generate blog posts, social media content, and email copy.",
      benefits: ["Multiple AI models", "Fast content creation", "Professional quality"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "MacBook showing code on screen representing content creation"
    },
    {
      title: "Email Campaigns",
      description: "Build and send email campaigns. Track opens, clicks, and conversions.",
      benefits: ["Campaign builder", "Performance metrics", "Behavioral triggers"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Person typing on laptop with email interface visible"
    },
    {
      title: "Analytics Dashboard",
      description: "See how your campaigns are performing. Track revenue, conversions, and ROI in real-time.",
      benefits: ["Revenue tracking", "Conversion metrics", "Performance charts"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Data visualization charts and graphs on computer screen"
    },
    {
      title: "Marketing Autopilot",
      description: "Set your goals and budget. AI creates campaigns, adjusts budgets, and optimizes performance automatically.",
      benefits: ["Automated campaign management", "Budget optimization", "Weekly reports"],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Multiple people working with laptops in a collaborative workspace"
    }
  ];

  const stats = [
    { value: "AI-Powered", label: "Campaign Management" },
    { value: "Multi-Channel", label: "Marketing Automation" },
    { value: "Real-Time", label: "Analytics & Insights" },
    { value: "Intelligent", label: "Lead Scoring" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LogoMarkIcon className="h-8 w-8" />
              <span className="text-xl font-bold text-black">AI Boost Campaign</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-black hover:text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://kciuuxoqxfsogjuqflou.supabase.co/storage/v1/object/public/digital-assets/Marketing%20Hero.jpg"
            alt="AI Boost Campaign"
            className="w-full h-full object-cover"
          />
          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-white text-blue-600 px-4 py-2 shadow-lg">
              Powered by Advanced AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              AI Boost Campaign
              <span className="block text-blue-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">Run Your Marketing on Autopilot</span>
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              Set your goals and budget. AI handles the rest - creating campaigns, writing content,
              and optimizing performance.
            </p>
            <div className="flex justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-2xl"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{stat.value}</div>
                  <div className="text-sm text-gray-200 mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              Marketing Shouldn't Be This Hard
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              You know you need to run campaigns, create content, and track performance.
              But juggling multiple tools and learning complex platforms takes time you don't have.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-red-200 bg-red-50">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-black mb-2">Too Many Tools</h3>
                <p className="text-gray-700">Email here, social there, analytics somewhere else. Logging into five platforms just to post one campaign.</p>
              </CardContent>
            </Card>

            <Card className="p-6 border-orange-200 bg-orange-50">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-black mb-2">Learning Curve</h3>
                <p className="text-gray-700">Every platform has its own interface, rules, and best practices. Just when you figure one out, they update it.</p>
              </CardContent>
            </Card>

            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-black mb-2">No Time</h3>
                <p className="text-gray-700">You're running a business. Marketing should work for you, not become another full-time job.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Manage campaigns, create content, track leads, and see what's working. All in one dashboard.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1">
                  <Card className="p-8 border-0 shadow-lg bg-white">
                    <CardContent className="p-0">
                      <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
                      <p className="text-lg text-gray-700 mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-3 list-disc list-inside">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="text-black">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={feature.image} 
                      alt={feature.alt}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Try It Free
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Create an account and start managing your marketing. No credit card required to start.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 mb-4">
            If something does not work, let me know and I will fix it immediately.
          </p>
          <SupportTicketDialog />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <LogoMarkIcon className="h-8 w-8" />
                <span className="text-xl font-bold text-black">AI Boost Campaign</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <button onClick={() => navigate('/privacy')} className="text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </button>
                <button onClick={() => navigate('/terms')} className="text-gray-600 hover:text-blue-600">
                  Terms of Service
                </button>
                <button onClick={() => navigate('/cookies')} className="text-gray-600 hover:text-blue-600">
                  Cookie Policy
                </button>
                <button onClick={() => navigate('/acceptable-use')} className="text-gray-600 hover:text-blue-600">
                  Acceptable Use
                </button>
              </div>
            </div>
            <div className="text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} AI Boost Campaign. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomepage;
