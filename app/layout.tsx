import type { Metadata, Viewport } from "next"; // Viewport එකතු කළා
import { Noto_Sans_Sinhala } from "next/font/google"; // සිංහල ෆොන්ට් එකක් ගමු (ලස්සනයි)
import "./globals.css";
import { Toaster } from 'sonner';

// Google Fonts වලින් Noto Sans Sinhala ෆොන්ට් එක ගන්නවා
const sinhalaFont = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-sinhala",
  display: "swap",
});

// 1. Mobile වල Zoom වෙලා කැත නොවෙන්න Viewport settings
export const viewport: Viewport = {
  themeColor: "#0f172a", // Navy Blue Theme Color
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 2. SEO Metadata (Google & Social Media)
export const metadata: Metadata = {
  title: "HelpSL - හදිසි ආපදා සහන සේවාව | Sri Lanka Disaster Relief",
  description: "ශ්‍රී ලංකාවේ හදිසි ආපදා අවස්ථාවලදී විපතට පත් වූවන් සහ උදව් කිරීමට කැමති අය සම්බන්ධ කරන සේවාව. Real-time updates, GPS location mapping, and emergency contacts.",
  keywords: ["Flood Sri Lanka", "Disaster Relief", "Emergency", "HelpSL", "ගංවතුර", "ආපදා සහන", "Sri Lanka"],
  authors: [{ name: "Padumainduwra" }],
  openGraph: {
    title: "HelpSL - හදිසි ආපදා සහන සේවාව",
    description: "හදිසි ආපදා අවස්ථාවලදී උදව් ලබාගැනීමට සහ ලබාදීමට සම්බන්ධ වන්න.",
    url: "https://helpsl.vercel.app", // ඔබේ Vercel Domain එක මෙතනට දාන්න
    siteName: "HelpSL",
    images: [
      {
        url: "/og-image.png", // Public folder එකට ලස්සන image එකක් දාන්න (1200x630)
        width: 1200,
        height: 630,
      },
    ],
    locale: "si_LK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si">
      <body className={`${sinhalaFont.className} antialiased bg-slate-50`}>
        {children}
      <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}