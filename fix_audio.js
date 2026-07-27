const fs = require('fs');

// Helper: collect all instruction+faq pairs
const ALL = {}; // { slug: { instructions: [[title,desc],..], faqs: [[q,a],..] } }
function add(slug, insts, faqs) { ALL[slug] = { instructions: insts, faqs }; }

// ---- AAC TARGETS ----
add("aac-to-flac", [
  ["1. Select Your AAC File", "Choose an .aac audio file. AAC is a lossy format commonly used in Apple Music, YouTube, and MP4 containers. Loading is instant since everything stays in your browser."],
  ["2. Pick FLAC Encoding Depth", "FLAC supports 16-bit, 24-bit, and 32-bit depth. For music archiving, 24-bit preserves maximum dynamic range from high-resolution AAC sources."],
  ["3. Start Archival Conversion", "Convert your AAC to FLAC for lossless storage. The FLAC file will be 3-5x larger than the AAC but preserves every bit of decoded audio data."],
], [
  ["Can converting AAC to FLAC improve sound quality?", "No. AAC is already lossy — converting to FLAC cannot recover the audio data lost during AAC encoding. FLAC simply stores the decoded AAC output without further loss."],
  ["Why convert AAC to FLAC at all?", "FLAC is ideal for archiving. You can transcode FLAC to any other format later without generational quality loss. AAC should be your delivery format, FLAC your master copy."],
  ["Does FLAC support AAC's native sample rates?", "Yes. FLAC supports up to 192 kHz sample rate and up to 655,350 Hz bandwidth, covering all AAC sample rates including 44.1 kHz, 48 kHz, and 96 kHz."],
]);

add("aac-to-m4a", [
  ["1. Upload Your AAC File", "Select an .aac audio track. AAC is the audio layer inside M4A containers — the conversion repackages the stream without re-encoding."],
  ["2. Add Metadata (Optional)", "Edit track title, artist, album, and cover art before converting. M4A supports rich metadata including embedded album artwork."],
  ["3. Remux to M4A", "The tool copies the AAC bitstream into an M4A container. Since there is no re-encoding, the process is near-instant and quality is perfectly preserved."],
], [
  ["Is AAC to M4A lossless?", "Yes, when the AAC stream is copied (not re-encoded). This is a container swap — the audio data is untouched. The result is identical to the original AAC."],
  ["Why use M4A instead of AAC?", "M4A is a container format that supports metadata, chapter marks, and cover art. AAC is a pure audio codec without container features."],
  ["Will the file size change?", "Minimally. M4A adds a small container overhead (a few KB) for the header and metadata. The audio data size remains exactly the same."],
]);

add("aac-to-mp3", [
  ["1. Choose Your AAC Source", "Pick an .aac file. AAC generally achieves better quality than MP3 at the same bitrate, so the source quality matters for the conversion outcome."],
  ["2. Set MP3 Bitrate", "Choose 128 kbps for voice/podcasts, 192 kbps for mixed content, or 320 kbps for music. The AAC stream will be decoded then re-encoded to MP3."],
  ["3. Convert for Compatibility", "Generate an MP3 file compatible with virtually every device — car stereos, older media players, gaming consoles, and basic feature phones."],
], [
  ["Will AAC to MP3 conversion lose quality?", "Yes — this is a double-lossy conversion. AAC artifacts plus MP3 artifacts compound. For critical listening, start from a lossless source instead."],
  ["Which bitrate matches original AAC quality?", "If your AAC is 256 kbps, use 320 kbps MP3 to minimize perceivable quality loss. Never upconvert from a lower bitrate AAC to higher bitrate MP3."],
  ["Why convert AAC to MP3 instead of using AAC directly?", "MP3 has universal hardware support. Many car audio systems, aircraft entertainment, and legacy devices play MP3 but not AAC."],
]);

add("aac-to-ogg", [
  ["1. Pick Your AAC File", "Select an .aac file. The AAC codec uses MDCT-based compression similar to OGG's Vorbis, but the implementations differ significantly."],
  ["2. Set Vorbis Quality Level", "Choose a quality level from -1 (lowest) to 10 (highest). Level 5 (~160 kbps) is transparent for most content. Levels above 7 have diminishing returns."],
  ["3. Convert to Vorbis", "The AAC stream is decoded to PCM then encoded to Vorbis in an OGG container. OGG Vorbis often achieves better quality than AAC at matching bitrates."],
], [
  ["Is OGG Vorbis better than AAC?", "At equivalent bitrates, Vorbis generally matches or slightly exceeds AAC quality, especially below 128 kbps. AAC has wider hardware support."],
  ["What devices support OGG?", "OGG is standard on Android, Linux, and many open-source media players. It is not natively supported on iOS or most car audio systems."],
  ["Can I embed album art in OGG?", "Yes. OGG Vorbis supports metadata comments including METADATA_BLOCK_PICTURE for embedded cover art, similar to M4A and MP3."],
]);

add("aac-to-opus", [
  ["1. Upload AAC Source", "Choose the .aac file you want to convert. Opus excels at low bitrates, making this conversion ideal for reducing file size while maintaining quality."],
  ["2. Set Opus Bitrate", "Opus performs well from 32-96 kbps for voice and 96-192 kbps for music. For AAC source at 256 kbps, 128 kbps Opus is virtually transparent."],
  ["3. Modern Encoding", "Convert to Opus — the most advanced lossy audio codec. Opus combines SILK (voice) and CELT (music) algorithms for optimal performance across all content types."],
], [
  ["Should I replace my AAC library with Opus?", "Opus offers 10-20% better compression than AAC at the same quality. For portable devices with limited storage, Opus is the superior choice."],
  ["What is Opus's bitrate range?", "Opus supports 6 kbps (narrowband voice) to 510 kbps (full-band music). The sweet spot is 96-128 kbps for transparent music encoding."],
  ["Does Opus support surround sound?", "Yes. Opus supports up to 255 channels including 5.1 and 7.1 surround. AAC is limited to 48 channels in its highest profile."],
]);

add("aac-to-wav", [
  ["1. Import AAC Track", "Select the .aac file for conversion to WAV. WAV is an uncompressed format used in professional audio workflows."],
  ["2. Choose Output Depth", "WAV supports 8, 16, 24, or 32-bit integer and 32-bit float. For audio editing, 24-bit provides ample headroom for processing without clipping."],
  ["3. Export Uncompressed WAV", "The AAC is decoded to linear PCM and saved as a WAV file. The resulting file is 5-10x larger than the AAC but ready for DAW import, sampling, or further processing."],
], [
  ["Why convert AAC to WAV instead of FLAC?", "WAV is universally supported by audio editing software (Pro Tools, Ableton, Logic, Audacity) without any codec plugins. FLAC requires decoder support."],
  ["How large will the WAV file be?", "A 4-minute AAC song at 256 kbps (~7.5 MB) becomes approximately 40 MB as 16-bit/44.1 kHz WAV. At 24-bit/96 kHz, expect 120+ MB."],
  ["Can I convert WAV back to AAC later?", "Yes, but the re-encoded AAC will have generational quality loss. Archive the original AAC separately for future use."],
]);

add("aac-to-wma", [
  ["1. Select AAC File", "Choose the AAC audio you want to convert to Windows Media Audio format."],
  ["2. Set WMA Bitrate", "WMA supports CBR from 48-192 kbps. For compatibility with Windows Media Player and portable devices, 128 kbps CBR is the safest choice."],
  ["3. Encode for Windows Ecosystem", "Convert your AAC to WMA format. The resulting file plays natively in Windows Media Player, Windows Phone, and older Zune devices."],
], [
  ["Is WMA still relevant today?", "WMA is legacy technology but still used in corporate environments with Windows-based audio systems, some e-learning platforms, and embedded Windows applications."],
  ["Does WMA support lossless encoding?", "Yes. WMA Lossless is a variant but this converter produces standard WMA. For lossless on Windows, use WAV or FLAC instead."],
  ["Can I play WMA on non-Windows devices?", "Most modern media players support WMA playback, but iPhones, iPads, and many Linux distributions do not include native WMA support."],
]);

add("aac-to-aiff", [
  ["1. Bring Your AAC File", "Select an AAC audio track for conversion to AIFF — Apple's uncompressed audio format used in professional production."],
  ["2. Select AIFF Variant", "Choose between standard AIFF (big-endian, .aif) and AIFF-C (.aifc) which supports compression. Standard AIFF is recommended for maximum compatibility."],
  ["3. Export for Production", "Decode the AAC to PCM and wrap in an AIFF container. AIFF is the standard format in many Mac-based recording studios and Logic Pro workflows."],
], [
  ["What is the difference between AIFF and WAV?", "AIFF uses big-endian byte ordering (Motorola), WAV uses little-endian (Intel). Both are uncompressed PCM. Audio quality is identical at the same sample rate and bit depth."],
  ["Does AIFF support metadata?", "AIFF supports basic metadata through chunk headers including author, copyright, and annotation fields. It does not support embedded album art natively."],
  ["Is AIFF compatible with Windows?", "Windows supports AIFF playback in most media players, but some Windows audio software may not open AIFF files. WAV is safer for cross-platform work."],
]);

// ---- FLAC TARGETS ----
add("flac-to-aac", [
  ["1. Upload Your FLAC Master", "Select a FLAC file — your lossless source. FLAC files preserve full CD or hi-res quality, making them ideal masters for encoding to any lossy format."],
  ["2. Set AAC Target Bitrate", "For music, 256 kbps AAC is considered transparent (indistinguishable from the FLAC original). For podcasts, 128 kbps is sufficient."],
  ["3. Encode to AAC", "Convert your FLAC to AAC for Apple device compatibility. Since the source is lossless, this single encoding pass produces the best possible AAC output."],
], [
  ["Will AAC from FLAC sound better than AAC from MP3?", "Yes. Encoding AAC from lossless FLAC avoids generational loss. AAC encoded from MP3 would compound artifacts from both codecs."],
  ["What AAC profile should I use?", "AAC-LC (Low Complexity) is supported everywhere. AAC-HE (High Efficiency) is for low bitrates below 128 kbps. For most users, AAC-LC at 256 kbps is ideal."],
  ["Can I batch convert a FLAC library to AAC?", "Yes. Select multiple FLAC files. Each is encoded independently. This is common when building an iTunes/Apple Music portable library from FLAC archives."],
]);

add("flac-to-m4a", [
  ["1. Choose FLAC Source Files", "Pick your FLAC files — ideal for converting to Apple-friendly M4A. FLAC is not natively supported on iOS, making this conversion essential for Apple users."],
  ["2. Set AAC Quality in M4A", "Select the target quality: 128 kbps (standard), 192 kbps (good), 256 kbps (high), or 320 kbps (maximum). M4A uses AAC encoding by default."],
  ["3. Transfer to Apple Devices", "Convert your FLAC to M4A and sync with iTunes/Apple Music. M4A supports gapless playback, chapter markers, and embedded album artwork."],
], [
  ["Why M4A instead of AAC for Apple devices?", "M4A is the container format Apple recommends. It supports metadata, artwork, and chapter tracks. Bare AAC files lack these features."],
  ["Does M4A support ALAC (Apple Lossless)?", "Yes, M4A can contain ALAC (Apple Lossless) audio, but this converter produces AAC-LC in M4A. For lossless on Apple devices, use ALAC in M4A."],
  ["Can I sync M4A to an iPod Classic?", "Yes. M4A files with AAC-LC encoding are compatible with all iPod models, iPhone, iPad, and Apple TV."],
]);

