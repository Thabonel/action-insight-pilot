import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, BookOpen } from 'lucide-react';

// Marketing terms with plain-English explanations
export const marketingGlossary: Record<string, {
  term: string;
  shortDefinition: string;
  fullExplanation: string;
  example?: string;
  goodBenchmark?: string;
}> = {
  roi: {
    term: 'ROI (Return on Investment)',
    shortDefinition: 'For every $1 you spend, how much you get back',
    fullExplanation: 'ROI tells you if your marketing is making money. A 200% ROI means for every $1 spent, you got $2 back in revenue. If your ROI is negative, you are losing money on that marketing effort.',
    example: 'You spent $100 on ads and made $250 in sales. ROI = 150% (you made $1.50 for every $1 spent)',
    goodBenchmark: '100%+ is good (break-even), 200%+ is great'
  },
  leads: {
    term: 'Leads',
    shortDefinition: 'People who showed interest and might become customers',
    fullExplanation: 'A lead is anyone who has shown interest in your product or service - they filled out a form, downloaded something, or signed up. Not all leads will buy, but they are potential customers worth following up with.',
    example: 'Someone fills out "Get a Quote" on your website - they are now a lead',
    goodBenchmark: 'Quality matters more than quantity - 10 good leads beat 100 bad ones'
  },
  impressions: {
    term: 'Impressions',
    shortDefinition: 'How many times your content was shown (not unique people)',
    fullExplanation: 'An impression is counted every time your ad or content appears on someone\'s screen. One person might see it 5 times = 5 impressions. This is different from "reach" which counts unique people.',
    example: 'Your ad was shown 10,000 times, but only to 3,000 different people',
    goodBenchmark: 'Impressions alone mean little - focus on what happens after'
  },
  reach: {
    term: 'Reach',
    shortDefinition: 'How many different people saw your content',
    fullExplanation: 'Reach counts unique individuals who saw your content at least once. Unlike impressions, if one person sees your ad 5 times, they only count as 1 for reach.',
    example: 'Your campaign reached 5,000 people (5,000 unique viewers)',
    goodBenchmark: 'Depends on your audience size - compare to your target market'
  },
  ctr: {
    term: 'CTR (Click-Through Rate)',
    shortDefinition: 'Out of people who saw it, what % clicked',
    fullExplanation: 'CTR shows how compelling your ad or content is. If 100 people see your ad and 5 click, your CTR is 5%. A higher CTR means your message resonates with your audience.',
    example: '1,000 impressions, 30 clicks = 3% CTR',
    goodBenchmark: '1-2% is average, 3-5% is good, 5%+ is excellent'
  },
  conversions: {
    term: 'Conversions',
    shortDefinition: 'When someone does what you wanted - buys, signs up, downloads',
    fullExplanation: 'A conversion happens when someone takes the action you wanted. This could be making a purchase, signing up for a newsletter, downloading an ebook, or requesting a demo. You define what counts as a conversion for your business.',
    example: 'You wanted people to request quotes. 15 people did = 15 conversions',
    goodBenchmark: 'Varies by industry - track your own trends over time'
  },
  conversion_rate: {
    term: 'Conversion Rate',
    shortDefinition: 'What % of visitors completed your goal',
    fullExplanation: 'Conversion rate tells you how effective your page or campaign is at turning visitors into customers (or leads, or subscribers). If 100 people visit your page and 3 buy, your conversion rate is 3%.',
    example: '500 visitors to your pricing page, 25 signed up = 5% conversion rate',
    goodBenchmark: '2-5% is typical for websites, 10%+ is excellent'
  },
  engagement: {
    term: 'Engagement',
    shortDefinition: 'Any interaction - likes, comments, shares, clicks, saves',
    fullExplanation: 'Engagement measures how much people interact with your content instead of just scrolling past. High engagement means your content connects with your audience and encourages them to respond.',
    example: 'A post got 50 likes, 12 comments, and 8 shares = 70 engagements',
    goodBenchmark: '2-3% engagement rate is average, 5%+ is good'
  },
  budget: {
    term: 'Marketing Budget',
    shortDefinition: 'How much you are willing to spend on marketing',
    fullExplanation: 'Your marketing budget is the total amount you plan to spend on marketing activities. This includes ads, content creation, tools, and any paid promotion. Start small, measure results, then increase what works.',
    example: '$1,000/month budget split between Facebook ads ($600) and Google ads ($400)',
    goodBenchmark: 'Typical businesses spend 5-15% of revenue on marketing'
  },
  campaign: {
    term: 'Campaign',
    shortDefinition: 'A coordinated marketing effort with a single goal',
    fullExplanation: 'A campaign is a planned series of marketing activities working toward one specific goal. It has a start date, end date, budget, and measurable target. Think of it as a project with a clear objective.',
    example: '"Summer Sale Campaign" - 2 weeks of ads promoting 20% off, goal: 100 sales',
    goodBenchmark: 'Run 2-3 focused campaigns rather than 10 scattered efforts'
  },
  target_audience: {
    term: 'Target Audience',
    shortDefinition: 'The specific group most likely to buy from you',
    fullExplanation: 'Your target audience is the group of people most likely to need and buy your product. Defining them well means your marketing reaches the right people instead of wasting money showing ads to people who will never buy.',
    example: '"Small business owners, 25-45, who sell products online and struggle with shipping"',
    goodBenchmark: 'Be specific - "everyone" is not a target audience'
  },
  ab_testing: {
    term: 'A/B Testing',
    shortDefinition: 'Showing two versions to see which performs better',
    fullExplanation: 'A/B testing (also called split testing) means creating two versions of something and showing each to half your audience. You then measure which version gets better results and use the winner.',
    example: 'Test headline A "Save 20%" vs headline B "Get $50 off" - B won with 15% higher clicks',
    goodBenchmark: 'Test one element at a time to know what made the difference'
  },
  funnel: {
    term: 'Marketing Funnel',
    shortDefinition: 'The journey from stranger to customer',
    fullExplanation: 'A funnel represents the stages someone goes through before buying: Awareness (they learn you exist) > Interest (they want to know more) > Decision (they are comparing options) > Action (they buy). It is called a funnel because fewer people make it to each stage.',
    example: '10,000 see your ad > 500 visit website > 50 request demo > 10 become customers',
    goodBenchmark: 'Typical drop-off at each stage is 80-90%'
  },
  cpa: {
    term: 'CPA (Cost Per Acquisition)',
    shortDefinition: 'How much you spend to get one customer',
    fullExplanation: 'CPA tells you the total cost to acquire one paying customer. Include all marketing costs (ads, tools, content) divided by number of customers gained. Lower CPA means more efficient marketing.',
    example: 'Spent $1,000 on ads, got 10 customers = $100 CPA',
    goodBenchmark: 'Should be less than customer lifetime value (what they spend over time)'
  },
  ltv: {
    term: 'LTV (Lifetime Value)',
    shortDefinition: 'Total money a customer will spend with you over time',
    fullExplanation: 'LTV estimates how much revenue one customer will generate over their entire relationship with your business. A customer who buys $50/month for 2 years has an LTV of $1,200. This helps you know how much you can afford to spend to acquire them.',
    example: 'Average customer stays 18 months, pays $100/month = $1,800 LTV',
    goodBenchmark: 'LTV should be at least 3x your CPA to be sustainable'
  },
  cpc: {
    term: 'CPC (Cost Per Click)',
    shortDefinition: 'How much you pay when someone clicks your ad',
    fullExplanation: 'CPC is the price you pay each time someone clicks on your ad. If your ad budget is $100 and you get 50 clicks, your CPC is $2. Lower CPC means you get more visitors for your budget.',
    example: '$500 ad spend, 250 clicks = $2 CPC',
    goodBenchmark: '$1-3 is typical, varies widely by industry'
  },
  cpm: {
    term: 'CPM (Cost Per Thousand Impressions)',
    shortDefinition: 'Cost to show your ad 1,000 times',
    fullExplanation: 'CPM is how much you pay for 1,000 ad views. This is common for brand awareness campaigns where you want to be seen, even if people do not click. M stands for "mille" (Latin for thousand).',
    example: '$10 CPM means you pay $10 for every 1,000 times your ad is shown',
    goodBenchmark: '$5-15 is typical on social media'
  },
  bounce_rate: {
    term: 'Bounce Rate',
    shortDefinition: 'Visitors who left immediately without doing anything',
    fullExplanation: 'Bounce rate is the percentage of visitors who land on your page and leave without clicking anything or going to another page. A high bounce rate might mean your page is not relevant or engaging.',
    example: '500 visitors, 200 left immediately = 40% bounce rate',
    goodBenchmark: '40-60% is average, under 40% is good'
  },
  organic: {
    term: 'Organic Traffic/Reach',
    shortDefinition: 'Visitors who found you without paid ads',
    fullExplanation: 'Organic means people who found you naturally - through search engines, social media posts you did not pay to promote, or word of mouth. This is "free" traffic (though creating content takes time/money).',
    example: 'Blog post ranks on Google, gets 500 visitors/month = organic traffic',
    goodBenchmark: 'Balance organic (free, slow) with paid (costs money, fast)'
  },
  paid: {
    term: 'Paid Traffic/Reach',
    shortDefinition: 'Visitors who came through paid advertising',
    fullExplanation: 'Paid traffic comes from advertising - Google Ads, Facebook Ads, sponsored posts, etc. You pay to get your content in front of people. Results are faster but stop when you stop paying.',
    example: 'Running Facebook ads that bring 200 visitors/day',
    goodBenchmark: 'Start small ($10-50/day), scale what works'
  },
  retargeting: {
    term: 'Retargeting/Remarketing',
    shortDefinition: 'Showing ads to people who already visited your site',
    fullExplanation: 'Retargeting shows your ads to people who already interacted with your business but did not buy. Since they already know you, they are more likely to convert. You have seen this - visit a shoe store, see their ads everywhere.',
    example: 'Someone viewed your product page but did not buy, now sees your ad on Facebook',
    goodBenchmark: 'Often 2-3x more effective than regular ads'
  },
  lead_score: {
    term: 'Lead Score',
    shortDefinition: 'A number (0-100) showing how likely someone is to buy',
    fullExplanation: 'Lead scoring assigns points to leads based on their actions and characteristics. Someone who visits your pricing page, downloads a guide, and works at a big company might score 85. Someone who only signed up for a newsletter might score 25. Focus on high scorers.',
    example: 'Visited pricing page (+20), opened 3 emails (+15), downloaded guide (+25) = 60 points',
    goodBenchmark: '80+ = hot lead, 50-79 = warm, under 50 = cold'
  },
  kpi: {
    term: 'KPI (Key Performance Indicator)',
    shortDefinition: 'The most important numbers that show if you are succeeding',
    fullExplanation: 'KPIs are the specific metrics you track to measure success. Instead of looking at 50 numbers, pick 3-5 that really matter. If your goal is sales, track conversion rate and revenue. If it is brand awareness, track reach and engagement.',
    example: 'Your KPIs: Monthly leads (goal: 100), Conversion rate (goal: 5%), CPA (goal: under $50)',
    goodBenchmark: 'Pick 3-5 KPIs max - too many is confusing'
  },
  content_marketing: {
    term: 'Content Marketing',
    shortDefinition: 'Attracting customers by creating useful content',
    fullExplanation: 'Content marketing means creating valuable content (blogs, videos, guides) that attracts your target audience. Instead of directly selling, you provide value first. People find your content, learn to trust you, then eventually buy.',
    example: 'A accounting firm writes "10 Tax Mistakes Small Businesses Make" - readers might hire them',
    goodBenchmark: 'Takes 3-6 months to see real results, but compounds over time'
  },
  seo: {
    term: 'SEO (Search Engine Optimization)',
    shortDefinition: 'Making your website show up higher in Google',
    fullExplanation: 'SEO is optimizing your website so it appears higher in search results when people look for related topics. Good SEO means free, consistent traffic from people actively searching for what you offer.',
    example: 'Your bakery website ranks #3 for "best birthday cakes in Chicago"',
    goodBenchmark: 'First page results get 95% of clicks'
  },
  ppc: {
    term: 'PPC (Pay-Per-Click)',
    shortDefinition: 'Ads where you only pay when someone clicks',
    fullExplanation: 'PPC is advertising where you pay only when someone actually clicks your ad. Google Ads and many social media ads work this way. You do not pay just for being shown - only for clicks.',
    example: 'Your Google ad appears 1,000 times but only 30 people click = you pay for 30 clicks',
    goodBenchmark: 'Good for testing - start with $10-20/day'
  }
};

