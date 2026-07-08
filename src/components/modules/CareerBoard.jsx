import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { polishReferral } from '../../services/groq';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import {
  Briefcase, Search, Plus, X, ExternalLink, Sparkles,
  Building2, MapPin, Clock, Copy, Check
} from 'lucide-react';

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Internship', 'Co-op', 'Referral', 'Research'];

function CreateJobForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-Time',
    description: '', apply_link: '', referral_contact: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('career_board').insert({
      user_id: user.id,
      title: form.title,
      company: form.company,
      location: form.location,
      type: form.type,
      description: form.description,
      apply_link: form.apply_link,
      referral_contact: form.referral_contact,
      is_active: true,
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
          <h2 className="text-xl font-bold gradient-text">Post Opportunity</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="career-title" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input id="career-company" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            <Input id="career-location" placeholder="Location / Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    form.type === t
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Textarea id="career-desc" placeholder="Role description, requirements..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input id="career-link" placeholder="Application link (optional)" value={form.apply_link} onChange={(e) => setForm({ ...form, apply_link: e.target.value })} />
          <Input id="career-referral" placeholder="Referral contact email (optional)" value={form.referral_contact} onChange={(e) => setForm({ ...form, referral_contact: e.target.value })} />
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Posting...' : 'Post Opportunity'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CareerBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // AI Referral Polish state
  const [showPolish, setShowPolish] = useState(false);
  const [rawReferral, setRawReferral] = useState('');
  const [polishedResult, setPolishedResult] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('career_board')
      .select('*, profiles(full_name, college)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchJobs(); }, []);

  const filtered = jobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && job.type !== typeFilter) return false;
    return true;
  });

  async function handlePolish() {
    if (!rawReferral.trim()) return;
    setPolishing(true);
    setPolishedResult('');
    try {
      const result = await polishReferral(rawReferral);
      setPolishedResult(result);
    } catch (err) {
      setPolishedResult(`Error: ${err.message}`);
    }
    setPolishing(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(polishedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getTypeVariant(type) {
    const map = {
      'Full-Time': 'success', 'Part-Time': 'default', 'Internship': 'warning',
      'Co-op': 'default', 'Referral': 'gradient', 'Research': 'secondary',
    };
    return map[type] || 'secondary';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
              <Briefcase className="h-6 w-6 text-purple-400" />
            </div>
            Career Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Jobs, internships & referral opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPolish(true)} id="career-polish-btn" className="border-gradient-start/40 text-primary hover:bg-primary/10">
            <Sparkles className="h-4 w-4" /> Polish Referral
          </Button>
          <Button variant="gradient" onClick={() => setShowCreate(true)} id="career-create-btn">
            <Plus className="h-4 w-4" /> Post Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="career-search" placeholder="Search jobs, companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              !typeFilter ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
            }`}
          >
            All Types
          </button>
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                typeFilter === t ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card rounded-xl p-5 h-36 shimmer-bg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No opportunities posted yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>Post the first one</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Card key={job.id} className="group">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={getTypeVariant(job.type)}>{job.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Posted by {job.profiles?.full_name || 'Campus member'}
                </span>
                <div className="flex gap-2">
                  {job.apply_link && (
                    <Button variant="default" size="sm" asChild>
                      <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> Apply
                      </a>
                    </Button>
                  )}
                  {job.referral_contact && (
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md border border-border">
                      <Button variant="outline" size="sm" className="h-7 border-none bg-transparent hover:bg-accent px-1.5" asChild>
                        <a href={`mailto:${job.referral_contact}?subject=Referral Request: ${job.title} at ${job.company}`}>
                          Request Referral
                        </a>
                      </Button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(job.referral_contact);
                          alert(`Email copied to clipboard: ${job.referral_contact}`);
                        }}
                        className="hover:text-primary transition-colors cursor-pointer text-[10px] font-semibold text-primary/80 uppercase tracking-wider"
                        id={`career-copy-email-${job.id}`}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateJobForm onClose={() => setShowCreate(false)} onCreated={fetchJobs} />}

      {/* AI Polish Referral Drawer */}
      <Drawer open={showPolish} onClose={() => { setShowPolish(false); setPolishedResult(''); setRawReferral(''); }} title="AI Referral Polisher">
        <div className="rounded-xl bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 border border-gradient-start/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Powered by Groq AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste your rough referral request below. Our AI will transform it into a polished, corporate-grade referral message.
          </p>
        </div>

        <Textarea
          id="polish-input"
          placeholder="e.g., Hey I want a referral for SWE at Google. I know React and Python. I did a project with ML. Graduated from MIT."
          value={rawReferral}
          onChange={(e) => setRawReferral(e.target.value)}
          className="min-h-[140px]"
        />

        <Button
          variant="gradient"
          className="w-full"
          onClick={handlePolish}
          disabled={polishing || !rawReferral.trim()}
          id="polish-submit-btn"
        >
          {polishing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Polishing...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Polish My Referral
            </>
          )}
        </Button>

        {polishedResult && (
          <div className="animate-fade-in mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-success">Polished Result</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} id="polish-copy-btn">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="rounded-xl bg-secondary/50 border border-border p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {polishedResult}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