add("flac-to-mp3", [
  ["1. Pick Your FLAC Source", "Start with a FLAC file for the best MP3 encoding. Encoding MP3 from a lossless source avoids the generational quality loss of re-encoding from lossy."],
  ["2. Set MP3 Encoding Mode", "Choose CBR (constant bitrate) for predictable file sizes, VBR (variable) for better quality-to-size ratio, or ABR (average) for a compromise."],
  ["3. Export Universal MP3", "Convert FLAC to MP3 — the most widely compatible audio format. Your MP3 will play on anything: from 1990s CD players to modern smart speakers."],
], [
  ["Is VBR or CBR better for MP3?", "VBR produces better quality at smaller file sizes by allocating more bits to complex passages. CBR is needed for streaming or hardware with strict bitrate requirements."],
  ["What VBR quality setting should I use?", "VBR 0 (highest, ~245 kbps) to VBR 9 (lowest, ~65 kbps). VBR 2 (~190 kbps) is transparent for most listeners. VBR 0 is overkill for portable listening."],
  ["Does MP3 support metadata and album art?", "Yes. MP3 supports ID3v1 and ID3v2 tags including title, artist, album, genre, year, and embedded cover art (JPEG/PNG up to 64MB)."],
]);

add("flac-to-ogg", [
  ["1. Select FLAC Master File", "Choose your lossless FLAC source. Encoding to OGG Vorbis from FLAC produces better quality than re-encoding from any lossy format."],
  ["2. Tune Vorbis Encoding", "Use quality level 5 (~160 kbps) for transparent music encoding. Level 3 (~112 kbps) is good for mixed content. Level 7+ for archival."],
  ["3. Generate OGG Vorbis", "Convert your FLAC to OGG Vorbis. OGG files are smaller than FLAC while offering excellent quality. Perfect for Android devices and open-source media libraries."],
], [
  ["Is OGG Vorbis truly free?", "Yes. OGG Vorbis is patent-free and open-source. Unlike MP3 and AAC, no licensing fees are required for encoding, distributing, or playing OGG files."],
  ["Can I use OGG in web projects?", "OGG Vorbis is supported by HTML5 <audio> in Chrome, Firefox, and Opera. Safari and Edge require MP3 or AAC for full web audio coverage."],
  ["How does Vorbis compare to MP3 at low bitrates?", "Vorbis significantly outperforms MP3 at bitrates below 128 kbps. At 80 kbps, Vorbis sounds much cleaner than MP3 with fewer high-frequency artifacts."],
]);

add("flac-to-opus", [
  ["1. Bring Your FLAC Source", "Start with a FLAC file to get the best possible Opus encode. Opus is the most advanced lossy codec and benefits most from a clean lossless source."],
  ["2. Select Opus Application", "Choose the encoding mode: 'audio' for music (full bandwidth), 'voice' for speech (optimized for vocal clarity), or 'low-delay' for real-time applications."],
  ["3. Encode to Opus", "Your FLAC is encoded to Opus — the IETF standard for modern audio. Expect 70-80% size reduction at near-transparent quality that rivals the original FLAC."],
], [
  ["Is Opus better than Vorbis?", "Yes. Opus delivers better quality than Vorbis at all bitrates, especially below 64 kbps. Opus is the only codec that handles both music and speech optimally."],
  ["What is Opus's delay characteristic?", "Opus has algorithmic delay of 26.5 ms (music) to 5 ms (voice), making it suitable for real-time communication. MP3 has ~100 ms delay."],
  ["Does Opus support gapless playback?", "Yes. Opus supports gapless playback natively, unlike MP3 which requires encoder-specific gapless metadata hacks."],
]);

add("flac-to-wav", [
  ["1. Select FLAC Files to Decode", "Choose FLAC files from your lossless archive. FLAC typically reduces file size by 40-60% compared to the original WAV."],
  ["2. Pick Output Format Details", "WAV format: select 16-bit (CD standard), 24-bit (hi-res), or 32-bit float (for audio processing with headroom). Match the original FLAC bit depth for best results."],
  ["3. Decode to Uncompressed WAV", "Your FLAC is decoded losslessly to WAV. Both files contain identical audio data. This is useful for loading into DAWs that do not support FLAC natively."],
], [
  ["Is FLAC to WAV truly lossless?", "Yes. FLAC is a lossless codec — decoding to WAV produces bit-exact PCM data identical to the original source that was encoded to FLAC."],
  ["Why decompress FLAC back to WAV?", "Many professional audio tools (Pro Tools, Ableton Live, older Audacity versions) lack native FLAC support. WAV is the universal interchange format."],
  ["Will the WAV file be exactly the original size?", "Yes, if the FLAC was compressed from a WAV source. FLAC compression is reversible. The decoded WAV matches the original WAV bit-for-bit."],
]);

add("flac-to-wma", [
  ["1. Choose FLAC Source", "Select a lossless FLAC file for conversion to WMA. Starting from lossless ensures the best possible WMA output quality."],
  ["2. Set WMA Profile", "Choose WMA Standard (128-192 kbps, broad compatibility) or WMA Pro (up to 768 kbps, multi-channel support up to 7.1 surround)."],
  ["3. Encode for Windows", "Convert your FLAC to WMA for seamless playback in Windows Media Player, Windows Phone, and Xbox consoles."],
], [
  ["Is WMA Pro better than WMA Standard?", "WMA Pro supports higher bitrates, multi-channel audio, and 24-bit depth. Standard WMA is limited to stereo 16-bit. File size is significantly larger for Pro."],
  ["Can WMA match FLAC quality?", "WMA Standard is lossy — it cannot match FLAC's perfect fidelity. WMA 9.2 Lossless exists but is not supported by this converter."],
  ["What bitrate preserves FLAC quality?", "For transparent WMA encoding from FLAC, use 192 kbps VBR or higher. Below 128 kbps, quality loss is audible on good headphones."],
]);

add("flac-to-aiff", [
  ["1. Select Your FLAC File", "Pick a FLAC audio file from your lossless collection. FLAC is common for archiving but less supported in Apple's ecosystem than AIFF."],
  ["2. Set AIFF Bit Depth", "Choose 16-bit (CD quality), 24-bit (hi-res), or 32-bit float. AIFF is uncompressed so the file will be much larger than the FLAC source."],
  ["3. Export for Mac Production", "Decode FLAC to AIFF for use in Logic Pro, GarageBand, or Final Cut Pro. AIFF is Apple's preferred uncompressed format for professional audio."],
], [
  ["Why AIFF over WAV on Mac?", "AIFF uses big-endian byte order native to PowerPC and earlier Macs. macOS handles both equally well, but some legacy Mac software prefers AIFF."],
  ["Does AIFF preserve FLAC's sample rate?", "Yes. AIFF supports sample rates from 8 kHz to 192 kHz and beyond. The converted file matches the source FLAC exactly."],
  ["Can I embed metadata in AIFF?", "AIFF supports basic metadata through Annotation and Name chunks. Unlike FLAC, complex metadata structures may be lost during conversion."],
]);

// ---- M4A TARGETS ----
add("m4a-to-aac", [
  ["1. Open Your M4A File", "Select an M4A file. M4A typically contains AAC-LC audio — extracting the raw AAC stream requires no re-encoding."],
  ["2. Choose Extraction Mode", "Select 'stream copy' to extract the AAC bitstream from the M4A container without quality loss, or 're-encode' to change codec parameters."],
  ["3. Extract or Convert", "Stream copy mode produces a .aac file instantly. Re-encoding mode decodes then re-encodes, useful for reducing bitrate for portable devices."],
], [
  ["Is M4A the same as AAC?", "Not exactly. M4A is a container format that usually holds AAC audio. M4A can also contain ALAC (Apple Lossless). AAC is the audio codec inside."],
  ["Why extract AAC from M4A?", "Raw AAC files are smaller (no container overhead) and preferred in some broadcasting and streaming workflows that decode AAC directly."],
  ["Does stream copy preserve quality?", "Yes. Stream copy extracts the AAC bitstream without decoding or re-encoding. The output is bit-identical to the AAC within the M4A."],
]);

add("m4a-to-flac", [
  ["1. Import M4A Source", "Select an M4A audio file. If your M4A contains ALAC (Apple Lossless), the conversion to FLAC preserves full lossless quality."],
  ["2. Configure FLAC Compression", "FLAC compression levels range from 0 (fastest, least compression) to 8 (slowest, best compression). Level 5 offers a good balance of speed and size."],
  ["3. Convert to FLAC", "Decode the M4A audio and encode to FLAC. The process runs entirely in your browser. FLAC offers better metadata support than M4A."],
], [
  ["Can I convert ALAC in M4A to FLAC?", "Yes. ALAC to FLAC conversion is lossless since both are lossless codecs. Audio quality is perfectly preserved during the transcoding."],
  ["Which has better compression: FLAC or ALAC?", "FLAC typically achieves 5-10% better compression than ALAC. A CD that compresses to 300 MB in ALAC may be 270-285 MB in FLAC."],
  ["Does FLAC support embedded artwork?", "Yes. FLAC supports embedded images as METADATA_BLOCK_PICTURE, similar to M4A's covr atom. Up to 16MB per image is standard."],
]);

add("m4a-to-mp3", [
  ["1. Upload M4A Audio", "Choose the M4A file you want as MP3. Common in workflows where music purchased from iTunes Store needs to play on non-Apple devices."],
  ["2. Choose MP3 Quality Target", "Select from preset quality levels: 128 kbps (small file, voice-grade), 192 kbps (balanced), or 320 kbps (maximum MP3 quality)."],
  ["3. Encode for Universal Playback", "Your M4A is decoded to PCM then encoded to MP3. The resulting file works on any device with MP3 support — from DVD players to smart speakers."],
], [
  ["Will MP3 from iTunes M4A sound good?", "iTunes Plus M4A files are 256 kbps AAC. Converting to 320 kbps MP3 minimizes quality loss. Avoid converting to 128 kbps MP3 from high-quality M4A sources."],
  ["Can I preserve iTunes metadata?", "Metadata like title, artist, and album are transferred from M4A to MP3 ID3 tags. Some iTunes-specific tags (iTunes account ID) are not carried over."],
  ["Does this work with DRM-protected M4A?", "No. Only DRM-free M4A files (purchased as iTunes Plus or from other DRM-free sources) can be converted. Protected M4A files require authorization first."],
]);

add("m4a-to-ogg", [
  ["1. Select M4A Input", "Choose an M4A audio file. This conversion is useful when building open-source media libraries that prefer OGG format."],
  ["2. Set Vorbis Quality", "Choose quality level 3 (~112 kbps) for voice, 5 (~160 kbps) for music listening, or 8 (~256 kbps) for near-transparent quality."],
  ["3. Encode to OGG Vorbis", "The M4A audio is decoded and re-encoded to Vorbis. OGG files are fully metadata-compatible with most open-source media servers like Plex and Jellyfin."],
], [
  ["Can I embed lyrics in OGG files?", "Yes. OGG Vorbis supports LYRICS metadata tags. Unlike MP3's SYLT frames, OGG lyrics are plain text stored in Vorbis comments."],
  ["Is OGG compatible with media servers?", "Yes. Plex, Jellyfin, Emby, and Kodi all support OGG Vorbis natively. Some transcoding may be required for browser playback in Safari."],
  ["Does OGG support ReplayGain?", "Yes. OGG Vorbis supports REPLAYGAIN_TRACK_GAIN and REPLAYGAIN_ALBUM_GAIN comments for volume normalization across playback."],
]);

