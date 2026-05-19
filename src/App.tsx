/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book as BookIcon, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Trash2,
  QrCode, 
  CheckCircle, 
  Clock, 
  LayoutDashboard,
  ArrowRight,
  Library,
  BookOpen,
  Star,
  Award,
  ChevronRight,
  Plus,
  Camera,
  ImagePlus,
  X,
  AlertCircle,
  RefreshCcw,
  ScanLine
} from 'lucide-react';
import { User, Book, UserRole, BorrowRecord, Review } from './types.ts';
import { MOCK_BOOKS, MOCK_USERS } from './constants.ts';
import { getKannadaSummary } from './services/geminiService.ts';
import { cn, formatDate } from './lib/utils.ts';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { QRCodeCanvas } from 'qrcode.react';

// --- Components ---

const Button = ({ className, ...props }: any) => (
  <button 
    className={cn(
      "px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm",
      className
    )}
    {...props}
  />
);

const Input = ({ className, ...props }: any) => (
  <input 
    className={cn(
      "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-400 text-sm",
      className
    )}
    {...props}
  />
);

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest", className)}>
    {children}
  </span>
);

const StarRating = ({ rating = 0, onRate, interactive = false }: { rating?: number, onRate?: (r: number) => void, interactive?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
          className={cn(
            "transition-all",
            interactive ? "cursor-pointer scale-110" : "cursor-default"
          )}
        >
          <Star 
            className={cn(
              "w-4 h-4",
              (star <= (hover || rating)) ? "fill-amber-400 text-amber-400" : "text-slate-200"
            )} 
          />
        </button>
      ))}
    </div>
  );
};

const ReviewModal = ({ book, onRate, onClose }: { book: Book, onRate: (rating: number, comment: string) => void, onClose: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-3xl border border-slate-100 relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[50px] -mr-10 -mt-10" />
        
        <h3 className="text-2xl font-black text-slate-900 mb-2">You're a Star!</h3>
        <p className="text-slate-400 text-sm mb-10 font-bold">Help others find their next adventure.</p>
        
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-125 btn-bounce"
            >
              <Star 
                className={cn(
                  "w-12 h-12 transition-all",
                  star <= rating ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-slate-100"
                )} 
              />
            </button>
          ))}
        </div>

        <textarea 
          placeholder="What did you love about this book?"
          className="w-full h-32 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] p-6 text-sm font-bold text-slate-600 focus:ring-0 mb-8 resize-none transition-all"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex gap-4">
          <Button 
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-400 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] btn-bounce"
          >Not now</Button>
          <Button 
            disabled={rating === 0}
            onClick={() => onRate(rating, comment)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 btn-bounce"
          >Share It</Button>
        </div>
      </motion.div>
    );
};

const StudentSelector = ({ users, onSelect, onClose }: { users: User[], onSelect: (u: User) => void, onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.role === UserRole.STUDENT && u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md p-6 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[80vh]"
      >
        <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Select Student</h3>
        <Input 
          placeholder="Search student..." 
          className="mb-4 rounded-full"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 scrollbar-hide">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all text-left"
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                <p className="text-[10px] font-mono text-slate-400">ID: {s.id}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
        <Button onClick={onClose} className="bg-slate-900 text-white w-full py-4 rounded-2xl">Cancel</Button>
      </motion.div>
    </div>
  );
};

// --- Pages ---

const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full bg-transparent flex flex-col items-center justify-center p-6 text-slate-900 text-center relative italic">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 relative z-10"
      >
        <div className="relative mb-10">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 8, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 rounded-[2.5rem] flex items-center justify-center shadow-3xl relative z-10 border-4 border-white"
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-rose-400 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full -z-10" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter text-slate-900 uppercase">
          NAMMA <span className="text-gradient block italic scale-110">PUSTAKA</span>
        </h1>
        <p className="text-slate-500 text-base font-black max-w-[240px] mx-auto leading-tight italic opacity-80">Empower your growth through reading.</p>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-indigo-600 text-white px-12 py-6 text-lg shadow-3xl shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-4 rounded-[2rem] font-black uppercase tracking-[0.2em] btn-bounce"
        >
          EXPLORE <ArrowRight className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
};

