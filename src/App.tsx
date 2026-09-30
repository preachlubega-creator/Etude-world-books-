import React, { useState, useMemo } from 'react';
import { TextbookItem, StudentProfile, BookStatus, OrderRecord, PaymentMethod } from './types';
import { INITIAL_TEXTBOOKS, CURRENT_USER, CAMPUS_SAFE_SPOTS } from './data/mockData';
import { Header } from './components/Header';
import { TextbookCard } from './components/TextbookCard';
import { TextbookDetailModal } from './components/TextbookDetailModal';
import { ListTextbookModal } from './components/ListTextbookModal';
import { ChatNegotiationModal } from './components/ChatNegotiationModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CampusSafeZonesModal } from './components/CampusSafeZonesModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { MyListingsView } from './components/MyListingsView';
import {
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<StudentProfile>(CURRENT_USER);
  const [textbooks, setTextbooks] = useState<TextbookItem[]>(INITIAL_TEXTBOOKS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Navigation (Safe zones standalone tab removed; only marketplace & my listings)
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my_listings'>('marketplace');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'rent' | 'buy'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented'>('all');

  // Modals
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<TextbookItem | null>(null);
  const [selectedBookForChat, setSelectedBookForChat] = useState<TextbookItem | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Checkout Modal State
  const [checkoutConfig, setCheckoutConfig] = useState<{
    book: TextbookItem;
    mode: 'buy' | 'rent';
    days?: number;
    customPrice?: number;
  } | null>(null);

  // Dedicated Safe Zones & Delivery Selector (Brought up when booking is agreed)
  const [safeZoneModalConfig, setSafeZoneModalConfig] = useState<{
    isOpen: boolean;
    bookTitle?: string;
    sellerName?: string;
    orderId?: string;
    defaultSpot?: string;
  }>({ isOpen: false });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add new textbook listing
  const handleAddListing = (newBook: TextbookItem) => {
    setTextbooks((prev) => [newBook, ...prev]);
    showToast(`"${newBook.title}" listed successfully! Status is live: Available.`);
  };

  // Real-time status updater (Owner or tester)
  const handleUpdateStatus = (bookId: string, newStatus: BookStatus) => {
    setTextbooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b))
    );
    setSelectedBookForDetails((prev) =>
      prev && prev.id === bookId ? { ...prev, status: newStatus } : prev
    );

    const statusLabel =
      newStatus === 'available'
        ? 'Available Now'
        : newStatus === 'rented'
        ? 'Currently Rented'
        : newStatus === 'reserved'
        ? 'Reserved for Meetup'
        : 'Sold';

    showToast(`Real-time update: Textbook marked as "${statusLabel}".`);
  };

  // Toggle live status demonstration shortcut
  const handleToggleStatusSim = (bookId: string) => {
    const book = textbooks.find((b) => b.id === bookId);
    if (!book) return;
    const nextStatus: BookStatus = book.status === 'available' ? 'rented' : 'available';
    handleUpdateStatus(bookId, nextStatus);
  };

  // Complete Order & generate Escrow Handover
  const handleCompleteOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);

    // Automatically update book status to reserved or rented in real time
    const updatedStatus: BookStatus = order.type === 'rent' ? 'rented' : 'reserved';
    handleUpdateStatus(order.bookId, updatedStatus);

    showToast(
      `Booking agreed! Handover PIN generated for ${order.meetupSpot.split(' ')[0]}.`
    );
  };

  // Update Meetup or Delivery Location on existing booking
  const handleConfirmMeetupOrDelivery = (
    location: string,
    time: string,
    isDelivery: boolean
  ) => {
    if (safeZoneModalConfig.orderId) {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === safeZoneModalConfig.orderId
            ? { ...ord, meetupSpot: location, meetupDateTime: time }
            : ord
        )
      );
    }
    showToast(
      `${isDelivery ? 'Delivery' : 'Safe meetup spot'} confirmed: ${location} (${time}).`
    );
  };

  // Filtered Textbooks list (50 books)
  const filteredTextbooks = useMemo(() => {
    return textbooks.filter((book) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.courseCode.toLowerCase().includes(q) ||
        book.authors.toLowerCase().includes(q) ||
        book.isbn.includes(q) ||
        book.department.toLowerCase().includes(q) ||
        (book.college && book.college.toLowerCase().includes(q)) ||
        (book.condition && book.condition.toLowerCase().includes(q)) ||
        (book.photoLocationTag && book.photoLocationTag.toLowerCase().includes(q));

      const matchesMode =
        modeFilter === 'all' ||
        (modeFilter === 'rent' && book.isForRent) ||
        (modeFilter === 'buy' && book.isForSale);

      const matchesDept =
        departmentFilter === 'all' ||
        book.department === departmentFilter ||
        book.college === departmentFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && book.status === 'available') ||
        (statusFilter === 'rented' && book.status === 'rented');

      return matchesSearch && matchesMode && matchesDept && matchesStatus;
    });
  }, [textbooks, searchQuery, modeFilter, departmentFilter, statusFilter]);

  // Unique colleges / departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set(textbooks.map((b) => b.college || b.department));
    return ['all', ...Array.from(depts)];
  }, [textbooks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Real-time Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs border border-slate-800 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation (Clickable & Viewable Profile in top right corner) */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenListModal={() => setIsListModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        savedBooksCount={0}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div>
            
            {/* Storefront Hero Showcase */}
            <section className="border-b border-slate-200/90 bg-white shadow-2xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="max-w-3xl space-y-4">
                  
                  {/* Editorial Lead */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Etude World Books by Astra Creatives
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>50 Second-Hand Textbooks</span>
                    <span aria-hidden="true">·</span>
                    <span>Campus Peer Network</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.15] text-balance">
                    Buy, Sell, and Rent Second-Hand Textbooks With Campus Peers.
                  </h1>

                  {/* Selected Component p element */}
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                    Save on your next semester by buying and selling directly from fellow students. Etude World Books provides students with an open, trusted campus platform to share, buy, and sell second-hand textbooks among each other. Connect peer-to-peer with verified campus classmates, eliminate excessive bookstore markups, negotiate flexible daily rental rates, and arrange safe, convenient handovers right where you study.
                  </p>

                  {/* Fast Course Search Bar */}
                  <div className="pt-3 max-w-2xl">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Course Code (CSC 2100, LAW 1101, MTH 1101), Title, Department, or Condition..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-2xs font-sans"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick Course Code suggestions */}
                    <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">Popular Courses:</span>
                      {['CSC 2100', 'LAW 1101', 'MTH 1101', 'ECO 1101', 'MED 2101', 'MEC 1101', 'LIT 1102', 'CHM 1201'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSearchQuery(code)}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shrink-0 cursor-pointer border border-slate-200"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Filter Controls & Products Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                
                {/* Left: Mode Segmented Control (All, Rent Only, Buy Only) */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setModeFilter('all')}
                      className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                        modeFilter === 'all'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      All Offerings
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeFilter('rent')}
                      className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                        modeFilter === 'rent'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Rent Per Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeFilter('buy')}
                      className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                        modeFilter === 'buy'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Buy Outright
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('available')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        statusFilter === 'available'
                          ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>Available Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('rented')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        statusFilter === 'rented'
                          ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Currently Rented
                    </button>
                  </div>
                </div>

                {/* Right: Department Dropdown & Count */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">
                    Showing {filteredTextbooks.length} of {textbooks.length} books
                  </span>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Disciplines & Faculties ({departments.length - 1})</option>
                    {departments
                      .filter((d) => d !== 'all')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

              </div>

              {/* Textbooks Cards Grid (50 Authentic Second-Hand Books) */}
              {filteredTextbooks.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    No textbooks match your active search
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for another course code or clear your filters to view all 50 campus textbooks.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setModeFilter('all');
                      setDepartmentFilter('all');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredTextbooks.map((book) => (
                    <TextbookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => setSelectedBookForDetails(b)}
                      onChat={(b) => setSelectedBookForChat(b)}
                    />
                  ))}
                </div>
              )}

            </section>

          </div>
        )}

        {/* VIEW 2: MY LISTINGS & STATUS CONTROLLER */}
        {activeTab === 'my_listings' && (
          <MyListingsView
            myBooks={textbooks}
            myOrders={orders}
            onOpenListModal={() => setIsListModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onSelectBook={(book) => setSelectedBookForDetails(book)}
            onOpenMeetupSelection={(order) => {
              setSafeZoneModalConfig({
                isOpen: true,
                bookTitle: order.bookTitle,
                sellerName: order.sellerName,
                orderId: order.id,
                defaultSpot: order.meetupSpot,
              });
            }}
          />
        )}

      </main>

      {/* MODAL 1: Product Detail View (PDP) */}
      {selectedBookForDetails && (
        <TextbookDetailModal
          book={selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          onInitiateCheckout={(book, mode, days) => {
            setSelectedBookForDetails(null);
            setCheckoutConfig({ book, mode, days });
          }}
          onOpenChat={(book) => {
            setSelectedBookForDetails(null);
            setSelectedBookForChat(book);
          }}
          onToggleStatusSim={handleToggleStatusSim}
        />
      )}

      {/* MODAL 2: Camera Photo Capture & Textbook Listing */}
      {isListModalOpen && (
        <ListTextbookModal
          currentUser={currentUser}
          onClose={() => setIsListModalOpen(false)}
          onAddListing={handleAddListing}
        />
      )}

      {/* MODAL 3: In-App Chat & Discount Negotiation */}
      {selectedBookForChat && (
        <ChatNegotiationModal
          book={selectedBookForChat}
          currentUser={currentUser}
          onClose={() => setSelectedBookForChat(null)}
          onProceedToCheckout={(book, agreedPrice, mode) => {
            setSelectedBookForChat(null);
            setCheckoutConfig({ book, mode, customPrice: agreedPrice });
          }}
        />
      )}

      {/* MODAL 4: Secure Checkout & Booking (Integrates Safe Zone / Delivery Selection) */}
      {checkoutConfig && (
        <CheckoutModal
          book={checkoutConfig.book}
          currentUser={currentUser}
          initialMode={checkoutConfig.mode}
          rentalDays={checkoutConfig.days}
          customPrice={checkoutConfig.customPrice}
          onClose={() => setCheckoutConfig(null)}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {/* MODAL 5: Dedicated Safe Zones & Delivery Selector (Brought up when booking is agreed or modified) */}
      <CampusSafeZonesModal
        isOpen={safeZoneModalConfig.isOpen}
        bookTitle={safeZoneModalConfig.bookTitle}
        sellerName={safeZoneModalConfig.sellerName}
        defaultSpot={safeZoneModalConfig.defaultSpot}
        onClose={() => setSafeZoneModalConfig({ isOpen: false })}
        onConfirmMeetupOrDelivery={handleConfirmMeetupOrDelivery}
      />

      {/* MODAL 6: Clickable and Viewable Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={currentUser}
        onUpdateProfile={(updated) => {
          setCurrentUser(updated);
          showToast('Student profile details updated successfully!');
        }}
        onGoToListings={() => {
          setActiveTab('my_listings');
        }}
      />

      {/* Minimalist Academic Footer */}
      <footer className="border-t border-slate-200/90 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-900 text-sm">Etude World Books</span>
            <span className="text-[10px] text-blue-600 font-semibold uppercase">by Astra Creatives</span>
            <span aria-hidden="true">·</span>
            <span>Campus Peer Textbook Exchange</span>
            <span aria-hidden="true">·</span>
            <span>Verified Student Community</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('my_listings')}
              className="text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              My Books & Orders
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              View Student Profile
            </button>
            <span className="text-slate-400 font-mono">
              In-App Escrow Protection · Cash on Handover
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
