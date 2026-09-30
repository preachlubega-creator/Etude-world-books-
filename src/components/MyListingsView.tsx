import React from 'react';
import { TextbookItem, OrderRecord, BookStatus, formatPrice } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
  ShieldCheck,
  Tag,
  KeyRound,
  AlertCircle,
  Truck,
  Navigation,
} from 'lucide-react';

interface MyListingsViewProps {
  myBooks: TextbookItem[];
  myOrders: OrderRecord[];
  onOpenListModal: () => void;
  onUpdateStatus: (bookId: string, newStatus: BookStatus) => void;
  onSelectBook: (book: TextbookItem) => void;
  onOpenMeetupSelection?: (order: OrderRecord) => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  myBooks,
  myOrders,
  onOpenListModal,
  onUpdateStatus,
  onSelectBook,
  onOpenMeetupSelection,
}) => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-10 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Student Dashboard</span>
            <span>·</span>
            <span className="text-blue-700">Verified Peer Account</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-950 mt-1">
            My Books, Rentals & Active Bookings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your listed textbooks, switch real-time availability status, and review upcoming campus meetup handovers.
          </p>
        </div>

        <button
          onClick={onOpenListModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>List Another Textbook</span>
        </button>
      </div>

      {/* Active Meetup Orders & PIN Verification */}
      {myOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Agreed Campus Meetups & Delivery Handovers ({myOrders.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">PIN Security Protected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                        {order.type === 'rent' ? `Rental (${order.rentalDays} Days)` : 'Purchased Book'}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm mt-1.5">{order.bookTitle}</h3>
                      <p className="text-xs text-slate-500">
                        Peer: <strong className="text-slate-800">{order.sellerName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-slate-950">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {order.paymentMethod === 'in_app_escrow' ? 'Escrow Protected' : 'Cash at Meetup'}
                      </span>
                    </div>
                  </div>

                  {/* Handover PIN Display */}
                  <div className="p-3 bg-slate-900 rounded-xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-300">Exchange PIN:</span>
                    </div>
                    <span className="font-mono text-xl font-bold tracking-widest text-blue-400">
                      {order.handoverPin}
                    </span>
                  </div>

                  {/* Agreed Location */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {order.meetupSpot}
                      </span>
                      {onOpenMeetupSelection && (
                        <button
                          type="button"
                          onClick={() => onOpenMeetupSelection(order)}
                          className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                        >
                          Change Hub
                        </button>
                      )}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.meetupDateTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Placed at {order.createdAt}
                  </span>
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {order.paymentStatus === 'held_in_escrow' ? 'Funds in Escrow' : 'Cash on Exchange'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Textbook Listings and Real-Time Availability Switcher */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>My Listed Textbooks ({myBooks.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live status toggles propagate instantly to marketplace search and student buyers.
            </p>
          </div>
        </div>

        {myBooks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">No textbooks listed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Snap a picture of your old semester course books, set your sale price or daily rental rate, and connect with peers.
            </p>
            <button
              onClick={onOpenListModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Your First Book</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBooks.map((book) => {
              const isAvailable = book.status === 'available';
              const isRented = book.status === 'rented';
              const isReserved = book.status === 'reserved';
              const isSold = book.status === 'sold';

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-lg bg-slate-100 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 min-w-0">
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                          {book.courseCode}
                        </span>
                        <h4
                          onClick={() => onSelectBook(book)}
                          className="font-semibold text-xs text-slate-900 line-clamp-2 hover:text-blue-700 cursor-pointer"
                        >
                          {book.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {book.buyPrice ? `Buy: ${formatPrice(book.buyPrice)}` : ''}
                          {book.buyPrice && book.rentDailyRate ? ' · ' : ''}
                          {book.rentDailyRate ? `Rent: ${formatPrice(book.rentDailyRate)}/d` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Real-time Status Selector */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Live Status Controller
                      </label>
                      <div className="grid grid-cols-2 gap-1 text-[11px] font-medium">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(book.id, 'available')}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isAvailable
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          ● Available
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(book.id, 'rented')}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isRented
                              ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          ● Rented Out
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(book.id, 'reserved')}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isReserved
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          ● Reserved
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(book.id, 'sold')}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isSold
                              ? 'border-slate-800 bg-slate-100 text-slate-900 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          ● Sold Out
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{book.photoLocationTag}</span>
                    <button
                      type="button"
                      onClick={() => onSelectBook(book)}
                      className="text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                      View PDP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
