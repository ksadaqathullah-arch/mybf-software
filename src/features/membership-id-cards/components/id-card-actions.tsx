'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, Printer } from 'lucide-react';

interface IdCardActionsProps {
  verificationToken: string;
  membershipNumber: string;
}

export function IdCardActions({ verificationToken }: IdCardActionsProps) {
  const [printing, setPrinting] = React.useState(false);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 150);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/verify/id/${verificationToken}`} target="_blank">
        <Button variant="outline" size="sm" className="h-9 font-display uppercase tracking-wider text-xs border-2 border-ink">
          <QrCode className="h-4 w-4 mr-1.5 text-blue" />
          Test Public QR
        </Button>
      </Link>

      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrint}
        disabled={printing}
        className="h-9 font-display uppercase tracking-wider text-xs bg-yellow text-ink border-2 border-ink shadow-[2px_2px_0px_#14161c]"
      >
        <Printer className="h-4 w-4 mr-1.5" />
        {printing ? 'Preparing Print...' : 'Save PDF / Print'}
      </Button>
    </div>
  );
}
