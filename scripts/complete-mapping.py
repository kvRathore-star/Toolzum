#!/usr/bin/env python3
"""Complete the mapping by adding manual buckets for the 85 unmapped files."""
import json

# Load the auto-generated mapping
with open("/tmp/module-mapping.json") as f:
    data = json.load(f)

mapped = data["mapped"]

# Manual buckets for unmapped files
manual = {
    # Indian utilities
    "AadhaarMasker": "indian-utilities",
    "BankStatementAnalyser": "indian-utilities",
    "CgpaToPercentage": "indian-utilities",
    "IndianAgeCalculator": "indian-utilities",
    "IndianDocumentEnhancer": "indian-utilities",
    "IndianVoiceTranscriber": "indian-utilities",
    "ItrFilingHelper": "indian-utilities",
    "PanCardResizer": "indian-utilities",
    "PanVerification": "indian-utilities",
    "PincodeFinder": "indian-utilities",
    "RentalAgreementGenerator": "indian-utilities",
    "VoterIdHelper": "indian-utilities",
    "IfscLookup": "indian-utilities",
    "MarriageBiodataMaker": "indian-utilities",

    # Image
    "BulkBgChanger": "image",
    "BulkCompressJpg": "image",
    "BulkCompressPng": "image",
    "BulkJpgToPng": "image",
    "BulkJpgToWebp": "image",
    "BulkPngToJpg": "image",
    "BulkPngToWebp": "image",
    "BulkResizeImages": "image",
    "BulkStripExif": "image",
    "BulkWebpAvifModernizer": "image",
    "BulkWebpToPng": "image",
    "ConvertToJpg": "image",
    "HtmlToImage": "image",
    "JfifToPng": "image",
    "KbImageCompressor": "image",
    "RotateImage": "image",
    "SvgToPngConverter": "image",
    "BlurFace": "image",
    "BulkFaceAnonymizer": "image",
    "BulkExifStripperInjector": "image",

    # Video
    "BulkCompressMp4": "video",
    "BulkMkvToMp4": "video",
    "GifToMp4": "video",
    "VideoTrimmer": "video",
    "VideoWatermarkAdder": "video",
    "ReverseVideo": "video",

    # Audio
    "AppleMusicPreviewExtractor": "audio",
    "AudioConverter": "audio",
    "BulkMp3ToWav": "audio",
    "BulkWavToMp3": "audio",
    "Mp3Compressor": "audio",
    "SpeechToText": "audio",

    # PDF
    "BulkCompressPdf": "pdf",
    "BulkPdfToJpg": "pdf",
    "GenericPDFProcessor": "pdf",
    "GstInvoiceGenerator": "pdf",
    "PdfActionBase": "pdf",
    "PdfAiSummariser": "pdf",
    "PdfPageManager": "pdf",
    "EmlToPdf": "pdf",
    "EpubToPdf": "converter",
    "MarkdownToPdf": "pdf",

    # Developer
    "BorderCssGenerator": "design",
    "CurlToCode": "developer",
    "DataConverter": "converter",
    "HexToRgbConverter": "design",
    "JsonToCode": "converter",
    "KeywordDensityChecker": "seo",
    "MetaTagGenerator": "developer",
    "TextConverter": "developer",
    "LineSorter": "utility",

    # Converter
    "ConverterRouter": "converter",
    "DocumentConverter": "converter",
    "IcsCsvConverter": "utility",
    "UnitConverter": "converter",
    "VcfCsvConverter": "utility",
    "XlsxCsvConverter": "converter",
    "ArchiveConverter": "converter",

    # Utility
    "BulkQrCodeGenerator": "utility",
    "BulkToolShell": "utility",
    "CalculatorKit": "utility",
    "ComingSoonTool": "utility",
    "DataUtilities": "utility",
    "MiniGenerators": "utility",
    "OtherUtilities": "utility",
    "PomodoroTimer": "productivity",
    "ProDownloadButton": "utility",
    "CreativeTools": "utility",
    "ExtraTools": "utility",

    # Text
    "CursiveTextGenerator": "text",
    "FancyTextGenerator": "text",
    "RegionalFontGenerator": "text",
    "ZalgoTextGenerator": "text",
    "GlitchText": "text",
    "UpsideDownText": "text",
    "SmallTextGenerator": "text",
    "BigTextGenerator": "text",
    "InvisibleTextGenerator": "text",
    "InvisibleCharacter": "text",

    # SEO
    "BulkSeoLandingPage": "seo",
    "XmlSitemapGenerator": "seo",
    "TextSeoTools": "seo",
    "RobotsTxtGenerator": "seo",

    # Branding
    "LinkInBioBuilder": "branding",
    "SocialMediaCalendar": "branding",
    "SocialMediaPostMaker": "branding",
    "EmailSignatureGenerator": "branding",
    "BusinessCardMaker": "branding",

    # Privacy
    "PrivacyCleaner": "privacy",
    "ExifDataRemover": "privacy",
    "MacAddressGenerator": "privacy",
    "IpAnonymizer": "privacy",
    "SecureNoteSharer": "privacy",
    "PgpKeyGenerator": "privacy",

    # AI
    "AiBgChanger": "ai",

    # Design
    "SvgEditor": "design",
    "VectorPenCanvas": "design",
    "TypographyPreview": "design",

    # Calculator
    "MathTools": "calculator",
    "AgeCalculator": "calculator",

    # Health
    "BmiCalculator": "health",
    "BmrCalculator": "health",
    "HealthTools": "health",

    # Transcription
    "LiveTranscription": "transcription",
    "PodcastTranscription": "transcription",

    # Extension
    "BrowserExtension": "extension",
    "ScreenRecorderExtension": "extension",

    # Productivity
    "ToDoList": "productivity",
    "Timers": "productivity",

    # Finance
    "SipCalculator": "finance",
    "SalaryCalculator": "finance",
    "MarginCalculator": "finance",
    "VatCalculator": "finance",
    "RoiCalculator": "finance",
    "CurrencyConverter": "finance",

    # Misc final
    "WhatsAppToolkit": "branding",

    # Growth
    "BurnRateCalculator": "growth-marketing-metrics",
    "CacCalculator": "growth-marketing-metrics",
    "LtvCalculator": "growth-marketing-metrics",
    "ConversionRateCalculator": "growth-marketing-metrics",
    "CpmCalculator": "growth-marketing-metrics",
    "RoasCalculator": "growth-marketing-metrics",
    "NetPromoterScoreCalculator": "growth-marketing-metrics",
    "EmployeeTurnoverCalculator": "growth-marketing-metrics",

    # Already-mapped overrides (fix categories for files that were auto-mapped wrong)
    "ResumeAtsScoreChecker": "utility",
    "BrailleTranslator": "text",
    "NatoPhoneticConverter": "utility",
    "MorseCodeTranslator": "utility",
    "QrCodeGenerator": "utility",
    "QrCodeReader": "developer",
    "SslChecker": "developer",
    "WhoisLookup": "developer",
    "ImageToBase64": "developer",
    "DomainAvailabilityChecker": "developer",
}

