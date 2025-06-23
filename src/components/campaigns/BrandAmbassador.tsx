
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const BrandAmbassador: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Brand Ambassador GPT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload brand documents and chat with your brand assistant
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Get started by uploading your brand guidelines, style guides, and other brand documents to create a personalized brand assistant.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandAmbassador;
