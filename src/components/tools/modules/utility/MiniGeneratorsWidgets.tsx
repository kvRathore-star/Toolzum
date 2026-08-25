"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Shield, Hash, Search, Download, Copy } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateULID(): { ulid: string; timestamp: number } {
  const time = Date.now();
  const rand = new Uint8Array(16);
  crypto.getRandomValues(rand);
  let t = time;
  let str = '';
  for (let i = 0; i < 10; i++) {
    str = CROCKFORD[t & 0x1f] + str;
    t = Math.floor(t / 32);
  }
  for (let i = 0; i < 16; i++) {
    str += CROCKFORD[rand[i] & 0x1f];
  }
  return { ulid: str, timestamp: time };
}

function decodeULIDTimestamp(ulid: string): number | null {
  if (ulid.length < 10) return null;
  let ts = 0;
  for (let i = 0; i < 10; i++) {
    const idx = CROCKFORD.indexOf(ulid[i].toUpperCase());
    if (idx === -1) return null;
    ts = ts * 32 + idx;
  }
  return ts;
}

function toNumeronym(word: string): string {
  const w = word.trim();
  if (w.length <= 2) return w;
  return w[0] + (w.length - 2) + w[w.length - 1];
}

function toAcronym(text: string): string {
  return text.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase();
}

function toWordNumeronym(text: string): string {
  return text.split(/\s+/).filter(Boolean).map(w => toNumeronym(w)).join(' ');
}

