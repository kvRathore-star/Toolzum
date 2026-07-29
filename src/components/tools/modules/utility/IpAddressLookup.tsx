"use client";

import React, { useState } from 'react';
import { ShieldAlert, Download, RefreshCw, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

  const fetchIpDetails = async () => {
    setIsProcessing(true);
    setDetails(null);

    // If empty input, queries self IP
    const target = ipAddress.trim() ? ipAddress.trim() : '';
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
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
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
            <input 
              type="text" 
              value={ipAddress}
              onChange={e => setIpAddress(e.target.value)}
              placeholder="e.g. 8.8.8.8 (leave empty to query your current IP)"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-xs outline-none"
            />
          </div>

          <button onClick={fetchIpDetails} disabled={isProcessing} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Resolve IP Details
          </button>
        </div>

        {/* Geo Details */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl min-h-[250px] flex flex-col justify-center">
          {details ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-xs">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-zinc-800 pb-2">Resolved Geolocation details</span>
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
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)]">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs">No IP Address details loaded. Trigger resolution query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}