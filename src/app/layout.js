import "./globals.css";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const displayFont = cormorant;

export const metadata = {
  title: "Salon Stephanie",
  description: "Hair & makeup salon in Beirut. Walk in and let us take care of the rest.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} bg-ink min-h-screen text-cream`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}