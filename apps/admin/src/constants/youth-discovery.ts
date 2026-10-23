/**
 * Youth Discovery Constants & Options Catalog
 * Malappuram Youth Business Forum (MYBF)
 *
 * Defines stable identifiers, display labels, categories, and validation helpers
 * for youth registration, expectations, talent discovery, and participation preferences.
 */

// ==========================================
// 1. AGE ELIGIBILITY POLICY (35 YEARS OR BELOW)
// ==========================================
export const MIN_ELIGIBLE_AGE = 0;
export const MAX_ELIGIBLE_AGE = 35;
export const AGE_ELIGIBILITY_ERROR_MESSAGE =
  'MYBF membership registration is open to applicants aged 35 years or below.';
export const UNDER_AGE_ERROR_MESSAGE =
  'MYBF membership registration is open to applicants aged 35 years or below.';

/**
 * Calculates exact age from date of birth against a reference date.
 * Handles leap years and calendar day boundaries accurately.
 */
export function calculateAge(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth provided.');
  }

  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export interface YouthAgeValidationResult {
  eligible: boolean;
  age: number;
  error?: string;
  isUnderAge?: boolean;
  requiresAgeException?: boolean;
}

/**
 * Validates age eligibility for youth registration.
 * - Eligible if applicant is aged 35 or below (has NOT yet reached 36th birthday).
 * - Requires age exception if applicant has reached their 36th birthday (age >= 36).
 * - Rejects future dates of birth.
 */
export function validateYouthAgeEligibility(
  dateOfBirth: Date | string,
  referenceDate: Date = new Date()
): YouthAgeValidationResult {
  if (!dateOfBirth) {
    return { eligible: false, age: -1, error: 'Date of birth is required.' };
  }

  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(dob.getTime())) {
    return { eligible: false, age: -1, error: 'Please enter a valid date of birth.' };
  }

  // Reject future dates (comparing calendar dates)
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const dobMidnight = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  if (dobMidnight > refMidnight) {
    return { eligible: false, age: -1, error: 'Date of birth cannot be in the future.' };
  }

  const age = calculateAge(dob, referenceDate);

  if (age < 0) {
    return { eligible: false, age: -1, error: 'Date of birth cannot be in the future.' };
  }

  if (age > MAX_ELIGIBLE_AGE) {
    return {
      eligible: false,
      age,
      error: AGE_ELIGIBILITY_ERROR_MESSAGE,
      requiresAgeException: true,
    };
  }

  return { eligible: true, age };
}

/**
 * Validates age exception eligibility for applicants aged 36 and above.
 */
export function validateAgeExceptionEligibility(
  dateOfBirth: Date | string,
  referenceDate: Date = new Date()
): { validForException: boolean; age: number; error?: string } {
  const result = validateYouthAgeEligibility(dateOfBirth, referenceDate);
  if (result.age < 0 || result.error === 'Date of birth cannot be in the future.') {
    return { validForException: false, age: result.age, error: result.error };
  }
  if (result.age <= MAX_ELIGIBLE_AGE) {
    return {
      validForException: false,
      age: result.age,
      error: 'Applicant is already within the standard eligible youth age (35 or below). Age exception is not required.',
    };
  }
  return { validForException: true, age: result.age };
}

// ==========================================
// 2. GENDER OPTIONS (CONFIGURABLE & OPTIONAL)
// ==========================================
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
] as const;

export type GenderOptionValue = (typeof GENDER_OPTIONS)[number]['value'];

