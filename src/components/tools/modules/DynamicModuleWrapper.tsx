"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const SkeletonLoader = () => (
  <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-8 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] mb-6"></div>
    <div className="h-6 bg-[var(--bg-elevated)] rounded-md w-1/3 mb-4"></div>
    <div className="h-4 bg-[var(--bg-elevated)] rounded-md w-1/2 mb-8"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] mb-4"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)]"></div>

  </div>
);

const MODULE_REGISTRY: Record<string, React.ComponentType> = {
  'passport-photo-india': dynamic(() => import('@/components/tools/modules/PassportPhotoIndia'), { 
    ssr: false, 
    loading: () => <SkeletonLoader /> 
  }),
  'aadhaar-wallet-cropper': dynamic(() => import('@/components/tools/modules/AadhaarWalletCropper'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'aadhaar-card-masker': dynamic(() => import('@/components/tools/modules/AadhaarMasker'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'kb-image-compressor': dynamic(() => import('@/components/tools/modules/KbImageCompressor'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'image-compressor': dynamic(() => import('@/components/tools/modules/ImageCompressor'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'pdf-merger': dynamic(() => import('@/components/tools/modules/PdfMerger'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'pdf-compressor': dynamic(() => import('@/components/tools/modules/PdfCompressor'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'qr-code-generator': dynamic(() => import('@/components/tools/modules/QrCodeGenerator'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'password-generator': dynamic(() => import('@/components/tools/modules/PasswordGenerator'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'json-formatter': dynamic(() => import('@/components/tools/modules/JsonFormatter'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'live-transcription': dynamic(() => import('@/components/tools/modules/LiveTranscription'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'image-bulk-converter': dynamic(() => import('@/components/tools/modules/ImageBulkConverter'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'esign-pdf': dynamic(() => import('@/components/tools/modules/EsignPdf'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'pdf-form-filler': dynamic(() => import('@/components/tools/modules/PdfFormFiller'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'pdf-ocr': dynamic(() => import('@/components/tools/modules/PdfOcr'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'resume-builder': dynamic(() => import('@/components/tools/modules/ResumeBuilder'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'ai-image-upscaler': dynamic(() => import('@/components/tools/modules/AiImageUpscaler'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'ai-document-chat': dynamic(() => import('@/components/tools/modules/AiDocumentChat'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'ai-video-subtitler': dynamic(() => import('@/components/tools/modules/AiVideoSubtitler'), { 
    ssr: false,
    loading: () => <SkeletonLoader /> 
  }),
  'mp3-compressor': dynamic(() => import('@/components/tools/modules/Mp3Compressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'gif-to-mp4': dynamic(() => import('@/components/tools/modules/GifToMp4'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-trimmer': dynamic(() => import('@/components/tools/modules/VideoTrimmer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'tiktok-video-downloader': dynamic(() => import('@/components/tools/modules/TiktokVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'privacy-cleaner': dynamic(() => import('@/components/tools/modules/PrivacyCleaner'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'youtube-downloader': dynamic(() => import('@/components/tools/modules/YoutubeDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'instagram-video-downloader': dynamic(() => import('@/components/tools/modules/InstagramVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'facebook-video-downloader': dynamic(() => import('@/components/tools/modules/FacebookVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-translator': dynamic(() => import('@/components/tools/modules/AiTranslator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'grammar-checker-extension': dynamic(() => import('@/components/tools/modules/GrammarCheckerExtension'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-word': dynamic(() => import('@/components/tools/modules/PdfToWord'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-image-generator': dynamic(() => import('@/components/tools/modules/AiImageGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'speed-test': dynamic(() => import('@/components/tools/modules/SpeedTest'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'twitter-video-downloader': dynamic(() => import('@/components/tools/modules/TwitterVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'compress-image-to-50kb': dynamic(() => import('@/components/tools/modules/CompressImageTo50kb'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'currency-converter': dynamic(() => import('@/components/tools/modules/CurrencyConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'logo-maker': dynamic(() => import('@/components/tools/modules/LogoMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mp4-to-mp3': dynamic(() => import('@/components/tools/modules/Mp4ToMp3'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'word-to-pdf': dynamic(() => import('@/components/tools/modules/WordToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-writing-assistant': dynamic(() => import('@/components/tools/modules/AiWritingAssistant'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'percentage-calculator': dynamic(() => import('@/components/tools/modules/PercentageCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'jpg-to-pdf': dynamic(() => import('@/components/tools/modules/JpgToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'plagiarism-checker': dynamic(() => import('@/components/tools/modules/PlagiarismChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'age-calculator': dynamic(() => import('@/components/tools/modules/AgeCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'heic-to-jpg': dynamic(() => import('@/components/tools/modules/HeicToJpg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/modules/PdfToJpg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-ppt': dynamic(() => import('@/components/tools/modules/PdfToPpt'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'fancy-text-generator': dynamic(() => import('@/components/tools/modules/FancyTextGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'stopwatch': dynamic(() => import('@/components/tools/modules/Stopwatch'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'reddit-video-downloader': dynamic(() => import('@/components/tools/modules/RedditVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'background-remover': dynamic(() => import('@/components/tools/modules/BackgroundRemover'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'webp-to-jpg': dynamic(() => import('@/components/tools/modules/WebpToJpg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'wheel-of-names': dynamic(() => import('@/components/tools/modules/WheelOfNames'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'object-remover': dynamic(() => import('@/components/tools/modules/ObjectRemover'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ppt-to-pdf': dynamic(() => import('@/components/tools/modules/PptToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'temporary-email-generator': dynamic(() => import('@/components/tools/modules/TemporaryEmailGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'screen-recorder-extension': dynamic(() => import('@/components/tools/modules/ScreenRecorderExtension'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'to-do-list': dynamic(() => import('@/components/tools/modules/ToDoList'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'excel-to-pdf': dynamic(() => import('@/components/tools/modules/ExcelToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'emi-calculator': dynamic(() => import('@/components/tools/modules/EmiCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'character-counter': dynamic(() => import('@/components/tools/modules/CharacterCounter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-to-text-transcription': dynamic(() => import('@/components/tools/modules/VideoToTextTranscription'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'word-counter': dynamic(() => import('@/components/tools/modules/WordCounter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'crop-image': dynamic(() => import('@/components/tools/modules/CropImage'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'social-media-post-maker': dynamic(() => import('@/components/tools/modules/SocialMediaPostMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mkv-to-mp4': dynamic(() => import('@/components/tools/modules/MkvToMp4'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'text-to-speech-tts': dynamic(() => import('@/components/tools/modules/TextToSpeechTts'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-paraphrasing-tool': dynamic(() => import('@/components/tools/modules/AiParaphrasingTool'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'random-number-generator': dynamic(() => import('@/components/tools/modules/RandomNumberGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'url-shortener': dynamic(() => import('@/components/tools/modules/UrlShortener'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'text-summarizer': dynamic(() => import('@/components/tools/modules/TextSummarizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-excel': dynamic(() => import('@/components/tools/modules/PdfToExcel'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'unlock-pdf': dynamic(() => import('@/components/tools/modules/UnlockPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'image-enhancer': dynamic(() => import('@/components/tools/modules/ImageEnhancer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'sip-calculator': dynamic(() => import('@/components/tools/modules/SipCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bmi-calculator': dynamic(() => import('@/components/tools/modules/BmiCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pinterest-image-downloader': dynamic(() => import('@/components/tools/modules/PinterestImageDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'audio-to-text-transcription': dynamic(() => import('@/components/tools/modules/AudioToTextTranscription'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'meme-generator': dynamic(() => import('@/components/tools/modules/MemeGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mov-to-mp4': dynamic(() => import('@/components/tools/modules/MovToMp4'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'gst-calculator': dynamic(() => import('@/components/tools/modules/GstCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'image-resizer': dynamic(() => import('@/components/tools/modules/ImageResizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'diff-checker': dynamic(() => import('@/components/tools/modules/DiffChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'webm-to-mp4': dynamic(() => import('@/components/tools/modules/WebmToMp4'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ip-address-lookup': dynamic(() => import('@/components/tools/modules/IpAddressLookup'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'brand-name-generator': dynamic(() => import('@/components/tools/modules/BrandNameGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-content-humanizer': dynamic(() => import('@/components/tools/modules/AiContentHumanizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'photo-retoucher': dynamic(() => import('@/components/tools/modules/PhotoRetoucher'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-splitter': dynamic(() => import('@/components/tools/modules/PdfSplitter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'font-generator': dynamic(() => import('@/components/tools/modules/FontGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'salary-calculator': dynamic(() => import('@/components/tools/modules/SalaryCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'audio-cutter': dynamic(() => import('@/components/tools/modules/AudioCutter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pomodoro-timer': dynamic(() => import('@/components/tools/modules/PomodoroTimer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-video-summarizer': dynamic(() => import('@/components/tools/modules/AiVideoSummarizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'youtube-transcript-generator': dynamic(() => import('@/components/tools/modules/YoutubeTranscriptGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-audio-enhancer': dynamic(() => import('@/components/tools/modules/AiAudioEnhancer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'epub-to-pdf': dynamic(() => import('@/components/tools/modules/EpubToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-voice-cloning': dynamic(() => import('@/components/tools/modules/AiVoiceCloning'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-essay-writer': dynamic(() => import('@/components/tools/modules/AiEssayWriter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'protect-pdf': dynamic(() => import('@/components/tools/modules/ProtectPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'invoice-generator': dynamic(() => import('@/components/tools/modules/InvoiceGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'business-card-maker': dynamic(() => import('@/components/tools/modules/BusinessCardMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'regex-tester': dynamic(() => import('@/components/tools/modules/RegexTester'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-avatar-generator': dynamic(() => import('@/components/tools/modules/AiAvatarGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'dice-roller': dynamic(() => import('@/components/tools/modules/DiceRoller'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'profit-margin-calculator': dynamic(() => import('@/components/tools/modules/ProfitMarginCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'speech-to-text': dynamic(() => import('@/components/tools/modules/SpeechToText'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'vimeo-video-downloader': dynamic(() => import('@/components/tools/modules/VimeoVideoDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-epub': dynamic(() => import('@/components/tools/modules/PdfToEpub'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'coin-flipper': dynamic(() => import('@/components/tools/modules/CoinFlipper'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'image-colorizer': dynamic(() => import('@/components/tools/modules/ImageColorizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'exif-data-remover': dynamic(() => import('@/components/tools/modules/ExifDataRemover'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'avi-to-mp4': dynamic(() => import('@/components/tools/modules/AviToMp4'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-compressor': dynamic(() => import('@/components/tools/modules/VideoCompressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-face-swap': dynamic(() => import('@/components/tools/modules/AiFaceSwap'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'xml-sitemap-generator': dynamic(() => import('@/components/tools/modules/XmlSitemapGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'meeting-minutes-generator': dynamic(() => import('@/components/tools/modules/MeetingMinutesGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-cover-letter-generator': dynamic(() => import('@/components/tools/modules/AiCoverLetterGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-excel-formula-generator': dynamic(() => import('@/components/tools/modules/AiExcelFormulaGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-product-description-generator': dynamic(() => import('@/components/tools/modules/AiProductDescriptionGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-presentation-generator': dynamic(() => import('@/components/tools/modules/AiPresentationGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'json-to-csv': dynamic(() => import('@/components/tools/modules/JsonToCsv'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'watermark-pdf': dynamic(() => import('@/components/tools/modules/WatermarkPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-page-delete': dynamic(() => import('@/components/tools/modules/PdfPageDelete'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'png-to-svg': dynamic(() => import('@/components/tools/modules/PngToSvg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'email-signature-generator': dynamic(() => import('@/components/tools/modules/EmailSignatureGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-music-generator': dynamic(() => import('@/components/tools/modules/AiMusicGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'margin-calculator': dynamic(() => import('@/components/tools/modules/MarginCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'morse-code-translator': dynamic(() => import('@/components/tools/modules/MorseCodeTranslator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'cursive-text-generator': dynamic(() => import('@/components/tools/modules/CursiveTextGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'roi-calculator': dynamic(() => import('@/components/tools/modules/RoiCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'vat-calculator': dynamic(() => import('@/components/tools/modules/VatCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'password-strength-checker': dynamic(() => import('@/components/tools/modules/PasswordStrengthChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'js-minifier': dynamic(() => import('@/components/tools/modules/JsMinifier'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'base64-encode-decode': dynamic(() => import('@/components/tools/modules/Base64EncodeDecode'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'text-to-handwriting': dynamic(() => import('@/components/tools/modules/TextToHandwriting'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'receipt-generator': dynamic(() => import('@/components/tools/modules/ReceiptGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-thumbnail-maker': dynamic(() => import('@/components/tools/modules/AiThumbnailMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'secure-note-sharer': dynamic(() => import('@/components/tools/modules/SecureNoteSharer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-to-gif': dynamic(() => import('@/components/tools/modules/VideoToGif'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'image-to-base64': dynamic(() => import('@/components/tools/modules/ImageToBase64'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'subtitle-translator': dynamic(() => import('@/components/tools/modules/SubtitleTranslator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'iban-validator': dynamic(() => import('@/components/tools/modules/IbanValidator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-flowchart-maker': dynamic(() => import('@/components/tools/modules/AiFlowchartMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-code-explainer': dynamic(() => import('@/components/tools/modules/AiCodeExplainer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-sql-generator': dynamic(() => import('@/components/tools/modules/AiSqlGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-recipe-generator': dynamic(() => import('@/components/tools/modules/AiRecipeGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-domain-name-generator': dynamic(() => import('@/components/tools/modules/AiDomainNameGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-mind-map-generator': dynamic(() => import('@/components/tools/modules/AiMindMapGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'csv-to-json': dynamic(() => import('@/components/tools/modules/CsvToJson'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'rotate-pdf': dynamic(() => import('@/components/tools/modules/RotatePdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'extract-images-from-pdf': dynamic(() => import('@/components/tools/modules/ExtractImagesFromPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'sql-formatter': dynamic(() => import('@/components/tools/modules/SqlFormatter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'uuid-generator': dynamic(() => import('@/components/tools/modules/UuidGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'hex-to-rgb-converter': dynamic(() => import('@/components/tools/modules/HexToRgbConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bmr-calculator': dynamic(() => import('@/components/tools/modules/BmrCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'meta-tag-generator': dynamic(() => import('@/components/tools/modules/MetaTagGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'text-to-binary': dynamic(() => import('@/components/tools/modules/TextToBinary'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'binary-to-text': dynamic(() => import('@/components/tools/modules/BinaryToText'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'break-even-calculator': dynamic(() => import('@/components/tools/modules/BreakEvenCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'conversion-rate-calculator': dynamic(() => import('@/components/tools/modules/ConversionRateCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'cpm-calculator': dynamic(() => import('@/components/tools/modules/CpmCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'roas-calculator': dynamic(() => import('@/components/tools/modules/RoasCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'podcast-transcription': dynamic(() => import('@/components/tools/modules/PodcastTranscription'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'css-minifier': dynamic(() => import('@/components/tools/modules/CssMinifier'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'markdown-to-html': dynamic(() => import('@/components/tools/modules/MarkdownToHtml'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'compare-pdf-files': dynamic(() => import('@/components/tools/modules/ComparePdfFiles'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'favicon-generator': dynamic(() => import('@/components/tools/modules/FaviconGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'case-converter': dynamic(() => import('@/components/tools/modules/CaseConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'keyword-density-checker': dynamic(() => import('@/components/tools/modules/KeywordDensityChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'base64-to-image': dynamic(() => import('@/components/tools/modules/Base64ToImage'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'md5-hash-generator': dynamic(() => import('@/components/tools/modules/Md5HashGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'html-minifier': dynamic(() => import('@/components/tools/modules/HtmlMinifier'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'barcode-generator': dynamic(() => import('@/components/tools/modules/BarcodeGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'webp-to-png': dynamic(() => import('@/components/tools/modules/WebpToPng'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'jfif-to-png': dynamic(() => import('@/components/tools/modules/JfifToPng'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'heic-to-png': dynamic(() => import('@/components/tools/modules/HeicToPng'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'convert-to-jpg': dynamic(() => import('@/components/tools/modules/ConvertToJpg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'rotate-image': dynamic(() => import('@/components/tools/modules/RotateImage'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'blur-face': dynamic(() => import('@/components/tools/modules/BlurFace'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'html-to-image': dynamic(() => import('@/components/tools/modules/HtmlToImage'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'flatten-pdf': dynamic(() => import('@/components/tools/modules/FlattenPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'crop-pdf': dynamic(() => import('@/components/tools/modules/CropPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'organize-pdf': dynamic(() => import('@/components/tools/modules/OrganizePdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'extract-pages-from-pdf': dynamic(() => import('@/components/tools/modules/ExtractPagesFromPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'heic-to-pdf': dynamic(() => import('@/components/tools/modules/HeicToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'json-to-xml': dynamic(() => import('@/components/tools/modules/JsonToXml'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'time-converter': dynamic(() => import('@/components/tools/modules/TimeConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pst-to-est': dynamic(() => import('@/components/tools/modules/PstToEst'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'cst-to-est': dynamic(() => import('@/components/tools/modules/CstToEst'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'lbs-to-kg': dynamic(() => import('@/components/tools/modules/LbsToKg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'kg-to-lbs': dynamic(() => import('@/components/tools/modules/KgToLbs'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'feet-to-meters': dynamic(() => import('@/components/tools/modules/FeetToMeters'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'archive-converter': dynamic(() => import('@/components/tools/modules/ArchiveConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-to-mp3': dynamic(() => import('@/components/tools/modules/VideoToMp3'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mp3-to-ogg': dynamic(() => import('@/components/tools/modules/Mp3ToOgg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'wav-compressor': dynamic(() => import('@/components/tools/modules/WavCompressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'crop-video': dynamic(() => import('@/components/tools/modules/CropVideo'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'gif-compressor': dynamic(() => import('@/components/tools/modules/GifCompressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'image-to-gif': dynamic(() => import('@/components/tools/modules/ImageToGif'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mp4-to-gif': dynamic(() => import('@/components/tools/modules/VideoToGif'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'webm-to-gif': dynamic(() => import('@/components/tools/modules/VideoToGif'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mov-to-gif': dynamic(() => import('@/components/tools/modules/VideoToGif'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'add-text-to-photo': dynamic(() => import('@/components/tools/modules/AddTextToPhoto'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'batch-image-editor': dynamic(() => import('@/components/tools/modules/BatchImageEditor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'brand-kit': dynamic(() => import('@/components/tools/modules/BrandKit'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-regex-generator': dynamic(() => import('@/components/tools/modules/AiRegexGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-business-idea-generator': dynamic(() => import('@/components/tools/modules/AiBusinessIdeaGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-slogan-generator': dynamic(() => import('@/components/tools/modules/AiSloganGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-poem-generator': dynamic(() => import('@/components/tools/modules/AiPoemGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pgp-key-generator': dynamic(() => import('@/components/tools/modules/PgpKeyGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'add-page-numbers-to-pdf': dynamic(() => import('@/components/tools/modules/AddPageNumbersToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'html-to-markdown': dynamic(() => import('@/components/tools/modules/HtmlToMarkdown'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'reverse-text-generator': dynamic(() => import('@/components/tools/modules/ReverseTextGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'zalgo-text-generator': dynamic(() => import('@/components/tools/modules/ZalgoTextGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'invisible-text-generator': dynamic(() => import('@/components/tools/modules/InvisibleTextGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ltv-calculator': dynamic(() => import('@/components/tools/modules/LtvCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'cac-calculator': dynamic(() => import('@/components/tools/modules/CacCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'burn-rate-calculator': dynamic(() => import('@/components/tools/modules/BurnRateCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'net-promoter-score-calculator': dynamic(() => import('@/components/tools/modules/NetPromoterScoreCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'xml-to-csv': dynamic(() => import('@/components/tools/modules/XmlToCsv'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-metadata-editor': dynamic(() => import('@/components/tools/modules/PdfMetadataEditor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'svg-editor': dynamic(() => import('@/components/tools/modules/SvgEditor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'robots-txt-generator': dynamic(() => import('@/components/tools/modules/RobotsTxtGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'saas-pricing-calculator': dynamic(() => import('@/components/tools/modules/SaasPricingCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'employee-turnover-calculator': dynamic(() => import('@/components/tools/modules/EmployeeTurnoverCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'mac-address-generator': dynamic(() => import('@/components/tools/modules/MacAddressGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ip-anonymizer': dynamic(() => import('@/components/tools/modules/IpAnonymizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'xml-to-json': dynamic(() => import('@/components/tools/modules/XmlToJson'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'braille-translator': dynamic(() => import('@/components/tools/modules/BrailleTranslator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pan-card-resizer': dynamic(() => import('@/components/tools/modules/PanCardResizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-code-generator': dynamic(() => import('@/components/tools/modules/AiCodeGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'subtitle-generator': dynamic(() => import('@/components/tools/modules/SubtitleGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'svg-to-png-converter': dynamic(() => import('@/components/tools/modules/SvgToPngConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'unit-converter': dynamic(() => import('@/components/tools/modules/UnitConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-blog-title-generator': dynamic(() => import('@/components/tools/modules/AiBlogTitleGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'video-watermark-adder': dynamic(() => import('@/components/tools/modules/VideoWatermarkAdder'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-hashtag-generator': dynamic(() => import('@/components/tools/modules/AiHashtagGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'prompt-library-generator': dynamic(() => import('@/components/tools/modules/PromptLibraryGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'gst-invoice-generator': dynamic(() => import('@/components/tools/modules/GstInvoiceGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'itr-filing-helper': dynamic(() => import('@/components/tools/modules/ItrFilingHelper'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-changelog-generator': dynamic(() => import('@/components/tools/modules/AiChangelogGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'browser-extension': dynamic(() => import('@/components/tools/modules/BrowserExtension'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pan-verification': dynamic(() => import('@/components/tools/modules/PanVerification'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ifsc-code-lookup': dynamic(() => import('@/components/tools/modules/IfscLookup'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'voter-id-form-helper': dynamic(() => import('@/components/tools/modules/VoterIdHelper'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'india-pincode-finder': dynamic(() => import('@/components/tools/modules/PincodeFinder'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'hindi-regional-font-generator': dynamic(() => import('@/components/tools/modules/RegionalFontGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'indian-age-calculator': dynamic(() => import('@/components/tools/modules/IndianAgeCalculator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'cgpa-to-percentage-converter': dynamic(() => import('@/components/tools/modules/CgpaToPercentage'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-to-html': dynamic(() => import('@/components/tools/modules/PdfToHtml'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'html-to-pdf': dynamic(() => import('@/components/tools/modules/HtmlToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'generic-pdf-processor': dynamic(() => import('@/components/tools/modules/GenericPDFProcessor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'apple-music-preview-extractor': dynamic(() => import('@/components/tools/modules/AppleMusicPreviewExtractor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'twitch-thumbnail-downloader': dynamic(() => import('@/components/tools/modules/TwitchThumbnailDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'dailymotion-downloader': dynamic(() => import('@/components/tools/modules/DailymotionDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-placeholder-content-generator': dynamic(() => import('@/components/tools/modules/AiPlaceholderContentGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'brand-color-palette-generator': dynamic(() => import('@/components/tools/modules/BrandColorPaletteGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'marriage-biodata-maker': dynamic(() => import('@/components/tools/modules/MarriageBiodataMaker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'youtube-thumbnail-downloader': dynamic(() => import('@/components/tools/modules/YoutubeThumbnailDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'rental-agreement-generator': dynamic(() => import('@/components/tools/modules/RentalAgreementGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'resume-ats-score-checker': dynamic(() => import('@/components/tools/modules/ResumeAtsScoreChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'instagram-story-downloader': dynamic(() => import('@/components/tools/modules/InstagramStoryDownloader'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'whatsapp-toolkit': dynamic(() => import('@/components/tools/modules/WhatsAppToolkit'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'indian-document-enhancer': dynamic(() => import('@/components/tools/modules/IndianDocumentEnhancer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-complaint-letter-generator': dynamic(() => import('@/components/tools/modules/AiComplaintLetterGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'indian-voice-transcriber': dynamic(() => import('@/components/tools/modules/IndianVoiceTranscriber'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bank-statement-analyser': dynamic(() => import('@/components/tools/modules/BankStatementAnalyser'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-resume-tailor': dynamic(() => import('@/components/tools/modules/AiResumeTailor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-legal-agreement-generator': dynamic(() => import('@/components/tools/modules/AiLegalAgreementGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'social-media-calendar': dynamic(() => import('@/components/tools/modules/SocialMediaCalendar'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-bg-changer': dynamic(() => import('@/components/tools/modules/BulkBgChanger'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ai-bg-changer': dynamic(() => import('@/components/tools/modules/AiBgChanger'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'link-in-bio-builder': dynamic(() => import('@/components/tools/modules/LinkInBioBuilder'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'ist-time-converter': dynamic(() => import('@/components/tools/modules/TimezoneConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'audio-converter': dynamic(() => import('@/components/tools/modules/AudioConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-page-manager': dynamic(() => import('@/components/tools/modules/PdfPageManager'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-qr-code-generator': dynamic(() => import('@/components/tools/modules/BulkQrCodeGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'pdf-ai-summariser': dynamic(() => import('@/components/tools/modules/PdfAiSummariser'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-app-icon-generator': dynamic(() => import('@/components/tools/modules/BulkAppIconGenerator'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-image-watermark': dynamic(() => import('@/components/tools/modules/BulkImageWatermark'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-svg-to-png': dynamic(() => import('@/components/tools/modules/BulkSvgToPng'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-image-resizer': dynamic(() => import('@/components/tools/modules/BulkImageResizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-image-compressor': dynamic(() => import('@/components/tools/modules/BulkImageCompressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-image-to-pdf': dynamic(() => import('@/components/tools/modules/BulkImageToPdf'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-pdf-merger': dynamic(() => import('@/components/tools/modules/BulkPdfMerger'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-pdf-size-reducer': dynamic(() => import('@/components/tools/modules/BulkPdfSizeReducer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-csv-excel-to-json': dynamic(() => import('@/components/tools/modules/BulkCsvExcelToJson'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-url-status-checker': dynamic(() => import('@/components/tools/modules/BulkUrlStatusChecker'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-regex-extractor-replacer': dynamic(() => import('@/components/tools/modules/BulkRegexExtractorReplacer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-subtitle-time-shifter': dynamic(() => import('@/components/tools/modules/BulkSubtitleTimeShifter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-markdown-to-pdf-html': dynamic(() => import('@/components/tools/modules/BulkMarkdownToPdfHtml'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-exif-stripper-injector': dynamic(() => import('@/components/tools/modules/BulkExifStripperInjector'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-audio-converter': dynamic(() => import('@/components/tools/modules/BulkAudioConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-audio-normalizer': dynamic(() => import('@/components/tools/modules/BulkAudioNormalizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-heic-to-jpg': dynamic(() => import('@/components/tools/modules/BulkHeicToJpg'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-ebook-converter': dynamic(() => import('@/components/tools/modules/BulkEbookConverter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-pdf-data-extractor': dynamic(() => import('@/components/tools/modules/BulkPdfDataExtractor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-pdf-form-extractor': dynamic(() => import('@/components/tools/modules/BulkPdfFormExtractor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-face-anonymizer': dynamic(() => import('@/components/tools/modules/BulkFaceAnonymizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-image-to-text-ocr': dynamic(() => import('@/components/tools/modules/BulkImageToTextOcr'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-font-subsetter': dynamic(() => import('@/components/tools/modules/BulkFontSubsetter'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-invoice-receipt-parser': dynamic(() => import('@/components/tools/modules/BulkInvoiceReceiptParser'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-webp-avif-modernizer': dynamic(() => import('@/components/tools/modules/BulkWebpAvifModernizer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-video-compressor': dynamic(() => import('@/components/tools/modules/BulkVideoCompressor'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-video-size-reducer': dynamic(() => import('@/components/tools/modules/BulkVideoSizeReducer'), { ssr: false, loading: () => <SkeletonLoader /> }),
  'bulk-video-subtitle-burner': dynamic(() => import('@/components/tools/modules/BulkVideoSubtitleBurner'), { ssr: false, loading: () => <SkeletonLoader /> }),
};

const ComingSoonTool = dynamic(() => import('@/components/tools/modules/ComingSoonTool'), { ssr: false, loading: () => <SkeletonLoader /> });
const BulkSeoLandingPage = dynamic(() => import('@/components/tools/modules/BulkSeoLandingPage'), { ssr: false, loading: () => <SkeletonLoader /> });

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SEO_PERMUTATIONS } from '@/registry/tools';

export function DynamicModuleWrapper({ slug, category }: { slug: string, category: string }) {
  const DynamicModule = MODULE_REGISTRY[slug];
  
  if (!DynamicModule) {
    const seoPage = SEO_PERMUTATIONS.find(p => p.slug === slug);
    if (seoPage) {
      return (
        <ErrorBoundary>
          <BulkSeoLandingPage slug={slug} category={category} />
        </ErrorBoundary>
      );
    }
    const toolName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return (
      <ErrorBoundary>
        <ComingSoonTool toolName={toolName} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DynamicModule />
    </ErrorBoundary>
  );
}
