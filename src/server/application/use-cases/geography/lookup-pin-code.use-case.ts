import { IUseCase } from '../../common/use-case.interface';
import { IGeographyRepository } from '../../ports/geography.repository.port';
import { PinCode } from '@/server/domain/identity/value-objects/pin-code.vo';
import { DomainRuleViolationError } from '@/server/domain/common/domain-error';

export interface LookupPinCodeInput {
  pinCode: string;
}

export class LookupPinCodeUseCase implements IUseCase<LookupPinCodeInput, any> {
  constructor(private readonly geographyRepo: IGeographyRepository) {}

  public async execute(input: LookupPinCodeInput): Promise<any> {
    if (!input.pinCode) {
      throw new DomainRuleViolationError('PIN code is required.');
    }

    const pinVo = PinCode.create(input.pinCode);
    const data = await this.geographyRepo.lookupByPinCode(pinVo.value);

    if (!data) {
      return {
        found: false,
        pinCode: pinVo.value,
        message: 'PIN Code not in indexed registry. Requires manual verification.',
        postOffices: [],
      };
    }

    return {
      found: true,
      pinCode: pinVo.value,
      district: data.district,
      postOffices: data.postOffices,
    };
  }
}
