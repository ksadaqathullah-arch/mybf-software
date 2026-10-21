/**
 * Clean Architecture — Functional Result Pattern
 * Encapsulates success (Ok) and failure (Err) without throwing unhandled exceptions.
 */

export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

export const Result = {
  ok<T>(data: T): Result<T, never> {
    return { success: true, data };
  },

  err<E = Error>(error: E): Result<never, E> {
    return { success: false, error };
  },

  isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
    return result.success === true;
  },

  isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return result.success === false;
  },
};
