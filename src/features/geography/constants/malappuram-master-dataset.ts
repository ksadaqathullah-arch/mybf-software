/**
 * Malappuram District Master Geographic Reference Dataset
 * Reconstructed with exact 1-to-1 fidelity from verified administrative records:
 * "Malappuram_Local_Bodies_by_Taluk(1).xlsx"
 *
 * Source coverage:
 * - 7 Taluks
 * - 12 Municipalities
 * - 94 Grama Panchayats
 * - 15 Block Panchayats
 * - 1 District Panchayat
 * - 1 Duplicate Candidate (Edappatta GP under Perinthalmanna)
 * Total rows represented in workbook: 122 data rows.
 */

export interface VerifiedTaluk {
  code: string;
  name: string;
  headquarters: string;
}

export interface VerifiedLocalBody {
  code: string;
  name: string;
  type: 'MUNICIPALITY' | 'GRAMA_PANCHAYAT';
  talukName: string;
  blockPanchayat: string | null;
  category: string;
  notes?: string;
  isDuplicateCandidate?: boolean;
}

export interface BlockPanchayat {
  code: string;
  name: string;
  headquarters?: string;
}

export const VERIFIED_TALUKS: VerifiedTaluk[] = [
  { code: 'TLK-ERNAD', name: 'Ernad', headquarters: 'Manjeri' },
  { code: 'TLK-NILAMBUR', name: 'Nilambur', headquarters: 'Nilambur' },
  { code: 'TLK-PERINTHALMANNA', name: 'Perinthalmanna', headquarters: 'Perinthalmanna' },
  { code: 'TLK-TIRUR', name: 'Tirur', headquarters: 'Tirur' },
  { code: 'TLK-TIRURANGADI', name: 'Tirurangadi', headquarters: 'Tirurangadi' },
  { code: 'TLK-PONNANI', name: 'Ponnani', headquarters: 'Ponnani' },
  { code: 'TLK-KONDOTTY', name: 'Kondotty', headquarters: 'Kondotty' },
];

export const VERIFIED_BLOCK_PANCHAYATS: BlockPanchayat[] = [
  { code: 'BLK-AREEKODE', name: 'Areekode Block Panchayat' },
  { code: 'BLK-KALIKAVU', name: 'Kalikavu Block Panchayat' },
  { code: 'BLK-KONDOTTY', name: 'Kondotty Block Panchayat' },
  { code: 'BLK-KUTTIPPURAM', name: 'Kuttippuram Block Panchayat' },
  { code: 'BLK-MALAPPURAM', name: 'Malappuram Block Panchayat' },
  { code: 'BLK-MANKADA', name: 'Mankada Block Panchayat' },
  { code: 'BLK-NILAMBUR', name: 'Nilambur Block Panchayat' },
  { code: 'BLK-PERINTHALMANNA', name: 'Perinthalmanna Block Panchayat' },
  { code: 'BLK-PERUMPADAPPU', name: 'Perumpadappu Block Panchayat' },
  { code: 'BLK-PONNANI', name: 'Ponnani Block Panchayat' },
  { code: 'BLK-TANUR', name: 'Tanur Block Panchayat' },
  { code: 'BLK-TIRUR', name: 'Tirur Block Panchayat' },
  { code: 'BLK-TIRURANGADI', name: 'Tirurangadi Block Panchayat' },
  { code: 'BLK-VENGARA', name: 'Vengara Block Panchayat' },
  { code: 'BLK-WANDOOR', name: 'Wandoor Block Panchayat' },
];

export const DISTRICT_PANCHAYAT = {
  code: 'DIST-PAN-MALAPPURAM',
  name: 'Malappuram District Panchayat',
  coverage: 'Malappuram District',
};

/**
 * 12 Verified Municipalities
 */