add("m4a-to-opus", [
  ["1. Upload Your M4A File", "Select an M4A audio track. Converting to Opus is ideal for reducing storage used by your portable music library."],
  ["2. Set Opus Target Bitrate", "For transparent encoding, 96-128 kbps Opus matches or exceeds 256 kbps AAC quality. For maximum space savings, 64 kbps Opus is acceptable for casual listening."],
  ["3. Encode Modern Audio", "Convert your M4A to Opus. The modern codec delivers better quality at half the bitrate of AAC, freeing storage on phones and portable players."],
], [
  ["Is Opus decoding supported on iOS?", "iOS does not natively support Opus playback. Third-party apps like VLC for Mobile can play Opus, but Apple Music and the default Music app cannot."],
  ["Can Opus replace AAC for my library?", "For personal use on compatible devices, yes. For sharing with others, AAC remains safer due to universal hardware and OS support."],
  ["Does Opus handle variable bitrate well?", "Opus uses variable bitrate by default and adapts dynamically to audio complexity. VBR in Opus is more efficient than CBR, unlike some older codecs."],
]);

add("m4a-to-wav", [
  ["1. Bring Your M4A File", "Select the M4A audio for conversion. WAV from M4A is the standard pipeline when extracting audio from iTunes purchases for editing."],
  ["2. Set WAV Parameters", "Choose the output sample rate (44.1 kHz for CD, 48 kHz for video) and bit depth (16 or 24 bit). 16-bit/44.1 kHz is CD standard."],
  ["3. Export for Editing", "Decode M4A to WAV for use in any audio editor. WAV is the standard format for sampling, loop creation, and audio restoration work."],
], [
  ["Why does my WAV file sound the same but is much larger?", "WAV is uncompressed — every audio sample is stored as raw PCM values. M4A removes imperceptible audio data to achieve 80-90% size reduction."],
  ["Can I edit WAV files without quality loss?", "Yes. WAV is lossless, so saving edits in WAV preserves full quality. Each generation of MP3/AAC re-encoding degrades quality."],
  ["Does WAV support cue points and loops?", "Not natively. Some DAWs embed cue information in WAV chunks, but there is no standard. FLAC or CAF (Core Audio Format) is better for cue metadata."],
]);

add("m4a-to-wma", [
  ["1. Select M4A File", "Pick the M4A audio to convert for Windows compatibility. Common when moving an iTunes library to a Windows-based media system."],
  ["2. Set WMA Bitrate", "Choose 128 kbps for adequate quality, 192 kbps for good quality on portable devices, or WMA Pro for high-quality multi-channel output."],
  ["3. Export for Windows", "Convert M4A to WMA for native playback in Windows Media Center, Xbox Music, and Windows Phone devices without codec packs."],
], [
  ["Can Windows Media Player play M4A?", "Windows Media Player 12 plays M4A with the Apple codec installed. WMA requires no additional codecs on Windows."],
  ["Is WMA metadata compatible with iTunes?", "WMA metadata uses Windows Media format. iTunes does not natively write WMA metadata. Tags may not transfer cleanly between ecosystems."],
  ["Does WMA support gapless playback?", "WMA supports gapless playback through the WM/WMContentID attribute. Not all WMA players implement gapless correctly."],
]);

add("m4a-to-aiff", [
  ["1. Select M4A Source", "Choose an M4A audio file for conversion to AIFF. Useful when preparing audio from iTunes for use in Mac-based audio production."],
  ["2. Choose AIFF Bit Depth", "16-bit for standard exports, 24-bit for professional production headroom. 32-bit float for projects requiring extreme dynamic range."],
  ["3. Export Uncompressed AIFF", "Your M4A is decoded to PCM and wrapped in AIFF. The file is ready for import into Logic Pro, Pro Tools, or any AIFF-compatible DAW."],
], [
  ["Is AIFF better than M4A for production?", "Yes. AIFF is uncompressed, so the CPU does not need to decode audio during playback in a DAW. This reduces latency and improves track count."],
  ["Does AIFF preserve iTunes metadata?", "Some metadata transfers (title, artist). Album art and play count data do not have standard AIFF fields and will be lost."],
  ["What sampling rates does AIFF support?", "AIFF supports 8 kHz to 192 kHz. Most audio production uses 44.1 kHz (music) or 48 kHz (video/film post-production)."],
]);

// ---- MP3 TARGETS ----
add("mp3-to-aac", [
  ["1. Upload Your MP3 File", "Select an MP3 file. MP3 is universally compatible but AAC offers better quality at equivalent bitrates, making this conversion useful for Apple devices."],
  ["2. Set AAC Bitrate", "For MP3 source at 320 kbps, use 256 kbps AAC for transparent quality. For MP3 at 128 kbps, use 128 kbps AAC to avoid amplifying source artifacts."],
  ["3. Encode to AAC", "The MP3 is decoded and re-encoded to AAC. The AAC file will be smaller than the MP3 at equivalent quality, saving storage on portable devices."],
], [
  ["Does AAC at 128 kbps sound better than MP3 at 128 kbps?", "Yes. AAC's improved coding tools (MDCT, TNS, PS) deliver better sound at low bitrates. At 128 kbps, AAC sounds closer to the source than MP3."],
  ["Can I use AAC for video projects?", "Yes. AAC is the standard audio codec for MP4 video containers. Converting MP3 to AAC before video editing avoids container format conflicts."],
  ["Why does the AAC file sometimes sound worse?", "If the MP3 source is low bitrate (below 128 kbps), re-encoding to AAC amplifies existing compression artifacts. Start from a higher quality source."],
]);

add("mp3-to-aiff", [
  ["1. Select MP3 Source", "Choose an MP3 file to expand to AIFF for audio production. MP3 is not ideal for editing — AIFF gives you full uncompressed PCM for processing."],
  ["2. Set AIFF Depth", "Select 16-bit for standard CD-quality output or 24-bit for professional applications. The AIFF file will be 5-10x the size of the MP3."],
  ["3. Export AIFF for DAW", "Convert MP3 to AIFF for use in audio editors. The decoded PCM is wrapped in AIFF format, ready for loading into Logic Pro, Ableton, or Pro Tools."],
], [
  ["Does AIFF playback require less CPU than MP3?", "Yes. AIFF is PCM — no decoding required. MP3 needs real-time decoding which uses CPU cycles. In large DAW projects, this matters for track count."],
  ["Is there any reason to keep MP3 over AIFF for archiving?", "No. MP3 is lossy — each playback decodes the same lossy data. AIFF stores full PCM data. For active projects, AIFF is better."],
  ["Does AIFF support BWF (Broadcast Wave) features?", "No, BWF is a WAV extension. AIFF has no equivalent to BWF's timecode stamp or originating station fields."],
]);

add("mp3-to-flac", [
  ["1. Choose MP3 Files", "Select MP3 files to wrap in FLAC. Important: this does NOT restore quality lost during MP3 encoding — the MP3 artifacts remain."],
  ["2. Set FLAC Compression", "Choose compression level 0-8. Unlike MP3's quality trade-off, FLAC compression is lossless — level 8 produces identical audio to level 0, just smaller."],
  ["3. Archive in FLAC", "The MP3 is decoded to PCM then encoded losslessly to FLAC. The FLAC file is useful for unified library management but does not contain original CD quality."],
], [
  ["Does MP3 to FLAC improve sound quality?", "Absolutely not. FLAC is lossless, but the damage from MP3 encoding is permanent. This is like saving a JPEG as PNG — the artifacts remain visible."],
  ["Why would anyone convert MP3 to FLAC?", "For library consistency. If your collection is mostly FLAC, converting old MP3s to FLAC avoids format switching in playback. Metadata management is also unified."],
  ["Will the FLAC file be larger than the MP3?", "Yes. FLAC is lossless and typically 3-5x larger than the original MP3. A 10 MB MP3 becomes 30-50 MB FLAC with identical audio quality."],
]);

add("mp3-to-m4a", [
  ["1. Load MP3 File", "Pick an MP3 recording. Converting to M4A is useful for integrating MP3-sourced audio into an Apple-centric media library."],
  ["2. Configure AAC Output", "Select M4A quality: 128 kbps for voice, 192 kbps for mixed listening, or 256 kbps for music. The MP3 is decoded then re-encoded to AAC in M4A container."],
  ["3. Export for Apple Ecosystem", "Convert to M4A for seamless use in iTunes, Apple Music, AirDrop, and iOS devices. M4A supports gapless playback and embedded artwork."],
], [
  ["Will M4A from MP3 have Apple compatibility?", "Yes. M4A with AAC-LC encoding is fully compatible with all Apple devices and software including iPod, iPhone, iPad, Apple TV, and HomePod."],
  ["Can I convert MP3 audio books to M4A?", "Yes. M4A supports chapter markers which are useful for audiobooks. The converter preserves any existing chapter data and adds file-level metadata."],
  ["Does M4A support album art from MP3 ID3 tags?", "Yes. Album art embedded in MP3 ID3 tags is transferred to the M4A container during conversion, so your artwork is retained."],
]);

add("mp3-to-ogg", [
  ["1. Select MP3 File", "Choose the MP3 audio you want to convert to OGG Vorbis. Useful when migrating away from proprietary formats to open codecs."],
  ["2. Set Vorbis Encoding Quality", "Vorbis quality -1 (lowest) to 10 (highest). For MP3 at 192 kbps, quality level 5 (~160 kbps) provides similar quality. Levels above 6 offer diminishing returns."],
  ["3. Encode to Open Format", "Convert your MP3 to OGG Vorbis — a fully open, patent-free audio format supported natively on Android, Linux, and web platforms."],
], [
  ["Is OGG Vorbis better than MP3?", "At matching bitrates, Vorbis generally outperforms MP3 in blind listening tests. The difference is most noticeable at low bitrates (below 128 kbps)."],
  ["Can I use OGG in video editing?", "Most video editors support OGG for import but may not export OGG. For video work, consider converting to PCM WAV for editing, then encode to your delivery format."],
  ["Does OGG support sample rates above 48 kHz?", "Yes. OGG Vorbis supports up to 192 kHz sample rate. High-resolution audio is preserved during conversion from high-sample-rate MP3 sources."],
]);

add("mp3-to-opus", [
  ["1. Upload MP3 Audio", "Select the MP3 file. Opus delivers better quality than MP3 at every bitrate, making this a sensible upgrade for personal listening libraries."],
  ["2. Set Opus Complexity", "Choose encoding complexity from 0 (fastest) to 10 (slowest, best quality). Complexity 10 provides the best compression efficiency for archival encoding."],
  ["3. Encode to Modern Standard", "Convert MP3 to Opus. At 96 kbps, Opus rivals MP3 at 192 kbps quality. Your portable music collection can be halved in size without audible quality loss."],
], [
  ["Should I replace all my MP3s with Opus?", "If your MP3s are from lossless sources, yes — re-encode from the original source, not from MP3. MP3-to-Opus conversion compounds artifacts."],
  ["Is Opus patent-free like OGG?", "Opus is developed under IETF standardization with a free, open license. No patent licensing fees are required for Opus encoding or distribution."],
  ["What hardware supports Opus playback?", "Most modern smartphones, Raspberry Pi, Sonos speakers, and Chromecast support Opus. Older MP3 players and car stereos typically do not."],
]);

