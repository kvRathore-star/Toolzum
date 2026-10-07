"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';
import { consumeHeroFile } from '@/lib/heroFile';
import { heroExtOf } from '@/lib/fileRoute';


type FormatDef = {
  key: string;
  label: string;
  ext: string;
  mime: string;
  accept: string;
  hasAlpha: boolean;
};

export const FORMATS: Record<string, FormatDef> = {
  png: { key: 'png', label: 'PNG', ext: 'png', mime: 'image/png', accept: '.png', hasAlpha: true },
  jpg: { key: 'jpg', label: 'JPG', ext: 'jpg', mime: 'image/jpeg', accept: '.jpg,.jpeg', hasAlpha: false },
  webp: { key: 'webp', label: 'WebP', ext: 'webp', mime: 'image/webp', accept: '.webp', hasAlpha: true },
  heic: { key: 'heic', label: 'HEIC', ext: 'heic', mime: 'image/heic', accept: '.heic,.heif', hasAlpha: false },
  avif: { key: 'avif', label: 'AVIF', ext: 'avif', mime: 'image/avif', accept: '.avif', hasAlpha: true },
  svg: { key: 'svg', label: 'SVG', ext: 'svg', mime: 'image/svg+xml', accept: '.svg', hasAlpha: true },
  bmp: { key: 'bmp', label: 'BMP', ext: 'bmp', mime: 'image/bmp', accept: '.bmp', hasAlpha: false },
  tiff: { key: 'tiff', label: 'TIFF', ext: 'tiff', mime: 'image/tiff', accept: '.tiff,.tif', hasAlpha: false },
  gif: { key: 'gif', label: 'GIF', ext: 'gif', mime: 'image/gif', accept: '.gif', hasAlpha: true },
  ico: { key: 'ico', label: 'ICO', ext: 'ico', mime: 'image/x-icon', accept: '.ico', hasAlpha: true },
  jxl: { key: 'jxl', label: 'JXL', ext: 'jxl', mime: 'image/jxl', accept: '.jxl', hasAlpha: true },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

export const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'png-to-jpg', input: 'png', output: 'jpg', label: 'PNG \u2192 JPG' },
  { slug: 'jpg-to-png', input: 'jpg', output: 'png', label: 'JPG \u2192 PNG' },
  { slug: 'png-to-webp', input: 'png', output: 'webp', label: 'PNG \u2192 WebP' },
  { slug: 'jpg-to-webp', input: 'jpg', output: 'webp', label: 'JPG \u2192 WebP' },
  { slug: 'webp-to-png', input: 'webp', output: 'png', label: 'WebP \u2192 PNG' },
  { slug: 'heic-to-jpg', input: 'heic', output: 'jpg', label: 'HEIC \u2192 JPG' },
  { slug: 'heic-to-png', input: 'heic', output: 'png', label: 'HEIC \u2192 PNG' },
  { slug: 'png-to-avif', input: 'png', output: 'avif', label: 'PNG \u2192 AVIF' },
  { slug: 'jpg-to-avif', input: 'jpg', output: 'avif', label: 'JPG \u2192 AVIF' },
  { slug: 'webp-to-jpg', input: 'webp', output: 'jpg', label: 'WebP \u2192 JPG' },
  { slug: 'png-to-gif', input: 'png', output: 'gif', label: 'PNG \u2192 GIF' },
  { slug: 'jpg-to-gif', input: 'jpg', output: 'gif', label: 'JPG \u2192 GIF' },
  { slug: 'webp-to-gif', input: 'webp', output: 'gif', label: 'WebP \u2192 GIF' },
  { slug: 'svg-to-png', input: 'svg', output: 'png', label: 'SVG \u2192 PNG' },
  { slug: 'svg-to-jpg', input: 'svg', output: 'jpg', label: 'SVG \u2192 JPG' },
  { slug: 'bmp-to-jpg', input: 'bmp', output: 'jpg', label: 'BMP \u2192 JPG' },
  { slug: 'bmp-to-png', input: 'bmp', output: 'png', label: 'BMP \u2192 PNG' },
  { slug: 'tiff-to-jpg', input: 'tiff', output: 'jpg', label: 'TIFF \u2192 JPG' },
  { slug: 'tiff-to-png', input: 'tiff', output: 'png', label: 'TIFF \u2192 PNG' },
  { slug: 'gif-to-jpg', input: 'gif', output: 'jpg', label: 'GIF \u2192 JPG' },
  { slug: 'gif-to-png', input: 'gif', output: 'png', label: 'GIF \u2192 PNG' },
  { slug: 'ico-to-png', input: 'ico', output: 'png', label: 'ICO \u2192 PNG' },
  { slug: 'jxl-to-png', input: 'jxl', output: 'png', label: 'JXL \u2192 PNG' },
  { slug: 'jxl-to-jpg', input: 'jxl', output: 'jpg', label: 'JXL \u2192 JPG' },
  { slug: 'avif-to-png', input: 'avif', output: 'png', label: 'AVIF \u2192 PNG' },
  { slug: 'avif-to-jpg', input: 'avif', output: 'jpg', label: 'AVIF \u2192 JPG' },
  { slug: 'bmp-to-webp', input: 'bmp', output: 'webp', label: 'BMP \u2192 WebP' },
  { slug: 'bmp-to-gif', input: 'bmp', output: 'gif', label: 'BMP \u2192 GIF' },
  { slug: 'bmp-to-avif', input: 'bmp', output: 'avif', label: 'BMP \u2192 AVIF' },
  { slug: 'gif-to-webp', input: 'gif', output: 'webp', label: 'GIF \u2192 WebP' },
  { slug: 'gif-to-avif', input: 'gif', output: 'avif', label: 'GIF \u2192 AVIF' },
  { slug: 'heic-to-webp', input: 'heic', output: 'webp', label: 'HEIC \u2192 WebP' },
  { slug: 'heic-to-avif', input: 'heic', output: 'avif', label: 'HEIC \u2192 AVIF' },
  { slug: 'heic-to-gif', input: 'heic', output: 'gif', label: 'HEIC \u2192 GIF' },
  { slug: 'ico-to-jpg', input: 'ico', output: 'jpg', label: 'ICO \u2192 JPG' },
  { slug: 'ico-to-webp', input: 'ico', output: 'webp', label: 'ICO \u2192 WebP' },
  { slug: 'jxl-to-webp', input: 'jxl', output: 'webp', label: 'JXL \u2192 WebP' },
  { slug: 'jxl-to-gif', input: 'jxl', output: 'gif', label: 'JXL \u2192 GIF' },
  { slug: 'png-to-jxl', input: 'png', output: 'jxl', label: 'PNG \u2192 JXL' },
  { slug: 'jpg-to-jxl', input: 'jpg', output: 'jxl', label: 'JPG \u2192 JXL' },
  { slug: 'svg-to-webp', input: 'svg', output: 'webp', label: 'SVG \u2192 WebP' },
  { slug: 'svg-to-avif', input: 'svg', output: 'avif', label: 'SVG \u2192 AVIF' },
  { slug: 'svg-to-gif', input: 'svg', output: 'gif', label: 'SVG \u2192 GIF' },
  { slug: 'tiff-to-webp', input: 'tiff', output: 'webp', label: 'TIFF \u2192 WebP' },
  { slug: 'tiff-to-gif', input: 'tiff', output: 'gif', label: 'TIFF \u2192 GIF' },
  { slug: 'tiff-to-avif', input: 'tiff', output: 'avif', label: 'TIFF \u2192 AVIF' },
  { slug: 'webp-to-avif', input: 'webp', output: 'avif', label: 'WebP \u2192 AVIF' },
  { slug: 'webp-to-bmp', input: 'webp', output: 'bmp', label: 'WebP \u2192 BMP' },
  { slug: 'webp-to-heic', input: 'webp', output: 'heic', label: 'WebP \u2192 HEIC' },
  { slug: 'webp-to-ico', input: 'webp', output: 'ico', label: 'WebP \u2192 ICO' },
  { slug: 'webp-to-jxl', input: 'webp', output: 'jxl', label: 'WebP \u2192 JXL' },
  { slug: 'webp-to-svg', input: 'webp', output: 'svg', label: 'WebP \u2192 SVG' },
  { slug: 'webp-to-tiff', input: 'webp', output: 'tiff', label: 'WebP \u2192 TIFF' },
  { slug: 'png-to-bmp', input: 'png', output: 'bmp', label: 'PNG \u2192 BMP' },
  { slug: 'png-to-heic', input: 'png', output: 'heic', label: 'PNG \u2192 HEIC' },
  { slug: 'png-to-ico', input: 'png', output: 'ico', label: 'PNG \u2192 ICO' },
  { slug: 'png-to-svg', input: 'png', output: 'svg', label: 'PNG \u2192 SVG' },
  { slug: 'png-to-tiff', input: 'png', output: 'tiff', label: 'PNG \u2192 TIFF' },
  { slug: 'jpg-to-bmp', input: 'jpg', output: 'bmp', label: 'JPG \u2192 BMP' },
  { slug: 'jpg-to-heic', input: 'jpg', output: 'heic', label: 'JPG \u2192 HEIC' },
  { slug: 'jpg-to-ico', input: 'jpg', output: 'ico', label: 'JPG \u2192 ICO' },
  { slug: 'jpg-to-svg', input: 'jpg', output: 'svg', label: 'JPG \u2192 SVG' },
  { slug: 'jpg-to-tiff', input: 'jpg', output: 'tiff', label: 'JPG \u2192 TIFF' },
  { slug: 'gif-to-bmp', input: 'gif', output: 'bmp', label: 'GIF \u2192 BMP' },
  { slug: 'gif-to-heic', input: 'gif', output: 'heic', label: 'GIF \u2192 HEIC' },
  { slug: 'gif-to-ico', input: 'gif', output: 'ico', label: 'GIF \u2192 ICO' },
  { slug: 'gif-to-jxl', input: 'gif', output: 'jxl', label: 'GIF \u2192 JXL' },
  { slug: 'gif-to-svg', input: 'gif', output: 'svg', label: 'GIF \u2192 SVG' },
  { slug: 'gif-to-tiff', input: 'gif', output: 'tiff', label: 'GIF \u2192 TIFF' },
  { slug: 'ico-to-avif', input: 'ico', output: 'avif', label: 'ICO \u2192 AVIF' },
  { slug: 'ico-to-bmp', input: 'ico', output: 'bmp', label: 'ICO \u2192 BMP' },
  { slug: 'ico-to-gif', input: 'ico', output: 'gif', label: 'ICO \u2192 GIF' },
  { slug: 'ico-to-heic', input: 'ico', output: 'heic', label: 'ICO \u2192 HEIC' },
  { slug: 'ico-to-jxl', input: 'ico', output: 'jxl', label: 'ICO \u2192 JXL' },
  { slug: 'ico-to-svg', input: 'ico', output: 'svg', label: 'ICO \u2192 SVG' },
  { slug: 'ico-to-tiff', input: 'ico', output: 'tiff', label: 'ICO \u2192 TIFF' },
  { slug: 'jxl-to-avif', input: 'jxl', output: 'avif', label: 'JXL \u2192 AVIF' },
  { slug: 'jxl-to-bmp', input: 'jxl', output: 'bmp', label: 'JXL \u2192 BMP' },
  { slug: 'jxl-to-heic', input: 'jxl', output: 'heic', label: 'JXL \u2192 HEIC' },
  { slug: 'jxl-to-ico', input: 'jxl', output: 'ico', label: 'JXL \u2192 ICO' },
  { slug: 'jxl-to-svg', input: 'jxl', output: 'svg', label: 'JXL \u2192 SVG' },
  { slug: 'jxl-to-tiff', input: 'jxl', output: 'tiff', label: 'JXL \u2192 TIFF' },
  { slug: 'bmp-to-heic', input: 'bmp', output: 'heic', label: 'BMP \u2192 HEIC' },
  { slug: 'bmp-to-ico', input: 'bmp', output: 'ico', label: 'BMP \u2192 ICO' },
  { slug: 'bmp-to-jxl', input: 'bmp', output: 'jxl', label: 'BMP \u2192 JXL' },
  { slug: 'bmp-to-svg', input: 'bmp', output: 'svg', label: 'BMP \u2192 SVG' },
  { slug: 'bmp-to-tiff', input: 'bmp', output: 'tiff', label: 'BMP \u2192 TIFF' },
  { slug: 'avif-to-bmp', input: 'avif', output: 'bmp', label: 'AVIF \u2192 BMP' },
  { slug: 'avif-to-gif', input: 'avif', output: 'gif', label: 'AVIF \u2192 GIF' },
  { slug: 'avif-to-heic', input: 'avif', output: 'heic', label: 'AVIF \u2192 HEIC' },
  { slug: 'avif-to-ico', input: 'avif', output: 'ico', label: 'AVIF \u2192 ICO' },
  { slug: 'avif-to-jxl', input: 'avif', output: 'jxl', label: 'AVIF \u2192 JXL' },
  { slug: 'avif-to-svg', input: 'avif', output: 'svg', label: 'AVIF \u2192 SVG' },
  { slug: 'avif-to-tiff', input: 'avif', output: 'tiff', label: 'AVIF \u2192 TIFF' },
  { slug: 'avif-to-webp', input: 'avif', output: 'webp', label: 'AVIF \u2192 WebP' },
  { slug: 'svg-to-bmp', input: 'svg', output: 'bmp', label: 'SVG \u2192 BMP' },
  { slug: 'svg-to-heic', input: 'svg', output: 'heic', label: 'SVG \u2192 HEIC' },
  { slug: 'svg-to-ico', input: 'svg', output: 'ico', label: 'SVG \u2192 ICO' },
  { slug: 'svg-to-jxl', input: 'svg', output: 'jxl', label: 'SVG \u2192 JXL' },
  { slug: 'svg-to-tiff', input: 'svg', output: 'tiff', label: 'SVG \u2192 TIFF' },
  { slug: 'tiff-to-bmp', input: 'tiff', output: 'bmp', label: 'TIFF \u2192 BMP' },
  { slug: 'tiff-to-heic', input: 'tiff', output: 'heic', label: 'TIFF \u2192 HEIC' },
  { slug: 'tiff-to-ico', input: 'tiff', output: 'ico', label: 'TIFF \u2192 ICO' },
  { slug: 'tiff-to-jxl', input: 'tiff', output: 'jxl', label: 'TIFF \u2192 JXL' },
  { slug: 'tiff-to-svg', input: 'tiff', output: 'svg', label: 'TIFF \u2192 SVG' },
  { slug: 'heic-to-bmp', input: 'heic', output: 'bmp', label: 'HEIC \u2192 BMP' },
  { slug: 'heic-to-ico', input: 'heic', output: 'ico', label: 'HEIC \u2192 ICO' },
  { slug: 'heic-to-jxl', input: 'heic', output: 'jxl', label: 'HEIC \u2192 JXL' },
  { slug: 'heic-to-svg', input: 'heic', output: 'svg', label: 'HEIC \u2192 SVG' },
  { slug: 'heic-to-tiff', input: 'heic', output: 'tiff', label: 'HEIC \u2192 TIFF' },
];