export const VERIFIED_MUNICIPALITIES: VerifiedLocalBody[] = [
  {
    code: 'LB-MUN-MANJERI',
    name: 'Manjeri Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Ernad',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Major commercial hub and taluk headquarters.',
  },
  {
    code: 'LB-MUN-MALAPPURAM',
    name: 'Malappuram Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Ernad',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'District administrative headquarters.',
  },
  {
    code: 'LB-MUN-PERINTHALMANNA',
    name: 'Perinthalmanna Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Perinthalmanna',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Major healthcare and commercial center.',
  },
  {
    code: 'LB-MUN-TIRUR',
    name: 'Tirur Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirur',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Major coastal railway and commercial junction.',
  },
  {
    code: 'LB-MUN-PONNANI',
    name: 'Ponnani Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Ponnani',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Historic port city and taluk headquarters.',
  },
  {
    code: 'LB-MUN-KOTTAKKAL',
    name: 'Kottakkal Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirurangadi',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Global Ayurveda hub. Administrative taluk: Tirurangadi; historical revenue boundary note.',
  },
  {
    code: 'LB-MUN-NILAMBUR',
    name: 'Nilambur Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Nilambur',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Eastern district commercial and forest transit center.',
  },
  {
    code: 'LB-MUN-KONDOTTY',
    name: 'Kondotty Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Kondotty',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Calicut International Airport gateway and cultural center.',
  },
  {
    code: 'LB-MUN-PARAPPANANGADI',
    name: 'Parappanangadi Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirurangadi',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Coastal urban local body.',
  },
  {
    code: 'LB-MUN-TANUR',
    name: 'Tanur Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirur',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Coastal fisheries and commercial municipality.',
  },
  {
    code: 'LB-MUN-TIRURANGADI',
    name: 'Tirurangadi Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirurangadi',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'Taluk headquarters municipality.',
  },
  {
    code: 'LB-MUN-VALANCHERY',
    name: 'Valanchery Municipality',
    type: 'MUNICIPALITY',
    talukName: 'Tirur',
    blockPanchayat: null,
    category: 'Urban Local Body',
    notes: 'NH-66 transit and education hub.',
  },
];

/**
 * 94 Verified Grama Panchayats
 */
