
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  MessageSquare, 
  Calendar,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

interface WorkflowTask {
  id: string;
  title: string;
  type: 'brief' | 'design' | 'copy' | 'review' | 'approval' | 'production';
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'completed';
  assignee: {
    name: string;
    avatar?: string;
    role: string;
  };
  dueDate: string;
  dependencies: string[];
  comments: number;
  attachments: number;
}

interface CreativeProject {
  id: string;
  name: string;
  campaign: string;
  status: 'in_progress' | 'review' | 'approved' | 'completed';
  progress: number;
  tasks: WorkflowTask[];
  timeline: {
    start: string;
    end: string;
  };
}

const CreativeWorkflowPipeline: React.FC = () => {
  const [projects] = useState<CreativeProject[]>([
    {
      id: 'proj_001',
      name: 'Product Launch Video Ad',
      campaign: 'Q1 Product Launch',
      status: 'in_progress',
      progress: 65,
      timeline: {
        start: '2024-01-15',
        end: '2024-02-15'
      },
      tasks: [
        {
          id: 'task_001',
          title: 'Creative Brief',
          type: 'brief',
          status: 'completed',
          assignee: { name: 'Sarah Chen', role: 'Strategy Lead' },
          dueDate: '2024-01-18',
          dependencies: [],
          comments: 3,
          attachments: 2
        },
        {
          id: 'task_002',
          title: 'Storyboard Design',
          type: 'design',
          status: 'in_progress',
          assignee: { name: 'Mike Torres', role: 'Creative Director' },
          dueDate: '2024-01-22',
          dependencies: ['task_001'],
          comments: 5,
          attachments: 8
        },
        {
          id: 'task_003',
          title: 'Script Writing',
          type: 'copy',
          status: 'review',
          assignee: { name: 'Emma Wilson', role: 'Copywriter' },
          dueDate: '2024-01-20',
          dependencies: ['task_001'],
          comments: 2,
          attachments: 1
        },
        {
          id: 'task_004',
          title: 'Client Review',
          type: 'review',
          status: 'pending',
          assignee: { name: 'David Kim', role: 'Account Manager' },
          dueDate: '2024-01-25',
          dependencies: ['task_002', 'task_003'],
          comments: 0,
          attachments: 0
        }
      ]
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<string>('proj_001');

  const getStatusColor = (status: WorkflowTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: WorkflowTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'review': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  const getTasksByStatus = (status: WorkflowTask['status']) => {
    return currentProject?.tasks.filter(task => task.status === status) || [];
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentProject?.name}</CardTitle>
              <p className="text-gray-600 mt-1">Campaign: {currentProject?.campaign}</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(currentProject?.status || 'pending')}>
                {currentProject?.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {currentProject?.progress}% Complete
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${currentProject?.progress}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Pending Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              Pending ({getTasksByStatus('pending').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksByStatus('pending').map(task => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.comments > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {task.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              In Progress ({getTasksByStatus('in_progress').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksByStatus('in_progress').map(task => (
              <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.comments > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {task.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Review Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Review ({getTasksByStatus('review').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksByStatus('review').map(task => (
              <div key={task.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.comments > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {task.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Approved Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
              Approved ({getTasksByStatus('approved').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksByStatus('approved').map(task => (
              <div key={task.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.comments > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {task.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Completed ({getTasksByStatus('completed').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTasksByStatus('completed').map(task => (
              <div key={task.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.comments > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {task.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Next deadline: {currentProject?.tasks
                .filter(t => t.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate
                ? new Date(currentProject.tasks
                  .filter(t => t.status !== 'completed')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate
                ).toLocaleDateString()
                : 'No upcoming deadlines'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativeWorkflowPipeline;
