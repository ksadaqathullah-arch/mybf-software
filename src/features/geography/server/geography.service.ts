import 'server-only';
import { db } from '@/server/db';
import { TALUKS_OF_MALAPPURAM, MUNICIPALITIES_OF_MALAPPURAM, NOTABLE_PIN_CODES } from '../constants/malappuram-geo';

export class GeographyService {
  /**
   * Safe postal code lookup.
   * Returns suggested locality and taluk without silently inferring ward.
   */
  static lookupPinCode(pinCode: string) {
    const trimmed = pinCode.trim();
    const info = NOTABLE_PIN_CODES[trimmed];

    if (!info) {
      return {
        found: false,
        pinCode: trimmed,
        message: 'PIN Code not in pre-indexed Malappuram registry. Requires manual verification.',
        suggestions: [],
      };
    }

    // Find candidate local bodies in the same taluk
    const matchingLocalBodies = MUNICIPALITIES_OF_MALAPPURAM.filter((m) =>
      m.majorPinCodes.includes(trimmed) || m.taluk === info.taluk
    ).map((m) => ({
      name: m.name,
      type: m.type,
      taluk: m.taluk,
    }));

    return {
      found: true,
      pinCode: trimmed,
      locality: info.locality,
      taluk: info.taluk,
      suggestions: matchingLocalBodies,
    };
  }

  /**
   * Get all 7 taluks of Malappuram
   */
  static getTaluks() {
    return TALUKS_OF_MALAPPURAM;
  }

  /**
   * Get all municipalities and local bodies
   */
  static getLocalBodies(talukCode?: string) {
    if (!talukCode) return MUNICIPALITIES_OF_MALAPPURAM;
    const taluk = TALUKS_OF_MALAPPURAM.find((t) => t.code === talukCode);
    if (!taluk) return MUNICIPALITIES_OF_MALAPPURAM;
    return MUNICIPALITIES_OF_MALAPPURAM.filter((m) => m.taluk === taluk.name);
  }

  /**
   * Aggregate member geographical distribution for District Admin
   */
  static async getGeographicDistribution() {
    const distribution = await db.memberProfile.groupBy({
      by: ['taluk'],
      where: {
        taluk: { not: null },
      },
      _count: {
        id: true,
      },
    });

    return distribution.map((item) => ({
      taluk: item.taluk || 'Unassigned',
      memberCount: item._count.id,
    }));
  }
}