add("mp3-to-wav", [
  ["1. Select MP3 File", "Pick the MP3 file to decode to uncompressed WAV. Essential for audio editing, sampling, and any workflow requiring raw PCM access."],
  ["2. Choose Output WAV Format", "Select 16-bit for CD-standard or 24-bit for production work. Stereo or mono output depending on your project needs."],
  ["3. Decode to WAV", "The MP3 is fully decoded to linear PCM and saved as WAV. The resulting file is 5-10x larger but provides sample-level access for precise editing."],
], [
  ["Can I recover the original CD quality by converting MP3 to WAV?", "No. MP3 is lossy — converting to WAV creates a much larger file but with the same degraded audio quality. The lost high frequencies cannot be restored."],
  ["Why does my MP3 sound better after converting to WAV?", "It does not sound better — your brain expects a larger file to sound better. Blind A/B tests show listeners cannot distinguish MP3 from WAV of the same source."],
  ["Is WAV from MP3 suitable for professional use?", "For production work, yes — WAV is easier for DAWs to handle. But the audio quality ceiling is the MP3's, not CD quality. Always prefer lossless sources."],
]);

add("mp3-to-wma", [
  ["1. Upload MP3 for Conversion", "Select the MP3 file. Converting to WMA is primarily for compatibility with Windows-based audio systems and older portable media players."],
  ["2. Select WMA Quality", "Choose 128 kbps (standard), 160 kbps (good), or 192 kbps (high). WMA at 192 kbps is comparable to MP3 at 256 kbps in blind listening."],
  ["3. Encode to WMA", "Your MP3 is decoded and re-encoded to Windows Media Audio. The file is optimized for Windows Media Player and Windows Phone playback."],
], [
  ["Is WMA better than MP3 at the same bitrate?", "WMA generally outperforms MP3 at bitrates below 128 kbps. At higher bitrates, the difference narrows. Neither matches AAC or Opus efficiency."],
  ["Can WMA files be played on Mac?", "macOS does not natively support WMA. Third-party players like VLC, Floola, and Elmedia Player can play WMA on Mac."],
  ["Does WMA support audio books with bookmarks?", "WMA supports bookmarks through the ASF container structure. Windows Media Player and some audiobook apps can resume WMA audiobooks."],
]);

// ---- OGG TARGETS ----
add("ogg-to-aac", [
  ["1. Open OGG Vorbis File", "Select an OGG audio file. OGG is common in open-source software (Linux, PulseAudio, many game engines). Converting to AAC broadens device compatibility."],
  ["2. Set AAC Output Parameters", "Choose the target bitrate for AAC: 128 kbps (balanced), 192 kbps (high quality), or 256 kbps (maximum). The OGG is decoded to PCM first."],
  ["3. Convert for Apple/Windows", "Your OGG is encoded to AAC for use in Apple devices, Windows Media Player, and any ecosystem that prefers AAC over OGG."],
], [
  ["Why does my game have OGG but not AAC?", "OGG Vorbis is popular in game development because it is royalty-free. Many game audio assets are distributed as OGG to avoid licensing costs."],
  ["Can I convert OGG 5.1 surround to AAC?", "Yes, but AAC surround output depends on the profile. AAC-LC supports up to 48 channels. The conversion preserves multi-channel layout if the target profile supports it."],
  ["Does AAC preserve OGG metadata?", "Most Vorbis comments (title, artist, album) are transferred to AAC metadata fields during conversion. OGG-specific tags without AAC equivalents are dropped."],
]);

add("ogg-to-aiff", [
  ["1. Pick OGG File", "Select an OGG Vorbis file. Converting to AIFF is useful when preparing game audio assets for Mac-based audio post-production."],
  ["2. Configure AIFF Output", "Set sample rate and bit depth. Match the OGG source's sample rate to avoid unnecessary resampling. 24-bit depth is recommended for editing headroom."],
  ["3. Export Uncompressed AIFF", "The OGG is decoded to full PCM and wrapped as AIFF. The file is ready for professional audio work in Logic Pro, Pro Tools, or any AIFF-compatible DAW."],
], [
  ["Can I convert OGG to AIFF without quality loss?", "The OGG-to-PCM decoding is lossless — all audio data present in the OGG is preserved. However, OGG is lossy, so the original quality ceiling is the OGG encode."],
  ["Why is the AIFF file so much larger?", "OGG Vorbis compresses audio 5-10x. AIFF is uncompressed. A 5 MB OGG file may become 30-50 MB as AIFF, with no audible quality improvement."],
  ["Does AIFF support Vorbis comment blocks?", "No. Vorbis comments are specific to OGG containers. AIFF metadata fields are populated from matching Vorbis tags during conversion."],
]);

add("ogg-to-flac", [
  ["1. Select OGG Source", "Choose your OGG Vorbis file. Converting OGG to FLAC creates a lossless container for an already-lossy source — useful for unified library management."],
  ["2. Set FLAC Compression", "Compression level 0 (fast encode) to 8 (best compression). Level 5 is recommended for everyday use. FLAC decoding is fast regardless of compression level."],
  ["3. Wrap in FLAC", "Your OGG is decoded to PCM and losslessly compressed to FLAC. The FLAC file is larger than the OGG but integrates into a lossless library seamlessly."],
], [
  ["Can I edit OGG audio without re-compressing?", "OGG editing typically requires decode-reencode cycles. FLAC also requires decode-reencode for non-destructive editing, but without additional quality loss."],
  ["Is FLAC metadata as rich as OGG's?", "FLAC supports METADATA_BLOCK_VORBIS_COMMENT which is functionally equivalent to OGG Vorbis comments. Most metadata transfers cleanly."],
  ["Will FLAC from OGG sound better than FLAC from CD?", "No. FLAC from OGG contains the OGG's lossy data. FLAC from CD contains full CD-quality PCM. They are not equivalent regardless of the FLAC container."],
]);

add("ogg-to-m4a", [
  ["1. Upload OGG File", "Select an OGG audio file. This conversion is common when moving audio from open-source software into Apple's ecosystem."],
  ["2. Select M4A Codec", "Choose AAC (lossy, compatible with all Apple devices) or ALAC (lossless, compatible with iTunes but larger). AAC is recommended for portable use."],
  ["3. Convert for Apple Devices", "Your OGG is encoded to M4A with the selected codec. Sync the resulting file with iTunes, Apple Music, or any iOS device."],
], [
  ["Can I embed album art in M4A from OGG?", "Yes. If the OGG file contains embedded cover art (METADATA_BLOCK_PICTURE), it is transferred to the M4A container as a covr atom during conversion."],
  ["Does M4A from OGG support chapter markers?", "OGG has no chapter marker standard, so chapters cannot be transferred. M4A chapters can be added after conversion using chapter editor tools."],
  ["Why would I convert OGG to M4A instead of MP3?", "M4A (AAC) offers better quality than MP3 at the same bitrate. For Apple device users, M4A is the preferred format with native ecosystem support."],
]);

add("ogg-to-mp3", [
  ["1. Choose OGG Source", "Select an OGG Vorbis file. Converting to MP3 is essential when the playback device lacks OGG support — common in car stereos and older devices."],
  ["2. Set MP3 Encoding Parameters", "Choose between CBR (constant, predictable size) or VBR (variable, better quality). For OGG at quality 5 (~160 kbps), use MP3 VBR 2 (~190 kbps)."],
  ["3. Generate Compatible MP3", "Your OGG is decoded and re-encoded to MP3. The MP3 plays on virtually any device, at the cost of a small generational quality loss from the double encoding."],
], [
  ["Is it better to convert OGG to MP3 or use OGG directly?", "If your device plays OGG, use it directly. Double-lossy encoding (OGG→MP3) always degrades quality. Only convert if MP3 is required by your hardware."],
  ["How much quality is lost converting OGG to MP3?", "OGG at quality 6 (~192 kbps) converted to MP3 320 kbps is nearly indistinguishable from the OGG source. Lower OGG quality settings result in more noticeable MP3 artifacts."],
  ["Does the MP3 preserve ReplayGain from OGG?", "MP3 does not support ReplayGain natively. ReplayGain values stored in OGG Vorbis comments are lost during conversion to MP3."],
]);

add("ogg-to-opus", [
  ["1. Select OGG Vorbis File", "Choose your OGG audio. OGG to Opus is a common upgrade path for open-source audio collections, since Opus outperforms Vorbis at all bitrates."],
  ["2. Choose Opus Bandwidth", "Opus supports narrowband (4 kHz), mediumband (7 kHz), wideband (12 kHz), super-wideband (20 kHz), and fullband (48 kHz). Fullband is recommended for music."],
  ["3. Encode to Opus", "Your OGG is transcoded to Opus. The Opus file will be 20-30% smaller than the OGG at equivalent quality, further reducing your audio library's storage footprint."],
], [
  ["Can I batch convert an OGG library to Opus?", "Yes. The tool supports batch conversion. Be aware that each conversion incurs generational loss since both are lossy codecs."],
  ["Which has lower latency: Opus or Vorbis?", "Opus has significantly lower latency (26.5 ms music, 5 ms voice) compared to Vorbis (~100 ms). This makes Opus suitable for live streaming and communication apps."],
  ["Is Opus decoding faster than Vorbis?", "Opus decoding is computationally similar to Vorbis. Both are efficient on modern hardware. On ARM devices (Raspberry Pi, smartphones), both decode 100x realtime."],
]);

add("ogg-to-wav", [
  ["1. Select OGG File to Decode", "Choose an OGG Vorbis file for conversion to uncompressed WAV. Standard practice when extracting audio from open-source software for editing."],
  ["2. Set WAV Properties", "Choose output bit depth (16 or 24 bit) and channel mapping (stereo, mono, or original). 24-bit recommended if further processing is planned."],
  ["3. Export for Universal Editing", "Your OGG is fully decoded to PCM WAV. The WAV file is ready for import into any audio editor, sample library, or DAW without format restrictions."],
], [
  ["Can I convert OGG to WAV without installing anything?", "This tool runs entirely in your browser using WebAssembly — no installation or plugins needed. All processing is done locally on your machine."],
  ["Why is the WAV file a different length than the OGG?", "OGG and WAV may report slightly different durations due to how Vorbis handles sample-accurate timing. The actual audio content length is identical."],
  ["Does WAV preserve OGG's encoder delay?", "OGG Vorbis has ~7 ms of encoder delay that is typically trimmed during playback. The decoded WAV may retain or trim this depending on the decoder implementation."],
]);

add("ogg-to-wma", [
  ["1. Choose OGG Audio", "Select an OGG Vorbis file. Converting to WMA is primarily for Windows-based applications and corporate audio systems."],
  ["2. Configure WMA Encoding", "Set bitrate (64-192 kbps) and encoding type (CBR or VBR). WMA VBR at 128 kbps provides a good balance of quality and file size for most content."],
  ["3. Encode to WMA", "Your OGG is transcoded to Windows Media Audio. The resulting file plays natively in Windows-based applications, SharePoint, and PowerPoint presentations."],
], [
  ["Can I play WMA on Linux?", "Yes, through FFmpeg-based players like VLC, Audacious, and SMPlayer. Some distributions require wma-codecs from non-free repositories."],
  ["Does WMA support OGG's quality levels?", "WMA quality is set by bitrate, not a quality scale like Vorbis. WMA at 192 kbps is comparable to OGG quality level 6 (~192 kbps) in listening tests."],
  ["Is WMA suitable for archiving?", "No. WMA is a lossy format not suitable for archiving. For archival, keep the original OGG or convert to FLAC for a lossless archive."],
]);

