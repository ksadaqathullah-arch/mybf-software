import { AuthActor } from '@/server/auth/types';

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, actor?: AuthActor): Promise<TOutput>;
}
