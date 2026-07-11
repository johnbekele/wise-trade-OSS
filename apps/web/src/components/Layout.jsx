import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart3, Newspaper, Key, BookOpen, Menu, X, LogOut, LogIn, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'AI Insights', href: '/news', icon: Newspaper },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Docs', href: '/api-docs', icon: BookOpen },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isAdmin = user?.is_super_Admin;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const allNavItems = isAdmin
    ? [...NAV_ITEMS, { name: 'Admin', href: '/admin', icon: Shield }]
    : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-primary p-1.5 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold tracking-tight hidden sm:block">Wise Trade</span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {allNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-medium text-foreground">
                      {user?.first_name || user?.username || 'User'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-card border rounded-lg shadow-lg py-1 animate-scale-in origin-top-right">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">{user?.first_name || user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <span className="block px-3 py-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider">Admin</span>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary h-8 px-4 text-sm">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign in
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <nav className="max-w-7xl mx-auto px-4 py-2 space-y-0.5">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
