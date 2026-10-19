import { describe, it, expect } from 'vitest';
import { GeographyService } from '@/features/geography/server/geography.service';
import {
  VERIFIED_POSTAL_OFFICES,
  UNIQUE_MALAPPURAM_PIN_CODES,
  VERIFIED_LOCAL_BODY_PIN_LINKS,
} from '@/features/geography/constants/malappuram-postal-dataset';

describe('Smart Post Office and PIN Code Lookup System', () => {
  describe('Postal Reference Dataset Integrity', () => {
    it('contains verified post offices and unique PIN codes', () => {
      expect(VERIFIED_POSTAL_OFFICES.length).toBeGreaterThanOrEqual(70);
      expect(UNIQUE_MALAPPURAM_PIN_CODES.length).toBeGreaterThanOrEqual(60);
      expect(VERIFIED_LOCAL_BODY_PIN_LINKS.length).toBeGreaterThanOrEqual(60);
    });

    it('ensures every verified post office has a valid 6-digit PIN code starting with 67', () => {
      for (const po of VERIFIED_POSTAL_OFFICES) {
        expect(po.pinCode).toMatch(/^67\d{4}$/);
        expect(po.name.length).toBeGreaterThan(0);
        expect(po.talukName.length).toBeGreaterThan(0);
        expect(['HO', 'SO', 'BO']).toContain(po.officeType);
      }
    });

    it('verifies that PIN code 676121 has multiple verified post offices', () => {
      const officesFor676121 = VERIFIED_POSTAL_OFFICES.filter((po) => po.pinCode === '676121');
      expect(officesFor676121.length).toBeGreaterThanOrEqual(2);
      const names = officesFor676121.map((p) => p.name);
      expect(names).toContain('Manjeri H.O');
      expect(names).toContain('Manjeri Bazar S.O');
    });
  });

  describe('PIN-First Lookup (Method 1)', () => {
    it('returns all matching post offices for PIN 676121 without arbitrary selection', async () => {
      const result = await GeographyService.lookupPostOfficesByPin('676121');
      expect(result.found).toBe(true);
      expect(result.pinCode).toBe('676121');
      expect(result.postOffices.length).toBeGreaterThanOrEqual(2);
      const names = result.postOffices.map((po) => po.name);
      expect(names).toContain('Manjeri H.O');
      expect(names).toContain('Manjeri Bazar S.O');
    });

    it('returns post offices for Tirur PIN 676101', async () => {
      const result = await GeographyService.lookupPostOfficesByPin('676101');
      expect(result.found).toBe(true);
      expect(result.pinCode).toBe('676101');
      expect(result.postOffices.some((po) => po.name.includes('Tirur'))).toBe(true);
    });

    it('gracefully handles unlisted PIN codes and allows manual entry', async () => {
      const result = await GeographyService.lookupPostOfficesByPin('676999');
      expect(result.found).toBe(false);
      expect(result.postOffices).toHaveLength(0);
      expect(result.message).toContain('Manual input permitted');
    });

    it('rejects invalid PIN formats gracefully', async () => {
      const result = await GeographyService.lookupPostOfficesByPin('abc12');
      expect(result.found).toBe(false);
      expect(result.message).toContain('Invalid PIN Code format');
    });
  });

  describe('Taluk + Local Body Lookup (Method 2)', () => {
    it('returns matching post offices for verified local body Manjeri Municipality', async () => {
      const result = await GeographyService.getPostOfficesByLocalBody({
        localBody: 'Manjeri Municipality',
        taluk: 'Ernad',
      });
      expect(result.hasVerifiedPostalMapping).toBe(true);
      expect(result.postOffices.length).toBeGreaterThan(0);
      const names = result.postOffices.map((p) => p.name);
      expect(names).toContain('Manjeri H.O');
    });

    it('returns verified postal mapping for Malappuram Municipality', async () => {
      const result = await GeographyService.getPostOfficesByLocalBody({
        localBody: 'Malappuram Municipality',
        taluk: 'Ernad',
      });
      expect(result.hasVerifiedPostalMapping).toBe(true);
      expect(result.postOffices.length).toBeGreaterThan(0);
      expect(result.postOffices.some((p) => p.name.includes('Malappuram'))).toBe(true);
    });

    it('returns pending mapping guidance if relationship is not established, guiding user to PIN search', async () => {
      const result = await GeographyService.getPostOfficesByLocalBody({
        localBody: 'Nonexistent Panchayat',
        taluk: 'Ernad',
      });
      expect(result.hasVerifiedPostalMapping).toBe(false);
      expect(result.postOffices).toHaveLength(0);
      expect(result.message).toContain('Verified postal mapping pending');
    });
  });

  describe('Server-Side Postal Relationship Validation', () => {
    it('validates a verified combination of PIN and Post Office', async () => {
      const result = await GeographyService.validatePostalRelationship({
        pinCode: '676121',
        postOffice: 'Manjeri H.O',
      });
      expect(result.valid).toBe(true);
    });

    it('validates case-insensitively with or without suffix', async () => {
      const result = await GeographyService.validatePostalRelationship({
        pinCode: '676121',
        postOffice: 'manjeri',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects mismatched PIN and Post Office when PIN exists but Post Office is wrong', async () => {
      const result = await GeographyService.validatePostalRelationship({
        pinCode: '676121',
        postOffice: 'Tirur H.O',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('is not associated with PIN 676121');
    });

    it('rejects invalid PIN formats', async () => {
      const result = await GeographyService.validatePostalRelationship({
        pinCode: '6761',
        postOffice: 'Manjeri H.O',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('PIN Code must be a valid 6-digit number');
    });

    it('allows unlisted PINs for manual registration flow without false blocking', async () => {
      const result = await GeographyService.validatePostalRelationship({
        pinCode: '676999',
        postOffice: 'Some Remote Branch',
      });
      expect(result.valid).toBe(true);
    });
  });
});
