/* tslint:disable */
/* eslint-disable */
/**
 */
export function set_panic_hook(): void;
/**
 */
export class HandleLogin {
  free(): void;
  /**
   * @param {ServerSetup} setup
   */
  constructor(setup: ServerSetup);
  /**
   * @param {Uint8Array | undefined} password_file
   * @param {Uint8Array} identifier
   * @param {Uint8Array} credential_request
   * @returns {Uint8Array}
   */
  start(
    password_file: Uint8Array | undefined,
    identifier: Uint8Array,
    credential_request: Uint8Array
  ): Uint8Array;
  /**
   * @param {Uint8Array} credential_finish
   * @returns {Uint8Array}
   */
  finish(credential_finish: Uint8Array): Uint8Array;
}
/**
 */
export class HandleRegistration {
  free(): void;
  /**
   * @param {ServerSetup} setup
   */
  constructor(setup: ServerSetup);
  /**
   * @param {Uint8Array} identifier
   * @param {Uint8Array} registration_request
   * @returns {Uint8Array}
   */
  start(identifier: Uint8Array, registration_request: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} registration_finish
   * @returns {Uint8Array}
   */
  finish(registration_finish: Uint8Array): Uint8Array;
}
/**
 */
export class Login {
  free(): void;
  /**
   */
  constructor();
  /**
   * @param {string} password
   * @returns {Uint8Array}
   */
  start(password: string): Uint8Array;
  /**
   * @param {string} pass
   * @param {Uint8Array} message
   * @returns {Uint8Array}
   */
  finish(pass: string, message: Uint8Array): Uint8Array;
  /**
   * @returns {Uint8Array}
   */
  getSessionKey(): Uint8Array;
  /**
   * @returns {Uint8Array}
   */
  getExportKey(): Uint8Array;
}
/**
 */
export class Registration {
  free(): void;
  /**
   */
  constructor();
  /**
   * @param {string} password
   * @returns {Uint8Array}
   */
  start(password: string): Uint8Array;
  /**
   * @param {string} pass
   * @param {Uint8Array} message
   * @returns {Uint8Array}
   */
  finish(pass: string, message: Uint8Array): Uint8Array;
  /**
   * @returns {Uint8Array}
   */
  getExportKey(): Uint8Array;
}
/**
 */
export class ServerSetup {
  free(): void;
  /**
   */
  constructor();
  /**
   * @returns {Uint8Array}
   */
  serialize(): Uint8Array;
  /**
   * @param {Uint8Array} input
   * @returns {ServerSetup}
   */
  static deserialize(input: Uint8Array): ServerSetup;
}

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_serversetup_free: (a: number) => void;
  readonly serversetup_new: () => number;
  readonly serversetup_serialize: (a: number, b: number) => void;
  readonly serversetup_deserialize: (a: number, b: number, c: number) => void;
  readonly __wbg_login_free: (a: number) => void;
  readonly login_new: () => number;
  readonly login_start: (a: number, b: number, c: number, d: number) => void;
  readonly login_finish: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly login_getSessionKey: (a: number, b: number) => void;
  readonly login_getExportKey: (a: number, b: number) => void;
  readonly __wbg_registration_free: (a: number) => void;
  readonly registration_new: () => number;
  readonly registration_start: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => void;
  readonly registration_finish: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly registration_getExportKey: (a: number, b: number) => void;
  readonly __wbg_handlelogin_free: (a: number) => void;
  readonly handlelogin_new: (a: number) => number;
  readonly handlelogin_start: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number
  ) => void;
  readonly handlelogin_finish: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => void;
  readonly set_panic_hook: () => void;
  readonly __wbg_handleregistration_free: (a: number) => void;
  readonly handleregistration_new: (a: number) => number;
  readonly handleregistration_start: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => void;
  readonly handleregistration_finish: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function init(
  module_or_path?: InitInput | Promise<InitInput>
): Promise<InitOutput>;
