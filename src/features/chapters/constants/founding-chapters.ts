export interface ChapterMetadata {
  code: string;
  name: string;
  constituency: string;
  slug: string;
  taluk: string;
  headquarters: string;
  description: string;
  associatedName: string; // Reference metadata provided by project owner (non-leadership)
}

export const INITIAL_16_CHAPTERS: ChapterMetadata[] = [
  {
    code: 'CHP-01-KONDOTTY',
    name: 'Kondotty Chapter',
    constituency: 'Kondotty',
    slug: 'kondotty',
    taluk: 'Kondotty',
    headquarters: 'Kondotty City',
    associatedName: 'T. P. Ashrafali',
    description: 'Airport corridor logistics, cargo, retail, and global diaspora commercial connections.',
  },
  {
    code: 'CHP-02-ERANAD',
    name: 'Eranad Chapter',
    constituency: 'Eranad',
    slug: 'eranad',
    taluk: 'Ernad',
    headquarters: 'Manjeri / Areekode',
    associatedName: 'P. K. Basheer',
    description: 'Riverfront commerce, agricultural enterprises, and rural innovation collective.',
  },
  {
    code: 'CHP-03-NILAMBUR',
    name: 'Nilambur Chapter',
    constituency: 'Nilambur',
    slug: 'nilambur',
    taluk: 'Nilambur',
    headquarters: 'Nilambur Town',
    associatedName: 'Aryadan Shoukath',
    description: 'Eco-tourism, timber crafts, agri-business, and plantation commerce network.',
  },
  {
    code: 'CHP-04-WANDOOR',
    name: 'Wandoor Chapter',
    constituency: 'Wandoor',
    slug: 'wandoor',
    taluk: 'Nilambur',
    headquarters: 'Wandoor Town',
    associatedName: 'A. P. Anil Kumar',
    description: 'Agro-processing, local retail networks, and rural youth innovations.',
  },
  {
    code: 'CHP-05-MANJERI',
    name: 'Manjeri Chapter',
    constituency: 'Manjeri',
    slug: 'manjeri',
    taluk: 'Ernad',
    headquarters: 'Manjeri City',
    associatedName: 'M. Rahmathulla',
    description: 'Commercial judicial hub and trade center supporting youth enterprises in central Ernad.',
  },
  {
    code: 'CHP-06-PERINTHALMANNA',
    name: 'Perinthalmanna Chapter',
    constituency: 'Perinthalmanna',
    slug: 'perinthalmanna',
    taluk: 'Perinthalmanna',
    headquarters: 'Perinthalmanna City',
    associatedName: 'Najeeb Kanthapuram',
    description: 'Healthcare, super-specialty medical trade, educational commerce, and retail hub.',
  },
  {
    code: 'CHP-07-MANKADA',
    name: 'Mankada Chapter',
    constituency: 'Mankada',
    slug: 'mankada',
    taluk: 'Perinthalmanna',
    headquarters: 'Mankada / Ramapuram',
    associatedName: 'Manjalamkuzhy Ali',
    description: 'Agro-industrial, spice processing, and entrepreneurship initiative.',
  },
  {
    code: 'CHP-08-MALAPPURAM',
    name: 'Malappuram Chapter',
    constituency: 'Malappuram',
    slug: 'malappuram',
    taluk: 'Ernad',
    headquarters: 'Malappuram Town',
    associatedName: 'P. K. Kunhalikutty',
    description: 'District administrative headquarters chapter driving regional forum policy and business growth.',
  },
  {
    code: 'CHP-09-VENGARA',
    name: 'Vengara Chapter',
    constituency: 'Vengara',
    slug: 'vengara',
    taluk: 'Tirurangadi',
    headquarters: 'Vengara Town',
    associatedName: 'K. M. Shaji',
    description: 'Vibrant mercantile trade, retail logistics, and diaspora investment corridor.',
  },
  {
    code: 'CHP-10-VALLIKKUNNU',
    name: 'Vallikkunnu Chapter',
    constituency: 'Vallikkunnu',
    slug: 'vallikkunnu',
    taluk: 'Tirurangadi',
    headquarters: 'Vallikkunnu / Parappanangadi',
    associatedName: 'T. V. Ibrahim',
    description: 'Coastal eco-commerce, tourism, knowledge enterprises, and artisanal production.',
  },
  {
    code: 'CHP-11-TIRURANGADI',
    name: 'Tirurangadi Chapter',
    constituency: 'Tirurangadi',
    slug: 'tirurangadi',
    taluk: 'Tirurangadi',
    headquarters: 'Tirurangadi / Chemmad',
    associatedName: 'P. M. A. Sameer',
    description: 'Educational technology, student incubation, printing commerce, and retail services.',
  },
  {
    code: 'CHP-12-TANUR',
    name: 'Tanur Chapter',
    constituency: 'Tanur',
    slug: 'tanur',
    taluk: 'Tirur',
    headquarters: 'Tanur Port Area',
    associatedName: 'P. K. Navas',
    description: 'Fishery supply chains, cold storage businesses, and coastal trade micro-enterprises.',
  },
  {
    code: 'CHP-13-TIRUR',
    name: 'Tirur Chapter',
    constituency: 'Tirur',
    slug: 'tirur',
    taluk: 'Tirur',
    headquarters: 'Tirur City',
    associatedName: 'Kurukkoli Moideen',
    description: 'Major coastal railway commercial network, manufacturing collective, and trade cluster.',
  },
  {
    code: 'CHP-14-KOTTAKKAL',
    name: 'Kottakkal Chapter',
    constituency: 'Kottakkal',
    slug: 'kottakkal',
    taluk: 'Tirur',
    headquarters: 'Kottakkal Municipality',
    associatedName: 'Abid Hussain Thangal',
    description: 'Global Ayurveda, wellness commerce, medical tourism, and heritage entrepreneurs.',
  },
  {
    code: 'CHP-15-THAVANUR',
    name: 'Thavanur Chapter',
    constituency: 'Thavanur',
    slug: 'thavanur',
    taluk: 'Ponnani',
    headquarters: 'Thavanur / Edappal Junction',
    associatedName: 'V. S. Joy',
    description: 'Agricultural research corridor, automotive trade, and southern commercial highway network.',
  },
  {
    code: 'CHP-16-PONNANI',
    name: 'Ponnani Chapter',
    constituency: 'Ponnani',
    slug: 'ponnani',
    taluk: 'Ponnani',
    headquarters: 'Ponnani Port',
    associatedName: 'K. P. Noushad Ali',
    description: 'Historic maritime trade, fisheries enterprise, marine logistics, and coastal hospitality.',
  },
];

export function getChapterBySlug(slug: string): ChapterMetadata | undefined {
  return INITIAL_16_CHAPTERS.find((ch) => ch.slug === slug);
}

export function getChapterByCode(code: string): ChapterMetadata | undefined {
  return INITIAL_16_CHAPTERS.find((ch) => ch.code === code);
}

export function getChapterName(slugOrCode: string): string {
  const match = INITIAL_16_CHAPTERS.find((ch) => ch.slug === slugOrCode || ch.code === slugOrCode);
  return match ? match.name : slugOrCode;
}
