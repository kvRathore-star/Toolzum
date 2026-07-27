import type { ToolMetadata } from './tools-types';

export const entries_chunk_0: ToolMetadata[] = [
  {
    id: "add-text-1",
    name: "Add Text to Photo",
    description: 'Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Add Text to Photo — Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. ',
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
    instructions: [
          {
                "title": "1. Upload Your Photo",
                "desc": "Select the image you want to annotate from your device. Drag-and-drop works best for quick edits. Supported formats include JPEG, PNG, and WebP up to 50MB."
          },
          {
                "title": "2. Add and Style Text",
                "desc": "Click anywhere on the photo to place a text box. Choose from 80+ fonts, adjust size with the slider, and pick any hex color. Apply shadows, outlines, or gradient fills to make text pop against busy backgrounds."
          },
          {
                "title": "3. Position and Download",
                "desc": "Drag text blocks to any position, rotate them freely, or set precise alignment guides. Layer multiple text boxes with different styles. Download your finished photo as PNG to preserve text sharpness or JPEG for smaller file size."
          }
    ],
    faqs: [
          {
                "question": "Can I add curved or rotated text?",
                "answer": "Yes, you can rotate any text block to any angle using the rotation handle above the selected text box. Curved text along a path isn't supported currently, but you can angle each block independently for creative layouts."
          },
          {
                "question": "Do you support emoji and special characters in text?",
                "answer": "Absolutely. The text editor supports Unicode, so emoji, accented characters, and symbols from any language render correctly. Paste emoji directly or use the character picker on mobile."
          },
          {
                "question": "Will my original image resolution change?",
                "answer": "No, the tool preserves your original image dimensions and resolution. Text is rendered as a vector overlay before rasterization, so the output matches your input quality exactly at the pixel level."
          }
    ]
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: 'Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Batch Image Editor — Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. ',
    category: "Image",
    slug: "batch-image-editor",
    dependencies: "Canvas API, jszip",
    isPro: true,
    instructions: [
          {
                "title": "1. Upload Multiple Images",
                "desc": "Upload up to 50 images at once from your device or cloud storage. The tool accepts JPEG, PNG, WebP, and TIFF formats. A thumbnail grid shows all queued images with file names and sizes at a glance."
          },
          {
                "title": "2. Apply Edits to All",
                "desc": "Choose from resize, crop, rotate, flip, compress, or format conversion. Adjust quality, dimensions, and output format for the entire batch. Every image gets identical processing parameters."
          },
          {
                "title": "3. Download as Archive",
                "desc": "Processed images are bundled into a single ZIP archive for one-click download. Each file retains its original name with the new extension appended. You get a summary report of before-and-after sizes for every image in the batch."
          }
    ],
    faqs: [
          {
                "question": "Is there a limit on how many images I can process at once?",
                "answer": "You can upload up to 50 images per batch, each capped at 50MB individually. For larger volumes, split into multiple batches — the tool resets cleanly after each download."
          },
          {
                "question": "Can I apply different settings to individual images in a batch?",
                "answer": "No, batch mode applies uniform settings to all selected images. For per-image customization, use the individual image tools instead. Batch is optimized for consistency across many files."
          },
          {
                "question": "What happens if one image fails to process?",
                "answer": "Processing continues for the remaining images. A detailed error log shows which file failed and why, and the successful images still get bundled into the downloadable ZIP archive."
          }
    ]
  },
  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: 'Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. No signup or account required.',
    seoDescription: 'Free online Video to MP3 Converter — Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. ',
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
    instructions: [
    { title: "1. Upload Your Video", desc: "Choose any MP4, MOV, AVI, or WebM video file. The tool automatically extracts the audio track and prepares it for MP3 encoding." },
    { title: "2. Select Audio Quality", desc: "Choose your preferred MP3 quality setting. Higher bitrates (320 kbps) produce better sound quality but larger file sizes." },
    { title: "3. Download the MP3", desc: "Click download to save the extracted audio as an MP3 file. The audio is ready instantly with all metadata preserved." },
  ],
    faqs: [
    { question: "What video formats can I extract audio from?", answer: "The converter supports MP4, MOV, AVI, and WebM. The audio track is extracted and encoded as MP3." },
    { question: "Is there a file size limit?", answer: "The tool runs locally in your browser using ffmpeg.wasm. Most videos under 2GB work well on modern devices." },
    { question: "Does video quality affect MP3 quality?", answer: "MP3 quality depends on your selected bitrate setting, not the original video quality." },
  ],

  },
  {
    id: "vid-crop-1",
    name: "Crop Video",
    description: "Crop the visual area of your MP4 video entirely in the browser. No signup or account required.",
    seoDescription: 'Free online Crop Video — Crop the visual area of your MP4 video entirely in the browser. ',
    category: "Video",
    slug: "crop-video",
    dependencies: "ffmpeg",
    instructions: [
    { title: "1. Upload Your Video", desc: "Select the MP4 video you want to crop. The tool loads it entirely in your browser for privacy." },
    { title: "2. Choose Crop Area", desc: "Use the visual crop selector to define the visible area. Drag corners and edges to set your desired frame dimensions." },
    { title: "3. Download Cropped Video", desc: "Download the cropped video. The output preserves the original duration and audio track." },
  ],
    faqs: [
    { question: "What video formats are supported?", answer: "The crop tool works with MP4 videos. Output maintains the original format and codec." },
    { question: "Does cropping reduce video quality?", answer: "Cropping only removes outer frame areas. The remaining area retains full quality." },
    { question: "Can I crop to a specific aspect ratio?", answer: "Yes. Crop freely or constrain to common ratios like 16:9, 4:3, 1:1, or 9:16." },
  ],

  },
  {
    id: "dev-json-xml-1",
    name: "JSON to XML",
    description: 'Converts JSON files to XML format — APIs, configuration files, and data exchange between web services to enterprise systems, SOAP APIs, document formats like DOCX and SVG. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online JSON to XML — Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules. ',
    category: "Converter",
    slug: "json-to-xml",
    dependencies: "xml2js",
    showInCategory: true,
    instructions: [
      { title: "1. Enter JSON", desc: "Paste valid JSON or upload a .json file." },
      { title: "2. Set XML Root", desc: "Define the root element name and how arrays are wrapped." },
      { title: "3. Convert", desc: "Generate well-formed XML. Copy or download the output." },
    ],
    faqs: [
      { question: "How are JSON arrays converted?", answer: "Each array element is wrapped in a parent element. You can customize the element naming convention." },
      { question: "Are JSON attributes supported?", answer: "Yes. You can mark specific JSON keys as XML attributes instead of child elements." },
      { question: "Can I format the XML output?", answer: "Yes. The output is indented by default. Toggle minification for compact output." },
    ],
  },
  {

    id: "time-conv-1",
    name: "Time Converter",
    description: 'Convert between time units including seconds, minutes, hours, days, weeks, months, and years with precise decimal results. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Time Converter — Convert between time units including seconds, minutes, hours, days, weeks, months, and years with precise decimal results. ',
    category: "Utility",
    slug: "time-converter",
    dependencies: "None",
    instructions: [
          {
                "title": "1. Enter the Time Value",
                "desc": "Type a numeric value into the input field. This is the amount of time you want to convert from one unit to another."
          },
          {
                "title": "2. Select Source and Target Units",
                "desc": "Choose the unit you are converting from (e.g., hours) and the unit you are converting to (e.g., minutes). Supported units include milliseconds, seconds, minutes, hours, days, weeks, months, and years."
          },
          {
                "title": "3. View Converted Result",
                "desc": "The converted value appears instantly as you type. Multiple target conversions are shown simultaneously so you can see the value expressed in all supported units at once."
          }
    ],
    faqs: [
          {
                "question": "How does the converter handle months and years since they have variable lengths?",
                "answer": "Months are assumed to be 30.44 days and years 365.25 days on average. For exact calendar months, use a date calculator instead."
          },
          {
                "question": "Can I convert from nanoseconds or microseconds?",
                "answer": "No, the smallest supported unit is milliseconds. For sub-millisecond precision, convert to seconds (e.g., microseconds ÷ 1,000,000)."
          },
          {
                "question": "Does the converter support scientific notation input?",
                "answer": "Yes, you can enter values in scientific notation like 1.5e3 for 1,500. The output will display in both standard and scientific formats."
          }
    ]
},
  {

    id: "du-1",
    name: "Random Port Generator",
    slug: "random-port-generator",
    category: "Utility",
    description: 'Generate random TCP/UDP port numbers from well-known, registered, or dynamic ranges. Useful for network testing, Docker port mapping, and firewall configuration.',
    seoDescription: 'Free online Random Port Generator — Generate random TCP/UDP port numbers from well-known, registered, or dynamic ranges. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Set Port Range",
                "desc": "Choose the lower and upper bounds for port generation. The default is the dynamic/private port range 49152-65535, but you can set any range from 1 to 65535."
          },
          {
                "title": "2. Filter Reserved Ports",
                "desc": "Toggle the option to exclude IANA well-known ports (0-1023) and registered ports (1024-49151). When enabled, only dynamic ports are generated."
          },
          {
                "title": "3. Generate Port Numbers",
                "desc": "Click generate to produce one or more random port numbers. Each port is verified to be within range and free from the excluded categories."
          }
    ],
    faqs: [
          {
                "question": "What are the three ranges of TCP/UDP port numbers?",
                "answer": "Well-known ports (0-1023), registered ports (1024-49151), and dynamic/private ports (49152-65535). Dynamic ports are recommended for custom applications."
          },
          {
                "question": "Can the generator check if a port is actually available on my system?",
                "answer": "No, port availability depends on your current system state. The tool generates valid port numbers but cannot check if a process is already using them."
          },
          {
                "question": "Can I exclude specific ports that are commonly used by known services?",
                "answer": "Yes, maintain an exclusion list (e.g., 80, 443, 3306, 5432). Ports on this list are skipped during generation."
          }
    ]
},
  {

    id: "du-2",
    name: "Chmod Calculator",
    slug: "chmod-calculator",
    category: "Developer",
    description: 'Convert between numeric (755) and symbolic (u=rwx,g=rx,o=rx) chmod permission formats. See detailed breakdown for owner, group, and others.',
    seoDescription: 'Free online Chmod Calculator — Convert between numeric and symbolic chmod permission formats with detailed breakdown. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Set Permissions via Toggle",
                "desc": "Toggle read/r(4), write/w(2), execute/x(1) for Owner, Group, and Others using checkboxes."
          },
          {
                "title": "2. View Numeric and Symbolic Modes",
                "desc": "The tool displays the numeric (e.g., 755) and symbolic (e.g., u=rwx,g=rx,o=rx) representations."
          },
          {
                "title": "3. Set Special Permissions",
                "desc": "Toggle SUID (4), SGID (2), and Sticky bit (1) which modify the leading digit (e.g., 4755 for SUID)."
          }
    ],
    faqs: [
          {
                "question": "What is the difference between chmod 755 and chmod +x?",
                "answer": "chmod 755 sets exact permissions (owner: rwx, group: rx, others: rx). chmod +x adds execute to the current permissions without changing other bits. 755 is absolute, +x is relative."
          },
          {
                "question": "What does the SUID bit (chmod 4xxx) do?",
                "answer": "SUID (Set User ID) makes an executable run with the file owner's privileges, not the executing user's. Common on /usr/bin/passwd. The calculator shows the leading digit."
          },
          {
                "question": "How do sticky bits work on directories?",
                "answer": "The sticky bit (chmod 1xxx) on directories restricts deletion — only the file owner, directory owner, or root can delete files. Commonly used on /tmp."
          }
    ]
},
  {

    id: "du-3",
    name: "Docker Run to Compose Converter",
    slug: "docker-run-to-compose",
    category: "Developer",
    description: 'Convert docker run commands to docker-compose.yml format. Supports ports, volumes, environment variables, networks, restart policies, and container names.',
    seoDescription: 'Free online Docker Run to Compose Converter — Convert docker run commands to docker-compose.yml format. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Step 1",
                "desc": "Paste a docker run command including all flags such as port mappings, volume mounts, environment variables, network settings, and restart policies for conversion."
          },
          {
                "title": "2. Step 2",
                "desc": "Set the Docker Compose version and service name. Choose whether to include compose-only features like healthcheck, depends_on, and deploy sections in the output."
          },
          {
                "title": "3. Step 3",
                "desc": "Generate the equivalent docker-compose YAML file. The output is a complete ready-to-use Docker Compose service definition for your containerized application."
          }
    ],
    faqs: [
          {
                "question": "What docker run flags does the converter map to Docker Compose YAML configuration keys?",
                "answer": "Port mappings become ports, volumes become volumes, environment variables become environment, network becomes networks, restart becomes restart, and name becomes container name."
          },
          {
                "question": "How does the tool handle docker run commands with multiple containers linked via link flag?",
                "answer": "Multiple containers are each converted to separate services. Link directives are converted to depends_on with optional conditions and shared networks in the networks section."
          },
          {
                "question": "Can the converter handle complex docker run features like mount with volume options specified?",
                "answer": "Yes, mount type bind or volume or tmpfs is converted to the compose mount syntax. Capabilities become cap_add and security options become security_opt in the output."
          }
    ]
},
  {

    id: "du-4",
    name: "Email Normalizer",
    slug: "email-normalizer",
    category: "Developer",
    description: 'Normalize email addresses by removing dots (Gmail), stripping +tags, and lowercasing. Process multiple emails at once for deduplication and cleaning.',
    seoDescription: 'Free online Email Normalizer — Normalize email addresses by removing dots, stripping +tags, and lowercasing. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Enter Email Address",
                "desc": "Type or paste an email address. The tool will apply normalization rules."
          },
          {
                "title": "2. Select Normalization Rules",
                "desc": "Choose: lowercase domain, remove dots from Gmail local part, remove +tag suffixes, trim whitespace."
          },
          {
                "title": "3. View Normalized Result",
                "desc": "The tool shows the original and normalized addresses side by side."
          }
    ],
    faqs: [
          {
                "question": "Why does Gmail ignore dots in the local part of email addresses?",
                "answer": "Gmail treats 'first.last@gmail.com' and 'firstlast@gmail.com' as identical because dots are ignored in Gmail addresses. This tool strips dots from @gmail.com and @googlemail.com addresses."
          },
          {
                "question": "How does the tool handle +tag suffixes in email addresses?",
                "answer": "Text after a plus sign in the local part (e.g., user+tag@domain.com) is treated as a tag. The normalizer strips tags to get the base address for deduplication."
          },
          {
                "question": "Does the normalizer convert internationalized domains to Punycode?",
                "answer": "Yes, domains with non-ASCII characters are converted to Punycode (xn--) representation, allowing comparison between Unicode and ASCII versions of the same domain."
          }
    ]
},
  {
    id: "arch-conv-1",
    name: "Archive Converter",
    description: "Compress ZIP archives directly in your browser. Upload any file and download a standard ZIP archive — no uploads to servers, no file size limits.",
    seoDescription: 'Free online Archive Converter — Compress ZIP archives directly in your browser. Upload any file and download a standard ZIP archive. ',
    category: "Converter",
    slug: "archive-converter",
    dependencies: "jszip",
    instructions: [
      { title: "1. Upload Archive", desc: "Select a compressed archive file — ZIP, RAR, 7z, TAR, or GZ. The tool decompresses the source and recompresses into your chosen target format with configurable compression level." },
      { title: "2. Choose Output Format", desc: "Pick the target archive format for conversion." },
      { title: "3. Download", desc: "Convert and download the re-packaged archive." },
    ],
    faqs: [
      { question: "What archive formats are supported?", answer: "ZIP, RAR, 7z, TAR, GZ, BZ2, and XZ archives can be converted between formats." },
      { question: "Is compression level adjustable?", answer: "Yes. Choose from fast (lower compression) to maximum (smallest file size) compression levels." },
      { question: "Are passwords preserved?", answer: "Password-protected archives are decrypted during conversion. You need the original password." },
    ],
  },
  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: 'Converts HEIC files to PDF format — Apple device photos to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online HEIC to PDF — Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents. ',
    category: "PDF",
    slug: "heic-to-pdf",
    dependencies: "pdf-lib, heic2any",
    showInCategory: false,
    instructions: [
      { title: "1. Upload HEIC Images", desc: "Select HEIC/HEIF photos from your iPhone or modern Android device. HEIC is Apple's efficient image format with 50% smaller files than JPEG." },
      { title: "2. Choose Output Settings", desc: "Select page size and orientation. Each HEIC photo becomes one PDF page in the order uploaded." },
      { title: "3. Convert & Download", desc: "Your HEIC images are decoded and assembled into a single PDF. Download the PDF for sharing or archiving." },
    ],
    faqs: [
      { question: "Why convert HEIC to PDF?", answer: "HEIC is not universally supported on Windows or in enterprise document systems. PDF ensures anyone can view your photos without special software." },
      { question: "Does this preserve Live Photos?", answer: "No. Only the still image from a HEIC Live Photo is converted. The motion component is not included in the PDF." },
      { question: "What about HEIF vs HEIC?", answer: "Both formats use the same HEVC-based compression. The tool handles both .heic and .heif file extensions identically." },
    ],
  },
  {
    id: "2",
    name: 'Privacy Cleaner',
    slug: 'privacy-cleaner',
    category: 'Privacy',
    description: 'Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. No signup or account required.',
    seoDescription: 'Free online Privacy Cleaner — Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. ',
    dependencies: 'Vanilla JS'
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: 'Detects source language automatically and translates text between 100+ languages using advanced neural machine translation.',
    dependencies: "Google Cloud Translation API",
    seoDescription: 'Free AI translator online — translate text between 100+ languages instantly. Automatic language detection. Uses cloud-based processing.',
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the text you want to translate. The tool supports paragraphs, sentences, or single words — it auto-detects the source language." },
      { title: "2. Select Target Language", desc: "Choose from 100+ supported languages. The tool uses neural machine translation for natural-sounding results. Common languages appear at the top for quick access." },
      { title: "3. View and Use the Translation", desc: "The translated text appears instantly. Copy the result, listen to pronunciation, or switch the source/target languages to translate back." },
    ],
    faqs: [
      { question: "How many languages are supported?", answer: "The AI Translator supports over 100 languages including major world languages (English, Spanish, Chinese, Hindi, Arabic, French, etc.) and many regional and minority languages." },
      { question: "How accurate is the translation?", answer: "Translation accuracy varies by language pair and content type. Common language pairs like English-Spanish achieve high accuracy. Technical or idiomatic content may require human review." },
      { question: "Is my text stored after translation?", answer: "Your text is processed through the translation API and is not permanently stored. We recommend not translating sensitive or confidential information through any cloud-based translation service." },
      { question: "Can I translate entire documents?", answer: "This tool is optimized for text snippets up to a few paragraphs. For full document translation, consider breaking the document into sections or using a dedicated document translation service." },
    ]
  },
  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: 'Extract PDF content into editable DOCX files. Preserves formatting and layout.',
    dependencies: "pdf2docx / PDF.js",
    seoDescription: 'Convert PDF to Word online free — extract PDF content into editable DOCX files. Preserves formatting. 100% client-side, no uploads needed.',
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF File", desc: "Select a PDF document to convert to Word format. The tool extracts text, images, and basic formatting." },
      { title: "2. Choose Output Format", desc: "Select .docx (editable Word document) or .doc (legacy format). DOCX is recommended for the best formatting preservation." },
      { title: "3. Download Editable File", desc: "Your PDF is converted to a Word document. Text is editable, images are extractable, and basic structure is preserved." },
    ],
    faqs: [
      { question: "How accurate is the conversion?", answer: "Text-heavy PDFs with simple layouts convert accurately (90%+). Complex layouts with multiple columns, tables, or text boxes may need manual adjustments." },
      { question: "Are scanned PDFs supported?", answer: "For scanned PDFs (images of text), use the PDF OCR tool first to recognize text, then convert to Word." },
      { question: "Is the conversion free with no limits?", answer: "Yes. All processing happens locally in your browser. No file uploads, no server costs, no page limits." },
    ],
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: 'Transforms text prompts into high-resolution images using advanced diffusion models. Designers and marketers use it for rapid visual prototyping.',
    dependencies: "Stable Diffusion API",
    seoDescription: 'Generate stunning AI images from text prompts — free online. Turn your ideas into high-resolution visuals instantly. Powered by advanced diffusion models.',
    instructions: [
      { title: "1. Write Your Prompt", desc: "Describe the image you want to generate in detail. Include subject, style, setting, colors, and mood. More descriptive prompts produce better results." },
      { title: "2. Choose Style and Settings", desc: "Select from art styles like photorealistic, oil painting, anime, sketch, or 3D render. Adjust settings like image size and guidance scale for creative control." },
      { title: "3. Generate and Download", desc: "Click generate to create your image. Review the result and either download it or refine your prompt for a different outcome. Each generation produces a unique image." },
    ],
    faqs: [
      { question: "What is a diffusion model?", answer: "A diffusion model is an AI that learns to generate images by gradually removing noise from random pixels, guided by your text prompt. It creates novel images rather than remixing existing ones." },
      { question: "How detailed should my prompt be?", answer: "Detailed prompts produce better results. Include the subject (what), setting (where), style (how), colors, lighting, and mood. For example: 'a serene mountain lake at sunset, photorealistic style, warm golden light, misty atmosphere'." },
      { question: "Can I use the generated images commercially?", answer: "Usage rights depend on the model used. Most standard diffusion models allow personal and commercial use, but check the specific model's license. Generated images may resemble existing works." },
      { question: "Why did my image not match my prompt?", answer: "Diffusion models interpret prompts in their own way. Try rewording your prompt with more specific terms, adding style keywords, or using negative prompts to exclude unwanted elements." },
    ]
  },
  {

    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: 'Measures your internet connection’s download speed and latency by downloading a test file from a CDN. Upload speed is not currently measured.',
    seoDescription: 'Free online Speed Test — Measures your internet connection’s download speed and latency by downloading a test file from a CDN. ',
    dependencies: "Fetch API",
    instructions: [
          {
                "title": "1. Start the Test",
                "desc": "Click the start button to begin the speed test. The test runs in three phases: ping (latency), download speed, and upload speed."
          },
          {
                "title": "2. Wait for Completion",
                "desc": "The test downloads and uploads sample data to measure throughput. A progress indicator shows which phase is currently running."
          },
          {
                "title": "3. View Results",
                "desc": "Results display ping (ms), download speed (Mbps), upload speed (Mbps), and jitter. A letter grade from A+ to F rates your connection quality."
          }
    ],
    faqs: [
          {
                "question": "What size files are used for the download and upload tests?",
                "answer": "The download test uses a 10MB file and the upload test uses a 5MB file. These sizes are sufficient for accurate measurement of typical broadband connections."
          },
          {
                "question": "Does the speed test use my data plan?",
                "answer": "Yes, the test consumes approximately 15MB of data per run (10MB download + 5MB upload). Results may affect metered connections."
          },
          {
                "question": "Can the test run on a mobile browser or only desktop?",
                "answer": "The test works on both desktop and mobile browsers. Mobile results may be less accurate due to variable cellular network conditions."
          }
    ]
},
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: 'Reduces image file size to a specific target — 50 KB, 100 KB, or 200 KB — by automatically adjusting JPEG quality, reducing pixel dimensions, or stripping EXIF metadata. Ideal for government forms, job applications, and upload portals with strict file size limits.',
    seoDescription: 'Free online Compress Image to 50KB — reduce any image to exactly 50 KB, 100 KB, or 200 KB for government forms, job applications, and upload portals with strict limits. ',
    dependencies: "browser-image-compression",
    instructions: [
      { title: "1. Upload Your Image", desc: "Select a JPG or PNG image from your device. The tool works best with photos and scanned documents." },
      { title: "2. Set Your Target Size", desc: "Choose your target: 50 KB, 100 KB, or 200 KB. The compressor automatically adjusts quality and dimensions to hit the target precisely." },
      { title: "3. Download the Result", desc: "Your compressed image is ready instantly. All processing happens locally — your image never leaves your device, keeping sensitive documents private." },
    ],
    faqs: [
      { question: "Why would I need an exact file size?", answer: "Many government portals, job application systems, and university submission forms enforce strict file size limits — often 50 KB, 100 KB, or 200 KB for photos and scanned documents. This tool hits your target automatically." },
      { question: "How is this different from the regular Image Compressor?", answer: "Image Compressor gives you a quality slider with a side-by-side preview — you decide the tradeoff visually. Compress Image to 50KB works toward an exact file size target automatically, prioritizing hitting the size limit over visual tuning." },
      { question: "What happens if my image can't compress to 50 KB?", answer: "The compressor reduces quality progressively and also scales down dimensions if needed. Most photos under 5MB can reach 50 KB. If the result quality is too low, try the 100 KB target or resize your image first with the Image Resizer tool." },
      { question: "Does this work for scanned documents?", answer: "Yes. Scanned documents in JPEG format compress particularly well since they contain large uniform areas. For scanned documents, 50 KB is usually achievable while keeping text readable." },
    ]
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: 'Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. Uses cloud-based processing.',
    seoDescription: 'Free online Currency Converter — Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. ',
    dependencies: "ExchangeRate-API"
  ,
    instructions: [
    { title: "1. Select Currencies", desc: "Choose the source currency and target currency from the dropdown lists. Over 160 world currencies are supported with real-time exchange rates." },
    { title: "2. Enter Amount", desc: "Type the amount you want to convert. The converted value updates instantly as you type." },
    { title: "3. Review and Convert", desc: "View the converted amount with the current exchange rate displayed. Swap currencies to convert in the opposite direction." },
  ],
    faqs: [
    { question: "How many currencies are supported?", answer: "Over 160 world currencies are supported with exchange rates sourced from central banks and financial data providers." },
    { question: "How often are exchange rates updated?", answer: "Exchange rates are updated in real-time from financial data providers to ensure accurate conversions." },
    { question: "Can I use this offline?", answer: "No, live exchange rates require an internet connection. The tool uses cloud-based APIs for current rates." },
  ],
},
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: 'Logo Maker provides a drag-and-drop canvas with shape libraries, text tools, and icon collections for building brand logos.',
    dependencies: "Fabric.js / Canvas API",
    seoDescription: 'Free logo maker online — design professional logos with drag-and-drop tools. Choose from shape libraries, icons, and text styles. No design skills needed.',
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: 'Reduces PDF file size by compressing embedded images, removing redundant metadata, and optimizing object streams. Three compression tiers let you choose between maximum size reduction and high-quality preservation. Handles PDFs up to 50MB.',
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib",
    seoDescription: 'Free online PDF Compressor — reduce PDF file size by up to 90% with three compression tiers. Compress embedded images, remove metadata, optimize streams. ',
    instructions: [
      { title: "1. Upload Your PDF", desc: "Drag and drop or select a PDF file up to 50MB. The tool shows the current file size before compression." },
      { title: "2. Choose Compression Tier", desc: "Select from three tiers: Maximum Compression (smallest file, lower image quality), Balanced (good size/quality tradeoff), or High Quality (minimal visual loss)." },
      { title: "3. Download the Compressed PDF", desc: "Your compressed PDF is ready instantly. All processing runs locally — your document never leaves your device, ensuring complete privacy." },
    ],
    faqs: [
      { question: "How much can PDF compression reduce file size?", answer: "Typical reductions range from 40% to 90% depending on content. Image-heavy PDFs (scanned documents, brochures) compress the most. Text-only PDFs compress less since the text content itself is already efficient." },
      { question: "What's the difference between PDF, image, and video compressors?", answer: "PDF Compressor optimizes document files by compressing embedded images, removing metadata, and streamlining internal structures. Image Compressor works on standalone JPG/PNG/WebP files. Video Compressor reduces MP4/MOV/WebM files using video encoding. Each is specialized for its format." },
      { question: "Does compression affect text readability?", answer: "Text within PDFs remains fully readable at all compression tiers since it's stored as text (not images). Only embedded images are affected by compression. For maximum text clarity, choose the High Quality tier." },
      { question: "Is my document data private?", answer: "Yes. All PDF compression happens entirely in your browser. Your document is never uploaded, stored, or transmitted to any server. This is especially important for sensitive documents like contracts, reports, and financial statements." },
    ],
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: 'Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. Uses cloud-based processing.',
    seoDescription: 'Free online Word to PDF — Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. ',
    dependencies: "LibreOffice API / CloudConvert API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload Word Document", desc: "Select a .docx or .doc file. The converter preserves text formatting, fonts, tables, images, and basic layout." },
      { title: "2. Set PDF Options", desc: "Choose PDF compliance level (PDF/A-1b for archiving) and whether to embed fonts for consistent rendering across devices." },
      { title: "3. Download PDF", desc: "Your Word document is converted to PDF with formatting preserved. Download the result or open in a new tab." },
    ],
    faqs: [
      { question: "Are tracked changes visible in the PDF?", answer: "Tracked changes are accepted before conversion. The PDF shows the final document as if all changes were accepted." },
      { question: "Are Word macros preserved?", answer: "No. VBA macros and ActiveX controls are stripped during conversion. Only visible document content is included in the PDF." },
      { question: "Do embedded fonts render correctly?", answer: "When font embedding is enabled, the PDF includes the fonts used. The document looks identical on any device without font installation." },
    ],
  },
  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Calculator",
    description: 'Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic. Essential for everyday math — tips, discounts, tax rates, grade scores, and statistical comparisons where quick percentage answers are needed.',
    seoDescription: 'Free online Percentage Calculator — compute percentages, increases, decreases, and what-percent-of-what relationships. Perfect for tips, discounts, taxes, and everyday math. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Choose Your Calculation Type", desc: "Select from three modes: find what percent of Y is X, calculate percentage increase/decrease, or determine what X% of Y equals." },
      { title: "2. Enter Your Numbers", desc: "Type in the values for your calculation. Results update instantly as you type — no button to press." },
      { title: "3. Read Your Result", desc: "The exact percentage is displayed with decimal precision. Copy the result or adjust your inputs for a new calculation." },
    ],
    faqs: [
      { question: "Is this different from the Profit Margin or ROI calculators?", answer: "Yes. Percentage Calculator handles general everyday percentage math — tips, discounts, grade scores, statistics. Profit Margin Calculator focuses on pricing (revenue vs cost). ROI Calculator measures return on investment. Each serves a different business or personal need." },
      { question: "Can I calculate percentage increase over time?", answer: "Yes. Use the increase/decrease mode to compute the percentage change between two values — useful for comparing prices, salaries, or scores across time periods." },
      { question: "Does it handle decimal percentages like 8.5%?", answer: "Yes. The calculator supports decimal percentage values like 8.5%, 12.75%, or 0.5% with precise floating-point arithmetic." },
      { question: "Can I use this for tax calculations?", answer: "Yes. Calculate what a specific tax percentage adds to a purchase price, or work backwards from a total to find the original price before tax." },
    ],
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: 'Convert JPG images to PDF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JPG to PDF — Merges one or more JPG images into a single multi-page PDF file in the order you arrange them. ',
    dependencies: "jsPDF / Canvas API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload JPG Images", desc: "Select one or more JPG images from your device. Supported: JPEG, JPG, and JFIF formats. You can also drag and drop files directly." },
      { title: "2. Arrange Image Order", desc: "Drag thumbnails to reorder pages. Each JPG becomes one PDF page. The order in the PDF matches the thumbnail arrangement." },
      { title: "3. Generate & Download PDF", desc: "Choose page size (A4, Letter, or match image size) and orientation. Click Create PDF and download your multi-page document." },
    ],
    faqs: [
      { question: "Can I combine JPG and PNG in one PDF?", answer: "Yes. The tool accepts multiple image formats simultaneously. Mix JPG, PNG, WebP, and other formats in a single PDF output." },
      { question: "What happens to EXIF data?", answer: "EXIF orientation tags are respected — images are auto-rotated to display correctly. Other EXIF metadata is stripped from the PDF output." },
      { question: "Is there a file size limit?", answer: "Processing is done locally in your browser. Very large images (>50MB each) may take time. Total pages are limited by browser memory." },
    ],
  },
  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Calculator",
    description: 'Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Age Calculator — Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. ',
    dependencies: "Date-fns / Moment.js",
    instructions: [
      { title: "1. Enter Birth Date", desc: "Select your date of birth using the date picker." },
      { title: "2. Choose Reference Date", desc: "Use today's date or pick a custom date to calculate age on." },
      { title: "3. View Full Age", desc: "See your exact age in years, months, days, hours, minutes, and seconds." },
    ],
    faqs: [
      { question: "What is the exact age calculation?", answer: "The calculator computes age by subtracting the birth date from the reference date, accounting for leap years and month lengths." },
      { question: "Can I calculate age as of a past date?", answer: "Yes. Change the reference date from today to any past or future date." },
      { question: "Is this accurate for leap year babies?", answer: "Yes. February 29 birthdays are handled correctly with February 28 or March 1 used in non-leap years." },
    ],
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: 'Convert HEIC images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online HEIC to JPG — Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings. ',
    dependencies: "heic2any",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Upload Your HEIC File",
                "desc": "Upload an HEIC image captured from an iPhone or iPad. The tool decodes Apple's HEVC-compressed image into pixel data. HEIC files are typically 40-50% smaller than equivalent JPEGs."
          },
          {
                "title": "2. Handle Alpha and Metadata",
                "desc": "HEIC supports alpha channels, but JPEG doesn't. Choose a background color for transparent areas if present. HEIC EXIF data including depth maps and burst IDs are read for potential embedding."
          },
          {
                "title": "3. Set JPEG Quality and Download",
                "desc": "Set JPEG quality 1-100. Since HEIC efficiently compresses photos, quality 90-95 preserves most of the original detail. JPEG will be 2-3x larger than the HEIC at comparable quality. Download the universally-compatible JPEG."
          }
    ],
    faqs: [
          {
                "question": "Will I lose image quality converting HEIC to JPEG?",
                "answer": "HEIC uses HEVC compression which preserves more detail at smaller sizes. Converting to JPEG introduces JPEG's block-based artifacts. Using quality 95+ minimizes visible loss, but the HEIC file inherently has better quality-per-byte."
          },
          {
                "question": "What happens to Live Photos data from my iPhone?",
                "answer": "Live Photos consist of a HEIC image plus a video component. This conversion handles only the still image. The video portion is discarded. Use Apple's export tools to preserve Live Photo functionality."
          },
          {
                "question": "Does HEIC's 10-bit color depth get preserved in JPEG?",
                "answer": "No, JPEG supports only 8-bit per channel. HEIC's 10-bit HDR data is tonemapped to 8-bit SDR during conversion. This can result in banding in smooth gradients where HEIC had smoother transitions."
          }
    ]
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: 'Convert PDF images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PDF to JPG — Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear. ',
    dependencies: "PDF.js / Canvas API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF Document", desc: "Select a PDF file. Each page is rendered as a separate JPG image at your chosen quality level." },
      { title: "2. Set Image Quality", desc: "Choose JPG quality: 70% (small file, acceptable for previews), 90% (good quality for most uses), or 100% (maximum quality, large file)." },
      { title: "3. Download Images", desc: "Download individual JPG files or a ZIP archive containing all pages as separate images." },
    ],
    faqs: [
      { question: "What resolution are the JPG images?", answer: "Output resolution matches the PDF's native resolution, typically 72-150 DPI for screen PDFs, 300 DPI for print PDFs. Adjustable in settings." },
      { question: "Can I convert specific page ranges?", answer: "Yes. Enter a page range (e.g., 1-5, 8) to convert only selected pages instead of the entire document." },
      { question: "Do text layers remain?", answer: "No. JPG is a raster image format — all text, images, and vector graphics are flattened into a single image layer." },
    ],
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: 'Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF to PPT — Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. ',
    dependencies: "pdf2json / PptxGenJS",
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF File", desc: "Select a PDF document to convert to PowerPoint. Each PDF page becomes a separate slide." },
      { title: "2. Choose Layout", desc: "Select standard slide size (4:3 or 16:9) and whether to preserve the original aspect ratio of PDF pages." },
      { title: "3. Download PPTX", desc: "Your PDF is converted to an editable PowerPoint file. Text and images are placed on individual slides." },
    ],
    faqs: [
      { question: "Are PDF text boxes editable in PowerPoint?", answer: "Yes. Text extracted from the PDF is placed in editable text boxes on each slide. Formatting may need minor adjustments." },
      { question: "Do vector graphics remain vectors?", answer: "PDF vector graphics (logos, diagrams) are typically rasterized to PNG during conversion for compatibility." },
      { question: "Can I convert a multi-page PDF to multiple slides?", answer: "Yes. Each PDF page becomes one PowerPoint slide in order. Slide count matches the PDF page count." },
    ],
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: 'Creates stylish Unicode text in 40+ decorative font styles including double-struck, bubble, cursive, gothic, and small caps. Perfect for social media bios, gaming usernames, Discord profiles, and Instagram captions where standard fonts will not render.',
    seoDescription: 'Free online Fancy Text Generator — create stylish Unicode text in 40+ decorative font styles including double-struck, bubble, cursive, gothic, and small caps. Perfect for social media bios, gaming usernames, and profile customization. ',
    dependencies: "Unicode mapping",
    instructions: [
      { title: "1. Type or Paste Your Text", desc: "Enter the text you want to transform. The generator instantly shows previews in all 40+ Unicode font styles — no waiting or button clicks." },
      { title: "2. Browse Font Styles", desc: "Scroll through the gallery of styles including double-struck, bubble, cursive, gothic, small caps, fraktur, and monospace. Each style renders your text in real time." },
      { title: "3. Copy and Use Anywhere", desc: "Click any style to copy the transformed text to your clipboard. Use it in social media bios, game profiles, Discord names, Instagram captions, and anywhere that supports Unicode text." },
    ],
    faqs: [
      { question: "How is this different from Font Generator?", answer: "Fancy Text Generator offers 40+ decorative Unicode styles like double-struck (mathematical letters), bubble (circled characters), cursive (script-like), and gothic (fraktur). Font Generator focuses on bold, italic, monospace, and serif/sans-serif variants — more practical for formatting, less decorative." },
      { question: "Will the fancy text display on all devices?", answer: "The decorative Unicode characters render on most modern devices and platforms including iOS, Android, Windows, and macOS. The 40+ styles are chosen for broad Unicode support across social media, messaging apps, and games." },
      { question: "Can I use these for gaming usernames?", answer: "Yes. Many games and platforms (Minecraft, Roblox, Discord, Steam, Epic Games) support Unicode characters, letting you create unique display names that stand out with fancy styling in chat, leaderboards, and profiles." },
      { question: "Does this work on Instagram or Twitter bios?", answer: "Yes. Social media bios support Unicode text, so you can use fancy styles to customize your profile name, bio, highlights, and captions — adding visual flair where the platform only permits plain text entry." },
    ]
  },
  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: 'Segments the foreground subject from an image using a neural network, producing a transparent PNG. Max 20MB.',
    dependencies: "rembg / OpenCV / TensorFlow.js",
    seoDescription: 'Remove image backgrounds automatically with AI. Coming soon.',
    showInCategory: false,
    instructions: [
          {
                "title": "1. Upload Image with Subject",
                "desc": "Choose a photo with a clear subject against any background. The AI model works best with people, products, pets, and vehicles. For best results, ensure good contrast between the subject and background."
          },
          {
                "title": "2. Automatic Detection and Removal",
                "desc": "Our AI analyzes the image to detect the foreground subject. It creates a precise mask around edges, including fine details like hair, fur, or fuzzy boundaries. Processing takes 2-5 seconds depending on resolution."
          },
          {
                "title": "3. Refine and Download",
                "desc": "Use the edge brush to fix any imperfect mask areas. You can then place the subject on a solid color, upload a new background image, or download with a transparent PNG. Feather and smooth controls help blend edges naturally."
          }
    ],
    faqs: [
          {
                "question": "How accurate is the AI at detecting complex edges like hair?",
                "answer": "The model uses semantic segmentation trained on millions of images to handle fine details. Flyaway hairs and fur are preserved well, but very blurry edges or subjects blending into similar-colored backgrounds may need manual touch-up."
          },
          {
                "question": "Is my image stored on your servers after processing?",
                "answer": "Processed images are deleted from our servers within one hour. We do not use uploaded images for training or data collection. Your privacy and content ownership remain fully intact."
          },
          {
                "question": "Can I use background removal for batch processing?",
                "answer": "Background removal works on single images only in this tool. Each image requires individual AI inference to generate the correct mask, so batch processing isn't available — but the processing itself takes only seconds per image."
          }
    ]
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: 'Convert WEBP images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online WebP to JPG — Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google\'s modern format. ',
    dependencies: "Canvas API",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Upload Your WebP File",
                "desc": "Upload a WebP image to convert to JPEG. The tool checks if the WebP has an alpha channel — since JPEG has no transparency, you'll need to handle this. The WebP's encoding mode affects conversion quality."
          },
          {
                "title": "2. Handle Alpha Transparency",
                "desc": "If your WebP has transparency, choose a background color to fill the transparent areas. White is standard for most uses, black for dark-themed applications. The fill color becomes part of the JPEG output."
          },
          {
                "title": "3. Set JPEG Quality and Download",
                "desc": "Set JPEG quality 1-100. For web use, quality 85 typically matches the WebP's visual quality. JPEG's chroma subsampling reduces color resolution. Download the JPEG — file size depends on image complexity and quality setting."
          }
    ],
    faqs: [
          {
                "question": "Will JPEG compression add artifacts on top of WebP artifacts?",
                "answer": "Yes, you're layering lossy compression on top of WebP's lossy encoding. The result will have artifacts from both encoders. To minimize this, use high JPEG quality (90+) or start with a lossless WebP source."
          },
          {
                "question": "What happens to WebP's alpha channel in the JPEG output?",
                "answer": "Alpha information is discarded since JPEG doesn't support it. Transparent areas are filled with the background color you select. Semi-transparent edges may show visible halos against the chosen background color."
          },
          {
                "question": "Why convert from WebP to JPEG if WebP compresses better?",
                "answer": "JPEG is universally supported — every device, browser, and application can open JPEG. If you're sending images to someone with legacy software or uploading to a platform that doesn't accept WebP, JPEG is the safest choice."
          }
    ]
  },
  {
    id: "34b",
    name: "PNG to JPG",
    slug: "png-to-jpg",
    category: "Image",
    description: 'Convert PNG images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to JPG — Convert PNG images into space-efficient JPEG files. Ideal for photographs and complex images where smaller file size outweighs loss of transparency. ',
    dependencies: "Canvas API",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Upload Your PNG File",
                "desc": "Upload the PNG image you want to convert to JPEG. PNG files with many colors or large dimensions will benefit most from JPEG compression. The tool displays the PNG's bit depth and alpha channel status."
          },
          {
                "title": "2. Handle Alpha Transparency",
                "desc": "Since JPEG doesn't support transparency, choose a background color for transparent areas — white is standard for product photos, black works well for graphics. The color you pick fills all formerly transparent pixels."
          },
          {
                "title": "3. Set JPEG Quality and Download",
                "desc": "Adjust quality from 1-100. For web photos, 80-85 offers excellent compression with minimal visible loss. Higher sources with smooth gradients need less compression. Download the JPEG — typically 5-10x smaller than the PNG."
          }
    ],
    faqs: [
          {
                "question": "Why is my PNG with text blurry as a JPEG?",
                "answer": "JPEG's lossy compression introduces artifacts around sharp edges and text. The blocking artifacts are most visible on high-contrast edges. Increase quality to 95+ if text sharpness is critical, or consider keeping the file as PNG."
          },
          {
                "question": "Will the JPEG have the same color accuracy as my PNG?",
                "answer": "JPEG uses YCbCr color space with chroma subsampling, which discards some color detail that PNG preserves exactly. For most photos, the difference is imperceptible, but for graphics with exact color requirements, PNG is superior."
          },
          {
                "question": "What's the best JPEG quality for printing from a PNG source?",
                "answer": "Use quality 100 for print. The file will be larger than a compressed JPEG, but it preserves maximum detail from the original PNG for high-quality output on paper or photo stock."
          }
    ]
  },
  {

    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: 'Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Wheel of Names — Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. ',
    dependencies: "Canvas API / GSAP",
    instructions: [
          {
                "title": "1. Add Names to the Wheel",
                "desc": "Type names one per line or paste a comma-separated list. Each name becomes a colored segment on the wheel. You can add up to 100 names."
          },
          {
                "title": "2. Customize Wheel Appearance",
                "desc": "Adjust segment colors, add or remove the center logo, and toggle sound effects. The wheel automatically sizes segments evenly."
          },
          {
                "title": "3. Spin the Wheel",
                "desc": "Click the spin button or press the spacebar. The wheel spins with realistic physics simulation and deceleration. The winning name is highlighted with a popup."
          }
    ],
    faqs: [
          {
                "question": "Can I remove a name from the wheel after it is selected?",
                "answer": "Yes, toggle removal mode. When enabled, selected names are removed from the wheel after each spin, preventing repeat selections."
          },
          {
                "question": "Does the wheel use true randomness for the outcome?",
                "answer": "The spin animation is visual only — the outcome is determined by cryptographically secure random selection before the animation begins."
          },
          {
                "question": "Can I save my name list for future use?",
                "answer": "Yes, name lists are saved to local storage. You can also export the list as a text file and import it later."
          }
    ]
},
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: 'Reduces JPG, PNG, and WebP file sizes using smart compression with a side-by-side quality preview slider. Balance file size and visual quality visually — max 20MB per image. Perfect for web optimization, email attachments, and social media uploads.',
    dependencies: "HTML5 Canvas / libjpeg-turbo",
    seoDescription: 'Free online Image Compressor — reduce JPG, PNG, and WebP file sizes with a side-by-side quality preview slider. Perfect for web optimization, email, and social media. ',
    instructions: [
      { title: "1. Upload Your Image", desc: "Drag and drop a JPG, PNG, or WebP image up to 20MB. The tool immediately shows the original file size and preview." },
      { title: "2. Adjust Compression Level", desc: "Use the quality slider to find the sweet spot between file size and visual quality. The side-by-side preview helps you compare instantly." },
      { title: "3. Download the Compressed Image", desc: "Once satisfied, download the compressed image. All processing happens locally — no uploads, no server storage, complete privacy." },
    ],
    faqs: [
      { question: "How much can this compress an image?", answer: "Typical compression reduces JPG files by 40-80% and PNG files by 50-90% depending on the quality setting. Complex photographs compress less than simple graphics. Use the preview slider to find the right balance for your use case." },
      { question: "What's the difference between image, PDF, and video compressors?", answer: "Image Compressor works on JPG/PNG/WebP photos and graphics using perceptual quality settings. PDF Compressor targets document files by compressing embedded images and stripping metadata. Video Compressor reduces MP4/MOV/WebM file size using H.264/AV1 encoding. Each is optimized for its media type." },
      { question: "Does compression reduce image quality permanently?", answer: "The compressed image is a new file — your original remains untouched. If the quality is too low, adjust the slider higher and re-download. Lossy compression (JPG, WebP) discards data permanently, so keep your original for archival." },
      { question: "What's the maximum file size?", answer: "The image compressor handles files up to 20MB. For larger images or bulk processing, use the Bulk Image Compressor which supports multiple files simultaneously." },
    ]
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: 'Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Object Remover — Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels. ',
    dependencies: "Lama Cleaner",
    instructions: [
          {
                "title": "1. Upload Your Image",
                "desc": "Load the photo containing unwanted objects, people, text, or blemishes. Works with JPEG, PNG, and WebP files. Higher resolution images yield better inpainting results."
          },
          {
                "title": "2. Brush Over the Object",
                "desc": "Use the brush tool to paint over everything you want removed. Adjust brush size for precision — small for wires and text, large for people and vehicles. The mask turns red so you see exactly what's selected."
          },
          {
                "title": "3. Generate and Review",
                "desc": "Hit Remove and the AI fills the masked area with contextually appropriate content. It analyzes surrounding textures, lighting, and patterns to reconstruct what should be underneath. Download the cleaned image when satisfied."
          }
    ],
    faqs: [
          {
                "question": "What happens behind the masked area during removal?",
                "answer": "The AI uses generative inpainting — it studies the pixels surrounding your mask and synthesizes new content that matches the lighting, texture, and perspective. Results depend on how much context is available around the masked region."
          },
          {
                "question": "Can I undo or redo a removal?",
                "answer": "Yes. The tool keeps a full history of your edit session. You can undo back to the original image at any point. If you remove too much, simply undo and paint a more precise mask."
          },
          {
                "question": "Does this work for removing watermarks from photos?",
                "answer": "It can remove watermarks, but results vary. Simple semi-transparent watermarks over uniform backgrounds work well. Complex watermarks over detailed areas may leave visible artifacts since the AI has limited context to reconstruct from."
          }
    ]
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: 'Convert PowerPoint presentations to PDF with accurate slide rendering. Server-side conversion preserves fonts and layouts.',
    seoDescription: 'Free online PPT to PDF — Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout. ',
    dependencies: "LibreOffice API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload PowerPoint File", desc: "Select a .pptx or .ppt presentation. The converter preserves slide layout, text formatting, images, and shapes." },
      { title: "2. Set PDF Options", desc: "Choose to include one slide per page or multiple slides per page (handout layout). Select slide range if you only need specific slides." },
      { title: "3. Download PDF", desc: "Your PowerPoint is converted to PDF. Animations and transitions are removed — each slide appears in its final state." },
    ],
    faqs: [
      { question: "Are speaker notes included?", answer: "Optionally. Toggle 'include speaker notes' to append notes pages after each slide, or 'notes only' for a text-only notes document." },
      { question: "Do embedded videos and audio play in the PDF?", answer: "No. Multimedia elements are not playable in the PDF. Placeholder icons indicate where media was in the original presentation." },
      { question: "Are SmartArt graphics preserved?", answer: "Yes. SmartArt diagrams are converted to static vector graphics in the PDF, preserving their visual appearance." },
    ],
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: 'Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). Uses cloud-based processing.',
    seoDescription: 'Free online Temporary Email Generator — Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). ',
    dependencies: "Mailinator API / Custom Backend",
    showInCategory: false,
    instructions: [
      { title: "1. Choose Expiration Time", desc: "Select how long your disposable inbox should last — from 5 minutes up to 48 hours. The inbox and all messages are permanently deleted after expiration." },
      { title: "2. Generate Your Temporary Email", desc: "Click generate to create a unique disposable email address. Copy the address and use it anywhere you need an email — signups, verifications, or one-time communications." },
      { title: "3. Check Inbox and Read Messages", desc: "Refresh the inbox to see incoming messages. Click any email to read its contents. No password, no signup, no personal information needed." },
    ],
    faqs: [
      { question: "How long does the temporary email last?", answer: "You can choose from 5 minutes to 48 hours. The email address and all associated messages are permanently deleted once the selected time expires. No recovery is possible." },
      { question: "Can I reply to emails?", answer: "No. This is a receive-only disposable email service. It's designed for receiving verification emails, one-time links, and testing — not for ongoing correspondence." },
      { question: "Is this anonymous?", answer: "Yes. No personal information, signup, or login is required to use the temporary email generator. Your IP address may be logged for abuse prevention but is not associated with any account." },
      { question: "What happens to my data after expiration?", answer: "All messages, attachments, and the email address itself are permanently deleted from the server after the selected expiration time. No backups or copies are retained." },
    ]
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: 'Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate. No signup or account required.',
    seoDescription: 'Free online Screen Recorder Extension — Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate. ',
    dependencies: "MediaRecorder API",
    instructions: [
      { title: "1. Configure Capture Settings", desc: "Choose what to capture — browser tab, full screen, or application window. Set your preferred resolution and frame rate for the recording." },
      { title: "2. Generate the Extension", desc: "Click the generate button to create a custom browser extension configured with your capture settings. The tool packages everything into a downloadable extension file." },
      { title: "3. Install and Record", desc: "Load the extension into your browser's extension manager. Click the extension icon to start and stop recordings — no account or signup required." },
    ],
    faqs: [
      { question: "What browsers does this extension work with?", answer: "The generated extension uses the standard MediaRecorder API supported by Chrome, Firefox, Edge, and other Chromium-based browsers. Safari support may vary depending on your version." },
      { question: "Can I change the resolution after generating?", answer: "Resolution is configured before generation. If you need a different resolution, simply regenerate the extension with your new settings — the process takes seconds and no account is needed." },
      { question: "Where are recordings saved?", answer: "Recordings are saved locally to your device's default downloads folder. Nothing is uploaded to any server — everything stays on your computer." },
    ]
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: 'Combines two or more PDF files into one contiguous document with a drag-and-drop reorder interface for the input list. Legal assistants compiling.',
    dependencies: "pdf-lib",
    seoDescription: 'Merge PDF files online free — combine multiple PDFs into one document with drag-and-drop reordering. No uploads, 100% secure and private.',
    instructions: [
      { title: "1. Upload PDF Files", desc: "Select two or more PDF files to merge. Drag and drop to reorder them in the list." },
      { title: "2. Set Merge Options", desc: "Choose to merge all files into one PDF (append mode) or interleave pages from multiple files." },
      { title: "3. Download Merged PDF", desc: "Your combined PDF is ready. All original content including bookmarks, links, and form fields are preserved." },
    ],
    faqs: [
      { question: "Can I merge files with different page sizes?", answer: "Yes. Each page retains its original size in the merged PDF. The output is a mixed-format document." },
      { question: "Are PDF bookmarks merged?", answer: "Yes. Bookmarks from each file are combined into a single bookmark tree with nested sections per source file." },
      { question: "Is there a file limit?", answer: "Processing is local. The limit depends on your browser's available memory — typically files up to 500MB total." },
    ],
  },
  {

    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: 'Renders a scannable QR code from any text or URL using a client-side Reed-Solomon encoder. Download as PNG.',
    dependencies: "qrcode.js",
    seoDescription: 'Free QR code generator online — create QR codes for URLs and text. Download high-resolution PNG. 100% free, no account needed.',
    instructions: [
          {
                "title": "1. Enter Your Data",
                "desc": "Type the URL, text, phone number, or email address you want to encode into the QR code. The input can be up to 2,953 bytes of alphanumeric data."
          },
          {
                "title": "2. Customize Visuals",
                "desc": "Choose the foreground color, background color, and error correction level (L, M, Q, H). Higher error correction allows up to 30% damage while remaining scannable."
          },
          {
                "title": "3. Download the QR Code",
                "desc": "Click download to save the QR code as a PNG or SVG image. PNG is best for print at 300 DPI, SVG for scaling without quality loss."
          }
    ],
    faqs: [
          {
                "question": "What is the maximum data capacity of a QR code?",
                "answer": "The maximum capacity depends on the version and error correction level. Version 40 with L-level correction can hold 7,089 numeric or 4,296 alphanumeric characters."
          },
          {
                "question": "Can I add a logo or image in the center of the QR code?",
                "answer": "Yes, toggle the center logo option to upload a small image. With high error correction (H), the QR remains scannable even with a central graphic."
          },
          {
                "question": "Do QR codes expire or need renewal?",
                "answer": "No, the QR code is a static image that never expires. However, if the encoded URL points to a service that changes, update your marketing materials with a new code."
          }
    ]
},
  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: 'Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Excel to PDF — Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. ',
    dependencies: "SheetJS / jsPDF",
    showInCategory: false,
    instructions: [
      { title: "1. Upload Excel File", desc: "Select a .xlsx or .xls spreadsheet. The tool processes all worksheets in the workbook." },
      { title: "2. Choose Sheet & Layout", desc: "Select specific sheets or convert all. Choose landscape or portrait orientation and whether to fit all columns on one page." },
      { title: "3. Export as PDF", desc: "Your spreadsheet is converted to PDF with cell formatting, borders, and conditional formatting preserved." },
    ],
    faqs: [
      { question: "Are Excel formulas evaluated?", answer: "Yes. Cell values as displayed (including formula results) are captured in the PDF. Formula syntax is not shown — only the computed values." },
      { question: "Do charts and pivot tables render?", answer: "Yes. Charts, pivot tables, sparklines, and conditional formatting icons are rendered as static graphics in the PDF." },
      { question: "What if my sheet is wider than one page?", answer: "Select 'fit to page width' to scale columns to fit. Alternatively, choose landscape orientation or allow multiple horizontal pages." },
    ],
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Finance",
    description: 'Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online EMI Calculator — Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Loan Details", desc: "Input the loan amount, annual interest rate, and loan tenure in months or years." },
    { title: "2. Calculate EMI", desc: "The tool instantly computes your monthly EMI, total interest payable, and total payment." },
    { title: "3. View Amortization", desc: "Review the full amortization schedule showing the breakdown of principal vs interest for each payment." },
  ],
    faqs: [
    { question: "What is an EMI?", answer: "EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay a loan, consisting of both principal and interest components." },
    { question: "How is EMI calculated?", answer: "EMI is calculated using the formula: EMI = P x R x (1+R)^N / ((1+R)^N - 1), where P is loan amount, R is monthly interest rate, and N is number of months." },
    { question: "Can I change the loan tenure?", answer: "Yes. Adjust the tenure to see how it affects your monthly EMI and total interest payable." },
  ],
},
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: 'Counts characters with and without spaces and compares your text against platform-specific limits — Twitter/X posts (280), SMS messages (160), SEO meta descriptions (160), Facebook posts (63,206), and LinkedIn summaries (2,600). Real-time counting with space/no-space toggle.',
    seoDescription: 'Free online Character Counter — count characters with and without spaces for Twitter (280), SMS (160), SEO meta descriptions, Facebook, and LinkedIn limits. Real-time counting as you type. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the content you want to measure. The character counter updates instantly — no buttons to press or pages to reload." },
      { title: "2. Check Platform Limits", desc: "Each section shows how your text fits into specific platform limits: Twitter (280), SMS (160), SEO meta descriptions (160), Facebook posts (63,206), and LinkedIn (2,600)." },
      { title: "3. Toggle Space Counting", desc: "Use the with/without spaces toggle to match the requirement of your target platform. Some count spaces, others don't — the tool shows both." },
    ],
    faqs: [
      { question: "What character limits does this tool check?", answer: "The character counter shows limits for Twitter/X posts (280 characters), single SMS messages (160), Google meta descriptions (160), Facebook posts (63,206), and LinkedIn headlines (2,600). These cover the most common character-constrained platforms." },
      { question: "What's the difference between Character Counter and Word Counter?", answer: "Character Counter focuses on fitting text into platform-specific space constraints with real-time progress bars for each limit. Word Counter focuses on writing quality — readability scores, grade levels, syllable counts, and speaking time. They complement each other." },
      { question: "Why count characters instead of words?", answer: "Many platforms enforce character limits, not word limits. A tweet can hold up to 280 characters regardless of word count. SMS messages split at 160 characters. Meta descriptions get truncated past 160 characters. Character counting ensures your content stays within each platform's constraint." },
      { question: "Does the count include spaces?", answer: "The tool shows both counts — with spaces and without spaces — because different platforms and submission forms count differently. The toggle lets you switch between views to match the requirement of your target platform." },
    ]
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: 'Transcribe video audio to text using AI-powered speech recognition. Supports multiple languages and speaker diarization.',
    seoDescription: 'Free online Video to Text Transcription — Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition. ',
    dependencies: "Whisper API",
    instructions: [
      { title: "1. Upload Your Video", desc: "Select a video file from your device. The tool supports common formats like MP4, MOV, AVI, and MKV. Your file is processed using cloud-based AI speech recognition." },
      { title: "2. Choose Language and Settings", desc: "Select the spoken language in your video for optimal accuracy. Enable speaker diarization if you need the transcript to distinguish between different speakers." },
      { title: "3. Generate and Export Transcript", desc: "Click the transcribe button to convert speech to text. Once complete, download your transcript as a text file or copy it directly from the results panel." },
    ],
    faqs: [
      { question: "What video formats are supported?", answer: "The tool supports MP4, MOV, AVI, MKV, WebM, and most common video containers. If your format isn't listed, try converting the video to MP4 first." },
      { question: "How does speaker diarization work?", answer: "Speaker diarization analyzes audio patterns to identify when different people are speaking. The transcript labels each segment with a speaker identifier (Speaker 1, Speaker 2, etc.) making it easier to follow conversations and meetings." },
      { question: "How long does transcription take?", answer: "Processing time depends on video length and server load. A 30-minute video typically takes 3-5 minutes to transcribe. Longer videos may take proportionally more time." },
      { question: "What languages are supported?", answer: "The speech recognition supports multiple languages including English, Spanish, French, German, Hindi, Chinese, Arabic, Portuguese, and many more. Select the spoken language before starting transcription for best accuracy." },
    ]
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: 'Analyzes your writing with real-time word count, sentence count, syllable count, paragraphs, and advanced readability metrics — Flesch-Kincaid Reading Ease, Grade Level, estimated speaking time, and keyword density. Essential for writers, students, and SEO professionals optimizing content for readability.',
    dependencies: "Vanilla JS",
    seoDescription: 'Free online Word Counter — analyze writing with real-time word, sentence, syllable, and paragraph counts plus Flesch-Kincaid readability scores, grade level, speaking time, and keyword density. ',
    instructions: [
      { title: "1. Type or Paste Your Content", desc: "Enter your text directly or paste from Word, Google Docs, or any writing app. The dashboard updates in real time as you type or edit." },
      { title: "2. Review Readability & Stats", desc: "The dashboard shows word count, sentence count, syllable count, paragraphs, and advanced metrics including Flesch-Kincaid Grade Level and Reading Ease scores." },
      { title: "3. Optimize Your Writing", desc: "Use the readability insights to adjust your content for your target audience. Aim for a grade level matching your readers — the tool highlights areas for improvement." },
    ],
    faqs: [
      { question: "What readability scores does this tool provide?", answer: "This word counter calculates Flesch-Kincaid Reading Ease (0-100 scale where 60-70 is plain English) and Flesch-Kincaid Grade Level (US school grade equivalent). It also estimates speaking time at 150 words per minute and tracks keyword density for SEO content optimization." },
      { question: "What's the difference between Word Counter and Character Counter?", answer: "Word Counter focuses on writing quality and readability analysis — word/sentence/paragraph counts, syllable counts, grade level, and speaking time. Character Counter focuses on platform-specific character limits like Twitter (280), SMS (160), and meta descriptions (160). Both are useful but serve different purposes." },
      { question: "Can I use this for SEO content?", answer: "Yes. The word counter displays total words, unique words, and keyword density percentages — essential for SEO writing where word counts and readability directly impact search rankings. Use it alongside our SEO tools for comprehensive content optimization." },
      { question: "Does it update in real time?", answer: "Yes. The word counter updates instantly as you type, paste, or delete text. Every keystroke triggers a fresh analysis of all metrics — word count, readability, syllable count, and speaking time." },
    ]
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: 'Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset sizes. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Crop Image — Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset sizes.',
    dependencies: "Cropper.js",
    instructions: [
          {
                "title": "1. Upload Your Image",
                "desc": "Select an image from your device. Any common format is accepted — JPEG, PNG, WebP, GIF, BMP, TIFF. The image appears in a canvas with a adjustable selection overlay."
          },
          {
                "title": "2. Select Crop Area",
                "desc": "Drag the corner handles to define your crop region. Choose from preset aspect ratios: 1:1 for square, 4:3 for standard, 16:9 for widescreen, 3:2 for print, or enter a custom ratio. Gridlines overlay helps with composition using the rule of thirds."
          },
          {
                "title": "3. Apply Crop and Save",
                "desc": "Click Apply to trim the image to your selected region. The output retains the original file format. Optionally set output dimensions in pixels if you need exact sizes for web or print use."
          }
    ],
    faqs: [
          {
                "question": "Does cropping reduce image quality?",
                "answer": "No, cropping simply discards pixels outside your selection area. The remaining pixels retain their original quality. Unlike resizing, no interpolation or compression happens during a crop operation."
          },
          {
                "question": "Can I crop to a specific pixel dimension?",
                "answer": "Yes, switch to custom dimensions mode and enter exact width and height in pixels. The crop overlay adjusts to match. If your aspect ratio doesn't match, the tool shows you the closest fit."
          },
          {
                "question": "What if I crop too much and want to go back?",
                "answer": "You can undo the crop within the session. However, once you close the tool or start a new crop, the original cropped pixels are gone. Always save a copy if you think you might need the full image later."
          }
    ]
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: 'Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Social Media Post Maker — Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. ',
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: 'Convert MKV video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MKV to MP4 — Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream. ',
    dependencies: "FFmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Choose MKV File", desc: "Upload or drag an .mkv file into the converter." },
      { title: "2. Select Codec", desc: "Choose H.264 for broad compatibility or H.265 for better compression." },
      { title: "3. Start Conversion", desc: "Convert and download as MP4 with all audio tracks preserved." },
    ],
    faqs: [
      { question: "Are all MKV codecs supported?", answer: "Common codecs like H.264, H.265, VP9, and AV1 are supported. Unsupported codecs are re-encoded." },
      { question: "What about subtitles?", answer: "MKV subtitles can be burned into the video or converted to MP4-compatible formats." },
      { question: "Is the conversion fast?", answer: "Conversion speed depends on file size and your device. Smaller files convert in seconds." },
    ],
  },
  {
    id: "52",
    name: "Text to Speech (TTS)",
    slug: "text-to-speech-tts",
    category: "Audio",
    description: "AI voice generator with Indian accents",
    dependencies: "Google Cloud TTS / ElevenLabs",
    seoDescription: 'Free text to speech online with Indian accents — convert text to natural-sounding audio. AI voices in Hindi, Tamil, Telugu, and more. No sign-up needed.',
    instructions: [
      { title: "1. Enter Text", desc: "Type or paste the text you want converted to speech." },
      { title: "2. Choose Voice & Settings", desc: "Select from multiple voices, adjust speed, pitch, and volume. Supports 30+ languages." },
      { title: "3. Generate & Download", desc: "Preview the audio and download as MP3 or WAV file." },
    ],
    faqs: [
      { question: "What languages are supported?", answer: "30+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, and more." },
      { question: "How many voices are available?", answer: "Multiple voices per language, including different genders and accents. Premium voices offer more natural intonation." },
      { question: "Can I adjust the speaking speed?", answer: "Yes. Adjust speed from 0.5x (slow) to 2x (fast). Pitch and volume are also adjustable." },
    ],
  },
  {
    id: "53",
    name: "AI Paraphrasing Tool",
    slug: "ai-paraphrasing-tool",
    category: "AI",
    description: 'Rewrite sentences and paragraphs while preserving meaning. Perfect for students, writers, and content creators.',
    dependencies: "HuggingFace",
    seoDescription: 'Free AI paraphrasing tool — rewrite sentences and paragraphs while preserving meaning. Perfect for students, writers, and content creators. ',
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the sentences or paragraphs you want to rewrite. The tool preserves the original meaning while finding new ways to express your content." },
      { title: "2. Choose Paraphrase Options", desc: "Select your desired style — standard, fluent, formal, or creative. Adjust how much the output differs from the original using a similarity slider." },
      { title: "3. Review and Copy", desc: "View the rewritten version alongside the original. Copy the paraphrased text or regenerate for an alternative result." },
    ],
    faqs: [
      { question: "How does AI paraphrasing work?", answer: "The AI analyzes your text's meaning, sentence structure, and word choices, then reconstructs it using alternative vocabulary and phrasing while preserving the original message and intent." },
      { question: "Is the paraphrased text plagiarism-free?", answer: "The tool produces original rewrites, but you should always check the output for accuracy and run it through a plagiarism detector if you're submitting it academically or professionally." },
      { question: "What is the difference between standard and creative modes?", answer: "Standard mode makes conservative changes — synonym replacement and minor restructuring. Creative mode makes more substantial changes — rewriting entire sentences and changing the flow while keeping the core meaning." },
      { question: "Can I paraphrase academic papers?", answer: "Yes, but use it as a starting point. Academic writing requires precise terminology that may not survive paraphrasing. Always verify technical accuracy and cite your sources." },
    ]
  },
  {

    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: 'Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Random Number Generator — Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. ',
    dependencies: "Math.random()",
    instructions: [
          {
                "title": "1. Set Range Boundaries",
                "desc": "Enter a minimum and maximum value in the range fields. The generator will produce a random integer between these two bounds using a cryptographically secure random function."
          },
          {
                "title": "2. Choose Quantity",
                "desc": "Specify how many random numbers you need in a single batch — from 1 up to 100. Each number is independently generated so results never repeat in a predictable pattern."
          },
          {
                "title": "3. Copy or Download Results",
                "desc": "Once generated, click the copy button to copy all numbers to your clipboard as a comma-separated list, or download them as a plain text file."
          }
    ],
    faqs: [
          {
                "question": "Can I generate floating-point numbers instead of integers?",
                "answer": "No, this generator produces whole integers only. For decimal values, round the result yourself or use a calculator tool after generation."
          },
          {
                "question": "Is the random number generation truly random?",
                "answer": "This generator uses window.crypto.getRandomValues, a cryptographically secure pseudo-random number generator. It is suitable for lotteries, giveaways, and security-sensitive draws."
          },
          {
                "question": "What happens if I set the minimum higher than the maximum?",
                "answer": "The tool automatically swaps the values so the lower number becomes the minimum and the higher becomes the maximum. No error is thrown."
          }
    ]
},
  {

    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Utility",
    description: 'Takes any long URL and generates a compact, shareable short link with optional custom alias support. Uses cloud-based processing.',
    seoDescription: 'Free online URL Shortener — Takes any long URL and generates a compact, shareable short link with optional custom alias support. ',
    dependencies: "Node.js / Redis",
    instructions: [
          {
                "title": "1. Enter the Long URL",
                "desc": "Paste the URL you want to shorten. The tool validates that the URL is properly formatted and includes a protocol (http:// or https://)."
          },
          {
                "title": "2. Customize Slug (Optional)",
                "desc": "Optionally enter a custom alias for the shortened URL. If left blank, a random 6-character alphanumeric slug is generated."
          },
          {
                "title": "3. Copy Short URL",
                "desc": "Click shorten to generate the short URL. The result appears below with a copy button. The short URL redirects to your original URL when visited."
          }
    ],
    faqs: [
          {
                "question": "How long does the shortened URL remain active?",
                "answer": "URLs created with this tool do not expire. They remain active indefinitely unless explicitly deleted through the management dashboard."
          },
          {
                "question": "Can I set a password or expiration date on a short URL?",
                "answer": "No, the basic shortener supports neither passwords nor expirations. For these features, consider a premium URL shortening service."
          },
          {
                "question": "Does the tool track click statistics for short URLs?",
                "answer": "Yes, basic analytics are available — total clicks, unique clicks, and top referrers. Access the stats by appending /stats to your short URL."
          }
    ]
},
  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: 'Extract tables from PDF into editable XLSX spreadsheets with accurate column alignment.',
    dependencies: "pdf2json / SheetJS",
    seoDescription: 'Convert PDF to Excel online free — extract tables from PDF into editable XLSX spreadsheets. Accurate column alignment. ',
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF with Tables", desc: "Select a PDF containing tabular data. The tool identifies tables using horizontal and vertical line detection." },
      { title: "2. Review Detected Tables", desc: "Preview extracted tables. Adjust detection sensitivity if the tool misses or merges table boundaries incorrectly." },
      { title: "3. Export as Excel", desc: "Download the .xlsx file with each table on a separate worksheet, or all tables combined into one sheet." },
    ],
    faqs: [
      { question: "What types of tables work best?", answer: "Tables with clear borders, consistent column alignment, and simple headers convert best. Borderless tables or merged cells may need manual correction." },
      { question: "Can I extract specific tables only?", answer: "Yes. Select individual tables from the preview to export only what you need, rather than all detected tables." },
      { question: "Are number formats preserved?", answer: "The tool attempts to detect number, date, and currency formatting. Complex custom formats may not transfer exactly." },
    ],
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: 'Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. No signup or account required.',
    seoDescription: 'Free online Unlock PDF — Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. ',
    dependencies: "qpdf",
    instructions: [
      { title: "1. Upload Protected PDF", desc: "Select a password-protected or restricted PDF file." },
      { title: "2. Enter Password", desc: "Enter the permissions password to unlock the PDF. If you only have the user password, you can open but may not remove restrictions." },
      { title: "3. Download Unlocked PDF", desc: "Your PDF is decrypted with all restrictions removed. The output PDF is free to print, edit, and copy." },
    ],
    faqs: [
      { question: "What if I forgot the password?", answer: "PDF passwords cannot be recovered or cracked by this tool. You need the original password set during protection." },
      { question: "Does unlocking remove the password permanently?", answer: "Yes. The downloaded PDF has no encryption or restrictions. It behaves like any unprotected PDF." },
      { question: "Can I unlock PDFs restricted by DRM?", answer: "No. Adobe DRM, Enterprise Rights Management, and similar systems require their respective authorization tools." },
    ],
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: 'Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Image Enhancer — Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files. ',
    dependencies: "Real-ESRGAN",
    instructions: [
          {
                "title": "1. Upload Your Photo",
                "desc": "Choose a photo that needs quality improvement — old scans, low-light shots, or compressed images. The enhancer supports JPEG, PNG, and WebP. Larger files give the AI more data to work with for better results."
          },
          {
                "title": "2. Adjust Enhancement Settings",
                "desc": "Use sliders to control brightness, contrast, saturation, sharpness, and noise reduction. Auto-enhance applies an AI-optimized combination. Preview changes in real-time with a split-view comparison."
          },
          {
                "title": "3. Apply and Export",
                "desc": "Once satisfied, apply the enhancements. You can further upscale resolution up to 4x using AI super-resolution. Download in your chosen format — PNG for maximum quality or JPEG for manageable file sizes."
          }
    ],
    faqs: [
          {
                "question": "Can this tool fix severely blurry photos?",
                "answer": "The sharpening and AI upscaling can improve mild to moderate blur, but it cannot fix extreme motion blur or out-of-focus shots. The AI reconstructs detail based on patterns, but it cannot invent information that wasn't captured."
          },
          {
                "question": "Does noise reduction remove grain from old film scans?",
                "answer": "Yes, the noise reduction filter is effective on film grain and digital sensor noise. Use the strength slider carefully — too much reduction can create a waxy, plastic-looking surface. Medium settings preserve texture while removing grain."
          },
          {
                "question": "What is the maximum upscale resolution supported?",
                "answer": "You can upscale up to 4x the original dimensions in each axis. A 1000x1000 pixel image can become 4000x4000. Beyond that, the AI lacks sufficient source data to generate convincing detail."
          }
    ]
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Finance",
    description: 'Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SIP Calculator — Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter SIP Details", desc: "Input your monthly investment amount, expected annual return rate, and investment tenure." },
    { title: "2. Calculate Returns", desc: "The tool computes the total invested amount, estimated returns, and maturity value." },
    { title: "3. Review Growth", desc: "View the year-wise growth chart showing how your investment compounds over time." },
  ],
    faqs: [
    { question: "What is SIP?", answer: "SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly in mutual funds, allowing you to benefit from rupee cost averaging and compounding." },
    { question: "How are returns calculated?", answer: "Returns are calculated using compound interest on monthly investments at the expected annual return rate. Actual returns may vary." },
    { question: "Can I change the investment frequency?", answer: "This calculator assumes monthly SIP. For quarterly or annual investments, adjust the monthly amount accordingly." },
  ],
},
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Health",
    description: 'Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online BMI Calculator — Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Height and Weight", desc: "Input your height and weight using either metric (cm/kg) or imperial (ft/in/lbs) units. The tool converts automatically for the BMI calculation." },
      { title: "2. View Your BMI and Category", desc: "Your BMI value is calculated instantly alongside your weight category — underweight, normal, overweight, or obese. No submission button needed." },
      { title: "3. Understand Your Result", desc: "Review the BMI chart to see where you fall. Use this as a general health screening tool — all calculations happen locally in your browser." }
    ],
    faqs: [
      { question: 'What is BMI and how is it calculated?', answer: 'BMI (Body Mass Index) is calculated by dividing weight in kilograms by height in meters squared. It provides a general indication of whether your weight is in a healthy range relative to your height.' },
      { question: 'Is BMI accurate for everyone?', answer: 'BMI is a useful screening tool but doesn\'t account for muscle mass, bone density, or body composition. Athletes may show as overweight despite low body fat. Older adults may have normal BMI but low muscle mass.' },
      { question: 'What are the BMI ranges?', answer: 'Underweight: below 18.5, Normal: 18.5-24.9, Overweight: 25-29.9, Obese Class I: 30-34.9, Class II: 35-39.9, Class III: 40+. Always consult a healthcare provider for a complete health assessment.' }
    ]
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: 'Transcribe audio files to text using AI-powered speech recognition. Supports MP3, WAV, M4A, and more formats.',
    seoDescription: 'Free online Audio to Text Transcription — Convert spoken audio from uploaded files into editable text. Uses cloud-based processing.',
    dependencies: "Whisper API",
    instructions: [
      { title: "1. Upload Your Audio File", desc: "Select an audio file from your device. The tool supports MP3, WAV, M4A, FLAC, and OGG formats. Drag and drop or use the file picker." },
      { title: "2. Select Language and Processing Options", desc: "Choose the spoken language for better recognition accuracy. You can also enable punctuation restoration and automatic paragraph detection for cleaner output." },
      { title: "3. Transcribe and Export", desc: "Start the transcription process. Once complete, review the text in the editor panel, make any corrections, and download as TXT or copy to clipboard." },
    ],
    faqs: [
      { question: "What audio formats are supported?", answer: "The tool supports MP3, WAV, M4A, FLAC, OGG, and AAC. For best results, use clear audio with minimal background noise and a sample rate of at least 16kHz." },
      { question: "Is there a file size limit?", answer: "File size limits depend on your browser and the cloud processing backend. Most files under 200MB process without issues. Larger files may need to be split into smaller segments first." },
      { question: "How accurate is the transcription?", answer: "Accuracy depends on audio quality, speaker clarity, background noise, and language. Clean recordings with single speakers in quiet environments typically achieve 90-95% accuracy. Accents and technical vocabulary may reduce accuracy slightly." },
      { question: "Can I edit the transcript after processing?", answer: "Yes. The results appear in an editable text panel where you can make corrections, add punctuation, or reformat the content before exporting." },
    ]
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: 'Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. No signup or account required.',
    seoDescription: 'Free online Meme Generator — Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. ',
    dependencies: "Canvas API",
    instructions: [
          {
                "title": "1. Choose or Upload a Template",
                "desc": "Pick from our library of trending meme templates — Drake, Distracted Boyfriend, Disaster Girl, and 200+ more. Or upload your own image to create a custom meme canvas."
          },
          {
                "title": "2. Add Top and Bottom Text",
                "desc": "Click the top and bottom text areas to type your punchline. Choose from classic Impact font, Arial, Comic Sans, or system fonts. Adjust text size, color, stroke width, and drop shadow. All caps styling is auto-applied for top text."
          },
          {
                "title": "3. Customize and Export",
                "desc": "Position text freely outside the traditional top-and-bottom layout if you want something different. Add stickers or emoji overlays. Download as PNG with transparent background or JPEG for smaller file size."
          }
    ],
    faqs: [
          {
                "question": "Can I use my own images as meme templates?",
                "answer": "Yes, upload any image to create a custom template. It works exactly like built-in templates — you get the same text controls, positioning, and export options. Your uploaded template stays in your session only."
          },
          {
                "question": "What font size works best for meme readability?",
                "answer": "For classic meme format, use large bold white text with a thick black stroke. The tool defaults to a 48px Impact font with 2px stroke. On mobile screens, go bigger — 60px+ ensures your punchline is legible on all devices."
          },
          {
                "question": "Are there copyright concerns with popular meme templates?",
                "answer": "Using well-known meme images for personal or parody use generally falls under fair use. For commercial purposes, we recommend using original photos to avoid potential licensing issues with recognizable stock photos."
          }
    ]
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: 'Convert MOV video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MOV to MP4 — Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads. ',
    dependencies: "FFmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload MOV File", desc: "Select a .mov video file recorded on Apple devices or professional cameras. The tool remuxes the MOV container's video and audio streams into the widely compatible MP4 format." },
      { title: "2. Set Quality", desc: "Choose output resolution and bitrate." },
      { title: "3. Download MP4", desc: "Convert and download the MP4 file compatible with most devices." },
    ],
    faqs: [
      { question: "Are ProRes files supported?", answer: "Yes. ProRes MOV files are converted to H.264/H.265 MP4 for better compatibility and smaller file sizes." },
      { question: "Can I trim the video?", answer: "Yes. Set start and end times to convert only a portion of the MOV file." },
      { question: "Does this preserve metadata?", answer: "Basic metadata like creation date and rotation flags are preserved where possible." },
    ],
  },
  {

    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: 'Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Resume Builder — Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. ',
    dependencies: "React / html2pdf.js",
    instructions: [
          {
                "title": "1. Fill in Personal Information",
                "desc": "Enter your name, email, phone, location, and LinkedIn/GitHub URLs. This header section appears at the top of the resume."
          },
          {
                "title": "2. Add Sections",
                "desc": "Add work experience, education, skills, certifications, and projects sections. Each section can have multiple entries with dates and descriptions."
          },
          {
                "title": "3. Choose Template and Export",
                "desc": "Select a professional template style. Preview the rendered resume and download as PDF. The layout auto-adjusts to fit content on one page."
          }
    ],
    faqs: [
          {
                "question": "Can I rearrange sections by dragging them?",
                "answer": "Yes, sections can be reordered by dragging the handle icon next to each section header. The order is preserved in the exported PDF."
          },
          {
                "question": "Does the builder support multiple pages for long resumes?",
                "answer": "Yes, the builder accommodates multi-page resumes. An academic CV mode removes the one-page limit and adds a publications section."
          },
          {
                "question": "Can I save my resume and edit it later?",
                "answer": "Yes, your resume data is saved to the browser's local storage. You can close and return later to continue editing."
          }
    ]
},
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: 'Increases image resolution by up to 4x while reconstructing fine details that standard interpolation loses.',
    dependencies: "Real-ESRGAN",
    seoDescription: 'Upscale images online free with AI — increase resolution by 4x while reconstructing fine details. ',
    instructions: [
      { title: "1. Upload Your Image", desc: "Select a low-resolution image from your device. The tool accepts JPEG, PNG, and WebP formats up to 10MB. For best results, start with the highest quality source available." },
      { title: "2. Choose Upscale Factor", desc: "Select your target resolution increase — 2x or 4x. 2x offers faster processing with good quality, while 4x provides the maximum detail reconstruction." },
      { title: "3. Download the Upscaled Image", desc: "Process the image and download the result. The upscaled version retains fine details, sharp edges, and natural textures that standard interpolation methods lose." },
    ],
    faqs: [
      { question: "What is Real-ESRGAN?", answer: "Real-ESRGAN (Enhanced Super-Resolution Generative Adversarial Network) is a deep learning model that reconstructs high-resolution images from low-resolution inputs. It's trained to restore realistic textures, not just stretch pixels." },
      { question: "How is this different from normal image resizing?", answer: "Normal resizing uses interpolation (bicubic, bilinear) that just stretches pixels, causing blurriness and pixelation. AI upscaling reconstructs missing detail — it adds texture to faces, sharpens text edges, and preserves natural-looking gradients." },
      { question: "What's the maximum input resolution?", answer: "Input images up to 10MB are supported. The output will be 2x or 4x larger in each dimension (e.g., 512x512 becomes 1024x1024 or 2048x2048). Very large inputs may be resized before processing." },
      { question: "Can I upscale old family photos?", answer: "Yes. Old or low-quality photos often benefit most from AI upscaling. The model can reconstruct faces, reduce JPEG artifacts, and restore detail in backgrounds. Results vary based on original image quality." },
    ]
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Finance",
    description: 'Computes GST-inclusive and GST-exclusive amounts for Indian tax slabs (5%, 12%, 18%, 28%) with automatic HSN/SAC code hints.',
    dependencies: "Vanilla JS",
    seoDescription: 'Free online GST calculator for India — compute GST inclusive and exclusive prices for 5%, 12%, 18%, and 28% slabs. Instant, accurate, and 100% client-side.',
    instructions: [
      { title: "1. Enter the Base Amount", desc: "Type the invoice or purchase amount in ₹ into the input field. This is the value before or after GST depending on your calculation mode." },
      { title: "2. Select GST Rate & Mode", desc: "Choose the applicable GST slab (5%, 12%, 18%, or 28%) and whether you want to add GST to a net price or remove GST from a gross total." },
      { title: "3. Read Your Tax Breakdown", desc: "The tool instantly shows the net amount, GST value, and total price. Use the values for invoicing, tax filing, or cost estimation." },
    ],
    faqs: [
      { question: "What GST slabs are covered?", answer: "This calculator supports all four standard Indian GST slabs: 5% (essentials like packaged food), 12% (processed goods), 18% (most services and regular items), and 28% (luxury goods and sin products)." },
      { question: "What is the difference between 'Add GST' and 'Remove GST'?", answer: "Add GST calculates the final price including tax starting from a net/exclusive amount (e.g., ₹1000 + 18% GST = ₹1180). Remove GST works backwards from a gross/inclusive total to extract the original net amount and the GST component (e.g., ₹1180 with 18% GST = ₹1000 net + ₹180 tax)." },
      { question: "Can I use this for GST filing or invoice creation?", answer: "This calculator is designed for quick estimates and personal use. For official GST filing or professional invoices, use the GST Invoice Generator tool and consult a tax professional." },
      { question: "Does the calculator handle reverse charge or integrated GST (IGST)?", answer: "The calculator works with standard GST rates. IGST applies to inter-state transactions at the same slab rates, and the calculation method is identical — the total tax percentage is the same whether it's CGST+SGST (intra-state) or IGST (inter-state)." },
      { question: "Are my calculations saved or tracked?", answer: "No. All calculations happen in your browser and are never saved or transmitted. Refresh the page and your data is gone — complete privacy is maintained." },
    ]
  },
  {
    id: "71",
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Image",
    description: 'Scales images to exact pixel dimensions or percentage-based sizes with intelligent resampling algorithms that preserve sharpness.',
    dependencies: "Canvas API / Sharp",
    seoDescription: 'Resize images online free — scale JPG, PNG, WebP to exact dimensions or percentage. Smart resampling preserves quality. ',
    instructions: [
          {
                "title": "1. Upload Your Image",
                "desc": "Select an image to resize. The tool supports JPEG, PNG, WebP, GIF, BMP, and TIFF. Current dimensions are displayed immediately. Images up to 100MB can be processed."
          },
          {
                "title": "2. Set New Dimensions",
                "desc": "Enter exact width and height in pixels, or choose from presets like Instagram square, Twitter header, LinkedIn banner, or 4K resolution. Maintain aspect ratio with the lock icon, or freely stretch for custom dimensions."
          },
          {
                "title": "3. Choose Resampling and Download",
                "desc": "Pick a resampling algorithm — Lanczos for maximum sharpness when downscaling, Bilinear for smooth upscaling, or Nearest Neighbor for pixel art. Download the resized image in any format independent of the original."
          }
    ],
    faqs: [
          {
                "question": "Will resizing make my image look blurry?",
                "answer": "Downscaling typically preserves sharpness well. Upscaling introduces interpolation blur since new pixels must be estimated. The Lanczos algorithm minimizes this, but enlarging beyond 2x the original will show softness."
          },
          {
                "question": "What's the difference between resizing and resampling?",
                "answer": "Resizing changes pixel dimensions. Resampling is the mathematical method used to calculate new pixel values. Lanczos preserves edges best for downscaling, Bilinear is smoother for upscaling, and Nearest Neighbor keeps hard edges for pixel art."
          },
          {
                "question": "Can I resize multiple images at once?",
                "answer": "This tool handles one image at a time. For bulk resizing, use our Batch Image Editor which applies the same dimensions and algorithm to up to 50 images simultaneously."
          }
    ]
  },
  {

    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: 'Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Password Generator — Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. ',
    dependencies: "Crypto API",
    instructions: [
          {
                "title": "1. Set Password Length",
                "desc": "Use the slider to choose a length between 8 and 128 characters. Longer passwords are exponentially more resistant to brute-force attacks."
          },
          {
                "title": "2. Select Character Types",
                "desc": "Toggle uppercase, lowercase, digits, and symbols on or off. For maximum security, enable all four types. The passphrase option generates memorable word-based phrases."
          },
          {
                "title": "3. Generate and Copy",
                "desc": "Click generate to produce a random password. Each character is chosen using a cryptographically secure PRNG. Copy the password (it is never stored or transmitted)."
          }
    ],
    faqs: [
          {
                "question": "How strong is an 8-character password with all character types?",
                "answer": "An 8-character password with 95 possible characters per position has 95^8 ≈ 6.6 quadrillion combinations. At 1 billion guesses per second, it would take about 76 days to brute-force."
          },
          {
                "question": "Does the tool save or transmit generated passwords?",
                "answer": "No, all generation happens locally in your browser. Passwords are never sent to any server, stored, or logged."
          },
          {
                "question": "What is the passphrase mode and how does it work?",
                "answer": "Passphrase mode generates a sequence of common words separated by hyphens or spaces, chosen from a dictionary of 7,776 words using diceware-like random selection."
          }
    ]
},
  {

    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: 'Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Diff Checker — Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. ',
    dependencies: "diff-match-patch",
    instructions: [
          {
                "title": "1. Paste Original Text",
                "desc": "Enter the original/left version of your text in the first panel. Supports plain text, code, JSON, or configuration files."
          },
          {
                "title": "2. Paste Modified Text",
                "desc": "Enter the modified/right version in the second panel. The tool compares character by character on paste."
          },
          {
                "title": "3. Review Differences",
                "desc": "View highlighted additions (green) and deletions (red). Toggle unified diff, side-by-side, or inline view."
          }
    ],
    faqs: [
          {
                "question": "What diff algorithm does this tool use?",
                "answer": "The tool uses Myers' diff algorithm for optimal line-level diffs and a refined word-level diff for inline highlighting. It handles large files up to 500 KB efficiently."
          },
          {
                "question": "Can I ignore whitespace differences in the comparison?",
                "answer": "Yes, enable the 'Ignore whitespace' toggle to strip trailing/leading whitespace, normalize line endings, and collapse multiple spaces before computing the diff."
          },
          {
                "question": "How do I export the diff as a unified patch file?",
                "answer": "Click Export and select 'Unified Patch' format. The output follows the standard diff -u format with context lines, usable with git apply or patch."
          }
    ]
},
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: 'Convert WEBM video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online WEBM to MP4 — Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM. ',
    dependencies: "FFmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload WebM", desc: "Select a .webm video file from your device." },
      { title: "2. Choose Quality", desc: "Pick output quality and resolution for the MP4." },
      { title: "3. Download MP4", desc: "Convert and download the MP4 file." },
    ],
    faqs: [
      { question: "What codecs does WebM use?", answer: "WebM uses VP8/VP9 video codec and Vorbis/Opus audio. These are re-encoded to H.264/AAC for MP4." },
      { question: "Will I lose quality?", answer: "Re-encoding from VP9 to H.264 may result in slight quality loss. Use high quality settings to minimize this." },
      { question: "Can I batch convert?", answer: "The converter handles one file at a time. For multiple files, convert them individually." },
    ],
  },
  {

    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: 'Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity. Uses cloud-based processing.',
    seoDescription: 'Free online IP Address Lookup — Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity. ',
    dependencies: "MaxMind / IP-API",
    instructions: [
          {
                "title": "1. Enter an IP Address",
                "desc": "Type an IPv4 or IPv6 address into the input field. The tool validates the format and rejects invalid addresses with an error message."
          },
          {
                "title": "2. Look Up Details",
                "desc": "Click lookup to retrieve geographic and network information. Results include ISP, organization, ASN, city, region, country, and coordinates."
          },
          {
                "title": "3. View on Map",
                "desc": "The location is plotted on an interactive map if geolocation data is available. Zoom controls let you explore the surrounding area."
          }
    ],
    faqs: [
          {
                "question": "How accurate is the IP geolocation data?",
                "answer": "Accuracy varies by IP. City-level data is about 60-80% accurate. ISP and country data is nearly 100% accurate. Mobile IPs are less accurate than fixed-line IPs."
          },
          {
                "question": "Can I look up my own public IP address?",
                "answer": "Yes, click the 'My IP' button to automatically detect and look up your public IP address. The request goes through the server, not client-side."
          },
          {
                "question": "Is any IP data stored or logged by the tool?",
                "answer": "No, IP lookups are processed on demand and not stored. The tool is privacy-respecting and does not retain any query history."
          }
    ]
},
  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: 'Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Photo Retoucher — Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. ',
    dependencies: "OpenCV",
    instructions: [
          {
                "title": "1. Upload Your Portrait Photo",
                "desc": "Upload a portrait or selfie that needs retouching. The tool is optimized for human faces and works best with well-lit front-facing photos. Supports JPEG, PNG, and WebP formats."
          },
          {
                "title": "2. Apply Retouching Adjustments",
                "desc": "Use skin smoothing to reduce blemishes and pores, the blemish remover for spot fixes, teeth whitening, eye brightening, and red-eye correction. Each adjustment has a strength slider so the result looks natural."
          },
          {
                "title": "3. Compare and Save",
                "desc": "Toggle between before and after views to see the retouch effect. Make final tweaks to ensure the result still looks like a natural photo. Download the retouched version in your preferred format."
          }
    ],
    faqs: [
          {
                "question": "Can the retoucher handle group photos?",
                "answer": "It works on individual faces within a group photo, but you may need to select faces individually. For consistent retouching across multiple people, process each face separately for the most natural results."
          },
          {
                "question": "Is skin smoothing safe for preserving natural texture?",
                "answer": "Yes, the slider lets you go from subtle pore reduction to full airbrushing. We recommend keeping it below 50% to maintain skin texture and avoid the plastic look. The AI targets blemishes specifically rather than blurring the entire face."
          },
          {
                "question": "Does teeth whitening work on all tooth shades?",
                "answer": "Teeth whitening brightens and removes yellow tint from natural teeth. It doesn't affect dental work like crowns, veneers, or braces, which already appear white. Over-whitening can make teeth look unnatural, so use a gentle setting."
          }
    ]
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: 'Divides a single PDF into multiple files by page range, bookmark level, or a specified page count per split.',
    dependencies: "pdf-lib",
    seoDescription: 'Split PDF files online free — divide PDF by page range, bookmarks, or page count. Extract specific pages into separate files. No uploads, private.',
    instructions: [
      { title: "1. Upload PDF File", desc: "Select a multi-page PDF to split into separate files." },
      { title: "2. Choose Split Method", desc: "Split by: every N pages, all pages individually, specific page ranges (1-3, 5, 8-10), or split at each bookmark." },
      { title: "3. Download Split Files", desc: "Download individual PDF files or a ZIP archive containing all split documents." },
    ],
    faqs: [
      { question: "Does splitting affect document content?", answer: "No. Each split PDF contains the original pages exactly as they appeared — no content is modified during splitting." },
      { question: "Can I split by bookmark levels?", answer: "Yes. Choose 'split by bookmark' and the PDF is divided at each first-level bookmark boundary." },
      { question: "What happens to PDF forms?", answer: "Form field data is preserved in each split document. AcroForm fields remain functional in the resulting PDF files." },
    ],
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: 'Generates Unicode-styled text variants for bold, italic, monospace, fraktur, script, serif, and sans-serif — optimized for code comments, design mockups, Discord formatting, and technical documentation where visual emphasis matters beyond standard fonts.',
    seoDescription: 'Free online Font Generator — generate Unicode-styled text in bold, italic, monospace, fraktur, script, serif, and sans-serif. Perfect for design mockups, code comments, Discord, and technical docs. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the text you want to style. All font variants appear instantly — no waiting for processing." },
      { title: "2. Browse Font Variants", desc: "Choose from bold serif, bold sans, italic, monospace (typewriter-style), fraktur (gothic), double-struck, script, and more. Each serves a distinct visual purpose." },
      { title: "3. Copy for Your Platform", desc: "Click any variant to copy. Use monospace for code snippets, bold sans for emphasis, or fraktur for a classic academic look. Paste anywhere that supports Unicode." },
    ],
    faqs: [
      { question: "How is this different from Fancy Text Generator?", answer: "Font Generator focuses on practical Unicode font variants — bold, italic, monospace, serif, sans-serif — useful for design mockups, code documentation, and formatting. Fancy Text Generator offers 40+ decorative styles (bubble, gothic, etc.) for social media and creative use." },
      { question: "Can I use monospace text for code?", answer: "Yes. The monospace variant uses Unicode mathematical monospace characters — ideal for inline code in documentation, Discord code blocks, or emphasizing technical terms in plain text environments where HTML isn't available." },
      { question: "What platforms support these styled characters?", answer: "Most modern platforms including Discord, WhatsApp, Instagram, Twitter, and web browsers render Unicode mathematical alphanumerics correctly. The font generator variants are tested for broad compatibility across social media and messaging apps." },
      { question: "Is bold text the same as HTML <b>?", answer: "Unicode bold characters are visual-only — they appear bold but don't carry semantic weight like HTML tags. For SEO and accessibility, use actual HTML. For plain text environments (Discord, bios), Unicode bold is the only option." },
    ]
  },
  {
    id: "85",
    name: "Salary Calculator",
    slug: "salary-calculator",
    category: "Finance",
    description: "Calculate net salary after taxes Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Salary Calculator — Calculate net salary after taxes ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter CTC", desc: "Input your annual Cost to Company (CTC) or monthly salary." },
    { title: "2. Select Components", desc: "Enter deductions like PF, professional tax, and income tax as applicable." },
    { title: "3. View In-Hand Salary", desc: "Review your monthly in-hand salary after all deductions." },
  ],
    faqs: [
    { question: "What is CTC?", answer: "CTC (Cost to Company) is the total amount your employer spends on you annually, including salary, benefits, bonuses, and employer PF contributions." },
    { question: "What deductions are considered?", answer: "Common deductions include Employee PF (12% of basic), Professional Tax, Income Tax (TDS), and voluntary deductions." },
    { question: "Is this accurate for all countries?", answer: "The calculator uses Indian salary structure by default. Tax rules vary by country — adjust deductions based on your location." },
  ],
},
  {
    id: "86",
    name: "Audio Cutter",
    slug: "audio-cutter",
    category: "Audio",
    description: "Trim and cut audio files online Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Audio Cutter — Trim and cut audio files online ',
    dependencies: "Web Audio API / FFmpeg",
    instructions: [
      { title: "1. Upload Audio", desc: "Select an audio file in MP3, WAV, FLAC, M4A, OGG, or AAC format. The tool displays the waveform and allows you to set precise start and end points for trimming." },
      { title: "2. Select Start and End Points", desc: "Use the waveform visualization to set the exact start and end times for your clip." },
      { title: "3. Export Cut Audio", desc: "Preview the trimmed section and download the result as your chosen format." },
    ],
    faqs: [
      { question: "Can I cut with millisecond precision?", answer: "Yes. The waveform display allows precise selection down to the millisecond for accurate cuts." },
      { question: "What formats are supported?", answer: "Input: MP3, WAV, FLAC, M4A, OGG, AAC. Output is available in MP3, WAV, and M4A formats." },
      { question: "Can I make multiple cuts from one file?", answer: "Yes. Make multiple cuts and export them as separate clips or merge them into one file." },
    ],
  },
  {
    id: "86b",
    name: "MP3 to WAV",
    slug: "mp3-to-wav",
    category: "Audio",
    description: 'Converts MP3 files to WAV format — universal music playback and sharing across all devices and platforms to professional audio editing, mastering, and archival in DAWs and production software. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MP3 to WAV — Convert compressed MP3 audio files into uncompressed WAV format for professional audio editing. ',
    dependencies: "FFmpeg.wasm",
    showInCategory: false,
    instructions: [
      { title: "1. Select MP3 File", desc: "Pick the MP3 file to decode to uncompressed WAV. Essential for audio editing, sampling, and any workflow requiring raw PCM access." },
      { title: "2. Choose Output WAV Format", desc: "Select 16-bit for CD-standard or 24-bit for production work. Stereo or mono output depending on your project needs." },
      { title: "3. Decode to WAV", desc: "The MP3 is fully decoded to linear PCM and saved as WAV. The resulting file is 5-10x larger but provides sample-level access for precise editing." },
    ],
    faqs: [
      { question: "Can I recover the original CD quality by converting MP3 to WAV?", answer: "No. MP3 is lossy — converting to WAV creates a much larger file but with the same degraded audio quality. The lost high frequencies cannot be restored." },
      { question: "Why does my MP3 sound better after converting to WAV?", answer: "It does not sound better — your brain expects a larger file to sound better. Blind A/B tests show listeners cannot distinguish MP3 from WAV of the same source." },
      { question: "Is WAV from MP3 suitable for professional use?", answer: "For production work, yes — WAV is easier for DAWs to handle. But the audio quality ceiling is the MP3's, not CD quality. Always prefer lossless sources." },
    ],
  },
  {
    id: "87",
    name: "Pomodoro Timer",
    slug: "pomodoro-timer",
    category: "Productivity",
    description: 'Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Pomodoro Timer — Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. ',
    dependencies: "Web Audio API / Vanilla JS",
    instructions: [
      { title: "1. Set Your Intervals", desc: "Configure your focus session length (default 25 min), short break (default 5 min), and long break (default 15 min). Adjust each to match your personal workflow." },
      { title: "2. Customize Auto-Start Options", desc: "Enable or disable auto-start for both work sessions and breaks. Decide whether the timer moves to the next phase automatically or waits for you." },
      { title: "3. Start Working", desc: "Click the start button to begin your first focus session. The timer tracks remaining time and plays a notification sound when it's time to switch between focus and breaks." },
    ],
    faqs: [
      { question: "What is the Pomodoro Technique?", answer: "The Pomodoro Technique is a time management method that breaks work into focused intervals (traditionally 25 minutes) separated by short breaks. It helps maintain concentration and prevents burnout by structuring work into manageable sessions." },
      { question: "Can I customize session lengths?", answer: "Yes. All three intervals — focus session, short break, and long break — are fully customizable. You can set any duration in minutes to match your personal productivity rhythm." },
      { question: "Does the timer work offline?", answer: "Yes. Everything runs locally in your browser. The Pomodoro Timer uses no server connections and works even without internet access after the initial page load." },
      { question: "What happens when I complete a full cycle?", answer: "After four focus sessions (a full cycle), the timer suggests a longer break. You can accept the long break or continue working. The cycle counter resets automatically after the long break." },
    ]
  },
  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: 'YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. Uses cloud-based processing.',
    seoDescription: 'Free online YouTube Transcript Generator — YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. ',
    dependencies: "YouTube Data API",
    instructions: [
      { title: "1. Enter a YouTube Video URL or ID", desc: "Paste the full YouTube video URL (e.g., youtube.com/watch?v=...) or just the video ID. The tool fetches available captions from the video." },
      { title: "2. Select Language and Format", desc: "Choose from available caption tracks (auto-generated or manual). Select your output format — plain text, SRT, or VTT subtitle files." },
      { title: "3. Download the Transcript", desc: "Click generate to fetch and compile the transcript. Download the result in your chosen format or copy it directly to your clipboard." },
    ],
    faqs: [
      { question: "Do I need a YouTube API key?", answer: "No. The tool uses public YouTube caption endpoints. You only need the video URL or ID — no API keys, accounts, or authentication required." },
      { question: "Are all YouTube videos supported?", answer: "Only videos that have captions enabled by the uploader or auto-generated by YouTube will return transcripts. Videos without captions cannot be processed." },
      { question: "What if the video has no captions?", answer: "If a video has no available captions, the tool will indicate that no transcript is available. You may want to use the Video to Text Transcription tool to generate captions from the video's audio instead." },
      { question: "Can I get transcripts in multiple languages?", answer: "If the video has multiple caption tracks (e.g., English, Spanish, Hindi), you can select each language from the dropdown. Auto-generated captions are typically available in the video's spoken language." },
    ]
  },
  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "Converter",
    description: 'Converts EPUB files to PDF format — e-readers, mobile devices, and accessible digital books to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online EPUB to PDF — Convert e-books to PDF format. Preserves structure, images, and formatting. ',
    dependencies: "jszip, pdf-lib",
    showInCategory: true,
    instructions: [
      { title: "1. Upload EPUB", desc: "Select an .epub e-book file from your device." },
      { title: "2. Choose Layout", desc: "Pick page size, font size, and margin preferences." },
      { title: "3. Download PDF", desc: "Convert the e-book to PDF and download." },
    ],
    faqs: [
      { question: "Are EPUB images preserved?", answer: "Yes. All images from the EPUB are included in the PDF output." },
      { question: "Can I set the PDF page size?", answer: "Yes. Choose from A4, Letter, or custom page dimensions." },
      { question: "Are EPUB hyperlinks preserved?", answer: "Yes. Internal and external hyperlinks from the EPUB are converted to PDF hyperlinks." },
    ],
  },
  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: 'Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Protect PDF — Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. ',
    dependencies: "pdf-lib",
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF", desc: "Select a PDF document to password-protect or restrict." },
      { title: "2. Set Passwords", desc: "Set a user password (required to open the file) and/or a permissions password (required to modify permissions)." },
      { title: "3. Choose Restrictions", desc: "Restrict printing (low-res or full), copying text, modifying content, adding comments, and filling forms." },
      { title: "4. Download Protected PDF", desc: "Your PDF is encrypted and protected. Share the password separately from the document." },
    ],
    faqs: [
      { question: "What encryption standard is used?", answer: "AES-128 bit encryption (PDF 2.0 compliant). This is the current industry standard for PDF document security." },
      { question: "Can I remove password protection later?", answer: "Yes. Use the Unlock PDF tool with the correct permissions password to remove restrictions." },
      { question: "Is PDF password protection truly secure?", answer: "AES-128 encryption is cryptographically strong. However, the user password cannot be recovered if lost, so keep backup copies." },
    ],
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: 'Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Invoice Generator — Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. ',
    dependencies: "PDF-lib / Vue.js"
  ,
    instructions: [
    { title: "1. Enter Business Details", desc: "Add your company name, address, logo, and contact information." },
    { title: "2. Add Line Items", desc: "Add items or services with quantities, rates, and taxes. The total auto-calculates." },
    { title: "3. Download Invoice", desc: "Preview the invoice and download as PDF or print directly." },
  ],
    faqs: [
    { question: "Can I add my logo?", answer: "Yes. Upload your business logo and it will appear on the invoice header." },
    { question: "What formats can I download?", answer: "Invoices can be downloaded as PDF or printed directly from the browser." },
    { question: "Are my invoices stored?", answer: "No. All data is processed locally in your browser. Invoices are not stored on any server." },
  ],
},
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: 'Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Business Card Maker — Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. ',
    dependencies: "React / Canvas API"
  },
  {

    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: 'Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Regex Tester — Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match. ',
    dependencies: "regex.js",
    instructions: [
          {
                "title": "1. Enter Regular Expression",
                "desc": "Type your regex pattern (without delimiters). Select flags: g (global), i (case-insensitive), m (multiline), s (dotall), u (unicode), y (sticky)."
          },
          {
                "title": "2. Enter Test String",
                "desc": "Paste your test string in the input area. Matches are highlighted in real time as you type the regex."
          },
          {
                "title": "3. Analyze Match Groups",
                "desc": "View each match with its capturing groups, named groups, and positions. The tool also shows the match explanation in plain English."
          }
    ],
    faqs: [
          {
                "question": "What regex engine does this tester use?",
                "answer": "The tool uses the JavaScript (ECMAScript) regex engine via RegExp. This supports lookahead (?=), lookbehind (?<=), named groups (?<name>), and Unicode property escapes (\\p{L})."
          },
          {
                "question": "How do backreferences work differently in JS vs PCRE?",
                "answer": "JavaScript supports backreferences to capturing groups (\\1, \\2) but does not support subroutine calls or recursive patterns (?R) that PCRE supports."
          },
          {
                "question": "Can I test regex against multiple strings at once?",
                "answer": "Yes, use the multi-line mode where each line of the test area is treated as a separate test string. The tool shows per-line match/no-match results."
          }
    ]
},
  {

    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: 'Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Dice Roller — Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. ',
    dependencies: "Three.js",
    instructions: [
          {
                "title": "1. Select Dice Configuration",
                "desc": "Choose the number of dice (1 to 20) and the number of sides per die (4, 6, 8, 10, 12, 20, or 100). Standard polyhedral dice are supported."
          },
          {
                "title": "2. Roll the Dice",
                "desc": "Click the roll button to simulate the dice throw. Each die result is shown individually with a brief randomization animation."
          },
          {
                "title": "3. View Results and Total",
                "desc": "The outcome shows each die value and the total sum. A roll history is maintained below, allowing you to track all rolls in the current session."
          }
    ],
    faqs: [
          {
                "question": "Are the dice rolls truly random or simulated?",
                "answer": "Rolls use a cryptographically secure PRNG (getRandomValues), which is more than sufficient for fair gameplay in tabletop RPGs and board games."
          },
          {
                "question": "Can I roll with advantage or disadvantage like in D&D 5e?",
                "answer": "Yes, enable advantage (roll 2d20, take higher) or disadvantage (roll 2d20, take lower) for any d20 roll with a single toggle."
          },
          {
                "question": "Does the roller support exploding dice (rule of 6)?",
                "answer": "Yes, toggle exploding dice mode. When a die rolls the maximum value, it is rerolled and added again, cascading indefinitely."
          }
    ]
},
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Finance",
    description: 'Computes gross profit, net profit, and margin percentages from revenue and cost inputs. Small-business owners use it to price products, evaluate supplier deals, and ensure healthy margins across their product lines.',
    seoDescription: 'Free online Profit Margin Calculator — compute gross profit, net profit, and margin percentages from revenue and cost. Perfect for product pricing, supplier evaluation, and business planning. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Revenue", desc: "Input your total revenue or selling price per unit. This is the money coming in from sales." },
      { title: "2. Enter Costs", desc: "Input your cost of goods sold (COGS) — what you pay to produce or acquire each unit." },
      { title: "3. Review Your Margins", desc: "The calculator shows gross profit, gross margin %, net profit, and net margin %. Use these numbers to set pricing and evaluate profitability." },
    ],
    faqs: [
      { question: "How is this different from the Margin Calculator?", answer: "Profit Margin Calculator gives you gross and net profit from revenue and cost. Margin Calculator works backwards — calculate selling price or cost from any two known variables (margin %, cost, or price). Use Profit Margin for overall business analysis, Margin Calculator for pricing." },
      { question: "What's a good profit margin?", answer: "Healthy margins vary by industry: retail typically runs 20-50% gross margin, software/SaaS targets 70-90%, restaurants operate on 3-10% net margin. Compare against industry benchmarks for your sector." },
      { question: "Should I use gross or net margin for pricing?", answer: "Gross margin includes only direct production costs — use it for product-level pricing decisions. Net margin accounts for all operating expenses — use it for overall business health assessment." },
      { question: "Can I calculate margin for multiple products?", answer: "This tool handles one product at a time. For multi-product analysis, calculate each product individually and compare the margin percentages across your product line." },
    ]
  },
  {
    id: "104",
    name: "Speech to Text",
    slug: "speech-to-text",
    category: "Audio",
    description: "Transcribe audio to text in multiple languages Uses cloud-based processing.",
    seoDescription: 'Free online Speech to Text — Transcribe audio to text in multiple languages ',
    dependencies: "Whisper API / Web Speech API",
    instructions: [
      { title: "1. Upload or Record Audio", desc: "Upload an audio file or record speech directly using your microphone." },
      { title: "2. Select Language", desc: "Choose the spoken language for accurate transcription. Supports 50+ languages." },
      { title: "3. Generate & Export Transcript", desc: "Process the audio and review the generated text. Copy or download as TXT, SRT, or VTT." },
    ],
    faqs: [
      { question: "What audio formats are supported?", answer: "MP3, WAV, M4A, FLAC, OGG, and AAC. Maximum file size depends on your browser's memory limits." },
      { question: "How accurate is the transcription?", answer: "Accuracy depends on audio quality, speaker clarity, and background noise. Clean recordings with clear speech achieve 90-95%+ accuracy." },
      { question: "Can I export with timestamps?", answer: "Yes. Export as SRT or VTT subtitle formats with accurate timestamps for each segment." },
    ],
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: 'Convert PDF documents to EPUB format for e-book readers. Server-side conversion preserves layout, images, and chapter structure.',
    seoDescription: 'Free online PDF to EPUB — Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation. ',
    dependencies: "Calibre API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload PDF for E-Book Conversion", desc: "Select a PDF document. Best results come from text-rich PDFs with reflowable content (not scanned pages)." },
      { title: "2. Set E-Book Metadata", desc: "Enter title, author, and cover image. Choose the output format: EPUB (standard e-book) or EPUB3 (with enhanced layout support)." },
      { title: "3. Download EPUB", desc: "Your PDF is converted to an e-book readable on Kindle, Kobo, Apple Books, Google Play Books, and most e-readers." },
    ],
    faqs: [
      { question: "Why convert PDF to EPUB?", answer: "PDFs have fixed layouts that do not reflow on small screens. EPUB text adjusts to any screen size for comfortable mobile reading." },
      { question: "Are images preserved?", answer: "Yes. Images embedded in the PDF are extracted and included in the EPUB. Image quality is preserved at original resolution." },
      { question: "Does this support PDF tables of contents?", answer: "Yes. PDF bookmarks and internal links are converted to EPUB navigation for chapter-based reading." },
    ],
  },
  {

    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: 'Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Coin Flipper — Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. ',
    dependencies: "CSS3 Animations",
    instructions: [
          {
                "title": "1. Flip the Coin",
                "desc": "Click the coin to flip it. A 3D flip animation shows the coin tumbling before landing on heads or tails with equal probability."
          },
          {
                "title": "2. Track Statistics",
                "desc": "A counter tracks total flips, heads count, tails count, and the longest streak. Streaks are shown for both sides with timestamps."
          },
          {
                "title": "3. Flip Multiple Times",
                "desc": "Set a number (1 to 100) in the auto-flip field to flip the coin repeatedly. Results update in real-time with aggregate statistics."
          }
    ],
    faqs: [
          {
                "question": "Is a coin flip truly 50/50 or is there a physical bias?",
                "answer": "Digitally, the flip uses a cryptographically secure random source with exactly 50% probability for heads and 50% for tails."
          },
          {
                "question": "Can I customize the coin with different images or labels?",
                "answer": "No, the coin displays standard heads (H) and tails (T). Custom coin faces are not supported in this tool."
          },
          {
                "question": "Does the tool record the history of all flips in a session?",
                "answer": "Yes, a chronological list of every flip shows the result and timestamp. The list can be cleared manually or exported as text."
          }
    ]
},
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: 'Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Image Colorizer — Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. ',
    dependencies: "DeOldify",
    instructions: [
          {
                "title": "1. Upload a Black and White Photo",
                "desc": "Upload your monochrome or sepia historical photo. The colorizer works best with portrait and landscape photos from the 1800s to mid-1900s. Higher resolution scans produce more accurate coloring."
          },
          {
                "title": "2. AI Colorization Process",
                "desc": "The AI analyzes the image content — detecting sky, skin, foliage, clothing, and objects — then assigns realistic colors based on its training data. You can let it run fully automatic or guide it with color hints."
          },
          {
                "title": "3. Fine-Tune Colors Manually",
                "desc": "Use color brushes to correct or change specific areas. If the AI got the sky wrong, paint over it with the correct blue. Adjust saturation and warmth globally. Download the colorized result as JPEG or PNG."
          }
    ],
    faqs: [
          {
                "question": "How historically accurate are the AI-assigned colors?",
                "answer": "The AI assigns plausible colors based on what it learned from millions of color photos, not historical accuracy. Uniforms, cars, and specific objects may get generic colors. Historical reference images help you manually correct these."
          },
          {
                "question": "Can I colorize damaged or scratched photos?",
                "answer": "Yes, but scratches and damage are colorized along with the rest of the image. We recommend restoring the photo first using a restoration tool, then colorizing the cleaned version for the best results."
          },
          {
                "question": "Does it work on sepia-toned photos too?",
                "answer": "Yes, sepia photos work just as well as pure black-and-white. The AI strips the sepia tone as a pre-processing step before applying color. The output will be full color regardless of the original tint."
          }
    ]
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: 'Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online EXIF Data Remover — Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. ',
    dependencies: "exifr / Piexifjs",
    instructions: [
      { title: "1. Upload Your Image", desc: "Select a JPEG or PNG image from your device. The tool reads all embedded EXIF metadata including GPS coordinates, camera model, timestamp, and software info." },
      { title: "2. Review Metadata to Remove", desc: "The tool displays all detected metadata fields. You can choose to strip all metadata or selectively remove specific fields like GPS location while keeping others." },
      { title: "3. Clean and Download", desc: "Click the remove button to strip the selected metadata. Download your cleaned image — all processing happens locally, nothing is uploaded to any server." },
    ],
    faqs: [
      { question: "What EXIF data does this tool remove?", answer: "It strips GPS coordinates, camera make and model, timestamp, software fingerprint, exposure settings, flash information, ISO, focal length, and thumbnail data. You can choose to remove all or select specific fields." },
      { question: "Is my image uploaded to a server?", answer: "No. Everything runs locally in your browser using JavaScript libraries. Your image is never sent to any server — all EXIF reading and removal happens on your device." },
      { question: "What image formats are supported?", answer: "JPEG and PNG images are supported. JPEG files typically contain the most EXIF data. PNG files may have limited metadata but the tool can still clean what's present." },
      { question: "Why should I remove EXIF data before sharing photos?", answer: "EXIF data can reveal sensitive information like your exact home address (GPS coordinates), camera equipment, and when a photo was taken. Removing this metadata protects your privacy when sharing images online." },
    ]
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: 'Convert AVI video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online AVI to MP4 — Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes. ',
    dependencies: "FFmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload AVI File", desc: "Select an .avi video file from your device." },
      { title: "2. Choose Quality", desc: "Pick output quality: high, medium, or low. Higher quality produces larger files." },
      { title: "3. Convert & Download", desc: "Click Convert and download your MP4 file." },
    ],
    faqs: [
      { question: "What video codecs are supported?", answer: "The converter supports H.264 and H.265 codecs for MP4 output. H.264 offers broad compatibility." },
      { question: "Can I adjust the resolution?", answer: "Yes. Choose from original, 1080p, 720p, 480p, or custom resolution settings." },
      { question: "Is the conversion lossy?", answer: "MP4 encoding is lossy. Use high quality setting to minimize visual quality loss." },
    ],
  },
  {
    id: "mp4-mkv-1",
    name: "MP4 to MKV Converter",
    description: 'Converts MP4 files to MKV format — universal video playback on any device to advanced video archiving with multiple subtitle tracks, chapters, and audio streams in one file. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MP4 to MKV Converter — Re-encapsulates MP4 video files into the versatile MKV container without re-encoding the underlying video stream. ',
    category: "Converter",
    slug: "mp4-to-mkv",
    dependencies: "ffmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload MP4", desc: "Select an .mp4 file from your device. The tool reads the MP4's video and audio codecs and repackages them into the more flexible MKV container with subtitle support." },
      { title: "2. Choose Tracks", desc: "Select which audio and subtitle tracks to include." },
      { title: "3. Convert", desc: "Download the MKV file with your selected tracks." },
    ],
    faqs: [
      { question: "Why convert MP4 to MKV?", answer: "MKV supports more codecs, subtitles, and chapter markers than MP4. It is preferred for archiving." },
      { question: "Are chapters preserved?", answer: "Yes. Chapter markers in the MP4 are converted to MKV chapter format." },
      { question: "Can I add additional audio tracks?", answer: "Yes. You can add external audio tracks to the MKV output during conversion." },
    ],
  },
  {
    id: "mp4-mov-1",
    name: "MP4 to MOV Converter",
    description: 'Convert MP4 video files to MKV format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MP4 to MOV Converter — Converts MP4 video files to QuickTime MOV format while preserving quality, ideal for Apple ecosystem workflows and Final Cut Pro imports. ',
    category: "Converter",
    slug: "mp4-to-mov",
    dependencies: "ffmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload MP4", desc: "Select an .mp4 video file from your device. The tool reads the MP4 container and its video/audio streams for remuxing into the QuickTime-compatible MOV container." },
      { title: "2. Convert", desc: "The tool re-encodes the video into a QuickTime-compatible MOV format." },
      { title: "3. Download MOV", desc: "Download the converted MOV file." },
    ],
    faqs: [
      { question: "What is the difference between MP4 and MOV?", answer: "Both use similar codecs. MOV is Apple's QuickTime format with broader ProRes support." },
      { question: "Is the conversion lossless?", answer: "When using the same codec, the conversion remuxes the streams without re-encoding for lossless output." },
      { question: "Are metadata tags preserved?", answer: "Yes. MP4 metadata tags are converted to MOV-compatible metadata." },
    ],
  },
  {
    id: "mkv-mov-1",
    name: "MKV to MOV Converter",
    description: 'Converts MKV files to MOV format — advanced video archiving with multiple subtitle tracks, chapters, and audio streams in one file to Apple ecosystem. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MKV to MOV Converter — Transcodes Matroska MKV files into QuickTime MOV format for seamless editing in macOS applications like Final Cut Pro and iMovie. ',
    category: "Converter",
    slug: "mkv-to-mov",
    dependencies: "ffmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload MKV", desc: "Select an .mkv video file containing any codec combination. The tool remuxes the video, audio, and subtitle streams into Apple-compatible MOV format." },
      { title: "2. Adjust Settings", desc: "Choose video codec (H.264, H.265) and quality." },
      { title: "3. Download MOV", desc: "Convert and download the MOV file." },
    ],
    faqs: [
      { question: "Are subtitles preserved?", answer: "MKV subtitle tracks are converted to MOV-compatible formats or can be embedded as separate tracks." },
      { question: "What audio codecs are supported?", answer: "AAC, MP3, and PCM audio codecs are supported for the MOV container." },
      { question: "Can I select specific tracks?", answer: "Yes. Choose which video, audio, and subtitle tracks from the MKV to include in the MOV output." },
    ],
  },
  {
    id: "mov-mkv-1",
    name: "MOV to MKV Converter",
    description: 'Convert MKV video files to MOV format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MOV to MKV Converter — Converts QuickTime MOV videos into the open-source MKV container format, enabling advanced subtitle support and broader codec compatibility. ',
    category: "Converter",
    slug: "mov-to-mkv",
    dependencies: "ffmpeg",
    showInCategory: false,
    instructions: [
      { title: "1. Upload MOV", desc: "Select a .mov file from your device. The tool identifies the video codec (H.264, ProRes, etc.) and audio tracks for packaging into the flexible MKV container." },
      { title: "2. Configure", desc: "Choose video and audio codec settings for the MKV container." },
      { title: "3. Convert", desc: "Download the converted MKV file." },
    ],
    faqs: [
      { question: "What codecs are preserved?", answer: "Common codecs like H.264, ProRes, and DNxHD are preserved when remuxing to MKV." },
      { question: "Can I add subtitles?", answer: "You can add external SRT or ASS subtitle files to the MKV output." },
      { question: "Is the audio re-encoded?", answer: "By default audio is copied without re-encoding. Re-encode if you need a different audio format." },
    ],
  },
  {
    id: "111",
    name: "Video Compressor",
    slug: "video-compressor",
    category: "Video",
    description: "Reduces MP4, MOV, and WebM video file sizes using configurable CRF (Constant Rate Factor) encoding, resolution scaling, and bitrate control. Includes a quality preview before processing. Handles files up to 500MB.",
    dependencies: "FFmpeg / WebCodecs API",
    seoDescription: 'Free online Video Compressor — reduce MP4, MOV, and WebM file sizes with CRF encoding, resolution scaling, and bitrate control. Up to 500MB. ',
    instructions: [
      { title: "1. Upload Your Video", desc: "Select an MP4, MOV, or WebM video file from your device. The tool accepts videos up to 500MB." },
      { title: "2. Configure Compression", desc: "Adjust the CRF value (lower = better quality, larger file), target resolution, or bitrate. A preview helps you see the quality tradeoff before processing." },
      { title: "3. Download the Compressed Video", desc: "Process the video locally in your browser using FFmpeg WASM. Download the compressed result — your original stays untouched." },
    ],
    faqs: [
      { question: "How much can this compress a video?", answer: "Typical compression reduces video file sizes by 50-80% depending on the CRF setting and source quality. A 100MB video can often be reduced to 20-30MB with minimal visible quality loss at CRF 23." },
      { question: "What's the difference between video, image, and PDF compressors?", answer: "Video Compressor uses H.264/AV1 encoding via FFmpeg to reduce MP4/MOV/WebM files — the most compute-intensive compression. Image Compressor uses Canvas API for JPG/PNG/WebP. PDF Compressor optimizes document internals. Each uses format-appropriate compression algorithms." },
      { question: "What is CRF and what value should I use?", answer: "CRF (Constant Rate Factor) controls quality: 0 is lossless, 51 is worst. For web uploads, CRF 23-28 is typical (good quality, small file). For archival, use CRF 18-22. For maximum compression (social media), CRF 28-32 works well." },
      { question: "Does compression work on my device without uploading?", answer: "Yes. All video compression runs locally using FFmpeg WASM compiled to WebAssembly. Your video never leaves your browser — no uploads, no server processing, complete privacy for your content." },
    ]
  },
  {
    id: "112",
    name: "AI Face Swap",
    slug: "ai-face-swap",
    category: "AI",
    description: 'Seamlessly replaces one face with another in photos using AI, matching skin tone, lighting, and head angle for natural results.',
    seoDescription: 'Free online AI Face Swap — Seamlessly replaces one face with another in photos using AI, matching skin tone, lighting, and head angle. ',
    dependencies: "InsightFace",
    instructions: [
      { title: "1. Upload the Source and Target Images", desc: "Upload the source image (the face to use) and the target image (where the face will be applied). Both should be clear, front-facing photos for best results." },
      { title: "2. Align and Process", desc: "The AI detects faces in both images automatically. Review the detected face regions and adjust if needed. The swap algorithm matches skin tone, lighting, angle, and expression." },
      { title: "3. Preview and Download", desc: "Preview the result before downloading. The tool blends the swapped face naturally with the target image's background, lighting, and composition." },
    ],
    faqs: [
      { question: "What images work best for face swapping?", answer: "Front-facing photos with good lighting and neutral expressions produce the best results. Both faces should be roughly the same size and angle. Avoid heavily angled, obscured, or low-light photos." },
      { question: "Is this technology safe and ethical?", answer: "AI face swap technology should only be used with consent from all people in the photos. Do not create misleading or harmful content. The tool is intended for creative and entertainment purposes only." },
      { question: "What face detection model is used?", answer: "The tool uses InsightFace, a state-of-the-art face analysis library that provides accurate face detection, alignment, and swapping with realistic blending." },
      { question: "Can I use this for video?", answer: "This tool processes still photos. For video face swapping, consider specialized video editing software. Each frame of a video would need individual processing." },
    ]
  },
  {

    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: 'Pretty-prints raw JSON with configurable indent width, key sorting, and bracket collapsing options while flagging syntax errors with exact.',
    dependencies: "JSONLint",
    seoDescription: 'Free JSON formatter online — format, validate, and beautify JSON with configurable indentation and sorting. Syntax error highlighting included.',
    instructions: [
          {
                "title": "1. Paste Raw JSON",
                "desc": "Paste any JSON data (minified, compact, or malformed) into the input panel. The tool validates the JSON and shows line numbers."
          },
          {
                "title": "2. Configure Formatting Options",
                "desc": "Set indentation size (2, 4, or tab), sort keys alphabetically, toggle trailing commas, and choose between single and double quotes for output."
          },
          {
                "title": "3. Format and Export",
                "desc": "Click Format to pretty-print the JSON. Copy the formatted output, minify it, or download as a .json file."
          }
    ],
    faqs: [
          {
                "question": "What JSON validation checks does the formatter perform before formatting?",
                "answer": "It validates: proper opening/closing brackets and braces, valid key-value separators, proper comma placement, valid string escaping, and numeric value formats. Invalid JSON is highlighted with the exact error position."
          },
          {
                "question": "How does the tool handle very large JSON documents (over 100 MB)?",
                "answer": "Large JSON is processed in streaming mode to avoid browser memory limits. The tool displays a progress bar and incremental preview. For files over 50 MB, minification is faster than pretty-printing."
          },
          {
                "question": "Can the formatter convert between JSON and JSON5 formats (with comments and trailing commas)?",
                "answer": "Yes, JSON5 mode allows comments (// and /* */), trailing commas, single-quoted keys, and unquoted keys. The tool can convert JSON5 to strict JSON and vice versa."
          }
    ]
},
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: 'Crawls any website and generates a standards-compliant XML sitemap. Supports JavaScript sites (React, Next.js, Vue), detects broken links, and provides SEO health insights.',
    seoDescription: 'Free online XML Sitemap Generator — Crawl any website and generate a standards-compliant XML sitemap. Supports JavaScript sites (React, Next.js, Vue), detects broken links, and provides SEO health insights. ',
    dependencies: "Fetch API / DOMParser"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: 'Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. Uses cloud-based processing.',
    seoDescription: 'Free online Meeting Minutes Generator — Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. ',
    dependencies: "OpenAI API",
    instructions: [
      { title: "1. Enter Your Meeting Notes", desc: "Paste your raw meeting notes, bullet points, or conversation transcript into the input field. Include any key decisions, action items, and attendee names you want captured." },
      { title: "2. Customize Output Sections", desc: "Choose which sections you want in the minutes — attendees, decisions, action items, follow-ups, discussion summary, or all of the above. Tailor the structure to your meeting type." },
      { title: "3. Generate and Export", desc: "Click generate to produce structured meeting minutes. Review, edit, and download the formatted document or copy it to your preferred note-taking tool." },
    ],
    faqs: [
      { question: "What types of notes work best?", answer: "The tool works best with detailed bullet points or paragraph notes that capture key discussion points, decisions, and assignments. Brief keywords are less effective than complete sentences describing outcomes." },
      { question: "Can I customize the output sections?", answer: "Yes. You can select exactly which sections to include — attendees, agenda, discussion summary, decisions, action items, and follow-ups. This lets you match the format to different meeting types." },
      { question: "Is my meeting data stored on the server?", answer: "Your notes are processed through the OpenAI API temporarily. We recommend removing sensitive or confidential information before processing. Processed results appear in your browser and you can save or delete them locally." },
      { question: "How is this different from a transcript?", answer: "Meeting minutes are a structured summary that extracts key decisions, action items, and next steps from raw notes. They're much shorter and more actionable than a full transcript, which captures every word spoken." },
    ]
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: "Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer's. Uses cloud-based processing.",
    seoDescription: "Free online AI Cover Letter Generator — Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer's. ",
    dependencies: "OpenAI API",
    instructions: [
      { title: "1. Enter Job Description and Resume", desc: "Paste the job description and your resume into the provided fields. The more detail you provide, the more tailored your cover letter will be." },
      { title: "2. Choose Tone and Style", desc: "Select your preferred tone — professional, enthusiastic, confident, or concise. Choose whether to highlight specific skills or experiences mentioned in the job description." },
      { title: "3. Generate and Customize", desc: "Click generate to produce a tailored cover letter. Review the output, make personal edits to match your voice, and download or copy the final version." },
    ],
    faqs: [
      { question: "How does the AI tailor the cover letter?", answer: "The AI analyzes keywords and requirements from the job description, then matches them against your resume's experience and skills. The cover letter highlights the most relevant qualifications for each specific role." },
      { question: "Should I edit the generated letter?", answer: "Yes. The AI provides a strong draft, but adding personal touches, specific anecdotes, and your unique voice makes the letter more authentic and effective. Always proofread before submitting." },
      { question: "What information should I include in my resume?", answer: "Include your complete work history, education, skills, certifications, and notable achievements. More detailed input helps the AI write a more specific and compelling cover letter." },
      { question: "Can I generate letters for multiple jobs?", answer: "Yes. Each generation is unique to the job description and resume provided. You can generate as many cover letters as needed for different applications." },
    ],
  },
  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: 'Converts JSON files to CSV format — APIs, configuration files, and data exchange between web services to spreadsheets, database exports, and data imports. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online JSON to CSV — Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers. ',
    dependencies: "PapaParse",
    instructions: [
      { title: "1. Paste JSON", desc: "Paste a JSON array of objects or upload a .json file." },
      { title: "2. Flatten Nested Fields", desc: "Optionally select which nested fields to flatten into columns." },
      { title: "3. Export CSV", desc: "Download the CSV or copy it to clipboard. Headers are derived from JSON keys." },
    ],
    faqs: [
      { question: "How are nested objects handled?", answer: "Nested objects are flattened using dot notation (e.g., 'address.city'). You can choose which nested paths to include." },
      { question: "What happens to arrays in JSON?", answer: "Arrays are stringified as JSON strings in a single cell. For arrays of objects, each object becomes a separate row." },
      { question: "Is the CSV RFC-compliant?", answer: "Yes. Fields containing commas, quotes, or newlines are properly escaped according to RFC 4180." },
    ],
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: 'Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Watermark PDF — Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF", desc: "Select the PDF document to add watermarks to." },
      { title: "2. Configure Watermark", desc: "Choose text watermark (enter text, font, size, color, opacity) or image watermark (upload PNG/JPG). Set position, rotation, and page range." },
      { title: "3. Apply & Download", desc: "The watermark is applied to selected pages. Download the watermarked PDF." },
    ],
    faqs: [
      { question: "Can I add watermarks to specific pages only?", answer: "Yes. Enter a page range (e.g., 1-3, 5) or select 'first page only' for cover-page watermarks." },
      { question: "What opacity should I use?", answer: "10-30% for visible-yet-subtle watermarks (DRAFT, CONFIDENTIAL). 50%+ for bold markings (COPY). Below 10% for background watermarks." },
      { question: "Can I use an image as watermark?", answer: "Yes. Upload a PNG or JPG with transparency. The image is repeated or centered across each page as configured." },
    ],
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: 'Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Page Delete — Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF", desc: "Select the PDF document to delete pages from." },
      { title: "2. Select Pages to Remove", desc: "View thumbnail previews of all pages. Click to mark pages for deletion. Use the page range input (1-3, 5, 8-10) for bulk selection." },
      { title: "3. Export Cleaned PDF", desc: "Download the PDF with selected pages removed. Remaining pages are renumbered sequentially." },
    ],
    faqs: [
      { question: "Can I undo page deletion?", answer: "The operation is applied immediately to the preview. You can reset and start over before downloading." },
      { question: "Are deleted pages recoverable after download?", answer: "No. Once you download the modified PDF without the deleted pages, those pages are permanently removed from that copy." },
      { question: "Does page deletion affect internal links?", answer: "Yes. Internal cross-references to deleted pages are removed. Links to remaining pages are updated to reflect new page numbers." },
    ],
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: 'Convert PNG images to SVG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to SVG — Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold. ',
    dependencies: "Potrace",
    instructions: [
          {
                "title": "1. Upload Your PNG Image",
                "desc": "Upload a PNG file you want to convert to vector. Simple graphics with solid colors, logos, and icons work best. Photos and gradients don't vectorize well — the result will have too many paths and lose visual quality."
          },
          {
                "title": "2. Choose Vectorization Settings",
                "desc": "Set the color palette size (2-32 colors) and path simplification level. Fewer colors and simpler paths produce cleaner SVGs. Preview the vectorized result overlaying the original to compare."
          },
          {
                "title": "3. Download as SVG",
                "desc": "Review the vector output and adjust settings if needed. Download the SVG file which is infinitely scalable and editable in tools like Illustrator or Inkscape. The SVG code is also shown for direct copy-paste into web projects."
          }
    ],
    faqs: [
          {
                "question": "Will text in my PNG be editable as text in the SVG?",
                "answer": "No, text in the PNG is rasterized pixels. The vectorization traces shapes, not characters. If you need editable text, recreate it as actual text elements in the SVG using a vector editor afterward."
          },
          {
                "question": "How many colors can the SVG output have?",
                "answer": "You can set between 2 and 32 colors. Fewer colors create cleaner, smaller files but lose detail. Photos need 32+ colors but the SVG file becomes bloated. PNG-to-SVG is best suited for flat-color graphics under 16 colors."
          },
          {
                "question": "What resolution PNG should I start with?",
                "answer": "Upload at least 500x500 pixels. Low-resolution PNGs lack edge detail and produce jagged vector paths. If you only have a small PNG, scale it up first using AI upscaling, then vectorize the larger version."
          }
    ]
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: 'Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Email Signature Generator — Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. ',
    dependencies: "React",
    instructions: [
      { title: "1. Enter Your Information", desc: "Fill in your name, title, company, phone, email, and website. The form-based interface builds your signature step by step." },
      { title: "2. Add Social Links and Branding", desc: "Toggle social media icons (LinkedIn, Twitter, Instagram, etc.) and enter your profile URLs. Choose your brand colors, font, and signature style." },
      { title: "3. Generate and Install", desc: "Click generate to produce HTML code. Copy the code and paste it into your email client's signature settings (Gmail, Outlook, Apple Mail, etc.)." }
    ],
    faqs: [
      { question: 'What email clients are supported?', answer: 'The generated HTML works in Gmail, Outlook, Apple Mail, Yahoo Mail, Thunderbird, and most webmail clients. Some styling may vary across clients.' },
      { question: 'Can I add a photo or logo?', answer: 'You can include a logo image by providing a URL. Upload your logo to an image hosting service first, then paste the URL into the signature builder.' },
      { question: 'Why does my signature look different in different clients?', answer: 'Email clients render HTML differently. Gmail strips certain CSS, Outlook uses Word\'s rendering engine. Test your signature in your target email client.' }
    ]
  },
  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Finance",
    description: 'Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables — perfect for retail pricing, wholesale negotiations, and e-commerce product listing optimization where you need to work backwards from a target margin.',
    seoDescription: 'Free online Margin Calculator — calculate gross margin %, markup %, cost, or selling price from any two known variables. Perfect for retail pricing, wholesale, and e-commerce. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter What You Know", desc: "Fill in any two of the four fields: cost, selling price, margin %, or markup %. The calculator infers the missing values automatically." },
      { title: "2. Adjust to Target Margin", desc: "If you know your desired margin %, enter it with either cost or price to find the missing number — perfect for pricing new products." },
      { title: "3. Read the Complete Picture", desc: "The tool displays all four values: cost, price, margin %, and markup %. Use the results to set profitable prices." },
    ],
    faqs: [
      { question: "How is this different from the Profit Margin Calculator?", answer: "Margin Calculator works backwards from any two known values to derive the others — ideal for pricing decisions (I want 40% margin on a $50 cost, what should I charge?). Profit Margin Calculator analyzes existing revenue and costs to show your current margins." },
      { question: "What's the difference between margin and markup?", answer: "Margin is the percentage of the selling price that is profit (profit/selling price). Markup is the percentage added to cost (profit/cost). A 25% margin equals a 33% markup. The calculator shows both so you understand your pricing from both perspectives." },
      { question: "Can I use this for wholesale pricing?", answer: "Yes. Enter your wholesale cost and desired margin to find the retail price. Or enter your retail price and see what margin you're making — essential for negotiating with suppliers and distributors." },
      { question: "Is this useful for e-commerce sellers?", answer: "Absolutely. E-commerce sellers on Amazon, Shopify, and Etsy use this to ensure their product pricing covers platform fees, fulfillment costs, and still delivers their target profit margin." },
    ]
  },
  {

    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: 'Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Morse Code Translator — Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Type or Paste Text",
                "desc": "Enter alphanumeric text in the input box. The translator supports A-Z, 0-9, and basic punctuation. Lowercase letters are automatically uppercased before encoding."
          },
          {
                "title": "2. Toggle Direction",
                "desc": "Choose whether to translate text to Morse code (encode) or Morse code to text (decode). In decode mode, use dots (.) and dashes (-) separated by spaces."
          },
          {
                "title": "3. Play Morse Audio",
                "desc": "Click the play button to hear the Morse code as audible tones. The speed slider controls the transmission rate from 5 to 40 words per minute."
          }
    ],
    faqs: [
          {
                "question": "What is the timing rule for Morse code spacing?",
                "answer": "The dot duration is the basic unit. Dash is 3 dots, space between parts of same letter is 1 dot, between letters is 3 dots, and between words is 7 dots."
          },
          {
                "question": "Can I translate Morse code that has slashes between words?",
                "answer": "Yes, the decoder treats a forward slash (/) as a word separator. Both slash-separated and space-separated Morse are accepted."
          },
          {
                "question": "Does the tool support prosigns or special Morse abbreviations?",
                "answer": "No, only standard ITU-R Morse code characters (A-Z, 0-9, basic punctuation) are supported. Prosigns like AR, SK, BT are not implemented."
          }
    ]
},
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: 'Transforms plain text into elegant cursive and script-style Unicode characters that imitate handwritten calligraphy. Ideal for wedding invitations, greeting cards, elegant Instagram captions, signatures, and any content needing a personal hand-written touch.',
    seoDescription: 'Free online Cursive Text Generator — transform plain text into elegant cursive and script-style Unicode characters that imitate handwritten calligraphy. Perfect for wedding invites, signatures, and elegant social captions. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Base Text", desc: "Type or paste the words you want in cursive. The generator converts each letter to its script-style Unicode equivalent while keeping full readability." },
      { title: "2. Choose Cursive Style", desc: "Browse cursive variants including standard script, bold script, and calligraphy-style letters. Each style gives a different hand-written feel." },
      { title: "3. Copy for Your Project", desc: "Click to copy the cursive text and paste it into invitations, social posts, bio descriptions, or any platform that needs an elegant handwritten look." },
    ],
    faqs: [
      { question: "How is this different from Fancy Text Generator?", answer: "Cursive Text Generator specializes in flowing, script-style characters that resemble handwriting — perfect for formal and personal content. Fancy Text Generator offers a broader range of 40+ decorative styles including bubble, gothic, and mathematical." },
      { question: "Is this real cursive handwriting?", answer: "The output uses Unicode mathematical script characters that visually resemble cursive handwriting. They render as italic, connected-looking letters on most devices, giving the appearance of calligraphy without requiring actual font files to be installed." },
      { question: "Can I use cursive text in professional documents?", answer: "Cursive text is best for informal and decorative use — social media bios, invitations, usernames. For professional documents, use actual cursive fonts installed in your word processor for better formatting control and print quality." },
      { question: "Does it support uppercase and numbers?", answer: "Yes. The cursive generator converts both uppercase and lowercase letters to their script-style equivalents. Numbers and symbols remain in standard form to maintain readability of addresses and dates." },
    ]
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Finance",
    description: 'Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount. Essential for marketing campaign evaluation, equipment purchase decisions, real estate investment analysis, and comparing investment opportunities.',
    seoDescription: 'Free online ROI Calculator — measure return on investment as percentage and dollar amount. Perfect for marketing campaigns, equipment purchases, real estate, and investment analysis. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Investment", desc: "Input the total amount you invested — whether it's marketing spend, equipment cost, stock purchase, or project budget." },
      { title: "2. Enter Your Return", desc: "Input the total return or gain from the investment. This is the revenue or value generated minus any ongoing costs." },
      { title: "3. Review Your ROI", desc: "The calculator shows both ROI % and net profit/loss in dollars. Use it to compare different investment opportunities side by side." },
    ],
    faqs: [
      { question: "How is this different from the Profit Margin or Break-Even calculators?", answer: "ROI Calculator measures the efficiency of an investment by comparing return to cost — useful for evaluating marketing campaigns, equipment, or projects. Profit Margin focuses on product pricing. Break-Even finds the volume needed to cover costs. Each serves a different business decision." },
      { question: "What's a good ROI?", answer: "A positive ROI means you made money. A 100% ROI means you doubled your investment. Compare against your cost of capital: if your ROI exceeds your borrowing rate, the investment is worthwhile. Typical target ROIs vary by industry and risk level." },
      { question: "Can I compare multiple investments?", answer: "This tool evaluates one investment at a time. Calculate ROI for each option individually, then compare the percentages — higher ROI generally indicates a more efficient use of capital." },
      { question: "Does this account for time?", answer: "This is a simple ROI calculation without time adjustment. For investments spanning multiple years, consider using annualized ROI or the NPV (net present value) method for time-value-of-money analysis." },
    ]
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Finance",
    description: 'Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online VAT Calculator — Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Price", desc: "Input the net price (excluding VAT) or gross price (including VAT)." },
    { title: "2. Select VAT Rate", desc: "Choose the applicable VAT rate for your country and product type." },
    { title: "3. View VAT Amount", desc: "See the VAT amount, net price, and gross price clearly displayed." },
  ],
    faqs: [
    { question: "What is the difference between VAT and sales tax?", answer: "VAT is collected at each stage of production, while sales tax is collected only at the final sale to consumers. Both are consumption taxes." },
    { question: "What VAT rates are available?", answer: "Common VAT rates include 5%, 10%, 13%, 17%, 20%, and 27% depending on the country and product category." },
    { question: "Can I calculate VAT for multiple items?", answer: "Enter the total price of all items to calculate VAT for the entire purchase." },
  ],
},
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: 'Evaluates password strength using zxcvbn entropy analysis: score, crack time estimate, length, character diversity, dictionary words, and pattern repetition.',
    seoDescription: 'Free online Password Strength Checker — Evaluates password strength using zxcvbn entropy analysis with score, crack time estimate, and improvement suggestions. ',
    dependencies: "zxcvbn",
    instructions: [
      { title: "1. Enter Your Password", desc: "Type or paste a password into the input field. The tool analyzes it in real time using zxcvbn entropy analysis — no submission button needed." },
      { title: "2. Review Strength Metrics", desc: "View your password's score (0-4), estimated crack time, and detailed feedback including length, character diversity, dictionary word detection, and pattern repetition." },
      { title: "3. Improve Weak Passwords", desc: "Use the suggestions panel to strengthen your password. The tool highlights specific issues — common patterns, dictionary words, repetitive characters — and shows how each change affects your score." },
    ],
    faqs: [
      { question: "What is zxcvbn?", answer: "zxcvbn is a password strength estimator developed by Dropbox that uses pattern matching and entropy calculation rather than simple rules like 'must include a number.' It provides realistic crack time estimates and actionable feedback." },
      { question: "Is my password sent anywhere?", answer: "No. Everything runs locally in your browser. The password analysis happens entirely on your device — your password is never transmitted, stored, or logged." },
      { question: "What makes a strong password?", answer: "A strong password is long (12+ characters), uses a mix of uppercase, lowercase, numbers, and symbols, avoids dictionary words and common patterns (qwerty, 123456, password), and is unique to each service." },
      { question: "What does the score mean?", answer: "The score ranges from 0 (very weak) to 4 (very strong). A score of 3 or higher indicates a password that would take years to crack with current technology. The estimated crack time gives a more intuitive sense of real-world strength." },
    ]
  },
  {

    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: 'Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. No signup or account required.',
    seoDescription: 'Free online JS Minifier — Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. ',
    dependencies: "Terser",
    instructions: [
          {
                "title": "1. Step 1",
                "desc": "Paste your JavaScript code for compression. The tool supports ES5, ES6+, modules, and TypeScript. It parses the abstract syntax tree to safely rename and compress without breaking anything."
          },
          {
                "title": "2. Step 2",
                "desc": "Select compression level from basic whitespace removal to advanced dead code elimination, constant folding, and tree shaking for maximum size reduction."
          },
          {
                "title": "3. Step 3",
                "desc": "Generate the minified JavaScript and compare sizes. Download the minified file with proper naming convention or copy the compressed code for production deployment."
          }
    ],
    faqs: [
          {
                "question": "What JavaScript minification techniques does the tool apply beyond simple whitespace removal?",
                "answer": "It performs identifier shortening known as mangling, dead code elimination, constant folding where constants are precomputed, expression simplification, and block statement merging."
          },
          {
                "question": "How does the minifier ensure compatibility with older browsers during the minification process?",
                "answer": "The ES5 compatibility mode avoids using modern syntax like arrow functions and const in the output. Ensure your target browser matrix is set before starting minification."
          },
          {
                "question": "Can the minifier preserve specific function or variable names from being shortened during mangling?",
                "answer": "Yes, a reserved names list lets you specify identifiers to exclude from mangling such as jQuery dollar sign and underscore for global API names exposed to consumers."
          }
    ]
},
  {

    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: 'Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Base64 Encode/Decode — Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. ',
    dependencies: "btoa/atob",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Enter Input Data",
                "desc": "Type or paste text, upload a file, or choose from sample data to encode or decode using Base64 (RFC 4648) or Base64-URL (RFC 4648 section 5)."
          },
          {
                "title": "2. Choose Encoding Options",
                "desc": "Select Standard Base64 (with + and / characters) for general use, or Base64-URL (with - and _ characters, no padding) for URL-safe contexts like JWTs and signed URLs."
          },
          {
                "title": "3. Encode or Decode",
                "desc": "Click Encode to convert to Base64 or Decode to convert back. View both the result and a character-by-character breakdown of the encoding process."
          }
    ],
    faqs: [
          {
                "question": "What is the difference between Base64 and Base64-URL encoding?",
                "answer": "Standard Base64 uses + and / characters which need URL encoding in query strings. Base64-URL replaces + with - and / with _, omits padding = characters, and is safe for use in URLs, filenames, and JWT without additional percent-encoding."
          },
          {
                "question": "How does the tool handle decoding of malformed Base64 strings?",
                "answer": "It gracefully handles common issues: missing padding (= characters are added if needed), whitespace is stripped, and invalid characters are flagged with their position. Non-ASCII input is assumed to be UTF-8."
          },
          {
                "question": "Can the tool detect whether a given string is already Base64-encoded?",
                "answer": "Yes, the auto-detect mode analyzes the character set (A-Z, a-z, 0-9, +, /, =), checks string length divisibility by 4, and attempts decoding to verify — showing a confidence score for the detection."
          }
    ]
},
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: 'Render typed text as realistic handwritten output with configurable fonts, ink colors, paper styles, and simulated pressure variations. Create handwritten-looking notes, letters, and assignments.',
    seoDescription: 'Free online Text to Handwriting — Convert typed text to realistic handwritten output with customizable fonts, ink colors, paper backgrounds, and pressure variations. Create handwritten notes digitally.',
    dependencies: "Canvas API",
    instructions: [
    { title: "1. Type or Paste Your Content", desc: "Enter the text you want rendered as handwriting. Supports paragraphs, lists, and multi-page content." },
    { title: "2. Customize Handwriting Style", desc: "Choose from handwriting fonts, ink colors (blue, black, dark blue), paper style (ruled, plain, grid, dotted), and adjust font size and page margins for a natural look." },
    { title: "3. Download as Image", desc: "Preview the handwritten output and download it as a PNG image. The result mimics real handwriting with natural variations in letter spacing and line alignment." },
  ],
    faqs: [
    { question: "What handwriting fonts are available?", answer: "The tool includes multiple handwriting fonts ranging from neat print-style to casual cursive. Each font simulates natural variations in letter forms with slight randomization for authenticity." },
    { question: "Can I adjust the handwriting appearance?", answer: "Yes. Customize ink color (choose from realistic pen colors), paper background (ruled notebook, plain white, grid, dotted), font size, line spacing, page margins, and stain/effect overlays for a more authentic look." },
    { question: "How do I download the result?", answer: "The handwritten output is rendered on a canvas and can be downloaded as a PNG image. For multi-page content, each page can be downloaded individually." },
    { question: "Can I use this for professional work?", answer: "Text to Handwriting is best for personal projects, creative content, and educational use. For professional documents, use actual word processing tools with handwriting fonts for better formatting control." },
  ]
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: 'Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Receipt Generator — Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. ',
    dependencies: "Canvas API / jsPDF"
  ,
    instructions: [
    { title: "1. Enter Details", desc: "Add your business info, customer details, and receipt date." },
    { title: "2. Add Items", desc: "List the items or services provided with quantities and prices." },
    { title: "3. Generate Receipt", desc: "Preview and download the receipt as PDF for record keeping." },
  ],
    faqs: [
    { question: "What information appears on the receipt?", answer: "Business name, address, date, receipt number, itemized list, quantities, prices, subtotal, tax, and total." },
    { question: "Can I customize the receipt?", answer: "Yes. Add your business details, logo, and customize the receipt appearance." },
    { question: "Are receipts saved?", answer: "No. Receipts are generated locally in your browser and are not stored on any server." },
  ],
},
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: 'Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. Uses cloud-based processing.',
    seoDescription: 'Free online AI Thumbnail Maker — Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. ',
    dependencies: "Canvas API / OpenAI API",
    instructions: [
      { title: "1. Enter Your Video Title", desc: "Type your video title or topic. The AI analyzes it to suggest relevant imagery, text overlays, and composition that maximize click-through rate." },
      { title: "2. Customize the Design", desc: "Choose from AI-generated thumbnail templates. Add text, adjust colors, position elements, and apply effects. Preview how the thumbnail looks at YouTube display size." },
      { title: "3. Export Your Thumbnail", desc: "Download the final thumbnail as a high-resolution PNG or JPEG. The output is optimized for YouTube's 1280x720 recommended thumbnail dimensions." },
    ],
    faqs: [
      { question: "What makes a good YouTube thumbnail?", answer: "Good thumbnails have high contrast, readable text (3-5 words max), expressive faces, bright colors, and clear focal points. They should be understandable at small sizes on mobile devices." },
      { question: "Can I use my own images?", answer: "Yes. You can upload your own background images, logos, or face shots. The tool composites them into the thumbnail design with text overlays and effects." },
      { question: "What size should the thumbnail be?", answer: "YouTube recommends 1280x720 pixels (16:9 ratio). The tool outputs at this optimal resolution. Minimum width is 640 pixels." },
      { question: "Are the AI-generated designs unique?", answer: "Yes. The AI generates unique compositions based on your video title and preferences. Each design is created fresh, not selected from a template library." },
    ]
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: 'Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. Uses cloud-based processing.',
    seoDescription: 'Free online Secure Note Sharer — Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. ',
    dependencies: "Crypto API / Redis",
    instructions: [
      { title: "1. Write Your Note", desc: "Type or paste the sensitive information you want to share securely. This could be a password, API key, personal message, or any confidential text." },
      { title: "2. Set a Passphrase and Options", desc: "Create a passphrase that the recipient must enter to view the note. The note is encrypted with this passphrase before being stored. Optionally set view-once mode." },
      { title: "3. Share the One-Time Link", desc: "Copy the generated link and send it to your recipient via any channel (email, chat, etc.). Share the passphrase separately. The note self-destructs after being read once." },
    ],
    faqs: [
      { question: "How is the note encrypted?", answer: "The note is encrypted in your browser using the Web Crypto API before being sent to the server. The server never sees the unencrypted content. Only someone with the correct passphrase can decrypt and read it." },
      { question: "What does one-time view mean?", answer: "Once the recipient opens the link and enters the correct passphrase, the note is permanently deleted from the server. Even if someone gets the same link later, the content is gone." },
      { question: "How should I share the passphrase?", answer: "Share the link and passphrase through separate channels for security. For example, send the link via email and the passphrase via SMS or messaging app. This prevents anyone intercepting a single channel from accessing both." },
      { question: "How long is the note stored?", answer: "The note is stored until it is read (in one-time mode) or until it expires (typically 24-48 hours). Unread notes are automatically purged after expiration." },
    ]
  },
  {
    id: "141",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Video",
    description: "Convert MP4/WebM to GIF animations. Max 500MB input. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Video to GIF — Convert MP4/WebM to GIF animations. Max 500MB input. ',
    dependencies: "FFmpeg / gif.js",
    instructions: [
    { title: "1. Upload a Video", desc: "Choose an MP4 or other video file to convert to animated GIF format." },
    { title: "2. Adjust GIF Settings", desc: "Set output dimensions and frame rate. Lower frame rates reduce file size but also reduce animation smoothness." },
    { title: "3. Download Your GIF", desc: "Download the generated animated GIF, ready to share on social media, forums, or messaging apps." },
  ],
    faqs: [
    { question: "How long should the video be?", answer: "Shorter videos (under 30 seconds) work best. Longer videos create very large GIF files." },
    { question: "How do I control GIF file size?", answer: "Reduce output dimensions and frame rate. Lower frame rates (10-15 fps) still produce smooth animations." },
    { question: "What frame rate should I use?", answer: "15-24 fps for smooth motion. 10 fps works well for smaller file sizes." },
  ],
},
  {

    id: "142",
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "Developer",
    description: 'Convert images to Base64 encoded data URIs directly in your browser. Supports PNG, JPG, WebP, SVG, and GIF. 100% client-side.',
    seoDescription: 'Free online Image to Base64 — Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON. ',
    dependencies: "FileReader API",
    instructions: [
          {
                "title": "1. Upload an Image File",
                "desc": "Drag and drop or browse to select an image file. Supports PNG, JPEG, GIF, WebP, SVG, BMP, AVIF, and TIFF formats up to 25 MB."
          },
          {
                "title": "2. Preview and Configure Output",
                "desc": "View a preview of the uploaded image. Optionally resize or compress before encoding. Choose whether to include the data URI prefix (data:image/png;base64,)."
          },
          {
                "title": "3. Copy Base64 String",
                "desc": "Copy the generated Base64 string to your clipboard. The tool displays the encoded length and original file size for comparison."
          }
    ],
    faqs: [
          {
                "question": "How much larger is a Base64-encoded image compared to the original binary file?",
                "answer": "Base64 encoding increases file size by approximately 33% over the original binary. A 100 KB image becomes about 137 KB of Base64 text (including data URI prefix) due to the 6-bit to 8-bit encoding overhead."
          },
          {
                "question": "When should I use Base64 images in HTML/CSS instead of separate image files?",
                "answer": "Base64 images are useful for small images (under 10 KB) that are embedded in CSS or HTML to reduce HTTP requests. For larger images, separate files load faster because browsers cache them independently."
          },
          {
                "question": "Can the tool process multiple images at once for batch conversion?",
                "answer": "Yes, upload multiple images and each is processed independently. The output shows all Base64 strings with labels, and you can copy individual results or download all as a JSON map of filename to Base64 string."
          }
    ]
},
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: 'Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame. Uses cloud-based processing.',
    seoDescription: 'Free online Subtitle Translator — Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame. ',
    dependencies: "Google Translate API",
    instructions: [
    { title: "1. Upload Subtitle File", desc: "Upload an SRT, VTT, or ASS subtitle file. The tool reads existing subtitles and their timestamps." },
    { title: "2. Choose Target Language", desc: "Select the language to translate the subtitles into. Translation preserves original timing." },
    { title: "3. Download Translated Subtitles", desc: "Download the translated subtitle file in the same format. All timestamp alignments are preserved." },
  ],
    faqs: [
    { question: "What subtitle formats are supported?", answer: "SRT, VTT, and ASS formats. Output matches input format." },
    { question: "How accurate is translation?", answer: "Machine translation handles common phrases well but may struggle with idioms and technical terms." },
    { question: "Are timestamps preserved?", answer: "Yes. Original timing is preserved exactly. Only text content is translated." },
  ],
},
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: 'Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online IBAN Validator — Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. ',
    dependencies: "ibantools"
  ,
    instructions: [
    { title: "1. Enter IBAN", desc: "Type or paste the IBAN you want to validate." },
    { title: "2. Validate", desc: "The tool checks the IBAN structure, country code, and check digits." },
    { title: "3. View Bank Info", desc: "See the validated IBAN with bank identifier and branch details." },
  ],
    faqs: [
    { question: "What is an IBAN?", answer: "IBAN (International Bank Account Number) is a standard international numbering system for bank accounts, used for cross-border transactions." },
    { question: "Which countries use IBAN?", answer: "IBAN is used primarily in Europe, the Middle East, and parts of Africa. The US and Canada use routing numbers instead." },
    { question: "Does validation guarantee the account exists?", answer: "No. Validation checks the IBAN structure and check digits but does not verify that the actual bank account exists." },
  ],
},
  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: 'Converts CSV files to JSON format — spreadsheets, database exports, and data imports to APIs, configuration files, and data exchange between web services. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online CSV to JSON — Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields. ',
    dependencies: "PapaParse",
    instructions: [
      { title: "1. Paste or Upload CSV", desc: "Paste your CSV data or upload a CSV file. The tool automatically detects delimiters (comma, tab, semicolon)." },
      { title: "2. Configure Options", desc: "Choose header row handling, quote character, and whether to trim whitespace." },
      { title: "3. Convert & Copy", desc: "Click Convert to generate JSON. Copy the result or download as a .json file." },
    ],
    faqs: [
      { question: "What delimiter is supported?", answer: "Comma is the default, but the tool auto-detects tabs, semicolons, and pipes. You can also set a custom delimiter." },
      { question: "How are quoted fields handled?", answer: "Fields enclosed in double quotes are preserved as single values, even if they contain delimiters or newlines." },
      { question: "Can I convert CSV with no headers?", answer: "Yes. Toggle the 'first row is header' option. Without headers, columns are named field_0, field_1, etc." },
    ],
  },
  {
    id: "151b",
    name: "CSV to XML",
    slug: "csv-to-xml",
    category: "Converter",
    description: 'Converts CSV files to XML format — spreadsheets, database exports, and data imports to enterprise systems, SOAP APIs, document formats like DOCX and SVG. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online CSV to XML — Parses CSV data and converts it into well-formed XML documents using configurable root and row element names. ',
    dependencies: "PapaParse / xml2js",
    showInCategory: false,
    instructions: [
      { title: "1. Enter CSV Data", desc: "Paste comma-separated values or upload a CSV file." },
      { title: "2. Set Root Element", desc: "Enter a root element name for the XML output (e.g., 'items' or 'records')." },
      { title: "3. Generate XML", desc: "The tool converts each row into an XML element. Copy or download the result." },
    ],
    faqs: [
      { question: "What if my CSV has no header row?", answer: "You can specify custom element names for columns. Otherwise generic 'column1', 'column2' names are used." },
      { question: "How are empty cells handled?", answer: "Empty cells are omitted from the XML output by default, or you can include them as empty elements." },
      { question: "Can I set a custom namespace?", answer: "Yes. You can add an XML namespace prefix to the root element." },
    ],
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: 'Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Rotate PDF — Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF", desc: "Select a PDF document. The tool shows thumbnail previews of all pages for rotation." },
      { title: "2. Rotate Pages", desc: "Click individual pages to rotate them 90 clockwise. Use 'rotate all' for uniform rotation. Each click adds 90 of rotation." },
      { title: "3. Save Rotated PDF", desc: "Download the PDF with pages rotated to your desired orientation." },
    ],
    faqs: [
      { question: "What rotation angles are available?", answer: "90, 180, and 270 degrees. Each click rotates by 90 . Rotate a page twice for 180  (upside down)." },
      { question: "Does rotating affect text selectability?", answer: "No. Text in rotated pages remains selectable and searchable. Only the visual orientation changes." },
      { question: "Can I rotate only odd or even pages?", answer: "Yes. Use 'rotate odd pages' or 'rotate even pages' for duplex scanning corrections." },
    ],
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: 'Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Extract Images from PDF — Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. ',
    dependencies: "pdf.js",
    instructions: [
      { title: "1. Upload PDF", desc: "Select a PDF containing embedded images. The tool scans each page for raster images." },
      { title: "2. Choose Images", desc: "Preview all detected images with thumbnails. Select individual images or 'select all' to extract everything." },
      { title: "3. Download Images", desc: "Download selected images as a ZIP archive. Each image retains its original format (JPEG, PNG, TIFF) where possible." },
    ],
    faqs: [
      { question: "What image formats are embedded in PDFs?", answer: "PDFs typically contain JPEG (photos), PNG/JPX (high-quality images), and CCITT (fax/black & white scans). The tool preserves original formats." },
      { question: "Are vector graphics extractable?", answer: "The tool extracts raster images only. Vector graphics (logos, diagrams) are rendered as PNG if enabled in settings." },
      { question: "What is the maximum image resolution?", answer: "Images are extracted at their original resolution as embedded in the PDF. No upscaling or downscaling is applied." },
    ],
  },
  {

    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: 'Formats SQL queries with proper keyword capitalization, indentation, and clause alignment for readable database operations.',
    seoDescription: 'Free online SQL Formatter — Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference. ',
    dependencies: "sql-formatter",
    instructions: [
          {
                "title": "1. Step 1",
                "desc": "Paste any SQL statement including SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, WITH clauses, JOINs, subqueries, window functions, and CTEs for formatting."
          },
          {
                "title": "2. Step 2",
                "desc": "Choose the SQL dialect such as MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, or Snowflake. Configure keyword case, indentation, and line width."
          },
          {
                "title": "3. Step 3",
                "desc": "Format the SQL with consistent indentation and line breaks at major clauses with aligned keywords. The tool also validates basic SQL syntax during formatting."
          }
    ],
    faqs: [
          {
                "question": "How does the SQL formatter handle formatting of complex JOIN operations and subqueries?",
                "answer": "JOIN clauses are indented and aligned with their ON conditions. Subqueries are wrapped in parentheses and indented one level. Correlated subqueries are aligned with context."
          },
          {
                "question": "Can the formatter convert between different SQL dialects during the formatting process?",
                "answer": "Yes, optional dialect conversion handles LIMIT and OFFSET becoming TOP or ROW_NUMBER and ILIKE becoming LOWER equals LOWER for cross-dialect compatibility."
          },
          {
                "question": "Does the tool support formatting of DDL statements like CREATE TABLE with column definitions?",
                "answer": "Yes, CREATE TABLE columns are formatted one per line with type, constraints such as NOT NULL and DEFAULT and PRIMARY KEY, and comments aligned for readability."
          }
    ]
},
  {

    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: 'Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online UUID Generator — Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). ',
    dependencies: "uuid",
    instructions: [
          {
                "title": "1. Specify UUID Version",
                "desc": "Select UUID version (v1, v4, v5) — v4 generates random UUIDs, v1 uses timestamp + MAC, v5 uses SHA-1 namespace hash. Default to v4 for most use cases."
          },
          {
                "title": "2. Set Output Count",
                "desc": "Choose how many UUIDs to generate in a single batch (1–10,000). For bulk generation, consider the 5,000 batch limit to avoid browser lag."
          },
          {
                "title": "3. Copy and Verify",
                "desc": "Click the Copy button to copy all generated UUIDs to clipboard. Paste into your database or config and verify uniqueness — collisions are astronomically rare for v4."
          }
    ],
    faqs: [
          {
                "question": "Can I generate time-ordered UUIDs (v7) with this tool?",
                "answer": "This tool supports UUID v1, v4, and v5. UUID v7 (time-ordered with random suffix) is not yet supported. For time-sorted UUIDs, consider PostgreSQL's gen_random_uuid() or a dedicated v7 library. v4 remains the most widely supported version across databases and programming languages."
          },
          {
                "question": "How do UUID v5 namespace UUIDs work?",
                "answer": "UUID v5 generates a deterministic UUID from a namespace UUID and a name string using SHA-1 hashing. This tool provides predefined namespaces (DNS, URL, OID, X500) plus a custom option. The same namespace + name always produces identical UUIDs, making v5 useful for generating consistent identifiers without a central authority."
          },
          {
                "question": "What is the difference between UUID v1 and v4 regarding privacy?",
                "answer": "UUID v1 encodes the generating machine's MAC address and timestamp, which can be a privacy concern in client-facing applications. UUID v4 uses purely random bits (122 bits of entropy) and reveals nothing about the source machine. For security-sensitive or user-facing identifiers, always prefer v4 over v1."
          }
    ]
},
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: 'Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online HEX to RGB Converter — Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter a Hex Color Code", desc: "Type or paste a hex color code (e.g., #FF5733, #3498db, or shorthand #F00). The tool accepts 3, 6, or 8-digit hex values with or without the # prefix." },
      { title: "2. View RGB and RGBA Values", desc: "The tool instantly converts your hex code to RGB (red, green, blue) and RGBA (with alpha channel) values. Each channel shows values from 0-255." },
      { title: "3. Copy the Results", desc: "Click the copy button next to any format to copy the color value to your clipboard. Use the RGB values in CSS, design software, or anywhere that accepts RGB color notation." },
    ],
    faqs: [
      { question: "What's the difference between RGB and RGBA?", answer: "RGB uses three values (red, green, blue) with no transparency. RGBA adds a fourth alpha channel (0-1) for opacity. For example, rgba(255, 0, 0, 0.5) is semi-transparent red." },
      { question: "Does this work with 3-digit hex codes?", answer: "Yes. 3-digit shorthand codes like #F00 expand to #FF0000. The tool handles 3-digit, 6-digit, and 8-digit (with alpha) hex formats automatically." },
      { question: "Can I convert back from RGB to Hex?", answer: 'Yes. Use the Color Converter tool for bidirectional color conversion between Hex, RGB, HSL, HSV, and CMYK formats.' },
      { question: "Is my color data sent to a server?", answer: "No. All color conversion happens locally in your browser using client-side JavaScript. Nothing is uploaded or stored." },
    ]
  },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Health",
    description: 'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online BMR Calculator — Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Details", desc: "Input your age, sex, height, and weight. The Mifflin-St Jeor equation uses these factors to calculate your Basal Metabolic Rate accurately." },
      { title: "2. Choose Your Units", desc: "Select metric (cm/kg) or imperial (ft/in/lbs). The calculator handles the conversion so you can use whatever units you're comfortable with." },
      { title: "3. View Your BMR", desc: "Your BMR — calories burned at complete rest — is displayed instantly. Use this baseline for diet planning and weight management." }
    ],
    faqs: [
      { question: 'What is BMR?', answer: 'Basal Metabolic Rate (BMR) is the calories your body needs at complete rest for vital functions like breathing, circulation, and cell production. It accounts for 60-75% of your daily calorie burn.' },
      { question: 'What is the Mifflin-St Jeor equation?', answer: 'It\'s the most accurate BMR formula. Men: 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5. Women: 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161.' },
      { question: 'How do I use BMR for weight management?', answer: 'Multiply your BMR by an activity factor (1.2 sedentary to 1.9 very active) to estimate TDEE. To lose weight, eat below TDEE. To gain, eat above. BMR gives you the baseline for these calculations.' }
    ]
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: 'Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Meta Tag Generator — Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. ',
    dependencies: "Vanilla JS"
  },
  {

    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: 'Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Text to Binary — Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Enter Text Input",
                "desc": "Type or paste any text string — letters, numbers, symbols, or Unicode characters including emoji — that you want to convert to binary representation."
          },
          {
                "title": "2. Select Encoding and Format",
                "desc": "Choose character encoding: ASCII (7-bit), UTF-8 (variable), UTF-16, or UTF-32. Select output format: simple binary string or grouped bytes with separators."
          },
          {
                "title": "3. Convert and Inspect",
                "desc": "View each character's binary representation, decimal code point, and hex value. The tool shows the full binary sequence as a continuous string or grouped by byte."
          }
    ],
    faqs: [
          {
                "question": "How does UTF-8 encoding affect the binary representation of characters differently than ASCII?",
                "answer": "ASCII characters (U+0000–U+007F) use 7 bits in UTF-8. Characters above U+007F use 2–4 bytes in UTF-8, while ASCII always uses exactly 7 bits (padded to 8). Emoji like 😀 (U+1F600) require 4 bytes (32 bits) in UTF-8."
          },
          {
                "question": "What is the difference between binary representation with spaces vs without?",
                "answer": "Without spaces, the binary output is a continuous string of bits. With spaces (grouped by byte), each 8-bit group represents one character in ASCII or one byte in UTF-8, making it easier to read individual character encodings."
          },
          {
                "question": "Can the tool reverse binary back to the original text for verification?",
                "answer": "Yes, the reverse mode accepts a binary string and converts it back to text using the same encoding setting. This allows you to round-trip test: text → binary → text to verify the conversion is lossless."
          }
    ]
},
  {

    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: 'Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Binary to Text — Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error. ',
    dependencies: "Vanilla JS",
    instructions: [
          {
                "title": "1. Enter Binary Data",
                "desc": "Type or paste binary data as a string of 0s and 1s, with or without spaces separating bytes (8-bit groups) for readability."
          },
          {
                "title": "2. Configure Binary Interpretation",
                "desc": "Choose the bit grouping: 7-bit (ASCII), 8-bit (standard byte), 16-bit (Unicode), or 32-bit (UTF-32). Select endianness for multi-byte interpretations."
          },
          {
                "title": "3. Convert and View",
                "desc": "Click Convert to decode the binary to text. The tool shows the decimal and hex value for each byte alongside the decoded character."
          }
    ],
    faqs: [
          {
                "question": "What character encodings does the binary-to-text converter support?",
                "answer": "It supports ASCII (7-bit), extended ASCII/Latin-1 (8-bit), UTF-8 (variable-width), UTF-16LE/BE, UTF-32 LE/BE, and EBCDIC. UTF-8 is the default and recommended encoding."
          },
          {
                "question": "How does the tool handle binary strings with spaces, hyphens, or other separators?",
                "answer": "It automatically detects and strips common separators: spaces, hyphens, dots, and underscores between byte groups. The tool also accepts raw binary strings without any separator."
          },
          {
                "question": "Can the tool convert text to binary as a reverse operation?",
                "answer": "Yes, the reverse mode converts any input text to its binary representation, showing each character's code point in binary form with proper byte grouping."
          }
    ]
},
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Finance",
    description: 'Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes. Essential for startup pricing strategy, product launch planning, and manufacturing cost analysis where knowing your break-even point is critical before committing to production.',
    seoDescription: 'Free online Break-Even Calculator — find the exact unit volume or revenue needed to cover fixed and variable costs. Price sensitivity slider for what-if analysis. Perfect for startups and product launches. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Fixed Costs", desc: "Input your total fixed costs — rent, salaries, equipment, insurance — costs that don't change with production volume." },
      { title: "2. Enter Variable Costs & Price", desc: "Input your per-unit variable cost (materials, labor, shipping) and your selling price per unit." },
      { title: "3. Find Your Break-Even Point", desc: "The calculator shows the number of units you need to sell and the revenue required to break even. Use the price sensitivity slider to see how pricing affects your break-even." },
    ],
    faqs: [
      { question: "How is this different from the ROI or Profit Margin calculators?", answer: "Break-Even Calculator tells you how many units you must sell before you start making a profit — essential for pricing and production decisions. ROI measures the return on an investment. Profit Margin shows your percentage profit per sale. They work together for complete business analysis." },
      { question: "What happens if I change my selling price?", answer: "Use the price sensitivity slider to simulate different price points. A higher price means fewer units needed to break even, but may reduce demand. A lower price means more units needed but potentially higher volume." },
      { question: "Can I include multiple products?", answer: "This calculator is designed for a single product or service. For multi-product businesses, calculate break-even for each product line separately, or use average contribution margin across your product mix." },
      { question: "Is break-even analysis only for startups?", answer: "No. Established businesses use break-even analysis for new product launches, pricing changes, cost reduction decisions, expansion planning, and evaluating whether to accept large orders or enter new markets." },
    ]
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Branding",
    description: 'Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Conversion Rate Calculator — Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Conversions and Visitors", desc: "Input the number of conversions and total visitors. The calculator divides conversions by visitors to find your conversion rate." },
      { title: "2. Set Decimal Precision", desc: "Choose how many decimal places to show in the result. Standard precision is 2 decimal places." },
      { title: "3. View Your Rate", desc: "See your conversion rate as a percentage. Use this metric to evaluate campaign performance." }
    ],
    faqs: [
      { question: 'What is conversion rate?', answer: 'Conversion rate is the percentage of visitors who complete a desired action (purchase, signup). Calculated as conversions divided by total visitors times 100.' },
      { question: 'What is a good conversion rate?', answer: 'Average rates vary: e-commerce 2-3%, B2B SaaS 3-5%, lead gen 5-10%. Above industry average is good.' },
      { question: 'How to improve conversion rate?', answer: 'Improve page speed, simplify forms, add social proof, use clear CTAs, A/B test, optimize for mobile.' }
    ]
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Branding",
    description: 'Computes cost per mille (CPM) — the cost advertisers pay per 1,000 ad impressions. Includes platform presets for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, and LinkedIn with average rates, plus RPM (revenue per mille) calculation for creators.',
    seoDescription: 'Free online CPM Calculator — compute cost per mille for ad campaigns with platform presets for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, and LinkedIn. Includes RPM for creators. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Select a Platform", desc: "Choose a preset for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, or LinkedIn — each pre-fills typical CPM and RPM averages for reference. Or select Custom for manual entry." },
      { title: "2. Enter Your Numbers", desc: "In CPM mode, enter total ad spend and impressions. In RPM mode, enter creator revenue and views. The result updates instantly." },
      { title: "3. Read Both Metrics", desc: "The tool shows both CPM and RPM side by side regardless of which mode you're in. Use CPM for advertiser planning and RPM for creator earnings analysis." },
    ],
    faqs: [
      { question: "What's the difference between CPM and RPM?", answer: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions — the cost side. RPM (Revenue Per Mille) is what publishers and creators earn per 1,000 views — the revenue side. RPM is typically 40-60% of CPM because platforms take a revenue share." },
      { question: "What CPM should I expect for my platform?", answer: "Typical average CPMs vary: LinkedIn ~$9, Instagram ~$8, Facebook ~$6, Twitter ~$5, Twitch ~$4, YouTube ~$3.50, TikTok ~$1.50. Actual rates depend on your niche, audience location, ad format, and season." },
      { question: "How is RPM different from CPM for creators?", answer: "A creator earning $150 from 100,000 YouTube views has an RPM of $1.50, even though the advertiser CPM might be $3.50. The difference is the platform's revenue share (~45% for YouTube). RPM shows what you actually earn." },
      { question: "Can I use this for campaign planning?", answer: "Yes. Advertisers use CPM to budget campaigns: if your target CPM is $5 and you want 1M impressions, budget $5,000. Use the platform presets as starting points and adjust based on your actual campaign data." },
    ]
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Branding",
    description: 'ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online ROAS Calculator — ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Revenue and Ad Spend", desc: "Input your total ad revenue and total ad spend. The calculator divides revenue by spend." },
      { title: "2. View Your ROAS", desc: "See your return on ad spend as a ratio (e.g., 4:1 = $4 earned per $1 spent)." },
      { title: "3. Evaluate Campaigns", desc: "Use ROAS to assess which campaigns and channels are performing best." }
    ],
    faqs: [
      { question: 'What is ROAS?', answer: 'Return on Ad Spend measures revenue generated per dollar spent on advertising. Revenue divided by ad spend.' },
      { question: 'What is a good ROAS?', answer: '4:1 is generally good. Break-even depends on profit margins. E-commerce targets 3-5:1.' },
      { question: 'ROAS vs ROI?', answer: 'ROAS focuses on ad revenue vs ad spend. ROI considers total costs and total profit.' }
    ]
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: 'Podcast Transcription processes long-form audio files into text using speech recognition.',
    seoDescription: 'Free online Podcast Transcription — Convert long-form podcast audio files into text. Uses cloud-based processing.',
    dependencies: "Whisper API",
    instructions: [
      { title: "1. Upload Your Podcast Episode", desc: "Select your podcast audio file (MP3, WAV, M4A) from your device. The tool is optimized for long-form audio — episodes up to 3 hours are supported." },
      { title: "2. Choose Language and Diarization", desc: "Select the episode's primary language. Enable speaker diarization to label different speakers in the transcript — essential for multi-host or interview episodes." },
      { title: "3. Transcribe and Export", desc: "Start the transcription. Once complete, review the text, identify speakers by name, and export the transcript as TXT, SRT, or VTT for show notes or subtitles." },
    ],
    faqs: [
      { question: "How long does podcast transcription take?", answer: "Processing time scales with episode length. A one-hour podcast typically transcribes in 5-10 minutes depending on server load. Longer episodes take proportionally more time." },
      { question: "Can I identify speakers by name?", answer: "For best results, provide speaker names in your request. Speaker diarization labels each speaker as Speaker 1, Speaker 2, etc. You can manually rename them after reviewing the transcript." },
      { question: "What formats can I export to?", answer: "You can export as plain text (TXT), SubRip subtitles (SRT), or WebVTT (VTT). TXT is best for show notes, SRT and VTT are formatted for podcast video subtitles on YouTube or your podcast player." },
      { question: "Is this suitable for editing podcast show notes?", answer: "Yes. The transcript provides a complete text base that you can edit down into show notes, timestamps, key quotes, and summaries — saving hours of manual transcription and note-taking." },
    ]
  },
  {

    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online CSS Minifier — Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. ',
    dependencies: "clean-css",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Step 1",
                "desc": "Paste your CSS source code or upload a stylesheet file that needs to be compressed. The tool accepts any valid CSS including custom properties, preprocessor output, and browser-specific extensions."
          },
          {
                "title": "2. Step 2",
                "desc": "Select a compression level from safe whitespace removal to aggressive optimization including color shortening and selector merging. Each level offers different size reduction trade-offs."
          },
          {
                "title": "3. Step 3",
                "desc": "Run the minification process and compare the original file size against the compressed result. Download the minified CSS or copy it directly for use in your production deployment pipeline."
          }
    ],
    faqs: [
          {
                "question": "How much size reduction can I expect from CSS minification for my stylesheets?",
                "answer": "Typical reduction ranges from 30 to 60 percent depending on original formatting. Safe mode saves about 20 to 30 percent by removing whitespace while aggressive mode can save up to 70 percent."
          },
          {
                "question": "What CSS optimizations does the aggressive compression mode perform beyond whitespace removal?",
                "answer": "Aggressive mode performs hex color shortening, margin and padding shorthand merging, duplicate selector removal, redundant property removal, zero unit stripping, and font-weight number conversion."
          },
          {
                "question": "Does the minifier preserve CSS source maps for debugging the minified output files?",
                "answer": "Yes, source map generation can be enabled. The minifier outputs a map file alongside the minified CSS, allowing browser devtools to map minified styles back to the original source."
          }
    ]
},
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: 'Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Compare PDF Files — Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. ',
    dependencies: "pdf.js",
    instructions: [
      { title: "1. Upload Two PDFs", desc: "Select the original and modified PDF versions to compare. The tool analyzes both documents page by page." },
      { title: "2. Choose Comparison Mode", desc: "Select 'visual' (image-based pixel diff) or 'textual' (text content difference). Visual mode detects layout changes; textual focuses on word changes." },
      { title: "3. Review Differences", desc: "View highlighted differences: added content in green, removed in red, modified in yellow. Download a difference report as PDF." },
    ],
    faqs: [
      { question: "What types of changes are detected?", answer: "Text additions, deletions, modifications, image changes, formatting differences, and page reordering are all detected and highlighted." },
      { question: "Can I compare specific pages only?", answer: "Yes. Enter a page range to limit comparison. Useful when comparing large documents where changes are in known sections." },
      { question: "Is this suitable for legal document review?", answer: "Yes. The visual diff report provides clear, color-coded change tracking suitable for legal document comparison and contract review." },
    ],
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: 'Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. No signup or account required.',
    seoDescription: 'Free online Favicon Generator — Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. ',
    dependencies: "Sharp / jimp",
    instructions: [
      { title: "1. Choose Your Input", desc: "Type text initials, upload an image, or select an emoji as your favicon source. Text and emoji options create clean, scalable icons instantly." },
      { title: "2. Customize the Design", desc: "Adjust colors, background, padding, and border radius to match your brand. Preview the favicon in real time at actual display size (16x16 to 64x64 pixels)." },
      { title: "3. Download Your Favicon", desc: "Download the favicon as .ico (for all browsers) and .png (for modern browsers and devices). The .ico file contains multiple resolutions for compatibility." },
    ],
    faqs: [
      { question: "What size favicon do I need?", answer: "The tool generates multiple sizes in the .ico file (16x16, 32x32, 48x48) plus a separate 64x64 PNG. Modern browsers use 32x32 while older systems may use 16x16. Having all sizes ensures compatibility." },
      { question: "What's the difference between .ico and .png?", answer: ".ico is the traditional favicon format supported by all browsers. PNG favicons offer better quality and smaller file sizes but may not work on very old browsers. Most modern sites serve both formats." },
      { question: "How do I install the favicon on my website?", answer: 'Place the .ico file in your site root (favicon.ico) — browsers find it automatically. For the PNG version, add <link rel="icon" type="image/png" href="/path/to/favicon.png"> to your HTML <head>.' },
    ]
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: 'Transform text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case, sentence case, and alternating case with a single click. All processing is local.',
    seoDescription: 'Free online Case Converter — Transform text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case, sentence case, and alternating case. Instant local text transformation.',
    dependencies: "Vanilla JS",
    instructions: [
    { title: "1. Enter Your Text", desc: "Type or paste the text you want to convert. The tool updates all case variants instantly as you type." },
    { title: "2. Choose a Case Style", desc: "Click any case format — uppercase (ALL CAPS), lowercase, title case, camelCase, snake_case, kebab-case, sentence case, or alternating (aLtErNaTiNg) case." },
    { title: "3. Copy the Result", desc: "Click any result to copy it to your clipboard. Use camelCase for JavaScript variables, snake_case for Python, kebab-case for URLs, and sentence case for regular writing." },
  ],
    faqs: [
    { question: "What are all the available case formats?", answer: "The converter supports: UPPERCASE, lowercase, Title Case, camelCase (first word lowercase), PascalCase (first word uppercase), snake_case (underscores), kebab-case (hyphens), CONSTANT_CASE (uppercase underscores), dot.case, sentence case (first letter capital), path/case (slashes), and alternating aLtErNaTiNg case." },
    { question: "When should I use camelCase vs snake_case?", answer: "camelCase is standard in JavaScript, TypeScript, and Java for variable and function names. snake_case is standard in Python, Ruby, and Rust. PascalCase is used for class names in most languages. kebab-case is standard for URL slugs and CSS class names." },
    { question: "Does title case capitalize every word?", answer: "Title case capitalizes the first letter of every word by default. For proper AP/Chicago style title case (which keeps articles, prepositions, and conjunctions lowercase), use the Smart Title Case option which follows standard headline capitalization rules." },
    { question: "Is my text stored or transmitted?", answer: "No. All case conversion happens locally in your browser. Your text never leaves your device — no server requests, no data storage, no tracking." },
  ]
      },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: 'Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. No signup or account required.',
    seoDescription: 'Free online Keyword Density Checker — Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. ',
    dependencies: "Vanilla JS"
  },
  {

    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: 'Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. No signup or account required.',
    seoDescription: 'Free online Base64 to Image — Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. ',
    dependencies: "Vanilla JS",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Paste Base64 Image String",
                "desc": "Paste the Base64-encoded image string, with or without the data URI prefix (data:image/png;base64,). Supports PNG, JPEG, GIF, WebP, and SVG formats."
          },
          {
                "title": "2. Preview the Image",
                "desc": "The tool renders the decoded image in a live preview panel showing the actual dimensions, file size, and MIME type detected from the data URI."
          },
          {
                "title": "3. Download as Image File",
                "desc": "Click the Download button to save the decoded image as its native format (.png, .jpg, .gif, .webp). Copy the data URI for direct use in HTML or CSS."
          }
    ],
    faqs: [
          {
                "question": "What image formats are supported for Base64-to-image conversion?",
                "answer": "The tool supports PNG, JPEG, GIF (including animated), WebP, SVG (vector), BMP, ICO, and AVIF. The format is auto-detected from the data URI mime type or by analyzing the decoded image header bytes."
          },
          {
                "question": "How does the tool handle invalid or corrupted Base64 image data?",
                "answer": "It validates the Base64 string format first, checks the magic bytes of the decoded binary for a valid image signature (PNG header, JPEG SOI, GIF89a), and shows a specific error message if the data is corrupted."
          },
          {
                "question": "Can the tool convert between image formats after decoding the Base64 string?",
                "answer": "Yes, after decoding, the tool can re-encode the image in a different format. For example, a Base64 PNG can be downloaded as JPEG (with configurable quality) or WebP (with lossless/lossy toggle)."
          }
    ]
},
  {

    id: "174",
    name: "MD5 & SHA Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes from text or file input using CryptoJS.',
    seoDescription: 'Free online MD5 & SHA Hash Generator — Compute MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes from text or file input. All processing happens in your browser, nothing is uploaded.',
    dependencies: "CryptoJS",
    instructions: [
          {
                "title": "1. Input Your Data",
                "desc": "Type or paste the string you want to hash into the input field. The tool supports plain text, with sizes up to 10 MB for file uploads."
          },
          {
                "title": "2. Enable HMAC (Optional)",
                "desc": "Toggle HMAC mode and provide a secret key to produce an HMAC-MD5 hash instead of a plain MD5. This prevents rainbow table attacks on the output."
          },
          {
                "title": "3. Compare Hash Output",
                "desc": "The 32-character hex digest appears instantly. Use the Compare feature to check if two strings produce the same MD5 hash, useful for verifying file integrity."
          }
    ],
    faqs: [
          {
                "question": "Why is MD5 considered cryptographically broken?",
                "answer": "MD5 is vulnerable to collision attacks — researchers have demonstrated that two different inputs can produce the same 128-bit hash. In 2008, researchers used MD5 collisions to forge SSL certificates. For security-sensitive hashing (passwords, signatures), use SHA-256 or bcrypt instead. MD5 remains acceptable for non-security checksums like file integrity verification."
          },
          {
                "question": "Can I hash files larger than 10 MB with this tool?",
                "answer": "The browser-based limit is 10 MB per file upload. For larger files, use a command-line tool like md5sum (Linux/macOS) or certutil (Windows). The tool processes files entirely in memory, so excessively large files may crash your browser tab."
          },
          {
                "question": "What does the uppercase/lowercase toggle do?",
                "answer": "MD5 hashes are case-insensitive in hex representation, but some systems expect uppercase digest format (e.g., Windows certutil outputs uppercase by default). The toggle lets you switch between 32-character lowercase (a-f) and uppercase (A-F) without recomputing the hash."
          }
    ]
},
  {

    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online HTML Minifier — Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. ',
    dependencies: "html-minifier",
    showInCategory: false,
    instructions: [
          {
                "title": "1. Step 1",
                "desc": "Paste full HTML documents or fragments that need to be compressed. The tool handles all HTML versions and can process embedded CSS and JavaScript within the same operation."
          },
          {
                "title": "2. Step 2",
                "desc": "Toggle minification options like comment removal, whitespace collapse, optional tag removal, and inline style or script minification for maximum size reduction."
          },
          {
                "title": "3. Step 3",
                "desc": "Generate the compressed HTML and review the size savings. Download the minified file or copy the compact output for use in production environments where bandwidth matters."
          }
    ],
    faqs: [
          {
                "question": "What HTML elements and attributes can be safely removed during the minification process?",
                "answer": "Optional closing tags for list items and paragraphs are removed per HTML5 spec. Boolean attributes like disabled and checked are collapsed. Default type attributes are stripped from script and style tags."
          },
          {
                "question": "How does the minifier handle Internet Explorer conditional comments in HTML documents?",
                "answer": "IE conditional comments are preserved by default to maintain compatibility. You can optionally strip them if you no longer need IE support, which reduces the file size further."
          },
          {
                "question": "Can the minifier process multiple HTML files in batch mode for a complete website build?",
                "answer": "Yes, upload a zip of HTML files for batch processing. Each file is minified individually and packaged as a downloadable zip archive with the same directory structure preserved."
          }
    ]
},
  {

    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: 'Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Barcode Generator — Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. ',
    dependencies: "JsBarcode",
    instructions: [
          {
                "title": "1. Enter Barcode Data",
                "desc": "Type the numeric or alphanumeric data you want to encode. Different barcode symbologies have different character set and length requirements."
          },
          {
                "title": "2. Select Symbology",
                "desc": "Choose from Code 128, Code 39, EAN-13, UPC-A, ISBN, ITF, and more. EAN-13 is standard for retail products, Code 128 for logistics."
          },
          {
                "title": "3. Generate and Export",
                "desc": "Click generate to render the barcode. Download as PNG at 300 DPI for print, or SVG for vector use. The human-readable text appears below the barcode."
          }
    ],
    faqs: [
          {
                "question": "What is the difference between EAN-13 and UPC-A barcodes?",
                "answer": "EAN-13 is a 13-digit international standard, while UPC-A is a 12-digit standard used primarily in the US and Canada. EAN-13 can encode UPC-A by adding a leading 0."
          },
          {
                "question": "Does the generator calculate check digits automatically?",
                "answer": "Yes, if you enter the data without the check digit, the tool calculates and appends it. If you include it, the tool verifies it and warns on mismatch."
          },
          {
                "question": "Can I print barcodes on labels directly from the tool?",
                "answer": "Yes, generate a sheet of multiple barcodes by entering multiple data rows. The tool arranges them in a printable grid with customizable label dimensions."
          }
    ]
},
  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: 'Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PGP Key Generator — Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. ',
    dependencies: "OpenPGP.js",
    instructions: [
      { title: "1. Select Key Type and Bit Length", desc: "Choose between RSA (2048 or 4096-bit) or ECDSA (Curve25519) key types. RSA 4096 offers maximum compatibility, while ECDSA Curve25519 provides modern security with smaller key sizes." },
      { title: "2. Configure User Identity and Expiry", desc: "Enter your name and email address for the key's user ID. Set an expiration date (optional) and optionally enable passphrase protection for the private key." },
      { title: "3. Generate and Download Your Key Pair", desc: "Click generate to create your PGP key pair. Download both the public key (to share) and private key (keep secret and backed up). Everything runs locally — nothing is uploaded." },
    ],
    faqs: [
      { question: "What's the difference between RSA and ECDSA?", answer: "RSA is the most widely supported PGP key type. 4096-bit RSA offers strong security. ECDSA Curve25519 provides equivalent security with smaller keys and faster generation. Choose RSA for maximum compatibility, ECDSA for modern performance." },
      { question: "Is my private key exposed to the server?", answer: "No. All key generation happens locally in your browser using OpenPGP.js. Your private key never leaves your device. The generated keys are downloaded directly to your computer." },
      { question: "Should I set a passphrase on my private key?", answer: "Yes, strongly recommended. A passphrase encrypts your private key so that even if someone obtains the key file, they cannot use it without the passphrase. Choose a strong, memorable passphrase." },
      { question: "Can I use these keys with popular email clients?", answer: "Yes. The generated keys follow the OpenPGP standard and work with Thunderbird (Enigmail), Outlook (GPGTools), Apple Mail (GPGMail), and command-line GPG. Export compatibility may require converting between formats." },
    ]
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: 'Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Add Page Numbers to PDF — Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF", desc: "Select a PDF document to add page numbers to." },
      { title: "2. Configure Numbering", desc: "Choose position (top/bottom, left/center/right), starting number, format (1, 2, 3 or i, ii, iii), and font size." },
      { title: "3. Apply Page Numbers", desc: "Page numbers are added to every page in the document. Download the numbered PDF." },
    ],
    faqs: [
      { question: "Can I skip the first page?", answer: "Yes. Select 'skip first page' to omit page numbers on cover pages or title pages." },
      { question: "Can I use Roman numerals for front matter?", answer: "Yes. Choose Roman numeral (i, ii, iii) format for the first section and switch to Arabic (1, 2, 3) from a specified page." },
      { question: "Does this affect existing headers or footers?", answer: "Page numbers are placed in the page margin area. Existing header/footer content may overlap if positioned similarly." },
    ],
  },
  {
    id: "167c",
    name: "Markdown Tools",
    slug: "markdown-tools",
    category: "Converter",
    description: 'Renders GitHub-Flavored Markdown to HTML, converts text/HTML to Markdown, or strips Markdown to plain text — all in one tool.',
    seoDescription: 'Free online Markdown Tools — Render GitHub-Flavored Markdown to HTML, convert text or HTML to Markdown, or strip Markdown formatting to plain text. ',
    dependencies: "marked.js, Turndown",
    instructions: [
      { title: "1. Enter Markdown", desc: "Paste Markdown content or upload a .md file." },
      { title: "2. Choose Output", desc: "Select HTML, PDF, or plain text as the target format." },
      { title: "3. Export", desc: "Copy the output or download as a file." },
    ],
    faqs: [
      { question: "What Markdown features are supported?", answer: "Headings, bold, italic, links, images, code blocks, tables, lists, blockquotes, and horizontal rules." },
      { question: "Can I convert Markdown to PDF?", answer: "Yes. Select PDF as the output format. The PDF preserves Markdown formatting with a clean layout." },
      { question: "Is the HTML output sanitized?", answer: "Yes. Generated HTML is sanitized to prevent XSS. Raw HTML in Markdown is stripped by default." },
    ],
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: 'Applies five distinct text transformations: reverse entire string order, reverse each word individually, flip upside down using rot180 Unicode, mirror horizontally, and rotate 180 degrees. Perfect for creating puzzles, secret messages, palindromes, and attention-grabbing social media content.',
    seoDescription: 'Free online Reverse Text Generator — reverse text order, reverse words one by one, flip upside down, mirror horizontally, or rotate 180 degrees. Perfect for puzzles, secret messages, and unique social content. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the text you want to transform. Each transformation previews instantly — no waiting or processing time." },
      { title: "2. Pick a Transformation", desc: "Choose from reverse entire order, reverse each word, flip upside down (using Unicode rot180 characters), mirror left-to-right, or full 180-degree rotation." },
      { title: "3. Copy & Share", desc: "Click any result to copy. Use reversed text for puzzles and riddles, flipped text for attention-grabbing social posts, or mirrored text for creative designs." },
    ],
    faqs: [
      { question: "What's the use of reverse text?", answer: "Reverse text is popular for puzzles (write a message backwards and challenge friends to read it), secret codes (reversed words are hard to skim), social media content that stops the scroll, and creative writing exercises that play with language structure." },
      { question: "How does the upside-down flip work?", answer: "The upside-down flip uses Unicode rot180 characters that rotate each letter 180 degrees (like ʇxǝʇ). This is different from CSS rotation — it uses dedicated Unicode characters so it works anywhere Unicode is supported, not just on web pages." },
      { question: "Can I use this for puzzle design?", answer: "Yes. Reverse Text Generator is ideal for puzzle makers. Write clues in reverse, create mirror messages, or use the upside-down effect for treasure hunts, escape rooms, brain teasers, and social media engagement challenges." },
      { question: "Is mirrored text readable?", answer: "Mirrored text reverses left-to-right — it's readable when held up to a mirror. It's popular for creative social media posts (car window reflections, glass surfaces) and design elements that need a reflection effect." },
    ]
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: 'Create corrupted Zalgo text by adding combining diacritical marks (accents, umlauts, dots) above, below, and through normal letters. Adjustable intensity for subtle or extreme corruption effects.',
    seoDescription: 'Free online Zalgo Text Generator — Create corrupted text with combining diacritical marks above, below, and through letters. Adjustable intensity for subtle to extreme glitch effects. Copy for usernames and bios.',
    dependencies: "Vanilla JS",
    instructions: [
    { title: "1. Enter Your Text", desc: "Type or paste the text you want to corrupt with Zalgo combining marks. Shorter text works best for maximum visual effect." },
    { title: "2. Adjust Zalgo Intensity", desc: "Use the intensity slider to control how many combining marks are added — low for subtle accents, high for extreme corruptions where the base text is barely visible beneath the marks." },
    { title: "3. Copy the Zalgo Text", desc: "Click to copy the corrupted text. Use for distorted usernames, creepy-themed bios, horror content, or creative design elements that need a corrupted aesthetic." },
  ],
    faqs: [
    { question: "What is Zalgo text?", answer: "Zalgo text uses Unicode combining diacritical marks — special characters that attach to the preceding letter. By stacking many combining marks (accents, umlauts, cedillas, dots, lines, circles) above, below, and through each letter, normal text becomes visually corrupted and distorted." },
    { question: "Can I control where the marks appear?", answer: "Yes. Choose which combining marks are added: above-only (accents and diacritics above letters), below-only (marks below), both sides, or through (strikethrough-style marks). Each position creates a different glitch effect." },
    { question: "Will Zalgo text render everywhere?", answer: "Zalgo text renders differently depending on the platform's Unicode rendering engine. Most modern platforms display the combining marks stacked above/below letters, but some platforms clamp the number of marks per character or display them incorrectly." },
    { question: "Can I undo Zalgo corruption?", answer: "Zalgo corruption is reversible only if you know the original text. The combining marks are added to the existing characters — removing the diacritical marks reveals the original letters underneath, but the process is not automated in this tool." },
  ],
    showInCategory: false,
  },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: 'Generate blank Unicode text using zero-width spaces, hair spaces, and invisible separators that render as empty content. Copy for social media bios, messaging apps, and formatting hacks.',
    seoDescription: 'Free online Invisible Text Generator — Generate blank Unicode text using zero-width spaces, hair spaces, and invisible separators. Create empty bios, messages, and formatting hacks. Instant local generation.',
    dependencies: "Vanilla JS",
    instructions: [
    { title: "1. Choose Invisible Method", desc: "Pick from zero-width space (best for invisible text), hair space (very thin visible gap), or invisible separator characters depending on your use case." },
    { title: "2. Set Length and Generate", desc: "Set how many invisible characters to generate. A single character may not be registered as content — use 3-10 for most platforms." },
    { title: "3. Copy and Paste", desc: "Copy the invisible content to your clipboard. Paste into social media bios, messaging apps, or anywhere you need empty text that is not blank." },
  ],
    faqs: [
    { question: "What is invisible text used for?", answer: "Invisible text is commonly used to create empty social media bios (Instagram, Twitter, Telegram) where a completely blank bio is not allowed, to add spacing in messaging apps, and to test how platforms handle zero-width and whitespace characters." },
    { question: "Do all platforms support invisible characters?", answer: "Most modern platforms support invisible Unicode characters but may strip them during text processing. Test your invisible text on the target platform before relying on it — some platforms trim ZWSP and other zero-width characters from user input." },
    { question: "Is this the same as blank space?", answer: "Visible blank space is typically created by regular space characters (U+0020) or tab characters. Invisible text uses zero-width characters that take up NO visible space — the text cursor moves but no character appears. This creates truly invisible content rather than blank space." },
    { question: "How many characters should I generate?", answer: "For social media bios, generate 3-10 invisible characters. A single ZWSP is often rejected as 'empty' by platforms. For testing, 1-2 characters are enough to verify whether a platform supports zero-width characters." },
  ]
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Finance",
    description: 'Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months. SaaS founders and e-commerce operators use LTV to determine acquisition budgets, segment high-value customers, and forecast recurring revenue.',
    seoDescription: 'Free online LTV Calculator — project customer lifetime value from order value, purchase frequency, margin, and lifespan. SaaS and e-commerce essential for acquisition budgeting and revenue forecasting. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Purchase Behavior", desc: "Input average order value (AOV), purchase frequency per month, and gross margin percentage." },
      { title: "2. Enter Customer Lifespan", desc: "Input the average customer lifespan in months — how long customers typically stay active." },
      { title: "3. Review LTV Metrics", desc: "The calculator shows LTV per customer, LTV-to-CAC ratio (when paired with your CAC), and revenue projection. Use these to optimize your acquisition spend." },
    ],
    faqs: [
      { question: "How is this different from the CAC Calculator?", answer: "LTV Calculator projects the total revenue a customer generates over their lifetime. CAC Calculator totals the cost to acquire a new customer. Together (LTV:CAC ratio) they tell you whether your acquisition spending is efficient — a 3:1 ratio is typically healthy." },
      { question: "What's a good LTV:CAC ratio?", answer: "A ratio of 3:1 is considered healthy — you earn 3x what you spent to acquire the customer. Below 1:1 means you're losing money on each customer. Above 5:1 suggests you may be under-investing in growth." },
      { question: "Can I use this for subscription businesses?", answer: "Yes. For subscriptions, use monthly subscription fee as average order value, set frequency to 1 (monthly), and enter your typical churn-based lifespan. SaaS businesses rely heavily on LTV analysis." },
      { question: "Does LTV include upsells and referrals?", answer: "This calculator uses base values. For more accurate LTV, factor in expansion revenue (upsells, cross-sells) by increasing the average order value, and referral revenue by adjusting purchase frequency upward." },
    ]
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Finance",
    description: 'Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startups and growth teams use CAC to evaluate marketing channel efficiency, optimize ad spend, and benchmark against LTV.',
    seoDescription: 'Free online CAC Calculator — divide total sales and marketing spend by new customers acquired to find your customer acquisition cost. Essential for startup growth, ad spend optimization, and LTV benchmarking. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Marketing Spend", desc: "Input your total sales and marketing costs for the period — ad spend, salaries, tools, agency fees, and overhead." },
      { title: "2. Enter New Customers", desc: "Input the number of new customers acquired during the same period." },
      { title: "3. Review Your CAC", desc: "The calculator shows your blended cost per acquisition. Compare this against your LTV to determine if your acquisition strategy is profitable." },
    ],
    faqs: [
      { question: "How is this different from the LTV Calculator?", answer: "CAC Calculator tells you what it costs to acquire each new customer — critical for budget allocation. LTV Calculator projects how much revenue each customer generates over their lifetime. The LTV:CAC ratio (target 3:1) tells you whether your acquisition spend is efficient." },
      { question: "What's a good CAC?", answer: "A good CAC depends on your industry and business model. SaaS companies typically target CAC under $200 for self-serve and up to $2,000+ for enterprise sales. E-commerce CAC varies from $10-$100+ per customer. The key metric is LTV:CAC ratio, not the raw number." },
      { question: "Should I include all marketing costs?", answer: "Include all direct and indirect costs: ad spend, content creation, salaries of marketing and sales team, software tools, agency fees, and allocated overhead. A fully-loaded CAC gives you an accurate picture of acquisition efficiency." },
      { question: "Can I calculate CAC by channel?", answer: "This calculator provides blended CAC across all channels. For channel-specific analysis, run the tool separately for each channel's spend and customer count to compare which channels are most efficient." },
    ]
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Finance",
    description: 'Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Burn Rate Calculator — Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Monthly Expenses", desc: "Input your company's total monthly operating expenses." },
    { title: "2. Enter Cash Balance", desc: "Enter your current cash balance or available funding." },
    { title: "3. View Runway", desc: "See your monthly burn rate and how many months of runway remain." },
  ],
    faqs: [
    { question: "What is burn rate?", answer: "Burn rate is the rate at which a company spends its cash reserves, typically measured monthly." },
    { question: "What is gross vs net burn rate?", answer: "Gross burn is total monthly expenses. Net burn is expenses minus revenue. Net burn is more meaningful for runway calculation." },
    { question: "How much runway should a startup have?", answer: "Most investors recommend 12-18 months of runway. Less than 6 months is considered risky." },
  ],
},
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Branding",
    description: 'Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Net Promoter Score Calculator — Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Responses", desc: "Input NPS survey responses (0-10). Categorized into promoters (9-10), passives (7-8), detractors (0-6)." },
      { title: "2. Calculate NPS", desc: "NPS = % promoters - % detractors. Score ranges from -100 to +100." },
      { title: "3. Track Over Time", desc: "Record NPS to track changes. Use as benchmark for customer satisfaction." }
    ],
    faqs: [
      { question: 'What is NPS?', answer: 'Net Promoter Score measures customer loyalty based on likelihood to recommend. Scores grouped into detractors, passives, and promoters.' },
      { question: 'What is a good NPS?', answer: 'Above 0 good, above 20 favorable, above 50 excellent, above 80 world-class.' },
      { question: 'How many responses needed?', answer: 'Aim for 100+ responses for reliable results. Smaller samples indicate trends.' }
    ]
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: 'Converts XML files to CSV format — enterprise systems, SOAP APIs, document formats like DOCX and SVG to spreadsheets, database exports, and data imports. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online XML to CSV — Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths. ',
    dependencies: "xml2js / PapaParse",
    showInCategory: false,
    instructions: [
      { title: "1. Upload or Paste XML", desc: "Paste XML data into the editor or upload an .xml file containing structured records. The tool maps XML elements and attributes to flat CSV columns based on your configuration." },
      { title: "2. Select Elements", desc: "Choose which XML elements become rows and which nested elements become columns." },
      { title: "3. Download CSV", desc: "Review the flattened table and export as CSV." },
    ],
    faqs: [
      { question: "How are nested XML elements flattened?", answer: "Child elements become additional columns with dot-separated names (e.g., 'author.name')." },
      { question: "What about XML attributes?", answer: "Attributes are prefixed with '@' by default (e.g., '@id'). You can change the prefix in settings." },
      { question: "Can I handle repeating child elements?", answer: "Yes. Repeating child elements are expanded into separate rows with parent data duplicated." },
    ],
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: 'Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Metadata Editor — Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF", desc: "Select a PDF file to view and edit its metadata." },
      { title: "2. Edit Metadata Fields", desc: "Modify title, author, subject, keywords, and producer fields. Custom XMP metadata can also be added." },
      { title: "3. Save Updated PDF", desc: "Download the PDF with the corrected metadata. The document content remains unchanged." },
    ],
    faqs: [
      { question: "What metadata fields does a PDF contain?", answer: "Core fields: Title, Author, Subject, Keywords (PDF info dictionary). Extended fields in XMP: creation date, modification date, producer, creator tool." },
      { question: "Can I remove all metadata?", answer: "Yes. Use the 'clear metadata' option to strip all identifying information from the PDF before distribution." },
      { question: "Does editing metadata change the document hash?", answer: "Yes. Modifying metadata alters the PDF binary, so any cryptographic hash of the file changes." },
    ],
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: 'SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SVG Editor — SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. ',
    dependencies: "SVGO / Fabric.js",
    instructions: [
      { title: "1. Upload or Create an SVG", desc: "Open an existing SVG file or start from scratch on the blank canvas. The editor supports drag-and-drop for SVG files and raw SVG code input." },
      { title: "2. Edit Elements Visually", desc: "Select any element on the canvas to see transform handles. Move, resize, rotate, and edit attributes directly. Use the property panel to adjust fill, stroke, opacity, and more." },
      { title: "3. Export Your SVG", desc: "Download the edited SVG file or copy the optimized SVG code. The tool can also minify your SVG and clean up unnecessary metadata for production use." },
    ],
    faqs: [
      { question: "What SVG features are supported?", answer: "The editor supports shapes (rect, circle, path, text), groups, transforms, gradients, and basic path editing. Complex features like filters, animations, and scripts are preserved but not editable in the visual interface." },
      { question: "Can I edit SVG code directly?", answer: "Yes. You can switch between visual and code views. Changes in the code editor are reflected on the canvas in real time, giving you both visual and programmatic control." },
      { question: "Is my SVG uploaded to a server?", answer: "No. Everything runs locally in your browser. Your SVG file is never sent to any server — all editing, rendering, and export happens on your device." },
      { question: "What export formats are available?", answer: "You can export as SVG (optimized with SVGO), PNG (rasterized at any resolution), or copy the raw SVG code to clipboard. The optimized SVG removes unused attributes and metadata." },
    ]
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: 'Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Robots.txt Generator — Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Finance",
    description: 'Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SaaS Pricing Calculator — Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Pricing Tiers", desc: "Define your SaaS pricing tiers with monthly and annual prices." },
    { title: "2. Enter Assumptions", desc: "Input expected conversion rates, churn, and customer counts per tier." },
    { title: "3. Project Revenue", desc: "View projected monthly and annual recurring revenue based on your model." },
  ],
    faqs: [
    { question: "What inputs do I need?", answer: "Define your pricing tiers, expected customer counts per tier, conversion rates, and churn assumptions." },
    { question: "How does annual vs monthly pricing affect revenue?", answer: "Annual billing typically offers a discount but provides upfront cash and reduces churn. The calculator compares both models." },
    { question: "Can I model different scenarios?", answer: "Yes. Adjust assumptions to model best-case, expected, and worst-case revenue scenarios." },
  ],
},
  {
    id: "220",
    name: "SaaS Metrics Dashboard",
    slug: "saas-metrics-dashboard",
    category: "Finance",
    isPro: false,
    description: 'All-in-one SaaS metrics dashboard with ARR, MRR, LTV, CAC, NPS, churn, runway, and A/B test analysis — plus scenario modeling and PDF export. Your data stays in your browser — nothing is uploaded.',
    seoDescription: 'Free online SaaS Metrics Dashboard — All-in-one SaaS metrics dashboard with ARR, MRR, LTV, CAC, NPS, churn, runway, and A/B test analysis. ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Key Metrics", desc: "Input MRR, churn rate, CAC, LTV, and customer counts." },
    { title: "2. Auto-Calculate", desc: "The dashboard computes key SaaS metrics: ARR, NRR, quick ratio, and more." },
    { title: "3. Review Dashboard", desc: "View all SaaS metrics in one place for a comprehensive health check." },
  ],
    faqs: [
    { question: "What metrics does this dashboard show?", answer: "MRR, ARR, NRR, churn rate, LTV, CAC, quick ratio, gross margin, and customer count trends." },
    { question: "How often should I update these metrics?", answer: "Review key SaaS metrics monthly. MRR and churn should be tracked weekly for early warning signals." },
    { question: "Can I export the dashboard?", answer: "The dashboard is designed for on-screen review. Copy the data for use in spreadsheets or presentations." },
  ],
},
  {
    id: "222",
    name: "PDF Workflow Builder",
    slug: "pdf-workflow-builder",
    category: "PDF",
    isPro: false,
    description: 'Full-featured PDF editor that runs entirely in your browser — merge, split, fill forms, rotate pages, add/remove passwords, and edit metadata. Your files never leave your device — 100% private.',
    seoDescription: 'Free online PDF Workflow Builder — merge, split, fill forms, rotate pages, add passwords, and edit metadata. All processing happens in your browser — no upload needed.',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Add PDF Files", desc: "Upload one or more PDF source files to the workflow." },
      { title: "2. Build Processing Steps", desc: "Create a sequence: merge, split, rotate, watermark, compress, protect. Drag steps to reorder the workflow." },
      { title: "3. Execute Workflow", desc: "Run the entire processing pipeline in sequence. Download the final output or review each step's result." },
    ],
    faqs: [
      { question: "What steps can I chain?", answer: "Merge, split, rotate, crop, compress, watermark, protect (password), flatten, grayscale, add headers/footers, and add page numbers." },
      { question: "Can I save workflows for reuse?", answer: "Yes. Save your workflow as a JSON template and reload it later for processing similar document batches." },
      { question: "Does the workflow process files sequentially?", answer: "Yes. Each step processes the output of the previous step. Order matters — compress before protect, for example." },
    ],
  },
  {

    id: "221",
    name: "API Builder & Tester",
    slug: "api-builder",
    category: "Developer",
    isPro: false,
    description: 'Full-featured API client that runs in your browser — make HTTP requests, edit headers/body/params, save collections, generate code snippets (cURL/Fetch/Axios). Your API keys never touch a server — everything runs locally.',
    seoDescription: 'Free online API Builder & Tester — Full-featured API client that runs in your browser. Make HTTP requests, save collections, generate code snippets. Privacy-first — your API keys never touch a server.',
    dependencies: "Browser Fetch API",
    instructions: [
          {
                "title": "1. Set Request Method and URL",
                "desc": "Choose the HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS). Enter the full URL including query parameters."
          },
          {
                "title": "2. Configure Headers and Body",
                "desc": "Add headers as key-value pairs. For POST/PUT, select body format (JSON, form-data, x-www-form-urlencoded, raw text, binary)."
          },
          {
                "title": "3. Send and Inspect Response",
                "desc": "Click Send to execute the request. View the response status code, headers, body, and timing information."
          }
    ],
    faqs: [
          {
                "question": "How does the API builder handle authentication (Bearer, Basic, API Key)?",
                "answer": "The tool has an Auth tab where you select Bearer Token, Basic Auth, or API Key. The credentials are automatically added to the request headers."
          },
          {
                "question": "Can I save requests for later reuse?",
                "answer": "Yes, save requests as named presets in browser localStorage. Organize into collections with folders. Export/import collections as JSON."
          },
          {
                "question": "Does the tool support GraphQL queries in the request body?",
                "answer": "Yes, select GraphQL as the body type. The tool provides separate fields for the query string and variables, and auto-sets Content-Type: application/json."
          }
    ]
},
  {
    id: "196",
    name: "Employee Turnover Calculator",
    slug: "employee-turnover-calculator",
    category: "Finance",
    description: "Calculate employee turnover rate Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Employee Turnover Calculator — Calculate employee turnover rate ',
    dependencies: "Vanilla JS"
  ,
    instructions: [
    { title: "1. Enter Employee Data", desc: "Input total employees at start and end of period, plus departures." },
    { title: "2. Calculate Turnover", desc: "The tool computes turnover rate and retention rate." },
    { title: "3. Analyze Trends", desc: "Review turnover trends to identify retention improvement areas." },
  ],
    faqs: [
    { question: "What is employee turnover rate?", answer: "Turnover rate is the percentage of employees who leave during a period, calculated as departures divided by average headcount." },
    { question: "What is a healthy turnover rate?", answer: "Average turnover is 10-15% annually. Under 5% is excellent. Over 20% may indicate retention issues." },
    { question: "How is retention rate different?", answer: "Retention rate = 100% - turnover rate. It measures the percentage of employees who stay." },
  ],
},
  {
    id: "197",
    name: "MAC Address Generator",
    slug: "mac-address-generator",
    category: "Privacy",
    description: 'Generates random MAC addresses in six common formats with optional OUI prefix. Supports Unix, Windows, Cisco, and dot-separated styles.',
    seoDescription: 'Free online MAC Address Generator — Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Choose Output Format", desc: "Select your preferred MAC address format — colon-separated (AA:BB:CC:DD:EE:FF), hyphen-separated (AA-BB-CC-DD-EE-FF), Cisco style (AABB.CCDD.EEFF), or dot-separated format." },
      { title: "2. Set OUI Prefix (Optional)", desc: "Optionally enter an OUI (Organizationally Unique Identifier) prefix to generate MAC addresses from a specific vendor. Leave blank for completely random addresses." },
      { title: "3. Generate Multiple Addresses", desc: "Choose how many addresses to generate (1-50 at a time). Click generate and copy the results or download them as a text file for use in network configuration or testing." },
    ],
    faqs: [
      { question: "What is a MAC address used for?", answer: "MAC addresses are unique hardware identifiers assigned to network interfaces. They're used in network configuration, device identification, access control lists, MAC filtering, and testing network software." },
      { question: "What is an OUI prefix?", answer: "An OUI (Organizationally Unique Identifier) is the first 24 bits (6 hex characters) of a MAC address that identifies the hardware manufacturer. Using a specific OUI generates addresses that appear to belong to a particular vendor." },
      { question: "Are these addresses usable on real networks?", answer: "These addresses are randomly generated and should only be used for testing, development, or configuration examples. Do not assign random MAC addresses to real network devices as this may cause network conflicts." },
      { question: "What formats are supported?", answer: "Six formats are supported: Unix (colons), Windows (hyphens), Cisco (dot-separated in groups of 4), dot-separated (groups of 2), space-separated, and no-separator (continuous hex string)." },
    ]
  },
  {
    id: "198",
    name: "IP Anonymizer",
    slug: "ip-anonymizer",
    category: "Privacy",
    description: "Anonymize IP addresses in logs. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online IP Anonymizer — Anonymize IP addresses in server logs and datasets. Preserves network prefix while removing the host portion for privacy compliance. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Paste Your IP Addresses", desc: "Enter or paste IP addresses (IPv4 or IPv6), one per line. The tool accepts raw IPs or log lines containing IP addresses — it extracts and anonymizes each one." },
      { title: "2. Choose Anonymization Method", desc: "Select how much of the IP to preserve — full network prefix (/24 for IPv4), partial masking (replace last octet with XXX), or full zeroing of the host portion." },
      { title: "3. Process and Export", desc: "Click anonymize to process all entries. Review the anonymized output, copy to clipboard, or download as a text file for use in log analysis or data sharing." },
    ],
    faqs: [
      { question: "What does IP anonymization mean?", answer: "IP anonymization removes or masks the host portion of an IP address while preserving the network prefix. For example, 192.168.1.42 becomes 192.168.1.0. This makes individual devices unidentifiable while retaining geographic and network information." },
      { question: "Why anonymize IP addresses?", answer: "IP addresses are considered personally identifiable information (PII) under GDPR, CCPA, and other privacy regulations. Anonymizing IPs before sharing logs, analytics, or datasets helps comply with privacy requirements." },
      { question: "Can I reverse the anonymization?", answer: "No. IP anonymization is a one-way process. The removed host portion is discarded and cannot be recovered. This is intentional — it ensures the anonymized data cannot be deanonymized later." },
      { question: "Does it work with log files?", answer: "Yes. The tool can process structured log files (Apache, Nginx, syslog, etc.) with embedded IP addresses. It identifies and anonymizes IPs within lines of text while preserving the surrounding log content." },
      { question: "What's the difference between IPv4 and IPv6 handling?", answer: "For IPv4, the tool typically preserves the first 24 bits (/24 notation, first 3 octets). For IPv6, it preserves the first 64 bits (/64, the network prefix) and zeros out the interface identifier." },
    ]
  },
  {
    id: "199",
    name: "XML to JSON",
    slug: "xml-to-json",
    category: "Converter",
    description: 'Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content.',
    seoDescription: 'Free online XML to JSON — Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key. ',
    dependencies: "xml2js",
    showInCategory: false,
    instructions: [
      { title: "1. Enter XML", desc: "Paste XML content or upload an .xml file." },
      { title: "2. Tune Conversion", desc: "Choose whether to preserve attributes, handle namespaces, and format arrays." },
      { title: "3. Get JSON", desc: "View the JSON output with proper indentation. Copy or download." },
    ],
    faqs: [
      { question: "How are XML attributes handled?", answer: "Attributes are prefixed with '@' by default. Toggle this behavior in the advanced options." },
      { question: "What about namespaces?", answer: "XML namespaces can be preserved or stripped. Preserved namespaces become part of the JSON key." },
      { question: "Are text nodes preserved?", answer: "Yes. Elements with both text and child elements have a '#text' key for the text content." },
    ],
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: 'Bidirectional translator between standard English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille. Each Braille character is displayed as a visual dot pattern with proper Unicode Braille characters.',
    seoDescription: 'Free online Braille Translator — Bidirectional translation between English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille. Visual dot patterns shown for each character.',
    dependencies: "Vanilla JS",
    instructions: [
    { title: "1. Choose Translation Direction", desc: "Select text-to-Braille or Braille-to-text mode. For text-to-Braille, type English text. For Braille-to-text, paste or type Braille characters (Unicode)." },
    { title: "2. Select Braille Grade", desc: "Choose Grade 1 (uncontracted — one character per letter) for word-by-word translation, or Grade 2 (contracted — uses abbreviations and shorthand) for natural Braille used by experienced readers." },
    { title: "3. Read and Copy", desc: "View the translated output with visual dot patterns. The Braille output shows both the Unicode characters and the dot positions. Copy for printing or digital use." },
  ],
    faqs: [
    { question: "What is the difference between Grade 1 and Grade 2 Braille?", answer: "Grade 1 Braille (uncontracted) spells out every letter and word individually — easier for beginners but slower to read. Grade 2 Braille (contracted) uses shorthand contractions, abbreviations, and special signs to reduce space and increase reading speed — this is the standard used in most published Braille materials." },
    { question: "Can I translate Braille back to English?", answer: "Yes. The tool works bidirectionally — paste Braille Unicode characters to get the English text translation. Grade 1 Braille translates exactly character-by-character. Grade 2 Braille translation uses standard Braille contraction rules." },
    { question: "How are Braille dots represented?", answer: "Each Braille character is a 2x3 dot grid (6 dots total). Dots are numbered 1-3 (top to bottom, left column) and 4-6 (top to bottom, right column). The visual display shows which dots are raised for each character." },
    { question: "What Braille standards does this follow?", answer: "The translator follows Unified English Braille (UEB) standards for Grade 1 and Grade 2 Braille, which is the current standard used in English-speaking countries including the US, UK, Canada, Australia, and New Zealand." },
  ]
  },
  {
    id: "201",
    name: "Passport Photo Maker (India)",
    slug: "passport-photo-india",
    category: "indian-utilities",
    description: 'Create a compliant 3.5x4.5 cm Indian passport photo from any uploaded image. Auto-crops with proper face positioning and background standards for passport, visa, and OCI card applications.',
    seoDescription: 'Free online Indian Passport Photo Maker — Create compliant 3.5x4.5 cm passport photos with auto face detection and proper background. Crop, resize, and download instantly in your browser.',
    dependencies: "Canvas API / react-cropper",
    instructions: [
    { title: "1. Upload Your Photo", desc: "Select a front-facing, well-lit photo from your device. The tool accepts JPEG and PNG files and works with any background color — the auto-detection finds your face region regardless." },
    { title: "2. Auto-Crop to Passport Size", desc: "The tool automatically detects your face using image analysis and crops the photo to the precise 3.5x4.5 cm Indian passport standard. Adjust the crop box if needed." },
    { title: "3. Download the Result", desc: "Preview the final passport-size photo with proper dimensions. Download it as a high-quality JPEG ready for printing or online submission. No data leaves your browser." },
  ],
    faqs: [
    { question: "What are the exact dimensions for an Indian passport photo?", answer: "The standard Indian passport photo size is 3.5 cm wide by 4.5 cm tall (35 mm x 45 mm). The face should occupy approximately 70-80% of the frame with the top of the head to chin centered." },
    { question: "Can I use this photo for visa or OCI applications?", answer: "Yes. The 3.5x4.5 cm size is the standard for Indian passports, OCI cards, and most visa applications. However, always check the specific photo guidelines for the particular visa or application type." },
    { question: "What background color should I use?", answer: "Indian passport photos require a plain white or off-white background. The tool preserves your original background — ensure it's a solid light color before uploading for best results." },
    { question: "Does this work on mobile?", answer: "Yes. Upload directly from your phone's camera roll. The tool runs entirely in your browser and works on any device with a modern web browser." },
    { question: "Is my photo stored or uploaded anywhere?", answer: "No. All processing happens locally in your browser. Your photo file never leaves your device, ensuring complete privacy for your identification documents." },
  ]
  },
  {
    id: "202",
    name: "Aadhaar Wallet Cropper",
    slug: "aadhaar-wallet-cropper",
    category: "indian-utilities",
    description: 'Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size with automatic face detection using OpenCV Haar cascades. All processing is local and private.',
    seoDescription: 'Free online Aadhaar Wallet Cropper — Crop Aadhaar card photos to standard 3.5x3.5 cm wallet size with auto face detection using OpenCV Haar cascades. 100% private, no uploads.',
    dependencies: "Canvas API",
    instructions: [
    { title: "1. Upload Your Aadhaar Photo", desc: "Select the Aadhaar card image or the face photo you want to crop. The tool accepts common image formats and processes everything locally in your browser." },
    { title: "2. Auto-Detect and Crop", desc: "The tool uses OpenCV Haar cascade classifiers to automatically detect the face region. It then crops the image to the standard 3.5 x 3.5 cm wallet-photo dimensions while keeping the face centered." },
    { title: "3. Download the Wallet Photo", desc: "Preview the cropped result and download the final image. The output is ready for printing at standard photo sizes or for use in forms requiring a 3.5x3.5 cm photo." },
  ],
    faqs: [
    { question: "What is the standard wallet photo size in India?", answer: "The standard wallet photo size for Indian identification documents and forms is 3.5 x 3.5 cm (35 mm x 35 mm). This size is commonly required for Aadhaar-related applications and other government forms." },
    { question: "How does the face detection work?", answer: "The tool uses a pre-trained OpenCV Haar cascade classifier — the same computer vision technology used in digital cameras and photo editing software. It detects facial features like eyes, nose, and mouth to locate and center the face in the crop." },
    { question: "What if the face detection doesn't work on my image?", answer: "Face detection works best on clear, front-facing photos with good lighting. If detection fails, ensure the image is well-lit and the face is clearly visible. You can manually adjust the crop area if needed." },
    { question: "Is my Aadhaar image kept private?", answer: "Absolutely. All image processing runs locally in your browser using client-side JavaScript and WebAssembly. Your Aadhaar image is never uploaded to any server." },
  ]
  },
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: 'Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. No signup or account required.',
    seoDescription: 'Free online Live Transcription — Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. ',
    dependencies: "Web Speech API",
    instructions: [
      { title: "1. Allow Microphone Access", desc: "Click the start button and grant browser permission to access your microphone. The tool uses the Web Speech API for real-time speech recognition directly in your browser." },
      { title: "2. Speak Naturally", desc: "Begin speaking — your words appear on screen in real time as continuous streaming text. No need to pause between sentences; the tool handles natural speech patterns." },
      { title: "3. Copy or Save Your Transcript", desc: "When finished, click stop. Review the transcribed text, make any corrections directly in the output area, then copy to clipboard or download as a text file." },
    ],
    faqs: [
      { question: "What browsers support live transcription?", answer: "The Web Speech API is supported in Chrome, Edge, and Safari. Firefox has limited support. Chrome on desktop and Android provides the most reliable real-time transcription experience." },
      { question: "Is my speech sent to a server?", answer: "Speech processing depends on your browser. Chrome sends audio to Google's servers for processing. Edge uses Microsoft's servers. Safari processes on-device where possible. Check your browser's privacy policy for details." },
      { question: "Can I use this for meetings or lectures?", answer: "Yes. Live Transcription works well for meetings, lectures, interviews, and any scenario where you need real-time captions. Position your microphone close to the speakers for best accuracy." },
      { question: "How accurate is real-time transcription?", answer: "Accuracy depends on microphone quality, background noise, and speaker clarity. In quiet environments with a good microphone, accuracy is typically 85-95%. Clear articulation and minimal background noise produce the best results." },
      { question: "Does it support multiple languages?", answer: "Yes. You can select from supported languages before starting. The Web Speech API supports dozens of languages and dialects including English, Spanish, French, German, Hindi, Japanese, and many more." },
    ]
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: 'Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. No signup or account required.',
    seoDescription: 'Free online Image Bulk Converter — Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. ',
    dependencies: "browser-image-compression / jszip",
    isPro: true,
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple images (JPEG, PNG, WebP, AVIF, GIF, TIFF) from your device. You can upload dozens at once."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select the target format for all images. Every uploaded image will be converted to this format in one batch."
      },
      {
            "title": "3. Download All as ZIP",
            "desc": "All converted images are packaged into a single ZIP archive. Click download to save everything at once."
      }

    ],
    faqs: [

      {
            "question": "What image formats does the bulk converter support?",
            "answer": "The bulk image converter handles JPEG, PNG, WebP, AVIF, GIF, and TIFF formats. You can convert any input format to any output format in a single batch."
      },
      {
            "question": "What's the maximum number of images I can convert at once?",
            "answer": "Free users can convert up to 10 images per batch. Pro users can convert unlimited images. All processing happens in your browser — there are no server-side upload limits."
      },
      {
            "question": "Do I need to download images one by one?",
            "answer": "No. All converted images are automatically packaged into a single ZIP file for one-click download. Each image retains its original filename with the new extension."
      },
      {
            "question": "Is bulk image conversion private?",
            "answer": "Yes. All images are processed entirely in your browser using Canvas API. Your images never leave your device, making it safe for sensitive content."
      }

    ],},
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: 'Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. No signup or account required.',
    seoDescription: 'Free online eSign PDF — Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. ',
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: 'Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF OCR (Scanned Docs) — Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. ',
    dependencies: "tesseract.js",
    instructions: [
      { title: "1. Upload Scanned PDF", desc: "Select a scanned PDF or image-based PDF. OCR (Optical Character Recognition) converts images of text into searchable content." },
      { title: "2. Select Language", desc: "Choose the document language for accurate character recognition. Supports 30+ languages including English, Spanish, French, German, Chinese, and Arabic." },
      { title: "3. Process & Download", desc: "The OCR engine analyzes each page and creates a searchable PDF with a hidden text layer over the original image." },
    ],
    faqs: [
      { question: "How accurate is the OCR?", answer: "Clean scans at 300 DPI with clear fonts achieve 98%+ accuracy. Handwriting, decorative fonts, or low-resolution scans (below 200 DPI) significantly reduce accuracy." },
      { question: "Does the original image quality change?", answer: "No. The original scanned image is preserved. The recognized text is added as an invisible layer underneath for search and selection." },
      { question: "Can I export the recognized text separately?", answer: "Yes. Download the extracted text as a .txt file or the original PDF with the searchable text layer added." },
    ],
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: 'Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Form Filler — Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed. ',
    dependencies: "pdf-lib",
    instructions: [
      { title: "1. Upload PDF Form", desc: "Select a fillable PDF form (AcroForm or XFA format). The tool detects all form fields automatically." },
      { title: "2. Fill Out Fields", desc: "Click on each form field to enter text, select checkboxes, choose radio buttons, or pick dropdown options." },
      { title: "3. Download Filled Form", desc: "Save the completed PDF form with all entered data flattened or editable. Choose whether to allow further editing." },
    ],
    faqs: [
      { question: "What types of form fields are supported?", answer: "Text fields, checkboxes, radio buttons, dropdown lists, list boxes, buttons, and signature fields are all supported." },
      { question: "Can I save progress and continue later?", answer: "Yes. Your filled data persists in the browser session. Do not clear browser cache until you download the completed form." },
      { question: "What is field flattening?", answer: "Flattening converts fillable form fields into static text. This prevents further editing and is commonly required for submitted forms." },
    ],
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: 'Indexes uploaded PDFs, Word files, and plain-text documents into a vector store and lets you ask natural-language questions about their contents.',
    dependencies: "CF Vectorize",
    seoDescription: 'Chat with your documents using AI — upload PDFs, Word files, and ask natural-language questions. Free online RAG tool. Uses cloud-based processing.',
    instructions: [
      { title: "1. Upload Your Documents", desc: "Upload PDFs, Word files, or plain-text documents. The tool indexes all content into a vector store for fast, accurate retrieval across your entire document set." },
      { title: "2. Ask Questions in Natural Language", desc: "Type any question about your documents in plain English (or other languages). The AI retrieves relevant passages and generates answers based on the document contents." },
      { title: "3. Review Answers with Source Citations", desc: "Each answer includes citations showing which document and section the information came from. Verify claims and explore source material directly." },
    ],
    faqs: [
      { question: "What is RAG (Retrieval-Augmented Generation)?", answer: "RAG combines document retrieval with AI text generation. When you ask a question, the system first finds relevant passages from your documents, then the AI generates an answer based only on those retrieved passages — reducing AI hallucinations." },
      { question: "What document formats are supported?", answer: "The tool supports PDF, DOCX (Word), and plain text files. PDFs work best for structured documents. You can upload multiple documents and ask questions across all of them simultaneously." },
      { question: "Is my document data stored on the server?", answer: "Your documents are processed and indexed temporarily to answer your questions. The vector store is session-based and documents are not retained after your session ends." },
      { question: "How many documents can I upload at once?", answer: "You can upload multiple documents per session. There's a reasonable file size limit per document. Large document sets may take longer to index before you can start asking questions." },
    ]
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: 'Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. Uses cloud-based processing.',
    seoDescription: 'Free online AI Video Subtitler — Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. ',
    dependencies: "Whisper API",
    showInCategory: false,
    instructions: [
      { title: "1. Upload Your Video", desc: "Select a video file (MP4, MOV, WebM, AVI). The AI transcribes the spoken audio and generates timestamped subtitles synchronized to each utterance." },
      { title: "2. Choose Subtitle Language", desc: "Select the spoken language in your video. The transcription matches the speech language. Additional language translation support may be available for subtitle output." },
      { title: "3. Export SRT or VTT Subtitles", desc: "Download the generated subtitles as SRT or VTT format. Both formats include precise timestamps for use with video players, YouTube, or social media platforms." },
    ],
    faqs: [
      { question: "How accurate is the subtitle timing?", answer: "Subtitles are synchronized at the utterance level with frame-accurate timing. Each subtitle segment matches the natural pauses and speech rhythm of the spoken content." },
      { question: "What subtitle formats are available?", answer: "You can download subtitles in SRT (SubRip) and VTT (WebVTT) formats. SRT is widely supported by video players. VTT supports additional styling and is used by HTML5 video players." },
      { question: "Can I edit the subtitles after generation?", answer: "Yes. The generated subtitles appear in an editable text area before export. You can correct transcription errors, adjust timing, or reformat text before downloading." },
      { question: "What video formats are supported?", answer: "MP4, MOV, WebM, and AVI files are supported. The tool extracts the audio track for transcription and preserves the original video for subtitle synchronization." },
    ]
  },
];
