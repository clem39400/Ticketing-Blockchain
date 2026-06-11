import type { Metadata } from "next";
// @ts-ignore: CSS import declaration for globals not available in this environment
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "TicketMaster - Billetterie Blockchain",
  description:
    "Achetez des billets d'événements sur Ethereum. Transparent, sécurisé, sans intermédiaire.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-page text-ink antialiased">
        <Web3Provider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