const MAC_VENDORS: Record<string, string> = {
  '3C:22:FB': 'Dell Inc.',
  '00:1A:11': 'Samsung Electronics',
  '00:1E:52': 'Samsung Electronics',
  'F8:1E:DF': 'Dell Inc.',
  'B8:27:EB': 'Raspberry Pi Foundation',
  'DC:A6:32': 'Raspberry Pi Foundation',
  'E4:5F:01': 'Raspberry Pi Foundation',
  '00:14:22': 'Dell Inc.',
  '00:1E:C2': 'Dell Inc.',
  '00:21:9B': 'Dell Inc.',
  '00:23:AE': 'Dell Inc.',
  '00:24:E8': 'Dell Inc.',
  '00:26:B9': 'Dell Inc.',
  '00:30:48': 'Dell Inc.',
  '08:00:69': 'HP Inc.',
  '00:1B:78': 'HP Inc.',
  '00:1E:B3': 'HP Inc.',
  '00:21:5D': 'HP Inc.',
  '00:23:7D': 'HP Inc.',
  '00:25:B3': 'HP Inc.',
  '3C:D9:2B': 'HP Inc.',
  '00:0A:27': 'Apple Inc.',
  '00:1F:5B': 'Apple Inc.',
  '00:23:32': 'Apple Inc.',
  '00:25:BC': 'Apple Inc.',
  '04:0C:CE': 'Apple Inc.',
  '08:66:98': 'Apple Inc.',
  '10:41:7F': 'Apple Inc.',
  '14:98:77': 'Apple Inc.',
  '1C:36:BB': 'Apple Inc.',
  '28:CF:DA': 'Apple Inc.',
  '34:15:9E': 'Apple Inc.',
  '38:C9:86': 'Apple Inc.',
  '3C:07:54': 'Apple Inc.',
  '40:A8:F0': 'Apple Inc.',
  '44:2D:62': 'Apple Inc.',
  '48:43:7C': 'Apple Inc.',
  '4C:32:75': 'Apple Inc.',
  '54:9F:13': 'Apple Inc.',
  '5C:E0:C5': 'Apple Inc.',
  '60:03:08': 'Apple Inc.',
  '60:2F:73': 'Apple Inc.',
  '64:A2:F9': 'Apple Inc.',
  '6C:70:9F': 'Apple Inc.',
  '70:DE:E2': 'Apple Inc.',
  '78:4F:43': 'Apple Inc.',
  '84:38:35': 'Apple Inc.',
  '88:53:2E': 'Apple Inc.',
  '8C:85:90': 'Apple Inc.',
  '90:28:34': 'Apple Inc.',
  '90:84:0D': 'Apple Inc.',
  '94:8F:EE': 'Apple Inc.',
  '9C:35:EB': 'Apple Inc.',
  'A4:29:42': 'Apple Inc.',
  'A4:D9:31': 'Apple Inc.',
  'AC:29:3A': 'Apple Inc.',
  'B0:2C:E7': 'Apple Inc.',
  'B8:8D:12': 'Apple Inc.',
  'C0:FE:FB': 'Apple Inc.',
  'C8:21:58': 'Apple Inc.',
  'CC:08:FB': 'Apple Inc.',
  'D0:23:DB': 'Apple Inc.',
  'D4:61:9D': 'Apple Inc.',
  'E0:2B:E9': 'Apple Inc.',
  'E8:6A:6E': 'Apple Inc.',
  'F0:18:98': 'Apple Inc.',
  'F4:5C:89': 'Apple Inc.',
  '00:0E:35': 'Intel Corporation',
  '00:1B:21': 'Intel Corporation',
  '00:1E:67': 'Intel Corporation',
  '00:21:6B': 'Intel Corporation',
  '00:25:56': 'Intel Corporation',
  '00:26:C7': 'Intel Corporation',
  '1C:FB:5C': 'Xiaomi Communications',
  '38:2C:4A': 'Xiaomi Communications',
  '7C:B3:7D': 'Xiaomi Communications',
  '90:F0:52': 'Xiaomi Communications',
  'A0:E9:DB': 'Xiaomi Communications',
  'C0:EE:FB': 'Xiaomi Communications',
  'EC:DF:3A': 'Xiaomi Communications',
  'F4:CF:E2': 'Xiaomi Communications',
  '00:19:C6': 'Cisco Systems',
  '00:1A:A1': 'Cisco Systems',
  '00:1B:0C': 'Cisco Systems',
  '00:1B:D4': 'Cisco Systems',
  '00:1C:B0': 'Cisco Systems',
  '00:1D:45': 'Cisco Systems',
  '00:1E:14': 'Cisco Systems',
  '00:1E:4B': 'Cisco Systems',
  '00:1E:79': 'Cisco Systems',
  '00:1E:F1': 'Cisco Systems',
  '00:1F:26': 'Cisco Systems',
  '00:1F:6C': 'Cisco Systems',
  '00:1F:CA': 'Cisco Systems',
  '00:21:1B': 'Cisco Systems',
  '00:21:5A': 'Cisco Systems',
  '00:21:D7': 'Cisco Systems',
  '00:22:0C': 'Cisco Systems',
  '00:22:6B': 'Cisco Systems',
  '00:23:0E': 'Cisco Systems',
  '00:23:5E': 'Cisco Systems',
  '00:23:AC': 'Cisco Systems',
  '00:24:14': 'Cisco Systems',
  '00:24:6C': 'Cisco Systems',
  '00:24:97': 'Cisco Systems',
  '00:25:45': 'Cisco Systems',
  '00:25:83': 'Cisco Systems',
  '00:25:9C': 'Cisco Systems',
  '00:26:0A': 'Cisco Systems',
  '00:26:55': 'Cisco Systems',
  '00:26:82': 'Cisco Systems',
  '00:26:C6': 'Cisco Systems',
  '0C:75:15': 'Cisco Systems',
  '10:F3:11': 'Cisco Systems',
  '14:58:D0': 'Cisco Systems',
  '1C:DE:C7': 'Cisco Systems',
  '24:DE:C6': 'Cisco Systems',
  '28:31:52': 'Cisco Systems',
  '2C:54:CF': 'Cisco Systems',
  '34:08:04': 'Cisco Systems',
  '38:CA:DA': 'Cisco Systems',
  '3C:08:F6': 'Cisco Systems',
  '40:3E:0A': 'Cisco Systems',
  '44:D3:CA': 'Cisco Systems',
  '54:A2:74': 'Cisco Systems',
  '58:0A:20': 'Cisco Systems',
  '64:F2:01': 'Cisco Systems',
  '6C:1E:6B': 'Cisco Systems',
  '70:CA:9B': 'Cisco Systems',
  '80:89:17': 'Cisco Systems',
  '84:B2:61': 'Cisco Systems',
  '88:F0:31': 'Cisco Systems',
  '8C:53:C3': 'Cisco Systems',
  '90:02:A7': 'Cisco Systems',
  'A0:02:DC': 'Cisco Systems',
  'A4:B2:39': 'Cisco Systems',
  'AC:F2:C5': 'Cisco Systems',
  'B0:AA:36': 'Cisco Systems',
  'B4:CC:E9': 'Cisco Systems',
  'C4:7D:4F': 'Cisco Systems',
  'C8:1E:E7': 'Cisco Systems',
  'CC:DE:96': 'Cisco Systems',
  'D0:67:E5': 'Cisco Systems',
  'D4:35:1D': 'Cisco Systems',
  'D4:62:EA': 'Cisco Systems',
  'DC:A4:CA': 'Cisco Systems',
  'E0:2F:6D': 'Cisco Systems',
  'E4:1D:2D': 'Cisco Systems',
  'E4:C7:22': 'Cisco Systems',
  'EC:08:6B': 'Cisco Systems',
  'F0:5C:19': 'Cisco Systems',
  'F8:AE:13': 'Cisco Systems',
  'FC:5B:26': 'Cisco Systems',
  '14:ED:BB': 'Google Inc.',
  '24:C0:B3': 'Google Inc.',
  '2C:5B:B8': 'Google Inc.',
  '38:6B:1C': 'Google Inc.',
  '3C:5A:37': 'Google Inc.',
  '40:4D:7F': 'Google Inc.',
  '50:6A:03': 'Google Inc.',
  '54:60:09': 'Google Inc.',
  '64:9E:F3': 'Google Inc.',
  '70:48:0F': 'Google Inc.',
  '74:86:7A': 'Google Inc.',
  '8C:8E:F2': 'Google Inc.',
  'A4:70:D6': 'Google Inc.',
  'AC:1E:5B': 'Google Inc.',
  'B4:3C:DF': 'Google Inc.',
  'C8:D9:52': 'Google Inc.',
  'D0:A6:37': 'Google Inc.',
  'D8:9C:67': 'Google Inc.',
  'E4:CE:8F': 'Google Inc.',
  'F0:6E:0B': 'Google Inc.',
  'F4:F5:D8': 'Google Inc.',
  'FC:C2:DE': 'Google Inc.',
  '04:01:D6': 'Huawei Technologies',
  '18:31:BF': 'Huawei Technologies',
  '20:DC:E6': 'Huawei Technologies',
  '24:46:C8': 'Huawei Technologies',
  '28:6E:D4': 'Huawei Technologies',
  '2C:3A:FD': 'Huawei Technologies',
  '30:49:3B': 'Huawei Technologies',
  '34:C6:7B': 'Huawei Technologies',
  '38:59:F8': 'Huawei Technologies',
  '3C:2C:99': 'Huawei Technologies',
  '3C:6C:3F': 'Huawei Technologies',
  '44:6E:E1': 'Huawei Technologies',
  '48:79:6E': 'Huawei Technologies',
  '4C:AA:16': 'Huawei Technologies',
  '50:57:A8': 'Huawei Technologies',
  '58:79:ED': 'Huawei Technologies',
  '60:E3:27': 'Huawei Technologies',
  '64:16:8F': 'Huawei Technologies',
  '68:B6:FC': 'Huawei Technologies',
  '6C:4B:90': 'Huawei Technologies',
  '70:39:39': 'Huawei Technologies',
  '74:31:94': 'Huawei Technologies',
  '78:F1:57': 'Huawei Technologies',
  '7C:11:CB': 'Huawei Technologies',
  '80:7A:85': 'Huawei Technologies',
  '84:56:9E': 'Huawei Technologies',
  '88:72:2D': 'Huawei Technologies',
  '8C:5C:1D': 'Huawei Technologies',
  '90:17:AC': 'Huawei Technologies',
  '94:77:2B': 'Huawei Technologies',
  '98:76:B6': 'Huawei Technologies',
  '9C:28:BF': 'Huawei Technologies',
  'A0:7E:5D': 'Huawei Technologies',
  'A4:77:33': 'Huawei Technologies',
  'A8:6B:B0': 'Huawei Technologies',
  'AC:9C:E4': 'Huawei Technologies',
  'B0:E2:E5': 'Huawei Technologies',
  'B4:51:D9': 'Huawei Technologies',
  'B8:3E:59': 'Huawei Technologies',
  'BC:76:70': 'Huawei Technologies',
  'C0:74:2F': 'Huawei Technologies',
  'C4:41:1E': 'Huawei Technologies',
  'C8:2E:18': 'Huawei Technologies',
  'CC:2D:1B': 'Huawei Technologies',
  'D0:37:61': 'Huawei Technologies',
  'D4:98:56': 'Huawei Technologies',
  'D8:1F:CC': 'Huawei Technologies',
  'DC:0C:5C': 'Huawei Technologies',
  'E0:AB:FE': 'Huawei Technologies',
  'E4:71:58': 'Huawei Technologies',
  'E8:65:49': 'Huawei Technologies',
  'EC:42:66': 'Huawei Technologies',
  'F0:6B:CA': 'Huawei Technologies',
  'F4:E6:8D': 'Huawei Technologies',
  'F8:9D:2D': 'Huawei Technologies',
  'FC:58:FA': 'Huawei Technologies',
  '00:0A:F5': 'Samsung Electronics',
  '00:1B:A6': 'Samsung Electronics',
  '00:1C:C8': 'Samsung Electronics',
  '00:1E:E8': 'Samsung Electronics',
  '00:20:89': 'Samsung Electronics',
  '00:21:D6': 'Samsung Electronics',
  '00:22:5D': 'Samsung Electronics',
  '00:22:E6': 'Samsung Electronics',
  '00:23:78': 'Samsung Electronics',
  '00:23:D4': 'Samsung Electronics',
  '00:24:90': 'Samsung Electronics',
  '00:25:A2': 'Samsung Electronics',
  '04:79:70': 'Samsung Electronics',
  '08:51:16': 'Samsung Electronics',
  '0C:5A:19': 'Samsung Electronics',
  '10:08:B1': 'Samsung Electronics',
  '10:1C:0C': 'Samsung Electronics',
  '10:68:8F': 'Samsung Electronics',
  '14:49:69': 'Samsung Electronics',
  '18:26:26': 'Samsung Electronics',
  '1C:2C:0B': 'Samsung Electronics',
  '20:37:06': 'Samsung Electronics',
  '24:0A:C4': 'Samsung Electronics',
  '28:98:7B': 'Samsung Electronics',
  '2C:10:C1': 'Samsung Electronics',
  '2C:54:91': 'Samsung Electronics',
  '30:43:65': 'Samsung Electronics',
  '34:23:87': 'Samsung Electronics',
  '38:0B:40': 'Samsung Electronics',
  '3C:0C:6D': 'Samsung Electronics',
  '3C:7C:3F': 'Samsung Electronics',
  '40:2E:2C': 'Samsung Electronics',
  '44:03:2C': 'Samsung Electronics',
  '48:59:29': 'Samsung Electronics',
  '4C:5F:70': 'Samsung Electronics',
  '50:7E:5D': 'Samsung Electronics',
  '54:68:C3': 'Samsung Electronics',
  '58:A2:B5': 'Samsung Electronics',
  '5C:49:7D': 'Samsung Electronics',
  '5C:51:4F': 'Samsung Electronics',
  '60:57:18': 'Samsung Electronics',
  '64:05:10': 'Samsung Electronics',
  '68:94:23': 'Samsung Electronics',
  '6C:4A:37': 'Samsung Electronics',
  '70:30:5D': 'Samsung Electronics',
  '74:42:7C': 'Samsung Electronics',
  '78:52:1A': 'Samsung Electronics',
  '7C:36:7A': 'Samsung Electronics',
  '80:7A:BF': 'Samsung Electronics',
  '84:FD:D8': 'Samsung Electronics',
  '88:2B:B5': 'Samsung Electronics',
  '8C:78:5A': 'Samsung Electronics',
  '90:5E:7C': 'Samsung Electronics',
  '94:51:03': 'Samsung Electronics',
  '98:65:E0': 'Samsung Electronics',
  '9C:51:83': 'Samsung Electronics',
  'A0:14:3D': 'Samsung Electronics',
  'A4:5E:60': 'Samsung Electronics',
  'A8:5B:78': 'Samsung Electronics',
  'AC:5B:3F': 'Samsung Electronics',
  'B0:75:15': 'Samsung Electronics',
  'B4:31:AC': 'Samsung Electronics',
  'B8:5D:0A': 'Samsung Electronics',
  'BC:72:21': 'Samsung Electronics',
  'C0:5E:59': 'Samsung Electronics',
  'C4:FD:26': 'Samsung Electronics',
  'C8:70:9F': 'Samsung Electronics',
  'CC:38:D1': 'Samsung Electronics',
  'D0:45:17': 'Samsung Electronics',
  'D4:90:3C': 'Samsung Electronics',
  'D8:3C:D0': 'Samsung Electronics',
  'DC:D9:A4': 'Samsung Electronics',
  'E0:F5:23': 'Samsung Electronics',
  'E4:BC:0E': 'Samsung Electronics',
  'E8:48:1F': 'Samsung Electronics',
  'EC:47:84': 'Samsung Electronics',
  'F0:1E:34': 'Samsung Electronics',
  'F4:78:0B': 'Samsung Electronics',
  'F8:30:64': 'Samsung Electronics',
  'FC:8F:90': 'Samsung Electronics',
  '00:19:7D': 'Amazon Technologies',
  '0C:47:C9': 'Amazon Technologies',
  '2C:21:31': 'Amazon Technologies',
  '34:D2:62': 'Amazon Technologies',
  '40:B4:CD': 'Amazon Technologies',
  '44:D8:1C': 'Amazon Technologies',
  '48:AD:08': 'Amazon Technologies',
  '4C:E6:9E': 'Amazon Technologies',
  '54:8D:1A': 'Amazon Technologies',
  '58:BF:EA': 'Amazon Technologies',
  '68:7A:98': 'Amazon Technologies',
  '74:75:4A': 'Amazon Technologies',
  '78:96:84': 'Amazon Technologies',
  '7C:BB:8A': 'Amazon Technologies',
  '84:62:3B': 'Amazon Technologies',
  '88:67:1B': 'Amazon Technologies',
  '8C:5C:A5': 'Amazon Technologies',
  '8C:8C:AA': 'Amazon Technologies',
  '90:AD:BE': 'Amazon Technologies',
  '94:DE:0E': 'Amazon Technologies',
  '98:5D:82': 'Amazon Technologies',
  '9C:6A:3D': 'Amazon Technologies',
  'A0:CC:2B': 'Amazon Technologies',
  'A8:93:4A': 'Amazon Technologies',
  'B0:4E:26': 'Amazon Technologies',
  'B0:E7:54': 'Amazon Technologies',
  'BC:83:4B': 'Amazon Technologies',
  'C0:4A:00': 'Amazon Technologies',
  'C4:56:00': 'Amazon Technologies',
  'C8:47:8C': 'Amazon Technologies',
  'CC:8F:E6': 'Amazon Technologies',
  'D0:4B:34': 'Amazon Technologies',
  'D4:F0:6A': 'Amazon Technologies',
  'D8:4D:8C': 'Amazon Technologies',
  'DC:6A:DE': 'Amazon Technologies',
  'E0:3E:DA': 'Amazon Technologies',
  'E4:8D:EA': 'Amazon Technologies',
  'EC:0E:C4': 'Amazon Technologies',
  'F0:27:2D': 'Amazon Technologies',
  'F0:4D:A2': 'Amazon Technologies',
  '00:90:A2': 'Microsoft Corporation',
  '00:0D:3A': 'Microsoft Corporation',
  '1C:69:7A': 'Microsoft Corporation',
  '28:18:78': 'Microsoft Corporation',
  '38:F3:AB': 'Microsoft Corporation',
  '4C:EA:A3': 'Microsoft Corporation',
  '50:9A:4C': 'Microsoft Corporation',
  '54:8C:A0': 'Microsoft Corporation',
  '60:6B:BD': 'Microsoft Corporation',
  '64:5A:04': 'Microsoft Corporation',
  '6C:2E:85': 'Microsoft Corporation',
  '70:5A:0F': 'Microsoft Corporation',
  '78:2B:CB': 'Microsoft Corporation',
  '80:FA:5B': 'Microsoft Corporation',
  '8C:77:12': 'Microsoft Corporation',
  '90:48:9A': 'Microsoft Corporation',
  '94:57:A5': 'Microsoft Corporation',
  '98:10:CB': 'Microsoft Corporation',
  '9C:E6:35': 'Microsoft Corporation',
  'A0:1B:68': 'Microsoft Corporation',
  'A8:8E:24': 'Microsoft Corporation',
  'B4:4B:D6': 'Microsoft Corporation',
  'C0:27:B9': 'Microsoft Corporation',
  'CC:78:7F': 'Microsoft Corporation',
  'D4:63:0D': 'Microsoft Corporation',
  'F0:03:8C': 'Microsoft Corporation',
  'F4:30:B9': 'Microsoft Corporation',
  'FC:AA:14': 'Microsoft Corporation',
  '44:6D:6C': 'TP-Link Technologies',
  '48:22:54': 'TP-Link Technologies',
  '50:C7:67': 'TP-Link Technologies',
  '54:A6:50': 'TP-Link Technologies',
  '60:A4:D0': 'TP-Link Technologies',
  '64:1E:81': 'TP-Link Technologies',
  '6C:5D:63': 'TP-Link Technologies',
  '70:4C:A5': 'TP-Link Technologies',
  '74:44:86': 'TP-Link Technologies',
  '78:4B:87': 'TP-Link Technologies',
  '7C:03:4C': 'TP-Link Technologies',
  '80:EA:CA': 'TP-Link Technologies',
  '84:16:F9': 'TP-Link Technologies',
  '88:B1:E1': 'TP-Link Technologies',
  '8C:6D:50': 'TP-Link Technologies',
  '90:F6:52': 'TP-Link Technologies',
  '94:D9:B3': 'TP-Link Technologies',
  '98:83:89': 'TP-Link Technologies',
  '9C:C7:D1': 'TP-Link Technologies',
  'A4:2B:B0': 'TP-Link Technologies',
  'A8:15:4D': 'TP-Link Technologies',
  'AC:84:C6': 'TP-Link Technologies',
  'B0:BE:76': 'TP-Link Technologies',
  'B4:75:0E': 'TP-Link Technologies',
  'B8:D4:9C': 'TP-Link Technologies',
  'BC:EA:FA': 'TP-Link Technologies',
  'C4:E9:84': 'TP-Link Technologies',
  'C8:3A:35': 'TP-Link Technologies',
  'CC:32:E5': 'TP-Link Technologies',
  'D0:6A:1B': 'TP-Link Technologies',
  'D4:6E:0E': 'TP-Link Technologies',
  'D8:0D:17': 'TP-Link Technologies',
  'D8:C4:E9': 'TP-Link Technologies',
  'DC:7F:A4': 'TP-Link Technologies',
  'E0:5A:1B': 'TP-Link Technologies',
  'E4:5B:D6': 'TP-Link Technologies',
  'EC:17:2F': 'TP-Link Technologies',
  'F0:B4:29': 'TP-Link Technologies',
  'F4:EC:38': 'TP-Link Technologies',
  'F8:64:76': 'TP-Link Technologies',
  'FC:75:E6': 'TP-Link Technologies',
  '10:FE:ED': 'ASUSTek Computer',
  '14:CC:20': 'ASUSTek Computer',
  '18:F6:43': 'ASUSTek Computer',
  '1C:87:2C': 'ASUSTek Computer',
  '20:4C:9E': 'ASUSTek Computer',
  '24:4B:FE': 'ASUSTek Computer',
  '28:2C:B2': 'ASUSTek Computer',
  '2C:56:DC': 'ASUSTek Computer',
  '30:5A:3C': 'ASUSTek Computer',
  '34:97:25': 'ASUSTek Computer',
  '38:59:F9': 'ASUSTek Computer',
  '40:16:9E': 'ASUSTek Computer',
  '44:D2:44': 'ASUSTek Computer',
  '48:6C:6F': 'ASUSTek Computer',
  '50:A4:37': 'ASUSTek Computer',
  '54:66:33': 'ASUSTek Computer',
  '58:9E:4A': 'ASUSTek Computer',
  '60:B2:6C': 'ASUSTek Computer',
  '64:1E:F8': 'ASUSTek Computer',
  '68:77:5A': 'ASUSTek Computer',
  '6C:EF:C8': 'ASUSTek Computer',
  '70:2C:1F': 'ASUSTek Computer',
  '74:65:4C': 'ASUSTek Computer',
  '78:32:1B': 'ASUSTek Computer',
  '7C:10:77': 'ASUSTek Computer',
  '80:7D:14': 'ASUSTek Computer',
  '84:25:3F': 'ASUSTek Computer',
  '88:E9:A4': 'ASUSTek Computer',
  '8C:3C:4A': 'ASUSTek Computer',
  '90:FB:5B': 'ASUSTek Computer',
  '94:53:D2': 'ASUSTek Computer',
  '98:FE:94': 'ASUSTek Computer',
  '9C:5C:8E': 'ASUSTek Computer',
  'A4:DB:30': 'ASUSTek Computer',
  'A8:AE:E2': 'ASUSTek Computer',
  'AC:22:0B': 'ASUSTek Computer',
  'B0:6C:BF': 'ASUSTek Computer',
  'B4:B0:24': 'ASUSTek Computer',
  'B8:1E:A4': 'ASUSTek Computer',
  'B8:9B:C9': 'ASUSTek Computer',
  'C0:35:1B': 'ASUSTek Computer',
  'C8:5A:96': 'ASUSTek Computer',
  'CC:5D:57': 'ASUSTek Computer',
  'D4:5D:77': 'ASUSTek Computer',
  'D8:50:E6': 'ASUSTek Computer',
  'DC:42:0D': 'ASUSTek Computer',
  'E0:3C:E6': 'ASUSTek Computer',
  'E4:6B:5A': 'ASUSTek Computer',
  'E8:16:D5': 'ASUSTek Computer',
  'F0:7E:4D': 'ASUSTek Computer',
  'F4:7B:30': 'ASUSTek Computer',
  'F8:7C:0F': 'ASUSTek Computer',
  'FC:3F:AB': 'ASUSTek Computer',
  '4C:EB:42': 'Sony Corporation',
  '00:19:E9': 'Sony Corporation',
  '00:1B:EE': 'Sony Corporation',
  'A4:D1:D2': 'NVIDIA Corporation',
  '00:15:5D': 'Hewlett Packard Enterprise',
  '00:17:A4': 'Hewlett Packard Enterprise',
  '48:DF:1C': 'Ubiquiti Networks',
  '68:72:51': 'Ubiquiti Networks',
  '74:83:C2': 'Ubiquiti Networks',
  '80:2A:A8': 'Ubiquiti Networks',
  'D0:98:9B': 'Ubiquiti Networks',
  'E0:63:DA': 'Ubiquiti Networks',
  '00:1A:85': 'Netgear Inc.',
  '20:E5:2A': 'Netgear Inc.',
  '28:CF:E9': 'Netgear Inc.',
  '2C:39:96': 'Netgear Inc.',
  '30:46:9A': 'Netgear Inc.',
  '40:4A:03': 'Netgear Inc.',
  '60:38:E0': 'Netgear Inc.',
  '6C:B0:CE': 'Netgear Inc.',
  '70:EE:50': 'Netgear Inc.',
  '78:D2:94': 'Netgear Inc.',
  '80:3F:5D': 'Netgear Inc.',
  '84:1B:5E': 'Netgear Inc.',
  '88:DC:96': 'Netgear Inc.',
  '8C:3B:AD': 'Netgear Inc.',
  '94:56:6B': 'Netgear Inc.',
  '98:90:96': 'Netgear Inc.',
  '9C:3D:CF': 'Netgear Inc.',
  'A0:5E:6B': 'Netgear Inc.',
  'A8:BD:1A': 'Netgear Inc.',
  'AC:9E:17': 'Netgear Inc.',
  'B0:C5:54': 'Netgear Inc.',
  'C0:51:7E': 'Netgear Inc.',
  'C4:3C:B0': 'Netgear Inc.',
  'C8:18:8B': 'Netgear Inc.',
  'CC:1B:E0': 'Netgear Inc.',
  'D8:D1:CB': 'Netgear Inc.',
  'DC:EF:09': 'Netgear Inc.',
  'E0:46:9A': 'Netgear Inc.',
  'E4:F3:13': 'Netgear Inc.',
  'E8:FC:AF': 'Netgear Inc.',
  'EC:43:E6': 'Netgear Inc.',
  'F0:7D:68': 'Netgear Inc.',
  'F4:6D:04': 'Netgear Inc.',
  'F8:1A:67': 'Netgear Inc.',
  '48:2C:A0': 'Broadcom Limited',
  '00:1F:33': 'Xerox Corporation',
  '00:21:5C': 'Seiko Epson Corporation',
  '0C:9D:92': 'Espressif Inc.',
  '24:62:AB': 'Espressif Inc.',
  '30:83:98': 'Espressif Inc.',
  '3C:71:BF': 'Espressif Inc.',
  '40:F5:20': 'Espressif Inc.',
  '48:27:EA': 'Espressif Inc.',
  '5C:CF:7F': 'Espressif Inc.',
  '68:C6:3A': 'Espressif Inc.',
  '80:7D:3B': 'Espressif Inc.',
  '84:0D:8E': 'Espressif Inc.',
  '84:F3:EB': 'Espressif Inc.',
  '8C:CD:E8': 'Espressif Inc.',
  'A0:9E:1A': 'Espressif Inc.',
  'A4:7B:2C': 'Espressif Inc.',
  'AC:67:B2': 'Espressif Inc.',
  'B4:E6:2D': 'Espressif Inc.',
  'BC:DD:C2': 'Espressif Inc.',
  'C8:F0:9E': 'Espressif Inc.',
  'CC:50:E3': 'Espressif Inc.',
  'D4:6A:91': 'Espressif Inc.',
  'D8:96:85': 'Espressif Inc.',
  'EC:64:C9': 'Espressif Inc.',
  'F0:08:D1': 'Espressif Inc.',
  'F4:CF:A2': 'Espressif Inc.',
  'F8:D0:27': 'Espressif Inc.',
  'FC:F5:C4': 'Espressif Inc.',
};

