export interface TalukGeo {
  code: string;
  name: string;
  headquarters: string;
}

export interface LocalBodyGeo {
  name: string;
  type: 'MUNICIPALITY' | 'GRAMA_PANCHAYAT';
  taluk: string;
  majorPinCodes: string[];
}

export const TALUKS_OF_MALAPPURAM: TalukGeo[] = [
  { code: 'ERNAD', name: 'Ernad', headquarters: 'Manjeri' },
  { code: 'PERINTHALMANNA', name: 'Perinthalmanna', headquarters: 'Perinthalmanna' },
  { code: 'TIRUR', name: 'Tirur', headquarters: 'Tirur' },
  { code: 'PONNANI', name: 'Ponnani', headquarters: 'Ponnani' },
  { code: 'NILAMBUR', name: 'Nilambur', headquarters: 'Nilambur' },
  { code: 'TIRURANGADI', name: 'Tirurangadi', headquarters: 'Tirurangadi' },
  { code: 'KONDOTTY', name: 'Kondotty', headquarters: 'Kondotty' },
];

export const MUNICIPALITIES_OF_MALAPPURAM: LocalBodyGeo[] = [
  { name: 'Manjeri Municipality', type: 'MUNICIPALITY', taluk: 'Ernad', majorPinCodes: ['676121', '676122'] },
  { name: 'Malappuram Municipality', type: 'MUNICIPALITY', taluk: 'Ernad', majorPinCodes: ['676505', '676504'] },
  { name: 'Perinthalmanna Municipality', type: 'MUNICIPALITY', taluk: 'Perinthalmanna', majorPinCodes: ['679322'] },
  { name: 'Tirur Municipality', type: 'MUNICIPALITY', taluk: 'Tirur', majorPinCodes: ['676101', '676104'] },
  { name: 'Ponnani Municipality', type: 'MUNICIPALITY', taluk: 'Ponnani', majorPinCodes: ['679577', '679583'] },
  { name: 'Kottakkal Municipality', type: 'MUNICIPALITY', taluk: 'Tirurangadi', majorPinCodes: ['676503'] },
  { name: 'Nilambur Municipality', type: 'MUNICIPALITY', taluk: 'Nilambur', majorPinCodes: ['679329', '679330'] },
  { name: 'Kondotty Municipality', type: 'MUNICIPALITY', taluk: 'Kondotty', majorPinCodes: ['673638'] },
  { name: 'Parappanangadi Municipality', type: 'MUNICIPALITY', taluk: 'Tirurangadi', majorPinCodes: ['676303'] },
  { name: 'Tanur Municipality', type: 'MUNICIPALITY', taluk: 'Tirur', majorPinCodes: ['676302'] },
  { name: 'Tirurangadi Municipality', type: 'MUNICIPALITY', taluk: 'Tirurangadi', majorPinCodes: ['676306'] },
  { name: 'Valanchery Municipality', type: 'MUNICIPALITY', taluk: 'Tirur', majorPinCodes: ['676552'] },
];

export const NOTABLE_PIN_CODES: Record<string, { locality: string; taluk: string }> = {
  '676121': { locality: 'Manjeri H.O', taluk: 'Ernad' },
  '676505': { locality: 'Malappuram Civil Station', taluk: 'Ernad' },
  '679322': { locality: 'Perinthalmanna H.O', taluk: 'Perinthalmanna' },
  '676101': { locality: 'Tirur H.O', taluk: 'Tirur' },
  '679577': { locality: 'Ponnani H.O', taluk: 'Ponnani' },
  '676503': { locality: 'Kottakkal S.O', taluk: 'Tirurangadi' },
  '679329': { locality: 'Nilambur S.O', taluk: 'Nilambur' },
  '673638': { locality: 'Kondotty S.O', taluk: 'Kondotty' },
  '676303': { locality: 'Parappanangadi S.O', taluk: 'Tirurangadi' },
  '676302': { locality: 'Tanur S.O', taluk: 'Tirur' },
  '676552': { locality: 'Valanchery S.O', taluk: 'Tirur' },
  '679576': { locality: 'Edappal S.O', taluk: 'Ponnani' },
  '679328': { locality: 'Wandoor S.O', taluk: 'Nilambur' },
  '673639': { locality: 'Areacode S.O', taluk: 'Ernad' },
  '679574': { locality: 'Changaramkulam S.O', taluk: 'Ponnani' },
};
