const fs = require('fs');

const FIXES = {
  "css-to-stylus-converter": { 0: "Paste your CSS code into the editor panel. The tool parses selectors, properties, and values to transform them into Stylus's indentation-driven syntax with optional semicolons and braces." },
  "mp4-to-mov": { 0: "Select an .mp4 video file from your device. The tool reads the MP4 container and its video/audio streams for remuxing into the QuickTime-compatible MOV container." },
  "odt-rtf-to-pdf": { 0: "Select an ODT (OpenDocument) or RTF (Rich Text) document from your device. The tool preserves text formatting, images, tables, and embedded fonts during the PDF conversion." },
  "gif-to-webp-webm": { 0: "Select an animated or static .gif file from your device. The tool decodes each frame's image data and timing information for re-encoding into WebP or WebM format." },
  "json-to-ini-converter": { 0: "Paste a valid JSON object or array into the editor. The tool maps JSON key-value pairs and nested structures to INI's section-based format with proper escaping." },
  "mov-to-mp4": { 0: "Select a .mov video file recorded on Apple devices or professional cameras. The tool remuxes the MOV container's video and audio streams into the widely compatible MP4 format." },
  "mov-to-mkv": { 0: "Select a .mov file from your device. The tool identifies the video codec (H.264, ProRes, etc.) and audio tracks for packaging into the flexible MKV container." },
  "mkv-to-mov": { 0: "Select an .mkv video file containing any codec combination. The tool remuxes the video, audio, and subtitle streams into Apple-compatible MOV format." },
  "mp4-to-mkv": { 0: "Select an .mp4 file from your device. The tool reads the MP4's video and audio codecs and repackages them into the more flexible MKV container with subtitle support." },
  "xml-to-csv": { 0: "Paste XML data into the editor or upload an .xml file containing structured records. The tool maps XML elements and attributes to flat CSV columns based on your configuration." },
  "cbz-to-pdf": { 0: "Select a .cbz comic book archive file. The tool extracts the compressed images (usually PNG, JPEG, or WebP), preserves their page order, and compiles them into a single PDF document." },
  "archive-converter": { 0: "Select a compressed archive file — ZIP, RAR, 7z, TAR, or GZ. The tool decompresses the source and recompresses into your chosen target format with configurable compression level." },
  "temperature-converter": { 0: "Input the temperature value you want to convert. The tool supports Celsius, Fahrenheit, Kelvin, Rankine, Réaumur, and Delisle scales with instant results as you type." },
  "ini-json-converter": { 0: "Paste INI configuration file content with section headers and key-value pairs. The tool parses the structure and converts it to a well-formatted JSON object." },
  "exponent-calculator": { 0: "Input the base number you want to raise to a power. The calculator supports both positive and negative bases with integer or fractional exponents." },
  "date-difference-calculator": { 0: "Select the starting date using the date picker or type it in YYYY-MM-DD format. The calculator computes the duration between this and the end date." },
  "date-addition-calculator": { 0: "Select the starting date you want to add or subtract days from. Use the date picker for quick selection or type a date directly into the input field." },
  "daylight-saving-time-checker": { 0: "Choose the year to check for DST dates. The tool displays the exact start and end dates of daylight saving time for your selected timezone region." },
  "rounding-calculator": { 0: "Input the numeric value you need to round. The calculator handles integers, decimals, and negative numbers with multiple rounding methods to choose from." },
  "time-since-calculator": { 0: "Select a past date and optional time using the date picker. The calculator computes the elapsed duration from that moment to now in years, months, days, hours, and minutes." },
  "logarithm-calculator": { 0: "Input the number you want to find the logarithm of, then set the base. Supports common log (base 10), natural log (base e), and any custom base value." },
  "gas-mileage-calculator": { 0: "Input the total distance traveled since your last fill-up, then enter the amount of fuel consumed. The calculator computes miles per gallon or liters per 100 kilometers." },
  "study-time-calculator": { 0: "Set your exam or deadline date using the date picker. The calculator divides your available time into recommended study sessions based on subject difficulty." },
  "factorial-calculator": { 0: "Input a non-negative integer n to compute n!. The calculator handles values up to 170! using arbitrary precision to avoid overflow errors." },
  "modulo-calculator": { 0: "Input the dividend (the number being divided) and the divisor (the number to divide by). The calculator returns the remainder after division using standard modular arithmetic." },
  "eta-calculator": { 0: "Input the departure or start time, then enter the total travel distance and average speed. The calculator estimates arrival time accounting for the distance and speed." },
  "meeting-time-planner": { 0: "Select your timezone from the drop-down list, then add participants with their timezones. The tool finds overlapping business hours across all selected regions." },
  "decimal-to-fraction-calculator": { 0: "Input the decimal number to convert (e.g., 0.75, 3.14, or a repeating decimal like 0.333...). The calculator finds the exact fractional equivalent in simplest form." },
  "prime-number-checker": { 0: "Input any positive integer up to 10 million. The primality test uses trial division up to the square root with optimizations for divisibility by 2 and 3." },
  "midpoint-calculator": { 0: "Input the coordinates of two points in 2D space (x₁, y₁) and (x₂, y₂). The calculator finds the midpoint using the average of each coordinate pair." },
  "prime-factorization-calculator": { 0: "Input a positive integer to factorize into its prime factors. The calculator divides by successive prime numbers starting from 2, producing a tree of prime factors." },
  "trigonometry-calculator": { 0: "Input the angle value in degrees or radians. The calculator computes all six trigonometric functions — sine, cosine, tangent, cotangent, secant, and cosecant." },
  "degree-radian-converter": { 0: "Input the angle value in degrees or radians. The converter uses the standard formula — multiply degrees by π/180 or radians by 180/π for instant bidirectional conversion." },
  "math-equation-solver": { 0: "Type or paste a mathematical equation involving variables (e.g., 2x + 5 = 15). The solver handles linear, quadratic, and simple polynomial equations step by step." },
  "semver-calculator": { 0: "Input a semantic version string following the MAJOR.MINOR.PATCH format (e.g., 1.2.3). The tool parses each component and displays the version breakdown." },
  "time-addition-calculator": { 0: "Input the base time you want to add to, then specify hours, minutes, and seconds to add. The calculator handles rollover across 24-hour boundaries correctly." },
  "fraction-to-decimal-calculator": { 0: "Input the fraction numerator and denominator. The calculator performs the division with configurable decimal precision and shows the simplified decimal equivalent." },
  "geometry-calculator": { 0: "Choose a geometric shape from the list — circle, triangle, rectangle, square, trapezoid, or polygon. The calculator displays the relevant dimensions to measure." },
  "final-grade-calculator": { 0: "Input your current grade percentage and the weight of the final exam. The calculator determines the score needed on the final to reach your target grade." },
  "aspect-ratio-calculator": { 0: "Input the original width and height dimensions in pixels, inches, or centimeters. The calculator displays the ratio in simplified form and suggests standard display resolutions." },
  "hourly-to-salary-calculator": { 0: "Input your hourly wage rate, then enter the average hours worked per week and weeks per year. The calculator projects your annual, monthly, and biweekly pre-tax salary." },
  "tip-calculator": { 0: "Input the total bill amount before tip, then select your desired tip percentage or enter a custom percentage. The calculator splits the bill and tip per person." },
  "acv-calculator": { 0: "Input the total contract value and the contract duration in months or years. The ACV calculator divides the total value by the term length to find the annual recurring portion." },
  "runway-calculator": { 0: "Input your current cash balance, monthly revenue, and monthly expenses. The calculator estimates how many months your startup can operate before running out of funds." },
  "tax-calculator": { 0: "Input your annual gross income amount for the selected tax year. The calculator applies current tax brackets, deductions, and credits to estimate your total tax liability." },
  "sales-tax-calculator": { 0: "Input the product or service price before tax, then select the applicable sales tax rate by state or enter a custom percentage. The calculator shows the tax amount and total." },
  "cagr-calculator": { 0: "Input the beginning value of your investment, the ending value, and the number of years held. The CAGR formula calculates the smoothed annual growth rate." },
  "compound-interest-calculator": { 0: "Input the initial principal amount, annual interest rate, compounding frequency, and time period. The calculator shows how your investment grows with compound interest over time." },
  "savings-calculator": { 0: "Input your starting savings balance, monthly contribution amount, annual interest rate, and savings goal. The calculator projects your savings growth toward your target." },
  "markup-calculator": { 0: "Input the cost price of the product and your desired markup percentage. The calculator shows the selling price, profit margin, and markup amount in both percentage and dollar terms." },
  "arr-calculator": { 0: "Input your monthly recurring revenue from subscriptions or contracts. The calculator multiplies MRR by 12 to compute the annual recurring revenue." },
  "saas-payback-period": { 0: "Input your customer acquisition cost and the monthly revenue per customer. The calculator divides CAC by monthly revenue to find months needed to recover the acquisition cost." },
  "steps-calculator": { 0: "Enter your step count from a fitness tracker, phone pedometer, or manual log. The calculator converts steps to distance based on your stride length and estimates calories burned." },
  "sleep-requirement-calculator": { 0: "Enter your age in years. Sleep needs change across life stages — infants require more hours while older adults need slightly less. The calculator follows NIH guidelines." },
  "water-intake-calculator": { 0: "Enter your body weight in kilograms or pounds. Water recommendations are weight-based and adjusted for your activity level and climate conditions." },
  "audio-cutter": { 0: "Select an audio file in MP3, WAV, FLAC, M4A, OGG, or AAC format. The tool displays the waveform and allows you to set precise start and end points for trimming." },
};

