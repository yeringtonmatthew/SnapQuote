'use client';

import { useState } from 'react';
import { JobTask } from '@/types/database';

interface JobTaskListProps {
  quoteId: string;
  tasks: JobTask[];
}

export function JobTaskList({ quoteId, tasks: initialTasks }: JobTaskListProps) {
  const [tasks, setTasks] = useState<JobTask[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Sort: incomplete first, then completed
  const sorted = [...tasks].sort((a, b) => {
    if (a.done === b.done) return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return a.done ? 1 : -1;
  });

  async function handleAdd() {
    const text = newTask.trim();
    if (!text || submitting) return;

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: JobTask = {
      id: tempId,
      text,
      done: false,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);
    setNewTask('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/quotes/${quoteId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      } else {
        // Revert
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newDone = !task.done;
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: newDone } : t)));

    try {
      const res = await fetch(`/api/quotes/${quoteId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, done: newDone }),
      });
      if (!res.ok) {
        // Revert
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !newDone } : t)));
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !newDone } : t)));
    }
  }

  async function handleDelete(taskId: string) {
    const prev = [...tasks];
    // Optimistic remove
    setTasks((t) => t.filter((task) => task.id !== taskId));

    try {
      const res = await fetch(`/api/quotes/${quoteId}/tasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      });
      if (!res.ok) {
        setTasks(prev);
      }
    } catch {
      setTasks(prev);
    }
  }

  return (
    <div>
      {/* Progress bar + counter */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {completedCount} of {totalCount}
            </span>
            <span className="text-[12px] text-gray-400 dark:text-gray-500 tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                completedCount > 0 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-0.5">
        {sorted.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg px-1.5 py-2 -mx-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => handleToggle(task.id)}
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                task.done
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
              }`}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>

            {/* Task text */}
            <span
              className={`flex-1 text-[14px] leading-snug transition-all duration-200 ${
                task.done
                  ? 'line-through text-gray-400 dark:text-gray-600'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {task.text}
            </span>

            {/* Delete button - always visible on mobile, hover on desktop */}
            <button
              type="button"
              onClick={() => handleDelete(task.id)}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all duration-150 shrink-0"
              aria-label="Delete task"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add task input */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/80 dark:border-gray-800/60">
        <svg className="h-[18px] w-[18px] shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 border-0 bg-transparent px-0 py-1.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder-gray-600"
        />
        {newTask.trim() && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="text-[13px] font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed dark:text-brand-400 dark:hover:text-brand-300"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
