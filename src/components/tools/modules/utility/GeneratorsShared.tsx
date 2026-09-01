"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Copy, Download, History, RotateCcw, RefreshCw, Shuffle, User, CreditCard, Key, Hash, Braces, Sigma, Ticket, Image as ImageIcon, BarChart3, Users, Palette, DollarSign, TrendingUp, Eye, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import QRCodeLib from 'qrcode';
import { downloadOrShare } from '@/utils/nativeShare';
import { CalculatorShell } from '../shared/CalculatorShell';
import { labelClass } from '../MiscToolsShared';

export { React, useState, useRef, useEffect, Copy, Download, History, RotateCcw, RefreshCw, Shuffle, User, CreditCard, Key, Hash, Braces, Sigma, Ticket, ImageIcon, BarChart3, Users, Palette, DollarSign, TrendingUp, Eye, List, toast, clipboardWrite, QRCodeLib, downloadOrShare, CalculatorShell, labelClass };

export function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
export function shuffleArray<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Input({ label, value, onChange, placeholder, type = "text", rows, min, max }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number; min?: number; max?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls + " resize-y"} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} />
      )}
    </div>
  );
}

export const ADJECTIVES = ['Swift', 'Brave', 'Clever', 'Mighty', 'Silent', 'Golden', 'Shadow', 'Crimson', 'Frost', 'Storm', 'Azure', 'Ember', 'Neon', 'Stealth', 'Blaze'];
export const NOUNS = ['Fox', 'Wolf', 'Eagle', 'Bear', 'Hawk', 'Owl', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Lion', 'Panther', 'Falcon', 'Cobra', 'Viper'];

export const FIRST_NAMES = ['Aarav', 'Priya', 'Vikram', 'Ananya', 'Rohit', 'Sneha', 'Arjun', 'Neha', 'Karan', 'Isha', 'Rahul', 'Pooja', 'Amit', 'Divya', 'Sachin'];
export const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Reddy', 'Nair', 'Das', 'Mishra', 'Agarwal', 'Mehta', 'Chopra', 'Malhotra'];
export const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.org', 'mail.com'];
export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
export const STREETS = ['Main St', 'Park Ave', 'Oak Lane', 'Maple Dr', 'Cedar Blvd', 'Elm St', 'Pine Rd', 'Lake View', 'Hill Rd', 'River Rd'];

export const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

export const COUPON_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
