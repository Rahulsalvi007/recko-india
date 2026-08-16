import React, { useState } from 'react';
import { X, User, GraduationCap, MapPin, DollarSign, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RoommateProfile } from '../types';

interface PostRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoommate: (newProfile: RoommateProfile) => void;
  selectedCity?: string;
}

export const PostRoommateModal: React.FC<PostRoommateModalProps> = ({
  isOpen,
  onClose,
  onAddRoommate,
  selectedCity = 'Bengaluru'
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [budget, setBudget] = useState(12000);
  const [preferredLoc, setPreferredLoc] = useState('');
  const [distanceKm, setDistanceKm] = useState(1.0);
  const [diet, setDiet] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian'>('Vegetarian');
  const [sleepSchedule, setSleepSchedule] = useState<'Early Riser' | 'Night Owl' | 'Flexible'>('Night Owl');
  const [bio, setBio] = useState('');
  const [lookingFor, setLookingFor] = useState('1 Roommate in 2 BHK');
  const [hobbiesStr, setHobbiesStr] = useState('Gaming, Coding, Music');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !college) return;

    const hobbies = hobbiesStr
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const newProfile: RoommateProfile = {
      id: `rm-${Date.now()}`,
      name,
      age: Number(age),
      gender,
      college,
      course: course || 'B.Tech / Degree',
      year: year || 'Final Year',
      budgetPerMonth: Number(budget),
      preferredLocation: preferredLoc || `${selectedCity} Central`,
      city: selectedCity,
      distanceKm: Number(distanceKm),
      diet,
      sleepSchedule,
      smoking: false,
      petsAllowed: true,
      bio: bio || 'Friendly and hygienic student/professional looking for a flatmate.',
      studentVerified: true,
      avatar: gender === 'Female'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      lookingFor,
      hobbies: hobbies.length > 0 ? hobbies : ['Music', 'Study', 'Fitness'],
      phone: phone || '+91 98765 00000',
      moveInDate: 'Immediate',
      occupation: 'Student'
    };

    onAddRoommate(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
          <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between border-b border-indigo-700">
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center space-x-1 mb-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>VERIFIED STUDENT PROFILE</span>
              </span>
              <h3 className="text-lg font-black text-white">Post Roommate Requirement</h3>
              <p className="text-xs text-indigo-200">Find nearby verified flatmates & shared accommodation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. DU North Campus / RVCE"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Course & Year</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech CS (3rd Year)"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Max Monthly Budget (₹) *</label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Target Location / Area *</label>
                <input
                  type="text"
                  required
                  value={preferredLoc}
                  onChange={(e) => setPreferredLoc(e.target.value)}
                  placeholder="e.g. Koramangala / HSR Layout"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Diet Preference</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Nearby Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Bio / Lifestyle Preferences</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential roommates about your study habits, cleanliness, and flatmate expectations..."
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Post Roommate Profile to Nearby Radar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};
