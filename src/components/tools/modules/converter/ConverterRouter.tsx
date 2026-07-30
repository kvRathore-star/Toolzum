"use client";

import { CONVERTER_CONFIG, ConverterCategory } from '../shared/converterConfig';
import VideoFormatConverter from '../shared/VideoFormatConverter';
import VideoToAudioConverter from '../shared/VideoToAudioConverter';
import AudioFormatConverter from '../shared/AudioFormatConverter';
import ImageCatchAllConverter from '../shared/ImageCatchAllConverter';
import { DataConverterFromSlug } from '../converter/DataConverter';
import DocumentFormatConverter from '../shared/DocumentFormatConverter';
import TextTransformConverter from '../shared/TextTransformConverter';
import HtmlTextHub from '../shared/HtmlTextHub';
import CssPreprocessorHub from '../shared/CssPreprocessorHub';
import FormatSerializerHub from '../shared/FormatSerializerHub';
import JsonOutputConverter from '../shared/JsonOutputConverter';
import CsvHubConverter from '../shared/CsvHubConverter';
import TextStylingConverter from '../shared/TextStylingConverter';
import UnitConverter from '../shared/UnitConverter';
import ImportToCsvConverter from '../shared/ImportToCsvConverter';
import ColorConverter from '../shared/ColorConverter';
import NumberWordsConverter from '../shared/NumberWordsConverter';
import ToonConverter from './DataFormatTools';
import { ComponentType } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const COMPONENT_MAP: Record<ConverterCategory, ComponentType<{ slug: string; description?: string }>> = {
  "video-format": VideoFormatConverter,
  "video-to-audio": VideoToAudioConverter,
  "audio-format": AudioFormatConverter,
  "image-format": ImageCatchAllConverter,
  "data": DataConverterFromSlug,
  "document": DocumentFormatConverter,
  "text-transform": TextTransformConverter,
  "html-text": HtmlTextHub,
  "css-preprocessor": CssPreprocessorHub,
  "serializer": FormatSerializerHub,
  "json-output": JsonOutputConverter,
  "csv-output": CsvHubConverter,
  "text-style": TextStylingConverter,
  "unit": UnitConverter,
  "import-to-csv": ImportToCsvConverter,
  "color": ColorConverter,
  "number": NumberWordsConverter,
  "toon": ToonConverter,
};

type ConverterRouterProps = {
  slug: string;
};

export default function ConverterRouter({ slug }: ConverterRouterProps) {
  const config = CONVERTER_CONFIG[slug];
  if (!config) return null;

  const Component = COMPONENT_MAP[config.category];
  return (
    <ErrorBoundary>
      <Component slug={slug} description={config.description} />
    </ErrorBoundary>
  );
}
