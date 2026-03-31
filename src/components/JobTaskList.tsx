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
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tasks</h3>
        {totalCount > 0 && (
          <span className="text-[12px] text-gray-400 dark:text-gray-500">
            {completedCount} of {totalCount} complete
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        {sorted.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg px-1 py-1.5 -mx-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            {/* Custom checkbox */}
            <button
              type="button"
              onClick={() => handleToggle(task.id)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                task.done
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-gray-300 bg-white hover:border-brand-400 dark:border-gray-600 dark:bg-gray-800'
              }`}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>

            {/* Task text */}
            <span
              className={`flex-1 text-[14px] transition-all ${
                task.done
                  ? 'line-through text-gray-400 dark:text-gray-600'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {task.text}
            </span>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-opacity shrink-0"
              aria-label="Delete task"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add task input */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add task..."
          className="flex-1 rounded-lg border-0 bg-transparent px-0 py-1.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTask.trim() || submitting}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
