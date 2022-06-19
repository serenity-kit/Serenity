let imports = {};
imports["__wbindgen_placeholder__"] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedTextEncoder = new TextEncoder("utf-8");

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
/**
 */
class HandleLogin {
  static __wrap(ptr) {
    const obj = Object.create(HandleLogin.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_handlelogin_free(ptr);
  }
  /**
   * @param {ServerSetup} setup
   */
  constructor(setup) {
    _assertClass(setup, ServerSetup);
    const ret = wasm.handlelogin_new(setup.ptr);
    return HandleLogin.__wrap(ret);
  }
  /**
   * @param {Uint8Array | undefined} password_file
   * @param {Uint8Array} identifier
   * @param {Uint8Array} credential_request
   * @returns {Uint8Array}
   */
  start(password_file, identifier, credential_request) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(password_file)
        ? 0
        : passArray8ToWasm0(password_file, wasm.__wbindgen_malloc);
      var len0 = WASM_VECTOR_LEN;
      const ptr1 = passArray8ToWasm0(identifier, wasm.__wbindgen_malloc);
      const len1 = WASM_VECTOR_LEN;
      const ptr2 = passArray8ToWasm0(
        credential_request,
        wasm.__wbindgen_malloc
      );
      const len2 = WASM_VECTOR_LEN;
      wasm.handlelogin_start(
        retptr,
        this.ptr,
        ptr0,
        len0,
        ptr1,
        len1,
        ptr2,
        len2
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v3 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v3;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} credential_finish
   * @returns {Uint8Array}
   */
  finish(credential_finish) {
    try {
      const ptr = this.__destroy_into_raw();
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(credential_finish, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.handlelogin_finish(retptr, ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
module.exports.HandleLogin = HandleLogin;
/**
 */
class HandleRegistration {
  static __wrap(ptr) {
    const obj = Object.create(HandleRegistration.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_handleregistration_free(ptr);
  }
  /**
   * @param {ServerSetup} setup
   */
  constructor(setup) {
    _assertClass(setup, ServerSetup);
    const ret = wasm.handleregistration_new(setup.ptr);
    return HandleRegistration.__wrap(ret);
  }
  /**
   * @param {Uint8Array} identifier
   * @param {Uint8Array} registration_request
   * @returns {Uint8Array}
   */
  start(identifier, registration_request) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(identifier, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArray8ToWasm0(
        registration_request,
        wasm.__wbindgen_malloc
      );
      const len1 = WASM_VECTOR_LEN;
      wasm.handleregistration_start(retptr, this.ptr, ptr0, len0, ptr1, len1);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v2 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} registration_finish
   * @returns {Uint8Array}
   */
  finish(registration_finish) {
    try {
      const ptr = this.__destroy_into_raw();
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(
        registration_finish,
        wasm.__wbindgen_malloc
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.handleregistration_finish(retptr, ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
module.exports.HandleRegistration = HandleRegistration;
/**
 */
class Login {
  static __wrap(ptr) {
    const obj = Object.create(Login.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_login_free(ptr);
  }
  /**
   */
  constructor() {
    const ret = wasm.login_new();
    return Login.__wrap(ret);
  }
  /**
   * @param {string} password
   * @returns {Uint8Array}
   */
  start(password) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        password,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.login_start(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} message
   * @returns {Uint8Array}
   */
  finish(message) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.login_finish(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {Uint8Array}
   */
  getSessionKey() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.login_getSessionKey(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v0 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {Uint8Array}
   */
  getExportKey() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.login_getExportKey(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v0 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
module.exports.Login = Login;
/**
 */
class Registration {
  static __wrap(ptr) {
    const obj = Object.create(Registration.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_registration_free(ptr);
  }
  /**
   */
  constructor() {
    const ret = wasm.registration_new();
    return Registration.__wrap(ret);
  }
  /**
   * @param {string} password
   * @returns {Uint8Array}
   */
  start(password) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        password,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.registration_start(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} message
   * @returns {Uint8Array}
   */
  finish(message) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.registration_finish(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {Uint8Array}
   */
  getExportKey() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.registration_getExportKey(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v0 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
module.exports.Registration = Registration;
/**
 */
class ServerSetup {
  static __wrap(ptr) {
    const obj = Object.create(ServerSetup.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_serversetup_free(ptr);
  }
  /**
   */
  constructor() {
    const ret = wasm.serversetup_new();
    return ServerSetup.__wrap(ret);
  }
  /**
   * @returns {Uint8Array}
   */
  serialize() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.serversetup_serialize(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var v0 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} input
   * @returns {ServerSetup}
   */
  static deserialize(input) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.serversetup_deserialize(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ServerSetup.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
module.exports.ServerSetup = ServerSetup;

module.exports.__wbindgen_string_new = function (arg0, arg1) {
  const ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
};

module.exports.__wbindgen_object_drop_ref = function (arg0) {
  takeObject(arg0);
};

module.exports.__wbg_process_70251ed1291754d5 = function (arg0) {
  const ret = getObject(arg0).process;
  return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function (arg0) {
  const val = getObject(arg0);
  const ret = typeof val === "object" && val !== null;
  return ret;
};

module.exports.__wbg_versions_b23f2588cdb2ddbb = function (arg0) {
  const ret = getObject(arg0).versions;
  return addHeapObject(ret);
};

module.exports.__wbg_node_61b8c9a82499895d = function (arg0) {
  const ret = getObject(arg0).node;
  return addHeapObject(ret);
};

module.exports.__wbindgen_is_string = function (arg0) {
  const ret = typeof getObject(arg0) === "string";
  return ret;
};

module.exports.__wbg_require_2a93bc09fee45aca = function () {
  return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbg_crypto_2f56257a38275dbd = function (arg0) {
  const ret = getObject(arg0).crypto;
  return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_d07655bf62361f21 = function (arg0) {
  const ret = getObject(arg0).msCrypto;
  return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_fb6b088efb6bead2 = function () {
  return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
  }, arguments);
};

module.exports.__wbg_static_accessor_NODE_MODULE_33b45247c55045b0 =
  function () {
    const ret = module;
    return addHeapObject(ret);
  };

module.exports.__wbg_randomFillSync_654a7797990fb8db = function () {
  return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
  }, arguments);
};

module.exports.__wbg_newnoargs_e23b458e372830de = function (arg0, arg1) {
  const ret = new Function(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
};

module.exports.__wbg_call_ae78342adc33730a = function () {
  return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbg_self_99737b4dcdf6f0d8 = function () {
  return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbg_window_9b61fbbf3564c4fb = function () {
  return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbg_globalThis_8e275ef40caea3a3 = function () {
  return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbg_global_5de1e0f82bddcd27 = function () {
  return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
  }, arguments);
};

module.exports.__wbindgen_is_undefined = function (arg0) {
  const ret = getObject(arg0) === undefined;
  return ret;
};

module.exports.__wbg_buffer_7af23f65f6c64548 = function (arg0) {
  const ret = getObject(arg0).buffer;
  return addHeapObject(ret);
};

module.exports.__wbg_new_cc9018bd6f283b6f = function (arg0) {
  const ret = new Uint8Array(getObject(arg0));
  return addHeapObject(ret);
};

module.exports.__wbg_set_f25e869e4565d2a2 = function (arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_0acb1cf9bbaf8519 = function (arg0) {
  const ret = getObject(arg0).length;
  return ret;
};

module.exports.__wbg_newwithlength_8f0657faca9f1422 = function (arg0) {
  const ret = new Uint8Array(arg0 >>> 0);
  return addHeapObject(ret);
};

module.exports.__wbg_subarray_da527dbd24eafb6b = function (arg0, arg1, arg2) {
  const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
};

module.exports.__wbindgen_object_clone_ref = function (arg0) {
  const ret = getObject(arg0);
  return addHeapObject(ret);
};

module.exports.__wbindgen_throw = function (arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function () {
  const ret = wasm.memory;
  return addHeapObject(ret);
};

const path = require("path").join(__dirname, "opaque_wasm_bg.wasm");
const bytes = require("fs").readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;