export const DESCRIPTIONS: Record<string, string> = {
  'image-format-converter': "Convert one image from any format to any other — PNG, JPG, WebP, HEIC, AVIF, SVG, TIFF, GIF, and more. Everything runs in your browser; nothing is uploaded.",
  'png-to-jpg': "<strong>PNG to JPG Converter:</strong> Convert lossless PNG images into space-efficient JPEG files. Ideal for photographs and complex images where the smaller file size outweighs the loss of transparency. Your files never leave your device.",
  'png-to-webp': "<strong>PNG to WebP Converter:</strong> Convert PNG images into modern WebP format for drastically smaller file sizes with the same quality. WebP is supported by all modern browsers — essential for website performance. Your files never leave your device.",
  'png-to-avif': "<strong>PNG to AVIF Converter:</strong> Convert PNG images into next-gen AVIF format for superior compression. AVIF offers better quality at smaller sizes than both JPEG and WebP — the future of web imagery. Your files never leave your device.",
  'png-to-gif': "<strong>PNG to GIF Converter:</strong> Convert PNG images into GIF format. Useful when you need to upload images to older platforms or software that only supports the GIF format for static images. Your files never leave your device.",
  'png-to-jxl': "<strong>PNG to JXL Converter:</strong> Convert PNG images into cutting-edge JPEG XL format. JXL offers superior compression over PNG with faster encoding — ideal for next-gen web delivery. Your files never leave your device.",
  'png-to-heic': "<strong>PNG to HEIC Converter:</strong> Convert PNG files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'png-to-bmp': "<strong>PNG to BMP Converter:</strong> Convert PNG files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'png-to-tiff': "<strong>PNG to TIFF Converter:</strong> Convert PNG files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'png-to-ico': "<strong>PNG to ICO Converter:</strong> Convert PNG files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'jpg-to-png': "<strong>JPG to PNG Converter:</strong> Convert JPEG images into lossless PNG format. Perfect when you need transparency support, lossless editing, or higher quality for graphics with text and sharp edges. Your files never leave your device.",
  'jpg-to-webp': "<strong>JPG to WebP Converter:</strong> Convert JPEG photos into modern WebP format to reduce page load times without visible quality loss. WebP's superior compression makes your website faster. Your files never leave your device.",
  'jpg-to-avif': "<strong>JPG to AVIF Converter:</strong> Convert JPEG photos into AVIF format for best-in-class compression. AVIF files are dramatically smaller than JPEG at the same visual quality — perfect for modern websites. Your files never leave your device.",
  'jpg-to-gif': "<strong>JPG to GIF Converter:</strong> Convert JPEG photos into GIF format for compatibility with legacy applications, embedded systems, or platforms with limited format support. Your files never leave your device.",
  'jpg-to-jxl': "<strong>JPG to JXL Converter:</strong> Convert JPEG photos into cutting-edge JPEG XL format. JXL offers better compression than standard JPEG with no visible quality loss — the future of photo storage. Your files never leave your device.",
  'jpg-to-heic': "<strong>JPG to HEIC Converter:</strong> Convert JPEG files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'jpg-to-svg': "<strong>JPG to SVG Converter:</strong> Convert JPEG files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'jpg-to-bmp': "<strong>JPG to BMP Converter:</strong> Convert JPEG files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'jpg-to-tiff': "<strong>JPG to TIFF Converter:</strong> Convert JPEG files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'jpg-to-ico': "<strong>JPG to ICO Converter:</strong> Convert JPEG files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'webp-to-png': "<strong>WebP to PNG Converter:</strong> Convert modern WebP images back to universal PNG format. Essential when your editing software, printing service, or platform doesn't yet support WebP. Your files never leave your device.",
  'webp-to-jpg': "<strong>WebP to JPG Converter:</strong> Convert WebP images back to universally compatible JPEG format. Essential for uploading to websites, social media, or platforms that don't yet support WebP. Your files never leave your device.",
  'webp-to-gif': "<strong>WebP to GIF Converter:</strong> Convert modern WebP images into the widely compatible GIF format. Essential for using WebP-sourced images in older software, email clients, or platforms that only accept GIF. Your files never leave your device.",
  'webp-to-avif': "<strong>WebP to AVIF Converter:</strong> Convert WebP images into next-gen AVIF format for even better compression. Future-proof your web images by migrating from WebP to AVIF's superior compression technology. Your files never leave your device.",
  'webp-to-heic': "<strong>WebP to HEIC Converter:</strong> Convert WebP files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'webp-to-svg': "<strong>WebP to SVG Converter:</strong> Convert WebP files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'webp-to-bmp': "<strong>WebP to BMP Converter:</strong> Convert WebP files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'webp-to-tiff': "<strong>WebP to TIFF Converter:</strong> Convert WebP files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'webp-to-ico': "<strong>WebP to ICO Converter:</strong> Convert WebP files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'webp-to-jxl': "<strong>WebP to JXL Converter:</strong> Convert WebP files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'heic-to-jpg': "<strong>HEIC to JPG Converter:</strong> Convert Apple's HEIC/HEIF photos into universally compatible JPEG format. Required when sharing iPhone photos with non-Apple devices, uploading to websites, or using software that doesn't support HEIC. Your files never leave your device.",
  'heic-to-png': "<strong>HEIC to PNG Converter:</strong> Convert Apple's HEIC photos into lossless PNG format. Ideal for graphic design work that needs transparency, or when you need to edit HEIC photos in software that only supports PNG. Your files never leave your device.",
  'heic-to-webp': "<strong>HEIC to WebP Converter:</strong> Convert Apple HEIC photos into modern WebP format. Perfect for web developers who receive HEIC images from iPhone users but need WebP for optimized website delivery. Your files never leave your device.",
  'heic-to-avif': "<strong>HEIC to AVIF Converter:</strong> Convert Apple HEIC photos into next-gen AVIF format. Both are high-efficiency formats — AVIF offers better compression and open-standard advantages over HEIC. Your files never leave your device.",
  'heic-to-gif': "<strong>HEIC to GIF Converter:</strong> Convert Apple HEIC photos into GIF format. Useful for creating simple animated GIFs from HEIC bursts or when sharing iPhone photos on platforms with minimal format support. Your files never leave your device.",
  'heic-to-svg': "<strong>HEIC to SVG Converter:</strong> Convert HEIC/HEIF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'heic-to-bmp': "<strong>HEIC to BMP Converter:</strong> Convert HEIC/HEIF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'heic-to-tiff': "<strong>HEIC to TIFF Converter:</strong> Convert HEIC/HEIF files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'heic-to-ico': "<strong>HEIC to ICO Converter:</strong> Convert HEIC/HEIF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'heic-to-jxl': "<strong>HEIC to JXL Converter:</strong> Convert HEIC/HEIF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'avif-to-png': "<strong>AVIF to PNG Converter:</strong> Convert AVIF images into universally compatible PNG format. Essential when your editing software or platform doesn't yet support the next-gen AVIF format. Your files never leave your device.",
  'avif-to-jpg': "<strong>AVIF to JPG Converter:</strong> Convert AVIF images into universally compatible JPEG format. Perfect for sharing next-gen AVIF photos on social media, email, or websites that haven't adopted AVIF yet. Your files never leave your device.",
  'avif-to-webp': "<strong>AVIF to WebP Converter:</strong> Convert AVIF files into WebP format for modern web-optimized image format. Your files never leave your device.",
  'avif-to-heic': "<strong>AVIF to HEIC Converter:</strong> Convert AVIF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'avif-to-svg': "<strong>AVIF to SVG Converter:</strong> Convert AVIF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'avif-to-bmp': "<strong>AVIF to BMP Converter:</strong> Convert AVIF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'avif-to-tiff': "<strong>AVIF to TIFF Converter:</strong> Convert AVIF files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'avif-to-gif': "<strong>AVIF to GIF Converter:</strong> Convert AVIF files into GIF format for animated and static image format for broad compatibility. Your files never leave your device.",
  'avif-to-ico': "<strong>AVIF to ICO Converter:</strong> Convert AVIF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'avif-to-jxl': "<strong>AVIF to JXL Converter:</strong> Convert AVIF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'svg-to-png': "<strong>SVG to PNG Converter:</strong> Convert scalable vector graphics (SVG) into raster PNG images. Perfect for when you need bitmap versions of logos, icons, and illustrations for use in software that doesn't support SVG. Your files never leave your device.",
  'svg-to-jpg': "<strong>SVG to JPG Converter:</strong> Convert SVG vector graphics into JPEG images — ideal for sharing vector artwork on platforms that only accept raster formats. Your files never leave your device.",
  'svg-to-webp': "<strong>SVG to WebP Converter:</strong> Convert SVG vector graphics into WebP format. Perfect for when you need rasterized versions of logos and icons in an efficient modern format for websites. Your files never leave your device.",
  'svg-to-avif': "<strong>SVG to AVIF Converter:</strong> Convert SVG vector graphics into next-gen AVIF format. Ideal for converting vector artwork into the most space-efficient raster format for web delivery. Your files never leave your device.",
  'svg-to-gif': "<strong>SVG to GIF Converter:</strong> Convert SVG vector graphics into GIF format. Useful for creating simple animated versions of vector graphics or when targeting legacy platforms. Your files never leave your device.",
  'svg-to-heic': "<strong>SVG to HEIC Converter:</strong> Convert SVG vector files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'svg-to-bmp': "<strong>SVG to BMP Converter:</strong> Convert SVG vector files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'svg-to-tiff': "<strong>SVG to TIFF Converter:</strong> Convert SVG vector files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'svg-to-ico': "<strong>SVG to ICO Converter:</strong> Convert SVG vector files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'svg-to-jxl': "<strong>SVG to JXL Converter:</strong> Convert SVG vector files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'bmp-to-jpg': "<strong>BMP to JPG Converter:</strong> Convert uncompressed BMP bitmap images into space-efficient JPEG files. Dramatically reduces file sizes from raw bitmaps while maintaining good visual quality — perfect for archiving scanned images. Your files never leave your device.",
  'bmp-to-png': "<strong>BMP to PNG Converter:</strong> Convert BMP bitmap images into compressed PNG format. PNG offers much smaller file sizes than BMP with optional transparency — ideal for web use and long-term storage. Your files never leave your device.",
  'bmp-to-webp': "<strong>BMP to WebP Converter:</strong> Convert BMP bitmap images into modern WebP format for drastically smaller file sizes. WebP's superior compression makes your website faster while preserving image quality. Your files never leave your device.",
  'bmp-to-gif': "<strong>BMP to GIF Converter:</strong> Convert BMP bitmap images into GIF format. Useful when you need to use bitmap-sourced images on platforms or in software with limited format support. Your files never leave your device.",
  'bmp-to-avif': "<strong>BMP to AVIF Converter:</strong> Convert BMP bitmap images into next-gen AVIF format for best-in-class compression. Dramatically reduce raw bitmap file sizes while maintaining excellent visual quality. Your files never leave your device.",
  'bmp-to-heic': "<strong>BMP to HEIC Converter:</strong> Convert BMP bitmap files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'bmp-to-svg': "<strong>BMP to SVG Converter:</strong> Convert BMP bitmap files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'bmp-to-tiff': "<strong>BMP to TIFF Converter:</strong> Convert BMP bitmap files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'bmp-to-ico': "<strong>BMP to ICO Converter:</strong> Convert BMP bitmap files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'bmp-to-jxl': "<strong>BMP to JXL Converter:</strong> Convert BMP bitmap files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'tiff-to-jpg': "<strong>TIFF to JPG Converter:</strong> Convert TIFF images into universally compatible JPEG format. Perfect for sharing high-resolution scanned documents and professional photography on the web or via email. Your files never leave your device.",
  'tiff-to-png': "<strong>TIFF to PNG Converter:</strong> Convert TIFF images into lossless PNG format. Ideal for graphic design workflows that need transparent backgrounds or when editing TIFF files in software with limited TIFF support. Your files never leave your device.",
  'tiff-to-webp': "<strong>TIFF to WebP Converter:</strong> Convert TIFF images into modern WebP format for drastically smaller file sizes. Perfect for migrating high-resolution scanned images and professional photography to web-optimized formats. Your files never leave your device.",
  'tiff-to-gif': "<strong>TIFF to GIF Converter:</strong> Convert TIFF images into GIF format. Useful for creating preview thumbnails from high-resolution TIFF files or when basic format compatibility is required. Your files never leave your device.",
  'tiff-to-avif': "<strong>TIFF to AVIF Converter:</strong> Convert TIFF images into next-gen AVIF format for best-in-class compression. Ideal for archiving high-resolution scans and photography at a fraction of the original file size. Your files never leave your device.",
  'tiff-to-heic': "<strong>TIFF to HEIC Converter:</strong> Convert TIFF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'tiff-to-svg': "<strong>TIFF to SVG Converter:</strong> Convert TIFF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'tiff-to-bmp': "<strong>TIFF to BMP Converter:</strong> Convert TIFF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'tiff-to-ico': "<strong>TIFF to ICO Converter:</strong> Convert TIFF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'tiff-to-jxl': "<strong>TIFF to JXL Converter:</strong> Convert TIFF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'gif-to-jpg': "<strong>GIF to JPG Converter:</strong> Convert GIF images into JPEG format. Perfect for saving static GIF frames as higher-quality JPEG files with millions of colors instead of GIF's limited 256-color palette. Your files never leave your device.",
  'gif-to-png': "<strong>GIF to PNG Converter:</strong> Convert GIF images into lossless PNG format. PNG offers superior color depth, better compression, and transparency support over the legacy GIF format. Your files never leave your device.",
  'gif-to-webp': "<strong>GIF to WebP Converter:</strong> Convert GIF images into modern WebP format for smaller file sizes and millions of colors. WebP surpasses GIF's 256-color limitation while offering better compression. Your files never leave your device.",
  'gif-to-avif': "<strong>GIF to AVIF Converter:</strong> Convert GIF images into next-gen AVIF format for vastly superior compression and color depth. AVIF supports millions of colors compared to GIF's 256-color palette. Your files never leave your device.",
  'gif-to-heic': "<strong>GIF to HEIC Converter:</strong> Convert GIF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'gif-to-svg': "<strong>GIF to SVG Converter:</strong> Convert GIF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'gif-to-bmp': "<strong>GIF to BMP Converter:</strong> Convert GIF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'gif-to-tiff': "<strong>GIF to TIFF Converter:</strong> Convert GIF files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'gif-to-ico': "<strong>GIF to ICO Converter:</strong> Convert GIF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
  'gif-to-jxl': "<strong>GIF to JXL Converter:</strong> Convert GIF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'ico-to-png': "<strong>ICO to PNG Converter:</strong> Extract Windows icon (.ico) files and convert them into universal PNG images. Perfect for web developers and designers who need to use favicon or app icon source files in modern formats. Your files never leave your device.",
  'ico-to-jpg': "<strong>ICO to JPG Converter:</strong> Convert Windows icon (.ico) files into JPEG format. Perfect for web developers who need to repurpose favicon source files as regular images or thumbnails. Your files never leave your device.",
  'ico-to-webp': "<strong>ICO to WebP Converter:</strong> Convert Windows icon (.ico) files into modern WebP format. Ideal for converting app icons and favicon source files into web-optimized images. Your files never leave your device.",
  'ico-to-heic': "<strong>ICO to HEIC Converter:</strong> Convert Windows ICO files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'ico-to-avif': "<strong>ICO to AVIF Converter:</strong> Convert Windows ICO files into AVIF format for next-gen royalty-free image format. Your files never leave your device.",
  'ico-to-svg': "<strong>ICO to SVG Converter:</strong> Convert Windows ICO files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'ico-to-bmp': "<strong>ICO to BMP Converter:</strong> Convert Windows ICO files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'ico-to-tiff': "<strong>ICO to TIFF Converter:</strong> Convert Windows ICO files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'ico-to-gif': "<strong>ICO to GIF Converter:</strong> Convert Windows ICO files into GIF format for animated and static image format for broad compatibility. Your files never leave your device.",
  'ico-to-jxl': "<strong>ICO to JXL Converter:</strong> Convert Windows ICO files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device.",
  'jxl-to-png': "<strong>JXL to PNG Converter:</strong> Convert JPEG XL images into universally compatible PNG format. Essential when your software, device, or platform doesn't yet support the cutting-edge JPEG XL format. Your files never leave your device.",
  'jxl-to-jpg': "<strong>JXL to JPEG Converter:</strong> Convert JPEG XL images into standard JPEG format for maximum compatibility. JPEG XL offers superior compression but isn't yet supported everywhere — use this converter for broad compatibility. Your files never leave your device.",
  'jxl-to-webp': "<strong>JXL to WebP Converter:</strong> Convert JPEG XL images into modern WebP format. Perfect when you need broad browser compatibility but started with a high-efficiency JPEG XL source. Your files never leave your device.",
  'jxl-to-gif': "<strong>JXL to GIF Converter:</strong> Convert JPEG XL images into GIF format. Useful for creating simple animations from JPEG XL sources or when targeting platforms with basic format support. Your files never leave your device.",
  'jxl-to-heic': "<strong>JXL to HEIC Converter:</strong> Convert JPEG XL files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device.",
  'jxl-to-avif': "<strong>JXL to AVIF Converter:</strong> Convert JPEG XL files into AVIF format for next-gen royalty-free image format. Your files never leave your device.",
  'jxl-to-svg': "<strong>JXL to SVG Converter:</strong> Convert JPEG XL files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device.",
  'jxl-to-bmp': "<strong>JXL to BMP Converter:</strong> Convert JPEG XL files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device.",
  'jxl-to-tiff': "<strong>JXL to TIFF Converter:</strong> Convert JPEG XL files into TIFF format for high-resolution image archival and publishing. Your files never leave your device.",
  'jxl-to-ico': "<strong>JXL to ICO Converter:</strong> Convert JPEG XL files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device.",
};

