'use client';

import * as React from 'react';
import { useMembershipModal } from '@/features/memberships/context/membership-modal-context';

export interface OpenMembershipModalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export function OpenMembershipModalButton({
  children,
  className,
  onClick,
  ...props
}: OpenMembershipModalButtonProps) {
  const { openModal } = useMembershipModal();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    openModal();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
