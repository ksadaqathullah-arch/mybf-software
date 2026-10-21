import { MemberProfileEntity } from '../../domain/identity/entities/member-profile.entity';

export interface IMemberRepository {
  findById(id: string): Promise<MemberProfileEntity | null>;
  findByUserId(userId: string): Promise<MemberProfileEntity | null>;
  findByPhoneOrEmail(phone: string, email: string): Promise<MemberProfileEntity | null>;
  save(member: MemberProfileEntity): Promise<void>;
  getCompleteProfile(userId: string): Promise<any>;
  updatePhone(userId: string, memberProfileId: string, newPhone: string): Promise<void>;
  updateEmail(userId: string, memberProfileId: string, newEmail: string): Promise<void>;
}
