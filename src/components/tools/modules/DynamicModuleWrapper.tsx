"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const IMPORT_TIMEOUT_MS = 15_000;

function useImportTimeout(slug: string): boolean {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setTimedOut(true), IMPORT_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slug]);

  if (timedOut) return true;
  return false;
}

function DynamicImportFallback({ slug }: { slug: string }) {
  const timedOut = useImportTimeout(slug);
  if (timedOut) {
    return (
      <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-red-500/30 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mb-6 flex items-center justify-center">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Module Load Timed Out</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
          This tool module took too long to load. Check your internet connection and try refreshing.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl font-medium transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  return <SkeletonLoader />;
}

const SkeletonLoader = () => (
  <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-8 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] mb-6"></div>
    <div className="h-6 bg-[var(--bg-elevated)] rounded-md w-1/3 mb-4"></div>
    <div className="h-4 bg-[var(--bg-elevated)] rounded-md w-1/2 mb-8"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] mb-4"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)]"></div>

  </div>
);

const MODULE_REGISTRY: Record<string, React.ComponentType<any>> = {
  'passport-photo-india': dynamic(() => import('@/components/tools/modules/PassportPhotoIndia'), { 
    ssr: false, 
    loading: () => <DynamicImportFallback slug="passport-photo-india" />
  }),
  'aadhaar-wallet-cropper': dynamic(() => import('@/components/tools/modules/AadhaarWalletCropper'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="aadhaar-wallet-cropper" />
  }),
  'aadhaar-card-masker': dynamic(() => import('@/components/tools/modules/AadhaarMasker'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="aadhaar-card-masker" />
  }),
  'kb-image-compressor': dynamic(() => import('@/components/tools/modules/KbImageCompressor'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="kb-image-compressor" />
  }),
  'image-compressor': dynamic(() => import('@/components/tools/modules/ImageCompressor'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="image-compressor" />
  }),
  'pdf-merger': dynamic(() => import('@/components/tools/modules/PdfMerger'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-merger" />
  }),
  'pdf-compressor': dynamic(() => import('@/components/tools/modules/PdfCompressor'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-compressor" />
  }),
  'qr-code-generator': dynamic(() => import('@/components/tools/modules/QrCodeGenerator'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="qr-code-generator" />
  }),
  'password-generator': dynamic(() => import('@/components/tools/modules/PasswordGenerator'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="password-generator" />
  }),
  'json-formatter': dynamic(() => import('@/components/tools/modules/JsonFormatter'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="json-formatter" />
  }),
  'live-transcription': dynamic(() => import('@/components/tools/modules/LiveTranscription'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="live-transcription" />
  }),
  'image-bulk-converter': dynamic(() => import('@/components/tools/modules/ImageBulkConverter'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="image-bulk-converter" />
  }),
  'esign-pdf': dynamic(() => import('@/components/tools/modules/EsignPdf'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="esign-pdf" />
  }),
  'pdf-form-filler': dynamic(() => import('@/components/tools/modules/PdfFormFiller'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-form-filler" />
  }),
  'pdf-ocr': dynamic(() => import('@/components/tools/modules/PdfOcr'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-ocr" />
  }),
  'resume-builder': dynamic(() => import('@/components/tools/modules/ResumeBuilder'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="resume-builder" />
  }),
  'ai-image-upscaler': dynamic(() => import('@/components/tools/modules/AiImageUpscaler'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="ai-image-upscaler" />
  }),
  'ai-document-chat': dynamic(() => import('@/components/tools/modules/AiDocumentChat'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="ai-document-chat" />
  }),
  'ai-video-subtitler': dynamic(() => import('@/components/tools/modules/AiVideoSubtitler'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="ai-video-subtitler" />
  }),
  'mp3-compressor': dynamic(() => import('@/components/tools/modules/Mp3Compressor'), { ssr: false, loading: () => <DynamicImportFallback slug="mp3-compressor" /> }),
  'gif-to-mp4': dynamic(() => import('@/components/tools/modules/GifToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-to-mp4" /> }),
  'video-trimmer': dynamic(() => import('@/components/tools/modules/VideoTrimmer'), { ssr: false, loading: () => <DynamicImportFallback slug="video-trimmer" /> }),
  'privacy-cleaner': dynamic(() => import('@/components/tools/modules/PrivacyCleaner'), { ssr: false, loading: () => <DynamicImportFallback slug="privacy-cleaner" /> }),
  'ai-translator': dynamic(() => import('@/components/tools/modules/AiTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-translator" /> }),
  'pdf-to-word': dynamic(() => import('@/components/tools/modules/PdfToWord'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-word" /> }),
  'ai-image-generator': dynamic(() => import('@/components/tools/modules/AiImageGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-image-generator" /> }),
  'speed-test': dynamic(() => import('@/components/tools/modules/SpeedTest'), { ssr: false, loading: () => <DynamicImportFallback slug="speed-test" /> }),
  'compress-image-to-50kb': dynamic(() => import('@/components/tools/modules/CompressImageTo50kb'), { ssr: false, loading: () => <DynamicImportFallback slug="compress-image-to-50kb" /> }),
  'currency-converter': dynamic(() => import('@/components/tools/modules/CurrencyConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="currency-converter" /> }),
  'logo-maker': dynamic(() => import('@/components/tools/modules/LogoMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="logo-maker" /> }),
  'mp4-to-mp3': dynamic(() => import('@/components/tools/modules/Mp4ToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="mp4-to-mp3" /> }),
  'mov-to-mp3': dynamic(() => import('@/components/tools/modules/MovToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="mov-to-mp3" /> }),
  'webm-to-mp3': dynamic(() => import('@/components/tools/modules/WebmToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="webm-to-mp3" /> }),
  'word-to-pdf': dynamic(() => import('@/components/tools/modules/WordToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="word-to-pdf" /> }),
  'percentage-calculator': dynamic(() => import('@/components/tools/modules/PercentageCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="percentage-calculator" /> }),
  'jpg-to-pdf': dynamic(() => import('@/components/tools/modules/JpgToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="jpg-to-pdf" /> }),
  'age-calculator': dynamic(() => import('@/components/tools/modules/AgeCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="age-calculator" /> }),
  'heic-to-jpg': dynamic(() => import('@/components/tools/modules/HeicToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="heic-to-jpg" /> }),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/modules/PdfToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-jpg" /> }),
  'pdf-to-ppt': dynamic(() => import('@/components/tools/modules/PdfToPpt'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-ppt" /> }),
  'fancy-text-generator': dynamic(() => import('@/components/tools/modules/FancyTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="fancy-text-generator" /> }),
  'background-remover': dynamic(() => import('@/components/tools/modules/BackgroundRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="background-remover" /> }),
  'webp-to-jpg': dynamic(() => import('@/components/tools/modules/WebpToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="webp-to-jpg" /> }),
  'wheel-of-names': dynamic(() => import('@/components/tools/modules/WheelOfNames'), { ssr: false, loading: () => <DynamicImportFallback slug="wheel-of-names" /> }),
  'object-remover': dynamic(() => import('@/components/tools/modules/ObjectRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="object-remover" /> }),
  'ppt-to-pdf': dynamic(() => import('@/components/tools/modules/PptToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="ppt-to-pdf" /> }),
  'temporary-email-generator': dynamic(() => import('@/components/tools/modules/TemporaryEmailGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="temporary-email-generator" /> }),
  'screen-recorder-extension': dynamic(() => import('@/components/tools/modules/ScreenRecorderExtension'), { ssr: false, loading: () => <DynamicImportFallback slug="screen-recorder-extension" /> }),
  'to-do-list': dynamic(() => import('@/components/tools/modules/ToDoList'), { ssr: false, loading: () => <DynamicImportFallback slug="to-do-list" /> }),
  'excel-to-pdf': dynamic(() => import('@/components/tools/modules/ExcelToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="excel-to-pdf" /> }),
  'emi-calculator': dynamic(() => import('@/components/tools/modules/EmiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="emi-calculator" /> }),
  'character-counter': dynamic(() => import('@/components/tools/modules/CharacterCounter'), { ssr: false, loading: () => <DynamicImportFallback slug="character-counter" /> }),
  'video-to-text-transcription': dynamic(() => import('@/components/tools/modules/VideoToTextTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-text-transcription" /> }),
  'word-counter': dynamic(() => import('@/components/tools/modules/WordCounter'), { ssr: false, loading: () => <DynamicImportFallback slug="word-counter" /> }),
  'crop-image': dynamic(() => import('@/components/tools/modules/CropImage'), { ssr: false, loading: () => <DynamicImportFallback slug="crop-image" /> }),
  'social-media-post-maker': dynamic(() => import('@/components/tools/modules/SocialMediaPostMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="social-media-post-maker" /> }),
  'mkv-to-mp4': dynamic(() => import('@/components/tools/modules/MkvToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="mkv-to-mp4" /> }),
  'text-to-speech-tts': dynamic(() => import('@/components/tools/modules/TextToSpeechTts'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-speech-tts" /> }),
  'ai-paraphrasing-tool': dynamic(() => import('@/components/tools/modules/AiParaphrasingTool'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-paraphrasing-tool" /> }),
  'random-number-generator': dynamic(() => import('@/components/tools/modules/RandomNumberGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="random-number-generator" /> }),
  'url-shortener': dynamic(() => import('@/components/tools/modules/UrlShortener'), { ssr: false, loading: () => <DynamicImportFallback slug="url-shortener" /> }),
  'pdf-to-excel': dynamic(() => import('@/components/tools/modules/PdfToExcel'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-excel" /> }),
  'unlock-pdf': dynamic(() => import('@/components/tools/modules/UnlockPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="unlock-pdf" /> }),
  'image-enhancer': dynamic(() => import('@/components/tools/modules/ImageEnhancer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-enhancer" /> }),
  'sip-calculator': dynamic(() => import('@/components/tools/modules/SipCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="sip-calculator" /> }),
  'bmi-calculator': dynamic(() => import('@/components/tools/modules/BmiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="bmi-calculator" /> }),
  'audio-to-text-transcription': dynamic(() => import('@/components/tools/modules/AudioToTextTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-to-text-transcription" /> }),
  'meme-generator': dynamic(() => import('@/components/tools/modules/MemeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="meme-generator" /> }),
  'mov-to-mp4': dynamic(() => import('@/components/tools/modules/MovToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="mov-to-mp4" /> }),
  'gst-calculator': dynamic(() => import('@/components/tools/modules/GstCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="gst-calculator" /> }),
  'image-resizer': dynamic(() => import('@/components/tools/modules/ImageResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-resizer" /> }),
  'diff-checker': dynamic(() => import('@/components/tools/modules/DiffChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="diff-checker" /> }),
  'webm-to-mp4': dynamic(() => import('@/components/tools/modules/WebmToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="webm-to-mp4" /> }),
  'ip-address-lookup': dynamic(() => import('@/components/tools/modules/IpAddressLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="ip-address-lookup" /> }),
  'photo-retoucher': dynamic(() => import('@/components/tools/modules/PhotoRetoucher'), { ssr: false, loading: () => <DynamicImportFallback slug="photo-retoucher" /> }),
  'pdf-splitter': dynamic(() => import('@/components/tools/modules/PdfSplitter'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-splitter" /> }),
  'font-generator': dynamic(() => import('@/components/tools/modules/FontGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="font-generator" /> }),
  'salary-calculator': dynamic(() => import('@/components/tools/modules/SalaryCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="salary-calculator" /> }),
  'audio-cutter': dynamic(() => import('@/components/tools/modules/AudioCutter'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-cutter" /> }),
  'pomodoro-timer': dynamic(() => import('@/components/tools/modules/PomodoroTimer'), { ssr: false, loading: () => <DynamicImportFallback slug="pomodoro-timer" /> }),
  'youtube-transcript-generator': dynamic(() => import('@/components/tools/modules/YoutubeTranscriptGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="youtube-transcript-generator" /> }),
  'epub-to-pdf': dynamic(() => import('@/components/tools/modules/EpubToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="epub-to-pdf" /> }),
  'protect-pdf': dynamic(() => import('@/components/tools/modules/ProtectPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="protect-pdf" /> }),
  'invoice-generator': dynamic(() => import('@/components/tools/modules/InvoiceGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="invoice-generator" /> }),
  'business-card-maker': dynamic(() => import('@/components/tools/modules/BusinessCardMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="business-card-maker" /> }),
  'regex-tester': dynamic(() => import('@/components/tools/modules/RegexTester'), { ssr: false, loading: () => <DynamicImportFallback slug="regex-tester" /> }),
  'dice-roller': dynamic(() => import('@/components/tools/modules/DiceRoller'), { ssr: false, loading: () => <DynamicImportFallback slug="dice-roller" /> }),
  'profit-margin-calculator': dynamic(() => import('@/components/tools/modules/ProfitMarginCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="profit-margin-calculator" /> }),
  'speech-to-text': dynamic(() => import('@/components/tools/modules/SpeechToText'), { ssr: false, loading: () => <DynamicImportFallback slug="speech-to-text" /> }),
  'pdf-to-epub': dynamic(() => import('@/components/tools/modules/PdfToEpub'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-epub" /> }),
  'coin-flipper': dynamic(() => import('@/components/tools/modules/CoinFlipper'), { ssr: false, loading: () => <DynamicImportFallback slug="coin-flipper" /> }),
  'image-colorizer': dynamic(() => import('@/components/tools/modules/ImageColorizer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-colorizer" /> }),
  'exif-data-remover': dynamic(() => import('@/components/tools/modules/ExifDataRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="exif-data-remover" /> }),
  'avi-to-mp4': dynamic(() => import('@/components/tools/modules/AviToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="avi-to-mp4" /> }),
  'mp4-to-mkv': dynamic(() => import('@/components/tools/modules/Mp4ToMkv'), { ssr: false, loading: () => <DynamicImportFallback slug="mp4-to-mkv" /> }),
  'mp4-to-mov': dynamic(() => import('@/components/tools/modules/Mp4ToMov'), { ssr: false, loading: () => <DynamicImportFallback slug="mp4-to-mov" /> }),
  'mkv-to-mov': dynamic(() => import('@/components/tools/modules/MkvToMov'), { ssr: false, loading: () => <DynamicImportFallback slug="mkv-to-mov" /> }),
  'mov-to-mkv': dynamic(() => import('@/components/tools/modules/MovToMkv'), { ssr: false, loading: () => <DynamicImportFallback slug="mov-to-mkv" /> }),
  'video-compressor': dynamic(() => import('@/components/tools/modules/VideoCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="video-compressor" /> }),
  'ai-face-swap': dynamic(() => import('@/components/tools/modules/AiFaceSwap'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-face-swap" /> }),
  'xml-sitemap-generator': dynamic(() => import('@/components/tools/modules/XmlSitemapGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="xml-sitemap-generator" /> }),
  'meeting-minutes-generator': dynamic(() => import('@/components/tools/modules/MeetingMinutesGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="meeting-minutes-generator" /> }),
  'ai-cover-letter-generator': dynamic(() => import('@/components/tools/modules/AiCoverLetterGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-cover-letter-generator" /> }),
  'json-to-csv': dynamic(() => import('@/components/tools/modules/JsonToCsv'), { ssr: false, loading: () => <DynamicImportFallback slug="json-to-csv" /> }),
  'watermark-pdf': dynamic(() => import('@/components/tools/modules/WatermarkPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="watermark-pdf" /> }),
  'pdf-page-delete': dynamic(() => import('@/components/tools/modules/PdfPageDelete'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-page-delete" /> }),
  'png-to-svg': dynamic(() => import('@/components/tools/modules/PngToSvg'), { ssr: false, loading: () => <DynamicImportFallback slug="png-to-svg" /> }),
  'email-signature-generator': dynamic(() => import('@/components/tools/modules/EmailSignatureGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="email-signature-generator" /> }),
  'margin-calculator': dynamic(() => import('@/components/tools/modules/MarginCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="margin-calculator" /> }),
  'morse-code-translator': dynamic(() => import('@/components/tools/modules/MorseCodeTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="morse-code-translator" /> }),
  'cursive-text-generator': dynamic(() => import('@/components/tools/modules/CursiveTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="cursive-text-generator" /> }),
  'roi-calculator': dynamic(() => import('@/components/tools/modules/RoiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="roi-calculator" /> }),
  'vat-calculator': dynamic(() => import('@/components/tools/modules/VatCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="vat-calculator" /> }),
  'password-strength-checker': dynamic(() => import('@/components/tools/modules/PasswordStrengthChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="password-strength-checker" /> }),
  'js-minifier': dynamic(() => import('@/components/tools/modules/JsMinifier'), { ssr: false, loading: () => <DynamicImportFallback slug="js-minifier" /> }),
  'base64-encode-decode': dynamic(() => import('@/components/tools/modules/Base64EncodeDecode'), { ssr: false, loading: () => <DynamicImportFallback slug="base64-encode-decode" /> }),
  'text-to-handwriting': dynamic(() => import('@/components/tools/modules/TextToHandwriting'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-handwriting" /> }),
  'receipt-generator': dynamic(() => import('@/components/tools/modules/ReceiptGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="receipt-generator" /> }),
  'ai-thumbnail-maker': dynamic(() => import('@/components/tools/modules/AiThumbnailMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-thumbnail-maker" /> }),
  'secure-note-sharer': dynamic(() => import('@/components/tools/modules/SecureNoteSharer'), { ssr: false, loading: () => <DynamicImportFallback slug="secure-note-sharer" /> }),
  'video-to-gif': dynamic(() => import('@/components/tools/modules/VideoToGif'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-gif" /> }),
  'image-to-base64': dynamic(() => import('@/components/tools/modules/ImageToBase64'), { ssr: false, loading: () => <DynamicImportFallback slug="image-to-base64" /> }),
  'subtitle-translator': dynamic(() => import('@/components/tools/modules/SubtitleTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="subtitle-translator" /> }),
  'iban-validator': dynamic(() => import('@/components/tools/modules/IbanValidator'), { ssr: false, loading: () => <DynamicImportFallback slug="iban-validator" /> }),
  'csv-to-json': dynamic(() => import('@/components/tools/modules/CsvToJson'), { ssr: false, loading: () => <DynamicImportFallback slug="csv-to-json" /> }),
  'csv-to-xml': dynamic(() => import('@/components/tools/modules/CsvToXml'), { ssr: false, loading: () => <DynamicImportFallback slug="csv-to-xml" /> }),
  'rotate-pdf': dynamic(() => import('@/components/tools/modules/RotatePdf'), { ssr: false, loading: () => <DynamicImportFallback slug="rotate-pdf" /> }),
  'extract-images-from-pdf': dynamic(() => import('@/components/tools/modules/ExtractImagesFromPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="extract-images-from-pdf" /> }),
  'sql-formatter': dynamic(() => import('@/components/tools/modules/SqlFormatter'), { ssr: false, loading: () => <DynamicImportFallback slug="sql-formatter" /> }),
  'uuid-generator': dynamic(() => import('@/components/tools/modules/UuidGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="uuid-generator" /> }),
  'hex-to-rgb-converter': dynamic(() => import('@/components/tools/modules/HexToRgbConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="hex-to-rgb-converter" /> }),
  'bmr-calculator': dynamic(() => import('@/components/tools/modules/BmrCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="bmr-calculator" /> }),
  'meta-tag-generator': dynamic(() => import('@/components/tools/modules/MetaTagGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="meta-tag-generator" /> }),
  'text-to-binary': dynamic(() => import('@/components/tools/modules/TextToBinary'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-binary" /> }),
  'binary-to-text': dynamic(() => import('@/components/tools/modules/BinaryToText'), { ssr: false, loading: () => <DynamicImportFallback slug="binary-to-text" /> }),
  'break-even-calculator': dynamic(() => import('@/components/tools/modules/BreakEvenCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="break-even-calculator" /> }),
  'conversion-rate-calculator': dynamic(() => import('@/components/tools/modules/ConversionRateCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="conversion-rate-calculator" /> }),
  'cpm-calculator': dynamic(() => import('@/components/tools/modules/CpmCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="cpm-calculator" /> }),
  'roas-calculator': dynamic(() => import('@/components/tools/modules/RoasCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="roas-calculator" /> }),
  'podcast-transcription': dynamic(() => import('@/components/tools/modules/PodcastTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="podcast-transcription" /> }),
  'css-minifier': dynamic(() => import('@/components/tools/modules/CssMinifier'), { ssr: false, loading: () => <DynamicImportFallback slug="css-minifier" /> }),
  'markdown-to-html': dynamic(() => import('@/components/tools/modules/MarkdownToHtml'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-to-html" /> }),
  'text-to-markdown': dynamic(() => import('@/components/tools/modules/TextToMarkdown'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-markdown" /> }),
  'compare-pdf-files': dynamic(() => import('@/components/tools/modules/ComparePdfFiles'), { ssr: false, loading: () => <DynamicImportFallback slug="compare-pdf-files" /> }),
  'favicon-generator': dynamic(() => import('@/components/tools/modules/FaviconGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="favicon-generator" /> }),
  'case-converter': dynamic(() => import('@/components/tools/modules/CaseConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="case-converter" /> }),
  'keyword-density-checker': dynamic(() => import('@/components/tools/modules/KeywordDensityChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="keyword-density-checker" /> }),
  'base64-to-image': dynamic(() => import('@/components/tools/modules/Base64ToImage'), { ssr: false, loading: () => <DynamicImportFallback slug="base64-to-image" /> }),
  'md5-hash-generator': dynamic(() => import('@/components/tools/modules/Md5HashGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="md5-hash-generator" /> }),
  'html-minifier': dynamic(() => import('@/components/tools/modules/HtmlMinifier'), { ssr: false, loading: () => <DynamicImportFallback slug="html-minifier" /> }),
  'barcode-generator': dynamic(() => import('@/components/tools/modules/BarcodeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="barcode-generator" /> }),
  'webp-to-png': dynamic(() => import('@/components/tools/modules/WebpToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="webp-to-png" /> }),
  'jfif-to-png': dynamic(() => import('@/components/tools/modules/JfifToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="jfif-to-png" /> }),
  'heic-to-png': dynamic(() => import('@/components/tools/modules/HeicToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="heic-to-png" /> }),
  'convert-to-jpg': dynamic(() => import('@/components/tools/modules/ConvertToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="convert-to-jpg" /> }),
  'rotate-image': dynamic(() => import('@/components/tools/modules/RotateImage'), { ssr: false, loading: () => <DynamicImportFallback slug="rotate-image" /> }),
  'blur-face': dynamic(() => import('@/components/tools/modules/BlurFace'), { ssr: false, loading: () => <DynamicImportFallback slug="blur-face" /> }),
  'html-to-image': dynamic(() => import('@/components/tools/modules/HtmlToImage'), { ssr: false, loading: () => <DynamicImportFallback slug="html-to-image" /> }),
  'heic-to-pdf': dynamic(() => import('@/components/tools/modules/HeicToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="heic-to-pdf" /> }),
  'json-to-xml': dynamic(() => import('@/components/tools/modules/JsonToXml'), { ssr: false, loading: () => <DynamicImportFallback slug="json-to-xml" /> }),
  'time-converter': dynamic(() => import('@/components/tools/modules/TimeConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="time-converter" /> }),
  'archive-converter': dynamic(() => import('@/components/tools/modules/ArchiveConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="archive-converter" /> }),
  'video-to-mp3': dynamic(() => import('@/components/tools/modules/VideoToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-mp3" /> }),
  'crop-video': dynamic(() => import('@/components/tools/modules/CropVideo'), { ssr: false, loading: () => <DynamicImportFallback slug="crop-video" /> }),
  'add-text-to-photo': dynamic(() => import('@/components/tools/modules/AddTextToPhoto'), { ssr: false, loading: () => <DynamicImportFallback slug="add-text-to-photo" /> }),
  'batch-image-editor': dynamic(() => import('@/components/tools/modules/BatchImageEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="batch-image-editor" /> }),
  'brand-kit': dynamic(() => import('@/components/tools/modules/BrandKit'), { ssr: false, loading: () => <DynamicImportFallback slug="brand-kit" /> }),
  'pgp-key-generator': dynamic(() => import('@/components/tools/modules/PgpKeyGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="pgp-key-generator" /> }),
  'add-page-numbers-to-pdf': dynamic(() => import('@/components/tools/modules/AddPageNumbersToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="add-page-numbers-to-pdf" /> }),
  'html-to-markdown': dynamic(() => import('@/components/tools/modules/HtmlToMarkdown'), { ssr: false, loading: () => <DynamicImportFallback slug="html-to-markdown" /> }),
  'markdown-to-text': dynamic(() => import('@/components/tools/modules/MarkdownToText'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-to-text" /> }),
  'reverse-text-generator': dynamic(() => import('@/components/tools/modules/ReverseTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="reverse-text-generator" /> }),
  'zalgo-text-generator': dynamic(() => import('@/components/tools/modules/ZalgoTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="zalgo-text-generator" /> }),
  'invisible-text-generator': dynamic(() => import('@/components/tools/modules/InvisibleTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="invisible-text-generator" /> }),
  'ltv-calculator': dynamic(() => import('@/components/tools/modules/LtvCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="ltv-calculator" /> }),
  'cac-calculator': dynamic(() => import('@/components/tools/modules/CacCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="cac-calculator" /> }),
  'burn-rate-calculator': dynamic(() => import('@/components/tools/modules/BurnRateCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="burn-rate-calculator" /> }),
  'net-promoter-score-calculator': dynamic(() => import('@/components/tools/modules/NetPromoterScoreCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="net-promoter-score-calculator" /> }),
  'xml-to-csv': dynamic(() => import('@/components/tools/modules/XmlToCsv'), { ssr: false, loading: () => <DynamicImportFallback slug="xml-to-csv" /> }),
  'pdf-metadata-editor': dynamic(() => import('@/components/tools/modules/PdfMetadataEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-metadata-editor" /> }),
  'svg-editor': dynamic(() => import('@/components/tools/modules/SvgEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="svg-editor" /> }),
  'robots-txt-generator': dynamic(() => import('@/components/tools/modules/RobotsTxtGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="robots-txt-generator" /> }),
  'saas-pricing-calculator': dynamic(() => import('@/components/tools/modules/SaasPricingCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="saas-pricing-calculator" /> }),
  'employee-turnover-calculator': dynamic(() => import('@/components/tools/modules/EmployeeTurnoverCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="employee-turnover-calculator" /> }),
  'mac-address-generator': dynamic(() => import('@/components/tools/modules/MacAddressGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="mac-address-generator" /> }),
  'ip-anonymizer': dynamic(() => import('@/components/tools/modules/IpAnonymizer'), { ssr: false, loading: () => <DynamicImportFallback slug="ip-anonymizer" /> }),
  'xml-to-json': dynamic(() => import('@/components/tools/modules/XmlToJson'), { ssr: false, loading: () => <DynamicImportFallback slug="xml-to-json" /> }),
  'braille-translator': dynamic(() => import('@/components/tools/modules/BrailleTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="braille-translator" /> }),
  'pan-card-resizer': dynamic(() => import('@/components/tools/modules/PanCardResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="pan-card-resizer" /> }),
  'subtitle-generator': dynamic(() => import('@/components/tools/modules/SubtitleGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="subtitle-generator" /> }),
  'svg-to-png-converter': dynamic(() => import('@/components/tools/modules/SvgToPngConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="svg-to-png-converter" /> }),
  'unit-converter': dynamic(() => import('@/components/tools/modules/UnitConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="unit-converter" /> }),
  'video-watermark-adder': dynamic(() => import('@/components/tools/modules/VideoWatermarkAdder'), { ssr: false, loading: () => <DynamicImportFallback slug="video-watermark-adder" /> }),
  'prompt-library-generator': dynamic(() => import('@/components/tools/modules/PromptLibraryGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="prompt-library-generator" /> }),
  'gst-invoice-generator': dynamic(() => import('@/components/tools/modules/GstInvoiceGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="gst-invoice-generator" /> }),
  'itr-filing-helper': dynamic(() => import('@/components/tools/modules/ItrFilingHelper'), { ssr: false, loading: () => <DynamicImportFallback slug="itr-filing-helper" /> }),
  'browser-extension': dynamic(() => import('@/components/tools/modules/BrowserExtension'), { ssr: false, loading: () => <DynamicImportFallback slug="browser-extension" /> }),
  'pan-verification': dynamic(() => import('@/components/tools/modules/PanVerification'), { ssr: false, loading: () => <DynamicImportFallback slug="pan-verification" /> }),
  'ifsc-code-lookup': dynamic(() => import('@/components/tools/modules/IfscLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="ifsc-code-lookup" /> }),
  'voter-id-form-helper': dynamic(() => import('@/components/tools/modules/VoterIdHelper'), { ssr: false, loading: () => <DynamicImportFallback slug="voter-id-form-helper" /> }),
  'india-pincode-finder': dynamic(() => import('@/components/tools/modules/PincodeFinder'), { ssr: false, loading: () => <DynamicImportFallback slug="india-pincode-finder" /> }),
  'hindi-regional-font-generator': dynamic(() => import('@/components/tools/modules/RegionalFontGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="hindi-regional-font-generator" /> }),
  'indian-age-calculator': dynamic(() => import('@/components/tools/modules/IndianAgeCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-age-calculator" /> }),
  'cgpa-to-percentage-converter': dynamic(() => import('@/components/tools/modules/CgpaToPercentage'), { ssr: false, loading: () => <DynamicImportFallback slug="cgpa-to-percentage-converter" /> }),
  'pdf-to-html': dynamic(() => import('@/components/tools/modules/PdfToHtml'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-html" /> }),
  'html-to-pdf': dynamic(() => import('@/components/tools/modules/HtmlToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="html-to-pdf" /> }),
  'generic-pdf-processor': dynamic(() => import('@/components/tools/modules/GenericPDFProcessor'), { ssr: false, loading: () => <DynamicImportFallback slug="generic-pdf-processor" /> }),
  'apple-music-preview-extractor': dynamic(() => import('@/components/tools/modules/AppleMusicPreviewExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="apple-music-preview-extractor" /> }),
  'brand-color-palette-generator': dynamic(() => import('@/components/tools/modules/BrandColorPaletteGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="brand-color-palette-generator" /> }),
  'marriage-biodata-maker': dynamic(() => import('@/components/tools/modules/MarriageBiodataMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="marriage-biodata-maker" /> }),
  'rental-agreement-generator': dynamic(() => import('@/components/tools/modules/RentalAgreementGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="rental-agreement-generator" /> }),
  'resume-ats-score-checker': dynamic(() => import('@/components/tools/modules/ResumeAtsScoreChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="resume-ats-score-checker" /> }),
  'whatsapp-toolkit': dynamic(() => import('@/components/tools/modules/WhatsAppToolkit'), { ssr: false, loading: () => <DynamicImportFallback slug="whatsapp-toolkit" /> }),
  'indian-document-enhancer': dynamic(() => import('@/components/tools/modules/IndianDocumentEnhancer'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-document-enhancer" /> }),
  'indian-voice-transcriber': dynamic(() => import('@/components/tools/modules/IndianVoiceTranscriber'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-voice-transcriber" /> }),
  'bank-statement-analyser': dynamic(() => import('@/components/tools/modules/BankStatementAnalyser'), { ssr: false, loading: () => <DynamicImportFallback slug="bank-statement-analyser" /> }),
  'social-media-calendar': dynamic(() => import('@/components/tools/modules/SocialMediaCalendar'), { ssr: false, loading: () => <DynamicImportFallback slug="social-media-calendar" /> }),
  'bulk-bg-changer': dynamic(() => import('@/components/tools/modules/BulkBgChanger'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-bg-changer" /> }),
  'ai-bg-changer': dynamic(() => import('@/components/tools/modules/AiBgChanger'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-bg-changer" /> }),
  'link-in-bio-builder': dynamic(() => import('@/components/tools/modules/LinkInBioBuilder'), { ssr: false, loading: () => <DynamicImportFallback slug="link-in-bio-builder" /> }),
  'ist-time-converter': dynamic(() => import('@/components/tools/modules/TimezoneConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="ist-time-converter" /> }),
  'audio-converter': dynamic(() => import('@/components/tools/modules/AudioConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-converter" /> }),
  'pdf-page-manager': dynamic(() => import('@/components/tools/modules/PdfPageManager'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-page-manager" /> }),
  'bulk-qr-code-generator': dynamic(() => import('@/components/tools/modules/BulkQrCodeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-qr-code-generator" /> }),
  'pdf-ai-summariser': dynamic(() => import('@/components/tools/modules/PdfAiSummariser'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-ai-summariser" /> }),
  'bulk-app-icon-generator': dynamic(() => import('@/components/tools/modules/BulkAppIconGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-app-icon-generator" /> }),
  'bulk-image-watermark': dynamic(() => import('@/components/tools/modules/BulkImageWatermark'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-watermark" /> }),
  'bulk-svg-to-png': dynamic(() => import('@/components/tools/modules/BulkSvgToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-svg-to-png" /> }),
  'bulk-image-resizer': dynamic(() => import('@/components/tools/modules/BulkImageResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-resizer" /> }),
  'bulk-image-compressor': dynamic(() => import('@/components/tools/modules/BulkImageCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-compressor" /> }),
  'bulk-image-to-pdf': dynamic(() => import('@/components/tools/modules/BulkImageToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-to-pdf" /> }),
  'bulk-pdf-merger': dynamic(() => import('@/components/tools/modules/BulkPdfMerger'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-merger" /> }),
  'bulk-pdf-size-reducer': dynamic(() => import('@/components/tools/modules/BulkPdfSizeReducer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-size-reducer" /> }),
  'bulk-csv-excel-to-json': dynamic(() => import('@/components/tools/modules/BulkCsvExcelToJson'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-csv-excel-to-json" /> }),
  'bulk-url-status-checker': dynamic(() => import('@/components/tools/modules/BulkUrlStatusChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-url-status-checker" /> }),
  'bulk-regex-extractor-replacer': dynamic(() => import('@/components/tools/modules/BulkRegexExtractorReplacer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-regex-extractor-replacer" /> }),
  'bulk-subtitle-time-shifter': dynamic(() => import('@/components/tools/modules/BulkSubtitleTimeShifter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-subtitle-time-shifter" /> }),
  'bulk-markdown-to-pdf-html': dynamic(() => import('@/components/tools/modules/BulkMarkdownToPdfHtml'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-markdown-to-pdf-html" /> }),
  'bulk-exif-stripper-injector': dynamic(() => import('@/components/tools/modules/BulkExifStripperInjector'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-exif-stripper-injector" /> }),
  'bulk-audio-converter': dynamic(() => import('@/components/tools/modules/BulkAudioConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-audio-converter" /> }),
  'bulk-audio-normalizer': dynamic(() => import('@/components/tools/modules/BulkAudioNormalizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-audio-normalizer" /> }),
  'bulk-heic-to-jpg': dynamic(() => import('@/components/tools/modules/BulkHeicToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-heic-to-jpg" /> }),
  'bulk-ebook-converter': dynamic(() => import('@/components/tools/modules/BulkEbookConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-ebook-converter" /> }),
  'bulk-pdf-data-extractor': dynamic(() => import('@/components/tools/modules/BulkPdfDataExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-data-extractor" /> }),
  'bulk-pdf-form-extractor': dynamic(() => import('@/components/tools/modules/BulkPdfFormExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-form-extractor" /> }),
  'bulk-face-anonymizer': dynamic(() => import('@/components/tools/modules/BulkFaceAnonymizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-face-anonymizer" /> }),
  'bulk-image-to-text-ocr': dynamic(() => import('@/components/tools/modules/BulkImageToTextOcr'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-to-text-ocr" /> }),
  'bulk-font-subsetter': dynamic(() => import('@/components/tools/modules/BulkFontSubsetter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-font-subsetter" /> }),
  'bulk-invoice-receipt-parser': dynamic(() => import('@/components/tools/modules/BulkInvoiceReceiptParser'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-invoice-receipt-parser" /> }),
  'bulk-webp-avif-modernizer': dynamic(() => import('@/components/tools/modules/BulkWebpAvifModernizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-webp-avif-modernizer" /> }),
  'bulk-png-to-webp': dynamic(() => import('@/components/tools/modules/BulkPngToWebp'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-png-to-webp" /> }),
  'bulk-jpg-to-webp': dynamic(() => import('@/components/tools/modules/BulkJpgToWebp'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-jpg-to-webp" /> }),
  'bulk-webp-to-png': dynamic(() => import('@/components/tools/modules/BulkWebpToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-webp-to-png" /> }),
  'bulk-png-to-jpg': dynamic(() => import('@/components/tools/modules/BulkPngToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-png-to-jpg" /> }),
  'bulk-jpg-to-png': dynamic(() => import('@/components/tools/modules/BulkJpgToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-jpg-to-png" /> }),
  'bulk-resize-images': dynamic(() => import('@/components/tools/modules/BulkResizeImages'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-resize-images" /> }),
  'bulk-compress-png': dynamic(() => import('@/components/tools/modules/BulkCompressPng'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-compress-png" /> }),
  'bulk-compress-jpg': dynamic(() => import('@/components/tools/modules/BulkCompressJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-compress-jpg" /> }),
  'bulk-compress-pdf': dynamic(() => import('@/components/tools/modules/BulkCompressPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-compress-pdf" /> }),
  'bulk-pdf-to-jpg': dynamic(() => import('@/components/tools/modules/BulkPdfToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-to-jpg" /> }),
  'bulk-mp3-to-wav': dynamic(() => import('@/components/tools/modules/BulkMp3ToWav'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-mp3-to-wav" /> }),
  'bulk-wav-to-mp3': dynamic(() => import('@/components/tools/modules/BulkWavToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-wav-to-mp3" /> }),
  'bulk-mkv-to-mp4': dynamic(() => import('@/components/tools/modules/BulkMkvToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-mkv-to-mp4" /> }),
  'bulk-compress-mp4': dynamic(() => import('@/components/tools/modules/BulkCompressMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-compress-mp4" /> }),
  'bulk-strip-exif': dynamic(() => import('@/components/tools/modules/BulkStripExif'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-strip-exif" /> }),
  'domain-availability-checker': dynamic(() => import('@/components/tools/modules/DomainAvailabilityChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="domain-availability-checker" /> }),
  'pronunciation-tool': dynamic(() => import('@/components/tools/modules/PronunciationTool'), { ssr: false, loading: () => <DynamicImportFallback slug="pronunciation-tool" /> }),
  'bulk-video-compressor': dynamic(() => import('@/components/tools/modules/BulkVideoCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-compressor" /> }),
  'bulk-video-size-reducer': dynamic(() => import('@/components/tools/modules/BulkVideoSizeReducer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-size-reducer" /> }),
  'bulk-video-subtitle-burner': dynamic(() => import('@/components/tools/modules/BulkVideoSubtitleBurner'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-subtitle-burner" /> }),
  'tax-saving-calculator': dynamic(() => import('@/components/tools/modules/TaxSavingCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="tax-saving-calculator" /> }),
  'gstin-lookup': dynamic(() => import('@/components/tools/modules/GstinLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="gstin-lookup" /> }),
  'seller-profit-calculator': dynamic(() => import('@/components/tools/modules/SellerProfitCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="seller-profit-calculator" /> }),
  'complaint-letter-generator': dynamic(() => import('@/components/tools/modules/ComplaintLetterGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="complaint-letter-generator" /> }),
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