// ---- OPUS TARGETS ----
add("opus-to-aac", [
  ["1. Upload Opus File", "Select an Opus audio file. Opus is excellent for streaming efficiency. Convert to AAC when Apple device or legacy hardware compatibility is needed."],
  ["2. Set AAC Target", "Choose 128 kbps (good for mixed content), 192 kbps (high quality), or 256 kbps (transparent). Since Opus is more efficient than AAC, expect slight file size increase."],
  ["3. Cross-Platform Conversion", "Your Opus file is decoded and re-encoded to AAC. The resulting file is compatible with iPhones, iPads, PlayStation, and most smart speakers."],
], [
  ["Why does AAC from Opus sound different?", "Opus and AAC use different psychoacoustic models. They mask audio imperfections differently. Some artifacts audible in one codec may be masked in the other."],
  ["Will the AAC file be larger than the Opus?", "Yes, at equivalent perceived quality. Opus is 10-20% more efficient than AAC. A 96 kbps Opus transcoded to 128 kbps AAC produces a ~30% larger file."],
  ["Can I use AAC in web audio APIs?", "Yes. AAC is supported by HTML5 Audio in most browsers. Web Audio API can decode AAC through MediaElementSource or by fetching and decoding the file."],
]);

add("opus-to-aiff", [
  ["1. Select Opus File", "Pick an Opus audio file for conversion to AIFF. Useful for integrating high-efficiency Opus streams into professional audio workflows."],
  ["2. Set AIFF Format", "Choose 16, 24, or 32-bit output depth. 24-bit preserves the full dynamic range of the Opus decode for processing in your DAW."],
  ["3. Export AIFF for Production", "Your Opus stream is decoded to PCM and saved as AIFF. The file is ready for use in Mac-based audio production environments."],
], [
  ["Does AIFF from Opus have lower quality than AIFF from WAV?", "Indirectly, yes. The AIFF contains the decoded Opus data — the quality ceiling is the original Opus encode. It is not the same as AIFF from a lossless source."],
  ["Can I edit AIFF from Opus without quality loss?", "Editing AIFF (trimming, fading, gain changes) does not degrade quality further. Re-exporting as AIFF after editing preserves the edited audio perfectly."],
  ["Is AIFF support universal on Mac?", "Yes. AIFF is Apple's standard uncompressed format. QuickTime, Core Audio, and all Mac audio applications support AIFF natively."],
]);

add("opus-to-flac", [
  ["1. Choose Opus Source", "Select an Opus audio file. Converting Opus to FLAC is useful for integrating modern Opus-encoded content into a FLAC-based archival library."],
  ["2. Set FLAC Compression", "Compression level 0-8. Despite the matrix of choices, all levels produce identical PCM output. Level 5 is the standard recommendation for everyday use."],
  ["3. Re-package as FLAC", "The Opus file is decoded to PCM and losslessly compressed to FLAC. Metadata is transferred from Opus comments to FLAC Vorbis comments."],
], [
  ["Is Opus to FLAC a lossless conversion?", "No. Opus is lossy. The FLAC container stores the decoded Opus PCM, which has already lost information during Opus encoding. The FLAC encoding itself is lossless."],
  ["Why would I convert Opus to FLAC instead of keeping Opus?", "FLAC supports richer metadata, embedded cue sheets, and is supported by more hardware players (network streamers, DACs with USB playback)."],
  ["Does FLAC preserve Opus's low-latency advantage?", "No. FLAC is designed for storage, not streaming. FLAC decoding latency is ~100ms+ while Opus has ~26ms latency. FLAC cannot match Opus for real-time use."],
]);

add("opus-to-m4a", [
  ["1. Select Opus Audio", "Choose an Opus file. Converting to M4A is necessary when the target device or application does not support Opus — Apple devices are a common case."],
  ["2. Choose M4A Quality", "Select AAC quality equivalent: 96 kbps (good for Opus-sourced content), 128 kbps (standard), or 192 kbps (high). Higher bitrates minimize generational loss."],
  ["3. Encode to M4A", "Your Opus is transcoded to AAC in an M4A container. The file is optimized for Apple Music, iTunes, and all iOS devices."],
], [
  ["Why is Opus not supported on iOS?", "Apple has standardized on AAC for audio. Opus is not supported by Core Audio, the underlying audio framework on iOS and macOS."],
  ["Does M4A from Opus retain Opus metadata?", "Most metadata is transferred. Opus comments (title, artist, album) map to M4A metadata atoms. Opus-specific encoding parameters are not retained."],
  ["Will I notice quality loss converting Opus to M4A?", "If the Opus is >128 kbps and the M4A target is 192 kbps+, the loss is likely imperceptible. Below those thresholds, double-lossy artifacts become audible."],
]);

add("opus-to-mp3", [
  ["1. Upload Opus Source", "Select your Opus audio file. Opus-to-MP3 conversion is needed when the playback hardware supports MP3 but not Opus."],
  ["2. Set MP3 Encoding", "Use VBR quality 0 (highest, ~245 kbps) to minimize quality loss. CBR 320 kbps is the safest choice if file size is not a concern."],
  ["3. Encode for Maximum Compatibility", "Your Opus is decoded and re-encoded to MP3. The resulting file plays on any MP3-compatible device from the last 25 years."],
], [
  ["Is Opus to MP3 a bad idea quality-wise?", "Both are lossy, so there is generational loss. However, Opus at 160 kbps converted to MP3 at 320 kbps is still very good quality for casual listening."],
  ["What bitrate Opus source is worth converting?", "Only convert Opus files encoded at 128 kbps or higher. Lower Opus bitrates already lack high-frequency detail, which MP3 encoding will further degrade."],
  ["Does MP3 support Opus's 48 kHz full bandwidth?", "Yes. MP3 supports up to 48 kHz sampling rate. Opus fullband (48 kHz) content is resampled as needed, but the frequency range is preserved."],
]);

add("opus-to-ogg", [
  ["1. Choose Opus File", "Select an Opus audio file to convert to OGG Vorbis. This is relevant for compatibility with older software that supports Vorbis but not Opus."],
  ["2. Set Vorbis Quality", "Select Vorbis quality level. For Opus at 96 kbps, use Vorbis level 5 (~160 kbps) to match quality. For Opus at 128 kbps, level 6 (~192 kbps)."],
  ["3. Convert to Vorbis", "Your Opus is transcoded to OGG Vorbis. The file is compatible with older Android versions, some smart TVs, and legacy in-dash navigation systems."],
], [
  ["Is OGG Vorbis or Opus better?", "Opus is objectively better at all bitrates. OGG Vorbis is older and less efficient. This conversion is only for compatibility, not quality improvement."],
  ["Does OGG support Opus's speech mode?", "No. Opus has a dedicated SILK speech mode that excels at low-bitrate voice. Vorbis uses a single encoding mode for all content types."],
  ["Will the OGG file be larger than the Opus?", "Yes. Vorbis is less efficient than Opus. Expect the OGG file to be 20-40% larger at equivalent quality."],
]);

add("opus-to-wav", [
  ["1. Import Opus for Decoding", "Select the Opus file to decode to WAV. Opus is efficient but not editable — WAV gives you sample-level access for audio processing."],
  ["2. Set WAV Output Format", "Choose 16-bit for standard delivery or 24-bit for production. The output sample rate can match the Opus source (typically 48 kHz)."],
  ["3. Decode to Raw WAV", "Your Opus file is decoded to uncompressed PCM WAV. The file is suitable for loading into any audio editor for further processing."],
], [
  ["Is Opus decoding to WAV a lossless process?", "Yes, the Opus decoder produces a PCM output that is fully accurate to the Opus specification. No further loss is introduced during WAV creation."],
  ["Why is the WAV file sample rate 48 kHz?", "Opus uses a 48 kHz internal sampling rate regardless of input. Decoded Opus outputs at 48 kHz. If the original content was 44.1 kHz, resampling occurred during Opus encoding."],
  ["Can I recover the original pre-Opus file by converting to WAV?", "No. Opus is lossy — decoding to WAV reveals only the post-Opus audio. The original uncompressed source is permanently lost."],
]);

add("opus-to-wma", [
  ["1. Select Opus Source", "Choose an Opus audio file. Opus to WMA conversion is rarely needed but useful for legacy Windows applications."],
  ["2. Set WMA Bitrate", "Select 128 kbps for acceptable quality or 192 kbps for high quality. WMA Pro at 192 kbps matches Opus quality more closely than WMA Standard."],
  ["3. Encode to WMA", "Your Opus is transcoded to Windows Media Audio. The file integrates with Windows-based media systems, presentation software, and corporate audio libraries."],
], [
  ["Does WMA preserve Opus's packet loss concealment?", "WMA has its own packet loss concealment mechanisms that differ from Opus. Network resilience features are not transferable between codecs."],
  ["Is WMA or Opus better for streaming?", "Opus is significantly better for streaming due to lower latency, better packet loss handling, and superior quality at streaming bitrates (32-96 kbps)."],
  ["Can I play the resulting WMA on Xbox?", "Yes. Xbox consoles natively support WMA playback through the Media Player app and when streaming from a Windows Media Center server."],
]);

// ---- WAV TARGETS ----
add("wav-to-aac", [
  ["1. Load Your WAV File", "Select a WAV file — this is your uncompressed source. WAV files are large but lossless, making them ideal sources for lossy encoding."],
  ["2. Set AAC Parameters", "Choose target bitrate: 128 kbps (voice), 192 kbps (balanced), 256 kbps (high quality), or 320 kbps (maximum). Since WAV is uncompressed, the AAC encode is first-generation."],
  ["3. Encode from Uncompressed", "Your WAV is encoded to AAC. Because the source is lossless PCM, this single encode produces the best possible AAC quality — no generational loss."],
], [
  ["Will AAC from WAV sound better than AAC from MP3?", "Yes. Encoding AAC from WAV is first-generation encoding. AAC from MP3 is second-generation (MP3 artifacts plus AAC artifacts combined)."],
  ["How much space will I save?", "WAV at 1411 kbps (CD) to AAC at 256 kbps saves ~80% storage. A 50 MB WAV song becomes ~10 MB AAC with near-indistinguishable quality."],
  ["Should I keep the original WAV after encoding AAC?", "Yes. Archive the WAV file. If you need to re-encode to a future codec, the WAV source produces better results than re-encoding from AAC."],
]);

add("wav-to-aiff", [
  ["1. Select WAV Source", "Choose a WAV audio file. WAV and AIFF both contain PCM audio — they differ only in container format and byte ordering."],
  ["2. Choose AIFF Variant", "Select standard AIFF (.aif) for macOS/Pro Tools compatibility or AIFF-C (.aifc) which supports compression options."],
  ["3. Container Swap", "The PCM data is copied from the WAV container to an AIFF container with byte-swapping if needed. No audio data is modified — the process is lossless."],
], [
  ["Is WAV to AIFF really lossless?", "Yes. Both formats store identical PCM audio data. Only the header format and byte ordering differ. No audio quality is affected."],
  ["Why would I use AIFF over WAV?", "AIFF is preferred in Mac-based studios, Pro Tools (historical), and some broadcast environments. WAV is more universal on Windows."],
  ["Does file size differ between WAV and AIFF?", "AIFF is typically 1-5% larger than WAV due to differences in header structure and data chunk alignment. The audio data portion is identical."],
]);

add("wav-to-flac", [
  ["1. Choose Your WAV File", "Select uncompressed WAV audio. FLAC reduces file size by 40-60% without any quality loss — every bit of the WAV is perfectly preserved."],
  ["2. Set FLAC Compression Level", "Level 0 is fastest with least compression. Level 8 is slowest with best compression. Level 5 is recommended: ~50% size reduction with fast encoding."],
  ["3. Compress Losslessly", "Your WAV is encoded to FLAC. The FLAC file retains CD-quality or hi-res audio identically to the WAV, but takes up half the disk space."],
], [
  ["Is FLAC decoding as fast as WAV playback?", "FLAC decoding is fast enough that CPU usage is negligible on modern hardware. FLAC decoding achieves ~50x realtime on a typical laptop — no buffering issues."],
  ["Can I convert FLAC back to WAV?", "Yes, losslessly. FLAC is fully reversible. The decoded WAV is bit-identical to the original WAV that was compressed to FLAC."],
  ["Does FLAC support all WAV bit depths?", "FLAC supports 4-32 bits per sample, 1-8 channels, and sample rates from 1 Hz to 1,048,570 Hz. All standard WAV formats are supported."],
]);

