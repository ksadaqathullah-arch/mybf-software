import { z } from 'zod';

export const locationSelectionSchema = z.object({
  district: z.string().default('Malappuram'),
  taluk: z.string().min(1, 'Please select a Taluk'),
  localBody: z.string().min(1, 'Please select a Local Body (Municipality or Grama Panchayat)'),
  ward: z.string().optional(),
  postOffice: z.string().optional(),
  pinCode: z
    .string()
    .regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits')
    .optional()
    .or(z.literal('')),
});

export type LocationSelectionInput = z.infer<typeof locationSelectionSchema>;

export const adminLocationFilterSchema = z.object({
  taluk: z.string().optional(),
  type: z.enum(['ALL', 'MUNICIPALITY', 'GRAMA_PANCHAYAT']).optional().default('ALL'),
  search: z.string().optional(),
});

export type AdminLocationFilterInput = z.infer<typeof adminLocationFilterSchema>;
