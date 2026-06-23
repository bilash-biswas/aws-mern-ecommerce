'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && !user.isAdmin) {
        router.push('/');
      }
    }
  }, [user, router, adminOnly, isClient]);

  // Don't render anything during SSR or until we check auth status
  if (!isClient) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && !user.isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;