import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'TraceaTicket — Billetterie Blockchain',
  description:
    'Achetez des billets d\'événements directement sur Ethereum. Transparent, sécurisé, sans intermédiaire.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-surface antialiased">
        <Web3Provider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-surface-border mt-24 py-8 text-center text-xs text-white/20">
            TraceaTicket · Powered by Ethereum ·{' '}
            <a
              href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 transition-colors underline underline-offset-2"
            >
              Contrat Sepolia
            </a>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
