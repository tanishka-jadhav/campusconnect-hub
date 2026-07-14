import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import {
  Home, ShoppingBag, Users, Briefcase, FolderOpen,
  LogOut, GraduationCap, Menu, X, ChevronRight, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'housing', label: 'Housing Hub', icon: Home, color: 'text-cyan-400' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'text-orange-400' },
  { id: 'teamup', label: 'Team-Up', icon: Users, color: 'text-emerald-400' },
  { id: 'career', label: 'Career Board', icon: Briefcase, color: 'text-violet-400' },
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
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative">
      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl h-screen sticky top-0 z-30 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-md shadow-cyan-500/10 shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 tracking-tight leading-none">CampusConnect</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mt-1">Academic Portal</p>
          </div>
        </div>

        {/* Navigation - min target 44px (h-11) */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
                id={`nav-${item.id}`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-cyan-400' : item.color} transition-colors group-hover:scale-105 duration-200`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 ml-auto text-cyan-400" />}
              </button>
            );
          })}
        </nav>

        {/* Desktop Profile & Theme Toggler */}
        <div className="p-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">
                  {profile?.full_name || 'Campus User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {profile?.college || user?.email}
                </p>
              </div>
            </div>
            
            {/* Theme Toggle - min target 44x44px */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-11 w-11 flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 rounded-xl border border-transparent hover:border-slate-800 cursor-pointer"
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
            </Button>
          </div>

          {/* Sign Out Button - min target 44px height */}
          <Button
            variant="ghost"
            size="default"
            className="w-full h-11 justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 border border-transparent hover:border-red-500/20 cursor-pointer"
            onClick={handleSignOut}
            id="nav-signout"
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            <span className="text-sm font-semibold">Sign Out Workspace</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Shell */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur overlay */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer content drawer-panel using animate-drawer-in */}
          <aside className="absolute inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-800/80 z-50 animate-drawer-in flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-100 leading-none block">CampusConnect</span>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mt-1 block">Mobile Hub</span>
                </div>
              </div>
              
              {/* Close Button - min target 44x44px */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-11 w-11 flex items-center justify-center hover:bg-slate-800/60 rounded-xl"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
              </Button>
            </div>

            {/* Mobile Nav Links - min target 44px */}
            <nav className="flex-1 p-4 space-y-2.5 mt-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-cyan-400' : item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Profile & Control Panel */}
            <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-900/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">
                      {profile?.full_name || 'Campus User'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {profile?.college || user?.email}
                    </p>
                  </div>
                </div>
                
                {/* Theme Toggle - min target 44x44px */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 rounded-xl border border-slate-800"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
                </Button>
              </div>

              {/* Sign Out Button - min target 44px */}
              <Button
                variant="ghost"
                size="default"
                className="w-full h-11 justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 border border-transparent hover:border-red-500/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                <span className="text-sm font-semibold">Sign Out Workspace</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header Bar - Sticky & glassmorphic */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md shadow-md">
          {/* Hamburger Menu - min target 44x44px */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-100"
            id="mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5.5 w-5.5 text-cyan-400" />
            <span className="font-extrabold text-sm tracking-tight text-slate-100">CampusConnect</span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </header>

        {/* Router Page Port View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
