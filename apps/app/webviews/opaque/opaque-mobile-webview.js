/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ "../../node_modules/opaque-wasm/opaque_wasm_bg.js":
      /*!********************************************************!*\
  !*** ../../node_modules/opaque-wasm/opaque_wasm_bg.js ***!
  \********************************************************/
      /***/ (module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        eval(
          '__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "HandleLogin": () => (/* binding */ HandleLogin),\n/* harmony export */   "HandleRegistration": () => (/* binding */ HandleRegistration),\n/* harmony export */   "Login": () => (/* binding */ Login),\n/* harmony export */   "Registration": () => (/* binding */ Registration),\n/* harmony export */   "ServerSetup": () => (/* binding */ ServerSetup),\n/* harmony export */   "__wbg_buffer_5e74a88a1424a2e0": () => (/* binding */ __wbg_buffer_5e74a88a1424a2e0),\n/* harmony export */   "__wbg_call_89558c3e96703ca1": () => (/* binding */ __wbg_call_89558c3e96703ca1),\n/* harmony export */   "__wbg_crypto_9e3521ed42436d35": () => (/* binding */ __wbg_crypto_9e3521ed42436d35),\n/* harmony export */   "__wbg_getRandomValues_3e46aa268da0fed1": () => (/* binding */ __wbg_getRandomValues_3e46aa268da0fed1),\n/* harmony export */   "__wbg_globalThis_d61b1f48a57191ae": () => (/* binding */ __wbg_globalThis_d61b1f48a57191ae),\n/* harmony export */   "__wbg_global_e7669da72fd7f239": () => (/* binding */ __wbg_global_e7669da72fd7f239),\n/* harmony export */   "__wbg_length_30803400a8f15c59": () => (/* binding */ __wbg_length_30803400a8f15c59),\n/* harmony export */   "__wbg_modulerequire_0a83c0c31d12d2c7": () => (/* binding */ __wbg_modulerequire_0a83c0c31d12d2c7),\n/* harmony export */   "__wbg_msCrypto_c429c3f8f7a70bb5": () => (/* binding */ __wbg_msCrypto_c429c3f8f7a70bb5),\n/* harmony export */   "__wbg_new_e3b800e570795b3c": () => (/* binding */ __wbg_new_e3b800e570795b3c),\n/* harmony export */   "__wbg_newnoargs_f579424187aa1717": () => (/* binding */ __wbg_newnoargs_f579424187aa1717),\n/* harmony export */   "__wbg_newwithlength_5f4ce114a24dfe1e": () => (/* binding */ __wbg_newwithlength_5f4ce114a24dfe1e),\n/* harmony export */   "__wbg_node_ee3f6da4130bd35f": () => (/* binding */ __wbg_node_ee3f6da4130bd35f),\n/* harmony export */   "__wbg_process_f2b73829dbd321da": () => (/* binding */ __wbg_process_f2b73829dbd321da),\n/* harmony export */   "__wbg_randomFillSync_59fcc2add91fe7b3": () => (/* binding */ __wbg_randomFillSync_59fcc2add91fe7b3),\n/* harmony export */   "__wbg_self_e23d74ae45fb17d1": () => (/* binding */ __wbg_self_e23d74ae45fb17d1),\n/* harmony export */   "__wbg_set_5b8081e9d002f0df": () => (/* binding */ __wbg_set_5b8081e9d002f0df),\n/* harmony export */   "__wbg_subarray_a68f835ca2af506f": () => (/* binding */ __wbg_subarray_a68f835ca2af506f),\n/* harmony export */   "__wbg_versions_cd82f79c98672a9f": () => (/* binding */ __wbg_versions_cd82f79c98672a9f),\n/* harmony export */   "__wbg_window_b4be7f48b24ac56e": () => (/* binding */ __wbg_window_b4be7f48b24ac56e),\n/* harmony export */   "__wbindgen_is_object": () => (/* binding */ __wbindgen_is_object),\n/* harmony export */   "__wbindgen_is_string": () => (/* binding */ __wbindgen_is_string),\n/* harmony export */   "__wbindgen_is_undefined": () => (/* binding */ __wbindgen_is_undefined),\n/* harmony export */   "__wbindgen_memory": () => (/* binding */ __wbindgen_memory),\n/* harmony export */   "__wbindgen_object_clone_ref": () => (/* binding */ __wbindgen_object_clone_ref),\n/* harmony export */   "__wbindgen_object_drop_ref": () => (/* binding */ __wbindgen_object_drop_ref),\n/* harmony export */   "__wbindgen_string_new": () => (/* binding */ __wbindgen_string_new),\n/* harmony export */   "__wbindgen_throw": () => (/* binding */ __wbindgen_throw)\n/* harmony export */ });\n/* harmony import */ var _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./opaque_wasm_bg.wasm */ "../../node_modules/opaque-wasm/opaque_wasm_bg.wasm");\n/* module decorator */ module = __webpack_require__.hmd(module);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__]);\n_opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\nconst lTextDecoder = typeof TextDecoder === \'undefined\' ? (0, module.require)(\'util\').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder(\'utf-8\', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachegetUint8Memory0 = null;\nfunction getUint8Memory0() {\n    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetUint8Memory0 = new Uint8Array(_opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nconst heap = new Array(32).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nfunction dropObject(idx) {\n    if (idx < 36) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nfunction _assertClass(instance, klass) {\n    if (!(instance instanceof klass)) {\n        throw new Error(`expected instance of ${klass.name}`);\n    }\n    return instance.ptr;\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nfunction passArray8ToWasm0(arg, malloc) {\n    const ptr = malloc(arg.length * 1);\n    getUint8Memory0().set(arg, ptr / 1);\n    WASM_VECTOR_LEN = arg.length;\n    return ptr;\n}\n\nfunction isLikeNone(x) {\n    return x === undefined || x === null;\n}\n\nlet cachegetInt32Memory0 = null;\nfunction getInt32Memory0() {\n    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {\n        cachegetInt32Memory0 = new Int32Array(_opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);\n    }\n    return cachegetInt32Memory0;\n}\n\nfunction getArrayU8FromWasm0(ptr, len) {\n    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);\n}\n\nconst lTextEncoder = typeof TextEncoder === \'undefined\' ? (0, module.require)(\'util\').TextEncoder : TextEncoder;\n\nlet cachedTextEncoder = new lTextEncoder(\'utf-8\');\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === \'function\'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length);\n        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len);\n\n    const mem = getUint8Memory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3);\n        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n\n        offset += ret.written;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nfunction handleError(f, args) {\n    try {\n        return f.apply(this, args);\n    } catch (e) {\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_exn_store(addHeapObject(e));\n    }\n}\n/**\n*/\nclass HandleLogin {\n\n    static __wrap(ptr) {\n        const obj = Object.create(HandleLogin.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_handlelogin_free(ptr);\n    }\n    /**\n    * @param {ServerSetup} setup\n    */\n    constructor(setup) {\n        _assertClass(setup, ServerSetup);\n        var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handlelogin_new(setup.ptr);\n        return HandleLogin.__wrap(ret);\n    }\n    /**\n    * @param {Uint8Array | undefined} password_file\n    * @param {Uint8Array} identifier\n    * @param {Uint8Array} credential_request\n    * @returns {Uint8Array}\n    */\n    start(password_file, identifier, credential_request) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = isLikeNone(password_file) ? 0 : passArray8ToWasm0(password_file, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            var ptr1 = passArray8ToWasm0(identifier, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len1 = WASM_VECTOR_LEN;\n            var ptr2 = passArray8ToWasm0(credential_request, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len2 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handlelogin_start(retptr, this.ptr, ptr0, len0, ptr1, len1, ptr2, len2);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v3 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v3;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Uint8Array} credential_finish\n    * @returns {Uint8Array}\n    */\n    finish(credential_finish) {\n        try {\n            const ptr = this.__destroy_into_raw();\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(credential_finish, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handlelogin_finish(retptr, ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n/**\n*/\nclass HandleRegistration {\n\n    static __wrap(ptr) {\n        const obj = Object.create(HandleRegistration.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_handleregistration_free(ptr);\n    }\n    /**\n    * @param {ServerSetup} setup\n    */\n    constructor(setup) {\n        _assertClass(setup, ServerSetup);\n        var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handleregistration_new(setup.ptr);\n        return HandleRegistration.__wrap(ret);\n    }\n    /**\n    * @param {Uint8Array} identifier\n    * @param {Uint8Array} registration_request\n    * @returns {Uint8Array}\n    */\n    start(identifier, registration_request) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(identifier, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            var ptr1 = passArray8ToWasm0(registration_request, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len1 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handleregistration_start(retptr, this.ptr, ptr0, len0, ptr1, len1);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v2 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v2;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Uint8Array} registration_finish\n    * @returns {Uint8Array}\n    */\n    finish(registration_finish) {\n        try {\n            const ptr = this.__destroy_into_raw();\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(registration_finish, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.handleregistration_finish(retptr, ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n/**\n*/\nclass Login {\n\n    static __wrap(ptr) {\n        const obj = Object.create(Login.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_login_free(ptr);\n    }\n    /**\n    */\n    constructor() {\n        var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.login_new();\n        return Login.__wrap(ret);\n    }\n    /**\n    * @param {string} password\n    * @returns {Uint8Array}\n    */\n    start(password) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passStringToWasm0(password, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.login_start(retptr, this.ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Uint8Array} message\n    * @returns {Uint8Array}\n    */\n    finish(message) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(message, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.login_finish(retptr, this.ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @returns {Uint8Array}\n    */\n    getSessionKey() {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.login_getSessionKey(retptr, this.ptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v0 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v0;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @returns {Uint8Array}\n    */\n    getExportKey() {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.login_getExportKey(retptr, this.ptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v0 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v0;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n/**\n*/\nclass Registration {\n\n    static __wrap(ptr) {\n        const obj = Object.create(Registration.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_registration_free(ptr);\n    }\n    /**\n    */\n    constructor() {\n        var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.registration_new();\n        return Registration.__wrap(ret);\n    }\n    /**\n    * @param {string} password\n    * @returns {Uint8Array}\n    */\n    start(password) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passStringToWasm0(password, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.registration_start(retptr, this.ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Uint8Array} message\n    * @returns {Uint8Array}\n    */\n    finish(message) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(message, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.registration_finish(retptr, this.ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v1;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @returns {Uint8Array}\n    */\n    getExportKey() {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.registration_getExportKey(retptr, this.ptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v0 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v0;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n/**\n*/\nclass ServerSetup {\n\n    static __wrap(ptr) {\n        const obj = Object.create(ServerSetup.prototype);\n        obj.ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_serversetup_free(ptr);\n    }\n    /**\n    */\n    constructor() {\n        var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.serversetup_new();\n        return ServerSetup.__wrap(ret);\n    }\n    /**\n    * @returns {Uint8Array}\n    */\n    serialize() {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.serversetup_serialize(retptr, this.ptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var v0 = getArrayU8FromWasm0(r0, r1).slice();\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 1);\n            return v0;\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Uint8Array} input\n    * @returns {ServerSetup}\n    */\n    static deserialize(input) {\n        try {\n            const retptr = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);\n            var ptr0 = passArray8ToWasm0(input, _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);\n            var len0 = WASM_VECTOR_LEN;\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.serversetup_deserialize(retptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            if (r2) {\n                throw takeObject(r1);\n            }\n            return ServerSetup.__wrap(r0);\n        } finally {\n            _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n\nfunction __wbindgen_string_new(arg0, arg1) {\n    var ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_getRandomValues_3e46aa268da0fed1() { return handleError(function (arg0, arg1) {\n    getObject(arg0).getRandomValues(getObject(arg1));\n}, arguments) };\n\nfunction __wbg_randomFillSync_59fcc2add91fe7b3() { return handleError(function (arg0, arg1, arg2) {\n    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));\n}, arguments) };\n\nfunction __wbg_process_f2b73829dbd321da(arg0) {\n    var ret = getObject(arg0).process;\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_is_object(arg0) {\n    const val = getObject(arg0);\n    var ret = typeof(val) === \'object\' && val !== null;\n    return ret;\n};\n\nfunction __wbg_versions_cd82f79c98672a9f(arg0) {\n    var ret = getObject(arg0).versions;\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_object_drop_ref(arg0) {\n    takeObject(arg0);\n};\n\nfunction __wbg_node_ee3f6da4130bd35f(arg0) {\n    var ret = getObject(arg0).node;\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_is_string(arg0) {\n    var ret = typeof(getObject(arg0)) === \'string\';\n    return ret;\n};\n\nfunction __wbg_modulerequire_0a83c0c31d12d2c7() { return handleError(function (arg0, arg1) {\n    var ret = __webpack_require__("../../node_modules/opaque-wasm sync recursive")(getStringFromWasm0(arg0, arg1));\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_crypto_9e3521ed42436d35(arg0) {\n    var ret = getObject(arg0).crypto;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_msCrypto_c429c3f8f7a70bb5(arg0) {\n    var ret = getObject(arg0).msCrypto;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_newnoargs_f579424187aa1717(arg0, arg1) {\n    var ret = new Function(getStringFromWasm0(arg0, arg1));\n    return addHeapObject(ret);\n};\n\nfunction __wbg_call_89558c3e96703ca1() { return handleError(function (arg0, arg1) {\n    var ret = getObject(arg0).call(getObject(arg1));\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_self_e23d74ae45fb17d1() { return handleError(function () {\n    var ret = self.self;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_window_b4be7f48b24ac56e() { return handleError(function () {\n    var ret = window.window;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_globalThis_d61b1f48a57191ae() { return handleError(function () {\n    var ret = globalThis.globalThis;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_global_e7669da72fd7f239() { return handleError(function () {\n    var ret = __webpack_require__.g.global;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbindgen_is_undefined(arg0) {\n    var ret = getObject(arg0) === undefined;\n    return ret;\n};\n\nfunction __wbg_buffer_5e74a88a1424a2e0(arg0) {\n    var ret = getObject(arg0).buffer;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_new_e3b800e570795b3c(arg0) {\n    var ret = new Uint8Array(getObject(arg0));\n    return addHeapObject(ret);\n};\n\nfunction __wbg_set_5b8081e9d002f0df(arg0, arg1, arg2) {\n    getObject(arg0).set(getObject(arg1), arg2 >>> 0);\n};\n\nfunction __wbg_length_30803400a8f15c59(arg0) {\n    var ret = getObject(arg0).length;\n    return ret;\n};\n\nfunction __wbg_newwithlength_5f4ce114a24dfe1e(arg0) {\n    var ret = new Uint8Array(arg0 >>> 0);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_subarray_a68f835ca2af506f(arg0, arg1, arg2) {\n    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_object_clone_ref(arg0) {\n    var ret = getObject(arg0);\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_throw(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\nfunction __wbindgen_memory() {\n    var ret = _opaque_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory;\n    return addHeapObject(ret);\n};\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://@serenity-tools/opaque/../../node_modules/opaque-wasm/opaque_wasm_bg.js?'
        );

        /***/
      },

    /***/ "../../node_modules/opaque-wasm sync recursive":
      /*!********************************************!*\
  !*** ../../node_modules/opaque-wasm/ sync ***!
  \********************************************/
      /***/ (module) => {
        eval(
          'function webpackEmptyContext(req) {\n\tvar e = new Error("Cannot find module \'" + req + "\'");\n\te.code = \'MODULE_NOT_FOUND\';\n\tthrow e;\n}\nwebpackEmptyContext.keys = () => ([]);\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = "../../node_modules/opaque-wasm sync recursive";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://@serenity-tools/opaque/../../node_modules/opaque-wasm/_sync?'
        );

        /***/
      },

    /***/ "./opaque-mobile-webview-script.ts":
      /*!*****************************************!*\
  !*** ./opaque-mobile-webview-script.ts ***!
  \*****************************************/
      /***/ (module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        eval(
          '__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var opaque_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! opaque-wasm */ "../../node_modules/opaque-wasm/opaque_wasm_bg.js");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([opaque_wasm__WEBPACK_IMPORTED_MODULE_0__]);\nopaque_wasm__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\n\n\nvar toBase64 = function toBase64(data) {\n  return btoa(String.fromCharCode.apply(null, _toConsumableArray(data)));\n};\n\nvar fromBase64 = function fromBase64(value) {\n  return Uint8Array.from(atob(value), function (c) {\n    return c.charCodeAt(0);\n  });\n};\n\nvar registration = new opaque_wasm__WEBPACK_IMPORTED_MODULE_0__.Registration();\nvar login = new opaque_wasm__WEBPACK_IMPORTED_MODULE_0__.Login();\n\nwindow.registerInitialize = function (id, password) {\n  var message = registration.start(password);\n  window.ReactNativeWebView.postMessage(JSON.stringify({\n    id: id,\n    result: toBase64(message)\n  }));\n};\n\nwindow.finishRegistration = function (id, challengeResponse) {\n  var message = registration.finish(fromBase64(challengeResponse));\n  window.ReactNativeWebView.postMessage(JSON.stringify({\n    id: id,\n    result: {\n      exportKey: toBase64(registration.getExportKey()),\n      response: toBase64(message)\n    }\n  }));\n};\n\nwindow.startLogin = function (id, password) {\n  var message = login.start(password);\n  window.ReactNativeWebView.postMessage(JSON.stringify({\n    id: id,\n    result: toBase64(message)\n  }));\n};\n\nwindow.finishLogin = function (id, response) {\n  var message = login.finish(fromBase64(response));\n  window.ReactNativeWebView.postMessage(JSON.stringify({\n    id: id,\n    result: {\n      sessionKey: toBase64(login.getSessionKey()),\n      exportKey: toBase64(login.getExportKey()),\n      response: toBase64(message)\n    }\n  }));\n};\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://@serenity-tools/opaque/./opaque-mobile-webview-script.ts?'
        );

        /***/
      },

    /***/ "../../node_modules/opaque-wasm/opaque_wasm_bg.wasm":
      /*!**********************************************************!*\
  !*** ../../node_modules/opaque-wasm/opaque_wasm_bg.wasm ***!
  \**********************************************************/
      /***/ (module, exports, __webpack_require__) => {
        "use strict";
        eval(
          'var __webpack_instantiate__ = ([WEBPACK_IMPORTED_MODULE_0]) => {\n\treturn __webpack_require__.v(exports, module.id, "e69cbfcd7e884395768f", {\n\t\t"./opaque_wasm_bg.js": {\n\t\t\t"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,\n\t\t\t"__wbg_getRandomValues_3e46aa268da0fed1": WEBPACK_IMPORTED_MODULE_0.__wbg_getRandomValues_3e46aa268da0fed1,\n\t\t\t"__wbg_randomFillSync_59fcc2add91fe7b3": WEBPACK_IMPORTED_MODULE_0.__wbg_randomFillSync_59fcc2add91fe7b3,\n\t\t\t"__wbg_process_f2b73829dbd321da": WEBPACK_IMPORTED_MODULE_0.__wbg_process_f2b73829dbd321da,\n\t\t\t"__wbindgen_is_object": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_object,\n\t\t\t"__wbg_versions_cd82f79c98672a9f": WEBPACK_IMPORTED_MODULE_0.__wbg_versions_cd82f79c98672a9f,\n\t\t\t"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref,\n\t\t\t"__wbg_node_ee3f6da4130bd35f": WEBPACK_IMPORTED_MODULE_0.__wbg_node_ee3f6da4130bd35f,\n\t\t\t"__wbindgen_is_string": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_string,\n\t\t\t"__wbg_modulerequire_0a83c0c31d12d2c7": WEBPACK_IMPORTED_MODULE_0.__wbg_modulerequire_0a83c0c31d12d2c7,\n\t\t\t"__wbg_crypto_9e3521ed42436d35": WEBPACK_IMPORTED_MODULE_0.__wbg_crypto_9e3521ed42436d35,\n\t\t\t"__wbg_msCrypto_c429c3f8f7a70bb5": WEBPACK_IMPORTED_MODULE_0.__wbg_msCrypto_c429c3f8f7a70bb5,\n\t\t\t"__wbg_newnoargs_f579424187aa1717": WEBPACK_IMPORTED_MODULE_0.__wbg_newnoargs_f579424187aa1717,\n\t\t\t"__wbg_call_89558c3e96703ca1": WEBPACK_IMPORTED_MODULE_0.__wbg_call_89558c3e96703ca1,\n\t\t\t"__wbg_self_e23d74ae45fb17d1": WEBPACK_IMPORTED_MODULE_0.__wbg_self_e23d74ae45fb17d1,\n\t\t\t"__wbg_window_b4be7f48b24ac56e": WEBPACK_IMPORTED_MODULE_0.__wbg_window_b4be7f48b24ac56e,\n\t\t\t"__wbg_globalThis_d61b1f48a57191ae": WEBPACK_IMPORTED_MODULE_0.__wbg_globalThis_d61b1f48a57191ae,\n\t\t\t"__wbg_global_e7669da72fd7f239": WEBPACK_IMPORTED_MODULE_0.__wbg_global_e7669da72fd7f239,\n\t\t\t"__wbindgen_is_undefined": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_undefined,\n\t\t\t"__wbg_buffer_5e74a88a1424a2e0": WEBPACK_IMPORTED_MODULE_0.__wbg_buffer_5e74a88a1424a2e0,\n\t\t\t"__wbg_new_e3b800e570795b3c": WEBPACK_IMPORTED_MODULE_0.__wbg_new_e3b800e570795b3c,\n\t\t\t"__wbg_set_5b8081e9d002f0df": WEBPACK_IMPORTED_MODULE_0.__wbg_set_5b8081e9d002f0df,\n\t\t\t"__wbg_length_30803400a8f15c59": WEBPACK_IMPORTED_MODULE_0.__wbg_length_30803400a8f15c59,\n\t\t\t"__wbg_newwithlength_5f4ce114a24dfe1e": WEBPACK_IMPORTED_MODULE_0.__wbg_newwithlength_5f4ce114a24dfe1e,\n\t\t\t"__wbg_subarray_a68f835ca2af506f": WEBPACK_IMPORTED_MODULE_0.__wbg_subarray_a68f835ca2af506f,\n\t\t\t"__wbindgen_object_clone_ref": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_clone_ref,\n\t\t\t"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0.__wbindgen_throw,\n\t\t\t"__wbindgen_memory": WEBPACK_IMPORTED_MODULE_0.__wbindgen_memory\n\t\t}\n\t});\n}\n__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => {\n\ttry {\n\t/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./opaque_wasm_bg.js */ "../../node_modules/opaque-wasm/opaque_wasm_bg.js");\n\tvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([WEBPACK_IMPORTED_MODULE_0]);\n\tvar [WEBPACK_IMPORTED_MODULE_0] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__;\n\tawait __webpack_require__.v(exports, module.id, "e69cbfcd7e884395768f", {\n\t\t"./opaque_wasm_bg.js": {\n\t\t\t"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,\n\t\t\t"__wbg_getRandomValues_3e46aa268da0fed1": WEBPACK_IMPORTED_MODULE_0.__wbg_getRandomValues_3e46aa268da0fed1,\n\t\t\t"__wbg_randomFillSync_59fcc2add91fe7b3": WEBPACK_IMPORTED_MODULE_0.__wbg_randomFillSync_59fcc2add91fe7b3,\n\t\t\t"__wbg_process_f2b73829dbd321da": WEBPACK_IMPORTED_MODULE_0.__wbg_process_f2b73829dbd321da,\n\t\t\t"__wbindgen_is_object": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_object,\n\t\t\t"__wbg_versions_cd82f79c98672a9f": WEBPACK_IMPORTED_MODULE_0.__wbg_versions_cd82f79c98672a9f,\n\t\t\t"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref,\n\t\t\t"__wbg_node_ee3f6da4130bd35f": WEBPACK_IMPORTED_MODULE_0.__wbg_node_ee3f6da4130bd35f,\n\t\t\t"__wbindgen_is_string": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_string,\n\t\t\t"__wbg_modulerequire_0a83c0c31d12d2c7": WEBPACK_IMPORTED_MODULE_0.__wbg_modulerequire_0a83c0c31d12d2c7,\n\t\t\t"__wbg_crypto_9e3521ed42436d35": WEBPACK_IMPORTED_MODULE_0.__wbg_crypto_9e3521ed42436d35,\n\t\t\t"__wbg_msCrypto_c429c3f8f7a70bb5": WEBPACK_IMPORTED_MODULE_0.__wbg_msCrypto_c429c3f8f7a70bb5,\n\t\t\t"__wbg_newnoargs_f579424187aa1717": WEBPACK_IMPORTED_MODULE_0.__wbg_newnoargs_f579424187aa1717,\n\t\t\t"__wbg_call_89558c3e96703ca1": WEBPACK_IMPORTED_MODULE_0.__wbg_call_89558c3e96703ca1,\n\t\t\t"__wbg_self_e23d74ae45fb17d1": WEBPACK_IMPORTED_MODULE_0.__wbg_self_e23d74ae45fb17d1,\n\t\t\t"__wbg_window_b4be7f48b24ac56e": WEBPACK_IMPORTED_MODULE_0.__wbg_window_b4be7f48b24ac56e,\n\t\t\t"__wbg_globalThis_d61b1f48a57191ae": WEBPACK_IMPORTED_MODULE_0.__wbg_globalThis_d61b1f48a57191ae,\n\t\t\t"__wbg_global_e7669da72fd7f239": WEBPACK_IMPORTED_MODULE_0.__wbg_global_e7669da72fd7f239,\n\t\t\t"__wbindgen_is_undefined": WEBPACK_IMPORTED_MODULE_0.__wbindgen_is_undefined,\n\t\t\t"__wbg_buffer_5e74a88a1424a2e0": WEBPACK_IMPORTED_MODULE_0.__wbg_buffer_5e74a88a1424a2e0,\n\t\t\t"__wbg_new_e3b800e570795b3c": WEBPACK_IMPORTED_MODULE_0.__wbg_new_e3b800e570795b3c,\n\t\t\t"__wbg_set_5b8081e9d002f0df": WEBPACK_IMPORTED_MODULE_0.__wbg_set_5b8081e9d002f0df,\n\t\t\t"__wbg_length_30803400a8f15c59": WEBPACK_IMPORTED_MODULE_0.__wbg_length_30803400a8f15c59,\n\t\t\t"__wbg_newwithlength_5f4ce114a24dfe1e": WEBPACK_IMPORTED_MODULE_0.__wbg_newwithlength_5f4ce114a24dfe1e,\n\t\t\t"__wbg_subarray_a68f835ca2af506f": WEBPACK_IMPORTED_MODULE_0.__wbg_subarray_a68f835ca2af506f,\n\t\t\t"__wbindgen_object_clone_ref": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_clone_ref,\n\t\t\t"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0.__wbindgen_throw,\n\t\t\t"__wbindgen_memory": WEBPACK_IMPORTED_MODULE_0.__wbindgen_memory\n\t\t}\n\t});\n\t__webpack_async_result__();\n\t} catch(e) { __webpack_async_result__(e); }\n}, 1);\n\n//# sourceURL=webpack://@serenity-tools/opaque/../../node_modules/opaque-wasm/opaque_wasm_bg.wasm?'
        );

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ id: moduleId,
      /******/ loaded: false,
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Flag the module as loaded
    /******/ module.loaded = true;
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/async module */
  /******/ (() => {
    /******/ var webpackThen =
      typeof Symbol === "function"
        ? Symbol("webpack then")
        : "__webpack_then__";
    /******/ var webpackExports =
      typeof Symbol === "function"
        ? Symbol("webpack exports")
        : "__webpack_exports__";
    /******/ var webpackError =
      typeof Symbol === "function"
        ? Symbol("webpack error")
        : "__webpack_error__";
    /******/ var completeQueue = (queue) => {
      /******/ if (queue) {
        /******/ queue.forEach((fn) => fn.r--);
        /******/ queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
        /******/
      }
      /******/
    };
    /******/ var completeFunction = (fn) => !--fn.r && fn();
    /******/ var queueFunction = (queue, fn) =>
      queue ? queue.push(fn) : completeFunction(fn);
    /******/ var wrapDeps = (deps) =>
      deps.map((dep) => {
        /******/ if (dep !== null && typeof dep === "object") {
          /******/ if (dep[webpackThen]) return dep;
          /******/ if (dep.then) {
            /******/ var queue = [];
            /******/ dep.then(
              (r) => {
                /******/ obj[webpackExports] = r;
                /******/ completeQueue(queue);
                /******/ queue = 0;
                /******/
              },
              (e) => {
                /******/ obj[webpackError] = e;
                /******/ completeQueue(queue);
                /******/ queue = 0;
                /******/
              }
            );
            /******/ var obj = {};
            /******/ obj[webpackThen] = (fn, reject) => (
              queueFunction(queue, fn), dep["catch"](reject)
            );
            /******/ return obj;
            /******/
          }
          /******/
        }
        /******/ var ret = {};
        /******/ ret[webpackThen] = (fn) => completeFunction(fn);
        /******/ ret[webpackExports] = dep;
        /******/ return ret;
        /******/
      });
    /******/ __webpack_require__.a = (module, body, hasAwait) => {
      /******/ var queue = hasAwait && [];
      /******/ var exports = module.exports;
      /******/ var currentDeps;
      /******/ var outerResolve;
      /******/ var reject;
      /******/ var isEvaluating = true;
      /******/ var nested = false;
      /******/ var whenAll = (deps, onResolve, onReject) => {
        /******/ if (nested) return;
        /******/ nested = true;
        /******/ onResolve.r += deps.length;
        /******/ deps.map((dep, i) => dep[webpackThen](onResolve, onReject));
        /******/ nested = false;
        /******/
      };
      /******/ var promise = new Promise((resolve, rej) => {
        /******/ reject = rej;
        /******/ outerResolve = () => (
          resolve(exports), completeQueue(queue), (queue = 0)
        );
        /******/
      });
      /******/ promise[webpackExports] = exports;
      /******/ promise[webpackThen] = (fn, rejectFn) => {
        /******/ if (isEvaluating) {
          return completeFunction(fn);
        }
        /******/ if (currentDeps) whenAll(currentDeps, fn, rejectFn);
        /******/ queueFunction(queue, fn);
        /******/ promise["catch"](rejectFn);
        /******/
      };
      /******/ module.exports = promise;
      /******/ body(
        (deps) => {
          /******/ currentDeps = wrapDeps(deps);
          /******/ var fn;
          /******/ var getResult = () =>
            currentDeps.map((d) => {
              /******/ if (d[webpackError]) throw d[webpackError];
              /******/ return d[webpackExports];
              /******/
            });
          /******/ var promise = new Promise((resolve, reject) => {
            /******/ fn = () => resolve(getResult);
            /******/ fn.r = 0;
            /******/ whenAll(currentDeps, fn, reject);
            /******/
          });
          /******/ return fn.r ? promise : getResult();
          /******/
        },
        (err) => (err && reject((promise[webpackError] = err)), outerResolve())
      );
      /******/ isEvaluating = false;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/global */
  /******/ (() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === "object") return globalThis;
      /******/ try {
        /******/ return this || new Function("return this")();
        /******/
      } catch (e) {
        /******/ if (typeof window === "object") return window;
        /******/
      }
      /******/
    })();
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/harmony module decorator */
  /******/ (() => {
    /******/ __webpack_require__.hmd = (module) => {
      /******/ module = Object.create(module);
      /******/ if (!module.children) module.children = [];
      /******/ Object.defineProperty(module, "exports", {
        /******/ enumerable: true,
        /******/ set: () => {
          /******/ throw new Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              module.id
          );
          /******/
        },
        /******/
      });
      /******/ return module;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/wasm loading */
  /******/ (() => {
    /******/ __webpack_require__.v = (
      exports,
      wasmModuleId,
      wasmModuleHash,
      importsObj
    ) => {
      /******/ var req = fetch(
        __webpack_require__.p + "" + wasmModuleHash + ".module.wasm"
      );
      /******/ if (typeof WebAssembly.instantiateStreaming === "function") {
        /******/ return WebAssembly.instantiateStreaming(req, importsObj)
          /******/ .then((res) => Object.assign(exports, res.instance.exports));
        /******/
      }
      /******/ return req
        /******/ .then((x) => x.arrayBuffer())
        /******/ .then((bytes) => WebAssembly.instantiate(bytes, importsObj))
        /******/ .then((res) => Object.assign(exports, res.instance.exports));
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/publicPath */
  /******/ (() => {
    /******/ __webpack_require__.p = "";
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval devtool is used.
  /******/ var __webpack_exports__ = __webpack_require__(
    "./opaque-mobile-webview-script.ts"
  );
  /******/
  /******/
})();
