"use client";

import React, { useState } from 'react';
import { ShieldAlert, Download, RefreshCw, Globe, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';

const IPV4_RE = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_RE = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;

interface IpDetails {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  postal: string;
  org: string;
}

export default function IpAddressLookup() {
  const [ipAddress, setIpAddress] = useState('');
  const [details, setDetails] = useState<IpDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ipError, setIpError] = useState('');

  const fetchIpDetails = async () => {
    const target = ipAddress.trim();
    if (target && !IPV4_RE.test(target) && !IPV6_RE.test(target)) {
      setIpError('Invalid IP address — enter a valid IPv4 (e.g. 8.8.8.8) or IPv6 address, or leave empty for your own IP.');
      toast.error('Invalid IP address');
      return;
    }
    setIpError('');
    setIsProcessing(true);
    setDetails(null);

    // If empty input, queries self IP
    const url = target ? `https://ipapi.co/${target}/json/` : 'https://ipapi.co/json/';

    try {
      const response = await fetch(url);
      const data = await response.json() as any;
      if (data.error) {
        toast.error('Invalid IP Address or rate limit exceeded');
        return;
      }
      setDetails({
        ip: data.ip,
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country_name: data.country_name || 'Unknown',
        postal: data.postal || 'Unknown',
        org: data.org || 'Unknown'
      });
      toast.success('IP Address details resolved!');
    } catch (err) {
      toast.error('Failed to query geo database offline');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-[var(--accent)]" />
          IP Address Geo-Lookup & ISP Resolver
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Lookup IPv4 or IPv6 details including Country location, region coordinates, ZIP codes, and ISP providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lookup Controls */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">IP Address query</span>
            <input aria-label="IP Address query" 
              type="text" 
              value={ipAddress}
              onChange={e => setIpAddress(e.target.value)}
              placeholder="e.g. 8.8.8.8 (leave empty to query your current IP)"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
            {ipError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-medium">{ipError}</p>
            )}
          </div>

          <button onClick={fetchIpDetails} disabled={isProcessing} className="w-full mt-6 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Resolve IP Details
          </button>
        </div>

        {/* Geo Details */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl min-h-[250px] flex flex-col justify-center">
          {details ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-xs">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Resolved Geolocation details</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Resolved IP</span>
                  <p className="font-mono font-bold text-[var(--accent)] mt-1">{details.ip}</p>
                </div>
                <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">ISP Network</span>
                  <p className="font-bold text-[var(--text-primary)] mt-1">{details.org}</p>
                </div>
                <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Country & Postal</span>
                  <p className="font-bold text-[var(--text-primary)] mt-1">{details.country_name} ({details.postal})</p>
                </div>
                <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">City & State</span>
                  <p className="font-bold text-[var(--text-primary)] mt-1">{details.city}, {details.region}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(`IP: ${details.ip}\nISP: ${details.org}\nCountry: ${details.country_name} (${details.postal})\nCity: ${details.city}, ${details.region}`).then(ok => { if (ok) toast.success('IP details copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><Copy className="w-3.5 h-3.5" /> Copy Result</button>
                <button onClick={() => { const blob = new Blob([JSON.stringify(details, null, 2)], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); downloadOrShare(url, `ip-lookup-${details.ip}.json`); setTimeout(() => URL.revokeObjectURL(url), 100); toast.success('IP details downloaded!'); }} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)]">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-[var(--text-muted)]" />
              <p className="text-xs">No IP Address details loaded. Trigger resolution query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}