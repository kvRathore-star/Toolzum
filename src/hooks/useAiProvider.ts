"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'toolhub_secure_key_2026'; // Obfuscation secret

export type AiProvider = 'openai' | 'gemini' | 'groq';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useAiProvider() {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Load from local storage on mount
    const savedProvider = localStorage.getItem('toolhub_ai_provider') as AiProvider;
    const encryptedKey = localStorage.getItem('toolhub_ai_key');
    
    if (savedProvider) setProvider(savedProvider);
    if (encryptedKey) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedKey, SECRET_KEY);
        const savedKey = bytes.toString(CryptoJS.enc.Utf8);
        if (savedKey) {
          setApiKey(savedKey);
          setIsConfigured(true);
        }
      } catch (e) {
        // If decryption fails (e.g., old plaintext key), clear it
        localStorage.removeItem('toolhub_ai_key');
      }
    }
  }, []);

  const saveConfiguration = (newProvider: AiProvider, newKey: string) => {
    if (!newKey.trim()) {
      toast.error("API Key cannot be empty");
      return false;
    }
    
    const encryptedKey = CryptoJS.AES.encrypt(newKey.trim(), SECRET_KEY).toString();
    localStorage.setItem('toolhub_ai_provider', newProvider);
    localStorage.setItem('toolhub_ai_key', encryptedKey);
    
    setProvider(newProvider);
    setApiKey(newKey.trim());
    setIsConfigured(true);
    toast.success("API Key saved securely in your browser!");
    return true;
  };

  const clearConfiguration = () => {
    localStorage.removeItem('toolhub_ai_provider');
    localStorage.removeItem('toolhub_ai_key');
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

async function fetchOpenAICompletion(messages: AiMessage[], apiKey: string, temperature: number) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  // Convert standard roles to Gemini roles
  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
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
