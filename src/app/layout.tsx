import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "./globals.css";
import { getSite } from "@/lib/content";
import { fontCss, fontLinks } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.tagline,
  };
}

export const viewport: Viewport = { themeColor: "#0d5a00" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const links = fontLinks(site.fonts);
  return (
    <html lang="en">
      <head>
        {links.length > 0 && <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />}
        {links.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {/* Fonts chosen in the editor (content/site.json → fonts) */}
        <style dangerouslySetInnerHTML={{ __html: fontCss(site.fonts) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
