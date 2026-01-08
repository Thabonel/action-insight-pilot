import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Approval {
  id: string
  user_id: string
  post_content: string
  mentions: string[]
  hashtags: string[]
  platform: string
  requested_by_user_id: string | null
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by_user_id: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  expires_at: string
}

export const ApprovalWorkflowDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      fetchApprovals();
    }
  }, [user, filter]);

  const fetchApprovals = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('approval-workflow', {
        body: { action: 'list' }
      });

      if (error) throw error;

      let filteredData = data.approvals || [];

      if (filter !== 'all') {
        filteredData = filteredData.filter((a: Approval) => a.approval_status === filter);
      }

      setApprovals(filteredData);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to load approvals',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async (approvalId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('approval-workflow', {
        body: {
          action: 'approve',
          approval_id: approvalId
        }
      });

      if (error) throw error;

      toast({
        title: 'Post approved',
        description: 'The post has been approved and can now be published'
      });

      await fetchApprovals();
    } catch (error) {
      console.error('Error approving:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to approve',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRequest = async (approvalId: string) => {
    if (!user) return;

    const reason = rejectionReason[approvalId] || 'Not approved';

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('approval-workflow', {
        body: {
          action: 'reject',
          approval_id: approvalId,
          rejection_reason: reason
        }
      });

      if (error) throw error;

      toast({
        title: 'Post rejected',
        description: 'The approval request has been rejected'
      });

      setRejectionReason({ ...rejectionReason, [approvalId]: '' });
      await fetchApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Failed to reject',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-3">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f as typeof filter)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && approvals.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-gray-300" />
            <p className="text-sm">Loading approval requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && approvals.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              No {filter !== 'all' ? filter : ''} approval requests found.
            </p>
          </div>
        )}

        {/* Approval List */}
        {approvals.length > 0 && (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className={`border rounded-lg p-4 ${
                  isExpired(approval.expires_at) && approval.approval_status === 'pending'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(approval.approval_status)}
                    <Badge variant="secondary" className="text-xs">
                      {approval.platform}
                    </Badge>
                  </div>

                  {isExpired(approval.expires_at) && approval.approval_status === 'pending' && (
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                </div>

                {/* Post Content */}
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {approval.post_content}
                  </p>
                </div>

                {/* Mentions and Hashtags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {approval.mentions && approval.mentions.length > 0 && (
                    <div className="flex gap-1">
                      {approval.mentions.map((mention, idx) => (
                        <Badge key={idx} variant="secondary">
                          {mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {approval.hashtags && approval.hashtags.length > 0 && (
                    <div className="flex gap-1">
                      {approval.hashtags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-3">
                  <p>Created: {new Date(approval.created_at).toLocaleString()}</p>
                  <p>Expires: {new Date(approval.expires_at).toLocaleString()}</p>
                  {approval.approved_at && (
                    <p>Actioned: {new Date(approval.approved_at).toLocaleString()}</p>
                  )}
                </div>

                {/* Rejection Reason (if rejected) */}
                {approval.approval_status === 'rejected' && approval.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <p className="text-sm text-red-900">
                      <strong>Rejection Reason:</strong> {approval.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Action Buttons (only for pending) */}
                {approval.approval_status === 'pending' && !isExpired(approval.expires_at) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rejection Reason (optional)
                      </label>
                      <Textarea
                        placeholder="Why are you rejecting this post?"
                        value={rejectionReason[approval.id] || ''}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [approval.id]: e.target.value
                          })
                        }
                        className="min-h-20"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveRequest(approval.id)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => rejectRequest(approval.id)}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