const AuthPage = ({ users, onLogin, onRegister }: { users: User[], onLogin: (u: User) => void, onRegister: (u: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword || (!isLogin && !name)) {
      setError('Please fill all fields');
      return;
    }

    if (isLogin) {
      const user = users.find(u => 
        (u.email.toLowerCase() === cleanEmail.toLowerCase() || u.id.toLowerCase() === cleanEmail.toLowerCase()) && 
        u.password === cleanPassword && 
        u.role === role
      );
      if (user) {
        onLogin(user);
        navigate('/home');
      } else {
        setError('Invalid credentials or role selection');
      }
    } else {
      // Register (Teacher only)
      if (role === UserRole.STUDENT) {
        setError('Students must be registered by a Teacher');
        return;
      }

      const newTeacher: User = {
        id: `T${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        email: cleanEmail,
        role: UserRole.TEACHER,
        password: cleanPassword
      };

      onRegister(newTeacher);
      setError('');
      alert('Teacher registration successful! Please login.');
      setIsLogin(true);
    }
  };

  return (
    <div className="h-full bg-transparent flex flex-col p-6 italic">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 -rotate-6">
             <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">{isLogin ? 'Welcome Back' : 'Join the Club'}</h2>
          <p className="text-slate-400 text-sm font-bold italic">
            {isLogin ? 'Enter your details to access your shelf' : 'Teachers can create an account here'}
          </p>
        </div>

        <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-[2rem] mb-8 border border-white shadow-2xl relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[40px] pointer-events-none" />
          <button 
            type="button"
            onClick={() => { setRole(UserRole.STUDENT); setIsLogin(true); }}
            className={cn("flex-1 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-[0.2em] btn-bounce relative z-10", role === UserRole.STUDENT ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "text-slate-400")}
          >Student</button>
          <button 
            type="button"
            onClick={() => setRole(UserRole.TEACHER)}
            className={cn("flex-1 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-[0.2em] btn-bounce relative z-10", role === UserRole.TEACHER ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "text-slate-400")}
          >Teacher</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          {!isLogin && <Input placeholder="FULL NAME" className="h-14 rounded-[1.2rem] border-none ring-1 ring-slate-100 bg-white/80 focus:ring-2 focus:ring-indigo-500 font-extrabold uppercase placeholder:tracking-widest" value={name} onChange={(e: any) => setName(e.target.value)} />}
          <Input placeholder="EMAIL OR ID" className="h-14 rounded-[1.2rem] border-none ring-1 ring-slate-100 bg-white/80 focus:ring-2 focus:ring-indigo-500 font-extrabold uppercase placeholder:tracking-widest" type="text" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          <Input placeholder="PASSWORD" className="h-14 rounded-[1.2rem] border-none ring-1 ring-slate-100 bg-white/80 focus:ring-2 focus:ring-indigo-500 font-extrabold uppercase placeholder:tracking-widest" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
          
          {error && <p className="text-rose-500 text-[10px] font-black px-4 uppercase tracking-[0.2em] italic animate-pulse text-center">{error}</p>}
          
          <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-16 text-xs font-black rounded-[1.5rem] shadow-3xl shadow-indigo-200 mt-6 uppercase tracking-[0.3em] btn-bounce border-2 border-white/20">
            {isLogin ? 'Sign In' : 'Join Now'}
          </Button>
        </form>

        {role === UserRole.TEACHER && (
          <p className="text-center mt-8 text-slate-400 text-xs font-medium">
            {isLogin ? "Don't have a teacher account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-900 font-bold hover:underline decoration-slate-200 underline-offset-4">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        )}
        
        {role === UserRole.STUDENT && (
          <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Only Teacher-registered students can login
          </p>
        )}
      </div>
    </div>
  );
};

const HomePage = ({ user, books, users, onBorrow, onRateBook }: { user: User, books: Book[], users: User[], onBorrow: (id: string, targetId?: string) => void, onRateBook: (id: string, r: number, comment?: string) => void }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [ratingBook, setRatingBook] = useState<Book | null>(null);

  const filteredBooks = books.filter(b => 
    (category === 'All' || b.category === category) &&
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
  );

  const openBookDetails = (book: Book) => {
    setSelectedBook(book);
    setSummary(null);
    setLoadingSummary(false);
  };

  const handleFetchSummary = async () => {
    if (!selectedBook) return;
    setLoadingSummary(true);
    const text = await getKannadaSummary(selectedBook.title, selectedBook.author);
    setSummary(text);
    setLoadingSummary(false);
  };

  const handleBorrowClick = () => {
    onBorrow(selectedBook!.id);
    setSelectedBook(null);
  };

  const bookInModal = selectedBook ? (books.find(b => b.id === selectedBook.id) || selectedBook) : null;

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white/80 backdrop-blur-3xl z-30 px-6 pt-6 pb-4 border-b border-white/50">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">The <span className="text-gradient">Shelf</span></h1>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center border-2 border-white shadow-xl relative btn-bounce">
             <UserIcon className="w-5 h-5 text-white" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
        
        <div className="relative mb-5 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            placeholder="Search catalog..." 
            className="pl-14 h-12 rounded-xl border-none ring-1 ring-slate-100 bg-slate-50/30 focus:ring-2 focus:ring-indigo-500 shadow-inner text-xs font-bold transition-all"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 whitespace-nowrap scrollbar-hide">
          {['All', 'Story', 'Science', 'History'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 btn-bounce",
                category === cat 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-indigo-100"
              )}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 p-8">
        {filteredBooks.map(book => (
          <motion.div 
            layoutId={`book-${book.id}`}
            key={book.id}
            onClick={() => openBookDetails(book)}
            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/50 shadow-2xl shadow-indigo-100/30 hover:shadow-indigo-200/50 transition-all cursor-pointer group relative flex flex-col btn-bounce"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
              <img src={book.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {!book.isAvailable && (
                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 flex items-center justify-center p-4">
                   <div className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl rotate-[-4deg]">Issued</div>
                </div>
              )}
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-center gap-1 mb-2">
                 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                 <span className="text-[10px] font-black text-slate-900">{book.rating || 'N/A'}</span>
              </div>
              <h3 className="font-extrabold text-[13px] text-slate-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{book.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose truncate">{book.author}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                 <span className={cn(
                   "text-[9px] font-black uppercase px-3 py-1 rounded-full",
                   book.category === 'Story' ? 'bg-amber-100 text-amber-600' :
                   book.category === 'Science' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                 )}>{book.category}</span>
                 <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {ratingBook && (
          <motion.div 
            key="review-modal-outer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <ReviewModal 
              book={ratingBook}
              onClose={() => setRatingBook(null)}
              onRate={(r, c) => {
                onRateBook(ratingBook.id, r, c);
                setRatingBook(null);
              }}
            />
          </motion.div>
        )}
        {bookInModal && (
          <motion.div 
            key="book-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => {setSelectedBook(null); setSummary(null);}}
          >
            <motion.div 
              key="book-detail-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-t-[3rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-slate-100 relative"
            >
              {/* Rating float */}
              <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                <StarRating 
                  rating={bookInModal.rating || 0} 
                  interactive={user.role === UserRole.STUDENT}
                  onRate={() => setRatingBook(bookInModal)}
                />
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                  {bookInModal.ratingCount || 0} reviews
                </p>
              </div>

              <div className="flex gap-6 mb-6">
                <div className="w-24 h-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white">
                  <img src={bookInModal.coverUrl} className="w-full h-full object-cover " />
                </div>
                <div className="pt-2">
                  <h2 className="text-xl font-black mb-1 leading-tight text-slate-900 tracking-tight uppercase">{bookInModal.title}</h2>
                  <p className="text-slate-400 font-bold text-[10px] mb-3 uppercase italic">{bookInModal.author}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-50 text-slate-400 border border-slate-100 font-mono text-[8px] px-2">#{bookInModal.serialNumber}</Badge>
                    <Badge className={cn(
                      "text-[8px] px-2 font-black uppercase tracking-widest",
                      bookInModal.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    )}>
                      {bookInModal.isAvailable ? 'In Shelf' : 'Issued'}
                    </Badge>
                  </div>
                </div>
              </div>

              {bookInModal.reviews && bookInModal.reviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-widest text-[9px] mb-3 flex items-center gap-2">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Reviews
                  </h3>
                  <div className="space-y-2">
                    {bookInModal.reviews.slice(-2).reverse().map(rev => (
                      <div key={rev.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-[9px] font-black text-slate-900">{rev.userName}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={cn("w-1.5 h-1.5", s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-slate-900 rounded-[2rem] text-center">
                <div className="bg-white p-3 rounded-2xl inline-block mb-3">
                  <QRCodeCanvas 
                    value={bookInModal.serialNumber} 
                    size={100}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Book QR ID</p>
                <p className="text-white font-mono text-[10px] mt-0.5">{bookInModal.serialNumber}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px]">AI Kannada Summary</h3>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[4rem] text-slate-600 leading-relaxed font-semibold text-xs relative overflow-hidden italic">
                  {loadingSummary ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
                      Generating summary...
                    </div>
                  ) : summary ? (
                    summary
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <p className="text-slate-400 mb-4">Click below to generate an AI summary in Kannada.</p>
                      <Button 
                        onClick={handleFetchSummary}
                        className="bg-slate-900 text-white flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> Generate Summary
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {bookInModal.isAvailable ? (
                  <Button 
                    onClick={handleBorrowClick}
                    className="bg-slate-900 text-white w-full py-4 rounded-2xl shadow-xl shadow-slate-100"
                  >
                    {user.role === UserRole.TEACHER ? 'Issue Book' : 'Borrow Book'}
                  </Button>
                ) : (user.role === UserRole.TEACHER || bookInModal.borrowerId === user.id) && (
                  <Button 
                    onClick={() => {
                      onBorrow(bookInModal.id);
                      setSelectedBook(null);
                    }}
                    className="bg-emerald-600 text-white w-full py-4 rounded-2xl shadow-xl shadow-emerald-100"
                  >Return Book</Button>
                )}
                <Button 
                  onClick={() => {setSelectedBook(null); setSummary(null);}}
                  className="bg-white border border-slate-200 text-slate-400 w-full hover:bg-slate-50 transition-colors"
                >Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScannerPage = ({ user, books, users, onBorrow }: { user: User, books: Book[], users: User[], onBorrow: (id: string, targetId?: string) => void }) => {
  const [manualId, setManualId] = useState('');
  const [checkingBook, setCheckingBook] = useState<Book | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let scanner: any;
    const startScanner = () => {
      const element = document.getElementById("reader");
      if (!element) return;
      
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((result: string) => {
        handleCheck(result);
        try { scanner.pause(); } catch(e) {}
      }, (err: any) => {});
    };

    const timer = setTimeout(startScanner, 500);
    return () => {
      clearTimeout(timer);
      if (scanner) {
        try { scanner.clear(); } catch(e) {}
      }
    };
  }, []);

  const handleCheck = (serial: string) => {
    const book = books.find(b => b.serialNumber.toLowerCase() === serial.toLowerCase());
    if (book) {
      setCheckingBook(book);
      setError('');
    } else {
      setCheckingBook(null);
      setError('Book Serial Number not found.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="p-6 pb-24 italic h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">The <span className="text-gradient">Scanner</span></h1>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center border-2 border-white shadow-xl btn-bounce">
           <ScanLine className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white shadow-2xl mb-8 overflow-hidden relative group">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[50px] pointer-events-none" />
        <div id="reader" className="w-full relative z-10 rounded-[1.8rem] overflow-hidden"></div>
        <p className="text-center text-[9px] font-black text-indigo-400 mt-4 uppercase tracking-[0.2em] relative z-10">Sensor Active: Alignment Required</p>
      </div>

      <div className="relative flex items-center gap-4 mb-8">
        <hr className="flex-1 border-slate-100" />
        <span className="text-slate-300 font-black text-[9px] uppercase tracking-[0.25em] italic">Or Manual Entry</span>
        <hr className="flex-1 border-slate-100" />
      </div>

      <div className="flex gap-3">
        <Input 
          placeholder="NP-123" 
          value={manualId}
          onChange={(e: any) => setManualId(e.target.value.toUpperCase())}
          className="h-14 rounded-[1.2rem] border-none ring-1 ring-slate-100 bg-white/80 focus:ring-2 focus:ring-indigo-500 font-black uppercase tracking-widest text-center shadow-lg"
        />
        <Button 
          onClick={() => handleCheck(manualId)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.2rem] px-6 h-14 shadow-xl shadow-indigo-100 btn-bounce font-black"
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-rose-500 text-[10px] font-black mt-8 text-center uppercase tracking-widest italic animate-pulse"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {checkingBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-2xl w-full max-w-sm rounded-[3.5rem] p-10 shadow-3xl border border-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -mr-10 -mt-10" />
              
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">Access Confirmed</h3>
              <div className="flex gap-6 mb-10">
                <img src={checkingBook.coverUrl} className="w-20 h-28 object-cover rounded-2xl shadow-2xl relative z-10" />
                <div className="relative z-10">
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight mb-1 uppercase italic">{checkingBook.title}</h4>
                  <p className="text-[11px] text-slate-400 font-bold mb-4 italic">{checkingBook.author}</p>
                  <Badge className={cn(
                    "px-4 py-1.5 shadow-sm font-black text-[8px] uppercase tracking-widest",
                    checkingBook.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  )}>
                    {checkingBook.isAvailable ? 'In Shelf' : 'Issued'}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {checkingBook.isAvailable ? (
                  <Button 
                    onClick={() => {
                      onBorrow(checkingBook.id); 
                      setCheckingBook(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 btn-bounce"
                  >Confirm Issue</Button>
                ) : (checkingBook.borrowerId === user.id || user.role === UserRole.TEACHER) ? (
                  <Button 
                    onClick={() => {onBorrow(checkingBook.id); setCheckingBook(null);}}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-100 btn-bounce"
                  >Finish Return</Button>
                ) : (
                  <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 text-center">
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">Security Lock: Book issued to another member.</p>
                  </div>
                )}
                <Button 
                  onClick={() => setCheckingBook(null)}
                  className="bg-transparent text-slate-400 w-full py-3 h-auto font-black uppercase tracking-widest text-[9px] hover:text-slate-600 transition-colors"
                >Dismiss</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardPage = ({ user, books, users, onAddStudent, onAddBook, onDeleteStudent, onDeleteBook, onLogout, onBorrow, onUpdatePages }: { user: User, books: Book[], users: User[], onAddStudent: (u: User) => void, onAddBook: (b: Book) => void, onDeleteStudent: (id: string) => void, onDeleteBook: (id: string) => void, onLogout: () => void, onBorrow: (id: string) => void, onUpdatePages: (p: number) => void }) => {
  const borrowedBooks = books.filter(b => b.borrowerId === user.id);
  const isTeacher = user.role === UserRole.TEACHER;
  
  const issuedBooks = books.filter(b => !b.isAvailable);
  const overdueBooks = issuedBooks.filter(b => b.dueDate && new Date(b.dueDate) < new Date());

  const [activeForm, setActiveForm] = useState<'none' | 'book' | 'student'>('none');
  const [showStudentList, setShowStudentList] = useState(false);
  const [showBookList, setShowBookList] = useState(false);
  const [pagesInput, setPagesInput] = useState('');

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');

  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookSerial, setNewBookSerial] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Story');
  const [newBookCover, setNewBookCover] = useState('');

  const registeredMembers = users.filter(u => u.id !== user.id);
  const topStudents = [...users].filter(u => u.role === UserRole.STUDENT).sort((a, b) => (b.pagesRead || 0) - (a.pagesRead || 0)).slice(0, 5);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBookCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pagesInput);
    if (!isNaN(p) && p > 0) {
      onUpdatePages(p);
      setPagesInput('');
      alert('Reading progress updated!');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newStudentName.trim();
    const cleanId = newStudentId.trim();
    const cleanPass = newStudentPass.trim();

    if (!cleanName || !cleanId || !cleanPass) {
      alert('Please fill all student details');
      return;
    }
    if (users.some(u => u.id.toLowerCase() === cleanId.toLowerCase() || u.email.toLowerCase() === cleanId.toLowerCase())) {
      alert('A student with this ID/Email already exists');
      return;
    }

    const newStudent: User = {
      id: cleanId,
      name: cleanName,
      email: cleanId, // Using ID as email for login simplicity
      role: UserRole.STUDENT,
      password: cleanPass
    };

    onAddStudent(newStudent);
    setNewStudentName('');
    setNewStudentId('');
    setNewStudentPass('');
    setActiveForm('none');
    alert('Student registered successfully!');
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newBookTitle.trim();
    const cleanAuthor = newBookAuthor.trim();
    const cleanSerial = newBookSerial.trim();

    if (!cleanTitle || !cleanAuthor || !cleanSerial) {
      alert('Please fill all book details');
      return;
    }
    if (books.some(b => b.serialNumber.toLowerCase() === cleanSerial.toLowerCase())) {
      alert('A book with this Serial Number already exists');
      return;
    }

    const newBook: Book = {
      id: `B${Date.now()}`,
      title: cleanTitle,
      author: cleanAuthor,
      serialNumber: cleanSerial,
      category: newBookCategory,
      isAvailable: true,
      coverUrl: newBookCover || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&h=450&auto=format&fit=crop`
    };

    onAddBook(newBook);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookSerial('');
    setNewBookCover('');
    setActiveForm('none');
    alert('Book added to library successfully!');
  };

  return (
    <div className="p-6 pb-24 italic">
      <AnimatePresence>
        {isTeacher && overdueBooks.length > 0 && (
          <motion.div 
            key="overdue-alert"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-rose-500 text-white -mx-6 -mt-6 mb-6 p-4 flex items-center gap-4 shadow-lg sticky top-0 z-20"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Teacher Alert</p>
              <h4 className="text-xs font-bold">{overdueBooks.length} books are overdue!</h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-[3px] border-slate-900 -mx-2 -mt-2 p-5 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] -mr-15 -mt-15" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-3 group transition-transform">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">{user.name}</h2>
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">{user.role}</span>
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {user.id}</span>
          </div>
          <Button 
            onClick={onLogout}
            className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white px-5 py-2 h-auto rounded-xl text-[8px] font-black uppercase tracking-widest transition-all btn-bounce border border-rose-100/50"
          >Sign Out</Button>
        </div>
      </div>
      <div className="space-y-6">
        {isTeacher ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => setActiveForm(activeForm === 'book' ? 'none' : 'book')}
                className={cn(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all btn-bounce",
                  activeForm === 'book' ? "bg-indigo-600 border-indigo-600 text-white shadow-3xl shadow-indigo-200" : "bg-white/60 backdrop-blur-xl border-white text-slate-900 shadow-xl shadow-slate-100"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", activeForm === 'book' ? "bg-white/20" : "bg-indigo-50")}>
                  <BookIcon className={cn("w-5 h-5", activeForm === 'book' ? "text-white" : "text-indigo-600")} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add Book</span>
              </button>
              <button 
                onClick={() => setActiveForm(activeForm === 'student' ? 'none' : 'student')}
                className={cn(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all btn-bounce",
                  activeForm === 'student' ? "bg-purple-600 border-purple-600 text-white shadow-3xl shadow-purple-200" : "bg-white/60 backdrop-blur-xl border-white text-slate-900 shadow-xl shadow-slate-100"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", activeForm === 'student' ? "bg-white/20" : "bg-purple-50")}>
                  <UserIcon className={cn("w-5 h-5", activeForm === 'student' ? "text-white" : "text-purple-600")} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Student</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeForm === 'book' && (
                <motion.div 
                  key="add-book-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
                    <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-3 text-base uppercase tracking-widest">
                      <BookIcon className="w-5 h-5" /> Add New Book
                    </h3>
                    <form onSubmit={handleAddBook} className="space-y-4">
                      {/* Photo Upload Area */}
                      <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group">
                          <div className={cn(
                            "w-32 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all",
                            newBookCover ? "border-slate-900 border-solid" : "border-slate-200 bg-white"
                          )}>
                            {newBookCover ? (
                              <img src={newBookCover} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImagePlus className="w-8 h-8 text-slate-300 mb-2" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 text-center">No Photo Selected</span>
                              </>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform border-4 border-slate-50">
                            <Camera className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                        <div className="w-full">
                          <Input 
                            placeholder="Or paste image URL here..." 
                            value={newBookCover} 
                            onChange={(e: any) => setNewBookCover(e.target.value)} 
                            className="bg-white text-[10px] h-9 rounded-xl"
                          />
                        </div>
                      </div>

                      <Input placeholder="Book Title" value={newBookTitle} onChange={(e: any) => setNewBookTitle(e.target.value)} className="bg-white" />
                      <Input placeholder="Author Name" value={newBookAuthor} onChange={(e: any) => setNewBookAuthor(e.target.value)} className="bg-white" />
                      <Input placeholder="Unique Serial Code" value={newBookSerial} onChange={(e: any) => setNewBookSerial(e.target.value)} className="bg-white" />
                      <select 
                        value={newBookCategory} 
                        onChange={(e) => setNewBookCategory(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="Story">Story</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                      </select>
                      <Button type="submit" className="w-full bg-slate-900 text-white py-3">Add to Library</Button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeForm === 'student' && (
                <motion.div 
                   key="add-student-form"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="overflow-hidden mb-8"
                >
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
                    <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-3 text-base uppercase tracking-widest">
                      <UserIcon className="w-5 h-5" /> Register Student
                    </h3>
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <Input placeholder="Student Full Name" value={newStudentName} onChange={(e: any) => setNewStudentName(e.target.value)} className="bg-white" />
                      <Input placeholder="Role Number / Unique ID" value={newStudentId} onChange={(e: any) => setNewStudentId(e.target.value)} className="bg-white" />
                      <Input placeholder="Create Login Password" type="password" value={newStudentPass} onChange={(e: any) => setNewStudentPass(e.target.value)} className="bg-white" />
                      <Button type="submit" className="w-full bg-slate-900 text-white py-3">Register Student</Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-2 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-3 text-base uppercase tracking-widest italic">
                  <Award className="w-6 h-6 text-amber-500" /> Reader Leaderboard
                </h3>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-[60px] -mr-10 -mt-10" />
                {topStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg",
                        i === 0 ? "bg-amber-400 text-slate-900" : "bg-white/10 text-white/50"
                      )}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight mb-0.5">{s.name}</p>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{s.pagesRead || 0} pages logged</p>
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                         <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                         <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Champ</span>
                      </div>
                    )}
                  </div>
                ))}
                {topStudents.length === 0 && <p className="text-center text-white/40 italic py-6 text-xs font-medium uppercase tracking-widest">No reading data yet.</p>}
              </div>
            </div>

            <div className="px-2">
              <button 
                onClick={() => setShowStudentList(!showStudentList)}
                className="w-full flex items-center justify-between mb-6 group"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-widest">
                    <UserIcon className="w-5 h-5 inline mr-2" /> Registered Members
                  </h3>
                  <Badge className="bg-slate-100 text-slate-500">{registeredMembers.length}</Badge>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", showStudentList && "rotate-90")} />
              </button>

              <AnimatePresence>
                {showStudentList && (
                  <motion.div 
                    key="student-list-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-4 pb-10">
                      {registeredMembers.map(s => {
                        const sBorrowed = books.filter(b => b.borrowerId === s.id);
                        return (
                          <div key={s.id} className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white flex flex-col gap-5 shadow-xl shadow-slate-200/30 group hover:bg-white transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-black text-slate-900 text-base tracking-tighter uppercase italic">{s.name}</p>
                                    <Badge className={cn("text-[7px] font-black uppercase tracking-widest", s.role === UserRole.TEACHER ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600")}>
                                      {s.role}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {s.id}</p>
                                </div>
                              </div>
                              {s.role !== UserRole.TEACHER && (
                                <button 
                                  onClick={() => onDeleteStudent(s.id)}
                                  className="w-12 h-12 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-100/50 flex items-center justify-center shadow-lg shadow-rose-100/50 btn-bounce"
                                  title="Remove Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {sBorrowed.length > 0 && (
                              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Borrows:</p>
                                {sBorrowed.map(b => (
                                  <div key={b.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{b.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {sBorrowed.length === 0 && s.role === UserRole.STUDENT && (
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic text-center">No active borrows</p>
                            )}
                          </div>
                        );
                      })}
                      {registeredMembers.length === 0 && <p className="text-center text-slate-400 italic py-4">No other members registered.</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-2 mb-10">
              <button 
                onClick={() => setShowBookList(!showBookList)}
                className="w-full flex items-center justify-between mb-6 group"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-widest">
                    <Library className="w-5 h-5 inline mr-2 text-indigo-500" /> Library Inventory
                  </h3>
                  <Badge className="bg-slate-100 text-slate-500">{books.length}</Badge>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", showBookList && "rotate-90")} />
              </button>

              <AnimatePresence>
                {showBookList && (
                  <motion.div 
                    key="book-inventory-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-4 pb-10">
                      {books.map(b => (
                        <div key={b.id} className="bg-white/60 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white flex items-center gap-4 shadow-xl shadow-slate-200/40 group hover:bg-white transition-colors">
                          <img src={b.coverUrl} className="w-14 h-20 object-cover rounded-2xl shadow-xl transition-transform group-hover:scale-110" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate mb-1">{b.title}</h4>
                            <div className="flex items-center gap-2">
                               <Badge className={cn(
                                "text-[7px] font-black uppercase tracking-tighter px-2",
                                b.isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {b.isAvailable ? 'In Shelf' : 'Borrowed'}
                              </Badge>
                              <span className="text-[9px] text-slate-300 font-bold">SN: {b.serialNumber}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => onDeleteBook(b.id)}
                            className="w-12 h-12 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-100/50 flex items-center justify-center shadow-lg shadow-rose-100/50 btn-bounce"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-3 text-base uppercase tracking-widest">
                  <LayoutDashboard className="w-5 h-5" /> Digital Register
                </h3>
                <Badge className="bg-slate-900 text-white">{issuedBooks.length} ACTIVE</Badge>
              </div>
              <div className="space-y-4">
                {issuedBooks.map(book => {
                  const isOverdue = book.dueDate && new Date(book.dueDate) < new Date();
                  const bUser = users.find(u => u.id === book.borrowerId);
                  return (
                    <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                      <img src={book.coverUrl} className="w-14 h-20 object-cover rounded-xl shadow-md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate text-slate-900">{book.title}</h4>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Student: {bUser?.name || 'Unknown'}</p>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn("text-[8px]", isOverdue ? "bg-rose-50 text-rose-600 animate-pulse border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                            {isOverdue ? `LATE - ${formatDate(book.dueDate)}` : `DUE ${formatDate(book.dueDate)}`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {issuedBooks.length === 0 && (
                  <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Register is clean</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-3 text-base uppercase tracking-widest">
                <Library className="w-5 h-5 transition-transform hover:scale-110" /> Borrowed Shelf
              </h3>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-[3.5rem] border border-white shadow-3xl mb-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-6 px-2 relative z-10 transition-transform group-hover:translate-x-1">Daily Reading Spark</h4>
              <form onSubmit={handleUpdateProgress} className="flex gap-4 relative z-10">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Pages read today..." 
                    className="bg-white/20 backdrop-blur-md rounded-2xl pr-14 border-white/30 text-white placeholder:text-white/60 font-black focus:ring-white/50 h-14"
                    type="number"
                    value={pagesInput}
                    onChange={(e: any) => setPagesInput(e.target.value)}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/40 uppercase">PGS</span>
                </div>
                <Button type="submit" className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl px-10 h-14 flex items-center gap-2 shadow-2xl btn-bounce font-black uppercase tracking-widest text-[10px]">
                  GO
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              {borrowedBooks.map(book => {
                const isOverdue = book.dueDate && new Date(book.dueDate) < new Date();
                return (
                  <motion.div 
                    layout
                    key={book.id} 
                    className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm group hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img src={book.coverUrl} className="w-16 h-24 object-cover rounded-2xl shadow-xl transition-transform group-hover:scale-105" />
                      {isOverdue && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <AlertCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-base truncate text-slate-900 mb-1">{book.title}</h4>
                      <div className="flex items-center gap-2">
                        <Clock className={cn("w-3 h-3", isOverdue ? "text-rose-500" : "text-indigo-300")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isOverdue ? "text-rose-600" : "text-indigo-400")}>
                          {isOverdue ? 'Overdue' : 'Due'}: {formatDate(book.dueDate)}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => onBorrow(book.id)}
                        className="mt-4 px-6 py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl font-black uppercase tracking-widest text-[9px] border border-slate-100 hover:border-rose-100 transition-all flex items-center gap-2"
                      >
                        <RefreshCcw className="w-3 h-3" /> Return Book
                      </Button>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                       <CheckCircle className="w-8 h-8 text-emerald-100 fill-emerald-500" />
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Active</span>
                    </div>
                  </motion.div>
                )
              })}
              {borrowedBooks.length === 0 && (
                <div className="bg-slate-50/50 rounded-[2.5rem] py-16 border border-dashed border-slate-200 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <BookIcon className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-extrabold text-xs uppercase tracking-widest leading-loose">
                    Your collection is currently empty<br/>
                    <span className="text-[10px] font-medium tracking-normal text-slate-300">EXPLORE THE LIBRARY TO START READING</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Navigation Wrapper ---

const Layout = ({ user, children }: { user: User, children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { label: 'Shelf', path: '/home', icon: Library },
    { label: 'Scanner', path: '/scanner', icon: QrCode },
    { label: 'Profile', path: '/dashboard', icon: UserIcon },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pb-24">
        {children}
      </div>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 flex justify-around p-1.5 z-[100] rounded-[1.8rem] shadow-3xl">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all px-4 py-2.5 rounded-[1.2rem] btn-bounce min-w-[65px]",
                isActive ? "text-white bg-indigo-600 shadow-lg scale-105" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn("text-[8px] font-black uppercase tracking-[0.15em]", isActive ? "block" : "hidden")}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- Main App Entry ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('np_user');
    const savedUsers = localStorage.getItem('np_users');
    const savedBooks = localStorage.getItem('np_books');
    if (saved) setCurrentUser(JSON.parse(saved));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    setIsLoading(false);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('np_books', JSON.stringify(books));
    }
  }, [books, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('np_users', JSON.stringify(users));
    }
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      localStorage.setItem('np_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isLoading]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('np_user');
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, { ...user, pagesRead: 0 }]);
  };

  const handleAddBook = (book: Book) => {
    setBooks(prev => [book, ...prev]);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student and all their access?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Also clear active borrows for this user
      setBooks(prev => prev.map(b => 
        b.borrowerId === id ? { ...b, isAvailable: true, borrowerId: undefined, dueDate: undefined } : b
      ));

      alert('Student and their borrowing history removed successfully.');

      if (currentUser?.id === id) {
        handleLogout();
      }
    }
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book from the library? This cannot be undone.')) {
      setBooks(prev => prev.filter(b => b.id !== id));
      alert('Book removed from the library catalog.');
    }
  };

  const [assigningBook, setAssigningBook] = useState<Book | null>(null);

  const handleBorrow = (bookId?: string, targetId?: string, serial?: string) => {
    if (!currentUser) return;
    
    // Find book by ID or Serial
    const b = books.find(book => 
      (bookId && book.id === bookId) || (serial && book.serialNumber.toLowerCase() === serial.toLowerCase())
    );

    if (!b) {
      if (bookId || serial) alert("Error: Book reference not found.");
      return;
    }

    // Return logic: 
    // 1. Teacher clicking Return (targetId is usually null here)
    // 2. Student returning their own book
    const isTeacherAction = currentUser.role === UserRole.TEACHER && !b.isAvailable && !targetId;
    const isOwnBook = b.borrowerId === currentUser.id;

    if (isTeacherAction || isOwnBook) {
      setBooks(prev => prev.map(book => 
        book.id === b.id ? { ...book, isAvailable: true, borrowerId: undefined, dueDate: undefined } : book
      ));
      alert(`Book '${b.title}' returned successfully! It is now available for everyone.`);
      return;
    }

    // Issue/Borrow logic:
    if (!b.isAvailable) {
      alert(`Book '${b.title}' is already issued.`);
      return;
    }

    // If teacher is issuing without a target student, show student selector
    if (currentUser.role === UserRole.TEACHER && !targetId) {
      setAssigningBook(b);
      return;
    }

    const borrowerId = targetId || currentUser.id;
    const borrower = users.find(u => u.id === borrowerId) || (borrowerId === currentUser.id ? currentUser : null);

    if (!borrower) {
      alert("Please select a student.");
      return;
    }

    if (borrower.role === UserRole.TEACHER) {
      alert("Teachers are not allowed to borrow books directly.");
      return;
    }
    
    const due = new Date();
    due.setDate(due.getDate() + 14);
    
    alert(`Issuing '${b.title}' to ${borrower.name}...`);
    
    setBooks(prev => prev.map(book => 
      book.id === b.id ? { 
        ...book, 
        isAvailable: false, 
        borrowerId: borrowerId, 
        dueDate: due.toISOString().split('T')[0] 
      } : book
    ));
    setAssigningBook(null);
  };

  const handleRateBook = (id: string, rating: number, comment?: string) => {
    if (!currentUser) return;
    setBooks(prevBooks => {
      const updatedBooks = prevBooks.map(b => {
        if (b.id === id) {
          const count = (b.ratingCount || 0) + 1;
          const currentRating = b.rating || 0;
          const newRatingVal = ((currentRating * (count - 1)) + rating) / count;
          
          const newReview: Review = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser.id,
            userName: currentUser.name,
            rating,
            comment: comment || '',
            date: new Date().toISOString()
          };

          return { 
            ...b, 
            rating: Number(newRatingVal.toFixed(1)), 
            ratingCount: count,
            reviews: [...(b.reviews || []), newReview]
          };
        }
        return b;
      });
      return updatedBooks;
    });
    alert('Thank you for your review!');
  };

  const handleUpdatePages = (pages: number) => {
    if (!currentUser) return;
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(u => 
        u.id === currentUser.id ? { ...u, pagesRead: (u.pagesRead || 0) + pages } : u
      );
      
      // Update current user state as well
      const updatedMe = newUsers.find(u => u.id === currentUser.id);
      if (updatedMe) {
        setCurrentUser(updatedMe);
      }
      return newUsers;
    });
  };

  if (isLoading) return null;

  return (
    <BrowserRouter>
    <div className="max-w-[430px] mx-auto h-[100dvh] sm:h-[90vh] sm:my-[5vh] bg-white/95 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.1)] relative overflow-hidden sm:rounded-[3.5rem] border-x border-slate-100/50 italic flex flex-col overscroll-none select-none">
      {/* Real Mobile Feel - Inner Glossy UI */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-rose-500/10 to-transparent" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 8, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, -12, 0]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full"
        />
        
        {/* Subtle Paper/Vellum Texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage users={users} onLogin={handleLogin} onRegister={handleAddUser} />} />
            
            <Route 
              path="/home" 
              element={currentUser ? (
                <Layout user={currentUser}>
                  <HomePage 
                    user={currentUser} 
                    books={books} 
                    users={users} 
                    onBorrow={handleBorrow} 
                    onRateBook={handleRateBook} 
                  />
                </Layout>
              ) : <Navigate to="/auth" />} 
            />
            <Route 
              path="/scanner" 
              element={currentUser ? (
                <Layout user={currentUser}>
                  <ScannerPage user={currentUser} books={books} users={users} onBorrow={handleBorrow} />
                </Layout>
              ) : <Navigate to="/auth" />} 
            />
            <Route 
              path="/dashboard" 
              element={currentUser ? (
                <Layout user={currentUser}>
                  <DashboardPage 
                    user={currentUser} 
                    books={books} 
                    users={users}
                    onAddStudent={handleAddUser}
                    onAddBook={handleAddBook}
                    onDeleteStudent={handleDeleteUser}
                    onDeleteBook={handleDeleteBook}
                    onLogout={handleLogout} 
                    onBorrow={handleBorrow}
                    onUpdatePages={handleUpdatePages}
                  />
                </Layout>
              ) : <Navigate to="/auth" />} 
            />
          </Routes>
        </AnimatePresence>
        <AnimatePresence>
          {assigningBook && (
            <StudentSelector 
              users={users.filter(u => u.role === UserRole.STUDENT)}
              onSelect={(student) => handleBorrow(assigningBook.id, student.id)}
              onClose={() => setAssigningBook(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
    </BrowserRouter>
  );
}
