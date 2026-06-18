import "./globals.css";
import { dmSans } from "./fonts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <Footer />
      </body>
    </html>
  );
}