add("wav-to-m4a", [
  ["1. Import WAV Audio", "Select your uncompressed WAV file. Converting WAV to M4A with AAC compression is the standard workflow for preparing audio for Apple devices."],
  ["2. Configure M4A Output", "Choose AAC bitrate (128-320 kbps) and whether to include optimized gapless playback metadata for iTunes."],
  ["3. Compress for Apple", "Your WAV is encoded to AAC in an M4A container. The file integrates perfectly with Apple Music, iTunes, and iOS devices."],
], [
  ["Can M4A contain ALAC from WAV?", "Yes, but this converter produces AAC (lossy) in M4A. For lossless M4A, use ALAC encoding which is also supported by iTunes and iOS."],
  ["Does M4A support sample rates above 48 kHz?", "M4A with AAC-LC supports up to 96 kHz. For hi-res audio (>48 kHz), ALAC in M4A supports up to 192 kHz without loss."],
  ["Will I notice the difference between WAV and 256 kbps M4A?", "In blind listening tests, most listeners cannot reliably distinguish 256 kbps AAC from the original WAV on typical playback systems."],
]);

add("wav-to-mp3", [
  ["1. Select Uncompressed WAV", "Choose your WAV file. Encoding MP3 from WAV is the best-case scenario — first-generation MP3 with no prior lossy encoding."],
  ["2. Set MP3 Encoding", "Choose CBR for predictable file sizes, VBR for optimal quality, or ABR for a mix. VBR 0 (~245 kbps avg) is transparent from CD-quality WAV."],
  ["3. Compress to MP3", "Your WAV is encoded to MP3. The first-generation MP3 preserves the best possible quality from your uncompressed source."],
], [
  ["Is MP3 at 320 kbps indistinguishable from WAV?", "For most people and most music, yes. Some trained listeners can detect MP3 artifacts on certain content (cymbals, applause, sibilance) even at 320 kbps."],
  ["What is the minimum bitrate for acceptable music quality?", "For music, 192 kbps CBR or VBR 2 (~190 kbps) is the minimum for acceptable quality. Below 128 kbps, high-frequency detail and stereo imaging degrade noticeably."],
  ["Should I delete WAV files after creating MP3?", "Keep the WAV files as your lossless archive. Storage is cheap; re-encoding from MP3 to a future format will result in poorer quality."],
]);

add("wav-to-ogg", [
  ["1. Pick Your WAV File", "Select uncompressed WAV audio. OGG Vorbis is an excellent choice for open-source projects and Android applications requiring smaller files."],
  ["2. Set Vorbis Quality", "Vorbis quality level 5 (~160 kbps) is transparent for most content from CD-quality WAV. Level 3 (~112 kbps) is acceptable for background listening."],
  ["3. Encode to Open Standard", "Your WAV is encoded to OGG Vorbis — a royalty-free codec with no patent licensing requirements for distribution."],
], [
  ["Is Vorbis better than MP3 at the same bitrate?", "Vorbis consistently outperforms MP3 in listening tests at equivalent bitrates, particularly below 192 kbps where MP3's limitations become audible."],
  ["Can I use OGG in broadcast production?", "OGG is less common in broadcast than MP3 or AAC. For production, keep WAV masters and use OGG only for delivery where specified."],
  ["Does OGG support dynamic range compression metadata?", "OGG supports REPLAYGAIN tags but does not support dynamic range compression (DRC) metadata like AC-3 or AAC do."],
]);

add("wav-to-opus", [
  ["1. Load WAV Source", "Choose your uncompressed WAV. Opus from WAV produces the highest quality Opus possible since there is no prior lossy encoding to compound."],
  ["2. Set Opus Bitrate", "For transparent encoding, 96-128 kbps Opus matches WAV quality for most listeners. For critical listening, 160 kbps provides headroom."],
  ["3. Modern Compression", "Your WAV is encoded to Opus — the most efficient general-purpose audio codec. Files are 10-15x smaller than WAV with minimal quality loss."],
], [
  ["Is Opus from WAV better than Opus from FLAC?", "They are identical. Both WAV and FLAC contain lossless PCM input to the Opus encoder. The Opus output depends only on the PCM data, not the source container."],
  ["Can Opus match WAV quality for audio books?", "Yes, and at much lower bitrates. Opus at 48 kbps is excellent for speech — 10x smaller than WAV with no audible difference for spoken content."],
  ["What is the maximum Opus quality from WAV?", "Opus supports up to 510 kbps which exceeds the bitrate of CD-quality WAV (1411 kbps). At 510 kbps, Opus is nearly indistinguishable from the WAV source."],
]);

add("wav-to-wma", [
  ["1. Choose WAV Source", "Select uncompressed WAV audio for conversion to WMA. This is useful when preparing audio for Windows-based applications and enterprise media systems."],
  ["2. Set WMA Encoding", "Choose WMA Standard (128-192 kbps, broad compatibility) or WMA Pro (up to 768 kbps, 24-bit, multi-channel up to 7.1)."],
  ["3. Encode for Windows", "Your WAV is encoded to Windows Media Audio optimized for Windows Media Player, Windows Phone, and Xbox ecosystems."],
], [
  ["Is WMA Pro at 768 kbps transparent from WAV?", "At 768 kbps, WMA Pro is audibly transparent for 24-bit/96 kHz sources. Below 192 kbps, WMA Pro sounds similar to AAC at equivalent bitrates."],
  ["Can WMA preserve WAV's bit depth?", "WMA Standard supports up to 16-bit. WMA Pro supports up to 24-bit. For 32-bit float WAV sources, down-conversion to 24-bit occurs."],
  ["Does WMA support sample rates above 48 kHz?", "WMA Pro supports up to 96 kHz. WMA Standard supports up to 48 kHz. High-resolution content is downsampled for Standard profile."],
]);

// ---- WMA TARGETS ----
add("wma-to-aac", [
  ["1. Upload WMA File", "Select a WMA audio file. WMA is common in Windows environments but not supported on Apple devices. AAC provides broad cross-platform compatibility."],
  ["2. Set AAC Quality", "Choose 128 kbps (adequate), 192 kbps (good), or 256 kbps (excellent). AAC generally outperforms WMA at equivalent bitrates."],
  ["3. Convert for Cross-Platform", "Your WMA is decoded and re-encoded to AAC. The resulting file plays on iPhone, iPad, Mac, PlayStation, and smart speakers without WMA codec issues."],
], [
  ["Is AAC better than WMA?", "AAC achieves better quality than WMA Standard at the same bitrate. WMA Pro approaches AAC quality but has narrower device support."],
  ["Will I lose quality converting WMA to AAC?", "Yes, this is double-lossy (WMA→PCM→AAC). Use the highest available WMA bitrate and target 256 kbps AAC to minimize perceivable loss."],
  ["Can I play AAC on Windows without additional codecs?", "Yes. Windows 10 and 11 include AAC decoder support. Windows Media Player may need the HE-AAC package from the Microsoft Store for full support."],
]);

add("wma-to-aiff", [
  ["1. Select WMA Source", "Pick a WMA file for conversion to AIFF. Useful when Windows-format audio needs to be used in Mac-based production environments."],
  ["2. Set AIFF Format", "Choose bit depth (16 or 24 bit). The output sample rate matches the WMA source. 24-bit depth provides headroom for further processing."],
  ["3. Export for Mac Production", "Your WMA is decoded to PCM and saved as AIFF. The file is ready for import into Logic Pro, GarageBand, or Final Cut Pro."],
], [
  ["Does AIFF from WMA sound better than using WMA directly?", "No. AIFF is uncompressed, but the decoded audio quality is limited by the WMA source. AIFF provides easier editing at the cost of much larger files."],
  ["Can macOS play WMA natively?", "No. macOS does not include WMA support. Converting to AIFF ensures native playback and editing capability on all Mac software."],
  ["Does this preserve WMA metadata?", "Basic metadata (title, artist, album) is transferred. WMA-specific metadata fields (especially Windows Media-specific tags) are dropped during conversion."],
]);

add("wma-to-flac", [
  ["1. Choose WMA File", "Select a WMA file. Converting WMA to FLAC allows you to integrate Windows-sourced audio into a lossless-format library for unified management."],
  ["2. Set FLAC Compression", "Level 0 for fastest encoding or level 8 for smallest file. The FLAC file will be 2-3x larger than the WMA since FLAC is lossless."],
  ["3. Wrap in Lossless Container", "Your WMA is decoded and stored in FLAC. While FLAC is lossless, it preserves the WMA's lossy quality — the original uncompressed quality is unrecoverable."],
], [
  ["Does FLAC from WMA contain original quality?", "No. The WMA's lossy compression removed audio information before FLAC encoding. FLAC stores whatever audio data the WMA decoder outputs — no more, no less."],
  ["Why convert WMA to FLAC instead of keeping WMA?", "FLAC provides richer metadata (cuesheets, pictures, ReplayGain) and broader hardware support (network players, DAPs, car stereos)."],
  ["Is the conversion reversible?", "No. FLAC is bit-exact from the WMA decode, but you cannot reconstruct the original WMA bitstream from FLAC."],
]);

add("wma-to-m4a", [
  ["1. Select WMA Audio", "Choose your WMA file. This conversion is essential for moving a Windows Media-based music library into Apple's ecosystem."],
  ["2. Set M4A Encoding", "Select AAC bitrate: 128 kbps (standard), 192 kbps (good), or 256 kbps (high). The WMA decode feeds clean PCM into the AAC encoder."],
  ["3. Encode for Apple", "Your WMA is transcoded to AAC in an M4A container. The file syncs with iTunes, Apple Music, and all iOS devices without compatibility issues."],
], [
  ["Can I preserve WMA album art in M4A?", "Yes. If the WMA file contains embedded album art, it is extracted and stored as a covr atom in the M4A container during conversion."],
  ["Does M4A support WMA's lossless mode?", "WMA Lossless is a separate format. This converter handles WMA Standard/Pro. For lossless workflows, use ALAC in M4A from a lossless source."],
  ["Will my WMA play counts transfer to M4A?", "No. Play count data is stored in the Windows Media Player database, not in the file itself. This metadata is lost during conversion."],
]);

add("wma-to-mp3", [
  ["1. Upload WMA File", "Select a WMA audio file. WMA to MP3 conversion is useful when the target device supports MP3 but not WMA — common in older car audio systems."],
  ["2. Choose MP3 Quality", "Select 192 kbps for balanced quality, 256 kbps for good quality, or 320 kbps CBR for maximum MP3 quality. VBR encoding is recommended for better efficiency."],
  ["3. Convert for Universal Playback", "Your WMA is transcoded to MP3. The resulting file plays on any MP3-compatible device — from 2000s portable players to modern smart speakers."],
], [
  ["Is MP3 or WMA better?", "At equivalent bitrates, WMA generally matches or slightly exceeds MP3 quality below 128 kbps. Above 192 kbps, the difference is negligible."],
  ["Does WMA to MP3 add noticeable artifacts?", "Double lossy encoding always adds artifacts. If the WMA is 192 kbps or higher and the MP3 target is 256 kbps+, most listeners will not notice."],
  ["Can I batch convert a WMA library to MP3?", "Yes. Select multiple WMA files for batch processing. Each file is decoded and re-encoded individually."],
]);

