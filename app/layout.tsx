import type { ReactNode } from "react";
import PlatformNav from "@/components/ui/PlatformNav";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#061018",
        }}
      >
        <PlatformNav />

        {children}
      </body>
    </html>
  );
}
