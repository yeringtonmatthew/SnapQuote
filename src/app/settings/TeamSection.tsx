'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { TeamMember } from '@/types/database';

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {
      // Silently fail — table may not exist yet
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setError(null);
    setSuccess(null);
    setInviting(true);

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          full_name: inviteName.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to invite team member');
      } else {
        setMembers((prev) => [data, ...prev]);
        setInviteEmail('');
        setInviteName('');
        setSuccess('Team member invited successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove team member');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setRemovingId(null);
    }
  }

  function getInitials(name: string | null, email: string): string {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Team</p>
          <p className="mt-1 text-xs text-gray-500">
            Manage who has access to your SnapQuote account.
          </p>
        </div>

        {/* Invite Form */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="input-field flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite();
              }}
            />
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Name (optional)"
              className="input-field flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite();
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || inviting}
            className="w-full rounded-2xl bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors press-scale"
          >
            {inviting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Inviting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Team Member
              </span>
            )}
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-[13px] font-medium text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-[13px] font-medium text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
      </div>

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : members.length === 0 ? (
        <div className="card py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No team members yet</p>
          <p className="mt-1 text-xs text-gray-400">Invite your first team member above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="card flex items-center gap-3 py-3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-[13px] font-bold text-brand-700 dark:text-brand-300">
                {getInitials(member.full_name, member.email)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {member.full_name || member.email}
                </p>
                {member.full_name && (
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    member.role === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    member.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {member.status === 'active' ? 'Active' : 'Invited'}
                </span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                disabled={removingId === member.id}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                title="Remove team member"
              >
                {removingId === member.id ? (
                  <Spinner size="sm" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      <p className="px-1 text-[11px] text-gray-400">
        Team members will be able to log in and manage quotes. Full team permissions coming soon.
      </p>
    </div>
  );
}
