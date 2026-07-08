import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  Users, Search, Plus, X, UserPlus, Mail,
  Code, Palette, Database, Globe, Cpu, Megaphone, FlaskConical, Calculator
} from 'lucide-react';

const SKILL_TAGS = [
  { value: 'frontend', label: 'Frontend', icon: Globe },
  { value: 'backend', label: 'Backend', icon: Database },
  { value: 'mobile', label: 'Mobile', icon: Cpu },
  { value: 'design', label: 'UI/UX Design', icon: Palette },
  { value: 'ml', label: 'ML / AI', icon: FlaskConical },
  { value: 'data', label: 'Data Science', icon: Calculator },
  { value: 'devops', label: 'DevOps', icon: Code },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 pb-12 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-lg animate-fade-in my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Create Team Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="team-name" placeholder="Project / Team name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required />
          <Textarea id="team-desc" placeholder="What are you building? What's the vision?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Skills needed</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_TAGS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSkill(s.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      form.looking_for.includes(s.value)
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                    }`}
                  >
                    <Icon className="h-3 w-3" /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Team Size</label>
              <Input id="team-size" type="number" min="2" max="20" value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Deadline (optional)</label>
              <Input id="team-deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <Input id="team-email" type="email" placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Posting...' : 'Post Team Request'}
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            Team-Up
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Find your dream team for projects & hackathons</p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreate(true)} id="team-create-btn">
          <Plus className="h-4 w-4" /> Post Team Request
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="team-search" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_TAGS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.value}
                onClick={() => toggleSkillFilter(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  skillFilter.includes(s.value)
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                }`}
              >
                <Icon className="h-3 w-3" /> {s.label}
              </button>
            );
          })}
          {skillFilter.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSkillFilter([])} className="text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 h-40 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No teams looking for members right now.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>Start a team</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((team) => (
            <Card key={team.id} className="group">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>{team.project_name}</CardTitle>
                    <CardDescription>
                      Posted by {team.profiles?.full_name || 'Campus member'}
                      {team.profiles?.college ? ` • ${team.profiles.college}` : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <UserPlus className="h-3 w-3 mr-1" />
                      {team.team_size} members
                    </Badge>
                    {team.deadline && (
                      <Badge variant="warning">Due {new Date(team.deadline).toLocaleDateString()}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                <div className="flex flex-wrap gap-2">
                  {team.looking_for?.map((skill) => {
                    const tag = SKILL_TAGS.find((s) => s.value === skill);
                    const Icon = tag?.icon || Code;
                    return (
                      <Badge key={skill} variant="default" className="flex items-center gap-1">
                        <Icon className="h-3 w-3" /> {tag?.label || skill}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="default" size="sm" asChild>
                  <a href={`mailto:${team.contact_email}?subject=Team-Up: ${team.project_name}&body=Hi! I saw your team post on CampusConnect and I'd love to join.`}>
                    <Mail className="h-3.5 w-3.5" /> Reach Out
                  </a>
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border">
                  <span className="select-all font-mono">{team.contact_email}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(team.contact_email);
                      alert(`Email copied to clipboard: ${team.contact_email}`);
                    }}
                    className="hover:text-primary transition-colors cursor-pointer text-[10px] font-semibold text-primary/80 uppercase tracking-wider"
                    id={`team-copy-email-${team.id}`}
                  >
                    Copy
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
