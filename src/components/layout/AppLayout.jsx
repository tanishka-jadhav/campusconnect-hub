import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import {
  Home, ShoppingBag, Users, Briefcase, FolderOpen,
  LogOut, GraduationCap, Menu, X, ChevronRight, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'housing', label: 'Housing Hub', icon: Home, color: 'text-blue-400' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'text-orange-400' },
  { id: 'teamup', label: 'Team-Up', icon: Users, color: 'text-green-400' },
  { id: 'career', label: 'Career Board', icon: Briefcase, color: 'text-purple-400' },
  { id: 'resources', label: 'Resources', icon: FolderOpen, color: 'text-amber-400' },
];

export default function AppLayout({ activeModule, onNavigate, children }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">CampusConnect</h1>
              <p className="text-xs text-muted-foreground">Hub</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  active
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                id={`nav-${item.id}`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary' : item.color} transition-colors`} />
                {item.label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'Campus User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.college || user?.email}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer" id="theme-toggle">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut} id="nav-signout">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card z-50 lg:hidden animate-slide-in-right flex flex-col" style={{ animationName: 'none', transform: 'translateX(0)' }}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end shadow-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-foreground">CampusConnect</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary' : item.color}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.full_name || 'Campus User'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 text-muted-foreground hover:text-foreground">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border glass">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} id="mobile-menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">CampusConnect</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white text-xs font-bold">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
