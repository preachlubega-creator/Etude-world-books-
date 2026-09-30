export type TextbookCondition =
  | 'Brand New'
  | 'Like New'
  | 'Very Good'
  | 'Good'
  | 'Well-Used / Marked'
  | 'Vintage / Worn'
  | 'Heavily Annotated';

export type BookStatus = 'available' | 'reserved' | 'rented' | 'sold';

export type PaymentMethod = 'in_app_escrow' | 'cash_on_delivery';

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  university: string; // e.g. "Makerere University"
  email: string; // e.g. "student@mak.ac.ug"
  isVerified: boolean;
  major: string;
  college: string; // e.g. "CoCIS", "CEDAT", "CHS", "SoL"
  gradYear: string;
  hallOfResidence: string; // e.g. "Mitchell Hall", "Mary Stuart", "Africa Hall"
  rating: number; // e.g. 4.95
  reviewCount: number;
  dealsCompleted: number;
  responseTime: string; // e.g. "Usually responds in ~5 mins"
}

export interface TextbookItem {
  id: string;
  title: string;
  authors: string;
  edition: string;
  isbn: string;
  courseCode: string;
  department: string;
  college: string; // CoCIS, CEDAT, CHS, SoL, CoBAMS, CoNAS, CHUSS, CAES
  coverImage: string;
  condition: TextbookCondition;
  photoLocationTag: string; // e.g. "Snapped at Makerere Main Library Level 2 Carrel"
  isForSale: boolean;
  isForRent: boolean;
  buyPrice: number | null; // In UGX
  rentDailyRate: number | null; // In UGX per day
  securityDeposit?: number; // In UGX
  status: BookStatus;
  rentDueDate?: string;
  owner: StudentProfile;
  preferredMeetupSpots: string[];
  acceptedPaymentMethods: PaymentMethod[];
  description: string;
  postedAt: string;
  viewsCount: number;
  savesCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerDetails?: {
    type: 'buy' | 'rent';
    proposedPrice: number;
    rentalDays?: number;
    status: 'pending' | 'accepted' | 'declined';
  };
  isMeetupProposal?: boolean;
  meetupDetails?: {
    location: string;
    dateTime: string;
    status: 'pending' | 'confirmed';
  };
}

export interface OrderRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  type: 'buy' | 'rent';
  rentalDays?: number;
  totalAmount: number; // In UGX
  paymentMethod: PaymentMethod;
  paymentStatus: 'held_in_escrow' | 'cod_pending' | 'completed';
  buyerName: string;
  sellerName: string;
  meetupSpot: string;
  meetupDateTime: string;
  handoverPin: string;
  createdAt: string;
  isCompleted: boolean;
}

export const formatPrice = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '$0';
  // If value is in thousands (like 35000), convert smoothly to standard college textbook dollar range ($35)
  const normalized = val >= 1000 ? Math.round(val / 1000) : val;
  return `$${normalized.toLocaleString()}`;
};

export const formatUGX = formatPrice;
