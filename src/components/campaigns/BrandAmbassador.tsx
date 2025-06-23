
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, MessageSquare, TrendingUp } from 'lucide-react';

const BrandAmbassador: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Brand Ambassador Program</h2>
        <p className="text-slate-600">Manage and grow your brand ambassador network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">+0.2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+28 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.3K</div>
            <p className="text-xs text-muted-foreground">+15% increase</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ambassadors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    SA
                  </div>
                  <div>
                    <p className="font-medium">Sarah Anderson</p>
                    <p className="text-sm text-muted-foreground">2.3K followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">4.9★</p>
                  <p className="text-sm text-muted-foreground">18 posts</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    MJ
                  </div>
                  <div>
                    <p className="font-medium">Mike Johnson</p>
                    <p className="text-sm text-muted-foreground">1.8K followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">4.7★</p>
                  <p className="text-sm text-muted-foreground">15 posts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">New ambassador joined</p>
                <p className="text-sm text-muted-foreground">Emma Wilson signed up 2 hours ago</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium">Campaign completed</p>
                <p className="text-sm text-muted-foreground">Summer collection campaign ended with 95% completion rate</p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-medium">Review pending</p>
                <p className="text-sm text-muted-foreground">3 ambassador applications awaiting approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandAmbassador;
