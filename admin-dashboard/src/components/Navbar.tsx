'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { LogOut, User } from 'lucide-react';

interface NavbarProps {
  user?: {
    userId?: string;
    username?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary-600">PayIntelli</h1>
          <span className="text-sm text-gray-500">Admin Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={18} />
            <span>{user?.username || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
