import { describe, it, expect } from 'vitest';
import TermsPage, { metadata as termsMetadata } from '@/app/(public)/terms/page';
import PrivacyPage, { metadata as privacyMetadata } from '@/app/(public)/privacy/page';
import NotFound from '@/app/not-found';

describe('Public Legal and Error Routes Compliance', () => {
  describe('GET /terms', () => {
    it('has valid metadata with descriptive title and charter description', () => {
      expect(termsMetadata.title).toContain('Terms of Service');
      expect(termsMetadata.title).toContain('Charter');
      expect(termsMetadata.description).toBeDefined();
    });

    it('renders without throwing and produces terms page component', () => {
      const page = TermsPage();
      expect(page).toBeDefined();
      expect(page.type).toBe('div');
    });
  });

  describe('GET /privacy', () => {
    it('has valid metadata with DPDP data privacy standards', () => {
      expect(privacyMetadata.title).toContain('DPDP Privacy Policy');
      expect(privacyMetadata.description).toContain('personal data protection');
    });

    it('renders without throwing and produces privacy page component', () => {
      const page = PrivacyPage();
      expect(page).toBeDefined();
      expect(page.type).toBe('div');
    });
  });

  describe('Root Not Found (404)', () => {
    it('renders clean Server Component without client runtime requirements', () => {
      const notFoundComponent = NotFound();
      expect(notFoundComponent).toBeDefined();
      expect(notFoundComponent.type).toBe('div');
    });
  });
});