const FORMAT_KEYS = Object.keys(FORMATS);

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

type ImageFormatConverterProps = {
  slug: string;
};

export default function ImageFormatConverter({ slug }: ImageFormatConverterProps) {
  const description = DESCRIPTIONS[slug];
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0]!, [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);

  const inputFmt = FORMATS[inputKey]!;
  const outputFmt = FORMATS[outputKey]!;

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") setInputKey(value);
    else setOutputKey(value);
    setFile(null);
    setPreview(null);
  };

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setPreview(null);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  // Hero-box carry: a file dropped on the homepage arrives via IndexedDB (same
  // browser, never uploaded). Accepted only when its extension matches this
  // pair's input format — a stale or mismatched carry is ignored silently.
  const heroClaimed = useRef(false);
  useEffect(() => {
    if (heroClaimed.current) return;
    heroClaimed.current = true;
    consumeHeroFile().then((f) => {
      if (!f || heroExtOf(f.name) !== inputKey) return;
      setFile(f);
      setPreview(URL.createObjectURL(f));
      toast.success('Loaded your dropped file.');
    }).catch(() => {});
  }, [inputKey]);

  const convertCanvas = useCallback((img: HTMLImageElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      if (!outputFmt.hasAlpha) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const quality = outputKey === 'jpg' ? 0.92 : outputKey === 'webp' ? 0.85 : 0.9;
      canvas.toBlob((blob) => resolve(blob), outputFmt.mime, quality);
    });
  }, [outputKey, outputFmt]);

  const convertImage = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      let blob: Blob | null = null;

      if (inputKey === 'heic') {
        const heic2any = (await import('heic2any')).default;
        const result = await heic2any({ blob: file, toType: outputFmt.mime, quality: 0.9 });
        blob = Array.isArray(result) ? result[0]! : result;
      } else {
        const img = new Image();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        if (inputKey === 'svg') {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
        }
        if (inputKey === 'tiff' || inputKey === 'jxl') {
          try {
            blob = await convertCanvas(img);
          } catch (e) {
            console.error(e);
            throw new Error('Your browser does not support decoding this format. Try using Chrome or Edge.');
          }
        } else {
          blob = await convertCanvas(img);
        }
        URL.revokeObjectURL(dataUrl);
      }

      if (!blob) throw new Error('Conversion failed');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `converted.${outputFmt.ext}`);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success(`Converted to ${outputFmt.label} successfully!`);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Conversion failed. Check your input.'));
    } finally {
      setIsProcessing(false);
    }
  }, [file, inputKey, outputKey, outputFmt, convertCanvas]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select aria-label="Input format" value={inputKey} onChange={(e) => handleFormatChange("input", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k]!.label} (.{FORMATS[k]!.ext})</option>)}
        </select>

        <button onClick={swapFormats}
          className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all active:scale-95"
          aria-label="Swap formats">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <select aria-label="Output format" value={outputKey} onChange={(e) => handleFormatChange("output", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k]!.label} (.{FORMATS[k]!.ext})</option>)}
        </select>
      </div>

      {description && (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="overflow-hidden space-y-5">
        {!file ? (
          <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative">
            <input type="file" accept={inputFmt.accept} onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={`Upload ${inputFmt.label} Image`} />
            <div className="text-[var(--text-secondary)] flex flex-col items-center">
              <svg className="w-12 h-12 text-zinc-300 dark:text-[var(--text-secondary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-sm">Upload {inputFmt.label} Image</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => { setFile(null); setPreview(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto object-contain" />
              </div>
            )}

            <button onClick={convertImage} disabled={isProcessing}
              className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50">
              {isProcessing ? 'Converting...' : `Convert to ${outputFmt.label}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
