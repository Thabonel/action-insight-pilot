
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Download, Search, Filter } from 'lucide-react';
import { Proposal } from '@/types/proposals';

interface ProposalsListProps {
  proposals: Proposal[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onExport: (proposalId: string, format: string) => void;
}

const ProposalsList: React.FC<ProposalsListProps> = ({
  proposals,
  searchTerm,
  onSearchChange,
  onExport
}) => {
  const filteredProposals = proposals.filter(proposal =>
    proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.template_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{proposal.client_name}</h3>
                  <p className="text-slate-600 capitalize">{proposal.template_type.replace('_', ' ')}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      proposal.status === 'sent' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {proposal.status}
                    </span>
                    <span className="font-medium">${proposal.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExport(proposal.id, 'pdf')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProposalsList;
