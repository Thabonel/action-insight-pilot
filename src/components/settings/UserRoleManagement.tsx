
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit3, 
  Trash2, 
  Mail,
  Search,
  Crown,
  Settings
} from 'lucide-react';

const UserRoleManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const roles = [
    { id: 'admin', name: 'Administrator', color: 'red', permissions: ['Full System Access', 'User Management', 'Billing', 'Settings'] },
    { id: 'manager', name: 'Manager', color: 'blue', permissions: ['Campaign Management', 'Team Oversight', 'Analytics', 'Content Creation'] },
    { id: 'user', name: 'User', color: 'green', permissions: ['Campaign Creation', 'Content Creation', 'Basic Analytics'] },
    { id: 'viewer', name: 'Viewer', color: 'gray', permissions: ['Read-only Access', 'Basic Reports'] }
  ];

  const users = [
    { id: 1, name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'admin', status: 'active', lastActive: '2 hours ago', avatar: 'SC' },
    { id: 2, name: 'Marcus Rodriguez', email: 'marcus.r@company.com', role: 'manager', status: 'active', lastActive: '1 day ago', avatar: 'MR' },
    { id: 3, name: 'Emma Thompson', email: 'emma.t@company.com', role: 'user', status: 'active', lastActive: '3 hours ago', avatar: 'ET' },
    { id: 4, name: 'David Park', email: 'david.park@company.com', role: 'user', status: 'pending', lastActive: 'Never', avatar: 'DP' },
    { id: 5, name: 'Lisa Wang', email: 'lisa.wang@company.com', role: 'viewer', status: 'inactive', lastActive: '2 weeks ago', avatar: 'LW' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'inactive': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">User & Role Management</h2>
          <p className="text-gray-600">Manage team members and their permissions</p>
        </div>
        <Button className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Invite User</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Role Definitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role Definitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(role => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{role.name}</h3>
                  <Badge variant="outline" className={`text-${role.color}-600 border-${role.color}-300`}>
                    {role.id === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                    {role.id}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {role.permissions.map(permission => (
                    <li key={permission} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Members ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Active</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-${getRoleColor(user.role)}-600 border-${getRoleColor(user.role)}-300`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-${getStatusColor(user.status)}-600 border-${getStatusColor(user.status)}-300`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.lastActive}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Bulk Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Send Bulk Invite</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Update Permissions</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Export User List</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManagement;
