/**
 * Clean Architecture — Domain Layer
 * Base and Standard Domain Errors
 */

export abstract class DomainError extends Error {
  public abstract readonly code: string;
  public abstract readonly statusCode: number;

  constructor(message: string, public readonly details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  public readonly code = 'ENTITY_NOT_FOUND';
  public readonly statusCode = 404;

  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} with identifier '${identifier}' was not found.`);
  }
}

export class ValidationError extends DomainError {
  public readonly code = 'VALIDATION_ERROR';
  public readonly statusCode = 400;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

export class UnauthorizedError extends DomainError {
  public readonly code = 'UNAUTHORIZED';
  public readonly statusCode = 401;

  constructor(message = 'Authentication required. Active session credentials not provided.') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  public readonly code = 'FORBIDDEN';
  public readonly statusCode = 403;

  constructor(message = 'Access denied. Account lacks the required administrative role or chapter boundary privilege.') {
    super(message);
  }
}

export class ConflictError extends DomainError {
  public readonly code = 'CONFLICT';
  public readonly statusCode = 409;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

export class DomainRuleViolationError extends DomainError {
  public readonly code = 'DOMAIN_RULE_VIOLATION';
  public readonly statusCode = 422;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

export class RateLimitExceededError extends DomainError {
  public readonly code = 'RATE_LIMIT_EXCEEDED';
  public readonly statusCode = 429;

  constructor(message = 'Rate limit exceeded. Please wait before retrying.') {
    super(message);
  }
}
