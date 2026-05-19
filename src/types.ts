/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  pagesRead?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  serialNumber: string;
  title: string;
  author: string;
  category: 'Story' | 'Science' | 'History';
  coverUrl: string;
  isAvailable: boolean;
  borrowerId?: string;
  dueDate?: string;
  rating?: number;
  ratingCount?: number;
  reviews?: Review[];
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returned: boolean;
}
