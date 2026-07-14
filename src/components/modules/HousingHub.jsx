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
  SlidersHorizontal, X, Phone, MessageCircle, Wifi, Car, LifeBuoy
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg animate-fade-in border border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Home className="h-5 w-5 text-cyan-400" />
              List Your Property
            </h2>
            <p className="text-xs text-slate-400 mt-1">Publish local housing options for campus peers</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Listing Title</label>
            <Input
              id="housing-title"
              placeholder="e.g., Cosy 2-Bedroom near North Campus Library"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Detailed Description</label>
            <Textarea
              id="housing-desc"
              placeholder="Describe rent terms, roommates details, distances to campus, utilities, etc..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800 min-h-[100px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Address / Location</label>
            <Input
              id="housing-address"
              placeholder="e.g., 402 University Ave, Apt B"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              className="bg-slate-950/50 border-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rent ($/mo)</label>
              <Input
                id="housing-rent"
                type="number"
                min="0"
                placeholder="800"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
                required
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bedrooms</label>
              <Input
                id="housing-beds"
                type="number"
                min="0"
                max="10"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bathrooms</label>
              <Input
                id="housing-baths"
                type="number"
                min="0"
                max="10"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Amenities Included</label>
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
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:border-slate-700'
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
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <Input
                id="housing-phone"
                placeholder="e.g., +15550199"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
              <Input
                id="housing-wa"
                placeholder="e.g., +15550199"
                value={form.contact_whatsapp}
                onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })}
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl mt-4"
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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-cyan-400">
              <Home className="h-6 w-6" />
            </div>
            Housing Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Co-lease apartments and find student housing matching your campus budget.
          </p>
        </div>
        
        {/* List Property Trigger - min target 44px height */}
        <Button
          variant="gradient"
          onClick={() => setShowCreate(true)}
          id="housing-create-btn"
          className="h-11 px-5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center select-none shadow-md shadow-cyan-500/10"
        >
          <Plus className="h-5 w-5" /> List Your Place
        </Button>
      </div>

      {/* Sticky Filters Block */}
      <div className="sticky top-[57px] lg:top-0 z-20 glass rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <Input
              id="housing-search"
              placeholder="Search listings by title, keywords or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-slate-950/60 border-slate-800/80 focus:border-cyan-500/85"
            />
          </div>
          
          {/* Filters Toggle Button - min target 44x44px */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            id="housing-filters-toggle"
            className="h-11 px-4 rounded-xl font-semibold border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters</span>
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-850 animate-fade-in">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-400" />
              <Input
                id="housing-budget-min"
                type="number"
                placeholder="Min Rent"
                className="w-28 h-10 bg-slate-950/60 border-slate-850"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
              <span className="text-slate-500">—</span>
              <Input
                id="housing-budget-max"
                type="number"
                placeholder="Max Rent"
                className="w-28 h-10 bg-slate-950/60 border-slate-850"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-cyan-400" />
              <select
                id="housing-bedroom-filter"
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/60"
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
              className="text-xs font-bold text-slate-400 hover:text-slate-200 h-10 px-3 hover:bg-slate-800/40 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Property Cards Layout Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-72 shimmer-bg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-slate-800/60">
          <Home className="h-14 w-14 text-slate-500 mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-slate-300">No Listings Listed</h3>
          <p className="text-slate-400 text-xs mt-1">Adjust filters or create your own housing offering.</p>
          <Button variant="outline" className="mt-5 border-slate-800 hover:border-slate-700 h-10 px-4 rounded-xl text-xs font-bold" onClick={() => setShowCreate(true)}>
            Publish First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <Card key={listing.id} className="group glass-card flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
                      {listing.title}
                    </CardTitle>
                    <div className="font-mono text-lg font-bold tracking-tight text-cyan-400 shrink-0">
                      ${listing.rent}<span className="text-[10px] text-slate-400 font-normal font-sans">/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400/80 shrink-0" />
                    <span className="truncate">{listing.address}</span>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-2 space-y-4">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {listing.description}
                  </p>
                  
                  {/* Bed & Bath Details */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                    <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-cyan-400/80" /> {listing.bedrooms} Beds</span>
                    <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-cyan-400/80" /> {listing.bathrooms} Baths</span>
                  </div>

                  {/* Amenities Tags */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {listing.amenities.slice(0, 3).map((a) => (
                        <Badge key={a} variant="secondary" className="bg-slate-900 border border-slate-800 text-[10px] py-0.5 px-2 rounded-lg font-medium text-slate-400">
                          {a}
                        </Badge>
                      ))}
                      {listing.amenities.length > 3 && (
                        <Badge variant="secondary" className="bg-slate-900 border border-slate-800 text-[10px] py-0.5 px-2 rounded-lg font-medium text-slate-400">
                          +{listing.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="p-5 pt-3 border-t border-slate-900 flex items-center justify-between gap-3 bg-slate-900/20">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Listed by</span>
                  <span className="text-xs font-semibold text-slate-300 truncate block">
                    {listing.profiles?.full_name || 'Campus Member'}
                  </span>
                </div>
                
                {/* Responsive Dual Action CTAs - min height 44px */}
                <div className="flex gap-2 shrink-0">
                  {listing.contact_phone && (
                    <a
                      href={`tel:${listing.contact_phone}`}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 duration-150"
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
                      className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-550/20 text-xs font-bold transition-all active:scale-95 duration-150"
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