// Inline term tooltip - shows definition on hover
interface TermTooltipProps {
  term: keyof typeof marketingGlossary;
  children?: React.ReactNode;
  className?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({
  term,
  children,
  className = ''
}) => {
  const glossaryEntry = marketingGlossary[term];

  if (!glossaryEntry) {
    return <span className={className}>{children}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-gray-400 ${className}`}>
            {children || glossaryEntry.term}
            <HelpCircle className="h-3 w-3 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4" side="top">
          <p className="font-medium text-sm mb-1">{glossaryEntry.term}</p>
          <p className="text-xs text-muted-foreground">{glossaryEntry.shortDefinition}</p>
          {glossaryEntry.goodBenchmark && (
            <p className="text-xs text-green-600 mt-2">
              Good to know: {glossaryEntry.goodBenchmark}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Full glossary dialog
export const GlossaryDialog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const filteredTerms = Object.entries(marketingGlossary).filter(
    ([key, entry]) =>
      entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Marketing Terms
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Marketing Glossary
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Plain-English definitions for marketing terms - no jargon
          </p>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
          {filteredTerms.map(([termKey, entry]) => (
            <div
              key={termKey}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedTerm === termKey
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => setSelectedTerm(selectedTerm === termKey ? null : termKey)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{entry.term}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {entry.shortDefinition}
                  </p>
                </div>
              </div>

              {selectedTerm === termKey && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.fullExplanation}
                    </p>
                  </div>
                  {entry.example && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Example:</p>
                      <p className="text-sm">{entry.example}</p>
                    </div>
                  )}
                  {entry.goodBenchmark && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        Benchmark
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.goodBenchmark}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get definition
export const getTermDefinition = (term: keyof typeof marketingGlossary) => {
  return marketingGlossary[term];
};

export default marketingGlossary;
