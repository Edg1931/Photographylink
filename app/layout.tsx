import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} — the bench that never misses a shoot`,
  description:
    "The two-sided platform where photography companies build a trained bench of shooters and freelancers find steady, transparent work. Post a job to your queue; the first qualified pro claims it.",
  metadataBase: new URL("https://callsheet.example"),
  openGraph: {
    title: brand.name,
    description:
      "Build a bench. Claim the queue. Never turn down a shoot again.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
