import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Car, Image as ImageIcon, Upload, CheckCircle2, ShieldCheck, MapPin, DollarSign, RefreshCw } from 'lucide-react';
import { Property, Vehicle, Hotel, Restaurant, Library } from '../types';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: Property | Vehicle | Hotel | Restaurant | Library | null;
  itemType: 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library';
  onSaveProperty?: (updated: Property) => void;
  onSaveVehicle?: (updated: Vehicle) => void;
  onSaveHotel?: (updated: Hotel) => void;
  onSaveRestaurant?: (updated: Restaurant) => void;
  onSaveLibrary?: (updated: Library) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  itemType,
  onSaveProperty,
  onSaveVehicle,
  onSaveHotel,
  onSaveRestaurant,
  onSaveLibrary
}) => {
  const [title, setTitle] = useState('');
  const [priceOrRent, setPriceOrRent] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [locationScreenshot, setLocationScreenshot] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [furnishing, setFurnishing] = useState<string>('Furnished');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setCity(itemToEdit.city || '');
      setLocation(itemToEdit.location || '');
      setDescription(itemToEdit.description || '');
      setImageUrl(itemToEdit.images?.[0] || '');
      setIsAvailable(itemToEdit.isAvailable !== false);

      if (itemType === 'property') {
        const prop = itemToEdit as Property;
        setPriceOrRent(prop.rentPerMonth || 0);
        setDeposit(prop.deposit || 0);
        setOwnerContact(prop.ownerContact || '');
        setFurnishing(prop.furnishing || 'Furnished');
        setBedrooms(prop.bedrooms || 2);
        setFullAddress(prop.fullAddress || '');
        setMapLink(prop.mapLink || '');
        setLocationScreenshot(prop.locationScreenshot || '');
      } else if (itemType === 'vehicle') {
        const veh = itemToEdit as Vehicle;
        setPriceOrRent(veh.rentPerDay || 0);
        setDeposit(veh.deposit || 0);
        setOwnerContact(veh.ownerContact || '');
      } else if (itemType === 'hotel') {
        const hot = itemToEdit as Hotel;
        setPriceOrRent(hot.rooms?.[0]?.pricePerNight || 2500);
        setOwnerContact(hot.ownerContact || '');
      } else if (itemType === 'restaurant') {
        const rest = itemToEdit as Restaurant;
        setPriceOrRent(rest.averageCostForTwo || 600);
      } else if (itemType === 'library') {
        const lib = itemToEdit as Library;
        setPriceOrRent(lib.dailyPassPrice || 100);
      }
    }
  }, [itemToEdit, itemType]);

  if (!isOpen || !itemToEdit) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (itemType === 'property' && onSaveProperty) {
      const orig = itemToEdit as Property;
      const updated: Property = {
        ...orig,
        title,
        rentPerMonth: priceOrRent,
        deposit,
        city,
        location,
        description,
        ownerContact: ownerContact || orig.ownerContact,
        images: imageUrl ? [imageUrl, ...(orig.images?.slice(1) || [])] : orig.images,
        isAvailable,
        furnishing: furnishing as any,
        bedrooms,
        fullAddress: fullAddress || orig.fullAddress,
        mapLink: mapLink || orig.mapLink,
        locationScreenshot: locationScreenshot || orig.locationScreenshot
      };
      onSaveProperty(updated);
    } else if (itemType === 'vehicle' && onSaveVehicle) {
      const orig = itemToEdit as Vehicle;
      const updated: Vehicle = {
        ...orig,
        title,
        rentPerDay: priceOrRent,
        deposit,
        city,
        location,
        ownerContact: ownerContact || orig.ownerContact,
        images: imageUrl ? [imageUrl, ...(orig.images?.slice(1) || [])] : orig.images,
        isAvailable
      };
      onSaveVehicle(updated);
    } else if (itemType === 'hotel' && onSaveHotel) {
      const orig = itemToEdit as Hotel;
      const updated: Hotel = {
        ...orig,
        title,
        city,
        location,
        description,
        ownerContact: ownerContact || orig.ownerContact,
        images: imageUrl ? [imageUrl, ...(orig.images?.slice(1) || [])] : orig.images,
        isAvailable
      };
      onSaveHotel(updated);
    } else if (itemType === 'restaurant' && onSaveRestaurant) {
      const orig = itemToEdit as Restaurant;
      const updated: Restaurant = {
        ...orig,
        title,
        city,
        location,
        description,
        averageCostForTwo: priceOrRent,
        images: imageUrl ? [imageUrl, ...(orig.images?.slice(1) || [])] : orig.images,
        isAvailable
      };
      onSaveRestaurant(updated);
    } else if (itemType === 'library' && onSaveLibrary) {
      const orig = itemToEdit as Library;
      const updated: Library = {
        ...orig,
        title,
        city,
        location,
        description,
        dailyPassPrice: priceOrRent,
        images: imageUrl ? [imageUrl, ...(orig.images?.slice(1) || [])] : orig.images,
        isAvailable
      };
      onSaveLibrary(updated);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-zinc-800 to-slate-900 text-white p-5 sm:p-6 relative shrink-0 border-b border-zinc-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                <span>Update Web Listing</span>
                <span className="bg-zinc-800 text-white/30 text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-400/30 uppercase">
                  {itemType}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Edit details directly on the web app. All updates sync to Firebase in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Listing updated successfully on Web & synced to Firebase Firestore!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {itemType === 'vehicle' ? 'Rent per Day (₹)' : itemType === 'property' ? 'Monthly Rent (₹)' : 'Price / Avg Cost (₹)'}
              </label>
              <input
                type="number"
                required
                value={priceOrRent}
                onChange={(e) => setPriceOrRent(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
              />
            </div>

            {(itemType === 'property' || itemType === 'vehicle') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Locality</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
              />
            </div>
          </div>

          {/* Exact Location & Map Link Upload Section */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl space-y-2.5 text-xs">
            <span className="font-extrabold text-emerald-900 flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-emerald-700" />
              <span>Exact Property Map Location & Google Maps Link</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Address / Door No.</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 201, Rose Valley Colony"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Maps Link</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/?q=..."
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Upload Map Screenshot / Proof</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 cursor-pointer">
                  <Upload className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Choose Map Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setLocationScreenshot(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {locationScreenshot && (
                  <img src={locationScreenshot} alt="Map Screenshot" className="h-10 w-16 object-cover rounded border border-emerald-400" />
                )}
              </div>
            </div>
          </div>

          {itemType === 'property' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
                >
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms / BHK</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Phone Number</label>
            <input
              type="text"
              value={ownerContact}
              onChange={(e) => setOwnerContact(e.target.value)}
              placeholder="+91 98765 00000"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Listing Image URL / File Upload</label>
            <div className="space-y-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none"
              />
              <div className="flex items-center space-x-2">
                <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 text-zinc-900" />
                  <span>Upload Image File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {imageUrl && (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Image Loaded</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Availability Status</p>
              <p className="text-[11px] text-slate-500">Is this listing currently active and open for booking?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isAvailable ? 'Available' : 'Rented / Inactive'}
            </button>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-zinc-800 to-zinc-800 hover:from-zinc-800 hover:to-zinc-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-zinc-800/30 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes & Sync Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
