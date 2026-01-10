import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MentionData {
  handle: string
  reason: string
}

interface HashtagData {
  hashtag: string
  reasoning: string
}

type RecommendationData = MentionData | HashtagData

interface ShareRecommendation {
  id: string
  user_id: string
  shared_with_user_id: string
  recommendation_type: 'mention' | 'hashtag'
  recommendation_data: RecommendationData
  shared_at: string
  is_accepted: boolean | null
  accepted_at: string | null
  notes: string | null
}

interface TeamCollaborationPanelProps {
  currentRecommendation?: {
    type: 'mention' | 'hashtag'
    data: RecommendationData
  }
}

export const TeamCollaborationPanel: React.FC<TeamCollaborationPanelProps> = ({
  currentRecommendation
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shares, setShares] = useState<ShareRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareNotes, setShareNotes] = useState('');
  const [showShareForm, setShowShareForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchShares();
    }
  }, [user]);

  const fetchShares = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('team_mention_shares')
        .select('*')
        .eq('shared_with_user_id', user.id)
        .order('shared_at', { ascending: false });

      if (error) throw error;

      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to load shared recommendations',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareRecommendation = async () => {
    if (!user || !currentRecommendation || !shareEmail) {
      toast({
        title: 'Missing information',
        description: 'Please enter a team member email',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user ID from email
      const { data: sharedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', shareEmail)
        .single();

      if (userError || !sharedUser) {
        throw new Error('User not found with that email');
      }

      // Call share function
      const { data, error } = await supabase.rpc('share_recommendation', {
        p_user_id: user.id,
        p_shared_with_user_id: sharedUser.id,
        p_recommendation_type: currentRecommendation.type,
        p_recommendation_data: currentRecommendation.data
      });

      if (error) throw error;

      toast({
        title: 'Recommendation shared',
        description: `Shared with ${shareEmail}`
      });

      setShareEmail('');
      setShareNotes('');
      setShowShareForm(false);
    } catch (error) {
      console.error('Error sharing recommendation:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to share',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const respondToShare = async (shareId: string, accept: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('team_mention_shares')
        .update({
          is_accepted: accept,
          accepted_at: new Date().toISOString()
        })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: accept ? 'Recommendation accepted' : 'Recommendation declined',
        description: accept
          ? 'You can now use this recommendation in your posts'
          : 'Recommendation has been declined'
      });

      await fetchShares();
    } catch (error) {
      console.error('Error responding to share:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to respond',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationDisplay = (share: ShareRecommendation) => {
    if (share.recommendation_type === 'mention') {
      const data = share.recommendation_data as MentionData;
      return `@${data.handle} - ${data.reason}`;
    } else {
      const data = share.recommendation_data as HashtagData;
      return `${data.hashtag} - ${data.reasoning}`;
    }
  };

  const getStatusBadge = (share: ShareRecommendation) => {
    if (share.is_accepted === null) {
      return <Badge variant="outline">Pending</Badge>;
    } else if (share.is_accepted) {
      return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Declined</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Team Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Share Current Recommendation */}
        {currentRecommendation && (
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Share Current Recommendation</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareForm(!showShareForm)}
              >
                Share
              </Button>
            </div>

            {showShareForm && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Member Email
                  </label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Why this recommendation is relevant..."
                    value={shareNotes}
                    onChange={(e) => setShareNotes(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={shareRecommendation}
                    disabled={isLoading || !shareEmail}
                  >
                    Send to Team
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowShareForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Received Shares */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Shared with You</h3>

          {isLoading && shares.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              <p className="text-sm">Loading shared recommendations...</p>
            </div>
          )}

          {!isLoading && shares.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              <p className="text-sm">
                No shared recommendations yet. Team members can share their best mentions and hashtags with you.
              </p>
            </div>
          )}

          {shares.length > 0 && (
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {share.recommendation_type}
                        </Badge>
                        {getStatusBadge(share)}
                      </div>
                      <p className="text-sm text-gray-900">
                        {getRecommendationDisplay(share)}
                      </p>
                      {share.notes && (
                        <p className="text-xs text-gray-600 mt-2">
                          Note: {share.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Shared {new Date(share.shared_at).toLocaleDateString()}
                      </p>
                    </div>

                    {share.is_accepted === null && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respondToShare(share.id, true)}
                          disabled={isLoading}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respondToShare(share.id, false)}
                          disabled={isLoading}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