const chunks = [0, 1, 2, 3, 4, 5];
let modified = 0;
let errors = [];

for (const ci of chunks) {
  const file = `src/registry/tools-chunk-${ci}.ts`;
  let src = fs.readFileSync(file, 'utf8');

  for (const [slug, fixes] of Object.entries(FIXES)) {
    const slugIdx = src.indexOf(`slug: "${slug}"`);
    if (slugIdx === -1) { continue; }

    // Find tool block boundaries
    const beforeSlug = src.substring(0, slugIdx);
    const toolStart = beforeSlug.lastIndexOf('{');
    if (toolStart === -1) { continue; }
    let depth = 0, toolEnd = toolStart;
    for (let i = toolStart; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { toolEnd = i + 1; break; } }
    }

    const beforeTool = src.substring(0, toolStart);
    const afterTool = src.substring(toolEnd);
    let toolBlock = src.substring(toolStart, toolEnd);

    // Find desc matches only within the instructions array to avoid FAQ conflicts
    const instrMatch = toolBlock.match(/instructions:\s*\[([\s\S]*?)\]\s*,\s*faqs:/);
    if (!instrMatch) { errors.push(`${slug}: no instructions block`); continue; }

    const instrBlock = instrMatch[0]; // The full instructions: [...] block
    const instrContent = instrMatch[1]; // Just the array content

    // Find descs only within this instructions block
    const descRe = /desc: "([^"]*)"/g;
    let allDescsInInstr = [];
    let m;
    while ((m = descRe.exec(instrBlock)) !== null) {
      allDescsInInstr.push({ start: m.index, end: m.index + m[0].length, text: m[0], value: m[1] });
    }

    for (const [stepIdxStr, newDesc] of Object.entries(fixes)) {
      const stepIdx = parseInt(stepIdxStr);
      if (stepIdx >= allDescsInInstr.length) { errors.push(`${slug}: step ${stepIdx} out of range`); continue; }

      const target = allDescsInInstr[stepIdx];
      const globalStart = beforeTool.length + toolBlock.indexOf(target.text, toolBlock.indexOf('instructions:'));
      // Actually, we know the position within the instruction block
      // Replace within toolBlock at the exact position
      const posInBlock = toolBlock.indexOf(target.text);
      if (posInBlock >= 0) {
        toolBlock = toolBlock.substring(0, posInBlock) + `desc: "${newDesc}"` + toolBlock.substring(posInBlock + target.text.length);
        modified++;
      }
    }

    src = beforeTool + toolBlock + afterTool;
  }

  fs.writeFileSync(file, src);
}

console.log(`Modified ${modified} descs across tools`);
if (errors.length) console.log('Errors:', errors.join(', '));
