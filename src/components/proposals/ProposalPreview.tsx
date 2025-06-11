
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Send, FileText } from 'lucide-react';
import { GeneratedProposal } from '@/types/proposals';
import { generateProposalPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface ProposalPreviewProps {
  proposal: GeneratedProposal | null;
  onExport: (proposalId: string, format: string) => void;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({ proposal, onExport }) => {
  const { toast } = useToast();

  const handlePDFDownload = async () => {
    if (!proposal) return;
    
    try {
      await generateProposalPDF(proposal);
      toast({
        title: "PDF Generated",
        description: "Proposal PDF has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!proposal) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No proposal generated yet. Create a proposal first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Generated Proposal</CardTitle>
          <CardDescription>Review and customize your proposal before sending</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePDFDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onExport(proposal.id, 'docx')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Word
          </Button>
          <Button className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Proposal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-700">{proposal.content.executive_summary}</p>
          </div>
        </div>

        {/* Pricing Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Pricing Breakdown</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-medium">Item</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-right p-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {proposal.pricing.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3 font-medium">{item.item}</td>
                    <td className="p-3 text-slate-600">{item.description}</td>
                    <td className="p-3 text-right font-medium">${item.price.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t bg-slate-50">
                  <td colSpan={2} className="p-3 font-semibold">Total</td>
                  <td className="p-3 text-right font-semibold">
                    ${proposal.pricing.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Project Timeline</h3>
          <div className="space-y-3">
            {proposal.timeline.map((phase, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{phase.phase}</h4>
                  <span className="text-sm text-slate-600">{phase.duration}</span>
                </div>
                <div className="text-sm text-slate-600">
                  <strong>Deliverables:</strong> {phase.deliverables.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalPreview;
