import { describe, it, expect } from 'vitest';
import { GeographyService } from '@/features/geography/server/geography.service';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';

describe('Geographical Data System & Chapter Integrity', () => {
  it('contains exactly 16 founding chapters', () => {
    expect(INITIAL_16_CHAPTERS).toHaveLength(16);
  });

  it('contains exactly 7 Taluks of Malappuram district', () => {
    expect(TALUKS_OF_MALAPPURAM).toHaveLength(7);
    const talukNames = TALUKS_OF_MALAPPURAM.map((t) => t.name);
    expect(talukNames).toContain('Ernad');
    expect(talukNames).toContain('Perinthalmanna');
    expect(talukNames).toContain('Tirur');
    expect(talukNames).toContain('Ponnani');
    expect(talukNames).toContain('Nilambur');
    expect(talukNames).toContain('Tirurangadi');
    expect(talukNames).toContain('Kondotty');
  });

  it('performs safe PIN lookup without silently inferring ward', () => {
    const manjeriLookup = GeographyService.lookupPinCode('676121');
    expect(manjeriLookup.found).toBe(true);
    expect(manjeriLookup.locality).toBe('Manjeri H.O');
    expect(manjeriLookup.taluk).toBe('Ernad');
    expect(manjeriLookup.suggestions.length).toBeGreaterThan(0);
    // Ward is never returned automatically from PIN code
    expect((manjeriLookup as Record<string, unknown>).ward).toBeUndefined();
  });
});
