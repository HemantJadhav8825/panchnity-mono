import { Heading } from '@/components/ui/Heading';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { brand } from '@/config/brand';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useCurrentUser();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <Link href="/">
        <Heading level={5} className="text-primary font-bold tracking-tight">
          {brand.PRODUCT_NAME}
        </Heading>
      </Link>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button 
          onClick={logout}
          className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <Link href="/profile" className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
          <ProfileAvatar 
            src={user?.avatar} 
            name={user?.fullName || user?.displayName || user?.username || user?.email || 'User'} 
            size="md"
          />
        </Link>
      </div>
    </header>
  );
};
