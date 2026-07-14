import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import {
  Home, ShoppingBag, Users, Briefcase, FolderOpen,
  LogOut, GraduationCap, Menu, X, ChevronRight, Sun, Moon,
  LayoutDashboard, Trash2, ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-500' },
  { id: 'housing', label: 'Housing Hub', icon: Home, color: 'text-cyan-500' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'text-orange-500' },
  { id: 'teamup', label: 'Team-Up', icon: Users, color: 'text-emerald-505' },
  { id: 'career', label: 'Career Board', icon: Briefcase, color: 'text-violet-500' },
  { id: 'resources', label: 'Resources', icon: FolderOpen, color: 'text-amber-500' },
];

export default function AppLayout({ activeModule, onNavigate, children }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleSignOut() {
    await signOut();
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Confirmation string does not match.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) {
        setDeleteError(error.message);
        setDeleteLoading(false);
      } else {
        // Log out immediately upon deletion
        setDeleteLoading(false);
        setShowDeleteModal(false);
        await signOut();
      }
    } catch (err) {
      setDeleteError('Failed to verify deletion request. Contact administration.');
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground relative transition-colors duration-200 w-full flex-1 min-w-0 min-h-0 overflow-x-hidden">
      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/30 backdrop-blur-xl shadow-2xl h-screen sticky top-0 z-30 shrink-0 transition-colors duration-200">
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-550 shadow-md shadow-cyan-500/10 shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-foreground tracking-tight leading-none text-base">CampusConnect</h1>
            <p className="text-[10px] text-cyan-550 font-mono tracking-widest uppercase mt-1">Academic Portal</p>
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
                className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group border ${
                  active
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent'
                }`}
                id={`nav-${item.id}`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary' : item.color} transition-colors group-hover:scale-105 duration-200`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
              </button>
            );
          })}
        </nav>

        {/* Desktop Profile, Theme Toggler & Account Deletion */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {profile?.full_name || 'Campus User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {profile?.college || user?.email}
                </p>
              </div>
            </div>
            
            {/* Theme Toggle - min target 44x44px */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-11 w-11 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl cursor-pointer"
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-550" />}
            </Button>
          </div>

          {/* Sign Out Button - min target 44px height */}
          <Button
            variant="ghost"
            size="default"
            className="w-full h-11 justify-start text-muted-foreground hover:text-red-505 hover:bg-red-500/5 rounded-xl px-4 border border-transparent hover:border-red-500/10 cursor-pointer"
            onClick={handleSignOut}
            id="nav-signout"
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            <span className="text-sm font-semibold">Sign Out Workspace</span>
          </Button>

          {/* IRREVERSIBLE Account Deletion Trigger */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-11 flex items-center justify-start text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl px-4 transition-all duration-200 cursor-pointer"
            id="delete-account-trigger"
          >
            <Trash2 className="h-5 w-5 mr-3 shrink-0 text-red-500" />
            <span>Delete Account</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Shell */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur overlay */}
          <div
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer content using animate-drawer-in */}
          <aside className="absolute inset-y-0 left-0 w-80 bg-background dark:bg-slate-900 border-r border-border z-50 animate-drawer-in flex flex-col shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-550 shadow-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-foreground leading-none block text-base">CampusConnect</span>
                  <span className="text-[10px] text-cyan-550 font-mono tracking-widest uppercase mt-1 block">Mobile Hub</span>
                </div>
              </div>
              
              {/* Close Button - min target 44x44px */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-11 w-11 flex items-center justify-center hover:bg-secondary/60 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Nav Links - min target 44px */}
            <nav className="flex-1 p-4 space-y-2 mt-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                      active
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-primary' : item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Profile & Control Panel */}
            <div className="p-4 border-t border-border space-y-3 bg-secondary/20">
              <div className="flex items-center justify-between gap-3 bg-secondary/35 p-2 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-550 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {profile?.full_name || 'Campus User'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {profile?.college || user?.email}
                    </p>
                  </div>
                </div>
                
                {/* Theme Toggle - min target 44x44px */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-550" />}
                </Button>
              </div>

              {/* Sign Out Button - min target 44px */}
              <Button
                variant="ghost"
                size="default"
                className="w-full h-11 justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl px-4 border border-transparent hover:border-red-500/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                <span className="text-sm font-semibold">Sign Out Workspace</span>
              </Button>

              {/* Mobile Account Deletion Trigger */}
              <button
                onClick={() => { setSidebarOpen(false); setShowDeleteModal(true); }}
                className="w-full h-11 flex items-center justify-start text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl px-4 transition-all duration-200"
              >
                <Trash2 className="h-5 w-5 mr-3 shrink-0 text-red-550" />
                <span>Delete Account</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-background text-foreground transition-colors duration-200 w-full">
        {/* Mobile Header Bar - Sticky & glassmorphic */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-card/60 backdrop-blur-md shadow-md transition-colors duration-200">
          {/* Hamburger Menu - min target 44x44px */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
            id="mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5.5 w-5.5 text-primary" />
            <span className="font-extrabold text-sm tracking-tight text-foreground">CampusConnect</span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-550 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </header>

        {/* Router Page Port View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* Irreversible Account Deletion High-Fidelity Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200 animate-fade-in">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-red-500/30 bg-slate-900/40 relative overflow-hidden shadow-2xl">
            {/* Ambient warning graphic decoration */}
            <div className="absolute top-[-10px] right-[-10px] p-3 opacity-5 pointer-events-none">
              <ShieldAlert className="h-28 w-28 text-red-500" />
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0 border border-red-500/30 h-10 w-10 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-red-400">Irreversible Action</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Deleting your account will permanently and immediately purge all housing listings, marketplace trading assets, active team matchmaking posts, and resources associated with your UUID.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  To confirm, type "DELETE MY ACCOUNT" below:
                </label>
                <Input
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-secondary/40 border-slate-800 text-xs focus:border-red-500/80 focus:ring-red-500/10"
                  required
                />
              </div>

              {deleteError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 animate-fade-in">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
                  className="h-10 px-4 rounded-xl text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-650 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || deleteLoading}
                >
                  {deleteLoading ? 'Purging Systems...' : 'Confirm Destruction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
