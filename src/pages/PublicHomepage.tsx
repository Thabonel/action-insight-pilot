
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Users, 
  Mail, 
  BarChart3, 
  Workflow,
  Target,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PublicHomepage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Campaign Management",
      description: "Create, optimize, and manage marketing campaigns with intelligent automation that learns from performance data.",
      benefits: ["Smart audience targeting", "Automated A/B testing", "Performance optimization"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Marketing analytics dashboard on computer screen"
    },
    {
      icon: Users,
      title: "Intelligent Lead Generation",
      description: "Advanced AI algorithms identify, score, and nurture leads automatically for maximum conversion rates.",
      benefits: ["Predictive lead scoring", "Automated nurturing", "Conversion optimization"],
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Team collaborating around a laptop with charts and graphs"
    },
    {
      icon: Sparkles,
      title: "Automated Content Creation",
      description: "Generate high-converting content across all channels with AI that understands your brand voice.",
      benefits: ["Brand-consistent messaging", "Multi-platform optimization", "Performance tracking"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "MacBook showing code on screen representing content creation"
    },
    {
      icon: Mail,
      title: "Email Marketing Intelligence",
      description: "Personalized email campaigns powered by behavioral analysis and predictive send-time optimization.",
      benefits: ["Behavioral triggers", "Send-time optimization", "Personalization at scale"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Person typing on laptop with email interface visible"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Advanced insights and forecasting that help you make data-driven marketing decisions.",
      benefits: ["Revenue forecasting", "Performance predictions", "ROI optimization"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Data visualization charts and graphs on computer screen"
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Connect all your marketing tools and automate complex workflows without coding.",
      benefits: ["No-code automation", "Cross-platform integration", "Smart triggers"],
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
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-black">AI Marketing Hub</span>
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
      <section className="relative bg-gradient-to-br from-blue-50 via-blue-25 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              AI Marketing Hub
              <span className="block text-blue-600">Intelligent Automation Platform</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your marketing operations with AI-powered automation that learns, adapts, and optimizes 
              every campaign for maximum ROI. From lead generation to content creation, let artificial intelligence 
              handle the complexity while you focus on strategy.
            </p>
            <div className="flex justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm text-gray-700 mt-1">{stat.label}</div>
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
              Marketing Teams Are Drowning in Manual Tasks
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Modern marketing requires managing dozens of platforms, analyzing endless data points, 
              and creating personalized experiences at scale. Without AI assistance, teams spend 
              80% of their time on repetitive tasks instead of strategic growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-red-200 bg-red-50">
              <CardContent className="p-0">
                <Target className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">Inefficient Targeting</h3>
                <p className="text-gray-700">Manual audience segmentation leads to broad, ineffective campaigns and wasted ad spend.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 border-orange-200 bg-orange-50">
              <CardContent className="p-0">
                <BarChart3 className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">Data Overwhelm</h3>
                <p className="text-gray-700">Teams struggle to extract actionable insights from multiple analytics platforms and data sources.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-0">
                <Zap className="w-12 h-12 text-yellow-600 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">Slow Execution</h3>
                <p className="text-gray-700">Manual processes delay campaign launches and prevent real-time optimization opportunities.</p>
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
              Meet Your AI Marketing Assistant
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our intelligent automation platform combines machine learning, predictive analytics, 
              and natural language processing to handle every aspect of your marketing operations.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1">
                  <Card className="p-8 border-0 shadow-lg bg-white">
                    <CardContent className="p-0">
                      <feature.icon className="w-16 h-16 text-blue-600 mb-6" />
                      <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
                      <p className="text-lg text-gray-700 mb-6 leading-relaxed">{feature.description}</p>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span className="text-black">{benefit}</span>
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
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using AI to automate your workflows, optimize your campaigns, and improve your marketing ROI.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-black">AI Marketing Hub</span>
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
              © {new Date().getFullYear()} AI Marketing Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomepage;
