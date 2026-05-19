import { Book, User, UserRole } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    serialNumber: 'NP-001',
    title: 'Kuvempu: Life & Works',
    author: 'Kuvempu',
    category: 'History',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    rating: 4.8,
    ratingCount: 12
  },
  {
    id: '2',
    serialNumber: 'NP-002',
    title: 'Modern Science Explained',
    author: 'Dr. C.N.R. Rao',
    category: 'Science',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    isAvailable: false,
    borrowerId: 'u2',
    dueDate: '2026-05-10', // Overdue
    rating: 4.5,
    ratingCount: 8
  },
  {
    id: '3',
    serialNumber: 'NP-003',
    title: 'Karnataka Folk Tales',
    author: 'Traditional',
    category: 'Story',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    rating: 4.9,
    ratingCount: 25
  },
  {
    id: '4',
    serialNumber: 'NP-004',
    title: 'Shivaji: The Great King',
    author: 'Jadunath Sarkar',
    category: 'History',
    coverUrl: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    rating: 4.7,
    ratingCount: 15
  },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Student One', email: 'student@np.com', role: UserRole.STUDENT, password: 'password', pagesRead: 120 },
  { id: 'u2', name: 'Student Two', email: 'late@np.com', role: UserRole.STUDENT, password: 'password', pagesRead: 85 },
  { id: 'u3', name: 'Teacher Ravi', email: 'teacher@np.com', role: UserRole.TEACHER, password: 'password', pagesRead: 0 },
];
