import React, { useState, useRef, useEffect } from 'react';
import { TextbookItem, StudentProfile, TextbookCondition, PaymentMethod, formatPrice } from '../types';
import { CAMPUS_SAFE_SPOTS } from '../data/mockData';
import {
  Camera,
  Upload,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  ShieldCheck,
  AlertCircle,
  MapPin,
} from 'lucide-react';

interface ListTextbookModalProps {
  currentUser: StudentProfile;
  onClose: () => void;
  onAddListing: (newBook: TextbookItem) => void;
}

export const ListTextbookModal: React.FC<ListTextbookModalProps> = ({
  currentUser,
  onClose,
  onAddListing,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Photo & Camera State
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoLocationTag, setPhotoLocationTag] = useState<string>('Snapped on Main Library 2nd Floor Study Desk');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [college, setCollege] = useState('Computing & Information Science');
  const [edition, setEdition] = useState('');
  const [isbn, setIsbn] = useState('');
  const [condition, setCondition] = useState<TextbookCondition>('Very Good');
  const [description, setDescription] = useState('');

  // Pricing & Renting
  const [isForRent, setIsForRent] = useState(true);
  const [rentDailyRate, setRentDailyRate] = useState<string>('2');
  const [securityDeposit, setSecurityDeposit] = useState<string>('15');

  const [isForSale, setIsForSale] = useState(true);
  const [buyPrice, setBuyPrice] = useState<string>('35');

  // Meetup and Payments
  const [selectedSpots, setSelectedSpots] = useState<string[]>([
    CAMPUS_SAFE_SPOTS[0].name,
    CAMPUS_SAFE_SPOTS[1].name,
  ]);
  const [acceptedPayments, setAcceptedPayments] = useState<PaymentMethod[]>([
    'in_app_escrow',
    'cash_on_delivery',
  ]);

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access failed, falling back to upload or samples:', err);
      setCameraError(
        'Camera permission was not granted or webcam is unavailable. You can upload a photo from your gallery or choose one of our real student snapshot samples below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoDataUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPresetCover = (url: string, presetTitle: string, presetCourse: string, locationTag: string, cond: TextbookCondition) => {
    setPhotoDataUrl(url);
    if (!title) setTitle(presetTitle);
    if (!courseCode) setCourseCode(presetCourse);
    setPhotoLocationTag(locationTag);
    setCondition(cond);
    stopCamera();
  };

  const toggleMeetupSpot = (name: string) => {
    if (selectedSpots.includes(name)) {
      if (selectedSpots.length > 1) {
        setSelectedSpots(selectedSpots.filter((s) => s !== name));
      }
    } else {
      setSelectedSpots([...selectedSpots, name]);
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    if (acceptedPayments.includes(method)) {
      if (acceptedPayments.length > 1) {
        setAcceptedPayments(acceptedPayments.filter((m) => m !== method));
      }
    } else {
      setAcceptedPayments([...acceptedPayments, method]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoDataUrl) {
      alert('Please take or upload a photo of your textbook.');
      setStep(1);
      return;
    }
    if (!title.trim() || !courseCode.trim()) {
      alert('Please fill in the textbook title and course code.');
      setStep(2);
      return;
    }
    if (!isForSale && !isForRent) {
      alert('Please select at least one listing option: For Sale or For Rent.');
      setStep(3);
      return;
    }

    const newBook: TextbookItem = {
      id: `tb-${Date.now()}`,
      title: title.trim(),
      authors: authors.trim() || 'Campus Faculty & Authors',
      edition: edition.trim() || 'Standard Academic Edition',
      isbn: isbn.trim() || '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
      courseCode: courseCode.trim().toUpperCase(),
      department: college.split(' ')[0],
      college,
      coverImage: photoDataUrl,
      condition,
      photoLocationTag: photoLocationTag.trim() || 'Photo taken on campus study desk',
      isForSale,
      isForRent,
      buyPrice: isForSale ? parseInt(buyPrice, 10) || 35 : null,
      rentDailyRate: isForRent ? parseInt(rentDailyRate, 10) || 2 : null,
      securityDeposit: isForRent ? parseInt(securityDeposit, 10) || 15 : 0,
      status: 'available',
      owner: currentUser,
      preferredMeetupSpots: selectedSpots,
      acceptedPaymentMethods: acceptedPayments,
      description:
        description.trim() ||
        'Second-hand copy in honest condition, available for immediate meetup on campus.',
      postedAt: 'Just now',
      viewsCount: 1,
      savesCount: 0,
    };

    onAddListing(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">
              List Second-Hand Textbook · Etude World Books
            </h2>
            <p className="text-xs text-slate-500">
              Step {step} of 3 · Real Student Photo & Condition Guarantee
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 border-b border-slate-100 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
              step === 1
                ? 'border-blue-600 text-blue-700 font-semibold bg-blue-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            1. Real Photo & Condition
          </button>
          <button
            type="button"
            onClick={() => photoDataUrl && setStep(2)}
            className={`py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
              step === 2
                ? 'border-blue-600 text-blue-700 font-semibold bg-blue-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            2. Course & Details
          </button>
          <button
            type="button"
            onClick={() => photoDataUrl && title && setStep(3)}
            className={`py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
              step === 3
                ? 'border-blue-600 text-blue-700 font-semibold bg-blue-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            3. Pricing & Meetup
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: PHOTO CAPTURE & CONDITION */}
          {step === 1 && (
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Take Real Photo of Your Textbook on Campus Desk / Table
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Fellow students buy and rent second-hand books with confidence when they see honest real photos showing the book's genuine wear and notes.
                </p>

                {/* Viewfinder / Preview Container */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-white">
                  
                  {/* Real Camera Stream View */}
                  {isCameraActive && (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-8 border-2 border-white/60 rounded-lg pointer-events-none flex items-center justify-center">
                        <span className="text-xs bg-black/60 px-3 py-1 rounded text-white font-mono">
                          Frame Textbook Cover & Binding
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={takeSnapshot}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-white text-slate-950 rounded-full font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  )}

                  {/* Photo Taken Preview */}
                  {!isCameraActive && photoDataUrl && (
                    <div className="relative w-full h-full bg-slate-100 flex items-center justify-center">
                      <img
                        src={photoDataUrl}
                        alt="Captured textbook preview"
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoDataUrl('');
                            startCamera();
                          }}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Camera Idle State */}
                  {!isCameraActive && !photoDataUrl && (
                    <div className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Take a photo with your device camera</p>
                        <p className="text-xs text-slate-400 mt-0.5">Snap on your desk, library carrel, or study table</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>Open Live Camera</span>
                        </button>

                        <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span>Upload from Gallery</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {cameraError && (
                        <p className="text-xs text-amber-300 bg-amber-950/60 p-2.5 rounded-lg text-left mt-2 flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <span>{cameraError}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Real Campus Photo Samples for Rapid Demo */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                    Or select an authentic campus student snapshot to test:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetCover(
                          '/src/assets/images/book_worn_law_student_desk_1790693314626.jpg',
                          'Principles of Common Law & Precedents',
                          'LAW 1101',
                          'Photo taken on Law Library Study Carrel',
                          'Vintage / Worn'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 cursor-pointer border border-slate-200"
                    >
                      Worn Law Book on Library Desk
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetCover(
                          '/src/assets/images/book_engineering_dorm_table_1790693327355.jpg',
                          'Engineering Mechanics: Statics & Dynamics',
                          'MEC 1101',
                          'Photo taken on Dorm Desk with Calculator',
                          'Good'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 cursor-pointer border border-slate-200"
                    >
                      Engineering Book on Dorm Desk
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetCover(
                          '/src/assets/images/book_medical_anatomy_table_1790693336820.jpg',
                          'Clinical Internal Medicine Guide',
                          'MED 2101',
                          'Photo taken at Medical Sciences Library Table',
                          'Well-Used / Marked'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 cursor-pointer border border-slate-200"
                    >
                      Medical Anatomy Book on Study Table
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetCover(
                          '/src/assets/images/book_vintage_paperback_bench_1790693347817.jpg',
                          'Postcolonial African & World Literature',
                          'LIT 1102',
                          'Photo taken on Campus Quad Wooden Bench in Sun',
                          'Vintage / Worn'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 cursor-pointer border border-slate-200"
                    >
                      Vintage Literature Paperback on Quad Bench
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Location Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Where did you snap this photo? (Builds student trust)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={photoLocationTag}
                    onChange={(e) => setPhotoLocationTag(e.target.value)}
                    placeholder="e.g. Snapped at Main Library 2nd Floor Study Carrel"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Condition Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Honest Second-Hand Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      'Brand New',
                      'Like New',
                      'Very Good',
                      'Good',
                      'Well-Used / Marked',
                      'Heavily Annotated',
                      'Vintage / Worn',
                    ] as TextbookCondition[]
                  ).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`p-2.5 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                        condition === cond
                          ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!photoDataUrl}
                  onClick={() => setStep(2)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                    photoDataUrl
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Course Details →
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: TEXTBOOK DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Textbook Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Algorithms, Principles of Economics..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code (e.g. CSC 2100, LAW 1101) *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CSC 2100, MTH 1101, ECO 1101"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / College Faculty
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Computing & Information Science">Computing & Information Science</option>
                    <option value="School of Law">School of Law</option>
                    <option value="School of Engineering">School of Engineering</option>
                    <option value="Health Sciences & Medicine">Health Sciences & Medicine</option>
                    <option value="Business & Economics">Business & Economics</option>
                    <option value="Faculty of Natural Sciences">Faculty of Natural Sciences</option>
                    <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                    <option value="Agriculture & Environment">Agriculture & Environment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Authors / Editors
                  </label>
                  <input
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="e.g. Thomas H. Cormen, N. Gregory Mankiw"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Edition / Publisher
                  </label>
                  <input
                    type="text"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    placeholder="e.g. 4th Global Edition, MIT Press"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ISBN (Optional)
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="e.g. 978-0262033848"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Honest Condition Notes (Page highlighting, past test notes, cover wear)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Some yellow highlighter in Chapter 4, all problem sets clean and intact. Includes midterm study notes!"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ← Back to Photo
                </button>
                <button
                  type="button"
                  disabled={!title.trim() || !courseCode.trim()}
                  onClick={() => setStep(3)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                    title.trim() && courseCode.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Set Pricing & Meetup Spots →
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: PRICING & MEETUP SPOTS */}
          {step === 3 && (
            <div className="space-y-6">
              
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Availability Models & Pricing
                </label>

                {/* Rent Option */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isForRent ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isForRent}
                        onChange={(e) => setIsForRent(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-semibold text-slate-900">
                        Put up for Hire / Rent (Daily Rate)
                      </span>
                    </label>
                    <span className="text-xs text-slate-500">Popular during midterms and exam weeks</span>
                  </div>

                  {isForRent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/80">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Rent Price Per Day ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">$</span>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={rentDailyRate}
                            onChange={(e) => setRentDailyRate(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-slate-300"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. $2 / day</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Refundable Security Deposit ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">$</span>
                          <input
                            type="number"
                            step="5"
                            min="5"
                            value={securityDeposit}
                            onChange={(e) => setSecurityDeposit(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-slate-300"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. $15 (refunded on return)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sell Option */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isForSale ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isForSale}
                        onChange={(e) => setIsForSale(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-semibold text-slate-900">
                        Put up for Outright Second-Hand Sale
                      </span>
                    </label>
                  </div>

                  {isForSale && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 max-w-xs">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Second-Hand Buy Price ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">$</span>
                        <input
                          type="number"
                          step="1"
                          min="5"
                          value={buyPrice}
                          onChange={(e) => setBuyPrice(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-slate-300"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. $35</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Safe Campus Meetup Hubs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Your Preferred Safe Campus Meetup Hubs
                </label>
                <div className="space-y-1.5">
                  {CAMPUS_SAFE_SPOTS.slice(0, 4).map((spot) => {
                    const isChecked = selectedSpots.includes(spot.name);
                    return (
                      <label
                        key={spot.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50/60 border-blue-300' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMeetupSpot(spot.name)}
                          className="w-4 h-4 mt-0.5 rounded text-blue-600"
                        />
                        <div>
                          <strong className="text-slate-900 block font-semibold">{spot.name}</strong>
                          <span className="text-slate-500">{spot.zone}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accepted Payment Methods
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedPayments.includes('in_app_escrow')}
                      onChange={() => togglePaymentMethod('in_app_escrow')}
                      className="rounded text-blue-600"
                    />
                    <span>In-App Escrow (Card / Student Wallet)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedPayments.includes('cash_on_delivery')}
                      onChange={() => togglePaymentMethod('cash_on_delivery')}
                      className="rounded text-blue-600"
                    />
                    <span>Cash on Handover (Meetup Safe Zone)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ← Back to Details
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Live Campus Listing</span>
                </button>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  );
};
