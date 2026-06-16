/* eslint-disable @next/next/no-img-element */
// Minimal stand-in for next/image: renders a plain <img> and ignores
// Next-only props (unoptimized, priority, etc.) via the index signature.
type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown;
};

export default function Image({ src, alt, width, height, className }: ImageProps) {
  return <img src={src} alt={alt} width={width} height={height} className={className} />;
}
