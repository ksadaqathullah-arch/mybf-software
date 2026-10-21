import { IUseCase } from '../../common/use-case.interface';
import { IGeographyRepository } from '../../ports/geography.repository.port';
import { PinCode } from '@/server/domain/identity/value-objects/pin-code.vo';
import { DomainRuleViolationError } from '@/server/domain/common/domain-error';

export interface ValidateLocationInput {
  pinCode: string;
  postOffice: string;
}

export class ValidateLocationUseCase implements IUseCase<ValidateLocationInput, { valid: boolean; message: string }> {
  constructor(private readonly geographyRepo: IGeographyRepository) {}

  public async execute(input: ValidateLocationInput): Promise<{ valid: boolean; message: string }> {
    if (!input.pinCode || !input.postOffice) {
      throw new DomainRuleViolationError('PIN code and Post Office name are required for validation.');
    }

    const pinVo = PinCode.create(input.pinCode);
    const isValid = await this.geographyRepo.validateLocationCombination(pinVo.value, input.postOffice);

    return {
      valid: isValid,
      message: isValid
        ? 'Location verified against official postal registry.'
        : 'Combination not verified in pre-indexed registry. Manual address entry enabled.',
    };
  }
}
