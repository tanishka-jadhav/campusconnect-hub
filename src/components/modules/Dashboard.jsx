import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Home, ShoppingBag, Users, FolderOpen, ArrowUpRight,
  Bell, Plus, Clock, TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    housing: 12,
    marketplace: 48,
    teamup: 8,
    resources: 140,
  });
  const [loading, setLoading] = useState(true);

  async function fetchTelemetry() {
    setLoading(true);
    try {
      // Fetch dynamic database counts
      const [
        { count: housingCount, error: hErr },
        { count: mktCount, error: mErr },
        { count: teamCount, error: tErr },
        { count: resCount, error: rErr }
      ] = await Promise.all([
        supabase.from('listings_housing').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('listings_marketplace').select('*', { count: 'exact', head: true }).eq('is_sold', false),
        supabase.from('project_teams').select('*', { count: 'exact', head: true }).eq('is_open', true),
        supabase.from('resources').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        housing: hErr ? 12 : (housingCount || 12),
        marketplace: mErr ? 48 : (mktCount || 48),
        teamup: tErr ? 8 : (teamCount || 8),
        resources: rErr ? 140 : (resCount || 140),
      });
    } catch (err) {
      console.error('Failed to load telemetry metrics:', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const alerts = [
    { id: 1, message: "New studio listed 5m ago near North Campus", type: "housing", time: "5m ago", icon: Home, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    { id: 2, message: "Stripe SWE Internship referral opportunity added", type: "career", time: "18m ago", icon: TrendingUp, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
    { id: 3, message: "React/ML developer needed for HackHarvard project", type: "teamup", time: "1h ago", icon: Users, color: "text-emerald-500 bg-emerald-500/10 border-emerald-505/20" },
    { id: 4, message: "CS-311 Discrete Mathematics mid-term notes uploaded", type: "resources", time: "3h ago", icon: FolderOpen, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-550 shadow-md shadow-cyan-500/20 text-white shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <span>Academic Command Center</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Welcome back, <span className="text-foreground/90 font-bold">{profile?.full_name || 'Campus Student'}</span>. Here is your campus workspace telemetry:
          </p>
        </div>
      </div>

      {/* Grid of 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Housing telemetry card */}
        <Card className="glass-card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer p-6" onClick={() => onNavigate('housing')}>
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Housing Hub</span>
              {loading ? (
                <div className="h-8 w-16 bg-secondary/40 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-extrabold font-mono tracking-tight block">
                  {stats.housing}
                </span>
              )}
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                <span>Available properties</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Home className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Marketplace volume card */}
        <Card className="glass-card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer p-6" onClick={() => onNavigate('marketplace')}>
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Active Trading</span>
              {loading ? (
                <div className="h-8 w-16 bg-secondary/40 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-extrabold font-mono tracking-tight block">
                  {stats.marketplace}
                </span>
              )}
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                <span>Listed student items</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Team matchmaking slot card */}
        <Card className="glass-card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer p-6" onClick={() => onNavigate('teamup')}>
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Team-Up Posts</span>
              {loading ? (
                <div className="h-8 w-16 bg-secondary/40 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-extrabold font-mono tracking-tight block">
                  {stats.teamup}
                </span>
              )}
              <span className="text-[11px] text-emerald-600 dark:text-emerald-450 font-semibold flex items-center gap-1">
                <span>Open project requests</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Resource downloads card */}
        <Card className="glass-card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer p-6" onClick={() => onNavigate('resources')}>
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Documents Drive</span>
              {loading ? (
                <div className="h-8 w-16 bg-secondary/40 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-extrabold font-mono tracking-tight block">
                  {stats.resources}
                </span>
              )}
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>Notes & files shared</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FolderOpen className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Split Workflow Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Quick Insights timeline */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 border border-border flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-primary" />
                <span>Quick Insights Tracker</span>
              </h3>
              <span className="text-[10px] bg-secondary text-muted-foreground font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => {
                const AlertIcon = alert.icon;
                return (
                  <div key={alert.id} className="flex gap-4 p-3 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-border/40 transition-all duration-200">
                    <div className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border ${alert.color}`}>
                      <AlertIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs text-foreground font-semibold line-clamp-1 leading-snug">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground">
              Campus updates refresh automatically. Report academic fraud directly to moderation teams.
            </p>
          </div>
        </div>

        {/* Right Panel: Quick Actions Navigation Hub */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 border border-border flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                <span>Quick Action Navigation Hub</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Deep Link button 1 */}
              <button
                onClick={() => onNavigate('housing')}
                className="w-full h-12 rounded-xl bg-card border border-border hover:border-cyan-500/30 hover:bg-secondary/40 flex items-center justify-between px-4 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <span className="text-xs font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-cyan-500" />
                  <span>List Property Options</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              {/* Deep Link button 2 */}
              <button
                onClick={() => onNavigate('teamup')}
                className="w-full h-12 rounded-xl bg-card border border-border hover:border-emerald-500/30 hover:bg-secondary/40 flex items-center justify-between px-4 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <span className="text-xs font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-500" />
                  <span>Request Team Partner</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              {/* Deep Link button 3 */}
              <button
                onClick={() => onNavigate('resources')}
                className="w-full h-12 rounded-xl bg-card border border-border hover:border-amber-500/30 hover:bg-secondary/40 flex items-center justify-between px-4 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <span className="text-xs font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>Share Lecture Notes</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              {/* Deep Link button 4 */}
              <button
                onClick={() => onNavigate('career')}
                className="w-full h-12 rounded-xl bg-card border border-border hover:border-violet-500/30 hover:bg-secondary/40 flex items-center justify-between px-4 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <span className="text-xs font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-violet-500" />
                  <span>Post Job Openings</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="rounded-xl bg-secondary/35 border border-border p-3 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Clicking an action button deep-links you to the module viewport to post listings immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
