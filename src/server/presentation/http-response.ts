import { NextResponse } from 'next/server';
import { DomainError } from '../domain/common/domain-error';
import { ZodError } from 'zod';

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorPayload {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export class ApiResponse {
  public static ok<T>(data: T, meta?: Record<string, any>): NextResponse<ApiSuccessPayload<T>> {
    return NextResponse.json({ success: true, data, meta }, { status: 200 });
  }

  public static created<T>(data: T): NextResponse<ApiSuccessPayload<T>> {
    return NextResponse.json({ success: true, data }, { status: 201 });
  }

  public static badRequest(message: string, details?: Record<string, any>): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'BAD_REQUEST', details },
      { status: 400 }
    );
  }

  public static unauthorized(message = 'Unauthorized: Active session required.'): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  public static forbidden(message = 'Forbidden: Access restricted by organizational policy.'): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  public static notFound(message = 'Requested entity was not found.'): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  public static conflict(message: string): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'CONFLICT' },
      { status: 409 }
    );
  }

  public static unprocessable(message: string, details?: Record<string, any>): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'UNPROCESSABLE_ENTITY', details },
      { status: 422 }
    );
  }

  public static rateLimited(message = 'Too many requests. Please try again later.'): NextResponse<ApiErrorPayload> {
    return NextResponse.json(
      { success: false, error: message, code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 }
    );
  }

  /**
   * Universal error mapper for Clean Architecture:
   * Maps DomainError, ZodError, Prisma errors, and unexpected exceptions into uniform responses.
   */
  public static handle(error: unknown): NextResponse<ApiErrorPayload> {
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation failed.';
      return NextResponse.json(
        {
          success: false,
          error: message,
          code: 'VALIDATION_ERROR',
          details: { issues: error.issues },
        },
        { status: 400 }
      );
    }

    const standardError = error as Error;
    const message = standardError?.message || 'Internal server error.';

    // Check for authorization forbidden error pattern
    if (message.startsWith('Forbidden:')) {
      return ApiResponse.forbidden(message);
    }
    if (message.startsWith('Unauthorized:')) {
      return ApiResponse.unauthorized(message);
    }

    console.error('[ApiResponse.handle] Unhandled server exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
