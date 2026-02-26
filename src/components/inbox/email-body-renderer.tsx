"use client";

import { useRef, useEffect, useState } from "react";

interface EmailBodyRendererProps {
  html: string;
  text: string;
}

export function EmailBodyRenderer({ html, text }: EmailBodyRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(150);

  const content = html || `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(text)}</pre>`;

  const srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #1a1a1a;
            overflow-y: auto;
          }
          img { max-width: 100%; height: auto; }
          a { color: #2563eb; }
          blockquote {
            border-left: 3px solid #d1d5db;
            margin: 8px 0;
            padding-left: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) {
          // Cap at 400px, scroll within iframe if taller
          setHeight(Math.min(body.scrollHeight + 16, 400));
        }
      } catch {
        // cross-origin fallback
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      sandbox="allow-same-origin"
      className="w-full rounded border-0"
      style={{ height }}
      title="Email content"
    />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
