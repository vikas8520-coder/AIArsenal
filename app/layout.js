import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "AIArsenal — 194+ Free AI Tools, Credits & Systems",
  description:
    "The definitive curated library of free AI tools, API credits, compute resources, income paths, and personal AI systems. 194+ vetted resources with AI-powered stack recommendations.",
  keywords:
    "AI tools, free AI, machine learning tools, LLM, GPU compute, AI credits, open source AI, AI stack planner",
  authors: [{ name: "AIArsenal" }],
  metadataBase: new URL("https://ai-arsenal-nu.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AIArsenal — 194+ Free AI Tools, Credits & Systems",
    description:
      "194+ free AI tools, $600K+ in credits, 75+ GPU hrs/week, and personal AI system blueprints. AI-powered stack planner included.",
    type: "website",
    url: "/",
    siteName: "AIArsenal",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIArsenal — 194+ Free AI Tools",
    description:
      "Curated library of 194+ free AI tools with AI-powered stack recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "AIArsenal",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${ibmPlexSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data for WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AIArsenal",
              description:
                "Curated directory of 194+ free AI tools with AI-powered stack recommendations",
              url: "https://ai-arsenal-nu.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "194+ curated AI tools",
                "AI-powered stack planner",
                "Issue solver",
                "Open source filter",
                "Category browsing",
                "Command palette search",
              ],
            }),
          }}
        />
        {/* Inline theme script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nexus-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
      {/* Plausible Analytics */}
      <Script
        defer
        data-domain="aiarsenal.vercel.app"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    </html>
  );
}
