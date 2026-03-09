'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

const GROUP_OPTIONS = ['Students', 'Admins'];

export default function UsersPage() {
  const [group, setGroup] = useState('Students');
  const { data, isLoading } = useUsers(group);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">View app users from Cognito with group filters</p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Group Filter</label>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        >
          {GROUP_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{group} Users</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-500" size={28} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Groups</th>
                    <th className="py-2 pr-0 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.users || []).map((user: any) => (
                    <tr key={user.username} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-4 text-gray-900">{user.email || user.username}</td>
                      <td className="py-3 pr-4 text-gray-700">
                        {[user.given_name, user.family_name].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{user.status || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{(user.groups || []).join(', ') || '—'}</td>
                      <td className="py-3 pr-0 text-gray-700">
                        {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.users || data.users.length === 0) && (
                <p className="py-8 text-center text-gray-500">No users found in this group</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

