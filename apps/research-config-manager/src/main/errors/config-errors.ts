export class ConfigParseError extends Error {
  readonly code = 'CONFIG_PARSE_ERROR';

  constructor(
    public readonly path: string,
    cause: Error
  ) {
    super(`Failed to parse config at ${path}: ${cause.message}`);
    this.name = 'ConfigParseError';
    this.cause = cause;
  }
}

export class ConfigValidationError extends Error {
  readonly code = 'CONFIG_VALIDATION_ERROR';

  constructor(
    public readonly path: string,
    cause: Error
  ) {
    super(`Config validation failed at ${path}: ${cause.message}`);
    this.name = 'ConfigValidationError';
    this.cause = cause;
  }
}
