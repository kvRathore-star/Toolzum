"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function parseDockerRun(cmd: string): { yaml: string; warnings: string[] } {
  const parts = cmd.trim().split(/\s+/);
  const warnings: string[] = [];
  const services: Record<string, Record<string, unknown>> = {};
  const networks: Record<string, Record<string, unknown>> = {};
  const volumes: Record<string, Record<string, unknown>> = {};

  let serviceName = 'app';
  let i = 0;

  while (i < parts.length) {
    const p = parts[i];
    if (p === 'docker' || p === 'run') { i++; continue; }
    if (p === '-d' || p === '--detach') { i++; continue; }
    if (p === '-it' || p === '-i' || p === '-t') { i++; continue; }
    if (p === '--rm') { i++; continue; }

    if ((p === '--name' || p === '--service-name') && i + 1 < parts.length) {
      serviceName = parts[i + 1];
      i += 2;
      continue;
    }

    // Image
    if (!p.startsWith('-') && !services[serviceName]?.image) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].image = p;
      i++;
      continue;
    }

    // Ports
    if ((p === '-p' || p === '--publish') && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      if (!services[serviceName].ports) services[serviceName].ports = [];
      (services[serviceName].ports as string[]).push(parts[i + 1]);
      i += 2;
      continue;
    }

    // Volumes
    if ((p === '-v' || p === '--volume') && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      if (!services[serviceName].volumes) services[serviceName].volumes = [];
      const vol = parts[i + 1];
      (services[serviceName].volumes as string[]).push(vol);
      // Track named volumes
      const volParts = vol.split(':');
      if (volParts.length >= 2 && !volParts[0].startsWith('/') && !volParts[0].startsWith('.')) {
        volumes[volParts[0]] = {};
      }
      i += 2;
      continue;
    }

    // Environment variables
    if ((p === '-e' || p === '--env') && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      if (!services[serviceName].environment) services[serviceName].environment = {};
      const envParts = parts[i + 1].split('=');
      if (envParts.length >= 2) {
        (services[serviceName].environment as Record<string, string>)[envParts[0]] = envParts.slice(1).join('=');
      } else {
        warnings.push(`Env var "${parts[i + 1]}" has no value`);
      }
      i += 2;
      continue;
    }

    // Env file
    if ((p === '--env-file') && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].env_file = parts[i + 1];
      i += 2;
      continue;
    }

    // Restart
    if (p === '--restart' && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].restart = parts[i + 1];
      i += 2;
      continue;
    }

    // Network
    if (p === '--network' && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      if (!services[serviceName].networks) services[serviceName].networks = [];
      (services[serviceName].networks as string[]).push(parts[i + 1]);
      networks[parts[i + 1]] = {};
      i += 2;
      continue;
    }

    // Container name
    if (p === '--hostname' && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].hostname = parts[i + 1];
      i += 2;
      continue;
    }

    // Working dir
    if ((p === '-w' || p === '--workdir') && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].working_dir = parts[i + 1];
      i += 2;
      continue;
    }

    // User
    if (p === '--user' && i + 1 < parts.length) {
      if (!services[serviceName]) services[serviceName] = {};
      services[serviceName].user = parts[i + 1];
      i += 2;
      continue;
    }

    // Command (anything after --)
    if (p === '--') {
      if (!services[serviceName]) services[serviceName] = {};
      const cmdParts = parts.slice(i + 1);
      if (cmdParts.length > 0) services[serviceName].command = cmdParts.join(' ');
      break;
    }

    i++;
  }

  // Warn about missing fields
  for (const [name, svc] of Object.entries(services)) {
    if (!svc.image) warnings.push(`Service "${name}" missing image`);
    if (!svc.ports) warnings.push(`Service "${name}" has no port mappings`);
  }

  // Build YAML
  let yaml = 'version: "3.8"\n\nservices:\n';
  for (const [name, svc] of Object.entries(services)) {
    yaml += `  ${name}:\n`;
    if (svc.image) yaml += `    image: ${svc.image}\n`;
    if (svc.container_name) yaml += `    container_name: ${svc.container_name}\n`;
    if (svc.ports && (svc.ports as string[]).length > 0) {
      yaml += `    ports:\n`;
      (svc.ports as string[]).forEach((port: string) => { yaml += `      - "${port}"\n`; });
    }
    if (svc.volumes && (svc.volumes as string[]).length > 0) {
      yaml += `    volumes:\n`;
      (svc.volumes as string[]).forEach((vol: string) => { yaml += `      - ${vol}\n`; });
    }
    if (svc.environment && Object.keys(svc.environment as Record<string, string>).length > 0) {
      yaml += `    environment:\n`;
      for (const [k, v] of Object.entries(svc.environment as Record<string, string>)) {
        yaml += `      ${k}: "${v}"\n`;
      }
    }
    if (svc.env_file) yaml += `    env_file:\n      - ${svc.env_file}\n`;
    if (svc.restart) yaml += `    restart: ${svc.restart}\n`;
    if (svc.networks && (svc.networks as string[]).length > 0) {
      yaml += `    networks:\n`;
      (svc.networks as string[]).forEach((net: string) => { yaml += `      - ${net}\n`; });
    }
    if (svc.hostname) yaml += `    hostname: ${svc.hostname}\n`;
    if (svc.working_dir) yaml += `    working_dir: ${svc.working_dir}\n`;
    if (svc.user) yaml += `    user: ${svc.user}\n`;
    if (svc.command) yaml += `    command: ${svc.command}\n`;
  }

  if (Object.keys(networks).length > 0) {
    yaml += '\nnetworks:\n';
    for (const [name] of Object.entries(networks)) {
      yaml += `  ${name}:\n    driver: bridge\n`;
    }
  }

  if (Object.keys(volumes).length > 0) {
    yaml += '\nvolumes:\n';
    for (const [name] of Object.entries(volumes)) {
      yaml += `  ${name}:\n`;
    }
  }

  return { yaml, warnings };
}

