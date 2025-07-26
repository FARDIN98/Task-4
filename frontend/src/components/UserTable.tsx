/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Trash2, Lock, Unlock } from 'lucide-react';
import { usersAPI, type User } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getAll();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error: unknown) {
      // Check if it's an authentication error (401/403)
      if (error && typeof error === 'object' && 'isAuthError' in error) {
        // User will be redirected by the interceptor
        return;
      }
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean | string) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (checked) {
      newSelectedUsers.add(userId);
    } else {
      newSelectedUsers.delete(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkAction = async (action: 'block' | 'unblock' | 'delete') => {
    if (selectedUsers.size === 0) return;

    setError(null);
    const userIds = Array.from(selectedUsers);
    
    // Check if current user is in the selection
    const isCurrentUserSelected = currentUser && userIds.includes(currentUser.id);

    try {
      let response;
      switch (action) {
        case 'block':
          response = await usersAPI.blockUsers(userIds);
          break;
        case 'unblock':
          response = await usersAPI.unblockUsers(userIds);
          break;
        case 'delete':
          response = await usersAPI.deleteUsers(userIds);
          break;
      }

      if (response.success) {
        // Show success toast
        const actionText = action === 'block' ? 'blocked' : action === 'unblock' ? 'unblocked' : 'deleted';
        const userCount = selectedUsers.size;
        toast({
          title: `Users ${actionText} successfully`,
          description: `${userCount} user${userCount > 1 ? 's' : ''} ${userCount > 1 ? 'have' : 'has'} been ${actionText}.`,
          duration: 3000,
        });

        if (isCurrentUserSelected && (action === 'block' || action === 'delete')) {
          // If current user was blocked or deleted, logout
          await logout();
          return;
        }
        await fetchUsers();
        setSelectedUsers(new Set());
      } else {
        const errorMsg = response.message || `Failed to ${action} users`;
        setError(errorMsg);
        toast({
          title: `Failed to ${action} users`,
          description: errorMsg,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error: unknown) {
      // Check if it's an authentication error (401/403)
      if (error && typeof error === 'object' && 'isAuthError' in error) {
        // User will be redirected by the interceptor
        return;
      }
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : `Failed to ${action} users`;
      setError(errorMessage);
      toast({
        title: `Failed to ${action} users`,
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const formatLastSeen = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffInMinutes = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'less than a minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(diffInMinutes / 1440);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return loginDate.toLocaleDateString();
  };

  const formatRegistrationTime = (registrationTime: string) => {
    const date = new Date(registrationTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Active' : 'Blocked';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Block Button */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('block')}
              disabled={selectedUsers.size === 0}
              className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Block</span>
            </Button>
          </div>
          
          {/* Unblock Button */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('unblock')}
              disabled={selectedUsers.size === 0}
              className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Unlock className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          {/* Delete Button */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={selectedUsers.size === 0}
              className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        {/* Selected count indicator */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <span className="text-xs sm:text-sm text-blue-700 font-medium">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <TableHead className="w-12 px-4 py-4">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-4 font-semibold text-gray-700">Name</TableHead>
              <TableHead className="min-w-[180px] px-4 py-4 font-semibold text-gray-700">Email</TableHead>
              <TableHead className="min-w-[120px] px-4 py-4 font-semibold text-gray-700">Last seen</TableHead>
              <TableHead className="min-w-[80px] px-4 py-4 font-semibold text-gray-700">Status</TableHead>
              <TableHead className="min-w-[140px] px-4 py-4 font-semibold text-gray-700">Registration Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className={user.status === 'blocked' ? 'opacity-60 hover:bg-gray-50' : 'hover:bg-gray-50'}
              >
                <TableCell className="px-4 py-3">
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">{user.name}</div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-600 text-sm">{user.email}</TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs sm:text-sm text-gray-600">{formatLastSeen(user.last_login)}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {getStatusText(user.status)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs sm:text-sm text-gray-600">{formatRegistrationTime(user.registration_time)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;