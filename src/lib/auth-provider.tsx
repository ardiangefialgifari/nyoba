
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { ref, push, onValue, off } from 'firebase/database';
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const usersRef = ref(db, 'users');
        const listener = onValue(usersRef, (snapshot) => {
          const users = snapshot.val();
          if (users) {
            const userEntry = Object.values(users as Record<string, any>).find(
              (u: any) => u.authUid === firebaseUser.uid
            );
            if (userEntry) {
              const appUser: AppUser = { ...firebaseUser, data: userEntry as UserData };
              setUser(appUser);
            } else {
              setUser(firebaseUser); // User exists in Auth, but not in DB
            }
          } else {
             setUser(firebaseUser); // No users in DB
          }
          setLoading(false);
          off(usersRef, 'value', listener); // Detach listener after finding user
        }, () => {
          setUser(firebaseUser); // Error fetching from DB
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
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
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await push(ref(db, 'users'), {
          email: email,
          name: name || email.split('@')[0],
          role: 'user', // All new users are 'user' by default
          authUid: userCredential.user.uid
      });

      toast({ title: 'Success', description: 'Account created and logged in.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'See you next time.' });
      router.push('/login');
    } catch (error: any) {
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
