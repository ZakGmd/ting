import { auth } from '@/auth';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default async function AuthProvider({ 
  children, 
  fallback 
}: AuthProviderProps) {
  const session = await auth();
  
  if (!session?.user) {
    return fallback || null;
  }
  
  return (
    <>
      {children}
    </>
  );
}

// This component can be used as a client component wrapper when you need user data
export function AuthUserProvider({ 
  children
}: { 
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 