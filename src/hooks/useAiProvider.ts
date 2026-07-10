"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export type AiProvider = 'openai' | 'gemini' | 'groq';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'toolhub_ai_key_encrypted';
const SESSION_KEY_KEY = 'toolhub_ai_session_wrapping_key';
const PROVIDER_KEY = 'toolhub_ai_provider';

async function generateWrappingKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportWrappingKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(raw);
  return btoa(String.fromCharCode(...bytes));
}

async function importWrappingKey(encoded: string): Promise<CryptoKey> {
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  return await crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
}

async function encryptApiKey(plaintext: string): Promise<string> {
  const wrappingKey = await generateWrappingKey();
  const exported = await exportWrappingKey(wrappingKey);
  try { sessionStorage.setItem(SESSION_KEY_KEY, exported); } catch { /* noop */ }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptApiKey(payload: string): Promise<string | null> {
  const sessionKeyStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_KEY) : null;
  if (!sessionKeyStr) return null;
  try {
    const wrappingKey = await importWrappingKey(sessionKeyStr);
    const raw = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const ciphertext = raw.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrappingKey, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

function canUseWebCrypto(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

export function useAiProvider() {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    const savedProvider = localStorage.getItem(PROVIDER_KEY) as AiProvider;
    if (savedProvider) setProvider(savedProvider);

    if (!canUseWebCrypto()) {
      toast.error('This browser does not support WebCrypto. AI features unavailable.');
      return;
    }

    const encryptedKey = localStorage.getItem(STORAGE_KEY);
    if (encryptedKey) {
      decryptApiKey(encryptedKey).then((savedKey) => {
        if (savedKey) {
          setApiKey(savedKey);
          setIsConfigured(true);
        }
      });
    }
  }, []);

  const saveConfiguration = async (newProvider: AiProvider, newKey: string) => {
    if (!newKey.trim()) {
      toast.error("API Key cannot be empty");
      return false;
    }

    if (!canUseWebCrypto()) {
      toast.error('WebCrypto required but unavailable.');
      return false;
    }

    const encrypted = await encryptApiKey(newKey.trim());
    localStorage.setItem(PROVIDER_KEY, newProvider);
    localStorage.setItem(STORAGE_KEY, encrypted);

    setProvider(newProvider);
    setApiKey(newKey.trim());
    setIsConfigured(true);
    toast.success("API Key saved (session-scoped encryption).");
    return true;
  };

  const clearConfiguration = () => {
    localStorage.removeItem(PROVIDER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    try { sessionStorage.removeItem(SESSION_KEY_KEY); } catch { /* noop */ }
    setApiKey('');
    setIsConfigured(false);
    toast.success("API Key removed from browser.");
  };

  const generateCompletion = async (messages: AiMessage[], temperature = 0.7): Promise<string> => {
    if (!isConfigured || !apiKey) {
      throw new Error("API Key not configured");
    }

    try {
      if (provider === 'gemini') {
        return await fetchGeminiCompletion(messages, apiKey, temperature);
      } else if (provider === 'openai') {
        return await fetchOpenAICompletion(messages, apiKey, temperature);
      } else if (provider === 'groq') {
        return await fetchGroqCompletion(messages, apiKey, temperature);
      }
      throw new Error("Unsupported provider");
    } catch (error: unknown) {
      console.error("AI Error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to generate AI response.");
    }
  };

  return {
    provider,
    apiKey,
    isConfigured,
    saveConfiguration,
    clearConfiguration,
    generateCompletion
  };
}

// ============================================================================
// API Fetchers
// ============================================================================

const API_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchOpenAICompletion(messages: AiMessage[], apiKey: string, temperature: number) {
  const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature
    })
  });

  if (!res.ok) {
    const error: { error?: { message?: string } } = await res.json();
    throw new Error(error.error?.message || "OpenAI API Error");
  }

  const data: { choices: { message: { content: string } }[] } = await res.json();
  return data.choices[0].message.content;
}

async function fetchGroqCompletion(messages: AiMessage[], apiKey: string, temperature: number) {
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      temperature
    })
  });

  if (!res.ok) {
    const error: { error?: { message?: string } } = await res.json();
    throw new Error(error.error?.message || "Groq API Error");
  }

  const data: { choices: { message: { content: string } }[] } = await res.json();
  return data.choices[0].message.content;
}

async function fetchGeminiCompletion(messages: AiMessage[], apiKey: string, temperature: number) {
  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: {
        temperature
      }
    })
  });

  if (!res.ok) {
    const error: { error?: { message?: string } } = await res.json();
    throw new Error(error.error?.message || "Gemini API Error");
  }

  const data: { candidates: { content: { parts: { text: string }[] } }[] } = await res.json();
  return data.candidates[0].content.parts[0].text;
}
