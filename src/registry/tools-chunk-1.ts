import type { ToolMetadata } from './tools-types';

export const entries_chunk_1: ToolMetadata[] = [
  {
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'Convert between hundreds of units — length, mass, volume, temperature, currency, and more with a single click.',
    seoDescription: 'Free online Unit Converter — Universal unit conversion tool. ',
    category: 'Utility',
    id:  "224",
    dependencies: 'None'
  },
  {
    name: 'Video Watermark Adder',
    slug: 'video-watermark-adder',
    description: 'Add a logo image or custom text watermark to your videos with position and opacity controls. 100% browser-based.',
    seoDescription: 'Free online Video Watermark Adder — Add logo or text watermark to video. ',
    category: 'Video',
    id:  "223",
    dependencies: 'None',
    instructions: [
    { title: "1. Upload Your Video", desc: "Choose the video file you want to watermark. Processing happens entirely in your browser." },
    { title: "2. Add Watermark", desc: "Upload a watermark image or enter text. Position it anywhere on the video frame using visual controls." },
    { title: "3. Download Watermarked Video", desc: "Download the video with the watermark applied throughout the entire duration." },
  ],
    faqs: [
    { question: "What watermark types can I add?", answer: "Image watermarks (PNG with transparency recommended) or text watermarks with customizable font and opacity." },
    { question: "Can I position the watermark?", answer: "Yes. Drag to any position or use preset positions. The watermark appears throughout the video." },
    { question: "Is the watermark permanent?", answer: "Yes. The watermark is baked into the video frames and cannot be removed from the output." },
  ],
},
  {
    name: 'GST Invoice Generator',
    slug: 'gst-invoice-generator',
    description: 'Generates compliant PDF invoices with mandatory Indian GST fields — HSN/SAC codes, GSTIN, place of supply, and tax breakdown. Everything runs locally in your browser.',
    seoDescription: 'Free online GST Invoice Generator — Create compliant GST invoices with HSN/SAC codes, GSTIN, place of supply, and tax breakdown. Download as PDF. 100% local and private.',
    category: 'indian-utilities',
    id:  "227",
    dependencies: 'None',
    instructions: [
    { title: "1. Enter Business and Customer Details", desc: "Fill in your business information (name, GSTIN, address) and your customer's details. The tool auto-formats these into the standard GST invoice layout." },
    { title: "2. Add Invoice Items with HSN/SAC", desc: "List each item or service with its HSN or SAC code, quantity, rate, and GST tax rate. The tool automatically calculates taxable value, CGST, SGST/UTGST, and total amount." },
    { title: "3. Download the GST-Compliant PDF", desc: "Preview the generated invoice and download it as a PDF. The invoice includes all mandatory fields required under GST law — invoice number, date, place of supply, and tax breakup." },
  ],
    faqs: [
    { question: "What GST fields are included in the invoice?", answer: "The invoice includes all mandatory fields under GST rules: supplier and recipient GSTIN, invoice number and date, HSN/SAC codes, taxable value, CGST, SGST/IGST amounts, place of supply, and invoice value in words." },
    { question: "Can I use this for regular GST filing?", answer: "Yes, the generated invoices are compliant with GST invoice rules and can be used for your regular GST returns (GSTR-1). However, validate with your CA for any business-specific requirements." },
    { question: "Is the data stored on any server?", answer: "No. All invoice data is processed locally in your browser. The PDF generation happens client-side using jsPDF. Your business and customer data never leaves your device." },
    { question: "What HSN/SAC codes are supported?", answer: "You can enter any HSN code for goods or SAC code for services. The tool doesn't restrict the codes — enter the appropriate code for your product or service as per the GST tariff." },
    { question: "Can I customize the invoice layout?", answer: "The invoice follows the standard GST invoice format. The generated PDF includes your business logo (if uploaded), all mandatory fields, and a clean professional layout optimized for printing and digital sharing." },
  ]
  },
  {
    name: 'ITR Filing Helper',
    slug: 'itr-filing-helper',
    description: 'Step-by-step assistant for India Income Tax Return filing. ITR form selection, 80C/80D deductions, salary and house property income.',
    seoDescription: 'Free online ITR Filing Helper — Guide to Indian income tax return filing. ITR form selection, 80C/80D deductions, salary and house property income. Simplify your tax filing.',
    category: 'indian-utilities',
    id:  "228",
    dependencies: 'None',
    instructions: [
    { title: "1. Select Your ITR Form", desc: "Choose the correct ITR form based on your income sources — ITR-1 (salaried), ITR-2 (capital gains), ITR-3 (business/profession), or ITR-4 (presumptive). The tool explains which form applies to you." },
    { title: "2. Enter Your Income Details", desc: "Fill in your salary income, house property income, capital gains, or business income. The tool walks you through each section with explanations and applicable deduction limits." },
    { title: "3. Review and File", desc: "Review your total income, deductions under 80C through 80U, and the computed tax liability. Get a checklist of documents needed for filing — Form 16, bank statements, investment proofs." },
  ],
    faqs: [
    { question: "Which ITR form should I use?", answer: "ITR-1 (Sahaj) is for salaried individuals with income up to Rs. 50 lakh from salary, one house property, and other sources. ITR-2 is for capital gains or multiple properties. ITR-3 for business/profession income. ITR-4 for presumptive business income." },
    { question: "What deductions can I claim?", answer: "Section 80C (up to Rs. 1.5 lakh) covers PPF, ELSS, life insurance, and tuition fees. Section 80D covers health insurance premiums. Section 24(b) covers home loan interest. NPS under 80CCD(1B) offers an additional Rs. 50,000 deduction." },
    { question: "What documents do I need for filing?", answer: "Form 16 from your employer, bank statements, investment proofs (PPF, ELSS, insurance), home loan certificate, rent receipts (for HRA), and Aadhaar. The tool provides a customized document checklist." },
    { question: "Can this tool file my return directly?", answer: "This tool helps you prepare and organize your tax information. For actual e-filing, you'll need to use the official Income Tax e-filing portal. The tool ensures you have all the data ready before you start." },
  ],
    showInCategory: false,
  },
  {
    name: 'Browser Extension',
    slug: 'browser-extension',
    description: 'All-in-one AI sidebar assistant that helps with writing, summarization, translation, and answering questions right in your browser.',
    seoDescription: 'Free online Browser Extension — All-in-one sidebar AI assistant. ',
    category: 'Extension',
    id:  "230",
    dependencies: 'None',
    showInCategory: false,
  },
  {
    name: 'MP3 Compressor',
    slug: 'mp3-compressor',
    description: 'Reduce MP3 file size by adjusting bitrate and audio quality settings. Perfect for saving storage or faster uploads.',
    seoDescription: 'Free online MP3 Compressor — Reduce MP3 size with bitrate control ',
    category: 'Audio',
    id:  "231",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'GIF to MP4 Converter',
    slug: 'gif-to-mp4',
    description: 'Convert GIF animations to MP4 videos for drastically smaller file sizes. Content creators use this to shrink animated GIFs by up to 90% for social media, Discord, and web pages — all in your browser, nothing uploaded.',
    seoDescription: 'Free online GIF to MP4 Converter — Convert GIF animations to MP4 videos for drastically smaller file sizes. Shrink animated GIFs by up to 90% for social media, Discord, and web pages. ',
    category: 'Converter',
    id:  "232",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'Video Trimmer',
    slug: 'video-trimmer',
    description: 'Trim and cut video clips locally in your browser. Select start and end times, preview, and download the result.',
    seoDescription: 'Free online Video Trimmer — Trim and cut video clips locally ',
    category: 'Video',
    id:  "233",
    dependencies: 'FFmpeg WASM',
    instructions: [
    { title: "1. Upload Video", desc: "Select the video file you want to trim. The tool loads it and shows the total duration." },
    { title: "2. Set Start and End Points", desc: "Use the timeline controls to select the segment to keep. Preview the selected portion before trimming." },
    { title: "3. Download Trimmed Video", desc: "Download the trimmed video containing only your selected segment." },
  ],
    faqs: [
    { question: "What formats are supported?", answer: "MP4, MOV, and WebM. Output keeps the same format and codec as input." },
    { question: "Can I trim with frame accuracy?", answer: "Yes. Use frame-by-frame navigation for precise start and end points." },
    { question: "Is audio also trimmed?", answer: "Yes. Audio is trimmed to match the selected video segment. Sync is preserved." },
  ],
},
  {
    name: 'Aadhaar Card Masker',
    slug: 'aadhaar-card-masker',
    description: 'Securely masks the first 8 digits of your 12-digit Aadhaar number on card images, leaving only the last 4 digits visible for safe sharing. Fully local processing.',
    seoDescription: 'Free online Aadhaar Card Masker — Mask first 8 digits of your Aadhaar number on card images. Leave only last 4 digits visible for secure sharing. 100% local, no uploads.',
    category: 'indian-utilities',
    id:  "234",
    dependencies: 'Canvas API',
    instructions: [
    { title: "1. Upload Your Aadhaar Card Image", desc: "Select a scanned image or photo of your Aadhaar card from your device. The tool accepts JPEG and PNG formats." },
    { title: "2. Auto-Mask the First 8 Digits", desc: "The tool automatically detects the Aadhaar number region on the card and applies a mask to the first 8 digits, leaving only the last 4 digits visible — exactly like banking OTP masking." },
    { title: "3. Download for Safe Sharing", desc: "Preview the masked Aadhaar image and download it. Share this masked version with service providers, landlords, or online platforms instead of your full Aadhaar number." },
  ],
    faqs: [
    { question: "Why should I mask my Aadhaar number?", answer: "UIDAI recommends sharing only the last 4 digits of your Aadhaar for verification purposes. Masking the first 8 digits protects you from identity theft and unauthorized use while still allowing verification." },
    { question: "What parts of the card are masked?", answer: "The tool masks the first 8 digits of the 12-digit Aadhaar number printed on the card. Your name, photo, and other details remain visible — only the number is partially masked." },
    { question: "Is this reversible?", answer: "No. The masking is applied directly to the image pixels and is irreversible. Once the image is saved with the mask, the original 8 digits cannot be recovered from the masked image." },
    { question: "Is my Aadhaar image transmitted anywhere?", answer: "No. All image processing is done locally in your browser using the Canvas API. Your Aadhaar image and number never leave your device, ensuring complete privacy and security." },
  ]
  },
  {
    name: 'PAN Card Verification',
    slug: 'pan-verification',
    description: 'Verifies PAN card number format and structure locally. Extracts the taxpayer category from the PAN code — Individual, Company, Trust, etc. No data is sent to any server.',
    seoDescription: 'Free online PAN Card Verification — Verify PAN number format and extract taxpayer category (Individual, Company, HUF, Trust, etc.). 100% local validation with no data uploads.',
    category: 'indian-utilities',
    id:  "235",
    dependencies: 'None',
    instructions: [
    { title: "1. Enter the PAN Number", desc: "Type or paste the 10-character PAN (Permanent Account Number) into the input field. The format is always 5 letters + 4 digits + 1 letter (e.g., ABCPS1234D)." },
    { title: "2. Verify Format and Category", desc: "Click verify to check the PAN structure — validates the character positions, checksum logic, and taxpayer category code. The tool identifies if it's an Individual, Company, HUF, Trust, or other entity type." },
    { title: "3. Review the Results", desc: "See a detailed breakdown of the PAN: the first 3 alphabetic characters (AAA series), the 4th character (entity type), the 5th character (last name initial), and the numeric sequence. All validation runs locally." },
  ],
    faqs: [
    { question: "What does the PAN structure tell me?", answer: "A PAN has 10 characters: the first 5 are letters, next 4 are numbers, last is a letter. The 4th character reveals the taxpayer category — P for Individual, C for Company, H for HUF, B for AOP/BOI, F for Partnership Firm, J for Artificial Judicial Person, T for Trust, G for Government." },
    { question: "Can this verify if a PAN is actually issued by the IT department?", answer: "This tool validates the PAN format and structure locally. For verifying whether a PAN is actually active and issued, use the official Income Tax e-filing portal's PAN verification feature." },
    { question: "Is my PAN number stored or transmitted?", answer: "No. All validation is done locally in your browser. The PAN you enter is never sent to any server and is not stored anywhere." },
    { question: "What does the 4th character (entity type code) mean?", answer: "The 4th character of PAN indicates the taxpayer category: A = AOP (Association of Persons), B = Body of Individuals, C = Company, F = Partnership Firm, G = Government, H = HUF, J = Artificial Judicial Person, L = Local Authority, P = Individual, T = Trust." },
  ]
  },
  {
    name: 'IFSC Code Lookup',
    slug: 'ifsc-code-lookup',
    description: 'Looks up bank details from an 11-character IFSC code — bank name, branch, address, city, district, and contact info. Uses the built-in IFSC database for instant results.',
    seoDescription: 'Free online IFSC Code Lookup — Find bank name, branch, address, city, district, and contact details from any 11-character IFSC code. Instant lookup with comprehensive bank database.',
    category: 'indian-utilities',
    id:  "236",
    dependencies: 'IFSC API',
    instructions: [
    { title: "1. Enter the IFSC Code", desc: "Type the 11-character IFSC code (e.g., SBIN0001234) into the search field. The code consists of 4 letters identifying the bank, followed by 7 characters (0 for the 5th, then 6-digit branch code)." },
    { title: "2. View Bank and Branch Details", desc: "The tool instantly displays the bank name, branch name, full address with city and district, state, and contact information from the built-in IFSC database." },
    { title: "3. Copy or Use the Details", desc: "Copy any field — IFSC code, MICR code, or branch address — for use in NEFT, RTGS, or IMPS transfers. The details are accurate and sourced from the official RBI database." },
  ],
    faqs: [
    { question: "What does IFSC stand for?", answer: "IFSC stands for Indian Financial System Code. It is an 11-character alphanumeric code that uniquely identifies a bank branch participating in NEFT, RTGS, and IMPS electronic fund transfer systems in India." },
    { question: "How is the IFSC code structured?", answer: "The first 4 characters are letters representing the bank (e.g., SBIN for State Bank of India, HDFC for HDFC Bank). The 5th character is always 0 (zero). The last 6 characters identify the specific branch and can be alphanumeric." },
    { question: "Is the database up to date?", answer: "The IFSC database is built into the tool and updated periodically with the latest RBI data. For the most critical verifications, you can cross-check with the official RBI website." },
    { question: "Can I use this offline?", answer: "The IFSC lookup data is stored in the page itself, so it works without an internet connection after the initial page load. The database covers all major banks operating in India." },
  ]
  },
  {
    name: 'Voter ID Form Helper',
    slug: 'voter-id-form-helper',
    description: 'Get document checklists and step-by-step guidance for Indian voter registration forms — Form 6 (new enrollment), Form 7 (correction/objection), and Form 8 (name transfer within constituency).',
    seoDescription: 'Free online Voter ID Form Helper — Guide for Indian voter registration Forms 6, 7, and 8. Document checklists, step-by-step instructions for new enrollment, corrections, and name transfers.',
    category: 'indian-utilities',
    id:  "237",
    dependencies: 'None',
    instructions: [
    { title: "1. Select Your Form Type", desc: "Choose the appropriate Election Commission form: Form 6 for new voter registration, Form 7 for objections or corrections, or Form 8 for name transfer within the same constituency." },
    { title: "2. Review the Document Checklist", desc: "Get a tailored list of documents needed for your specific form. This includes proof of age, address proof, passport-size photos, and any additional documents required by your state's election office." },
    { title: "3. Follow the Filing Guide", desc: "Read the step-by-step instructions for filling each section of the form. The guide explains how to submit online via the National Voters' Service Portal (NVSP) or offline at your local ERO office." },
  ],
    faqs: [
    { question: "Which form do I need?", answer: "Form 6 is for new voter registration (first-time voter or enrolling in a new constituency). Form 7 is for objections to entries in the electoral roll or corrections to existing entries. Form 8 is for name transfer when you move within the same constituency." },
    { question: "What documents are needed for Form 6 (new registration)?", answer: "You need proof of age (birth certificate, school leaving certificate, or passport), address proof (Aadhaar, ration card, utility bill, or bank statement), and one passport-size photograph. You must be at least 18 years old." },
    { question: "Can I apply online?", answer: "Yes. Forms can be submitted online through the National Voters' Service Portal (NVSP) website or via the Voter Helpline mobile app. You'll need to upload scanned copies of your supporting documents." },
    { question: "How long does voter registration take?", answer: "After submitting Form 6, the Electoral Registration Officer (ERO) typically processes applications within 30 days. You can track the status online using the reference number provided after submission." },
  ]
  },
  {
    name: 'India Pincode Finder',
    slug: 'india-pincode-finder',
    description: 'Search Indian pincodes and post office branches by pincode, location name, or area. Find delivery status, office type, and contact details for any post office in India.',
    seoDescription: 'Free online India Pincode Finder — Search 6-digit pincodes and post office branches across India. Find delivery status, office type, district, state, and contact details instantly.',
    category: 'indian-utilities',
    id:  "238",
    dependencies: 'Postal API',
    instructions: [
    { title: "1. Enter a Pincode or Location", desc: "Type a 6-digit pincode, a city name, or a post office name into the search box. The tool instantly searches its database of post offices across India." },
    { title: "2. Browse Search Results", desc: "View matching post offices with their full details — name, pincode, office type (Head Office, Sub Office, Branch Office), delivery status (Delivery/Non-Delivery), district, state, and contact number." },
    { title: "3. Copy or Use the Information", desc: "Copy the pincode or office details for shipping labels, form filling, or address verification. The data is sourced from India Post's official database." },
  ],
    faqs: [
    { question: "How are Indian pincodes structured?", answer: "Indian pincodes are 6-digit codes. The first digit indicates the postal zone (1-8 for different regions, 9 for Army), the second digit indicates the sub-zone/state, the third digit combined with the first two identifies the sorting district, and the last 3 digits identify the specific post office." },
    { question: "Can I search by area or landmark name?", answer: "Yes. The search accepts city names, area names, and post office names in addition to pincodes. Partial matches are supported for flexible searching." },
    { question: "Is the pincode database complete?", answer: "The database covers all operational post offices in India, categorized into Head Offices (HO), Sub Offices (SO), and Branch Offices (BO). It includes both delivery and non-delivery offices." },
    { question: "Can I use this for e-commerce shipping?", answer: "Yes. The pincode and office type information helps verify serviceability for courier and e-commerce deliveries. Check the delivery status field to confirm whether a location is serviced." },
  ]
  },
  {
    name: 'Hindi / Regional Font Generator',
    slug: 'hindi-regional-font-generator',
    description: 'Generate stylish Unicode fonts for Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, and other Indian regional scripts. Copy-paste styled text for social media, WhatsApp, and more.',
    seoDescription: 'Free online Hindi & Regional Font Generator — Generate stylish Unicode fonts for Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, and more. Copy-paste for social media, WhatsApp, and designs.',
    category: 'indian-utilities',
    id:  "239",
    dependencies: 'None',
    instructions: [
    { title: "1. Type or Paste Your Text", desc: "Enter the text you want to style in the input box. The tool supports Devanagari (Hindi, Marathi, Sanskrit), Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Gurmukhi, and Odia scripts." },
    { title: "2. Choose a Font Style", desc: "Browse through the available font styles for your selected script. Preview each style applied to your text in real time. Styles range from bold and italic to decorative and handwritten." },
    { title: "3. Copy and Use Anywhere", desc: "Click on your preferred styled text to copy it to your clipboard. Paste it directly into WhatsApp, Instagram, Facebook, Twitter, or any app that supports Unicode text." },
  ],
    faqs: [
    { question: "Which Indian regional scripts are supported?", answer: "The tool supports Devanagari (Hindi, Marathi, Sanskrit, Nepali, Konkani), Tamil, Telugu, Kannada, Malayalam, Bengali (Bangla), Gujarati, Gurmukhi (Punjabi), and Odia (Oriya) scripts." },
    { question: "Will the styled text work on all apps and devices?", answer: "The generated text uses Unicode characters, which are supported on modern smartphones (Android, iOS), desktops (Windows, Mac, Linux), and most apps including WhatsApp, Instagram, Facebook, Twitter, and Telegram." },
    { question: "Is this different from changing the font in an app?", answer: "Yes. Instead of changing the app's display font (which only you see), this generates actual Unicode characters that render with the chosen style for all viewers — even those without the specific font installed." },
    { question: "Can I use these fonts commercially?", answer: "Yes. The styled Unicode text can be used for social media posts, profile bios, digital designs, and personal projects. Output depends on Unicode rendering availability on each platform." },
  ]
  },
  {
    name: 'Indian Age Calculator',
    slug: 'indian-age-calculator',
    description: 'Calculate exact age in years, months, and days from a date of birth in DD/MM/YYYY format. Includes eligibility check for Indian government age requirements.',
    seoDescription: 'Free online Indian Age Calculator — Exact age in years, months, and days from DOB. Includes eligibility checks for Indian age requirements. Instant results, no data upload.',
    category: 'indian-utilities',
    id:  "240",
    dependencies: 'None',
    instructions: [
    { title: "1. Enter Your Date of Birth", desc: "Type or select your date of birth in DD/MM/YYYY format. Use the date picker or type the date directly." },
    { title: "2. Get Your Exact Age", desc: "The tool instantly displays your exact age in years, months, and days. The calculation uses the standard calendar system and accounts for leap years and month lengths." },
    { title: "3. Check Eligibility", desc: "View the eligibility check section that compares your age against common Indian requirements — minimum age for voter registration (18), driving license (18/20), marriage (18/21), and more." },
  ],
    faqs: [
    { question: "How is the exact age calculated?", answer: "The calculation subtracts the birth date from the current date, accounting for varying month lengths and leap years. The result shows completed years, remaining months, and remaining days for maximum accuracy." },
    { question: "What age eligibility checks are included?", answer: "The tool compares your age against Indian legal thresholds: 18 for voting and driving license, 18 for women marriage age, 21 for men marriage age, 21 for liquor consumption in most states, and 60 for senior citizen benefits." },
    { question: "Is my date of birth stored or shared?", answer: "No. All calculation is done locally in your browser. Your date of birth is never transmitted, stored, or shared with anyone." },
    { question: "Can I calculate age for a past or future date?", answer: "Yes. You can specify any reference date to calculate age as of that date, not just today. This is useful for checking eligibility as of a specific application deadline." },
  ]
  },
  {
    name: 'CGPA to Percentage Converter',
    slug: 'cgpa-to-percentage-converter',
    description: 'Convert CGPA to percentage using CBSE, Mumbai University (MU), Anna University, and other Indian university conversion formulas. Supports 10-point, 7-point, and 4-point CGPA scales.',
    seoDescription: 'Free online CGPA to Percentage Converter — Convert CGPA to percentage using CBSE (9.5x), Mumbai University (7.1x+11), Anna University, and other India-specific formulas. Supports 10/7/4 point scales.',
    category: 'indian-utilities',
    id:  "241",
    dependencies: 'None',
    instructions: [
    { title: "1. Enter Your CGPA", desc: "Type your Cumulative Grade Point Average (CGPA) in the input field. Enter a value between 0 and your university's maximum CGPA (typically 10, 7, or 4)." },
    { title: "2. Select Your University or Board", desc: "Choose the conversion formula that applies to you — CBSE (multiply by 9.5), Mumbai University (7.1x + 11 for 7-point, 7.3x + 5.5 for 10-point), Anna University, VTU, AKTU, UPTU, or a custom formula." },
    { title: "3. Get Your Percentage", desc: "View your equivalent percentage instantly. The tool displays the conversion formula used so you can verify the calculation. Copy the result for your applications." },
  ],
    faqs: [
    { question: "How does CBSE convert CGPA to percentage?", answer: "CBSE uses the formula: Percentage = CGPA x 9.5. For example, a CGPA of 9.0 equals 85.5%. This formula was derived by CBSE based on the results of previous board examinations." },
    { question: "How is Mumbai University CGPA calculated?", answer: "Mumbai University uses formula-specific conversion: for the 7-point scale, Percentage = 7.1 x CGPA + 11. For the 10-point scale under the Choice Based Credit System, Percentage = 7.3 x CGPA + 5.5." },
    { question: "Can I use a custom formula?", answer: "Yes. If your university uses a specific conversion formula not listed, you can enter the custom values manually — specify the multiplier and additive constant used by your institution." },
    { question: "Is this calculation accurate for job applications?", answer: "Most Indian companies and higher education institutions accept the CBSE 9.5 formula or the specific conversion published by your university. Verify with the HR department or admissions office if your university uses a unique formula." },
  ]
  },
  {
    name: 'PDF to HTML',
    slug: 'pdf-to-html',
    description: 'Converts PDF files to HTML format — document sharing, printing, and archival with consistent formatting to web pages, email templates, and content rendering. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online PDF to HTML — Convert PDF pages into a clean, responsive HTML5 document. ',
    category: 'PDF',
    id:  "242",
    dependencies: 'PDF.js'
  },
  {
    name: 'HTML to PDF',
    slug: 'html-to-pdf',
    description: 'Converts HTML files to PDF format — web pages, email templates, and content rendering to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online HTML to PDF — Convert HTML source code into a downloadable PDF document. ',
    category: 'PDF',
    id:  "243",
    dependencies: 'jsPDF'
  },
  {
    name: 'Generic PDF Processor',
    slug: 'generic-pdf-processor',
    description: 'Compress, rotate pages, or strip metadata from PDFs in one unified tool. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Generic PDF Processor — Compress, rotate pages, or strip metadata from PDFs in one unified tool. ',
    category: 'PDF',
    id:  "244",
    dependencies: 'pdf-lib'
  },
  {
    name: 'JFIF to PNG Converter',
    slug: 'jfif-to-png',
    showInCategory: false,
    description: 'Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online JFIF to PNG Converter — Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss. ',
    category: 'Image',
    id:  "246",
    dependencies: 'Canvas API'
  },
  {
    name: 'Image to JPG Converter',
    slug: 'convert-to-jpg',
    showInCategory: false,
    description: 'Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Image to JPG Converter — Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings. ',
    category: 'Image',
    id:  "248",
    dependencies: 'Canvas API'
  },
  {
    name: 'Rotate Image Online',
    slug: 'rotate-image',
    description: 'Rotates images left or right by 90-degree increments instantly in the browser with no upload required. No signup or account required.',
    seoDescription: 'Free online Rotate Image Online — Rotates images left or right by 90-degree increments instantly in the browser with no upload required. ',
    category: 'Image',
    id:  "249",
    dependencies: 'Canvas API'
  },
  {
    name: 'Blur Face Online',
    slug: 'blur-face',
    description: 'Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face. No signup or account required.',
    seoDescription: 'Free online Blur Face Online — Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face. ',
    category: 'Image',
    id:  "250",
    dependencies: 'AI API'
  },
  {
    name: 'HTML to Image Converter',
    slug: 'html-to-image',
    description: 'Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser. No signup or account required.',
    seoDescription: 'Free online HTML to Image Converter — Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser. ',
    category: 'Converter',
    id:  "251",
    dependencies: 'html2canvas'
  },
  {
    name: 'Apple Music Preview Extractor',
    slug: 'apple-music-preview-extractor',
    description: 'Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL. No signup or account required.',
    seoDescription: 'Free online Apple Music Preview Extractor — Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL. ',
    category: 'Audio',
    id:  "252",
    dependencies: 'fetch API'
  },
  {
    name: 'Marriage Biodata Maker',
    slug: 'marriage-biodata-maker',
    description: 'Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences. Download as PDF for sharing on matrimonial platforms.',
    seoDescription: 'Free online Marriage Biodata Maker — Create printable matrimonial biodata forms for Shaadi.com, BharatMatrimony, and other platforms. Personal details, family background, education, career, and partner preferences.',
    category: 'indian-utilities',
    id:  "257",
    dependencies: 'jsPDF',
    instructions: [
    { title: "1. Fill in Personal Details", desc: "Enter basic information — name, date of birth, height, complexion, gotra, and horoscope details (manglik, nakshatra, rashi). All fields are organized in the traditional Indian biodata format." },
    { title: "2. Add Family Background", desc: "Complete the family section with father's name and occupation, mother's name, siblings (brothers/sisters), and family type (nuclear/joint) and values (orthodox/traditional/liberal)." },
    { title: "3. Add Career and Preferences", desc: "Enter your education qualifications, occupation, annual income, and city details. Specify partner preferences — age range, education, profession, city preference, and any other expectations." },
  ],
    faqs: [
    { question: "What sections are included in the biodata?", answer: "The biodata includes Personal Details (name, DOB, height, gotra, horoscope), Family Background (parents, siblings, family type), Education and Career (qualifications, occupation, income), and Partner Preferences (age, education, profession, location, community)." },
    { question: "Can I download the biodata as PDF?", answer: "Yes. The tool generates a professionally formatted PDF that you can download and share on matrimonial platforms like Shaadi.com, BharatMatrimony, Jeevansathi, or via WhatsApp and email with family contacts." },
    { question: "Can I add photos to the biodata?", answer: "Yes. The template includes a photo section where you can upload a recent photograph. The photo is embedded in the PDF and positioned in the standard biodata format." },
    { question: "Is my data saved anywhere?", answer: "No. All information is processed locally in your browser for PDF generation. Nothing is stored, uploaded, or shared. Your personal and family data remains completely private." },
  ]
  },
  {
    name: 'Rental Agreement Generator',
    slug: 'rental-agreement-generator',
    description: 'Generates customizable rental lease and license agreements compliant with Indian property laws. Supports leave-and-license agreements and standard tenancy formats for residential and commercial properties.',
    seoDescription: 'Free online Rental Agreement Generator — Create rental lease and license agreements compliant with Indian property laws. Leave-and-license and tenancy formats for residential/commercial properties. Download as PDF.',
    category: 'indian-utilities',
    id:  "258",
    dependencies: 'jsPDF',
    instructions: [
    { title: "1. Enter Property and Party Details", desc: "Fill in landlord and tenant details (names, addresses), property address and description, and the agreement type — leave-and-license (popular in Maharashtra) or standard tenancy agreement." },
    { title: "2. Set Financial Terms", desc: "Specify the monthly rent amount, security deposit, rent escalation percentage and frequency, lock-in period, and notice period. The tool formats all financial terms clearly in the agreement." },
    { title: "3. Review and Download PDF", desc: "Preview the complete agreement with all sections — parties, property description, term, rent, deposit, utilities, maintenance responsibilities, and termination clauses. Download as a PDF ready for stamp paper and registration." },
  ],
    faqs: [
    { question: "What is the difference between leave-and-license and tenancy?", answer: "A leave-and-license agreement grants permission to use the property (license) without creating tenancy rights. It is easier to terminate and does not create inheritance rights. A tenancy agreement creates a landlord-tenant relationship with stronger legal protections under the Rent Control Act." },
    { question: "Is this agreement legally valid?", answer: "Yes. The agreement follows standard Indian property law formats. For legal enforceability, print it on adequate-value stamp paper (value varies by state) and register with the sub-registrar if the lease period exceeds 12 months." },
    { question: "What states does this cover?", answer: "The agreement is drafted under Indian law and suitable for all Indian states. Key state-specific variations like stamp duty rates and registration requirements differ — check with a local lawyer for your state's specific requirements." },
    { question: "Can I modify the terms after generating?", answer: "Yes. You can regenerate the PDF with updated terms anytime. The agreement includes standard clauses for maintenance, utility bills, painting charges, and dispute resolution — all customizable." },
  ]
  },
  {
    name: 'Resume ATS Score Checker',
    slug: 'resume-ats-score-checker',
    description: 'Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions. No signup or account required.',
    seoDescription: 'Free online Resume ATS Score Checker — Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions. ',
    category: 'AI',
    id:  "259",
    dependencies: 'AI API',
    instructions: [
      { title: "1. Upload Your Resume", desc: "Upload your resume in PDF or DOCX format. The tool parses the content and extracts your skills, experience, education, and certifications." },
      { title: "2. Paste the Job Description", desc: "Enter the job description you're applying for. The AI analyzes both documents to identify keyword matches, skill gaps, and overall compatibility." },
      { title: "3. Review Your Score and Suggestions", desc: "View your ATS compatibility score out of 100, along with actionable suggestions to improve your resume — missing keywords, formatting issues, and skills to highlight." },
    ],
    faqs: [
      { question: "What is an ATS score?", answer: "An Applicant Tracking System (ATS) score measures how well your resume matches a job description. Companies use ATS software to filter candidates before human review. A higher score means your resume is more likely to pass automated screening." },
      { question: "What factors affect my score?", answer: "The score considers keyword matching (skills, qualifications, tools), formatting compatibility, section headers, and overall relevance. Missing industry-specific keywords and improper formatting are common reasons for low scores." },
      { question: "How can I improve my ATS score?", answer: "Use standard section headers (Experience, Education, Skills), include keywords from the job description naturally in your experience bullets, use a clean format without tables or graphics, and quantify achievements with numbers." },
      { question: "Is my resume stored or shared?", answer: "No. Your resume and job description are processed once and not stored. We recommend not uploading sensitive personal information beyond what's needed for the analysis." },
    ]
  },
  {
    name: 'WhatsApp Toolkit',
    slug: 'whatsapp-toolkit',
    description: 'Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online WhatsApp Toolkit — Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text. ',
    category: 'Utility',
    id:  "261",
    dependencies: 'QRCode.js',
  },
  {
    name: 'Indian Document Enhancer',
    slug: 'indian-document-enhancer',
    description: 'Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government portals. Adjusts contrast, brightness, and sharpness locally.',
    seoDescription: 'Free online Indian Document Enhancer — Enhance scanned images of Aadhaar, PAN, Voter ID, and Driving License for government portal uploads. Improve contrast, brightness, and sharpness. 100% local processing.',
    category: 'indian-utilities',
    id:  "262",
    dependencies: 'Canvas API',
    instructions: [
    { title: "1. Upload Your Document Image", desc: "Select a scanned image or photo of your identification document — Aadhaar, PAN card, Voter ID, or Driving License. The tool accepts photos taken from your phone as well as scanner output." },
    { title: "2. Auto-Enhance the Image", desc: "The tool automatically adjusts contrast, brightness, and sharpness to meet government portal upload guidelines. It improves text legibility, reduces shadows, and normalizes the document appearance." },
    { title: "3. Download the Enhanced Version", desc: "Preview the enhanced document image side-by-side with the original. Download the improved version and upload it to the relevant government portal." },
  ],
    faqs: [
    { question: "Which government portals require enhanced document scans?", answer: "Many Indian government portals require clear, legible document scans: DigiLocker document uploads, Income Tax e-filing portal (PAN card), UIDAI Aadhaar updates, Voter ID online applications, and various state government service portals." },
    { question: "What enhancements are applied to the image?", answer: "The tool applies adaptive contrast stretching, brightness normalization, sharpness enhancement (unsharp mask), shadow reduction, and noise reduction. These adjustments are calibrated for Indian ID document formats." },
    { question: "What file formats and sizes are supported?", answer: "The tool accepts JPEG and PNG images. The enhanced output preserves the original resolution while improving visual quality. Recommended minimum resolution is 300 DPI for print-original documents." },
    { question: "Is my identification document stored anywhere?", answer: "No. All image processing happens locally in your browser using the Canvas API. Your identification document image is never uploaded to any server." },
  ]
  },
  {
    name: 'Indian Voice Transcriber',
    slug: 'indian-voice-transcriber',
    description: 'Transcribes recorded audio to text with support for 12 Indian languages using browser-based Web Speech API recognition. Works offline with no data uploads for supported languages.',
    seoDescription: 'Free online Indian Voice Transcriber — Transcribe audio to text in 12 Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, English). Browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "264",
    dependencies: 'Web Speech API',
    instructions: [
    { title: "1. Upload or Record Audio", desc: "Upload a pre-recorded audio file from your device or use the built-in recorder to capture audio directly in your browser. Supported formats include MP3, WAV, M4A, and WebM." },
    { title: "2. Choose the Language", desc: "Select the language of your audio from 12 supported Indian languages — Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, and English." },
    { title: "3. Review and Export the Transcript", desc: "The transcription appears in real time as the audio is processed. Review the text, make any corrections, and copy it to your clipboard or download as a text file." },
  ],
    faqs: [
    { question: "What are the 12 supported Indian languages?", answer: "The tool supports Hindi, Tamil, Telugu, Bengali (Bangla), Marathi, Gujarati, Kannada, Malayalam, Punjabi (Gurmukhi), Odia (Oriya), Urdu, and English — covering all 22 official languages of India except for languages not yet supported by the Web Speech API." },
    { question: "How accurate is the transcription?", answer: "Accuracy varies based on audio quality, speaker clarity, background noise levels, and the specific language. Clean recordings with minimal background noise produce the best results." },
    { question: "Is my audio data transmitted to any server?", answer: "For some languages, the transcription uses your browser's built-in Web Speech API which may process audio locally or through cloud-based recognition depending on the browser." },
    { question: "Can I transcribe audio from a video file?", answer: "Yes. If the video file contains a clear audio track, you can upload it and the tool will extract the audio for transcription. Supported video formats include MP4 and WebM with audio tracks." },
  ]
  },
  {
    name: 'Bank Statement Analyser',
    slug: 'bank-statement-analyser',
    description: 'Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending. No signup or account required.',
    seoDescription: 'Free online Bank Statement Analyser — Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending. ',
    category: 'Utility',
    id:  "265",
    dependencies: 'PDF.js'
  },
  {
    name: 'Social Media Calendar',
    slug: 'social-media-calendar',
    description: 'Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Social Media Calendar — Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled. ',
    category: 'Branding',
    id:  "268",
    dependencies: 'localStorage'
  },
  {
    name: 'Bulk Background Changer',
    slug: 'bulk-bg-changer',
    description: 'Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Bulk Background Changer — Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing. ',
    category: 'Image',
    id:  "269",
    dependencies: 'Canvas API',
    isPro: true,
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple images with backgrounds you want to replace. Works best with images that have clear subject-background contrast."
      },
      {
            "title": "2. Pick Background Color",
            "desc": "Use the color picker to select a new background color, or choose transparent to remove the background entirely."
      },
      {
            "title": "3. Download All",
            "desc": "All processed images are saved as a ZIP archive. Each image keeps its original dimensions and quality."
      }

    ],
    faqs: [

      {
            "question": "How does the bulk background changer work?",
            "answer": "The tool uses color-key sampling to detect and replace backgrounds. You can fine-tune the color tolerance for better results on images with complex backgrounds."
      },
      {
            "question": "Can I use a custom image as the background instead of a solid color?",
            "answer": "Currently, the bulk mode supports solid colors and transparent backgrounds. For custom image backgrounds, use the single-image background changer with more advanced editing options."
      },
      {
            "question": "How many images can I process at once?",
            "answer": "Free users can process up to 5 images per batch. Pro users can process unlimited images. All processing runs locally in your browser."
      }

    ],},
  {
    name: 'AI Background Changer',
    slug: 'ai-bg-changer',
    description: 'Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online AI Background Changer — Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen. ',
    category: 'Image',
    id:  "270",
    dependencies: 'Canvas API'
  },
  {
    name: 'Link in Bio Builder',
    slug: 'link-in-bio-builder',
    description: 'Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Link in Bio Builder — Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection. ',
    category: 'Branding',
    id:  "271",
    dependencies: 'None'
  },
  {
    name: 'PDF Page Manager',
    slug: 'pdf-page-manager',
    description: 'Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Page Manager — Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails. ',
    category: 'PDF',
    id:  "274",
    dependencies: 'pdf-lib'
  },
  {
    name: 'Bulk QR Code Generator',
    slug: 'bulk-qr-code-generator',
    description: 'Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Bulk QR Code Generator — Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive. ',
    category: 'Utility',
    id:  "275",
    dependencies: 'qrcode.js, JSZip',
    isPro: true,
  
    instructions: [

      {
            "title": "1. Enter or Upload Data",
            "desc": "Type or paste your data (URLs, text, phone numbers) one per line, or upload a CSV file with multiple entries."
      },
      {
            "title": "2. Customize QR Code",
            "desc": "Choose size, error correction level, and optional colors. Each entry gets its own QR code with identical styling."
      },
      {
            "title": "3. Download ZIP",
            "desc": "All QR codes are exported as PNG images in a ZIP archive, named by their data content for easy identification."
      }

    ],
    faqs: [

      {
            "question": "What can I put in a QR code?",
            "answer": "QR codes can store URLs, plain text, phone numbers, email addresses, SMS messages, Wi-Fi credentials, vCard contacts, and geographic locations. The bulk generator supports all common data types."
      },
      {
            "question": "How many QR codes can I generate at once?",
            "answer": "Free users can generate up to 10 QR codes per batch from CSV input. Pro users can generate up to 5,000 QR codes from large CSV files."
      },
      {
            "question": "What format are the QR code images?",
            "answer": "QR codes are generated as PNG images at your chosen resolution (default 512x512). Each image is named after its content, making it easy to identify which QR code is which."
      }

    ],},
  {
    name: 'PDF AI Summariser',
    slug: 'pdf-ai-summariser',
    description: 'Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key points and insights.',
    seoDescription: 'Free online PDF AI Summariser — Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key points and insights. ',
    category: 'AI',
    id:  "276",
    dependencies: 'AI API, PDF.js',
    instructions: [
      { title: "1. Upload Your PDF", desc: "Select a PDF file from your device. The tool extracts text using native PDF parsing for digital PDFs and OCR for scanned documents." },
      { title: "2. Choose Summary Length", desc: "Select your preferred summary length — brief (1 paragraph), concise (3-5 bullet points), or detailed (section-by-section overview)." },
      { title: "3. Generate and Export", desc: "Click summarize to produce an AI-generated summary. Review the output and copy or download it as text for use in reports, notes, or research." },
    ],
    faqs: [
      { question: "Does this support scanned PDFs?", answer: "Yes. The tool uses OCR (Optical Character Recognition) to extract text from scanned documents and images within PDFs. Text quality depends on the scan resolution and clarity." },
      { question: "How long does summarization take?", answer: "Processing time depends on document length. Short documents (1-10 pages) take seconds. Longer documents (50+ pages) may take a minute or more for text extraction and LLM processing." },
      { question: "Can I summarize any type of PDF?", answer: "The tool works best with text-heavy PDFs like articles, reports, research papers, and books. Highly graphical PDFs with minimal text may produce less useful summaries." },
      { question: "What information does the summary contain?", answer: "The summary extracts key points, main arguments, conclusions, and important findings. The level of detail depends on your chosen summary length setting." },
    ]
  },
  {
    id: "278",
    name: "Bulk Image Watermark",
    slug: "bulk-image-watermark",
    category: "Image",
    description: "Apply a text logo, image logo, or timestamp overlay to dozens of images at once with configurable position, opacity, and rotation per batch. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Image Watermark — Apply a text logo, image logo, or timestamp overlay to dozens of images at once with configurable position, opacity, and rotation per batch. ',
    dependencies: "Canvas API, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select all images you want to watermark. Supports JPEG, PNG, and WebP formats."
      },
      {
            "title": "2. Configure Watermark",
            "desc": "Choose between text overlay, image logo, or timestamp. Adjust position, opacity, size, and rotation."
      },
      {
            "title": "3. Process & Download",
            "desc": "Click process and all watermarked images are saved in a ZIP archive. Processing is fully local."
      }

    ],
    faqs: [

      {
            "question": "Can I add different watermarks to different images in the same batch?",
            "answer": "No — the bulk watermarker applies the same watermark configuration to all images in a batch. For different watermarks, process images in separate batches."
      },
      {
            "question": "What watermark types are supported?",
            "answer": "You can add text overlays (customizable font, size, color, opacity), image logos (PNG with transparency), or automatic timestamps showing the date and time."
      },
      {
            "question": "Does watermarking reduce image quality?",
            "answer": "No, the original image quality is preserved. The watermark is applied as an additional layer without recompressing the base image. Output is saved as PNG to maintain quality."
      }

    ],},
  {
    id: "279",
    name: "Bulk PDF Data Extractor",
    slug: "bulk-pdf-data-extractor",
    category: "PDF",
    description: "Extract tables, form fields, and key-value pairs from multiple PDFs simultaneously and export the aggregated data to a single CSV or Excel file. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk PDF Data Extractor — Extract tables, form fields, and key-value pairs from multiple PDFs simultaneously and export the aggregated data to a single CSV or Excel file. ',
    dependencies: "pdf-lib, SheetJS",
  
    instructions: [

      {
            "title": "1. Upload PDFs",
            "desc": "Select multiple PDF files containing tables, forms, or structured data. Supports up to 100 files per batch."
      },
      {
            "title": "2. Select Extraction Mode",
            "desc": "Choose between table extraction, form field extraction, or key-value pair extraction based on your document type."
      },
      {
            "title": "3. Export as CSV",
            "desc": "All extracted data is aggregated into a single CSV file. Download and open in Excel or Google Sheets."
      }

    ],
    faqs: [

      {
            "question": "What types of PDF data can be extracted?",
            "answer": "The tool extracts tables (with rows and columns), form fields (filled input fields, checkboxes, dropdowns), and key-value pairs (labels with associated values like Invoice #: 12345)."
      },
      {
            "question": "Are scanned PDFs supported?",
            "answer": "Yes, if your PDF contains scanned images, the tool can use OCR to extract text. For best results, use digitally-created PDFs rather than scanned documents."
      },
      {
            "question": "How is the data exported?",
            "answer": "All extracted data is compiled into a single CSV file with consistent column headers across all documents. This makes it easy to analyze in spreadsheet software or import into databases."
      }

    ],},
  {
    id: "280",
    name: "Bulk Image to PDF",
    slug: "bulk-image-to-pdf",
    category: "PDF",
    description: "Merge hundreds of JPG, PNG, or WebP images into a single multi-page PDF with configurable page size, orientation, and compression per batch. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Image to PDF — Merge hundreds of JPG, PNG, or WebP images into a single multi-page PDF with configurable page size, orientation, and compression per batch. ',
    dependencies: "jsPDF, Canvas API",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple JPEG, PNG, or WebP images. They'll be combined into a single multi-page PDF."
      },
      {
            "title": "2. Configure Layout",
            "desc": "Choose page size (A4, Letter, etc.), orientation (portrait/landscape), and image fit mode."
      },
      {
            "title": "3. Download PDF",
            "desc": "Your multi-page PDF is ready for download. Each image becomes one page in the document."
      }

    ],
    faqs: [

      {
            "question": "How many images can I combine into one PDF?",
            "answer": "Free users can combine up to 20 images. Pro users can combine hundreds of images. The resulting PDF is generated entirely in your browser."
      },
      {
            "question": "Will I lose image quality in the PDF?",
            "answer": "No. Images are embedded at their full resolution in the PDF. You can also choose compression level to balance file size and quality."
      },
      {
            "question": "Can I rearrange the order of images?",
            "answer": "Yes, you can drag and drop to reorder images before generating the PDF. The first image becomes page 1, and so on."
      }

    ],},
  {
    id: "281",
    name: "Bulk Audio Converter",
    slug: "bulk-audio-converter",
    category: "Audio",
    description: "Convert an entire folder of audio files between MP3, WAV, OGG, FLAC, and M4A formats in one batch with consistent quality and bitrate settings. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Audio Converter — Convert an entire folder of audio files between MP3, WAV, OGG, FLAC, and M4A formats in one batch with consistent quality and bitrate settings. ',
    dependencies: "FFmpeg WASM",
  
    instructions: [

      {
            "title": "1. Upload Audio Files",
            "desc": "Select multiple audio files in any supported format (MP3, WAV, OGG, FLAC, M4A, AAC)."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select your target format. All files will be converted to the same output format with consistent settings."
      },
      {
            "title": "3. Download Converted Files",
            "desc": "All converted audio files are packaged in a ZIP archive. Processing uses FFmpeg WASM in your browser."
      }

    ],
    faqs: [

      {
            "question": "What audio formats can I convert between?",
            "answer": "Supported formats include MP3, WAV, OGG, FLAC, M4A, and AAC. You can convert any input format to any output format."
      },
      {
            "question": "Can I adjust audio quality settings?",
            "answer": "Yes, you can set bitrate, sample rate, and channels for the output files. Higher bitrates preserve more quality but produce larger files."
      },
      {
            "question": "How long does bulk conversion take?",
            "answer": "Conversion speed depends on file sizes and your device. Short audio clips convert in seconds. Longer files (30+ minutes) take a few minutes since FFmpeg processing is CPU-intensive."
      }

    ],},
  {
    id: "282",
    name: "Bulk SVG to PNG",
    slug: "bulk-svg-to-png",
    category: "Image",
    description: "Rasterize hundreds of SVG files to PNG at any resolution, preserving vector sharpness. Ideal for generating icon sprite sheets and asset pipelines. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk SVG to PNG — Rasterize hundreds of SVG files to PNG at any resolution, preserving vector sharpness. Ideal for generating icon sprite sheets and asset pipelines. ',
    dependencies: "Canvas API, jszip",
  
    instructions: [

      {
            "title": "1. Upload SVG Files",
            "desc": "Select multiple SVG vector files from your device. Thumbnails show a preview of each file."
      },
      {
            "title": "2. Set Output Resolution",
            "desc": "Choose the output resolution (scale or specific pixel dimensions). Higher DPI produces sharper PNGs."
      },
      {
            "title": "3. Download PNGs",
            "desc": "All converted PNG images are packaged in a ZIP archive. Each file keeps its original name with a .png extension."
      }

    ],
    faqs: [

      {
            "question": "Why convert SVG to PNG?",
            "answer": "SVG is a vector format ideal for logos, icons, and illustrations. PNG is a raster format required by many platforms, email clients, and graphic design software that don't support SVG."
      },
      {
            "question": "Do I lose quality when converting SVG to PNG?",
            "answer": "SVGs are resolution-independent vectors. When converting to PNG at high resolution, the result can be crisp and sharp. We recommend 2x or 3x resolution for Retina/HiDPI displays."
      },
      {
            "question": "Can I convert multiple SVGs at different sizes?",
            "answer": "Yes, all SVGs in a batch use the same output resolution. For different sizes, run separate batches with different resolution settings."
      }

    ],},
  {
    id: "283",
    name: "Bulk Image Compressor",
    slug: "bulk-image-compressor",
    category: "Image",
    description: "Compress JPG, PNG, and WebP images in bulk with uniform quality settings. E-commerce sellers use it to optimize entire product catalogs before upload. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Image Compressor — Compress JPG, PNG, and WebP images in bulk with uniform quality settings. E-commerce sellers use it to optimize entire product catalogs before upload. ',
    dependencies: "browser-image-compression, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select JPG, PNG, or WebP images. You'll see file sizes before compression."
      },
      {
            "title": "2. Adjust Quality",
            "desc": "Use the quality slider to control the compression level. Lower quality = smaller files. A preview shows the estimated result."
      },
      {
            "title": "3. Download All",
            "desc": "All compressed images are saved in a ZIP archive. Click individual images to download them separately."
      }

    ],
    faqs: [

      {
            "question": "How much can bulk image compression reduce file size?",
            "answer": "Typical compression reduces file sizes by 40-80%. JPEG images compress well at 60-80% quality. PNG compression removes unused colors and optimizes palettes. WebP compression is most efficient, often reducing size by 30-50% over JPEG."
      },
      {
            "question": "What's the difference between compress and resize?",
            "answer": "Compression reduces file size by lowering image quality (JPEG) or optimizing color data (PNG/WebP). Resizing changes pixel dimensions. For the smallest file size, compress first, then resize if needed."
      },
      {
            "question": "Is bulk image compression safe for copyrighted images?",
            "answer": "Yes. All processing happens entirely in your browser — your images never leave your device. No server upload means complete privacy for sensitive or copyrighted images."
      }

    ],},
  {
    id: "284",
    name: "Bulk PDF Size Reducer",
    slug: "bulk-pdf-size-reducer",
    category: "PDF",
    description: "Reduce file size of multiple PDFs at once by compressing embedded images, removing metadata, and optimizing object streams across the batch. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk PDF Size Reducer — Reduce file size of multiple PDFs at once by compressing embedded images, removing metadata, and optimizing object streams across the batch. ',
    dependencies: "pdf-lib",
  
    instructions: [

      {
            "title": "1. Upload PDFs",
            "desc": "Select multiple PDF files. The tool shows each file's current size."
      },
      {
            "title": "2. Choose Compression Level",
            "desc": "Select from Maximum, Balanced, or High Quality compression tiers."
      },
      {
            "title": "3. Download Reduced PDFs",
            "desc": "Compressed PDFs are saved individually or as a ZIP archive. Processing is 100% local."
      }

    ],
    faqs: [

      {
            "question": "How much can PDF file size be reduced?",
            "answer": "Typical reduction ranges from 40-90%. Image-heavy PDFs compress the most. Text-only PDFs see smaller reductions since the text content is already compact."
      },
      {
            "question": "Does PDF compression affect text readability?",
            "answer": "Text remains fully readable at all compression tiers since it's stored as text vectors, not images. Only embedded images are affected. Choose High Quality for maximum visual fidelity."
      },
      {
            "question": "Can I process scanned PDFs?",
            "answer": "Yes, but scanned PDFs contain images of text rather than digital text. Compression reduces the image quality to shrink file size. For best results, use OCR to convert scanned content first."
      }

    ],},
  {
    id: "285",
    name: "Bulk Image Resizer",
    slug: "bulk-image-resizer",
    category: "Image",
    description: "Resize hundreds of images to exact pixel dimensions or percentage scale in one pass. Photographers use it to standardize client galleries before delivery. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Image Resizer — Resize hundreds of images to exact pixel dimensions or percentage scale in one pass. Photographers use it to standardize client galleries before delivery. ',
    dependencies: "Canvas API, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple images to resize. Shows dimensions and file sizes for each."
      },
      {
            "title": "2. Set Dimensions",
            "desc": "Choose exact pixel dimensions, a percentage scale, or a preset (Instagram, Twitter, etc.)."
      },
      {
            "title": "3. Download All",
            "desc": "All resized images are packaged in a ZIP archive. Each image keeps its original format."
      }

    ],
    faqs: [

      {
            "question": "What resize modes are available?",
            "answer": "You can resize by exact dimensions (width × height), by percentage (e.g., 50% of original), or by social media presets (Instagram 1080×1080, Twitter header 1500×500, etc.)."
      },
      {
            "question": "Does resizing reduce image quality?",
            "answer": "Resizing to smaller dimensions can reduce perceived sharpness. We recommend using 'high quality' resampling. Resizing to larger dimensions (upscaling) may cause blurriness as the tool is filling in pixels."
      },
      {
            "question": "Can I maintain aspect ratio?",
            "answer": "Yes, by default the tool maintains aspect ratio. You can disable this to force exact dimensions, which may stretch or crop the image."
      }

    ],},
  {
    id: "286",
    name: "Bulk Video Compressor",
    slug: "bulk-video-compressor",
    category: "Video",
    description: "Compress multiple video files simultaneously with consistent CRF, resolution, and codec settings. YouTube studios use it to batch-optimize daily uploads. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Video Compressor — Compress multiple video files simultaneously with consistent CRF, resolution, and codec settings. YouTube studios use it to batch-optimize daily uploads. ',
    dependencies: "FFmpeg WASM",
  
    instructions: [

      {
            "title": "1. Upload Videos",
            "desc": "Select multiple MP4, MOV, or WebM video files. File sizes and durations are shown."
      },
      {
            "title": "2. Set Compression Settings",
            "desc": "Choose CRF value (lower = higher quality), target resolution, and codec. Presets available for web, email, and archive."
      },
      {
            "title": "3. Process & Download",
            "desc": "Videos are compressed one at a time using FFmpeg WASM. Download individual files or all at once."
      }

    ],
    faqs: [

      {
            "question": "What video formats are supported?",
            "answer": "Input formats include MP4 (H.264/H.265), MOV, WebM, AVI, and MKV. Output is always MP4 (H.264) for maximum compatibility."
      },
      {
            "question": "How long does bulk video compression take?",
            "answer": "Video compression is CPU-intensive and depends on file size, duration, resolution, and your device's processing power. A 100MB video typically takes 1-3 minutes. Files are processed sequentially, not in parallel."
      },
      {
            "question": "What CRF value should I use?",
            "answer": "CRF 23 is the default (good balance). Lower values (18-22) produce higher quality but larger files. Higher values (24-28) produce smaller files with more compression artifacts. For web uploads, try CRF 28. For archiving, use CRF 18."
      }

    ],},
  {
    id: "287",
    name: "Bulk PDF Merger",
    slug: "bulk-pdf-merger",
    category: "PDF",
    description: "Join dozens of PDF files into one document in a single operation. Legal teams use it to consolidate contract bundles and discovery exhibits instantly. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk PDF Merger — Join dozens of PDF files into one document in a single operation. Legal teams use it to consolidate contract bundles and discovery exhibits instantly. ',
    dependencies: "pdf-lib",
  
    instructions: [

      {
            "title": "1. Upload PDFs",
            "desc": "Select multiple PDF files in the order you want them merged."
      },
      {
            "title": "2. Reorder (Optional)",
            "desc": "Drag and drop to rearrange pages before merging."
      },
      {
            "title": "3. Download Merged PDF",
            "desc": "All PDFs are combined into a single document. Download the result instantly."
      }

    ],
    faqs: [

      {
            "question": "How many PDFs can I merge at once?",
            "answer": "Free users can merge up to 10 PDFs. Pro users can merge up to 100 PDFs. There is no limit on individual file size."
      },
      {
            "question": "Does merging preserve bookmarks and hyperlinks?",
            "answer": "Yes, bookmarks, hyperlinks, and internal references from the original PDFs are preserved in the merged document when possible."
      },
      {
            "question": "Can I select specific pages from each PDF?",
            "answer": "The current version merges entire PDFs. For page-level selection, use the PDF Splitter tool first, then merge the extracted pages."
      }

    ],},
  {
    id: "288",
    name: "Bulk Face Anonymizer",
    slug: "bulk-face-anonymizer",
    category: "Image",
    description: "Detect and blur faces across multiple images automatically using on-device face detection. GDPR compliance teams use it to anonymize datasets before publication. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Face Anonymizer — Detect and blur faces across multiple images automatically using on-device face detection. GDPR compliance teams use it to anonymize datasets before publication. ',
    dependencies: "TensorFlow.js, Canvas API, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple photos containing faces. Works best with front-facing, well-lit photos."
      },
      {
            "title": "2. Choose Anonymization Method",
            "desc": "Select blur, pixelate, or overlay for detected faces. Adjust the intensity as needed."
      },
      {
            "title": "3. Download Processed Images",
            "desc": "All anonymized images are saved as PNG in a ZIP archive. Original images are never modified on your device."
      }

    ],
    faqs: [

      {
            "question": "How accurate is the face detection?",
            "answer": "The tool uses TensorFlow.js for on-device face detection. It works well on front-facing and profile photos with adequate lighting. Accuracy decreases with extreme angles, heavy shadows, or very small faces."
      },
      {
            "question": "Are processed images stored anywhere?",
            "answer": "No. All processing happens entirely in your browser using TensorFlow.js. Your images are never uploaded to any server. The original and processed images only exist in your browser's memory."
      },
      {
            "question": "Can I process video frames?",
            "answer": "The current version processes static images only. For video face blurring, consider using a dedicated video anonymization tool."
      }

    ],},
  {
    id: "289",
    name: "Bulk PDF Form Extractor",
    slug: "bulk-pdf-form-extractor",
    category: "PDF",
    description: "Extract filled form fields from hundreds of identical PDF forms and aggregate responses into a single CSV. Large-scale survey and application processing teams depend on it. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk PDF Form Extractor — Extract filled form fields from hundreds of identical PDF forms and aggregate responses into a single CSV. Large-scale survey and application processing teams depend on it. ',
    dependencies: "pdf-lib",
  
    instructions: [

      {
            "title": "1. Upload PDF Forms",
            "desc": "Select multiple PDF files with fillable form fields. All forms should have the same field structure."
      },
      {
            "title": "2. Map Fields",
            "desc": "The tool auto-detects form fields. Review and confirm the field mapping before extraction."
      },
      {
            "title": "3. Export to CSV",
            "desc": "All form responses are aggregated into a single CSV file with columns matching the form fields."
      }

    ],
    faqs: [

      {
            "question": "What types of PDF forms are supported?",
            "answer": "The tool supports AcroForm and XFA forms. Both digitally created forms and those with manual fill-in fields are supported."
      },
      {
            "question": "Do all PDFs need to have the same form structure?",
            "answer": "Yes, for accurate extraction all PDFs should have identical form field names. Slight variations may cause misaligned data in the CSV output."
      },
      {
            "question": "Can I extract data from scanned form images?",
            "answer": "No, scanned form images without digital form fields are not supported. Use the bulk OCR tool to digitize scanned forms first."
      }

    ],},
  {
    id: "290",
    name: "Bulk Video Size Reducer",
    slug: "bulk-video-size-reducer",
    category: "Video",
    description: "Batch-reduce video file sizes to fit email attachment limits (25MB), messaging platform caps, or any user-defined target. Every office worker with video attachments needs this. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Video Size Reducer — Batch-reduce video file sizes to fit email attachment limits (25MB), messaging platform caps, or any user-defined target. Every office worker with video attachments needs this. ',
    dependencies: "FFmpeg WASM",
  
    instructions: [

      {
            "title": "1. Upload Videos",
            "desc": "Select multiple video files. The tool shows current file sizes."
      },
      {
            "title": "2. Set Target Size",
            "desc": "Choose a target file size (e.g., 10MB, 25MB, 50MB for email attachments) or a target resolution."
      },
      {
            "title": "3. Process & Download",
            "desc": "Videos are compressed to fit your target size. Download individual files or as a ZIP archive."
      }

    ],
    faqs: [

      {
            "question": "What's the difference between Video Compressor and Video Size Reducer?",
            "answer": "Video Compressor gives you CRF quality control for consistent quality. Video Size Reducer works toward a specific file size target, automatically adjusting quality and resolution to hit that target."
      },
      {
            "question": "What target sizes work best for email?",
            "answer": "For email attachments, aim for under 25MB per file. 10MB is safe for most email providers. Outlook limits attachments to 20MB, Gmail to 25MB."
      },
      {
            "question": "Does reducing video size affect quality significantly?",
            "answer": "The tool balances file size and quality automatically. For moderate size reductions (e.g., 100MB to 25MB), quality loss is minimal. For extreme reductions, you may notice reduced resolution and compression artifacts."
      }

    ],},
  {
    id: "291",
    name: "Bulk Audio Normalizer",
    slug: "bulk-audio-normalizer",
    category: "Audio",
    description: "Normalize loudness across multiple audio files to broadcast-standard LUFS levels (–16 LUFS for podcasts, –14 LUFS for streaming). Podcast networks use this to unify episode volume. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Audio Normalizer — Normalize loudness across multiple audio files to broadcast-standard LUFS levels (–16 LUFS for podcasts, –14 LUFS for streaming). Podcast networks use this to unify episode volume. ',
    dependencies: "Web Audio API",
  
    instructions: [

      {
            "title": "1. Upload Audio Files",
            "desc": "Select multiple audio files to normalize. Supports MP3, WAV, FLAC, OGG, and M4A."
      },
      {
            "title": "2. Set Target Level",
            "desc": "Choose your target loudness. Broadcast standard is -14 LUFS (integrated). Music typically targets -16 to -10 LUFS depending on genre."
      },
      {
            "title": "3. Download Normalized Files",
            "desc": "All normalized audio files are packaged in a ZIP archive. Each file maintains its original format."
      }

    ],
    faqs: [

      {
            "question": "What is LUFS normalization?",
            "answer": "LUFS (Loudness Units relative to Full Scale) is the international standard for measuring perceived loudness. Normalization adjusts audio to a consistent loudness level, preventing sudden volume changes between tracks."
      },
      {
            "question": "What target LUFS should I use?",
            "answer": "For podcasts and broadcast, use -14 LUFS (ITU-R BS.1770 standard). For music streaming, -14 to -10 LUFS is common. For YouTube, -14 LUFS is recommended. For Spotify, -14 LUFS."
      },
      {
            "question": "Does normalization affect dynamic range?",
            "answer": "Normalization adjusts overall loudness without compressing dynamics. It's different from compression. Your audio's dynamic range (quiet-to-loud ratio) is preserved."
      }

    ],},
  {
    id: "292",
    name: "Bulk Video Subtitle Burner",
    slug: "bulk-video-subtitle-burner",
    category: "Video",
    description: "Burn SRT or VTT subtitles directly into multiple video files in one batch. Content republishers use it to prepare videos for platforms that do not support soft subtitles. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Video Subtitle Burner — Burn SRT or VTT subtitles directly into multiple video files in one batch. Content republishers use it to prepare videos for platforms that do not support soft subtitles. ',
    dependencies: "FFmpeg WASM",
  
    instructions: [

      {
            "title": "1. Upload Videos and Subtitles",
            "desc": "Select video files and matching SRT or VTT subtitle files. File names should match for auto-matching."
      },
      {
            "title": "2. Customize Appearance",
            "desc": "Choose font, size, color, and position for burned-in subtitles. Preview before processing."
      },
      {
            "title": "3. Process & Download",
            "desc": "Subtitles are burned directly into the video stream. Download processed videos as a ZIP archive."
      }

    ],
    faqs: [

      {
            "question": "What subtitle formats are supported?",
            "answer": "SRT (SubRip) and VTT (WebVTT) subtitle formats are supported. SRT is the most common format for video subtitles."
      },
      {
            "question": "Does burning subtitles reduce video quality?",
            "answer": "No, the video is re-encoded with subtitles embedded. Using the same quality settings as the source, there should be no visible quality loss."
      },
      {
            "question": "Can I match subtitles to videos automatically?",
            "answer": "The tool attempts to match subtitle and video files by filename. For example, 'video1.mp4' matches 'video1.srt'. Files without matches can be paired manually."
      }

    ],},
  {
    id: "293",
    name: "Bulk Invoice & Receipt Parser",
    slug: "bulk-invoice-receipt-parser",
    category: "Finance",
    description: "Drop 100 invoice PDFs or images, auto-detect date, vendor, amount, and tax, then export a clean CSV ready for tax filing. Replaces expensive accounting OCR per-document fees. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Invoice & Receipt Parser — Drop 100 invoice PDFs or images, auto-detect date, vendor, amount, and tax, then export a clean CSV ready for tax filing. Replaces expensive accounting OCR per-document fees. ',
    dependencies: "Tesseract.js, pdf-lib, SheetJS",
  
    instructions: [

      {
            "title": "1. Upload Invoices or Receipts",
            "desc": "Upload PDF or image files of invoices and receipts. The tool auto-detects document type."
      },
      {
            "title": "2. Review Extracted Data",
            "desc": "The tool extracts date, vendor, amount, tax, and line items. Review and correct any misreads."
      },
      {
            "title": "3. Export to CSV",
            "desc": "All extracted data is compiled into a CSV file for accounting software or spreadsheet analysis."
      }

    ],
    faqs: [

      {
            "question": "What data fields are extracted from invoices?",
            "answer": "The parser extracts vendor name, invoice date, invoice number, total amount, subtotal, tax amount, currency, line items (description, quantity, unit price), and payment terms."
      },
      {
            "question": "Can I process multi-page invoices?",
            "answer": "Yes, multi-page PDF invoices are fully supported. The tool processes all pages and aggregates extracted data."
      },
      {
            "question": "How accurate is the OCR for handwritten receipts?",
            "answer": "OCR accuracy depends on handwriting legibility. Printed receipts and typed invoices have high accuracy (95%+). Handwritten content varies — clear block letters work best."
      }

    ],},
  {
    id: "294",
    name: "Bulk CSV/Excel to JSON",
    slug: "bulk-csv-excel-to-json",
    category: "Developer",
    description: "Convert messy CSV or Excel sheets from clients into clean JSON in one batch. Handles missing values, nested rows, and generates strict JSON schemas for 50+ files at once. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk CSV/Excel to JSON — Convert messy CSV or Excel sheets from clients into clean JSON in one batch. Handles missing values, nested rows, and generates strict JSON schemas for 50+ files at once. ',
    dependencies: "SheetJS",
  
    instructions: [

      {
            "title": "1. Upload Files",
            "desc": "Select CSV or Excel (.xlsx, .xls) files. Multiple files can be uploaded at once."
      },
      {
            "title": "2. Configure Mapping",
            "desc": "Review column mapping. Choose whether to merge all files into one JSON or keep them separate."
      },
      {
            "title": "3. Download JSON",
            "desc": "The converted data is ready as formatted JSON. Download individual files or all as a ZIP archive."
      }

    ],
    faqs: [

      {
            "question": "Does the tool handle nested data structures?",
            "answer": "CSV/Excel data is inherently flat (rows and columns). For nested data, use the JSON tools to restructure after conversion. Header rows become JSON keys, data rows become JSON objects."
      },
      {
            "question": "Can I convert to both array and object formats?",
            "answer": "Yes, you can choose between JSON array format (array of objects) and keyed object format (object with ID-based keys)."
      },
      {
            "question": "What if my CSV has inconsistent columns?",
            "answer": "The tool handles inconsistent columns by using the union of all column headers across files. Missing values are set to null in the JSON output."
      }

    ],},
  {
    id: "295",
    name: "Bulk URL Status Checker",
    slug: "bulk-url-status-checker",
    category: "SEO",
    description: "Check 5,000 URLs for HTTP status codes (200, 301, 404, 500), extract title/meta descriptions, and flag slow pages. SEO agencies use it instead of $50/mo crawling tools. No signup or account required.",
    seoDescription: 'Free online Bulk URL Status Checker — Check 5,000 URLs for HTTP status codes (200, 301, 404, 500), extract title/meta descriptions, and flag slow pages. SEO agencies use it instead of $50/mo crawling tools. ',
    dependencies: "fetch API",
  
    instructions: [

      {
            "title": "1. Enter URLs",
            "desc": "Paste or upload a list of URLs (one per line) or upload a CSV file with URLs."
      },
      {
            "title": "2. Run Check",
            "desc": "Click 'Check URLs' to start scanning. Progress shows real-time status for each URL."
      },
      {
            "title": "3. Export Results",
            "desc": "Results are displayed in a table with status codes, response times, and page titles. Export as CSV."
      }

    ],
    faqs: [

      {
            "question": "How many URLs can I check at once?",
            "answer": "Free users can check up to 50 URLs. Pro users can check up to 5,000 URLs. Rate limiting is applied to prevent overwhelming target servers."
      },
      {
            "question": "What HTTP status codes does the tool detect?",
            "answer": "The tool detects all standard HTTP status codes: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error). It also flags timeout errors and DNS resolution failures."
      },
      {
            "question": "Does the tool check mobile responsiveness?",
            "answer": "The tool checks HTTP status, response time, and page title. For mobile responsiveness testing, use a dedicated mobile testing tool."
      }

    ],},
  {
    id: "296",
    name: "Bulk Image Format Converter",
    slug: "bulk-image-converter",
    category: "Image",
    description: "Convert images between JPG, PNG, WebP, AVIF, HEIC, HEIF, GIF, BMP, ICO, SVG. Batch convert with quality control. 100% local, zero uploads.",
    seoDescription: 'Free online Bulk Image Converter — Convert JPG, PNG, WebP, AVIF, HEIC, GIF, BMP, ICO, SVG in bulk. Quality control, directory preservation, zero uploads. ',
    dependencies: "Canvas API, jszip, heic2any",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select image files in any common format (JPEG, PNG, WebP). They will be converted to WebP or AVIF."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select WebP or AVIF as your target format. AVIF offers better compression, WebP offers broader browser support."
      },
      {
            "title": "3. Download Converted Images",
            "desc": "All converted images are saved in a ZIP archive. Directory structure from upload is preserved."
      }

    ],
    faqs: [

      {
            "question": "Why convert to WebP or AVIF?",
            "answer": "WebP and AVIF are next-gen image formats that provide 25-50% better compression than JPEG at the same quality. This means faster page loads, lower bandwidth usage, and better Core Web Vitals scores."
      },
      {
            "question": "Which format should I choose: WebP or AVIF?",
            "answer": "WebP is supported in all modern browsers (95%+ market share). AVIF offers better compression (20% smaller than WebP) but has slightly lower browser support (90%+). For maximum compatibility, use WebP."
      },
      {
            "question": "Does the tool preserve metadata?",
            "answer": "By default, EXIF metadata is stripped for privacy and smaller file sizes. You can optionally preserve copyright and orientation metadata."
      }

    ],},
  {
    id: "297",
    name: "Bulk EXIF Stripper & Injector",
    slug: "bulk-exif-stripper-injector",
    category: "Image",
    description: "Strip GPS location, camera serial, and timestamps from thousands of photos client-side. Or bulk-inject copyright metadata using a template across an entire image library. No signup or account required.",
    seoDescription: 'Free online Bulk EXIF Stripper & Injector — Strip GPS location, camera serial, and timestamps from thousands of photos client-side. Or bulk-inject copyright metadata using a template across an entire image library. ',
    dependencies: "exifr, piexifjs, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select images to strip or inject EXIF metadata. Supports JPEG and TIFF formats."
      },
      {
            "title": "2. Choose Mode",
            "desc": "Select 'Strip' to remove all metadata, or 'Inject' to add custom copyright, author, and contact info."
      },
      {
            "title": "3. Download Processed Images",
            "desc": "Processed images are saved in a ZIP archive. Stripped images retain full visual quality."
      }

    ],
    faqs: [

      {
            "question": "What metadata is removed when stripping EXIF?",
            "answer": "All EXIF data is removed including GPS location, camera make/model, timestamp, serial numbers, software info, and thumbnails. Only the image data itself is preserved."
      },
      {
            "question": "Why would I strip EXIF data?",
            "answer": "Privacy is the main reason. Photos taken on smartphones contain GPS coordinates, device serial numbers, and timestamps. Stripping this data protects your location and identity when sharing images online."
      },
      {
            "question": "What metadata can I inject?",
            "answer": "You can inject copyright notices, author name, creator contact info, description, keywords/tags, and usage rights. This is useful for photographers and content creators to protect their work."
      }

    ],},
  {
    id: "298",
    name: "Bulk App Icon Generator",
    slug: "bulk-app-icon-generator",
    category: "Image",
    description: "Upload one high-res SVG/PNG and export 30+ correctly sized icons for iOS, Android, PWA, Shopify, and social media OG images in a structured ZIP. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk App Icon Generator — Upload one high-res SVG/PNG and export 30+ correctly sized icons for iOS, Android, PWA, Shopify, and social media OG images in a structured ZIP. ',
    dependencies: "Canvas API, jszip",
  
    instructions: [

      {
            "title": "1. Upload Source Icon",
            "desc": "Upload a high-resolution SVG or PNG image. A single source image generates all required icon sizes."
      },
      {
            "title": "2. Select Platforms",
            "desc": "Choose target platforms: iOS, Android, PWA, macOS, Windows, and social media. Each platform has its own required sizes."
      },
      {
            "title": "3. Download All Icons",
            "desc": "All generated icons are organized by platform in a ZIP archive, ready to drop into your project."
      }

    ],
    faqs: [

      {
            "question": "What icon sizes are generated?",
            "answer": "iOS requires 16 sizes from 40×40 to 1024×1024. Android requires 8 sizes including adaptive icons. PWAs require 192×192 and 512×512. Social media platforms have their own specific size requirements."
      },
      {
            "question": "Can I generate icons for iOS and Android from the same source?",
            "answer": "Yes, the tool generates platform-specific icons from a single source image. iOS icons use rounded corners automatically. Android adaptive icons use the foreground/background layers."
      },
      {
            "question": "What file format should my source image be?",
            "answer": "SVG is preferred as it's resolution-independent, giving the sharpest results at all sizes. If using PNG, provide at least 1024×1024 pixels for best downscaling quality."
      }

    ],},
  {
    id: "299",
    name: "Bulk Markdown to PDF/HTML",
    slug: "bulk-markdown-to-pdf-html",
    category: "Converter",
    description: "Convert 100+ Markdown files into beautifully styled PDFs or static HTML with custom CSS, auto-generated table of contents, and corporate templates. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Markdown to PDF/HTML — Convert 100+ Markdown files into beautifully styled PDFs or static HTML with custom CSS, auto-generated table of contents, and corporate templates. ',
    dependencies: "marked.js, jsPDF, jszip",
  
    instructions: [

      {
            "title": "1. Upload Markdown Files",
            "desc": "Select multiple .md files. They will be converted to styled PDF or HTML."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select PDF for printable documents or HTML for web publishing. Apply custom CSS if needed."
      },
      {
            "title": "3. Download Converted Files",
            "desc": "All converted files are saved in a ZIP archive. PDFs include auto-generated table of contents."
      }

    ],
    faqs: [

      {
            "question": "What Markdown features are supported?",
            "answer": "Full GFM (GitHub Flavored Markdown) support including headings, lists, tables, code blocks with syntax highlighting, images, links, blockquotes, and inline formatting."
      },
      {
            "question": "Can I apply custom styling?",
            "answer": "Yes, you can provide custom CSS to style the output. For HTML output, your CSS is embedded directly. For PDF, the CSS is applied during conversion."
      },
      {
            "question": "Are images in Markdown files preserved?",
            "answer": "External images (URLs) are preserved. Local image references (file:// paths) are converted to embedded base64 data for standalone documents."
      }

    ],},
  {
    id: "300",
    name: "Bulk Font Subsetter",
    slug: "bulk-font-subsetter",
    category: "Developer",
    description: "Convert TTF/OTF fonts to WOFF2 and subset to only used characters (Latin, Cyrillic, etc.). Generates @font-face CSS blocks. Cuts font files from MBs to KBs. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Font Subsetter — Convert TTF/OTF fonts to WOFF2 and subset to only used characters (Latin, Cyrillic, etc.). Generates @font-face CSS blocks. Cuts font files from MBs to KBs. ',
    dependencies: "opentype.js, jszip",
  
    instructions: [

      {
            "title": "1. Upload Fonts",
            "desc": "Select TTF or OTF font files to convert and subset."
      },
      {
            "title": "2. Enter Characters",
            "desc": "Enter the specific characters your project uses. Only these characters will be kept in the subset."
      },
      {
            "title": "3. Download Subset Fonts",
            "desc": "Subset fonts are saved as WOFF2 (default) or TTF. File sizes are dramatically reduced."
      }

    ],
    faqs: [

      {
            "question": "How much can font subsetting reduce file size?",
            "answer": "A full font file (50-200KB) can be reduced to 2-15KB when subset to only the characters used on your website. This is one of the most impactful optimizations for web performance."
      },
      {
            "question": "What format are the output fonts?",
            "answer": "Default output format is WOFF2, the most efficient web font format. You can also choose TTF for desktop use and WOFF for legacy browser support."
      },
      {
            "question": "Can I subset multiple fonts at once?",
            "answer": "Yes, upload multiple font files and enter the character set once. All fonts are subset to the same character set, perfect for font families."
      }

    ],},
  {
    id: "301",
    name: "Bulk Subtitle Time-Shifter",
    slug: "bulk-subtitle-time-shifter",
    category: "Video",
    description: "Apply global time offset (+/- seconds) to a whole season of SRT/VTT files at once. Localization agencies use it to realign and translate subtitle batches. No signup or account required.",
    seoDescription: 'Free online Bulk Subtitle Time-Shifter — Apply global time offset (+/- seconds) to a whole season of SRT/VTT files at once. Localization agencies use it to realign and translate subtitle batches. ',
    dependencies: "Vanilla JS, jszip",
  
    instructions: [

      {
            "title": "1. Upload Subtitle Files",
            "desc": "Select multiple SRT or VTT subtitle files to adjust timing."
      },
      {
            "title": "2. Set Time Offset",
            "desc": "Enter the offset in seconds (positive to delay, negative to advance). Supports milliseconds for fine adjustment."
      },
      {
            "title": "3. Download Adjusted Subtitles",
            "desc": "All adjusted subtitle files are saved in a ZIP archive. Original formatting is preserved."
      }

    ],
    faqs: [

      {
            "question": "Why do subtitles need time shifting?",
            "answer": "Subtitles often go out of sync due to frame rate differences, video edits (added/removed scenes), or different release versions of the same content."
      },
      {
            "question": "Can I shift different subtitles by different amounts?",
            "answer": "The current bulk mode applies the same offset to all uploaded files. For different offsets, process each group separately."
      },
      {
            "question": "What subtitle formats are supported?",
            "answer": "SRT (SubRip) and VTT (WebVTT) formats are supported. Both use standard timecode format (HH:MM:SS,mmm) that can be precisely adjusted."
      }

    ],},
  {
    id: "302",
    name: "Bulk Regex Extractor & Replacer",
    slug: "bulk-regex-extractor-replacer",
    category: "Developer",
    description: "Scan thousands of log files or codebase files for regex patterns (IPs, API keys, URLs) and extract or replace them. Visual builder for non-coders with live preview. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Regex Extractor & Replacer — Scan thousands of log files or codebase files for regex patterns (IPs, API keys, URLs) and extract or replace them. Visual builder for non-coders with live preview. ',
    dependencies: "Vanilla JS, jszip",
  
    instructions: [

      {
            "title": "1. Upload Files",
            "desc": "Select text, code, or log files to search or replace content using regular expressions."
      },
      {
            "title": "2. Enter Pattern",
            "desc": "Enter your regex pattern. Choose between extraction (find all matches) or replacement (find and replace)."
      },
      {
            "title": "3. Download Results",
            "desc": "Extracted matches are saved to a single file. Replaced files are saved individually in a ZIP archive."
      }

    ],
    faqs: [

      {
            "question": "What regex syntax is supported?",
            "answer": "JavaScript RegExp syntax is supported including flags (g, i, m, s, u). Features include capture groups, lookahead/lookbehind, character classes, and quantifiers."
      },
      {
            "question": "Can I preview matches before processing?",
            "answer": "Yes, the tool shows a preview of matched lines before you confirm the operation. This helps verify your regex pattern is correct."
      },
      {
            "question": "What file types can I process?",
            "answer": "Plain text files (.txt, .md, .csv, .log, .json, .xml, .yaml), code files (.js, .ts, .py, .java, .html, .css, .sql), and any other text-based format."
      }

    ],},
  {
    id: "303",
    name: "Bulk Image to Text (OCR)",
    slug: "bulk-image-to-text-ocr",
    category: "Image",
    description: "Extract text from batches of scanned JPGs, PNGs, or PDF pages and export as a single formatted Word doc. Students and digitizers use it instead of typing 40 pages manually. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Bulk Image to Text (OCR) — Extract text from batches of scanned JPGs, PNGs, or PDF pages and export as a single formatted Word doc. Students and digitizers use it instead of typing 40 pages manually. ',
    dependencies: "Tesseract.js, jszip",
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select scanned images, photos of documents, or PDF pages containing text."
      },
      {
            "title": "2. Choose Language",
            "desc": "Select the document language for optimal OCR accuracy. Multiple languages can be selected."
      },
      {
            "title": "3. Export Results",
            "desc": "Extracted text is compiled into a single document. Download as TXT, DOCX, or PDF."
      }

    ],
    faqs: [

      {
            "question": "What languages does OCR support?",
            "answer": "Tesseract.js supports 100+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and more. Multi-language documents can process multiple languages simultaneously."
      },
      {
            "question": "How accurate is browser-based OCR?",
            "answer": "Accuracy depends on image quality, resolution, and text clarity. High-resolution scans of printed documents achieve 95%+ accuracy. Handwritten text has lower accuracy (50-80%)."
      },
      {
            "question": "Can I extract text from PDFs directly?",
            "answer": "Yes, PDF pages are converted to images for OCR processing. For best results, use high-resolution PDFs. Digitally-created PDFs (not scanned) should use PDF text extraction instead of OCR."
      }

    ],},
  {
    id: "304",
    name: "Bulk E-Book Converter",
    slug: "bulk-ebook-converter",
    category: "Converter",
    description: "Convert your entire digital library between EPUB, MOBI, and PDF in one batch. Note: This is a basic client-side conversion — complex EPUB/MOBI layouts may not render perfectly. For professional results, use a dedicated e-book tool like Calibre.",
    seoDescription: 'Free online Bulk E-Book Converter — Convert your entire digital library between EPUB, MOBI, and PDF in one batch. Basic client-side conversion — complex layouts may not render perfectly. ',
    dependencies: "EPUB.js, jszip",
  
    instructions: [

      {
            "title": "1. Upload E-Books",
            "desc": "Select EPUB, MOBI, or PDF e-books. Multiple files can be uploaded at once."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select EPUB (most readers), MOBI (Kindle), or PDF (universal)."
      },
      {
            "title": "3. Download Converted Books",
            "desc": "Converted e-books are saved in a ZIP archive. Metadata and cover images are preserved."
      }

    ],
    faqs: [

      {
            "question": "Does conversion preserve bookmarks and metadata?",
            "answer": "Yes, the tool preserves metadata (title, author, ISBN), cover images, table of contents, and internal bookmarks whenever the output format supports them."
      },
      {
            "question": "Can I convert DRM-protected e-books?",
            "answer": "No, DRM-protected e-books from Kindle Store, Apple Books, or Google Play cannot be converted. Remove DRM first using authorized tools."
      },
      {
            "question": "What's the difference between EPUB and MOBI?",
            "answer": "EPUB is the industry standard format supported by most readers (Apple Books, Google Play, Kobo). MOBI is Amazon's older format for older Kindles. Newer Kindles support both MOBI and EPUB. EPUB is recommended for broad compatibility."
      }

    ],},
  {
    id: "306",
    name: "Bulk HEIC to JPG",
    slug: "bulk-heic-to-jpg",
    category: "Image",
    description: "Convert hundreds of iPhone HEIC photos to universal JPGs in one batch — fully client-side so your personal vacation photos never leave your machine. Windows users finally view their iPhone library. No signup or account required.",
    seoDescription: 'Free online Bulk HEIC to JPG — Convert hundreds of iPhone HEIC photos to universal JPGs in one batch — fully client-side so your personal vacation photos never leave your machine. Windows users finally view their iPhone library. ',
    dependencies: "libheif WASM, jszip",
  
    instructions: [

      {
            "title": "1. Upload HEIC Photos",
            "desc": "Select HEIC images from your iPhone or iPad. The tool shows thumbnails of detected files."
      },
      {
            "title": "2. Configure Output",
            "desc": "Choose JPEG output quality (higher = better quality, larger file)."
      },
      {
            "title": "3. Download JPGs",
            "desc": "All converted JPG images are saved in a ZIP archive. File names are preserved from the original HEIC files."
      }

    ],
    faqs: [

      {
            "question": "Why convert HEIC to JPG?",
            "answer": "HEIC/HEIF is Apple's default photo format on iOS. While efficient, it's not supported by Windows, many web platforms, social media, or older software. JPG is the universal image format."
      },
      {
            "question": "Do I lose quality converting HEIC to JPG?",
            "answer": "HEIC uses more advanced compression than JPEG. There is some quality loss during conversion, but at high quality settings (90%+), the difference is imperceptible to most users."
      },
      {
            "question": "How many HEIC photos can I convert at once?",
            "answer": "Free users can convert up to 20 photos. Pro users can convert unlimited photos. Conversion uses libheif WASM in your browser."
      }

    ],},
  {
    id: "307",
    name: "Tax Saving Calculator",
    slug: "tax-saving-calculator",
    category: "indian-utilities",
    description: 'Compares Old vs New tax regime liability with Section 80C, 80D, NPS, HRA, and home loan deductions. Generates a personalized tax-saving report for Indian salaried employees.',
    seoDescription: 'Free online Indian Tax Saving Calculator — Compare Old vs New tax regime liability with 80C, 80D, NPS, HRA, and home loan deductions. Generates personalized tax-saving report for Indian salaried employees.',
    dependencies: "None",
    instructions: [
    { title: "1. Enter Your Salary Details", desc: "Input your annual gross salary, HRA component, and any other income sources. The calculator works for both salaried employees and self-employed individuals under the Indian tax system." },
    { title: "2. Add Your Investments and Deductions", desc: "Enter amounts under Section 80C (PPF, ELSS, life insurance), 80D (health insurance), 80CCD(1B) NPS, HRA rent paid, and home loan interest under Section 24(b). The tool tracks 80C's Rs. 1.5 lakh ceiling." },
    { title: "3. Compare Regimes and Save Report", desc: "Instantly compare your total tax liability under the Old tax regime (with deductions) vs the New tax regime (lower rates, no deductions). Download a personalized tax-saving report as a PDF." },
  ],
    faqs: [
    { question: "What is the difference between Old and New tax regimes?", answer: "The Old tax regime has higher tax rates but allows deductions (80C up to Rs. 1.5L, 80D, HRA, home loan). The New tax regime has lower rates but no deductions except for employer NPS contribution (80CCD(2)). The best choice depends on your investment and deduction amounts." },
    { question: "What deductions are covered in the comparison?", answer: "The calculator covers Section 80C (PPF, ELSS, LIC, EPF, tuition fees), Section 80D (health insurance premiums), Section 80CCD(1B) NPS (additional Rs. 50,000), HRA exemption, home loan interest under Section 24(b), and standard deduction." },
    { question: "Which regime is better for me?", answer: "Generally, if your total deductions exceed Rs. 3-4 lakh (80C plus HRA plus home loan plus 80D), the Old regime likely saves more tax. For those with minimal investments, the New regime with lower rates may be better. The calculator shows both side-by-side." },
    { question: "Can I use this for FY 2025-26 calculations?", answer: "Yes. The calculator uses the latest tax slabs and rebate limits under Section 87A for the current financial year. Tax slabs and limits are updated as per the latest Union Budget announcements." },
  ]
  },
  {
    id: "308",
    name: "GSTIN Lookup",
    slug: "gstin-lookup",
    category: "indian-utilities",
    description: 'Verifies any GSTIN (Goods and Services Tax Identification Number) instantly — returns legal name, trade name, address, registration date, and filing status. Supports bulk CSV export for accounts teams.',
    seoDescription: 'Free online GSTIN Lookup — Verify any GSTIN instantly. Get legal name, trade name, address, registration date, constitution, and filing status. Bulk CSV verification for accounts and vendor onboarding.',
    dependencies: "None",
    instructions: [
    { title: "1. Enter a GSTIN to Look Up", desc: "Type a valid 15-character GSTIN (format: 2-digit state code plus 10-digit PAN plus 1 entity code plus 1 check digit plus 1 default Z). The tool validates the format and queries the GST database." },
    { title: "2. View Complete GST Details", desc: "See the legal name, trade name (if applicable), registered address, date of registration, business constitution (proprietorship, partnership, company), GSTIN status (active/cancelled), and filing compliance status." },
    { title: "3. Export for Vendor Verification", desc: "Export individual or bulk lookups as CSV for vendor verification workflows. This is especially useful for accounts payable and vendor onboarding teams validating multiple GSTINs." },
  ],
    faqs: [
    { question: "What information does a GSTIN contain?", answer: "A GSTIN is 15 characters: first 2 digits = state code (01-37), next 10 = PAN of the business, 13th character = entity code (number of registrations under same PAN in same state), 14th = check digit, 15th = Z (default). Example: 27AABCS1234A1Z5." },
    { question: "Can I verify GSTINs in bulk?", answer: "Yes. The tool supports bulk verification — enter multiple GSTINs or upload a CSV file. The results can be exported as CSV with columns for legal name, address, status, and filing details." },
    { question: "Is the data from the official GST portal?", answer: "The tool queries the GST common portal database to retrieve registered taxpayer details. Data availability depends on the GST portal's API response and the taxpayer's registration status." },
    { question: "Can I use this for vendor onboarding?", answer: "Yes. GSTIN verification is a critical step in vendor onboarding. The bulk CSV export includes all fields needed for vendor master records — legal name, address, constitution, registration date, and compliance status." },
  ]
  },
  {
    id: "309",
    name: "Seller Profit Calculator",
    slug: "seller-profit-calculator",
    category: "indian-utilities",
    description: 'Calculates exact profit after marketplace commissions (Meesho, Amazon, Flipkart), GST, shipping costs, returns, and packaging. Compare platform profitability side-by-side for Indian e-commerce sellers.',
    seoDescription: 'Free online Seller Profit Calculator for India — Calculate exact profit after Meesho, Amazon, Flipkart commissions, GST, shipping, returns, and packaging. Compare platforms side-by-side for Indian e-commerce sellers.',
    dependencies: "None",
    instructions: [
    { title: "1. Enter Product Cost and Pricing", desc: "Enter your product cost (procurement or manufacturing price), the selling price on the marketplace, and the category commission rate applicable to your product category." },
    { title: "2. Add Marketplace-Specific Fees", desc: "Input the marketplace commission percentage (varies by platform and category), fixed fee per order, payment processing fee, shipping cost, and GST on seller fees. Each marketplace has a different fee structure." },
    { title: "3. Compare and Optimize", desc: "View your net profit after all deductions for each platform. Compare Meesho vs Amazon vs Flipkart side-by-side. Adjust pricing or choose the best platform for each product to maximize margins." },
  ],
    faqs: [
    { question: "What costs does the calculator include?", answer: "It includes product cost, GST input tax credit, marketplace commission (category-specific), fixed fees, payment gateway fees, shipping costs, collection/packaging charges, and return/wastage estimates." },
    { question: "How do marketplace commissions vary by category?", answer: "Commissions vary significantly across platforms and categories. For example, Amazon charges 5-25 percent depending on category (electronics ~5 percent, apparel ~15 percent, beauty ~20 percent). Flipkart has similar category-based tiers. Meesho charges 0-20 percent depending on category and seller tier." },
    { question: "Can I compare multiple platforms in one calculation?", answer: "Yes. Enter the same product details once and set different commission structures for each platform. The calculator shows a side-by-side comparison of your net profit on Meesho, Amazon, and Flipkart." },
    { question: "Is this specific to Indian e-commerce taxes?", answer: "Yes. The calculator accounts for Indian GST on seller fees (18 percent on platform fees), TDS under Section 194-O (1 percent on sales), and the GST input tax credit mechanism specific to the Indian tax system." },
  ]
  },
  {
    id: "310",
    name: "Complaint Letter Generator",
    slug: "complaint-letter-generator",
    category: "indian-utilities",
    description: 'Generates legally correct formal complaint letters citing Indian consumer law — Consumer Protection Act 2019, RERA, TRAI, or RBI regulations. AI-powered with your API key.',
    seoDescription: 'Free online Complaint Letter Generator India — Create formal complaint letters citing Consumer Protection Act 2019, RERA, TRAI, RBI. Draft legal notices for telecom, banking, real estate, and e-commerce issues.',
    dependencies: "AI API",
    instructions: [
    { title: "1. Select Complaint Type and Enter Details", desc: "Choose the category of your complaint — telecom (TRAI), banking/RBI, real estate (RERA), e-commerce (Consumer Act), insurance (IRDAI), or general consumer complaint. Enter your name, address, and contact details." },
    { title: "2. Describe the Issue in Detail", desc: "Provide a detailed description of the problem — dates, amounts, communication history, and any reference numbers (ticket IDs, complaint numbers, FIR details). The more specific you are, the stronger the letter." },
    { title: "3. Generate and Download the Letter", desc: "The tool drafts a formal complaint letter citing the applicable law and sections. Review the draft, edit if needed, and download as PDF. The letter includes the addressee's designation, subject line, and a clear prayer/relief section." },
  ],
    faqs: [
    { question: "Which consumer laws are cited in the letters?", answer: "The generator cites the relevant law based on your complaint type: Consumer Protection Act 2019 (e-commerce, product defects, services), TRAI Act (telecom, broadband issues), RBI guidelines (banking, credit card, UPI disputes), RERA (real estate delays, property issues), and IRDAI (insurance claim delays)." },
    { question: "Do I need an API key for this tool?", answer: "Yes. The complaint letter generation uses AI models to draft legally-appropriate content. You will need to provide your own AI API key (OpenAI, Anthropic, or OpenRouter) in the tool settings. Your API key is stored locally in your browser." },
    { question: "Is this a legally binding document?", answer: "A well-drafted complaint letter serves as a formal record of your grievance and is admissible in consumer forums and other legal proceedings. However, for critical legal matters, consider having the letter reviewed by a lawyer before sending." },
    { question: "Where do I send the generated letter?", answer: "The letter includes the proper addressee. For consumer complaints, send via registered post with acknowledgment due to the company's grievance officer. For escalated complaints, approach the relevant consumer forum, TRAI ombudsman, RBI banking ombudsman, or RERA authority." },
  ]
  },
  {
    id: "auto-10030",
    name: "Brand Color Palette Generator",
    slug: "brand-color-palette-generator",
    category: "Branding",
    description: "AI-powered brand color palette generator. Describe your brand and get a complete 6-color palette with usage suggestions for designers.",
    seoDescription: "Free online Brand Color Palette Generator — AI-powered brand color palette generator. Describe your brand and receive a complete 6-color palette with hex codes and designer usage notes. ",
    dependencies: "None",
  },
  {
    id: "auto-10031",
    name: "Brand Kit",
    slug: "brand-kit",
    category: "Branding",
    description: "A local-first brand asset manager for colors and fonts. No signup or account required.",
    seoDescription: "Free online Brand Kit — A local-first brand asset manager for colors and fonts. ",
    dependencies: "None",
  },
  {
    id: "auto-10043",
    name: "To-Do List",
    slug: "to-do-list",
    category: "Productivity",
    description: "A persistent task manager with priorities and filters. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: "Free online To-Do List — A persistent task manager with priorities and filters. ",
    dependencies: "None",
    instructions: [
      { title: "1. Add a Task", desc: "Type your task into the input field and press Enter or click the add button. Each task can include a priority level to help you sort what matters most." },
      { title: "2. Organize with Priorities and Filters", desc: "Assign priority levels (high, medium, low) to each task. Use the filter options to view all tasks, only high-priority items, or focus on incomplete work." },
      { title: "3. Track and Complete", desc: "Check off tasks as you finish them. Your task list persists in your browser's local storage so your data remains available even after closing and reopening the page." },
    ],
    faqs: [
      { question: "Is my task list saved between sessions?", answer: "Yes. Your tasks are stored locally in your browser's localStorage. They persist across page refreshes and browser sessions. Clearing your browser data will remove saved tasks." },
      { question: "Can I delete completed tasks?", answer: "You can clear completed tasks with one click to declutter your list. Completed tasks are visually marked but remain visible until you choose to clear them." },
      { question: "Does this tool work offline?", answer: "Yes. The To-Do List is a fully client-side application. Everything runs locally in your browser with no server calls required after the initial page load." },
    ]
  },
  {
    id: "auto-10050",
    name: "Domain Availability Checker",
    slug: "domain-availability-checker",
    category: "Developer",
    description: "Check if a domain name is available across major TLDs. Instantly verify domain availability, lookup registration status, and get suggestions for alternative names.",
    seoDescription: "Free online Domain Availability Checker — Check if a domain name is available across major TLDs. Instantly verify domain availability, lookup registration status, and get suggestions for alternative names. No signup required.",
    dependencies: "DNS API",
  },
  {
    id: "auto-10051",
    name: "Pronunciation Tool",
    slug: "pronunciation-tool",
    category: "Text",
    description: 'Hear the correct pronunciation of any word or phrase in multiple English accents using browser-based speech synthesis. Adjustable playback speed with clear audio output.',
    seoDescription: 'Free online Pronunciation Tool — Hear correct pronunciation of words and phrases in multiple English accents using browser speech synthesis. Adjustable speed and clear audio.',
    dependencies: "Web Speech API",
    instructions: [
    { title: "1. Enter Your Word or Phrase", desc: "Type the word or phrase you want to hear pronounced. The tool works with any English text — from single words to full sentences." },
    { title: "2. Choose an Accent", desc: "Select from available English accents including US English, UK English, Australian English, Indian English, and others supported by your browser's speech synthesis engine." },
    { title: "3. Listen and Adjust", desc: "Click the play button to hear the pronunciation. Use the speed slider to slow down or speed up the audio — slow mode helps identify individual sounds in unfamiliar words." },
  ],
    faqs: [
    { question: "What accents are available?", answer: "Available accents depend on your browser and operating system. Most modern browsers support US English, UK English, Australian English, Indian English, and Canadian English. For the widest accent selection, use Chrome on desktop." },
    { question: "How accurate is the pronunciation?", answer: "The tool uses your browser's built-in speech synthesis (Text-to-Speech) engine. Pronunciation accuracy is excellent for common words and standard English. For specialized terminology, proper names, or uncommon words, accuracy may vary." },
    { question: "Can I slow down the pronunciation?", answer: "Yes. The speed slider lets you adjust playback from 0.5x (half speed, good for learning) to 2x (double speed). Slower speeds help distinguish individual sounds and syllables in difficult words." },
    { question: "Does this work offline?", answer: "Yes. Most browsers cache speech synthesis voices after initial download. After the first use, pronunciation playback typically works offline without an internet connection." },
  ]
  },
  {
    id: "video-converter-1",
    name: "Video Format Converter",
    slug: "video-converter",
    category: "Video",
    description: 'Convert between MKV, MP4, MOV, WebM, and AVI video formats. Pick any input and output format from the dropdown — your files never leave your device.',
    seoDescription: 'Free online Video Format Converter — Convert between MKV, MP4, MOV, WebM, and AVI video formats. Pick any input and output format. ',
    dependencies: "FFmpeg",
    instructions: [
    { title: "1. Upload Your Video", desc: "Choose the video file to convert. Supports MP4, MOV, AVI, WebM, MKV, and more input formats." },
    { title: "2. Select Output Format", desc: "Pick your desired output format from the available options." },
    { title: "3. Download Converted Video", desc: "Download your video in the new format. Quality and metadata are preserved during conversion." },
  ],
    faqs: [
    { question: "What formats can I convert?", answer: "Input: MP4, MOV, AVI, WebM, MKV, FLV. Output: MP4, MOV, AVI, WebM, MKV." },
    { question: "Does conversion affect quality?", answer: "Converting between similar formats preserves quality well. Converting to older codecs may reduce quality." },
    { question: "Is my video uploaded?", answer: "No. All conversion happens in your browser using FFmpeg WASM. Files never leave your device." },
  ],

    showInCategory: false,
  },
  {
    id: "audio-converter-1",
    name: "Audio Format Converter",
    slug: "audio-converter",
    category: "Audio",
    description: 'Convert between MP3, WAV, FLAC, OGG, M4A, and AAC audio formats. Pick any input and output format — your files never leave your device.',
    seoDescription: 'Free online Audio Format Converter — Convert between MP3, WAV, FLAC, OGG, M4A, and AAC audio formats. Pick any input and output format. ',
    dependencies: "FFmpeg",
    showInCategory: true,
  },
  {
    id: "image-format-converter-1",
    name: "Image Format Converter",
    slug: "image-format-converter",
    category: "Image",
    description: 'Convert between PNG, JPG, WebP, HEIC, and AVIF image formats. Pick any input and output format — your files never leave your device.',
    seoDescription: 'Free online Image Format Converter — Convert between PNG, JPG, WebP, HEIC, and AVIF image formats. Pick any input and output format. ',
    dependencies: "Sharp / Browser Canvas",
    showInCategory: true,
  },
  {
    id: "data-converter-1",
    name: "Data Converter",
    slug: "data-converter",
    category: "Converter",
    description: 'Convert between JSON, CSV, XML, YAML, and Excel data formats. Pick any input and output format — your files never leave your device.',
    seoDescription: 'Free online Data Converter — Convert between JSON, CSV, XML, YAML, and Excel data formats. Pick any input and output format. ',
    dependencies: "PapaParse / SheetJS / js-yaml",
    showInCategory: true,
  },
  {
    id: "document-converter-1",
    name: "Document Converter",
    slug: "document-converter",
    category: "Converter",
    description: 'Convert between PDF, Word, Excel, PowerPoint, JPG, EPUB, and HEIC document formats. Pick any input and output format — your files never leave your device.',
    seoDescription: 'Free online Document Converter — Convert between PDF, Word, Excel, PowerPoint, JPG, EPUB, and HEIC document formats. Pick any input and output format. ',
    dependencies: "pdf-lib / pdf2docx / SheetJS / PptxGenJS",
    showInCategory: true,
  },
  {
    id: "311",
    name: "PDF to Markdown",
    slug: "pdf-to-markdown",
    category: "PDF",
    description: 'Extracts all text content from PDF files and converts it to clean Markdown format with proper headings, lists, and structure. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF to Markdown — Extracts all text content from PDF files and converts it to clean Markdown format with proper headings, lists, and structure. ',
    dependencies: "pdfjs-dist",
    showInCategory: true,
  },
  {
    id: "312",
    name: "Extract Pages from PDF",
    slug: "extract-pages-from-pdf",
    category: "PDF",
    description: 'Extract specific pages from a PDF document to create a new PDF. Select individual pages or page ranges like 1-3,5,7-9. Keeps original formatting intact.',
    seoDescription: 'Free online Extract Pages from PDF — Extract specific pages from a PDF document to create a new PDF. Select individual pages or page ranges. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "313",
    name: "Scan to PDF",
    slug: "scan-to-pdf",
    category: "PDF",
    description: 'Turn photos and scanned images into a professional PDF document. Upload multiple images, reorder, and combine into a single PDF. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Scan to PDF — Turn photos and scanned images into a professional PDF document. Upload multiple images, reorder, and combine into a single PDF. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "314",
    name: "Repair PDF",
    slug: "repair-pdf",
    category: "PDF",
    description: 'Attempts to repair corrupted or damaged PDF files by rebuilding the internal structure. Recovers readable content from broken PDFs and re-saves them as valid PDF documents.',
    seoDescription: 'Free online Repair PDF — Attempts to repair corrupted or damaged PDF files by rebuilding the internal structure. Recovers readable content from broken PDFs. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "315",
    name: "PDF to PDF/A",
    slug: "pdf-to-pdfa",
    category: "PDF",
    description: 'Converts standard PDF files to PDF/A archival format with proper metadata, embedded fonts, and color profiles. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF to PDF/A — Converts standard PDF files to PDF/A archival format with proper metadata, embedded fonts, and color profiles. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "316",
    name: "Crop PDF",
    slug: "crop-pdf",
    category: "PDF",
    description: 'Crop PDF pages to custom dimensions or preset sizes. Remove unwanted margins, white space, or sections from your PDF documents. Supports all standard and custom crop areas.',
    seoDescription: 'Free online Crop PDF — Crop PDF pages to custom dimensions or preset sizes. Remove unwanted margins, white space, or sections. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "317",
    name: "Redact PDF",
    slug: "redact-pdf",
    category: "PDF",
    description: 'Permanently remove sensitive information from PDF files. Black out text, images, or areas with permanent redaction. Perfect for legal documents, contracts, and personal data protection.',
    seoDescription: 'Free online Redact PDF — Permanently remove sensitive information from PDF files. Black out text, images, or areas with permanent redaction. ',
    dependencies: "pdf-lib, pdfjs-dist",
    showInCategory: true,
  },
  {
    id: "318",
    name: "Translate PDF",
    slug: "translate-pdf",
    category: "PDF",
    description: 'Extract and translate PDF content between 50+ languages. Preserves document structure while converting text to your chosen language. Powered by browser-based and free translation APIs.',
    seoDescription: 'Free online Translate PDF — Extract and translate PDF content between 50+ languages. Preserves document structure while converting text. ',
    dependencies: "pdfjs-dist",
    showInCategory: true,
  },
  {
    id: "319",
    name: "Flatten PDF",
    slug: "flatten-pdf",
    category: "PDF",
    description: 'Flattens PDF files by merging all layers, removing form fields, and converting interactive elements into static content. Perfect for sharing finalized documents and reducing file complexity.',
    seoDescription: 'Free online Flatten PDF — Flattens PDF files by merging all layers, removing form fields, and converting interactive elements into static content. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "320",
    name: "Grayscale PDF",
    slug: "grayscale-pdf",
    category: "PDF",
    description: 'Convert any PDF to grayscale/black and white. Perfect for printing, reducing ink usage, creating archive copies, or giving documents a professional monochrome look.',
    seoDescription: 'Free online Grayscale PDF — Convert any PDF to grayscale/black and white. Perfect for printing and reducing ink usage. ',
    dependencies: "pdfjs-dist, pdf-lib",
    showInCategory: true,
  },
  {
    id: "321",
    name: "Whiteout PDF",
    slug: "whiteout-pdf",
    category: "PDF",
    description: 'Cover sensitive or unwanted content in PDF files with white rectangles. Select entire pages or custom areas to hide text, images, or sections before sharing or printing.',
    seoDescription: 'Free online Whiteout PDF — Cover sensitive content in PDF files with white rectangles. Select entire pages or custom areas to hide text or images. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "322",
    name: "Resize PDF Pages",
    slug: "resize-pdf-pages",
    category: "PDF",
    description: 'Change the page size of your PDF documents. Choose from standard sizes (A4, Letter, Legal, A3) or set custom dimensions. Automatically adds white margins when enlarging.',
    seoDescription: 'Free online Resize PDF Pages — Change page size of your PDF documents. Choose A4, Letter, Legal, A3 or custom dimensions. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "323",
    name: "Add Text to PDF",
    slug: "add-text-to-pdf",
    category: "PDF",
    description: 'Add custom text labels, annotations, and captions directly onto PDF pages. Choose font size, color, and position. Perfect for signing, marking up, or adding notes to documents.',
    seoDescription: 'Free online Add Text to PDF — Add custom text labels, annotations, and captions directly onto PDF pages. Choose font size, color, and position. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "324",
    name: "Add Image to PDF",
    slug: "add-image-to-pdf",
    category: "PDF",
    description: 'Insert images (PNG, JPG) onto any page of your PDF document. Position and resize images anywhere on the page. Perfect for adding signatures, logos, or photos to documents.',
    seoDescription: 'Free online Add Image to PDF — Insert images onto any page of your PDF. Position and resize PNG/JPG images anywhere. Perfect for signatures, logos, or photos. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "325",
    name: "Header and Footer",
    slug: "header-footer-pdf",
    category: "PDF",
    description: 'Add professional headers and footers to every page of your PDF. Supports text, page numbers ({{page}}/{{total}}), dates, and custom alignment. Perfect for reports and official documents.',
    seoDescription: 'Free online PDF Header and Footer — Add professional headers and footers to every page. Supports page numbers, dates, and custom alignment. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "326",
    name: "N-up PDF",
    slug: "nup-pdf",
    category: "PDF",
    description: 'Combine multiple PDF pages onto a single sheet with N-up layout. Choose 2-up, 4-up, 6-up, 9-up, or booklet mode. Perfect for printing multiple slides or pages on one sheet.',
    seoDescription: 'Free online N-up PDF — Combine multiple PDF pages onto a single sheet. Choose 2-up, 4-up, 6-up, 9-up, or booklet layout. ',
    dependencies: "pdfjs-dist, pdf-lib",
    showInCategory: true,
  },
  {
    id: "327",
    name: "PDF Annotator",
    slug: "pdf-annotator",
    category: "PDF",
    description: 'Add visual annotations like highlights, underlines, strikeouts, and shapes to your PDF pages. Perfect for reviewing documents, marking up text, and adding visual emphasis.',
    seoDescription: 'Free online PDF Annotator — Add highlights, underlines, strikeouts, rectangles, circles to PDF pages. Review and markup documents visually. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "328",
    name: "Deskew PDF",
    slug: "deskew-pdf",
    category: "PDF",
    description: 'Automatically detect and straighten crooked scanned PDF pages. Uses advanced image analysis to find the correct rotation angle. Perfect for fixing skewed scanned documents.',
    seoDescription: 'Free online Deskew PDF — Automatically straighten crooked scanned PDF pages. Fix skewed documents with auto-detection or manual rotation. ',
    dependencies: "pdfjs-dist, pdf-lib",
    showInCategory: true,
  },
  {
    id: "329",
    name: "URL to PDF",
    slug: "url-to-pdf",
    category: "PDF",
    description: 'Convert any webpage to PDF in your browser. Save articles, receipts, and web pages as PDF documents. No signup or account required.',
    seoDescription: 'Free online URL to PDF — Convert any webpage to PDF in your browser. Save articles, receipts, and web pages as PDF documents. ',
    dependencies: "none",
    showInCategory: true,
  },
  {
    id: "330",
    name: "Markdown to PDF",
    slug: "markdown-to-pdf",
    category: "PDF",
    description: 'Convert Markdown to beautifully formatted PDF. Supports headings, bold, italic, code blocks, and lists. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Markdown to PDF — Convert Markdown to beautifully formatted PDF. Supports headings, bold, italic, code blocks, and lists. ',
    dependencies: "pdf-lib, marked",
    showInCategory: true,
  },
  {
    id: "331",
    name: "Bookmark PDF",
    slug: "bookmark-pdf",
    category: "PDF",
    description: 'Add a Table of Contents to your PDF documents. Organize pages with titled sections, create nested hierarchies, and navigate large documents with ease. Perfect for reports, ebooks, and manuals.',
    seoDescription: 'Free online Bookmark PDF — Add Table of Contents to your PDF documents. Organize pages with titled sections and nested hierarchies. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "332",
    name: "EML to PDF",
    slug: "eml-to-pdf",
    category: "PDF",
    description: 'Converts EML files to PDF format — email backup, archival, and forensic analysis to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online EML to PDF — Convert email files (.eml) to PDF documents. Preserves headers and body content in a clean, printable format. ',
    dependencies: "pdf-lib",
    showInCategory: true,
  },
  {
    id: "333",
    name: "RAW Image Converter",
    slug: "raw-image-converter",
    category: "Image",
    description: 'Convert RAW camera images (CR2, NEF, ARW, DNG) to universal formats. Works with most modern camera RAW formats directly in your browser. Perfect for photographers on the go.',
    seoDescription: 'Free online RAW Image Converter — Convert RAW camera images (CR2, NEF, ARW, DNG) to JPG, PNG, or WebP formats. ',
    dependencies: "none",
    showInCategory: true,
  },
  {
    id: "334",
    name: "PSD to JPG/PNG",
    slug: "psd-to-jpg-png",
    category: "Image",
    description: 'Convert PSD images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PSD to JPG/PNG — Convert Adobe Photoshop PSD files to universal image formats. No uploads, works entirely in your browser.',
    dependencies: "ag-psd",
    showInCategory: true,
  },
  {
    id: "335",
    name: "Collage Maker",
    slug: "collage-maker",
    category: "Image",
    description: 'Combine multiple photos into beautiful collages. Choose from grid, strip, or featured layouts. Perfect for creating photo montages, mood boards, and social media posts.',
    seoDescription: 'Free online Collage Maker — Combine multiple photos into beautiful collages. Grid, strip, and featured layouts. ',
    dependencies: "none",
    showInCategory: true,
  },
  {
    id: "336",
    name: "Chart Maker",
    slug: "chart-maker",
    category: "Image",
    description: 'Create stunning charts and graphs online for free. Supports bar, line, pie, doughnut, area charts with custom colors, labels, and titles. Perfect for presentations and reports.',
    seoDescription: 'Free online Chart Maker — Create stunning bar, line, pie, doughnut, and area charts with custom colors and labels. ',
    dependencies: "none",
    showInCategory: false,
  },
  {
    id: "337",
    name: "Background Changer",
    slug: "bg-changer",
    category: "Image",
    description: 'Replace image backgrounds with a solid color, gradient, or another image. Perfect for product photos, portraits, and creative projects. Quick and easy, right in your browser.',
    seoDescription: 'Free online Background Changer — Replace image backgrounds with solid color, gradient, or another image. Coming soon.',
    dependencies: "none",
    showInCategory: false,
  },
  {
    id: "338",
    name: "Unblur / Sharpen",
    slug: "unblur-sharpen",
    category: "Image",
    description: 'Fix blurry photos with smart sharpening or add artistic blur effects. Supports sharpen, Gaussian blur, and motion blur with adjustable intensity. ',
    seoDescription: 'Free online Unblur / Sharpen — Fix blurry photos or add artistic blur effects. Supports sharpen, Gaussian blur, and motion blur. ',
    dependencies: "none",
    showInCategory: true,
  },
  {
    id: "339",
    name: "GIF Editor",
    slug: "gif-editor",
    category: "Image",
    description: 'Edit animated GIFs — resize, change speed, reverse, optimize colors, and extract frames. Perfect for social media memes, product demos, and animated banners.',
    seoDescription: 'Free online GIF Editor — Resize, change speed, reverse, optimize colors, and extract frames from animated GIFs. ',
    dependencies: "@ffmpeg/ffmpeg, jszip",
    showInCategory: true,
  },
  {
    id: "340",
    name: "Video Speed Changer",
    slug: "video-speed-changer",
    category: "Video",
    description: 'Speed up or slow down any video. Adjust playback speed from 0.1x to 10x with audio pitch preservation. Perfect for creating time-lapses, slow-motion replays, and quick reviews.',
    seoDescription: 'Free online Video Speed Changer — Speed up or slow down videos from 0.1x to 10x with audio pitch preservation. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Video", desc: "Choose a video file to change its playback speed. Supports MP4 and other common formats." },
    { title: "2. Adjust Speed", desc: "Use the speed slider from 0.25x (slow motion) to 4x (fast forward). Audio pitch is preserved for natural sound." },
    { title: "3. Download Modified Video", desc: "Download the video with adjusted speed. Duration changes proportionally to the speed multiplier." },
  ],
    faqs: [
    { question: "What speed range is available?", answer: "0.25x to 4x in 0.05 increments." },
    { question: "Is audio pitch preserved?", answer: "Yes. Pitch is automatically adjusted for natural sound at different speeds." },
    { question: "Does speed affect quality?", answer: "No. Video quality and resolution are unaffected. Only playback rate changes." },
  ],

    showInCategory: true,
  },
  {
    id: "341",
    name: "Reverse Video",
    slug: "reverse-video",
    category: "Video",
    description: 'Play any video backwards. Reverse video, audio, or both independently. Create fun effects, hidden messages, and creative video edits with a single click.',
    seoDescription: 'Free online Reverse Video — Play any video backwards. Reverse video, audio, or both. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Video", desc: "Choose a video file to reverse. Both video frames and audio will play backward." },
    { title: "2. Preview", desc: "Preview the reversed video to ensure it looks correct before downloading." },
    { title: "3. Download", desc: "Download the complete reversed video with both video and audio reversed." },
  ],
    faqs: [
    { question: "Is audio also reversed?", answer: "Yes. Both video frames and audio track play backward." },
    { question: "What formats are supported?", answer: "MP4, MOV, and other common formats." },
    { question: "How long does it take?", answer: "A 1-minute video typically takes 30-60 seconds to reverse." },
  ],

    showInCategory: true,
  },
  {
    id: "342",
    name: "Mute Video",
    slug: "mute-video",
    category: "Video",
    description: 'Remove audio from a video completely, replace it with a new audio track, or adjust the volume. Perfect for creating silent videos, adding background music, or fixing audio levels.',
    seoDescription: 'Free online Mute Video — Remove, replace, or adjust audio volume in your videos. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Video", desc: "Select the video file you want to mute. All audio tracks will be removed." },
    { title: "2. Confirm", desc: "The tool strips all audio channels while keeping the video track intact." },
    { title: "3. Download Muted Video", desc: "Download the video without audio. Video quality and frame rate remain unchanged." },
  ],
    faqs: [
    { question: "What happens to the audio?", answer: "All audio channels are completely stripped from the video." },
    { question: "Can I mute only part?", answer: "This tool mutes the entire video. For selective muting, use a video editor." },
    { question: "Does muting affect quality?", answer: "No. Video quality, resolution, and frame rate remain unchanged." },
  ],

    showInCategory: true,
  },
  {
    id: "343",
    name: "Vocal Remover",
    slug: "vocal-remover",
    category: "Audio",
    description: 'Remove vocals from any song to create karaoke instrumentals. Extract acapella tracks or get both. Perfect for DJs, content creators, and karaoke enthusiasts.',
    seoDescription: 'Free online Vocal Remover — Remove vocals from songs to create karaoke tracks. Extract instrumentals or acapella. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "344",
    name: "Audio Merger",
    slug: "audio-merger",
    category: "Audio",
    description: 'Combine multiple audio files into one continuous track. Supports crossfade between songs and automatic volume normalization. Perfect for making mixtapes, podcasts, and audiobooks.',
    seoDescription: 'Free online Audio Merger — Combine multiple audio files into one track with crossfade and volume normalization. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "345",
    name: "Voice Recorder",
    slug: "voice-recorder",
    category: "Audio",
    description: 'Record audio directly in your browser using your microphone. Features real-time waveform visualization, pause/resume, and multiple export formats. No software installation needed.',
    seoDescription: 'Free online Voice Recorder — Record audio directly in your browser with waveform visualization. No installation needed. ',
    dependencies: "none",
    showInCategory: true,
  },
  {
    id: "346",
    name: "Noise Reducer",
    slug: "noise-reducer",
    category: "Audio",
    description: 'Reduce background noise from audio recordings. Choose from mild to extreme reduction or sample a noise profile for precision cleaning. Perfect for podcasts, calls, and field recordings.',
    seoDescription: 'Free online Audio Noise Reducer — Reduce background noise from recordings. Mild to extreme noise reduction. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "347",
    name: "Audio Equalizer",
    slug: "audio-equalizer",
    category: "Audio",
    description: 'Fine-tune your audio with a 10-band graphic equalizer. Boost bass, enhance vocals, or apply professional presets. Includes real-time frequency response visualization.',
    seoDescription: 'Free online Audio Equalizer — Fine-tune audio with 10-band graphic EQ. Boost bass, enhance vocals, apply presets. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "348",
    name: "Audio Compressor",
    slug: "audio-compressor",
    category: "Audio",
    description: 'Balance audio dynamics with professional compression controls. Perfect for podcasts, voice overs, and music production. Features threshold, ratio, attack, release, and makeup gain.',
    seoDescription: 'Free online Audio Compressor — Balance audio dynamics with threshold, ratio, attack, release, and makeup gain controls. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "349",
    name: "Waveform Generator",
    slug: "waveform-generator",
    category: "Audio",
    description: 'Generate beautiful audio waveform visualizations from any audio file. Choose from bar, line, filled, or circular styles. Perfect for podcast artwork, music videos, and social media.',
    seoDescription: 'Free online Audio Waveform Generator — Create beautiful waveform visualizations from audio. Bar, line, filled, or circular styles. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "350",
    name: "Fade In/Out",
    slug: "fade-in-out",
    category: "Audio",
    description: 'Apply smooth volume fades to your audio tracks. Supports fade in, fade out, or both with linear, logarithmic, exponential, and S-curve transitions. Perfect for podcast intros and outros.',
    seoDescription: 'Free online Audio Fade In/Out — Apply smooth volume fades with linear, log, exp, or S-curve transitions. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "351",
    name: "Video Stabilizer",
    slug: "video-stabilizer",
    category: "Video",
    description: 'Fix shaky handheld footage with advanced video stabilization. Two-pass analysis delivers smooth, professional results. Perfect for vloggers, action cameras, and mobile videos.',
    seoDescription: 'Free online Video Stabilizer — Fix shaky footage with advanced stabilization. Two-pass analysis for smooth results. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Shaky Video", desc: "Upload a video with camera shake. The stabilizer analyzes motion between frames." },
    { title: "2. Choose Level", desc: "Select low, medium, or high stabilization. Higher levels reduce more shake but crop more of the frame." },
    { title: "3. Download Stabilized Video", desc: "Download the smoothed video with reduced camera movement." },
  ],
    faqs: [
    { question: "What stabilization level should I choose?", answer: "Start with medium. Low corrects minor shake. High strongly reduces shake but crops more." },
    { question: "Will the video be cropped?", answer: "Yes. Higher stabilization results in more cropping as the frame edges are trimmed." },
    { question: "What formats are supported?", answer: "MP4, MOV, and WebM. Output matches input format." },
  ],

    showInCategory: true,
  },
  {
    id: "352",
    name: "Video Screenshot",
    slug: "video-screenshot",
    category: "Video",
    description: 'Capture still frames from any video at precise timestamps. Extract single screenshots or batch capture at regular intervals. Export as JPG, PNG, or WebP. Perfect for thumbnails and previews.',
    seoDescription: 'Free online Video Screenshot — Capture frames from videos at precise timestamps. Single or batch extraction. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Video", desc: "Choose a video from which to capture screenshots." },
    { title: "2. Select Timestamp", desc: "Use the player controls to find the exact frame. Navigate frame by frame for precision." },
    { title: "3. Capture and Download", desc: "Click to capture the screenshot and download as PNG or JPEG." },
  ],
    faqs: [
    { question: "What image formats?", answer: "PNG (lossless) or JPEG (smaller files). PNG recommended for text-heavy frames." },
    { question: "Can I capture multiple?", answer: "Yes. Navigate to different timestamps and capture each frame individually." },
    { question: "What resolution?", answer: "Matches the video's original resolution. No resizing is applied." },
  ],

    showInCategory: true,
  },
  {
    id: "353",
    name: "Video Filters",
    slug: "video-filters",
    category: "Video",
    description: 'Apply stunning visual effects to your videos. Choose from color filters, artistic effects, blurs, and lighting adjustments. Combine multiple filters for unique looks.',
    seoDescription: 'Free online Video Filters — Apply color, artistic, blur, and lighting effects to videos. Combine multiple filters. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Upload Video", desc: "Select a video to apply visual filters and effects. Processing is done locally." },
    { title: "2. Choose Filters", desc: "Apply filters like grayscale, sepia, vintage, sharpen, or blur. Preview effects in real time." },
    { title: "3. Export", desc: "Download the video with filters permanently baked into the output." },
  ],
    faqs: [
    { question: "What filters are available?", answer: "Grayscale, sepia, vintage, invert, sharpen, blur, brightness, contrast, saturation, and custom color grading." },
    { question: "Can I combine filters?", answer: "Yes. Filters stack and combine for custom looks." },
    { question: "Are filters permanent?", answer: "Yes. Filters are baked into the output video and cannot be removed." },
  ],

    showInCategory: true,
  },
  {
    id: "354",
    name: "Screen Recorder",
    slug: "screen-recorder",
    category: "Video",
    description: 'Record your screen, application window, or browser tab with optional microphone audio. Choose HD, Full HD, or 2K quality. Download as WebM or MP4. No software installation needed.',
    seoDescription: 'Free online Screen Recorder — Record screen, window, or tab with mic audio. HD to 2K quality. Download as WebM or MP4. ',
    dependencies: "@ffmpeg/ffmpeg",
    instructions: [
    { title: "1. Choose Source", desc: "Select what to record: entire screen, a specific window, or a browser tab." },
    { title: "2. Start Recording", desc: "Click record and grant permissions. Record your screen activity in real time." },
    { title: "3. Stop and Download", desc: "Click stop when finished. Preview and download the recording as MP4." },
  ],
    faqs: [
    { question: "What recording sources?", answer: "Entire screen, specific window, or browser tab." },
    { question: "Is audio recorded?", answer: "Yes. System audio and/or microphone can be captured." },
    { question: "What format?", answer: "MP4 with H.264 video and AAC audio." },
  ],

    showInCategory: true,
  },
  {
    id: "355",
    name: "AI Chat PDF",
    slug: "ai-chat-pdf",
    category: "AI",
    description: 'Chat with your PDF documents. Ask questions, get answers, and extract insights from any document. Extract text and use intelligent search to find relevant information instantly.',
    seoDescription: 'Free online AI Chat with PDF — Ask questions and get answers from your PDF documents. Intelligent document search. ',
    dependencies: "pdfjs-dist",
    showInCategory: true,
    instructions: [
      { title: "1. Upload Your PDF", desc: "Select a PDF file to upload. The tool extracts text from all pages and indexes it for intelligent search and question answering." },
      { title: "2. Ask Questions About the Document", desc: "Type any question about the PDF content in natural language. The AI searches the document and provides answers with relevant context." },
      { title: "3. Explore with Follow-up Questions", desc: "Ask follow-up questions to dive deeper. The tool maintains conversation context, so you can explore the document naturally like talking to an expert." },
    ],
    faqs: [
      { question: "What types of PDFs work best?", answer: "Text-based PDFs work best — reports, contracts, research papers, books, and manuals. Scanned PDFs with OCR text also work, but accuracy depends on OCR quality." },
      { question: "What's the difference from PDF AI Summariser?", answer: "PDF AI Summariser generates a static summary of the entire document. AI Chat PDF lets you ask specific questions and get targeted answers — it's interactive rather than a one-shot summary." },
      { question: "Can I ask questions across multiple PDFs?", answer: "This tool processes one PDF at a time. For querying multiple documents simultaneously, use the AI Document Chat (RAG) tool which supports multiple document uploads." },
      { question: "How does the AI find answers in the PDF?", answer: "The tool extracts text from the PDF and uses vector search to find the most relevant sections for your question. The AI then generates an answer based on those specific passages." },
    ]
  },
  {
    id: "356",
    name: "Grammar Checker",
    slug: "grammar-checker",
    category: "AI",
    description: 'Check and correct grammar, spelling, and punctuation in your text. Detects common errors including homophones, misspellings, punctuation issues, and run-on sentences.',
    seoDescription: 'Free online Grammar Checker — Check and correct grammar, spelling, and punctuation. Detects homophones, misspellings, and more. ',
    dependencies: "none",
    showInCategory: true,
    instructions: [
      { title: "1. Enter or Paste Your Text", desc: "Type or paste the text you want to check. The tool analyzes your writing in real time and highlights errors as you type." },
      { title: "2. Review Detected Errors", desc: "Each error is highlighted with a suggestion for correction. Categories include spelling, grammar, punctuation, homophones (their/there/they're), and run-on sentences." },
      { title: "3. Apply Corrections", desc: "Click on any highlighted error to see suggestions. Accept corrections individually or apply all fixes at once. Copy the corrected text when done." },
    ],
    faqs: [
      { question: "What types of errors does this detect?", answer: "The Grammar Checker detects spelling mistakes, grammar errors (subject-verb agreement, tense), punctuation issues (missing commas, apostrophes), homophone confusion (your/you're, its/it's), and run-on sentences." },
      { question: "Is this as accurate as Grammarly or other tools?", answer: "This tool covers common grammar and spelling errors effectively. For advanced stylistic suggestions, tone analysis, and genre-specific writing advice, specialized writing assistants may offer more depth." },
      { question: "Does it work offline?", answer: "The tool runs analysis using client-side processing where possible. Some advanced grammar checks may require cloud processing depending on your browser capabilities." },
      { question: "Can I check text in other languages?", answer: "The primary language support is English. Basic spell checking may work for other Latin-alphabet languages, but grammar rules are optimized for English." },
    ]
  },
  {
    id: "357",
    name: "AI Humanizer",
    slug: "ai-humanizer",
    category: "AI",
    description: 'Make AI-generated text sound more natural and human-like. Choose from casual, professional, friendly, natural, or storytelling tones. Reduces robotic patterns and improves readability.',
    seoDescription: 'Free online AI Humanizer — Make AI text sound natural. Casual, professional, friendly, or storytelling tones. ',
    dependencies: "none",
    showInCategory: true,
    instructions: [
      { title: "1. Paste AI-Generated Text", desc: "Paste text that was generated by ChatGPT, Claude, or any AI writing tool. The humanizer analyzes patterns that make it sound robotic — repetitive phrasing, overly formal structure, and predictable transitions." },
      { title: "2. Choose a Tone", desc: "Select your desired output tone — casual (conversational), professional (business-appropriate), friendly (warm and approachable), natural (balanced), or storytelling (narrative flow)." },
      { title: "3. Humanize and Refine", desc: "Click humanize to rewrite the text. Review the output, make additional edits, and regenerate if needed until it sounds natural and authentic." },
    ],
    faqs: [
      { question: "What makes AI text sound robotic?", answer: "AI text often uses repetitive sentence structures, overly formal transitions (furthermore, moreover, consequently), redundant adjectives, predictable paragraph patterns, and lack of personal voice or colloquialisms." },
      { question: "Can this bypass AI detectors?", answer: "The humanizer is designed to improve readability and naturalness, not specifically to evade AI detection. While more natural text may be less detectable, we don't guarantee it will bypass any particular AI detector." },
      { question: "What tones are available?", answer: "Five tones are available: casual (conversational, uses contractions), professional (polished, business-ready), friendly (warm, approachable), natural (balanced, versatile), and storytelling (narrative, engaging)." },
      { question: "How much of the original meaning is preserved?", answer: "The core meaning, facts, and key messages are preserved. Phrasing, sentence structure, transitions, and word choice are rewritten to sound more natural." },
    ]
  },
  {
    id: "358",
    name: "AI Detector",
    slug: "ai-detector",
    category: "AI",
    description: 'Detect if text was written by AI. Analyzes burstiness, repetition patterns, sentence variance, and AI trigger phrases. Get a percentage score with detailed breakdown per section.',
    seoDescription: 'Free online AI Detector — Analyze text to detect AI-written content. Burstiness, repetition, and trigger phrase analysis. ',
    dependencies: "none",
    showInCategory: true,
    instructions: [
      { title: "1. Paste the Text to Analyze", desc: "Enter the text you want to check. The tool analyzes multiple linguistic dimensions to determine the likelihood of AI authorship." },
      { title: "2. Review the AI Probability Score", desc: "View a percentage score (0-100%) indicating how likely the text is AI-generated. The breakdown shows scores for burstiness, repetition, variance, and trigger phrases." },
      { title: "3. Examine Section-by-Section Results", desc: "The tool highlights specific paragraphs or sentences that show AI-like patterns. Use this detailed breakdown to understand which parts appear machine-written." },
    ],
    faqs: [
      { question: "How does AI detection work?", answer: "The detector analyzes burstiness (variation in sentence length — humans write with more variation than AI), repetition patterns, sentence structure variance, vocabulary diversity, and common AI trigger phrases." },
      { question: "How accurate is this detector?", answer: "AI detection is not 100% accurate. Short texts, highly edited AI content, and certain writing styles can produce false positives or negatives. Use the score as a guide, not definitive proof." },
      { question: "What is burstiness?", answer: "Burstiness measures the variation in sentence length throughout a text. Human writing naturally varies — short sentences mixed with long ones. AI text tends to have more uniform sentence length distribution." },
      { question: "Can AI-generated text pass as human?", answer: "Yes. Heavily edited AI text, AI text processed through a humanizer, or text on formulaic topics can score as human. The detector is most reliable with raw, unedited AI output." },
    ]
  },
  {
    id: "359",
    name: "Article Writer",
    slug: "article-writer",
    category: "AI",
    description: 'Generate well-structured articles on any topic. Choose tone, audience, and length. Includes introduction, body, conclusion, FAQ, and key takeaways sections. Export as text, markdown, or HTML.',
    seoDescription: 'Free online AI Article Writer — Generate structured articles on any topic. Multiple tones, audience types, and export formats. ',
    dependencies: "none",
    showInCategory: true,
    instructions: [
      { title: "1. Enter Your Topic", desc: "Type your article topic or a brief description. Include key points you want covered, target audience, and any specific angle or perspective." },
      { title: "2. Choose Tone, Audience, and Length", desc: "Select the tone (professional, conversational, persuasive, informative), target audience (general, technical, business, academic), and article length (short, medium, long)." },
      { title: "3. Generate and Export", desc: "Click generate to produce a structured article with introduction, body sections, conclusion, FAQ, and key takeaways. Export as plain text, Markdown, or HTML." },
    ],
    faqs: [
      { question: "What article structures does the tool support?", answer: "The tool generates articles with a standard structure: title, introduction, body paragraphs with subheadings, conclusion, FAQ section, and key takeaways. This structure works well for blogs, guides, and educational content." },
      { question: "Can I specify the outline or sections?", answer: "You can provide key points or an outline in the topic description. The AI will incorporate your structure preferences into the generated article while maintaining coherent flow." },
      { question: "What export formats are available?", answer: "You can export as plain text (TXT), Markdown (MD) for CMS platforms like WordPress or Ghost, or HTML for direct web publishing." },
      { question: "How long does article generation take?", answer: "Most articles generate within 30-60 seconds. Longer articles with detailed requirements may take slightly longer." },
    ]
  },
  {
    id: "360",
    name: "Social Caption Generator",
    slug: "social-caption-generator",
    category: "AI",
    description: 'Generate engaging social media captions for Instagram, Twitter, LinkedIn, Facebook, TikTok, and Pinterest. Multiple moods, hashtag suggestions, and emoji support.',
    seoDescription: 'Free online Social Media Caption Generator — Create engaging captions for Instagram, Twitter, LinkedIn, Facebook, TikTok, Pinterest. ',
    dependencies: "none",
    showInCategory: true,
    instructions: [
      { title: "1. Describe Your Post", desc: "Enter a brief description of your post — what you're sharing, the vibe, and any key details you want to include in the caption." },
      { title: "2. Choose Platform and Mood", desc: "Select your target platform (Instagram, Twitter, LinkedIn, Facebook, TikTok, or Pinterest) and the mood (funny, inspirational, professional, casual, promotional, educational)." },
      { title: "3. Generate and Customize", desc: "Click generate to produce a caption with relevant hashtags and emoji. Edit, regenerate, or copy the caption directly to your social media app." },
    ],
    faqs: [
      { question: "How are captions tailored per platform?", answer: "Each platform has different norms and best practices. Instagram captions are longer with more hashtags. Twitter/X captions are concise. LinkedIn captions are professional. TikTok captions are casual with trending phrases." },
      { question: "Does it suggest hashtags?", answer: "Yes. The caption generator suggests relevant hashtags based on your post content and selected platform. Hashtag suggestions are more prominent for Instagram and TikTok posts." },
      { question: "Can I customize the tone?", answer: "Yes. Choose from multiple moods — funny, inspirational, professional, casual, promotional, educational, or storytelling — to match your brand voice and post intention." },
      { question: "Are multiple caption variations generated?", answer: "You can regenerate as many times as needed to get the perfect caption. Each generation produces a unique caption with different phrasing, hashtags, and structure." },
    ]
  },
  {
    id: "361",
    name: "MOBI Converter",
    slug: "mobi-converter",
    category: "Converter",
    description: 'Convert MOBI (Kindle) e-book files to PDF or EPUB, and create MOBI files from PDF. Perfect for Kindle users who need to read books on other devices or share with non-Kindle readers.',
    seoDescription: 'Free online MOBI Converter — Convert MOBI Kindle e-books to PDF or EPUB. Create MOBI files from PDF. ',
    dependencies: "pdf-lib, jszip, pdfjs-dist",
    showInCategory: true,
  },
  {
    id: "362",
    name: "ODT/RTF to PDF",
    slug: "odt-rtf-to-pdf",
    category: "Converter",
    description: 'Convert OpenDocument (ODT) and Rich Text Format (RTF) files to PDF. Preserves basic formatting like bold, italic, headers, and paragraphs. Perfect for LibreOffice and WordPad users.',
    seoDescription: 'Free online ODT/RTF to PDF — Convert OpenDocument and Rich Text Format files to PDF. Preserves formatting. ',
    dependencies: "pdf-lib, jszip",
    showInCategory: true,
  },
  {
    id: "363",
    name: "SVG to PNG",
    slug: "svg-to-png",
    category: "Image",
    description: 'Convert SVG images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online SVG to PNG — Convert scalable vector graphics (SVG) into raster PNG images. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "364",
    name: "SVG to JPG",
    slug: "svg-to-jpg",
    category: "Image",
    description: 'Convert SVG images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online SVG to JPG — Convert SVG vector graphics into JPEG images for sharing on platforms that require raster formats. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "365",
    name: "PNG to GIF",
    slug: "png-to-gif",
    category: "Image",
    description: 'Convert PNG images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to GIF — Convert PNG images into GIF format for compatibility with older platforms and software. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "366",
    name: "JPG to GIF",
    slug: "jpg-to-gif",
    category: "Image",
    description: 'Convert JPG images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JPG to GIF — Convert JPEG photos into GIF format for legacy applications and platforms with limited format support. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "367",
    name: "WebP to GIF",
    slug: "webp-to-gif",
    category: "Image",
    description: 'Convert WEBP images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online WebP to GIF — Convert modern WebP images into the widely compatible GIF format. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "368",
    name: "BMP to JPG",
    slug: "bmp-to-jpg",
    category: "Image",
    description: 'Convert BMP images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online BMP to JPG — Convert uncompressed BMP bitmap images into space-efficient JPEG files. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "369",
    name: "BMP to PNG",
    slug: "bmp-to-png",
    category: "Image",
    description: 'Convert BMP images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online BMP to PNG — Convert BMP bitmap images into compressed PNG format with optional transparency. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "370",
    name: "TIFF to JPG",
    slug: "tiff-to-jpg",
    category: "Image",
    description: 'Convert TIFF images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online TIFF to JPG — Convert TIFF images into universally compatible JPEG format for sharing on the web or via email. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "371",
    name: "TIFF to PNG",
    slug: "tiff-to-png",
    category: "Image",
    description: 'Convert TIFF images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online TIFF to PNG — Convert TIFF images into lossless PNG format for graphic design workflows. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "372",
    name: "GIF to JPG",
    slug: "gif-to-jpg",
    category: "Image",
    description: 'Convert GIF images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online GIF to JPG — Convert GIF images into JPEG format with millions of colors. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "373",
    name: "GIF to PNG",
    slug: "gif-to-png",
    category: "Image",
    description: 'Convert GIF images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online GIF to PNG — Convert GIF images into lossless PNG format with superior color depth and compression. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "374",
    name: "ICO to PNG",
    slug: "ico-to-png",
    category: "Image",
    description: 'Convert ICO images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online ICO to PNG — Extract Windows icon (.ico) files and convert them into universal PNG images. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "375",
    name: "JXL to PNG",
    slug: "jxl-to-png",
    category: "Image",
    description: 'Convert JXL images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JXL to PNG — Convert JPEG XL images into universally compatible PNG format. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "376",
    name: "JXL to JPG",
    slug: "jxl-to-jpg",
    category: "Image",
    description: 'Convert JXL images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JXL to JPEG — Convert JPEG XL images into standard JPEG format for maximum compatibility. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "377",
    name: "WMA to MP3",
    slug: "wma-to-mp3",
    category: "Audio",
    description: 'Convert WMA audio files to MP3 format directly in your browser. High-quality conversion with no file size limits. Private and free.',
    seoDescription: 'Free online WMA to MP3 — Convert Windows Media Audio (WMA) files into universally compatible MP3 format. ',
    dependencies: "FFmpeg.wasm",
    showInCategory: false
  },
  {
    id: "378",
    name: "Opus to MP3",
    slug: "opus-to-mp3",
    category: "Audio",
    description: 'Convert OPUS audio files to MP3 format directly in your browser. High-quality conversion with no file size limits. Private and free.',
    seoDescription: 'Free online Opus to MP3 — Convert Opus audio files into the more widely supported MP3 format. ',
    dependencies: "FFmpeg.wasm",
    showInCategory: false
  },
  {
    id: "379",
    name: "AIFF to MP3",
    slug: "aiff-to-mp3",
    category: "Audio",
    description: 'Convert AIFF audio files to MP3 format directly in your browser. High-quality conversion with no file size limits. Private and free.',
    seoDescription: 'Free online AIFF to MP3 — Convert Apple\'s AIFF audio files into space-saving MP3 format. ',
    dependencies: "FFmpeg.wasm",
    showInCategory: false
  },
  {
    id: "380",
    name: "Website Screenshot",
    slug: "website-screenshot",
    category: "Developer",
    description: 'Capture screenshots of any website directly in your browser. Choose output format, viewport size, and capture delay. No server-side processing.',
    seoDescription: 'Free online Website Screenshot — Capture screenshots of any website in your browser. Multiple formats, viewport sizes, and delay options. ',
    dependencies: "html2canvas",
    showInCategory: true,
  },
  {
    id: "381",
    name: "GIF to WebP/WebM",
    slug: "gif-to-webp-webm",
    category: "Converter",
    description: 'Convert animated GIFs to modern WebP or WebM formats with transparency support — ~10x smaller files.',
    seoDescription: 'Free online GIF to WebP/WebM Converter — Convert animated GIFs to modern WebP or WebM formats. ~10x smaller files with transparency support. ',
    dependencies: "@ffmpeg/ffmpeg",
    showInCategory: true,
  },
  {
    id: "382",
    name: "AVIF to JPG",
    slug: "avif-to-jpg",
    category: "Image",
    description: 'Convert AVIF images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online AVIF to JPG — Convert AVIF images back to universally compatible JPEG format. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "383",
    name: "AVIF to PNG",
    slug: "avif-to-png",
    category: "Image",
    description: 'Convert AVIF images to PNG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online AVIF to PNG — Convert AVIF images to lossless PNG format for maximum compatibility. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "384",
    name: "BMP to AVIF",
    slug: "bmp-to-avif",
    category: "Image",
    description: 'Convert BMP images to AVIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online BMP to AVIF — Convert BMP bitmap images into next-gen AVIF format with superior compression. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "385",
    name: "BMP to GIF",
    slug: "bmp-to-gif",
    category: "Image",
    description: 'Convert BMP images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online BMP to GIF — Convert BMP bitmap images into GIF format for compatibility with legacy platforms. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "386",
    name: "BMP to WebP",
    slug: "bmp-to-webp",
    category: "Image",
    description: 'Convert BMP images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online BMP to WebP — Convert BMP bitmap images into modern WebP format with dramatically smaller sizes. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "387",
    name: "GIF to AVIF",
    slug: "gif-to-avif",
    category: "Image",
    description: 'Convert GIF images to AVIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online GIF to AVIF — Convert GIF images into modern AVIF format with better compression and color depth. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "388",
    name: "GIF to WebP",
    slug: "gif-to-webp",
    category: "Image",
    description: 'Converts GIF files to WebP format — simple animations, memes, and images on platforms that support animated GIFs natively to modern websites. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online GIF to WebP — Convert GIF images into modern WebP format for smaller file sizes with optional animation support. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "389",
    name: "HEIC to AVIF",
    slug: "heic-to-avif",
    category: "Image",
    description: 'Convert HEIC images to AVIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online HEIC to AVIF — Convert Apple HEIC/HEIF photos into next-gen AVIF format with superior compression. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "390",
    name: "HEIC to GIF",
    slug: "heic-to-gif",
    category: "Image",
    description: 'Convert HEIC images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online HEIC to GIF — Convert Apple HEIC/HEIF photos into GIF format for compatibility with older platforms. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "391",
    name: "HEIC to WebP",
    slug: "heic-to-webp",
    category: "Image",
    description: 'Convert HEIC images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online HEIC to WebP — Convert Apple HEIC/HEIF photos into modern WebP format for efficient web delivery. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "392",
    name: "ICO to JPG",
    slug: "ico-to-jpg",
    category: "Image",
    description: 'Convert ICO images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online ICO to JPG — Convert Windows icon files into universally compatible JPEG format. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "393",
    name: "ICO to WebP",
    slug: "ico-to-webp",
    category: "Image",
    description: 'Convert ICO images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online ICO to WebP — Convert Windows icon files into modern WebP format for web use. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "394",
    name: "JPG to JXL",
    slug: "jpg-to-jxl",
    category: "Image",
    description: 'Convert JPG images to JXL format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JPG to JXL — Convert JPEG photos into cutting-edge JPEG XL format with superior compression. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "395",
    name: "JXL to GIF",
    slug: "jxl-to-gif",
    category: "Image",
    description: 'Convert JXL images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JXL to GIF — Convert JPEG XL images into GIF format for use on legacy platforms. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "396",
    name: "JXL to WebP",
    slug: "jxl-to-webp",
    category: "Image",
    description: 'Convert JXL images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JXL to WebP — Convert JPEG XL images into modern WebP format for broader compatibility. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "397",
    name: "PNG to JXL",
    slug: "png-to-jxl",
    category: "Image",
    description: 'Convert PNG images to JXL format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to JXL — Convert PNG images into JPEG XL format for better compression while preserving quality. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "398",
    name: "SVG to AVIF",
    slug: "svg-to-avif",
    category: "Image",
    description: 'Convert SVG images to AVIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online SVG to AVIF — Convert SVG vector graphics into AVIF format for next-gen web delivery. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "399",
    name: "SVG to GIF",
    slug: "svg-to-gif",
    category: "Image",
    description: 'Convert SVG images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online SVG to GIF — Convert SVG vector graphics into GIF format for use in legacy applications. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "400",
    name: "SVG to WebP",
    slug: "svg-to-webp",
    category: "Image",
    description: 'Convert SVG images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online SVG to WebP — Convert SVG vector graphics into modern WebP format for efficient web delivery. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "401",
    name: "TIFF to AVIF",
    slug: "tiff-to-avif",
    category: "Image",
    description: 'Convert TIFF images to AVIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online TIFF to AVIF — Convert TIFF images into next-gen AVIF format for best-in-class compression. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "402",
    name: "TIFF to GIF",
    slug: "tiff-to-gif",
    category: "Image",
    description: 'Convert TIFF images to GIF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online TIFF to GIF — Convert TIFF images into GIF format for use in applications with limited format support. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "403",
    name: "TIFF to WebP",
    slug: "tiff-to-webp",
    category: "Image",
    description: 'Convert TIFF images to WEBP format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online TIFF to WebP — Convert TIFF images into modern WebP format for smaller file sizes and web use. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "404",
    name: "UPI ID Validator & QR Generator",
    slug: "upi-id-validator",
    category: "indian-utilities",
    description: 'Validates UPI ID format rules for all popular handles (@paytm, @okhdfcbank, @ybl, @sbi, @upi, @axl, @icici) and generates UPI payment QR codes with merchant name and amount. All local processing.',
    seoDescription: 'Free online UPI ID Validator and QR Generator — Validate UPI IDs for @paytm, @okhdfcbank, @ybl, @sbi handles. Generate UPI payment QR codes with merchant name, amount, and transaction note. Local processing, no uploads.',
    dependencies: "QRCode.js",
    instructions: [
    { title: "1. Enter the UPI ID", desc: "Type the UPI ID to validate (format: username@handle, e.g., name@paytm). The tool checks format rules including minimum length, allowed characters, and supported handles." },
    { title: "2. Validate and View Details", desc: "Click validate to check the UPI ID against format rules for all major payment service providers — Paytm, Google Pay (oksbi/okaxis/okicici/okhdfcbank), PhonePe (ybl), Amazon Pay, BHIM/sbi, and more." },
    { title: "3. Generate Payment QR Code", desc: "Optionally enter a merchant name, amount, and transaction note to generate a UPI payment QR code. The QR code can be scanned using any UPI app to make a payment with pre-filled details." },
  ],
    faqs: [
    { question: "What is a UPI ID format?", answer: "A UPI ID follows the format username@handle. The username is typically your phone number or a custom name, and the handle is the payment service provider (PSP) — @paytm, @ybl (PhonePe), @oksbi/@okhdfcbank/@okicici/@okaxis (Google Pay), @sbi (BHIM/SBI Pay), @axl (Amazon Pay), @upi (NPCI)." },
    { question: "Can I generate a QR code for any UPI ID?", answer: "Yes. Enter any valid UPI ID and optionally add a merchant name, payment amount, and transaction note. The generated QR code works with any UPI app (Google Pay, PhonePe, Paytm, BHIM) to make the payment." },
    { question: "Is this UPI QR code compliant with NPCI standards?", answer: "Yes. The generated QR code follows the UPI deep link format (upi://pay) as specified by NPCI standards. It can be scanned and processed by any NPCI-compliant UPI application." },
    { question: "Is my payment information stored?", answer: "No. All validation and QR code generation happens locally in your browser. The UPI details you enter are never transmitted or stored on any server." },
  ]
  },
  {
    id: "405",
    name: "Indian Address Parser",
    slug: "indian-address-parser",
    category: "indian-utilities",
    description: 'Parses free-text Indian addresses into structured fields — line 1, line 2, city, district, state, and pincode. Handles multiple Indian address formats with state and city recognition. Local processing only.',
    seoDescription: 'Free online Indian Address Parser — Parse unstructured Indian addresses into fields: line 1, line 2, city, district, state, pincode. Recognizes Indian states, cities, and address patterns. 100 percent local parsing.',
    dependencies: "None",
    instructions: [
    { title: "1. Paste the Raw Address", desc: "Copy and paste the unstructured Indian address into the input field. The parser accepts addresses in various formats — single-line, multi-line, with or without pincode — as commonly found in forms, spreadsheets, and databases." },
    { title: "2. Parse Automatically", desc: "Click parse to extract structured components. The parser identifies the pincode (if present), matches state names (including abbreviations), recognizes major and minor cities, district names, and splits the remaining text into address line 1 and line 2." },
    { title: "3. Review and Copy Structured Data", desc: "View the parsed address components in structured fields. Copy individual fields or the complete structured output for use in forms, shipping labels, or database entries." },
  ],
    faqs: [
    { question: "What Indian address formats does the parser handle?", answer: "The parser handles common Indian address formats including: house/building plus street/area plus landmark plus city plus state plus pincode, apartment/society plus locality plus city plus pincode, and PO box plus village/town plus district plus state formats. It recognizes all 28 state names, 8 UT names, and common abbreviations." },
    { question: "Does it work without a pincode?", answer: "Yes. The parser works with or without a pincode. Without a pincode, it relies on state, city, and district name recognition to structure the address. Including a pincode improves accuracy." },
    { question: "Can I use this for bulk address data?", answer: "The tool parses one address at a time. For bulk address cleanup, process each address individually and copy the structured output. Parsing is instant since all processing is local." },
    { question: "Is my address data stored?", answer: "No. Address parsing happens entirely in your browser. The text you enter is never transmitted, stored, or logged by any server." },
  ]
  },
  {
    id: "406",
    name: "Vehicle Registration Checker",
    slug: "vehicle-registration-checker",
    category: "indian-utilities",
    description: 'Parses Indian vehicle registration numbers to identify state/UT codes, RTO codes, and series. Decodes the format of license plates from all Indian states and union territories.',
    seoDescription: 'Free online Vehicle Registration Number Checker — Parse Indian vehicle registration numbers. Identify state/UT codes, RTO codes, and series for all Indian states and union territories. Instant local parsing.',
    dependencies: "None",
    instructions: [
    { title: "1. Enter the Vehicle Registration Number", desc: "Type the full vehicle registration number as printed on the license plate (e.g., KA-01-AB-1234 or TN 10 C 5678). The parser handles both old and new format plates with or without hyphens." },
    { title: "2. Parse the Number", desc: "Click parse to decode the registration number. The tool identifies the state/union territory code (first 2 letters), the RTO code (2-digit number), the series letter(s), and the unique sequence number." },
    { title: "3. View Complete Details", desc: "See the decoded components with full state name, RTO office location (if known), and series information. Use this to identify the vehicle's registered state and RTO jurisdiction." },
  ],
    faqs: [
    { question: "How are Indian vehicle registration numbers structured?", answer: "Indian registration plates follow the format: XX-YY-ZZ-NNNN. The first two letters (XX) indicate the state or UT (e.g., KA = Karnataka, DL = Delhi, MH = Maharashtra, TN = Tamil Nadu, GJ = Gujarat, UP = Uttar Pradesh). The next two digits (YY) are the RTO code. The following letters (ZZ) form the series. The last digits (NNNN) are the unique sequence number." },
    { question: "Does this validate if the registration is genuine?", answer: "This tool decodes the format and structure of the registration number. It can identify invalid state codes or incorrect formats. For official verification of vehicle ownership and registration status, use the government's VAHAN portal." },
    { question: "What are the Indian state codes for registration?", answer: "Key codes include: AP (Andhra Pradesh), AR (Arunachal), AS (Assam), BR (Bihar), CG (Chhattisgarh), DL (Delhi), GA (Goa), GJ (Gujarat), HR (Haryana), HP (Himachal), KA (Karnataka), KL (Kerala), MP (Madhya Pradesh), MH (Maharashtra), MN (Manipur), ML (Meghalaya), MZ (Mizoram), NL (Nagaland), OD (Odisha), PB (Punjab), RJ (Rajasthan), SK (Sikkim), TN (Tamil Nadu), TS (Telangana), TR (Tripura), UK (Uttarakhand), UP (Uttar Pradesh), WB (West Bengal)." },
    { question: "What about new BH (Bharat) series plates?", answer: "The BH (Bharat) series is a new registration format for central government employees and defense personnel who transfer across states. The format is BH-NNNN-YY-XXXXX, where BH is the series identifier." },
  ]
  },
  {
    id: "407",
    name: "Aadhaar Number Validator",
    slug: "aadhaar-number-validator",
    category: "indian-utilities",
    description: 'Validates Aadhaar numbers using Verhoeff checksum verification. Checks format rules, detects fake UIDs, and explains Aadhaar number structure. Fully local validation with no data upload.',
    seoDescription: 'Free online Aadhaar Number Validator — Validate 12-digit Aadhaar numbers with Verhoeff checksum. Check format, detect fake UIDs, and understand Aadhaar structure. 100 percent local validation, no data upload.',
    dependencies: "None",
    instructions: [
    { title: "1. Enter the Aadhaar Number", desc: "Type the 12-digit Aadhaar number to validate. The input accepts numbers in both continuous (123456789012) and spaced (1234 5678 9012) formats." },
    { title: "2. Validate Using Verhoeff Checksum", desc: "Click validate to run the Verhoeff checksum algorithm — the same mathematical verification used by UIDAI. The algorithm detects single-digit errors, transpositions, and other common entry mistakes." },
    { title: "3. Review Validation Results", desc: "View whether the Aadhaar number passes the Verhoeff checksum (indicating a structurally valid number), along with the digit position breakdown and the check digit analysis." },
  ],
    faqs: [
    { question: "How does Aadhaar number validation work?", answer: "Aadhaar numbers use the Verhoeff checksum algorithm for verification. This mathematical scheme detects all single-digit errors and adjacent transposition errors. The 12th digit is the check digit computed from the first 11 digits. The tool runs this algorithm to verify structural validity." },
    { question: "Does passing validation mean the Aadhaar is genuine?", answer: "No. Passing the Verhoeff checksum means the number is structurally valid — it could be a real Aadhaar number. It does not confirm that the number is actually issued by UIDAI or linked to any individual. For verifying active Aadhaar status, use the official UIDAI portal." },
    { question: "What is the Verhoeff algorithm?", answer: "The Verhoeff algorithm is a checksum formula designed to detect all single-digit errors and all adjacent transposition errors in numeric sequences. It was chosen by UIDAI for Aadhaar because it provides better error detection than simple checksums like Luhn (used by credit cards)." },
    { question: "Is my Aadhaar number stored?", answer: "No. All validation happens locally in your browser. The Aadhaar number you enter is never transmitted, stored, or logged anywhere. Your privacy is fully protected." },
  ]
  },
  {
    id: "408",
    name: "SIP / PPF / EPF Calculator",
    slug: "indian-investment-calculator",
    category: "indian-utilities",
    description: 'Calculate Indian investment returns — SIP with lumpsum and monthly options, PPF with 15-year maturity, and EPF employee provident fund projections. All calculations are local with no data uploads.',
    seoDescription: 'Free online Indian Investment Calculator — SIP, PPF, and EPF return calculator for Indian investors. SIP lumpsum plus monthly, PPF 15-year maturity, EPF projections with current interest rates. 100 percent local.',
    dependencies: "None",
    instructions: [
    { title: "1. Choose Your Investment Type", desc: "Select from SIP (mutual funds), PPF (Public Provident Fund), or EPF (Employee Provident Fund). Each calculator is tailored to the specific rules and returns of that investment type." },
    { title: "2. Enter Investment Parameters", desc: "For SIP: enter monthly investment amount, expected annual return rate, and investment duration. For PPF: enter the yearly deposit (minimum Rs. 500, maximum Rs. 1.5 lakh) and current interest rate. For EPF: enter basic salary, employee/employer contribution percentage (currently 12 percent), and current PF interest rate." },
    { title: "3. View Projected Returns", desc: "See the maturity amount with a detailed year-wise breakup. The SIP calculator shows total invested vs estimated returns. PPF shows the 15-year maturity schedule. EPF shows employee contribution, employer contribution, interest earned, and total corpus." },
  ],
    faqs: [
    { question: "What SIP calculation methods are supported?", answer: "The SIP calculator supports both lumpsum (one-time investment) and monthly SIP options. It uses the compound interest formula with monthly compounding. You can adjust expected returns (typically 10-15 percent for equity funds, 6-9 percent for debt funds) and investment duration." },
    { question: "What are the current PPF rules?", answer: "PPF has a 15-year lock-in period with partial withdrawals allowed from year 7. The minimum annual deposit is Rs. 500 and maximum is Rs. 1.5 lakh. The interest rate (currently 7.1 percent for Q1 2025, revised quarterly by the government) is tax-free under Section 80C." },
    { question: "How is EPF calculated?", answer: "EPF uses the current interest rate (typically 8-8.5 percent per annum, set by the EPFO). The employee contributes 12 percent of basic salary plus DA. The employer also contributes 12 percent in total (3.67 percent goes to EPF, 8.33 percent goes to EPS). The calculator shows the total EPF corpus at retirement age (58 years)." },
    { question: "Are these calculations accurate for tax planning?", answer: "Yes. The calculations use current interest rates and standard formulas. However, actual returns depend on future interest rate revisions by the government (for PPF/EPF) and market performance (for SIP). Use these projections as estimates for your financial planning." },
  ]
  },
  {
    id: "409",
    name: "Bulk PDF Suite",
    slug: "bulk-pdf-suite",
    category: "PDF",
    description: 'Rotate, protect, unlock, split, watermark, crop, resize, or flatten multiple PDF files in one batch. All processing happens locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Bulk PDF Suite — Rotate, protect, unlock, split, watermark, crop, resize, or flatten multiple PDF files in one batch. ',
    dependencies: "pdf-lib"
  },
];
