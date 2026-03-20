import { BarChart3, CirclePlus, CreditCard, Home, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'Transaction', icon: CirclePlus, to: '/transactions' },
  { label: 'Cards', icon: CreditCard, to: '/admin' },
  { label: 'Profile', icon: User, to: '/profile' }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[28px] bg-[#F5FBF7]/95 p-3 shadow-panel backdrop-blur">
      <ul className="grid grid-cols-5 gap-2">
        {items.map(({ label, icon: Icon, to }) => (
          <li key={label}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive ? 'bg-brand text-white shadow-soft' : 'text-ink'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
