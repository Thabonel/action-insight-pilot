
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  quality?: number;
}

export const generatePDF = async (
  elementId: string, 
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    filename = 'document',
    format = 'a4',
    orientation = 'portrait',
    margin = 10,
    quality = 1
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Temporarily show the element if it's hidden
    const originalDisplay = element.style.display;
    if (originalDisplay === 'none') {
      element.style.display = 'block';
    }

    // Generate canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Restore original display
    if (originalDisplay === 'none') {
      element.style.display = originalDisplay;
    }

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(orientation, 'mm', format);
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight() - (margin * 2);

    let heightLeft = pdfHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const generateProposalPDF = async (proposal: any): Promise<void> => {
  // Create a temporary element with the proposal content
  const tempElement = document.createElement('div');
  tempElement.id = 'proposal-pdf-content';
  tempElement.style.position = 'absolute';
  tempElement.style.left = '-9999px';
  tempElement.style.width = '800px';
  tempElement.style.padding = '40px';
  tempElement.style.fontFamily = 'Arial, sans-serif';
  tempElement.style.backgroundColor = 'white';

  tempElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 10px;">Business Proposal</h1>
      <h2 style="color: #666; font-size: 20px; margin-bottom: 30px;">${proposal.content?.title || 'Untitled Proposal'}</h2>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">Executive Summary</h3>
      <div style="line-height: 1.6; color: #333;">
        ${proposal.content?.executive_summary || proposal.content?.content || 'No content available'}
      </div>
    </div>

    ${proposal.pricing && proposal.pricing.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">Pricing Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Description</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${proposal.pricing.map((item: any) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.item}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">$${item.price.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #f9f9f9; font-weight: bold;">
              <td colspan="2" style="padding: 12px; border: 1px solid #ddd;">Total</td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">
                $${proposal.pricing.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : ''}

    ${proposal.timeline && proposal.timeline.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">Project Timeline</h3>
        ${proposal.timeline.map((phase: any) => `
          <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <h4 style="margin: 0; color: #1a1a1a;">${phase.phase}</h4>
              <span style="color: #666;">${phase.duration}</span>
            </div>
            <div style="color: #666; font-size: 14px;">
              <strong>Deliverables:</strong> ${phase.deliverables.join(', ')}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${proposal.terms ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">Terms & Conditions</h3>
        <div style="color: #666; line-height: 1.6;">
          <p><strong>Payment Terms:</strong> ${proposal.terms.payment_terms}</p>
          ${proposal.terms.warranty ? `<p><strong>Warranty:</strong> ${proposal.terms.warranty}</p>` : ''}
        </div>
      </div>
    ` : ''}

    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  document.body.appendChild(tempElement);

  try {
    await generatePDF('proposal-pdf-content', {
      filename: `proposal-${proposal.id || 'untitled'}`,
      format: 'a4',
      orientation: 'portrait',
      margin: 15,
      quality: 2
    });
  } finally {
    document.body.removeChild(tempElement);
  }
};
