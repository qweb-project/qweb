'use client';

import { CDPReactProvider } from "@coinbase/cdp-react";
import { ReactNode } from "react";
import { CDP_CONFIG, APP_CONFIG } from "@/lib/cdp-config";

interface CDPProviderProps {
  children: ReactNode;
}

export default function CDPProvider({ children }: CDPProviderProps) {
  // Custom theme that matches Qweb's dark/light mode design
  const theme = {
    "colors-bg-default": "var(--background)",
    "colors-bg-overlay": "var(--background)",
    "colors-bg-skeleton": "var(--muted)",
    "colors-bg-primary": "#24A0ED", // Using Qweb's blue accent
    "colors-bg-secondary": "var(--secondary)",
    "colors-fg-default": "var(--foreground)",
    "colors-fg-muted": "var(--muted-foreground)",
    "colors-fg-primary": "#24A0ED",
    "colors-fg-onPrimary": "white",
    "colors-fg-onSecondary": "var(--foreground)",
    "colors-line-default": "var(--border)",
    "colors-line-heavy": "var(--border)",
    "colors-line-primary": "#24A0ED",
    "font-family-sans": "Montserrat, Arial, sans-serif",
    "font-size-base": "14px",
  };

  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
