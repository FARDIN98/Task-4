import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import UserTable from './UserTable';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        duration: 3000,
      });
    } catch {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">THE APP</h1>
              <p className="text-sm sm:text-base text-blue-100">User Management Dashboard</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-xs sm:text-sm text-white">
                  Welcome, <span className="font-bold text-blue-100">{user?.name}</span>
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-red-600  text-white font-bold border-red-500 text-sm w-full sm:w-auto px-6 py-2"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                Users Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
            <UserTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;