// ==========================================
// 3. EXPECTATIONS FROM MYBF
// ==========================================
export const EXPECTATION_OPTIONS = [
  {
    key: 'NETWORKING_CONNECTIONS',
    label: 'Business Networking & Connections',
    description: 'Connect with peers, business owners, and industry leaders.',
  },
  {
    key: 'STARTUP_GUIDANCE',
    label: 'Startup Guidance & Business Launch Support',
    description: 'Practical support to turn ideas into viable businesses.',
  },
  {
    key: 'MENTORSHIP',
    label: 'Mentorship from Experienced Entrepreneurs',
    description: 'One-on-one and group guidance from veteran business leaders.',
  },
  {
    key: 'BUSINESS_LEADS_COLLABORATION',
    label: 'Business Leads & Collaboration Opportunities',
    description: 'Cross-chapter referral leads and B2B joint ventures.',
  },
  {
    key: 'CAREER_GUIDANCE_JOBS',
    label: 'Career Guidance & Job Opportunities',
    description: 'Professional career counseling and corporate openings.',
  },
  {
    key: 'SKILL_DEVELOPMENT_TRAINING',
    label: 'Skill Development & Professional Training',
    description: 'Workshops on leadership, sales, tech, and operations.',
  },
  {
    key: 'INVESTOR_FUNDING',
    label: 'Investor & Funding Connections',
    description: 'Access to angel networks, pitch days, and seed capital.',
  },
  {
    key: 'EVENTS_WORKSHOPS_EXPOSURE',
    label: 'Events, Workshops & Industry Exposure',
    description: 'District and state-level business summits and expos.',
  },
  {
    key: 'LEADERSHIP_PERSONAL_DEV',
    label: 'Leadership & Personal Development',
    description: 'Executive speaking, management grooming, and confidence.',
  },
  {
    key: 'FIND_LIKE_MINDED_YOUTH',
    label: 'Find Like-Minded Youth',
    description: 'Meet ambitious peers building future-ready ventures.',
  },
  {
    key: 'COMMUNITY_SOCIAL_IMPACT',
    label: 'Community & Social Impact Projects',
    description: 'Youth initiatives supporting Malappuram community growth.',
  },
  {
    key: 'CREATIVE_TALENT_OPPORTUNITIES',
    label: 'Creative Talent & Extracurricular Opportunities',
    description: 'Showcase cultural, sports, and media skills.',
  },
  {
    key: 'OTHER',
    label: 'Other',
    description: 'Custom personal or professional objective.',
  },
] as const;

export type ExpectationKey = (typeof EXPECTATION_OPTIONS)[number]['key'];

export function getExpectationLabel(key: string): string {
  const opt = EXPECTATION_OPTIONS.find((o) => o.key === key);
  return opt ? opt.label : key;
}

// ==========================================
// 4. EXTRACURRICULAR TALENTS & SKILLS
// ==========================================
export interface TalentOption {
  key: string;
  label: string;
  category: TalentCategoryKey;
}

export type TalentCategoryKey =
  | 'ARTS_CREATIVE'
  | 'SPORTS_WELLNESS'
  | 'LEADERSHIP_COMMUNICATION'
  | 'TECHNOLOGY_INNOVATION'
  | 'OTHER';

export interface TalentCategory {
  key: TalentCategoryKey;
  title: string;
  description: string;
  options: TalentOption[];
}

export const TALENT_CATEGORIES: TalentCategory[] = [
  {
    key: 'ARTS_CREATIVE',
    title: 'Category A: Arts & Creative',
    description: 'Cultural, artistic, and multimedia creative talents',
    options: [
      { key: 'SINGING', label: 'Singing', category: 'ARTS_CREATIVE' },
      { key: 'MUSIC_INSTRUMENTS', label: 'Music / Instruments', category: 'ARTS_CREATIVE' },
      { key: 'DANCE', label: 'Dance', category: 'ARTS_CREATIVE' },
      { key: 'ACTING_THEATRE', label: 'Acting / Theatre', category: 'ARTS_CREATIVE' },
      { key: 'PHOTOGRAPHY', label: 'Photography', category: 'ARTS_CREATIVE' },
      { key: 'VIDEOGRAPHY', label: 'Videography', category: 'ARTS_CREATIVE' },
      { key: 'GRAPHIC_DESIGN', label: 'Graphic Design', category: 'ARTS_CREATIVE' },
      { key: 'CONTENT_CREATION', label: 'Content Creation', category: 'ARTS_CREATIVE' },
      { key: 'WRITING', label: 'Writing', category: 'ARTS_CREATIVE' },
    ],
  },
  {
    key: 'SPORTS_WELLNESS',
    title: 'Category B: Sports & Wellness',
    description: 'Athletic, sporting, and physical wellness disciplines',
    options: [
      { key: 'FOOTBALL', label: 'Football', category: 'SPORTS_WELLNESS' },
      { key: 'CRICKET', label: 'Cricket', category: 'SPORTS_WELLNESS' },
      { key: 'BADMINTON', label: 'Badminton', category: 'SPORTS_WELLNESS' },
      { key: 'FITNESS', label: 'Fitness', category: 'SPORTS_WELLNESS' },
      { key: 'ATHLETICS', label: 'Athletics', category: 'SPORTS_WELLNESS' },
      { key: 'MARTIAL_ARTS', label: 'Martial Arts', category: 'SPORTS_WELLNESS' },
      { key: 'OTHER_SPORTS', label: 'Other Sports', category: 'SPORTS_WELLNESS' },
    ],
  },
  {
    key: 'LEADERSHIP_COMMUNICATION',
    title: 'Category C: Leadership & Communication',
    description: 'Public discourse, emceeing, and program coordination skills',
    options: [
      { key: 'PUBLIC_SPEAKING', label: 'Public Speaking', category: 'LEADERSHIP_COMMUNICATION' },
      { key: 'EVENT_HOSTING', label: 'Event Hosting', category: 'LEADERSHIP_COMMUNICATION' },
      { key: 'DEBATE', label: 'Debate', category: 'LEADERSHIP_COMMUNICATION' },
      { key: 'EVENT_ORGANIZING', label: 'Event Organizing', category: 'LEADERSHIP_COMMUNICATION' },
      { key: 'COMMUNITY_VOLUNTEERING', label: 'Community Volunteering', category: 'LEADERSHIP_COMMUNICATION' },
      { key: 'LEADERSHIP', label: 'Leadership', category: 'LEADERSHIP_COMMUNICATION' },
    ],
  },
  {
    key: 'TECHNOLOGY_INNOVATION',
    title: 'Category D: Technology & Innovation',
    description: 'Software, emerging tech, digital engineering, and design',
    options: [
      { key: 'CODING', label: 'Coding', category: 'TECHNOLOGY_INNOVATION' },
      { key: 'AI_AUTOMATION', label: 'AI & Automation', category: 'TECHNOLOGY_INNOVATION' },
      { key: 'ROBOTICS', label: 'Robotics', category: 'TECHNOLOGY_INNOVATION' },
      { key: 'PRODUCT_DESIGN', label: 'Product Design', category: 'TECHNOLOGY_INNOVATION' },
      { key: 'DIGITAL_MARKETING', label: 'Digital Marketing', category: 'TECHNOLOGY_INNOVATION' },
      { key: 'TECH_PROJECTS', label: 'Technology Projects', category: 'TECHNOLOGY_INNOVATION' },
    ],
  },
];

