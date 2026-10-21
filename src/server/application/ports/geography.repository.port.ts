export interface IGeographyRepository {
  lookupByPinCode(pinCode: string): Promise<any>;
  searchPostOffices(query: string): Promise<any[]>;
  lookupByLocalBody(localBodyName: string): Promise<any>;
  listTaluks(): Promise<any[]>;
  listLocalBodies(taluk?: string): Promise<any[]>;
  listWards(localBodyId: string): Promise<any[]>;
  validateLocationCombination(pinCode: string, postOfficeName: string): Promise<boolean>;
}
