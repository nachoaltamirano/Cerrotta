import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Roboto } from "next/font/google";
import "./globals.css";

const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-barlow-semi-condensed",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lic. Cerrotta | Nutricionista Deportivo",
  description: "Reservá tu turno con el Lic. Cerrotta, Nutricionista Deportivo (UBA).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${barlowSemiCondensed.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">{children}</body>
    </html>
  );
}
