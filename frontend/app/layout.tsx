import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApiClient - Postman Clone",
  description: "A premium full-stack API Client (Postman Clone) with dark mode and environment management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-canvas text-text-primary h-screen overflow-hidden select-none">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#e0e0e0",
              border: "1px solid #3a3a3a",
              fontSize: "13px",
              fontFamily: "var(--font-sans), Inter, sans-serif",
            },
            success: {
              iconTheme: {
                primary: "#49cc90",
                secondary: "#1a1a1a",
              },
            },
            error: {
              iconTheme: {
                primary: "#f93e3e",
                secondary: "#1a1a1a",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
