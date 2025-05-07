import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProviders } from "@/components/WalletProviders";
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Gambitz.fun | Chess for Stakes on Solana",
  description: "Play chess for stakes on Solana. Win SOL and earn royalties by owning opening NFTs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-white`}>
        <WalletProviders>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </WalletProviders>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
