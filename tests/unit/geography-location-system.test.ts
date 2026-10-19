import { describe, it, expect } from 'vitest';
import {
  VERIFIED_TALUKS,
  ALL_RESIDENTIAL_LOCAL_BODIES,
  VERIFIED_MUNICIPALITIES,
  VERIFIED_GRAMA_PANCHAYATS,
  VERIFIED_BLOCK_PANCHAYATS,
  DISTRICT_PANCHAYAT,
  getRawWorkbookRows,
} from '@/features/geography/constants/malappuram-master-dataset';
import { GeographyService } from '@/features/geography/server/geography.service';
import { locationSelectionSchema } from '@/features/geography/schemas/location.schema';
import { memberRegistrationSchema } from '@/features/memberships/schemas/membership.schema';
import { NOTABLE_PIN_CODES } from '@/features/geography/constants/malappuram-geo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

describe('MYBF Dynamic Malappuram Location Management System', () => {
  describe('Phase 1 & 2: Authoritative Administrative Datasets & Hierarchy', () => {
    it('accurately defines exactly the 7 administrative taluks of Malappuram', () => {
      expect(VERIFIED_TALUKS).toHaveLength(7);
      const talukNames = VERIFIED_TALUKS.map((t) => t.name.toLowerCase());
      expect(talukNames).toContain('ernad');
      expect(talukNames).toContain('nilambur');
      expect(talukNames).toContain('perinthalmanna');
      expect(talukNames).toContain('tirur');
      expect(talukNames).toContain('tirurangadi');
      expect(talukNames).toContain('ponnani');
      expect(talukNames).toContain('kondotty');
    });

    it('accurately defines exactly 12 statutory Municipalities', () => {
      expect(VERIFIED_MUNICIPALITIES).toHaveLength(12);
      const municipalityNames = VERIFIED_MUNICIPALITIES.map((m) => m.name);
      expect(municipalityNames).toContain('Manjeri Municipality');
      expect(municipalityNames).toContain('Malappuram Municipality');
      expect(municipalityNames).toContain('Perinthalmanna Municipality');
      expect(municipalityNames).toContain('Tirur Municipality');
      expect(municipalityNames).toContain('Ponnani Municipality');
      expect(municipalityNames).toContain('Kottakkal Municipality');
      expect(municipalityNames).toContain('Nilambur Municipality');
      expect(municipalityNames).toContain('Kondotty Municipality');
      expect(municipalityNames).toContain('Parappanangadi Municipality');
      expect(municipalityNames).toContain('Tanur Municipality');
      expect(municipalityNames).toContain('Tirurangadi Municipality');
      expect(municipalityNames).toContain('Valanchery Municipality');
    });

    it('accurately defines exactly 94 Grama Panchayats', () => {
      expect(VERIFIED_GRAMA_PANCHAYATS).toHaveLength(94);
      VERIFIED_GRAMA_PANCHAYATS.forEach((gp) => {
        expect(gp.type).toBe('GRAMA_PANCHAYAT');
        expect(gp.talukName).toBeTruthy();
        expect(gp.blockPanchayat).toBeTruthy();
      });
    });

    it('combines into exactly 106 residential local bodies', () => {
      expect(ALL_RESIDENTIAL_LOCAL_BODIES).toHaveLength(106);
      const uniqueCodes = new Set(ALL_RESIDENTIAL_LOCAL_BODIES.map((lb) => lb.code));
      expect(uniqueCodes.size).toBe(106);
    });

    it('keeps 15 Block Panchayats strictly distinct from residential local bodies', () => {
      expect(VERIFIED_BLOCK_PANCHAYATS).toHaveLength(15);
      const blockCodes = VERIFIED_BLOCK_PANCHAYATS.map((bp) => bp.code);
      const residentialCodes = ALL_RESIDENTIAL_LOCAL_BODIES.map((lb) => lb.code);
      blockCodes.forEach((bCode) => {
        expect(residentialCodes).not.toContain(bCode);
      });
    });

    it('identifies and handles the Edappatta duplicate candidate row idempotently', () => {
      const rawRows = getRawWorkbookRows();
      // Total raw rows: 12 (municipalities) + 94 (GPs) + 1 (duplicate Edappatta) + 15 (blocks) + 1 (district panchayat) = 123 rows
      expect(rawRows).toHaveLength(123);

      const edappattaRows = rawRows.filter((r) => r.localBodyName.includes('Edappatta'));
      expect(edappattaRows).toHaveLength(2);
      expect(edappattaRows.some((r) => r.isDuplicateCandidate)).toBe(true);

      // In the deduplicated residential list, Edappatta must appear exactly once
      const canonicalEdappatta = ALL_RESIDENTIAL_LOCAL_BODIES.filter((lb) =>
        lb.name.toLowerCase().includes('edappatta')
      );
      expect(canonicalEdappatta).toHaveLength(1);
      expect(canonicalEdappatta[0].code).toBe('LB-GP-EDAPPATTA');
      expect(canonicalEdappatta[0].talukName).toBe('Perinthalmanna');
    });
  });

  describe('Phase 3 & 4: Server-Side Geography Service & Validation', () => {
    it('returns local bodies filtered by taluk correctly', async () => {
      const ernadLBs = await GeographyService.getLocalBodies('Ernad');
      expect(ernadLBs.length).toBeGreaterThan(0);
      ernadLBs.forEach((lb) => {
        expect(['Ernad', 'Eranad']).toContain(lb.talukName);
      });

      const tirurLBs = await GeographyService.getLocalBodies('Tirur');
      expect(tirurLBs.length).toBeGreaterThan(0);
      tirurLBs.forEach((lb) => {
        expect(lb.talukName).toBe('Tirur');
      });
    });

    it('validates valid Taluk and Local Body combinations successfully', async () => {
      const result1 = await GeographyService.validateLocationHierarchy({
        taluk: 'Ernad',
        localBody: 'Manjeri Municipality',
      });
      expect(result1.valid).toBe(true);
      expect(result1.resolvedLocalBody?.code).toBe('LB-MUN-MANJERI');

      const result2 = await GeographyService.validateLocationHierarchy({
        taluk: 'Tirur',
        localBody: 'Tirur Municipality',
      });
      expect(result2.valid).toBe(true);

      const result3 = await GeographyService.validateLocationHierarchy({
        taluk: 'Perinthalmanna',
        localBody: 'Edappatta Grama Panchayat',
      });
      expect(result3.valid).toBe(true);
      expect(result3.resolvedLocalBody?.code).toBe('LB-GP-EDAPPATTA');
    });

    it('rejects mismatched Taluk and Local Body combinations with clear error', async () => {
      // Manjeri belongs to Ernad, not Ponnani
      const result1 = await GeographyService.validateLocationHierarchy({
        taluk: 'Ponnani',
        localBody: 'Manjeri Municipality',
      });
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('does not belong to Ponnani Taluk');

      // Nilambur Municipality belongs to Nilambur, not Tirurangadi
      const result2 = await GeographyService.validateLocationHierarchy({
        taluk: 'Tirurangadi',
        localBody: 'Nilambur Municipality',
      });
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain('does not belong to Tirurangadi Taluk');
    });

    it('rejects non-existent taluk inputs', async () => {
      const result = await GeographyService.validateLocationHierarchy({
        taluk: 'Kozhikode',
        localBody: 'Manjeri Municipality',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Must be one of the 7 taluks of Malappuram');
    });

    it('returns pending-verification state for wards without inventing fake data', async () => {
      const wardResult = await GeographyService.getWards('LB-MUN-MANJERI');
      expect(wardResult.hasVerifiedWards).toBe(false);
      expect(wardResult.wards).toHaveLength(0);
      expect(wardResult.message).toContain('delimitation master data pending');
    });
  });

  describe('Phase 5 & 6: Schemas and Dependent Dropdown Logic', () => {
    it('validates locationSelectionSchema correctly', () => {
      const valid = locationSelectionSchema.safeParse({
        district: 'Malappuram',
        taluk: 'Ernad',
        localBody: 'Manjeri Municipality',
        ward: '',
        postOffice: '',
        pinCode: '676121',
      });
      expect(valid.success).toBe(true);

      const missingTaluk = locationSelectionSchema.safeParse({
        district: 'Malappuram',
        taluk: '',
        localBody: 'Manjeri Municipality',
      });
      expect(missingTaluk.success).toBe(false);
    });

    it('validates memberRegistrationSchema with location fields preserved', () => {
      const validPayload = {
        fullName: 'Mohammed Rashid',
        username: 'mohammed_rashid',
        dateOfBirth: '2000-01-01',
        primaryPhone: '9876543210',
        email: 'rashid@example.com',
        chapterId: 'manjeri',
        password: 'SuperSecurePassword2026!',
        confirmPassword: 'SuperSecurePassword2026!',
        memberCategory: 'ASPIRING_ENTREPRENEUR',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'Business Owner',
        expectations: ['NETWORKING_CONNECTIONS'],
        district: 'Malappuram',
        taluk: 'Ernad',
        localBody: 'Manjeri Municipality',
        ward: '',
        postOffice: 'Manjeri H.O',
        pinCode: '676121',
        addressLine: 'Down Hill, Manjeri',
        consentAcknowledged: true,
      };

      const result = memberRegistrationSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taluk).toBe('Ernad');
        expect(result.data.localBody).toBe('Manjeri Municipality');
        expect(result.data.pinCode).toBe('676121');
      }
    });
  });

  describe('Phase 7: Postal Boundaries and Chapter Decoupling', () => {
    it('preserves postal relationships without assuming 1-to-1 ward associations', () => {
      const manjeriPin = NOTABLE_PIN_CODES['676121'];
      expect(manjeriPin).toBeDefined();
      expect(manjeriPin.taluk).toBe('Ernad');
      expect(manjeriPin.locality).toBe('Manjeri H.O');

      const tirurPin = NOTABLE_PIN_CODES['676101'];
      expect(tirurPin).toBeDefined();
      expect(tirurPin.taluk).toBe('Tirur');
      expect(tirurPin.locality).toBe('Tirur H.O');
    });

    it('keeps 16 MLA Constituency Chapters decoupled from administrative taluks', () => {
      expect(INITIAL_16_CHAPTERS).toHaveLength(16);
      const chapterTaluks = new Set(INITIAL_16_CHAPTERS.map((c) => c.taluk));
      // All 7 taluks are covered by chapters, but chapters represent distinct legislative constituencies
      expect(chapterTaluks.size).toBe(7);

      const ernadChapters = INITIAL_16_CHAPTERS.filter((c) => c.taluk === 'Ernad');
      // Ernad taluk hosts multiple constituency chapters: Eranad & Manjeri
      expect(ernadChapters.length).toBeGreaterThanOrEqual(2);
      const chapterNames = ernadChapters.map((c) => c.name);
      expect(chapterNames).toContain('Eranad Chapter');
      expect(chapterNames).toContain('Manjeri Chapter');
    });
  });
});