add("wma-to-ogg", [
  ["1. Choose WMA File", "Select a WMA audio file. Converting to OGG Vorbis helps migrate audio from proprietary Windows Media into open, royalty-free formats."],
  ["2. Set Vorbis Quality", "Quality level 5 (~160 kbps) for music, level 3 (~112 kbps) for mixed content. Vorbis quality scales differently from WMA, so some experimentation may help."],
  ["3. Encode to Open Format", "Your WMA is transcoded to OGG Vorbis. The resulting file is patent-free and plays on Android, Linux, and web platforms without restrictions."],
], [
  ["Is OGG Vorbis better than WMA?", "Vorbis outperforms WMA Standard at most bitrates and is competitive with WMA Pro. Vorbis also has the advantage of being completely royalty-free."],
  ["Does OGG support Windows Media metadata?", "Vorbis comments can store most metadata fields, but WMA-specific fields (WM/Genre, WM/Year) need manual mapping."],
  ["Can I use OGG in Windows apps?", "Windows does not include native OGG support. VLC, Foobar2000, and Winamp can play OGG, but Windows Media Player requires codec packs."],
]);

add("wma-to-opus", [
  ["1. Select WMA Source", "Pick a WMA file. Converting to Opus from WMA gives you the efficiency benefits of Opus while working with Windows-sourced audio."],
  ["2. Set Opus Bitrate", "96 kbps Opus matches WMA at 128 kbps quality. 128 kbps Opus exceeds WMA at 192 kbps. Opus is significantly more efficient than WMA."],
  ["3. Transcode to Modern Codec", "Your WMA is decoded and encoded to Opus. The Opus file is smaller than the WMA with similar or better quality."],
], [
  ["Is Opus worth converting WMA for?", "Yes, if device compatibility allows. Opus saves 30-50% storage compared to WMA at equivalent quality. The conversion is one-time per file."],
  ["Does Opus support WMA's multi-channel audio?", "Opus supports up to 255 channels. WMA Pro 5.1/7.1 surround content is preserved during conversion to Opus with multi-channel mapping."],
  ["Can I play the resulting Opus on Xbox?", "Xbox consoles do not natively support Opus. For Xbox playback, keep the original WMA or convert to AAC instead."],
]);

add("wma-to-wav", [
  ["1. Select WMA for Decoding", "Choose the WMA file to decode to uncompressed WAV. WAV is the universal intermediate format for audio editing and processing."],
  ["2. Set WAV Output Format", "Select the output bit depth (16 or 24 bit) and sample rate. Matching the WMA's original format avoids unnecessary resampling."],
  ["3. Decode to Uncompressed WAV", "Your WMA is decoded to linear PCM and saved as WAV. The file is 5-10x larger than the WMA but ready for editing in any audio application."],
], [
  ["Is WMA to WAV decoding lossless?", "Yes, the WMA decoder produces a PCM output that fully represents the WMA specification. No quality is lost during decoding."],
  ["Can I recover CD quality from a WMA?", "Only if the WMA was encoded from CD at a high bitrate (lossless or 192+ kbps). A low-bitrate WMA (64 kbps) decoded to WAV still sounds low-quality."],
  ["Why use WAV instead of editing WMA directly?", "WMA editing typically requires decode-reencode, degrading quality each time. WAV editing is lossless — trim, fade, and process without cumulative quality loss."],
]);

// ---- AIFF TARGETS ----
add("aiff-to-aac", [
  ["1. Select AIFF Source", "Choose an AIFF audio file. AIFF is uncompressed — encoding to AAC from AIFF produces first-generation AAC with optimal quality."],
  ["2. Choose AAC Target", "128 kbps (standard), 192 kbps (good), or 256 kbps (excellent). Since AIFF is uncompressed PCM, this is a single-pass lossy encode."],
  ["3. Compress for Devices", "Your AIFF is encoded to AAC. The AAC file takes 80-90% less space while retaining near-identical quality for portable listening."],
], [
  ["Should I keep the AIFF after converting to AAC?", "Yes. AIFF is your lossless master. If a better codec emerges in the future, you can re-encode from AIFF without the quality loss of re-encoding from AAC."],
  ["Does AAC match AIFF quality for mastering?", "No. AAC is lossy and not suitable for audio mastering. Always use the AIFF or another uncompressed format for final production decisions."],
  ["What is the bitrate sweet spot for AAC from AIFF?", "256 kbps AAC-LC is considered transparent — most listeners cannot distinguish it from the AIFF source. Higher bitrates offer diminishing returns."],
]);

add("aiff-to-flac", [
  ["1. Load AIFF Audio", "Select your uncompressed AIFF file. AIFF and FLAC both contain PCM audio — FLAC adds lossless compression to reduce file size."],
  ["2. Set FLAC Compression", "Compression level 0 (fast) to 8 (smallest). AIFF-to-FLAC reduces storage by 40-60% without any quality loss."],
  ["3. Compress Losslessly", "Your AIFF is encoded to FLAC. The FLAC file decodes to bit-identical PCM as the original AIFF. Metadata transfers from AIFF to FLAC."],
], [
  ["Is there any quality difference between AIFF and FLAC?", "No. FLAC is a lossless codec — decoding produces PCM identical to the original AIFF. The difference is only container format and file size."],
  ["Does FLAC support AIFF's sample rates?", "Yes. FLAC supports up to 1,048,570 Hz sample rate and up to 32-bit depth, covering all AIFF formats including DSD and hi-res audio."],
  ["Which is more compatible: AIFF or FLAC?", "FLAC has broader hardware support (network players, DAPs, car stereos). AIFF has better support in Apple's ecosystem and Pro Tools."],
]);

add("aiff-to-m4a", [
  ["1. Pick AIFF Source", "Select an AIFF audio file. AIFF is standard in Mac production — converting to M4A prepares audio for Apple device playback."],
  ["2. Select M4A Codec", "Choose AAC (lossy, small size) or ALAC (lossless, larger). AAC at 256 kbps is recommended for portable listening; ALAC for archival."],
  ["3. Encode for Apple Ecosystem", "Your AIFF is encoded to M4A with your chosen codec. The M4A file is ready for iTunes, Apple Music, AirDrop, and iOS devices."],
], [
  ["Can I embed AIFF metadata in M4A?", "AIFF metadata (Name, Author, Copyright chunks) is mapped to M4A metadata atoms during conversion. Some format-specific metadata may not transfer."],
  ["Does M4A support AIFF's 32-bit float?", "AAC in M4A does not support 32-bit float. ALAC in M4A supports up to 32-bit integer. Float sources must be dithered to integer during conversion."],
  ["Why convert AIFF to M4A instead of keeping AIFF?", "M4A is 5-10x smaller, supports embedded artwork and chapter markers, and is the native format for Apple Music and iOS."],
]);

add("aiff-to-mp3", [
  ["1. Select AIFF Uncompressed Source", "Choose an AIFF file. Encoding MP3 from AIFF avoids generational loss — this is a single MP3 encode from pristine PCM."],
  ["2. Set MP3 Encoding", "Use VBR 0 (~245 kbps) for maximum quality or CBR 320 kbps for consistent bitrate. VBR is recommended for better quality-to-size ratio."],
  ["3. Create Universal MP3", "Your AIFF is encoded to MP3 — the most compatible audio format worldwide. The MP3 plays on all MP3 devices without exception."],
], [
  ["Is MP3 from AIFF better than MP3 from AAC?", "Yes. AIFF is uncompressed source material. AAC is already lossy. Encoding MP3 from AIFF produces first-generation MP3; from AAC compounds artifacts."],
  ["What MP3 bitrate is considered 'transparent' from AIFF?", "LAME MP3 at VBR 0 (~245 kbps avg) or CBR 320 kbps is transparent for nearly all listeners and content types on typical playback equipment."],
  ["Can I convert AIFF to MP3 in batch?", "Yes. Select multiple AIFF files for batch MP3 encoding. Each file is independently decoded and encoded for maximum quality."],
]);

add("aiff-to-ogg", [
  ["1. Upload AIFF File", "Select your uncompressed AIFF audio. Converting to OGG is common for open-source projects requiring smaller file sizes."],
  ["2. Set Vorbis Encoding", "Quality level 5 (~160 kbps) for transparent music from 16-bit AIFF. Level 3 (~112 kbps) for acceptable quality with smaller files."],
  ["3. Encode to Open Format", "Your AIFF is encoded to OGG Vorbis — a patent-free audio format. The Vorbis file is an order of magnitude smaller than the AIFF source."],
], [
  ["Does Vorbis from AIFF sound identical to the original?", "For transparent settings (level 5+), Vorbis is audibly indistinguishable from AIFF on most playback systems. Differences may appear on high-end monitoring gear."],
  ["Can I use 24-bit AIFF as source for Vorbis?", "Yes. Vorbis supports input up to 24-bit. The encoder handles the full dynamic range of 24-bit sources for high-resolution audio encoding."],
  ["Is OGG a good archival format?", "No. OGG Vorbis is lossy. For archiving, keep the original AIFF or convert to FLAC. Use OGG only for delivery and portable playback."],
]);

add("aiff-to-opus", [
  ["1. Select AIFF Source", "Choose your uncompressed AIFF file. Opus from AIFF produces the highest quality Opus encode possible for your audio."],
  ["2. Set Opus Quality", "96 kbps for excellent quality from 16-bit AIFF, 128 kbps for transparent quality, 160 kbps for 24-bit AIFF source preservation."],
  ["3. Encode to Opus", "Your AIFF is encoded to the most efficient lossy codec. Opus achieves 10-15x compression from AIFF with minimal quality loss."],
], [
  ["Is Opus from AIFF better than Opus from AAC?", "Yes. Opus from AIFF is first-generation from lossless PCM. Opus from AAC would compound AAC and Opus artifacts."],
  ["What Opus bitrate preserves 192 kHz AIFF?", "For 192 kHz content, use 160 kbps or higher Opus to capture ultrasonics. Note that most playback systems cannot reproduce >24 kHz content."],
  ["Does Opus support AIFF channel configurations?", "Opus supports up to 255 channels including various surround configurations. AIFF multi-channel content maps correctly during conversion."],
]);

add("aiff-to-wav", [
  ["1. Load AIFF File", "Select an AIFF audio file. AIFF to WAV is a container conversion — the PCM data stays the same, only the header format changes."],
  ["2. Choose Output Format", "Select WAV (Microsoft) or RF64 (for files >4GB). Standard WAV is recommended for maximum compatibility."],
  ["3. Container Swap", "The PCM audio data is extracted from AIFF and wrapped in a WAV container with appropriate byte ordering. No audio re-encoding occurs."],
], [
  ["Is AIFF to WAV a lossless conversion?", "Yes. AIFF and WAV both store PCM audio data. The conversion only changes the container header and byte ordering — the samples are untouched."],
  ["Why convert AIFF to WAV?", "WAV has broader support on Windows, in broadcast environments, and in many audio editors (Audacity, Adobe Audition) that prefer WAV."],
  ["Does file size change between AIFF and WAV?", "WAV files are typically 1-3% smaller than equivalent AIFF due to different header structure and no byte-swap overhead."],
]);

