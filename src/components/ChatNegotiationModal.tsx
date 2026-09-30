import React, { useState, useEffect, useRef } from 'react';
import { TextbookItem, StudentProfile, ChatMessage, formatPrice } from '../types';
import { CAMPUS_SAFE_SPOTS } from '../data/mockData';
import {
  X,
  Send,
  Tag,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ChatNegotiationModalProps {
  book: TextbookItem;
  currentUser: StudentProfile;
  onClose: () => void;
  onProceedToCheckout: (book: TextbookItem, agreedPrice: number, mode: 'buy' | 'rent') => void;
}

export const ChatNegotiationModal: React.FC<ChatNegotiationModalProps> = ({
  book,
  currentUser,
  onClose,
  onProceedToCheckout,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: book.owner.id,
      senderName: book.owner.name,
      text: `Hello ${currentUser.name}! Thanks for checking out "${book.title}". The textbook is in honest condition as shown in the snapshot. We can meet at the Main Library or Student Union for handover!`,
      timestamp: '10:14 AM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);
  const [showMeetupDrawer, setShowMeetupDrawer] = useState(false);

  // Offer fields
  const [offerType, setOfferType] = useState<'buy' | 'rent'>(book.isForSale ? 'buy' : 'rent');
  const [proposedPrice, setProposedPrice] = useState<string>(
    book.isForSale && book.buyPrice ? (Math.round(book.buyPrice * 0.85)).toString() : '25'
  );
  const [rentalDays, setRentalDays] = useState<number>(7);

  // Meetup fields
  const [meetupSpot, setMeetupSpot] = useState(
    book.preferredMeetupSpots[0] || `${CAMPUS_SAFE_SPOTS[0].name} (${CAMPUS_SAFE_SPOTS[0].zone})`
  );
  const [meetupTime, setMeetupTime] = useState('Today at 3:30 PM (Main Library Foyer)');

  // Agreed state
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [agreedMode, setAgreedMode] = useState<'buy' | 'rent'>('buy');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendTextMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const ownerReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: book.owner.id,
        senderName: book.owner.name,
        text: `Got your message! I'm around campus today near the Main Library and Student Union. Let me know if that time works for you.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, ownerReply]);
    }, 900);
  };

  const handleSendOffer = () => {
    const offerNum = parseInt(proposedPrice, 10);
    if (!offerNum || offerNum <= 0) return;

    const offerMsg: ChatMessage = {
      id: `offer-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `Proposed peer offer: ${formatPrice(offerNum)} for ${
        offerType === 'buy' ? 'Outright Purchase' : `${rentalDays} days rental`
      }.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOffer: true,
      offerDetails: {
        type: offerType,
        proposedPrice: offerNum,
        rentalDays: offerType === 'rent' ? rentalDays : undefined,
        status: 'pending',
      },
    };

    setMessages((prev) => [...prev, offerMsg]);
    setShowOfferDrawer(false);

    // Automated Owner Response simulation
    setTimeout(() => {
      const acceptMsg: ChatMessage = {
        id: `offer-accept-${Date.now()}`,
        senderId: book.owner.id,
        senderName: book.owner.name,
        text: `Offer of ${formatPrice(offerNum)} accepted! Let's arrange our safe meetup hub so we can do the handover.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, acceptMsg]);
      setAgreedPrice(offerNum);
      setAgreedMode(offerType);
    }, 1200);
  };

  const handleSendMeetupProposal = () => {
    const meetupMsg: ChatMessage = {
      id: `meetup-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `Proposed Campus Safe Meetup: ${meetupSpot} at ${meetupTime}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMeetupProposal: true,
      meetupDetails: {
        location: meetupSpot,
        dateTime: meetupTime,
        status: 'pending',
      },
    };

    setMessages((prev) => [...prev, meetupMsg]);
    setShowMeetupDrawer(false);

    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `meetup-confirm-${Date.now()}`,
        senderId: book.owner.id,
        senderName: book.owner.name,
        text: `Confirmed! That location works perfectly. I will bring "${book.title}" to the safe exchange spot. See you then!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col h-[85vh] max-h-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={book.owner.avatar}
                alt={book.owner.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full ring-2 ring-white flex items-center justify-center text-white">
                <ShieldCheck className="w-2.5 h-2.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-xs text-slate-900">{book.owner.name}</h3>
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-mono">
                  Verified Peer
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {book.owner.hallOfResidence} · {book.owner.responseTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Snapshot Banner */}
        <div className="px-5 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={book.coverImage}
              alt=""
              className="w-7 h-9 object-cover rounded shadow-2xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 truncate block">{book.title}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {book.courseCode} · Buy: {formatPrice(book.buyPrice)} · Rent: {formatPrice(book.rentDailyRate)}/day
              </span>
            </div>
          </div>

          {agreedPrice !== null ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout(book, agreedPrice, agreedMode);
              }}
              className="shrink-0 ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Checkout at {formatPrice(agreedPrice)}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[11px] text-blue-700 font-semibold shrink-0">
              Live Negotiation
            </span>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/30">
          <div className="text-center my-2">
            <span className="text-[11px] font-mono text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              Campus Safe Negotiation Mode Active
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Offer badge card */}
                  {m.isOffer && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg border text-xs ${
                        isMe ? 'bg-blue-700/60 border-blue-500 text-white' : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Proposed Price: {formatPrice(m.offerDetails?.proposedPrice)}</span>
                      </div>
                      <div className="text-[10px] opacity-90 mt-0.5">
                        Status: Pending response from student peer
                      </div>
                    </div>
                  )}

                  {/* Meetup proposal badge card */}
                  {m.isMeetupProposal && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg border text-xs ${
                        isMe ? 'bg-blue-700/60 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.meetupDetails?.location}</span>
                      </div>
                      <div className="text-[10px] opacity-90 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{m.meetupDetails?.dateTime}</span>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                  {m.senderName} · {m.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Negotiate & Propose Action Bar */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Actions:</span>
          
          <button
            type="button"
            onClick={() => {
              setShowOfferDrawer(true);
              setShowMeetupDrawer(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Make Price Offer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMeetupDrawer(true);
              setShowOfferDrawer(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Propose Campus Meetup</span>
          </button>

          {agreedPrice !== null && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout(book, agreedPrice, agreedMode);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Book at Agreed {formatPrice(agreedPrice)}</span>
            </button>
          )}
        </div>

        {/* OFFER DRAWER */}
        {showOfferDrawer && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 animate-in slide-in-from-bottom-2 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Propose a Custom Counter-Offer
              </span>
              <button
                type="button"
                onClick={() => setShowOfferDrawer(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Offer Type</label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as 'buy' | 'rent')}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {book.isForSale && <option value="buy">Outright Buy</option>}
                  {book.isForRent && <option value="rent">Daily Rental</option>}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Proposed Amount ($)
                </label>
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                  placeholder="25"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendOffer}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Send Offer of {formatPrice(parseInt(proposedPrice, 10) || 0)}
            </button>
          </div>
        )}

        {/* MEETUP DRAWER */}
        {showMeetupDrawer && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 animate-in slide-in-from-bottom-2 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Select Monitored Campus Safe Spot
              </span>
              <button
                type="button"
                onClick={() => setShowMeetupDrawer(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Campus Safe Zone</label>
              <select
                value={meetupSpot}
                onChange={(e) => setMeetupSpot(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {CAMPUS_SAFE_SPOTS.map((s) => (
                  <option key={s.id} value={`${s.name} (${s.zone})`}>
                    {s.name} — {s.zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Proposed Handover Time</label>
              <input
                type="text"
                value={meetupTime}
                onChange={(e) => setMeetupTime(e.target.value)}
                placeholder="e.g. Today at 4:30 PM"
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleSendMeetupProposal}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Send Meetup Proposal to Owner
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendTextMessage();
            }}
            placeholder="Type your message to owner (e.g. Can we meet near the library?)..."
            className="flex-1 py-2 px-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={handleSendTextMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
