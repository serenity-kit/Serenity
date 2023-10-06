export class InvalidDocumentChainError extends Error {
  constructor(message) {
    super(message);

    this.name = this.constructor.name;

    // capturing the stack trace keeps the reference to your error class
    // @ts-ignore v8 specific
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnknownVersionDocumentChainError extends Error {
  constructor(message, version, knownVersion) {
    super(message);

    this.name = this.constructor.name;
    // @ts-ignore
    this.version = version;
    // @ts-ignore
    this.knownVersion = knownVersion;

    // capturing the stack trace keeps the reference to your error class
    // @ts-ignore v8 specific
    Error.captureStackTrace(this, this.constructor);
  }
}
