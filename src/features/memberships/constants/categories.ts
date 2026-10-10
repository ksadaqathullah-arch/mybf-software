export interface MembershipCategoryMeta {
  code: string;
  name: string;
  description: string;
  annualFeeINR: number;
  minAge: number;
  maxAge: number;
}

export const MEMBERSHIP_CATEGORIES: MembershipCategoryMeta[] = [
  {
    code: 'YOUTH_ENTREPRENEUR',
    name: 'Youth Entrepreneur',
    description: 'Founders and directors under 35 operating high-potential enterprises in Malappuram.',
    annualFeeINR: 3000,
    minAge: 18,
    maxAge: 35,
  },
  {
    code: 'ESTABLISHED_BIZ',
    name: 'Established Business Owner',
    description: 'Proprietors and managing partners of established industrial, retail, or service firms.',
    annualFeeINR: 5000,
    minAge: 25,
    maxAge: 65,
  },
  {
    code: 'PROFESSIONAL',
    name: 'Professional Member',
    description: 'Practicing Chartered Accountants, Legal Counsel, Architects, Doctors and Consultants.',
    annualFeeINR: 4000,
    minAge: 21,
    maxAge: 70,
  },
  {
    code: 'STUDENT_INNOVATOR',
    name: 'Student Innovator',
    description: 'College students developing startup ideas, prototypes, or tech solutions.',
    annualFeeINR: 1000,
    minAge: 17,
    maxAge: 26,
  },
];
