type UnitDef = { key: string; label: string; toBase?: (v: number) => number; fromBase?: (v: number) => number };

type FamilyConfig = {
  title: string;
  desc: string;
  units: UnitDef[];
  baseUnit: string;
  /** For families where all units are linear (multiply to base), provide per-unit multipliers */
  multipliers?: Record<string, number>;
  /** For families needing custom convert (e.g. temperature) */
  customConvert?: (v: number, from: string, to: string) => number;
  /** Show all units in a list (like length/weight) rather than from/to selector */
  showAll?: boolean;
  /** Clickable example values that pre-fill the input */
  examples?: { label: string; value: string }[];
  /** Conversion factors shown below results (must match tool's underlying math exactly) */
  conversionFactors?: string[];
  /** Real-world size references (use "~" for approximations) */
  references?: { label: string; value: string }[];
};

export const UNIT_FAMILIES: Record<string, FamilyConfig> = {
  "unit-converter": {
    title: "Unit Converter", desc: "Convert between length, weight, volume, area, speed, power, pressure, temperature, time, data size, and everyday units",
    baseUnit: "m", showAll: true,
    units: [
      { key: "mm", label: "Millimeters" }, { key: "cm", label: "Centimeters" },
      { key: "m", label: "Meters" }, { key: "km", label: "Kilometers" },
      { key: "in", label: "Inches" }, { key: "ft", label: "Feet" },
      { key: "yd", label: "Yards" }, { key: "mi", label: "Miles" },
    ],
    multipliers: { mm: 1000, cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
    conversionFactors: [
      "1 inch = 2.54 cm (exactly)",
      "1 foot = 0.3048 m (exactly)",
      "1 mile = 1.60934 km",
    ],
  },
  "length-converter": {
    title: "Length Converter", desc: "Convert between meters, kilometers, miles, feet, and more",
    baseUnit: "m", showAll: true,
    units: [
      { key: "mm", label: "Millimeters" }, { key: "cm", label: "Centimeters" },
      { key: "m", label: "Meters" }, { key: "km", label: "Kilometers" },
      { key: "in", label: "Inches" }, { key: "ft", label: "Feet" },
      { key: "yd", label: "Yards" }, { key: "mi", label: "Miles" },
    ],
    multipliers: { mm: 1000, cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
    examples: [
      { label: "Smartphone (~6 in)", value: "15.24" },
      { label: "Room height (~3 m)", value: "3" },
      { label: "Marathon (~42.2 km)", value: "42.195" },
    ],
    conversionFactors: [
      "1 inch = 2.54 cm (exactly)",
      "1 foot = 0.3048 m (exactly)",
      "1 yard = 0.9144 m (exactly)",
      "1 mile = 1.60934 km",
    ],
    references: [
      { label: "Pencil length", value: "~19 cm / ~7.5 in" },
      { label: "Door height", value: "~2 m / ~6.5 ft" },
      { label: "Football field (American)", value: "~100 yd / ~91.4 m" },
    ],
  },
  "weight-converter": {
    title: "Weight Converter", desc: "Convert between kilograms, pounds, ounces, and more",
    baseUnit: "kg", showAll: true,
    units: [
      { key: "mg", label: "Milligrams" }, { key: "g", label: "Grams" },
      { key: "kg", label: "Kilograms" }, { key: "t", label: "Metric Tons" },
      { key: "lb", label: "Pounds" }, { key: "oz", label: "Ounces" },
      { key: "st", label: "Stone" },
    ],
    multipliers: { mg: 1e6, g: 1000, kg: 1, t: 0.001, lb: 2.20462, oz: 35.274, st: 0.157473 },
    examples: [
      { label: "Apple (~150 g)", value: "150" },
      { label: "Person (~70 kg)", value: "70" },
      { label: "Car (~1.5 t)", value: "1500" },
    ],
    conversionFactors: [
      "1 pound = 0.453592 kg",
      "1 ounce = 28.3495 g",
      "1 stone = 6.35029 kg",
      "1 metric ton = 1000 kg",
    ],
    references: [
      { label: "Bag of sugar", value: "~1 kg / ~2.2 lb" },
      { label: "Average human", value: "~62 kg / ~137 lb" },
      { label: "Small car", value: "~1000–1500 kg" },
    ],
  },
  "volume-converter": {
    title: "Volume Converter", desc: "Convert between liters, gallons, cups, and more",
    baseUnit: "L", showAll: true,
    units: [
      { key: "ml", label: "Milliliters" }, { key: "l", label: "Liters" },
      { key: "gal", label: "Gallons (US)" }, { key: "qt", label: "Quarts" },
      { key: "pt", label: "Pints" }, { key: "cup", label: "Cups" },
      { key: "floz", label: "Fluid Ounces" },
    ],
    multipliers: { ml: 1000, l: 1, gal: 0.264172, qt: 1.05669, pt: 2.11338, cup: 4.22675, floz: 33.814 },
    examples: [
      { label: "Soda can (~355 mL)", value: "355" },
      { label: "Water bottle (~500 mL)", value: "500" },
      { label: "Bathtub (~300 L)", value: "300" },
    ],
    conversionFactors: [
      "1 gallon (US) = 3.78541 L",
      "1 cup = 236.588 mL",
      "1 fluid ounce = 29.5735 mL",
      "1 pint = 473.176 mL",
    ],
    references: [
      { label: "Soda can", value: "~355 mL / ~12 fl oz" },
      { label: "Coffee mug", value: "~300 mL / ~10 fl oz" },
      { label: "Olympic pool", value: "~2.5 million L / ~660k gal" },
    ],
  },
  "area-converter": {
    title: "Area Converter", desc: "Convert between square meters, acres, hectares, and more",
    baseUnit: "m²", showAll: true,
    units: [
      { key: "sqmm", label: "mm²" }, { key: "sqcm", label: "cm²" },
      { key: "sqm", label: "m²" }, { key: "sqkm", label: "km²" },
      { key: "sqft", label: "ft²" }, { key: "ac", label: "Acres" },
      { key: "ha", label: "Hectares" },
    ],
    multipliers: { sqmm: 1e6, sqcm: 10000, sqm: 1, sqkm: 0.000001, sqft: 10.7639, ac: 0.000247105, ha: 0.0001 },
    examples: [
      { label: "Studio apartment (~400 ft²)", value: "37.16" },
      { label: "House (~2000 ft²)", value: "185.8" },
      { label: "Land (~5 acres)", value: "20234" },
    ],
    conversionFactors: [
      "1 acre = 4046.86 m²",
      "1 hectare = 10,000 m²",
      "1 ft² = 0.092903 m²",
      "1 km² = 1,000,000 m²",
    ],
    references: [
      { label: "Parking space", value: "~12–15 m² / ~130–160 ft²" },
      { label: "Tennis court", value: "~261 m² / ~2809 ft²" },
      { label: "Soccer pitch (FIFA)", value: "~7140 m² / ~1.76 acres" },
    ],
  },
  "speed-converter": {
    title: "Speed Converter", desc: "Convert between km/h, mph, knots, and more",
    baseUnit: "km/h", showAll: false,
    units: [
      { key: "kmh", label: "km/h" }, { key: "mph", label: "mph" },
      { key: "ms", label: "m/s" }, { key: "knots", label: "Knots" },
      { key: "fps", label: "ft/s" },
    ],
    multipliers: { kmh: 1, mph: 0.621371, ms: 0.277778, knots: 0.539957, fps: 0.911344 },
  },
  "power-converter": {
    title: "Power Converter", desc: "Convert between kilowatts, horsepower, BTU/hr, and more",
    baseUnit: "kW", showAll: false,
    units: [
      { key: "kw", label: "kW" }, { key: "hp", label: "hp" },
      { key: "bhp", label: "bhp" }, { key: "watt", label: "W" },
      { key: "mw", label: "MW" }, { key: "btu", label: "BTU/hr" },
    ],
    multipliers: { kw: 1, hp: 1.34102, bhp: 1.34102, watt: 1000, mw: 0.001, btu: 3412.14 },
  },
  "pressure-converter": {
    title: "Pressure Converter", desc: "Convert between kPa, psi, bar, atm, and more",
    baseUnit: "kPa", showAll: false,
    units: [
      { key: "kpa", label: "kPa" }, { key: "psi", label: "psi" },
      { key: "bar", label: "bar" }, { key: "atm", label: "atm" },
      { key: "torr", label: "Torr" }, { key: "mbar", label: "mbar" },
    ],
    multipliers: { kpa: 1, psi: 0.145038, bar: 0.01, atm: 0.009869, torr: 7.50062, mbar: 10 },
  },
  "temperature-converter": {
    title: "Temperature Converter", desc: "Convert between Celsius, Fahrenheit, and Kelvin",
    baseUnit: "°C", showAll: false,
    units: [
      { key: "celsius", label: "Celsius" },
      { key: "fahrenheit", label: "Fahrenheit" },
      { key: "kelvin", label: "Kelvin" },
    ],
    customConvert: (v, from, to) => {
      let c: number;
      if (from === "celsius") c = v;
      else if (from === "fahrenheit") c = (v - 32) * 5 / 9;
      else c = v - 273.15;
      if (to === "celsius") return c;
      if (to === "fahrenheit") return c * 9 / 5 + 32;
      return c + 273.15;
    },
  },
  "time-converter": {
    title: "Time Converter", desc: "Convert between seconds, minutes, hours, days, weeks, months, and years",
    baseUnit: "seconds", showAll: false,
    units: [
      { key: "seconds", label: "Seconds" }, { key: "minutes", label: "Minutes" },
      { key: "hours", label: "Hours" }, { key: "days", label: "Days" },
      { key: "weeks", label: "Weeks" }, { key: "months", label: "Months" },
      { key: "years", label: "Years" },
    ],
    multipliers: { seconds: 1, minutes: 1 / 60, hours: 1 / 3600, days: 1 / 86400, weeks: 1 / 604800, months: 1 / 2629746, years: 1 / 31556952 },
    examples: [
      { label: "3 minutes", value: "3" },
      { label: "2 hours", value: "2" },
      { label: "1 day", value: "1" },
      { label: "Marathon (2h)", value: "7200" },
    ],
    conversionFactors: [
      "1 minute = 60 seconds",
      "1 hour = 3,600 seconds",
      "1 day = 86,400 seconds",
      "1 week = 604,800 seconds",
      "1 month ≈ 2,629,746 seconds (avg 30.44 days)",
      "1 year ≈ 31,556,952 seconds (avg 365.24 days)",
    ],
    references: [
      { label: "Movie runtime", value: "~2 hours / ~7,200 s" },
      { label: "Work week", value: "~40 hours / ~5 days" },
      { label: "Earth rotation", value: "~24 hours / ~86,400 s" },
      { label: "Light-year", value: "~365.25 days / ~31.56M s" },
    ],
  },
  "data-size-converter": {
    title: "Data Size Converter", desc: "Convert between bytes, kilobytes, megabytes, and more",
    baseUnit: "B", showAll: false,
    units: [
      { key: "b", label: "Bytes" }, { key: "kb", label: "Kilobytes" },
      { key: "mb", label: "Megabytes" }, { key: "gb", label: "Gigabytes" },
      { key: "tb", label: "Terabytes" }, { key: "pb", label: "Petabytes" },
    ],
    multipliers: { b: 1, kb: 1 / 1024, mb: 1 / (1024 * 1024), gb: 1 / (1024 * 1024 * 1024), tb: 1 / (1024 ** 4), pb: 1 / (1024 ** 5) },
    examples: [
      { label: "Song (~5 MB)", value: "5" },
      { label: "HD movie (~5 GB)", value: "5" },
      { label: "SSD (~512 GB)", value: "512" },
    ],
    conversionFactors: [
      "1 KB = 1024 Bytes",
      "1 MB = 1024 KB",
      "1 GB = 1024 MB",
      "1 TB = 1024 GB",
    ],
    references: [
      { label: "Text email", value: "~10 KB" },
      { label: "MP3 song (3 min)", value: "~3–5 MB" },
      { label: "USB flash drive", value: "~32–256 GB" },
    ],
  },
  "cooking-measurement-converter": {
    title: "Cooking Measurement Converter", desc: "Convert between teaspoons, tablespoons, cups, and milliliters",
    baseUnit: "mL", showAll: false,
    units: [
      { key: "tsp", label: "Teaspoons" }, { key: "tbsp", label: "Tablespoons" },
      { key: "cup", label: "Cups" }, { key: "floz", label: "Fluid Ounces" },
      { key: "ml", label: "Milliliters" }, { key: "l", label: "Liters" },
    ],
    customConvert: (v, from, to) => {
      const toML: Record<string, number> = { tsp: 4.92892, tbsp: 14.7868, cup: 236.588, floz: 29.5735, ml: 1, l: 1000 };
      const ml = v * toML[from]!;
      return ml / toML[to]!;
    },
  },
  "fuel-consumption-converter": {
    title: "Fuel Consumption Converter", desc: "Convert between L/100km, MPG, and km/L",
    baseUnit: "L/100km", showAll: false,
    units: [
      { key: "l100", label: "L/100km" }, { key: "mpgus", label: "MPG (US)" },
      { key: "mpguk", label: "MPG (UK)" }, { key: "kml", label: "km/L" },
    ],
    customConvert: (v, from, to) => {
      let l100: number;
      if (from === "l100") l100 = v;
      else if (from === "mpgus") l100 = 235.215 / v;
      else if (from === "mpguk") l100 = 282.481 / v;
      else l100 = 100 / v;
      if (to === "l100") return l100;
      if (to === "mpgus") return 235.215 / l100;
      if (to === "mpguk") return 282.481 / l100;
      return 100 / l100;
    },
  },
  "paper-size-converter": {
    title: "Paper Size Converter", desc: "Convert between A and B paper series sizes",
    baseUnit: "A0", showAll: false,
    units: [
      { key: "a0", label: "A0" }, { key: "a1", label: "A1" }, { key: "a2", label: "A2" },
      { key: "a3", label: "A3" }, { key: "a4", label: "A4" }, { key: "a5", label: "A5" },
      { key: "a6", label: "A6" }, { key: "b4", label: "B4" }, { key: "b5", label: "B5" },
    ],
    customConvert: (v, from, to) => {
      const area: Record<string, number> = {
        a0: 1, a1: 0.5, a2: 0.25, a3: 0.125, a4: 0.0625, a5: 0.03125, a6: 0.015625,
        b4: 0.088388, b5: 0.044194,
      };
      return (v / area[from]!) * area[to]!;
    },
  },
  "clothing-size-converter": {
    title: "Clothing Size Converter", desc: "Convert between US, UK, EU, and Japanese clothing sizes",
    baseUnit: "US", showAll: false,
    units: [
      { key: "us", label: "US" }, { key: "uk", label: "UK" },
      { key: "eu", label: "EU" }, { key: "jp", label: "Japan" },
    ],
    customConvert: (v, from, to) => {
      let us: number;
      if (from === "us") us = v;
      else if (from === "uk") us = v + 2;
      else if (from === "eu") us = v / 2.54 + 32;
      else us = v - 7;
      if (to === "us") return us;
      if (to === "uk") return us - 2;
      if (to === "eu") return (us - 32) * 2.54;
      return us + 7;
    },
  },
  "degree-radian-converter": {
    title: "Degree / Radian Converter", desc: "Convert between degrees and radians",
    baseUnit: "°", showAll: false,
    units: [
      { key: "deg", label: "Degrees" },
      { key: "rad", label: "Radians" },
    ],
    customConvert: (v, from, to) => {
      if (from === "deg") return v * Math.PI / 180;
      return v * 180 / Math.PI;
    },
  },
  "shoe-size-converter": {
    title: "Shoe Size Converter", desc: "Convert between US and UK men's shoe sizes",
    baseUnit: "US", showAll: false,
    units: [
      { key: "us", label: "US Men" }, { key: "uk", label: "UK" },
    ],
    customConvert: (v, from, to) => {
      const usToUk: Record<number, number> = { 5: 4.5, 6: 5.5, 7: 6.5, 8: 7.5, 9: 8.5, 10: 9.5, 11: 10.5, 12: 11.5 };
      const ukToUs: Record<number, number> = { 4.5: 5, 5.5: 6, 6.5: 7, 7.5: 8, 8.5: 9, 9.5: 10, 10.5: 11, 11.5: 12 };
      if (from === "us") return usToUk[Math.round(v)] ?? v - 0.5;
      return ukToUs[Math.round(v * 2) / 2] ?? v + 0.5;
    },
  },
};
