import * as React from "react";

// Minimal stand-in for next/link: renders a plain <a> with the given href.
type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

export default function Link({ href, children, className }: LinkProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
