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
  SlidersHorizontal, X, Phone, MessageCircle
} from 'lucide-react';

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Laundry', 'Gym', 'Pool', 'AC', 'Furnished', 'Pet-Friendly'];

function CreateListingForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', address: '', rent: '', bedrooms: '1',
    bathrooms: '1', amenities: [], contact_phone: '', contact_whatsapp: '',
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
      is_active: true,
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
              className="bg-secondary/40 border-border min-h-[100px] focus:border-primary"
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
                        ? 'bg-primary/20 text-primary border border-primary/40'
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
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  async function fetchListings() {
    setLoading(true);
    let query = supabase
      .from('listings_housing')
      .select('*, profiles(full_name, college)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error) setListings(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchListings(); }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.address.toLowerCase().includes(search.toLowerCase())) return false;
      if (budgetMin && l.rent < parseFloat(budgetMin)) return false;
      if (budgetMax && l.rent > parseFloat(budgetMax)) return false;
      if (bedroomFilter && l.bedrooms !== parseInt(bedroomFilter)) return false;
      return true;
    });
  }, [listings, search, budgetMin, budgetMax, bedroomFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-primary">
              <Home className="h-6 w-6" />
            </div>
            Housing Hub
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Co-lease apartments and find student housing matching your campus budget.
          </p>
        </div>
        
        {/* List Property Trigger - min target 44px height */}
        <Button
          variant="gradient"
          onClick={() => setShowCreate(true)}
          id="housing-create-btn"
          className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center select-none shadow-md shadow-cyan-500/10 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> List Your Place
        </Button>
      </div>

      {/* Sticky Search & Filters Deck */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-border space-y-4">
        {/* Expanded Filters snaps directly ABOVE the main search input when visible */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 pb-3 border-b border-border animate-fade-in items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <Input
                id="housing-budget-min"
                type="number"
                placeholder="Min Rent"
                className="w-28 h-10 bg-secondary/40 border-border"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
              <span className="text-muted-foreground text-xs font-semibold">—</span>
              <Input
                id="housing-budget-max"
                type="number"
                placeholder="Max Rent"
                className="w-28 h-10 bg-secondary/40 border-border"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              <select
                id="housing-bedroom-filter"
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-secondary/40 px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Any Beds</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setBudgetMin(''); setBudgetMax(''); setBedroomFilter(''); }}
              className="text-xs font-bold text-muted-foreground hover:text-foreground h-10 px-3 hover:bg-secondary/60 rounded-xl cursor-pointer"
            >
              Reset Filters
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
              className="pl-11 h-11 bg-secondary/45 border-border focus:border-primary"
            />
          </div>
          
          {/* Filters Toggle Button - min target 44x44px */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            id="housing-filters-toggle"
            className="h-11 px-4 rounded-xl font-semibold border-border hover:border-primary/20 bg-secondary/20 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Property Cards Layout Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-72 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-border">
          <Home className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-foreground">No Listings Listed</h3>
          <p className="text-muted-foreground text-xs mt-1 font-medium">Adjust filters or create your own housing offering.</p>
          <Button variant="outline" className="mt-5 border-border hover:border-primary/20 h-10 px-4 rounded-xl text-xs font-bold cursor-pointer" onClick={() => setShowCreate(true)}>
            Publish First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((listing) => (
            <Card key={listing.id} className="group glass-card flex flex-col justify-between overflow-hidden p-6">
              <div>
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
                      {listing.title}
                    </CardTitle>
                    <div className="font-mono text-base font-bold tracking-tight text-primary shrink-0">
                      ${listing.rent}<span className="text-[10px] text-muted-foreground font-normal font-sans">/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-2">
                    <MapPin className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                    <span className="truncate">{listing.address}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 py-2 space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {listing.description}
                  </p>
                  
                  {/* Bed & Bath Details - Inline metrics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold bg-secondary/30 p-2.5 rounded-xl border border-border/50">
                    <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary" /> {listing.bedrooms} Beds</span>
                    <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary" /> {listing.bathrooms} Baths</span>
                  </div>

                  {/* Amenities Tags */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {listing.amenities.slice(0, 3).map((a) => (
                        <Badge key={a} variant="secondary" className="bg-secondary border border-border text-[10px] py-0.5 px-2 rounded-lg font-medium text-muted-foreground">
                          {a}
                        </Badge>
                      ))}
                      {listing.amenities.length > 3 && (
                        <Badge variant="secondary" className="bg-secondary border border-border text-[10px] py-0.5 px-2 rounded-lg font-medium text-muted-foreground">
                          +{listing.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="p-0 pt-4 mt-4 border-t border-border/50 flex items-center justify-between gap-3 bg-transparent">
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold">Listed by</span>
                  <span className="text-xs font-semibold text-foreground truncate block">
                    {listing.profiles?.full_name || 'Campus Member'}
                  </span>
                </div>
                
                {/* Responsive Dual Action CTAs - locked to bottom edge with min height 44px */}
                <div className="flex gap-2 shrink-0">
                  {listing.contact_phone && (
                    <a
                      href={`tel:${listing.contact_phone}`}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95 duration-150"
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
                      className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95 duration-150"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateListingForm onClose={() => setShowCreate(false)} onCreated={fetchListings} />}
    </div>
  );
}
