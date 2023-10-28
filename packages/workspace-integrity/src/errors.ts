export class InvalidWorkspaceIntegrityError extends Error {
  constructor(message) {
    super(message);

    this.name = this.constructor.name;

    // capturing the stack trace keeps the reference to your error class
    // @ts-ignore v8 specific
    Error.captureStackTrace(this, this.constructor);
  }
}