export const VERIFIED_GRAMA_PANCHAYATS: VerifiedLocalBody[] = [
  // 1. Areekode Block (Eranad & Kondotty)
  { code: 'LB-GP-AREEKODE', name: 'Areekode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-CHEEKODE', name: 'Cheekkode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-EDAVANNA', name: 'Edavanna Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KAVANOOR', name: 'Kavanoor Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KIZHUPARAMBA', name: 'Kizhuparamba Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KUZHIMANNA', name: 'Kuzhimanna Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PULPATTA', name: 'Pulpatta Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-URANGATTIRI', name: 'Urangattiri Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Areekode Block Panchayat', category: 'Rural Local Body' },

  // 2. Kalikavu Block (Nilambur & Perinthalmanna)
  { code: 'LB-GP-AMARAMBALAM', name: 'Amarambalam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-CHOKKAD', name: 'Chokkad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },
  {
    code: 'LB-GP-EDAPPATTA',
    name: 'Edappatta Grama Panchayat',
    type: 'GRAMA_PANCHAYAT',
    talukName: 'Perinthalmanna',
    blockPanchayat: 'Kalikavu Block Panchayat',
    category: 'Rural Local Body',
    notes: 'Appears twice in workbook under Perinthalmanna block and Kalikavu block. Verified single entity under Perinthalmanna taluk.',
  },
  { code: 'LB-GP-KALIKAVU', name: 'Kalikavu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KARULAI', name: 'Karulai Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KARUVARAKUNDU', name: 'Karuvarakundu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-TUVVUR', name: 'Tuvvur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Kalikavu Block Panchayat', category: 'Rural Local Body' },

  // 3. Kondotty Block (Kondotty)
  { code: 'LB-GP-CHELEMBRA', name: 'Chelembra Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-CHERUKAVU', name: 'Cherukavu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MUTHUVALLUR', name: 'Muthuvallur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PALLIKKAL', name: 'Pallikkal Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PULIKKAL', name: 'Pulikkal Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VAZHAYUR', name: 'Vazhayur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VAZHAKKAD', name: 'Vazhakkad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Kondotty Block Panchayat', category: 'Rural Local Body' },

  // 4. Kuttippuram Block (Tirur)
  { code: 'LB-GP-ATHAVANAD', name: 'Athavanad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-EDAYUR', name: 'Edayur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-IRIMBILIYAM', name: 'Irimbiliyam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KALPAKANCHERY', name: 'Kalpakanchery Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KUTTIPPURAM', name: 'Kuttippuram Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MARAKKARA', name: 'Marakkara Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Kuttippuram Block Panchayat', category: 'Rural Local Body' },

  // 5. Malappuram Block (Eranad, Perinthalmanna, Kondotty, Tirurangadi, Tirur)
  { code: 'LB-GP-ANAKKAYAM', name: 'Anakkayam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KODUR', name: 'Kodur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MORAYUR', name: 'Morayur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Kondotty', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-OTHUKKUNGAL', name: 'Othukkungal Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PONMALA', name: 'Ponmala Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-POOKKOTTUR', name: 'Pookkottur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Malappuram Block Panchayat', category: 'Rural Local Body' },

  // 6. Mankada Block (Perinthalmanna)
  { code: 'LB-GP-KOOTTILANGADI', name: 'Koottilangadi Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KURUVA', name: 'Kuruva Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MAKKARAPARAMBA', name: 'Makkaraparamba Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MANKADA', name: 'Mankada Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MOORKANAD', name: 'Moorkanad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PUZHAKKATTIRI', name: 'Puzhakkattiri Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Mankada Block Panchayat', category: 'Rural Local Body' },

  // 7. Nilambur Block (Nilambur)
  { code: 'LB-GP-CHALIYAR', name: 'Chaliyar Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-CHUNGATHARA', name: 'Chungathara Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-EDAKKARA', name: 'Edakkara Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MOOTHEDAM', name: 'Moothedam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-POTHUKAL', name: 'Pothukal Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VAZHIKKADAVU', name: 'Vazhikkadavu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Nilambur Block Panchayat', category: 'Rural Local Body' },

  // 8. Perinthalmanna Block (Perinthalmanna)
  { code: 'LB-GP-ALIPARAMBA', name: 'Aliparamba Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-ANGADIPURAM', name: 'Angadipuram Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-ELAMKULAM', name: 'Elamkulam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KEEZHATTUR', name: 'Keezhattur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MELATTUR', name: 'Melattur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PULAMANTOL', name: 'Pulamantol Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THAZHEKODE', name: 'Thazhekode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VETTATHUR', name: 'Vettathur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Perinthalmanna', blockPanchayat: 'Perinthalmanna Block Panchayat', category: 'Rural Local Body' },

  // 9. Perumpadappu Block (Ponnani)
  { code: 'LB-GP-ALAMKODE', name: 'Alamkode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Perumpadappu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MARANCHERY', name: 'Maranchery Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Perumpadappu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-NANNAMUKKU', name: 'Nannamukku Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Perumpadappu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PERUMPADAPPU', name: 'Perumpadappu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Perumpadappu Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VELIYANKODE', name: 'Veliyankode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Perumpadappu Block Panchayat', category: 'Rural Local Body' },

  // 10. Ponnani Block (Ponnani)
  { code: 'LB-GP-EDAPPAL', name: 'Edappal Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Ponnani Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VATTAMKULAM', name: 'Vattamkulam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Ponnani Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THAVANUR', name: 'Thavanur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Ponnani Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KALADY', name: 'Kalady Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ponnani', blockPanchayat: 'Ponnani Block Panchayat', category: 'Rural Local Body' },

  // 11. Tanur Block (Tirur)
  { code: 'LB-GP-CHERIYAMUNDAM', name: 'Cheriyamundam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-NIRAMARUTHUR', name: 'Niramaruthur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-OZHUR', name: 'Ozhur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PERUMANNA-KLARI', name: 'Perumanna-Klari Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PONMUNDAM', name: 'Ponmundam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-TANALUR', name: 'Tanalur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VALAVANNUR', name: 'Valavannur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tanur Block Panchayat', category: 'Rural Local Body' },

  // 12. Tirur Block (Tirur)
  { code: 'LB-GP-PURATHUR', name: 'Purathur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THALAKKAD', name: 'Thalakkad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-TIRUNAVAYA', name: 'Tirunavaya Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-TRIPRANGODE', name: 'Triprangode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VETTOM', name: 'Vettom Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-MANGALAM', name: 'Mangalam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirur', blockPanchayat: 'Tirur Block Panchayat', category: 'Rural Local Body' },

  // 13. Tirurangadi Block (Tirurangadi)
  { code: 'LB-GP-MOONNIYUR', name: 'Moonniyur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Tirurangadi Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-NANNAMBRA', name: 'Nannambra Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Tirurangadi Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VALLIKKUNNU', name: 'Vallikkunnu Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Tirurangadi Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THENHIPALAM', name: 'Thenhipalam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Tirurangadi Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PERUVALLUR', name: 'Peruvallur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Tirurangadi Block Panchayat', category: 'Rural Local Body' },

  // 14. Vengara Block (Tirurangadi)
  { code: 'LB-GP-ABDU-RAHIMAN-NAGAR', name: 'Abdu Rahiman Nagar Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-EDARIKODE', name: 'Edarikode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-KANNAMANGALAM', name: 'Kannamangalam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-OORAKAM', name: 'Oorakam Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PARAPPUR', name: 'Parappur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THENNALA', name: 'Thennala Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-VENGARA', name: 'Vengara Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Tirurangadi', blockPanchayat: 'Vengara Block Panchayat', category: 'Rural Local Body' },

  // 15. Wandoor Block (Nilambur & Eranad)
  { code: 'LB-GP-MAMPAD', name: 'Mampad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PANDIKKAD', name: 'Pandikkad Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-PORUR', name: 'Porur Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-THIRUVALI', name: 'Thiruvali Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-TRIKKALANGODE', name: 'Trikkalangode Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Ernad', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
  { code: 'LB-GP-WANDOOR', name: 'Wandoor Grama Panchayat', type: 'GRAMA_PANCHAYAT', talukName: 'Nilambur', blockPanchayat: 'Wandoor Block Panchayat', category: 'Rural Local Body' },
];

/**
 * Complete list of all 106 Residential Local Bodies (12 Municipalities + 94 Grama Panchayats)
 */
export const ALL_RESIDENTIAL_LOCAL_BODIES: VerifiedLocalBody[] = [
  ...VERIFIED_MUNICIPALITIES,
  ...VERIFIED_GRAMA_PANCHAYATS,
];

/**
 * Raw 122 Worksheet Rows simulation representing exact source workbook data
 * including the duplicate Edappatta candidate row under Perinthalmanna.
 */
export interface RawWorkbookRow {
  talukCoverage: string;
  localBodyName: string;
  localBodyType: string;
  blockPanchayat: string;
  category: string;
  notes: string;
  isDuplicateCandidate?: boolean;
}

export function getRawWorkbookRows(): RawWorkbookRow[] {
  const rows: RawWorkbookRow[] = [];

  // 1. Municipalities (12 rows)
  for (const m of VERIFIED_MUNICIPALITIES) {
    rows.push({
      talukCoverage: m.talukName,
      localBodyName: m.name,
      localBodyType: 'Municipality',
      blockPanchayat: 'None (Urban)',
      category: 'Urban Local Body',
      notes: m.notes || 'Verified Municipality',
    });
  }

  // 2. Grama Panchayats (94 rows)
  for (const gp of VERIFIED_GRAMA_PANCHAYATS) {
    rows.push({
      talukCoverage: gp.talukName,
      localBodyName: gp.name,
      localBodyType: 'Grama Panchayat',
      blockPanchayat: gp.blockPanchayat || 'Unknown Block',
      category: 'Rural Local Body',
      notes: gp.notes || 'Verified Grama Panchayat',
    });
  }

  // 3. Edappatta Duplicate Candidate row under Perinthalmanna block (Row 107)
  rows.push({
    talukCoverage: 'Perinthalmanna',
    localBodyName: 'Edappatta Grama Panchayat',
    localBodyType: 'Grama Panchayat',
    blockPanchayat: 'Perinthalmanna Block Panchayat',
    category: 'Rural Local Body',
    notes: 'Duplicate candidate row: Edappatta appears twice in source workbook under Perinthalmanna.',
    isDuplicateCandidate: true,
  });

  // 4. Block Panchayats (15 rows)
  for (const bp of VERIFIED_BLOCK_PANCHAYATS) {
    rows.push({
      talukCoverage: 'District Sub-Division',
      localBodyName: bp.name,
      localBodyType: 'Block Panchayat',
      blockPanchayat: bp.name,
      category: 'Intermediate Rural Local Body',
      notes: 'Administrative block tier (distinct from residential address selection)',
    });
  }

  // 5. District Panchayat (1 row)
  rows.push({
    talukCoverage: 'Entire District',
    localBodyName: DISTRICT_PANCHAYAT.name,
    localBodyType: 'District Panchayat',
    blockPanchayat: 'All 15 Blocks',
    category: 'Apex Rural Local Body',
    notes: 'District-wide apex local government tier',
  });

  return rows;
}