add("aiff-to-wma", [
  ["1. Pick AIFF Source", "Select your AIFF audio file. Converting to WMA helps integrate Mac-produced audio into Windows-based media systems and corporate applications."],
  ["2. Set WMA Quality", "Choose 128 kbps (adequate for speech), 160 kbps (good), or 192 kbps (high quality). WMA Pro recommended for higher fidelity from 24-bit AIFF sources."],
  ["3. Encode for Windows", "Your AIFF is encoded to WMA for native playback in Windows Media Player, Windows Phone, and Xbox consoles."],
], [
  ["Is AIFF to WMA a common workflow?", "No, it is uncommon. Most users working with AIFF stay in the Apple ecosystem. This workflow exists for cross-platform asset delivery or corporate requirements."],
  ["Does WMA preserve AIFF's high sample rates?", "WMA Standard supports up to 48 kHz. WMA Pro supports up to 96 kHz. AIFF sources above these rates are downsampled."],
  ["Can I play the resulting WMA on a Mac?", "macOS does not include WMA codecs. Install VLC or a WMA codec pack for macOS playback."],
]);

// ---- UTILITY TOOLS ----
add("audio-compressor", [
  ["1. Upload Audio File", "Select an audio file to compress. Supports MP3, WAV, FLAC, M4A, OGG, and other common formats."],
  ["2. Set Compression Level", "Choose from light, medium, or strong compression. Higher compression reduces file size more but may affect quality."],
  ["3. Download Compressed File", "Process and download the compressed audio file. Compare the file size reduction before and after."],
], [
  ["What compression levels are available?", "Light (minimal quality loss, ~30% size reduction), Medium (balanced, ~50% reduction), and Strong (maximum compression, ~70%+ reduction with noticeable quality difference)."],
  ["What audio formats are supported?", "Input: MP3, WAV, FLAC, M4A, OGG, AAC, WMA, AIFF. Output is the same format as input but compressed."],
  ["Is the compression lossless?", "No. Audio compression reduces file size by removing imperceptible audio data. Light compression preserves near-original quality."],
]);

add("audio-converter", [
  ["1. Upload Audio", "Select one or more audio files from your device."],
  ["2. Choose Output Format", "Pick the target format: MP3, WAV, FLAC, M4A, OGG, AAC, WMA, or AIFF."],
  ["3. Adjust Settings & Convert", "Set bitrate, sample rate, and channels. Click Convert and download your files."],
], [
  ["What formats are supported?", "Input and output: MP3, WAV, FLAC, M4A, OGG, AAC, WMA, and AIFF. Convert between any pair of supported formats."],
  ["Can I batch convert multiple files?", "Yes. Select multiple files and convert them all at once to the same output format."],
  ["What bitrate should I choose?", "128 kbps for podcasts/voice, 192 kbps for mixed content, 256-320 kbps for music. Higher bitrate = better quality + larger file."],
]);

add("audio-cutter", [
  ["1. Upload Audio", "Select an audio file to cut or trim."],
  ["2. Select Start and End Points", "Use the waveform visualization to set the exact start and end times for your clip."],
  ["3. Export Cut Audio", "Preview the trimmed section and download the result as your chosen format."],
], [
  ["Can I cut with millisecond precision?", "Yes. The waveform display allows precise selection down to the millisecond for accurate cuts."],
  ["What formats are supported?", "Input: MP3, WAV, FLAC, M4A, OGG, AAC. Output is available in MP3, WAV, and M4A formats."],
  ["Can I make multiple cuts from one file?", "Yes. Make multiple cuts and export them as separate clips or merge them into one file."],
]);

add("audio-equalizer", [
  ["1. Upload Audio", "Select an audio file to apply EQ adjustments."],
  ["2. Adjust Frequency Bands", "Use sliders to boost or cut 10 frequency bands from 31Hz to 16kHz."],
  ["3. Preview & Download", "Listen to the adjusted audio in real time and download the processed file."],
], [
  ["What frequency bands are available?", "10 bands: 31Hz, 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz covering the full audible spectrum."],
  ["Can I save EQ presets?", "Yes. Save your EQ settings as presets for reuse on other audio files."],
  ["Does this support real-time preview?", "Yes. Changes to the EQ sliders update the audio in real time for immediate feedback."],
]);

add("audio-merger", [
  ["1. Upload Audio Files", "Select multiple audio files in the order you want them merged."],
  ["2. Arrange & Configure", "Drag to reorder files. Optionally set crossfade duration between tracks."],
  ["3. Merge & Download", "Combine all files into a single audio file and download the result."],
], [
  ["How many files can I merge?", "There is no hard limit. Merge as many files as needed, but total processing time depends on combined file length."],
  ["What is crossfade?", "Crossfade blends the end of one track into the beginning of the next for smooth transitions. Adjustable from 0 to 10 seconds."],
  ["Can I merge files with different formats?", "Yes. Files in different formats are decoded and re-encoded to a single output format you choose."],
]);

add("fade-in-out", [
  ["1. Upload Audio", "Select an audio file to apply fade effects."],
  ["2. Set Fade Parameters", "Choose fade-in duration, fade-out duration, and the fade curve shape (linear, logarithmic, exponential)."],
  ["3. Preview & Export", "Preview the faded audio and download the processed file."],
], [
  ["What fade curves are available?", "Linear (constant rate), Logarithmic (smooth natural taper), and Exponential (rapid initial change). Each creates a different fade feel."],
  ["Can I apply only fade-in or only fade-out?", "Yes. Set the other fade duration to 0 to apply only the effect you want."],
  ["What formats are supported?", "Process MP3, WAV, FLAC, M4A, OGG, and AAC files. Export in MP3 or WAV format."],
]);

add("noise-reducer", [
  ["1. Upload Audio", "Select an audio recording with background noise."],
  ["2. Sample Noise Profile", "Select a section of audio containing only background noise for the tool to analyze."],
  ["3. Reduce Noise & Export", "Adjust noise reduction strength and download the cleaned audio."],
], [
  ["What types of noise can be removed?", "Background hum, fan noise, air conditioning, traffic, crowd murmur, and consistent ambient sounds. Works best on steady, predictable noise."],
  ["How do I get the best noise profile?", "Select a 1-3 second section that contains ONLY background noise (no speech or music). The quality of the noise profile directly affects results."],
  ["Will noise reduction affect audio quality?", "Strong noise reduction can introduce artifacts or make audio sound 'tinny'. Start with low settings and increase gradually."],
]);

add("vocal-remover", [
  ["1. Upload Song", "Select a music track to remove vocals from."],
  ["2. Choose Mode", "Select vocal removal for karaoke or instrumental extraction for isolating the music track."],
  ["3. Download Result", "Process and download the karaoke version or isolated instrumental."],
], [
  ["How does vocal removal work?", "The tool uses phase cancellation and spectral analysis to isolate and remove the center-panned vocal track from stereo recordings."],
  ["Does it work on all songs?", "Best results on stereo mixes where vocals are centered. Mono recordings or songs with heavy vocal effects may have limited effectiveness."],
  ["Can I extract instruments too?", "Yes. Use instrumental extraction mode to isolate the music track without vocals for sampling or remixing."],
]);

add("voice-recorder", [
  ["1. Grant Microphone Access", "Allow the browser to access your microphone when prompted."],
  ["2. Start Recording", "Click Record and speak into your microphone. Monitor audio levels in real time."],
  ["3. Stop & Download", "Stop recording, preview the audio, and download as MP3, WAV, or other formats."],
], [
  ["What audio quality options are available?", "Choose from voice quality (8kHz, mono, good for speech), standard (44.1kHz, stereo), or high quality (48kHz, stereo)."],
  ["How long can I record?", "Recording duration is limited by browser memory. Most browsers support recordings up to several hours."],
  ["Can I pause and resume recording?", "Yes. Use the pause button to temporarily stop recording and resume without creating separate files."],
]);

add("waveform-generator", [
  ["1. Upload Audio", "Select an audio file to generate a waveform visualization from."],
  ["2. Customize Appearance", "Choose waveform color, background color, style (bars, lines, filled), and resolution."],
  ["3. Export Image", "Download the waveform as a PNG, SVG, or JPG image for use in videos, thumbnails, or visualizations."],
], [
  ["What styles are available?", "Solid bars, outlined bars, line graph, and filled waveform. Each style can be customized with colors and background."],
  ["What resolutions are supported?", "Export from 640x480 up to 3840x2160 (4K). Higher resolutions produce larger image files."],
  ["Can I customize colors?", "Yes. Set waveform color, background color, and optionally a gradient for the waveform fill."],
]);

add("speech-to-text", [
  ["1. Upload or Record Audio", "Upload an audio file or record speech directly using your microphone."],
  ["2. Select Language", "Choose the spoken language for accurate transcription. Supports 50+ languages."],
  ["3. Generate & Export Transcript", "Process the audio and review the generated text. Copy or download as TXT, SRT, or VTT."],
], [
  ["What audio formats are supported?", "MP3, WAV, M4A, FLAC, OGG, and AAC. Maximum file size depends on your browser's memory limits."],
  ["How accurate is the transcription?", "Accuracy depends on audio quality, speaker clarity, and background noise. Clean recordings with clear speech achieve 90-95%+ accuracy."],
  ["Can I export with timestamps?", "Yes. Export as SRT or VTT subtitle formats with accurate timestamps for each segment."],
]);

add("text-to-speech-tts", [
  ["1. Enter Text", "Type or paste the text you want converted to speech."],
  ["2. Choose Voice & Settings", "Select from multiple voices, adjust speed, pitch, and volume. Supports 30+ languages."],
  ["3. Generate & Download", "Preview the audio and download as MP3 or WAV file."],
], [
  ["What languages are supported?", "30+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, and more."],
  ["How many voices are available?", "Multiple voices per language, including different genders and accents. Premium voices offer more natural intonation."],
  ["Can I adjust the speaking speed?", "Yes. Adjust speed from 0.5x (slow) to 2x (fast). Pitch and volume are also adjustable."],
]);

// ---- INSERTION ENGINE ----
const FILES = [
  'src/registry/tools-chunk-0.ts',
  'src/registry/tools-chunk-1.ts',
  'src/registry/tools-chunk-2.ts',
];

let modifiedCount = 0;
let skippedCount = 0;

for (const fpath of FILES) {
  let src = fs.readFileSync(fpath, 'utf8');
  for (const [slug, data] of Object.entries(ALL)) {
    const slugRegex = new RegExp(`slug:\\s*['\"]${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const m = src.match(slugRegex);
    if (!m) continue;
    const pos = m.index;
    let toolStart = src.lastIndexOf('{', pos);
    let bc = 0, toolEnd = toolStart;
    for (let k = toolStart; k < src.length; k++) {
      if (src[k] === '{') bc++;
      if (src[k] === '}') bc--;
      if (bc === 0 && k > toolStart) { toolEnd = k + 1; break; }
    }
    const ft = src.substring(toolStart, toolEnd);
    if (ft.includes('instructions:')) { skippedCount++; continue; }

    const prefix = src.substring(0, toolEnd - 1).replace(/\s+$/, '');
    const needsComma = !prefix.endsWith(',');
    const pf = prefix + (needsComma ? ',' : '');

    let it = '\n    instructions: [\n';
    for (const [ti, de] of data.instructions) {
      it += `      { title: "${ti.replace(/"/g, "'")}", desc: "${de.replace(/"/g, "'")}" },\n`;
    }
    it += '    ],\n    faqs: [\n';
    for (const [q, a] of data.faqs) {
      it += `      { question: "${q.replace(/"/g, "'")}", answer: "${a.replace(/"/g, "'")}" },\n`;
    }
    it += '    ],\n  ';

    src = pf + it + src.substring(toolEnd - 1);
    modifiedCount++;
  }
  fs.writeFileSync(fpath, src);
}

console.log(`Modified: ${modifiedCount} Audio tools`);
console.log(`Skipped (already had instructions): ${skippedCount} tools`);
