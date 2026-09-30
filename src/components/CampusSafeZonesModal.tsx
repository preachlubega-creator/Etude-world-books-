import React, { useState } from 'react';
import { CAMPUS_SAFE_SPOTS } from '../data/mockData';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Navigation,
  Calendar,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface CampusSafeZonesModalProps {
  isOpen: boolean;
  bookTitle?: string;
  sellerName?: string;
  defaultSpot?: string;
  onClose: () => void;
  onConfirmMeetupOrDelivery: (location: string, time: string, isDelivery: boolean, notes?: string) => void;
}

export const CampusSafeZonesModal: React.FC<CampusSafeZonesModalProps> = ({
  isOpen,
  bookTitle,
  sellerName,
  defaultSpot = CAMPUS_SAFE_SPOTS[0].name,
  onClose,
  onConfirmMeetupOrDelivery,
}) => {
  const [exchangeType, setExchangeType] = useState<'safe_zone' | 'delivery'>('safe_zone');
  const [selectedSafeSpot, setSelectedSafeSpot] = useState<string>(defaultSpot);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('North Quad Hall (Front Desk Reception Foyer)');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('Wait by the reception security foyer. Call my mobile when outside.');
  const [selectedTime, setSelectedTime] = useState<string>('Today at 3:30 PM');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const isDelivery = exchangeType === 'delivery';
    const finalLocation = isDelivery ? deliveryLocation.trim() || 'Campus Hall Reception Desk' : selectedSafeSpot;
    onConfirmMeetupOrDelivery(finalLocation, selectedTime, isDelivery, isDelivery ? deliveryInstructions : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-slate-950">
                Arrange Safe Campus Meetup or Hall Delivery
              </h2>
              <p className="text-xs text-slate-500">
                {bookTitle ? `Textbook: ${bookTitle}` : 'Agreed peer booking handover'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Agreement Notice Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Deal agreed with {sellerName || 'the student seller'}!</span>
              <p className="text-slate-600 mt-0.5">
                Now select where you will meet on campus to inspect and hand over the textbook safely.
              </p>
            </div>
          </div>

          {/* Handover Method Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1: Choose Handover Method
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setExchangeType('safe_zone')}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  exchangeType === 'safe_zone'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Monitored Campus Safe Zone</span>
              </button>
              <button
                type="button"
                onClick={() => setExchangeType('delivery')}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  exchangeType === 'delivery'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Dorm / Hall Lobby Handover</span>
              </button>
            </div>
          </div>

          {/* METHOD A: Campus Safe Spots Directory */}
          {exchangeType === 'safe_zone' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step 2: Select Designated Campus Safe Hub
                </label>
                <span className="text-[11px] text-blue-700 font-medium">
                  All locations CCTV monitored & staff attended
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {CAMPUS_SAFE_SPOTS.map((spot) => {
                  const isSelected = selectedSafeSpot === spot.name;
                  return (
                    <div
                      key={spot.id}
                      onClick={() => setSelectedSafeSpot(spot.name)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{spot.name}</span>
                            {spot.recommended && (
                              <span className="text-[10px] font-mono font-medium text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 font-medium">
                            {spot.zone}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{spot.hours}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        🛡️ <strong>Safety feature:</strong> {spot.securityFeature}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* METHOD B: Hall Delivery */}
          {exchangeType === 'delivery' && (
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Campus Residence or Building Reception
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. North Quad Hall, Ground Floor Security Desk"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  For safety, handovers should happen at public hall lobbies or front desks.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Special Notes for Seller / Courier
                </label>
                <textarea
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call my phone when at the gate. I will bring the cash/PIN."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Meetup Timing */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 3: Agreed Handover Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Today 3:30 PM', 'Today 5:00 PM', 'Tomorrow 10:00 AM', 'Tomorrow 1:00 PM'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    selectedTime === time
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Confirm Exchange Location & Send to Peer
          </button>
        </div>

      </div>
    </div>
  );
};
