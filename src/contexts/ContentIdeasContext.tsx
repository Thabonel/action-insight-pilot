import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  source: string;
  trending: number;
  tags: string[];
  createdAt: Date;
}

interface ContentIdeasContextType {
  contentIdeas: ContentIdea[];
  setContentIdeas: (ideas: ContentIdea[]) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  removeContentIdea: (id: string) => void;
  getRecentIdeas: (days?: number) => ContentIdea[];
}

const ContentIdeasContext = createContext<ContentIdeasContextType | undefined>(undefined);

export const useContentIdeas = () => {
  const context = useContext(ContentIdeasContext);
  if (!context) {
    throw new Error('useContentIdeas must be used within a ContentIdeasProvider');
  }
  return context;
};

interface ContentIdeasProviderProps {
  children: ReactNode;
}

export const ContentIdeasProvider: React.FC<ContentIdeasProviderProps> = ({ children }) => {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([
    {
      id: '1',
      title: 'AI-Powered Marketing Automation',
      description: 'How artificial intelligence is revolutionizing marketing workflows and customer engagement strategies.',
      source: 'Research',
      trending: 92,
      tags: ['AI', 'Marketing', 'Automation'],
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: '2', 
      title: 'Remote Team Productivity Tips',
      description: 'Best practices for managing distributed teams and maintaining high productivity levels.',
      source: 'Industry Trends',
      trending: 78,
      tags: ['Remote Work', 'Productivity', 'Management'],
      createdAt: new Date(Date.now() - 172800000)
    }
  ]);

  const addContentIdea = (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    const newIdea: ContentIdea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setContentIdeas(prev => [newIdea, ...prev]);
  };

  const removeContentIdea = (id: string) => {
    setContentIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const getRecentIdeas = (days: number = 7) => {
    return contentIdeas.filter(idea => {
      const daysDiff = (Date.now() - idea.createdAt.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= days;
    });
  };

  return (
    <ContentIdeasContext.Provider 
      value={{
        contentIdeas,
        setContentIdeas,
        addContentIdea,
        removeContentIdea,
        getRecentIdeas
      }}
    >
      {children}
    </ContentIdeasContext.Provider>
  );
};