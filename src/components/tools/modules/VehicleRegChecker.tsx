"use client";

import React, { useState, useMemo } from 'react';
import { Car, CheckCircle, AlertTriangle, Copy, RefreshCw, Zap, MapPin, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const ACCENT = '#dc2626';

const STATE_MAP: Record<string, string> = {
  AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam',
  BR: 'Bihar', CG: 'Chhattisgarh', CH: 'Chandigarh',
  DD: 'Daman & Diu', DL: 'Delhi', DN: 'Dadra & Nagar Haveli',
  GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana',
  HP: 'Himachal Pradesh', JH: 'Jharkhand', JK: 'Jammu & Kashmir',
  KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh',
  LD: 'Lakshadweep', MH: 'Maharashtra', ML: 'Meghalaya',
  MN: 'Manipur', MP: 'Madhya Pradesh', MZ: 'Mizoram',
  NL: 'Nagaland', OD: 'Odisha', PB: 'Punjab',
  PY: 'Puducherry', RJ: 'Rajasthan', SK: 'Sikkim',
  TN: 'Tamil Nadu', TR: 'Tripura', TS: 'Telangana',
  UK: 'Uttarakhand', UP: 'Uttar Pradesh', WB: 'West Bengal',
};

const BH_ZONES: Record<string, string> = {
  '01': 'Delhi Zone', '02': 'Mumbai Zone', '03': 'Kolkata Zone',
  '04': 'Chennai Zone', '05': 'Bengaluru Zone', '06': 'Hyderabad Zone',
  '07': 'Ahmedabad Zone', '08': 'Pune Zone', '09': 'Chandigarh Zone',
  '10': 'Guwahati Zone',
};

const STATE_COLORS: Record<string, string> = {
  AP: '#f97316', AR: '#06b6d4', AS: '#10b981', BR: '#eab308',
  CG: '#84cc16', CH: '#f59e0b', DD: '#ec4899', DL: '#6366f1',
  DN: '#a855f7', GA: '#14b8a6', GJ: '#3b82f6', HR: '#22c55e',
  HP: '#8b5cf6', JH: '#f97316', JK: '#06b6d4', KA: '#ef4444',
  KL: '#10b981', LA: '#a855f7', LD: '#eab308', MH: '#3b82f6',
  ML: '#84cc16', MN: '#ec4899', MP: '#f59e0b', MZ: '#14b8a6',
  NL: '#6366f1', OD: '#f97316', PB: '#8b5cf6', PY: '#eab308',
  RJ: '#ef4444', SK: '#06b6d4', TN: '#3b82f6', TR: '#10b981',
  TS: '#a855f7', UK: '#22c55e', UP: '#f59e0b', WB: '#3730a3',
};

const RTO_CITIES: Record<string, string> = {
  'KA-01': 'Bangalore (Central)', 'KA-02': 'Bangalore (North)', 'KA-03': 'Bangalore (East)',
  'KA-04': 'Bangalore (West)', 'KA-05': 'Bangalore (South)', 'KA-06': 'Bangalore (Additional)',
  'KA-07': 'Bangalore (IT Corridor)', 'KA-09': 'Mysore', 'KA-10': 'Mysore (Addl)',
  'KA-11': 'Hubli-Dharwad', 'KA-12': 'Belgaum', 'KA-13': 'Mangalore',
  'KA-14': 'Shimoga', 'KA-15': 'Gulbarga', 'KA-16': 'Bellary',
  'KA-17': 'Bijapur', 'KA-18': 'Raichur', 'KA-19': 'Udupi',
  'KA-20': 'Hassan', 'KA-21': 'Mandya', 'KA-22': 'Chikmagalur',
  'KA-23': 'Tumkur', 'KA-24': 'Kolar', 'KA-25': 'Davangere',
  'KA-26': 'Bidar', 'KA-27': 'Chitradurga', 'KA-28': 'Bagalkot',
  'KA-29': 'Dharwad', 'KA-30': 'Gadag', 'KA-31': 'Haveri',
  'KA-32': 'Kodagu', 'KA-33': 'Chamarajanagar', 'KA-35': 'Bangalore (Transport)',
  'KA-36': 'Ramanagara', 'KA-37': 'Chikkaballapur',

  'MH-01': 'Mumbai (South)', 'MH-02': 'Mumbai (West)', 'MH-03': 'Mumbai (East)',
  'MH-04': 'Thane', 'MH-05': 'Thane (Rural)', 'MH-06': 'Pune',
  'MH-07': 'Pune (Rural)', 'MH-08': 'Nashik', 'MH-09': 'Nashik (Rural)',
  'MH-10': 'Nagpur', 'MH-11': 'Nagpur (Rural)', 'MH-12': 'Ahmednagar',
  'MH-13': 'Solapur', 'MH-14': 'Solapur (Rural)', 'MH-15': 'Kolhapur',
  'MH-16': 'Aurangabad', 'MH-17': 'Aurangabad (Rural)', 'MH-18': 'Jalgaon',
  'MH-19': 'Dhule', 'MH-20': 'Amravati', 'MH-22': 'Nanded',
  'MH-23': 'Latur', 'MH-24': 'Sangli', 'MH-25': 'Ratnagiri',
  'MH-27': 'Satara', 'MH-31': 'Wardha', 'MH-34': 'Washim',
  'MH-41': 'Palghar',

  'DL-1': 'Delhi (South)', 'DL-2': 'Delhi (West)', 'DL-3': 'Delhi (East)',
  'DL-4': 'Delhi (North)', 'DL-5': 'Delhi (Central)', 'DL-6': 'New Delhi',
  'DL-7': 'Delhi (Transporter)', 'DL-8': 'Delhi (Corporate)', 'DL-9': 'Delhi (Safdarjung)',
  'DL-10': 'Delhi (Rohini)', 'DL-11': 'Delhi (Dwarka)', 'DL-12': 'Delhi (Vasant Vihar)',

  'TN-01': 'Chennai (Central)', 'TN-02': 'Chennai (North)', 'TN-03': 'Chennai (South)',
  'TN-04': 'Chennai (East)', 'TN-05': 'Chennai (West)', 'TN-07': 'Coimbatore (South)',
  'TN-09': 'Coimbatore (North)', 'TN-10': 'Salem', 'TN-11': 'Tirupur',
  'TN-12': 'Tiruchirappalli', 'TN-20': 'Madurai', 'TN-22': 'Madurai (South)',
  'TN-23': 'Tirunelveli', 'TN-27': 'Vellore', 'TN-28': 'Hosur',
  'TN-30': 'Erode', 'TN-31': 'Erode (Rural)', 'TN-32': 'Thanjavur',
  'TN-38': 'Nagercoil', 'TN-43': 'Kanchipuram', 'TN-46': 'Chengalpattu',
  'TN-49': 'Kanyakumari', 'TN-55': 'Theni', 'TN-60': 'Dindigul',
  'TN-72': 'Neyveli', 'TN-75': 'Avadi', 'TN-77': 'Thiruvalur',

  'KL-01': 'Thiruvananthapuram', 'KL-02': 'Kollam', 'KL-03': 'Pathanamthitta',
  'KL-04': 'Alappuzha', 'KL-05': 'Kottayam', 'KL-06': 'Idukki',
  'KL-07': 'Ernakulam', 'KL-08': 'Thrissur', 'KL-09': 'Palakkad',
  'KL-10': 'Malappuram', 'KL-11': 'Kozhikode', 'KL-12': 'Wayanad',
  'KL-13': 'Kannur', 'KL-14': 'Kasaragod',

  'GJ-01': 'Ahmedabad (West)', 'GJ-02': 'Ahmedabad (East)', 'GJ-03': 'Vadodara',
  'GJ-04': 'Surat', 'GJ-05': 'Rajkot', 'GJ-06': 'Bhavnagar',
  'GJ-07': 'Jamnagar', 'GJ-08': 'Junagadh', 'GJ-09': 'Gandhinagar',
  'GJ-10': 'Nadiad', 'GJ-11': 'Mehsana', 'GJ-12': 'Bharuch',
  'GJ-13': 'Anand', 'GJ-15': 'Bhuj', 'GJ-16': 'Navsari',
  'GJ-17': 'Valsad', 'GJ-21': 'Morbi', 'GJ-23': 'Porbandar',

  'UP-01': 'Agra', 'UP-02': 'Aligarh', 'UP-03': 'Prayagraj',
  'UP-04': 'Varanasi', 'UP-05': 'Lucknow', 'UP-06': 'Kanpur',
  'UP-07': 'Ghaziabad', 'UP-08': 'Bareilly', 'UP-09': 'Moradabad',
  'UP-10': 'Gorakhpur', 'UP-11': 'Ayodhya', 'UP-12': 'Jhansi',
  'UP-13': 'Mathura', 'UP-14': 'Saharanpur', 'UP-15': 'Meerut',
  'UP-19': 'Noida', 'UP-21': 'Muzaffarnagar', 'UP-32': 'Kheri',
  'UP-65': 'Noida (Addl)', 'UP-66': 'Bulandshahr', 'UP-70': 'Jaunpur',

  'TS-01': 'Hyderabad (Central)', 'TS-02': 'Hyderabad (West)', 'TS-03': 'Hyderabad (East)',
  'TS-04': 'Hyderabad (North)', 'TS-05': 'Hyderabad (South)', 'TS-07': 'Secunderabad',
  'TS-08': 'Ranga Reddy', 'TS-09': 'Medchal', 'TS-10': 'Warangal',
  'TS-11': 'Nizamabad', 'TS-12': 'Karimnagar', 'TS-13': 'Khammam',
  'TS-14': 'Nalgonda', 'TS-15': 'Adilabad', 'TS-16': 'Mahabubnagar',

  'AP-01': 'Srikakulam', 'AP-02': 'Vizianagaram', 'AP-03': 'Visakhapatnam',
  'AP-04': 'Visakhapatnam (Rural)', 'AP-05': 'Kakinada', 'AP-06': 'Eluru',
  'AP-07': 'Machilipatnam', 'AP-08': 'Guntur', 'AP-09': 'Ongole',
  'AP-10': 'Nellore', 'AP-11': 'Chittoor', 'AP-12': 'Kurnool',
  'AP-13': 'Anantapur', 'AP-14': 'Kadapa', 'AP-26': 'Tirupati',
  'AP-27': 'Nandyal',

  'HR-01': 'Ambala', 'HR-02': 'Karnal', 'HR-03': 'Kurukshetra',
  'HR-04': 'Panipat', 'HR-05': 'Kaithal', 'HR-06': 'Yamunanagar',
  'HR-07': 'Hisar', 'HR-08': 'Bhiwani', 'HR-11': 'Jind',
  'HR-12': 'Rewari', 'HR-13': 'Gurugram', 'HR-14': 'Mahendragarh',
  'HR-15': 'Faridabad', 'HR-17': 'Sonipat', 'HR-18': 'Rohtak',
  'HR-20': 'Panchkula', 'HR-22': 'Charkhi Dadri',

  'PB-01': 'Amritsar', 'PB-02': 'Bathinda', 'PB-03': 'Faridkot',
  'PB-05': 'Firozpur', 'PB-06': 'Gurdaspur', 'PB-07': 'Hoshiarpur',
  'PB-08': 'Jalandhar', 'PB-09': 'Kapurthala', 'PB-10': 'Ludhiana',
  'PB-11': 'Mansa', 'PB-12': 'Moga', 'PB-15': 'Patiala',
  'PB-16': 'Rupnagar', 'PB-17': 'Sangrur', 'PB-18': 'Mohali',
  'PB-22': 'Fazilka',

  'RJ-01': 'Jaipur', 'RJ-02': 'Ajmer', 'RJ-03': 'Bikaner',
  'RJ-04': 'Jodhpur', 'RJ-05': 'Udaipur', 'RJ-06': 'Kota',
  'RJ-07': 'Alwar', 'RJ-08': 'Bharatpur', 'RJ-09': 'Sikar',
  'RJ-10': 'Sriganganagar', 'RJ-14': 'Jhunjhunu', 'RJ-15': 'Pali',
  'RJ-19': 'Baran', 'RJ-27': 'Jaisalmer', 'RJ-28': 'Chittorgarh',

  'MP-01': 'Bhopal', 'MP-02': 'Indore', 'MP-03': 'Gwalior',
  'MP-04': 'Jabalpur', 'MP-05': 'Ujjain', 'MP-06': 'Sagar',
  'MP-07': 'Dewas', 'MP-08': 'Mandsaur', 'MP-09': 'Ratlam',
  'MP-10': 'Rewa', 'MP-11': 'Satna', 'MP-13': 'Hoshangabad',
  'MP-15': 'Chhindwara', 'MP-20': 'Sehore', 'MP-21': 'Khandwa',
  'MP-25': 'Dhar', 'MP-27': 'Shajapur', 'MP-37': 'Chhatarpur',
  'MP-40': 'Singrauli', 'MP-50': 'Alirajpur',

  'BR-01': 'Patna', 'BR-02': 'Gaya', 'BR-03': 'Bhagalpur',
  'BR-04': 'Muzaffarpur', 'BR-05': 'Darbhanga', 'BR-06': 'Chhapra',
  'BR-07': 'Munger', 'BR-08': 'Purnia', 'BR-09': 'Saharsa',
  'BR-10': 'Sitamarhi', 'BR-11': 'Motihari', 'BR-12': 'Bettiah',
  'BR-13': 'Siwan', 'BR-14': 'Samastipur', 'BR-15': 'Madhubani',
  'BR-16': 'Begusarai', 'BR-17': 'Katihar', 'BR-18': 'Bihar Sharif',
  'BR-19': 'Aurangabad', 'BR-20': 'Buxar', 'BR-21': 'Sasaram',
  'BR-26': 'Lakhisarai', 'BR-36': 'West Champaran', 'BR-37': 'East Champaran',

  'WB-01': 'Kolkata', 'WB-02': 'Howrah', 'WB-03': 'Howrah (Rural)',
  'WB-04': 'Hooghly', 'WB-05': 'Midnapore', 'WB-06': 'Burdwan',
  'WB-07': 'Burdwan (Rural)', 'WB-08': 'Nadia', 'WB-09': 'Murshidabad',
  'WB-10': 'Malda', 'WB-11': 'Jalpaiguri', 'WB-12': 'Darjeeling',
  'WB-13': 'Cooch Behar', 'WB-14': 'Birbhum', 'WB-15': 'Purulia',
  'WB-18': 'Siliguri', 'WB-19': 'Asansol', 'WB-20': 'Kolkata (South)',

  'OD-01': 'Bhubaneswar', 'OD-02': 'Cuttack', 'OD-03': 'Balasore',
  'OD-04': 'Berhampur', 'OD-05': 'Sambalpur', 'OD-06': 'Puri',
  'OD-07': 'Rourkela', 'OD-08': 'Jharsuguda', 'OD-11': 'Jajpur',
  'OD-13': 'Mayurbhanj', 'OD-14': 'Keonjhar', 'OD-15': 'Dhenkanal',
  'OD-16': 'Angul', 'OD-18': 'Khordha',

  'CG-01': 'Raipur', 'CG-02': 'Bilaspur', 'CG-03': 'Durg',
  'CG-04': 'Bhilai', 'CG-05': 'Rajnandgaon', 'CG-06': 'Raigarh',
  'CG-07': 'Korba', 'CG-08': 'Ambikapur', 'CG-09': 'Jagdalpur',

  'JH-01': 'Ranchi', 'JH-02': 'Jamshedpur', 'JH-03': 'Dhanbad',
  'JH-04': 'Hazaribagh', 'JH-05': 'Bokaro', 'JH-06': 'Deoghar',
  'JH-07': 'Giridih', 'JH-08': 'Dumka', 'JH-09': 'Daltonganj',
  'JH-10': 'Garhwa',

  'UK-01': 'Dehradun', 'UK-02': 'Haridwar', 'UK-03': 'Udham Singh Nagar',
  'UK-04': 'Nainital', 'UK-05': 'Pauri Garhwal', 'UK-06': 'Tehri Garhwal',
  'UK-07': 'Almora', 'UK-08': 'Pithoragarh', 'UK-09': 'Chamoli',
  'UK-10': 'Rudraprayag', 'UK-11': 'Haldwani', 'UK-12': 'Rishikesh',
  'UK-13': 'Kashipur',

  'HP-01': 'Shimla', 'HP-02': 'Mandi', 'HP-03': 'Kangra',
  'HP-04': 'Solan', 'HP-05': 'Hamirpur', 'HP-06': 'Una',
  'HP-07': 'Bilaspur', 'HP-08': 'Kullu', 'HP-09': 'Kinnaur',
  'HP-10': 'Lahaul & Spiti', 'HP-11': 'Sirmaur', 'HP-12': 'Chamba',

  'JK-01': 'Srinagar', 'JK-02': 'Jammu', 'JK-03': 'Baramulla',
  'JK-04': 'Anantnag', 'JK-05': 'Budgam', 'JK-06': 'Pulwama',
  'JK-07': 'Kupwara', 'JK-08': 'Badgam', 'JK-11': 'Kathua',
  'JK-12': 'Udhampur', 'JK-13': 'Rajouri', 'JK-14': 'Poonch',
  'JK-15': 'Doda',

  'AS-01': 'Guwahati', 'AS-02': 'Dibrugarh', 'AS-03': 'Silchar',
  'AS-04': 'Jorhat', 'AS-05': 'Tezpur', 'AS-06': 'Nagaon',
  'AS-07': 'Tinsukia', 'AS-08': 'Bongaigaon', 'AS-09': 'Barpeta',
  'AS-10': 'Goalpara', 'AS-11': 'Lakhimpur', 'AS-12': 'Sivasagar',
  'AS-13': 'Dhemaji', 'AS-14': 'Hailakandi', 'AS-15': 'Karimganj',

  'GA-01': 'Panaji', 'GA-02': 'Margao', 'GA-03': 'Mapusa',
  'GA-04': 'Vasco', 'GA-05': 'Ponda', 'GA-06': 'Bicholim',
  'GA-07': 'Canacona',

  'CH-01': 'Chandigarh', 'CH-02': 'Chandigarh (Addl)', 'CH-03': 'Chandigarh (Industrial)',

  'PY-01': 'Puducherry', 'PY-02': 'Karaikal', 'PY-03': 'Mahe',
  'PY-04': 'Yanam',

  'TR-01': 'Agartala', 'TR-02': 'Kailashahar', 'TR-03': 'Udaipur',
  'TR-04': 'Dharmanagar',

  'ML-01': 'Shillong', 'ML-02': 'Tura', 'ML-03': 'Nongpoh',
  'ML-04': 'Jowai', 'ML-05': 'Baghmara',

  'MN-01': 'Imphal', 'MN-02': 'Bishnupur', 'MN-03': 'Thoubal',
  'MN-04': 'Churachandpur',

  'MZ-01': 'Aizawl', 'MZ-02': 'Lunglei', 'MZ-03': 'Champhai',
  'MZ-04': 'Serchhip',

  'NL-01': 'Kohima', 'NL-02': 'Dimapur', 'NL-03': 'Mokokchung',
  'NL-04': 'Tuensang',

  'SK-01': 'Gangtok', 'SK-02': 'Namchi', 'SK-03': 'Mangan',
  'SK-04': 'Pakyong',

  'AR-01': 'Itanagar', 'AR-02': 'Naharlagun', 'AR-03': 'Pasighat',
  'AR-04': 'Tawang', 'AR-05': 'Ziro',

  'LA-01': 'Leh', 'LA-02': 'Kargil',
  'LD-01': 'Kavaratti', 'LD-02': 'Minicoy',
  'DD-01': 'Daman', 'DD-02': 'Diu',
  'DN-01': 'Silvassa',
};

const RTO_RANGES: Record<string, { min: number; max: number }> = {
  AP: { min: 1, max: 99 }, AR: { min: 1, max: 15 }, AS: { min: 1, max: 35 },
  BR: { min: 1, max: 99 }, CG: { min: 1, max: 99 }, CH: { min: 1, max: 5 },
  DD: { min: 1, max: 5 }, DL: { min: 1, max: 99 }, DN: { min: 1, max: 5 },
  GA: { min: 1, max: 10 }, GJ: { min: 1, max: 99 }, HR: { min: 1, max: 99 },
  HP: { min: 1, max: 99 }, JH: { min: 1, max: 99 }, JK: { min: 1, max: 30 },
  KA: { min: 1, max: 99 }, KL: { min: 1, max: 99 }, LA: { min: 1, max: 5 },
  LD: { min: 1, max: 5 }, MH: { min: 1, max: 99 }, ML: { min: 1, max: 15 },
  MN: { min: 1, max: 10 }, MP: { min: 1, max: 99 }, MZ: { min: 1, max: 10 },
  NL: { min: 1, max: 10 }, OD: { min: 1, max: 99 }, PB: { min: 1, max: 99 },
  PY: { min: 1, max: 10 }, RJ: { min: 1, max: 99 }, SK: { min: 1, max: 5 },
  TN: { min: 1, max: 99 }, TR: { min: 1, max: 10 }, TS: { min: 1, max: 99 },
  UK: { min: 1, max: 99 }, UP: { min: 1, max: 99 }, WB: { min: 1, max: 99 },
};

const EXAMPLE_PLATES = ['KA01AB1234', 'MH02CD5678', 'DL4EF9012', 'TN20GH3456', 'GJ01IJ7890', 'UP15KL1111'];

function lookupCity(state: string, rtoRaw: string): string | null {
  const key = `${state}-${rtoRaw}`;
  if (RTO_CITIES[key]) return RTO_CITIES[key];
  const alt = `${state}-${String(parseInt(rtoRaw))}`;
  if (alt !== key && RTO_CITIES[alt]) return RTO_CITIES[alt];
  return null;
}

function parsePlate(raw: string) {
  const clean = raw.replace(/[\s-]/g, '').toUpperCase();

  if (clean.length < 8) return { isValid: false, error: 'Minimum 8 characters required' };
  if (clean.length > 12) return { isValid: false, error: 'Maximum 12 characters allowed' };

  const stateCode = clean.slice(0, 2);
  const isBH = stateCode === 'BH';

  if (!isBH && !STATE_MAP[stateCode]) {
    return { isValid: false, error: `"${stateCode}" is not a valid Indian state/UT code` };
  }

  const regex = /^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{4})$/;
  const match = clean.match(regex);
  if (!match) {
    return {
      isValid: false,
      error: 'Invalid format. Expected: 2 letters + 1-2 digits + 1-2 letters + 4 digits (e.g., KA01AB1234)',
    };
  }

  const [, state, rtoStr, series, serial] = match;
  const rtoNum = parseInt(rtoStr, 10);

  if (isBH) {
    const zoneName = BH_ZONES[rtoStr.padStart(2, '0')] || `Zone ${rtoStr}`;
    return {
      isValid: true,
      data: {
        stateCode: 'BH', stateName: 'Bharat (National Registration)',
        rtoCode: rtoStr, cityName: zoneName, series, serial,
        vehicleHint: 'Bharat Series — National Permit',
      },
      formatted: `BH ${rtoStr} ${series} ${serial}`,
    };
  }

  const stateName = STATE_MAP[stateCode];
  const range = RTO_RANGES[stateCode];
  if (range && (rtoNum < range.min || rtoNum > range.max)) {
    return {
      isValid: false,
      error: `RTO code ${rtoStr} is outside expected range for ${stateName} (${range.min}–${range.max})`,
    };
  }

  const cityName = lookupCity(stateCode, rtoStr);

  let vehicleHint: string | null = null;
  if (/^EV/i.test(series)) vehicleHint = 'Electric Vehicle';
  else if (series === 'BH' || series.startsWith('BH')) vehicleHint = 'Bharat Series (National)';

  return {
    isValid: true,
    data: { stateCode, stateName, rtoCode: rtoStr, cityName, series, serial, vehicleHint },
    formatted: `${stateCode} ${rtoStr} ${series} ${serial}`,
  };
}