const NUMERONYM_REFERENCES = [
  { word: 'accessibility', numeronym: 'a11y' },
  { word: 'internationalization', numeronym: 'i18n' },
  { word: 'localization', numeronym: 'l10n' },
  { word: 'globalization', numeronym: 'g11n' },
  { word: 'personalization', numeronym: 'p13n' },
  { word: 'international', numeronym: 'i18n' },
  { word: 'multilingualization', numeronym: 'm17n' },
  { word: 'privacy', numeronym: 'p8y' },
];

export function ULIDGenerator() {
  const [count, setCount] = useState(1);
  const [ulids, setUlids] = useState<{ ulid: string; timestamp: number }[]>([]);

  const generate = useCallback(() => {
    const results: { ulid: string; timestamp: number }[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generateULID());
    }
    setUlids(results);
  }, [count]);

  const presets = [
    { label: '1 ULID', apply: () => { setCount(1); generate(); } },
    { label: '5 ULIDs', apply: () => { setCount(5); generate(); } },
    { label: '10 ULIDs', apply: () => { setCount(10); generate(); } },
    { label: '20 ULIDs', apply: () => { setCount(20); generate(); } },
    { label: 'Clear', apply: () => { setUlids([]); } },
  ];

  const resultText = ulids.length > 0 ? `Generated ${ulids.length} ULIDs` : 'Configure and generate';

  return (
    <CalculatorShell
      title="ULID Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ count, ulids }, null, 2)}
      downloadFilename="ulids.json"
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Count: {count}</label>
          <input type="range" min={1} max={20} value={count} onChange={e => setCount(parseInt(e.target.value))}
            className="w-full accent-emerald-500" />
        </div>

        <button onClick={generate} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg w-full sm:w-auto">Generate New</button>

        {ulids.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {ulids.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{item.ulid}</code>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{new Date(item.timestamp).toISOString()}</div>
                  </div>
                  <button onClick={() => { clipboardWrite(item.ulid); toast.success('ULID copied!'); }} className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors shrink-0">Copy</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {!ulids.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Configure count and generate ULIDs</p>
        )}
      </div>
    </CalculatorShell>
  );
}

