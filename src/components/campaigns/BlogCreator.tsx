
import React from 'react';
import { Edit } from 'lucide-react';

const BlogCreator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Blog Post Creator</h2>
        <p className="text-slate-600">Generate SEO-optimized blog posts with your brand voice</p>
      </div>

      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Edit className="w-8 h-8 text-blue-600" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Create Amazing Content</h3>
            <p className="text-slate-500">
              Our AI-powered blog creator will help you generate engaging, SEO-optimized content that matches your brand voice and resonates with your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCreator;
