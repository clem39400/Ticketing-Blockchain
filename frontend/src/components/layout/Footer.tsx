export function Footer() {
  return (
    <footer className="border-t border-line mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-faint">
        <p>
          © {new Date().getFullYear()} TicketMaster · Billetterie on-chain sur
          Ethereum
        </p>
        <p>Contrats déployés sur Sepolia · un contrat par type de billet</p>
      </div>
    </footer>
  );
}