export default function VehicleRegChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    isValid: boolean; error?: string;
    data?: { stateCode: string; stateName: string; rtoCode: string; cityName: string | null; series: string; serial: string; vehicleHint: string | null; };
    formatted?: string;
  } | null>(null);

  const liveValidation = useMemo(() => {
    const v = input.replace(/[\s-]/g, '');
    if (v.length < 4) return null;
    return parsePlate(v);
  }, [input]);

  const handleVerify = () => {
    const v = input.replace(/[\s-]/g, '');
    if (!v) { toast.error('Please enter a vehicle registration number'); return; }
    const parsed = parsePlate(v);
    if (parsed.isValid) {
      setResult(parsed);
      toast.success('Registration number format verified!');
    } else {
      setResult(parsed);
      toast.error('Invalid registration number format');
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12);
    setInput(formatted);
    setResult(null);
  };

  const copyPlate = () => {
    if (result?.formatted) {
      clipboardWrite(result.formatted);
      toast.success('Registration number copied');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#dc2626]/10 border border-[#dc2626]/20 p-4 rounded-xl flex items-center gap-3">
        <Car className="w-5 h-5 text-[#dc2626] shrink-0" />
        <p className="text-sm text-[#dc2626] font-medium">
          Parse and validate Indian vehicle registration numbers. Identify state, RTO office, series, and serial details instantly.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">
            Vehicle Registration Number
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={12}
              placeholder="e.g., KA01AB1234"
              value={input}
              onChange={handleInput}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              className="w-full bg-[var(--bg-overlay)] border-2 rounded-xl px-4 py-3.5 text-lg font-mono tracking-widest text-[var(--text-primary)] outline-none transition-all"
              style={{
                borderColor: liveValidation && !liveValidation.isValid && input.length >= 4
                  ? '#dc262666' : liveValidation?.isValid ? '#22c55e66' : 'var(--border-subtle)',
                boxShadow: liveValidation?.isValid ? '0 0 0 3px #22c55e22' : liveValidation && !liveValidation.isValid && input.length >= 4 ? '0 0 0 3px #dc262622' : 'none',
              }}
            />
            {input.length >= 4 && liveValidation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {liveValidation.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-mono">
            <span className="font-medium text-[var(--text-secondary)]">Format:</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-overlay)] rounded border border-[var(--border-subtle)]">XX</span>
            <span className="text-[var(--text-muted)]">+</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-overlay)] rounded border border-[var(--border-subtle)]">NN</span>
            <span className="text-[var(--text-muted)]">+</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-overlay)] rounded border border-[var(--border-subtle)]">XX</span>
            <span className="text-[var(--text-muted)]">+</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-overlay)] rounded border border-[var(--border-subtle)]">NNNN</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mr-0.5">Try:</span>
            {EXAMPLE_PLATES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setInput(ex); setResult(null); }}
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {ex.slice(0, 2)} {ex.slice(2, 4)} {ex.slice(4, 6)} {ex.slice(6)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            className="flex-1 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)`,
              boxShadow: `0 4px 20px ${ACCENT}44`,
            }}
          >
            <Zap className="w-4 h-4" />
            Verify Registration
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {result && (
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {result.isValid && result.data ? (
              <div
                className="rounded-2xl border-2 overflow-hidden"
                style={{ borderColor: ACCENT + '30' }}
              >
                <div
                  className="p-3 flex items-center gap-2.5"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}
                >
                  <Car className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm uppercase tracking-wider">
                    Registration Certificate
                  </span>
                  <button
                    onClick={copyPlate}
                    className="ml-auto p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <div className="bg-[var(--bg-elevated)] p-5 space-y-5">
                  <div
                    className="bg-gray-900 dark:bg-black rounded-xl py-3.5 px-4 text-center border-2"
                    style={{ borderColor: ACCENT + '40' }}
                  >
                    <span className="text-white font-mono font-black tracking-[0.25em] text-2xl select-all">
                      {result.formatted}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> State
                      </span>
                      <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 block">
                        {result.data.stateName}
                      </span>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1"
                        style={{
                          backgroundColor: (STATE_COLORS[result.data.stateCode] || '#6b7280') + '20',
                          color: STATE_COLORS[result.data.stateCode] || '#6b7280',
                          border: `1px solid ${(STATE_COLORS[result.data.stateCode] || '#6b7280') + '30'}`,
                        }}
                      >
                        {result.data.stateCode}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> RTO Office
                      </span>
                      {result.data.cityName ? (
                        <>
                          <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 block">
                            {result.data.cityName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            Code: {result.data.stateCode}-{result.data.rtoCode}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-sm text-amber-600 dark:text-amber-400 block">
                            RTO Code #{result.data.rtoCode}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Not in city database
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Series</span>
                      <span className="font-bold text-xl font-mono tracking-wider text-zinc-800 dark:text-zinc-200 block">
                        {result.data.series}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Alphabetic code
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Serial Number</span>
                      <span className="font-bold text-xl font-mono tracking-wider text-zinc-800 dark:text-zinc-200 block">
                        {result.data.serial}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Unique identifier
                      </span>
                    </div>
                  </div>

                  {result.data.vehicleHint && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        style={{
                          backgroundColor: result.data.vehicleHint.includes('Electric') ? '#22c55e20' : '#f59e0b20',
                          color: result.data.vehicleHint.includes('Electric') ? '#22c55e' : '#f59e0b',
                          border: `1px solid ${result.data.vehicleHint.includes('Electric') ? '#22c55e30' : '#f59e0b30'}`,
                        }}
                      >
                        {result.data.vehicleHint.includes('Electric') ? '⚡' : result.data.vehicleHint.includes('Bharat') ? '🇮🇳' : '🚗'}
                        {result.data.vehicleHint}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ backgroundColor: ACCENT + '0d', border: `1px solid ${ACCENT}20` }}
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: ACCENT }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="animated-check-path" />
                      </svg>
                      <style>{`
                        .animated-check-path {
                          stroke-dasharray: 20;
                          stroke-dashoffset: 20;
                          animation: drawCheck 0.6s ease-out 0.2s forwards;
                        }
                        @keyframes drawCheck {
                          to { stroke-dashoffset: 0; }
                        }
                      `}</style>
                    </div>
                    <div>
                      <span className="text-sm font-bold" style={{ color: ACCENT }}>Format Verified</span>
                      <span className="text-[10px] text-[var(--text-muted)] block">
                        Registration number structure is valid as per Indian standards
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] space-y-1.5">
                    <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                      <Info className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                      About this tool
                    </div>
                    <p>
                      This is a client-side format validation tool. It checks the structure
                      of Indian vehicle registration numbers against known patterns. Actual
                      vehicle ownership details can only be verified through the official
                      Ministry of Road Transport & Highways (Parivahan) portal.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl flex items-start gap-3 border-2"
                style={{ borderColor: '#ef444444', backgroundColor: '#ef44440d' }}
              >
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                <div>
                  <h4 className="font-bold text-red-500">Invalid Registration Number</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!result && liveValidation && !liveValidation.isValid && input.length >= 6 && (
          <div className="p-3 rounded-xl flex items-start gap-2 border"
            style={{ borderColor: '#f59e0b30', backgroundColor: '#f59e0b0d' }}
          >
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {liveValidation.error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
