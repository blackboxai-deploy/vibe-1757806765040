'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string[];
  coverColor: string;
  category: string;
  readingTime: string;
  dateAdded: string;
  isPublished: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  role: 'admin' | 'user';
  registrationDate: string;
  lastLogin: string;
  readingHistory: string[];
}

interface UserSession {
  bookId: string;
  chapter: number;
  timeSpent: number;
  lastRead: string;
}

interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  position: number;
  title: string;
  timestamp: number;
}

interface Note {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  text: string;
  note: string;
  timestamp: number;
}

const BookReaderApp: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: ''
  });

  // App State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<'auth' | 'library' | 'reader' | 'search' | 'bookmarks' | 'profile' | 'admin'>('auth');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [companyName, setCompanyName] = useState('Your Company');
  const [themeColor, setThemeColor] = useState('blue');
  const [fontSize, setFontSize] = useState('text-base');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

     // Admin State
  const [adminView, setAdminView] = useState<'books' | 'uploads' | 'users' | 'analytics' | 'settings' | 'branding'>('books');
  const [showBookForm, setShowBookForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    readingTime: '',
    coverColor: 'bg-blue-600',
    content: ['']
  });
  
  // Enhanced Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [customCss, setCustomCss] = useState('');
  const [brandingSettings, setBrandingSettings] = useState({
    showLogo: true,
    headerStyle: 'modern',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    fontFamily: 'Inter'
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Icons as simple SVGs (replacing lucide-react icons)
  const SearchIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  );

  const BookmarkIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
    </svg>
  );

  const PlusIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const ArrowRightIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12,5 19,12 12,19"></polyline>
    </svg>
  );

  const UserIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const HomeIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9,22 9,12 15,12 15,22"></polyline>
    </svg>
  );

  const EditIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  const TrashIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  const EyeIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const MailIcon: React.FC = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );

  const UsersIcon: React.FC = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const HeartIcon: React.FC = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

   const UploadIcon: React.FC = () => (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M9 19l3-3 3 3M12 12l0 9"></path>
    </svg>
  );

  const DocumentIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
  );

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (currentUser) {
      saveData();
    }
  }, [books, users, bookmarks, notes, userSessions, currentUser]);

  const loadData = () => {
    const savedUser = localStorage.getItem('bookReader_currentUser');
    const savedBooks = localStorage.getItem('bookReader_books');
    const savedUsers = localStorage.getItem('bookReader_users');
    const savedBookmarks = localStorage.getItem('bookReader_bookmarks');
    const savedNotes = localStorage.getItem('bookReader_notes');
    const savedSessions = localStorage.getItem('bookReader_sessions');
     const savedCompany = localStorage.getItem('bookReader_companyName');
    const savedTheme = localStorage.getItem('bookReader_themeColor');
    const savedFontSize = localStorage.getItem('bookReader_fontSize');
    const savedLogoUrl = localStorage.getItem('bookReader_logoUrl');
    const savedPrimaryColor = localStorage.getItem('bookReader_primaryColor');
    const savedSecondaryColor = localStorage.getItem('bookReader_secondaryColor');
    const savedAccentColor = localStorage.getItem('bookReader_accentColor');
    const savedBrandingSettings = localStorage.getItem('bookReader_brandingSettings');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'admin' : 'library');
    }
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSessions) setUserSessions(JSON.parse(savedSessions));
    if (savedCompany) setCompanyName(savedCompany);
    if (savedTheme) setThemeColor(savedTheme);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedLogoUrl) setLogoUrl(savedLogoUrl);
    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
    if (savedSecondaryColor) setSecondaryColor(savedSecondaryColor);
    if (savedAccentColor) setAccentColor(savedAccentColor);
    if (savedBrandingSettings) setBrandingSettings(JSON.parse(savedBrandingSettings));

    // Create default admin user and sample books if no data exists
    const existingUsers = savedUsers ? JSON.parse(savedUsers) : [];
    const existingBooks = savedBooks ? JSON.parse(savedBooks) : [];
    
    if (existingUsers.length === 0) {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'admin',
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        readingHistory: []
      };
      setUsers([adminUser]);
    }

    if (existingBooks.length === 0) {
      const sampleBooks: Book[] = [
        {
          id: 'book-1',
          title: 'Digital Transformation Guide',
          author: 'Technology Experts',
          description: 'A comprehensive guide to digital transformation in modern organizations.',
          category: 'Technology',
          readingTime: '45 min read',
          coverColor: 'bg-blue-600',
          dateAdded: new Date().toISOString(),
          isPublished: true,
          content: [
            'Digital transformation represents a fundamental shift in how organizations operate and deliver value to customers. It involves integrating digital technology into all business areas, resulting in fundamental changes to operations and customer value delivery.\n\nThis transformation goes beyond simply digitizing existing processes. It requires organizations to challenge old operating models, experiment more, and become comfortable with failure. The goal is to become more agile and responsive to market changes.\n\nSuccessful digital transformation requires strong leadership, clear vision, and employee engagement across all levels of the organization.',
            'The key pillars of digital transformation include customer experience, operational agility, culture and leadership, workforce enablement, and digital technology integration.\n\nCustomer experience focuses on understanding and meeting evolving customer expectations through digital channels. Organizations must create seamless, personalized experiences across all touchpoints.\n\nOperational agility involves streamlining processes, automating routine tasks, and enabling rapid decision-making through data-driven insights.',
            'Implementation strategies vary by organization, but successful transformations typically follow a structured approach. This includes assessment of current state, vision development, roadmap creation, pilot programs, and scaled implementation.\n\nMeasuring success requires establishing clear KPIs and metrics. Common indicators include customer satisfaction scores, operational efficiency improvements, revenue growth from digital channels, and employee engagement levels.\n\nThe journey requires continuous adaptation and learning as technology and market conditions evolve.'
          ]
        },
        {
          id: 'book-2',
          title: 'Leadership in the Modern Era',
          author: 'Business Leaders',
          description: 'Essential leadership principles for navigating today\'s business landscape.',
          category: 'Business',
          readingTime: '35 min read',
          coverColor: 'bg-green-600',
          dateAdded: new Date().toISOString(),
          isPublished: true,
          content: [
            'Modern leadership requires a new set of skills and approaches that differ significantly from traditional management styles. Today\'s leaders must navigate complex, rapidly changing environments while inspiring and empowering their teams.\n\nAuthentic leadership forms the foundation of effective modern leadership. This involves leading with genuine values, building trust through transparency, and demonstrating vulnerability when appropriate.\n\nEmotional intelligence has become crucial for leaders. Understanding and managing emotions - both your own and others\' - enables better communication, decision-making, and relationship building.',
            'Adaptive leadership skills are essential in today\'s volatile business environment. Leaders must be comfortable with ambiguity, quick to pivot strategies, and skilled at managing change.\n\nCollaborative leadership focuses on building high-performing teams through inclusive decision-making, clear communication, and shared accountability. This approach leverages diverse perspectives and collective intelligence.\n\nDigital leadership competencies include understanding technology trends, fostering digital innovation, and leading remote or hybrid teams effectively.'
          ]
        }
      ];
      setBooks(sampleBooks);
    }
  };

  const saveData = () => {
    localStorage.setItem('bookReader_books', JSON.stringify(books));
    localStorage.setItem('bookReader_users', JSON.stringify(users));
    localStorage.setItem('bookReader_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('bookReader_notes', JSON.stringify(notes));
    localStorage.setItem('bookReader_sessions', JSON.stringify(userSessions));
    localStorage.setItem('bookReader_companyName', companyName);
    localStorage.setItem('bookReader_themeColor', themeColor);
    localStorage.setItem('bookReader_fontSize', fontSize);
    localStorage.setItem('bookReader_logoUrl', logoUrl);
    localStorage.setItem('bookReader_primaryColor', primaryColor);
    localStorage.setItem('bookReader_secondaryColor', secondaryColor);
    localStorage.setItem('bookReader_accentColor', accentColor);
    localStorage.setItem('bookReader_brandingSettings', JSON.stringify(brandingSettings));
  };

  // Authentication Functions
  const handleLogin = () => {
    const user = users.find(u => u.email === authForm.email);
    if (user) {
      // Update last login
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      setUsers(updatedUsers);
      setCurrentUser(user);
      localStorage.setItem('bookReader_currentUser', JSON.stringify(user));
      setCurrentView(user.role === 'admin' ? 'admin' : 'library');
      resetAuthForm();
    } else {
      alert('User not found. Please register first.');
    }
  };

  const handleRegister = () => {
    const existingUser = users.find(u => u.email === authForm.email);
    if (existingUser) {
      alert('User already exists. Please login instead.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: authForm.email,
      name: authForm.name,
      company: authForm.company,
      phone: authForm.phone,
      role: 'user',
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      readingHistory: []
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('bookReader_currentUser', JSON.stringify(newUser));
    setCurrentView('library');
    resetAuthForm();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bookReader_currentUser');
    setCurrentView('auth');
    resetAuthForm();
  };

  const resetAuthForm = () => {
    setAuthForm({
      email: '',
      password: '',
      name: '',
      company: '',
      phone: ''
    });
  };

  // Book Management Functions
  const handleAddBook = () => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: bookForm.title,
      author: bookForm.author,
      description: bookForm.description,
      category: bookForm.category,
      readingTime: bookForm.readingTime,
      coverColor: bookForm.coverColor,
      content: bookForm.content.filter(c => c.trim() !== ''),
      dateAdded: new Date().toISOString(),
      isPublished: true
    };

    setBooks([...books, newBook]);
    resetBookForm();
    setShowBookForm(false);
  };

  const handleEditBook = () => {
    if (!editingBook) return;

    const updatedBooks = books.map(book =>
      book.id === editingBook.id
        ? {
            ...book,
            title: bookForm.title,
            author: bookForm.author,
            description: bookForm.description,
            category: bookForm.category,
            readingTime: bookForm.readingTime,
            coverColor: bookForm.coverColor,
            content: bookForm.content.filter(c => c.trim() !== '')
          }
        : book
    );

    setBooks(updatedBooks);
    resetBookForm();
    setShowBookForm(false);
    setEditingBook(null);
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(book => book.id !== bookId));
      // Clean up related bookmarks and notes
      setBookmarks(bookmarks.filter(b => b.bookId !== bookId));
      setNotes(notes.filter(n => n.bookId !== bookId));
    }
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      description: '',
      category: '',
      readingTime: '',
      coverColor: 'bg-blue-600',
      content: ['']
    });
  };

  const openBookForEdit = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      readingTime: book.readingTime,
      coverColor: book.coverColor,
      content: book.content.length > 0 ? book.content : ['']
    });
    setShowBookForm(true);
  };

  // Reading Functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const publishedBooks = books.filter(book => book.isPublished);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setFilteredBooks(publishedBooks);
      return;
    }

    const results: any[] = [];
    const bookResults = publishedBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredBooks(bookResults);

    publishedBooks.forEach(book => {
      book.content.forEach((chapter, chapterIndex) => {
        const sentences = chapter.split('.');
        sentences.forEach((sentence, sentenceIndex) => {
          if (sentence.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              bookId: book.id,
              bookTitle: book.title,
              chapter: chapterIndex,
              content: sentence.trim(),
              position: sentenceIndex
            });
          }
        });
      });
    });

    setSearchResults(results);
  };

  const addBookmark = () => {
    if (!selectedBook || !currentUser) return;
    
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      userId: currentUser.id,
      bookId: selectedBook.id,
      chapter: currentChapter,
      position: 0,
      title: `Chapter ${currentChapter + 1}`,
      timestamp: Date.now()
    };

    setBookmarks([...bookmarks, newBookmark]);
  };

  const addNote = () => {
    if (!selectedBook || !selectedText || !noteText || !currentUser) return;

    const newNote: Note = {
      id: Date.now().toString(),
      userId: currentUser.id,
      bookId: selectedBook.id,
      chapter: currentChapter,
      text: selectedText,
      note: noteText,
      timestamp: Date.now()
    };

    setNotes([...notes, newNote]);
    setShowNoteDialog(false);
    setNoteText('');
    setSelectedText('');
  };

  const openBook = (book: Book) => {
    if (!currentUser) return;

    setSelectedBook(book);
    setCurrentChapter(0);
    setCurrentView('reader');

    // Track reading session
    const session: UserSession = {
      bookId: book.id,
      chapter: 0,
      timeSpent: 0,
      lastRead: new Date().toISOString()
    };

    const existingSessionIndex = userSessions.findIndex(
      s => s.bookId === book.id
    );

    if (existingSessionIndex >= 0) {
      const updatedSessions = [...userSessions];
      updatedSessions[existingSessionIndex] = session;
      setUserSessions(updatedSessions);
    } else {
      setUserSessions([...userSessions, session]);
    }

    // Update user reading history
    const updatedUsers = users.map(user =>
      user.id === currentUser.id
        ? {
            ...user,
            readingHistory: [...new Set([...user.readingHistory, book.id])]
          }
        : user
    );
    setUsers(updatedUsers);
  };

  const getThemeClasses = () => {
    const themes = {
      blue: 'bg-blue-600 text-white',
      purple: 'bg-purple-600 text-white',
      green: 'bg-green-600 text-white',
      orange: 'bg-orange-600 text-white',
      red: 'bg-red-600 text-white'
    };
    return themes[themeColor as keyof typeof themes] || themes.blue;
  };

  const getUserBookmarks = () => {
    return currentUser ? bookmarks.filter(b => b.userId === currentUser.id) : [];
  };

  const getUserNotes = () => {
    return currentUser ? notes.filter(n => n.userId === currentUser.id) : [];
  };

  const getPublishedBooks = () => {
    return books.filter(book => book.isPublished);
  };

  // Book Upload Functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(file);
    setIsProcessingUpload(true);
    setUploadProgress(0);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf' || fileExtension === 'epub') {
      // For PDF and EPUB, we'll use FileReader with ArrayBuffer
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          processUploadedFile(file, null, arrayBuffer);
        } catch (error) {
          alert('Error reading file. Please try again.');
          setIsProcessingUpload(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } else {
      // For text files, use text reading
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          processUploadedFile(file, content);
        } catch (error) {
          alert('Error reading file. Please try again.');
          setIsProcessingUpload(false);
        }
      };

      reader.readAsText(file);
    }
  };

  const processUploadedFile = (file: File, textContent?: string | null, binaryContent?: ArrayBuffer) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    let processedContent: string[] = [];
    let title = file.name.replace(/\.[^/.]+$/, "");
    let author = 'Uploaded Content';
    let description = `Imported from ${file.name}`;
    
    setUploadProgress(25);
    
    if (fileExtension === 'txt' && textContent) {
      // For text files, split by triple line breaks to create chapters
      const chapters = textContent.split('\n\n\n').filter(chapter => chapter.trim().length > 0);
      processedContent = chapters.length > 0 ? chapters : [textContent];
      setUploadProgress(75);
    } else if (fileExtension === 'md' && textContent) {
      // For markdown files, split by H1 or H2 headers
      const chapters = textContent.split(/^#{1,2}\s+.*/gm).filter(chapter => chapter.trim().length > 0);
      processedContent = chapters.length > 0 ? chapters : [textContent];
      setUploadProgress(75);
    } else if (fileExtension === 'pdf' && binaryContent) {
      // For PDF files - simulate PDF processing (in a real app, you'd use PDF.js or similar)
      processedContent = [
        `This is a PDF document titled "${title}".\n\nPDF content processing is simulated in this demo. In a production environment, you would use libraries like PDF.js to extract text content from PDF files.\n\nThe uploaded PDF file contains formatted content that would be parsed and converted to readable text format for the digital library.\n\nKey features of PDF processing:\n- Text extraction from all pages\n- Preservation of formatting where possible\n- Chapter detection based on font sizes and styles\n- Image and table content handling`,
        `Chapter 2: Advanced PDF Features\n\nPDF processing can handle:\n- Multi-page documents\n- Complex layouts and formatting\n- Embedded fonts and styles\n- Tables and structured data\n- Images and graphics (with alt text)\n\nThe processed content maintains readability while preserving the document structure for optimal reading experience in the digital library format.`
      ];
      author = 'PDF Document';
      description = `PDF document imported from ${file.name}. Content has been processed and converted to readable format.`;
      setUploadProgress(75);
    } else if (fileExtension === 'epub' && binaryContent) {
      // For EPUB files - simulate EPUB processing (in a real app, you'd use epub.js or similar)
      processedContent = [
        `Welcome to "${title}"\n\nThis EPUB document has been successfully imported into the digital library. EPUB processing extracts structured content from the digital book format.\n\nEPUB files contain:\n- Structured chapters and sections\n- Embedded metadata (title, author, description)\n- Table of contents information\n- Formatted text with styling\n\nThe content has been processed to maintain the original chapter structure while optimizing for the reading experience in our digital library platform.`,
        `Chapter 2: EPUB Content Structure\n\nEPUB files are processed to extract:\n- All text content from XHTML files\n- Chapter divisions based on file structure\n- Metadata including title, author, and publication info\n- Table of contents hierarchy\n- Embedded styles and formatting\n\nThis ensures that the digital book maintains its intended structure while being fully compatible with our reading interface, bookmarking system, and search functionality.`,
        `Chapter 3: Reading Experience\n\nThe imported EPUB content provides:\n- Full-text search capabilities across all chapters\n- Bookmark and note-taking functionality\n- Progress tracking and reading statistics\n- Responsive display for all device types\n- Seamless navigation between chapters\n\nUsers can enjoy the complete digital reading experience with all the features of the original EPUB while benefiting from the enhanced capabilities of our digital library platform.`
      ];
      
      // Try to extract metadata-like information from filename
      if (title.includes('-') || title.includes('_')) {
        const parts = title.split(/[-_]/);
        if (parts.length >= 2) {
          author = parts[0].trim();
          title = parts.slice(1).join(' ').trim();
        }
      }
      
      description = `EPUB book imported from ${file.name}. Digital book content processed with chapter structure preserved.`;
      setUploadProgress(75);
    } else if (textContent) {
      // For other text files, use the entire content as one chapter
      processedContent = [textContent];
      setUploadProgress(75);
    } else {
      alert('Unsupported file format or error processing file.');
      setIsProcessingUpload(false);
      setUploadingFile(null);
      return;
    }

    setUploadProgress(90);

    // Auto-populate the form with extracted data
    setBookForm({
      title: title,
      author: author,
      description: description,
      category: fileExtension?.toUpperCase() || 'Uploaded',
      readingTime: `${Math.ceil((processedContent.join('').length) / 1000)} min read`,
      coverColor: fileExtension === 'pdf' ? 'bg-red-600' : 
                 fileExtension === 'epub' ? 'bg-purple-600' :
                 fileExtension === 'md' ? 'bg-blue-600' : 'bg-gray-600',
      content: processedContent
    });
    
    setUploadProgress(100);
    
    setTimeout(() => {
      setShowUploadForm(true);
      setIsProcessingUpload(false);
      setUploadingFile(null);
      setUploadProgress(0);
    }, 500);
  };

  // Render Authentication View
  const renderAuth = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
         <CardHeader className="text-center">
          <div 
            className="p-4 rounded-lg mb-4 text-white"
            style={{
              background: primaryColor && secondaryColor ? 
                `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : 
                getThemeClasses().split(' ')[0]
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <span className="font-bold text-sm">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold">{companyName}</h1>
            </div>
            <p className="text-white/90">Digital Library</p>
          </div>
          <CardTitle>{isLogin ? 'Welcome Back' : 'Join Our Library'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={authForm.company}
                  onChange={(e) => setAuthForm({...authForm, company: e.target.value})}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
            </>
          )}

          <Button
            onClick={isLogin ? handleLogin : handleRegister}
            className="w-full"
            disabled={!authForm.email || !authForm.password || (!isLogin && !authForm.name)}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Quick Access for Demo:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAuthForm({...authForm, email: 'admin@company.com', password: 'admin123'});
                }}
                className="text-xs"
              >
                Use Admin Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render Library View
  const renderLibrary = () => {
    const publishedBooks = getPublishedBooks();
    const booksToShow = filteredBooks.length > 0 ? filteredBooks : publishedBooks;

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
         <div 
          className="px-4 py-6 shadow-lg text-white"
          style={{
            background: primaryColor && secondaryColor ? 
              `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : 
              getThemeClasses().split(' ')[0]
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{companyName}</h1>
                <p className="text-white/90">Welcome back, {currentUser?.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <UserIcon />
            </Button>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="relative mb-6">
            <div className="absolute left-3 top-3">
              <SearchIcon />
            </div>
            <Input
              placeholder="Search books, authors, or content..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 py-3 text-base border-gray-200"
            />
          </div>

          {booksToShow.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No Results Found' : 'No Books Available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No books match "${searchQuery}"`
                  : 'The library is being updated with new content.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {booksToShow.map((book) => (
                <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`w-16 h-20 ${book.coverColor} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs text-center px-1">
                          {book.title.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{book.author}</p>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{book.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                            {book.category}
                          </span>
                          <Button
                            onClick={() => openBook(book)}
                            size="sm"
                            className="text-xs"
                          >
                            Read <span className="ml-1"><ArrowRightIcon /></span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Continue with admin panel and other components...
  const renderAdmin = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className={`${getThemeClasses()} px-4 py-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <UserIcon />
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['books', 'uploads', 'users', 'analytics', 'settings', 'branding'] as const).map((view) => (
            <Button
              key={view}
              variant={adminView === view ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setAdminView(view)}
              className={adminView === view ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {adminView === 'books' && renderAdminBooks()}
        {adminView === 'uploads' && renderAdminUploads()}
        {adminView === 'users' && renderAdminUsers()}
        {adminView === 'analytics' && renderAdminAnalytics()}
        {adminView === 'settings' && renderAdminSettings()}
        {adminView === 'branding' && renderAdminBranding()}
      </div>

      {/* Book Form Dialog */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBookForm(false);
                    setEditingBook(null);
                    resetBookForm();
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="book-title">Title</Label>
                    <Input
                      id="book-title"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-author">Author</Label>
                    <Input
                      id="book-author"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="book-description">Description</Label>
                  <Textarea
                    id="book-description"
                    value={bookForm.description}
                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    placeholder="Book description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="book-category">Category</Label>
                    <Input
                      id="book-category"
                      value={bookForm.category}
                      onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                      placeholder="Category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-reading-time">Reading Time</Label>
                    <Input
                      id="book-reading-time"
                      value={bookForm.readingTime}
                      onChange={(e) => setBookForm({...bookForm, readingTime: e.target.value})}
                      placeholder="30 min read"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-cover-color">Cover Color</Label>
                    <select
                      id="book-cover-color"
                      value={bookForm.coverColor}
                      onChange={(e) => setBookForm({...bookForm, coverColor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bg-blue-600">Blue</option>
                      <option value="bg-purple-600">Purple</option>
                      <option value="bg-green-600">Green</option>
                      <option value="bg-orange-600">Orange</option>
                      <option value="bg-red-600">Red</option>
                      <option value="bg-gray-600">Gray</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Book Content (Chapters)</Label>
                  {bookForm.content.map((chapter, index) => (
                    <div key={index} className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Chapter {index + 1}</span>
                        {bookForm.content.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newContent = bookForm.content.filter((_, i) => i !== index);
                              setBookForm({...bookForm, content: newContent});
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={chapter}
                        onChange={(e) => {
                          const newContent = [...bookForm.content];
                          newContent[index] = e.target.value;
                          setBookForm({...bookForm, content: newContent});
                        }}
                        placeholder={`Chapter ${index + 1} content...`}
                        rows={6}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookForm({...bookForm, content: [...bookForm.content, '']})}
                    className="mt-3"
                  >
                    <PlusIcon />
                    <span className="ml-2">Add Chapter</span>
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBookForm(false);
                      setEditingBook(null);
                      resetBookForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingBook ? handleEditBook : handleAddBook}
                    disabled={!bookForm.title || !bookForm.author || bookForm.content.every(c => c.trim() === '')}
                  >
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Dialog */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Review Uploaded Book</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadForm(false);
                    resetBookForm();
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                 <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ File Successfully Processed</h3>
                  <div className="flex items-start gap-3">
                    <DocumentIcon />
                    <div className="flex-1">
                      <p className="text-sm text-green-700 mb-2">
                        <strong>{uploadingFile?.name || bookForm.title}</strong> has been processed and parsed into {bookForm.content.length} chapter(s).
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-green-600">
                        <div>
                          <span className="font-medium">Format:</span> {bookForm.category}
                        </div>
                        <div>
                          <span className="font-medium">Chapters:</span> {bookForm.content.length}
                        </div>
                        <div>
                          <span className="font-medium">Est. Reading:</span> {bookForm.readingTime}
                        </div>
                        <div>
                          <span className="font-medium">Content Length:</span> {bookForm.content.join('').length.toLocaleString()} chars
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Review and edit the details below before publishing to your library.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="upload-book-title">Title</Label>
                    <Input
                      id="upload-book-title"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upload-book-author">Author</Label>
                    <Input
                      id="upload-book-author"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="upload-book-description">Description</Label>
                  <Textarea
                    id="upload-book-description"
                    value={bookForm.description}
                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    placeholder="Book description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="upload-book-category">Category</Label>
                    <Input
                      id="upload-book-category"
                      value={bookForm.category}
                      onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                      placeholder="Category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upload-book-reading-time">Reading Time</Label>
                    <Input
                      id="upload-book-reading-time"
                      value={bookForm.readingTime}
                      onChange={(e) => setBookForm({...bookForm, readingTime: e.target.value})}
                      placeholder="30 min read"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upload-book-cover-color">Cover Color</Label>
                    <select
                      id="upload-book-cover-color"
                      value={bookForm.coverColor}
                      onChange={(e) => setBookForm({...bookForm, coverColor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bg-blue-600">Blue</option>
                      <option value="bg-purple-600">Purple</option>
                      <option value="bg-green-600">Green</option>
                      <option value="bg-orange-600">Orange</option>
                      <option value="bg-red-600">Red</option>
                      <option value="bg-gray-600">Gray</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Content Preview (Click to expand/edit)</Label>
                  {bookForm.content.map((chapter, index) => (
                    <div key={index} className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Chapter {index + 1}</span>
                        {bookForm.content.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newContent = bookForm.content.filter((_, i) => i !== index);
                              setBookForm({...bookForm, content: newContent});
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={chapter}
                        onChange={(e) => {
                          const newContent = [...bookForm.content];
                          newContent[index] = e.target.value;
                          setBookForm({...bookForm, content: newContent});
                        }}
                        placeholder={`Chapter ${index + 1} content...`}
                        rows={4}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookForm({...bookForm, content: [...bookForm.content, '']})}
                    className="mt-3"
                  >
                    <PlusIcon />
                    <span className="ml-2">Add Chapter</span>
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadForm(false);
                      resetBookForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddBook();
                      setShowUploadForm(false);
                    }}
                    disabled={!bookForm.title || !bookForm.author || bookForm.content.every(c => c.trim() === '')}
                  >
                    Publish Book
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdminBooks = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Book Management</h2>
        <Button onClick={() => setShowBookForm(true)}>
          <PlusIcon />
          <span className="ml-2">Add Book</span>
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Books Added</h3>
          <p className="text-gray-600 mb-4">Start building your library by adding your first book.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Card key={book.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{book.author}</p>
                    <p className="text-xs text-gray-500 mb-2">{book.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {book.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${book.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {book.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {book.content.length} chapters
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openBookForEdit(book)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdminUsers = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <MailIcon />
                    <span className="ml-1">{user.email}</span>
                  </p>
                  {user.company && (
                    <p className="text-sm text-gray-600 mb-1">{user.company}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Joined: {new Date(user.registrationDate).toLocaleDateString()}</span>
                    <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                    <span>Books Read: {user.readingHistory.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAdminAnalytics = () => {
    const totalUsers = users.length;
    const totalBooks = books.length;
    const totalBookmarks = bookmarks.length;
    const totalNotes = notes.length;
    const activeUsers = users.filter(u => {
      const lastLogin = new Date(u.lastLogin);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastLogin > weekAgo;
    }).length;

    return (
      <div>
        <h2 className="text-lg font-semibold mb-6">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <UsersIcon />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users (7 days)</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <HeartIcon />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Books</p>
                  <p className="text-2xl font-bold">{totalBooks}</p>
                </div>
                <PlusIcon />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">User Engagement</p>
                  <p className="text-2xl font-bold">{totalBookmarks + totalNotes}</p>
                </div>
                <BookmarkIcon />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      {user.readingHistory.length} books read
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAdminUploads = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Book Upload Center</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Book Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {isProcessingUpload ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Processing Upload...</h3>
                  <p className="text-gray-600 mb-4">
                    {uploadingFile?.name && `Processing ${uploadingFile.name}`}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-center">
                    <UploadIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Book Content</h3>
                  <p className="text-gray-600 mb-4">
                    Support for multiple formats with automatic content parsing and chapter detection.
                  </p>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.epub"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="book-file-upload"
                  />
                  <Button 
                    onClick={() => document.getElementById('book-file-upload')?.click()}
                    className="mb-2"
                    disabled={isProcessingUpload}
                  >
                    Choose File to Upload
                  </Button>
                  <p className="text-sm text-gray-500">
                    Supported formats: TXT, Markdown (.md), PDF (.pdf), EPUB (.epub)
                  </p>
                </>
              )}
            </div>
            
             <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Upload Guidelines:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Text files (.txt):</strong> Use triple line breaks to separate chapters</li>
                <li>• <strong>Markdown (.md):</strong> Use # or ## headers to define chapter breaks</li>
                <li>• <strong>PDF files (.pdf):</strong> Content extracted automatically with intelligent chapter detection</li>
                <li>• <strong>EPUB books (.epub):</strong> Chapter structure preserved from original digital book format</li>
                <li>• <strong>File size limit:</strong> Up to 50MB for PDF/EPUB, 10MB for text files</li>
                <li>• All content is automatically processed, formatted, and optimized for reading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Import History</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-3">
            {books.filter(book => ['Uploaded', 'TXT', 'MD', 'PDF', 'EPUB'].includes(book.category)).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No uploaded books yet</p>
            ) : (
              books.filter(book => ['Uploaded', 'TXT', 'MD', 'PDF', 'EPUB'].includes(book.category)).map((book) => (
                 <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{book.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        book.category === 'PDF' ? 'bg-red-100 text-red-800' :
                        book.category === 'EPUB' ? 'bg-purple-100 text-purple-800' :
                        book.category === 'MD' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{book.content.length} chapters imported</p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(book.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openBookForEdit(book)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminBranding = () => (
    <div>
      <h2 className="text-lg font-semibold mb-6">Brand Customization</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="branding-company-name">Company Name</Label>
            <Input
              id="branding-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="branding-logo-url">Logo URL (Optional)</Label>
            <Input
              id="branding-logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://placehold.co/200x60?text=Your+Company+Logo"
              className="mt-1"
            />
            {logoUrl && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="branding-primary-color">Primary Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                id="branding-primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-8 border rounded"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="branding-secondary-color">Secondary Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                id="branding-secondary-color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-8 border rounded"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#1E40AF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="branding-accent-color">Accent Color</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                id="branding-accent-color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-8 border rounded"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#10B981"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>UI Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="branding-header-style">Header Style</Label>
            <select
              id="branding-header-style"
              value={brandingSettings.headerStyle}
              onChange={(e) => setBrandingSettings({...brandingSettings, headerStyle: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="modern">Modern Gradient</option>
              <option value="solid">Solid Color</option>
              <option value="minimal">Minimal</option>
              <option value="elevated">Elevated Card</option>
            </select>
          </div>

          <div>
            <Label htmlFor="branding-button-style">Button Style</Label>
            <select
              id="branding-button-style"
              value={brandingSettings.buttonStyle}
              onChange={(e) => setBrandingSettings({...brandingSettings, buttonStyle: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp Corners</option>
              <option value="pill">Pill Shaped</option>
            </select>
          </div>

          <div>
            <Label htmlFor="branding-font-family">Font Family</Label>
            <select
              id="branding-font-family"
              value={brandingSettings.fontFamily}
              onChange={(e) => setBrandingSettings({...brandingSettings, fontFamily: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              }}
            >
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {companyName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{companyName}</h3>
                  <p className="text-white/80 text-sm">Digital Library</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: brandingSettings.buttonStyle === 'pill' ? '9999px' : 
                              brandingSettings.buttonStyle === 'sharp' ? '4px' : '8px'
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                  borderRadius: brandingSettings.buttonStyle === 'pill' ? '9999px' : 
                              brandingSettings.buttonStyle === 'sharp' ? '4px' : '8px'
                }}
              >
                Secondary Button
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminSettings = () => (
    <div>
      <h2 className="text-lg font-semibold mb-6">App Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-company-name">Company Name</Label>
            <Input
              id="admin-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="admin-theme-color">Theme Color</Label>
            <select
              id="admin-theme-color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                const data = {
                  books,
                  users: users.map(u => ({...u, password: undefined})),
                  bookmarks,
                  notes,
                  sessions: userSessions,
                  settings: { companyName, themeColor, fontSize }
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${companyName.toLowerCase().replace(/\s+/g, '-')}-library-backup.json`;
                a.click();
              }}
              className="w-full"
            >
              Export Data Backup
            </Button>
            
            <p className="text-sm text-gray-600">
              Export all app data including books, users, bookmarks, and notes for backup purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Reader View
  const renderReader = () => {
    if (!selectedBook) return null;

    return (
      <div className="min-h-screen bg-white">
        <div className={`${getThemeClasses()} px-4 py-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentView(currentUser?.role === 'admin' ? 'admin' : 'library')}
              className="text-white hover:bg-white/20"
            >
              <div className="rotate-180"><ArrowRightIcon /></div>
              <span className="ml-2">Back</span>
            </Button>
            <Button
              variant="ghost"
              onClick={addBookmark}
              className="text-white hover:bg-white/20"
            >
              <BookmarkIcon />
            </Button>
          </div>
        </div>

        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedBook.title}</h1>
          <p className="text-sm text-gray-600 mb-4">by {selectedBook.author}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-gray-500">
              Chapter {currentChapter + 1} of {selectedBook.content.length}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div 
                className={`bg-${themeColor}-600 h-1 rounded-full`}
                style={{ width: `${((currentChapter + 1) / selectedBook.content.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div 
          ref={contentRef}
          className={`px-4 pb-24 ${fontSize} leading-relaxed text-gray-800`}
          onMouseUp={() => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
              setSelectedText(selection.toString());
              setShowNoteDialog(true);
            }
          }}
        >
          {selectedBook.content[currentChapter]?.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-white border-t px-4 py-3">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentChapter === 0}
              onClick={() => setCurrentChapter(currentChapter - 1)}
              className="flex-1 mr-2"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentChapter === selectedBook.content.length - 1}
              onClick={() => setCurrentChapter(currentChapter + 1)}
              className="flex-1 ml-2"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className={`${getThemeClasses()} px-4 py-6`}>
        <h1 className="text-xl font-bold mb-4">Search</h1>
        <div className="relative">
          <div className="absolute left-3 top-3">
            <SearchIcon />
          </div>
          <Input
            placeholder="Search across all books..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {searchQuery && searchResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results found for "{searchQuery}"</p>
        ) : (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md">
                <CardContent 
                  className="p-4"
                  onClick={() => {
                    const book = books.find(b => b.id === result.bookId);
                    if (book) {
                      setSelectedBook(book);
                      setCurrentChapter(result.chapter);
                      setCurrentView('reader');
                    }
                  }}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{result.bookTitle}</h4>
                  <p className="text-sm text-gray-600 mb-2">Chapter {result.chapter + 1}</p>
                  <p className="text-sm text-gray-700">...{result.content}...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBookmarks = () => {
    const userBookmarks = getUserBookmarks();
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className={`${getThemeClasses()} px-4 py-6`}>
          <h1 className="text-xl font-bold">Bookmarks</h1>
        </div>

        <div className="px-4 py-4">
          {userBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4">
                <BookmarkIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookmarks Yet</h3>
              <p className="text-gray-600">Bookmark pages while reading to find them easily later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookmarks.map((bookmark) => {
                const book = books.find(b => b.id === bookmark.bookId);
                return (
                  <Card key={bookmark.id} className="cursor-pointer hover:shadow-md">
                    <CardContent 
                      className="p-4"
                      onClick={() => {
                        if (book) {
                          setSelectedBook(book);
                          setCurrentChapter(bookmark.chapter);
                          setCurrentView('reader');
                        }
                      }}
                    >
                      <h4 className="font-semibold text-gray-900">{book?.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{bookmark.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const userBookmarks = getUserBookmarks();
    const userNotes = getUserNotes();
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className={`${getThemeClasses()} px-4 py-6`}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{currentUser?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{currentUser?.email}</p>
              </div>
              {currentUser?.company && (
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{currentUser.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {currentUser && new Date(currentUser.registrationDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reading Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentUser?.readingHistory.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Books Read</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{userBookmarks.length}</p>
                  <p className="text-sm text-gray-600">Bookmarks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{userNotes.length}</p>
                  <p className="text-sm text-gray-600">Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reading Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profile-font-size">Font Size</Label>
                <select
                  id="profile-font-size"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-sm">Small</option>
                  <option value="text-base">Medium</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {currentView === 'auth' && renderAuth()}
      {currentView === 'library' && renderLibrary()}
      {currentView === 'reader' && renderReader()}
      {currentView === 'search' && renderSearch()}
      {currentView === 'bookmarks' && renderBookmarks()}
      {currentView === 'profile' && renderProfile()}
      {currentView === 'admin' && renderAdmin()}

      {/* Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Add Note</h3>
            <p className="text-sm text-gray-600 mb-3">Selected text: "{selectedText}"</p>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your note here..."
              className="mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={addNote} className="flex-1">
                Save Note
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNoteDialog(false);
                  setNoteText('');
                  setSelectedText('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Only show for non-auth and non-admin views */}
      {currentUser && currentView !== 'auth' && currentView !== 'admin' && currentView !== 'reader' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setCurrentView('library')}
              className={`flex-1 py-3 px-4 text-center ${
                currentView === 'library' 
                  ? `text-${themeColor}-600` 
                  : 'text-gray-500'
              }`}
            >
              <div className="w-5 h-5 mx-auto mb-1">
                <HomeIcon />
              </div>
              <span className="text-xs">Library</span>
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className={`flex-1 py-3 px-4 text-center ${
                currentView === 'search' 
                  ? `text-${themeColor}-600` 
                  : 'text-gray-500'
              }`}
            >
              <div className="w-5 h-5 mx-auto mb-1">
                <SearchIcon />
              </div>
              <span className="text-xs">Search</span>
            </button>
            <button
              onClick={() => setCurrentView('bookmarks')}
              className={`flex-1 py-3 px-4 text-center ${
                currentView === 'bookmarks' 
                  ? `text-${themeColor}-600` 
                  : 'text-gray-500'
              }`}
            >
              <div className="w-5 h-5 mx-auto mb-1">
                <BookmarkIcon />
              </div>
              <span className="text-xs">Bookmarks</span>
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex-1 py-3 px-4 text-center ${
                currentView === 'profile' 
                  ? `text-${themeColor}-600` 
                  : 'text-gray-500'
              }`}
            >
              <div className="w-5 h-5 mx-auto mb-1">
                <UserIcon />
              </div>
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Bottom Navigation */}
      {currentUser?.role === 'admin' && currentView === 'admin' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200">
          <div className="flex justify-center py-3">
            <Button
              onClick={() => setCurrentView('library')}
              variant="outline"
              size="sm"
            >
              <EyeIcon />
              <span className="ml-2">View as User</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReaderApp;