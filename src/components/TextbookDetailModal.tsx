import React, { useState } from 'react';
import { TextbookItem, formatPrice } from '../types';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Banknote,
  MessageCircle,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Share2,
  Camera,
  Building,
} from 'lucide-react';

interface TextbookDetailModalProps {
  book: TextbookItem;
  onClose: () => void;
  onInitiateCheckout: (book: TextbookItem, mode: 'buy' | 'rent', days?: number) => void;
  onOpenChat: (book: TextbookItem) => void;
  onToggleStatusSim?: (bookId: string) => void;
}

export const TextbookDetailModal: React.FC<TextbookDetailModalProps> = ({
  book,
  onClose,
  onInitiateCheckout,
  onOpenChat,
  onToggleStatusSim,
}) => {
  const defaultMode = book.isForRent ? 'rent' : 'buy';
  const [selectedMode, setSelectedMode] = useState<'rent' | 'buy'>(defaultMode);
  const [rentalDays, setRentalDays] = useState<number>(7);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAvailable = book.status === 'available';
  const dailyRate = book.rentDailyRate || 2;
  const rentalSubtotal = dailyRate * rentalDays;
  const deposit = book.securityDeposit || 15;
  const rentTotal = rentalSubtotal + deposit;
  const buyTotal = book.buyPrice || 35;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Course: <strong className="text-slate-900">{book.courseCode}</strong></span>
            <span>·</span>
            <span>Faculty: <strong className="text-slate-900">{book.college}</strong></span>
            <span>·</span>
            <span>ISBN: {book.isbn}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Share listing link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Visuals & Textbook Info */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            
            {/* Real Student Photo Showcase */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Photo Location Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-xs text-white p-2.5 rounded-lg text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate font-sans font-medium text-[11px]">{book.photoLocationTag}</span>
                </div>
                <span className="shrink-0 text-[10px] text-blue-200 font-mono bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
                  Real Student Camera
                </span>
              </div>
            </div>

            {/* Live Availability Status Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                isAvailable
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAvailable ? 'bg-blue-600 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold">
                    {isAvailable ? 'Status: Available for Handover Now' : 'Status: Currently Reserved or On Hire'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAvailable
                      ? 'Owner is on campus and ready for safe exchange.'
                      : book.rentDueDate
                      ? `Expected handover return: ${book.rentDueDate}`
                      : 'Check back soon or message owner for upcoming slot.'}
                  </div>
                </div>
              </div>

              {/* Real-time Toggle for testing */}
              {onToggleStatusSim && (
                <button
                  type="button"
                  onClick={() => onToggleStatusSim(book.id)}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  title="Simulate peer booking / availability changes in real-time"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                  <span>Toggle Live</span>
                </button>
              )}
            </div>

            {/* Book Metadata & Condition Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                  {book.courseCode}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {book.condition}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{book.edition}</span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-slate-900 leading-snug">
                {book.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                By {book.authors}
              </p>

              <div className="pt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="block text-slate-800 font-semibold mb-1">Student Condition Notes:</strong>
                {book.description}
              </div>
            </div>

            {/* Verified Student Seller Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={book.owner.avatar}
                      alt={book.owner.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center"
                      title="Verified Student ID"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{book.owner.name}</span>
                      <span className="text-[10px] text-blue-700 font-mono bg-blue-100 px-1.5 py-0.2 rounded">
                        Verified Student
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {book.owner.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    ★ {book.owner.rating}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {book.owner.dealsCompleted} campus handovers
                  </div>
                </div>
              </div>

              {/* Response Time and Meetup Spots */}
              <div className="pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{book.owner.responseTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate" title={book.preferredMeetupSpots.join(', ')}>
                    {book.preferredMeetupSpots[0]}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing & Purchase Module */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/50 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Acquisition Mode
                </h3>

                {/* Segmented Control */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-xl">
                  {book.isForRent && (
                    <button
                      type="button"
                      onClick={() => setSelectedMode('rent')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                        selectedMode === 'rent'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Rent Per Day
                    </button>
                  )}
                  {book.isForSale && (
                    <button
                      type="button"
                      onClick={() => setSelectedMode('buy')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                        selectedMode === 'buy'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Buy Outright
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Mode Calculator in Standard Price */}
              {selectedMode === 'rent' && book.isForRent && (
                <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Daily Rental Rate</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {formatPrice(dailyRate)} / day
                    </span>
                  </div>

                  {/* Rental Days Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="rental-slider" className="font-medium text-slate-700">
                        Duration: <strong className="text-blue-900 font-mono">{rentalDays} Days</strong>
                      </label>
                      <span className="text-slate-400 font-mono">Max: 30 days</span>
                    </div>
                    <input
                      id="rental-slider"
                      type="range"
                      min="1"
                      max="30"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>1 day (Test)</span>
                      <span>7 days (1 wk)</span>
                      <span>14 days</span>
                      <span>30 days (Exam)</span>
                    </div>
                  </div>

                  {/* Itemized Calculation */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Rental Fee ({formatPrice(dailyRate)} × {rentalDays}d)</span>
                      <span className="font-mono tabular-nums">{formatPrice(rentalSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        Refundable Security Deposit
                        <span title="Returned immediately when book is handed back in verified condition">
                          <Info className="w-3 h-3 text-slate-400" />
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">{formatPrice(deposit)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-950 pt-2 border-t border-slate-100 text-sm">
                      <span>Total Due at Handover</span>
                      <span className="font-mono tabular-nums text-blue-700">{formatPrice(rentTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedMode === 'buy' && book.isForSale && (
                <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Outright Second-Hand Price</span>
                    <span className="font-mono text-2xl font-bold text-blue-900 tabular-nums">
                      {formatPrice(buyTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Keep for your studies or re-list next semester on Etude World Books to recover your cost.
                  </p>
                </div>
              )}

              {/* Supported Payment Methods */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Accepted Payment Options</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900">In-App Escrow Protection</span>
                      <p className="text-[10px] text-slate-500">Held safely until PIN verified at meetup</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900">Cash on Delivery</span>
                      <p className="text-[10px] text-slate-500">Direct cash handover at campus safe zone</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Contiguous Primary CTAs */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              {isAvailable ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInitiateCheckout(book, selectedMode, selectedMode === 'rent' ? rentalDays : undefined);
                  }}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Proceed to {selectedMode === 'rent' ? 'Rent Booking' : 'Purchase'} ·{' '}
                    {formatPrice(selectedMode === 'rent' ? rentTotal : buyTotal)}
                  </span>
                </button>
              ) : (
                <div className="w-full py-3.5 px-4 bg-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider rounded-xl text-center border border-slate-200 cursor-not-allowed">
                  Book Currently Reserved / Rented
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(book);
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Chat with Owner (Make Offer / Ask Condition)</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
