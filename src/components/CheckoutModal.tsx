import React, { useState } from 'react';
import { TextbookItem, StudentProfile, PaymentMethod, OrderRecord, formatPrice } from '../types';
import { CAMPUS_SAFE_SPOTS } from '../data/mockData';
import {
  X,
  CreditCard,
  Banknote,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Truck,
  Building,
  Smartphone,
} from 'lucide-react';

interface CheckoutModalProps {
  book: TextbookItem;
  currentUser: StudentProfile;
  initialMode: 'buy' | 'rent';
  rentalDays?: number;
  customPrice?: number;
  onClose: () => void;
  onCompleteOrder: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  book,
  currentUser,
  initialMode,
  rentalDays = 7,
  customPrice,
  onClose,
  onCompleteOrder,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('in_app_escrow');
  const [meetupType, setMeetupType] = useState<'safe_zone' | 'delivery'>('safe_zone');
  const [selectedSpot, setSelectedSpot] = useState(
    book.preferredMeetupSpots[0] || `${CAMPUS_SAFE_SPOTS[0].name} (${CAMPUS_SAFE_SPOTS[0].zone})`
  );
  const [deliveryAddress, setDeliveryAddress] = useState('North Quad Hall (Front Desk Reception)');
  const [deliveryNotes, setDeliveryNotes] = useState('Wait by main entrance security foyer. Call my mobile line when outside.');
  const [meetupTime, setMeetupTime] = useState('Today at 4:00 PM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Price calculations
  const isRent = initialMode === 'rent';
  const dailyRate = book.rentDailyRate || 2;
  const deposit = isRent ? (book.securityDeposit || 15) : 0;
  
  let itemSubtotal: number;
  if (customPrice) {
    itemSubtotal = customPrice;
  } else if (isRent) {
    itemSubtotal = dailyRate * rentalDays;
  } else {
    itemSubtotal = book.buyPrice || 35;
  }

  const campusEscrowFee = 1; // Small protection fee for escrow
  const totalAmount = itemSubtotal + deposit + (selectedMethod === 'in_app_escrow' ? campusEscrowFee : 0);

  const handleConfirmOrder = () => {
    setIsProcessing(true);

    const finalLocation = meetupType === 'delivery'
      ? `Delivery to ${deliveryAddress}`
      : selectedSpot;

    setTimeout(() => {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const order: OrderRecord = {
        id: `ord-${Date.now()}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverImage,
        type: initialMode,
        rentalDays: isRent ? rentalDays : undefined,
        totalAmount,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'in_app_escrow' ? 'held_in_escrow' : 'cod_pending',
        buyerName: currentUser.name,
        sellerName: book.owner.name,
        meetupSpot: finalLocation,
        meetupDateTime: meetupTime,
        handoverPin: generatedPin,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCompleted: false,
      };

      setCompletedOrder(order);
      setIsProcessing(false);
      onCompleteOrder(order);
    }, 800);
  };

  const copyPin = () => {
    if (completedOrder) {
      navigator.clipboard?.writeText(completedOrder.handoverPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span className="font-serif text-base font-bold text-slate-950">
              {completedOrder ? 'Handover Agreed · Campus Exchange' : 'Complete Peer Textbook Booking'}
            </span>
          </div>
          {!completedOrder && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* COMPLETED ORDER STATE */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Textbook Reserved for Handover!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time textbook status updated across campus to{' '}
                <strong className="text-blue-900 font-mono">
                  {completedOrder.type === 'rent' ? 'Currently Rented' : 'Reserved for Meetup'}
                </strong>
                .
              </p>
            </div>

            {/* Handover PIN Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 max-w-sm mx-auto shadow-md">
              <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block">
                Your Handover Verification PIN
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold tracking-widest text-blue-400">
                  {completedOrder.handoverPin}
                </span>
                <button
                  type="button"
                  onClick={copyPin}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPin ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {selectedMethod === 'in_app_escrow'
                  ? 'Give this PIN to the seller in person at the meetup hub after inspecting the textbook to release funds from escrow.'
                  : 'Show this verification PIN during in-person handover at the meetup spot.'}
              </p>
            </div>

            {/* Meetup Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Book</span>
                <span className="font-semibold text-slate-900">{completedOrder.bookTitle}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Peer Student</span>
                <span className="font-medium text-slate-900">{completedOrder.sellerName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Exchange Spot</span>
                <span className="font-medium text-blue-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {completedOrder.meetupSpot}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500">Agreed Time</span>
                <span className="font-mono text-slate-900">{completedOrder.meetupDateTime}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm text-slate-950 pt-1">
                <span>Total Amount {selectedMethod === 'in_app_escrow' ? '(Protected Escrow)' : '(Cash on Handover)'}</span>
                <span className="font-mono text-blue-700">{formatPrice(completedOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Done & Return to Marketplace
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Textbook mini summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={book.coverImage}
                alt=""
                className="w-12 h-16 object-cover rounded shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 text-sm block line-clamp-1">
                  {book.title}
                </span>
                <span className="text-slate-500">
                  {book.courseCode} · Owner: <strong>{book.owner.name}</strong> ({book.owner.hallOfResidence || 'Campus'})
                </span>
                <span className="text-blue-700 block font-medium mt-0.5">
                  {isRent ? `Rental: ${rentalDays} Days Duration` : 'Permanent Second-Hand Purchase'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Select Payment Method
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Method 1: In-App Escrow */}
                <div
                  onClick={() => setSelectedMethod('in_app_escrow')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    selectedMethod === 'in_app_escrow'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedMethod === 'in_app_escrow'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedMethod === 'in_app_escrow' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        In-App Escrow Protection (Card / Student Wallet)
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Your funds are held securely by Etude World Books. The seller gets paid only when you inspect the textbook in person and release your Handover PIN.
                    </p>
                  </div>
                </div>

                {/* Method 2: Cash on Delivery */}
                <div
                  onClick={() => setSelectedMethod('cash_on_delivery')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    selectedMethod === 'cash_on_delivery'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedMethod === 'cash_on_delivery'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedMethod === 'cash_on_delivery' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        Cash on Handover (In-Person Safe Zone)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Pay cash directly to the seller when you meet up at one of the verified campus safe spots.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meetup Handover Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Exchange & Delivery Arrangement
              </label>

              {/* Segmented Handover Mode */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMeetupType('safe_zone')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    meetupType === 'safe_zone'
                      ? 'bg-white text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Campus Safe Zone (Recommended)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeetupType('delivery')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    meetupType === 'delivery'
                      ? 'bg-white text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Campus Delivery / Dorm Lobby</span>
                </button>
              </div>

              {/* Option A: Campus Safe Zones */}
              {meetupType === 'safe_zone' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500">
                    Choose from verified safe hubs with CCTV surveillance, staff presence, and lighting:
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {CAMPUS_SAFE_SPOTS.map((spot) => {
                      const spotLabel = `${spot.name} (${spot.zone})`;
                      const isSelected = selectedSpot === spotLabel;
                      return (
                        <div
                          key={spot.id}
                          onClick={() => setSelectedSpot(spotLabel)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                              {spot.name}
                            </span>
                            {spot.recommended && (
                              <span className="text-[10px] text-blue-700 font-mono bg-blue-100 px-1.5 py-0.2 rounded">
                                Monitored Safe Hub
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {spot.zone} · {spot.hours}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option B: Campus Delivery */}
              {meetupType === 'delivery' && (
                <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Campus Hall / Dorm Reception Location
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. North Quad Hall, Room 14 Lobby Reception"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Delivery & Contact Notes
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Please ring mobile when arriving at the reception desk"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Target Meetup Time */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Proposed Meetup Time
                </label>
                <div className="flex gap-2">
                  {['Today at 4:00 PM', 'Today at 5:30 PM', 'Tomorrow 10:00 AM', 'Tomorrow 2:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMeetupTime(t)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        meetupTime === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown in USD / Standard */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>
                  {isRent ? `Rental Fee (${formatPrice(dailyRate)} × ${rentalDays}d)` : 'Textbook Purchase'}
                </span>
                <span className="font-mono">{formatPrice(itemSubtotal)}</span>
              </div>
              {isRent && deposit > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit</span>
                  <span className="font-mono">{formatPrice(deposit)}</span>
                </div>
              )}
              {selectedMethod === 'in_app_escrow' && (
                <div className="flex justify-between text-slate-600">
                  <span>Campus Escrow Protection Fee</span>
                  <span className="font-mono">{formatPrice(campusEscrowFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="font-mono text-blue-700">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmOrder}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Generating Handover PIN & Reserving...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Handover & Lock Availability · {formatPrice(totalAmount)}</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
