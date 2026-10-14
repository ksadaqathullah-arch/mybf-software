import { describe, it, expect } from 'vitest';
import {
  INITIAL_16_CHAPTERS,
  getChapterBySlug,
  getChapterByCode,
  getChapterName,
} from '@/features/chapters/constants/founding-chapters';

describe('16 Constituency-Based Chapters & Master Data Integrity', () => {
  const EXPECTED_CONSTITUENCIES = [
    { rank: 1, constituency: 'Kondotty', name: 'Kondotty Chapter', slug: 'kondotty', associatedName: 'T. P. Ashrafali' },
    { rank: 2, constituency: 'Eranad', name: 'Eranad Chapter', slug: 'eranad', associatedName: 'P. K. Basheer' },
    { rank: 3, constituency: 'Nilambur', name: 'Nilambur Chapter', slug: 'nilambur', associatedName: 'Aryadan Shoukath' },
    { rank: 4, constituency: 'Wandoor', name: 'Wandoor Chapter', slug: 'wandoor', associatedName: 'A. P. Anil Kumar' },
    { rank: 5, constituency: 'Manjeri', name: 'Manjeri Chapter', slug: 'manjeri', associatedName: 'M. Rahmathulla' },
    { rank: 6, constituency: 'Perinthalmanna', name: 'Perinthalmanna Chapter', slug: 'perinthalmanna', associatedName: 'Najeeb Kanthapuram' },
    { rank: 7, constituency: 'Mankada', name: 'Mankada Chapter', slug: 'mankada', associatedName: 'Manjalamkuzhy Ali' },
    { rank: 8, constituency: 'Malappuram', name: 'Malappuram Chapter', slug: 'malappuram', associatedName: 'P. K. Kunhalikutty' },
    { rank: 9, constituency: 'Vengara', name: 'Vengara Chapter', slug: 'vengara', associatedName: 'K. M. Shaji' },
    { rank: 10, constituency: 'Vallikkunnu', name: 'Vallikkunnu Chapter', slug: 'vallikkunnu', associatedName: 'T. V. Ibrahim' },
    { rank: 11, constituency: 'Tirurangadi', name: 'Tirurangadi Chapter', slug: 'tirurangadi', associatedName: 'P. M. A. Sameer' },
    { rank: 12, constituency: 'Tanur', name: 'Tanur Chapter', slug: 'tanur', associatedName: 'P. K. Navas' },
    { rank: 13, constituency: 'Tirur', name: 'Tirur Chapter', slug: 'tirur', associatedName: 'Kurukkoli Moideen' },
    { rank: 14, constituency: 'Kottakkal', name: 'Kottakkal Chapter', slug: 'kottakkal', associatedName: 'Abid Hussain Thangal' },
    { rank: 15, constituency: 'Thavanur', name: 'Thavanur Chapter', slug: 'thavanur', associatedName: 'V. S. Joy' },
    { rank: 16, constituency: 'Ponnani', name: 'Ponnani Chapter', slug: 'ponnani', associatedName: 'K. P. Noushad Ali' },
  ];

  it('contains exactly 16 constituency chapters in the required order', () => {
    expect(INITIAL_16_CHAPTERS).toHaveLength(16);
    INITIAL_16_CHAPTERS.forEach((ch, index) => {
      const expected = EXPECTED_CONSTITUENCIES[index];
      expect(ch.constituency).toBe(expected.constituency);
      expect(ch.name).toBe(expected.name);
      expect(ch.slug).toBe(expected.slug);
      expect(ch.associatedName).toBe(expected.associatedName);
    });
  });

  it('guarantees unique codes and slugs for all chapters', () => {
    const codes = INITIAL_16_CHAPTERS.map((c) => c.code);
    const slugs = INITIAL_16_CHAPTERS.map((c) => c.slug);
    expect(new Set(codes).size).toBe(16);
    expect(new Set(slugs).size).toBe(16);
  });

  it('formats registration dropdown labels as "[Constituency] Chapter"', () => {
    const dropdownLabels = INITIAL_16_CHAPTERS.map((c) => c.name);
    expect(dropdownLabels).toEqual([
      'Kondotty Chapter',
      'Eranad Chapter',
      'Nilambur Chapter',
      'Wandoor Chapter',
      'Manjeri Chapter',
      'Perinthalmanna Chapter',
      'Mankada Chapter',
      'Malappuram Chapter',
      'Vengara Chapter',
      'Vallikkunnu Chapter',
      'Tirurangadi Chapter',
      'Tanur Chapter',
      'Tirur Chapter',
      'Kottakkal Chapter',
      'Thavanur Chapter',
      'Ponnani Chapter',
    ]);
  });

  it('provides working chapter lookup helpers', () => {
    const kondotty = getChapterBySlug('kondotty');
    expect(kondotty).toBeDefined();
    expect(kondotty?.name).toBe('Kondotty Chapter');
    expect(kondotty?.associatedName).toBe('T. P. Ashrafali');

    const eranad = getChapterByCode('CHP-02-ERANAD');
    expect(eranad).toBeDefined();
    expect(eranad?.name).toBe('Eranad Chapter');
    expect(eranad?.associatedName).toBe('P. K. Basheer');

    expect(getChapterName('ponnani')).toBe('Ponnani Chapter');
    expect(getChapterName('CHP-16-PONNANI')).toBe('Ponnani Chapter');
    expect(getChapterName('unknown-chapter')).toBe('unknown-chapter');
  });

  it('treats associated names as reference metadata without granting login or roles', () => {
    INITIAL_16_CHAPTERS.forEach((ch) => {
      // Must be a valid string
      expect(typeof ch.associatedName).toBe('string');
      expect(ch.associatedName.length).toBeGreaterThan(0);
      // Option name must NOT contain the person's name
      expect(ch.name).not.toContain(ch.associatedName);
    });
  });
});
