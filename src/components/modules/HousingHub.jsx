import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  Home, MapPin, DollarSign, BedDouble, Bath, Plus, Search,
  SlidersHorizontal, X, Phone, MessageCircle, Users, Activity,
  Calendar, Zap, Bus, Users2, ShieldAlert, Sparkles, Heart
} from 'lucide-react';

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Laundry', 'Gym', 'Pool', 'AC', 'Furnished', 'Pet-Friendly'];
const TERM_OPTIONS = ['Fall Semester', 'Spring Semester', 'Summer Term', 'Full Year'];
const SLEEP_OPTIONS = ['Flexible', 'Night Owl', 'Early Bird'];
const STUDY_OPTIONS = ['Flexible', 'Quiet Room', 'Library'];

function CreateListingForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', address: '', rent: '', bedrooms: '1',
    bathrooms: '1', amenities: [], contact_phone: '', contact_whatsapp: '',
    academic_term: 'Full Year', split_billing: true, max_occupants: '2',
    proximity_gate: '', shuttle_connected: false
  });
  const [loading, setLoading] = useState(false);

  function toggleAmenity(amenity) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('listings_housing').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      address: form.address,
      rent: parseFloat(form.rent),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      amenities: form.amenities,
      contact_phone: form.contact_phone,
      contact_whatsapp: form.contact_whatsapp,
      academic_term: form.academic_term,
      split_billing: form.split_billing,
      max_occupants: parseInt(form.max_occupants),
      proximity_gate: form.proximity_gate,
      shuttle_connected: form.shuttle_connected,
      is_active: true,
    });
    setLoading(false);
    if (!error) {
      onCreated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto transition-colors duration-200">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-slate-800/60 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              List Your Property
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Publish local housing options for campus peers</p>
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
            <label className="text-xs font-semibold text-foreground">Listing Title</label>
            <Input
              id="housing-title"
              placeholder="e.g., Cosy 2-Bedroom near North Campus Library"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-secondary/40 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Detailed Description</label>
            <Textarea
              id="housing-desc"
              placeholder="Describe rent terms, roommates details, distances to campus, utilities, etc..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="bg-secondary/40 border-border min-h-[90px] focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Address / Location</label>
            <Input
              id="housing-address"
              placeholder="e.g., 402 University Ave, Apt B"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              className="bg-secondary/40 border-border focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground block">Lease Term Period</label>
              <select
                value={form.academic_term}
                onChange={(e) => setForm({ ...form, academic_term: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-800 bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                {TERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Max Occupants</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={form.max_occupants}
                onChange={(e) => setForm({ ...form, max_occupants: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Rent ($/mo)</label>
              <Input
                id="housing-rent"
                type="number"
                min="0"
                placeholder="800"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
                required
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Bedrooms</label>
              <Input
                id="housing-beds"
                type="number"
                min="0"
                max="10"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Bathrooms</label>
              <Input
                id="housing-baths"
                type="number"
                min="0"
                max="10"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Campus Proximity Gate / Walk</label>
              <Input
                placeholder="e.g. 5 min walk to Engineering Gate"
                value={form.proximity_gate}
                onChange={(e) => setForm({ ...form, proximity_gate: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="form-shuttle"
                checked={form.shuttle_connected}
                onChange={(e) => setForm({ ...form, shuttle_connected: e.target.checked })}
                className="h-4.5 w-4.5 rounded bg-secondary/40 border-slate-800 text-primary focus:ring-primary/10"
              />
              <label htmlFor="form-shuttle" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                Campus Shuttle Route Nearby
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Amenities Included</label>
            <div className="flex flex-wrap gap-1.5">
              {AMENITY_OPTIONS.map((a) => {
                const selected = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center ${
                      selected
                        ? 'bg-primary/20 text-primary border border-primary/45'
                        : 'bg-secondary/40 text-muted-foreground border border-border hover:border-primary/45'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <Input
                id="housing-phone"
                placeholder="e.g., +15550199"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">WhatsApp Number</label>
              <Input
                id="housing-wa"
                placeholder="e.g., +15550199"
                value={form.contact_whatsapp}
                onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })}
                className="bg-secondary/40 border-border focus:border-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Publishing listing...' : 'Publish Listing'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function HousingHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'matchmaker'
  
  // Listings State
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic Rent Split State per Card
  const [splitOccupants, setSplitOccupants] = useState({}); // listingId -> occupantsCount

  // Roommate Matcher State
  const [peers, setPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showProfileUpdateAlert, setShowProfileUpdateAlert] = useState(false);

  // Active User Lifestyle Edit Form
  const [myLifestyle, setMyLifestyle] = useState({
    lifestyle_sleep: 'Flexible',
    lifestyle_cleanliness: 3,
    lifestyle_study: 'Flexible',
    lifestyle_noise: 3,
  });

  async function fetchListings() {
    setLoadingListings(true);
    const { data, error } = await supabase
      .from('listings_housing')
      .select('*, profiles(full_name, college)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error) setListings(data || []);
    setLoadingListings(false);
  }

  async function fetchRoommateTelemetry() {
    if (!user) return;
    setLoadingPeers(true);
    
    // Fetch my profile to compute compatibility index
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setMyProfile(profileData);
      setMyLifestyle({
        lifestyle_sleep: profileData.lifestyle_sleep || 'Flexible',
        lifestyle_cleanliness: profileData.lifestyle_cleanliness || 3,
        lifestyle_study: profileData.lifestyle_study || 'Flexible',
        lifestyle_noise: profileData.lifestyle_noise || 3,
      });
    }

    // Fetch all other student profiles
    const { data: peersData, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id);

    if (!error) setPeers(peersData || []);
    setLoadingPeers(false);
  }

  useEffect(() => {
    fetchListings();
    fetchRoommateTelemetry();
  }, [user]);

  // Handle User Lifestyle Profile Update
  async function handleUpdateMyLifestyle(e) {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        lifestyle_sleep: myLifestyle.lifestyle_sleep,
        lifestyle_cleanliness: myLifestyle.lifestyle_cleanliness,
        lifestyle_study: myLifestyle.lifestyle_study,
        lifestyle_noise: myLifestyle.lifestyle_noise,
      })
      .eq('id', user.id);

    setSavingProfile(false);
    if (!error) {
      setShowProfileUpdateAlert(true);
      setTimeout(() => setShowProfileUpdateAlert(false), 3000);
      fetchRoommateTelemetry();
    }
  }

  // Compatibility Index % calculator formula logic
  const peersWithCompatibility = useMemo(() => {
    if (!myProfile) return peers.map(p => ({ ...p, compatibility: 70 }));
    
    return peers.map((peer) => {
      let score = 0;
      
      // 1. Sleep Schedule match (30 points)
      if (peer.lifestyle_sleep === myLifestyle.lifestyle_sleep) {
        score += 30;
      } else if (myLifestyle.lifestyle_sleep === 'Flexible' || peer.lifestyle_sleep === 'Flexible') {
        score += 15;
      }
      
      // 2. Cleanliness Match (30 points)
      const cleanDiff = Math.abs((peer.lifestyle_cleanliness || 3) - (myLifestyle.lifestyle_cleanliness || 3));
      score += Math.max(0, 30 - (cleanDiff * 7));
      
      // 3. Study Habits Match (20 points)
      if (peer.lifestyle_study === myLifestyle.lifestyle_study) {
        score += 20;
      } else if (myLifestyle.lifestyle_study === 'Flexible' || peer.lifestyle_study === 'Flexible') {
        score += 10;
      }
      
      // 4. Noise Tolerance Match (20 points)
      const noiseDiff = Math.abs((peer.lifestyle_noise || 3) - (myLifestyle.lifestyle_noise || 3));
      score += Math.max(0, 20 - (noiseDiff * 5));
      
      return {
        ...peer,
        compatibility: Math.round(score),
      };
    }).sort((a, b) => b.compatibility - a.compatibility);
  }, [peers, myProfile, myLifestyle]);

  // Listings Filter Query
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.address.toLowerCase().includes(search.toLowerCase())) return false;
      if (budgetMax && l.rent > parseFloat(budgetMax)) return false;
      if (termFilter && l.academic_term !== termFilter) return false;
      return true;
    });
  }, [listings, search, budgetMax, termFilter]);

  function getCompatibilityColor(score) {
    if (score >= 80) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 60) return 'text-emerald-450 bg-emerald-500/10 border-emerald-500/30';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="space-y-6 animate-fade-in w-full flex-1 min-w-0 min-h-0 overflow-x-hidden">
      {/* Header and Toggle Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-primary">
              <Home className="h-6 w-6" />
            </div>
            <span>Campus Housing Hub</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Discover student accommodations and verify roommate lifestyle compatibility.
          </p>
        </div>

        {/* Action Controls Tabs and Create Triggers */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex rounded-xl bg-secondary/30 p-1 border border-slate-800/60">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Housing Listings
            </button>
            <button
              onClick={() => setActiveTab('matchmaker')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matchmaker'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users2 className="h-3.5 w-3.5" />
              <span>Roommate Matcher</span>
            </button>
          </div>

          {activeTab === 'listings' && (
            <Button
              variant="gradient"
              onClick={() => setShowCreate(true)}
              id="housing-create-btn"
              className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 select-none shadow-md shadow-cyan-500/10 cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" /> List Property
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content 1: Housing Listings Feed */}
      {activeTab === 'listings' && (
        <div className="space-y-6 w-full">
          {/* Filters Bar snaps cleanly above the search input */}
          <div className="sticky top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-slate-800/60 space-y-4 w-full">
            {showFilters && (
              <div className="flex flex-wrap gap-4 pb-3 border-b border-slate-800/50 animate-fade-in items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <Input
                    type="number"
                    placeholder="Max Budget"
                    className="w-32 h-10 bg-secondary/40 border-slate-800 text-xs"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <select
                    value={termFilter}
                    onChange={(e) => setTermFilter(e.target.value)}
                    className="h-10 rounded-xl border border-slate-800 bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Any Term</option>
                    {TERM_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setBudgetMax(''); setTermFilter(''); }}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground h-10 px-3 hover:bg-secondary/60 rounded-xl cursor-pointer"
                >
                  Reset
                </Button>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  id="housing-search"
                  placeholder="Search listings by title, keywords or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-11 bg-secondary/45 border-slate-800 focus:border-primary w-full"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-11 px-4 rounded-xl font-semibold border-slate-800 hover:border-primary/20 bg-secondary/20 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Cards Display Grid (Strictly 3 Columns layout) */}
          {loadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-72 shimmer-bg" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl border border-slate-800/60 w-full">
              <Home className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-bold text-foreground">No Listings Listed</h3>
              <p className="text-muted-foreground text-xs mt-1 font-medium">Adjust filters or create your own housing offering.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {filteredListings.map((listing) => {
                const activeOccupants = splitOccupants[listing.id] || 1;
                const splitRent = (listing.rent / activeOccupants).toFixed(2);
                
                return (
                  <Card key={listing.id} className="group glass-card flex flex-col justify-between overflow-hidden p-6 bg-slate-900/40 border border-slate-800/60">
                    <div>
                      <CardHeader className="p-0 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base font-bold text-cyan-400 group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
                            {listing.title}
                          </CardTitle>
                          <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-secondary/40 border-slate-800 shrink-0 uppercase font-mono text-indigo-400">
                            {listing.academic_term || 'Full Year'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-2">
                          <MapPin className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                          <span className="truncate">{listing.address}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0 py-2 space-y-4">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>

                        {/* Localized Proximity & Transportation Telemetry */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="flex items-center gap-1.5 truncate">
                            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>{listing.proximity_gate || 'Campus Proximity'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Bus className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                            <span>{listing.shuttle_connected ? 'Shuttle Route Connected' : 'No Shuttle Route'}</span>
                          </span>
                        </div>
                        
                        {/* Bed & Bath Details */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold bg-secondary/30 p-2.5 rounded-xl border border-slate-800/50">
                          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary" /> {listing.bedrooms} Beds</span>
                          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary" /> {listing.bathrooms} Baths</span>
                        </div>

                        {/* Interactive Dynamic Rent Split Calculator Matrix Slider */}
                        <div className="space-y-2 bg-secondary/30 p-3 rounded-xl border border-slate-800/50">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-muted-foreground">Split Occupancy Count:</span>
                            <span className="text-cyan-400 font-mono font-bold">{activeOccupants} Peers</span>
                          </div>
                          
                          <input
                            type="range"
                            min="1"
                            max={listing.max_occupants || 4}
                            value={activeOccupants}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSplitOccupants(prev => ({ ...prev, [listing.id]: val }));
                            }}
                            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary border border-slate-800"
                          />
                          
                          <div className="pt-1.5 border-t border-slate-800/50 flex justify-between items-center text-xs">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Per Peer Rate:</span>
                            <span className="font-mono text-cyan-400 font-bold">
                              ${listing.rent} total / {activeOccupants} = ${splitRent}/mo each
                            </span>
                          </div>
                        </div>

                        {/* Amenities Tags */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {listing.amenities.slice(0, 3).map((a) => (
                              <Badge key={a} variant="secondary" className="bg-secondary border border-border text-[9px] py-0.5 px-2 rounded-lg font-medium text-muted-foreground">
                                {a}
                              </Badge>
                            ))}
                            {listing.amenities.length > 3 && (
                              <Badge variant="secondary" className="bg-secondary border border-border text-[9px] py-0.5 px-2 rounded-lg font-medium text-muted-foreground">
                                +{listing.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <CardFooter className="p-0 pt-4 mt-4 border-t border-slate-800/50 flex items-center justify-between gap-3 bg-transparent">
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold">Listed by</span>
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {listing.profiles?.full_name || 'Campus Member'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        {listing.contact_phone && (
                          <a
                            href={`tel:${listing.contact_phone}`}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 border border-slate-800 text-muted-foreground hover:text-foreground transition-all active:scale-95 duration-150"
                            title="Call Owner"
                          >
                            <Phone className="h-4.5 w-4.5" />
                          </a>
                        )}
                        {listing.contact_whatsapp && (
                          <a
                            href={`https://wa.me/${listing.contact_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw your property "${listing.title}" on the CampusConnect Housing Hub. Is it still available for renting?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 px-3.5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95 duration-150"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Roommate Matcher Workspace */}
      {activeTab === 'matchmaker' && (
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left Column: Configure My Lifestyle Preferences */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass p-5 rounded-2xl border border-slate-800/60 space-y-4 bg-slate-900/30">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/50">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Configure Lifestyle Profile</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Let roommates evaluate compatibility scores</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateMyLifestyle} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Sleep Schedule</label>
                    <select
                      value={myLifestyle.lifestyle_sleep}
                      onChange={(e) => setMyLifestyle(prev => ({ ...prev, lifestyle_sleep: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-800 bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none"
                    >
                      {SLEEP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>Cleanliness Rating</span>
                      <span className="text-cyan-400 font-mono">{myLifestyle.lifestyle_cleanliness} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={myLifestyle.lifestyle_cleanliness}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMyLifestyle(prev => ({ ...prev, lifestyle_cleanliness: val }));
                      }}
                      className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary border border-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Study Environment</label>
                    <select
                      value={myLifestyle.lifestyle_study}
                      onChange={(e) => setMyLifestyle(prev => ({ ...prev, lifestyle_study: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-800 bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none"
                    >
                      {STUDY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>Noise Tolerance</span>
                      <span className="text-cyan-400 font-mono">{myLifestyle.lifestyle_noise} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={myLifestyle.lifestyle_noise}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMyLifestyle(prev => ({ ...prev, lifestyle_noise: val }));
                      }}
                      className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary border border-slate-800"
                    />
                  </div>

                  {showProfileUpdateAlert && (
                    <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-[11px] text-cyan-400 animate-fade-in flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>Lifestyle preferences saved successfully!</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-10 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Lifestyle Profile'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column: Roommate Compatibility List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                <h3 className="text-sm font-bold text-foreground">Recommended Roommates Matrix</h3>
                <span className="text-[10px] bg-secondary/40 border border-slate-800 text-muted-foreground px-2.5 py-0.5 rounded-lg font-mono uppercase tracking-wider font-semibold">
                  Match list
                </span>
              </div>

              {loadingPeers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {[1, 2].map((i) => (
                    <div key={i} className="glass-card rounded-2xl p-6 h-48 shimmer-bg" />
                  ))}
                </div>
              ) : peersWithCompatibility.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl border border-slate-800/60 w-full">
                  <Users className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-bold text-foreground">No Peer Records Found</h3>
                  <p className="text-muted-foreground text-xs mt-1">Other classmates have not set up preferences yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {peersWithCompatibility.map((peer) => (
                    <Card key={peer.id} className="glass-card flex flex-col justify-between p-5 bg-slate-900/40 border border-slate-800/60">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                              {(peer.full_name || peer.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-foreground truncate">{peer.full_name || 'Student'}</h4>
                              <p className="text-[10px] text-muted-foreground truncate">{peer.college || 'University Member'}</p>
                            </div>
                          </div>

                          {/* Dynamic Compatibility Index Chip */}
                          <Badge variant="outline" className={`text-[11px] py-1 px-2.5 rounded-lg font-mono font-bold tracking-tight border ${getCompatibilityColor(peer.compatibility)}`}>
                            {peer.compatibility}% Match
                          </Badge>
                        </div>

                        {/* Lifestyle Indicators Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="truncate">Sleep: <span className="text-foreground font-bold">{peer.lifestyle_sleep || 'Flexible'}</span></span>
                          <span className="truncate">Study: <span className="text-foreground font-bold">{peer.lifestyle_study || 'Flexible'}</span></span>
                          <span className="truncate">Cleanliness: <span className="text-cyan-400 font-mono font-bold">{peer.lifestyle_cleanliness || 3} / 5</span></span>
                          <span className="truncate">Noise Tol: <span className="text-cyan-400 font-mono font-bold">{peer.lifestyle_noise || 3} / 5</span></span>
                        </div>

                        {peer.bio && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">
                            "{peer.bio}"
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 mt-4 flex items-center justify-between gap-2 bg-transparent">
                        <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                          {peer.email}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-10 px-3 rounded-lg text-xs font-bold border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <a href={`mailto:${peer.email}?subject=CampusConnect Roommate Matching&body=Hi ${peer.full_name || 'there'},\n\nI noticed we have a high roommate compatibility index score on the CampusConnect Housing Hub. I would love to connect and discuss off-campus accommodation options!`}>
                            <Heart className="h-3.5 w-3.5 fill-current shrink-0 animate-pulse" />
                            <span>Outreach</span>
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateListingForm onClose={() => setShowCreate(false)} onCreated={fetchListings} />}
    </div>
  );
}
