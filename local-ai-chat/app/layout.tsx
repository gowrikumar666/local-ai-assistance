import type { Metadata, Viewport } from "next";
import { globalStyles } from "./global-styles";

export const metadata: Metadata = {
  title: "Local AI Chat",
  description: "Private AI Chat powered by Ollama",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {children}
      </body>
    </html>
  );
}
