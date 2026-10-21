import { db } from '@/server/db';
import { IGeographyRepository } from '../../application/ports/geography.repository.port';

export class PrismaGeographyRepository implements IGeographyRepository {
  public async lookupByPinCode(pinCode: string): Promise<any> {
    const pin = await db.pinCode.findFirst({
      where: { code: pinCode.trim() },
      include: {
        taluk: true,
        postOffices: {
          include: {
            localBody: true,
            taluk: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!pin) return null;

    const district = pin.postOffices[0]?.postalDistrict || 'Malappuram';

    return {
      code: pin.code,
      district,
      postOffices: pin.postOffices.map((po) => ({
        id: po.id,
        name: po.name,
        pincode: pin.code,
        taluk: po.taluk?.name || po.localBody?.name || pin.taluk?.name || 'Ernad',
        localBody: po.localBody?.name || null,
        localBodyType: po.localBody?.type || null,
        deliveryStatus: po.deliveryStatus,
      })),
    };
  }

  public async searchPostOffices(query: string): Promise<any[]> {
    const postOffices = await db.postOffice.findMany({
      where: {
        name: { contains: query.trim(), mode: 'insensitive' },
      },
      include: {
        localBody: true,
        taluk: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return postOffices.map((po) => ({
      id: po.id,
      name: po.name,
      pincode: po.pinCode,
      taluk: po.taluk?.name || po.localBody?.name || 'Ernad',
      localBody: po.localBody?.name || null,
    }));
  }

  public async lookupByLocalBody(localBodyName: string): Promise<any> {
    const localBody = await db.localBody.findFirst({
      where: {
        name: { contains: localBodyName.trim(), mode: 'insensitive' },
      },
      include: {
        taluk: true,
        postOffices: {
          include: { pin: true },
        },
      },
    });

    if (!localBody) return null;

    return {
      id: localBody.id,
      name: localBody.name,
      type: localBody.type,
      taluk: localBody.taluk?.name || null,
      postOffices: localBody.postOffices.map((po) => ({
        id: po.id,
        name: po.name,
        pincode: po.pinCode,
      })),
    };
  }

  public async listTaluks(): Promise<any[]> {
    return db.taluk.findMany({
      orderBy: { name: 'asc' },
      include: { localBodies: true },
    });
  }

  public async listLocalBodies(taluk?: string): Promise<any[]> {
    const where: any = {};
    if (taluk) {
      where.taluk = { name: { contains: taluk, mode: 'insensitive' } };
    }
    return db.localBody.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { taluk: true },
    });
  }

  public async listWards(localBodyId: string): Promise<any[]> {
    return db.ward.findMany({
      where: { localBodyId },
      orderBy: { wardNumber: 'asc' },
    });
  }

  public async validateLocationCombination(pinCode: string, postOfficeName: string): Promise<boolean> {
    const cleanPin = pinCode.trim();
    const cleanPo = postOfficeName.trim().toLowerCase();

    const match = await db.postOffice.findFirst({
      where: {
        pinCode: cleanPin,
        name: { equals: cleanPo, mode: 'insensitive' },
      },
    });

    return !!match;
  }
}
