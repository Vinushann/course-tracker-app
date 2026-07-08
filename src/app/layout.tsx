import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project X",
  description: "A focused learning discipline and progress tracking app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
} catch {
  document.documentElement.dataset.theme = "light";
}
`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
