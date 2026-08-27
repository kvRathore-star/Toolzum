"use client";

import React, { useState, useEffect } from 'react';
import { CheckSquare, Trash2, Plus, Calendar, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function ToDoList() {
  const [items, setItems] = useState<ToDoItem[]>([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('toolzum_todo_list');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate to-do items from localStorage on mount
        setItems(JSON.parse(saved));
      } catch (_e) {
        // ignore
      }
    }
  }, []);

  const saveItems = (newItems: ToDoItem[]) => {
    setItems(newItems);
    localStorage.setItem('toolzum_todo_list', JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!input.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }

    const newItem: ToDoItem = {
      id: `todo-${Date.now()}`,
      text: input.trim(),
      completed: false,
      priority
    };

    saveItems([...items, newItem]);
    setInput('');
    toast.success('Task added');
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
    toast.success('Task removed');
  };

  const clearCompleted = () => {
    const updated = items.filter(item => !item.completed);
    saveItems(updated);
    toast.success('Cleared completed tasks');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Productivity Task To-Do List</h3>
        </div>
        {items.some(i => i.completed) && (
          <button onClick={clearCompleted} className="text-xs text-[var(--accent)] hover:underline">Clear Completed</button>
        )}
      </div>

      <div className="space-y-4">
        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What needs to be accomplished today?"
            className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-zinc-300"
          />
          <div className="flex gap-2">
            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 text-[var(--text-primary)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button onClick={addItem} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl text-xs flex items-center justify-center cursor-pointer" aria-label="Add">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2 pt-2">
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-[var(--bg-overlay)] p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-zinc-700 transition-all">
                <label className="flex items-center gap-3 cursor-pointer text-xs flex-1 select-none">
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => toggleItem(item.id)}
                    className="rounded text-[var(--accent)]" 
                  />
                  <span className={`text-zinc-900 dark:text-zinc-200 ${item.completed ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                    {item.text}
                  </span>
                  
                  {/* Priority Tag */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.priority === 'high' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' :
                    item.priority === 'medium' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                    'bg-[var(--bg-overlay)]0/10 text-[var(--text-muted)]'
                  }`}>
                    {item.priority}
                  </span>
                </label>

                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] rounded-lg cursor-pointer" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)] text-xs">
              No tasks registered yet. Add action items above to schedule your workday.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}