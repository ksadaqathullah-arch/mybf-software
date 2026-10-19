import 'server-only';
import { db } from '@/server/db';
import {
  TALUKS_OF_MALAPPURAM,
  MUNICIPALITIES_OF_MALAPPURAM,
  NOTABLE_PIN_CODES,
} from '../constants/malappuram-geo';
import {
  VERIFIED_TALUKS,
  VERIFIED_MUNICIPALITIES,
  VERIFIED_GRAMA_PANCHAYATS,
  ALL_RESIDENTIAL_LOCAL_BODIES,
  VERIFIED_BLOCK_PANCHAYATS,
  DISTRICT_PANCHAYAT,
  getRawWorkbookRows,
  type VerifiedTaluk,
  type VerifiedLocalBody,
} from '../constants/malappuram-master-dataset';
import {
  VERIFIED_POSTAL_OFFICES,
  UNIQUE_MALAPPURAM_PIN_CODES,
  VERIFIED_LOCAL_BODY_PIN_LINKS,
  type VerifiedPostOffice,
} from '../constants/malappuram-postal-dataset';

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
    const matchingLocalBodies = ALL_RESIDENTIAL_LOCAL_BODIES.filter(
      (m) => m.talukName.toLowerCase() === info.taluk.toLowerCase()
    ).map((m) => ({
      name: m.name,
      type: m.type,
      taluk: m.talukName,
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
   * Get all active districts (defaults to Malappuram)
   */
  static async getDistricts() {
    try {
      const districts = await db.district.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true, state: true, country: true },
      });
      if (districts.length > 0) return districts;
    } catch {
      // Fallback
    }

    return [
      {
        id: 'dist-malappuram',
        code: 'DIST-MALAPPURAM',
        name: 'Malappuram',
        state: 'Kerala',
        country: 'India',
      },
    ];
  }

  /**
   * Get all 7 taluks of Malappuram (Synchronous, verified reference)
   */
  static getTaluks() {
    return VERIFIED_TALUKS;
  }

  /**
   * Get all 7 taluks of Malappuram from database (Async with fallback)
   */
  static async getDatabaseTaluks() {
    try {
      const taluks = await db.taluk.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, code: true, name: true, districtId: true },
      });

      if (taluks.length > 0) {
        return taluks;
      }
    } catch {
      // Fallback to verified master dataset
    }

    return VERIFIED_TALUKS.map((t) => ({
      id: t.code,
      code: t.code,
      name: t.name,
      districtId: 'dist-malappuram',
    }));
  }

  /**
   * Get residential local bodies (Municipalities and Grama Panchayats)
   * filtered dynamically by Taluk (Synchronous, verified reference).
   */
  static getLocalBodies(talukIdentifier?: string) {
    if (!talukIdentifier || talukIdentifier === 'ALL') {
      return ALL_RESIDENTIAL_LOCAL_BODIES;
    }
    const normalized = talukIdentifier.toLowerCase().trim();
    const altSpelling = normalized === 'eranad' ? 'ernad' : normalized === 'ernad' ? 'eranad' : normalized;
    return ALL_RESIDENTIAL_LOCAL_BODIES.filter(
      (m) =>
        m.talukName.toLowerCase() === normalized ||
        m.talukName.toLowerCase() === altSpelling ||
        m.code.toLowerCase() === normalized
    );
  }

  /**
   * Get residential local bodies (Municipalities and Grama Panchayats)
   * filtered dynamically by Taluk from database (Async with fallback).
   */
  static async getDatabaseLocalBodies(talukIdentifier?: string, type?: 'MUNICIPALITY' | 'GRAMA_PANCHAYAT') {
    try {
      const whereClause: any = {};

      if (talukIdentifier && talukIdentifier !== 'ALL') {
        const normalized = talukIdentifier.toLowerCase().trim();
        const altSpelling = normalized === 'eranad' ? 'ernad' : normalized === 'ernad' ? 'eranad' : normalized;

        whereClause.taluk = {
          OR: [
            { name: { equals: normalized, mode: 'insensitive' } },
            { name: { equals: altSpelling, mode: 'insensitive' } },
            { code: { equals: normalized, mode: 'insensitive' } },
          ],
        };
      }

      if (type) {
        whereClause.type = type;
      }

      const dbLocalBodies = await db.localBody.findMany({
        where: whereClause,
        include: {
          taluk: {
            select: { name: true, code: true },
          },
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });

      if (dbLocalBodies.length > 0) {
        return dbLocalBodies.map((lb) => ({
          id: lb.id,
          code: lb.code,
          name: lb.name,
          type: lb.type,
          talukName: lb.taluk.name,
          talukCode: lb.taluk.code,
        }));
      }
    } catch {
      // Fallback to verified master dataset
    }

    let list = ALL_RESIDENTIAL_LOCAL_BODIES;
    if (talukIdentifier && talukIdentifier !== 'ALL') {
      const normalized = talukIdentifier.toLowerCase().trim();
      const altSpelling = normalized === 'eranad' ? 'ernad' : normalized === 'ernad' ? 'eranad' : normalized;
      list = list.filter(
        (lb) =>
          lb.talukName.toLowerCase() === normalized ||
          lb.talukName.toLowerCase() === altSpelling
      );
    }
    if (type) {
      list = list.filter((lb) => lb.type === type);
    }

    return list.map((lb) => ({
      id: lb.code,
      code: lb.code,
      name: lb.name,
      type: lb.type,
      talukName: lb.talukName,
      talukCode: `TLK-${lb.talukName.toUpperCase()}`,
    }));
  }

  /**
   * Get verified wards for a Local Body.
   * Returns empty with clear pending-verification flag when master ward data is not yet in DB.
   */
  static async getWards(localBodyIdentifier: string) {
    try {
      const localBody = await db.localBody.findFirst({
        where: {
          OR: [
            { id: localBodyIdentifier },
            { code: localBodyIdentifier },
            { name: { equals: localBodyIdentifier, mode: 'insensitive' } },
          ],
        },
        include: {
          wards: {
            orderBy: { wardNumber: 'asc' },
          },
        },
      });

      if (localBody && localBody.wards.length > 0) {
        return {
          hasVerifiedWards: true,
          localBodyName: localBody.name,
          wards: localBody.wards.map((w) => ({
            id: w.id,
            wardNumber: w.wardNumber,
            name: w.name || `Ward ${w.wardNumber}`,
          })),
        };
      }
    } catch {
      // Fallback
    }

    return {
      hasVerifiedWards: false,
      localBodyName: localBodyIdentifier,
      message: 'Official ward delimitation master data pending authoritative publication.',
      wards: [],
    };
  }

  /**
   * Server-side validation of submitted location hierarchy.
   * Ensures user cannot submit invalid Taluk + Local Body combinations.
   */
  static async validateLocationHierarchy(input: {
    taluk: string;
    localBody: string;
    ward?: string;
  }): Promise<{ valid: boolean; error?: string; resolvedLocalBody?: VerifiedLocalBody }> {
    const { taluk, localBody } = input;
    if (!taluk || !localBody) {
      return { valid: false, error: 'Taluk and Local Body are required.' };
    }

    const normTaluk = taluk.toLowerCase().trim();
    const altTaluk = normTaluk === 'eranad' ? 'ernad' : normTaluk === 'ernad' ? 'eranad' : normTaluk;

    // Check if taluk is valid
    const validTaluk = VERIFIED_TALUKS.find(
      (t) => t.name.toLowerCase() === normTaluk || t.name.toLowerCase() === altTaluk
    );
    if (!validTaluk) {
      return { valid: false, error: `Invalid Taluk "${taluk}". Must be one of the 7 taluks of Malappuram.` };
    }

    // Check if local body exists under this taluk
    const normLB = localBody.toLowerCase().trim();
    const matchedLB = ALL_RESIDENTIAL_LOCAL_BODIES.find((lb) => {
      const matchName =
        lb.name.toLowerCase() === normLB ||
        lb.name.toLowerCase().replace(/ (municipality|grama panchayat)$/i, '') === normLB.replace(/ (municipality|grama panchayat)$/i, '');
      const matchTaluk =
        lb.talukName.toLowerCase() === normTaluk ||
        lb.talukName.toLowerCase() === altTaluk;
      return matchName && matchTaluk;
    });

    if (!matchedLB) {
      return {
        valid: false,
        error: `Local body "${localBody}" does not belong to ${validTaluk.name} Taluk under verified administrative boundaries.`,
      };
    }

    return { valid: true, resolvedLocalBody: matchedLB };
  }

  /**
   * Aggregate member geographical distribution for District Admin
   */
  static async getGeographicDistribution() {
    try {
      const [talukGroup, unassignedCount] = await Promise.all([
        db.memberProfile.groupBy({
          by: ['taluk'],
          where: {
            taluk: { not: null },
          },
          _count: {
            id: true,
          },
        }),
        db.memberProfile.count({
          where: {
            OR: [
              { taluk: null },
              { taluk: '' },
            ],
          },
        }),
      ]);

      const results = talukGroup.map((item) => ({
        taluk: item.taluk || 'Unassigned',
        memberCount: item._count.id,
      }));

      if (unassignedCount > 0) {
        results.push({
          taluk: 'Unassigned / Pending Verification',
          memberCount: unassignedCount,
        });
      }

      return results;
    } catch {
      return TALUKS_OF_MALAPPURAM.map((t) => ({
        taluk: t.name,
        memberCount: 0,
      }));
    }
  }

  /**
   * Comprehensive Location Reference Overview for District Admin
   */
  static async getAdminLocationOverview() {
    const taluks = await this.getTaluks();
    const localBodies = await this.getLocalBodies();
    const distribution = await this.getGeographicDistribution();
    const countMap = new Map(distribution.map((d) => [d.taluk.toLowerCase(), d.memberCount]));

    const talukCards = taluks.map((t) => {
      const constituentLBs = localBodies.filter(
        (lb) => lb.talukName.toLowerCase() === t.name.toLowerCase()
      );
      const municipalities = constituentLBs.filter((lb) => lb.type === 'MUNICIPALITY');
      const gramaPanchayats = constituentLBs.filter((lb) => lb.type === 'GRAMA_PANCHAYAT');

      return {
        id: t.code,
        code: t.code,
        name: t.name,
        municipalitiesCount: municipalities.length,
        gramaPanchayatsCount: gramaPanchayats.length,
        totalLocalBodiesCount: constituentLBs.length,
        memberCount: countMap.get(t.name.toLowerCase()) || 0,
      };
    });

    return {
      summary: {
        totalDistricts: 1,
        totalTaluks: 7,
        totalLocalBodies: 106,
        totalMunicipalities: 12,
        totalGramaPanchayats: 94,
        totalBlockPanchayats: 15,
        totalDistrictPanchayats: 1,
        verificationStatus: '100% Verified Administrative Master Data',
      },
      taluks: talukCards,
      localBodies,
      blocks: VERIFIED_BLOCK_PANCHAYATS,
      rawWorkbookRows: getRawWorkbookRows(),
    };
  }

  /**
   * Method 1: Lookup Post Offices by 6-digit PIN code.
   * Searches database first, with fallback to verified postal dataset.
   * Returns all associated post offices (H.O, S.O, B.O) without arbitrarily selecting one.
   */
  static async lookupPostOfficesByPin(pinCode: string): Promise<{
    found: boolean;
    pinCode: string;
    postOffices: Array<{
      id: string;
      code: string;
      name: string;
      pinCode: string;
      officeType: string;
      deliveryStatus: string;
      talukName: string;
      localBodyName?: string | null;
      postalDivision?: string | null;
    }>;
    message?: string;
  }> {
    const trimmed = pinCode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      return {
        found: false,
        pinCode: trimmed,
        postOffices: [],
        message: 'Invalid PIN Code format. Must be exactly 6 digits.',
      };
    }

    try {
      const dbOffices = await db.postOffice.findMany({
        where: { pinCode: trimmed },
        include: {
          taluk: { select: { name: true } },
          localBody: { select: { name: true } },
        },
        orderBy: [
          { officeType: 'asc' }, // HO before SO, SO before BO
          { name: 'asc' },
        ],
      });

      if (dbOffices.length > 0) {
        return {
          found: true,
          pinCode: trimmed,
          postOffices: dbOffices.map((po) => ({
            id: po.id,
            code: po.code,
            name: po.name,
            pinCode: po.pinCode,
            officeType: po.officeType,
            deliveryStatus: po.deliveryStatus,
            talukName: po.taluk?.name || 'Malappuram District',
            localBodyName: po.localBody?.name || null,
            postalDivision: po.postalDivision,
          })),
        };
      }
    } catch {
      // Fallback to in-memory verified dataset
    }

    // Fallback search in verified master dataset
    const matches = VERIFIED_POSTAL_OFFICES.filter((po) => po.pinCode === trimmed);
    if (matches.length > 0) {
      return {
        found: true,
        pinCode: trimmed,
        postOffices: matches.map((po) => ({
          id: po.code,
          code: po.code,
          name: po.name,
          pinCode: po.pinCode,
          officeType: po.officeType,
          deliveryStatus: po.deliveryStatus,
          talukName: po.talukName,
          localBodyName: po.localBodyName || null,
          postalDivision: po.postalDivision,
        })),
      };
    }

    return {
      found: false,
      pinCode: trimmed,
      postOffices: [],
      message: 'PIN Code not in verified Malappuram postal directory. Manual input permitted.',
    };
  }

  /**
   * Method 2: Lookup Post Offices by Taluk + Local Body.
   * Retrieves post offices using only verified location-to-post-office associations.
   * If no verified mappings exist, indicates pending state and suggests PIN Code search.
   */
  static async getPostOfficesByLocalBody(input: {
    localBody: string;
    taluk?: string;
  }): Promise<{
    hasVerifiedPostalMapping: boolean;
    localBodyName: string;
    postOffices: Array<{
      id: string;
      code: string;
      name: string;
      pinCode: string;
      officeType: string;
      deliveryStatus: string;
      talukName: string;
      postalDivision?: string | null;
    }>;
    message?: string;
  }> {
    const { localBody, taluk } = input;
    if (!localBody) {
      return {
        hasVerifiedPostalMapping: false,
        localBodyName: '',
        postOffices: [],
        message: 'Local body selection is required.',
      };
    }

    const normLB = localBody.toLowerCase().trim();

    try {
      // 1. Check via database PinLocalityLink and PostOffice
      const matchedLB = await db.localBody.findFirst({
        where: {
          OR: [
            { name: { equals: localBody, mode: 'insensitive' } },
            { code: localBody },
          ],
        },
        include: {
          pinLinks: {
            where: { isVerified: true },
            include: {
              pin: {
                include: {
                  postOffices: {
                    orderBy: [{ officeType: 'asc' }, { name: 'asc' }],
                  },
                },
              },
            },
          },
          postOffices: {
            orderBy: [{ officeType: 'asc' }, { name: 'asc' }],
            include: { taluk: { select: { name: true } } },
          },
        },
      });

      if (matchedLB) {
        const officesMap = new Map<string, any>();
        for (const po of matchedLB.postOffices) {
          officesMap.set(po.code, {
            id: po.id,
            code: po.code,
            name: po.name,
            pinCode: po.pinCode,
            officeType: po.officeType,
            deliveryStatus: po.deliveryStatus,
            talukName: po.taluk?.name || taluk || 'Malappuram District',
            postalDivision: po.postalDivision,
          });
        }

        for (const link of matchedLB.pinLinks) {
          for (const po of link.pin.postOffices) {
            if (!officesMap.has(po.code)) {
              officesMap.set(po.code, {
                id: po.id,
                code: po.code,
                name: po.name,
                pinCode: po.pinCode,
                officeType: po.officeType,
                deliveryStatus: po.deliveryStatus,
                talukName: taluk || 'Malappuram District',
                postalDivision: po.postalDivision,
              });
            }
          }
        }

        if (officesMap.size > 0) {
          return {
            hasVerifiedPostalMapping: true,
            localBodyName: matchedLB.name,
            postOffices: Array.from(officesMap.values()),
          };
        }
      }
    } catch {
      // Fallback
    }

    // Fallback to verified constants
    const directMatches = VERIFIED_POSTAL_OFFICES.filter((po) => {
      if (!po.localBodyName) return false;
      const poNorm = po.localBodyName.toLowerCase().trim();
      return (
        poNorm === normLB ||
        poNorm.replace(/ (municipality|grama panchayat)$/i, '') ===
          normLB.replace(/ (municipality|grama panchayat)$/i, '')
      );
    });

    if (directMatches.length > 0) {
      return {
        hasVerifiedPostalMapping: true,
        localBodyName: localBody,
        postOffices: directMatches.map((po) => ({
          id: po.code,
          code: po.code,
          name: po.name,
          pinCode: po.pinCode,
          officeType: po.officeType,
          deliveryStatus: po.deliveryStatus,
          talukName: po.talukName,
          postalDivision: po.postalDivision,
        })),
      };
    }

    // Check VERIFIED_LOCAL_BODY_PIN_LINKS
    const pinLinks = VERIFIED_LOCAL_BODY_PIN_LINKS.filter((l) => {
      const linkNorm = l.localBodyName.toLowerCase().trim();
      return (
        linkNorm === normLB ||
        linkNorm.replace(/ (municipality|grama panchayat)$/i, '') ===
          normLB.replace(/ (municipality|grama panchayat)$/i, '')
      );
    });

    if (pinLinks.length > 0) {
      const pinCodes = new Set(pinLinks.map((l) => l.pinCode));
      const linkedOffices = VERIFIED_POSTAL_OFFICES.filter((po) => pinCodes.has(po.pinCode));
      if (linkedOffices.length > 0) {
        return {
          hasVerifiedPostalMapping: true,
          localBodyName: localBody,
          postOffices: linkedOffices.map((po) => ({
            id: po.code,
            code: po.code,
            name: po.name,
            pinCode: po.pinCode,
            officeType: po.officeType,
            deliveryStatus: po.deliveryStatus,
            talukName: po.talukName,
            postalDivision: po.postalDivision,
          })),
        };
      }
    }

    return {
      hasVerifiedPostalMapping: false,
      localBodyName: localBody,
      message:
        'Verified postal mapping pending for this local body. Please enter your 6-digit PIN Code to lookup your Post Office.',
      postOffices: [],
    };
  }

  /**
   * Search Post Offices by Name or PIN
   */
  static async searchPostOffices(query: string, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
      const dbResults = await db.postOffice.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { pinCode: { startsWith: q } },
          ],
        },
        include: {
          taluk: { select: { name: true } },
          localBody: { select: { name: true } },
        },
        take: limit,
        orderBy: [{ officeType: 'asc' }, { name: 'asc' }],
      });

      if (dbResults.length > 0) {
        return dbResults.map((po) => ({
          id: po.id,
          code: po.code,
          name: po.name,
          pinCode: po.pinCode,
          officeType: po.officeType,
          deliveryStatus: po.deliveryStatus,
          talukName: po.taluk?.name || 'Malappuram District',
          localBodyName: po.localBody?.name || null,
          postalDivision: po.postalDivision,
        }));
      }
    } catch {
      // Fallback
    }

    return VERIFIED_POSTAL_OFFICES.filter(
      (po) =>
        po.name.toLowerCase().includes(q) ||
        po.pinCode.startsWith(q) ||
        po.talukName.toLowerCase().includes(q)
    )
      .slice(0, limit)
      .map((po) => ({
        id: po.code,
        code: po.code,
        name: po.name,
        pinCode: po.pinCode,
        officeType: po.officeType,
        deliveryStatus: po.deliveryStatus,
        talukName: po.talukName,
        localBodyName: po.localBodyName || null,
        postalDivision: po.postalDivision,
      }));
  }

  /**
   * Server-side validation of submitted Post Office and PIN Code.
   * If both are provided, verifies that the Post Office belongs to the PIN Code.
   */
  static async validatePostalRelationship(input: {
    pinCode?: string | null;
    postOffice?: string | null;
    localBody?: string | null;
    taluk?: string | null;
  }): Promise<{ valid: boolean; error?: string; resolvedPostOffice?: any }> {
    const { pinCode, postOffice } = input;
    if (!pinCode || !postOffice) {
      return { valid: true };
    }

    const trimmedPin = pinCode.trim();
    const trimmedPO = postOffice.trim();

    if (!/^\d{6}$/.test(trimmedPin)) {
      return { valid: false, error: 'PIN Code must be a valid 6-digit number.' };
    }

    const poLookup = await this.lookupPostOfficesByPin(trimmedPin);
    if (poLookup.found && poLookup.postOffices.length > 0) {
      const match = poLookup.postOffices.find(
        (po) =>
          po.name.toLowerCase() === trimmedPO.toLowerCase() ||
          po.name.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '') ===
            trimmedPO.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '')
      );

      if (match) {
        return {
          valid: true,
          resolvedPostOffice: { ...match, isVerified: true },
        };
      }

      // Check if this post office is known to belong to a different PIN code
      const knownElsewhere = VERIFIED_POSTAL_OFFICES.find(
        (po) =>
          po.name.toLowerCase() === trimmedPO.toLowerCase() ||
          po.name.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '') ===
            trimmedPO.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '')
      );

      if (knownElsewhere && knownElsewhere.pinCode !== trimmedPin) {
        return {
          valid: false,
          error: `Post office "${trimmedPO}" is associated with PIN ${knownElsewhere.pinCode} and is not associated with PIN ${trimmedPin}.`,
        };
      }

      return {
        valid: true,
        resolvedPostOffice: { name: trimmedPO, pinCode: trimmedPin, isVerified: false },
      };
    }

    // PIN not in directory, verify it's not a known PO from another PIN
    const knownElsewhere = VERIFIED_POSTAL_OFFICES.find(
      (po) =>
        po.name.toLowerCase() === trimmedPO.toLowerCase() ||
        po.name.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '') ===
          trimmedPO.toLowerCase().replace(/ (h\.o|s\.o|b\.o)$/i, '')
    );

    if (knownElsewhere && knownElsewhere.pinCode !== trimmedPin) {
      return {
        valid: false,
        error: `Post office "${trimmedPO}" is associated with PIN ${knownElsewhere.pinCode} and is not associated with PIN ${trimmedPin}.`,
      };
    }

    return {
      valid: true,
      resolvedPostOffice: {
        name: trimmedPO,
        pinCode: trimmedPin,
        isVerified: false,
      },
    };
  }

  /**
   * Admin Postal Directory Overview
   */
  static async getAdminPostalOverview() {
    try {
      const [totalPins, totalPOs, totalLinks, offices] = await Promise.all([
        db.pinCode.count(),
        db.postOffice.count(),
        db.pinLocalityLink.count(),
        db.postOffice.findMany({
          include: {
            taluk: { select: { name: true } },
            localBody: { select: { name: true } },
          },
          orderBy: [{ pinCode: 'asc' }, { name: 'asc' }],
        }),
      ]);

      return {
        summary: {
          totalPins,
          totalPostOffices: totalPOs,
          totalVerifiedLinks: totalLinks,
          divisions: ['Manjeri Postal Division', 'Tirur Postal Division'],
        },
        offices: offices.map((po) => ({
          id: po.id,
          code: po.code,
          name: po.name,
          pinCode: po.pinCode,
          officeType: po.officeType,
          deliveryStatus: po.deliveryStatus,
          talukName: po.taluk?.name || 'Malappuram District',
          localBodyName: po.localBody?.name || 'Cross-boundary / Unmapped',
          postalDivision: po.postalDivision,
          isVerified: po.isVerified,
        })),
      };
    } catch {
      return {
        summary: {
          totalPins: UNIQUE_MALAPPURAM_PIN_CODES.length,
          totalPostOffices: VERIFIED_POSTAL_OFFICES.length,
          totalVerifiedLinks: VERIFIED_LOCAL_BODY_PIN_LINKS.length,
          divisions: ['Manjeri Postal Division', 'Tirur Postal Division'],
        },
        offices: VERIFIED_POSTAL_OFFICES.map((po) => ({
          id: po.code,
          code: po.code,
          name: po.name,
          pinCode: po.pinCode,
          officeType: po.officeType,
          deliveryStatus: po.deliveryStatus,
          talukName: po.talukName,
          localBodyName: po.localBodyName || 'Cross-boundary / Unmapped',
          postalDivision: po.postalDivision,
          isVerified: true,
        })),
      };
    }
  }
}
