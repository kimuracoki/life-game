import "./globals.css";
import type { ReactNode } from "react";
import { ClientThemeProvider } from "@/components/ClientThemeProvider";

export const metadata = {
  title: "Life game",
  description: "Life game"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ClientThemeProvider>{children}</ClientThemeProvider>
      </body>
    </html>
  );
}