export default function DockerRunToCompose() {
  const [input, setInput] = useState('docker run -d --name myapp -p 8080:80 nginx');
  const [output, setOutput] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const presets = [
    { label: 'Simple nginx', apply: () => setInput('docker run -d --name webserver -p 80:80 -p 443:443 -v /var/www:/usr/share/nginx/html --restart unless-stopped nginx:latest') },
    { label: 'Node app with DB', apply: () => setInput('docker run -d --name node-app -p 3000:3000 -e NODE_ENV=production -e DATABASE_URL=postgres://user:pass@db:5432/mydb -v /app/logs:/app/logs --network mynet --restart always node:18-alpine') },
    { label: 'Redis + App', apply: () => setInput('docker run -d --name redis -p 6379:6379 -v redis-data:/data --restart unless-stopped redis:7-alpine') },
  ];

  const convert = useCallback(() => {
    if (!input.trim()) { toast.error('Enter a docker run command'); return; }
    const result = parseDockerRun(input);
    setOutput(result.yaml);
    setWarnings(result.warnings);
    if (result.warnings.length > 0) {
      toast.success(`Converted with ${result.warnings.length} warning(s)`);
    } else {
      toast.success('Converted to docker-compose.yml');
    }
  }, [input]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.map((p, i) => (
          <button key={i} onClick={p.apply}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <textarea aria-label="docker run -d --name myapp -p 8080:80 nginx" value={input} onChange={e => setInput(e.target.value)} placeholder="docker run -d --name myapp -p 8080:80 nginx"
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono h-[100px]" />
      <button onClick={convert} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Convert to Compose</button>
      {warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-xs text-yellow-700 dark:text-yellow-300">
          <div className="font-bold mb-1">Warnings:</div>
          {warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}
      {output && (
        <div className="relative">
          <textarea aria-label="Warnings:" value={output} readOnly className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }}
              className="text-[11px] text-[var(--accent)] hover:underline bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)]">Copy</button>
            <button onClick={() => {
              const blob = new Blob([output], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'docker-compose.yml';
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Downloaded!');
            }} className="text-[11px] text-[var(--accent)] hover:underline bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)]">Download</button>
          </div>
        </div>
      )}
    </div>
  );
}
