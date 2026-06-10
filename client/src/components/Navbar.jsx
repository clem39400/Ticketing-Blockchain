import { NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function truncate(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/events" className="navbar-logo">🎫 TICKETING</NavLink>

        <div className="navbar-links">
          <NavLink
            to="/events"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Events
          </NavLink>
          <NavLink
            to="/my-tickets"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            My tickets
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Admin
          </NavLink>
        </div>

        <div className="navbar-wallet">
          {isConnected ? (
            <button
              className="wallet-btn connected"
              onClick={() => disconnect()}
              title="Click to disconnect"
            >
              {truncate(address)}
            </button>
          ) : (
            <button
              className="wallet-btn"
              onClick={() => connect({ connector: injected() })}
              disabled={isPending}
            >
              {isPending ? 'Connecting…' : 'Connect wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
