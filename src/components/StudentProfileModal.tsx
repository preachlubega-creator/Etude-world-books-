import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  BookOpen,
  DollarSign,
  Award,
  CheckCircle2,
  Calendar,
  CreditCard,
  Edit3,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onUpdateProfile?: (updated: StudentProfile) => void;
  onGoToListings?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateProfile,
  onGoToListings,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'payouts' | 'edit'>('overview');
  
  // Editable form state
  const [name, setName] = useState(student.name);
  const [major, setMajor] = useState(student.major);
  const [gradYear, setGradYear] = useState(student.gradYear);
  const [hallOfResidence, setHallOfResidence] = useState(student.hallOfResidence);
  const [avatar, setAvatar] = useState(student.avatar);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        ...student,
        name,
        major,
        gradYear,
        hallOfResidence,
        avatar,
      });
    }
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Bar - Professional Blue Gradient */}
        <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 relative p-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Verified Student Account
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0">
          
          {/* Avatar & Key Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-22 h-22 rounded-2xl bg-white p-1 ring-4 ring-white shadow-lg overflow-hidden">
                  <img
                    src={avatar || student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover object-top rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full ring-2 ring-white flex items-center justify-center shadow-xs"
                  title="Verified Student ID"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {student.name}
                  </h2>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Student Peer
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {student.major} · Class of {student.gradYear}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  {student.hallOfResidence} · Campus Network
                </p>
              </div>
            </div>

            {/* Quick Status / Rating Pill */}
            <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-3.5 py-2">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-amber-500 font-bold text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{student.rating}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {student.reviewCount} peer reviews
                </div>
              </div>
              <div className="h-6 w-px bg-blue-200" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  {student.dealsCompleted}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Handovers
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1 text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Active Listings</span>
              </div>
              <div className="text-lg font-bold text-slate-900">3 Books</div>
              <div className="text-[10px] text-slate-500">2 for rent · 1 for sale</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Response Time</span>
              </div>
              <div className="text-lg font-bold text-slate-900">~5 mins</div>
              <div className="text-[10px] text-slate-500">Very fast replies</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Return Rate</span>
              </div>
              <div className="text-lg font-bold text-slate-900">100%</div>
              <div className="text-[10px] text-slate-500">Zero disputes recorded</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1 text-xs font-medium">
                <Award className="w-3.5 h-3.5" />
                <span>Semester Saved</span>
              </div>
              <div className="text-lg font-bold text-slate-900">$340</div>
              <div className="text-[10px] text-slate-500">Peer exchange value</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview & Activity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`pb-2.5 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'verification'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Campus Verification
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payouts')}
              className={`pb-2.5 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'payouts'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Payment & Escrow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`pb-2.5 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'edit'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Edit Details
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Etude World Books Community Reputation
                  </h3>
                  <span className="text-[11px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    Trusted Seller & Renter
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Alex has completed 24 safe exchanges on campus with verified students. All rentals were handed back in verified condition on or before the due dates.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onGoToListings) onGoToListings();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manage My Listed Textbooks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile Info</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPUS VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                    Institutional Student Email Verified
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div className="text-xs text-emerald-800 mt-0.5 font-mono">
                    {student.email}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Confirms enrollment and authorizes peer escrow and deposit transactions on campus.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Physical Student ID Card Verified
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Badge and photo identification cross-checked for peer-to-peer campus meetups and handover safety.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    SMS Handover Confirmation Alerts
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Real-time PIN transmission sent whenever a book is ready for exchange at designated campus safe zones.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT & ESCROW */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">In-App Escrow Balance</div>
                    <div className="text-[11px] text-slate-500">Protected funds released upon handover PIN confirmation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-700">$84.50</div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Ready for withdrawal
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Payout of $84.50 initiated to your linked campus account.')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Withdraw to Bank / Mobile Account
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Payout History
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-900">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Accepted Payment Preferences
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span>In-App Escrow (Card / Mobile Wallet)</span>
                    <span className="text-emerald-700 font-semibold text-[11px]">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span>Cash on Delivery (Meetup in Campus Safe Zone)</span>
                    <span className="text-emerald-700 font-semibold text-[11px]">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDIT DETAILS */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {isSavedNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Profile updated successfully!
                </div>
              )}

              {/* Profile Photo Uploader */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                  <img
                    src={avatar || student.avatar}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Profile Photo
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Upload your student profile picture
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 cursor-pointer transition-colors shadow-2xs">
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Residence / Dorm / Study Hub
                </label>
                <input
                  type="text"
                  value={hallOfResidence}
                  onChange={(e) => setHallOfResidence(e.target.value)}
                  placeholder="e.g. North Hall, West Quad, or Main Library"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
