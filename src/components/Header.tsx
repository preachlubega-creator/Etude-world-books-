import React from 'react';
import { StudentProfile } from '../types';
import { ShieldCheck, Plus, BookOpen, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentUser: StudentProfile;
  activeTab: 'marketplace' | 'my_listings';
  setActiveTab: (tab: 'marketplace' | 'my_listings') => void;
  onOpenListModal: () => void;
  onOpenProfileModal: () => void;
  savedBooksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenListModal,
  onOpenProfileModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Wordmark & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  Etude World Books
                </span>
              </div>
              <div className="text-[10px] font-sans font-medium tracking-wider uppercase text-blue-600/90 -mt-1">
                by Astra Creatives
              </div>
            </button>
            <span className="hidden sm:inline-flex text-[11px] text-blue-700 font-medium bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
              Student Exchange
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`transition-colors relative py-1.5 cursor-pointer focus-visible:outline-none ${
                activeTab === 'marketplace'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Marketplace
              {activeTab === 'marketplace' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_listings')}
              className={`transition-colors relative py-1.5 cursor-pointer focus-visible:outline-none ${
                activeTab === 'my_listings'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Books & Orders
              {activeTab === 'my_listings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Clickable Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenListModal}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wide text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Textbook</span>
            </button>

            {/* Clickable and Viewable Student Profile in Top Right Corner */}
            <button
              onClick={onOpenProfileModal}
              title="View & Edit Student Profile"
              className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 rounded-xl border border-slate-200/90 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/50 transition-all cursor-pointer group focus-visible:outline-2 focus-visible:outline-blue-600 text-left"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white group-hover:ring-blue-200 transition-all">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full ring-2 ring-white flex items-center justify-center text-white shadow-2xs"
                  title="Verified Student ID"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
              </div>

              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Verified Student · {currentUser.major.split(' ')[0]}
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`py-1 cursor-pointer ${activeTab === 'marketplace' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('my_listings')}
            className={`py-1 cursor-pointer ${activeTab === 'my_listings' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            My Books & Orders
          </button>
          <button
            onClick={onOpenProfileModal}
            className="py-1 text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
          >
            <span>My Profile</span>
          </button>
        </div>

      </div>
    </header>
  );
};
