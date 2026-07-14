import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  Users, Search, Plus, X, UserPlus, Mail, Copy, Check, Calendar, Code,
  Palette, Database, Globe, Cpu, Megaphone, FlaskConical, Calculator
} from 'lucide-react';

const SKILL_TAGS = [
  { value: 'frontend', label: 'Frontend', icon: Globe, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { value: 'backend', label: 'Backend', icon: Database, color: 'text-blue-605 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'mobile', label: 'Mobile', icon: Cpu, color: 'text-violet-605 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { value: 'design', label: 'UI/UX Design', icon: Palette, color: 'text-rose-600 dark:text-rose-450 bg-rose-500/10 border-rose-500/20' },
  { value: 'ml', label: 'ML / AI', icon: FlaskConical, color: 'text-amber-600 dark:text-amber-455 bg-amber-500/10 border-amber-500/20' },
  { value: 'data', label: 'Data Science', icon: Calculator, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'devops', label: 'DevOps', icon: Code, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { value: 'marketing', label: 'Marketing', icon: Megaphone, color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
];

function CreateTeamForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    project_name: '', description: '', looking_for: [],
    team_size: '4', deadline: '', contact_email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  function toggleSkill(skill) {
    setForm((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(skill)
        ? prev.looking_for.filter((s) => s !== skill)
        : [...prev.looking_for, skill],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('project_teams').insert({
      user_id: user.id,
      project_name: form.project_name,
      description: form.description,
      looking_for: form.looking_for,
      team_size: parseInt(form.team_size),
      deadline: form.deadline || null,
      contact_email: form.contact_email,
      is_open: true,
    });
    setLoading(false);
    if (!error) {
      onCreated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto transition-colors duration-200">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-450" />
              Build a Team
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Recruit peers for class projects, hackathons or side startups</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Project / Team Name</label>
            <Input
              id="team-name"
              placeholder="e.g., HackHarvard AI Study Companion"
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              required
              className="bg-secondary/40 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Vision & Requirements</label>
            <Textarea
              id="team-desc"
              placeholder="Outline project goal, technology stack, workload scope, and what you expect from applicants..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="bg-secondary/40 border-border min-h-[100px] focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Skills Needed</label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_TAGS.map((s) => {
                const Icon = s.icon;
                const selected = form.looking_for.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSkill(s.value)}
                    className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/40'
                        : 'bg-secondary/40 text-muted-foreground border border-border hover:border-emerald-500/20'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Target Team Size</label>
              <Input
                id="team-size"
                type="number"
                min="2"
                max="20"
                value={form.team_size}
                onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Application Deadline</label>
              <Input
                id="team-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="bg-secondary/40 border-border text-foreground text-xs focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Contact Email</label>
            <Input
              id="team-email"
              type="email"
              placeholder="contact@college.edu"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              required
              className="bg-secondary/40 border-border focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Posting request...' : 'Post Team Request'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function TeamUp() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  async function fetchTeams() {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_teams')
      .select('*, profiles(full_name, college)')
      .eq('is_open', true)
      .order('created_at', { ascending: false });
    if (!error) setTeams(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchTeams(); }, []);

  function toggleSkillFilter(skill) {
    setSkillFilter((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }

  const filtered = useMemo(() => {
    return teams.filter((team) => {
      if (search && !team.project_name.toLowerCase().includes(search.toLowerCase()) && !team.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (skillFilter.length > 0 && !skillFilter.some((s) => team.looking_for?.includes(s))) return false;
      return true;
    });
  }, [teams, search, skillFilter]);

  function handleCopyEmail(email, id) {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            Team-Up Matchmaking
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Find complementary skill sets, organize study groups, or recruit for competitive hackathons.
          </p>
        </div>

        {/* Post Team Trigger - min target 44px height */}
        <Button
          variant="gradient"
          onClick={() => setShowCreate(true)}
          id="team-create-btn"
          className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center select-none shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Post Team Request
        </Button>
      </div>

      {/* Sticky Filters Block */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-border space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            id="team-search"
            placeholder="Search teams by project name, description or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-secondary/45 border-border focus:border-emerald-500"
          />
        </div>

        {/* Skill filters - touch optimized */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border items-center">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mr-1">Filter Skill:</span>
          {SKILL_TAGS.map((s) => {
            const Icon = s.icon;
            const selected = skillFilter.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggleSkillFilter(s.value)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selected
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/40 shadow-sm'
                    : 'bg-secondary/40 text-muted-foreground border border-border hover:border-emerald-500/25 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
          {skillFilter.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSkillFilter([])}
              className="text-xs font-bold text-muted-foreground hover:text-foreground h-9 px-2 hover:bg-secondary/60 rounded-xl cursor-pointer"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Feed Cards Layout */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-48 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-border">
          <Users className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-foreground">No Teammate Posts</h3>
          <p className="text-muted-foreground text-xs mt-1">Try resetting the filters or create your own project requirements post.</p>
          <Button variant="outline" className="mt-5 border-border hover:border-primary/20 h-10 px-4 rounded-xl text-xs font-bold cursor-pointer" onClick={() => setShowCreate(true)}>
            Start a Team
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((team) => (
            <Card key={team.id} className="group glass-card overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <CardHeader className="p-0 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {team.project_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">
                        Proposed by <span className="text-foreground/90 font-bold">{team.profiles?.full_name || 'Campus Member'}</span>
                        {team.profiles?.college ? ` • ${team.profiles.college}` : ''}
                      </CardDescription>
                    </div>
                    
                    {/* Capacity Levels & Deadline display widgets */}
                    <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                      <Badge variant="outline" className="bg-secondary/45 border-border text-[11px] py-1 px-3 rounded-lg text-foreground font-semibold flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-primary" />
                        <span>{team.team_size} members limit</span>
                      </Badge>
                      {team.deadline && (
                        <Badge variant="warning" className="bg-amber-500/10 border-amber-500/20 text-[11px] py-1 px-3 rounded-lg text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Due {new Date(team.deadline).toLocaleDateString()}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0 py-2 space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {team.description}
                  </p>

                  {/* Capacity Visual Progress Bar Indicator */}
                  <div className="space-y-2 max-w-sm bg-secondary/35 p-3 rounded-xl border border-border/50">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Recruiting Space</span>
                      <span className="text-primary font-mono">1 / {team.team_size} Occupied</span>
                    </div>
                    <div className="w-full h-1.5 bg-background dark:bg-slate-950 rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                        style={{ width: `${(1 / team.team_size) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Needed Skills pill list - grouped nicely without overlaps */}
                  {team.looking_for && team.looking_for.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold">Skills Required:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {team.looking_for.map((skill) => {
                          const tag = SKILL_TAGS.find((s) => s.value === skill);
                          const Icon = tag?.icon || Code;
                          return (
                            <Badge
                              key={skill}
                              variant="default"
                              className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-xl border ${
                                tag?.color || 'text-muted-foreground bg-secondary border-border'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{tag?.label || skill}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Action layout footer - locked to card bottom edge (h-11) */}
              <CardFooter className="p-0 pt-4 mt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent">
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="h-11 px-5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 flex items-center justify-center gap-2 select-none cursor-pointer w-full sm:w-auto"
                >
                  <a href={`mailto:${team.contact_email}?subject=Team-Up Matchmaking: Interest in ${team.project_name}&body=Hi ${team.profiles?.full_name || 'there'},\n\nI saw your team request for "${team.project_name}" on CampusConnect. I am interested in joining and believe my skills align with what you're looking for.`}>
                    <Mail className="h-4.5 w-4.5" />
                    <span>Reach Out via Email</span>
                  </a>
                </Button>

                {/* Copy component - min target 44px */}
                <div className="flex items-center gap-2 bg-secondary/40 px-3 py-1.5 rounded-xl border border-border w-full sm:w-auto justify-between sm:justify-start">
                  <span className="select-all font-mono text-[11px] text-muted-foreground tracking-tight max-w-[200px] truncate">
                    {team.contact_email}
                  </span>
                  
                  <button
                    onClick={() => handleCopyEmail(team.contact_email, team.id)}
                    className="h-9 px-3 rounded-lg bg-secondary border border-border hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0"
                    id={`team-copy-email-${team.id}`}
                  >
                    {copiedId === team.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-650 dark:text-emerald-450 animate-pulse" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateTeamForm onClose={() => setShowCreate(false)} onCreated={fetchTeams} />}
    </div>
  );
}
