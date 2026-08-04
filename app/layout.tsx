import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} — build your bench of photographers`,
  description:
    "Photography companies build a private bench of photographers they trust, then send each shoot to the people they choose — the first of your approved photographers to claim it gets it. Scale your studio without re-hiring; steady freelance work for photographers.",
  metadataBase: new URL("https://callsheet.example"),
  openGraph: {
    title: brand.name,
    description:
      "Build your bench. Send work to your crew. Scale without the churn.",
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
