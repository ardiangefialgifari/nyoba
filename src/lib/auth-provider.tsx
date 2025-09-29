
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { ref, onValue, off, query, orderByChild, equalTo, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { AppUser, UserData } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated with Firebase Auth, now get user data from RTDB
        const usersRef = query(ref(db, 'users'), orderByChild('authUid'), equalTo(firebaseUser.uid));
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const userData = Object.values(snapshot.val())[0] as UserData;
          const userKey = Object.keys(snapshot.val())[0];
          const appUser: AppUser = {
            ...firebaseUser,
            data: { ...userData, id: userKey },
          };
          setUser(appUser);
        } else {
          // This case can happen if user exists in Auth but not in RTDB.
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const usersRef = ref(db, 'users');
      const newUserRef = push(usersRef);
      await update(newUserRef, {
          email: email,
          name: name || email.split('@')[0],
          role: 'user', // All new users are 'user' by default
          authUid: userCredential.user.uid
      });

      toast({ title: 'Success', description: 'Account created and logged in.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'See you next time.' });
      router.push('/login');
    } catch (error: any)
      {
      toast({ title: 'Logout Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const value = { user, loading, login, register, logout };

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="ml-3 text-lg text-foreground">Verifying session...</p>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
