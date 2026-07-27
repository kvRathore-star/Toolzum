const CONTENT = {
  "add-text-to-photo": {
    instructions: [
      { title: "1. Upload Your Photo", desc: "Select the image you want to annotate from your device. Drag-and-drop works best for quick edits. Supported formats include JPEG, PNG, and WebP up to 50MB." },
      { title: "2. Add and Style Text", desc: "Click anywhere on the photo to place a text box. Choose from 80+ fonts, adjust size with the slider, and pick any hex color. Apply shadows, outlines, or gradient fills to make text pop against busy backgrounds." },
      { title: "3. Position and Download", desc: "Drag text blocks to any position, rotate them freely, or set precise alignment guides. Layer multiple text boxes with different styles. Download your finished photo as PNG to preserve text sharpness or JPEG for smaller file size." }
    ],
    faqs: [
      { question: "Can I add curved or rotated text?", answer: "Yes, you can rotate any text block to any angle using the rotation handle above the selected text box. Curved text along a path isn't supported currently, but you can angle each block independently for creative layouts." },
      { question: "Do you support emoji and special characters in text?", answer: "Absolutely. The text editor supports Unicode, so emoji, accented characters, and symbols from any language render correctly. Paste emoji directly or use the character picker on mobile." },
      { question: "Will my original image resolution change?", answer: "No, the tool preserves your original image dimensions and resolution. Text is rendered as a vector overlay before rasterization, so the output matches your input quality exactly at the pixel level." }
    ]
  },
  "batch-image-editor": {
    instructions: [
      { title: "1. Upload Multiple Images", desc: "Upload up to 50 images at once from your device or cloud storage. The tool accepts JPEG, PNG, WebP, and TIFF formats. A thumbnail grid shows all queued images with file names and sizes at a glance." },
      { title: "2. Apply Edits to All", desc: "Choose from resize, crop, rotate, flip, compress, or format conversion. Adjust quality, dimensions, and output format for the entire batch. Every image gets identical processing parameters." },
      { title: "3. Download as Archive", desc: "Processed images are bundled into a single ZIP archive for one-click download. Each file retains its original name with the new extension appended. You get a summary report of before-and-after sizes for every image in the batch." }
    ],
    faqs: [
      { question: "Is there a limit on how many images I can process at once?", answer: "You can upload up to 50 images per batch, each capped at 50MB individually. For larger volumes, split into multiple batches — the tool resets cleanly after each download." },
      { question: "Can I apply different settings to individual images in a batch?", answer: "No, batch mode applies uniform settings to all selected images. For per-image customization, use the individual image tools instead. Batch is optimized for consistency across many files." },
      { question: "What happens if one image fails to process?", answer: "Processing continues for the remaining images. A detailed error log shows which file failed and why, and the successful images still get bundled into the downloadable ZIP archive." }
    ]
  },
  "background-remover": {
    instructions: [
      { title: "1. Upload Image with Subject", desc: "Choose a photo with a clear subject against any background. The AI model works best with people, products, pets, and vehicles. For best results, ensure good contrast between the subject and background." },
      { title: "2. Automatic Detection and Removal", desc: "Our AI analyzes the image to detect the foreground subject. It creates a precise mask around edges, including fine details like hair, fur, or fuzzy boundaries. Processing takes 2-5 seconds depending on resolution." },
      { title: "3. Refine and Download", desc: "Use the edge brush to fix any imperfect mask areas. You can then place the subject on a solid color, upload a new background image, or download with a transparent PNG. Feather and smooth controls help blend edges naturally." }
    ],
    faqs: [
      { question: "How accurate is the AI at detecting complex edges like hair?", answer: "The model uses semantic segmentation trained on millions of images to handle fine details. Flyaway hairs and fur are preserved well, but very blurry edges or subjects blending into similar-colored backgrounds may need manual touch-up." },
      { question: "Is my image stored on your servers after processing?", answer: "Processed images are deleted from our servers within one hour. We do not use uploaded images for training or data collection. Your privacy and content ownership remain fully intact." },
      { question: "Can I use background removal for batch processing?", answer: "Background removal works on single images only in this tool. Each image requires individual AI inference to generate the correct mask, so batch processing isn't available — but the processing itself takes only seconds per image." }
    ]
  },
  "object-remover": {
    instructions: [
      { title: "1. Upload Your Image", desc: "Load the photo containing unwanted objects, people, text, or blemishes. Works with JPEG, PNG, and WebP files. Higher resolution images yield better inpainting results." },
      { title: "2. Brush Over the Object", desc: "Use the brush tool to paint over everything you want removed. Adjust brush size for precision — small for wires and text, large for people and vehicles. The mask turns red so you see exactly what's selected." },
      { title: "3. Generate and Review", desc: "Hit Remove and the AI fills the masked area with contextually appropriate content. It analyzes surrounding textures, lighting, and patterns to reconstruct what should be underneath. Download the cleaned image when satisfied." }
    ],
    faqs: [
      { question: "What happens behind the masked area during removal?", answer: "The AI uses generative inpainting — it studies the pixels surrounding your mask and synthesizes new content that matches the lighting, texture, and perspective. Results depend on how much context is available around the masked region." },
      { question: "Can I undo or redo a removal?", answer: "Yes. The tool keeps a full history of your edit session. You can undo back to the original image at any point. If you remove too much, simply undo and paint a more precise mask." },
      { question: "Does this work for removing watermarks from photos?", answer: "It can remove watermarks, but results vary. Simple semi-transparent watermarks over uniform backgrounds work well. Complex watermarks over detailed areas may leave visible artifacts since the AI has limited context to reconstruct from." }
    ]
  },
  "crop-image": {
    instructions: [
      { title: "1. Upload Your Image", desc: "Select an image from your device. Any common format is accepted — JPEG, PNG, WebP, GIF, BMP, TIFF. The image appears in a canvas with a adjustable selection overlay." },
      { title: "2. Select Crop Area", desc: "Drag the corner handles to define your crop region. Choose from preset aspect ratios: 1:1 for square, 4:3 for standard, 16:9 for widescreen, 3:2 for print, or enter a custom ratio. Gridlines overlay helps with composition using the rule of thirds." },
      { title: "3. Apply Crop and Save", desc: "Click Apply to trim the image to your selected region. The output retains the original file format. Optionally set output dimensions in pixels if you need exact sizes for web or print use." }
    ],
    faqs: [
      { question: "Does cropping reduce image quality?", answer: "No, cropping simply discards pixels outside your selection area. The remaining pixels retain their original quality. Unlike resizing, no interpolation or compression happens during a crop operation." },
      { question: "Can I crop to a specific pixel dimension?", answer: "Yes, switch to custom dimensions mode and enter exact width and height in pixels. The crop overlay adjusts to match. If your aspect ratio doesn't match, the tool shows you the closest fit." },
      { question: "What if I crop too much and want to go back?", answer: "You can undo the crop within the session. However, once you close the tool or start a new crop, the original cropped pixels are gone. Always save a copy if you think you might need the full image later." }
    ]
  },
  "image-enhancer": {
    instructions: [
      { title: "1. Upload Your Photo", desc: "Choose a photo that needs quality improvement — old scans, low-light shots, or compressed images. The enhancer supports JPEG, PNG, and WebP. Larger files give the AI more data to work with for better results." },
      { title: "2. Adjust Enhancement Settings", desc: "Use sliders to control brightness, contrast, saturation, sharpness, and noise reduction. Auto-enhance applies an AI-optimized combination. Preview changes in real-time with a split-view comparison." },
      { title: "3. Apply and Export", desc: "Once satisfied, apply the enhancements. You can further upscale resolution up to 4x using AI super-resolution. Download in your chosen format — PNG for maximum quality or JPEG for manageable file sizes." }
    ],
    faqs: [
      { question: "Can this tool fix severely blurry photos?", answer: "The sharpening and AI upscaling can improve mild to moderate blur, but it cannot fix extreme motion blur or out-of-focus shots. The AI reconstructs detail based on patterns, but it cannot invent information that wasn't captured." },
      { question: "Does noise reduction remove grain from old film scans?", answer: "Yes, the noise reduction filter is effective on film grain and digital sensor noise. Use the strength slider carefully — too much reduction can create a waxy, plastic-looking surface. Medium settings preserve texture while removing grain." },
      { question: "What is the maximum upscale resolution supported?", answer: "You can upscale up to 4x the original dimensions in each axis. A 1000x1000 pixel image can become 4000x4000. Beyond that, the AI lacks sufficient source data to generate convincing detail." }
    ]
  },
  "meme-generator": {
    instructions: [
      { title: "1. Choose or Upload a Template", desc: "Pick from our library of trending meme templates — Drake, Distracted Boyfriend, Disaster Girl, and 200+ more. Or upload your own image to create a custom meme canvas." },
      { title: "2. Add Top and Bottom Text", desc: "Click the top and bottom text areas to type your punchline. Choose from classic Impact font, Arial, Comic Sans, or system fonts. Adjust text size, color, stroke width, and drop shadow. All caps styling is auto-applied for top text." },
      { title: "3. Customize and Export", desc: "Position text freely outside the traditional top-and-bottom layout if you want something different. Add stickers or emoji overlays. Download as PNG with transparent background or JPEG for smaller file size." }
    ],
    faqs: [
      { question: "Can I use my own images as meme templates?", answer: "Yes, upload any image to create a custom template. It works exactly like built-in templates — you get the same text controls, positioning, and export options. Your uploaded template stays in your session only." },
      { question: "What font size works best for meme readability?", answer: "For classic meme format, use large bold white text with a thick black stroke. The tool defaults to a 48px Impact font with 2px stroke. On mobile screens, go bigger — 60px+ ensures your punchline is legible on all devices." },
      { question: "Are there copyright concerns with popular meme templates?", answer: "Using well-known meme images for personal or parody use generally falls under fair use. For commercial purposes, we recommend using original photos to avoid potential licensing issues with recognizable stock photos." }
    ]
  },
  "image-resizer": {
    instructions: [
      { title: "1. Upload Your Image", desc: "Select an image to resize. The tool supports JPEG, PNG, WebP, GIF, BMP, and TIFF. Current dimensions are displayed immediately. Images up to 100MB can be processed." },
      { title: "2. Set New Dimensions", desc: "Enter exact width and height in pixels, or choose from presets like Instagram square, Twitter header, LinkedIn banner, or 4K resolution. Maintain aspect ratio with the lock icon, or freely stretch for custom dimensions." },
      { title: "3. Choose Resampling and Download", desc: "Pick a resampling algorithm — Lanczos for maximum sharpness when downscaling, Bilinear for smooth upscaling, or Nearest Neighbor for pixel art. Download the resized image in any format independent of the original." }
    ],
    faqs: [
      { question: "Will resizing make my image look blurry?", answer: "Downscaling typically preserves sharpness well. Upscaling introduces interpolation blur since new pixels must be estimated. The Lanczos algorithm minimizes this, but enlarging beyond 2x the original will show softness." },
      { question: "What's the difference between resizing and resampling?", answer: "Resizing changes pixel dimensions. Resampling is the mathematical method used to calculate new pixel values. Lanczos preserves edges best for downscaling, Bilinear is smoother for upscaling, and Nearest Neighbor keeps hard edges for pixel art." },
      { question: "Can I resize multiple images at once?", answer: "This tool handles one image at a time. For bulk resizing, use our Batch Image Editor which applies the same dimensions and algorithm to up to 50 images simultaneously." }
    ]
  },
  "photo-retoucher": {
    instructions: [
      { title: "1. Upload Your Portrait Photo", desc: "Upload a portrait or selfie that needs retouching. The tool is optimized for human faces and works best with well-lit front-facing photos. Supports JPEG, PNG, and WebP formats." },
      { title: "2. Apply Retouching Adjustments", desc: "Use skin smoothing to reduce blemishes and pores, the blemish remover for spot fixes, teeth whitening, eye brightening, and red-eye correction. Each adjustment has a strength slider so the result looks natural." },
      { title: "3. Compare and Save", desc: "Toggle between before and after views to see the retouch effect. Make final tweaks to ensure the result still looks like a natural photo. Download the retouched version in your preferred format." }
    ],
    faqs: [
      { question: "Can the retoucher handle group photos?", answer: "It works on individual faces within a group photo, but you may need to select faces individually. For consistent retouching across multiple people, process each face separately for the most natural results." },
      { question: "Is skin smoothing safe for preserving natural texture?", answer: "Yes, the slider lets you go from subtle pore reduction to full airbrushing. We recommend keeping it below 50% to maintain skin texture and avoid the plastic look. The AI targets blemishes specifically rather than blurring the entire face." },
      { question: "Does teeth whitening work on all tooth shades?", answer: "Teeth whitening brightens and removes yellow tint from natural teeth. It doesn't affect dental work like crowns, veneers, or braces, which already appear white. Over-whitening can make teeth look unnatural, so use a gentle setting." }
    ]
  },
  "image-colorizer": {
    instructions: [
      { title: "1. Upload a Black and White Photo", desc: "Upload your monochrome or sepia historical photo. The colorizer works best with portrait and landscape photos from the 1800s to mid-1900s. Higher resolution scans produce more accurate coloring." },
      { title: "2. AI Colorization Process", desc: "The AI analyzes the image content — detecting sky, skin, foliage, clothing, and objects — then assigns realistic colors based on its training data. You can let it run fully automatic or guide it with color hints." },
      { title: "3. Fine-Tune Colors Manually", desc: "Use color brushes to correct or change specific areas. If the AI got the sky wrong, paint over it with the correct blue. Adjust saturation and warmth globally. Download the colorized result as JPEG or PNG." }
    ],
    faqs: [
      { question: "How historically accurate are the AI-assigned colors?", answer: "The AI assigns plausible colors based on what it learned from millions of color photos, not historical accuracy. Uniforms, cars, and specific objects may get generic colors. Historical reference images help you manually correct these." },
      { question: "Can I colorize damaged or scratched photos?", answer: "Yes, but scratches and damage are colorized along with the rest of the image. We recommend restoring the photo first using a restoration tool, then colorizing the cleaned version for the best results." },
      { question: "Does it work on sepia-toned photos too?", answer: "Yes, sepia photos work just as well as pure black-and-white. The AI strips the sepia tone as a pre-processing step before applying color. The output will be full color regardless of the original tint." }
    ]
  },
  "png-to-svg": {
    instructions: [
      { title: "1. Upload Your PNG Image", desc: "Upload a PNG file you want to convert to vector. Simple graphics with solid colors, logos, and icons work best. Photos and gradients don't vectorize well — the result will have too many paths and lose visual quality." },
      { title: "2. Choose Vectorization Settings", desc: "Set the color palette size (2-32 colors) and path simplification level. Fewer colors and simpler paths produce cleaner SVGs. Preview the vectorized result overlaying the original to compare." },
      { title: "3. Download as SVG", desc: "Review the vector output and adjust settings if needed. Download the SVG file which is infinitely scalable and editable in tools like Illustrator or Inkscape. The SVG code is also shown for direct copy-paste into web projects." }
    ],
    faqs: [
      { question: "Will text in my PNG be editable as text in the SVG?", answer: "No, text in the PNG is rasterized pixels. The vectorization traces shapes, not characters. If you need editable text, recreate it as actual text elements in the SVG using a vector editor afterward." },
      { question: "How many colors can the SVG output have?", answer: "You can set between 2 and 32 colors. Fewer colors create cleaner, smaller files but lose detail. Photos need 32+ colors but the SVG file becomes bloated. PNG-to-SVG is best suited for flat-color graphics under 16 colors." },
      { question: "What resolution PNG should I start with?", answer: "Upload at least 500x500 pixels. Low-resolution PNGs lack edge detail and produce jagged vector paths. If you only have a small PNG, scale it up first using AI upscaling, then vectorize the larger version." }
    ]
  },
  "collage-maker": {
    instructions: [
      { title: "1. Select Your Photos", desc: "Choose 2 to 12 photos from your device for the collage. Thumbnails appear in the upload tray. Drag them to reorder — the first photo becomes the primary slot in template layouts that have a featured image." },
      { title: "2. Pick a Layout and Spacing", desc: "Browse grid, freestyle, and themed layouts. Adjust spacing between photos with the gap slider, set rounded corner radius, and choose a background color or pattern. Each layout auto-arranges photos into balanced compositions." },
      { title: "3. Add Filters and Export", desc: "Apply a uniform filter across all photos for a cohesive look. Add text captions, dates, or borders. Download the collage as a single high-resolution JPEG or PNG file." }
    ],
    faqs: [
      { question: "What happens if my photos have different aspect ratios?", answer: "The layout engine crops photos to fit each slot while keeping the most important content centered. You can manually reposition each photo within its slot if the auto-crop cuts something important." },
      { question: "Can I save a collage template for reuse?", answer: "Not directly, but you can save the collage project as you work. Reopening the saved project restores your layout, photos, spacing, and filters so you can make adjustments or create variations." },
      { question: "What's the maximum resolution for exported collages?", answer: "Exports at up to 12000x12000 pixels total. The tool divides the resolution across slots, so a 4-photo grid at 6000x6000 gives each photo a 3000x3000 area — plenty for high-quality prints." }
    ]
  },
  "chart-maker": {
    instructions: [
      { title: "1. Enter Your Data", desc: "Type or paste data into the table grid. Add rows and columns manually or import a CSV file. Label your axes and data series. The tool supports bar, line, pie, area, scatter, and radar chart types." },
      { title: "2. Customize Chart Appearance", desc: "Choose colors, fonts, legends, grid lines, and data labels. Set axis ranges and tick mark intervals. Enable 3D perspective for bar and pie charts. Update the title and add annotations on specific data points." },
      { title: "3. Export Chart as Image", desc: "Preview the chart at full resolution. Download as PNG for presentations, JPEG for documents, or SVG for further editing in vector software. The chart renders at 2x resolution for Retina display clarity." }
    ],
    faqs: [
      { question: "What's the maximum number of data points I can visualize?", answer: "You can have up to 500 data points per series and 20 series per chart. Beyond that, chart readability degrades. For large datasets, consider aggregating or using a scatter plot with smaller markers." },
      { question: "Can I create a combo chart with multiple chart types?", answer: "Yes, the mixed chart option lets you assign different types to different series. For example, show revenue as bars and growth rate as a line on the same chart with dual Y-axes." },
      { question: "Is the SVG export fully editable in Illustrator?", answer: "Yes, SVG exports maintain all chart elements as separate objects — text labels, data points, legends, axes, and gridlines. Open the SVG in Illustrator or Inkscape to change colors, fonts, or individual elements." }
    ]
  },
  "bg-changer": {
    instructions: [
      { title: "1. Upload a Photo with a Subject", desc: "Choose a photo where the subject is clearly separated from the background. Portraits, product shots, and pet photos work best. The subject should be in focus with the background at a different depth." },
      { title: "2. AI Background Removal", desc: "The AI automatically detects and masks the foreground subject. It preserves fine details like hair edges and fuzzy boundaries. Review the mask and use the refine brush to fix any missed spots." },
      { title: "3. Choose and Set New Background", desc: "Pick a solid color from the palette, upload your own background image, or select from stock backgrounds. The tool adjusts lighting and shadows to make the subject look naturally placed in the new scene." }
    ],
    faqs: [
      { question: "Can I blur the original background instead of replacing it?", answer: "Yes, there's a background blur slider that creates a depth-of-field effect. This is useful for portraits where you want to keep the location context but reduce distraction." },
      { question: "Does the tool match lighting between subject and new background?", answer: "Basic color matching adjusts white balance and exposure to blend the subject with the new background. For complex lighting directions, you may need a photo editor, but standard scenarios look natural." },
      { question: "Can I use a video as the new background?", answer: "No, only static images are supported as backgrounds. However, the output image can be used as a frame in video editing software if you're building a composite for video production." }
    ]
  },
  "unblur-sharpen": {
    instructions: [
      { title: "1. Upload a Blurry Image", desc: "Upload any photo that needs sharpening — camera misfocus, motion blur, or soft lens issues. JPEG, PNG, WebP, and RAW-derived formats are supported. The tool analyzes the type and amount of blur present." },
      { title: "2. Adjust Sharpening Parameters", desc: "Three modes address different blur types: Deconvolution for out-of-focus, Motion Deblur for camera shake, and AI Sharpen for general softness. Adjust the strength slider and preview the result in real-time." },
      { title: "3. Fine-Tune and Export", desc: "Avoid oversharpening — it creates halos around edges and increases noise. Use the noise suppression slider to keep grain under control. Download the sharpened image in your original format or a new one." }
    ],
    faqs: [
      { question: "Can motion blur from a fast-moving subject be fixed?", answer: "The Motion Deblur mode is designed for camera shake, not subject motion. If a moving subject is blurred but the background is sharp, the tool struggles since the blur direction varies per pixel." },
      { question: "What causes the halo effect around edges when sharpening?", answer: "Halos occur when the sharpening radius is too large relative to image features. The sharpening algorithm increases contrast at edges, and excessive radius creates visible bright and dark bands. Start with a small radius." },
      { question: "Is there a way to sharpen only specific parts of an image?", answer: "No selective sharpening is built in, but you can crop the area you want sharpened, process it, then composite it back. The global sharpening affects the entire frame equally." }
    ]
  },
  "gif-editor": {
    instructions: [
      { title: "1. Upload a GIF File", desc: "Select an animated GIF from your device. The tool displays each frame as a timeline strip. Larger files with more frames take longer to load — animations up to 200 frames and 50MB are supported." },
      { title: "2. Edit Individual Frames", desc: "Delete, duplicate, or reorder frames from the timeline. Adjust the delay time per frame or apply a uniform speed to all. Add text overlays, draw on frames, or apply filters to selected frame ranges." },
      { title: "3. Optimize and Export", desc: "Set output quality: reduce colors to 64 or 32 for smaller file sizes, enable dithering for smooth gradients, and trim unwanted frames. Download the edited GIF or export as a video MP4 for better compression." }
    ],
    faqs: [
      { question: "Can I add text that appears on every frame?", answer: "Yes, the persistent text layer stamps your text onto every frame at the same position. For animated text that moves per frame, you'll need to position it individually on each frame." },
      { question: "Why is my GIF larger after editing than before?", answer: "GIF compression is lossless-frame-based. Adding frames, increasing dimensions, or using more colors increases file size. Use the optimization settings to reduce the color palette and enable lossy compression to compensate." },
      { question: "Does the tool support transparency in GIFs?", answer: "Yes, GIFs support single-color transparency. You can set one color as transparent per frame. For multi-color transparency or alpha channels, consider converting to APNG or WebP instead." }
    ]
  },
  "gif-resizer": {
    instructions: [
      { title: "1. Upload an Animated GIF", desc: "Upload the GIF you want to resize. The original dimensions, frame count, and file size are displayed. Large GIFs with many frames may take a moment to process before editing." },
      { title: "2. Set New Dimensions and Quality", desc: "Enter pixel dimensions or choose a percentage scale. Maintain aspect ratio by default. Adjust the color palette size — reducing from 256 to 64 colors dramatically shrinks file size. Enable frame skipping to reduce frame count." },
      { title: "3. Preview and Download", desc: "Preview the resized GIF in the player. Check that animation smoothness and quality meet expectations. Download the optimized GIF or export as a lightweight WebP animation for faster web loading." }
    ],
    faqs: [
      { question: "Why does resizing a GIF sometimes create pixelation?", answer: "GIFs have a fixed 256-color palette. When you shrink dimensions, the dithering pattern compresses and can create moiré or blocky artifacts. Increasing dithering helps smooth the transition." },
      { question: "Can I resize only the dimensions without changing quality?", answer: "Yes, keep the color palette at 256 maximum and disable frame skipping. The resized GIF will look identical at the new size but the file will be proportionally smaller due to fewer pixels." },
      { question: "What's the recommended size for GIFs on social media?", answer: "Twitter and Facebook cap GIFs at 15MB but recommend under 5MB for fast loading. Resize to 480px wide max and reduce colors to 128 for the best balance of quality and social platform compatibility." }
    ]
  },
  "gif-to-apng": {
    instructions: [
      { title: "1. Upload Your GIF Animation", desc: "Select an animated GIF file from your device. The tool reads all frames and their timing data. GIFs with up to 500 frames are supported. Complex animations with transparency may convert especially well to APNG." },
      { title: "2. Configure Conversion Options", desc: "Choose whether to preserve the original frame delays or set a uniform frame rate. APNG supports full alpha transparency per pixel, so semi-transparent pixels from GIF dithering can be cleaned up." },
      { title: "3. Convert and Download", desc: "The conversion extracts each GIF frame into APNG's frame sequence. Download the APNG file, which offers better color depth and smaller file sizes for animations with transparency compared to GIF." }
    ],
    faqs: [
      { question: "Will the APNG be smaller than the original GIF?", answer: "Often yes. APNG uses PNG-style compression which is more efficient than GIF's LZW compression, especially for animations with large uniform areas. Animations with lots of noise or grain may be similar in size." },
      { question: "Can I view APNG files in any browser?", answer: "APNG is supported in all modern browsers except Internet Explorer. Chrome, Firefox, Safari, and Edge all render APNG natively. For legacy compatibility, consider a fallback to a static PNG or GIF." },
      { question: "Does APNG support 24-bit color like PNG?", answer: "Yes, APNG supports full 24-bit RGB color plus 8-bit alpha channel, giving 16.7 million colors versus GIF's 256. This eliminates color banding and produces smoother gradients in animations." }
    ]
  },
  "apng-to-gif": {
    instructions: [
      { title: "1. Upload Your APNG File", desc: "Upload an animated PNG (APNG) file. The tool parses the frame structure and timing data. APNG files with many frames created from screen recordings or complex animations work well." },
      { title: "2. Configure Palette Reduction", desc: "Since GIF supports only 256 colors, set the color palette size (2-256). Choose a dithering algorithm — Floyd-Steinberg produces the best visual quality. Preview color banding and adjust palette colors manually if needed." },
      { title: "3. Set Frame Handling and Export", desc: "APNG supports per-frame alpha blending, but GIF doesn't. Choose how to composite semi-transparent areas. Set disposal method for each frame. Download the converted GIF with optional optimization." }
    ],
    faqs: [
      { question: "What happens to APNG transparency in the GIF conversion?", answer: "GIF supports only binary transparency (on/off per pixel). Semi-transparent pixels in the APNG are either made fully opaque or fully transparent. This can create harsh edges where smooth transparency existed." },
      { question: "Why does my converted GIF have color banding?", answer: "Banding appears because GIF's 256-color palette cannot represent smooth gradients from the APNG's 16.7 million colors. Dithering helps by scattering pixels of different colors to simulate the missing shades." },
      { question: "Can I preserve the exact frame timing from the APNG?", answer: "GIF frame delays have a minimum of 10ms (some browsers enforce 20ms). APNG timings under 10ms are rounded up, which may slightly alter fast animation speed. Frame order and looping are preserved exactly." }
    ]
  },
  "image-to-ico": {
    instructions: [
      { title: "1. Upload Your Source Image", desc: "Upload a PNG, JPEG, GIF, or BMP to convert into a Windows icon. Square images work best since ICO format is square-only. For non-square sources, the tool auto-crops to a centered square." },
      { title: "2. Select Icon Sizes", desc: "Choose which icon sizes to include: 16x16, 32x32, 48x48, 64x64, 128x128, and 256x256. Multiple sizes in one ICO file let Windows pick the right size for each context — taskbar, desktop, file explorer." },
      { title: "3. Configure and Download", desc: "Set compression options per size. 32-bit icons include an alpha channel for smooth transparency. Download the .ico file ready for use as a website favicon, application icon, or Windows folder icon." }
    ],
    faqs: [
      { question: "What resolution should my source image be for the best icon?", answer: "Upload a 256x256 or larger source image. Smaller images get upscaled for the larger icon sizes and may look blurry. Vector sources converted to PNG before ICO conversion yield the sharpest multi-size icons." },
      { question: "Can I include multiple color depths in one ICO file?", answer: "Yes, the tool can bundle 32-bit (true color with alpha), 24-bit, 8-bit, and 4-bit versions in a single ICO. This provides backward compatibility with older Windows versions that don't support alpha transparency." },
      { question: "Will my icon work on macOS and Linux too?", answer: "ICO is primarily a Windows format. macOS uses .icns and Linux uses .png for icons. However, web browsers use .ico for favicons across all platforms, so it remains the standard format for website icons." }
    ]
  },
  "raw-image-converter": {
    instructions: [
      { title: "1. Upload a RAW Photo", desc: "Upload RAW files from major camera brands — CR2/CR3 (Canon), NEF (Nikon), ARW (Sony), RAF (Fujifilm), DNG (Adobe), and more. The tool reads the camera metadata and sensor data for processing." },
      { title: "2. Adjust RAW Processing", desc: "Set white balance from presets (Daylight, Cloudy, Tungsten, Flash) or use a custom color temperature. Adjust exposure compensation, contrast, highlights, shadows, and clarity. The demosaicing algorithm interpolates the Bayer pattern sensor data." },
      { title: "3. Export Processed Image", desc: "Choose output format — JPEG for sharing, PNG for web, TIFF for further editing, or DNG for archival. Set bit depth (8 or 16-bit) and color space (sRGB, Adobe RGB, ProPhoto RGB). Download the developed image." }
    ],
    faqs: [
      { question: "Is this Converter as powerful as Lightroom or Capture One?", answer: "It handles essential RAW development — white balance, exposure, and basic color grading — but lacks advanced tools like local adjustments, lens corrections, and noise profiling specific to your camera model." },
      { question: "What's the difference between 8-bit and 16-bit export?", answer: "16-bit exports retain far more color information from the RAW sensor data, preventing banding in smooth gradients like skies. 8-bit files are smaller and web-ready but clip subtle color variations." },
      { question: "Can I convert Sony ARW files that Lightroom doesn't support yet?", answer: "If your ARW file is from a very new Sony camera, it may not be in our decoder library yet. We update the supported camera list quarterly. DNG files from Adobe's converter are always supported." }
    ]
  },
  "image-format-converter": {
    instructions: [
      { title: "1. Upload Your Image", desc: "Upload any image in JPEG, PNG, GIF, BMP, TIFF, WebP, AVIF, or HEIC format. The tool reads the source format and displays its properties — dimensions, bit depth, color space, and alpha channel presence." },
      { title: "2. Choose Output Format", desc: "Select your target format from the dropdown. Each format shows estimated file size and feature compatibility — for example, JPEG doesn't support transparency, while PNG does. Quality sliders appear for lossy formats." },
      { title: "3. Adjust Settings and Convert", desc: "For lossy formats, set quality percentage. JPEG offers 1-100, WebP offers 0-100 with lossless option, AVIF adjusts quality versus encoding speed. Download the converted file or choose to save in multiple formats at once." }
    ],
    faqs: [
      { question: "Which format should I choose for the best compression?", answer: "AVIF offers the best compression-to-quality ratio today, followed by WebP, then JPEG. For photos, AVIF saves 50% more space than JPEG at the same quality level. For graphics with few colors, PNG is often smallest." },
      { question: "Will converting between formats reduce my image quality?", answer: "Converting from lossless to lossy (PNG to JPEG) degrades quality permanently. Converting lossy to lossless (JPEG to PNG) preserves existing quality but adds file size without restoring lost detail." },
      { question: "Can I convert to a format that supports animation?", answer: "Yes. Convert to GIF for simple animations (256 colors max), WebP for efficient animations with better color, or APNG for high-quality animations with full alpha support." }
    ]
  },
  "image-converter": {
    instructions: [
      { title: "1. Upload Your Image File", desc: "Choose an image from your device. This universal converter accepts JPEG, PNG, GIF, BMP, TIFF, WebP, AVIF, HEIC, and RAW formats. Drag and drop or use the file browser." },
      { title: "2. Pick a Target Format", desc: "Select from all major formats — JPEG, PNG, WebP, AVIF, HEIC, GIF, BMP, TIFF, ICO, JXL. Each format shows a brief description of its best use case. For lossy formats, use the quality slider." },
      { title: "3. Set Output Options and Convert", desc: "Adjust format-specific parameters like color count for GIF, compression level for PNG, or chroma subsampling for JPEG. Resize, rotate, or flip during conversion if needed. Download the converted image." }
    ],
    faqs: [
      { question: "How is this different from the specific format converters?", answer: "This tool lets you convert any format to any other format in one step, while the specific converters target one particular direction. Use this for general conversions and specific tools for specialized workflows." },
      { question: "Can I batch convert multiple images at once?", answer: "This tool handles single conversions. For batch converting many files to the same format with identical settings, use the Batch Image Editor which applies uniform conversion parameters." },
      { question: "What happens to EXIF metadata during conversion?", answer: "Most metadata is preserved when converting between common formats. Some formats like GIF and ICO have limited metadata capacity. You can choose to strip all metadata for privacy when downloading." }
    ]
  },
  "png-to-jpg": {
    instructions: [
      { title: "1. Upload Your PNG File", desc: "Upload the PNG image you want to convert to JPEG. PNG files with many colors or large dimensions will benefit most from JPEG compression. The tool displays the PNG's bit depth and alpha channel status." },
      { title: "2. Handle Alpha Transparency", desc: "Since JPEG doesn't support transparency, choose a background color for transparent areas — white is standard for product photos, black works well for graphics. The color you pick fills all formerly transparent pixels." },
      { title: "3. Set JPEG Quality and Download", desc: "Adjust quality from 1-100. For web photos, 80-85 offers excellent compression with minimal visible loss. Higher sources with smooth gradients need less compression. Download the JPEG — typically 5-10x smaller than the PNG." }
    ],
    faqs: [
      { question: "Why is my PNG with text blurry as a JPEG?", answer: "JPEG's lossy compression introduces artifacts around sharp edges and text. The blocking artifacts are most visible on high-contrast edges. Increase quality to 95+ if text sharpness is critical, or consider keeping the file as PNG." },
      { question: "Will the JPEG have the same color accuracy as my PNG?", answer: "JPEG uses YCbCr color space with chroma subsampling, which discards some color detail that PNG preserves exactly. For most photos, the difference is imperceptible, but for graphics with exact color requirements, PNG is superior." },
      { question: "What's the best JPEG quality for printing from a PNG source?", answer: "Use quality 100 for print. The file will be larger than a compressed JPEG, but it preserves maximum detail from the original PNG for high-quality output on paper or photo stock." }
    ]
  },
  "png-to-webp": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG file for conversion to WebP. The tool reads the PNG's color data and alpha channel. WebP supports transparency, so no background color is needed — alpha is preserved." },
      { title: "2. Choose Lossy or Lossless Mode", desc: "WebP offers both modes. Lossless preserves PNG's exact pixel data with smaller file sizes than PNG. Lossy offers even smaller sizes by discarding subtle color data. Toggle between modes to compare file sizes." },
      { title: "3. Set Encoding Options and Download", desc: "Lossy quality ranges 0-100, with 80 being a great balance. Enable sharp YUV for improved RGB-to-YUV conversion quality. Download the WebP file — typically 25-35% smaller than the original PNG at equivalent quality." }
    ],
    faqs: [
      { question: "Can WebP preserve PNG's full alpha channel transparency?", answer: "Yes, both lossless and lossy WebP support an 8-bit alpha channel identical to PNG. Semi-transparent pixels, soft shadows, and smooth transparency edges are preserved perfectly during conversion." },
      { question: "Is WebP supported in all email clients and CMS platforms?", answer: "WebP works in most modern email clients but not all. Gmail and Outlook web support it, but Outlook desktop may not. Most CMS platforms like WordPress and Shopify support WebP uploads as of 2023." },
      { question: "Why is my lossless WebP sometimes larger than the original PNG?", answer: "For very small PNGs under 5KB with simple graphics, the WebP container overhead can exceed the PNG file size. For most photographs and illustrations, WebP is significantly smaller even in lossless mode." }
    ]
  },
  "png-to-gif": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG image to convert to GIF format. The tool analyzes the image's color count. PNG supports 16.7 million colors while GIF is limited to 256, so some reduction is necessary." },
      { title: "2. Reduce Color Palette", desc: "Set the target palette size from 2 to 256 colors. The tool quantizes the PNG's colors to fit within the limit. Enable dithering to simulate missing colors through pixel patterns — Floyd-Steinberg dithering gives the best visual result." },
      { title: "3. Handle Transparency and Download", desc: "GIF supports single-color transparency. Pick which color in the palette should be transparent, matching the PNG's transparent areas. Download the GIF — ideal for simple graphics, logos, and web badges where GIF format is required." }
    ],
    faqs: [
      { question: "What happens to PNG's alpha channel in GIF conversion?", answer: "GIF supports only binary transparency — each pixel is either fully opaque or fully transparent. PNG's smooth alpha gradients (like soft shadows) are lost. Use dithering to approximate the transparent edge." },
      { question: "Can I convert a static PNG into an animated GIF?", answer: "No, PNG-to-GIF converts a single static image. For animations, start with an animated GIF or APNG file. This conversion preserves the GIF as a single-frame static image only." },
      { question: "Why does my gradient PNG look banded as a GIF?", answer: "Smooth gradients require thousands of colors to appear seamless. GIF's 256-color limit forces the gradient into visible color steps. Increased dithering helps disguise the bands but won't eliminate them entirely." }
    ]
  },
  "png-to-avif": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG file for conversion to AVIF. The tool shows the PNG's color depth and whether it has an alpha channel. AVIF supports 10-bit HDR color and full alpha transparency." },
      { title: "2. Set Quality and Encoding Speed", desc: "AVIF uses the AV1 codec. Quality 0-63 controls quantization (lower is better). Speed settings trade encoding time for compression efficiency — Medium is recommended for the best balance." },
      { title: "3. Configure HDR and Alpha Options", desc: "Enable HDR metadata if your PNG is in a wide color gamut. Alpha channel is preserved with compression. Set chroma subsampling — 4:4:4 for maximum color accuracy, 4:2:0 for smaller files. Download the AVIF." }
    ],
    faqs: [
      { question: "How much smaller is AVIF compared to PNG?", answer: "AVIF typically reduces PNG file size by 60-80% at visually lossless quality. A 1MB PNG photo can become 200-300KB as AVIF with minimal perceptual difference, especially on photographs with smooth gradients." },
      { question: "Does AVIF support the same transparency features as PNG?", answer: "Yes, AVIF supports full 8-bit and 10-bit alpha channels per pixel, identical to PNG's alpha capabilities. Semi-transparency, soft edges, and layered compositions all survive conversion intact." },
      { question: "Why does AVIF encoding take longer than PNG minification?", answer: "AVIF uses the AV1 compression algorithm which is computationally intensive. Encoding can take 2-10 seconds per image depending on resolution and quality settings. The trade-off is significantly smaller file sizes." }
    ]
  },
  "png-to-heic": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG image to convert to HEIC format. HEIC is Apple's preferred image format, offering modern compression. The tool checks if your PNG has an alpha channel — HEIC supports transparency." },
      { title: "2. Set Quality Parameters", desc: "Quality ranges from 0.0 to 1.0 (HEIF specification). A value of 0.8 offers excellent quality with good compression. HEIC uses HEVC (H.265) encoding for efficient compression of photographic content." },
      { title: "3. Handle Alpha and Metadata", desc: "HEIC supports alpha channels but not all viewers render them. Choose whether to preserve transparency or flatten with a background color. EXIF metadata from the PNG is preserved. Download the HEIC file." }
    ],
    faqs: [
      { question: "Will my HEIC file open on Windows and Android devices?", answer: "Windows 10+ and Android 10+ natively support HEIC, though some older versions require codec packs or extensions. On the web, HEIC support varies by browser — Safari supports it, Chrome may need flags enabled." },
      { question: "How does HEIC compression compare to JPEG for PNG photos?", answer: "HEIC typically achieves 40-50% smaller file sizes than equivalent quality JPEG from a PNG source. For photographs with large uniform areas like skies, HEIC's compression advantage is even more pronounced." },
      { question: "Can HEIC preserve PNG's lossless quality?", answer: "HEIC is natively lossy, though it offers a lossless mode. The lossless HEIC files are larger than the original PNG for most images. HEIC's strength is efficient lossy compression, not archival lossless storage." }
    ]
  },
  "png-to-bmp": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG file for conversion to BMP format. The tool identifies the PNG's pixel format. BMP is an uncompressed format, so prepare for significantly larger output files — often 3-5x the PNG size." },
      { title: "2. Choose BMP Bit Depth", desc: "Select bit depth: 24-bit (16.7 million colors), 32-bit (with alpha channel), 8-bit (256 colors), or 4-bit (16 colors). Higher bit depths mean larger files but preserve PNG color accuracy. 24-bit is standard." },
      { title: "3. Configure and Download", desc: "32-bit BMP preserves PNG's alpha channel. BMP files are uncompressed, making them ideal for applications that need raw pixel access without decoding overhead. Download the BMP — expect a file size equal to width × height × bytes per pixel." }
    ],
    faqs: [
      { question: "Why is my BMP so much larger than the original PNG?", answer: "PNG uses deflate compression which can reduce file sizes dramatically for images with large uniform areas. BMP stores raw pixel data with no compression, so file size equals exact pixel data size regardless of image simplicity." },
      { question: "Does BMP support the same transparency as PNG?", answer: "Yes, 32-bit BMP supports an alpha channel for transparency. However, not all applications read the alpha channel from BMP files correctly. PNG or WebP are more reliable choices for transparent images." },
      { question: "What is BMP commonly used for today?", answer: "BMP is primarily used in legacy software, certain industrial applications, medical imaging, and scenarios where pixel data must be read without any decompression overhead. It's rarely used on the web due to large file sizes." }
    ]
  },
  "png-to-tiff": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG file for conversion to TIFF. The tool reads PNG metadata including color space, bit depth, and compression. TIFF is a flexible container format that supports multiple compression methods." },
      { title: "2. Select Compression and Bit Depth", desc: "Choose compression: LZW for lossless (best for graphics), Deflate for better lossless compression, or no compression for maximum compatibility. Select bit depth — 8-bit or 16-bit per channel. 16-bit preserves finer tonal detail from the PNG." },
      { title: "3. Set Color Space and Download", desc: "TIFF can embed ICC color profiles. Choose sRGB, Adobe RGB, or embed the PNG's original profile. Download the TIFF — ideal for print production, scanning archives, and professional image editing workflows." }
    ],
    faqs: [
      { question: "Should I use LZW or Deflate compression for my TIFF?", answer: "LZW is the most widely compatible TIFF compression — supported by virtually all image editors. Deflate offers slightly better compression ratios but with narrower software support. For maximum compatibility, choose LZW." },
      { question: "Can TIFF store layers from layered PNG files?", answer: "No, PNG doesn't support layers. It stores a single flat raster. TIFF can store multiple pages, but this conversion preserves only the single rasterized image. For layered files, use PSD or XCF formats." },
      { question: "What bit depth should I use for archival scanning?", answer: "Use 16-bit per channel for archival quality. This captures 65,536 tonal levels per channel versus 256 in 8-bit. The file is twice as large but provides far more editing headroom in applications like Photoshop." }
    ]
  },
  "png-to-ico": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a square PNG image to convert into a Windows icon. The tool checks dimensions — non-square images are auto-cropped to a centered square. PNG's transparency is preserved in the ICO output." },
      { title: "2. Select Icon Sizes", desc: "Choose which standard icon sizes to include: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256. Multi-size ICO files let Windows select the appropriate size for taskbar, desktop, and file explorer views." },
      { title: "3. Configure Color Depth and Download", desc: "32-bit true color with alpha is recommended for modern Windows. Include 8-bit versions for older systems. Download the .ico file ready to use as an application icon, favicon, or folder icon." }
    ],
    faqs: [
      { question: "What's the minimum PNG resolution for a good icon set?", answer: "Upload at least 256x256 PNG. The tool downsizes to create smaller icon sizes. A 64x64 source will look pixelated when Windows tries to display it as a large icon. 512x512 or larger provides headroom for all sizes." },
      { question: "Will my PNG transparency carry over to all icon sizes?", answer: "Yes, alpha channel transparency is preserved in every size entry within the ICO file. Each size gets its own properly composited transparent version. 32-bit ICO entries include full alpha." },
      { question: "Can I use a non-square PNG as a website favicon?", answer: "Favicons should be square. If your PNG isn't square, the tool crops it to center before generating icon sizes. Use the crop feature beforehand to manually control which part of the image becomes the icon." }
    ]
  },
  "png-to-jxl": {
    instructions: [
      { title: "1. Upload Your PNG", desc: "Upload a PNG file for conversion to JPEG XL. The tool identifies the PNG's color characteristics including bit depth, color space, and alpha channel. JXL is designed as a next-generation universal format." },
      { title: "2. Select Encoding Mode", desc: "JPEG XL offers modular (lossless) mode for exact preservation and VarDCT (lossy) mode for compression. Set quality 0-100. Lossless mode typically achieves 20-30% better compression than PNG." },
      { title: "3. Configure Advanced Options", desc: "Set bit depth to match the PNG (8, 10, or 12-bit). Enable progressive encoding for faster preview during transmission. Preserve the alpha channel with efficient lossy or lossless compression. Download the .jxl file." }
    ],
    faqs: [
      { question: "How does JPEG XL compare to AVIF for PNG conversion?", answer: "Both offer excellent compression. JXL generally provides better lossless compression than AVIF and faster encoding/decoding. AVIF may achieve slightly smaller lossy files at very low bitrates but encodes much slower." },
      { question: "Is JPEG XL supported in web browsers currently?", answer: "JPEG XL adoption is limited. Chrome removed native support in 2023. Firefox supports it behind a flag. Safari doesn't support it yet. For web use, WebP or AVIF are more practical choices today." },
      { question: "Can JXL preserve PNG's exact lossless quality with smaller size?", answer: "Yes, JPEG XL's lossless mode preserves every original pixel of your PNG while typically achieving 20-35% smaller file sizes. This makes it ideal for archival storage where both quality and space matter." }
    ]
  },
  "jpg-to-png": {
    instructions: [
      { title: "1. Upload Your JPEG File", desc: "Upload a JPEG image that you want to convert to PNG. The tool reads the JPEG's compression artifacts and color data. Remember that JPEG has already lost quality through lossy compression — converting to PNG won't restore it." },
      { title: "2. Set PNG Bit Depth", desc: "Choose between 24-bit RGB for full color or 8-bit indexed for smaller file sizes. If the original JPEG had transparency that was flattened to white, this is your chance to add a transparent background." },
      { title: "3. Add Alpha Channel and Download", desc: "JPEG has no alpha channel. Use the magic wand or color-based selection to remove a solid background and make it transparent. Download the PNG — the file will be larger than the JPEG but preserves all visible detail without further loss." }
    ],
    faqs: [
      { question: "Will converting JPEG to PNG improve image quality?", answer: "No. JPEG compression already discarded information. Converting to PNG simply stores the current (already lossy) data without further degradation. It never recovers detail lost during the original JPEG encoding." },
      { question: "Why does my PNG from a JPEG look blocky in solid-color areas?", answer: "Those are JPEG compression artifacts — 8x8 pixel blocks with visible boundaries caused by the DCT quantization. Converting to PNG makes these artifacts permanent in a lossless container. They were present in the JPEG source." },
      { question: "Can I make a JPEG background transparent in the PNG?", answer: "Yes, but only if the background is a solid, uniform color. JPEG compression adds subtle color variations even to flat backgrounds, making perfect selection difficult. A tolerance-based selection tool helps isolate the subject." }
    ]
  },
  "jpg-to-webp": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG file to convert to WebP. The tool analyzes the JPEG's quality level and compression artifacts. WebP can achieve the same visual quality as the JPEG source at a fraction of the size." },
      { title: "2. Set Quality Level", desc: "WebP quality 0-100. Since the JPEG is already lossy, setting WebP quality to 80-90 usually matches the JPEG visually while reducing file size 25-35%. Lower values may exacerbate existing JPEG artifacts." },
      { title: "3. Enable Advanced Options", desc: "WebP supports alpha channel — useful if you want to add transparency to the JPEG. Enable sharpness filtering to reduce blocking artifacts from the JPEG source. Download the WebP, optimized for web delivery." }
    ],
    faqs: [
      { question: "Why would I convert JPEG to WebP instead of just using JPEG?", answer: "WebP provides 25-35% better compression than JPEG at equivalent visual quality. For websites with many images, this translates directly to faster page loads and lower bandwidth costs." },
      { question: "Does WebP preserve JPEG metadata like camera EXIF data?", answer: "Yes, WebP supports EXIF, XMP, and ICC color profile metadata. The tool preserves this information during conversion. You can choose to strip metadata for privacy-conscious applications." },
      { question: "Can I convert a JPEG to lossless WebP for better quality?", answer: "Yes, WebP has a lossless mode. However, lossless WebP stores the JPEG's existing artifacts permanently without further loss. It won't improve quality but offers a path to a lossless container." }
    ]
  },
  "jpg-to-gif": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG image to convert to GIF format. The tool evaluates the image's color complexity. JPEG supports 16.7 million colors, but GIF is limited to 256 — significant color reduction is required." },
      { title: "2. Reduce Color Palette", desc: "Set the target palette size (2-256 colors). JPEG photos with smooth gradients need careful quantization. Enable dithering — Floyd-Steinberg creates the most visually pleasing results by scattering pixels of available colors." },
      { title: "3. Set Transparency and Download", desc: "GIF supports one transparent color. You can select a color from the reduced palette to become transparent. The converted GIF is well-suited for simple web graphics, reaction images, and low-color applications." }
    ],
    faqs: [
      { question: "Will my JPEG photo look good as an 256-color GIF?", answer: "Photographs lose significant quality when reduced to 256 colors. Gradients show banding, and fine color details disappear. GIF is better suited for graphics, logos, and illustrations with limited color palettes." },
      { question: "How does dithering affect the JPEG-to-GIF conversion?", answer: "Dithering scatters pixels of available colors to simulate missing shades. It reduces color banding but adds a grainy texture. For smooth-skinned portraits, dithering can look unnatural — try without it first." },
      { question: "Can I convert a multi-layer JPEG to an animated GIF?", answer: "No, JPEG is a single-image format. This conversion produces a single-frame GIF. For animations, you need a sequence of images or an existing animated source file." }
    ]
  },
  "jpg-to-avif": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG image for conversion to AVIF. The tool reads the JPEG's quality level and existing compression artifacts. AVIF can deliver the same visual quality at roughly half the JPEG file size." },
      { title: "2. Set Quality and Encoding Parameters", desc: "AVIF quality is set from 0 to 63 (lower is better). A value of 20-30 usually matches JPEG quality 85-90 visually. Speed setting affects encoding time — prefer slower for better compression efficiency." },
      { title: "3. Configure Chroma and Download", desc: "Chroma subsampling 4:2:0 matches typical JPEG handling. 4:4:4 preserves full color detail for graphic elements. Enable alpha channel if you need to add transparency. Download the AVIF — significantly smaller than the JPEG." }
    ],
    faqs: [
      { question: "Will AVIF encoding make JPEG artifacts worse?", answer: "AVIF's compression can amplify existing JPEG artifacts, especially blocking artifacts in smooth areas. Use higher AVIF quality settings to minimize this. Pre-filtering the JPEG to reduce artifacts before conversion helps." },
      { question: "How does AVIF handle JPEG's chroma subsampling?", answer: "JPEG typically uses 4:2:0 subsampling already. AVIF can preserve this or use 4:4:4 for better color fidelity. The AVIF decoder is more sophisticated and may produce cleaner color transitions than JPEG's block-based approach." },
      { question: "Is AVIF suitable for batch JPEG conversion on a website?", answer: "Yes, but consider the encoding speed trade-off. Each image takes 3-10 seconds to encode depending on settings. For large batches, server-side processing is recommended over client-side browser encoding." }
    ]
  },
  "jpg-to-heic": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG file to convert to HEIC. The tool reads the JPEG's quality level and image structure. HEIC uses HEVC compression which typically reduces file size by 40-50% compared to the JPEG source." },
      { title: "2. Set HEIC Quality", desc: "Set quality level from 0.0 to 1.0. A quality of 0.8 matches most JPEG quality 85 sources visually. HEIC can also embed the original JPEG as a thumbnail for backward compatibility." },
      { title: "3. Configure Grid and Download", desc: "HEIC supports image grids for burst photos and multi-picture compositions. For single-image conversion, keep grid count at 1. Preserve or strip EXIF data. Download the HEIC, optimized for Apple ecosystem integration." }
    ],
    faqs: [
      { question: "Does HEIC preserve JPEG's original EXIF and camera data?", answer: "Yes, HEIC supports comprehensive metadata including EXIF, GPS, and XMP. All camera information, date stamps, and location data from the JPEG are preserved in the HEIC output." },
      { question: "Can I view HEIC files on non-Apple devices?", answer: "HEIC is natively supported on iOS, macOS, and Android 10+. Windows requires the HEIF Image Extension from the Microsoft Store. Web support is limited — primarily Safari on macOS and iOS." },
      { question: "Why is HEIC encoding slower than JPEG encoding?", answer: "HEIC uses HEVC (H.265) which is significantly more computationally complex than JPEG's DCT encoding. Hardware encoding on Apple Silicon devices is fast, but software encoding on other platforms takes several seconds." }
    ]
  },
  "jpg-to-bmp": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG file for conversion to BMP. The tool decompresses the JPEG into raw pixel data. Expect a massive file size increase — JPEG's compression ratio means a 500KB JPEG can become 10+ MB as BMP." },
      { title: "2. Choose Bit Depth", desc: "Select 24-bit (16.7M colors) for photographic quality, 8-bit (256 colors) for smaller files with visible palette reduction, or 32-bit if you want to add an alpha channel. 24-bit is standard for photographs." },
      { title: "3. Configure and Download", desc: "BMP files are uncompressed, so they're large but load instantly in any application without decoding delay. The conversion preserves all visible JPEG data in a pixel-exact format. Download the BMP for applications requiring direct pixel access." }
    ],
    faqs: [
      { question: "Why convert JPEG to BMP — is there any advantage?", answer: "BMP provides raw pixel access without decoding overhead, useful in embedded systems, legacy software, and situations where you need to read pixel data directly without image decoding libraries." },
      { question: "Does BMP preserve JPEG's compression artifacts?", answer: "Yes, every artifact present in the JPEG source becomes fixed pixel data in the BMP. The conversion is pixel-exact, so blocking artifacts, ringing, and color shifts from JPEG compression are all preserved." },
      { question: "Can I add transparency to a BMP converted from JPEG?", answer: "Yes, if you select 32-bit BMP, you can add an alpha channel. However, JPEG has no transparent areas, so you'd need to manually define a transparency mask using color selection after conversion." }
    ]
  },
  "jpg-to-tiff": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG file for conversion to TIFF. The tool reads the JPEG's compression quality and metadata. TIFF can store the JPEG data intact or decompress it into uncompressed pixel data." },
      { title: "2. Choose Compression Method", desc: "JPEG-in-TIFF keeps the original JPEG compression without further loss. LZW compression re-encodes losslessly but may produce larger files. No compression creates the largest but fastest-to-read TIFF files." },
      { title: "3. Set Bit Depth and Color Space", desc: "TIFF supports up to 16-bit per channel. Since JPEG is 8-bit, converting to 16-bit adds no extra detail but allows future editing headroom. Embed the JPEG's ICC color profile for consistent color reproduction. Download the TIFF." }
    ],
    faqs: [
      { question: "What is JPEG-in-TIFF and when should I use it?", answer: "JPEG-in-TIFF stores the original JPEG-compressed data inside a TIFF container. It preserves the file exactly without re-encoding, so no additional quality loss occurs. Use when you need TIFF's metadata or multi-page capabilities." },
      { question: "Can TIFF store multiple JPEG images in one file?", answer: "Yes, TIFF supports multi-page documents. You can combine several JPEG images into a single multi-page TIFF file, useful for scanned documents, fax archives, and multi-frame medical images." },
      { question: "Is TIFF better than JPEG for photo archiving?", answer: "For archiving, TIFF with LZW compression is preferred because it's lossless. However, converting an already-lossy JPEG to TIFF doesn't recover lost data. Only archive original JPEG sources or shoot in RAW for true archival quality." }
    ]
  },
  "jpg-to-ico": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a square JPEG image to convert into a Windows icon. The tool auto-crops non-square images to a centered square. Since JPEG has no transparency, the icon background will initially be opaque." },
      { title: "2. Choose Icon Sizes", desc: "Select standard sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256. Each size is generated from the source. Small sizes like 16x16 may lose detail from a soft JPEG, so check the preview." },
      { title: "3. Handle Background and Download", desc: "Since JPEG has no alpha channel, the icon will have a solid background. You can use the background removal tool to make areas transparent before generating the ICO. Download the multi-size icon file." }
    ],
    faqs: [
      { question: "Can I make my JPEG-based icon transparent?", answer: "JPEG doesn't support transparency, but the ICO tool can process the image with the background remover before encoding icon sizes. Solid white or colored backgrounds in the JPEG will become transparent regions in the icon." },
      { question: "How does the JPEG compression affect small icon sizes?", answer: "JPEG artifacts become very visible at small sizes like 16x16 and 32x32. Blocking artifacts can make edges look jagged. For better small icons, use a high-quality JPEG source with minimal compression artifacts." },
      { question: "Will a JPEG-based ICO work as a favicon?", answer: "Yes, browsers will display it. However, favicons look best with clear transparency so the icon blends with browser tabs. Consider removing the JPEG background before conversion for a professional favicon." }
    ]
  },
  "jpg-to-jxl": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG file for conversion to JPEG XL. The tool reads the JPEG's DCT coefficients and quantization tables. JXL can losslessly recompress JPEG with 20% size reduction." },
      { title: "2. Choose Lossless or Lossy Mode", desc: "JXL offers JPEG-transcoding lossless recompression — it preserves every detail of the original JPEG while making the file smaller. Or use lossy mode with quality 0-100 for further size reduction." },
      { title: "3. Configure and Download", desc: "JPEG-to-JXL lossless mode is mathematically lossless to the JPEG decoder — the decoded image is identical. Enable progressive decoding for faster visual preview. Download the .jxl file, backward-compatible with JPEG decoders." }
    ],
    faqs: [
      { question: "What does 'lossless JPEG recompression' mean exactly?", answer: "JPEG XL can decode a JPEG, then re-encode it in a way that the resulting JXL file, when decoded, produces exactly the same pixels as decoding the original JPEG. The visual output is identical, but the file is 15-20% smaller." },
      { question: "Can JPEG XL restore detail lost in the original JPEG compression?", answer: "No, lossless recompression preserves existing artifacts. For restoration, JXL offers a lossy mode that can clean up blocking artifacts using its more advanced compression algorithm, but this alters the image from the original JPEG." },
      { question: "Is JPEG XL backward compatible with standard JPEG decoders?", answer: "The .jxl file is not readable by standard JPEG decoders. However, JPEG XL can encode data in a hybrid format where legacy JPEG decoders see a standard JPEG while JXL decoders see the enhanced version." }
    ]
  },
  "jpg-to-svg": {
    instructions: [
      { title: "1. Upload Your JPEG", desc: "Upload a JPEG image to vectorize into SVG. The tool analyzes the image for edge detection and color regions. JPEG photos with gradual color changes produce SVGs with excessive paths, so simpler graphics work best." },
      { title: "2. Configure Vectorization", desc: "Set color count (2-32), edge detection threshold, and path simplification level. Lower color counts and higher simplification produce cleaner SVGs. Preview the vector output overlaid on the original JPEG." },
      { title: "3. Refine and Export SVG", desc: "Review the vector result — check that key shapes are recognizable. Fine-tune settings if edges are too jagged or details are lost. Download the SVG file, which is resolution-independent and editable in vector software." }
    ],
    faqs: [
      { question: "Can I convert a photographic JPEG to a high-quality SVG?", answer: "Photographs contain continuous tones that vectorization cannot represent efficiently. The SVG would contain thousands of tiny shapes and be larger than the JPEG with poor visual quality. SVGs are best for graphics with few colors." },
      { question: "What JPEG content works best for SVG conversion?", answer: "Graphics with solid color blocks, logos with clean edges, cartoons, and illustrations work best. JPEG photos of products on clean backgrounds can also work if you reduce to 8-16 colors." },
      { question: "Will the SVG retain JPEG's EXIF metadata?", answer: "No, SVG is an XML-based vector format and does not support EXIF metadata. Camera information, timestamps, and GPS data from the JPEG are not carried into the SVG output." }
    ]
  },
  "webp-to-png": {
    instructions: [
      { title: "1. Upload Your WebP File", desc: "Upload a WebP image for conversion to PNG. The tool reads the WebP's encoding mode — lossless or lossy — and alpha channel data. PNG will preserve all visible quality of the WebP source." },
      { title: "2. Choose PNG Compression Level", desc: "PNG compression level ranges from 0 (no compression, fast) to 9 (maximum compression, slower). Level 6 is the default best trade-off. PNG's deflate compression works well on graphics with large uniform areas." },
      { title: "3. Configure Bit Depth and Download", desc: "Preserve 24-bit color for lossy WebP or full 24-bit for lossless WebP. Alpha channel converts to PNG's native transparency seamlessly. Download the PNG — typically 10-30% larger than lossless WebP, similar to lossy WebP." }
    ],
    faqs: [
      { question: "Is PNG from WebP better quality than the original WebP?", answer: "No. The conversion is pixel-exact — whatever quality the WebP has, the PNG preserves it exactly. If the WebP was lossy, the PNG locks in those artifacts losslessly. PNG never improves upon the source." },
      { question: "Does this conversion preserve WebP animation?", answer: "No, this converts static WebP to static PNG. For animated WebP, use the WebP-to-GIF or APNG tools or extract individual frames using the GIF editor." },
      { question: "Why is my PNG larger than the WebP source?", answer: "PNG uses general-purpose deflate compression, while WebP uses specialized prediction techniques tailored to image data. For photos and gradients, WebP typically compresses 25-35% better than PNG." }
    ]
  },
  "webp-to-jpg": {
    instructions: [
      { title: "1. Upload Your WebP File", desc: "Upload a WebP image to convert to JPEG. The tool checks if the WebP has an alpha channel — since JPEG has no transparency, you'll need to handle this. The WebP's encoding mode affects conversion quality." },
      { title: "2. Handle Alpha Transparency", desc: "If your WebP has transparency, choose a background color to fill the transparent areas. White is standard for most uses, black for dark-themed applications. The fill color becomes part of the JPEG output." },
      { title: "3. Set JPEG Quality and Download", desc: "Set JPEG quality 1-100. For web use, quality 85 typically matches the WebP's visual quality. JPEG's chroma subsampling reduces color resolution. Download the JPEG — file size depends on image complexity and quality setting." }
    ],
    faqs: [
      { question: "Will JPEG compression add artifacts on top of WebP artifacts?", answer: "Yes, you're layering lossy compression on top of WebP's lossy encoding. The result will have artifacts from both encoders. To minimize this, use high JPEG quality (90+) or start with a lossless WebP source." },
      { question: "What happens to WebP's alpha channel in the JPEG output?", answer: "Alpha information is discarded since JPEG doesn't support it. Transparent areas are filled with the background color you select. Semi-transparent edges may show visible halos against the chosen background color." },
      { question: "Why convert from WebP to JPEG if WebP compresses better?", answer: "JPEG is universally supported — every device, browser, and application can open JPEG. If you're sending images to someone with legacy software or uploading to a platform that doesn't accept WebP, JPEG is the safest choice." }
    ]
  },
  "webp-to-gif": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP image (static or animated) for conversion to GIF. For animated WebP, all frames are extracted. The tool reads frame timing, disposal methods, and color data from the WebP source." },
      { title: "2. Reduce Color Palette", desc: "GIF supports only 256 colors. Set the palette size (2-256). WebP animations in full color need significant quantization. Choose a dithering algorithm — Floyd-Steinberg or Stucki — to simulate missing colors." },
      { title: "3. Process Animation and Download", desc: "If converting an animated WebP, set frame delay and looping behavior. GIF frame delays have 10ms minimum granularity. Download the GIF — simpler animations with few colors convert best." }
    ],
    faqs: [
      { question: "What happens to WebP's full alpha transparency in GIF?", answer: "GIF supports only binary transparency (on/off). WebP's smooth alpha edges become hard edges in GIF, potentially creating visible outlines around semi-transparent elements like shadows or reflections." },
      { question: "Can I preserve the animation length from the original WebP?", answer: "Frame count and timing are preserved as closely as possible. GIF timing is limited to multiples of 10ms, so very fast animations may play slightly slower. The loop count from WebP is carried over." },
      { question: "Why does my animated WebP look choppy as a GIF?", answer: "GIF's 256-color limit causes detail loss in each frame, making smooth motion appear less fluid. The dithering pattern also changes between frames, creating visible flickering in areas with smooth gradients." }
    ]
  },
  "webp-to-avif": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP image for conversion to AVIF. The tool reads the WebP's mode (lossless/lossy), color data, and alpha channel. AVIF offers superior compression to WebP for most image types." },
      { title: "2. Set AVIF Quality", desc: "Quality 0-63 where lower is better. A value of 20-30 usually matches WebP quality 80-90. AVIF's AV1 codec achieves 30-40% better compression than WebP at equivalent quality for photographs." },
      { title: "3. Configure Encoding Speed and Download", desc: "Speed setting balances encoding time against file size. Medium speed is recommended. Preserve alpha channel — AVIF supports efficient transparency compression. Download the AVIF, which will be noticeably smaller than the WebP." }
    ],
    faqs: [
      { question: "Is AVIF always smaller than WebP at the same quality?", answer: "For photographic content with smooth gradients, AVIF is typically 30-50% smaller. For simple graphics with few colors and hard edges, the advantage is smaller since WebP's compression already handles these efficiently." },
      { question: "Does AVIF support WebP's lossless mode equivalently?", answer: "AVIF supports lossless encoding, but it's not as efficient as WebP's lossless mode for most images. For lossless preservation, staying with WebP or using PNG may produce smaller files than lossless AVIF." },
      { question: "Can I convert animated WebP to animated AVIF?", answer: "This tool handles static images. Animated AVIF is supported in the AVIF specification but is not widely adopted. For animated conversions, animated WebP to animated GIF or APNG is more practical." }
    ]
  },
  "webp-to-heic": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP file to convert to HEIC format. The tool reads WebP's color information and alpha channel. HEIC offers comparable or better compression than WebP, especially for photographic content." },
      { title: "2. Set Quality Parameters", desc: "HEIC quality ranges from 0.0 to 1.0. A setting of 0.8 provides excellent quality. HEIC uses HEVC encoding which is particularly efficient for high-resolution photos with smooth tonal transitions." },
      { title: "3. Configure Alpha and Metadata", desc: "If the WebP has transparency, HEIC can preserve it. However, HEIC transparency support varies across platforms. EXIF and XMP metadata from the WebP can be embedded. Download the HEIC file." }
    ],
    faqs: [
      { question: "How does HEIC quality compare to the original WebP?", answer: "HEIC can match or exceed WebP's visual quality at the same file size for photographic content. For screen captures and graphics, WebP often maintains an edge. The best choice depends on your specific image type." },
      { question: "Can HEIC handle WebP's lossless encoding?", answer: "HEIC supports lossless mode, but it's rarely used. HEIC's strength is efficient lossy compression. Lossless HEIC files are typically 2-3x larger than lossless WebP, making HEIC a poor choice for lossless conversion." },
      { question: "Is HEIC conversion recommended for WebP images used on the web?", answer: "Not generally — WebP has broader web browser support than HEIC. Convert WebP to HEIC primarily when you need compatibility with Apple's ecosystem, such as for iOS apps or macOS workflows." }
    ]
  },
  "webp-to-svg": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP image for vectorization. The tool analyzes the image for color regions and edges. WebP photos with many colors produce complex SVGs with excessive paths — simple graphics work better." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge threshold, and path simplification. Fewer colors and higher simplification create cleaner SVG files. Preview the vectorized output to check shape accuracy." },
      { title: "3. Export as SVG", desc: "Review the vector result. Adjust settings if key features are lost or too many paths are generated. Download the SVG file — infinitely scalable and editable in vector applications like Illustrator, Figma, or Inkscape." }
    ],
    faqs: [
      { question: "Can I vectorize a photographic WebP into a clean SVG?", answer: "Photographs contain thousands of color transitions that produce SVGs with excessive overlapping paths, often larger than the original WebP. SVGs are intended for graphics with well-defined shapes and limited colors." },
      { question: "Does vectorization preserve the WebP's transparency?", answer: "Yes, the vectorization process detects transparent regions and omits them from the SVG shapes. The resulting SVG has a transparent background by default, matching the WebP's alpha channel." },
      { question: "What's the ideal WebP for vectorization?", answer: "WebP images with 2-16 distinct colors, clear edges between color regions, and minimal noise or gradients produce the best SVGs. Logos, icons, and flat illustrations are ideal candidates." }
    ]
  },
  "webp-to-bmp": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP file for conversion to BMP. The tool decodes the WebP into raw pixel data. BMP files are uncompressed, so the output will be significantly larger than the WebP source." },
      { title: "2. Choose Bit Depth", desc: "Select 24-bit BMP for standard 16.7M color output, 32-bit to preserve alpha transparency from the WebP, or 8-bit indexed for smaller files with reduced color. 32-bit is best for WebP images with transparency." },
      { title: "3. Configure and Download", desc: "BMP stores pixel data exactly as decoded. No further compression is applied. The file size equals width × height × bytes per pixel plus header. Download the BMP for use in applications requiring raw pixel access." }
    ],
    faqs: [
      { question: "Why would anyone convert WebP to BMP?", answer: "BMP is the simplest image format for direct pixel reading — no decoding libraries required. This is useful in embedded systems, legacy applications, or custom software that reads pixel data directly from file offsets." },
      { question: "Does 32-bit BMP preserve WebP's alpha perfectly?", answer: "Yes, each pixel's RGBA values from the WebP decode are written directly into the BMP. Alpha is stored in the reserved byte of the 32-bit pixel. Not all BMP readers handle alpha, but the data is there." },
      { question: "How large will a BMP from a typical WebP photo be?", answer: "A 1920x1080 WebP that's 200KB will decode to approximately 6.2MB as a 24-bit BMP (1920 × 1080 × 3 bytes). A 32-bit BMP with alpha would be about 8.3MB." }
    ]
  },
  "webp-to-tiff": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP file for conversion to TIFF. The tool decodes the WebP into pixel data and extracts available metadata. TIFF offers flexible compression options and wide software compatibility." },
      { title: "2. Choose TIFF Compression", desc: "Select LZW for lossless compression with broad software support, Deflate for better lossless compression, or no compression for instant pixel access. WebP's alpha channel is preserved in the TIFF output." },
      { title: "3. Set Bit Depth and Color Profile", desc: "TIFF supports 8 or 16-bit per channel. Embed the ICC profile if the WebP has color space information. Multi-page TIFF can combine several WebP files. Download the TIFF, ideal for professional editing workflows." }
    ],
    faqs: [
      { question: "Will converting WebP to TIFF improve image quality?", answer: "No. The decoded pixels from the WebP are stored exactly. If the WebP was lossy, those artifacts are preserved in the TIFF. TIFF provides a lossless container but cannot recover detail lost during WebP encoding." },
      { question: "Is TIFF better than WebP for print production?", answer: "Yes, TIFF is the industry standard for print. Print workflows expect TIFF with LZW compression for reliable color management and compatibility with prepress systems. WebP is not supported in most print pipelines." },
      { question: "Can I embed multiple WebP images into a single TIFF file?", answer: "Yes, TIFF supports multiple pages in one file. You can combine several WebP images into a single multi-page TIFF, useful for organizing related images or creating document archives." }
    ]
  },
  "webp-to-ico": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a square WebP image for icon conversion. Non-square images are auto-cropped to center. The tool decodes the WebP and analyzes its transparency data for icon generation." },
      { title: "2. Select Icon Sizes", desc: "Choose sizes: 16x16 through 256x256. Multi-size ICO files include all selected sizes. WebP's alpha transparency is preserved in 32-bit icon entries for each size." },
      { title: "3. Configure and Download", desc: "32-bit icons with alpha are recommended for modern Windows. Include 8-bit fallback sizes for older systems. The WebP's background removal ensures clean transparency. Download the .ico file for application and favicon use." }
    ],
    faqs: [
      { question: "Does WebP's lossy compression affect icon quality at small sizes?", answer: "Lossy WebP artifacts can become visible at small icon sizes, creating irregular edges. Using a lossless WebP source or a high-quality PNG source produces sharper small icons." },
      { question: "Can I create an icon from a non-square WebP?", answer: "ICO format is square-only. Non-square WebP images are auto-cropped from the center to create a square before generating sizes. Use the crop tool first for manual control over the crop region." },
      { question: "What's the best WebP resolution for generating a full icon set?", answer: "Upload a 256x256 or larger WebP. This resolution provides enough detail for all smaller sizes. A 512x512 lossless WebP yields the sharpest full icon set with clean edges at every size." }
    ]
  },
  "webp-to-jxl": {
    instructions: [
      { title: "1. Upload Your WebP", desc: "Upload a WebP file for conversion to JPEG XL. The tool reads the WebP's mode (lossless/lossy), color data, and alpha channel. JXL offers better compression than WebP in most scenarios." },
      { title: "2. Choose Encoding Mode", desc: "JXL's modular mode provides lossless compression, often beating WebP lossless by 15-25%. VarDCT mode provides lossy compression with quality scaling 0-100. Select based on your quality requirement." },
      { title: "3. Configure and Download", desc: "Set bit depth (8, 10, or 12-bit). Enable progressive decoding for faster previews. Preserve alpha with efficient compression. Download the .jxl file — offering state-of-the-art compression for the converted WebP content." }
    ],
    faqs: [
      { question: "Does JPEG XL really compress better than WebP for all images?", answer: "JXL typically wins for photographic content by 20-35%. For synthetic graphics, screenshots, and text-heavy images, WebP lossless often ties or slightly beats JXL. The advantage varies by image content type." },
      { question: "Can JPEG XL losslessly recompress a lossy WebP to be smaller?", answer: "No. Lossy WebP artifacts are part of the pixel data. JXL lossless mode preserves them exactly. To make the file smaller, you'd use JXL lossy mode which introduces its own compression." },
      { question: "Is JPEG XL better suited than WebP for long-term archiving?", answer: "JXL's lossless compression and robust feature set make it an excellent archival format. However, WebP has broader current ecosystem support. For archiving, consider keeping both or converting to JXL when adoption increases." }
    ]
  },
  "heic-to-jpg": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image captured from an iPhone or iPad. The tool decodes Apple's HEVC-compressed image into pixel data. HEIC files are typically 40-50% smaller than equivalent JPEGs." },
      { title: "2. Handle Alpha and Metadata", desc: "HEIC supports alpha channels, but JPEG doesn't. Choose a background color for transparent areas if present. HEIC EXIF data including depth maps and burst IDs are read for potential embedding." },
      { title: "3. Set JPEG Quality and Download", desc: "Set JPEG quality 1-100. Since HEIC efficiently compresses photos, quality 90-95 preserves most of the original detail. JPEG will be 2-3x larger than the HEIC at comparable quality. Download the universally-compatible JPEG." }
    ],
    faqs: [
      { question: "Will I lose image quality converting HEIC to JPEG?", answer: "HEIC uses HEVC compression which preserves more detail at smaller sizes. Converting to JPEG introduces JPEG's block-based artifacts. Using quality 95+ minimizes visible loss, but the HEIC file inherently has better quality-per-byte." },
      { question: "What happens to Live Photos data from my iPhone?", answer: "Live Photos consist of a HEIC image plus a video component. This conversion handles only the still image. The video portion is discarded. Use Apple's export tools to preserve Live Photo functionality." },
      { question: "Does HEIC's 10-bit color depth get preserved in JPEG?", answer: "No, JPEG supports only 8-bit per channel. HEIC's 10-bit HDR data is tonemapped to 8-bit SDR during conversion. This can result in banding in smooth gradients where HEIC had smoother transitions." }
    ]
  },
  "heic-to-png": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image from an iOS device for conversion to PNG. The tool decodes the HEVC-compressed data. PNG preserves all visible quality from the HEIC source losslessly." },
      { title: "2. Choose PNG Options", desc: "Select PNG compression level 0-9. Level 6 provides a good balance. HEIC images with large uniform areas compress well with PNG. Set bit depth — 24-bit for standard color or 32-bit if the HEIC has alpha." },
      { title: "3. Configure Transparency and Download", desc: "If converting an HEIC with alpha (from sticker apps or compositing), PNG preserves transparency perfectly. Download the PNG — file will be larger than the HEIC but universally compatible and losslessly stored." }
    ],
    faqs: [
      { question: "Why is the PNG so much larger than the HEIC file?", answer: "HEIC uses HEVC compression which is extremely efficient. PNG uses general deflate compression. A 2MB HEIC photo can become 8-12MB as PNG. This is expected — PNG trades file size for universal compatibility." },
      { question: "Can HEIC depth maps be preserved in the PNG output?", answer: "No, PNG doesn't support auxiliary image data like depth maps. The main image is converted, but portrait mode depth information, semantic masks, and camera metadata are not preserved in the PNG." },
      { question: "Is converting HEIC to PNG recommended for web use?", answer: "Not for photo-heavy websites — PNG files are too large. Use JPEG or WebP for web photos. Convert HEIC to PNG only when you need lossless preservation, transparency, or compatibility with software that doesn't support HEIC." }
    ]
  },
  "heic-to-webp": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image for conversion to WebP. The tool decodes the HEVC data. WebP offers efficient compression and broad web browser support, making it an excellent target for HEIC conversion." },
      { title: "2. Set Quality and Compression Mode", desc: "Choose lossy or lossless WebP. Lossy WebP quality 85-95 typically matches HEIC's visual quality. For photographic HEICs, lossy WebP with quality 90 provides excellent results at a manageable file size." },
      { title: "3. Configure Alpha and Metadata", desc: "If the HEIC has transparency, WebP preserves it. EXIF data from the HEIC including camera settings and GPS can be carried over. Download the WebP — optimized for web delivery with good compression." }
    ],
    faqs: [
      { question: "How does WebP compression compare to HEIC for iPhone photos?", answer: "HEIC generally achieves better compression than WebP for the same visual quality, typically 10-20% smaller. WebP is more broadly supported across browsers and platforms, so the slight size increase is often worth the compatibility." },
      { question: "Does WebP preserve HEIC's HDR tone mapping?", answer: "WebP supports HDR but with limited adoption. Standard WebP encoding tonemaps HDR to SDR, which may lose some luminance range. For HDR preservation, stay with HEIC or use AVIF which has better HDR support." },
      { question: "Will the converted WebP work on all websites and CMS platforms?", answer: "WebP is supported by 95%+ of modern browsers and most CMS platforms including WordPress, Shopify, and Squarespace. It's the most web-compatible target format for HEIC conversion." }
    ]
  },
  "heic-to-avif": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image from an Apple device. Both HEIC and AVIF use modern compression — HEIC uses HEVC, AVIF uses AV1. AVIF can provide better compression ratios for photographic content." },
      { title: "2. Set Quality Parameters", desc: "AVIF quality 0-63 (lower is better). Quality 20-30 provides comparable visual quality to HEIC. AVIF's AV1 codec handles complex textures and gradients particularly well, often beating HEIC at low bitrates." },
      { title: "3. Configure Color and HDR", desc: "AVIF supports 10/12-bit HDR. If the HEIC has HDR metadata (iPhone 12+), AVIF can preserve it. Set chroma subsampling — 4:4:4 for full color or 4:2:0 for smaller files. Download the AVIF." }
    ],
    faqs: [
      { question: "Which format is better: HEIC or AVIF?", answer: "AVIF generally offers 10-20% better compression than HEIC at equivalent quality. HEIC has better hardware encoding support on Apple devices. For cross-platform use, AVIF is more open and royalty-free." },
      { question: "Can AVIF preserve HEIC's depth map and portrait data?", answer: "AVIF supports auxiliary images, so depth maps could theoretically be preserved. However, this conversion focuses on the main image. Depth data from HEIC portrait mode shots is not currently transferred." },
      { question: "Is AVIF encoding slower than decoding HEIC?", answer: "Yes, AVIF encoding (AV1) is computationally heavier than HEVC decoding. Expect 3-8 seconds per image for encoding software. Hardware encoding support for AV1 is growing but not as widespread as HEVC." }
    ]
  },
  "heic-to-gif": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image to convert to GIF. The tool decodes the high-efficiency HEVC data. HEIC supports 16.7 million colors; GIF supports only 256 — significant palette reduction is necessary." },
      { title: "2. Reduce Color Palette", desc: "Set target palette size 2-256. For HEIC photos, use 256 colors and enable dithering to approximate the original. Floyd-Steinberg dithering produces smooth transitions but adds grain to the image." },
      { title: "3. Set Transparency and Download", desc: "GIF supports one transparent color. Select a palette color to be transparent if the HEIC had alpha. The converted GIF is suitable for web graphics and simple animations but not high-quality photo display." }
    ],
    faqs: [
      { question: "Why would I convert a high-quality HEIC photo to GIF?", answer: "GIF is useful for simple web graphics, reaction images, and scenarios where GIF format is required (forums, legacy CMS, email signatures). It's a downgrade for photo quality but necessary for compatibility." },
      { question: "How severe is the quality loss from HEIC to GIF?", answer: "HEIC photos with smooth gradients look heavily posterized as GIFs. Skin tones become blotchy and skies show visible banding. The dithering helps but adds noise. Quality loss is very noticeable on most photographs." },
      { question: "Does HEIC's high bit depth affect the palette reduction?", answer: "HEIC's 10-bit color is quantized to 8-bit first, then further reduced to the GIF palette. Each reduction step discards color information. Starting with an 8-bit HEIC output yields marginally better GIF results." }
    ]
  },
  "heic-to-svg": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image for vectorization. The tool decodes the HEVC data into pixel form. HEIC photos produce overly complex SVGs — simple graphics with limited colors work significantly better." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge detection sensitivity, and path simplification. SVG conversion applies color quantization and edge tracing to convert pixels into vector shapes and paths." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output for shape accuracy. Fine-tune settings to balance detail versus path count. Download the SVG — resolution-independent and editable in vector design software." }
    ],
    faqs: [
      { question: "Can I convert an iPhone HEIC portrait to a usable SVG?", answer: "Portrait photos contain too many colors and soft edges for clean vectorization. The SVG would be bloated with thousands of paths. Consider converting a simplified, posterized version or using an illustration-style photo." },
      { question: "Does the vectorization preserve HEIC's HDR luminance?", answer: "No, SVG is a vector format using sRGB color references. HDR luminance values from HEIC are tonemapped to standard sRGB during the pixel decoding phase before vectorization." },
      { question: "What HEIC content produces the best SVGs?", answer: "HEIC images with flat colors, clear edges, and minimal gradients — such as screenshots, diagrams, or product photos on clean backgrounds — produce the best vectorization results with manageable SVG file sizes." }
    ]
  },
  "heic-to-bmp": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image for conversion to BMP. The tool fully decodes the HEVC-compressed data into raw pixels. Expect a dramatic file size increase since BMP stores uncompressed pixel data." },
      { title: "2. Choose Bit Depth", desc: "Select 24-bit BMP for photographs, 32-bit if the HEIC has an alpha channel, or 8-bit indexed for reduced file size. 24-bit BMP will be width × height × 3 bytes plus header overhead." },
      { title: "3. Configure and Download", desc: "BMP discards all compression and stores raw RGB data. No further quality loss occurs during this step — the decoded pixels are written directly. Download the BMP for applications needing direct pixel buffer access." }
    ],
    faqs: [
      { question: "How large will a BMP from an iPhone HEIC be?", answer: "An iPhone 48MP HEIC (about 5MB) would produce a BMP of roughly 48 million pixels × 3 bytes = 144MB for 24-bit. Even a 12MP HEIC yields about 36MB BMP. Storage requirements grow dramatically." },
      { question: "Is there any quality benefit to converting HEIC to BMP?", answer: "No quality benefit. The HEIC's superior compression and HDR capability are lost. The only advantage is immediate pixel access without any decoding step in software that reads raw BMP data." },
      { question: "Can BMP preserve HEIC's HDR color information?", answer: "No, standard BMP is limited to 8-bit per channel SDR. HEIC's 10-bit HDR luminance data is tonemapped to 8-bit during decoding, losing the extended dynamic range that makes HEIC advantageous." }
    ]
  },
  "heic-to-tiff": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image for conversion to TIFF. The tool decodes the HEVC data and extracts metadata. TIFF provides a professional-grade container with flexible compression options." },
      { title: "2. Choose TIFF Compression", desc: "Select LZW compression for lossless storage with broad compatibility, Deflate for tighter lossless compression, or JPEG-in-TIFF for photographic images at smaller sizes. LZW is recommended for archival quality." },
      { title: "3. Set Bit Depth and Color Profile", desc: "HEIC's 10-bit color can be preserved in 16-bit TIFF (stored as 16-bit per channel). Embed the ICC color profile. Download the TIFF, ready for professional photography, print, and editing workflows." }
    ],
    faqs: [
      { question: "Is TIFF a better archive format than HEIC for iPhone photos?", answer: "TIFF with LZW compression is lossless and universally supported in professional software. HEIC is more storage-efficient. For long-term archives, TIFF is safer, but HEIC files preserve Apple-specific metadata better." },
      { question: "Does HEIC-to-TIFF preserve portrait mode depth data?", answer: "HEIC stores depth maps as auxiliary images. TIFF supports multi-page and auxiliary data, but this conversion focuses on the main RGB image. Depth data is not currently transferred to the TIFF output." },
      { question: "What bit depth TIFF should I use for photo editing?", answer: "Use 16-bit TIFF even though HEIC is 10-bit. The 16-bit container provides headroom for editing in Photoshop or Lightroom without banding. The extra bits remain empty but give you editing flexibility." }
    ]
  },
  "heic-to-ico": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload a square HEIC image from an iOS device for icon conversion. The tool decodes the HEIC and prepares it for multi-size icon generation. Non-square images are centered and cropped." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. HEIC images from iPhones (12MP+) provide excellent source resolution for all icon sizes. The HEIC's color reproduction is preserved in the icon." },
      { title: "3. Set Background and Download", desc: "Since HEIC-to-ICO does not inherently have icon transparency, use the background removal tool first if you need a transparent icon. Download the .ico file as an application or favicon resource." }
    ],
    faqs: [
      { question: "Can I use an iPhone HEIC photo directly as a Windows icon?", answer: "Yes, after conversion. The HEIC's high resolution provides plenty of detail for all icon sizes. iPhone photos with clean backgrounds work best as recognizable icons at small sizes." },
      { question: "Will the icon preserve the HEIC's wide color gamut?", answer: "ICO format uses standard sRGB. HEIC images captured in Display P3 color space will be converted to sRGB, potentially losing some vibrancy in highly saturated colors." },
      { question: "What aspect ratio HEIC works best for ICO conversion?", answer: "Square HEIC images produce the best icons. iPhone photos are typically 4:3 or 16:9 — they'll be cropped to square. Use the crop tool beforehand to control the framing for the icon." }
    ]
  },
  "heic-to-jxl": {
    instructions: [
      { title: "1. Upload Your HEIC File", desc: "Upload an HEIC image for conversion to JPEG XL. The tool decodes the HEVC data into pixels. JPEG XL is designed as a universal format that can outperform both HEIC and JPEG." },
      { title: "2. Choose Compression Mode", desc: "JXL offers lossless mode that preserves every pixel (typically 10-15% smaller than HEIC lossless). VarDCT lossy mode with quality 80-95 matches HEIC quality at 5-15% smaller file sizes." },
      { title: "3. Configure Advanced Options", desc: "Set bit depth to match the HEIC source (8, 10, or 12-bit). Enable progressive decoding for perceptual streaming. Preserve the alpha channel. Download the .jxl file." }
    ],
    faqs: [
      { question: "Is JPEG XL ready to replace HEIC for iPhone photos?", answer: "Not yet — iOS doesn't natively capture or export JPEG XL. Until Apple adopts JXL, HEIC remains the practical format for iPhone photos. JXL is useful for storage and processing after conversion." },
      { question: "Does JPEG XL match HEIC's compression efficiency for photos?", answer: "JXL typically matches or slightly beats HEIC in compression efficiency. A 2MB HEIC photo might be 1.7-1.9MB as JXL at the same visual quality. The advantage is modest but consistent." },
      { question: "Can JXL preserve HEIC's 10-bit HDR and wide gamut?", answer: "Yes, JPEG XL supports up to 12-bit color depth and HDR transfer functions just like HEIC. JXL also supports wider color gamuts including Rec.2020, making it a true equivalent for HDR image archival." }
    ]
  },
  "avif-to-jpg": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to JPEG. The tool decodes the AV1-compressed data. AVIF typically offers 50% better compression than JPEG, so the JPEG output will be significantly larger." },
      { title: "2. Handle Transparency", desc: "AVIF supports alpha channels; JPEG does not. Choose a background color to fill transparent areas. White is standard, but any color can be used to match your design needs." },
      { title: "3. Set JPEG Quality and Download", desc: "Set quality 1-100. To match AVIF's visual quality, use 90-95. JPEG's block-based DCT compression adds artifacts that weren't in the AVIF. Download the JPEG, optimized for maximum compatibility." }
    ],
    faqs: [
      { question: "Why did my AVIF photo quality decrease in the JPEG?", answer: "AVIF's AV1 codec handles complex textures much better than JPEG's DCT blocks. When converting to JPEG, you see blocking artifacts in gradients and noise in flat areas that AVIF handled cleanly." },
      { question: "Can I convert animated AVIF to animated JPEG?", answer: "No, JPEG doesn't support animation. Static frame conversion only. For animated AVIF, convert to GIF, WebP, or APNG which support animation sequences." },
      { question: "What JPEG quality setting best preserves AVIF's HDR tonemapping?", answer: "AVIF HDR is tonemapped to SDR during decode. Quality 95+ in JPEG preserves the tonemapped result with minimal additional loss, though the HDR luminance range is permanently gone." }
    ]
  },
  "avif-to-png": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to PNG. The tool fully decodes the AV1 data into pixels. PNG preserves all visible quality from the AVIF source without further loss." },
      { title: "2. Choose PNG Compression", desc: "Set compression level 0-9. Level 6 is recommended. AVIF images with large flat areas compress well with PNG. The alpha channel from AVIF is fully preserved in PNG's native transparency." },
      { title: "3. Set Bit Depth and Download", desc: "PNG supports 8-bit per channel. If the AVIF had 10 or 12-bit HDR, the data is tonemapped to 8-bit. Download the PNG — file will be larger than AVIF but losslessly stored." }
    ],
    faqs: [
      { question: "Does PNG preserve all the detail from the AVIF source?", answer: "Yes, the decoded pixels are stored losslessly in PNG. If the AVIF was lossy, those pixels — artifacts and all — are preserved. PNG provides a lossless container for whatever the AVIF decode produced." },
      { question: "How much larger will the PNG be compared to the AVIF?", answer: "AVIF photos typically become 3-5x larger as PNG. A 400KB AVIF photo might become 1.5-2MB as PNG. Graphics with few colors see a smaller increase since PNG handles flat areas efficiently." },
      { question: "Is PNG a good archive format for AVIF-converted images?", answer: "PNG is excellent for archival since it's lossless and universally supported. However, the file size penalty is significant. Consider keeping the original AVIF and converting only when PNG compatibility is needed." }
    ]
  },
  "avif-to-webp": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to WebP. The tool decodes the AV1-compressed data. Both are modern formats, but WebP has broader browser support while AVIF often compresses better." },
      { title: "2. Choose Quality and Mode", desc: "Select lossy or lossless WebP. For AVIF photos converted to lossy WebP, quality 85-95 matches well. WebP's compression is less efficient than AVIF, so expect slightly larger files at equivalent quality." },
      { title: "3. Configure Alpha and Metadata", desc: "AVIF's alpha channel transfers directly to WebP transparency. EXIF and XMP metadata from the AVIF can be embedded. Download the WebP for broader compatibility across browsers and CMS platforms." }
    ],
    faqs: [
      { question: "Which is better: AVIF or WebP for my converted image?", answer: "AVIF offers 25-35% better compression than WebP for photographs. WebP has 95%+ browser support versus AVIF's ~85%. The choice depends on whether file size or maximum compatibility is your priority." },
      { question: "Does WebP preserve AVIF's 10-bit color depth?", answer: "WebP supports 8-bit only in standard implementations. AVIF's 10 or 12-bit HDR data is tonemapped to 8-bit SDR during conversion. The extended luminance and color information from the AVIF is lost." },
      { question: "Why would I convert AVIF to WebP if AVIF compresses better?", answer: "Compatibility. Some CDNs, advertising platforms, and email clients don't support AVIF but do support WebP. Converting gives you reach at the cost of slightly larger files." }
    ]
  },
  "avif-to-heic": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to HEIC. Both formats use modern compression — AVIF uses AV1, HEIC uses HEVC. The tool decodes AVIF and re-encodes to HEVC." },
      { title: "2. Set HEIC Quality", desc: "Quality 0.0-1.0. A setting of 0.8-0.9 matches most AVIF compression levels. HEIC and AVIF have similar compression efficiency for photographic content, so file sizes remain comparable." },
      { title: "3. Configure Alpha and Metadata", desc: "HEIC supports alpha channels. Transfer AVIF's transparency and metadata. Download the HEIC file for better compatibility with Apple ecosystem devices and applications." }
    ],
    faqs: [
      { question: "Is HEIC or AVIF better for photography?", answer: "AVIF offers slightly better compression and is royalty-free (no patent licensing). HEIC benefits from hardware encoding in Apple devices. For cross-platform use, AVIF is more open; for Apple-only workflows, HEIC is native." },
      { question: "Will the HEIC output be the same size as the AVIF source?", answer: "Generally yes — both use comparable modern compression. AVIF may be 5-10% smaller on average due to AV1's efficiency edge, but the difference is minor compared to the leap from JPEG." },
      { question: "Does this conversion preserve AVIF's HDR metadata?", answer: "Both formats support HDR. HEIC supports 10-bit HDR similar to AVIF, so HDR metadata and luminance ranges can be preserved in the conversion. Verify with a small test file first." }
    ]
  },
  "avif-to-svg": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for vectorization. The tool decodes the AV1 data to pixels. AVIF photos produce SVGs with excessive paths — simple graphics with few colors yield better results." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge detection threshold, and path simplification. The tool applies color quantization and edge tracing to convert the raster pixels to vector shapes." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output for accuracy. Fine-tune settings to balance detail and file size. Download the SVG — resolution-independent and ready for editing in Figma, Illustrator, or Inkscape." }
    ],
    faqs: [
      { question: "What AVIF content makes the best SVGs?", answer: "AVIF images with 2-16 colors, sharp edges, and minimal noise. Screenshots saved as AVIF, flat-vector art, or diagrams with clear boundaries between color regions produce clean SVGs." },
      { question: "Does the vectorization preserve AVIF's alpha transparency?", answer: "Yes, the vectorization detects transparent regions and excludes them from the SVG output. The resulting SVG has a transparent background by default." },
      { question: "Can I get a vector-quality SVG from an AVIF photo?", answer: "Photographs contain continuous tones and soft edges that cannot be represented efficiently as vectors. The SVG will be large, complex, and visually inferior to the original raster image." }
    ]
  },
  "avif-to-bmp": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to BMP. The tool decodes the AV1 data into raw pixel data. BMP files are uncompressed — expect significant file size increase." },
      { title: "2. Choose Bit Depth", desc: "24-bit BMP for standard color, 32-bit BMP to preserve alpha channel from AVIF. 8-bit indexed for smaller file size with color reduction. 32-bit is best if the AVIF has transparency." },
      { title: "3. Configure and Download", desc: "BMP stores pixel data as raw RGB(A). File size equals dimensions × bytes per pixel. No compression means instant access. Download for embedded systems or software requiring direct pixel buffers." }
    ],
    faqs: [
      { question: "Why would a modern AVIF be converted to an archaic BMP?", answer: "BMP is used in embedded systems, boot loaders, medical imaging software, and legacy applications that read pixel data directly from file offsets without any decoding library." },
      { question: "How large will a BMP from an AVIF source be?", answer: "A 3840x2160 (4K) AVIF of about 1-2MB becomes roughly 24.9MB as 24-bit BMP (3840 × 2160 × 3). A 32-bit BMP with alpha would be about 33.2MB." },
      { question: "Does BMP preserve AVIF's full color accuracy?", answer: "Yes, the decoded pixel values are written exactly. However, if the AVIF was 10-bit HDR, the tonemapping to 8-bit (BMP's maximum) loses color resolution and luminance range." }
    ]
  },
  "avif-to-tiff": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to TIFF. The tool decodes the AV1 data and extracts available metadata. TIFF provides a flexible, professional-grade container." },
      { title: "2. Choose Compression and Bit Depth", desc: "Select LZW compression for lossless storage with broad software support. Set bit depth — 8 or 16-bit per channel. 16-bit preserves headroom from AVIF's 10-bit source when tonemapped." },
      { title: "3. Configure Color Profile and Download", desc: "Embed the ICC color profile from the AVIF source. TIFF supports multi-page files if you want to combine multiple AVIF images. Download the TIFF for professional editing workflows." }
    ],
    faqs: [
      { question: "Is TIFF the best format for editing AVIF-converted photos?", answer: "Yes, TIFF with 16-bit depth gives you maximum editing headroom in professional software. AVIF's efficient compression is traded for the editing flexibility that TIFF provides." },
      { question: "Should I use JPEG-in-TIFF or uncompressed TIFF for AVIF photos?", answer: "JPEG-in-TIFF re-compresses the photo with JPEG, causing generation loss. Use LZW or uncompressed TIFF to avoid introducing new artifacts on top of the AVIF source." },
      { question: "What TIFF features are lost when converting from AVIF?", answer: "AVIF supports HDR gain maps and auxiliary images which TIFF doesn't natively handle in standard workflows. The main image converts, but advanced AVIF features are not transferred." }
    ]
  },
  "avif-to-gif": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to GIF. The tool decodes the AV1 data, then performs heavy color reduction. AVIF's millions of colors must be reduced to GIF's 256-color palette." },
      { title: "2. Set Palette and Dithering", desc: "Choose palette size 2-256. For AVIF photos, use 256 colors with dithering. Floyd-Steinberg, Stucki, or Atkinson dithering algorithms offer different noise patterns. Enable dithering to soften banding." },
      { title: "3. Set Transparency and Download", desc: "Select one palette color as transparent if needed. GIF supports only binary transparency. Download the GIF — suitable for simple graphics but a major quality reduction from the AVIF source." }
    ],
    faqs: [
      { question: "Why would I downgrade a high-quality AVIF to GIF?", answer: "GIF compatibility is needed for certain forums, legacy CMS platforms, email newsletters, and applications that accept only GIF format. It's a necessary step when compatibility requirements dictate the format." },
      { question: "How noticeable is the quality loss from AVIF to GIF?", answer: "Very noticeable. Smooth gradients posterize, fine color details vanish, and the dithering pattern adds visible noise. AVIF's clean HDR-tonemapped image becomes a flat 256-color approximation." },
      { question: "Can GIF preserve AVIF's alpha transparency correctly?", answer: "Partially. AVIF's smooth alpha edges become hard on/off transparency in GIF. Semi-transparent pixels become either fully opaque or fully transparent, creating jagged edges around formerly smooth alpha transitions." }
    ]
  },
  "avif-to-ico": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for icon conversion. The tool decodes the AV1 data and prepares it for multi-size icon generation. AVIF images with high resolution work best for comprehensive icon sets." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. The AVIF source should be at least 256x256 for best results. Each size is independently generated, preserving as much detail as the pixel count allows." },
      { title: "3. Handle Background and Download", desc: "AVIF's alpha channel is preserved in 32-bit icon entries. For solid icons, generate without transparency. Download the .ico file containing all selected size entries." }
    ],
    faqs: [
      { question: "Does AVIF's superior compression make it a good icon source?", answer: "Yes, AVIF can store high-quality source images at small file sizes, though the compression is irrelevant after conversion. The key advantage is that AVIF can preserve detailed source imagery for downscaling." },
      { question: "Can I create favicons from AVIF screenshots?", answer: "Yes. AVIF screenshots with clean UI elements and sharp edges make good favicons after conversion. The AVIF format captures screen content efficiently without JPEG-like blurring." },
      { question: "What AVIF resolution gives the best icon set quality?", answer: "512x512 or higher AVIF source. Since AVIF compresses so well, even very high resolution sources are small files. The extra source pixels help create sharper 256x256 and 128x128 icon sizes." }
    ]
  },
  "avif-to-jxl": {
    instructions: [
      { title: "1. Upload Your AVIF File", desc: "Upload an AVIF image for conversion to JPEG XL. Both are next-generation formats — AVIF uses AV1, JXL uses its own modular codec. The tool decodes AVIF and re-encodes to JXL." },
      { title: "2. Choose JXL Mode", desc: "Lossless mode preserves all AVIF-decoded pixels, typically with 5-10% better compression than AVIF lossless. VarDCT lossy mode with quality 80-95 matches AVIF visually at comparable or better file sizes." },
      { title: "3. Configure Advanced Options", desc: "Set bit depth (8, 10, or 12-bit). Enable progressive decoding for streaming. Preserve alpha channel with efficient compression. Download the .jxl file." }
    ],
    faqs: [
      { question: "Which is the better format: AVIF or JPEG XL?", answer: "Both are excellent. AVIF has better industry adoption and browser support. JPEG XL offers slightly better lossless compression and faster encoding. For web use today, AVIF is more practical." },
      { question: "Does JPEG XL support all AVIF features?", answer: "JXL supports most features including HDR, alpha, and up to 12-bit color. AVIF's gain map HDR and auxiliary images (depth, alpha planes) don't have direct JXL equivalents." },
      { question: "Can I get lossless recompression from AVIF to JXL?", answer: "No — lossless JXL preserves the decoded pixel data, which includes AVIF's lossy artifacts. It doesn't recover data lost during AVIF encoding. The JXL output is pixel-identical to the AVIF decode." }
    ]
  },
  "svg-to-png": {
    instructions: [
      { title: "1. Upload Your SVG File", desc: "Upload a Scalable Vector Graphic file. The tool parses the SVG XML and renders it at a specified resolution. SVGs with CSS styles, embedded fonts, and complex filters are supported." },
      { title: "2. Set Output Dimensions", desc: "Enter the desired PNG width and height in pixels. SVG is resolution-independent, so you can render at any size without quality loss. Choose from presets like social media sizes or print DPI." },
      { title: "3. Configure Background and Download", desc: "Choose a background color or leave it transparent. The SVG viewBox determines the visible area. Download the PNG at your specified resolution, preserving all vector detail in raster form." }
    ],
    faqs: [
      { question: "Will the PNG be sharp at any size from an SVG source?", answer: "Yes, SVGs scale to any resolution without pixelation. A 24x24 icon SVG can render to a 1024x1024 PNG with perfectly sharp edges since the vector data is recalculated at the target resolution." },
      { question: "What happens to SVG effects like blur and drop shadows in PNG?", answer: "SVG filter effects are rendered into the PNG pixels. Blurs, shadows, gradients, and masks are all rasterized. The PNG captures exactly what the SVG would display in a browser." },
      { question: "Does text in the SVG become editable in the PNG?", answer: "No, the SVG text is rendered as raster pixels. If you need editable text, keep the original SVG. The PNG captures the visual appearance only, including all fonts rendered at the specified size." }
    ]
  },
  "svg-to-jpg": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG vector file for conversion to JPEG. The tool rasterizes the vector at your chosen resolution. Since SVG is resolution-independent, you can generate JPEGs at any size." },
      { title: "2. Set Dimensions and Background", desc: "Enter width and height in pixels. SVG supports transparency, but JPEG doesn't. Choose a background color — white is standard. The SVG renders onto the background color, then JPEG compression is applied." },
      { title: "3. Set JPEG Quality and Download", desc: "Quality 1-100. For vector graphics, use quality 90+ to avoid visible artifacts around sharp vector edges. JPEG compression adds blurring along crisp lines that were perfectly sharp in the SVG." }
    ],
    faqs: [
      { question: "Why does my SVG's sharp edges look blurry in the JPEG?", answer: "JPEG compression creates artifacts around high-contrast edges. SVG's mathematically perfect lines become softened by the DCT quantization process. Higher quality settings reduce this effect." },
      { question: "Can I preserve SVG gradients without banding in JPEG?", answer: "JPEG handles smooth gradients better than GIF but may still show subtle banding at low quality settings. Use quality 95+ for gradient-heavy SVGs to minimize visible transitions." },
      { question: "What JPEG size should I use for printing SVG artwork?", answer: "Calculate based on print DPI. For 300 DPI at 8x10 inches, set dimensions to 2400x3000 pixels. The SVG will render at full sharpness at that resolution." }
    ]
  },
  "svg-to-avif": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG file for conversion to AVIF. The tool rasterizes the SVG to pixels then encodes with AV1. This gives you a highly compressed raster version of your vector graphic." },
      { title: "2. Set Raster Dimensions", desc: "Define output width and height. Since SVG is vector, you can render at any size. For web use, render at the display size to avoid unnecessary large files." },
      { title: "3. Choose AVIF Quality and Download", desc: "Set quality 0-63. Even at moderate quality, AV1 handles vector-rasterized content well, preserving sharp edges better than JPEG. Download the AVIF — significantly smaller than PNG from the same SVG." }
    ],
    faqs: [
      { question: "Is AVIF better than PNG for rasterized SVGs on the web?", answer: "AVIF is typically 60-70% smaller than PNG for the same visual quality. For SVGs with gradients and colors, AVIF's compression is highly efficient. PNG is still better for screenshots with text." },
      { question: "Does the SVG's alpha transparency survive AVIF conversion?", answer: "Yes, AVIF supports alpha channels. The SVG's transparent areas are preserved in the AVIF output, making it suitable for overlay graphics and icons." },
      { question: "Why not just use the SVG directly instead of converting to AVIF?", answer: "Some platforms and applications don't support SVG rendering. Converting to AVIF provides a smaller file than PNG while maintaining visual fidelity, useful when SVG cannot be used directly." }
    ]
  },
  "svg-to-gif": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG vector file. The tool rasterizes the SVG at the dimensions you choose. Simple SVGs with flat colors convert better to GIF than those with gradients and complex effects." },
      { title: "2. Set Size and Color Reduction", desc: "Rasterize at your target dimensions first. Then reduce colors to GIF's 256-color limit. Set palette size (2-256). Enable dithering for smoother appearance. Simple icon SVGs at 64 colors look nearly identical." },
      { title: "3. Set Transparency and Download", desc: "SVG transparency maps to a single transparent color in GIF. Download the GIF — suitable for simple web graphics where GIF format is required." }
    ],
    faqs: [
      { question: "Will SVG gradients look good as GIF?", answer: "No. SVG smooth gradients reduce to visible color bands in GIF. The 256-color limit strips away subtle gradient transitions. For gradient-heavy SVGs, PNG or JPEG are better rasterization targets." },
      { question: "What SVG content is ideal for GIF conversion?", answer: "Flat-color icons, monochrome logos, simple illustrations, and graphics with under 50 unique colors. SVGs designed for print with many color blends will lose significant quality." },
      { question: "Can I animate an SVG to GIF?", answer: "This tool converts static SVGs to static GIFs. For animated SVGs (SMIL animations), you'd need to capture each animation frame separately and combine them into an animated GIF." }
    ]
  },
  "svg-to-webp": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG vector file. The tool rasterizes it at your chosen dimensions. SVG preserves quality at any scale, making it flexible for WebP generation at any resolution." },
      { title: "2. Set Output Dimensions", desc: "Enter target width and height. Render at the exact display size for optimal file size. WebP supports both lossy and lossless modes for the rasterized SVG." },
      { title: "3. Choose Mode and Download", desc: "Lossless WebP preserves the rasterized SVG exactly with better compression than PNG. Lossy WebP offers even smaller files. Both preserve SVG transparency. Download the WebP." }
    ],
    faqs: [
      { question: "Should I use lossless or lossy WebP for SVG conversion?", answer: "Lossless WebP is recommended for SVGs with sharp edges, text, and logos. Lossy WebP may blur fine vector details. For photographic-quality SVGs with gradients, lossy WebP at high quality works well." },
      { question: "Is WebP more efficient than PNG for rasterized SVGs?", answer: "Yes, WebP lossless is typically 25-35% smaller than PNG for the same SVG rasterization. Lossy WebP can be 60-70% smaller with minimal visual difference." },
      { question: "What resolution should I rasterize SVG for WebP?", answer: "Rasterize at the exact display resolution. Since SVG is vector, rendering at 2x (Retina) gives you the flexibility to serve high-density displays. A 100px logo SVG at 200px gives crisp Retina output." }
    ]
  },
  "svg-to-heic": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG vector file for conversion to HEIC. The tool rasterizes the vector data into pixels. HEIC's HEVC compression is efficient for rasterized vector graphics with photographic qualities." },
      { title: "2. Set Raster Dimensions", desc: "Enter the target output dimensions. SVG renders at any size without quality loss. For Apple ecosystem use, render at the device's native resolution." },
      { title: "3. Set Quality and Download", desc: "HEIC quality 0.0-1.0. Quality 0.8 provides excellent results. HEIC preserves transparency from the SVG. Download for use in iOS/macOS applications that prefer HEIC format." }
    ],
    faqs: [
      { question: "Why convert SVG to HEIC instead of keeping the vector?", answer: "Some iOS/macOS applications and APIs handle HEIC natively but not SVG. Converting to HEIC allows you to use vector-originated graphics in Apple-specific workflows." },
      { question: "Does HEIC preserve SVG's sharp vector edges?", answer: "HEIC's compression is designed for photographic content, not sharp vector edges. It may introduce slight softness around crisp lines. Lossless HEIC avoids this but produces larger files." },
      { question: "Can SVG's embedded raster images be preserved in HEIC?", answer: "SVG can embed base64-encoded raster images. These are rasterized as part of the SVG rendering. The HEIC captures the fully rendered composite, not the original embedded elements." }
    ]
  },
  "svg-to-bmp": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG file for BMP conversion. The tool renders the vector at your chosen resolution into raw pixel data. BMP provides uncompressed storage of the rasterized vector." },
      { title: "2. Set Output Resolution", desc: "Enter exact pixel dimensions. Since BMP is uncompressed, choose the smallest acceptable size. A 1000x1000 BMP from an SVG will be approximately 3MB (24-bit) regardless of SVG complexity." },
      { title: "3. Choose Bit Depth and Download", desc: "24-bit BMP for full color, 32-bit to preserve SVG transparency, or 8-bit indexed for smaller files. Download the BMP for applications requiring uncompressed raster data." }
    ],
    faqs: [
      { question: "What's the point of SVG to BMP if SVG is vector?", answer: "BMP's uncompressed format is useful for systems that cannot render SVG — embedded displays, boot screens, custom hardware, and legacy applications." },
      { question: "Does the BMP capture all SVG effects like filters and masks?", answer: "Yes, the SVG is fully rendered into the BMP just as a browser would display it. Every filter, mask, gradient, and opacity effect is rasterized into the final pixel output." },
      { question: "How large can an SVG-to-BMP output get?", answer: "BMP size depends only on resolution, not SVG complexity. A 4K SVG (3840x2160) becomes 24.9MB as 24-bit BMP. Complex SVGs don't increase the BMP size — only pixel count matters." }
    ]
  },
  "svg-to-tiff": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG file for conversion to TIFF. The tool renders the vector at your chosen resolution. TIFF provides a professional container for the rasterized output." },
      { title: "2. Set Dimensions and Compression", desc: "Enter target resolution. Select TIFF compression — LZW for lossless storage with wide compatibility, or no compression for instant access. Avoid JPEG-in-TIFF since it adds artifacts to vector content." },
      { title: "3. Set Bit Depth and Download", desc: "8-bit TIFF for simple graphics, 24-bit for full color, or 32-bit to preserve SVG's transparency. Embed ICC color profile. Download the TIFF for professional publishing workflows." }
    ],
    faqs: [
      { question: "Is TIFF better than PNG for SVG rasterization in print?", answer: "Yes, TIFF is the print industry standard. Print shops expect TIFF with LZW compression and embedded ICC profiles. PNG works but may not be accepted by all prepress systems." },
      { question: "Can I embed multiple SVG versions in one TIFF page?", answer: "No, each SVG is rendered as a single image. But you can create a multi-page TIFF by rendering different sizes or versions of the SVG into separate pages of one TIFF file." },
      { question: "What DPI should I use when rendering SVG to TIFF for print?", answer: "Convert your print dimensions to pixels at 300 DPI minimum. An 8-inch wide SVG at 300 DPI needs 2400 pixels width. For high-quality art prints, use 600 DPI." }
    ]
  },
  "svg-to-ico": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG vector file for conversion to a Windows icon. SVG's vector nature makes it an excellent source for generating crisp icons at all sizes." },
      { title: "2. Set Icon Sizes", desc: "Select from 16x16 to 256x256. Since SVG is vector, every size renders sharply without pixelation. This is the key advantage of starting from an SVG — no lossy upscaling needed." },
      { title: "3. Configure and Download", desc: "SVG transparency is preserved in 32-bit icon entries. Include multiple sizes for Windows to choose the best fit. Download the .ico file with perfectly crisp icons at every resolution." }
    ],
    faqs: [
      { question: "Why is SVG the best source format for ICO conversion?", answer: "SVG renders perfectly at every icon size without aliasing or pixelation. Unlike raster sources that blur when downscaled, SVG produces mathematically perfect 16x16 icons with crisp edges." },
      { question: "Do I need to worry about icon size limits with SVG sources?", answer: "No. A single SVG can generate a 256x256 icon, a 16x16 icon, and everything in between with identical quality. Set all sizes to get a comprehensive icon set in one ICO file." },
      { question: "Will complex SVG gradients look good at small icon sizes?", answer: "Gradients and details that are visible at 256x256 may become muddy at 16x16. Consider simplifying the SVG for icon use — thick stroke widths and high contrast colors work best at small sizes." }
    ]
  },
  "svg-to-jxl": {
    instructions: [
      { title: "1. Upload Your SVG", desc: "Upload an SVG file for conversion to JPEG XL. The SVG is rasterized at your chosen resolution, then encoded with JXL's efficient compression." },
      { title: "2. Set Rasterization Resolution", desc: "Enter the target dimensions. Since SVG is vector, render at the exact usage size. JXL's modular mode provides lossless encoding of the rasterized SVG." },
      { title: "3. Configure and Download", desc: "Lossless JXL preserves every pixel of the rasterized SVG. VarDCT lossy mode offers smaller files if you need extreme compression. Alpha transparency is preserved. Download the .jxl file." }
    ],
    faqs: [
      { question: "Is JXL a good format for storing rasterized SVGs?", answer: "Yes, JXL's lossless mode matches PNG for quality while providing 15-25% better compression. For SVGs with solid colors, JXL's compression is particularly effective." },
      { question: "Does JXL preserve SVG's transparency and sharp edges?", answer: "Yes, JXL supports full alpha transparency. Its modular mode handles sharp vector edges without the artifacts that lossy codecs introduce, making it excellent for rasterized vector storage." },
      { question: "What advantages does JXL have over PNG for SVG rasterization?", answer: "JXL achieves smaller file sizes than PNG at the same quality, supports higher bit depths for print work, and offers progressive decoding for faster image preview during loading." }
    ]
  },
  "gif-to-jpg": {
    instructions: [
      { title: "1. Upload Your GIF File", desc: "Upload a GIF file for conversion to JPEG. If the GIF is animated, only the first frame is converted. The tool reads the GIF's color palette and transparency information." },
      { title: "2. Handle Transparency and Palette", desc: "GIF supports only 256 colors and binary transparency. Choose a background color for transparent areas. The posterization from GIF's limited palette becomes fixed in the JPEG output." },
      { title: "3. Set JPEG Quality and Download", desc: "Set quality 1-100. Quality 85 is recommended. JPEG compression will add artifacts on top of GIF's color banding and dithering. Download the JPEG — file size will be similar to or larger than the GIF." }
    ],
    faqs: [
      { question: "Will the JPEG quality be limited by the GIF's 256 colors?", answer: "Yes. The JPEG will encode the GIF's posterized colors, making banding and dithering patterns permanent. JPEG compression may soften the dithering pattern but won't restore smooth color transitions." },
      { question: "What happens to GIF animation when converting to JPEG?", answer: "Only the first frame of an animated GIF is converted. The remaining frames are discarded. For video-like content, extract frames individually or use a video conversion tool instead." },
      { question: "Why does my GIF look worse after JPEG conversion?", answer: "GIF's limited palette creates a specific look (posterization, dithering). JPEG adds compression artifacts and chroma subsampling on top, creating a combination of artifacts from both formats." }
    ]
  },
  "gif-to-png": {
    instructions: [
      { title: "1. Upload Your GIF File", desc: "Upload a GIF file for conversion to PNG. The tool extracts the GIF's first frame (or all frames for sprite sheets). PNG preserves the exact pixel data from the GIF." },
      { title: "2. Choose Frame Selection", desc: "For animated GIFs, select which frame to convert or extract all frames as individual PNGs. Each frame isexported as a separate PNG file." },
      { title: "3. Set Compression and Download", desc: "PNG compression level 0-9. GIF's 256 colors compress well with PNG since the limited palette creates large identical-color areas. Download the PNG — the file will be larger than the GIF but losslessly preserved." }
    ],
    faqs: [
      { question: "Will converting GIF to PNG improve the color quality?", answer: "No. PNG preserves the GIF's existing 256-color palette without improvement. The posterization and dithering from the GIF remain exactly the same. PNG stores the same pixels in a more widely-compatible container." },
      { question: "Is PNG better than GIF for animated content?", answer: "For static frames extracted from a GIF, PNG is excellent. For animations, use APNG instead of GIF. A static frame saved as PNG from an animated GIF is lossless and widely compatible." },
      { question: "Can GIF's single-color transparency be preserved in PNG?", answer: "Yes, and PNG improves on it. GIF's binary transparency becomes full alpha channel transparency in PNG. The hard transparent edge from GIF becomes the same in PNG but can be softened if you edit afterward." }
    ]
  },
  "gif-to-webp": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload an animated or static GIF file for conversion to WebP. The tool extracts all frames from animated GIFs. WebP supports both static and animated output with better compression." },
      { title: "2. Set Quality and Mode", desc: "Choose lossy or lossless WebP. For animated GIFs, lossy WebP dramatically reduces file size while maintaining good visual quality. Quality 80-90 for lossy, or use lossless to preserve GIF's exact appearance." },
      { title: "3. Configure Animation and Download", desc: "Frame timing from the GIF is preserved in animated WebP. WebP supports 24-bit color versus GIF's 256, but the conversion can't restore lost color information. Download the WebP — significantly smaller than the original GIF." }
    ],
    faqs: [
      { question: "How much smaller will my animated GIF be as WebP?", answer: "Animated WebP is typically 40-60% smaller than the equivalent GIF animation. For animations with large uniform areas, the savings are even more dramatic. A 5MB GIF animation might become 2MB as WebP." },
      { question: "Does WebP preserve GIF's frame timing exactly?", answer: "Frame delays are preserved as closely as possible. WebP supports millisecond-precision timing while GIF is limited to 10ms increments. Very fast GIF animations may play smoother as WebP." },
      { question: "Can I convert only a portion of a GIF animation to WebP?", answer: "This tool converts the entire animation. To select specific frame ranges, use the GIF editor first to trim frames, then convert the trimmed GIF to WebP." }
    ]
  },
  "gif-to-avif": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for conversion to AVIF. The tool extracts the first frame from animated GIFs. AVIF offers superior compression but currently handles static images in this converter." },
      { title: "2. Set Quality Parameters", desc: "AVIF quality 0-63. GIF's 256-color palette will be encoded with AV1's efficient compression. Quality 25-35 provides excellent results. The limited GIF palette becomes a compact AVIF file." },
      { title: "3. Configure and Download", desc: "AVIF supports alpha transparency. GIF's single-color transparency maps to AVIF's full alpha channel. Download the AVIF — significantly smaller than the original GIF with the same visual appearance." }
    ],
    faqs: [
      { question: "Does AVIF handle GIF's limited palette efficiently?", answer: "Yes, AV1's compression handles flat color areas extremely well. A GIF with large uniform colored regions becomes a very compact AVIF file since the encoder efficiently represents repeated pixel values." },
      { question: "Can I convert an animated GIF to animated AVIF?", answer: "Animated AVIF is supported by the specification but not widely used. This converter handles static output. For animation preservation, convert animated GIFs to animated WebP instead." },
      { question: "Will AVIF's compression reveal GIF dithering patterns more?", answer: "AV1 may sharpen or emphasize GIF dithering patterns during compression. If the dithering looks worse, increase quality to 40+ or pre-process the GIF to smooth the dithering before conversion." }
    ]
  },
  "gif-to-heic": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for conversion to HEIC. The tool decodes the GIF and re-encodes to HEVC. HEIC provides modern compression for GIF's limited-palette content." },
      { title: "2. Set HEIC Quality", desc: "Set quality 0.0-1.0. A value of 0.7-0.8 provides excellent quality. HEIC's HEVC compression handles the GIF's flat color regions and sharp edges efficiently." },
      { title: "3. Configure and Download", desc: "GIF transparency is preserved in HEIC's alpha channel. Since GIF is animated, only the first frame converts. Download the HEIC for use in Apple ecosystem applications." }
    ],
    faqs: [
      { question: "Why convert a low-color GIF to HEIC?", answer: "HEIC compatibility with iOS/macOS workflows. If you're using GIF-based graphics in an Apple-centric environment, HEIC provides native support with better compression for storage efficiency." },
      { question: "Does HEIC improve the visual quality of the converted GIF?", answer: "No, HEIC preserves the GIF's 256-color posterized appearance. The conversion is pixel-exact from the decoded GIF data. No color information is added or restored." },
      { question: "Can HEIC store multiple GIF frames as an animation?", answer: "HEIC supports image sequences, but this converter handles single-frame output. Use separate conversion for each frame or keep the animated GIF for multi-frame content." }
    ]
  },
  "gif-to-svg": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for vectorization to SVG. The tool extracts the first frame and analyzes its colors and edges. Simple GIFs with few colors and clear shapes produce the best SVGs." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-256), edge detection sensitivity, and path simplification. Since GIF already has a limited palette, the quantization step is minimal. Set the color count to match or reduce the GIF's palette." },
      { title: "3. Preview and Export SVG", desc: "Review the vectorized output. Check that key shapes were captured accurately. Download the SVG — resolution-independent and much smaller than the GIF for simple graphics." }
    ],
    faqs: [
      { question: "Does GIF's transparency vectorize well to SVG?", answer: "Yes, GIF's binary transparent areas are detected and excluded from the vector shapes. The resulting SVG has a natural transparent background matching the GIF's transparent regions." },
      { question: "What GIF content produces the best SVG results?", answer: "GIFs with solid color blocks, sharp edges, and minimal dithering produce clean SVGs. Dithering patterns confuse the edge detection and result in noisy vector paths with many small shapes." },
      { question: "Can I vectorize an animated GIF to SVG?", answer: "Only the first frame is vectorized. SVG supports SMIL animation but this converter produces a single-frame static SVG from the GIF's first frame." }
    ]
  },
  "gif-to-bmp": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for conversion to BMP. The tool decodes the GIF's LZW-compressed data into raw pixels. BMP stores the data uncompressed, so the output is larger." },
      { title: "2. Choose Bit Depth", desc: "GIF uses 8-bit indexed color. Convert to 24-bit BMP for full RGB conversion, or 8-bit BMP to preserve the GIF's original palette structure. 24-bit BMP removes the indexed limitation." },
      { title: "3. Configure and Download", desc: "BMP stores the GIF's pixel data without further compression. Transparency from the GIF is preserved in 32-bit BMP. Download the BMP for applications needing direct pixel buffer access." }
    ],
    faqs: [
      { question: "Will BMP from GIF have better color than the original GIF?", answer: "No, the BMP stores the same 256 colors from the GIF. Even if you choose 24-bit BMP, the pixels are the same indexed colors converted to RGB — no new colors are added." },
      { question: "Why does my 24-bit BMP from a GIF still look posterized?", answer: "The posterization is inherent in the GIF's pixel data. Choosing 24-bit BMP doesn't interpolate or smooth the colors — it just stores the same palette-mapped colors in a 24-bit format." },
      { question: "How large will a BMP from a typical GIF be?", answer: "GIF's LZW compression is very efficient for its limited palette. A 500x500 GIF at 50KB becomes approximately 750KB as 24-bit BMP (500 × 500 × 3 bytes)." }
    ]
  },
  "gif-to-tiff": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for conversion to TIFF. The tool decodes the GIF and packages the pixel data into a TIFF container. TIFF offers flexible archival storage." },
      { title: "2. Choose Compression and Bit Depth", desc: "LZW compression is compatible and effective for GIF-source content. Deflate offers slightly better compression. 8-bit TIFF preserves the GIF's indexed color structure, while 24-bit converts to full RGB." },
      { title: "3. Configure and Download", desc: "TIFF can store the GIF's transparency information. Multiple GIF frames can be placed as separate TIFF pages. Download the TIFF for archival or professional use." }
    ],
    faqs: [
      { question: "Is TIFF a good archive format for GIF content?", answer: "Yes, TIFF with LZW compression preserves all GIF data in a widely-supported archival format. For long-term storage of GIF-based graphics that may be re-edited, TIFF is recommended." },
      { question: "Can a multi-frame GIF become a multi-page TIFF?", answer: "Yes, the tool can place each GIF frame as a separate page in the TIFF file. This preserves the frame sequence while converting to a format more suitable for document archiving." },
      { question: "Does TIFF improve on GIF's color limitations?", answer: "No, TIFF stores the same pixel data. The GIF's 256-color posterization remains. TIFF's advantage is in its robust metadata support and professional ecosystem compatibility." }
    ]
  },
  "gif-to-ico": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for icon conversion. The tool extracts the first frame and analyzes it for transparency. GIF images with simple shapes and transparent backgrounds produce the best icons." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. GIF source resolution should be at least 128x128 for decent results. The limited palette of GIF becomes the color basis for all icon sizes." },
      { title: "3. Configure and Download", desc: "GIF transparency maps to 32-bit icon alpha. The posterized GIF colors may look blocky at small sizes. Download the .ico file for use as an application or favicon resource." }
    ],
    faqs: [
      { question: "Are GIFs good sources for icon conversion?", answer: "Fair, but not ideal. GIF's 256 colors and potential dithering can make small icons look noisy. PNG or SVG sources produce cleaner icons. GIF works best for iconizing simple cartoon graphics." },
      { question: "Will the icon preserve GIF's animation?", answer: "No, only the first frame is used. ICO format is static only. If you need an animated icon, consider using a different approach like a video-based application icon." },
      { question: "How does GIF's transparency affect the icon?", answer: "GIF's binary transparency converts directly to icon alpha. Where the GIF was transparent, the icon will be transparent. The hard edges of GIF transparency become the icon's visible boundary." }
    ]
  },
  "gif-to-jxl": {
    instructions: [
      { title: "1. Upload Your GIF", desc: "Upload a GIF file for conversion to JPEG XL. The tool decodes the GIF and re-encodes to JXL format. JXL offers modern compression that can reduce file size while preserving quality." },
      { title: "2. Choose JXL Mode", desc: "Lossless mode preserves the GIF's exact pixels with better compression than GIF. VarDCT lossy mode offers even smaller files by exploiting JXL's superior encoding for flat-color content." },
      { title: "3. Configure and Download", desc: "GIF transparency transfers to JXL's alpha channel. Set bit depth to match your needs. Download the .jxl file — smaller and more feature-rich than the original GIF." }
    ],
    faqs: [
      { question: "Does JXL support GIF animation?", answer: "JPEG XL supports animation through its frame structure. However, this converter handles static GIF output. For animated content, keep the GIF or convert to animated WebP." },
      { question: "Can JXL losslessly recompress a GIF to be smaller?", answer: "Yes, JXL's lossless mode typically achieves 20-30% better compression than GIF's LZW for the same image data. The decoded output is pixel-identical to the original GIF." },
      { question: "What advantage does JXL have over PNG for GIF conversion?", answer: "JXL lossless is 15-25% smaller than PNG for the same GIF-source pixels. JXL also supports higher bit depths and progressive decoding for better web delivery experience." }
    ]
  },
  "bmp-to-jpg": {
    instructions: [
      { title: "1. Upload Your BMP File", desc: "Upload an uncompressed BMP file for conversion to JPEG. The tool reads the raw pixel data. BMP files are large, so expect fast decoding. JPEG will dramatically reduce the file size." },
      { title: "2. Set JPEG Quality", desc: "Quality 1-100. Since BMP is uncompressed, quality 85-95 preserves most visual information. Each subsequent JPEG save adds generation loss — this is the first lossy step from the original." },
      { title: "3. Handle Transparency and Download", desc: "BMP may have alpha (32-bit BMP). JPEG doesn't support transparency — choose a background color. Download the JPEG — typically 10-20x smaller than the BMP source file." }
    ],
    faqs: [
      { question: "Will the JPEG from BMP look better than JPEG from another JPEG?", answer: "Yes, since BMP is lossless, you're compressing from pristine source data. There's no generational loss from previous compression. The JPEG will look as good as the original BMP allows." },
      { question: "What BMP bit depth converts best to JPEG?", answer: "24-bit BMPs convert best since JPEG supports full 24-bit color. 32-bit BMPs with alpha require background handling. 8-bit BMPs from GIF-like sources will show posterization after JPEG compression." },
      { question: "How much space will I save converting BMP to JPEG?", answer: "Dramatically. A 24-bit 1920x1080 BMP is about 6MB. At JPEG quality 85, that becomes 200-500KB — a 90-95% reduction. The savings depend on image complexity." }
    ]
  },
  "bmp-to-png": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to PNG. The tool reads the raw pixel data. BMP files are uncompressed, so PNG's lossless compression will significantly reduce file size while preserving every pixel." },
      { title: "2. Set PNG Compression", desc: "Compression level 0-9. Level 6 offers the best speed-to-size ratio. PNG's deflate compression works well on BMP data, especially images with large uniform color areas." },
      { title: "3. Configure and Download", desc: "Preserve bit depth — 24-bit BMP to 24-bit PNG, or 32-bit BMP with alpha to 32-bit PNG with full transparency. Download the PNG — 50-70% smaller than the BMP with identical quality." }
    ],
    faqs: [
      { question: "Is PNG always smaller than BMP?", answer: "Yes, PNG's deflate compression always produces smaller files than BMP's uncompressed storage. Simple images with large solid areas compress especially well. Complex noisy images still compress 20-40%." },
      { question: "Will converting BMP to PNG lose any quality?", answer: "No, PNG compression is completely lossless. Every pixel from the BMP is preserved identically. The file size decreases but the visual output is pixel-perfect." },
      { question: "Does PNG support all BMP color depths?", answer: "PNG supports 1, 2, 4, 8, 16, and 24/32-bit color depths, covering all standard BMP bit depths. Alpha channel from 32-bit BMP is preserved as PNG transparency." }
    ]
  },
  "bmp-to-avif": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to AVIF. The BMP's uncompressed raw data is a perfect source for AV1 compression. Expect massive file size reduction." },
      { title: "2. Set AVIF Quality", desc: "Quality 0-63. Even moderate quality 20-30 produces excellent results from clean BMP data. AVIF handles the uncompressed source efficiently without amplifying any pre-existing artifacts." },
      { title: "3. Configure and Download", desc: "AVIF supports alpha for 32-bit BMP sources. Set chroma subsampling — 4:4:4 for maximum color fidelity. Download the AVIF — typically 80-95% smaller than the original BMP." }
    ],
    faqs: [
      { question: "What's the best quality setting for archiving BMP scans as AVIF?", answer: "Use quality 30-40 for archival purposes. This retains virtually all visual information from the BMP while reducing file size by 80-90%. Compare with the original to confirm." },
      { question: "Can AVIF preserve BMP's exact pixel values?", answer: "No, AVIF is a lossy format. For lossless preservation, use PNG. AVIF offers extreme compression at the cost of pixel-perfect accuracy." },
      { question: "Does BMP's uncompressed nature improve AVIF encoding quality?", answer: "Yes, encoding from a lossless source (BMP) avoids amplifying pre-existing compression artifacts. The AVIF output contains only artifacts introduced by the AV1 encoder itself." }
    ]
  },
  "bmp-to-gif": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to GIF. The tool reads the BMP's raw pixel data. BMP can have millions of colors — GIF can only store 256, so significant color reduction is needed." },
      { title: "2. Reduce Color Palette", desc: "Set palette size 2-256. BMP's full color data is quantized to the selected palette. Enable dithering to simulate missing colors. Floyd-Steinberg dithering produces the most visually palatable results." },
      { title: "3. Set Transparency and Download", desc: "GIF supports one transparent color. Select a palette entry for transparency if the BMP had alpha. Download the GIF — much smaller than BMP but with significantly reduced color fidelity." }
    ],
    faqs: [
      { question: "How much color information is lost from BMP to GIF?", answer: "BMP can store 16.7 million colors (24-bit). GIF stores at most 256. For photographic BMPs, this represents a 99.998% reduction in color information. Only graphics with intentional palettes survive well." },
      { question: "Does BMP's alpha channel survive in GIF?", answer: "Partially. GIF supports binary transparency (one color made transparent). BMP's smooth alpha edges become hard transparency edges in GIF, losing any feathering or soft shadows." },
      { question: "What BMP content is suitable for GIF conversion?", answer: "Graphics with intentionally limited colors — logos, diagrams, pixel art, and UI elements. BMP photographs should not be converted to GIF due to extreme quality loss from palette reduction." }
    ]
  },
  "bmp-to-webp": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to WebP. The BMP's uncompressed data provides a clean source. WebP's modern compression will dramatically reduce file size." },
      { title: "2. Choose Lossy or Lossless", desc: "Lossless WebP preserves every BMP pixel with 20-40% better compression than BMP. Lossy WebP offers 80-90% reduction by selectively discarding color detail." },
      { title: "3. Configure and Download", desc: "Preserve BMP's alpha channel with WebP transparency. Quality 80-90 for lossy is recommended for photos. Download the WebP — significantly smaller than the BMP source." }
    ],
    faqs: [
      { question: "How much smaller is WebP compared to BMP?", answer: "Lossless WebP reduces BMP size by 50-70%. Lossy WebP at quality 85 reduces by 85-95%. A 10MB BMP photo becomes 2-5MB as lossless WebP or 500KB-1MB as lossy WebP." },
      { question: "Is lossless WebP from BMP truly lossless?", answer: "Yes, lossless WebP preserves every pixel from the BMP identically. The compression is mathematically lossless — the decoded WebP matches the BMP pixel for pixel." },
      { question: "Does BMP's color depth affect the WebP conversion?", answer: "24-bit and 32-bit BMP convert directly to WebP's color space. 8-bit indexed BMPs are converted to full color during the WebP encode, potentially improving appearance if the original had banding." }
    ]
  },
  "bmp-to-heic": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to HEIC. The tool reads the raw pixel data and encodes it with HEVC. HEIC provides modern HEVC compression for the lossless BMP source." },
      { title: "2. Set HEIC Quality", desc: "Set quality 0.0-1.0. Quality 0.8 provides excellent results from clean BMP data. HEVC encoding efficiently handles the uncompressed pixel data." },
      { title: "3. Configure and Download", desc: "Preserve 32-bit BMP alpha transparency in HEIC. Embed BMP metadata if available. Download the HEIC file for use in Apple ecosystem applications and devices." }
    ],
    faqs: [
      { question: "Why convert BMP to HEIC instead of JPEG?", answer: "HEIC offers 40-50% better compression than JPEG at the same quality. For Apple-heavy workflows, HEIC is natively supported. The file will be much smaller than BMP with excellent quality." },
      { question: "Does HEIC from BMP look better than HEIC from JPEG?", answer: "Yes, since BMP is uncompressed, there are no pre-existing artifacts to encode. HEIC compression starts from pristine pixels, producing cleaner output than encoding from a previously compressed source." },
      { question: "Can HEIC store BMP's indexed color palette?", answer: "HEIC doesn't support indexed color. The BMP's palette colors are converted to full RGB during HEVC encoding. For truly lossless indexed color preservation, use PNG." }
    ]
  },
  "bmp-to-svg": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for vectorization to SVG. The tool analyzes the uncompressed pixel data for edge detection and color regions. Simple BMP graphics with clear shapes vectorize best." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge detection threshold, and path simplification. BMP's large file size doesn't affect vectorization quality — only the image content matters." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output. Fine-tune settings to balance shape accuracy and path count. Download the SVG — dramatically smaller than the BMP and resolution-independent." }
    ],
    faqs: [
      { question: "Can I vectorize a BMP photo into SVG?", answer: "Photographic BMPs with continuous tones and gradients produce SVGs with thousands of paths and poor visual quality. Use vectorization only for graphics with distinct color regions and sharp edges." },
      { question: "Does the BMP's extra color depth help SVG conversion?", answer: "No, vectorization reduces colors to a small palette regardless of source bit depth. Extra color information from 24-bit BMP is quantized away during the vectorization process." },
      { question: "What BMP content produces the best SVG conversion?", answer: "Line art, logos, icons, and graphics stored as BMP with 16 or fewer distinct colors. Higher contrast between adjacent color regions produces cleaner vector edges." }
    ]
  },
  "bmp-to-tiff": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to TIFF. The tool reads the raw pixel data and packages it into a TIFF container. Both are raster formats, but TIFF offers more features." },
      { title: "2. Choose TIFF Compression", desc: "LZW compression is lossless and widely compatible. Deflate offers better compression ratios. Since BMP is uncompressed, any TIFF compression will reduce file size." },
      { title: "3. Configure Bit Depth and Download", desc: "TIFF supports the same bit depths as BMP plus 16-bit per channel. Embed ICC color profiles. Download the TIFF — smaller than BMP with additional metadata and compression flexibility." }
    ],
    faqs: [
      { question: "Is TIFF an upgrade from BMP?", answer: "Yes, TIFF offers compression (reducing file size), metadata support (EXIF, IPTC), ICC color profiles, and multi-page capabilities. BMP only stores raw pixels with minimal header data." },
      { question: "Will I lose BMP data converting to TIFF?", answer: "No, all BMP pixel data is preserved. TIFF with LZW compression is lossless. The conversion adds value through better compression and metadata while maintaining pixel-perfect accuracy." },
      { question: "What compression should I use for BMP-to-TIFF?", answer: "LZW is the safe default — lossless with excellent software support. Deflate gives smaller files but some legacy software may not read it. Avoid JPEG-in-TIFF as it adds lossy artifacts." }
    ]
  },
  "bmp-to-ico": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for icon conversion. The tool reads the BMP's pixel data. BMP files are often large, so ensure your source includes transparency if needed for the icon." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. BMP's raw pixel structure means downscaling is straightforward. The BMP source should be at least 256x256 for quality results at larger sizes." },
      { title: "3. Configure and Download", desc: "32-bit BMP with alpha creates icons with transparency. 24-bit BMP creates opaque icons. Download the .ico file for application or favicon use." }
    ],
    faqs: [
      { question: "Does 32-bit BMP alpha transfer to ICO transparency?", answer: "Yes, 32-bit BMP stores RGBA data which maps directly to ICO's 32-bit icon entries. The alpha channel is preserved across all selected icon sizes." },
      { question: "Is BMP a good source format for icon creation?", answer: "BMP is adequate but not ideal. Its uncompressed nature means large file sizes for high-resolution sources. PNG or SVG produce smaller source files with the same or better quality." },
      { question: "What BMP resolution makes the best icon set?", answer: "512x512 or higher. Since BMP is uncompressed, a 512x512 32-bit BMP is about 1MB. This provides excellent source data for generating crisp icons at all standard sizes." }
    ]
  },
  "bmp-to-jxl": {
    instructions: [
      { title: "1. Upload Your BMP", desc: "Upload a BMP file for conversion to JPEG XL. The BMP's clean uncompressed data provides an ideal source for JXL's state-of-the-art compression." },
      { title: "2. Choose JXL Mode", desc: "Lossless JXL preserves every BMP pixel with 30-50% better compression than BMP's raw storage. VarDCT lossy mode achieves 90%+ reduction by exploiting JXL's advanced perceptual encoding." },
      { title: "3. Configure and Download", desc: "Preserve alpha from 32-bit BMP. Set bit depth (8, 10, or 12-bit). Enable progressive decoding. Download the .jxl file — dramatically smaller than BMP with excellent quality." }
    ],
    faqs: [
      { question: "How does JXL compression compare to PNG for BMP sources?", answer: "JXL lossless is 15-25% smaller than PNG for the same BMP data. JXL also offers lossy modes for even greater compression when absolute pixel accuracy isn't needed." },
      { question: "Can JXL handle BMP's full color range?", answer: "Yes, JXL supports up to 12-bit per channel, easily exceeding BMP's 8-bit. Wide color gamuts and HDR are supported, though BMP itself doesn't typically carry this data." },
      { question: "Is JXL suitable for archiving BMP scans?", answer: "Yes, JXL's lossless mode is excellent for archival — smaller files than BMP with perfect pixel preservation. JXL also supports rich metadata for cataloging scanned images." }
    ]
  },
  "tiff-to-jpg": {
    instructions: [
      { title: "1. Upload Your TIFF File", desc: "Upload a TIFF image for conversion to JPEG. The tool reads the TIFF's compression and pixel data. TIFF files from scanners and cameras are often large — JPEG will significantly reduce size." },
      { title: "2. Set JPEG Quality", desc: "Quality 1-100. For high-quality print TIFFs, use 90-95. For web use, 80-85 balances quality and file size. This is a lossy step — the JPEG will be smaller but will lose some TIFF detail." },
      { title: "3. Handle Transparency and Download", desc: "TIFF supports alpha and multiple pages. Choose a background color for transparency. Select which page to convert. Download the JPEG — universally compatible and much smaller than the TIFF." }
    ],
    faqs: [
      { question: "Can I convert a multi-page TIFF to multiple JPEGs?", answer: "Yes, each page can be extracted as a separate JPEG file. Specify the page number or convert all pages in sequence. Each page becomes its own JPEG image." },
      { question: "Does TIFF's 16-bit color depth matter for JPEG output?", answer: "JPEG supports only 8-bit per channel. TIFF's extra bit depth is discarded during conversion, potentially causing banding in smooth gradients that looked smooth in the 16-bit TIFF." },
      { question: "What JPEG quality preserves TIFF scan quality best?", answer: "Quality 95+ for archival scans. This minimizes visible loss from the TIFF source. For sharing documents, quality 85 is sufficient and produces much smaller files." }
    ]
  },
  "tiff-to-png": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for conversion to PNG. The tool decodes the TIFF and re-encodes losslessly to PNG. PNG provides a more universally supported lossless format than TIFF." },
      { title: "2. Set PNG Compression", desc: "Compression level 0-9. Level 6 is recommended. PNG's deflate compression typically matches or slightly beats TIFF's LZW compression for most images." },
      { title: "3. Configure and Download", desc: "Preserve bit depth — 8-bit TIFF to 8-bit PNG, 16-bit TIFF to 16-bit PNG. Alpha channels are preserved. Embed metadata. Download the PNG — compatible with all modern browsers and applications." }
    ],
    faqs: [
      { question: "Is PNG better than TIFF for web use?", answer: "Yes, PNG has native browser support and smaller file sizes. TIFF is overkill for web use — it lacks browser support and carries unnecessary overhead from its professional features." },
      { question: "Does PNG support TIFF's multi-page structure?", answer: "No, PNG is single-image only. Each TIFF page must be exported as a separate PNG file. APNG supports animation but not multi-page documents in the TIFF sense." },
      { question: "Will I lose TIFF metadata in the PNG conversion?", answer: "Basic metadata like ICC profiles and EXIF data are preserved. TIFF-specific fields like IPTC metadata and custom tags may not transfer. The pixel data is preserved losslessly." }
    ]
  },
  "tiff-to-avif": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF image for conversion to AVIF. The tool decodes the TIFF and encodes with AV1. AVIF offers significantly better compression than TIFF." },
      { title: "2. Set AVIF Quality", desc: "Quality 0-63. For high-quality conversion from TIFF, use quality 25-35. This preserves most visual information while achieving 80-90% file size reduction." },
      { title: "3. Configure and Download", desc: "Set chroma subsampling — 4:4:4 for maximum fidelity. Preserve alpha from TIFF. Download the AVIF — dramatically smaller than the TIFF with excellent visual quality." }
    ],
    faqs: [
      { question: "Why convert a lossless TIFF to lossy AVIF?", answer: "For storage efficiency. AVIF can match TIFF's visual quality at 5-10% of the file size. This is valuable for archiving large collections where absolute pixel preservation is less critical than storage space." },
      { question: "Does AVIF preserve TIFF's 16-bit color depth?", answer: "AVIF supports 10-bit and 12-bit depth, which exceeds TIFF's 16-bit in practical terms. However, the tonemapping from 16-bit to AVIF's bit depth may cause subtle banding in extreme gradients." },
      { question: "Can AVIF store multi-page TIFF documents?", answer: "No, AVIF is single-image. Each TIFF page must be converted to a separate AVIF file. Animated AVIF exists but is intended for animation, not document pages." }
    ]
  },
  "tiff-to-gif": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for conversion to GIF. The tool decodes the TIFF — which may contain millions of colors — and prepares for GIF's 256-color limit." },
      { title: "2. Reduce Color Palette", desc: "Set target palette size 2-256. TIFF from scanners or cameras with full color range needs aggressive quantization. Enable dithering to simulate the missing millions of colors." },
      { title: "3. Set Transparency and Download", desc: "TIFF alpha is mapped to GIF's single-color transparency. Select the transparent color. Download the GIF — suitable for simple web graphics but a massive quality reduction from the TIFF source." }
    ],
    faqs: [
      { question: "Why would I convert a high-quality TIFF to GIF?", answer: "GIF compatibility is sometimes required for specific applications, legacy systems, or web platforms that accept only GIF. It represents a drastic quality downgrade from TIFF's capabilities." },
      { question: "Does TIFF's higher bit depth matter for GIF output?", answer: "No, all bit depths are reduced to GIF's 8-bit indexed color. Extra tonal information from 16-bit TIFF is discarded. The GIF output looks the same regardless of the TIFF's bit depth." },
      { question: "Can GIF preserve TIFF's multi-page structure?", answer: "GIF supports animation, not document pages. You could convert each TIFF page to a GIF animation frame, but this is a misuse of GIF's intended purpose for simple animations." }
    ]
  },
  "tiff-to-webp": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF image for conversion to WebP. The tool reads the TIFF's pixel data and compression. WebP offers better compression than TIFF with broader web compatibility." },
      { title: "2. Choose Quality and Mode", desc: "Lossless WebP preserves TIFF quality with 30-50% smaller files. Lossy WebP at quality 85-95 offers 80-90% reduction with minimal visible difference." },
      { title: "3. Configure and Download", desc: "Preserve TIFF's alpha channel, ICC profiles, and EXIF metadata. Download the WebP — optimized for web delivery while maintaining the visual quality from the TIFF source." }
    ],
    faqs: [
      { question: "Is WebP a good replacement for TIFF in web workflows?", answer: "Yes, WebP provides 80%+ of TIFF's image quality at a fraction of the file size. For web delivery, WebP is superior. For print and professional editing, TIFF remains necessary." },
      { question: "Does WebP support TIFF's 16-bit depth?", answer: "Standard WebP supports 8-bit only. TIFF's 16-bit data is tonemapped to 8-bit during conversion. For extended bit depth preservation, use AVIF or keep the original TIFF." },
      { question: "Can I batch convert TIFF images to WebP?", answer: "This tool handles single conversions. For batch processing TIFF collections, use our Batch Image Editor which applies uniform settings to convert multiple TIFFs to WebP simultaneously." }
    ]
  },
  "tiff-to-heic": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for conversion to HEIC. The tool decodes the TIFF and re-encodes with HEVC. HEIC provides modern compression while maintaining compatibility with Apple devices." },
      { title: "2. Set HEIC Quality", desc: "Quality 0.0-1.0. For high-quality TIFF scans, use 0.85-0.95. HEIC's HEVC encoding efficiently compresses the full-color TIFF data." },
      { title: "3. Configure and Download", desc: "Preserve TIFF's alpha channel and ICC color profiles. TIFF's multi-page structure is not supported — each page converts separately. Download the HEIC for Apple ecosystem use." }
    ],
    faqs: [
      { question: "Is HEIC a viable format for TIFF scan archiving?", answer: "For space-efficient archiving, yes. HEIC at quality 0.9 reduces TIFF file size by 80-90% while preserving excellent quality. For true archival with no quality loss, use lossless TIFF or PNG." },
      { question: "Does HEIC preserve TIFF's CMYK color data?", answer: "HEIC supports RGB only. TIFF CMYK images are converted to sRGB during HEIC encoding, which may shift colors intended for print production." },
      { question: "Can HEIC store multi-page TIFF documents?", answer: "HEIC supports image sequences but this converter handles single-image output. Convert multi-page TIFFs page by page or use a dedicated document management format." }
    ]
  },
  "tiff-to-svg": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for vectorization to SVG. The tool decodes the TIFF and analyzes edges and color regions. Simple TIFF graphics with limited colors vectorize best." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge sensitivity, and path simplification. High-bit-depth TIFFs are quantized during vectorization, so set colors based on the image content rather than the TIFF's color depth." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output for accuracy. Adjust settings if shapes are lost. Download the SVG — resolution-independent and suitable for web, print, and further vector editing." }
    ],
    faqs: [
      { question: "What TIFF content produces the best SVG?", answer: "TIFFs with 2-16 solid colors, high contrast edges, and minimal noise. Scanned line art, logos stored as TIFF, and technical diagrams produce excellent SVG results." },
      { question: "Does TIFF's high bit depth help SVG conversion?", answer: "No, SVG uses sRGB color references. The extra color precision from 16-bit TIFF is irrelevant after quantization to the small SVG palette. Content clarity matters more than color depth." },
      { question: "Can I convert a scanned TIFF document to SVG?", answer: "Scanned photographs in TIFF form do not vectorize well. Scanned line drawings or black-and-white text documents can produce usable SVGs with appropriate settings." }
    ]
  },
  "tiff-to-bmp": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for conversion to BMP. The tool decodes any TIFF compression (LZW, Deflate, JPEG, uncompressed) and stores raw pixel data. BMP is always uncompressed." },
      { title: "2. Choose Bit Depth", desc: "Match the TIFF's bit depth or convert to 24-bit for maximum compatibility. 32-bit BMP preserves TIFF alpha. Converting 16-bit TIFF to 8-bit BMP loses tonal precision." },
      { title: "3. Configure and Download", desc: "BMP strips all TIFF compression and metadata. The output is raw pixel data only. Download the BMP for applications that require direct pixel access without decoding libraries." }
    ],
    faqs: [
      { question: "Why convert compressed TIFF to uncompressed BMP?", answer: "BMP's simplicity — any software can read it by skipping a small header. This is valuable in embedded systems, custom hardware, and legacy applications that cannot decode TIFF compression." },
      { question: "How much larger will the BMP be than the TIFF?", answer: "A LZW-compressed TIFF at 2MB might become 10-20MB as BMP depending on image complexity. The simpler the image, the larger the size ratio since TIFF compresses flat areas well." },
      { question: "Does BMP preserve TIFF's embedded color profiles?", answer: "No, BMP has limited color profile support. ICC profiles from the TIFF are discarded. The pixel values are preserved but their intended color interpretation is lost." }
    ]
  },
  "tiff-to-ico": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for icon conversion. The tool decodes the TIFF and prepares it for multi-size icon generation. TIFF's high bit depth and resolution provide excellent source material." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. TIFF sources at 300+ DPI produce sharp icons at every size. The TIFF's quality is preserved through the downscaling process." },
      { title: "3. Configure and Download", desc: "TIFF alpha maps to icon transparency. Select the appropriate page from multi-page TIFFs. Download the .ico file with selected sizes." }
    ],
    faqs: [
      { question: "Is TIFF overkill as a source for icon creation?", answer: "TIFF's high quality is beneficial for creating detailed icons, but the file size is excessive. Convert to PNG first for a more manageable source, then to ICO for the final icon." },
      { question: "Does TIFF's CMYK color mode affect icon output?", answer: "Yes, CMYK TIFFs are converted to RGB/sRGB during icon generation. Print-specific CMYK colors may shift. Use RGB TIFF sources for predictable icon colors." },
      { question: "Can I create icons from different pages of a multi-page TIFF?", answer: "Yes, select the desired page number from the multi-page TIFF. Each page can be converted to a separate icon or you can choose which page to iconize." }
    ]
  },
  "tiff-to-jxl": {
    instructions: [
      { title: "1. Upload Your TIFF", desc: "Upload a TIFF file for conversion to JPEG XL. The tool decodes the TIFF and re-encodes with JXL. JXL offers superior compression while supporting similar professional features." },
      { title: "2. Choose JXL Mode", desc: "Lossless JXL preserves all TIFF data with 30-50% better compression than LZW-compressed TIFF. VarDCT lossy mode with quality 80-95 offers extreme compression with minimal visible loss." },
      { title: "3. Configure Advanced Options", desc: "Preserve 16-bit depth from high-quality TIFFs. Embed ICC profiles and EXIF metadata. Enable progressive decoding. Download the .jxl file — a modern archival format." }
    ],
    faqs: [
      { question: "Is JXL a viable TIFF replacement for professional use?", answer: "JXL matches TIFF's professional features — high bit depth, lossless compression, ICC profiles — while offering better compression. The main barrier is software adoption in professional tools." },
      { question: "Can JXL preserve TIFF's multi-page document structure?", answer: "JXL supports frames similar to animation, not document pages. Multi-page TIFFs are better converted to PDF for document preservation or to individual JXL files per page." },
      { question: "Does JXL support TIFF's CMYK color space?", answer: "JPEG XL supports CMYK conversion to RGB during encoding. Native CMYK storage is not supported. For print workflow preservation, keep the original TIFF in CMYK." }
    ]
  },
  "ico-to-png": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload a Windows icon file for conversion to PNG. The tool reads all available sizes in the ICO and lets you choose which to extract. ICO files contain one or more embedded images." },
      { title: "2. Select Icon Size", desc: "Choose which icon size to extract — 16x16, 32x32, 48x48, 64x64, 128x128, or 256x256. Pick the size that matches your intended use. Larger sizes have more detail." },
      { title: "3. Configure and Download", desc: "ICO's alpha transparency is fully preserved in PNG. Choose compression level. Download the PNG — suitable for web use and general image editing." }
    ],
    faqs: [
      { question: "Why extract ICO entries as separate PNGs?", answer: "PNG is universally supported while ICO is primarily for Windows icons. Extracting to PNG makes the icon graphic usable on any platform, in any application, and on the web." },
      { question: "Does ICO's 32-bit alpha transfer perfectly to PNG?", answer: "Yes, ICO stores 32-bit BGRA data which converts directly to PNG's RGBA. All transparency information is preserved identically." },
      { question: "Can I extract all sizes from an ICO at once?", answer: "Yes, the tool can extract every embedded size as a separate PNG file. This gives you a complete set of the icon's variants for different display contexts." }
    ]
  },
  "ico-to-jpg": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to JPEG. The tool extracts the largest available size for best quality. ICO icons are small — expect limited resolution in the JPEG output." },
      { title: "2. Select Size and Handle Transparency", desc: "Choose which icon size to convert. ICO supports transparency; JPEG doesn't. Select a background color to fill transparent areas. White is the standard choice." },
      { title: "3. Set JPEG Quality and Download", desc: "Quality 1-100. Since ICO sources are typically small (256x256 max), use quality 90+ to avoid visible artifacts. Download the JPEG for use where ICO format isn't supported." }
    ],
    faqs: [
      { question: "Why does my ICO-to-JPEG image look pixelated?", answer: "ICO source images are designed for small displays. 16x16 and 32x32 icons look very blocky when saved as JPEG. Use the largest size available in the ICO (256x256) for the best JPEG result." },
      { question: "Can I enlarge an ICO icon during JPEG conversion?", answer: "The tool converts at the original icon size. For larger JPEG output, use the image resizer after conversion to upscale the icon." },
      { question: "Does JPEG compression affect ICO's sharp icon edges?", answer: "Yes, JPEG blurring is most visible on small, high-contrast graphics. Icon edges become soft. Use quality 95+ to minimize this effect on the already-small icon." }
    ]
  },
  "ico-to-webp": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to WebP. The tool extracts and converts the icon data. WebP supports transparency and provides modern compression for the icon graphic." },
      { title: "2. Select Size and Mode", desc: "Pick the icon size to convert. Lossless WebP preserves the icon's exact pixels with better compression than the ICO entry. Lossy WebP can further reduce size with minimal effect on simple icon graphics." },
      { title: "3. Configure and Download", desc: "ICO's alpha transparency is preserved in WebP. Quality settings: lossless for pixel-perfect icons, lossy at 85+ for smaller files. Download the WebP — ideal for website icons and favicon alternatives." }
    ],
    faqs: [
      { question: "Is WebP better than PNG for converted ICOs?", answer: "WebP lossless is typically 20-30% smaller than PNG for the same icon source. For web delivery of icon graphics, WebP offers clear advantages in file size." },
      { question: "Can I convert all ICO sizes to a single animated WebP?", answer: "No, each size converts independently. Use the Batch Image Editor to convert multiple sizes at once, or select the one size you need." },
      { question: "Does WebP support ICO's old 8-bit color depth?", answer: "WebP converts old 8-bit ICO entries to 24-bit color during encoding. The visual result is identical but the color space is modernized." }
    ]
  },
  "ico-to-heic": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to HEIC. The tool extracts the largest icon size. HEIC provides efficient HEVC compression for the extracted icon." },
      { title: "2. Select Size and Set Quality", desc: "Choose which icon size to convert. Set HEIC quality 0.0-1.0. Quality 0.8 preserves icon detail well. HEIC's compression is effective on small graphics with flat color areas." },
      { title: "3. Configure and Download", desc: "ICO transparency is preserved in HEIC alpha. Download the HEIC for use in Apple ecosystem applications that prefer HEIC format over ICO." }
    ],
    faqs: [
      { question: "Why convert a small ICO to HEIC?", answer: "For iOS/macOS application development where HEIC is the native image format. Converting app icons from ICO to HEIC allows consistent format use within Apple development workflows." },
      { question: "Does HEIC preserve ICO's multiple sizes?", answer: "No, each ICO entry is converted separately. The HEIC output is a single image at the selected size. Future HEIC image grid support may allow multi-size storage." },
      { question: "Is HEIC overkill for small icon graphics?", answer: "For single icons, HEIC's compression advantage is minimal at small sizes (<50KB). PNG or WebP are more practical for icon storage unless Apple compatibility is required." }
    ]
  },
  "ico-to-avif": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to AVIF. The tool extracts the chosen icon size. AVIF's modern compression efficiently handles small icon graphics." },
      { title: "2. Select Size and Set Quality", desc: "Pick the icon size. AVIF quality 20-30 provides excellent results for icon content. AVIF handles flat colors and sharp edges well at moderate quality settings." },
      { title: "3. Configure and Download", desc: "ICO transparency is preserved. Set chroma subsampling. Download the AVIF — a highly compressed version of the icon suitable for modern web delivery." }
    ],
    faqs: [
      { question: "Will AVIF blur crisp icon edges like JPEG does?", answer: "AVIF's AV1 codec handles sharp edges better than JPEG's DCT blocks. At moderate quality settings, AVIF preserves icon edge sharpness better than JPEG at equivalent file sizes." },
      { question: "Can I convert all ICO sizes to a single AVIF grid?", answer: "AVIF supports image sequences but not multi-resolution grids like ICO. Convert each size separately." },
      { question: "Is AVIF's compression beneficial for tiny icon files?", answer: "For very small files under 10KB, the encoding overhead may exceed potential savings. AVIF shines for larger icons (128x128+) where compression ratios become meaningful." }
    ]
  },
  "ico-to-svg": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for vectorization to SVG. The tool extracts the largest available size for the best vectorization source. Simple icons with solid colors produce the cleanest SVGs." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge detection threshold, and path simplification. Icons are naturally limited in colors, so 4-16 colors usually suffice. Higher simplification removes pixel-level noise." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output — it should match the icon's original shapes. Fine-tune settings if edges are jagged. Download the SVG — scalable to any size without quality loss." }
    ],
    faqs: [
      { question: "Can any ICO icon be converted to SVG?", answer: "Simple flat-color icons convert well. Icons with gradients, anti-aliased edges, or photographic content produce complex SVGs. Flat-design icons from modern interfaces work best." },
      { question: "Does the SVG preserve ICO's exact colors?", answer: "The vectorization quantizes colors to a palette, so exact ICO colors may shift slightly. For color-critical icons, manually adjust the SVG palette after export." },
      { question: "What ICO size gives the best SVG conversion?", answer: "256x256 provides sufficient pixel data for accurate edge detection. Smaller sizes (16x16, 32x32) produce jagged vector edges since the pixel grid is too coarse for smooth path tracing." }
    ]
  },
  "ico-to-bmp": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to BMP. The tool extracts the selected icon size and converts to BMP format. BMP stores the icon as an uncompressed raster." },
      { title: "2. Select Size and Bit Depth", desc: "Choose the icon size to extract. ICO entries may be 32-bit (with alpha) or lower bit depths. 32-bit BMP preserves ICO transparency, 24-bit BMP discards it." },
      { title: "3. Configure and Download", desc: "BMP stores the icon pixel data without compression. File size equals width × height × bytes per pixel. Download the BMP for use in applications requiring direct pixel access." }
    ],
    faqs: [
      { question: "When would I need an ICO converted to BMP?", answer: "Legacy Windows applications that accept BMP but not ICO, or when you need to edit the icon pixels directly in a BMP-compatible image editor." },
      { question: "Does BMP preserve ICO's multiple sizes?", answer: "No, only one size is extracted per conversion. ICO can store many sizes, but BMP is single-image. Convert each size you need separately." },
      { question: "Is BMP larger than the original ICO entry?", answer: "Yes, ICO entries may use PNG compression internally (Vista+). BMP is always uncompressed. A 10KB ICO entry becomes ~40KB as 32-bit BMP for a 32x32 icon." }
    ]
  },
  "ico-to-tiff": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to TIFF. The tool extracts icon sizes and packages them into a TIFF container. TIFF offers professional-grade storage with compression." },
      { title: "2. Select Icon Size and Compression", desc: "Choose which size to convert. Select TIFF compression — LZW for lossless storage or no compression for instant access. Multiple ICO sizes can be stored as TIFF pages." },
      { title: "3. Configure and Download", desc: "Preserve 32-bit ICO alpha in TIFF. Embed metadata. Download the TIFF — suitable for professional icon libraries and archives." }
    ],
    faqs: [
      { question: "Why store icons in TIFF format?", answer: "Icon libraries and design systems sometimes use TIFF for archival storage due to its compression, metadata support, and wide software compatibility." },
      { question: "Can I combine multiple ICO sizes into one TIFF file?", answer: "Yes, each icon size becomes a separate page in a multi-page TIFF. This preserves the multi-resolution nature of the original ICO in a more broadly compatible format." },
      { question: "Does TIFF improve ICO's color quality?", answer: "ICO at 32-bit already supports full color with alpha. TIFF provides identical pixel storage. The advantage is TIFF's superior metadata, compression, and industry acceptance." }
    ]
  },
  "ico-to-gif": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to GIF. The tool extracts the selected icon size. ICO supports 32-bit color; GIF is limited to 256 colors." },
      { title: "2. Select Size and Reduce Palette", desc: "Choose the icon size. Set palette size (2-256). Modern 32-bit ICO entries need color reduction. Enable dithering for smoother appearance — simple icons may not need it." },
      { title: "3. Set Transparency and Download", desc: "ICO transparency maps to GIF's binary transparency. Select the transparent color. Download the GIF — compatible with legacy web applications and forums." }
    ],
    faqs: [
      { question: "Why convert a modern ICO to GIF?", answer: "Legacy web compatibility. Some older platforms, forum software, and email clients accept GIF but not ICO. GIF is also lighter than handling ICO format in non-Windows environments." },
      { question: "Will the GIF preserve ICO's anti-aliased edges?", answer: "Anti-aliasing uses semi-transparent pixels around edges. GIF's binary transparency converts these to hard on/off, creating jagged edges. The icon will look rougher than the ICO source." },
      { question: "What ICO size converts best to GIF?", answer: "Larger sizes like 48x48 or 64x64 preserve more recognizable detail after palette reduction. Very small 16x16 icons lose too much information during quantization." }
    ]
  },
  "ico-to-jxl": {
    instructions: [
      { title: "1. Upload Your ICO File", desc: "Upload an ICO file for conversion to JPEG XL. The tool extracts the selected icon size. JXL offers modern compression for the extracted icon data." },
      { title: "2. Select Size and Mode", desc: "Choose the icon size. Lossless JXL preserves ICO pixels exactly with better compression. VarDCT lossy mode further reduces size using JXL's perceptual encoding." },
      { title: "3. Configure and Download", desc: "ICO transparency preserved in JXL alpha. Set bit depth. Enable progressive decoding. Download the .jxl file — a future-proof storage format for icon graphics." }
    ],
    faqs: [
      { question: "Is JXL suitable for icon storage?", answer: "Yes, JXL's lossless mode preserves icon quality while reducing file size. As JXL gains adoption, it could become an efficient universal format for icon archives." },
      { question: "Does JXL support multi-size icon storage?", answer: "Not natively like ICO. Each icon size becomes a separate JXL file. JXL's animation support could theoretically store multiple sizes as frames." },
      { question: "How does JXL compression compare to PNG for icons?", answer: "JXL lossless is typically 15-25% smaller than PNG for icon graphics. For simple flat-color icons common in modern design, the savings are at the higher end of this range." }
    ]
  },
  "jxl-to-png": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to PNG. The tool decodes the JXL image data. JXL offers better compression than PNG, so the PNG output will be larger." },
      { title: "2. Set PNG Compression", desc: "Compression level 0-9. Level 6 is optimal. PNG preserves all pixel data decoded from the JXL source. If the JXL was lossless, the PNG is pixel-perfect." },
      { title: "3. Configure and Download", desc: "Preserve JXL's alpha channel in PNG transparency. Download the PNG — universally compatible with all browsers, applications, and platforms." }
    ],
    faqs: [
      { question: "Will the PNG be larger than the JXL source?", answer: "Yes, typically 20-35% larger than lossless JXL and 3-5x larger than lossy JXL at equivalent quality. PNG's deflate compression is less efficient than JXL's modular codec." },
      { question: "Does PNG preserve JXL's HDR tonemapping?", answer: "JXL HDR content is tonemapped to 8-bit SDR during PNG conversion. PNG cannot store HDR luminance data. The visual tonemap is preserved but the HDR metadata is lost." },
      { question: "Can I preserve JXL's higher bit depth in PNG?", answer: "PNG supports 16-bit per channel, which can preserve 10/12-bit JXL data without tonemapping. However, 16-bit PNG files are very large and not widely supported in web browsers." }
    ]
  },
  "jxl-to-jpg": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to JPEG. The tool decodes the JXL and encodes to JPEG. JXL is more efficient than JPEG, so expect a size increase." },
      { title: "2. Handle Transparency", desc: "JXL supports alpha; JPEG doesn't. Choose a background color for transparent areas. White is standard for most applications." },
      { title: "3. Set JPEG Quality and Download", desc: "Quality 1-100. To approximate JXL's visual quality, use 85-95. JPEG will introduce DCT blocking artifacts that weren't present in the JXL. Download the JPEG for maximum compatibility." }
    ],
    faqs: [
      { question: "Why downgrade from JXL to JPEG?", answer: "JPEG is universally supported. Every device, browser, and application can open JPEG. JXL adoption is limited. For sharing files broadly, JPEG is the safest choice." },
      { question: "Will JXL's better compression show as quality loss in JPEG?", answer: "JXL preserves detail more efficiently. The same visual information will appear slightly degraded in JPEG due to block-based DCT artifacts. This is expected — JPEG is a less capable codec." },
      { question: "Does JPEG preserve JXL's progressive decoding?", answer: "JPEG supports progressive encoding, though it differs from JXL's approach. Enable progressive JPEG for a similar perception-based loading experience." }
    ]
  },
  "jxl-to-gif": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to GIF. The tool decodes the JXL data. JXL's millions of colors must be reduced to GIF's 256-color limit." },
      { title: "2. Reduce Color Palette", desc: "Set palette size 2-256. JXL images with smooth gradients need careful quantization with dithering. Floyd-Steinberg or Atkinson dithering can simulate missing colors." },
      { title: "3. Set Transparency and Download", desc: "JXL alpha maps to GIF's binary transparency. Select the transparent color entry. Download the GIF — a major quality reduction from the JXL source." }
    ],
    faqs: [
      { question: "Why convert advanced JXL to limited GIF?", answer: "GIF compatibility is required by legacy platforms, forums, and specific applications. Despite JXL's superiority, GIF remains universally supported in places where modern formats don't work." },
      { question: "Does JXL's progressive feature affect GIF conversion?", answer: "No, GIF is single-pass non-progressive. The GIF output is a flat, sequential image regardless of JXL's encoding features." },
      { question: "Can JXL's animation be preserved in GIF?", answer: "This converter handles static JXL. Animated JXL frames could be extracted and combined into an animated GIF using the GIF editor tool." }
    ]
  },
  "jxl-to-webp": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to WebP. The tool decodes JXL and re-encodes to WebP. Both are modern formats, but WebP has broader real-world adoption." },
      { title: "2. Choose Quality and Mode", desc: "Lossless WebP preserves JXL pixels with good efficiency. Lossy WebP at quality 85-95 matches JXL's visual quality. Expect slightly larger files than the JXL source." },
      { title: "3. Configure and Download", desc: "Preserve JXL's alpha transparency. Embed metadata. Download the WebP — balanced compression with broad web platform support." }
    ],
    faqs: [
      { question: "Which is smaller: JXL or WebP?", answer: "JXL typically achieves 15-25% better compression than WebP for the same image quality. WebP's advantage is its broad deployment across browsers, CDNs, and CMS platforms." },
      { question: "Does WebP preserve JXL's HDR capability?", answer: "Standard WebP is limited to 8-bit SDR. JXL's HDR data is tonemapped to SDR. For HDR preservation, stay with JXL or use AVIF." },
      { question: "Why convert from JXL to WebP instead of keeping JXL?", answer: "Compatibility. WebP is supported by 95%+ of browsers. If your target audience uses platforms where JXL isn't supported, WebP is the practical choice." }
    ]
  },
  "jxl-to-heic": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to HEIC. The tool decodes JXL and re-encodes using HEVC. Both are efficient modern codecs with different strengths." },
      { title: "2. Set HEIC Quality", desc: "Quality 0.0-1.0. Quality 0.8 provides excellent results. HEIC's HEVC compression efficiency is comparable to JXL for most photographic content." },
      { title: "3. Configure and Download", desc: "Preserve JXL's alpha channel and metadata. Download the HEIC for best compatibility with Apple ecosystem devices and applications." }
    ],
    faqs: [
      { question: "Which format is better: JXL or HEIC?", answer: "JXL supports more features (lossless JPEG recompression, progressive decoding, wide HDR). HEIC has better hardware support (Apple Silicon, iPhone). Choose based on your platform requirements." },
      { question: "Does HEIC preserve JXL's lossless quality?", answer: "HEIC can use lossless mode, but it's less efficient than JXL lossless. For pixel-perfect preservation, keep the original JXL. HEIC lossy is better for size-optimized results." },
      { question: "Can HEIC match JXL's compression efficiency?", answer: "For high-quality settings, HEIC and JXL are comparable. JXL slightly edges ahead at very low and very high bitrates. The difference is usually within 10-15%." }
    ]
  },
  "jxl-to-avif": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to AVIF. The tool decodes JXL and encodes with AV1. Both are next-generation formats vying for industry adoption." },
      { title: "2. Set AVIF Quality", desc: "Quality 0-63. Quality 20-30 matches most JXL compression levels. AVIF's AV1 codec achieves similar efficiency to JXL's VarDCT for most image types." },
      { title: "3. Configure and Download", desc: "Preserve JXL's alpha and color depth. Set chroma subsampling. Enable HDR if the source supported it. Download the AVIF — comparable to JXL in quality and size." }
    ],
    faqs: [
      { question: "Which codec is technically superior: JXL or AVIF?", answer: "JXL offers more features (lossless recompression of JPEG, progressive decode, wider bit depth range). AVIF has better browser adoption and industry backing. The technical winner depends on your use case." },
      { question: "Does AVIF preserve JXL's lossless encoding?", answer: "AVIF's lossless mode is less efficient than JXL's modular mode. Expect 20-30% larger lossless files. For lossy compression, both are competitive." },
      { question: "Should I convert JXL to AVIF for web use?", answer: "If your CDN or platform doesn't support JXL but supports AVIF, yes. AVIF has broader browser support (Chrome, Firefox) than JXL. For maximum reach, serve both and let the browser choose." }
    ]
  },
  "jxl-to-svg": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for vectorization to SVG. The tool decodes JXL and analyzes pixel data for edge and color detection. Simple graphics produce cleaner SVGs." },
      { title: "2. Set Vectorization Parameters", desc: "Choose color count (2-32), edge threshold, and path simplification. JXL's efficient compression doesn't affect vectorization quality — only the visual content matters." },
      { title: "3. Preview and Export SVG", desc: "Review the vector output. Fine-tune settings to balance detail and path count. Download the SVG — resolution-independent and editable in vector software." }
    ],
    faqs: [
      { question: "What JXL content produces the best SVGs?", answer: "Graphics with solid colors, clear edges, and minimal gradients. JXL screenshots of UI elements, flat-design graphics, and simple illustrations work well." },
      { question: "Does JXL's high bit depth benefit SVG conversion?", answer: "No, vectorization quantizes colors regardless of source bit depth. Extra color precision is lost during quantization to the small SVG palette." },
      { question: "Can I preserve JXL's HDR tonemapping in SVG?", answer: "No, SVG uses sRGB color references. HDR data from JXL is converted to standard gamut during the raster-to-vector conversion process." }
    ]
  },
  "jxl-to-bmp": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to BMP. The tool decodes the JXL data into raw pixels. BMP stores data uncompressed, so expect a significant size increase." },
      { title: "2. Choose Bit Depth", desc: "Select 24-bit BMP for standard conversion, 32-bit to preserve JXL's alpha channel, or 16-bit for grayscale. JXL's high bit depth (10/12-bit) is tonemapped to 8-bit." },
      { title: "3. Configure and Download", desc: "BMP strips all JXL compression efficiency. File size equals pixel count × bytes per pixel. Download the BMP for direct pixel access without decoding libraries." }
    ],
    faqs: [
      { question: "Why convert efficient JXL to bloated BMP?", answer: "BMP's simplicity has value in embedded systems, boot loaders, and custom software that reads pixel data directly. JXL's efficiency is irrelevant when your target system can't decode it." },
      { question: "How much larger is BMP compared to JXL?", answer: "A high-quality JXL photo at 500KB might become 6-24MB as BMP depending on resolution. A 4K image at 1.5MB JXL becomes ~25MB as 24-bit BMP." },
      { question: "Does BMP preserve JXL's wide color gamut?", answer: "BMP uses simple RGB. JXL's wide gamut (Rec.2020, DCI-P3) is mapped to sRGB during BMP conversion. The extended color range is lost." }
    ]
  },
  "jxl-to-tiff": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for conversion to TIFF. The tool decodes JXL and packages data into a TIFF container. TIFF offers professional-grade storage with compression options." },
      { title: "2. Choose Compression and Bit Depth", desc: "LZW compression for lossless storage. Deflate for better ratios. 16-bit TIFF can preserve JXL's extended bit depth (10/12-bit mapped to 16-bit)." },
      { title: "3. Configure Color Profile and Download", desc: "Embed ICC color profiles. TIFF supports multi-image sequences. Download the TIFF for professional editing, print production, and archival storage." }
    ],
    faqs: [
      { question: "Is TIFF better than JXL for archival?", answer: "TIFF is more universally supported in archival and professional software. JXL offers better compression. For current archives, TIFF is safer. For space-efficient archives, JXL is better." },
      { question: "Can TIFF preserve JXL's progressive decode structure?", answer: "No, TIFF doesn't support progressive decoding. The stored image is full-resolution only. JXL's perceptual progressive loading is lost in the TIFF conversion." },
      { question: "Does TIFF support JXL's lossless mode?", answer: "TIFF with LZW compression is lossless, preserving all decoded JXL pixels. If the JXL was lossy, those artifacts become permanent in the TIFF." }
    ]
  },
  "jxl-to-ico": {
    instructions: [
      { title: "1. Upload Your JXL File", desc: "Upload a JPEG XL file for icon conversion. The tool decodes the JXL and prepares it for multi-size icon generation. JXL's high quality provides excellent source material." },
      { title: "2. Select Icon Sizes", desc: "Choose from 16x16 to 256x256. JXL images should be at least 256x256 for a comprehensive icon set. JXL's efficient compression means high-resolution sources are still small files." },
      { title: "3. Configure and Download", desc: "JXL's alpha transparency maps to 32-bit icon entries. Download the .ico file with all selected sizes for application and favicon use." }
    ],
    faqs: [
      { question: "Is JXL a good source for icon creation?", answer: "Yes, JXL combines high quality with efficient file sizes. A 512x512 JXL icon source is much smaller than an equivalent BMP or TIFF source, making it practical to store large source collections." },
      { question: "Does JXL's HDR affect icon conversion?", answer: "Icons use sRGB, so JXL HDR content is tonemapped to standard gamut. The icon preview shows the tonemapped version, which may look different from the HDR original." },
      { question: "Can I create favicons from JXL sources?", answer: "Yes, JXL sources produce excellent favicons. The high-efficiency compression lets you store large source icon collections without significant storage overhead." }
    ]
  }
};
module.exports = { CONTENT };
