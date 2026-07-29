"use client";
import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function BmrCalculator() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.2); // Sedentary

  // Mifflin-St Jeor Equation
  const bmr = gender === 'male'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;

  const tdee = bmr * activity;

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Activity className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">BMR & TDEE Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Age (Years)</label>
              <input type="number" value={age} onChange={e => setAge(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Activity Level</label>
            <select value={activity} onChange={e => setActivity(parseFloat(e.target.value))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none">
              <option value="1.2">Sedentary (Little or no exercise)</option>
              <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
              <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
              <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
              <option value="1.9">Extra Active (Very hard work/athletics)</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Basal Metabolic Rate</h4>
            <p className="text-3xl font-extrabold text-[var(--text-secondary)] dark:text-white">{Math.round(bmr)} kcal/day</p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <span className="text-xs text-[var(--text-muted)]">TDEE (Daily Calories Needed)</span>
            <p className="text-4xl font-extrabold text-[var(--accent)]">{Math.round(tdee)} kcal/day</p>
          </div>
        </div>
      </div>
    </div>
  );
}