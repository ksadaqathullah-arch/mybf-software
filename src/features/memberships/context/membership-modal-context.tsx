'use client';

import * as React from 'react';
import { YouthRegistrationForm } from '@/features/memberships/components/youth-registration-form';

interface MembershipModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MembershipModalContext = React.createContext<MembershipModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export function useMembershipModal() {
  return React.useContext(MembershipModalContext);
}

export function MembershipModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    // Clean URL query or hash if opened via URL param
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('apply')) {
        url.searchParams.delete('apply');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
      if (url.hash === '#apply') {
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  // Detect URL parameter ?apply=true or #apply on mount / change
  React.useEffect(() => {
    const checkUrl = () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('apply') === 'true' || window.location.hash === '#apply') {
          setIsOpen(true);
        }
      }
    };

    checkUrl();

    const handleCustomEvent = () => setIsOpen(true);
    window.addEventListener('open-membership-modal', handleCustomEvent);
    window.addEventListener('popstate', checkUrl);
    window.addEventListener('hashchange', checkUrl);

    return () => {
      window.removeEventListener('open-membership-modal', handleCustomEvent);
      window.removeEventListener('popstate', checkUrl);
      window.removeEventListener('hashchange', checkUrl);
    };
  }, []);

  return (
    <MembershipModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <YouthRegistrationForm
        asModal
        isOpen={isOpen}
        onClose={closeModal}
      />
    </MembershipModalContext.Provider>
  );
}
