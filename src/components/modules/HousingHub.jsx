import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  Home, MapPin, DollarSign, BedDouble, Bath, Wifi, Car,
  Plus, Search, SlidersHorizontal, X, Phone, MessageCircle
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 pb-12 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-lg animate-fade-in my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">List Your Place</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="housing-title" placeholder="Listing title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea id="housing-desc" placeholder="Describe the place..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input id="housing-address" placeholder="Address / Location" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Rent ($/mo)</label>
              <Input id="housing-rent" type="number" min="0" placeholder="800" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Beds</label>
              <Input id="housing-beds" type="number" min="0" max="10" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Baths</label>
              <Input id="housing-baths" type="number" min="0" max="10" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    form.amenities.includes(a)
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="housing-phone" placeholder="Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            <Input id="housing-wa" placeholder="WhatsApp" value={form.contact_whatsapp} onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })} />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Listing'}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <Home className="h-6 w-6 text-blue-400" />
            </div>
            Housing Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Find your perfect place near campus</p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreate(true)} id="housing-create-btn">
          <Plus className="h-4 w-4" /> List Your Place
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="housing-search"
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} id="housing-filters-toggle">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input id="housing-budget-min" type="number" placeholder="Min" className="w-24" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              <span className="text-muted-foreground">—</span>
              <Input id="housing-budget-max" type="number" placeholder="Max" className="w-24" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-muted-foreground" />
              <select
                id="housing-bedroom-filter"
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground cursor-pointer"
              >
                <option value="">Any beds</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setBudgetMin(''); setBudgetMax(''); setBedroomFilter(''); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 h-64 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No listings found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>Be the first to list</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <Card key={listing.id} className="group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{listing.title}</CardTitle>
                  <Badge variant="success" className="shrink-0">
                    <DollarSign className="h-3 w-3 mr-0.5" />{listing.rent}/mo
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                  <MapPin className="h-3 w-3" /> {listing.address}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} Bed</span>
                  <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {listing.bathrooms} Bath</span>
                </div>
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {listing.amenities.slice(0, 4).map((a) => (
                      <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                    {listing.amenities.length > 4 && (
                      <Badge variant="secondary" className="text-[10px]">+{listing.amenities.length - 4}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-muted-foreground">
                  by {listing.profiles?.full_name || 'Campus member'}
                </span>
                <div className="flex gap-2">
                  {listing.contact_phone && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${listing.contact_phone}`}><Phone className="h-3.5 w-3.5" /></a>
                    </Button>
                  )}
                  {listing.contact_whatsapp && (
                    <Button variant="success" size="sm" asChild>
                      <a href={`https://wa.me/${listing.contact_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
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
