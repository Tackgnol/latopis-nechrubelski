import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import type { DocumentLayoutProps } from "./DocumentLayout.models";
import "./DocumentLayout.styles.css";

export function DocumentLayout({ children }: DocumentLayoutProps) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" sizes="64x64" href="/img/hourglass-favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Pirata+One&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="grit">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
        </svg>
        <div className="ghost" aria-hidden="true">
          NECHRUBEL
        </div>
        <div className="stain stain-a" aria-hidden="true" />
        <div className="stain stain-b" aria-hidden="true" />
        <div className="stain stain-c" aria-hidden="true" />
        {children}
        <div className="grain" aria-hidden="true" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
