
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserData {
  id: string;
  authUid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface AppUser extends FirebaseUser {
  data?: UserData;
}