# Apply manual buckets
for mod_name, category in manual.items():
    filename = f"{mod_name}.tsx"
    dir_name = category.lower().replace(' & ', '-').replace(' ', '-')
    new_path = f"{dir_name}/{filename}"
    mapped[filename] = {"category": category, "directory": dir_name, "new_path": new_path}

# Check which unmapped are still unmapped
still_unmapped = [m for m in data["unmapped"] if m not in mapped]
print(f"Remaining unmapped after manual pass: {len(still_unmapped)}")
for m in sorted(still_unmapped):
    print(f"  {m}")

# Recompute directory counts
dir_counts = {}
for _, info in mapped.items():
    d = info["directory"]
    dir_counts[d] = dir_counts.get(d, 0) + 1

print(f"\n=== FINAL SUMMARY ===")
for d, c in sorted(dir_counts.items()):
    print(f"  {d}/  ({c} files)")
print(f"  Total: {len(mapped)} files")

# Write final mapping
output = {
    "mapping": {f: info for f, info in sorted(mapped.items())},
    "directory_counts": dict(sorted(dir_counts.items())),
    "total": len(mapped),
}
with open("/tmp/module-mapping-final.json", "w") as f:
    json.dump(output, f, indent=2)

# Filter mapping to only files that exist on disk
import os as _os
disk_mapping = {}
for filename, info in sorted(mapped.items()):
    src = f"src/components/tools/modules/{filename}"
    if _os.path.exists(src):
        disk_mapping[filename] = info
    else:
        print(f"  SKIP (not on disk): {filename}")

# Write shell script for git mv
with open("/tmp/move-modules.sh", "w") as f:
    f.write("#!/bin/bash\n")
    f.write("# Generated by complete-mapping.py\n")
    f.write(f"# {len(disk_mapping)} files to move ({len(mapped) - len(disk_mapping)} skipped — not on disk)\n")
    f.write("# Run: bash /tmp/move-modules.sh\n\n")
    f.write("set -e\n")
    f.write("cd /Users/kvsingh/Desktop/Toolzum.com\n\n")
    
    # Pre-flight: verify all source files exist
    f.write("# Pre-flight: verify all source files exist\n")
    for filename in disk_mapping:
        f.write(f'test -f src/components/tools/modules/{filename} || {{ echo "MISSING: src/components/tools/modules/{filename}"; exit 1; }}\n')
    f.write('echo "Pre-flight OK — all source files present."\n\n')
    
    # Group by target directory so we can mkdir first
    dirs = set()
    for _, info in disk_mapping.items():
        dirs.add(info["directory"])
    for d in sorted(dirs):
        f.write(f"mkdir -p src/components/tools/modules/{d}\n")
    
    f.write("\n# Move files\n")
    for filename, info in sorted(disk_mapping.items()):
        old = f"src/components/tools/modules/{filename}"
        new = f"src/components/tools/modules/{info['new_path']}"
        if old != new:
            f.write(f"git mv {old} {new}\n")
    
    f.write(f"\necho 'Moved {len(disk_mapping)} files.'\n")

print(f"\nShell script written to /tmp/move-modules.sh")