export function NumeronymGenerator() {
  const [input, setInput] = useState('');
  const [preserveCase, setPreserveCase] = useState(false);

  const words = input.trim() ? input.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const numeronym = input.trim()
    ? (preserveCase
      ? words.map(w => toNumeronym(w)).join(' ')
      : toWordNumeronym(input))
    : '';

  const acronym = input.trim() ? toAcronym(input) : '';

  const presets = [
    { label: 'internationalization', apply: () => { setInput('internationalization'); } },
    { label: 'localization', apply: () => { setInput('localization'); } },
    { label: 'accessibility', apply: () => { setInput('accessibility'); } },
    { label: 'personalization', apply: () => { setInput('personalization'); } },
    { label: 'Clear', apply: () => { setInput(''); setPreserveCase(false); } },
  ];

  const resultText = input.trim() ? `Numeronym: ${numeronym} | Acronym: ${acronym} | Words: ${wordCount}` : 'Enter text to generate';

  return (
    <CalculatorShell
      title="Numeronym Generator"
      result={resultText}
      onCalculate={() => {}}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ input, numeronym, acronym, wordCount, preserveCase }, null, 2)}
      downloadFilename="numeronym.json"
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Input Text</label>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="e.g., internationalization"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors" />

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={preserveCase} onChange={e => setPreserveCase(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            Preserve case per word
          </label>
          <span className="text-[10px] text-[var(--text-muted)] ml-auto">Words: {wordCount}</span>
        </div>

        {input.trim() && (
          <div className="space-y-3">
            <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Numeronym</span>
                <button onClick={() => { clipboardWrite(numeronym); toast.success('Numeronym copied!'); }} className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
              </div>
              <code className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">{numeronym}</code>
            </div>

            <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Acronym</span>
                <button onClick={() => { clipboardWrite(acronym); toast.success('Acronym copied!'); }} className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
              </div>
              <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 break-all">{acronym}</code>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Reference</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NUMERONYM_REFERENCES.map(({ word, numeronym }) => (
              <div key={numeronym} className="bg-[var(--bg-overlay)]/30 rounded-lg px-3 py-2 text-center">
                <code className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{numeronym}</code>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{word}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

export function MACVendorLookup() {
  const [macInput, setMacInput] = useState('');

  const normalized = macInput.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  const oui = normalized.length >= 6
    ? normalized.slice(0, 2) + ':' + normalized.slice(2, 4) + ':' + normalized.slice(4, 6)
    : '';
  const vendor = oui ? (MAC_VENDORS[oui] || 'Unknown vendor') : '';
  const formattedMAC = normalized.length >= 12
    ? normalized.match(/.{1,2}/g)?.join(':') || ''
    : normalized.length >= 6 ? normalized.match(/.{1,2}/g)?.join(':') || '' : macInput;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">MAC Vendor Lookup</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Look up the vendor associated with a MAC address OUI.</p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">MAC Vendor Lookup</h3>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">MAC Address</label>
          <input type="text" value={macInput} onChange={e => setMacInput(e.target.value)}
            placeholder="00:1A:11:22:33:44 or 001A11223344"
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-emerald-400 transition-colors" />
        </div>

        {oui && (
          <div className="space-y-3">
            <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Vendor</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{vendor === 'Unknown vendor' ? (
                <span className="text-[var(--text-muted)]">Unknown vendor</span>
              ) : vendor}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-overlay)]/30 rounded-xl p-3">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">OUI</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">{oui}</code>
                  <button onClick={() => { clipboardWrite(oui); toast.success('OUI copied!'); }}
                    className="text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
                </div>
              </div>
              <div className="bg-[var(--bg-overlay)]/30 rounded-xl p-3">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Formatted MAC</span>
                <code className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">{formattedMAC || '—'}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
