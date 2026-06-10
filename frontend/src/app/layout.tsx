import type { Metadata } from "next";
// @ts-ignore: CSS import declaration for globals not available in this environment
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";

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
          <footer className="border-t border-line mt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-faint">
              <p>
                © {new Date().getFullYear()} TicketMaster · Billetterie on-chain
                sur Ethereum
              </p>
              <p>Contrats déployés sur Sepolia · un contrat par type de billet</p>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
