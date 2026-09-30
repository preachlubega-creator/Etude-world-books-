import React from 'react';
import { TextbookItem, formatPrice } from '../types';
import { ShieldCheck, MessageCircle, BookOpen, Camera } from 'lucide-react';

interface TextbookCardProps {
  book: TextbookItem;
  onSelect: (book: TextbookItem) => void;
  onChat: (book: TextbookItem) => void;
  isSaved?: boolean;
  onToggleSave?: (bookId: string) => void;
}

export const TextbookCard: React.FC<TextbookCardProps> = ({
  book,
  onSelect,
  onChat,
}) => {
  const isAvailable = book.status === 'available';
  const isRented = book.status === 'rented';
  const isReserved = book.status === 'reserved';
  const isSold = book.status === 'sold';

  // Condition styling indicator
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Brand New':
      case 'Like New':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Very Good':
      case 'Good':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'Vintage / Worn':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Heavily Annotated':
      case 'Well-Used / Marked':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <article
      onClick={() => onSelect(book)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden focus-within:ring-2 focus-within:ring-blue-600"
    >
      {/* Product Image Slot (Real Student Camera Snapshot) */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
        <img
          src={book.coverImage}
          alt={`Real photo of ${book.title}`}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Fallback Display if image is loading or fails */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-100 text-slate-400">
          <BookOpen className="w-10 h-10 mb-2 stroke-[1.5]" />
          <span className="text-xs font-medium text-slate-600 line-clamp-2">{book.title}</span>
          <span className="text-[11px] text-slate-400 mt-1">{book.courseCode}</span>
        </div>

        {/* Real-time Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-medium text-slate-800 shadow-xs border border-slate-200/80">
          <span
            className={`w-2 h-2 rounded-full ${
              isAvailable
                ? 'bg-blue-600 animate-pulse'
                : isRented
                ? 'bg-amber-500'
                : isReserved
                ? 'bg-indigo-500'
                : 'bg-slate-400'
            }`}
            aria-hidden="true"
          />
          <span>
            {isAvailable && 'Available'}
            {isRented && (book.rentDueDate ? `Rented · Due ${book.rentDueDate}` : 'Currently Rented')}
            {isReserved && 'Reserved for Meetup'}
            {isSold && 'Sold'}
          </span>
        </div>

        {/* Course Code Tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-blue-950/90 text-white font-mono text-[11px] font-semibold tracking-tight shadow-xs">
          {book.courseCode}
        </div>

        {/* Real Student Snapshot Tag Overlay (Bottom left) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none group-hover:opacity-0 transition-opacity">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/70 backdrop-blur-xs text-[10px] text-white/95 truncate max-w-full font-sans">
            <Camera className="w-3 h-3 text-blue-300 shrink-0" />
            <span className="truncate">{book.photoLocationTag}</span>
          </div>
        </div>

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChat(book);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Chat / Offer</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(book);
            }}
            className="inline-flex items-center justify-center py-2 px-3 text-xs font-semibold text-white bg-blue-600/90 hover:bg-blue-600 rounded-lg backdrop-blur-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Card Content & Zero-Pill Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 tracking-tight font-medium flex-wrap">
            <span>{book.college || book.department}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${getConditionColor(
                book.condition
              )}`}
            >
              {book.condition}
            </span>
          </div>

          {/* Book Title */}
          <h3 className="mt-1.5 font-serif text-base font-semibold text-slate-900 line-clamp-1 leading-snug group-hover:text-blue-700 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {book.authors}
          </p>
        </div>

        {/* Pricing in USD / Universal & Owner */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">Student Price</span>
            <div className="flex items-baseline gap-1.5 font-mono text-xs">
              {book.isForSale && book.buyPrice !== null && (
                <span className="text-xs font-bold text-blue-900 tabular-nums">
                  {formatPrice(book.buyPrice)}
                </span>
              )}
              {book.isForSale && book.isForRent && book.rentDailyRate !== null && (
                <span className="text-slate-300 font-normal">/</span>
              )}
              {book.isForRent && book.rentDailyRate !== null && (
                <span className="text-slate-700 font-medium tabular-nums text-[11px]">
                  {formatPrice(book.rentDailyRate)}<span className="text-[10px] text-slate-500">/day</span>
                </span>
              )}
            </div>
          </div>

          {/* Verified Student Owner Preview */}
          <div className="flex items-center gap-1.5 text-right text-xs text-slate-500">
            <div className="flex flex-col items-end">
              <span className="font-medium text-slate-800 flex items-center gap-1">
                {book.owner.name.split(' ')[0]}
                <ShieldCheck className="w-3 h-3 text-blue-600 inline" />
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                {book.owner.hallOfResidence || 'Campus Network'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
};
