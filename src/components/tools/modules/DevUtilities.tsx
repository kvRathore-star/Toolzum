"use client";
import React from 'react';
import Link from 'next/link';
import { Plug, Shield, Container, Mail, ArrowRight } from 'lucide-react';

const TOOLS = [
  {
    slug: 'random-port-generator',
    icon: Plug,
    name: 'Random Port Generator',
    desc: 'Generate random TCP/UDP port numbers from well-known, registered, or dynamic ranges.',
  },
  {
    slug: 'chmod-calculator',
    icon: Shield,
    name: 'Chmod Calculator',
    desc: 'Convert between numeric (755) and symbolic (u=rwx,g=rx,o=rx) permission formats.',
  },
  {
    slug: 'docker-run-to-compose',
    icon: Container,
    name: 'Docker Run to Compose',
    desc: 'Convert docker run commands to docker-compose.yml format.',
  },
  {
    slug: 'email-normalizer',
    icon: Mail,
    name: 'Email Normalizer',
    desc: 'Normalize emails by removing dots, +tags, and lowercasing.',
  },
];

export default function DevUtilities() {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Each tool below has its own dedicated page with more features. Choose one to get started.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map(t => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={`/developer/${t.slug}`}
              className="group block p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                    {t.name}
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