export const ALL_TALENT_OPTIONS: TalentOption[] = TALENT_CATEGORIES.flatMap((c) => c.options);

export function getTalentLabel(key: string): string {
  if (key === 'OTHER_TALENT') return 'Other Talent';
  const opt = ALL_TALENT_OPTIONS.find((t) => t.key === key);
  return opt ? opt.label : key;
}

export function getTalentCategory(key: string): TalentCategoryKey {
  const opt = ALL_TALENT_OPTIONS.find((t) => t.key === key);
  return opt ? opt.category : 'OTHER';
}

// ==========================================
// 5. PARTICIPATION PREFERENCES
// ==========================================
export const PARTICIPATION_PREFERENCES = [
  {
    key: 'PARTICIPATE_EVENTS',
    label: 'Participate in MYBF events',
    description: 'Attend seminars, networking summits, and chapter meets.',
  },
  {
    key: 'PERFORM_CULTURAL_TALENT',
    label: 'Perform at cultural or talent events',
    description: 'Showcase stage talents, music, speaking, or artistic performances.',
  },
  {
    key: 'JOIN_NETWORKING_COMMUNITIES',
    label: 'Join networking communities',
    description: 'Active participation in youth business clusters and circles.',
  },
  {
    key: 'VOLUNTEER_ACTIVITIES',
    label: 'Volunteer for MYBF activities',
    description: 'Ground operations, attendee welcoming, and logistical support.',
  },
  {
    key: 'SHARE_EXPERTISE',
    label: 'Share my expertise with other members',
    description: 'Conduct peer sessions, provide domain insights and knowledge.',
  },
  {
    key: 'LEARN_FROM_PROFESSIONALS',
    label: 'Learn from experienced professionals',
    description: 'Join mentorship cohorts and masterclasses.',
  },
  {
    key: 'COLLABORATE_BUSINESS_PROJECTS',
    label: 'Collaborate on business projects',
    description: 'Partner on joint ventures, consortium bids, or pilot programs.',
  },
  {
    key: 'JOIN_SPORTS_RECREATION',
    label: 'Join sports and recreational activities',
    description: 'Participate in MYBF football leagues, badminton meets, and fitness drives.',
  },
  {
    key: 'SOCIAL_IMPACT_INITIATIVES',
    label: 'Participate in social impact initiatives',
    description: 'Community service, youth empowerment, and CSR activities.',
  },
  {
    key: 'ORGANIZE_PROGRAMS_EVENTS',
    label: 'Help organize programs and events',
    description: 'Core event management, stage management, and chapter scheduling.',
  },
] as const;

export type ParticipationPreferenceKey = (typeof PARTICIPATION_PREFERENCES)[number]['key'];

export function getParticipationPreferenceLabel(key: string): string {
  const pref = PARTICIPATION_PREFERENCES.find((p) => p.key === key);
  return pref ? pref.label : key;
}
