var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
 if (Module["ENVIRONMENT"] === "WEB") {
  ENVIRONMENT_IS_WEB = true;
 } else if (Module["ENVIRONMENT"] === "WORKER") {
  ENVIRONMENT_IS_WORKER = true;
 } else if (Module["ENVIRONMENT"] === "NODE") {
  ENVIRONMENT_IS_NODE = true;
 } else if (Module["ENVIRONMENT"] === "SHELL") {
  ENVIRONMENT_IS_SHELL = true;
 } else {
  throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
 }
} else {
 ENVIRONMENT_IS_WEB = typeof window === "object";
 ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
 ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
 ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = console.log;
 if (!Module["printErr"]) Module["printErr"] = console.warn;
 var nodeFS;
 var nodePath;
 Module["read"] = function shell_read(filename, binary) {
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  return binary ? ret : ret.toString();
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function shell_read() {
   throw "no read() available";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof quit === "function") {
  Module["quit"] = (function(status, toThrow) {
   quit(status);
  });
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function shell_read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (ENVIRONMENT_IS_WORKER) {
  Module["readBinary"] = function readBinary(url) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.responseType = "arraybuffer";
   xhr.send(null);
   return new Uint8Array(xhr.response);
  };
 }
 Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
   } else {
    onerror();
   }
  };
  xhr.onerror = onerror;
  xhr.send(null);
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function shell_print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function shell_printErr(x) {
   console.warn(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
if (!Module["quit"]) {
 Module["quit"] = (function(status, toThrow) {
  throw toThrow;
 });
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
moduleOverrides = undefined;
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
  return value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   assert(args.length == sig.length - 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
  } else {
   assert(sig.length == 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  if (!func) return;
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   if (sig.length === 1) {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func);
    };
   } else if (sig.length === 2) {
    sigCache[func] = function dynCall_wrapper(arg) {
     return Runtime.dynCall(sig, func, [ arg ]);
    };
   } else {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
    };
   }
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  assert((STACKTOP | 0) < (STACK_MAX | 0) | 0) | 0;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + (assert(!staticSealed), size) | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15 | 0) & -16;
  HEAP32[DYNAMICTOP_PTR >> 2] = end;
  if (end >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    HEAP32[DYNAMICTOP_PTR >> 2] = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = 0;
var EXITSTATUS = 0;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    var len = (str.length << 2) + 1;
    ret = Runtime.stackAlloc(len);
    stringToUTF8(str, ret, len);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if ((!opts || !opts.async) && typeof EmterpreterAsync === "object") {
   assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall");
  }
  if (opts && opts.async) assert(!returnType, "async ccalls cannot return values");
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = null;
 function ensureJSsource() {
  if (!JSsource) {
   JSsource = {};
   for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
     JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
   }
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   ensureJSsource();
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=(" + convertCode.returnValue + ");";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
  if (!numericArgs) {
   ensureJSsource();
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  assert(type, "Must know what type to store in allocate!");
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  assert(ptr + i < TOTAL_MEMORY);
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx) {
 var endPtr = idx;
 while (u8Array[endPtr]) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var u0, u1, u2, u3, u4, u5;
  var str = "";
  while (1) {
   u0 = u8Array[idx++];
   if (!u0) return str;
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u3 = u8Array[idx++] & 63;
    if ((u0 & 248) == 240) {
     u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
    } else {
     u4 = u8Array[idx++] & 63;
     if ((u0 & 252) == 248) {
      u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
     } else {
      u5 = u8Array[idx++] & 63;
      u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
     }
    }
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function demangle(func) {
 var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
 if (__cxa_demangle_func) {
  try {
   var s = func.substr(1);
   var len = lengthBytesUTF8(s) + 1;
   var buf = _malloc(len);
   stringToUTF8(s, buf, len);
   var status = _malloc(4);
   var ret = __cxa_demangle_func(buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
  return func;
 }
 Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 return func;
}
function demangleAll(text) {
 var regex = /__Z[\w\d_]+/g;
 return text.replace(regex, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}
Module["stackTrace"] = stackTrace;
var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function writeStackCookie() {
 assert((STACK_MAX & 3) == 0);
 HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
 HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
}
function checkStackCookie() {
 if (HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 || HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022) {
  abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16));
 }
 if (HEAP32[0] !== 1668509029) throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
}
function abortStackOverflow(allocSize) {
 abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - Module["asm"].stackSave() + allocSize) + " bytes available!");
}
function abortOnCannotGrowMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
 abortOnCannotGrowMemory();
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["buffer"]) {
 buffer = Module["buffer"];
 assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength);
} else {
 {
  buffer = new ArrayBuffer(TOTAL_MEMORY);
 }
 assert(buffer.byteLength === TOTAL_MEMORY);
}
updateGlobalBufferViews();
function getTotalMemory() {
 return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw "Runtime error: expected the system to be little-endian!";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 checkStackCookie();
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 checkStackCookie();
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 checkStackCookie();
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 checkStackCookie();
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
 var lastChar, end;
 if (dontAddNull) {
  end = buffer + lengthBytesUTF8(string);
  lastChar = HEAP8[end];
 }
 stringToUTF8(string, buffer, Infinity);
 if (dontAddNull) HEAP8[end] = lastChar;
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer);
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
if (!Math["trunc"]) Math["trunc"] = (function(x) {
 return x < 0 ? Math.ceil(x) : Math.floor(x);
});
Math.trunc = Math["trunc"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
   runDependencyWatcher = setInterval((function() {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      Module.printErr("still waiting on run dependencies:");
     }
     Module.printErr("dependency: " + dep);
    }
    if (shown) {
     Module.printErr("(end of list)");
    }
   }), 1e4);
  }
 } else {
  Module.printErr("warning: run dependency added without ID");
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  Module.printErr("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var ASM_CONSTS = [ (function($0, $1, $2, $3) {
 window.MbedJSHal.C12832.update_display($0, $1, $2, new Uint8Array(Module.HEAPU8.buffer, $3, 4096));
}), (function($0, $1, $2) {
 window.MbedJSHal.C12832.init($0, $1, $2);
}), (function($0, $1, $2) {
 window.MbedJSHal.sht31.init($0, $1, $2);
}), (function($0) {
 return window.MbedJSHal.sht31.read_temperature($0);
}), (function($0) {
 return window.MbedJSHal.sht31.read_humidity($0);
}), (function($0) {
 window.MbedJSHal.timers.timeout_detach($0);
}), (function() {
 window.MbedJSHal.die();
}), (function($0, $1) {
 MbedJSHal.gpio.init_out($0, $1, 0);
}), (function($0, $1) {
 MbedJSHal.gpio.write($0, $1);
}) ];
function _emscripten_asm_const_iiii(code, a0, a1, a2) {
 return ASM_CONSTS[code](a0, a1, a2);
}
function _emscripten_asm_const_iiiii(code, a0, a1, a2, a3) {
 return ASM_CONSTS[code](a0, a1, a2, a3);
}
function _emscripten_asm_const_ii(code, a0) {
 return ASM_CONSTS[code](a0);
}
function _emscripten_asm_const_iii(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}
function _emscripten_asm_const_i(code) {
 return ASM_CONSTS[code]();
}
STATIC_BASE = Runtime.GLOBAL_BASE;
STATICTOP = STATIC_BASE + 14816;
__ATINIT__.push({
 func: (function() {
  __GLOBAL__sub_I_arm_hal_timer_cpp();
 })
}, {
 func: (function() {
  __GLOBAL__sub_I_main_cpp();
 })
});
allocate([ 8, 7, 0, 0, 204, 7, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 46, 18, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 152, 18, 0, 0, 152, 0, 0, 0, 0, 0, 0, 0, 68, 7, 0, 0, 197, 19, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 224, 6, 0, 0, 213, 19, 0, 0, 68, 7, 0, 0, 92, 20, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 224, 6, 0, 0, 109, 20, 0, 0, 68, 7, 0, 0, 145, 20, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 144, 0, 0, 0, 0, 0, 0, 0, 224, 6, 0, 0, 165, 20, 0, 0, 68, 7, 0, 0, 204, 20, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 184, 0, 0, 0, 2, 0, 0, 0, 224, 0, 0, 0, 0, 0, 0, 0, 68, 7, 0, 0, 253, 20, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 120, 0, 0, 0, 2, 0, 0, 0, 88, 0, 0, 0, 2, 4, 0, 0, 232, 0, 0, 0, 0, 0, 0, 0, 224, 6, 0, 0, 219, 20, 0, 0, 224, 6, 0, 0, 14, 21, 0, 0, 224, 6, 0, 0, 162, 32, 0, 0, 8, 7, 0, 0, 2, 33, 0, 0, 8, 1, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 175, 32, 0, 0, 24, 1, 0, 0, 0, 0, 0, 0, 224, 6, 0, 0, 208, 32, 0, 0, 8, 7, 0, 0, 221, 32, 0, 0, 248, 0, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 37, 34, 0, 0, 240, 0, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 86, 34, 0, 0, 8, 1, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 50, 34, 0, 0, 64, 1, 0, 0, 0, 0, 0, 0, 8, 7, 0, 0, 120, 34, 0, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 18, 0, 0, 0, 19, 0, 0, 0, 20, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 23, 0, 0, 0, 24, 0, 0, 0, 25, 0, 0, 0, 26, 0, 0, 0, 27, 0, 0, 0, 28, 0, 0, 0, 29, 0, 0, 0, 30, 0, 0, 0, 31, 0, 0, 0, 32, 0, 0, 0, 33, 0, 0, 0, 34, 0, 0, 0, 35, 0, 0, 0, 36, 0, 0, 0, 37, 0, 0, 0, 38, 0, 0, 0, 252, 255, 255, 255, 8, 0, 0, 0, 39, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 1, 0, 0, 0, 41, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 42, 0, 0, 0, 19, 0, 0, 0, 43, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 44, 0, 0, 0, 45, 0, 0, 0, 46, 0, 0, 0, 26, 0, 0, 0, 47, 0, 0, 0, 48, 0, 0, 0, 29, 0, 0, 0, 30, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 34, 0, 0, 0, 35, 0, 0, 0, 36, 0, 0, 0, 37, 0, 0, 0, 38, 0, 0, 0, 252, 255, 255, 255, 24, 0, 0, 0, 49, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 1, 0, 0, 0, 51, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 42, 0, 0, 0, 19, 0, 0, 0, 43, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 26, 0, 0, 0, 52, 0, 0, 0, 48, 0, 0, 0, 29, 0, 0, 0, 30, 0, 0, 0, 252, 255, 255, 255, 40, 0, 0, 0, 53, 0, 0, 0, 54, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 55, 0, 0, 0, 56, 0, 0, 0, 57, 0, 0, 0, 124, 3, 0, 0, 232, 34, 0, 0, 58, 0, 0, 0, 59, 0, 0, 0, 60, 0, 0, 0, 61, 0, 0, 0, 62, 0, 0, 0, 63, 0, 0, 0, 0, 0, 0, 0, 88, 0, 0, 0, 64, 0, 0, 0, 65, 0, 0, 0, 0, 0, 0, 0, 120, 0, 0, 0, 66, 0, 0, 0, 67, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 68, 0, 0, 0, 69, 0, 0, 0, 70, 0, 0, 0, 71, 0, 0, 0, 72, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 152, 0, 0, 0, 1, 0, 0, 0, 73, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 252, 255, 255, 255, 152, 0, 0, 0, 74, 0, 0, 0, 75, 0, 0, 0, 100, 4, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 0, 0, 0, 78, 0, 0, 0, 206, 53, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 148, 53, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 216, 5, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 0, 0, 0, 78, 0, 0, 0, 214, 53, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 216, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 81, 0, 0, 0, 0, 0, 0, 0, 248, 0, 0, 0, 82, 0, 0, 0, 83, 0, 0, 0, 84, 0, 0, 0, 85, 0, 0, 0, 86, 0, 0, 0, 87, 0, 0, 0, 88, 0, 0, 0, 89, 0, 0, 0, 0, 0, 0, 0, 32, 1, 0, 0, 82, 0, 0, 0, 90, 0, 0, 0, 84, 0, 0, 0, 85, 0, 0, 0, 86, 0, 0, 0, 91, 0, 0, 0, 92, 0, 0, 0, 93, 0, 0, 0, 0, 0, 0, 0, 48, 1, 0, 0, 94, 0, 0, 0, 95, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 96, 1, 0, 0, 82, 0, 0, 0, 97, 0, 0, 0, 84, 0, 0, 0, 85, 0, 0, 0, 86, 0, 0, 0, 98, 0, 0, 0, 99, 0, 0, 0, 100, 0, 0, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 67, 49, 50, 56, 51, 50, 46, 117, 112, 100, 97, 116, 101, 95, 100, 105, 115, 112, 108, 97, 121, 40, 36, 48, 44, 32, 36, 49, 44, 32, 36, 50, 44, 32, 110, 101, 119, 32, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 40, 77, 111, 100, 117, 108, 101, 46, 72, 69, 65, 80, 85, 56, 46, 98, 117, 102, 102, 101, 114, 44, 32, 36, 51, 44, 32, 52, 48, 57, 54, 41, 41, 59, 32, 125, 0, 54, 67, 49, 50, 56, 51, 50, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 67, 49, 50, 56, 51, 50, 46, 105, 110, 105, 116, 40, 36, 48, 44, 32, 36, 49, 44, 32, 36, 50, 41, 59, 32, 125, 0, 19, 9, 9, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 158, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 80, 0, 248, 0, 80, 0, 248, 0, 80, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 140, 0, 146, 0, 254, 1, 162, 0, 64, 0, 0, 0, 0, 0, 0, 0, 7, 30, 0, 146, 0, 94, 0, 32, 0, 248, 0, 148, 0, 242, 0, 0, 0, 0, 0, 7, 0, 0, 100, 0, 154, 0, 170, 0, 204, 0, 96, 0, 128, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 124, 0, 131, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 131, 1, 124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 48, 0, 120, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 16, 0, 16, 0, 124, 0, 16, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 16, 0, 16, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 1, 224, 0, 28, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 124, 0, 130, 0, 130, 0, 124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 8, 0, 4, 0, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 132, 0, 194, 0, 162, 0, 156, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 130, 0, 146, 0, 146, 0, 108, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 56, 0, 44, 0, 34, 0, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 158, 0, 146, 0, 146, 0, 98, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 124, 0, 146, 0, 146, 0, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 2, 0, 194, 0, 50, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 108, 0, 146, 0, 146, 0, 108, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 156, 0, 146, 0, 146, 0, 124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 16, 0, 16, 0, 40, 0, 40, 0, 68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 40, 0, 40, 0, 40, 0, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 68, 0, 40, 0, 40, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 2, 0, 178, 0, 18, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 248, 0, 132, 1, 114, 1, 74, 1, 74, 1, 122, 1, 66, 0, 60, 0, 6, 0, 0, 248, 0, 36, 0, 34, 0, 36, 0, 248, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 254, 0, 146, 0, 146, 0, 146, 0, 108, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 124, 0, 130, 0, 130, 0, 130, 0, 68, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 254, 0, 130, 0, 130, 0, 198, 0, 124, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 146, 0, 146, 0, 146, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 18, 0, 18, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 124, 0, 198, 0, 130, 0, 146, 0, 246, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 254, 0, 16, 0, 16, 0, 16, 0, 254, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 128, 0, 128, 0, 126, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 16, 0, 44, 0, 194, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 128, 0, 128, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 254, 0, 6, 0, 24, 0, 224, 0, 24, 0, 6, 0, 254, 0, 0, 0, 6, 0, 0, 254, 0, 6, 0, 24, 0, 96, 0, 254, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 124, 0, 130, 0, 130, 0, 130, 0, 124, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 18, 0, 18, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 124, 0, 130, 0, 130, 0, 194, 0, 252, 0, 0, 1, 0, 0, 0, 0, 5, 0, 0, 254, 0, 18, 0, 18, 0, 236, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 204, 0, 146, 0, 146, 0, 102, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 2, 0, 2, 0, 254, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 126, 0, 128, 0, 128, 0, 128, 0, 126, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 6, 0, 60, 0, 224, 0, 224, 0, 28, 0, 6, 0, 0, 0, 0, 0, 6, 0, 0, 30, 0, 224, 0, 62, 0, 224, 0, 30, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 130, 0, 100, 0, 56, 0, 108, 0, 130, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 2, 0, 12, 0, 240, 0, 12, 0, 2, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 130, 0, 226, 0, 146, 0, 142, 0, 130, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 255, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 14, 0, 112, 0, 128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 255, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 24, 0, 12, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 232, 0, 168, 0, 168, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 136, 0, 136, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 112, 0, 136, 0, 136, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 112, 0, 136, 0, 136, 0, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 112, 0, 168, 0, 168, 0, 176, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 0, 254, 0, 10, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 48, 0, 72, 1, 72, 1, 248, 1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 8, 0, 8, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 250, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 254, 0, 32, 0, 80, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 254, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 248, 0, 8, 0, 248, 0, 8, 0, 248, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 248, 0, 8, 0, 8, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 112, 0, 136, 0, 136, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 248, 1, 72, 0, 72, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 48, 0, 72, 0, 72, 0, 248, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 248, 0, 8, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 152, 0, 168, 0, 232, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 8, 0, 252, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 120, 0, 128, 0, 128, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 56, 0, 192, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 120, 0, 192, 0, 56, 0, 192, 0, 120, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 136, 0, 112, 0, 112, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 56, 0, 64, 1, 64, 1, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 200, 0, 232, 0, 184, 0, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 16, 0, 56, 0, 239, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 255, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 1, 199, 1, 56, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 12, 0, 4, 0, 12, 0, 8, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 254, 1, 2, 1, 254, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 120, 120, 48, 48, 0, 48, 0, 108, 108, 108, 0, 0, 0, 0, 0, 108, 108, 254, 108, 254, 108, 108, 0, 24, 62, 96, 60, 6, 124, 24, 0, 0, 99, 102, 12, 24, 51, 99, 0, 28, 54, 28, 59, 110, 102, 59, 0, 48, 48, 96, 0, 0, 0, 0, 0, 12, 24, 48, 48, 48, 24, 12, 0, 48, 24, 12, 12, 12, 24, 48, 0, 0, 102, 60, 255, 60, 102, 0, 0, 0, 48, 48, 252, 48, 48, 0, 0, 0, 0, 0, 0, 0, 24, 24, 48, 0, 0, 0, 126, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 0, 3, 6, 12, 24, 48, 96, 64, 0, 62, 99, 99, 107, 99, 99, 62, 0, 24, 56, 88, 24, 24, 24, 126, 0, 60, 102, 6, 28, 48, 102, 126, 0, 60, 102, 6, 28, 6, 102, 60, 0, 14, 30, 54, 102, 127, 6, 15, 0, 126, 96, 124, 6, 6, 102, 60, 0, 28, 48, 96, 124, 102, 102, 60, 0, 126, 102, 6, 12, 24, 24, 24, 0, 60, 102, 102, 60, 102, 102, 60, 0, 60, 102, 102, 62, 6, 12, 56, 0, 0, 24, 24, 0, 0, 24, 24, 0, 0, 24, 24, 0, 0, 24, 24, 48, 12, 24, 48, 96, 48, 24, 12, 0, 0, 0, 126, 0, 0, 126, 0, 0, 48, 24, 12, 6, 12, 24, 48, 0, 60, 102, 6, 12, 24, 0, 24, 0, 62, 99, 111, 105, 111, 96, 62, 0, 24, 60, 102, 102, 126, 102, 102, 0, 126, 51, 51, 62, 51, 51, 126, 0, 30, 51, 96, 96, 96, 51, 30, 0, 124, 54, 51, 51, 51, 54, 124, 0, 127, 49, 52, 60, 52, 49, 127, 0, 127, 49, 52, 60, 52, 48, 120, 0, 30, 51, 96, 96, 103, 51, 31, 0, 102, 102, 102, 126, 102, 102, 102, 0, 60, 24, 24, 24, 24, 24, 60, 0, 15, 6, 6, 6, 102, 102, 60, 0, 115, 51, 54, 60, 54, 51, 115, 0, 120, 48, 48, 48, 49, 51, 127, 0, 99, 119, 127, 127, 107, 99, 99, 0, 99, 115, 123, 111, 103, 99, 99, 0, 62, 99, 99, 99, 99, 99, 62, 0, 126, 51, 51, 62, 48, 48, 120, 0, 60, 102, 102, 102, 110, 60, 14, 0, 126, 51, 51, 62, 54, 51, 115, 0, 60, 102, 48, 24, 12, 102, 60, 0, 126, 90, 24, 24, 24, 24, 60, 0, 102, 102, 102, 102, 102, 102, 126, 0, 102, 102, 102, 102, 102, 60, 24, 0, 99, 99, 99, 107, 127, 119, 99, 0, 99, 99, 54, 28, 28, 54, 99, 0, 102, 102, 102, 60, 24, 24, 60, 0, 127, 99, 70, 12, 25, 51, 127, 0, 60, 48, 48, 48, 48, 48, 60, 0, 96, 48, 24, 12, 6, 3, 1, 0, 60, 12, 12, 12, 12, 12, 60, 0, 8, 28, 54, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 24, 24, 12, 0, 0, 0, 0, 0, 0, 0, 60, 6, 62, 102, 59, 0, 112, 48, 62, 51, 51, 51, 110, 0, 0, 0, 60, 102, 96, 102, 60, 0, 14, 6, 62, 102, 102, 102, 59, 0, 0, 0, 60, 102, 126, 96, 60, 0, 28, 54, 48, 120, 48, 48, 120, 0, 0, 0, 59, 102, 102, 62, 6, 124, 112, 48, 54, 59, 51, 51, 115, 0, 24, 0, 56, 24, 24, 24, 60, 0, 6, 0, 6, 6, 6, 102, 102, 60, 112, 48, 51, 54, 60, 54, 115, 0, 56, 24, 24, 24, 24, 24, 60, 0, 0, 0, 102, 127, 127, 107, 99, 0, 0, 0, 124, 102, 102, 102, 102, 0, 0, 0, 60, 102, 102, 102, 60, 0, 0, 0, 110, 51, 51, 62, 48, 120, 0, 0, 59, 102, 102, 62, 6, 15, 0, 0, 110, 59, 51, 48, 120, 0, 0, 0, 62, 96, 60, 6, 124, 0, 8, 24, 62, 24, 24, 26, 12, 0, 0, 0, 102, 102, 102, 102, 59, 0, 0, 0, 102, 102, 102, 60, 24, 0, 0, 0, 99, 107, 127, 127, 54, 0, 0, 0, 99, 54, 28, 54, 99, 0, 0, 0, 102, 102, 102, 62, 6, 124, 0, 0, 126, 76, 24, 50, 126, 0, 14, 24, 24, 112, 24, 24, 14, 0, 12, 12, 12, 0, 12, 12, 12, 0, 112, 24, 24, 14, 24, 24, 112, 0, 59, 110, 0, 0, 0, 0, 0, 0, 28, 54, 54, 28, 0, 0, 0, 0, 49, 53, 71, 114, 97, 112, 104, 105, 99, 115, 68, 105, 115, 112, 108, 97, 121, 0, 99, 108, 97, 105, 109, 32, 114, 101, 113, 117, 105, 114, 101, 115, 32, 97, 32, 110, 97, 109, 101, 32, 116, 111, 32, 98, 101, 32, 103, 105, 118, 101, 110, 32, 105, 110, 32, 116, 104, 101, 32, 105, 110, 115, 116, 97, 110, 116, 105, 111, 97, 116, 111, 114, 32, 111, 102, 32, 116, 104, 101, 32, 84, 101, 120, 116, 68, 105, 115, 112, 108, 97, 121, 32, 105, 110, 115, 116, 97, 110, 99, 101, 33, 13, 10, 0, 119, 0, 49, 49, 84, 101, 120, 116, 68, 105, 115, 112, 108, 97, 121, 0, 47, 37, 115, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 115, 104, 116, 51, 49, 46, 105, 110, 105, 116, 40, 36, 48, 44, 32, 36, 49, 44, 32, 36, 50, 41, 59, 32, 125, 0, 123, 32, 114, 101, 116, 117, 114, 110, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 115, 104, 116, 51, 49, 46, 114, 101, 97, 100, 95, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 40, 36, 48, 41, 59, 32, 125, 0, 123, 32, 114, 101, 116, 117, 114, 110, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 115, 104, 116, 51, 49, 46, 114, 101, 97, 100, 95, 104, 117, 109, 105, 100, 105, 116, 121, 40, 36, 48, 41, 59, 32, 125, 0, 95, 111, 112, 115, 0, 47, 85, 115, 101, 114, 115, 47, 106, 97, 110, 106, 111, 110, 48, 49, 47, 114, 101, 112, 111, 115, 47, 109, 98, 101, 100, 45, 115, 105, 109, 117, 108, 97, 116, 111, 114, 47, 109, 98, 101, 100, 45, 115, 105, 109, 117, 108, 97, 116, 111, 114, 45, 104, 97, 108, 47, 112, 108, 97, 116, 102, 111, 114, 109, 47, 67, 97, 108, 108, 98, 97, 99, 107, 46, 104, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 116, 105, 109, 101, 114, 115, 46, 116, 105, 109, 101, 111, 117, 116, 95, 100, 101, 116, 97, 99, 104, 40, 36, 48, 41, 59, 32, 125, 0, 78, 52, 109, 98, 101, 100, 55, 84, 105, 109, 101, 111, 117, 116, 69, 0, 78, 52, 109, 98, 101, 100, 49, 49, 78, 111, 110, 67, 111, 112, 121, 97, 98, 108, 101, 73, 78, 83, 95, 55, 84, 105, 109, 101, 111, 117, 116, 69, 69, 69, 0, 95, 112, 116, 114, 32, 61, 61, 32, 40, 84, 32, 42, 41, 38, 95, 100, 97, 116, 97, 0, 47, 85, 115, 101, 114, 115, 47, 106, 97, 110, 106, 111, 110, 48, 49, 47, 114, 101, 112, 111, 115, 47, 109, 98, 101, 100, 45, 115, 105, 109, 117, 108, 97, 116, 111, 114, 47, 109, 98, 101, 100, 45, 115, 105, 109, 117, 108, 97, 116, 111, 114, 45, 104, 97, 108, 47, 112, 108, 97, 116, 102, 111, 114, 109, 47, 83, 105, 110, 103, 108, 101, 116, 111, 110, 80, 116, 114, 46, 104, 0, 78, 52, 109, 98, 101, 100, 56, 70, 105, 108, 101, 66, 97, 115, 101, 69, 0, 78, 52, 109, 98, 101, 100, 49, 49, 78, 111, 110, 67, 111, 112, 121, 97, 98, 108, 101, 73, 78, 83, 95, 56, 70, 105, 108, 101, 66, 97, 115, 101, 69, 69, 69, 0, 78, 52, 109, 98, 101, 100, 49, 48, 70, 105, 108, 101, 72, 97, 110, 100, 108, 101, 69, 0, 78, 52, 109, 98, 101, 100, 49, 49, 78, 111, 110, 67, 111, 112, 121, 97, 98, 108, 101, 73, 78, 83, 95, 49, 48, 70, 105, 108, 101, 72, 97, 110, 100, 108, 101, 69, 69, 69, 0, 78, 52, 109, 98, 101, 100, 54, 83, 116, 114, 101, 97, 109, 69, 0, 78, 52, 109, 98, 101, 100, 49, 49, 78, 111, 110, 67, 111, 112, 121, 97, 98, 108, 101, 73, 78, 83, 95, 54, 83, 116, 114, 101, 97, 109, 69, 69, 69, 0, 78, 52, 109, 98, 101, 100, 56, 70, 105, 108, 101, 76, 105, 107, 101, 69, 0, 78, 52, 109, 98, 101, 100, 49, 49, 78, 111, 110, 67, 111, 112, 121, 97, 98, 108, 101, 73, 78, 83, 95, 56, 70, 105, 108, 101, 76, 105, 107, 101, 69, 69, 69, 0, 119, 43, 0, 83, 116, 114, 101, 97, 109, 32, 111, 98, 106, 32, 102, 97, 105, 108, 117, 114, 101, 44, 32, 101, 114, 114, 110, 111, 61, 37, 100, 13, 10, 0, 109, 98, 101, 100, 32, 97, 115, 115, 101, 114, 116, 97, 116, 105, 111, 110, 32, 102, 97, 105, 108, 101, 100, 58, 32, 37, 115, 44, 32, 102, 105, 108, 101, 58, 32, 37, 115, 44, 32, 108, 105, 110, 101, 32, 37, 100, 32, 10, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 100, 105, 101, 40, 41, 59, 32, 125, 0, 109, 98, 101, 100, 95, 100, 105, 101, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 109, 98, 101, 100, 95, 101, 114, 114, 111, 114, 95, 118, 102, 112, 114, 105, 110, 116, 102, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 123, 32, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 103, 112, 105, 111, 46, 105, 110, 105, 116, 95, 111, 117, 116, 40, 36, 48, 44, 32, 36, 49, 44, 32, 48, 41, 59, 32, 125, 0, 76, 67, 68, 0, 83, 101, 116, 32, 116, 104, 101, 32, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 32, 97, 98, 111, 118, 101, 32, 50, 53, 32, 100, 101, 103, 114, 101, 101, 115, 32, 116, 111, 32, 116, 114, 105, 103, 103, 101, 114, 32, 116, 104, 101, 32, 119, 97, 114, 110, 105, 110, 103, 32, 76, 69, 68, 10, 0, 84, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 58, 32, 37, 46, 50, 102, 32, 67, 0, 72, 117, 109, 105, 100, 105, 116, 121, 58, 32, 37, 46, 50, 102, 32, 37, 37, 0, 123, 32, 77, 98, 101, 100, 74, 83, 72, 97, 108, 46, 103, 112, 105, 111, 46, 119, 114, 105, 116, 101, 40, 36, 48, 44, 32, 36, 49, 41, 59, 32, 125, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0, 114, 119, 97, 0, 116, 101, 114, 109, 105, 110, 97, 116, 105, 110, 103, 32, 119, 105, 116, 104, 32, 37, 115, 32, 101, 120, 99, 101, 112, 116, 105, 111, 110, 32, 111, 102, 32, 116, 121, 112, 101, 32, 37, 115, 58, 32, 37, 115, 0, 116, 101, 114, 109, 105, 110, 97, 116, 105, 110, 103, 32, 119, 105, 116, 104, 32, 37, 115, 32, 101, 120, 99, 101, 112, 116, 105, 111, 110, 32, 111, 102, 32, 116, 121, 112, 101, 32, 37, 115, 0, 116, 101, 114, 109, 105, 110, 97, 116, 105, 110, 103, 32, 119, 105, 116, 104, 32, 37, 115, 32, 102, 111, 114, 101, 105, 103, 110, 32, 101, 120, 99, 101, 112, 116, 105, 111, 110, 0, 116, 101, 114, 109, 105, 110, 97, 116, 105, 110, 103, 0, 117, 110, 99, 97, 117, 103, 104, 116, 0, 83, 116, 57, 101, 120, 99, 101, 112, 116, 105, 111, 110, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 54, 95, 95, 115, 104, 105, 109, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 83, 116, 57, 116, 121, 112, 101, 95, 105, 110, 102, 111, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 48, 95, 95, 115, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 55, 95, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 112, 116, 104, 114, 101, 97, 100, 95, 111, 110, 99, 101, 32, 102, 97, 105, 108, 117, 114, 101, 32, 105, 110, 32, 95, 95, 99, 120, 97, 95, 103, 101, 116, 95, 103, 108, 111, 98, 97, 108, 115, 95, 102, 97, 115, 116, 40, 41, 0, 99, 97, 110, 110, 111, 116, 32, 99, 114, 101, 97, 116, 101, 32, 112, 116, 104, 114, 101, 97, 100, 32, 107, 101, 121, 32, 102, 111, 114, 32, 95, 95, 99, 120, 97, 95, 103, 101, 116, 95, 103, 108, 111, 98, 97, 108, 115, 40, 41, 0, 99, 97, 110, 110, 111, 116, 32, 122, 101, 114, 111, 32, 111, 117, 116, 32, 116, 104, 114, 101, 97, 100, 32, 118, 97, 108, 117, 101, 32, 102, 111, 114, 32, 95, 95, 99, 120, 97, 95, 103, 101, 116, 95, 103, 108, 111, 98, 97, 108, 115, 40, 41, 0, 116, 101, 114, 109, 105, 110, 97, 116, 101, 95, 104, 97, 110, 100, 108, 101, 114, 32, 117, 110, 101, 120, 112, 101, 99, 116, 101, 100, 108, 121, 32, 114, 101, 116, 117, 114, 110, 101, 100, 0, 116, 101, 114, 109, 105, 110, 97, 116, 101, 95, 104, 97, 110, 100, 108, 101, 114, 32, 117, 110, 101, 120, 112, 101, 99, 116, 101, 100, 108, 121, 32, 116, 104, 114, 101, 119, 32, 97, 110, 32, 101, 120, 99, 101, 112, 116, 105, 111, 110, 0, 115, 116, 100, 58, 58, 98, 97, 100, 95, 97, 108, 108, 111, 99, 0, 83, 116, 57, 98, 97, 100, 95, 97, 108, 108, 111, 99, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 57, 95, 95, 112, 111, 105, 110, 116, 101, 114, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 55, 95, 95, 112, 98, 97, 115, 101, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 49, 95, 95, 118, 109, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
var EMTSTACKTOP = getMemory(1048576);
var EMT_STACK_MAX = EMTSTACKTOP + 1048576;
var eb = getMemory(55736);
assert(eb % 8 === 0);
__ATPRERUN__.push((function() {
 HEAPU8.set([ 140, 6, 89, 1, 0, 0, 0, 0, 2, 200, 0, 0, 12, 2, 0, 0, 2, 201, 0, 0, 0, 202, 154, 59, 2, 202, 0, 0, 167, 24, 0, 0, 1, 203, 0, 0, 143, 203, 87, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 88, 1, 136, 203, 0, 0, 1, 204, 48, 2, 3, 203, 203, 204, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 96, 0, 0, 0, 1, 204, 48, 2, 135, 203, 0, 0, 204, 0, 0, 0, 141, 204, 88, 1, 3, 203, 204, 200, 143, 203, 83, 1, 141, 203, 88, 1, 1, 204, 0, 0, 85, 203, 204, 0, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 116, 204, 12, 134, 204, 0, 0, 140, 204, 0, 0, 1, 0, 0, 0, 128, 204, 0, 0, 0, 122, 204, 0, 34, 204, 122, 0, 121, 204, 5, 0, 68, 20, 1, 0, 1, 33, 1, 0, 1, 34, 116, 24, 119, 0, 20, 0, 38, 204, 4, 1, 32, 204, 204, 0, 1, 203, 117, 24, 1, 205, 122, 24, 125, 6, 204, 203, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 4, 205, 32, 205, 205, 0, 1, 203, 119, 24, 125, 7, 205, 6, 203, 0, 0, 0, 58, 20, 1, 0, 1, 203, 1, 8, 19, 203, 4, 203, 33, 203, 203, 0, 38, 203, 203, 1, 0, 33, 203, 0, 0, 34, 7, 0, 134, 203, 0, 0, 140, 204, 0, 0, 20, 0, 0, 0, 128, 203, 0, 0, 0, 168, 203, 0, 2, 203, 0, 0, 0, 0, 240, 127, 19, 203, 168, 203, 2, 205, 0, 0, 0, 0, 240, 127, 16, 203, 203, 205, 2, 205, 0, 0, 0, 0, 240, 127, 19, 205, 168, 205, 2, 204, 0, 0, 0, 0, 240, 127, 13, 205, 205, 204, 1, 204, 0, 0, 34, 204, 204, 0, 19, 205, 205, 204, 20, 203, 203, 205, 121, 203, 83, 5, 141, 205, 88, 1, 134, 203, 0, 0, 192, 210, 0, 0, 20, 205, 0, 0, 144, 203, 41, 1, 142, 203, 41, 1, 59, 205, 2, 0, 65, 203, 203, 205, 59, 205, 0, 0, 70, 203, 203, 205, 121, 203, 8, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 65, 1, 141, 203, 88, 1, 141, 205, 65, 1, 26, 205, 205, 1, 85, 203, 205, 0, 39, 205, 5, 32, 32, 205, 205, 97, 121, 205, 0, 1, 25, 205, 34, 9, 143, 205, 69, 1, 38, 205, 5, 32, 32, 205, 205, 0, 141, 203, 69, 1, 125, 35, 205, 34, 203, 0, 0, 0, 39, 205, 33, 2, 0, 203, 205, 0, 143, 203, 70, 1, 1, 203, 11, 0, 16, 203, 203, 3, 1, 205, 12, 0, 4, 205, 205, 3, 32, 205, 205, 0, 20, 203, 203, 205, 121, 203, 5, 0, 142, 203, 41, 1, 59, 205, 2, 0, 65, 43, 203, 205, 119, 0, 42, 0, 59, 29, 8, 0, 1, 205, 12, 0, 4, 50, 205, 3, 26, 205, 50, 1, 143, 205, 71, 1, 59, 203, 16, 0, 65, 205, 29, 203, 144, 205, 72, 1, 141, 205, 71, 1, 32, 205, 205, 0, 120, 205, 6, 0, 142, 205, 72, 1, 58, 29, 205, 0, 141, 205, 71, 1, 0, 50, 205, 0, 119, 0, 244, 255, 78, 205, 35, 0, 143, 205, 73, 1, 141, 205, 73, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 45, 121, 205, 11, 0, 142, 205, 72, 1, 142, 203, 41, 1, 59, 204, 2, 0, 65, 203, 203, 204, 68, 203, 203, 0, 142, 204, 72, 1, 64, 203, 203, 204, 63, 205, 205, 203, 68, 43, 205, 0, 119, 0, 9, 0, 142, 205, 41, 1, 59, 203, 2, 0, 65, 205, 205, 203, 142, 203, 72, 1, 63, 205, 205, 203, 142, 203, 72, 1, 64, 43, 205, 203, 119, 0, 1, 0, 141, 205, 88, 1, 82, 203, 205, 0, 143, 203, 74, 1, 141, 204, 74, 1, 34, 204, 204, 0, 121, 204, 6, 0, 1, 204, 0, 0, 141, 206, 74, 1, 4, 204, 204, 206, 0, 205, 204, 0, 119, 0, 3, 0, 141, 204, 74, 1, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 75, 1, 141, 205, 75, 1, 141, 204, 75, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 203, 0, 0, 84, 107, 0, 0, 205, 204, 116, 0, 143, 203, 76, 1, 141, 203, 76, 1, 45, 203, 203, 116, 56, 3, 0, 0, 141, 203, 88, 1, 1, 204, 0, 2, 3, 203, 203, 204, 1, 204, 48, 0, 107, 203, 11, 204, 141, 204, 88, 1, 1, 203, 0, 2, 3, 204, 204, 203, 25, 31, 204, 11, 119, 0, 3, 0, 141, 204, 76, 1, 0, 31, 204, 0, 26, 204, 31, 1, 143, 204, 77, 1, 141, 204, 77, 1, 141, 203, 74, 1, 42, 203, 203, 31, 38, 203, 203, 2, 25, 203, 203, 43, 1, 205, 255, 0, 19, 203, 203, 205, 83, 204, 203, 0, 26, 203, 31, 2, 143, 203, 78, 1, 141, 203, 78, 1, 25, 204, 5, 15, 1, 205, 255, 0, 19, 204, 204, 205, 83, 203, 204, 0, 141, 204, 88, 1, 3, 36, 204, 200, 58, 60, 43, 0, 75, 204, 60, 0, 143, 204, 79, 1, 1, 203, 151, 24, 141, 205, 79, 1, 90, 204, 203, 205, 143, 204, 80, 1, 25, 204, 36, 1, 143, 204, 81, 1, 141, 204, 80, 1, 1, 203, 255, 0, 19, 204, 204, 203, 38, 203, 5, 32, 20, 204, 204, 203, 1, 203, 255, 0, 19, 204, 204, 203, 83, 36, 204, 0, 141, 203, 79, 1, 76, 203, 203, 0, 64, 204, 60, 203, 144, 204, 82, 1, 141, 204, 81, 1, 141, 203, 83, 1, 4, 204, 204, 203, 32, 204, 204, 1, 121, 204, 23, 0, 38, 204, 4, 8, 32, 204, 204, 0, 34, 203, 3, 1, 142, 205, 82, 1, 59, 206, 16, 0, 65, 205, 205, 206, 59, 206, 0, 0, 69, 205, 205, 206, 19, 203, 203, 205, 19, 204, 204, 203, 121, 204, 4, 0, 141, 204, 81, 1, 0, 54, 204, 0, 119, 0, 11, 0, 25, 204, 36, 2, 143, 204, 84, 1, 141, 204, 81, 1, 1, 203, 46, 0, 83, 204, 203, 0, 141, 203, 84, 1, 0, 54, 203, 0, 119, 0, 3, 0, 141, 203, 81, 1, 0, 54, 203, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 203, 203, 204, 59, 204, 0, 0, 70, 203, 203, 204, 121, 203, 6, 0, 0, 36, 54, 0, 142, 203, 82, 1, 59, 204, 16, 0, 65, 60, 203, 204, 119, 0, 197, 255, 0, 204, 54, 0, 143, 204, 85, 1, 33, 203, 3, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 26, 205, 205, 2, 15, 205, 205, 3, 19, 203, 203, 205, 121, 203, 4, 0, 25, 203, 3, 2, 0, 204, 203, 0, 119, 0, 5, 0, 141, 203, 85, 1, 141, 205, 83, 1, 4, 203, 203, 205, 0, 204, 203, 0, 0, 106, 204, 0, 141, 204, 78, 1, 4, 204, 116, 204, 141, 203, 70, 1, 3, 204, 204, 203, 3, 115, 204, 106, 1, 203, 32, 0, 134, 204, 0, 0, 100, 161, 0, 0, 0, 203, 2, 115, 4, 0, 0, 0, 141, 203, 70, 1, 134, 204, 0, 0, 84, 204, 0, 0, 0, 35, 203, 0, 1, 203, 48, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 100, 161, 0, 0, 0, 203, 2, 115, 205, 0, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 85, 1, 141, 206, 83, 1, 4, 203, 203, 206, 134, 204, 0, 0, 84, 204, 0, 0, 0, 205, 203, 0, 1, 203, 48, 0, 141, 205, 85, 1, 141, 206, 83, 1, 4, 205, 205, 206, 4, 205, 106, 205, 1, 206, 0, 0, 1, 207, 0, 0, 134, 204, 0, 0, 100, 161, 0, 0, 0, 203, 205, 206, 207, 0, 0, 0, 141, 207, 78, 1, 141, 206, 78, 1, 4, 206, 116, 206, 134, 204, 0, 0, 84, 204, 0, 0, 0, 207, 206, 0, 1, 206, 32, 0, 1, 207, 0, 32, 21, 207, 4, 207, 134, 204, 0, 0, 100, 161, 0, 0, 0, 206, 2, 115, 207, 0, 0, 0, 0, 114, 115, 0, 119, 0, 117, 4, 34, 204, 3, 0, 1, 207, 6, 0, 125, 84, 204, 207, 3, 0, 0, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 207, 207, 204, 59, 204, 0, 0, 70, 207, 207, 204, 121, 207, 14, 0, 141, 207, 88, 1, 82, 117, 207, 0, 141, 207, 88, 1, 26, 204, 117, 28, 85, 207, 204, 0, 142, 204, 41, 1, 59, 207, 2, 0, 65, 204, 204, 207, 60, 207, 0, 0, 0, 0, 0, 16, 65, 70, 204, 207, 26, 108, 117, 28, 119, 0, 7, 0, 141, 207, 88, 1, 82, 110, 207, 0, 142, 207, 41, 1, 59, 204, 2, 0, 65, 70, 207, 204, 0, 108, 110, 0, 34, 118, 108, 0, 121, 118, 5, 0, 141, 207, 88, 1, 25, 207, 207, 8, 0, 204, 207, 0, 119, 0, 6, 0, 141, 207, 88, 1, 25, 207, 207, 8, 1, 206, 32, 1, 3, 207, 207, 206, 0, 204, 207, 0, 0, 94, 204, 0, 0, 28, 94, 0, 58, 77, 70, 0, 75, 119, 77, 0, 85, 28, 119, 0, 25, 120, 28, 4, 77, 204, 119, 0, 64, 121, 77, 204, 60, 204, 0, 0, 0, 202, 154, 59, 65, 204, 121, 204, 59, 207, 0, 0, 70, 204, 204, 207, 121, 204, 6, 0, 0, 28, 120, 0, 60, 204, 0, 0, 0, 202, 154, 59, 65, 77, 121, 204, 119, 0, 241, 255, 1, 204, 0, 0, 15, 123, 204, 108, 121, 123, 80, 0, 0, 46, 94, 0, 0, 49, 120, 0, 0, 125, 108, 0, 34, 124, 125, 29, 1, 204, 29, 0, 125, 126, 124, 125, 204, 0, 0, 0, 26, 24, 49, 4, 16, 127, 24, 46, 121, 127, 3, 0, 0, 64, 46, 0, 119, 0, 41, 0, 0, 25, 24, 0, 1, 27, 0, 0, 82, 128, 25, 0, 1, 204, 0, 0, 135, 129, 1, 0, 128, 204, 126, 0, 128, 204, 0, 0, 0, 130, 204, 0, 1, 204, 0, 0, 134, 131, 0, 0, 76, 207, 0, 0, 129, 130, 27, 204, 128, 204, 0, 0, 0, 132, 204, 0, 1, 204, 0, 0, 134, 133, 0, 0, 92, 195, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 134, 204, 0, 85, 25, 133, 0, 1, 204, 0, 0, 134, 135, 0, 0, 0, 207, 0, 0, 131, 132, 201, 204, 128, 204, 0, 0, 0, 136, 204, 0, 26, 23, 25, 4, 16, 137, 23, 46, 120, 137, 4, 0, 0, 25, 23, 0, 0, 27, 135, 0, 119, 0, 226, 255, 32, 204, 135, 0, 121, 204, 3, 0, 0, 64, 46, 0, 119, 0, 4, 0, 26, 138, 46, 4, 85, 138, 135, 0, 0, 64, 138, 0, 0, 65, 49, 0, 16, 139, 64, 65, 120, 139, 2, 0, 119, 0, 7, 0, 26, 140, 65, 4, 82, 141, 140, 0, 32, 204, 141, 0, 121, 204, 3, 0, 0, 65, 140, 0, 119, 0, 248, 255, 141, 204, 88, 1, 82, 142, 204, 0, 141, 204, 88, 1, 4, 207, 142, 126, 85, 204, 207, 0, 1, 207, 0, 0, 4, 204, 142, 126, 47, 207, 207, 204, 204, 7, 0, 0, 0, 46, 64, 0, 0, 49, 65, 0, 4, 125, 142, 126, 119, 0, 185, 255, 0, 45, 64, 0, 0, 48, 65, 0, 4, 109, 142, 126, 119, 0, 4, 0, 0, 45, 94, 0, 0, 48, 120, 0, 0, 109, 108, 0, 34, 143, 109, 0, 121, 143, 90, 0, 0, 73, 45, 0, 0, 75, 48, 0, 0, 145, 109, 0, 1, 207, 0, 0, 4, 144, 207, 145, 34, 207, 144, 9, 1, 204, 9, 0, 125, 146, 207, 144, 204, 0, 0, 0, 16, 147, 73, 75, 121, 147, 34, 0, 1, 22, 0, 0, 0, 47, 73, 0, 82, 150, 47, 0, 24, 204, 150, 146, 3, 151, 204, 22, 85, 47, 151, 0, 1, 204, 1, 0, 22, 204, 204, 146, 26, 204, 204, 1, 19, 204, 150, 204, 24, 207, 201, 146, 5, 152, 204, 207, 25, 153, 47, 4, 16, 154, 153, 75, 121, 154, 4, 0, 0, 22, 152, 0, 0, 47, 153, 0, 119, 0, 241, 255, 82, 155, 73, 0, 25, 156, 73, 4, 32, 207, 155, 0, 125, 9, 207, 156, 73, 0, 0, 0, 32, 207, 152, 0, 121, 207, 4, 0, 0, 11, 9, 0, 0, 81, 75, 0, 119, 0, 13, 0, 25, 157, 75, 4, 85, 75, 152, 0, 0, 11, 9, 0, 0, 81, 157, 0, 119, 0, 8, 0, 82, 148, 73, 0, 25, 149, 73, 4, 32, 207, 148, 0, 125, 10, 207, 149, 73, 0, 0, 0, 0, 11, 10, 0, 0, 81, 75, 0, 39, 207, 5, 32, 32, 207, 207, 102, 125, 158, 207, 94, 11, 0, 0, 0, 0, 159, 81, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 4, 206, 159, 158, 42, 206, 206, 2, 47, 204, 204, 206, 16, 9, 0, 0, 25, 204, 84, 25, 28, 204, 204, 9, 38, 204, 204, 255, 25, 204, 204, 1, 41, 204, 204, 2, 3, 204, 158, 204, 0, 207, 204, 0, 119, 0, 2, 0, 0, 207, 81, 0, 0, 13, 207, 0, 141, 207, 88, 1, 82, 160, 207, 0, 141, 207, 88, 1, 3, 204, 160, 146, 85, 207, 204, 0, 3, 204, 160, 146, 34, 204, 204, 0, 121, 204, 5, 0, 0, 73, 11, 0, 0, 75, 13, 0, 3, 145, 160, 146, 119, 0, 174, 255, 0, 72, 11, 0, 0, 74, 13, 0, 119, 0, 3, 0, 0, 72, 45, 0, 0, 74, 48, 0, 16, 161, 72, 74, 121, 161, 22, 0, 0, 162, 72, 0, 82, 163, 72, 0, 35, 204, 163, 10, 121, 204, 5, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 53, 204, 9, 119, 0, 15, 0, 4, 204, 94, 162, 42, 204, 204, 2, 27, 32, 204, 9, 1, 39, 10, 0, 27, 164, 39, 10, 25, 165, 32, 1, 48, 204, 163, 164, 172, 9, 0, 0, 0, 53, 165, 0, 119, 0, 5, 0, 0, 32, 165, 0, 0, 39, 164, 0, 119, 0, 248, 255, 1, 53, 0, 0, 39, 204, 5, 32, 33, 204, 204, 102, 1, 207, 0, 0, 125, 166, 204, 53, 207, 0, 0, 0, 4, 207, 84, 166, 33, 204, 84, 0, 39, 206, 5, 32, 32, 206, 206, 103, 19, 204, 204, 206, 41, 204, 204, 31, 42, 204, 204, 31, 3, 167, 207, 204, 0, 169, 74, 0, 4, 204, 169, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 47, 204, 167, 204, 236, 12, 0, 0, 25, 204, 94, 4, 1, 207, 0, 36, 3, 207, 167, 207, 28, 207, 207, 9, 38, 207, 207, 255, 1, 206, 0, 4, 4, 207, 207, 206, 41, 207, 207, 2, 3, 170, 204, 207, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 207, 207, 1, 34, 207, 207, 9, 121, 207, 16, 0, 1, 207, 0, 36, 3, 207, 167, 207, 30, 207, 207, 9, 38, 207, 207, 255, 25, 38, 207, 1, 1, 57, 10, 0, 27, 171, 57, 10, 25, 37, 38, 1, 32, 207, 37, 9, 121, 207, 3, 0, 0, 56, 171, 0, 119, 0, 5, 0, 0, 38, 37, 0, 0, 57, 171, 0, 119, 0, 248, 255, 1, 56, 10, 0, 82, 172, 170, 0, 9, 207, 172, 56, 38, 207, 207, 255, 0, 173, 207, 0, 25, 207, 170, 4, 13, 174, 207, 74, 32, 207, 173, 0, 19, 207, 174, 207, 121, 207, 5, 0, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 119, 0, 132, 0, 7, 207, 172, 56, 38, 207, 207, 255, 0, 175, 207, 0, 38, 204, 175, 1, 32, 204, 204, 0, 121, 204, 5, 0, 61, 204, 0, 0, 0, 0, 0, 90, 58, 207, 204, 0, 119, 0, 5, 0, 62, 204, 0, 0, 1, 0, 0, 0, 0, 0, 64, 67, 58, 207, 204, 0, 58, 86, 207, 0, 28, 207, 56, 2, 38, 207, 207, 255, 0, 176, 207, 0, 13, 204, 173, 176, 19, 204, 174, 204, 121, 204, 4, 0, 59, 204, 1, 0, 58, 207, 204, 0, 119, 0, 4, 0, 61, 204, 0, 0, 0, 0, 192, 63, 58, 207, 204, 0, 58, 95, 207, 0, 48, 204, 173, 176, 72, 11, 0, 0, 61, 204, 0, 0, 0, 0, 0, 63, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 95, 0, 58, 15, 207, 0, 32, 177, 33, 0, 121, 177, 4, 0, 58, 41, 15, 0, 58, 42, 86, 0, 119, 0, 22, 0, 78, 178, 34, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 86, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 86, 0, 58, 14, 207, 0, 41, 204, 178, 24, 42, 204, 204, 24, 32, 204, 204, 45, 121, 204, 4, 0, 68, 204, 15, 0, 58, 207, 204, 0, 119, 0, 2, 0, 58, 207, 15, 0, 58, 8, 207, 0, 58, 41, 8, 0, 58, 42, 14, 0, 4, 207, 172, 173, 85, 170, 207, 0, 63, 179, 42, 41, 70, 180, 179, 42, 121, 180, 62, 0, 4, 207, 172, 173, 3, 181, 207, 56, 85, 170, 181, 0, 2, 207, 0, 0, 255, 201, 154, 59, 48, 207, 207, 181, 84, 12, 0, 0, 0, 90, 72, 0, 0, 113, 170, 0, 26, 182, 113, 4, 1, 207, 0, 0, 85, 113, 207, 0, 16, 183, 182, 90, 121, 183, 6, 0, 26, 184, 90, 4, 1, 207, 0, 0, 85, 184, 207, 0, 0, 97, 184, 0, 119, 0, 2, 0, 0, 97, 90, 0, 82, 185, 182, 0, 25, 207, 185, 1, 85, 182, 207, 0, 2, 207, 0, 0, 255, 201, 154, 59, 25, 204, 185, 1, 48, 207, 207, 204, 72, 12, 0, 0, 0, 90, 97, 0, 0, 113, 182, 0, 119, 0, 235, 255, 0, 89, 97, 0, 0, 112, 182, 0, 119, 0, 3, 0, 0, 89, 72, 0, 0, 112, 170, 0, 0, 186, 89, 0, 82, 187, 89, 0, 35, 207, 187, 10, 121, 207, 7, 0, 0, 80, 112, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 82, 207, 9, 0, 103, 89, 0, 119, 0, 19, 0, 4, 207, 94, 186, 42, 207, 207, 2, 27, 67, 207, 9, 1, 69, 10, 0, 27, 188, 69, 10, 25, 189, 67, 1, 48, 207, 187, 188, 180, 12, 0, 0, 0, 80, 112, 0, 0, 82, 189, 0, 0, 103, 89, 0, 119, 0, 7, 0, 0, 67, 189, 0, 0, 69, 188, 0, 119, 0, 246, 255, 0, 80, 170, 0, 0, 82, 53, 0, 0, 103, 72, 0, 25, 190, 80, 4, 16, 191, 190, 74, 125, 12, 191, 190, 74, 0, 0, 0, 0, 92, 82, 0, 0, 102, 12, 0, 0, 104, 103, 0, 119, 0, 4, 0, 0, 92, 53, 0, 0, 102, 74, 0, 0, 104, 72, 0, 0, 100, 102, 0, 16, 192, 104, 100, 120, 192, 3, 0, 1, 105, 0, 0, 119, 0, 9, 0, 26, 193, 100, 4, 82, 194, 193, 0, 32, 207, 194, 0, 121, 207, 3, 0, 0, 100, 193, 0, 119, 0, 247, 255, 1, 105, 1, 0, 119, 0, 1, 0, 1, 207, 0, 0, 4, 195, 207, 92, 39, 207, 5, 32, 32, 207, 207, 103, 121, 207, 119, 0, 33, 207, 84, 0, 40, 207, 207, 1, 38, 207, 207, 1, 3, 85, 207, 84, 15, 196, 92, 85, 1, 207, 251, 255, 15, 197, 207, 92, 19, 207, 196, 197, 121, 207, 6, 0, 26, 207, 85, 1, 4, 198, 207, 92, 26, 21, 5, 1, 0, 61, 198, 0, 119, 0, 3, 0, 26, 21, 5, 2, 26, 61, 85, 1, 38, 207, 4, 8, 32, 207, 207, 0, 121, 207, 95, 0, 121, 105, 36, 0, 26, 199, 100, 4, 82, 207, 199, 0, 143, 207, 0, 1, 141, 207, 0, 1, 32, 207, 207, 0, 121, 207, 3, 0, 1, 68, 9, 0, 119, 0, 29, 0, 141, 207, 0, 1, 31, 207, 207, 10, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 21, 0, 1, 55, 0, 0, 1, 76, 10, 0, 27, 207, 76, 10, 143, 207, 1, 1, 25, 207, 55, 1, 143, 207, 2, 1, 141, 207, 0, 1, 141, 204, 1, 1, 9, 207, 207, 204, 38, 207, 207, 255, 32, 207, 207, 0, 121, 207, 6, 0, 141, 207, 2, 1, 0, 55, 207, 0, 141, 207, 1, 1, 0, 76, 207, 0, 119, 0, 242, 255, 141, 207, 2, 1, 0, 68, 207, 0, 119, 0, 4, 0, 1, 68, 0, 0, 119, 0, 2, 0, 1, 68, 9, 0, 39, 204, 21, 32, 0, 207, 204, 0, 143, 207, 3, 1, 0, 207, 100, 0, 143, 207, 4, 1, 141, 207, 3, 1, 32, 207, 207, 102, 121, 207, 24, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 4, 207, 204, 68, 143, 207, 5, 1, 1, 207, 0, 0, 141, 204, 5, 1, 15, 207, 207, 204, 141, 204, 5, 1, 1, 206, 0, 0, 125, 87, 207, 204, 206, 0, 0, 0, 15, 206, 61, 87, 143, 206, 6, 1, 141, 206, 6, 1, 125, 62, 206, 61, 87, 0, 0, 0, 0, 44, 21, 0, 0, 71, 62, 0, 1, 111, 0, 0, 119, 0, 36, 0, 141, 204, 4, 1, 4, 204, 204, 94, 42, 204, 204, 2, 27, 204, 204, 9, 26, 204, 204, 9, 3, 206, 204, 92, 143, 206, 7, 1, 141, 204, 7, 1, 4, 206, 204, 68, 143, 206, 8, 1, 1, 206, 0, 0, 141, 204, 8, 1, 15, 206, 206, 204, 141, 204, 8, 1, 1, 207, 0, 0, 125, 88, 206, 204, 207, 0, 0, 0, 15, 207, 61, 88, 143, 207, 9, 1, 141, 207, 9, 1, 125, 63, 207, 61, 88, 0, 0, 0, 0, 44, 21, 0, 0, 71, 63, 0, 1, 111, 0, 0, 119, 0, 10, 0, 0, 44, 21, 0, 0, 71, 61, 0, 38, 207, 4, 8, 0, 111, 207, 0, 119, 0, 5, 0, 0, 44, 5, 0, 0, 71, 84, 0, 38, 207, 4, 8, 0, 111, 207, 0, 20, 204, 71, 111, 0, 207, 204, 0, 143, 207, 10, 1, 39, 204, 44, 32, 0, 207, 204, 0, 143, 207, 12, 1, 141, 207, 12, 1, 32, 207, 207, 102, 121, 207, 13, 0, 1, 204, 0, 0, 15, 207, 204, 92, 143, 207, 13, 1, 141, 204, 13, 1, 1, 206, 0, 0, 125, 207, 204, 92, 206, 0, 0, 0, 143, 207, 14, 1, 1, 66, 0, 0, 141, 207, 14, 1, 0, 107, 207, 0, 119, 0, 64, 0, 34, 207, 92, 0, 143, 207, 15, 1, 141, 206, 15, 1, 125, 207, 206, 195, 92, 0, 0, 0, 143, 207, 16, 1, 141, 206, 16, 1, 141, 204, 16, 1, 34, 204, 204, 0, 41, 204, 204, 31, 42, 204, 204, 31, 134, 207, 0, 0, 84, 107, 0, 0, 206, 204, 116, 0, 143, 207, 18, 1, 141, 207, 18, 1, 4, 207, 116, 207, 34, 207, 207, 2, 121, 207, 18, 0, 141, 207, 18, 1, 0, 52, 207, 0, 26, 207, 52, 1, 143, 207, 19, 1, 141, 207, 19, 1, 1, 204, 48, 0, 83, 207, 204, 0, 141, 204, 19, 1, 4, 204, 116, 204, 34, 204, 204, 2, 121, 204, 4, 0, 141, 204, 19, 1, 0, 52, 204, 0, 119, 0, 245, 255, 141, 204, 19, 1, 0, 51, 204, 0, 119, 0, 3, 0, 141, 204, 18, 1, 0, 51, 204, 0, 42, 207, 92, 31, 0, 204, 207, 0, 143, 204, 20, 1, 26, 204, 51, 1, 143, 204, 22, 1, 141, 204, 22, 1, 141, 207, 20, 1, 38, 207, 207, 2, 25, 207, 207, 43, 1, 206, 255, 0, 19, 207, 207, 206, 83, 204, 207, 0, 1, 204, 255, 0, 19, 204, 44, 204, 0, 207, 204, 0, 143, 207, 23, 1, 26, 207, 51, 2, 143, 207, 24, 1, 141, 207, 24, 1, 141, 204, 23, 1, 83, 207, 204, 0, 141, 204, 24, 1, 0, 66, 204, 0, 141, 204, 24, 1, 4, 107, 116, 204, 25, 204, 33, 1, 143, 204, 25, 1, 141, 207, 25, 1, 3, 204, 207, 71, 143, 204, 26, 1, 141, 207, 26, 1, 141, 206, 10, 1, 33, 206, 206, 0, 38, 206, 206, 1, 3, 207, 207, 206, 3, 204, 207, 107, 143, 204, 28, 1, 1, 207, 32, 0, 141, 206, 28, 1, 134, 204, 0, 0, 100, 161, 0, 0, 0, 207, 2, 206, 4, 0, 0, 0, 134, 204, 0, 0, 84, 204, 0, 0, 0, 34, 33, 0, 1, 206, 48, 0, 141, 207, 28, 1, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 4, 205, 134, 204, 0, 0, 100, 161, 0, 0, 0, 206, 2, 207, 205, 0, 0, 0, 141, 204, 12, 1, 32, 204, 204, 102, 121, 204, 193, 0, 16, 204, 94, 104, 143, 204, 29, 1, 141, 204, 29, 1, 125, 26, 204, 94, 104, 0, 0, 0, 0, 91, 26, 0, 82, 204, 91, 0, 143, 204, 30, 1, 141, 205, 30, 1, 1, 207, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 134, 204, 0, 0, 84, 107, 0, 0, 205, 207, 206, 0, 143, 204, 31, 1, 13, 204, 91, 26, 143, 204, 32, 1, 141, 204, 32, 1, 121, 204, 18, 0, 141, 204, 31, 1, 141, 206, 88, 1, 3, 206, 206, 200, 25, 206, 206, 9, 45, 204, 204, 206, 136, 17, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 206, 48, 0, 107, 204, 8, 206, 141, 206, 88, 1, 3, 206, 206, 200, 25, 40, 206, 8, 119, 0, 34, 0, 141, 206, 31, 1, 0, 40, 206, 0, 119, 0, 31, 0, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 31, 1, 48, 206, 206, 204, 4, 18, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 31, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 31, 1, 0, 19, 206, 0, 26, 206, 19, 1, 143, 206, 33, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 33, 1, 48, 206, 206, 205, 248, 17, 0, 0, 141, 206, 33, 1, 0, 19, 206, 0, 119, 0, 247, 255, 141, 206, 33, 1, 0, 40, 206, 0, 119, 0, 3, 0, 141, 206, 31, 1, 0, 40, 206, 0, 0, 206, 40, 0, 143, 206, 34, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 141, 207, 34, 1, 4, 205, 205, 207, 134, 206, 0, 0, 84, 204, 0, 0, 0, 40, 205, 0, 25, 206, 91, 4, 143, 206, 35, 1, 141, 206, 35, 1, 55, 206, 94, 206, 84, 18, 0, 0, 141, 206, 35, 1, 0, 91, 206, 0, 119, 0, 177, 255, 141, 206, 10, 1, 32, 206, 206, 0, 120, 206, 5, 0, 1, 205, 1, 0, 134, 206, 0, 0, 84, 204, 0, 0, 0, 202, 205, 0, 141, 205, 35, 1, 16, 206, 205, 100, 143, 206, 36, 1, 1, 205, 0, 0, 15, 206, 205, 71, 143, 206, 37, 1, 141, 206, 36, 1, 141, 205, 37, 1, 19, 206, 206, 205, 121, 206, 78, 0, 0, 79, 71, 0, 141, 206, 35, 1, 0, 98, 206, 0, 82, 206, 98, 0, 143, 206, 38, 1, 141, 205, 38, 1, 1, 207, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 25, 204, 204, 9, 134, 206, 0, 0, 84, 107, 0, 0, 205, 207, 204, 0, 143, 206, 39, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 204, 39, 1, 48, 206, 206, 204, 64, 19, 0, 0, 141, 204, 88, 1, 3, 204, 204, 200, 1, 207, 48, 0, 141, 205, 39, 1, 141, 203, 83, 1, 4, 205, 205, 203, 135, 206, 2, 0, 204, 207, 205, 0, 141, 206, 39, 1, 0, 18, 206, 0, 26, 206, 18, 1, 143, 206, 40, 1, 141, 206, 88, 1, 3, 206, 206, 200, 141, 205, 40, 1, 48, 206, 206, 205, 52, 19, 0, 0, 141, 206, 40, 1, 0, 18, 206, 0, 119, 0, 247, 255, 141, 206, 40, 1, 0, 17, 206, 0, 119, 0, 3, 0, 141, 206, 39, 1, 0, 17, 206, 0, 34, 206, 79, 9, 143, 206, 42, 1, 141, 205, 42, 1, 1, 207, 9, 0, 125, 206, 205, 79, 207, 0, 0, 0, 143, 206, 43, 1, 141, 207, 43, 1, 134, 206, 0, 0, 84, 204, 0, 0, 0, 17, 207, 0, 25, 206, 98, 4, 143, 206, 44, 1, 26, 206, 79, 9, 143, 206, 45, 1, 141, 207, 44, 1, 16, 206, 207, 100, 143, 206, 46, 1, 1, 207, 9, 0, 15, 206, 207, 79, 143, 206, 47, 1, 141, 206, 46, 1, 141, 207, 47, 1, 19, 206, 206, 207, 121, 206, 6, 0, 141, 206, 45, 1, 0, 79, 206, 0, 141, 206, 44, 1, 0, 98, 206, 0, 119, 0, 186, 255, 141, 206, 45, 1, 0, 78, 206, 0, 119, 0, 2, 0, 0, 78, 71, 0, 25, 206, 78, 9, 143, 206, 48, 1, 1, 207, 48, 0, 141, 205, 48, 1, 1, 204, 9, 0, 1, 203, 0, 0, 134, 206, 0, 0, 100, 161, 0, 0, 0, 207, 205, 204, 203, 0, 0, 0, 119, 0, 159, 0, 25, 206, 104, 4, 143, 206, 49, 1, 141, 206, 49, 1, 125, 101, 105, 100, 206, 0, 0, 0, 1, 203, 255, 255, 15, 206, 203, 71, 143, 206, 50, 1, 141, 206, 50, 1, 121, 206, 131, 0, 32, 206, 111, 0, 143, 206, 51, 1, 0, 96, 71, 0, 0, 99, 104, 0, 82, 206, 99, 0, 143, 206, 52, 1, 141, 203, 52, 1, 1, 204, 0, 0, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 134, 206, 0, 0, 84, 107, 0, 0, 203, 204, 205, 0, 143, 206, 53, 1, 141, 206, 53, 1, 141, 205, 88, 1, 3, 205, 205, 200, 25, 205, 205, 9, 45, 206, 206, 205, 152, 20, 0, 0, 141, 206, 88, 1, 3, 206, 206, 200, 1, 205, 48, 0, 107, 206, 8, 205, 141, 205, 88, 1, 3, 205, 205, 200, 25, 16, 205, 8, 119, 0, 3, 0, 141, 205, 53, 1, 0, 16, 205, 0, 13, 205, 99, 104, 143, 205, 54, 1, 141, 205, 54, 1, 121, 205, 23, 0, 25, 205, 16, 1, 143, 205, 57, 1, 1, 206, 1, 0, 134, 205, 0, 0, 84, 204, 0, 0, 0, 16, 206, 0, 34, 205, 96, 1, 143, 205, 58, 1, 141, 205, 51, 1, 141, 206, 58, 1, 19, 205, 205, 206, 121, 205, 4, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 41, 0, 1, 206, 1, 0, 134, 205, 0, 0, 84, 204, 0, 0, 0, 202, 206, 0, 141, 205, 57, 1, 0, 59, 205, 0, 119, 0, 34, 0, 141, 206, 88, 1, 3, 206, 206, 200, 16, 205, 206, 16, 143, 205, 55, 1, 141, 205, 55, 1, 120, 205, 3, 0, 0, 59, 16, 0, 119, 0, 26, 0, 1, 206, 0, 0, 141, 204, 83, 1, 4, 206, 206, 204, 3, 205, 16, 206, 143, 205, 86, 1, 141, 206, 88, 1, 3, 206, 206, 200, 1, 204, 48, 0, 141, 203, 86, 1, 135, 205, 2, 0, 206, 204, 203, 0, 0, 58, 16, 0, 26, 205, 58, 1, 143, 205, 56, 1, 141, 205, 88, 1, 3, 205, 205, 200, 141, 203, 56, 1, 48, 205, 205, 203, 128, 21, 0, 0, 141, 205, 56, 1, 0, 58, 205, 0, 119, 0, 247, 255, 141, 205, 56, 1, 0, 59, 205, 0, 119, 0, 1, 0, 0, 205, 59, 0, 143, 205, 59, 1, 141, 203, 88, 1, 3, 203, 203, 200, 25, 203, 203, 9, 141, 204, 59, 1, 4, 205, 203, 204, 143, 205, 60, 1, 141, 204, 60, 1, 15, 205, 204, 96, 143, 205, 61, 1, 141, 204, 61, 1, 141, 203, 60, 1, 125, 205, 204, 203, 96, 0, 0, 0, 143, 205, 62, 1, 141, 203, 62, 1, 134, 205, 0, 0, 84, 204, 0, 0, 0, 59, 203, 0, 141, 203, 60, 1, 4, 205, 96, 203, 143, 205, 63, 1, 25, 205, 99, 4, 143, 205, 64, 1, 141, 205, 64, 1, 16, 205, 205, 101, 1, 203, 255, 255, 141, 204, 63, 1, 15, 203, 203, 204, 19, 205, 205, 203, 121, 205, 6, 0, 141, 205, 63, 1, 0, 96, 205, 0, 141, 205, 64, 1, 0, 99, 205, 0, 119, 0, 134, 255, 141, 205, 63, 1, 0, 83, 205, 0, 119, 0, 2, 0, 0, 83, 71, 0, 25, 205, 83, 18, 143, 205, 66, 1, 1, 203, 48, 0, 141, 204, 66, 1, 1, 206, 18, 0, 1, 207, 0, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 203, 204, 206, 207, 0, 0, 0, 0, 205, 66, 0, 143, 205, 67, 1, 141, 207, 67, 1, 4, 207, 116, 207, 134, 205, 0, 0, 84, 204, 0, 0, 0, 66, 207, 0, 1, 207, 32, 0, 141, 206, 28, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 205, 0, 0, 100, 161, 0, 0, 0, 207, 2, 206, 204, 0, 0, 0, 141, 205, 28, 1, 0, 114, 205, 0, 119, 0, 55, 0, 38, 204, 5, 32, 33, 204, 204, 0, 1, 206, 135, 24, 1, 207, 139, 24, 125, 205, 204, 206, 207, 0, 0, 0, 143, 205, 11, 1, 70, 207, 20, 20, 59, 206, 0, 0, 59, 204, 0, 0, 70, 206, 206, 204, 20, 207, 207, 206, 0, 205, 207, 0, 143, 205, 17, 1, 38, 207, 5, 32, 33, 207, 207, 0, 1, 206, 143, 24, 1, 204, 147, 24, 125, 205, 207, 206, 204, 0, 0, 0, 143, 205, 21, 1, 141, 205, 17, 1, 141, 204, 21, 1, 141, 206, 11, 1, 125, 30, 205, 204, 206, 0, 0, 0, 25, 206, 33, 3, 143, 206, 27, 1, 1, 204, 32, 0, 141, 205, 27, 1, 2, 207, 0, 0, 255, 255, 254, 255, 19, 207, 4, 207, 134, 206, 0, 0, 100, 161, 0, 0, 0, 204, 2, 205, 207, 0, 0, 0, 134, 206, 0, 0, 84, 204, 0, 0, 0, 34, 33, 0, 1, 207, 3, 0, 134, 206, 0, 0, 84, 204, 0, 0, 0, 30, 207, 0, 1, 207, 32, 0, 141, 205, 27, 1, 1, 204, 0, 32, 21, 204, 4, 204, 134, 206, 0, 0, 100, 161, 0, 0, 0, 207, 2, 205, 204, 0, 0, 0, 141, 206, 27, 1, 0, 114, 206, 0, 15, 206, 114, 2, 143, 206, 68, 1, 141, 206, 68, 1, 125, 93, 206, 2, 114, 0, 0, 0, 141, 206, 88, 1, 137, 206, 0, 0, 139, 93, 0, 0, 140, 5, 59, 1, 0, 0, 0, 0, 2, 200, 0, 0, 99, 24, 0, 0, 2, 201, 0, 0, 255, 0, 0, 0, 2, 202, 0, 0, 137, 40, 1, 0, 1, 203, 0, 0, 143, 203, 57, 1, 136, 204, 0, 0, 0, 203, 204, 0, 143, 203, 58, 1, 136, 203, 0, 0, 25, 203, 203, 64, 137, 203, 0, 0, 130, 203, 0, 0, 136, 204, 0, 0, 49, 203, 203, 204, 244, 23, 0, 0, 1, 204, 64, 0, 135, 203, 0, 0, 204, 0, 0, 0, 141, 203, 58, 1, 109, 203, 16, 1, 141, 203, 58, 1, 25, 203, 203, 24, 25, 81, 203, 40, 1, 22, 0, 0, 1, 23, 0, 0, 1, 33, 0, 0, 0, 133, 1, 0, 1, 203, 255, 255, 15, 101, 203, 23, 121, 101, 15, 0, 2, 203, 0, 0, 255, 255, 255, 127, 4, 105, 203, 23, 15, 109, 105, 22, 121, 109, 7, 0, 134, 115, 0, 0, 64, 209, 0, 0, 1, 203, 75, 0, 85, 115, 203, 0, 1, 42, 255, 255, 119, 0, 5, 0, 3, 123, 22, 23, 0, 42, 123, 0, 119, 0, 2, 0, 0, 42, 23, 0, 78, 127, 133, 0, 41, 203, 127, 24, 42, 203, 203, 24, 32, 203, 203, 0, 121, 203, 4, 0, 1, 203, 87, 0, 143, 203, 57, 1, 119, 0, 49, 5, 0, 140, 127, 0, 0, 152, 133, 0, 41, 203, 140, 24, 42, 203, 203, 24, 1, 204, 0, 0, 1, 205, 38, 0, 138, 203, 204, 205, 56, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 52, 25, 0, 0, 72, 25, 0, 0, 119, 0, 10, 0, 0, 24, 152, 0, 0, 204, 152, 0, 143, 204, 15, 1, 119, 0, 13, 0, 0, 25, 152, 0, 0, 164, 152, 0, 1, 204, 9, 0, 143, 204, 57, 1, 119, 0, 8, 0, 25, 143, 152, 1, 141, 203, 58, 1, 109, 203, 16, 143, 78, 72, 143, 0, 0, 140, 72, 0, 0, 152, 143, 0, 119, 0, 197, 255, 141, 203, 57, 1, 32, 203, 203, 9, 121, 203, 33, 0, 1, 203, 0, 0, 143, 203, 57, 1, 25, 157, 164, 1, 78, 169, 157, 0, 41, 203, 169, 24, 42, 203, 203, 24, 32, 203, 203, 37, 120, 203, 5, 0, 0, 24, 25, 0, 0, 203, 164, 0, 143, 203, 15, 1, 119, 0, 21, 0, 25, 184, 25, 1, 25, 194, 164, 2, 141, 203, 58, 1, 109, 203, 16, 194, 78, 203, 194, 0, 143, 203, 3, 1, 141, 203, 3, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 37, 121, 203, 6, 0, 0, 25, 184, 0, 0, 164, 194, 0, 1, 203, 9, 0, 143, 203, 57, 1, 119, 0, 229, 255, 0, 24, 184, 0, 0, 203, 194, 0, 143, 203, 15, 1, 119, 0, 1, 0, 0, 203, 24, 0, 143, 203, 12, 1, 0, 203, 133, 0, 143, 203, 13, 1, 1, 203, 0, 0, 46, 203, 0, 203, 56, 26, 0, 0, 141, 204, 12, 1, 141, 205, 13, 1, 4, 204, 204, 205, 134, 203, 0, 0, 84, 204, 0, 0, 0, 133, 204, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 203, 203, 204, 32, 203, 203, 0, 120, 203, 10, 0, 0, 34, 33, 0, 141, 203, 12, 1, 141, 204, 13, 1, 4, 22, 203, 204, 0, 23, 42, 0, 141, 204, 15, 1, 0, 133, 204, 0, 0, 33, 34, 0, 119, 0, 107, 255, 141, 203, 15, 1, 25, 204, 203, 1, 143, 204, 14, 1, 141, 203, 14, 1, 78, 204, 203, 0, 143, 204, 16, 1, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 35, 204, 204, 10, 121, 204, 46, 0, 141, 203, 15, 1, 25, 204, 203, 2, 143, 204, 17, 1, 141, 203, 17, 1, 78, 204, 203, 0, 143, 204, 18, 1, 141, 203, 15, 1, 25, 204, 203, 3, 143, 204, 19, 1, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 141, 203, 19, 1, 141, 205, 14, 1, 125, 66, 204, 203, 205, 0, 0, 0, 141, 205, 18, 1, 41, 205, 205, 24, 42, 205, 205, 24, 32, 205, 205, 36, 1, 203, 1, 0, 125, 9, 205, 203, 33, 0, 0, 0, 141, 204, 18, 1, 41, 204, 204, 24, 42, 204, 204, 24, 32, 204, 204, 36, 121, 204, 7, 0, 141, 204, 16, 1, 41, 204, 204, 24, 42, 204, 204, 24, 26, 204, 204, 48, 0, 205, 204, 0, 119, 0, 3, 0, 1, 204, 255, 255, 0, 205, 204, 0, 0, 203, 205, 0, 143, 203, 51, 1, 141, 203, 51, 1, 0, 27, 203, 0, 0, 48, 9, 0, 0, 203, 66, 0, 143, 203, 53, 1, 119, 0, 6, 0, 1, 27, 255, 255, 0, 48, 33, 0, 141, 205, 14, 1, 0, 203, 205, 0, 143, 203, 53, 1, 141, 203, 58, 1, 141, 205, 53, 1, 109, 203, 16, 205, 141, 203, 53, 1, 78, 205, 203, 0, 143, 205, 20, 1, 141, 205, 20, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 205, 205, 32, 35, 205, 205, 32, 121, 205, 70, 0, 1, 32, 0, 0, 141, 203, 20, 1, 0, 205, 203, 0, 143, 205, 9, 1, 141, 203, 20, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 205, 203, 32, 143, 205, 22, 1, 141, 203, 53, 1, 0, 205, 203, 0, 143, 205, 54, 1, 1, 203, 1, 0, 141, 204, 22, 1, 22, 203, 203, 204, 0, 205, 203, 0, 143, 205, 21, 1, 141, 205, 21, 1, 19, 205, 205, 202, 32, 205, 205, 0, 121, 205, 8, 0, 0, 31, 32, 0, 141, 205, 9, 1, 0, 71, 205, 0, 141, 203, 54, 1, 0, 205, 203, 0, 143, 205, 28, 1, 119, 0, 48, 0, 141, 203, 21, 1, 20, 203, 203, 32, 0, 205, 203, 0, 143, 205, 23, 1, 141, 203, 54, 1, 25, 205, 203, 1, 143, 205, 24, 1, 141, 205, 58, 1, 141, 203, 24, 1, 109, 205, 16, 203, 141, 205, 24, 1, 78, 203, 205, 0, 143, 203, 25, 1, 141, 203, 25, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 32, 35, 203, 203, 32, 121, 203, 15, 0, 141, 203, 23, 1, 0, 32, 203, 0, 141, 205, 25, 1, 0, 203, 205, 0, 143, 203, 9, 1, 141, 205, 25, 1, 41, 205, 205, 24, 42, 205, 205, 24, 26, 203, 205, 32, 143, 203, 22, 1, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 54, 1, 119, 0, 208, 255, 141, 203, 23, 1, 0, 31, 203, 0, 141, 203, 25, 1, 0, 71, 203, 0, 141, 205, 24, 1, 0, 203, 205, 0, 143, 203, 28, 1, 119, 0, 7, 0, 1, 31, 0, 0, 141, 203, 20, 1, 0, 71, 203, 0, 141, 205, 53, 1, 0, 203, 205, 0, 143, 203, 28, 1, 41, 205, 71, 24, 42, 205, 205, 24, 32, 203, 205, 42, 143, 203, 26, 1, 141, 203, 26, 1, 121, 203, 135, 0, 141, 205, 28, 1, 25, 203, 205, 1, 143, 203, 27, 1, 141, 205, 27, 1, 78, 203, 205, 0, 143, 203, 29, 1, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 48, 0, 141, 205, 28, 1, 25, 203, 205, 2, 143, 203, 30, 1, 141, 205, 30, 1, 78, 203, 205, 0, 143, 203, 31, 1, 141, 203, 31, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 34, 0, 141, 203, 29, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 203, 27, 1, 78, 205, 203, 0, 143, 205, 32, 1, 141, 203, 32, 1, 41, 203, 203, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 3, 3, 205, 3, 203, 143, 205, 33, 1, 141, 203, 33, 1, 82, 205, 203, 0, 143, 205, 34, 1, 141, 203, 33, 1, 106, 205, 203, 4, 143, 205, 35, 1, 141, 203, 28, 1, 25, 205, 203, 3, 143, 205, 36, 1, 141, 205, 34, 1, 0, 30, 205, 0, 1, 59, 1, 0, 141, 203, 36, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 205, 23, 0, 143, 205, 57, 1, 119, 0, 3, 0, 1, 205, 23, 0, 143, 205, 57, 1, 141, 205, 57, 1, 32, 205, 205, 23, 121, 205, 44, 0, 1, 205, 0, 0, 143, 205, 57, 1, 32, 205, 48, 0, 143, 205, 37, 1, 141, 205, 37, 1, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 210, 3, 1, 205, 0, 0, 46, 205, 0, 205, 116, 30, 0, 0, 82, 205, 2, 0, 143, 205, 49, 1, 141, 203, 49, 1, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 3, 203, 203, 204, 1, 204, 0, 0, 25, 204, 204, 4, 26, 204, 204, 1, 40, 204, 204, 255, 19, 203, 203, 204, 0, 205, 203, 0, 143, 205, 38, 1, 141, 203, 38, 1, 82, 205, 203, 0, 143, 205, 39, 1, 141, 205, 38, 1, 25, 205, 205, 4, 85, 2, 205, 0, 141, 205, 39, 1, 0, 30, 205, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 119, 0, 6, 0, 1, 30, 0, 0, 1, 59, 0, 0, 141, 203, 27, 1, 0, 205, 203, 0, 143, 205, 55, 1, 141, 205, 58, 1, 141, 203, 55, 1, 109, 205, 16, 203, 34, 203, 30, 0, 143, 203, 40, 1, 1, 205, 0, 32, 20, 205, 31, 205, 0, 203, 205, 0, 143, 203, 41, 1, 1, 205, 0, 0, 4, 203, 205, 30, 143, 203, 42, 1, 141, 203, 40, 1, 141, 205, 41, 1, 125, 8, 203, 205, 31, 0, 0, 0, 141, 205, 40, 1, 141, 203, 42, 1, 125, 7, 205, 203, 30, 0, 0, 0, 0, 45, 7, 0, 0, 46, 8, 0, 0, 64, 59, 0, 141, 205, 55, 1, 0, 203, 205, 0, 143, 203, 45, 1, 119, 0, 20, 0, 141, 205, 58, 1, 25, 205, 205, 16, 134, 203, 0, 0, 88, 167, 0, 0, 205, 0, 0, 0, 143, 203, 43, 1, 141, 203, 43, 1, 34, 203, 203, 0, 121, 203, 3, 0, 1, 12, 255, 255, 119, 0, 137, 3, 141, 203, 58, 1, 106, 73, 203, 16, 141, 203, 43, 1, 0, 45, 203, 0, 0, 46, 31, 0, 0, 64, 48, 0, 0, 203, 73, 0, 143, 203, 45, 1, 141, 205, 45, 1, 78, 203, 205, 0, 143, 203, 44, 1, 141, 203, 44, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 46, 121, 203, 101, 0, 141, 205, 45, 1, 25, 203, 205, 1, 143, 203, 46, 1, 141, 205, 46, 1, 78, 203, 205, 0, 143, 203, 47, 1, 141, 203, 47, 1, 41, 203, 203, 24, 42, 203, 203, 24, 32, 203, 203, 42, 120, 203, 15, 0, 141, 203, 45, 1, 25, 89, 203, 1, 141, 203, 58, 1, 109, 203, 16, 89, 141, 203, 58, 1, 25, 203, 203, 16, 134, 90, 0, 0, 88, 167, 0, 0, 203, 0, 0, 0, 141, 203, 58, 1, 106, 75, 203, 16, 0, 28, 90, 0, 0, 74, 75, 0, 119, 0, 79, 0, 141, 205, 45, 1, 25, 203, 205, 2, 143, 203, 48, 1, 141, 203, 48, 1, 78, 77, 203, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 35, 203, 203, 10, 121, 203, 30, 0, 141, 203, 45, 1, 25, 78, 203, 3, 78, 79, 78, 0, 41, 203, 79, 24, 42, 203, 203, 24, 32, 203, 203, 36, 121, 203, 23, 0, 41, 203, 77, 24, 42, 203, 203, 24, 26, 203, 203, 48, 41, 203, 203, 2, 1, 205, 10, 0, 97, 4, 203, 205, 141, 205, 48, 1, 78, 80, 205, 0, 41, 205, 80, 24, 42, 205, 205, 24, 26, 205, 205, 48, 41, 205, 205, 3, 3, 82, 3, 205, 82, 83, 82, 0, 106, 84, 82, 4, 141, 205, 45, 1, 25, 85, 205, 4, 141, 205, 58, 1, 109, 205, 16, 85, 0, 28, 83, 0, 0, 74, 85, 0, 119, 0, 40, 0, 32, 86, 64, 0, 120, 86, 3, 0, 1, 12, 255, 255, 119, 0, 53, 3, 1, 205, 0, 0, 46, 205, 0, 205, 200, 32, 0, 0, 82, 205, 2, 0, 143, 205, 50, 1, 141, 205, 50, 1, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 3, 205, 205, 203, 1, 203, 0, 0, 25, 203, 203, 4, 26, 203, 203, 1, 40, 203, 203, 255, 19, 205, 205, 203, 0, 87, 205, 0, 82, 88, 87, 0, 25, 205, 87, 4, 85, 2, 205, 0, 0, 205, 88, 0, 143, 205, 10, 1, 119, 0, 3, 0, 1, 205, 0, 0, 143, 205, 10, 1, 141, 205, 58, 1, 141, 203, 48, 1, 109, 205, 16, 203, 141, 203, 10, 1, 0, 28, 203, 0, 141, 203, 48, 1, 0, 74, 203, 0, 119, 0, 4, 0, 1, 28, 255, 255, 141, 203, 45, 1, 0, 74, 203, 0, 1, 26, 0, 0, 0, 92, 74, 0, 78, 91, 92, 0, 1, 203, 57, 0, 41, 205, 91, 24, 42, 205, 205, 24, 26, 205, 205, 65, 48, 203, 203, 205, 40, 33, 0, 0, 1, 12, 255, 255, 119, 0, 7, 3, 25, 93, 92, 1, 141, 203, 58, 1, 109, 203, 16, 93, 78, 94, 92, 0, 1, 203, 147, 22, 27, 205, 26, 58, 3, 203, 203, 205, 41, 205, 94, 24, 42, 205, 205, 24, 26, 205, 205, 65, 3, 95, 203, 205, 78, 96, 95, 0, 19, 205, 96, 201, 26, 205, 205, 1, 35, 205, 205, 8, 121, 205, 5, 0, 19, 205, 96, 201, 0, 26, 205, 0, 0, 92, 93, 0, 119, 0, 228, 255, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 0, 121, 205, 3, 0, 1, 12, 255, 255, 119, 0, 237, 2, 1, 205, 255, 255, 15, 97, 205, 27, 41, 205, 96, 24, 42, 205, 205, 24, 32, 205, 205, 19, 121, 205, 7, 0, 121, 97, 3, 0, 1, 12, 255, 255, 119, 0, 228, 2, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 27, 0, 121, 97, 16, 0, 41, 205, 27, 2, 3, 98, 4, 205, 19, 205, 96, 201, 85, 98, 205, 0, 41, 205, 27, 3, 3, 99, 3, 205, 82, 100, 99, 0, 106, 102, 99, 4, 141, 205, 58, 1, 85, 205, 100, 0, 141, 205, 58, 1, 109, 205, 4, 102, 1, 205, 49, 0, 143, 205, 57, 1, 119, 0, 11, 0, 1, 205, 0, 0, 53, 205, 0, 205, 20, 34, 0, 0, 1, 12, 0, 0, 119, 0, 204, 2, 141, 203, 58, 1, 19, 204, 96, 201, 134, 205, 0, 0, 76, 46, 0, 0, 203, 204, 2, 0, 141, 205, 57, 1, 32, 205, 205, 49, 121, 205, 11, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 53, 205, 0, 205, 92, 34, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 112, 253, 78, 103, 92, 0, 33, 104, 26, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 15, 32, 204, 204, 3, 19, 204, 104, 204, 121, 204, 6, 0, 41, 204, 103, 24, 42, 204, 204, 24, 38, 204, 204, 223, 0, 205, 204, 0, 119, 0, 4, 0, 41, 204, 103, 24, 42, 204, 204, 24, 0, 205, 204, 0, 0, 17, 205, 0, 1, 205, 0, 32, 19, 205, 46, 205, 0, 106, 205, 0, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 46, 205, 0, 107, 205, 0, 32, 205, 106, 0, 125, 47, 205, 46, 107, 0, 0, 0, 1, 204, 65, 0, 1, 203, 56, 0, 138, 17, 204, 203, 208, 35, 0, 0, 180, 35, 0, 0, 212, 35, 0, 0, 180, 35, 0, 0, 40, 36, 0, 0, 44, 36, 0, 0, 48, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 52, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 132, 36, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 136, 36, 0, 0, 180, 35, 0, 0, 140, 36, 0, 0, 208, 36, 0, 0, 136, 37, 0, 0, 180, 37, 0, 0, 184, 37, 0, 0, 180, 35, 0, 0, 188, 37, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 192, 37, 0, 0, 232, 37, 0, 0, 88, 39, 0, 0, 204, 39, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 252, 39, 0, 0, 180, 35, 0, 0, 40, 40, 0, 0, 180, 35, 0, 0, 180, 35, 0, 0, 84, 40, 0, 0, 0, 49, 133, 0, 1, 50, 0, 0, 1, 51, 99, 24, 0, 54, 81, 0, 0, 69, 28, 0, 0, 70, 47, 0, 119, 0, 40, 1, 119, 0, 110, 0, 141, 204, 58, 1, 82, 170, 204, 0, 141, 204, 58, 1, 106, 171, 204, 4, 141, 204, 58, 1, 109, 204, 8, 170, 141, 204, 58, 1, 25, 204, 204, 8, 1, 205, 0, 0, 109, 204, 4, 205, 141, 205, 58, 1, 141, 204, 58, 1, 25, 204, 204, 8, 85, 205, 204, 0, 1, 67, 255, 255, 141, 205, 58, 1, 25, 204, 205, 8, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 18, 1, 119, 0, 88, 0, 119, 0, 87, 0, 119, 0, 86, 0, 141, 204, 58, 1, 82, 76, 204, 0, 32, 172, 28, 0, 121, 172, 11, 0, 1, 205, 32, 0, 1, 203, 0, 0, 134, 204, 0, 0, 100, 161, 0, 0, 0, 205, 45, 203, 47, 0, 0, 0, 1, 20, 0, 0, 1, 204, 84, 0, 143, 204, 57, 1, 119, 0, 1, 1, 0, 67, 28, 0, 0, 204, 76, 0, 143, 204, 11, 1, 1, 204, 75, 0, 143, 204, 57, 1, 119, 0, 251, 0, 119, 0, 244, 0, 119, 0, 64, 0, 141, 204, 58, 1, 82, 158, 204, 0, 141, 204, 58, 1, 106, 159, 204, 4, 141, 204, 58, 1, 25, 204, 204, 24, 19, 205, 158, 201, 107, 204, 39, 205, 141, 205, 58, 1, 25, 205, 205, 24, 25, 49, 205, 39, 1, 50, 0, 0, 1, 51, 99, 24, 0, 54, 81, 0, 1, 69, 1, 0, 0, 70, 107, 0, 119, 0, 232, 0, 141, 205, 58, 1, 82, 138, 205, 0, 141, 205, 58, 1, 106, 139, 205, 4, 34, 205, 139, 0, 121, 205, 19, 0, 1, 205, 0, 0, 1, 204, 0, 0, 134, 141, 0, 0, 96, 205, 0, 0, 205, 204, 138, 139, 128, 204, 0, 0, 0, 142, 204, 0, 141, 204, 58, 1, 85, 204, 141, 0, 141, 204, 58, 1, 109, 204, 4, 142, 1, 16, 1, 0, 1, 18, 99, 24, 0, 144, 141, 0, 0, 145, 142, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 208, 0, 38, 204, 47, 1, 32, 204, 204, 0, 1, 205, 101, 24, 125, 5, 204, 200, 205, 0, 0, 0, 1, 205, 0, 8, 19, 205, 47, 205, 32, 205, 205, 0, 1, 204, 100, 24, 125, 6, 205, 5, 204, 0, 0, 0, 1, 204, 1, 8, 19, 204, 47, 204, 33, 204, 204, 0, 38, 204, 204, 1, 0, 16, 204, 0, 0, 18, 6, 0, 0, 144, 138, 0, 0, 145, 139, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 186, 0, 141, 204, 58, 1, 86, 190, 204, 0, 134, 191, 0, 0, 0, 0, 0, 0, 0, 190, 45, 28, 47, 17, 0, 0, 0, 22, 191, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 154, 252, 119, 0, 245, 255, 119, 0, 244, 255, 119, 0, 197, 255, 134, 160, 0, 0, 64, 209, 0, 0, 82, 161, 160, 0, 134, 162, 0, 0, 0, 205, 0, 0, 161, 0, 0, 0, 0, 35, 162, 0, 1, 205, 71, 0, 143, 205, 57, 1, 119, 0, 162, 0, 19, 204, 26, 201, 0, 205, 204, 0, 143, 205, 56, 1, 141, 205, 56, 1, 41, 205, 205, 24, 42, 205, 205, 24, 1, 204, 0, 0, 1, 203, 8, 0, 138, 205, 204, 203, 64, 38, 0, 0, 96, 38, 0, 0, 128, 38, 0, 0, 176, 38, 0, 0, 224, 38, 0, 0, 44, 38, 0, 0, 8, 39, 0, 0, 40, 39, 0, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 119, 252, 141, 204, 58, 1, 82, 111, 204, 0, 85, 111, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 111, 252, 141, 204, 58, 1, 82, 112, 204, 0, 85, 112, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 103, 252, 34, 113, 42, 0, 141, 204, 58, 1, 82, 114, 204, 0, 85, 114, 42, 0, 41, 203, 113, 31, 42, 203, 203, 31, 109, 114, 4, 203, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 91, 252, 2, 203, 0, 0, 255, 255, 0, 0, 19, 203, 42, 203, 0, 116, 203, 0, 141, 203, 58, 1, 82, 117, 203, 0, 84, 117, 116, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 79, 252, 19, 203, 42, 201, 0, 118, 203, 0, 141, 203, 58, 1, 82, 119, 203, 0, 83, 119, 118, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 69, 252, 141, 203, 58, 1, 82, 120, 203, 0, 85, 120, 42, 0, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 61, 252, 34, 121, 42, 0, 141, 203, 58, 1, 82, 122, 203, 0, 85, 122, 42, 0, 41, 204, 121, 31, 42, 204, 204, 31, 109, 122, 4, 204, 1, 22, 0, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 49, 252, 141, 205, 58, 1, 82, 134, 205, 0, 141, 205, 58, 1, 106, 135, 205, 4, 134, 136, 0, 0, 144, 173, 0, 0, 134, 135, 81, 0, 4, 205, 81, 136, 15, 137, 205, 28, 38, 204, 47, 8, 32, 204, 204, 0, 20, 204, 204, 137, 121, 204, 3, 0, 0, 205, 28, 0, 119, 0, 4, 0, 4, 204, 81, 136, 25, 204, 204, 1, 0, 205, 204, 0, 0, 29, 205, 0, 0, 13, 136, 0, 1, 37, 0, 0, 1, 39, 99, 24, 0, 55, 29, 0, 0, 68, 47, 0, 0, 150, 134, 0, 0, 153, 135, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 41, 0, 1, 205, 8, 0, 16, 124, 205, 28, 1, 205, 8, 0, 125, 125, 124, 28, 205, 0, 0, 0, 1, 38, 120, 0, 0, 44, 125, 0, 39, 205, 47, 8, 0, 63, 205, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 29, 0, 141, 205, 58, 1 ], eb + 0);
 HEAPU8.set([ 82, 163, 205, 0, 1, 205, 0, 0, 14, 205, 163, 205, 1, 204, 109, 24, 125, 165, 205, 163, 204, 0, 0, 0, 0, 35, 165, 0, 1, 204, 71, 0, 143, 204, 57, 1, 119, 0, 18, 0, 141, 204, 58, 1, 82, 108, 204, 0, 141, 204, 58, 1, 106, 110, 204, 4, 1, 16, 0, 0, 1, 18, 99, 24, 0, 144, 108, 0, 0, 145, 110, 0, 1, 204, 66, 0, 143, 204, 57, 1, 119, 0, 7, 0, 0, 38, 17, 0, 0, 44, 28, 0, 0, 63, 47, 0, 1, 205, 61, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 204, 57, 1, 32, 204, 204, 61, 121, 204, 45, 0, 1, 204, 0, 0, 143, 204, 57, 1, 141, 204, 58, 1, 82, 126, 204, 0, 141, 204, 58, 1, 106, 128, 204, 4, 38, 204, 38, 32, 0, 129, 204, 0, 134, 130, 0, 0, 244, 165, 0, 0, 126, 128, 81, 129, 38, 204, 63, 8, 0, 131, 204, 0, 32, 203, 131, 0, 32, 205, 126, 0, 32, 206, 128, 0, 19, 205, 205, 206, 20, 203, 203, 205, 0, 204, 203, 0, 143, 204, 52, 1, 42, 204, 38, 4, 0, 132, 204, 0, 141, 203, 52, 1, 121, 203, 3, 0, 0, 204, 200, 0, 119, 0, 3, 0, 3, 203, 200, 132, 0, 204, 203, 0, 0, 60, 204, 0, 141, 204, 52, 1, 1, 203, 0, 0, 1, 205, 2, 0, 125, 61, 204, 203, 205, 0, 0, 0, 0, 13, 130, 0, 0, 37, 61, 0, 0, 39, 60, 0, 0, 55, 44, 0, 0, 68, 63, 0, 0, 150, 126, 0, 0, 153, 128, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 140, 0, 141, 205, 57, 1, 32, 205, 205, 66, 121, 205, 16, 0, 1, 205, 0, 0, 143, 205, 57, 1, 134, 146, 0, 0, 84, 107, 0, 0, 144, 145, 81, 0, 0, 13, 146, 0, 0, 37, 16, 0, 0, 39, 18, 0, 0, 55, 28, 0, 0, 68, 47, 0, 0, 150, 144, 0, 0, 153, 145, 0, 1, 205, 67, 0, 143, 205, 57, 1, 119, 0, 122, 0, 141, 205, 57, 1, 32, 205, 205, 71, 121, 205, 28, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 0, 0, 134, 166, 0, 0, 80, 63, 0, 0, 35, 205, 28, 0, 0, 167, 35, 0, 3, 168, 35, 28, 1, 203, 0, 0, 45, 203, 166, 203, 176, 41, 0, 0, 0, 205, 28, 0, 119, 0, 3, 0, 4, 203, 166, 167, 0, 205, 203, 0, 0, 62, 205, 0, 1, 205, 0, 0, 13, 205, 166, 205, 125, 43, 205, 168, 166, 0, 0, 0, 0, 49, 35, 0, 1, 50, 0, 0, 1, 51, 99, 24, 0, 54, 43, 0, 0, 69, 62, 0, 0, 70, 107, 0, 119, 0, 92, 0, 141, 205, 57, 1, 32, 205, 205, 75, 121, 205, 89, 0, 1, 205, 0, 0, 143, 205, 57, 1, 141, 205, 11, 1, 0, 15, 205, 0, 1, 21, 0, 0, 1, 41, 0, 0, 82, 173, 15, 0, 32, 205, 173, 0, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 41, 0, 119, 0, 25, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 174, 0, 0, 192, 204, 0, 0, 205, 173, 0, 0, 4, 175, 67, 21, 34, 205, 174, 0, 16, 203, 175, 174, 20, 205, 205, 203, 121, 205, 4, 0, 0, 19, 21, 0, 0, 53, 174, 0, 119, 0, 12, 0, 25, 176, 15, 4, 3, 177, 174, 21, 16, 178, 177, 67, 121, 178, 5, 0, 0, 15, 176, 0, 0, 21, 177, 0, 0, 41, 174, 0, 119, 0, 230, 255, 0, 19, 177, 0, 0, 53, 174, 0, 119, 0, 1, 0, 34, 179, 53, 0, 121, 179, 3, 0, 1, 12, 255, 255, 119, 0, 172, 0, 1, 203, 32, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 203, 45, 19, 47, 0, 0, 0, 32, 180, 19, 0, 121, 180, 5, 0, 1, 20, 0, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 38, 0, 141, 205, 11, 1, 0, 36, 205, 0, 1, 40, 0, 0, 82, 181, 36, 0, 32, 205, 181, 0, 121, 205, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 28, 0, 141, 205, 58, 1, 25, 205, 205, 20, 134, 182, 0, 0, 192, 204, 0, 0, 205, 181, 0, 0, 3, 183, 182, 40, 15, 185, 19, 183, 121, 185, 5, 0, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 16, 0, 25, 186, 36, 4, 141, 203, 58, 1, 25, 203, 203, 20, 134, 205, 0, 0, 84, 204, 0, 0, 0, 203, 182, 0, 16, 187, 183, 19, 121, 187, 4, 0, 0, 36, 186, 0, 0, 40, 183, 0, 119, 0, 227, 255, 0, 20, 19, 0, 1, 205, 84, 0, 143, 205, 57, 1, 119, 0, 1, 0, 141, 205, 57, 1, 32, 205, 205, 67, 121, 205, 46, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 205, 255, 255, 15, 147, 205, 55, 2, 205, 0, 0, 255, 255, 254, 255, 19, 205, 68, 205, 0, 148, 205, 0, 125, 10, 147, 148, 68, 0, 0, 0, 33, 149, 150, 0, 33, 151, 153, 0, 33, 154, 55, 0, 0, 155, 13, 0, 20, 205, 149, 151, 40, 205, 205, 1, 38, 205, 205, 1, 4, 203, 81, 155, 3, 205, 205, 203, 15, 156, 205, 55, 121, 156, 3, 0, 0, 205, 55, 0, 119, 0, 7, 0, 20, 203, 149, 151, 40, 203, 203, 1, 38, 203, 203, 1, 4, 204, 81, 155, 3, 203, 203, 204, 0, 205, 203, 0, 0, 56, 205, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 57, 205, 56, 55, 0, 0, 0, 20, 205, 149, 151, 20, 205, 154, 205, 125, 14, 205, 13, 81, 0, 0, 0, 0, 49, 14, 0, 0, 50, 37, 0, 0, 51, 39, 0, 0, 54, 81, 0, 0, 69, 57, 0, 0, 70, 10, 0, 119, 0, 21, 0, 141, 205, 57, 1, 32, 205, 205, 84, 121, 205, 18, 0, 1, 205, 0, 0, 143, 205, 57, 1, 1, 203, 32, 0, 1, 204, 0, 32, 21, 204, 47, 204, 134, 205, 0, 0, 100, 161, 0, 0, 0, 203, 45, 20, 204, 0, 0, 0, 15, 188, 20, 45, 125, 189, 188, 45, 20, 0, 0, 0, 0, 22, 189, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 238, 250, 0, 192, 54, 0, 0, 193, 49, 0, 4, 205, 192, 193, 15, 195, 69, 205, 121, 195, 4, 0, 4, 204, 192, 193, 0, 205, 204, 0, 119, 0, 2, 0, 0, 205, 69, 0, 0, 11, 205, 0, 3, 196, 11, 50, 15, 197, 45, 196, 125, 58, 197, 196, 45, 0, 0, 0, 1, 204, 32, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 204, 58, 196, 70, 0, 0, 0, 134, 205, 0, 0, 84, 204, 0, 0, 0, 51, 50, 0, 2, 205, 0, 0, 0, 0, 1, 0, 21, 205, 70, 205, 0, 198, 205, 0, 1, 204, 48, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 204, 58, 196, 198, 0, 0, 0, 1, 204, 48, 0, 4, 203, 192, 193, 1, 206, 0, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 204, 11, 203, 206, 0, 0, 0, 4, 206, 192, 193, 134, 205, 0, 0, 84, 204, 0, 0, 0, 49, 206, 0, 1, 205, 0, 32, 21, 205, 70, 205, 0, 199, 205, 0, 1, 206, 32, 0, 134, 205, 0, 0, 100, 161, 0, 0, 0, 206, 58, 196, 199, 0, 0, 0, 0, 22, 58, 0, 0, 23, 42, 0, 0, 33, 64, 0, 0, 133, 93, 0, 119, 0, 183, 250, 141, 205, 57, 1, 32, 205, 205, 87, 121, 205, 62, 0, 1, 205, 0, 0, 45, 205, 0, 205, 60, 46, 0, 0, 32, 205, 33, 0, 143, 205, 0, 1, 141, 205, 0, 1, 121, 205, 3, 0, 1, 12, 0, 0, 119, 0, 53, 0, 1, 52, 1, 0, 41, 206, 52, 2, 3, 205, 4, 206, 143, 205, 1, 1, 141, 206, 1, 1, 82, 205, 206, 0, 143, 205, 2, 1, 141, 205, 2, 1, 32, 205, 205, 0, 121, 205, 3, 0, 0, 65, 52, 0, 119, 0, 19, 0, 41, 206, 52, 3, 3, 205, 3, 206, 143, 205, 4, 1, 141, 206, 4, 1, 141, 203, 2, 1, 134, 205, 0, 0, 76, 46, 0, 0, 206, 203, 2, 0, 25, 205, 52, 1, 143, 205, 5, 1, 141, 205, 5, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 5, 1, 0, 52, 205, 0, 119, 0, 230, 255, 1, 12, 1, 0, 119, 0, 23, 0, 41, 203, 65, 2, 3, 205, 4, 203, 143, 205, 7, 1, 141, 203, 7, 1, 82, 205, 203, 0, 143, 205, 8, 1, 25, 205, 65, 1, 143, 205, 6, 1, 141, 205, 8, 1, 32, 205, 205, 0, 120, 205, 3, 0, 1, 12, 255, 255, 119, 0, 10, 0, 141, 205, 6, 1, 34, 205, 205, 10, 121, 205, 4, 0, 141, 205, 6, 1, 0, 65, 205, 0, 119, 0, 238, 255, 1, 12, 1, 0, 119, 0, 2, 0, 0, 12, 42, 0, 141, 205, 58, 1, 137, 205, 0, 0, 139, 12, 0, 0, 140, 3, 195, 0, 0, 0, 0, 0, 2, 191, 0, 0, 255, 255, 0, 0, 2, 192, 0, 0, 255, 0, 0, 0, 1, 189, 0, 0, 136, 193, 0, 0, 0, 190, 193, 0, 1, 193, 20, 0, 16, 42, 193, 1, 120, 42, 38, 1, 1, 193, 9, 0, 1, 194, 10, 0, 138, 1, 193, 194, 180, 46, 0, 0, 8, 47, 0, 0, 128, 47, 0, 0, 236, 47, 0, 0, 104, 48, 0, 0, 244, 48, 0, 0, 104, 49, 0, 0, 244, 49, 0, 0, 104, 50, 0, 0, 188, 50, 0, 0, 119, 0, 24, 1, 82, 119, 2, 0, 0, 53, 119, 0, 1, 193, 0, 0, 25, 64, 193, 4, 0, 140, 64, 0, 26, 139, 140, 1, 3, 75, 53, 139, 1, 193, 0, 0, 25, 86, 193, 4, 0, 143, 86, 0, 26, 142, 143, 1, 40, 193, 142, 255, 0, 141, 193, 0, 19, 193, 75, 141, 0, 97, 193, 0, 0, 108, 97, 0, 82, 5, 108, 0, 25, 129, 108, 4, 85, 2, 129, 0, 85, 0, 5, 0, 119, 0, 3, 1, 82, 123, 2, 0, 0, 16, 123, 0, 1, 193, 0, 0, 25, 24, 193, 4, 0, 145, 24, 0, 26, 144, 145, 1, 3, 25, 16, 144, 1, 193, 0, 0, 25, 26, 193, 4, 0, 148, 26, 0, 26, 147, 148, 1, 40, 193, 147, 255, 0, 146, 193, 0, 19, 193, 25, 146, 0, 27, 193, 0, 0, 28, 27, 0, 82, 29, 28, 0, 25, 136, 28, 4, 85, 2, 136, 0, 34, 30, 29, 0, 41, 193, 30, 31, 42, 193, 193, 31, 0, 31, 193, 0, 0, 32, 0, 0, 0, 33, 32, 0, 85, 33, 29, 0, 25, 34, 32, 4, 0, 35, 34, 0, 85, 35, 31, 0, 119, 0, 229, 0, 82, 127, 2, 0, 0, 36, 127, 0, 1, 193, 0, 0, 25, 37, 193, 4, 0, 150, 37, 0, 26, 149, 150, 1, 3, 38, 36, 149, 1, 193, 0, 0, 25, 39, 193, 4, 0, 153, 39, 0, 26, 152, 153, 1, 40, 193, 152, 255, 0, 151, 193, 0, 19, 193, 38, 151, 0, 40, 193, 0, 0, 41, 40, 0, 82, 43, 41, 0, 25, 137, 41, 4, 85, 2, 137, 0, 0, 44, 0, 0, 0, 45, 44, 0, 85, 45, 43, 0, 25, 46, 44, 4, 0, 47, 46, 0, 1, 193, 0, 0, 85, 47, 193, 0, 119, 0, 202, 0, 82, 128, 2, 0, 0, 48, 128, 0, 1, 193, 0, 0, 25, 49, 193, 8, 0, 155, 49, 0, 26, 154, 155, 1, 3, 50, 48, 154, 1, 193, 0, 0, 25, 51, 193, 8, 0, 158, 51, 0, 26, 157, 158, 1, 40, 193, 157, 255, 0, 156, 193, 0, 19, 193, 50, 156, 0, 52, 193, 0, 0, 54, 52, 0, 0, 55, 54, 0, 0, 56, 55, 0, 82, 57, 56, 0, 25, 58, 55, 4, 0, 59, 58, 0, 82, 60, 59, 0, 25, 138, 54, 8, 85, 2, 138, 0, 0, 61, 0, 0, 0, 62, 61, 0, 85, 62, 57, 0, 25, 63, 61, 4, 0, 65, 63, 0, 85, 65, 60, 0, 119, 0, 171, 0, 82, 120, 2, 0, 0, 66, 120, 0, 1, 193, 0, 0, 25, 67, 193, 4, 0, 160, 67, 0, 26, 159, 160, 1, 3, 68, 66, 159, 1, 193, 0, 0, 25, 69, 193, 4, 0, 163, 69, 0, 26, 162, 163, 1, 40, 193, 162, 255, 0, 161, 193, 0, 19, 193, 68, 161, 0, 70, 193, 0, 0, 71, 70, 0, 82, 72, 71, 0, 25, 130, 71, 4, 85, 2, 130, 0, 19, 193, 72, 191, 0, 73, 193, 0, 41, 193, 73, 16, 42, 193, 193, 16, 0, 74, 193, 0, 34, 76, 74, 0, 41, 193, 76, 31, 42, 193, 193, 31, 0, 77, 193, 0, 0, 78, 0, 0, 0, 79, 78, 0, 85, 79, 74, 0, 25, 80, 78, 4, 0, 81, 80, 0, 85, 81, 77, 0, 119, 0, 136, 0, 82, 121, 2, 0, 0, 82, 121, 0, 1, 193, 0, 0, 25, 83, 193, 4, 0, 165, 83, 0, 26, 164, 165, 1, 3, 84, 82, 164, 1, 193, 0, 0, 25, 85, 193, 4, 0, 168, 85, 0, 26, 167, 168, 1, 40, 193, 167, 255, 0, 166, 193, 0, 19, 193, 84, 166, 0, 87, 193, 0, 0, 88, 87, 0, 82, 89, 88, 0, 25, 131, 88, 4, 85, 2, 131, 0, 19, 193, 89, 191, 0, 4, 193, 0, 0, 90, 0, 0, 0, 91, 90, 0, 85, 91, 4, 0, 25, 92, 90, 4, 0, 93, 92, 0, 1, 193, 0, 0, 85, 93, 193, 0, 119, 0, 107, 0, 82, 122, 2, 0, 0, 94, 122, 0, 1, 193, 0, 0, 25, 95, 193, 4, 0, 170, 95, 0, 26, 169, 170, 1, 3, 96, 94, 169, 1, 193, 0, 0, 25, 98, 193, 4, 0, 173, 98, 0, 26, 172, 173, 1, 40, 193, 172, 255, 0, 171, 193, 0, 19, 193, 96, 171, 0, 99, 193, 0, 0, 100, 99, 0, 82, 101, 100, 0, 25, 132, 100, 4, 85, 2, 132, 0, 19, 193, 101, 192, 0, 102, 193, 0, 41, 193, 102, 24, 42, 193, 193, 24, 0, 103, 193, 0, 34, 104, 103, 0, 41, 193, 104, 31, 42, 193, 193, 31, 0, 105, 193, 0, 0, 106, 0, 0, 0, 107, 106, 0, 85, 107, 103, 0, 25, 109, 106, 4, 0, 110, 109, 0, 85, 110, 105, 0, 119, 0, 72, 0, 82, 124, 2, 0, 0, 111, 124, 0, 1, 193, 0, 0, 25, 112, 193, 4, 0, 175, 112, 0, 26, 174, 175, 1, 3, 113, 111, 174, 1, 193, 0, 0, 25, 114, 193, 4, 0, 178, 114, 0, 26, 177, 178, 1, 40, 193, 177, 255, 0, 176, 193, 0, 19, 193, 113, 176, 0, 115, 193, 0, 0, 116, 115, 0, 82, 117, 116, 0, 25, 133, 116, 4, 85, 2, 133, 0, 19, 193, 117, 192, 0, 3, 193, 0, 0, 118, 0, 0, 0, 6, 118, 0, 85, 6, 3, 0, 25, 7, 118, 4, 0, 8, 7, 0, 1, 193, 0, 0, 85, 8, 193, 0, 119, 0, 43, 0, 82, 125, 2, 0, 0, 9, 125, 0, 1, 193, 0, 0, 25, 10, 193, 8, 0, 180, 10, 0, 26, 179, 180, 1, 3, 11, 9, 179, 1, 193, 0, 0, 25, 12, 193, 8, 0, 183, 12, 0, 26, 182, 183, 1, 40, 193, 182, 255, 0, 181, 193, 0, 19, 193, 11, 181, 0, 13, 193, 0, 0, 14, 13, 0, 86, 15, 14, 0, 25, 134, 14, 8, 85, 2, 134, 0, 87, 0, 15, 0, 119, 0, 22, 0, 82, 126, 2, 0, 0, 17, 126, 0, 1, 193, 0, 0, 25, 18, 193, 8, 0, 185, 18, 0, 26, 184, 185, 1, 3, 19, 17, 184, 1, 193, 0, 0, 25, 20, 193, 8, 0, 188, 20, 0, 26, 187, 188, 1, 40, 193, 187, 255, 0, 186, 193, 0, 19, 193, 19, 186, 0, 21, 193, 0, 0, 22, 21, 0, 86, 23, 22, 0, 25, 135, 22, 8, 85, 2, 135, 0, 87, 0, 23, 0, 119, 0, 1, 0, 139, 0, 0, 0, 140, 5, 75, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 6, 1, 0, 0, 7, 6, 0, 0, 8, 2, 0, 0, 9, 3, 0, 0, 10, 9, 0, 32, 69, 7, 0, 121, 69, 27, 0, 33, 11, 4, 0, 32, 69, 10, 0, 121, 69, 11, 0, 121, 11, 5, 0, 9, 69, 5, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 5, 8, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 14, 0, 120, 11, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 85, 4, 70, 0, 38, 69, 1, 0, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 12, 10, 0, 32, 69, 8, 0, 121, 69, 83, 0, 121, 12, 11, 0, 33, 69, 4, 0, 121, 69, 5, 0, 9, 69, 7, 8, 85, 4, 69, 0, 1, 70, 0, 0, 109, 4, 4, 70, 1, 68, 0, 0, 7, 67, 7, 8, 129, 68, 0, 0, 139, 67, 0, 0, 32, 70, 5, 0, 121, 70, 11, 0, 33, 70, 4, 0, 121, 70, 5, 0, 1, 70, 0, 0, 85, 4, 70, 0, 9, 69, 7, 10, 109, 4, 4, 69, 1, 68, 0, 0, 7, 67, 7, 10, 129, 68, 0, 0, 139, 67, 0, 0, 26, 13, 10, 1, 19, 69, 13, 10, 32, 69, 69, 0, 121, 69, 18, 0, 33, 69, 4, 0, 121, 69, 8, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 19, 70, 13, 7, 38, 71, 1, 0, 20, 70, 70, 71, 109, 4, 4, 70, 1, 68, 0, 0, 134, 70, 0, 0, 248, 196, 0, 0, 10, 0, 0, 0, 24, 70, 7, 70, 0, 67, 70, 0, 129, 68, 0, 0, 139, 67, 0, 0, 135, 14, 3, 0, 10, 0, 0, 0, 135, 70, 3, 0, 7, 0, 0, 0, 4, 15, 14, 70, 37, 70, 15, 30, 121, 70, 15, 0, 25, 16, 15, 1, 1, 70, 31, 0, 4, 17, 70, 15, 0, 36, 16, 0, 22, 70, 7, 17, 24, 69, 5, 16, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 16, 0, 34, 70, 0, 1, 33, 0, 0, 22, 70, 5, 17, 0, 32, 70, 0, 119, 0, 139, 0, 32, 70, 4, 0, 121, 70, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 70, 0, 255, 39, 70, 70, 0, 85, 4, 70, 0, 38, 69, 1, 0, 20, 69, 6, 69, 109, 4, 4, 69, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 122, 0, 120, 12, 43, 0, 135, 27, 3, 0, 10, 0, 0, 0, 135, 69, 3, 0, 7, 0, 0, 0, 4, 28, 27, 69, 37, 69, 28, 31, 121, 69, 20, 0, 25, 29, 28, 1, 1, 69, 31, 0, 4, 30, 69, 28, 26, 69, 28, 31, 42, 69, 69, 31, 0, 31, 69, 0, 0, 36, 29, 0, 24, 69, 5, 29, 19, 69, 69, 31, 22, 70, 7, 30, 20, 69, 69, 70, 0, 35, 69, 0, 24, 69, 7, 29, 19, 69, 69, 31, 0, 34, 69, 0, 1, 33, 0, 0, 22, 69, 5, 30, 0, 32, 69, 0, 119, 0, 95, 0, 32, 69, 4, 0, 121, 69, 5, 0, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 38, 69, 0, 255, 39, 69, 69, 0, 85, 4, 69, 0, 38, 70, 1, 0, 20, 70, 6, 70, 109, 4, 4, 70, 1, 68, 0, 0, 1, 67, 0, 0, 129, 68, 0, 0, 139, 67, 0, 0, 26, 18, 8, 1, 19, 70, 18, 8, 33, 70, 70, 0, 121, 70, 44, 0, 135, 70, 3, 0, 8, 0, 0, 0, 25, 20, 70, 33, 135, 70, 3, 0, 7, 0, 0, 0, 4, 21, 20, 70, 1, 70, 64, 0, 4, 22, 70, 21, 1, 70, 32, 0, 4, 23, 70, 21, 42, 70, 23, 31, 0, 24, 70, 0, 26, 25, 21, 32, 42, 70, 25, 31, 0, 26, 70, 0, 0, 36, 21, 0, 26, 70, 23, 1, 42, 70, 70, 31, 24, 69, 7, 25, 19, 70, 70, 69, 22, 69, 7, 23, 24, 71, 5, 21, 20, 69, 69, 71, 19, 69, 69, 26, 20, 70, 70, 69, 0, 35, 70, 0, 24, 70, 7, 21, 19, 70, 26, 70, 0, 34, 70, 0, 22, 70, 5, 22, 19, 70, 70, 24, 0, 33, 70, 0, 22, 70, 7, 22, 24, 69, 5, 25, 20, 70, 70, 69, 19, 70, 70, 24, 22, 69, 5, 23, 26, 71, 21, 33, 42, 71, 71, 31, 19, 69, 69, 71, 20, 70, 70, 69, 0, 32, 70, 0, 119, 0, 32, 0, 33, 70, 4, 0, 121, 70, 5, 0, 19, 70, 18, 5, 85, 4, 70, 0, 1, 69, 0, 0, 109, 4, 4, 69, 32, 69, 8, 1, 121, 69, 10, 0, 38, 69, 1, 0, 20, 69, 6, 69, 0, 68, 69, 0, 38, 69, 0, 255, 39, 69, 69, 0, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 119, 0, 15, 0, 134, 19, 0, 0, 248, 196, 0, 0, 8, 0, 0, 0, 24, 69, 7, 19, 39, 69, 69, 0, 0, 68, 69, 0, 1, 69, 32, 0, 4, 69, 69, 19, 22, 69, 7, 69, 24, 70, 5, 19, 20, 69, 69, 70, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 32, 69, 36, 0, 121, 69, 8, 0, 0, 63, 32, 0, 0, 62, 33, 0, 0, 61, 34, 0, 0, 60, 35, 0, 1, 59, 0, 0, 1, 58, 0, 0, 119, 0, 89, 0, 38, 69, 2, 255, 39, 69, 69, 0, 0, 37, 69, 0, 38, 69, 3, 0, 20, 69, 9, 69, 0, 38, 69, 0, 1, 69, 255, 255, 1, 70, 255, 255, 134, 39, 0, 0, 76, 207, 0, 0, 37, 38, 69, 70, 128, 70, 0, 0, 0, 40, 70, 0, 0, 46, 32, 0, 0, 45, 33, 0, 0, 44, 34, 0, 0, 43, 35, 0, 0, 42, 36, 0, 1, 41, 0, 0, 43, 70, 45, 31, 41, 69, 46, 1, 20, 70, 70, 69, 0, 47, 70, 0, 41, 70, 45, 1, 20, 70, 41, 70, 0, 48, 70, 0, 41, 70, 43, 1, 43, 69, 46, 31, 20, 70, 70, 69, 39, 70, 70, 0, 0, 49, 70, 0, 43, 70, 43, 31, 41, 69, 44, 1, 20, 70, 70, 69, 0, 50, 70, 0, 134, 70, 0, 0, 96, 205, 0, 0, 39, 40, 49, 50, 128, 70, 0, 0, 0, 51, 70, 0, 42, 70, 51, 31, 34, 71, 51, 0, 1, 72, 255, 255, 1, 73, 0, 0, 125, 69, 71, 72, 73, 0, 0, 0, 41, 69, 69, 1, 20, 70, 70, 69, 0, 52, 70, 0, 38, 70, 52, 1, 0, 53, 70, 0, 19, 70, 52, 37, 34, 73, 51, 0, 1, 72, 255, 255, 1, 71, 0, 0, 125, 69, 73, 72, 71, 0, 0, 0, 42, 69, 69, 31, 34, 72, 51, 0, 1, 73, 255, 255, 1, 74, 0, 0, 125, 71, 72, 73, 74, 0, 0, 0, 41, 71, 71, 1, 20, 69, 69, 71, 19, 69, 69, 38, 134, 54, 0, 0, 96, 205, 0, 0, 49, 50, 70, 69, 0, 55, 54, 0, 128, 69, 0, 0, 0, 56, 69, 0, 26, 57, 42, 1, 32, 69, 57, 0, 120, 69, 8, 0, 0, 46, 47, 0, 0, 45, 48, 0, 0, 44, 56, 0, 0, 43, 55, 0, 0, 42, 57, 0, 0, 41, 53, 0, 119, 0, 194, 255, 0, 63, 47, 0, 0, 62, 48, 0, 0, 61, 56, 0, 0, 60, 55, 0, 1, 59, 0, 0, 0, 58, 53, 0, 0, 64, 62, 0, 1, 65, 0, 0, 20, 69, 63, 65, 0, 66, 69, 0, 33, 69, 4, 0, 121, 69, 4, 0, 39, 69, 60, 0, 85, 4, 69, 0, 109, 4, 4, 61, 39, 69, 64, 0, 43, 69, 69, 31, 41, 70, 66, 1, 20, 69, 69, 70, 41, 70, 65, 1, 43, 71, 64, 31, 20, 70, 70, 71, 38, 70, 70, 0, 20, 69, 69, 70, 20, 69, 69, 59, 0, 68, 69, 0, 41, 69, 64, 1, 1, 70, 0, 0, 43, 70, 70, 31, 20, 69, 69, 70, 38, 69, 69, 254, 20, 69, 69, 58, 0, 67, 69, 0, 129, 68, 0, 0, 139, 67, 0, 0, 140, 5, 97, 0, 0, 0, 0, 0, 1, 93, 0, 0, 136, 95, 0, 0, 0, 94, 95, 0, 25, 54, 1, 8, 82, 65, 54, 0, 134, 76, 0, 0, 100, 206, 0, 0, 0, 65, 4, 0, 121, 76, 6, 0, 1, 96, 0, 0, 134, 95, 0, 0, 16, 187, 0, 0, 96, 1, 2, 3, 119, 0, 218, 0, 82, 87, 1, 0, 134, 92, 0, 0, 100, 206, 0, 0, 0, 87, 4, 0, 25, 14, 0, 12, 25, 15, 1, 24, 25, 16, 1, 36, 25, 17, 1, 54, 25, 18, 0, 8, 25, 19, 0, 16, 120, 92, 85, 0, 82, 60, 14, 0, 25, 95, 0, 16, 41, 96, 60, 3, 3, 61, 95, 96, 134, 96, 0, 0, 108, 171, 0, 0, 19, 1, 2, 3, 4, 0, 0, 0, 25, 62, 0, 24, 1, 96, 1, 0, 15, 63, 96, 60, 120, 63, 2, 0, 119, 0, 194, 0, 82, 64, 18, 0, 38, 96, 64, 2, 0, 66, 96, 0, 32, 67, 66, 0, 121, 67, 51, 0, 82, 68, 16, 0, 32, 69, 68, 1, 121, 69, 3, 0, 0, 5, 62, 0, 119, 0, 47, 0, 38, 96, 64, 1, 0, 74, 96, 0, 32, 75, 74, 0, 121, 75, 20, 0, 0, 12, 62, 0, 78, 85, 17, 0, 41, 96, 85, 24, 42, 96, 96, 24, 32, 86, 96, 0, 120, 86, 2, 0, 119, 0, 173, 0, 82, 88, 16, 0, 32, 89, 88, 1, 120, 89, 170, 0, 134, 96, 0, 0, 108, 171, 0, 0, 12, 1, 2, 3, 4, 0, 0, 0, 25, 90, 12, 8, 16, 91, 90, 61, 121, 91, 163, 0, 0, 12, 90, 0, 119, 0, 239, 255, 0, 9, 62, 0, 78, 77, 17, 0, 41, 96, 77, 24, 42, 96, 96, 24, 32, 78, 96, 0, 120, 78, 2, 0, 119, 0, 154, 0, 82, 79, 16, 0, 32, 80, 79, 1, 121, 80, 4, 0, 82, 81, 15, 0, 32, 82, 81, 1, 120, 82, 148, 0, 134, 96, 0, 0, 108, 171, 0, 0, 9, 1, 2, 3, 4, 0, 0, 0, 25, 83, 9, 8, 16, 84, 83, 61, 121, 84, 141, 0, 0, 9, 83, 0, 119, 0, 236, 255, 0, 5, 62, 0, 78, 70, 17, 0, 41, 96, 70, 24, 42, 96, 96, 24, 32, 71, 96, 0, 120, 71, 2, 0, 119, 0, 132, 0, 134, 96, 0, 0, 108, 171, 0, 0, 5, 1, 2, 3, 4, 0, 0, 0, 25, 72, 5, 8, 16, 73, 72, 61, 121, 73, 125, 0, 0, 5, 72, 0, 119, 0, 242, 255, 25, 20, 1, 16, 82, 21, 20, 0, 13, 22, 21, 2, 25, 23, 1, 32, 120, 22, 114, 0, 25, 24, 1, 20, 82, 25, 24, 0, 13, 26, 25, 2, 120, 26, 110, 0, 85, 23, 3, 0, 25, 28, 1, 44, 82, 29, 28, 0, 32, 30, 29, 4, 120, 30, 109, 0, 82, 31, 14, 0, 25, 96, 0, 16, 41, 95, 31, 3, 3, 32, 96, 95, 25, 33, 1, 52, 25, 34, 1, 53, 1, 6, 0, 0, 0, 7, 19, 0, 1, 8, 0, 0, 16, 35, 7, 32, 120, 35, 4, 0, 0, 13, 6, 0, 1, 93, 18, 0, 119, 0, 61, 0, 1, 95, 0, 0, 83, 33, 95, 0, 1, 95, 0, 0, 83, 34, 95, 0, 1, 96, 1, 0, 134, 95, 0, 0, 228, 167, 0, 0, 7, 1, 2, 2, 96, 4, 0, 0, 78, 36, 17, 0, 41, 95, 36, 24, 42, 95, 95, 24, 32, 37, 95, 0, 120, 37, 4, 0, 0, 13, 6, 0, 1, 93, 18, 0, 119, 0, 44, 0, 78, 38, 34, 0, 41, 95, 38, 24, 42, 95, 95, 24, 32, 39, 95, 0, 121, 39, 4, 0, 0, 10, 6, 0, 0, 11, 8, 0, 119, 0, 31, 0, 78, 40, 33, 0, 41, 95, 40, 24, 42, 95, 95, 24, 32, 41, 95, 0, 121, 41, 12, 0, 82, 47, 18, 0, 38, 95, 47, 1, 0, 48, 95, 0, 32, 49, 48, 0, 121, 49, 4, 0, 1, 13, 1, 0, 1, 93, 18, 0, 119, 0, 23, 0, 1, 10, 1, 0, 0, 11, 8, 0, 119, 0, 15, 0, 82, 42, 15, 0, 32, 43, 42, 1, 121, 43, 3, 0, 1, 93, 23, 0, 119, 0, 15, 0, 82, 44, 18, 0, 38, 95, 44, 2, 0, 45, 95, 0, 32, 46, 45, 0, 121, 46, 3, 0, 1, 93, 23, 0, 119, 0, 8, 0, 1, 10, 1, 0, 1, 11, 1, 0, 25, 50, 7, 8, 0, 6, 10, 0, 0, 7, 50, 0, 0, 8, 11, 0, 119, 0, 192, 255, 32, 95, 93, 18, 121, 95, 24, 0, 120, 8, 19, 0, 85, 24, 2, 0, 25, 51, 1, 40, 82, 52, 51, 0, 25, 53, 52, 1, 85, 51, 53, 0, 82, 55, 16, 0, 32, 56, 55, 1, 121, 56, 11, 0, 82, 57, 15, 0, 32, 58, 57, 2, 121, 58, 8, 0, 1, 95, 1, 0, 83, 17, 95, 0, 121, 13, 3, 0, 1, 93, 23, 0, 119, 0, 7, 0, 1, 59, 4, 0, 119, 0, 5, 0, 121, 13, 3, 0, 1, 93, 23, 0, 119, 0, 2, 0, 1, 59, 4, 0, 32, 95, 93, 23, 121, 95, 2, 0, 1, 59, 3, 0, 85, 28, 59, 0, 119, 0, 5, 0, 32, 27, 3, 1, 121, 27, 3, 0, 1, 95, 1, 0, 85, 23, 95, 0, 139, 0, 0, 0, 140, 2, 63, 0, 0, 0, 0, 0, 1, 58, 0, 0, 136, 61, 0, 0, 0, 59, 61, 0, 136, 61, 0, 0, 25, 61, 61, 64, 137, 61, 0, 0, 130, 61, 0, 0, 136, 62, 0, 0, 49, 61, 61, 62, 184, 60, 0, 0, 1, 62, 64, 0, 135, 61, 0, 0, 62, 0, 0, 0, 25, 47, 59, 40, 25, 49, 59, 24, 25, 48, 59, 16, 0, 46, 59, 0, 25, 15, 59, 56, 78, 26, 1, 0, 41, 61, 26, 24, 42, 61, 61, 24, 0, 37, 61, 0, 1, 61, 13, 32, 1, 62, 4, 0, 134, 45, 0, 0, 80, 63, 0, 0, 61, 37, 62, 0, 1, 62, 0, 0, 13, 40, 45, 62, 121, 40, 7, 0, 134, 41, 0, 0, 64, 209, 0, 0, 1, 62, 22, 0, 85, 41, 62, 0, 1, 2, 0, 0, 119, 0, 142, 0, 1, 62, 132, 4, 135, 42, 4, 0, 62, 0, 0, 0, 1, 62, 0, 0, 13, 43, 42, 62, 121, 43, 3, 0, 1, 2, 0, 0, 119, 0, 134, 0, 0, 57, 42, 0, 25, 60, 57, 124, 1, 62, 0, 0, 85, 57, 62, 0, 25, 57, 57, 4, 54, 62, 57, 60, 60, 61, 0, 0, 1, 62, 43, 0, 134, 44, 0, 0, 88, 202, 0, 0, 1, 62, 0, 0, 1, 62, 0, 0, 13, 5, 44, 62, 121, 5, 9, 0, 41, 62, 26, 24, 42, 62, 62, 24, 32, 6, 62, 114, 1, 62, 8, 0, 1, 61, 4, 0, 125, 7, 6, 62, 61, 0, 0, 0, 85, 42, 7, 0, 1, 61, 101, 0, 134, 8, 0, 0, 88, 202, 0, 0, 1, 61, 0, 0, 1, 61, 0, 0, 13, 9, 8, 61, 121, 9, 3, 0, 0, 11, 26, 0, 119, 0, 13, 0, 85, 46, 0, 0, 25, 50, 46, 4, 1, 61, 2, 0, 85, 50, 61, 0, 25, 55, 46, 8, 1, 61, 1, 0, 85, 55, 61, 0, 1, 62, 221, 0, 135, 61, 5, 0, 62, 46, 0, 0, 78, 3, 1, 0, 0, 11, 3, 0, 41, 61, 11, 24, 42, 61, 61, 24, 32, 10, 61, 97, 121, 10, 32, 0, 85, 48, 0, 0, 25, 56, 48, 4, 1, 61, 3, 0, 85, 56, 61, 0, 1, 61, 221, 0, 135, 12, 5, 0, 61, 48, 0, 0, 1, 61, 0, 4, 19, 61, 12, 61, 0, 13, 61, 0, 32, 14, 13, 0, 121, 14, 13, 0, 1, 61, 0, 4, 20, 61, 12, 61, 0, 16, 61, 0, 85, 49, 0, 0, 25, 51, 49, 4, 1, 61, 4, 0, 85, 51, 61, 0, 25, 52, 49, 8, 85, 52, 16, 0, 1, 62, 221, 0, 135, 61, 5, 0, 62, 49, 0, 0, 82, 17, 42, 0, 1, 61, 128, 0, 20, 61, 17, 61, 0, 18, 61, 0, 85, 42, 18, 0, 0, 25, 18, 0, 119, 0, 3, 0, 82, 4, 42, 0, 0, 25, 4, 0, 25, 19, 42, 60, 85, 19, 0, 0, 1, 61, 132, 0, 3, 20, 42, 61, 25, 21, 42, 44, 85, 21, 20, 0, 25, 22, 42, 48, 1, 61, 0, 4, 85, 22, 61, 0, 25, 23, 42, 75, 1, 61, 255, 255, 83, 23, 61, 0, 38, 61, 25, 8, 0, 24, 61, 0, 32, 27, 24, 0, 121, 27, 15, 0, 0, 28, 15, 0, 85, 47, 0, 0, 25, 53, 47, 4, 1, 61, 19, 84, 85, 53, 61, 0, 25, 54, 47, 8, 85, 54, 28, 0, 1, 61, 54, 0, 135, 29, 6, 0, 61, 47, 0, 0, 32, 30, 29, 0, 121, 30, 3, 0, 1, 61, 10, 0, 83, 23, 61, 0, 25, 31, 42, 32, 1, 61, 107, 0, 85, 31, 61, 0, 25, 32, 42, 36, 1, 61, 77, 0, 85, 32, 61, 0, 25, 33, 42, 40, 1, 61, 78, 0, 85, 33, 61, 0, 25, 34, 42, 12, 1, 61, 76, 0, 85, 34, 61, 0, 1, 61, 112, 53, 82, 35, 61, 0, 32, 36, 35, 0, 121, 36, 4, 0, 25, 38, 42, 76, 1, 61, 255, 255, 85, 38, 61, 0, 134, 39, 0, 0, 140, 194, 0, 0, 42, 0, 0, 0, 0, 2, 42, 0, 137, 59, 0, 0, 139, 2, 0, 0, 140, 3, 64, 0, 0, 0, 0, 0, 2, 59, 0, 0, 128, 128, 128, 128, 2, 60, 0, 0, 255, 254, 254, 254, 2, 61, 0, 0, 255, 0, 0, 0, 1, 57, 0, 0, 136, 62, 0, 0, 0, 58, 62, 0, 19, 62, 1, 61, 0, 38, 62, 0, 0, 49, 0, 0, 38, 62, 49, 3, 0, 50, 62, 0, 33, 51, 50, 0, 33, 52, 2, 0, 19, 62, 52, 51, 0, 56, 62, 0, 121, 56, 34, 0, 19, 62, 1, 61, 0, 53, 62, 0, 0, 6, 0, 0, 0, 9, 2, 0, 78, 54, 6, 0, 41, 62, 54, 24, 42, 62, 62, 24, 41, 63, 53, 24, 42, 63, 63, 24, 13, 18, 62, 63, 121, 18, 5, 0, 0, 5, 6, 0, 0, 8, 9, 0, 1, 57, 6, 0, 119, 0, 23, 0, 25, 19, 6, 1, 26, 20, 9, 1, 0, 21, 19, 0, 38, 63, 21, 3, 0, 22, 63, 0, 33, 23, 22, 0, 33, 24, 20, 0, 19, 63, 24, 23, 0, 55, 63, 0, 121, 55, 4, 0, 0, 6, 19, 0, 0, 9, 20, 0, 119, 0, 233, 255, 0, 4, 19, 0, 0, 7, 20, 0, 0, 17, 24, 0, 1, 57, 5, 0, 119, 0, 5, 0, 0, 4, 0, 0, 0, 7, 2, 0, 0, 17, 52, 0, 1, 57, 5, 0, 32, 63, 57, 5, 121, 63, 8, 0, 121, 17, 5, 0, 0, 5, 4, 0, 0, 8, 7, 0, 1, 57, 6, 0, 119, 0, 3, 0, 0, 14, 4, 0, 1, 16, 0, 0, 32, 63, 57, 6, 121, 63, 83, 0, 78, 25, 5, 0, 19, 63, 1, 61, 0, 26, 63, 0, 41, 63, 25, 24, 42, 63, 63, 24, 41, 62, 26, 24, 42, 62, 62, 24, 13, 27, 63, 62, 121, 27, 4, 0, 0, 14, 5, 0, 0, 16, 8, 0, 119, 0, 71, 0, 2, 62, 0, 0, 1, 1, 1, 1, 5, 28, 38, 62, 1, 62, 3, 0, 16, 29, 62, 8, 121, 29, 33, 0, 0, 10, 5, 0, 0, 12, 8, 0, 82, 30, 10, 0, 21, 62, 30, 28, 0, 31, 62, 0, 2, 62, 0, 0, 1, 1, 1, 1, 4, 32, 31, 62, 19, 62, 31, 59, 0, 33, 62, 0, 21, 62, 33, 59, 0, 34, 62, 0, 19, 62, 34, 32, 0, 35, 62, 0, 32, 36, 35, 0, 120, 36, 2, 0, 119, 0, 13, 0, 25, 37, 10, 4, 26, 39, 12, 4, 1, 62, 3, 0, 16, 40, 62, 39, 121, 40, 4, 0, 0, 10, 37, 0, 0, 12, 39, 0, 119, 0, 234, 255, 0, 3, 37, 0, 0, 11, 39, 0, 1, 57, 11, 0, 119, 0, 7, 0, 0, 13, 10, 0, 0, 15, 12, 0, 119, 0, 4, 0, 0, 3, 5, 0, 0, 11, 8, 0, 1, 57, 11, 0, 32, 62, 57, 11, 121, 62, 8, 0, 32, 41, 11, 0, 121, 41, 4, 0, 0, 14, 3, 0, 1, 16, 0, 0, 119, 0, 23, 0, 0, 13, 3, 0, 0, 15, 11, 0, 78, 42, 13, 0, 41, 62, 42, 24, 42, 62, 62, 24, 41, 63, 26, 24, 42, 63, 63, 24, 13, 43, 62, 63, 121, 43, 4, 0, 0, 14, 13, 0, 0, 16, 15, 0, 119, 0, 11, 0, 25, 44, 13, 1, 26, 45, 15, 1, 32, 46, 45, 0, 121, 46, 4, 0, 0, 14, 44, 0, 1, 16, 0, 0, 119, 0, 4, 0, 0, 13, 44, 0, 0, 15, 45, 0, 119, 0, 237, 255, 33, 47, 16, 0, 1, 63, 0, 0, 125, 48, 47, 14, 63, 0, 0, 0, 139, 48, 0, 0, 140, 3, 69, 0, 0, 0, 0, 0, 2, 66, 0, 0, 146, 0, 0, 0, 1, 64, 0, 0, 136, 67, 0, 0, 0, 65, 67, 0, 136, 67, 0, 0, 25, 67, 67, 48, 137, 67, 0, 0, 130, 67, 0, 0, 136, 68, 0, 0, 49, 67, 67, 68, 4, 66, 0, 0, 1, 68, 48, 0, 135, 67, 0, 0, 68, 0, 0, 0, 25, 59, 65, 16, 0, 58, 65, 0, 25, 30, 65, 32, 25, 41, 0, 28, 82, 52, 41, 0, 85, 30, 52, 0, 25, 54, 30, 4, 25, 55, 0, 20, 82, 56, 55, 0, 4, 57, 56, 52, 85, 54, 57, 0, 25, 10, 30, 8, 85, 10, 1, 0, 25, 11, 30, 12, 85, 11, 2, 0, 3, 12, 57, 2, 25, 13, 0, 60, 82, 14, 13, 0, 0, 15, 30, 0, 85, 58, 14, 0, 25, 60, 58, 4, 85, 60, 15, 0, 25, 61, 58, 8, 1, 67, 2, 0, 85, 61, 67, 0, 135, 16, 7, 0, 66, 58, 0, 0, 134, 17, 0, 0, 20, 202, 0, 0, 16, 0, 0, 0, 13, 18, 12, 17, 121, 18, 3, 0, 1, 64, 3, 0, 119, 0, 69, 0, 1, 4, 2, 0, 0, 5, 12, 0, 0, 6, 30, 0, 0, 26, 17, 0, 34, 25, 26, 0, 120, 25, 44, 0, 4, 35, 5, 26, 25, 36, 6, 4, 82, 37, 36, 0, 16, 38, 37, 26, 25, 39, 6, 8, 125, 9, 38, 39, 6, 0, 0, 0, 41, 67, 38, 31, 42, 67, 67, 31, 0, 40, 67, 0, 3, 8, 40, 4, 1, 67, 0, 0, 125, 42, 38, 37, 67, 0, 0, 0, 4, 3, 26, 42, 82, 43, 9, 0, 3, 44, 43, 3, 85, 9, 44, 0, 25, 45, 9, 4, 82, 46, 45, 0, 4, 47, 46, 3, 85, 45, 47, 0, 82, 48, 13, 0, 0, 49, 9, 0, 85, 59, 48, 0, 25, 62, 59, 4, 85, 62, 49, 0, 25, 63, 59, 8, 85, 63, 8, 0, 135, 50, 7, 0, 66, 59, 0, 0, 134, 51, 0, 0, 20, 202, 0, 0, 50, 0, 0, 0, 13, 53, 35, 51, 121, 53, 3, 0, 1, 64, 3, 0, 119, 0, 25, 0, 0, 4, 8, 0, 0, 5, 35, 0, 0, 6, 9, 0, 0, 26, 51, 0, 119, 0, 212, 255, 25, 27, 0, 16, 1, 67, 0, 0, 85, 27, 67, 0, 1, 67, 0, 0, 85, 41, 67, 0, 1, 67, 0, 0, 85, 55, 67, 0, 82, 28, 0, 0, 39, 67, 28, 32, 0, 29, 67, 0, 85, 0, 29, 0, 32, 31, 4, 2, 121, 31, 3, 0, 1, 7, 0, 0, 119, 0, 5, 0, 25, 32, 6, 4, 82, 33, 32, 0, 4, 34, 2, 33, 0, 7, 34, 0, 32, 67, 64, 3, 121, 67, 11, 0, 25, 19, 0, 44, 82, 20, 19, 0, 25, 21, 0, 48, 82, 22, 21, 0, 3, 23, 20, 22, 25, 24, 0, 16, 85, 24, 23, 0, 85, 41, 20, 0, 85, 55, 20, 0, 0, 7, 2, 0, 137, 65, 0, 0, 139, 7, 0, 0, 140, 3, 77, 0, 0, 0, 0, 0, 1, 74, 0, 0, 136, 76, 0, 0, 0, 75, 76, 0, 82, 29, 0, 0, 2, 76, 0, 0, 34, 237, 251, 106, 3, 40, 29, 76, 25, 51, 0, 8, 82, 62, 51, 0, 134, 68, 0, 0, 52, 206, 0, 0, 62, 40, 0, 0, 25, 69, 0, 12, 82, 70, 69, 0, 134, 9, 0, 0, 52, 206, 0, 0, 70, 40, 0, 0, 25, 10, 0, 16, 82, 11, 10, 0, 134, 12, 0, 0, 52, 206, 0, 0, 11, 40, 0, 0, 43, 76, 1, 2, 0, 13, 76, 0, 16, 14, 68, 13, 121, 14, 114, 0, 41, 76, 68, 2, 0, 15, 76, 0, 4, 16, 1, 15, 16, 17, 9, 16, 16, 18, 12, 16, 19, 76, 17, 18, 0, 71, 76, 0, 121, 71, 104, 0, 20, 76, 12, 9, 0, 19, 76, 0, 38, 76, 19, 3, 0, 20, 76, 0, 32, 21, 20, 0, 121, 21, 96, 0, 43, 76, 9, 2, 0, 22, 76, 0, 43, 76, 12, 2, 0, 23, 76, 0, 1, 4, 0, 0, 0, 5, 68, 0, 43, 76, 5, 1, 0, 24, 76, 0, 3, 25, 4, 24, 41, 76, 25, 1, 0, 26, 76, 0, 3, 27, 26, 22, 41, 76, 27, 2, 3, 28, 0, 76, 82, 30, 28, 0, 134, 31, 0, 0, 52, 206, 0, 0, 30, 40, 0, 0, 25, 32, 27, 1, 41, 76, 32, 2, 3, 33, 0, 76, 82, 34, 33, 0, 134, 35, 0, 0, 52, 206, 0, 0, 34, 40, 0, 0, 16, 36, 35, 1, 4, 37, 1, 35, 16, 38, 31, 37, 19, 76, 36, 38, 0, 72, 76, 0, 120, 72, 3, 0, 1, 8, 0, 0, 119, 0, 68, 0, 3, 39, 35, 31, 3, 41, 0, 39, 78, 42, 41, 0, 41, 76, 42, 24, 42, 76, 76, 24, 32, 43, 76, 0, 120, 43, 3, 0, 1, 8, 0, 0, 119, 0, 59, 0, 3, 44, 0, 35, 134, 45, 0, 0, 108, 163, 0, 0, 2, 44, 0, 0, 32, 46, 45, 0, 120, 46, 14, 0, 32, 65, 5, 1, 34, 66, 45, 0, 4, 67, 5, 24, 125, 7, 66, 24, 67, 0, 0, 0, 125, 6, 66, 4, 25, 0, 0, 0, 121, 65, 3, 0, 1, 8, 0, 0, 119, 0, 43, 0, 0, 4, 6, 0, 0, 5, 7, 0, 119, 0, 202, 255, 3, 47, 26, 23, 41, 76, 47, 2, 3, 48, 0, 76, 82, 49, 48, 0, 134, 50, 0, 0, 52, 206, 0, 0, 49, 40, 0, 0, 25, 52, 47, 1, 41, 76, 52, 2, 3, 53, 0, 76, 82, 54, 53, 0, 134, 55, 0, 0, 52, 206, 0, 0, 54, 40, 0, 0, 16, 56, 55, 1, 4, 57, 1, 55, 16, 58, 50, 57, 19, 76, 56, 58, 0, 73, 76, 0, 121, 73, 13, 0, 3, 59, 0, 55, 3, 60, 55, 50, 3, 61, 0, 60, 78, 63, 61, 0, 41, 76, 63, 24, 42, 76, 76, 24, 32, 64, 76, 0, 1, 76, 0, 0, 125, 3, 64, 59, 76, 0, 0, 0, 0, 8, 3, 0, 119, 0, 8, 0, 1, 8, 0, 0, 119, 0, 6, 0, 1, 8, 0, 0, 119, 0, 4, 0, 1, 8, 0, 0, 119, 0, 2, 0, 1, 8, 0, 0, 139, 8, 0, 0, 140, 4, 81, 0, 0, 0, 0, 0, 2, 77, 0, 0, 255, 0, 0, 0, 1, 75, 0, 0, 136, 78, 0, 0, 0, 76, 78, 0, 26, 6, 3, 31, 1, 78, 96, 0, 16, 38, 78, 6, 121, 38, 2, 0, 139, 0, 0, 0, 25, 49, 0, 48, 82, 60, 49, 0, 78, 70, 60, 0, 19, 78, 70, 77, 0, 71, 78, 0, 25, 72, 60, 1, 78, 8, 72, 0, 19, 78, 8, 77, 0, 9, 78, 0, 25, 10, 60, 2, 78, 11, 10, 0, 19, 78, 11, 77, 0, 12, 78, 0, 25, 13, 60, 3, 78, 14, 13, 0, 19, 78, 14, 77, 0, 15, 78, 0, 25, 16, 0, 60, 82, 17, 16, 0, 3, 18, 17, 9, 82, 19, 0, 0, 25, 20, 19, 124, 82, 21, 20, 0, 38, 78, 21, 127, 135, 22, 8, 0, 78, 0, 0, 0, 16, 23, 22, 18, 121, 23, 28, 0, 1, 78, 0, 0, 85, 16, 78, 0, 25, 24, 0, 64, 82, 25, 24, 0, 3, 26, 25, 12, 85, 24, 26, 0, 82, 27, 0, 0, 1, 78, 128, 0, 3, 28, 27, 78, 82, 29, 28, 0, 38, 78, 29, 127, 135, 30, 8, 0, 78, 0, 0, 0, 82, 31, 49, 0, 25, 32, 31, 2, 78, 33, 32, 0, 19, 78, 33, 77, 0, 34, 78, 0, 4, 35, 30, 34, 16, 36, 26, 35, 121, 36, 3, 0, 0, 42, 31, 0, 119, 0, 7, 0, 1, 78, 0, 0, 85, 24, 78, 0, 0, 42, 31, 0, 119, 0, 3, 0, 82, 7, 49, 0, 0, 42, 7, 0, 26, 37, 3, 32, 5, 39, 71, 37, 25, 40, 39, 4, 3, 41, 42, 40, 78, 43, 41, 0, 41, 78, 11, 24, 42, 78, 78, 24, 32, 44, 78, 0, 120, 44, 53, 0, 41, 78, 8, 24, 42, 78, 78, 24, 32, 45, 78, 0, 120, 45, 49, 0, 1, 5, 0, 0, 43, 78, 5, 3, 0, 46, 78, 0, 38, 78, 46, 31, 0, 47, 78, 0, 25, 48, 47, 1, 38, 78, 5, 7, 0, 50, 78, 0, 1, 78, 1, 0, 22, 78, 78, 50, 0, 51, 78, 0, 3, 52, 5, 2, 1, 4, 0, 0, 5, 53, 4, 15, 3, 54, 48, 53, 3, 55, 41, 54, 78, 56, 55, 0, 19, 78, 56, 77, 0, 57, 78, 0, 19, 78, 57, 51, 0, 58, 78, 0, 32, 59, 58, 0, 82, 61, 0, 0, 25, 62, 61, 120, 82, 63, 62, 0, 3, 64, 4, 1, 121, 59, 7, 0, 38, 79, 63, 127, 1, 80, 0, 0, 135, 78, 9, 0, 79, 0, 64, 52, 80, 0, 0, 0, 119, 0, 6, 0, 38, 79, 63, 127, 1, 80, 1, 0, 135, 78, 9, 0, 79, 0, 64, 52, 80, 0, 0, 0, 25, 65, 4, 1, 13, 73, 65, 9, 120, 73, 3, 0, 0, 4, 65, 0, 119, 0, 227, 255, 25, 66, 5, 1, 13, 74, 66, 12, 120, 74, 3, 0, 0, 5, 66, 0, 119, 0, 210, 255, 19, 78, 43, 77, 0, 67, 78, 0, 82, 68, 16, 0, 3, 69, 68, 67, 85, 16, 69, 0, 139, 0, 0, 0, 140, 3, 59, 0, 0, 0, 0, 0, 2, 55, 0, 0, 221, 0, 0, 0, 2, 56, 0, 0, 0, 0, 8, 0, 1, 53, 0, 0, 136, 57, 0, 0, 0, 54, 57, 0, 136, 57, 0, 0, 25, 57, 57, 32, 137, 57, 0, 0, 130, 57, 0, 0, 136, 58, 0, 0, 49, 57, 57, 58, 124, 72, 0, 0, 1, 58, 32, 0, 135, 57, 0, 0, 58, 0, 0, 0, 25, 48, 54, 16, 0, 47, 54, 0, 134, 25, 0, 0, 80, 169, 0, 0, 1, 0, 0, 0, 25, 36, 2, 76, 82, 42, 36, 0, 1, 57, 255, 255, 15, 43, 57, 42, 121, 43, 6, 0, 134, 44, 0, 0, 236, 215, 0, 0, 2, 0, 0, 0, 0, 41, 44, 0, 119, 0, 2, 0, 1, 41, 0, 0, 134, 57, 0, 0, 92, 89, 0, 0, 2, 0, 0, 0, 1, 57, 0, 0, 13, 45, 0, 57, 121, 45, 38, 0, 19, 57, 25, 56, 0, 46, 57, 0, 32, 5, 46, 0, 25, 4, 2, 60, 120, 5, 11, 0, 82, 6, 4, 0, 85, 47, 6, 0, 25, 49, 47, 4, 1, 57, 2, 0, 85, 49, 57, 0, 25, 50, 47, 8, 1, 57, 1, 0, 85, 50, 57, 0, 135, 57, 5, 0, 55, 47, 0, 0, 2, 57, 0, 0, 63, 255, 247, 255, 19, 57, 25, 57, 0, 7, 57, 0, 82, 8, 4, 0, 85, 48, 8, 0, 25, 51, 48, 4, 1, 57, 4, 0, 85, 51, 57, 0, 25, 52, 48, 8, 85, 52, 7, 0, 135, 9, 5, 0, 55, 48, 0, 0, 134, 10, 0, 0, 20, 202, 0, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 3, 0, 1, 53, 15, 0, 119, 0, 59, 0, 1, 53, 12, 0, 119, 0, 57, 0, 134, 12, 0, 0, 148, 95, 0, 0, 0, 1, 0, 0, 1, 57, 0, 0, 13, 13, 12, 57, 121, 13, 3, 0, 1, 53, 15, 0, 119, 0, 49, 0, 25, 14, 12, 60, 82, 15, 14, 0, 25, 16, 2, 60, 82, 17, 16, 0, 13, 18, 15, 17, 121, 18, 4, 0, 1, 57, 255, 255, 85, 14, 57, 0, 119, 0, 13, 0, 19, 57, 25, 56, 0, 19, 57, 0, 134, 20, 0, 0, 72, 92, 0, 0, 15, 17, 19, 0, 34, 21, 20, 0, 121, 21, 6, 0, 134, 57, 0, 0, 224, 109, 0, 0, 12, 0, 0, 0, 1, 53, 15, 0, 119, 0, 28, 0, 82, 22, 2, 0, 38, 57, 22, 1, 0, 23, 57, 0, 82, 24, 12, 0, 20, 57, 23, 24, 0, 26, 57, 0, 85, 2, 26, 0, 25, 27, 12, 32, 82, 28, 27, 0, 25, 29, 2, 32, 85, 29, 28, 0, 25, 30, 12, 36, 82, 31, 30, 0, 25, 32, 2, 36, 85, 32, 31, 0, 25, 33, 12, 40, 82, 34, 33, 0, 25, 35, 2, 40, 85, 35, 34, 0, 25, 37, 12, 12, 82, 38, 37, 0, 25, 39, 2, 12, 85, 39, 38, 0, 134, 57, 0, 0, 224, 109, 0, 0, 12, 0, 0, 0, 1, 53, 12, 0, 32, 57, 53, 12, 121, 57, 10, 0, 32, 40, 41, 0, 121, 40, 3, 0, 0, 3, 2, 0, 119, 0, 12, 0, 134, 57, 0, 0, 212, 215, 0, 0, 2, 0, 0, 0, 0, 3, 2, 0, 119, 0, 7, 0, 32, 57, 53, 15, 121, 57, 5, 0, 134, 57, 0, 0, 224, 109, 0, 0, 2, 0, 0, 0, 1, 3, 0, 0, 137, 54, 0, 0, 139, 3, 0, 0, 140, 5, 53, 0, 0, 0, 0, 0, 1, 48, 0, 0, 136, 50, 0, 0, 0, 49, 50, 0, 25, 42, 1, 8, 82, 43, 42, 0, 134, 44, 0, 0, 100, 206, 0, 0, 0, 43, 4, 0, 121, 44, 6, 0, 1, 51, 0, 0, 134, 50, 0, 0, 16, 187, 0, 0, 51, 1, 2, 3, 119, 0, 91, 0, 82, 45, 1, 0, 134, 46, 0, 0, 100, 206, 0, 0, 0, 45, 4, 0, 25, 7, 0, 8, 120, 46, 10, 0, 82, 38, 7, 0, 82, 39, 38, 0, 25, 40, 39, 24, 82, 41, 40, 0, 38, 51, 41, 127, 135, 50, 10, 0, 51, 38, 1, 2, 3, 4, 0, 0, 119, 0, 76, 0, 25, 8, 1, 16, 82, 9, 8, 0, 13, 10, 9, 2, 25, 11, 1, 32, 120, 10, 67, 0, 25, 12, 1, 20, 82, 13, 12, 0, 13, 14, 13, 2, 120, 14, 63, 0, 85, 11, 3, 0, 25, 16, 1, 44, 82, 17, 16, 0, 32, 18, 17, 4, 120, 18, 62, 0, 25, 19, 1, 52, 1, 50, 0, 0, 83, 19, 50, 0, 25, 20, 1, 53, 1, 50, 0, 0, 83, 20, 50, 0, 82, 21, 7, 0, 82, 22, 21, 0, 25, 23, 22, 20, 82, 24, 23, 0, 38, 51, 24, 127, 1, 52, 1, 0, 135, 50, 11, 0, 51, 21, 1, 2, 2, 52, 4, 0, 78, 25, 20, 0, 41, 50, 25, 24, 42, 50, 50, 24, 32, 26, 50, 0, 121, 26, 4, 0, 1, 5, 4, 0, 1, 48, 11, 0, 119, 0, 10, 0, 78, 27, 19, 0, 41, 50, 27, 24, 42, 50, 50, 24, 32, 47, 50, 0, 121, 47, 4, 0, 1, 5, 3, 0, 1, 48, 11, 0, 119, 0, 2, 0, 1, 6, 3, 0, 32, 50, 48, 11, 121, 50, 22, 0, 85, 12, 2, 0, 25, 28, 1, 40, 82, 29, 28, 0, 25, 30, 29, 1, 85, 28, 30, 0, 25, 31, 1, 36, 82, 32, 31, 0, 32, 33, 32, 1, 121, 33, 12, 0, 25, 34, 1, 24, 82, 35, 34, 0, 32, 36, 35, 2, 121, 36, 6, 0, 25, 37, 1, 54, 1, 50, 1, 0, 83, 37, 50, 0, 0, 6, 5, 0, 119, 0, 4, 0, 0, 6, 5, 0, 119, 0, 2, 0, 0, 6, 5, 0, 85, 16, 6, 0, 119, 0, 5, 0, 32, 15, 3, 1, 121, 15, 3, 0, 1, 50, 1, 0, 85, 11, 50, 0, 139, 0, 0, 0, 140, 4, 63, 0, 0, 0, 0, 0, 1, 56, 0, 0, 136, 59, 0, 0, 0, 57, 59, 0, 136, 59, 0, 0, 25, 59, 59, 64, 137, 59, 0, 0, 130, 59, 0, 0, 136, 60, 0, 0, 49, 59, 59, 60, 124, 76, 0, 0, 1, 60, 64, 0, 135, 59, 0, 0, 60, 0, 0, 0, 0, 37, 57, 0, 82, 46, 0, 0, 26, 47, 46, 8, 82, 48, 47, 0, 3, 49, 0, 48, 26, 50, 46, 4, 82, 7, 50, 0, 85, 37, 2, 0, 25, 8, 37, 4, 85, 8, 0, 0, 25, 9, 37, 8, 85, 9, 1, 0, 25, 10, 37, 12, 85, 10, 3, 0, 25, 11, 37, 16, 25, 12, 37, 20, 25, 13, 37, 24, 25, 14, 37, 28, 25, 15, 37, 32, 25, 16, 37, 40, 0, 55, 11, 0, 25, 58, 55, 36, 1, 59, 0, 0, 85, 55, 59, 0, 25, 55, 55, 4, 54, 59, 55, 58, 212, 76, 0, 0, 1, 60, 0, 0, 108, 11, 36, 60, 1, 59, 0, 0, 107, 11, 38, 59, 1, 59, 0, 0, 134, 17, 0, 0, 100, 206, 0, 0, 7, 2, 59, 0, 121, 17, 20, 0, 25, 18, 37, 48, 1, 59, 1, 0, 85, 18, 59, 0, 82, 19, 7, 0, 25, 20, 19, 20, 82, 21, 20, 0, 38, 60, 21, 127, 1, 61, 1, 0, 1, 62, 0, 0, 135, 59, 11, 0, 60, 7, 37, 49, 49, 61, 62, 0, 82, 22, 13, 0, 32, 23, 22, 1, 1, 59, 0, 0, 125, 4, 23, 49, 59, 0, 0, 0, 0, 5, 4, 0, 119, 0, 54, 0, 25, 24, 37, 36, 82, 25, 7, 0, 25, 26, 25, 24, 82, 27, 26, 0, 38, 60, 27, 127, 1, 62, 1, 0, 1, 61, 0, 0, 135, 59, 10, 0, 60, 7, 37, 49, 62, 61, 0, 0, 82, 28, 24, 0, 1, 59, 0, 0, 1, 60, 2, 0, 138, 28, 59, 60, 160, 77, 0, 0, 224, 77, 0, 0, 1, 5, 0, 0, 119, 0, 36, 0, 82, 29, 16, 0, 32, 30, 29, 1, 82, 31, 14, 0, 32, 32, 31, 1, 19, 59, 30, 32, 0, 51, 59, 0, 82, 33, 15, 0, 32, 34, 33, 1, 19, 59, 51, 34, 0, 52, 59, 0, 82, 35, 12, 0, 1, 59, 0, 0, 125, 6, 52, 35, 59, 0, 0, 0, 0, 5, 6, 0, 119, 0, 20, 0, 119, 0, 1, 0, 82, 36, 13, 0, 32, 38, 36, 1, 120, 38, 14, 0, 82, 39, 16, 0, 32, 40, 39, 0, 82, 41, 14, 0, 32, 42, 41, 1, 19, 59, 40, 42, 0, 53, 59, 0, 82, 43, 15, 0, 32, 44, 43, 1, 19, 59, 53, 44, 0, 54, 59, 0, 120, 54, 3, 0, 1, 5, 0, 0, 119, 0, 3, 0, 82, 45, 11, 0, 0, 5, 45, 0, 137, 57, 0, 0, 139, 5, 0, 0, 140, 3, 65, 0, 0, 0, 0, 0, 2, 62, 0, 0, 255, 0, 0, 0, 2, 63, 0, 0, 128, 0, 0, 0, 1, 60, 0, 0, 136, 64, 0, 0, 0, 61, 64, 0, 1, 64, 0, 0, 13, 24, 0, 64, 121, 24, 3, 0, 1, 3, 1, 0, 119, 0, 146, 0, 35, 35, 1, 128, 121, 35, 6, 0, 19, 64, 1, 62, 0, 46, 64, 0, 83, 0, 46, 0, 1, 3, 1, 0, 119, 0, 139, 0, 134, 54, 0, 0, 216, 211, 0, 0, 1, 64, 188, 0, 3, 55, 54, 64, 82, 56, 55, 0, 82, 57, 56, 0, 1, 64, 0, 0, 13, 58, 57, 64, 121, 58, 18, 0, 38, 64, 1, 128, 0, 4, 64, 0, 2, 64, 0, 0, 128, 223, 0, 0, 13, 5, 4, 64, 121, 5, 6, 0, 19, 64, 1, 62, 0, 7, 64, 0, 83, 0, 7, 0, 1, 3, 1, 0, 119, 0, 119, 0, 134, 6, 0, 0, 64, 209, 0, 0, 1, 64, 84, 0, 85, 6, 64, 0, 1, 3, 255, 255, 119, 0, 113, 0, 1, 64, 0, 8, 16, 8, 1, 64, 121, 8, 19, 0, 43, 64, 1, 6, 0, 9, 64, 0, 1, 64, 192, 0, 20, 64, 9, 64, 0, 10, 64, 0, 19, 64, 10, 62, 0, 11, 64, 0, 25, 12, 0, 1, 83, 0, 11, 0, 38, 64, 1, 63, 0, 13, 64, 0, 20, 64, 13, 63, 0, 14, 64, 0, 19, 64, 14, 62, 0, 15, 64, 0, 83, 12, 15, 0, 1, 3, 2, 0, 119, 0, 92, 0, 2, 64, 0, 0, 0, 216, 0, 0, 16, 16, 1, 64, 1, 64, 0, 224, 19, 64, 1, 64, 0, 17, 64, 0, 2, 64, 0, 0, 0, 224, 0, 0, 13, 18, 17, 64, 20, 64, 16, 18, 0, 59, 64, 0, 121, 59, 29, 0, 43, 64, 1, 12, 0, 19, 64, 0, 1, 64, 224, 0, 20, 64, 19, 64, 0, 20, 64, 0, 19, 64, 20, 62, 0, 21, 64, 0, 25, 22, 0, 1, 83, 0, 21, 0, 43, 64, 1, 6, 0, 23, 64, 0, 38, 64, 23, 63, 0, 25, 64, 0, 20, 64, 25, 63, 0, 26, 64, 0, 19, 64, 26, 62, 0, 27, 64, 0, 25, 28, 0, 2, 83, 22, 27, 0, 38, 64, 1, 63, 0, 29, 64, 0, 20, 64, 29, 63, 0, 30, 64, 0, 19, 64, 30, 62, 0, 31, 64, 0, 83, 28, 31, 0, 1, 3, 3, 0, 119, 0, 52, 0, 2, 64, 0, 0, 0, 0, 1, 0, 4, 32, 1, 64, 2, 64, 0, 0, 0, 0, 16, 0, 16, 33, 32, 64, 121, 33, 39, 0 ], eb + 10240);
 HEAPU8.set([ 43, 64, 1, 18, 0, 34, 64, 0, 1, 64, 240, 0, 20, 64, 34, 64, 0, 36, 64, 0, 19, 64, 36, 62, 0, 37, 64, 0, 25, 38, 0, 1, 83, 0, 37, 0, 43, 64, 1, 12, 0, 39, 64, 0, 38, 64, 39, 63, 0, 40, 64, 0, 20, 64, 40, 63, 0, 41, 64, 0, 19, 64, 41, 62, 0, 42, 64, 0, 25, 43, 0, 2, 83, 38, 42, 0, 43, 64, 1, 6, 0, 44, 64, 0, 38, 64, 44, 63, 0, 45, 64, 0, 20, 64, 45, 63, 0, 47, 64, 0, 19, 64, 47, 62, 0, 48, 64, 0, 25, 49, 0, 3, 83, 43, 48, 0, 38, 64, 1, 63, 0, 50, 64, 0, 20, 64, 50, 63, 0, 51, 64, 0, 19, 64, 51, 62, 0, 52, 64, 0, 83, 49, 52, 0, 1, 3, 4, 0, 119, 0, 7, 0, 134, 53, 0, 0, 64, 209, 0, 0, 1, 64, 84, 0, 85, 53, 64, 0, 1, 3, 255, 255, 119, 0, 1, 0, 139, 3, 0, 0, 140, 2, 58, 0, 0, 0, 0, 0, 2, 53, 0, 0, 128, 128, 128, 128, 2, 54, 0, 0, 255, 254, 254, 254, 2, 55, 0, 0, 255, 0, 0, 0, 1, 51, 0, 0, 136, 56, 0, 0, 0, 52, 56, 0, 19, 56, 1, 55, 0, 18, 56, 0, 32, 29, 18, 0, 121, 29, 6, 0, 135, 47, 12, 0, 0, 0, 0, 0, 3, 48, 0, 47, 0, 2, 48, 0, 119, 0, 106, 0, 0, 40, 0, 0, 38, 56, 40, 3, 0, 44, 56, 0, 32, 45, 44, 0, 121, 45, 3, 0, 0, 5, 0, 0, 119, 0, 28, 0, 19, 56, 1, 55, 0, 46, 56, 0, 0, 6, 0, 0, 78, 8, 6, 0, 41, 56, 8, 24, 42, 56, 56, 24, 32, 9, 56, 0, 41, 56, 8, 24, 42, 56, 56, 24, 41, 57, 46, 24, 42, 57, 57, 24, 13, 10, 56, 57, 20, 57, 9, 10, 0, 49, 57, 0, 121, 49, 3, 0, 0, 2, 6, 0, 119, 0, 82, 0, 25, 11, 6, 1, 0, 12, 11, 0, 38, 57, 12, 3, 0, 13, 57, 0, 32, 14, 13, 0, 121, 14, 3, 0, 0, 5, 11, 0, 119, 0, 3, 0, 0, 6, 11, 0, 119, 0, 233, 255, 2, 57, 0, 0, 1, 1, 1, 1, 5, 15, 18, 57, 82, 16, 5, 0, 2, 57, 0, 0, 1, 1, 1, 1, 4, 17, 16, 57, 19, 57, 16, 53, 0, 19, 57, 0, 21, 57, 19, 53, 0, 20, 57, 0, 19, 57, 20, 17, 0, 21, 57, 0, 32, 22, 21, 0, 121, 22, 36, 0, 0, 4, 5, 0, 0, 24, 16, 0, 21, 57, 24, 15, 0, 23, 57, 0, 2, 57, 0, 0, 1, 1, 1, 1, 4, 25, 23, 57, 19, 57, 23, 53, 0, 26, 57, 0, 21, 57, 26, 53, 0, 27, 57, 0, 19, 57, 27, 25, 0, 28, 57, 0, 32, 30, 28, 0, 120, 30, 3, 0, 0, 3, 4, 0, 119, 0, 20, 0, 25, 31, 4, 4, 82, 32, 31, 0, 2, 57, 0, 0, 1, 1, 1, 1, 4, 33, 32, 57, 19, 57, 32, 53, 0, 34, 57, 0, 21, 57, 34, 53, 0, 35, 57, 0, 19, 57, 35, 33, 0, 36, 57, 0, 32, 37, 36, 0, 121, 37, 4, 0, 0, 4, 31, 0, 0, 24, 32, 0, 119, 0, 226, 255, 0, 3, 31, 0, 119, 0, 2, 0, 0, 3, 5, 0, 19, 57, 1, 55, 0, 38, 57, 0, 0, 7, 3, 0, 78, 39, 7, 0, 41, 57, 39, 24, 42, 57, 57, 24, 32, 41, 57, 0, 41, 57, 39, 24, 42, 57, 57, 24, 41, 56, 38, 24, 42, 56, 56, 24, 13, 42, 57, 56, 20, 56, 41, 42, 0, 50, 56, 0, 25, 43, 7, 1, 121, 50, 3, 0, 0, 2, 7, 0, 119, 0, 3, 0, 0, 7, 43, 0, 119, 0, 240, 255, 139, 2, 0, 0, 140, 3, 54, 0, 0, 0, 0, 0, 1, 47, 0, 0, 136, 50, 0, 0, 0, 48, 50, 0, 136, 50, 0, 0, 1, 51, 224, 0, 3, 50, 50, 51, 137, 50, 0, 0, 130, 50, 0, 0, 136, 51, 0, 0, 49, 50, 50, 51, 236, 82, 0, 0, 1, 51, 224, 0, 135, 50, 0, 0, 51, 0, 0, 0, 25, 27, 48, 120, 25, 38, 48, 80, 0, 40, 48, 0, 1, 50, 136, 0, 3, 41, 48, 50, 0, 46, 38, 0, 25, 49, 46, 40, 1, 50, 0, 0, 85, 46, 50, 0, 25, 46, 46, 4, 54, 50, 46, 49, 8, 83, 0, 0, 82, 45, 2, 0, 85, 27, 45, 0, 1, 50, 0, 0, 134, 42, 0, 0, 152, 23, 0, 0, 50, 1, 27, 40, 38, 0, 0, 0, 34, 43, 42, 0, 121, 43, 3, 0, 1, 4, 255, 255, 119, 0, 94, 0, 25, 44, 0, 76, 82, 7, 44, 0, 1, 50, 255, 255, 15, 8, 50, 7, 121, 8, 6, 0, 134, 9, 0, 0, 236, 215, 0, 0, 0, 0, 0, 0, 0, 39, 9, 0, 119, 0, 2, 0, 1, 39, 0, 0, 82, 10, 0, 0, 38, 50, 10, 32, 0, 11, 50, 0, 25, 12, 0, 74, 78, 13, 12, 0, 41, 50, 13, 24, 42, 50, 50, 24, 34, 14, 50, 1, 121, 14, 4, 0, 38, 50, 10, 223, 0, 15, 50, 0, 85, 0, 15, 0, 25, 16, 0, 48, 82, 17, 16, 0, 32, 18, 17, 0, 121, 18, 46, 0, 25, 20, 0, 44, 82, 21, 20, 0, 85, 20, 41, 0, 25, 22, 0, 28, 85, 22, 41, 0, 25, 23, 0, 20, 85, 23, 41, 0, 1, 50, 80, 0, 85, 16, 50, 0, 25, 24, 41, 80, 25, 25, 0, 16, 85, 25, 24, 0, 134, 26, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 1, 50, 0, 0, 13, 28, 21, 50, 121, 28, 3, 0, 0, 5, 26, 0, 119, 0, 30, 0, 25, 29, 0, 36, 82, 30, 29, 0, 38, 51, 30, 127, 1, 52, 0, 0, 1, 53, 0, 0, 135, 50, 13, 0, 51, 0, 52, 53, 82, 31, 23, 0, 1, 50, 0, 0, 13, 32, 31, 50, 1, 50, 255, 255, 125, 3, 32, 50, 26, 0, 0, 0, 85, 20, 21, 0, 1, 50, 0, 0, 85, 16, 50, 0, 1, 50, 0, 0, 85, 25, 50, 0, 1, 50, 0, 0, 85, 22, 50, 0, 1, 50, 0, 0, 85, 23, 50, 0, 0, 5, 3, 0, 119, 0, 6, 0, 134, 19, 0, 0, 152, 23, 0, 0, 0, 1, 27, 40, 38, 0, 0, 0, 0, 5, 19, 0, 82, 33, 0, 0, 38, 50, 33, 32, 0, 34, 50, 0, 32, 35, 34, 0, 1, 50, 255, 255, 125, 6, 35, 5, 50, 0, 0, 0, 20, 50, 33, 11, 0, 36, 50, 0, 85, 0, 36, 0, 32, 37, 39, 0, 120, 37, 4, 0, 134, 50, 0, 0, 212, 215, 0, 0, 0, 0, 0, 0, 0, 4, 6, 0, 137, 48, 0, 0, 139, 4, 0, 0, 140, 6, 43, 0, 0, 0, 0, 0, 1, 39, 0, 0, 136, 41, 0, 0, 0, 40, 41, 0, 25, 35, 1, 8, 82, 36, 35, 0, 134, 37, 0, 0, 100, 206, 0, 0, 0, 36, 5, 0, 121, 37, 7, 0, 1, 42, 0, 0, 134, 41, 0, 0, 92, 106, 0, 0, 42, 1, 2, 3, 4, 0, 0, 0, 119, 0, 72, 0, 25, 38, 1, 52, 78, 7, 38, 0, 25, 8, 1, 53, 78, 9, 8, 0, 25, 10, 0, 16, 25, 11, 0, 12, 82, 12, 11, 0, 25, 41, 0, 16, 41, 42, 12, 3, 3, 13, 41, 42, 1, 42, 0, 0, 83, 38, 42, 0, 1, 42, 0, 0, 83, 8, 42, 0, 134, 42, 0, 0, 228, 167, 0, 0, 10, 1, 2, 3, 4, 5, 0, 0, 1, 42, 1, 0, 15, 14, 42, 12, 121, 14, 49, 0, 25, 15, 0, 24, 25, 16, 1, 24, 25, 17, 1, 54, 25, 18, 0, 8, 0, 6, 15, 0, 78, 19, 17, 0, 41, 42, 19, 24, 42, 42, 42, 24, 32, 20, 42, 0, 120, 20, 2, 0, 119, 0, 38, 0, 78, 21, 38, 0, 41, 42, 21, 24, 42, 42, 42, 24, 32, 22, 42, 0, 121, 22, 12, 0, 78, 28, 8, 0, 41, 42, 28, 24, 42, 42, 42, 24, 32, 29, 42, 0, 120, 29, 15, 0, 82, 30, 18, 0, 38, 42, 30, 1, 0, 31, 42, 0, 32, 32, 31, 0, 121, 32, 10, 0, 119, 0, 22, 0, 82, 23, 16, 0, 32, 24, 23, 1, 120, 24, 19, 0, 82, 25, 18, 0, 38, 42, 25, 2, 0, 26, 42, 0, 32, 27, 26, 0, 120, 27, 14, 0, 1, 42, 0, 0, 83, 38, 42, 0, 1, 42, 0, 0, 83, 8, 42, 0, 134, 42, 0, 0, 228, 167, 0, 0, 6, 1, 2, 3, 4, 5, 0, 0, 25, 33, 6, 8, 16, 34, 33, 13, 121, 34, 3, 0, 0, 6, 33, 0, 119, 0, 214, 255, 83, 38, 7, 0, 83, 8, 9, 0, 139, 0, 0, 0, 140, 0, 46, 0, 0, 0, 0, 0, 1, 42, 0, 0, 136, 44, 0, 0, 0, 43, 44, 0, 136, 44, 0, 0, 25, 44, 44, 48, 137, 44, 0, 0, 130, 44, 0, 0, 136, 45, 0, 0, 49, 44, 44, 45, 100, 86, 0, 0, 1, 45, 48, 0, 135, 44, 0, 0, 45, 0, 0, 0, 25, 36, 43, 32, 25, 38, 43, 24, 25, 37, 43, 16, 0, 35, 43, 0, 25, 0, 43, 36, 134, 1, 0, 0, 120, 185, 0, 0, 1, 44, 0, 0, 13, 12, 1, 44, 120, 12, 84, 0, 82, 23, 1, 0, 1, 44, 0, 0, 13, 29, 23, 44, 120, 29, 80, 0, 25, 30, 23, 80, 25, 31, 23, 48, 0, 32, 31, 0, 0, 33, 32, 0, 82, 34, 33, 0, 25, 2, 32, 4, 0, 3, 2, 0, 82, 4, 3, 0, 1, 44, 0, 255, 19, 44, 34, 44, 0, 5, 44, 0, 2, 44, 0, 0, 0, 43, 43, 67, 13, 6, 5, 44, 2, 44, 0, 0, 71, 78, 76, 67, 13, 7, 4, 44, 19, 44, 6, 7, 0, 8, 44, 0, 120, 8, 7, 0, 1, 44, 153, 32, 85, 38, 44, 0, 1, 45, 103, 32, 134, 44, 0, 0, 120, 197, 0, 0, 45, 38, 0, 0, 2, 44, 0, 0, 1, 43, 43, 67, 13, 9, 34, 44, 2, 44, 0, 0, 71, 78, 76, 67, 13, 10, 4, 44, 19, 44, 9, 10, 0, 11, 44, 0, 121, 11, 5, 0, 25, 13, 23, 44, 82, 14, 13, 0, 0, 15, 14, 0, 119, 0, 2, 0, 0, 15, 30, 0, 85, 0, 15, 0, 82, 16, 23, 0, 25, 17, 16, 4, 82, 18, 17, 0, 1, 44, 240, 0, 82, 19, 44, 0, 25, 20, 19, 16, 82, 21, 20, 0, 38, 44, 21, 127, 1, 45, 240, 0, 135, 22, 13, 0, 44, 45, 16, 0, 121, 22, 19, 0, 82, 24, 0, 0, 82, 25, 24, 0, 25, 26, 25, 8, 82, 27, 26, 0, 38, 44, 27, 127, 135, 28, 8, 0, 44, 24, 0, 0, 1, 44, 153, 32, 85, 35, 44, 0, 25, 39, 35, 4, 85, 39, 18, 0, 25, 40, 35, 8, 85, 40, 28, 0, 1, 45, 17, 32, 134, 44, 0, 0, 120, 197, 0, 0, 45, 35, 0, 0, 119, 0, 9, 0, 1, 44, 153, 32, 85, 37, 44, 0, 25, 41, 37, 4, 85, 41, 18, 0, 1, 45, 62, 32, 134, 44, 0, 0, 120, 197, 0, 0, 45, 37, 0, 0, 1, 45, 141, 32, 134, 44, 0, 0, 120, 197, 0, 0, 45, 36, 0, 0, 139, 0, 0, 0, 140, 3, 47, 0, 0, 0, 0, 0, 1, 43, 0, 0, 136, 45, 0, 0, 0, 44, 45, 0, 25, 31, 2, 16, 82, 37, 31, 0, 1, 45, 0, 0, 13, 38, 37, 45, 121, 38, 12, 0, 134, 40, 0, 0, 56, 165, 0, 0, 2, 0, 0, 0, 32, 41, 40, 0, 121, 41, 5, 0, 82, 9, 31, 0, 0, 13, 9, 0, 1, 43, 5, 0, 119, 0, 6, 0, 1, 5, 0, 0, 119, 0, 4, 0, 0, 39, 37, 0, 0, 13, 39, 0, 1, 43, 5, 0, 32, 45, 43, 5, 121, 45, 66, 0, 25, 42, 2, 20, 82, 11, 42, 0, 4, 12, 13, 11, 16, 14, 12, 1, 0, 15, 11, 0, 121, 14, 8, 0, 25, 16, 2, 36, 82, 17, 16, 0, 38, 45, 17, 127, 135, 18, 13, 0, 45, 2, 0, 1, 0, 5, 18, 0, 119, 0, 53, 0, 25, 19, 2, 75, 78, 20, 19, 0, 1, 45, 255, 255, 41, 46, 20, 24, 42, 46, 46, 24, 15, 21, 45, 46, 121, 21, 35, 0, 0, 3, 1, 0, 32, 22, 3, 0, 121, 22, 6, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 119, 0, 31, 0, 26, 23, 3, 1, 3, 24, 0, 23, 78, 25, 24, 0, 41, 46, 25, 24, 42, 46, 46, 24, 32, 26, 46, 10, 120, 26, 3, 0, 0, 3, 23, 0, 119, 0, 241, 255, 25, 27, 2, 36, 82, 28, 27, 0, 38, 46, 28, 127, 135, 29, 13, 0, 46, 2, 0, 3, 16, 30, 29, 3, 121, 30, 3, 0, 0, 5, 29, 0, 119, 0, 20, 0, 3, 32, 0, 3, 4, 4, 1, 3, 82, 10, 42, 0, 0, 6, 3, 0, 0, 7, 32, 0, 0, 8, 4, 0, 0, 33, 10, 0, 119, 0, 5, 0, 1, 6, 0, 0, 0, 7, 0, 0, 0, 8, 1, 0, 0, 33, 15, 0, 135, 46, 14, 0, 33, 7, 8, 0, 82, 34, 42, 0, 3, 35, 34, 8, 85, 42, 35, 0, 3, 36, 6, 8, 0, 5, 36, 0, 139, 5, 0, 0, 140, 1, 42, 0, 0, 0, 0, 0, 2, 40, 0, 0, 149, 1, 0, 0, 1, 38, 0, 0, 136, 41, 0, 0, 0, 39, 41, 0, 1, 41, 0, 0, 13, 8, 0, 41, 121, 8, 68, 0, 1, 41, 84, 6, 82, 35, 41, 0, 1, 41, 0, 0, 13, 36, 35, 41, 121, 36, 3, 0, 1, 29, 0, 0, 119, 0, 7, 0, 1, 41, 84, 6, 82, 9, 41, 0, 134, 10, 0, 0, 92, 89, 0, 0, 9, 0, 0, 0, 0, 29, 10, 0, 134, 11, 0, 0, 4, 214, 0, 0, 82, 3, 11, 0, 1, 41, 0, 0, 13, 12, 3, 41, 121, 12, 3, 0, 0, 5, 29, 0, 119, 0, 43, 0, 0, 4, 3, 0, 0, 6, 29, 0, 25, 13, 4, 76, 82, 14, 13, 0, 1, 41, 255, 255, 15, 15, 41, 14, 121, 15, 6, 0, 134, 16, 0, 0, 236, 215, 0, 0, 4, 0, 0, 0, 0, 26, 16, 0, 119, 0, 2, 0, 1, 26, 0, 0, 25, 17, 4, 20, 82, 18, 17, 0, 25, 20, 4, 28, 82, 21, 20, 0, 16, 22, 21, 18, 121, 22, 8, 0, 134, 23, 0, 0, 12, 153, 0, 0, 4, 0, 0, 0, 20, 41, 23, 6, 0, 24, 41, 0, 0, 7, 24, 0, 119, 0, 2, 0, 0, 7, 6, 0, 32, 25, 26, 0, 120, 25, 4, 0, 134, 41, 0, 0, 212, 215, 0, 0, 4, 0, 0, 0, 25, 27, 4, 56, 82, 2, 27, 0, 1, 41, 0, 0, 13, 28, 2, 41, 121, 28, 3, 0, 0, 5, 7, 0, 119, 0, 4, 0, 0, 4, 2, 0, 0, 6, 7, 0, 119, 0, 217, 255, 134, 41, 0, 0, 24, 215, 0, 0, 0, 1, 5, 0, 119, 0, 25, 0, 25, 19, 0, 76, 82, 30, 19, 0, 1, 41, 255, 255, 15, 31, 41, 30, 120, 31, 6, 0, 134, 32, 0, 0, 12, 153, 0, 0, 0, 0, 0, 0, 0, 1, 32, 0, 119, 0, 15, 0, 134, 33, 0, 0, 236, 215, 0, 0, 0, 0, 0, 0, 32, 37, 33, 0, 134, 34, 0, 0, 12, 153, 0, 0, 0, 0, 0, 0, 121, 37, 3, 0, 0, 1, 34, 0, 119, 0, 5, 0, 134, 41, 0, 0, 212, 215, 0, 0, 0, 0, 0, 0, 0, 1, 34, 0, 139, 1, 0, 0, 140, 3, 45, 0, 0, 0, 0, 0, 1, 41, 0, 0, 136, 43, 0, 0, 0, 42, 43, 0, 136, 43, 0, 0, 25, 43, 43, 32, 137, 43, 0, 0, 130, 43, 0, 0, 136, 44, 0, 0, 49, 43, 43, 44, 48, 91, 0, 0, 1, 44, 32, 0, 135, 43, 0, 0, 44, 0, 0, 0, 0, 38, 42, 0, 25, 24, 42, 16, 85, 24, 1, 0, 25, 32, 24, 4, 25, 33, 0, 48, 82, 34, 33, 0, 33, 35, 34, 0, 38, 43, 35, 1, 0, 36, 43, 0, 4, 37, 2, 36, 85, 32, 37, 0, 25, 4, 24, 8, 25, 5, 0, 44, 82, 6, 5, 0, 85, 4, 6, 0, 25, 7, 24, 12, 85, 7, 34, 0, 25, 8, 0, 60, 82, 9, 8, 0, 0, 10, 24, 0, 85, 38, 9, 0, 25, 39, 38, 4, 85, 39, 10, 0, 25, 40, 38, 8, 1, 43, 2, 0, 85, 40, 43, 0, 1, 43, 145, 0, 135, 11, 15, 0, 43, 38, 0, 0, 134, 12, 0, 0, 20, 202, 0, 0, 11, 0, 0, 0, 34, 13, 12, 1, 121, 13, 11, 0, 38, 43, 12, 48, 0, 14, 43, 0, 40, 43, 14, 16, 0, 15, 43, 0, 82, 16, 0, 0, 20, 43, 16, 15, 0, 17, 43, 0, 85, 0, 17, 0, 0, 3, 12, 0, 119, 0, 25, 0, 82, 18, 32, 0, 16, 19, 18, 12, 121, 19, 21, 0, 4, 20, 12, 18, 82, 21, 5, 0, 25, 22, 0, 4, 85, 22, 21, 0, 3, 23, 21, 20, 25, 25, 0, 8, 85, 25, 23, 0, 82, 26, 33, 0, 32, 27, 26, 0, 121, 27, 3, 0, 0, 3, 2, 0, 119, 0, 10, 0, 25, 28, 21, 1, 85, 22, 28, 0, 78, 29, 21, 0, 26, 30, 2, 1, 3, 31, 1, 30, 83, 31, 29, 0, 0, 3, 2, 0, 119, 0, 2, 0, 0, 3, 12, 0, 137, 42, 0, 0, 139, 3, 0, 0, 140, 3, 24, 0, 0, 0, 0, 0, 2, 21, 0, 0, 74, 1, 0, 0, 1, 19, 0, 0, 136, 22, 0, 0, 0, 20, 22, 0, 136, 22, 0, 0, 25, 22, 22, 48, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 140, 92, 0, 0, 1, 23, 48, 0, 135, 22, 0, 0, 23, 0, 0, 0, 25, 13, 20, 24, 25, 12, 20, 16, 0, 11, 20, 0, 13, 4, 0, 1, 121, 4, 3, 0, 1, 3, 234, 255, 119, 0, 67, 0, 2, 22, 0, 0, 0, 0, 8, 0, 19, 22, 2, 22, 0, 5, 22, 0, 33, 6, 5, 0, 121, 6, 38, 0, 85, 11, 0, 0, 25, 14, 11, 4, 85, 14, 1, 0, 25, 17, 11, 8, 85, 17, 2, 0, 135, 7, 16, 0, 21, 11, 0, 0, 1, 22, 218, 255, 1, 23, 23, 0, 138, 7, 22, 23, 76, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 68, 93, 0, 0, 80, 93, 0, 0, 0, 3, 7, 0, 119, 0, 26, 0, 119, 0, 2, 0, 119, 0, 220, 255, 85, 12, 0, 0, 25, 18, 12, 4, 85, 18, 1, 0, 1, 22, 63, 0, 135, 8, 17, 0, 22, 12, 0, 0, 32, 9, 8, 240, 120, 9, 249, 255, 119, 0, 1, 0, 121, 6, 13, 0, 85, 13, 1, 0, 25, 15, 13, 4, 1, 22, 2, 0, 85, 15, 22, 0, 25, 16, 13, 8, 1, 22, 1, 0, 85, 16, 22, 0, 1, 23, 221, 0, 135, 22, 5, 0, 23, 13, 0, 0, 0, 3, 8, 0, 119, 0, 2, 0, 0, 3, 8, 0, 134, 10, 0, 0, 20, 202, 0, 0, 3, 0, 0, 0, 137, 20, 0, 0, 139, 10, 0, 0, 140, 1, 34, 0, 0, 0, 0, 0, 2, 28, 0, 0, 192, 8, 0, 0, 1, 26, 0, 0, 136, 29, 0, 0, 0, 27, 29, 0, 1, 29, 156, 3, 85, 0, 29, 0, 1, 29, 4, 35, 82, 2, 29, 0, 1, 29, 0, 0, 13, 13, 2, 29, 121, 13, 5, 0, 1, 29, 4, 35, 1, 30, 8, 35, 85, 29, 30, 0, 119, 0, 27, 0, 1, 30, 8, 35, 13, 19, 2, 30, 120, 19, 24, 0, 1, 30, 0, 0, 132, 1, 0, 30, 1, 29, 102, 0, 1, 31, 248, 19, 1, 32, 12, 20, 1, 33, 91, 0, 135, 30, 18, 0, 29, 31, 32, 33, 130, 30, 1, 0, 0, 20, 30, 0, 1, 30, 0, 0, 132, 1, 0, 30, 38, 30, 20, 1, 0, 21, 30, 0, 121, 21, 9, 0, 135, 17, 19, 0, 128, 30, 0, 0, 0, 18, 30, 0, 134, 30, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 30, 20, 0, 17, 0, 0, 0, 25, 22, 0, 8, 82, 23, 22, 0, 1, 30, 0, 0, 13, 24, 23, 30, 120, 24, 20, 0, 1, 30, 0, 35, 82, 25, 30, 0, 13, 3, 25, 0, 121, 3, 6, 0, 25, 4, 0, 4, 82, 5, 4, 0, 1, 30, 0, 35, 85, 30, 5, 0, 119, 0, 11, 0, 0, 1, 25, 0, 25, 6, 1, 4, 82, 7, 6, 0, 13, 8, 7, 0, 120, 8, 3, 0, 0, 1, 7, 0, 119, 0, 251, 255, 25, 9, 0, 4, 82, 10, 9, 0, 85, 6, 10, 0, 1, 30, 4, 35, 82, 11, 30, 0, 1, 30, 0, 0, 13, 12, 11, 30, 121, 12, 8, 0, 1, 30, 4, 35, 1, 33, 8, 35, 85, 30, 33, 0, 134, 33, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 1, 33, 8, 35, 13, 14, 11, 33, 121, 14, 5, 0, 134, 33, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 1, 33, 0, 0, 132, 1, 0, 33, 1, 30, 102, 0, 1, 32, 248, 19, 1, 31, 12, 20, 1, 29, 91, 0, 135, 33, 18, 0, 30, 32, 31, 29, 130, 33, 1, 0, 0, 15, 33, 0, 1, 33, 0, 0, 132, 1, 0, 33, 38, 33, 15, 1, 0, 16, 33, 0, 121, 16, 10, 0, 135, 17, 19, 0, 128, 33, 0, 0, 0, 18, 33, 0, 134, 33, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 33, 20, 0, 17, 0, 0, 0, 119, 0, 5, 0, 134, 33, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 29, 0, 0, 0, 0, 0, 1, 25, 0, 0, 136, 27, 0, 0, 0, 26, 27, 0, 136, 27, 0, 0, 25, 27, 27, 48, 137, 27, 0, 0, 130, 27, 0, 0, 136, 28, 0, 0, 49, 27, 27, 28, 208, 95, 0, 0, 1, 28, 48, 0, 135, 27, 0, 0, 28, 0, 0, 0, 25, 20, 26, 32, 25, 19, 26, 16, 0, 18, 26, 0, 78, 9, 1, 0, 41, 27, 9, 24, 42, 27, 27, 24, 0, 10, 27, 0, 1, 27, 13, 32, 1, 28, 4, 0, 134, 17, 0, 0, 80, 63, 0, 0, 27, 10, 28, 0, 1, 28, 0, 0, 13, 11, 17, 28, 121, 11, 7, 0, 134, 12, 0, 0, 64, 209, 0, 0, 1, 28, 22, 0, 85, 12, 28, 0, 1, 2, 0, 0, 119, 0, 54, 0, 134, 13, 0, 0, 80, 169, 0, 0, 1, 0, 0, 0, 0, 14, 0, 0, 2, 28, 0, 0, 0, 128, 0, 0, 20, 28, 13, 28, 0, 15, 28, 0, 85, 18, 14, 0, 25, 21, 18, 4, 85, 21, 15, 0, 25, 22, 18, 8, 1, 28, 182, 1, 85, 22, 28, 0, 1, 28, 5, 0, 135, 16, 21, 0, 28, 18, 0, 0, 134, 3, 0, 0, 20, 202, 0, 0, 16, 0, 0, 0, 34, 4, 3, 0, 121, 4, 3, 0, 1, 2, 0, 0, 119, 0, 30, 0, 2, 28, 0, 0, 0, 0, 8, 0, 19, 28, 13, 28, 0, 5, 28, 0, 32, 6, 5, 0, 120, 6, 11, 0, 85, 19, 3, 0, 25, 23, 19, 4, 1, 28, 2, 0, 85, 23, 28, 0, 25, 24, 19, 8, 1, 28, 1, 0, 85, 24, 28, 0, 1, 27, 221, 0, 135, 28, 5, 0, 27, 19, 0, 0, 134, 7, 0, 0, 124, 60, 0, 0, 3, 1, 0, 0, 1, 28, 0, 0, 13, 8, 7, 28, 121, 8, 7, 0, 85, 20, 3, 0, 1, 27, 6, 0, 135, 28, 22, 0, 27, 20, 0, 0, 1, 2, 0, 0, 119, 0, 2, 0, 0, 2, 7, 0, 137, 26, 0, 0, 139, 2, 0, 0, 140, 4, 37, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 35, 0, 0, 0, 32, 35, 0, 136, 35, 0, 0, 1, 36, 128, 0, 3, 35, 35, 36, 137, 35, 0, 0, 130, 35, 0, 0, 136, 36, 0, 0, 49, 35, 35, 36, 64, 97, 0, 0, 1, 36, 128, 0, 135, 35, 0, 0, 36, 0, 0, 0, 25, 24, 32, 124, 0, 25, 32, 0, 0, 30, 25, 0, 1, 33, 88, 6, 25, 34, 30, 124, 82, 35, 33, 0, 85, 30, 35, 0, 25, 30, 30, 4, 25, 33, 33, 4, 54, 35, 30, 34, 84, 97, 0, 0, 26, 26, 1, 1, 2, 35, 0, 0, 254, 255, 255, 127, 16, 27, 35, 26, 121, 27, 13, 0, 32, 28, 1, 0, 121, 28, 5, 0, 0, 6, 24, 0, 1, 7, 1, 0, 1, 31, 4, 0, 119, 0, 10, 0, 134, 29, 0, 0, 64, 209, 0, 0, 1, 35, 75, 0, 85, 29, 35, 0, 1, 5, 255, 255, 119, 0, 4, 0, 0, 6, 0, 0, 0, 7, 1, 0, 1, 31, 4, 0, 32, 35, 31, 4, 121, 35, 35, 0, 0, 8, 6, 0, 1, 35, 254, 255, 4, 9, 35, 8, 16, 10, 9, 7, 125, 4, 10, 9, 7, 0, 0, 0, 25, 11, 25, 48, 85, 11, 4, 0, 25, 12, 25, 20, 85, 12, 6, 0, 25, 13, 25, 44, 85, 13, 6, 0, 3, 14, 6, 4, 25, 15, 25, 16, 85, 15, 14, 0, 25, 16, 25, 28, 85, 16, 14, 0, 134, 17, 0, 0, 172, 82, 0, 0, 25, 2, 3, 0, 32, 18, 4, 0, 121, 18, 3, 0, 0, 5, 17, 0, 119, 0, 11, 0, 82, 19, 12, 0, 82, 20, 15, 0, 13, 21, 19, 20, 41, 35, 21, 31, 42, 35, 35, 31, 0, 22, 35, 0, 3, 23, 19, 22, 1, 35, 0, 0, 83, 23, 35, 0, 0, 5, 17, 0, 137, 32, 0, 0, 139, 5, 0, 0, 140, 2, 29, 0, 0, 0, 0, 0, 1, 24, 0, 0, 136, 26, 0, 0, 0, 25, 26, 0, 136, 26, 0, 0, 25, 26, 26, 16, 137, 26, 0, 0, 130, 26, 0, 0, 136, 27, 0, 0, 49, 26, 26, 27, 144, 98, 0, 0, 1, 27, 16, 0, 135, 26, 0, 0, 27, 0, 0, 0, 0, 23, 25, 0, 1, 26, 172, 3, 85, 0, 26, 0, 25, 12, 0, 4, 1, 27, 0, 0, 134, 26, 0, 0, 60, 164, 0, 0, 12, 1, 27, 0, 1, 26, 248, 3, 85, 0, 26, 0, 25, 16, 0, 4, 1, 26, 88, 4, 85, 16, 26, 0, 25, 17, 0, 20, 1, 26, 0, 0, 85, 17, 26, 0, 1, 26, 0, 0, 132, 1, 0, 26, 1, 26, 103, 0, 1, 27, 50, 21, 135, 18, 23, 0, 26, 0, 27, 0, 130, 27, 1, 0, 0, 19, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 38, 27, 19, 1, 0, 20, 27, 0, 120, 20, 48, 0, 85, 17, 18, 0, 1, 27, 0, 0, 13, 21, 18, 27, 120, 21, 15, 0, 1, 27, 0, 0, 132, 1, 0, 27, 1, 26, 104, 0, 135, 27, 24, 0, 26, 18, 0, 0, 130, 27, 1, 0, 0, 22, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 38, 27, 22, 1, 0, 2, 27, 0, 120, 2, 32, 0, 137, 25, 0, 0, 139, 0, 0, 0, 1, 27, 0, 0, 132, 1, 0, 27, 1, 27, 105, 0, 135, 7, 25, 0, 27, 0, 0, 0, 130, 27, 1, 0, 0, 8, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 38, 27, 8, 1, 0, 9, 27, 0, 120, 9, 18, 0, 82, 10, 7, 0, 1, 27, 0, 0, 132, 1, 0, 27, 85, 23, 10, 0, 1, 26, 106, 0, 1, 28, 53, 21, 135, 27, 26, 0, 26, 28, 23, 0, 130, 27, 1, 0, 0, 11, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 38, 27, 11, 1, 0, 13, 27, 0, 120, 13, 3, 0, 137, 25, 0, 0, 139, 0, 0, 0, 135, 3, 19, 0, 128, 27, 0, 0, 0, 4, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 1, 28, 64, 0, 135, 27, 24, 0, 28, 12, 0, 0, 130, 27, 1, 0, 0, 5, 27, 0, 1, 27, 0, 0, 132, 1, 0, 27, 38, 27, 5, 1, 0, 6, 27, 0, 121, 6, 10, 0, 1, 27, 0, 0, 135, 14, 27, 0, 27, 0, 0, 0, 128, 27, 0, 0, 0, 15, 27, 0, 134, 27, 0, 0, 248, 209, 0, 0, 14, 0, 0, 0, 119, 0, 3, 0, 135, 27, 20, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 5, 33, 0, 0, 0, 0, 0, 1, 29, 0, 0, 136, 31, 0, 0, 0, 30, 31, 0, 25, 24, 1, 8, 82, 25, 24, 0, 134, 26, 0, 0, 100, 206, 0, 0, 0, 25, 4, 0, 121, 26, 6, 0, 1, 32, 0, 0, 134, 31, 0, 0, 16, 187, 0, 0, 32, 1, 2, 3, 119, 0, 40, 0, 82, 27, 1, 0, 134, 28, 0, 0, 100, 206, 0, 0, 0, 27, 4, 0, 121, 28, 35, 0, 25, 5, 1, 16, 82, 6, 5, 0, 13, 7, 6, 2, 25, 8, 1, 32, 120, 7, 26, 0, 25, 9, 1, 20, 82, 10, 9, 0, 13, 11, 10, 2, 120, 11, 22, 0, 85, 8, 3, 0, 85, 9, 2, 0, 25, 13, 1, 40, 82, 14, 13, 0, 25, 15, 14, 1, 85, 13, 15, 0, 25, 16, 1, 36, 82, 17, 16, 0, 32, 18, 17, 1, 121, 18, 8, 0, 25, 19, 1, 24, 82, 20, 19, 0, 32, 21, 20, 2, 121, 21, 4, 0, 25, 22, 1, 54, 1, 31, 1, 0, 83, 22, 31, 0, 25, 23, 1, 44, 1, 31, 4, 0, 85, 23, 31, 0, 119, 0, 5, 0, 32, 12, 3, 1, 121, 12, 3, 0, 1, 31, 1, 0, 85, 8, 31, 0, 139, 0, 0, 0, 140, 2, 40, 0, 0, 0, 0, 0, 1, 36, 0, 0, 136, 38, 0, 0, 0, 37, 38, 0, 32, 12, 1, 10, 25, 23, 0, 26, 80, 30, 23, 0, 121, 12, 25, 0, 25, 31, 0, 24, 1, 38, 0, 0, 84, 31, 38, 0, 25, 38, 30, 1, 41, 38, 38, 16, 42, 38, 38, 16, 0, 32, 38, 0, 84, 23, 32, 0, 2, 38, 0, 0, 255, 255, 0, 0, 19, 38, 32, 38, 0, 33, 38, 0, 82, 34, 0, 0, 25, 35, 34, 92, 82, 2, 35, 0, 38, 38, 2, 127, 135, 3, 8, 0, 38, 0, 0, 0, 15, 4, 33, 3, 121, 4, 2, 0, 139, 1, 0, 0, 1, 38, 0, 0, 84, 23, 38, 0, 139, 1, 0, 0, 82, 5, 0, 0, 25, 6, 5, 88, 82, 7, 6, 0, 25, 8, 0, 24, 80, 9, 8, 0, 2, 38, 0, 0, 255, 255, 0, 0, 19, 38, 9, 38, 0, 10, 38, 0, 2, 38, 0, 0, 255, 255, 0, 0, 19, 38, 30, 38, 0, 11, 38, 0, 38, 39, 7, 127, 135, 38, 9, 0, 39, 0, 10, 11, 1, 0, 0, 0, 80, 13, 8, 0, 25, 38, 13, 1, 41, 38, 38, 16, 42, 38, 38, 16, 0, 14, 38, 0, 84, 8, 14, 0, 2, 38, 0, 0, 255, 255, 0, 0, 19, 38, 14, 38, 0, 15, 38, 0, 82, 16, 0, 0, 25, 17, 16, 96, 82, 18, 17, 0, 38, 38, 18, 127, 135, 19, 8, 0, 38, 0, 0, 0, 15, 20, 15, 19, 121, 20, 2, 0, 139, 1, 0, 0, 1, 38, 0, 0, 84, 8, 38, 0, 80, 21, 23, 0, 25, 38, 21, 1, 41, 38, 38, 16, 42, 38, 38, 16, 0, 22, 38, 0, 84, 23, 22, 0, 2, 38, 0, 0, 255, 255, 0, 0, 19, 38, 22, 38, 0, 24, 38, 0, 82, 25, 0, 0, 25, 26, 25, 92, 82, 27, 26, 0, 38, 38, 27, 127, 135, 28, 8, 0, 38, 0, 0, 0, 15, 29, 24, 28, 121, 29, 2, 0, 139, 1, 0, 0, 1, 38, 0, 0, 84, 23, 38, 0, 139, 1, 0, 0, 140, 2, 36, 0, 0, 0, 0, 0, 1, 33, 0, 0, 136, 35, 0, 0, 0, 34, 35, 0, 25, 13, 1, 76, 82, 24, 13, 0, 34, 27, 24, 0, 1, 35, 255, 0, 19, 35, 0, 35, 0, 28, 35, 0, 1, 35, 255, 0, 19, 35, 0, 35, 0, 29, 35, 0, 121, 27, 3, 0, 1, 33, 3, 0, 119, 0, 39, 0, 134, 30, 0, 0, 236, 215, 0, 0, 1, 0, 0, 0, 32, 31, 30, 0, 121, 31, 3, 0, 1, 33, 3, 0, 119, 0, 32, 0, 25, 14, 1, 75, 78, 15, 14, 0, 41, 35, 15, 24, 42, 35, 35, 24, 0, 16, 35, 0, 13, 17, 29, 16, 121, 17, 3, 0, 1, 33, 10, 0, 119, 0, 13, 0, 25, 18, 1, 20, 82, 19, 18, 0, 25, 20, 1, 16, 82, 21, 20, 0, 16, 22, 19, 21, 121, 22, 6, 0, 25, 23, 19, 1, 85, 18, 23, 0, 83, 19, 28, 0, 0, 26, 29, 0, 119, 0, 2, 0, 1, 33, 10, 0, 32, 35, 33, 10, 121, 35, 5, 0, 134, 25, 0, 0, 12, 111, 0, 0, 1, 0, 0, 0, 0, 26, 25, 0, 134, 35, 0, 0, 212, 215, 0, 0, 1, 0, 0, 0, 0, 2, 26, 0, 32, 35, 33, 3, 121, 35, 23, 0, 25, 32, 1, 75, 78, 3, 32, 0, 41, 35, 3, 24, 42, 35, 35, 24, 0, 4, 35, 0, 13, 5, 29, 4, 120, 5, 12, 0, 25, 6, 1, 20, 82, 7, 6, 0, 25, 8, 1, 16, 82, 9, 8, 0, 16, 10, 7, 9, 121, 10, 6, 0, 25, 11, 7, 1, 85, 6, 11, 0, 83, 7, 28, 0, 0, 2, 29, 0, 119, 0, 5, 0, 134, 12, 0, 0, 12, 111, 0, 0, 1, 0, 0, 0, 0, 2, 12, 0, 139, 2, 0, 0, 140, 2, 42, 0, 0, 0, 0, 0, 1, 38, 0, 0, 136, 40, 0, 0, 0, 39, 40, 0, 32, 12, 1, 10, 25, 23, 0, 64, 82, 32, 23, 0, 121, 12, 34, 0, 25, 33, 0, 60, 1, 40, 0, 0, 85, 33, 40, 0, 25, 34, 0, 48, 82, 35, 34, 0, 25, 36, 35, 2, 78, 37, 36, 0, 1, 40, 255, 0, 19, 40, 37, 40, 0, 2, 40, 0, 3, 3, 2, 32, 85, 23, 3, 0, 82, 4, 0, 0, 1, 40, 128, 0, 3, 5, 4, 40, 82, 6, 5, 0, 38, 40, 6, 127, 135, 7, 8, 0, 40, 0, 0, 0, 82, 8, 34, 0, 25, 9, 8, 2, 78, 10, 9, 0, 1, 40, 255, 0, 19, 40, 10, 40, 0, 11, 40, 0, 4, 13, 7, 11, 16, 14, 3, 13, 121, 14, 2, 0, 139, 1, 0, 0, 1, 40, 0, 0, 85, 23, 40, 0, 139, 1, 0, 0, 119, 0, 31, 0, 82, 15, 0, 0, 25, 16, 15, 88, 82, 17, 16, 0, 25, 18, 0, 60, 82, 19, 18, 0, 38, 41, 17, 127, 135, 40, 9, 0, 41, 0, 19, 32, 1, 0, 0, 0, 1, 40, 72, 16, 3, 20, 0, 40, 82, 21, 20, 0, 32, 22, 21, 0, 121, 22, 2, 0, 139, 1, 0, 0, 1, 40, 76, 16, 3, 24, 0, 40, 82, 25, 24, 0, 1, 40, 80, 16, 3, 26, 0, 40, 82, 27, 26, 0, 1, 40, 84, 16, 3, 28, 0, 40, 82, 29, 28, 0, 25, 30, 0, 68, 1, 40, 0, 0, 135, 31, 28, 0, 40, 25, 27, 29, 30, 0, 0, 0, 139, 1, 0, 0, 1, 40, 0, 0, 139, 40, 0, 0, 140, 7, 37, 0, 0, 0, 0, 0, 1, 32, 0, 0, 136, 34, 0, 0, 0, 33, 34, 0, 134, 34, 0, 0, 88, 162, 0, 0, 0, 6, 0, 0, 1, 34, 120, 1, 85, 0, 34, 0, 25, 29, 0, 4, 1, 34, 24, 2, 85, 29, 34, 0, 1, 34, 76, 16, 3, 30, 0, 34, 85, 30, 1, 0, 1, 34, 80, 16, 3, 31, 0, 34, 85, 31, 3, 0, 1, 34, 84, 16, 3, 7, 0, 34, 85, 7, 2, 0, 1, 34, 1, 0, 135, 8, 29, 0, 34, 1, 3, 2, 25, 9, 0, 56, 1, 34, 1, 0, 85, 9, 34, 0, 25, 10, 0, 52, 1, 34, 0, 0, 85, 10, 34, 0, 25, 11, 0, 60, 1, 34, 0, 0, 85, 11, 34, 0, 25, 12, 0, 68, 1, 35, 0, 0, 1, 36, 0, 16, 135, 34, 2, 0, 12, 35, 36, 0, 82, 13, 0, 0, 25, 14, 13, 108, 82, 15, 14, 0, 1, 34, 0, 0, 132, 1, 0, 34, 1, 36, 0, 0, 1, 35, 0, 0, 135, 34, 18, 0, 15, 0, 36, 35, 130, 34, 1, 0, 0, 16, 34, 0, 1, 34, 0, 0, 132, 1, 0, 34, 38, 34, 16, 1, 0, 17, 34, 0, 120, 17, 12, 0, 25, 18, 0, 48, 1, 34, 2, 8, 85, 18, 34, 0, 82, 19, 30, 0, 82, 20, 31, 0, 82, 21, 7, 0, 1, 34, 0, 0, 135, 22, 28, 0, 34, 19, 20, 21, 12, 0, 0, 0, 139, 0, 0, 0, 135, 23, 19, 0, 128, 34, 0, 0, 0, 24, 34, 0, 1, 34, 0, 0, 132, 1, 0, 34, 1, 35, 1, 0, 135, 34, 24, 0, 35, 0, 0, 0, 130, 34, 1, 0, 0, 25, 34, 0, 1, 34, 0, 0, 132, 1, 0, 34, 38, 34, 25, 1, 0, 26, 34, 0, 121, 26, 10, 0, 1, 34, 0, 0, 135, 27, 27, 0, 34, 0, 0, 0, 128, 34, 0, 0, 0, 28, 34, 0, 134, 34, 0, 0, 248, 209, 0, 0, 27, 0, 0, 0, 119, 0, 3, 0, 135, 34, 20, 0, 23, 0, 0, 0, 139, 0, 0, 0, 140, 5, 34, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 33, 0, 0, 0, 32, 33, 0, 25, 24, 1, 53, 1, 33, 1, 0, 83, 24, 33, 0, 25, 25, 1, 4, 82, 26, 25, 0, 13, 27, 26, 3, 121, 27, 50, 0, 25, 28, 1, 52, 1, 33, 1, 0, 83, 28, 33, 0, 25, 5, 1, 16, 82, 6, 5, 0, 1, 33, 0, 0, 13, 7, 6, 33, 25, 8, 1, 54, 25, 9, 1, 48, 25, 10, 1, 24, 25, 11, 1, 36, 121, 7, 15, 0, 85, 5, 2, 0, 85, 10, 4, 0, 1, 33, 1, 0, 85, 11, 33, 0, 82, 12, 9, 0, 32, 13, 12, 1, 32, 14, 4, 1, 19, 33, 13, 14, 0, 29, 33, 0, 120, 29, 2, 0, 119, 0, 27, 0, 1, 33, 1, 0, 83, 8, 33, 0, 119, 0, 24, 0, 13, 15, 6, 2, 120, 15, 7, 0, 82, 22, 11, 0, 25, 23, 22, 1, 85, 11, 23, 0, 1, 33, 1, 0, 83, 8, 33, 0, 119, 0, 16, 0, 82, 16, 10, 0, 32, 17, 16, 2, 121, 17, 4, 0, 85, 10, 4, 0, 0, 21, 4, 0, 119, 0, 2, 0, 0, 21, 16, 0, 82, 18, 9, 0, 32, 19, 18, 1, 32, 20, 21, 1, 19, 33, 19, 20, 0, 30, 33, 0, 121, 30, 3, 0, 1, 33, 1, 0, 83, 8, 33, 0, 139, 0, 0, 0, 140, 3, 40, 0, 0, 0, 0, 0, 2, 37, 0, 0, 255, 0, 0, 0, 1, 35, 0, 0, 136, 38, 0, 0, 0, 36, 38, 0, 1, 38, 0, 0, 16, 28, 38, 1, 1, 38, 255, 255, 16, 29, 38, 0, 32, 30, 1, 0, 19, 38, 30, 29, 0, 31, 38, 0, 20, 38, 28, 31, 0, 32, 38, 0, 121, 32, 41, 0, 0, 6, 2, 0, 0, 33, 0, 0, 0, 34, 1, 0, 1, 38, 10, 0, 1, 39, 0, 0, 134, 9, 0, 0, 92, 195, 0, 0, 33, 34, 38, 39, 128, 39, 0, 0, 0, 10, 39, 0, 19, 39, 9, 37, 0, 11, 39, 0, 39, 39, 11, 48, 0, 12, 39, 0, 26, 13, 6, 1, 83, 13, 12, 0, 1, 39, 10, 0, 1, 38, 0, 0, 134, 14, 0, 0, 0, 207, 0, 0, 33, 34, 39, 38, 128, 38, 0, 0, 0, 15, 38, 0, 1, 38, 9, 0, 16, 16, 38, 34, 1, 38, 255, 255, 16, 17, 38, 33, 32, 18, 34, 9, 19, 38, 18, 17, 0, 19, 38, 0, 20, 38, 16, 19, 0, 20, 38, 0, 121, 20, 5, 0, 0, 6, 13, 0, 0, 33, 14, 0, 0, 34, 15, 0, 119, 0, 223, 255, 0, 3, 14, 0, 0, 5, 13, 0, 119, 0, 3, 0, 0, 3, 0, 0, 0, 5, 2, 0, 32, 21, 3, 0, 121, 21, 3, 0, 0, 7, 5, 0, 119, 0, 22, 0, 0, 4, 3, 0, 0, 8, 5, 0, 31, 38, 4, 10, 38, 38, 38, 255, 0, 22, 38, 0, 39, 38, 22, 48, 0, 23, 38, 0, 19, 38, 23, 37, 0, 24, 38, 0, 26, 25, 8, 1, 83, 25, 24, 0, 29, 38, 4, 10, 38, 38, 38, 255, 0, 26, 38, 0, 35, 27, 4, 10, 121, 27, 3, 0, 0, 7, 25, 0, 119, 0, 4, 0, 0, 4, 26, 0, 0, 8, 25, 0, 119, 0, 238, 255, 139, 7, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 24, 0, 0, 136, 27, 0, 0, 0, 25, 27, 0, 136, 27, 0, 0, 25, 27, 27, 64, 137, 27, 0, 0, 130, 27, 0, 0, 136, 28, 0, 0, 49, 27, 27, 28, 228, 108, 0, 0, 1, 28, 64, 0, 135, 27, 0, 0, 28, 0, 0, 0, 0, 16, 25, 0, 1, 27, 0, 0, 134, 17, 0, 0, 100, 206, 0, 0, 0, 1, 27, 0, 121, 17, 3, 0, 1, 4, 1, 0, 119, 0, 54, 0, 1, 27, 0, 0, 13, 18, 1, 27, 121, 18, 3, 0, 1, 4, 0, 0, 119, 0, 49, 0, 1, 27, 8, 1, 1, 28, 248, 0, 1, 29, 0, 0, 134, 19, 0, 0, 64, 76, 0, 0, 1, 27, 28, 29, 1, 29, 0, 0, 13, 20, 19, 29, 121, 20, 3, 0, 1, 4, 0, 0, 119, 0, 38, 0, 25, 21, 16, 4, 0, 23, 21, 0, 25, 26, 23, 52, 1, 29, 0, 0, 85, 23, 29, 0, 25, 23, 23, 4, 54, 29, 23, 26, 80, 109, 0, 0, 85, 16, 19, 0, 25, 22, 16, 8, 85, 22, 0, 0, 25, 5, 16, 12, 1, 29, 255, 255, 85, 5, 29, 0, 25, 6, 16, 48, 1, 29, 1, 0, 85, 6, 29, 0, 82, 7, 19, 0, 25, 8, 7, 28, 82, 9, 8, 0, 82, 10, 2, 0, 38, 28, 9, 127, 1, 27, 1, 0, 135, 29, 9, 0, 28, 19, 16, 10, 27, 0, 0, 0, 25, 11, 16, 24, 82, 12, 11, 0, 32, 13, 12, 1, 121, 13, 6, 0, 25, 14, 16, 16, 82, 15, 14, 0, 85, 2, 15, 0, 1, 3, 1, 0, 119, 0, 2, 0, 1, 3, 0, 0, 0, 4, 3, 0, 137, 25, 0, 0, 139, 4, 0, 0, 140, 1, 34, 0, 0, 0, 0, 0, 1, 31, 0, 0, 136, 33, 0, 0, 0, 32, 33, 0, 25, 2, 0, 76, 82, 13, 2, 0, 1, 33, 255, 255, 15, 24, 33, 13, 121, 24, 6, 0, 134, 25, 0, 0, 236, 215, 0, 0, 0, 0, 0, 0, 0, 23, 25, 0, 119, 0, 2, 0, 1, 23, 0, 0, 134, 33, 0, 0, 16, 176, 0, 0, 0, 0, 0, 0, 82, 26, 0, 0, 38, 33, 26, 1, 0, 27, 33, 0, 33, 28, 27, 0, 120, 28, 25, 0, 134, 29, 0, 0, 4, 214, 0, 0, 25, 30, 0, 52, 82, 3, 30, 0, 1, 33, 0, 0, 13, 4, 3, 33, 0, 5, 3, 0, 25, 1, 0, 56, 120, 4, 4, 0, 82, 6, 1, 0, 25, 7, 3, 56, 85, 7, 6, 0, 82, 8, 1, 0, 1, 33, 0, 0, 13, 9, 8, 33, 120, 9, 3, 0, 25, 10, 8, 52, 85, 10, 5, 0, 82, 11, 29, 0, 13, 12, 11, 0, 121, 12, 2, 0, 85, 29, 8, 0, 134, 33, 0, 0, 24, 215, 0, 0, 134, 14, 0, 0, 92, 89, 0, 0, 0, 0, 0, 0, 25, 15, 0, 12, 82, 16, 15, 0, 38, 33, 16, 127, 135, 17, 8, 0, 33, 0, 0, 0, 20, 33, 17, 14, 0, 18, 33, 0, 25, 19, 0, 92, 82, 20, 19, 0, 1, 33, 0, 0, 13, 21, 20, 33, 120, 21, 3, 0, 135, 33, 30, 0, 20, 0, 0, 0, 121, 28, 7, 0, 32, 22, 23, 0, 120, 22, 7, 0, 134, 33, 0, 0, 212, 215, 0, 0, 0, 0, 0, 0, 119, 0, 3, 0, 135, 33, 30, 0, 0, 0, 0, 0, 139, 18, 0, 0, 140, 2, 32, 0, 0, 0, 0, 0, 2, 29, 0, 0, 255, 0, 0, 0, 1, 27, 0, 0, 136, 30, 0, 0, 0, 28, 30, 0, 136, 30, 0, 0, 25, 30, 30, 16, 137, 30, 0, 0, 130, 30, 0, 0, 136, 31, 0, 0, 49, 30, 30, 31, 80, 111, 0, 0, 1, 31, 16, 0, 135, 30, 0, 0, 31, 0, 0, 0, 0, 14, 28, 0, 19, 30, 1, 29, 0, 20, 30, 0, 83, 14, 20, 0, 25, 21, 0, 16, 82, 22, 21, 0, 1, 30, 0, 0, 13, 23, 22, 30, 121, 23, 12, 0, 134, 24, 0, 0, 56, 165, 0, 0, 0, 0, 0, 0, 32, 25, 24, 0, 121, 25, 5, 0, 82, 3, 21, 0, 0, 6, 3, 0, 1, 27, 4, 0, 119, 0, 5, 0, 1, 2, 255, 255, 119, 0, 3, 0, 0, 6, 22, 0, 1, 27, 4, 0, 32, 30, 27, 4, 121, 30, 33, 0, 25, 26, 0, 20, 82, 4, 26, 0, 16, 5, 4, 6, 121, 5, 15, 0, 19, 30, 1, 29, 0, 7, 30, 0, 25, 8, 0, 75, 78, 9, 8, 0, 41, 30, 9, 24, 42, 30, 30, 24, 0, 10, 30, 0, 13, 11, 7, 10, 120, 11, 6, 0, 25, 12, 4, 1, 85, 26, 12, 0, 83, 4, 20, 0, 0, 2, 7, 0, 119, 0, 15, 0, 25, 13, 0, 36, 82, 15, 13, 0, 38, 30, 15, 127, 1, 31, 1, 0, 135, 16, 13, 0, 30, 0, 14, 31, 32, 17, 16, 1, 121, 17, 6, 0, 78, 18, 14, 0, 19, 30, 18, 29, 0, 19, 30, 0, 0, 2, 19, 0, 119, 0, 2, 0, 1, 2, 255, 255, 137, 28, 0, 0, 139, 2, 0, 0, 140, 4, 23, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 25, 13, 1, 8, 82, 14, 13, 0, 1, 21, 0, 0, 134, 15, 0, 0, 100, 206, 0, 0, 0, 14, 21, 0, 121, 15, 6, 0, 1, 22, 0, 0, 134, 21, 0, 0, 92, 170, 0, 0, 22, 1, 2, 3, 119, 0, 30, 0, 25, 16, 0, 16, 25, 17, 0, 12, 82, 18, 17, 0, 25, 21, 0, 16, 41, 22, 18, 3, 3, 5, 21, 22, 134, 22, 0, 0, 248, 171, 0, 0, 16, 1, 2, 3, 1, 22, 1, 0, 15, 6, 22, 18, 121, 6, 18, 0, 25, 7, 0, 24, 25, 8, 1, 54, 0, 4, 7, 0, 134, 22, 0, 0, 248, 171, 0, 0, 4, 1, 2, 3, 78, 9, 8, 0, 41, 22, 9, 24, 42, 22, 22, 24, 32, 10, 22, 0, 120, 10, 2, 0, 119, 0, 6, 0, 25, 11, 4, 8, 16, 12, 11, 5, 121, 12, 3, 0, 0, 4, 11, 0, 119, 0, 243, 255, 139, 0, 0, 0, 140, 3, 30, 0, 0, 0, 0, 0, 1, 25, 0, 0, 136, 27, 0, 0, 0, 26, 27, 0, 136, 27, 0, 0, 1, 28, 16, 16, 3, 27, 27, 28, 137, 27, 0, 0, 130, 27, 0, 0, 136, 28, 0, 0, 49, 27, 27, 28, 52, 113, 0, 0, 1, 28, 16, 16, 135, 27, 0, 0, 28, 0, 0, 0, 0, 14, 26, 0, 25, 17, 26, 16, 82, 18, 0, 0, 25, 19, 18, 80, 82, 20, 19, 0, 38, 28, 20, 127, 135, 27, 31, 0, 28, 0, 0, 0, 85, 14, 2, 0, 1, 28, 0, 0, 1, 29, 0, 16, 135, 27, 2, 0, 17, 28, 29, 0, 134, 21, 0, 0, 32, 207, 0, 0, 17, 1, 14, 0, 1, 27, 0, 0, 15, 22, 27, 21, 121, 22, 18, 0, 1, 3, 0, 0, 82, 9, 0, 0, 25, 10, 9, 68, 82, 11, 10, 0, 3, 12, 17, 3, 78, 13, 12, 0, 41, 27, 13, 24, 42, 27, 27, 24, 0, 15, 27, 0, 38, 29, 11, 127, 135, 27, 32, 0, 29, 0, 15, 0, 25, 16, 3, 1, 13, 24, 16, 21, 120, 24, 3, 0, 0, 3, 16, 0, 119, 0, 241, 255, 82, 23, 0, 0, 25, 4, 23, 76, 82, 5, 4, 0, 38, 29, 5, 127, 135, 27, 31, 0, 29, 0, 0, 0, 82, 6, 0, 0, 25, 7, 6, 84, 82, 8, 7, 0, 38, 29, 8, 127, 135, 27, 31, 0, 29, 0, 0, 0, 137, 26, 0, 0, 139, 21, 0, 0, 140, 2, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 25, 22, 22, 16, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 56, 114, 0, 0, 1, 23, 16, 0, 135, 22, 0, 0, 23, 0, 0, 0, 0, 19, 21, 0, 134, 22, 0, 0, 84, 98, 0, 0, 0, 1, 0, 0, 1, 22, 216, 2, 85, 0, 22, 0, 25, 11, 0, 4, 1, 22, 88, 3, 85, 11, 22, 0, 25, 12, 0, 26, 1, 22, 0, 0, 84, 12, 22, 0, 25, 13, 0, 24, 1, 22, 0, 0, 84, 13, 22, 0, 1, 22, 0, 0, 13, 14, 1, 22, 121, 14, 6, 0, 25, 15, 0, 32, 1, 22, 0, 0, 85, 15, 22, 0, 137, 21, 0, 0, 139, 0, 0, 0, 135, 16, 12, 0, 1, 0, 0, 0, 25, 17, 16, 2, 1, 22, 0, 0, 132, 1, 0, 22, 1, 22, 101, 0, 135, 18, 33, 0, 22, 17, 0, 0, 130, 22, 1, 0, 0, 2, 22, 0, 1, 22, 0, 0, 132, 1, 0, 22, 38, 22, 2, 1, 0, 3, 22, 0, 120, 3, 10, 0, 25, 4, 0, 32, 85, 4, 18, 0, 85, 19, 1, 0, 1, 23, 166, 18, 134, 22, 0, 0, 196, 198, 0, 0, 18, 23, 19, 0, 137, 21, 0, 0, 139, 0, 0, 0, 135, 5, 19, 0, 128, 22, 0, 0, 0, 6, 22, 0, 1, 22, 0, 0, 132, 1, 0, 22, 1, 23, 1, 0, 135, 22, 24, 0, 23, 0, 0, 0, 130, 22, 1, 0, 0, 7, 22, 0, 1, 22, 0, 0, 132, 1, 0, 22, 38, 22, 7, 1, 0, 8, 22, 0, 121, 8, 10, 0, 1, 22, 0, 0, 135, 9, 27, 0, 22, 0, 0, 0, 128, 22, 0, 0, 0, 10, 22, 0, 134, 22, 0, 0, 248, 209, 0, 0, 9, 0, 0, 0, 119, 0, 3, 0, 135, 22, 20, 0, 5, 0, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 1, 4, 0, 0, 1, 24, 169, 24, 3, 15, 24, 4, 78, 16, 15, 0, 1, 24, 255, 0, 19, 24, 16, 24, 0, 17, 24, 0, 13, 18, 17, 0, 121, 18, 3, 0, 1, 22, 2, 0, 119, 0, 10, 0, 25, 19, 4, 1, 32, 20, 19, 87, 121, 20, 5, 0, 1, 3, 1, 25, 1, 6, 87, 0, 1, 22, 5, 0, 119, 0, 3, 0, 0, 4, 19, 0, 119, 0, 238, 255, 32, 24, 22, 2, 121, 24, 8, 0, 32, 14, 4, 0, 121, 14, 3, 0, 1, 2, 1, 25, 119, 0, 4, 0, 1, 3, 1, 25, 0, 6, 4, 0, 1, 22, 5, 0, 32, 24, 22, 5, 121, 24, 20, 0, 1, 22, 0, 0, 0, 5, 3, 0, 78, 21, 5, 0, 41, 24, 21, 24, 42, 24, 24, 24, 32, 7, 24, 0, 25, 8, 5, 1, 120, 7, 3, 0, 0, 5, 8, 0, 119, 0, 249, 255, 26, 9, 6, 1, 32, 10, 9, 0, 121, 10, 3, 0, 0, 2, 8, 0, 119, 0, 5, 0, 0, 3, 8, 0, 0, 6, 9, 0, 1, 22, 5, 0, 119, 0, 238, 255, 25, 11, 1, 20, 82, 12, 11, 0, 134, 13, 0, 0, 28, 209, 0, 0, 2, 12, 0, 0, 139, 13, 0, 0, 140, 1, 27, 0, 0, 0, 0, 0, 2, 22, 0, 0, 192, 8, 0, 0, 1, 20, 0, 0, 136, 23, 0, 0, 0, 21, 23, 0, 1, 23, 156, 3, 85, 0, 23, 0, 1, 23, 4, 35, 82, 2, 23, 0, 1, 23, 0, 0, 13, 12, 2, 23, 121, 12, 5, 0, 1, 23, 4, 35, 1, 24, 8, 35, 85, 23, 24, 0, 119, 0, 10, 0, 1, 24, 8, 35, 13, 13, 2, 24, 120, 13, 7, 0, 1, 23, 248, 19, 1, 25, 12, 20, 1, 26, 91, 0, 134, 24, 0, 0, 0, 182, 0, 0, 23, 25, 26, 0, 25, 14, 0, 8, 82, 15, 14, 0, 1, 24, 0, 0, 13, 16, 15, 24, 120, 16, 20, 0, 1, 24, 0, 35, 82, 17, 24, 0, 13, 18, 17, 0, 121, 18, 6, 0, 25, 19, 0, 4, 82, 3, 19, 0, 1, 24, 0, 35, 85, 24, 3, 0, 119, 0, 11, 0, 0, 1, 17, 0, 25, 4, 1, 4, 82, 5, 4, 0, 13, 6, 5, 0, 120, 6, 3, 0, 0, 1, 5, 0, 119, 0, 251, 255, 25, 7, 0, 4, 82, 8, 7, 0, 85, 4, 8, 0, 1, 24, 4, 35, 82, 9, 24, 0, 1, 24, 0, 0, 13, 10, 9, 24, 121, 10, 5, 0, 1, 24, 4, 35, 1, 26, 8, 35, 85, 24, 26, 0, 139, 0, 0, 0, 1, 26, 8, 35, 13, 11, 9, 26, 121, 11, 2, 0, 139, 0, 0, 0, 1, 24, 248, 19, 1, 25, 12, 20, 1, 23, 91, 0, 134, 26, 0, 0, 0, 182, 0, 0, 24, 25, 23, 0, 139, 0, 0, 0, 140, 1, 32, 0, 0, 0, 0, 0, 1, 26, 0, 0, 136, 28, 0, 0, 0, 27, 28, 0, 82, 2, 0, 0, 25, 13, 2, 108, 82, 19, 13, 0, 38, 29, 19, 127, 1, 30, 0, 0, 1, 31, 0, 0, 135, 28, 34, 0, 29, 0, 30, 31, 82, 20, 0, 0, 25, 21, 20, 96, 82, 22, 21, 0, 38, 28, 22, 127, 135, 23, 8, 0, 28, 0, 0, 0, 82, 24, 0, 0, 25, 25, 24, 92, 82, 3, 25, 0, 38, 28, 3, 127, 135, 4, 8, 0, 28, 0, 0, 0, 5, 5, 4, 23, 1, 28, 0, 0, 15, 6, 28, 5, 120, 6, 2, 0, 139, 0, 0, 0, 1, 1, 0, 0, 1, 29, 32, 0, 134, 28, 0, 0, 156, 183, 0, 0, 0, 29, 0, 0, 25, 7, 1, 1, 82, 8, 0, 0, 25, 9, 8, 96, 82, 10, 9, 0, 38, 28, 10, 127, 135, 11, 8, 0, 28, 0, 0, 0, 82, 12, 0, 0, 25, 14, 12, 92, 82, 15, 14, 0, 38, 28, 15, 127, 135, 16, 8, 0, 28, 0, 0, 0, 5, 17, 16, 11, 15, 18, 7, 17, 121, 18, 3, 0, 0, 1, 7, 0, 119, 0, 235, 255, 139, 0, 0, 0, 140, 6, 34, 0, 0, 0, 0, 0, 1, 30, 0, 0, 136, 32, 0, 0, 0, 31, 32, 0, 82, 25, 0, 0, 1, 32, 132, 0, 3, 26, 25, 32, 82, 27, 26, 0, 38, 33, 27, 127, 135, 32, 10, 0, 33, 0, 1, 2, 3, 4, 0, 0, 5, 28, 4, 3, 1, 32, 0, 0, 15, 8, 32, 28, 120, 8, 2, 0, 139, 0, 0, 0, 25, 9, 0, 28, 25, 10, 0, 30, 1, 6, 0, 0, 42, 32, 6, 3, 0, 11, 32, 0, 3, 12, 5, 11, 78, 13, 12, 0, 38, 32, 6, 7, 0, 14, 32, 0, 41, 32, 13, 24, 42, 32, 32, 24, 0, 15, 32, 0, 1, 32, 128, 0, 24, 32, 32, 14, 0, 16, 32, 0, 19, 32, 15, 16, 0, 17, 32, 0, 32, 18, 17, 0, 125, 7, 18, 10, 9, 0, 0, 0, 80, 19, 7, 0, 2, 32, 0, 0, 255, 255, 0, 0, 19, 32, 19, 32, 0, 20, 32, 0, 82, 21, 0, 0, 1, 32, 136, 0, 3, 22, 21, 32, 82, 23, 22, 0, 38, 33, 23, 127, 135, 32, 35, 0, 33, 0, 20, 0, 25, 24, 6, 1, 13, 29, 24, 28, 120, 29, 3, 0, 0, 6, 24, 0, 119, 0, 223, 255, 139, 0, 0, 0, 140, 2, 26, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 127, 23, 0, 0, 87, 23, 0, 0, 127, 23, 0, 0, 82, 11, 23, 0, 127, 23, 0, 0, 106, 12, 23, 4, 1, 23, 52, 0, 135, 13, 36, 0, 11, 12, 23, 0, 128, 23, 0, 0, 0, 14, 23, 0, 2, 23, 0, 0, 255, 255, 0, 0, 19, 23, 13, 23, 0, 15, 23, 0, 1, 23, 255, 7, 19, 23, 15, 23, 0, 20, 23, 0, 41, 23, 20, 16, 42, 23, 23, 16, 1, 24, 0, 0, 1, 25, 0, 8, 138, 23, 24, 25, 240, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0 ], eb + 20480);
 HEAPU8.set([ 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 152, 151, 0, 0, 60, 152, 0, 0, 1, 24, 255, 7, 19, 24, 13, 24, 0, 6, 24, 0, 1, 24, 254, 3, 4, 7, 6, 24, 85, 1, 7, 0, 2, 24, 0, 0, 255, 255, 15, 128, 19, 24, 12, 24, 0, 8, 24, 0, 2, 24, 0, 0, 0, 0, 224, 63, 20, 24, 8, 24, 0, 9, 24, 0, 127, 24, 0, 0, 85, 24, 11, 0, 127, 24, 0, 0, 109, 24, 4, 9, 127, 24, 0, 0, 86, 10, 24, 0, 58, 2, 10, 0, 119, 0, 22, 0, 59, 24, 0, 0, 70, 16, 0, 24, 121, 16, 12, 0, 61, 24, 0, 0, 0, 0, 128, 95, 65, 17, 0, 24, 134, 18, 0, 0, 40, 119, 0, 0, 17, 1, 0, 0, 82, 4, 1, 0, 26, 5, 4, 64, 58, 3, 18, 0, 0, 19, 5, 0, 119, 0, 3, 0, 58, 3, 0, 0, 1, 19, 0, 0, 85, 1, 19, 0, 58, 2, 3, 0, 119, 0, 3, 0, 58, 2, 0, 0, 119, 0, 1, 0, 139, 2, 0, 0, 140, 3, 29, 0, 0, 0, 0, 0, 2, 26, 0, 0, 255, 0, 0, 0, 1, 24, 0, 0, 136, 27, 0, 0, 0, 25, 27, 0, 3, 17, 1, 2, 82, 18, 0, 0, 25, 19, 18, 80, 82, 20, 19, 0, 38, 28, 20, 127, 135, 27, 31, 0, 28, 0, 0, 0, 32, 21, 2, 0, 121, 21, 3, 0, 0, 3, 1, 0, 119, 0, 22, 0, 0, 4, 1, 0, 82, 22, 0, 0, 25, 23, 22, 72, 82, 5, 23, 0, 38, 27, 5, 127, 135, 6, 8, 0, 27, 0, 0, 0, 32, 7, 6, 255, 121, 7, 3, 0, 0, 3, 4, 0, 119, 0, 11, 0, 19, 27, 6, 26, 0, 8, 27, 0, 25, 9, 4, 1, 83, 4, 8, 0, 13, 10, 9, 17, 121, 10, 3, 0, 0, 3, 17, 0, 119, 0, 3, 0, 0, 4, 9, 0, 119, 0, 237, 255, 82, 11, 0, 0, 25, 12, 11, 84, 82, 13, 12, 0, 38, 28, 13, 127, 135, 27, 31, 0, 28, 0, 0, 0, 0, 14, 3, 0, 0, 15, 1, 0, 4, 16, 14, 15, 139, 16, 0, 0, 140, 1, 28, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 20, 82, 13, 2, 0, 25, 15, 0, 28, 82, 16, 15, 0, 16, 17, 16, 13, 121, 17, 16, 0, 25, 18, 0, 36, 82, 19, 18, 0, 38, 25, 19, 127, 1, 26, 0, 0, 1, 27, 0, 0, 135, 24, 13, 0, 25, 0, 26, 27, 82, 20, 2, 0, 1, 24, 0, 0, 13, 21, 20, 24, 121, 21, 3, 0, 1, 1, 255, 255, 119, 0, 4, 0, 1, 22, 3, 0, 119, 0, 2, 0, 1, 22, 3, 0, 32, 24, 22, 3, 121, 24, 28, 0, 25, 3, 0, 4, 82, 4, 3, 0, 25, 5, 0, 8, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 10, 0, 0, 8, 4, 0, 0, 9, 6, 0, 4, 10, 8, 9, 25, 11, 0, 40, 82, 12, 11, 0, 38, 25, 12, 127, 1, 27, 1, 0, 135, 24, 13, 0, 25, 0, 10, 27, 25, 14, 0, 16, 1, 24, 0, 0, 85, 14, 24, 0, 1, 24, 0, 0, 85, 15, 24, 0, 1, 24, 0, 0, 85, 2, 24, 0, 1, 24, 0, 0, 85, 5, 24, 0, 1, 24, 0, 0, 85, 3, 24, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 2, 29, 0, 0, 0, 0, 0, 1, 25, 0, 0, 136, 27, 0, 0, 0, 26, 27, 0, 82, 12, 0, 0, 25, 18, 12, 120, 82, 19, 18, 0, 25, 20, 0, 36, 80, 21, 20, 0, 41, 27, 21, 16, 42, 27, 27, 16, 0, 22, 27, 0, 25, 23, 0, 38, 80, 24, 23, 0, 41, 27, 24, 16, 42, 27, 27, 16, 0, 2, 27, 0, 38, 28, 19, 127, 135, 27, 9, 0, 28, 0, 22, 2, 1, 0, 0, 0, 80, 3, 20, 0, 25, 27, 3, 1, 41, 27, 27, 16, 42, 27, 27, 16, 0, 4, 27, 0, 84, 20, 4, 0, 25, 5, 0, 42, 80, 6, 5, 0, 41, 27, 6, 16, 42, 27, 27, 16, 41, 28, 4, 16, 42, 28, 28, 16, 15, 7, 27, 28, 120, 7, 2, 0, 139, 0, 0, 0, 25, 8, 0, 40, 80, 9, 8, 0, 84, 20, 9, 0, 80, 10, 23, 0, 25, 28, 10, 1, 41, 28, 28, 16, 42, 28, 28, 16, 0, 11, 28, 0, 84, 23, 11, 0, 25, 13, 0, 46, 80, 14, 13, 0, 41, 28, 14, 16, 42, 28, 28, 16, 41, 27, 11, 16, 42, 27, 27, 16, 15, 15, 28, 27, 120, 15, 2, 0, 139, 0, 0, 0, 25, 16, 0, 44, 80, 17, 16, 0, 84, 23, 17, 0, 139, 0, 0, 0, 140, 1, 26, 0, 0, 0, 0, 0, 1, 23, 0, 0, 136, 25, 0, 0, 0, 24, 25, 0, 1, 25, 212, 5, 82, 1, 25, 0, 25, 12, 1, 76, 82, 15, 12, 0, 1, 25, 255, 255, 15, 16, 25, 15, 121, 16, 6, 0, 134, 17, 0, 0, 236, 215, 0, 0, 1, 0, 0, 0, 0, 14, 17, 0, 119, 0, 2, 0, 1, 14, 0, 0, 134, 18, 0, 0, 220, 203, 0, 0, 0, 1, 0, 0, 34, 19, 18, 0, 121, 19, 3, 0, 1, 11, 1, 0, 119, 0, 25, 0, 25, 20, 1, 75, 78, 21, 20, 0, 41, 25, 21, 24, 42, 25, 25, 24, 32, 2, 25, 10, 120, 2, 13, 0, 25, 3, 1, 20, 82, 4, 3, 0, 25, 5, 1, 16, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 7, 0, 25, 8, 4, 1, 85, 3, 8, 0, 1, 25, 10, 0, 83, 4, 25, 0, 1, 11, 0, 0, 119, 0, 7, 0, 1, 25, 10, 0, 134, 9, 0, 0, 12, 111, 0, 0, 1, 25, 0, 0, 34, 22, 9, 0, 0, 11, 22, 0, 41, 25, 11, 31, 42, 25, 25, 31, 0, 10, 25, 0, 32, 13, 14, 0, 120, 13, 4, 0, 134, 25, 0, 0, 212, 215, 0, 0, 1, 0, 0, 0, 139, 10, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 15, 0, 0, 136, 17, 0, 0, 0, 16, 17, 0, 136, 17, 0, 0, 25, 17, 17, 16, 137, 17, 0, 0, 130, 17, 0, 0, 136, 18, 0, 0, 49, 17, 17, 18, 0, 156, 0, 0, 1, 18, 16, 0, 135, 17, 0, 0, 18, 0, 0, 0, 25, 14, 16, 8, 0, 13, 16, 0, 1, 17, 0, 0, 132, 1, 0, 17, 135, 17, 37, 0, 0, 0, 0, 0, 130, 17, 1, 0, 0, 1, 17, 0, 1, 17, 0, 0, 132, 1, 0, 17, 38, 17, 1, 1, 0, 5, 17, 0, 120, 5, 11, 0, 1, 17, 0, 0, 132, 1, 0, 17, 1, 18, 111, 0, 1, 19, 188, 33, 135, 17, 26, 0, 18, 19, 13, 0, 130, 17, 1, 0, 0, 6, 17, 0, 1, 17, 0, 0, 132, 1, 0, 17, 1, 17, 0, 0, 135, 7, 27, 0, 17, 0, 0, 0, 128, 17, 0, 0, 0, 8, 17, 0, 135, 17, 38, 0, 7, 0, 0, 0, 1, 17, 0, 0, 132, 1, 0, 17, 1, 19, 111, 0, 1, 18, 228, 33, 135, 17, 26, 0, 19, 18, 14, 0, 130, 17, 1, 0, 0, 9, 17, 0, 1, 17, 0, 0, 132, 1, 0, 17, 1, 17, 0, 0, 135, 10, 27, 0, 17, 0, 0, 0, 128, 17, 0, 0, 0, 11, 17, 0, 1, 17, 0, 0, 132, 1, 0, 17, 1, 18, 112, 0, 135, 17, 37, 0, 18, 0, 0, 0, 130, 17, 1, 0, 0, 12, 17, 0, 1, 17, 0, 0, 132, 1, 0, 17, 38, 17, 12, 1, 0, 2, 17, 0, 121, 2, 10, 0, 1, 17, 0, 0, 135, 3, 27, 0, 17, 0, 0, 0, 128, 17, 0, 0, 0, 4, 17, 0, 134, 17, 0, 0, 248, 209, 0, 0, 3, 0, 0, 0, 119, 0, 4, 0, 134, 17, 0, 0, 248, 209, 0, 0, 10, 0, 0, 0, 139, 0, 0, 0, 140, 0, 22, 0, 0, 0, 0, 0, 2, 17, 0, 0, 12, 35, 0, 0, 2, 18, 0, 0, 197, 53, 0, 0, 1, 15, 0, 0, 136, 19, 0, 0, 0, 16, 19, 0, 136, 19, 0, 0, 25, 19, 19, 48, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 100, 157, 0, 0, 1, 20, 48, 0, 135, 19, 0, 0, 20, 0, 0, 0, 25, 14, 16, 16, 25, 13, 16, 8, 0, 12, 16, 0, 1, 0, 0, 0, 1, 20, 10, 22, 134, 19, 0, 0, 28, 196, 0, 0, 20, 12, 0, 0, 134, 19, 0, 0, 168, 191, 0, 0, 17, 0, 0, 0, 134, 5, 0, 0, 132, 205, 0, 0, 18, 0, 0, 0, 58, 1, 5, 0, 134, 6, 0, 0, 184, 205, 0, 0, 18, 0, 0, 0, 58, 4, 6, 0, 1, 20, 3, 0, 1, 21, 3, 0, 134, 19, 0, 0, 56, 205, 0, 0, 17, 20, 21, 0, 58, 7, 1, 0, 58, 8, 7, 0, 87, 13, 8, 0, 1, 21, 75, 22, 134, 19, 0, 0, 244, 112, 0, 0, 17, 21, 13, 0, 1, 21, 3, 0, 1, 20, 13, 0, 134, 19, 0, 0, 56, 205, 0, 0, 17, 21, 20, 0, 58, 9, 4, 0, 58, 10, 9, 0, 87, 14, 10, 0, 1, 20, 95, 22, 134, 19, 0, 0, 244, 112, 0, 0, 17, 20, 14, 0, 58, 11, 1, 0, 59, 19, 25, 0, 73, 2, 11, 19, 38, 19, 2, 1, 0, 3, 19, 0, 1, 20, 100, 51, 134, 19, 0, 0, 100, 198, 0, 0, 20, 3, 0, 0, 59, 20, 1, 0, 134, 19, 0, 0, 128, 206, 0, 0, 20, 0, 0, 0, 119, 0, 208, 255, 140, 3, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 32, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 132, 158, 0, 0, 1, 20, 32, 0, 135, 19, 0, 0, 20, 0, 0, 0, 0, 12, 18, 0, 25, 5, 18, 20, 25, 6, 0, 60, 82, 7, 6, 0, 0, 8, 5, 0, 85, 12, 7, 0, 25, 13, 12, 4, 1, 19, 0, 0, 85, 13, 19, 0, 25, 14, 12, 8, 85, 14, 1, 0, 25, 15, 12, 12, 85, 15, 8, 0, 25, 16, 12, 16, 85, 16, 2, 0, 1, 19, 140, 0, 135, 9, 39, 0, 19, 12, 0, 0, 134, 10, 0, 0, 20, 202, 0, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 5, 0, 1, 19, 255, 255, 85, 5, 19, 0, 1, 4, 255, 255, 119, 0, 3, 0, 82, 3, 5, 0, 0, 4, 3, 0, 137, 18, 0, 0, 139, 4, 0, 0, 140, 3, 28, 0, 0, 0, 0, 0, 1, 24, 0, 0, 136, 26, 0, 0, 0, 25, 26, 0, 3, 17, 1, 2, 82, 18, 0, 0, 25, 19, 18, 80, 82, 20, 19, 0, 38, 27, 20, 127, 135, 26, 31, 0, 27, 0, 0, 0, 0, 3, 1, 0, 13, 21, 3, 17, 121, 21, 3, 0, 0, 4, 17, 0, 119, 0, 18, 0, 82, 22, 0, 0, 25, 23, 22, 68, 82, 5, 23, 0, 25, 6, 3, 1, 78, 7, 3, 0, 41, 26, 7, 24, 42, 26, 26, 24, 0, 8, 26, 0, 38, 26, 5, 127, 135, 9, 32, 0, 26, 0, 8, 0, 32, 10, 9, 255, 121, 10, 3, 0, 0, 4, 6, 0, 119, 0, 3, 0, 0, 3, 6, 0, 119, 0, 236, 255, 82, 11, 0, 0, 25, 12, 11, 84, 82, 13, 12, 0, 38, 27, 13, 127, 135, 26, 31, 0, 27, 0, 0, 0, 0, 14, 4, 0, 0, 15, 1, 0, 4, 16, 14, 15, 139, 16, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 32, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 236, 159, 0, 0, 1, 21, 32, 0, 135, 20, 0, 0, 21, 0, 0, 0, 0, 15, 19, 0, 25, 8, 19, 16, 25, 9, 0, 36, 1, 20, 77, 0, 85, 9, 20, 0 ], eb + 30720);
 HEAPU8.set([ 82, 10, 0, 0, 38, 20, 10, 64, 0, 11, 20, 0, 32, 12, 11, 0, 121, 12, 18, 0, 25, 13, 0, 60, 82, 14, 13, 0, 0, 3, 8, 0, 85, 15, 14, 0, 25, 16, 15, 4, 1, 20, 19, 84, 85, 16, 20, 0, 25, 17, 15, 8, 85, 17, 3, 0, 1, 20, 54, 0, 135, 4, 6, 0, 20, 15, 0, 0, 32, 5, 4, 0, 120, 5, 4, 0, 25, 6, 0, 75, 1, 20, 255, 255, 83, 6, 20, 0, 134, 7, 0, 0, 192, 65, 0, 0, 0, 1, 2, 0, 137, 19, 0, 0, 139, 7, 0, 0, 140, 0, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 1, 24, 0, 0, 132, 1, 0, 24, 1, 24, 110, 0, 135, 0, 25, 0, 24, 0, 0, 0, 130, 24, 1, 0, 0, 1, 24, 0, 1, 24, 0, 0, 132, 1, 0, 24, 38, 24, 1, 1, 0, 12, 24, 0, 121, 12, 9, 0, 1, 24, 0, 0, 135, 13, 27, 0, 24, 0, 0, 0, 128, 24, 0, 0, 0, 14, 24, 0, 134, 24, 0, 0, 248, 209, 0, 0, 13, 0, 0, 0, 1, 24, 0, 0, 13, 15, 0, 24, 120, 15, 29, 0, 82, 16, 0, 0, 1, 24, 0, 0, 13, 17, 16, 24, 120, 17, 25, 0, 25, 18, 16, 48, 0, 19, 18, 0, 0, 20, 19, 0, 82, 21, 20, 0, 25, 2, 19, 4, 0, 3, 2, 0, 82, 4, 3, 0, 1, 24, 0, 255, 19, 24, 21, 24, 0, 5, 24, 0, 2, 24, 0, 0, 0, 43, 43, 67, 13, 6, 5, 24, 2, 24, 0, 0, 71, 78, 76, 67, 13, 7, 4, 24, 19, 24, 6, 7, 0, 8, 24, 0, 121, 8, 6, 0, 25, 9, 16, 12, 82, 10, 9, 0, 134, 24, 0, 0, 196, 155, 0, 0, 10, 0, 0, 0, 134, 11, 0, 0, 156, 208, 0, 0, 134, 24, 0, 0, 196, 155, 0, 0, 11, 0, 0, 0, 139, 0, 0, 0, 140, 5, 24, 0, 0, 0, 0, 0, 1, 20, 0, 0, 136, 22, 0, 0, 0, 21, 22, 0, 136, 22, 0, 0, 1, 23, 0, 1, 3, 22, 22, 23, 137, 22, 0, 0, 130, 22, 0, 0, 136, 23, 0, 0, 49, 22, 22, 23, 164, 161, 0, 0, 1, 23, 0, 1, 135, 22, 0, 0, 23, 0, 0, 0, 0, 14, 21, 0, 2, 22, 0, 0, 0, 32, 1, 0, 19, 22, 4, 22, 0, 15, 22, 0, 32, 16, 15, 0, 15, 17, 3, 2, 19, 22, 17, 16, 0, 19, 22, 0, 121, 19, 34, 0, 4, 18, 2, 3, 1, 22, 0, 1, 16, 7, 18, 22, 1, 22, 0, 1, 125, 8, 7, 18, 22, 0, 0, 0, 135, 22, 2, 0, 14, 1, 8, 0, 1, 22, 255, 0, 16, 9, 22, 18, 121, 9, 19, 0, 4, 10, 2, 3, 0, 6, 18, 0, 1, 23, 0, 1, 134, 22, 0, 0, 84, 204, 0, 0, 0, 14, 23, 0, 1, 22, 0, 1, 4, 11, 6, 22, 1, 22, 255, 0, 16, 12, 22, 11, 121, 12, 3, 0, 0, 6, 11, 0, 119, 0, 246, 255, 1, 22, 255, 0, 19, 22, 10, 22, 0, 13, 22, 0, 0, 5, 13, 0, 119, 0, 2, 0, 0, 5, 18, 0, 134, 22, 0, 0, 84, 204, 0, 0, 0, 14, 5, 0, 137, 21, 0, 0, 139, 0, 0, 0, 140, 2, 21, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 134, 18, 0, 0, 252, 113, 0, 0, 0, 1, 0, 0, 1, 18, 40, 2, 85, 0, 18, 0, 25, 8, 0, 4, 1, 18, 200, 2, 85, 8, 18, 0, 1, 18, 0, 0, 132, 1, 0, 18, 1, 19, 29, 0, 1, 20, 255, 255, 135, 18, 26, 0, 19, 0, 20, 0, 130, 18, 1, 0, 0, 9, 18, 0, 1, 18, 0, 0, 132, 1, 0, 18, 38, 18, 9, 1, 0, 10, 18, 0, 120, 10, 17, 0, 82, 11, 0, 0, 25, 12, 11, 116, 82, 13, 12, 0, 1, 18, 0, 0, 132, 1, 0, 18, 1, 20, 0, 0, 135, 18, 26, 0, 13, 0, 20, 0, 130, 18, 1, 0, 0, 14, 18, 0, 1, 18, 0, 0, 132, 1, 0, 18, 38, 18, 14, 1, 0, 15, 18, 0, 120, 15, 2, 0, 139, 0, 0, 0, 135, 2, 19, 0, 128, 18, 0, 0, 0, 3, 18, 0, 1, 18, 0, 0, 132, 1, 0, 18, 1, 20, 1, 0, 135, 18, 24, 0, 20, 0, 0, 0, 130, 18, 1, 0, 0, 4, 18, 0, 1, 18, 0, 0, 132, 1, 0, 18, 38, 18, 4, 1, 0, 5, 18, 0, 121, 5, 10, 0, 1, 18, 0, 0, 135, 6, 27, 0, 18, 0, 0, 0, 128, 18, 0, 0, 0, 7, 18, 0, 134, 18, 0, 0, 248, 209, 0, 0, 6, 0, 0, 0, 119, 0, 3, 0, 135, 18, 20, 0, 2, 0, 0, 0, 139, 0, 0, 0, 140, 2, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 78, 11, 0, 0, 78, 12, 1, 0, 41, 23, 11, 24, 42, 23, 23, 24, 41, 24, 12, 24, 42, 24, 24, 24, 14, 13, 23, 24, 41, 24, 11, 24, 42, 24, 24, 24, 32, 14, 24, 0, 20, 24, 14, 13, 0, 20, 24, 0, 121, 20, 4, 0, 0, 4, 12, 0, 0, 5, 11, 0, 119, 0, 24, 0, 0, 2, 1, 0, 0, 3, 0, 0, 25, 15, 3, 1, 25, 16, 2, 1, 78, 17, 15, 0, 78, 18, 16, 0, 41, 24, 17, 24, 42, 24, 24, 24, 41, 23, 18, 24, 42, 23, 23, 24, 14, 6, 24, 23, 41, 23, 17, 24, 42, 23, 23, 24, 32, 7, 23, 0, 20, 23, 7, 6, 0, 19, 23, 0, 121, 19, 4, 0, 0, 4, 18, 0, 0, 5, 17, 0, 119, 0, 4, 0, 0, 2, 16, 0, 0, 3, 15, 0, 119, 0, 236, 255, 1, 23, 255, 0, 19, 23, 5, 23, 0, 8, 23, 0, 1, 23, 255, 0, 19, 23, 4, 23, 0, 9, 23, 0, 4, 10, 8, 9, 139, 10, 0, 0, 140, 3, 20, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 1, 16, 156, 3, 85, 0, 16, 0, 25, 7, 0, 4, 1, 16, 0, 0, 85, 7, 16, 0, 25, 8, 0, 8, 85, 8, 1, 0, 25, 9, 0, 12, 85, 9, 2, 0, 1, 16, 4, 35, 82, 10, 16, 0, 1, 16, 0, 0, 13, 11, 10, 16, 121, 11, 5, 0, 1, 16, 4, 35, 1, 17, 8, 35, 85, 16, 17, 0, 119, 0, 10, 0, 1, 17, 8, 35, 13, 12, 10, 17, 120, 12, 7, 0, 1, 16, 248, 19, 1, 18, 12, 20, 1, 19, 91, 0, 134, 17, 0, 0, 0, 182, 0, 0, 16, 18, 19, 0, 1, 17, 0, 0, 13, 13, 1, 17, 121, 13, 4, 0, 1, 17, 0, 0, 85, 7, 17, 0, 119, 0, 6, 0, 1, 17, 0, 35, 82, 3, 17, 0, 85, 7, 3, 0, 1, 17, 0, 35, 85, 17, 0, 0, 1, 17, 4, 35, 82, 4, 17, 0, 1, 17, 0, 0, 13, 5, 4, 17, 121, 5, 5, 0, 1, 17, 4, 35, 1, 19, 8, 35, 85, 17, 19, 0, 139, 0, 0, 0, 1, 19, 8, 35, 13, 6, 4, 19, 121, 6, 2, 0, 139, 0, 0, 0, 1, 17, 248, 19, 1, 18, 12, 20, 1, 16, 91, 0, 134, 19, 0, 0, 0, 182, 0, 0, 17, 18, 16, 0, 139, 0, 0, 0, 140, 1, 25, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 74, 78, 13, 2, 0, 41, 24, 13, 24, 42, 24, 24, 24, 0, 15, 24, 0, 1, 24, 255, 0, 3, 16, 15, 24, 20, 24, 16, 15, 0, 17, 24, 0, 1, 24, 255, 0, 19, 24, 17, 24, 0, 18, 24, 0, 83, 2, 18, 0, 82, 19, 0, 0, 38, 24, 19, 8, 0, 20, 24, 0, 32, 21, 20, 0, 121, 21, 20, 0, 25, 4, 0, 8, 1, 24, 0, 0, 85, 4, 24, 0, 25, 5, 0, 4, 1, 24, 0, 0, 85, 5, 24, 0, 25, 6, 0, 44, 82, 7, 6, 0, 25, 8, 0, 28, 85, 8, 7, 0, 25, 9, 0, 20, 85, 9, 7, 0, 25, 10, 0, 48, 82, 11, 10, 0, 3, 12, 7, 11, 25, 14, 0, 16, 85, 14, 12, 0, 1, 1, 0, 0, 119, 0, 5, 0, 39, 24, 19, 32, 0, 3, 24, 0, 85, 0, 3, 0, 1, 1, 255, 255, 139, 1, 0, 0, 140, 4, 27, 0, 0, 0, 0, 0, 2, 25, 0, 0, 255, 0, 0, 0, 1, 23, 0, 0, 136, 26, 0, 0, 0, 24, 26, 0, 32, 17, 0, 0, 32, 18, 1, 0, 19, 26, 17, 18, 0, 19, 26, 0, 121, 19, 3, 0, 0, 4, 2, 0, 119, 0, 33, 0, 0, 5, 2, 0, 0, 11, 1, 0, 0, 21, 0, 0, 38, 26, 21, 15, 0, 20, 26, 0, 1, 26, 151, 24, 3, 22, 26, 20, 78, 6, 22, 0, 19, 26, 6, 25, 0, 7, 26, 0, 20, 26, 7, 3, 0, 8, 26, 0, 19, 26, 8, 25, 0, 9, 26, 0, 26, 10, 5, 1, 83, 10, 9, 0, 1, 26, 4, 0, 135, 12, 36, 0, 21, 11, 26, 0, 128, 26, 0, 0, 0, 13, 26, 0, 32, 14, 12, 0, 32, 15, 13, 0, 19, 26, 14, 15, 0, 16, 26, 0, 121, 16, 3, 0, 0, 4, 10, 0, 119, 0, 5, 0, 0, 5, 10, 0, 0, 11, 13, 0, 0, 21, 12, 0, 119, 0, 228, 255, 139, 4, 0, 0, 140, 1, 29, 0, 0, 0, 0, 0, 1, 25, 0, 0, 136, 27, 0, 0, 0, 26, 27, 0, 25, 1, 0, 4, 82, 12, 1, 0, 25, 18, 12, 8, 0, 19, 18, 0, 0, 20, 19, 0, 82, 21, 20, 0, 25, 22, 19, 4, 0, 23, 22, 0, 82, 24, 23, 0, 82, 2, 0, 0, 25, 3, 2, 4, 82, 4, 3, 0, 38, 27, 4, 127, 135, 5, 40, 0, 27, 0, 0, 0, 16, 6, 5, 21, 1, 27, 0, 0, 1, 28, 1, 0, 134, 7, 0, 0, 76, 207, 0, 0, 5, 24, 27, 28, 128, 28, 0, 0, 0, 8, 28, 0, 125, 9, 6, 7, 5, 0, 0, 0, 125, 10, 6, 8, 24, 0, 0, 0, 82, 11, 1, 0, 25, 13, 11, 8, 0, 14, 13, 0, 0, 15, 14, 0, 85, 15, 9, 0, 25, 16, 14, 4, 0, 17, 16, 0, 85, 17, 10, 0, 129, 10, 0, 0, 139, 9, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 82, 3, 0, 0, 78, 4, 3, 0, 41, 19, 4, 24, 42, 19, 19, 24, 0, 5, 19, 0, 26, 15, 5, 48, 35, 13, 15, 10, 121, 13, 21, 0, 1, 2, 0, 0, 0, 9, 3, 0, 0, 16, 15, 0, 27, 6, 2, 10, 3, 7, 16, 6, 25, 8, 9, 1, 85, 0, 8, 0, 78, 10, 8, 0, 41, 19, 10, 24, 42, 19, 19, 24, 0, 11, 19, 0, 26, 14, 11, 48, 35, 12, 14, 10, 121, 12, 5, 0, 0, 2, 7, 0, 0, 9, 8, 0, 0, 16, 14, 0, 119, 0, 242, 255, 0, 1, 7, 0, 119, 0, 2, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 6, 27, 0, 0, 0, 0, 0, 1, 23, 0, 0, 136, 25, 0, 0, 0, 24, 25, 0, 25, 19, 0, 4, 82, 20, 19, 0, 42, 25, 20, 8, 0, 21, 25, 0, 38, 25, 20, 1, 0, 22, 25, 0, 32, 7, 22, 0, 121, 7, 3, 0, 0, 6, 21, 0, 119, 0, 5, 0, 82, 8, 3, 0, 3, 9, 8, 21, 82, 10, 9, 0, 0, 6, 10, 0, 82, 11, 0, 0, 82, 12, 11, 0, 25, 13, 12, 20, 82, 14, 13, 0, 3, 15, 3, 6, 38, 25, 20, 2, 0, 16, 25, 0, 33, 17, 16, 0, 1, 25, 2, 0, 125, 18, 17, 4, 25, 0, 0, 0, 38, 26, 14, 127, 135, 25, 11, 0, 26, 11, 1, 2, 15, 18, 5, 0, 139, 0, 0, 0, 140, 2, 16, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 172, 168, 0, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 3, 12, 0, 1, 13, 58, 0, 83, 3, 13, 0, 25, 2, 3, 1, 1, 13, 255, 0, 19, 13, 0, 13, 83, 2, 13, 0, 42, 14, 0, 8, 1, 15, 255, 0, 19, 14, 14, 15, 107, 2, 1, 14, 42, 13, 0, 16, 1, 15, 255, 0, 19, 13, 13, 15, 107, 2, 2, 13, 42, 14, 0, 24, 107, 2, 3, 14, 134, 4, 0, 0, 148, 95, 0, 0, 3, 1, 0, 0, 1, 14, 0, 0, 13, 5, 4, 14, 121, 5, 3, 0, 137, 12, 0, 0, 139, 4, 0, 0, 82, 6, 0, 0, 25, 7, 6, 28, 82, 8, 7, 0, 38, 14, 8, 127, 135, 9, 8, 0, 14, 0, 0, 0, 32, 10, 9, 0, 121, 10, 3, 0, 137, 12, 0, 0, 139, 4, 0, 0, 1, 13, 0, 0, 134, 14, 0, 0, 192, 206, 0, 0, 4, 13, 0, 0, 137, 12, 0, 0, 139, 4, 0, 0, 140, 1, 27, 0, 0, 0, 0, 0, 1, 24, 0, 0, 136, 26, 0, 0, 0, 25, 26, 0, 1, 26, 43, 0, 134, 8, 0, 0, 88, 202, 0, 0, 0, 26, 0, 0, 1, 26, 0, 0, 13, 15, 8, 26, 78, 16, 0, 0, 41, 26, 16, 24, 42, 26, 26, 24, 33, 23, 26, 114, 38, 26, 23, 1, 0, 1, 26, 0, 1, 26, 2, 0, 125, 3, 15, 1, 26, 0, 0, 0, 1, 26, 120, 0, 134, 17, 0, 0, 88, 202, 0, 0, 0, 26, 0, 0, 1, 26, 0, 0, 13, 18, 17, 26, 1, 26, 128, 0, 20, 26, 3, 26, 0, 19, 26, 0, 125, 4, 18, 3, 19, 0, 0, 0, 1, 26, 101, 0, 134, 20, 0, 0, 88, 202, 0, 0, 0, 26, 0, 0, 1, 26, 0, 0, 13, 21, 20, 26, 2, 26, 0, 0, 0, 0, 8, 0, 20, 26, 4, 26, 0, 22, 26, 0, 125, 5, 21, 4, 22, 0, 0, 0, 41, 26, 16, 24, 42, 26, 26, 24, 32, 9, 26, 114, 39, 26, 5, 64, 0, 10, 26, 0, 125, 6, 9, 5, 10, 0, 0, 0, 41, 26, 16, 24, 42, 26, 26, 24, 32, 11, 26, 119, 1, 26, 0, 2, 20, 26, 6, 26, 0, 12, 26, 0, 125, 7, 11, 12, 6, 0, 0, 0, 41, 26, 16, 24, 42, 26, 26, 24, 32, 13, 26, 97, 1, 26, 0, 4, 20, 26, 7, 26, 0, 14, 26, 0, 125, 2, 13, 14, 7, 0, 0, 0, 139, 2, 0, 0, 140, 4, 18, 0, 0, 0, 0, 0, 1, 15, 0, 0, 136, 17, 0, 0, 0, 16, 17, 0, 25, 9, 1, 16, 82, 10, 9, 0, 1, 17, 0, 0, 13, 11, 10, 17, 25, 12, 1, 36, 25, 13, 1, 24, 121, 11, 6, 0, 85, 9, 2, 0, 85, 13, 3, 0, 1, 17, 1, 0, 85, 12, 17, 0, 119, 0, 16, 0, 13, 14, 10, 2, 120, 14, 10, 0, 82, 6, 12, 0, 25, 7, 6, 1, 85, 12, 7, 0, 1, 17, 2, 0, 85, 13, 17, 0, 25, 8, 1, 54, 1, 17, 1, 0, 83, 8, 17, 0, 119, 0, 5, 0, 82, 4, 13, 0, 32, 5, 4, 2, 121, 5, 2, 0, 85, 13, 3, 0, 139, 0, 0, 0, 140, 6, 23, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 82, 14, 0, 0, 1, 21, 132, 0, 3, 15, 14, 21, 82, 16, 15, 0, 38, 22, 16, 127, 135, 21, 10, 0, 22, 0, 1, 2, 3, 4, 0, 0, 5, 17, 4, 3, 1, 21, 0, 0, 15, 7, 21, 17, 120, 7, 2, 0, 139, 0, 0, 0, 1, 6, 0, 0, 82, 8, 0, 0, 1, 21, 136, 0, 3, 9, 8, 21, 82, 10, 9, 0, 41, 21, 6, 2, 3, 11, 5, 21, 82, 12, 11, 0, 38, 22, 10, 127, 135, 21, 35, 0, 22, 0, 12, 0, 25, 13, 6, 1, 13, 18, 13, 17, 120, 18, 3, 0, 0, 6, 13, 0, 119, 0, 242, 255, 139, 0, 0, 0, 140, 5, 26, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 17, 0, 4, 82, 18, 17, 0, 42, 24, 18, 8, 0, 19, 24, 0, 38, 24, 18, 1, 0, 20, 24, 0, 32, 21, 20, 0, 121, 21, 3, 0, 0, 5, 19, 0, 119, 0, 5, 0, 82, 6, 2, 0, 3, 7, 6, 19, 82, 8, 7, 0, 0, 5, 8, 0, 82, 9, 0, 0, 82, 10, 9, 0, 25, 11, 10, 24, 82, 12, 11, 0, 3, 13, 2, 5, 38, 24, 18, 2, 0, 14, 24, 0, 33, 15, 14, 0, 1, 24, 2, 0, 125, 16, 15, 3, 24, 0, 0, 0, 38, 25, 12, 127, 135, 24, 10, 0, 25, 9, 1, 13, 16, 4, 0, 0, 139, 0, 0, 0, 140, 4, 25, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 25, 15, 0, 4, 82, 16, 15, 0, 42, 23, 16, 8, 0, 17, 23, 0, 38, 23, 16, 1, 0, 18, 23, 0, 32, 19, 18, 0, 121, 19, 3, 0, 0, 4, 17, 0, 119, 0, 5, 0, 82, 20, 2, 0, 3, 5, 20, 17, 82, 6, 5, 0, 0, 4, 6, 0, 82, 7, 0, 0, 82, 8, 7, 0, 25, 9, 8, 28, 82, 10, 9, 0, 3, 11, 2, 4, 38, 23, 16, 2, 0, 12, 23, 0, 33, 13, 12, 0, 1, 23, 2, 0, 125, 14, 13, 3, 23, 0, 0, 0, 38, 24, 10, 127, 135, 23, 9, 0, 24, 7, 1, 11, 14, 0, 0, 0, 139, 0, 0, 0, 140, 4, 24, 0, 0, 0, 0, 0, 1, 21, 0, 0, 136, 23, 0, 0, 0, 22, 23, 0, 1, 23, 128, 0, 16, 14, 23, 1, 1, 23, 32, 0, 16, 15, 23, 2, 20, 23, 14, 15, 0, 16, 23, 0, 121, 16, 2, 0, 139, 0, 0, 0, 25, 17, 0, 52, 82, 18, 17, 0, 32, 19, 18, 0, 121, 19, 11, 0, 41, 23, 2, 7, 0, 5, 23, 0, 3, 6, 5, 1, 25, 23, 0, 68, 3, 7, 23, 6, 33, 20, 3, 0, 38, 23, 20, 1, 0, 4, 23, 0, 83, 7, 4, 0, 139, 0, 0, 0, 32, 8, 3, 1, 41, 23, 2, 7, 0, 9, 23, 0, 3, 10, 9, 1, 25, 23, 0, 68, 3, 11, 23, 10, 120, 8, 2, 0, 139, 0, 0, 0, 78, 12, 11, 0, 40, 23, 12, 1, 0, 13, 23, 0, 83, 11, 13, 0, 139, 0, 0, 0, 140, 6, 18, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 25, 10, 1, 8, 82, 11, 10, 0, 134, 12, 0, 0, 100, 206, 0, 0, 0, 11, 5, 0, 121, 12, 7, 0, 1, 17, 0, 0, 134, 16, 0, 0, 92, 106, 0, 0, 17, 1, 2, 3, 4, 0, 0, 0, 119, 0, 10, 0, 25, 13, 0, 8, 82, 6, 13, 0, 82, 7, 6, 0, 25, 8, 7, 20, 82, 9, 8, 0, 38, 17, 9, 127, 135, 16, 11, 0, 17, 6, 1, 2, 3, 4, 5, 0, 139, 0, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 32, 12, 0, 0, 32, 13, 1, 0, 19, 21, 12, 13, 0, 14, 21, 0, 121, 14, 3, 0, 0, 3, 2, 0, 119, 0, 29, 0, 0, 4, 2, 0, 0, 6, 1, 0, 0, 16, 0, 0, 1, 21, 255, 0, 19, 21, 16, 21, 0, 15, 21, 0, 38, 21, 15, 7, 0, 17, 21, 0, 39, 21, 17, 48, 0, 18, 21, 0, 26, 5, 4, 1, 83, 5, 18, 0, 1, 21, 3, 0, 135, 7, 36, 0, 16, 6, 21, 0, 128, 21, 0, 0, 0, 8, 21, 0, 32, 9, 7, 0, 32, 10, 8, 0, 19, 21, 9, 10, 0, 11, 21, 0, 121, 11, 3, 0, 0, 3, 5, 0, 119, 0, 5, 0, 0, 4, 5, 0, 0, 6, 8, 0, 0, 16, 7, 0, 119, 0, 232, 255, 139, 3, 0, 0, 140, 6, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 82, 12, 0, 0, 1, 19, 132, 0, 3, 13, 12, 19, 82, 14, 13, 0, 38, 20, 14, 127, 135, 19, 10, 0, 20, 0, 1, 2, 3, 4, 0, 0, 5, 15, 4, 3, 1, 19, 0, 0, 15, 7, 19, 15, 120, 7, 2, 0, 139, 0, 0, 0, 1, 6, 0, 0, 82, 8, 0, 0, 1, 19, 136, 0, 3, 9, 8, 19, 82, 10, 9, 0, 38, 20, 10, 127, 135, 19, 35, 0, 20, 0, 5, 0, 25, 11, 6, 1, 13, 16, 11, 15, 120, 16, 3, 0, 0, 6, 11, 0, 119, 0, 245, 255, 139, 0, 0, 0, 140, 4, 21, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 5, 11, 2, 1, 32, 12, 1, 0, 1, 20, 0, 0, 125, 4, 12, 20, 2, 0, 0, 0, 25, 13, 3, 76, 82, 14, 13, 0, 1, 20, 255, 255, 15, 15, 20, 14, 121, 15, 16, 0, 134, 5, 0, 0, 236, 215, 0, 0, 3, 0, 0, 0, 32, 17, 5, 0, 134, 6, 0, 0, 236, 87, 0, 0, 0, 11, 3, 0, 121, 17, 3, 0, 0, 8, 6, 0, 119, 0, 10, 0, 134, 20, 0, 0, 212, 215, 0, 0, 3, 0, 0, 0, 0, 8, 6, 0, 119, 0, 5, 0, 134, 16, 0, 0, 236, 87, 0, 0, 0, 11, 3, 0, 0, 8, 16, 0, 13, 7, 8, 11, 121, 7, 3, 0, 0, 10, 4, 0, 119, 0, 5, 0, 7, 20, 8, 1, 38, 20, 20, 255, 0, 9, 20, 0, 0, 10, 9, 0, 139, 10, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 1, 18, 0, 0, 85, 0, 18, 0, 25, 1, 0, 8, 25, 8, 0, 16, 1, 18, 0, 0, 85, 1, 18, 0, 1, 19, 0, 0, 109, 1, 4, 19, 1, 18, 0, 0, 109, 1, 8, 18, 1, 19, 0, 0, 109, 1, 12, 19, 134, 9, 0, 0, 72, 216, 0, 0, 25, 10, 0, 24, 85, 10, 9, 0, 25, 11, 0, 28, 1, 19, 1, 0, 83, 11, 19, 0, 134, 12, 0, 0, 176, 166, 0, 0, 9, 0, 0, 0, 128, 19, 0, 0, 0, 13, 19, 0, 0, 14, 1, 0, 0, 15, 14, 0, 85, 15, 12, 0, 25, 2, 14, 4, 0, 3, 2, 0, 85, 3, 13, 0, 0, 4, 8, 0, 0, 5, 4, 0, 1, 19, 0, 0, 85, 5, 19, 0, 25, 6, 4, 4, 0, 7, 6, 0, 1, 19, 0, 0, 85, 7, 19, 0, 139, 0, 0, 0, 140, 1, 19, 0, 0, 0, 0, 0, 1, 16, 0, 0, 136, 18, 0, 0, 0, 17, 18, 0, 25, 3, 0, 68, 82, 8, 3, 0, 32, 9, 8, 0, 120, 9, 23, 0, 25, 10, 0, 116, 82, 11, 10, 0, 1, 18, 0, 0, 13, 12, 11, 18, 25, 1, 0, 112, 120, 12, 4, 0, 82, 13, 1, 0, 25, 14, 11, 112, 85, 14, 13, 0, 82, 15, 1, 0, 1, 18, 0, 0, 13, 4, 15, 18, 121, 4, 7, 0, 134, 6, 0, 0, 184, 211, 0, 0, 1, 18, 232, 0, 3, 7, 6, 18, 0, 2, 7, 0, 119, 0, 3, 0, 25, 5, 15, 116, 0, 2, 5, 0, 85, 2, 11, 0, 139, 0, 0, 0, 140, 5, 22, 0, 0, 0, 0, 0, 1, 19, 0, 0, 136, 21, 0, 0, 0, 20, 21, 0, 2, 21, 0, 0, 255, 255, 0, 0, 19, 21, 1, 21, 0, 14, 21, 0, 25, 15, 0, 36, 84, 15, 14, 0, 2, 21, 0, 0, 255, 255, 0, 0, 19, 21, 2, 21, 0, 16, 21, 0, 25, 17, 0, 38, 84, 17, 16, 0, 25, 18, 0, 40, 84, 18, 14, 0, 2, 21, 0, 0, 255, 255, 0, 0, 3, 5, 1, 21, 3, 6, 5, 3, 2, 21, 0, 0, 255, 255, 0, 0, 19, 21, 6, 21, 0, 7, 21, 0, 25, 8, 0, 42, 84, 8, 7, 0, 25, 9, 0, 44, 84, 9, 16, 0, 2, 21, 0, 0, 255, 255, 0, 0, 3, 10, 2, 21, 3, 11, 10, 4, 2, 21, 0, 0, 255, 255, 0, 0, 19, 21, 11, 21, 0, 12, 21, 0, 25, 13, 0, 46, 84, 13, 12, 0, 139, 0, 0, 0, 140, 4, 16, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 25, 6, 1, 8, 82, 7, 6, 0, 1, 14, 0, 0, 134, 8, 0, 0, 100, 206, 0, 0, 0, 7, 14, 0, 121, 8, 6, 0, 1, 15, 0, 0, 134, 14, 0, 0, 92, 170, 0, 0, 15, 1, 2, 3, 119, 0, 10, 0, 25, 9, 0, 8, 82, 10, 9, 0, 82, 11, 10, 0, 25, 4, 11, 28, 82, 5, 4, 0, 38, 15, 5, 127, 135, 14, 9, 0, 15, 10, 1, 2, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 25, 5, 0, 15, 38, 5, 5, 240, 0, 0, 5, 0, 130, 5, 2, 0, 82, 1, 5, 0, 3, 3, 1, 0, 1, 5, 0, 0, 15, 5, 5, 0, 15, 6, 3, 1, 19, 5, 5, 6, 34, 6, 3, 0, 20, 5, 5, 6, 121, 5, 7, 0, 135, 5, 41, 0, 1, 6, 12, 0, 135, 5, 42, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 130, 5, 2, 0, 85, 5, 3, 0, 135, 4, 43, 0, 47, 5, 4, 3, 52, 178, 0, 0, 135, 5, 44, 0, 32, 5, 5, 0, 121, 5, 8, 0, 130, 5, 2, 0, 85, 5, 1, 0, 1, 6, 12, 0, 135, 5, 42, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 139, 1, 0, 0, 140, 2, 20, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 25, 6, 0, 32, 82, 7, 6, 0, 1, 16, 0, 0, 13, 8, 7, 16, 121, 8, 11, 0, 1, 16, 96, 4, 82, 9, 16, 0, 1, 17, 64, 18, 1, 18, 85, 0, 1, 19, 1, 0, 134, 16, 0, 0, 180, 174, 0, 0, 17, 18, 19, 9, 1, 2, 0, 0, 139, 2, 0, 0, 1, 16, 150, 18, 134, 10, 0, 0, 48, 72, 0, 0, 7, 16, 1, 0, 1, 16, 0, 0, 13, 11, 10, 16, 121, 11, 3, 0, 1, 2, 0, 0, 139, 2, 0, 0, 1, 16, 212, 5, 82, 12, 16, 0, 82, 13, 0, 0, 25, 3, 13, 96, 82, 4, 3, 0, 38, 16, 4, 127, 135, 5, 8, 0, 16, 0, 0, 0, 1, 19, 0, 0, 1, 18, 1, 0, 134, 16, 0, 0, 72, 190, 0, 0, 12, 19, 18, 5, 1, 2, 1, 0, 139, 2, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 1, 14, 104, 3, 85, 0, 14, 0, 25, 1, 0, 16, 1, 14, 5, 0, 135, 4, 45, 0, 14, 1, 0, 0, 25, 5, 0, 28, 82, 6, 5, 0, 1, 14, 0, 0, 13, 7, 6, 14, 121, 7, 5, 0, 134, 14, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 25, 8, 6, 8, 82, 9, 8, 0, 1, 14, 0, 0, 132, 1, 0, 14, 135, 14, 24, 0, 9, 1, 0, 0, 130, 14, 1, 0, 0, 10, 14, 0, 1, 14, 0, 0, 132, 1, 0, 14, 38, 14, 10, 1, 0, 11, 14, 0, 121, 11, 10, 0, 135, 2, 19, 0, 128, 14, 0, 0, 0, 3, 14, 0, 134, 14, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 14, 20, 0, 2, 0, 0, 0, 119, 0, 5, 0, 134, 14, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 19, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 82, 2, 0, 0, 25, 6, 2, 16, 82, 7, 6, 0, 38, 16, 7, 127, 1, 17, 0, 0, 1, 18, 1, 0, 135, 8, 13, 0, 16, 0, 17, 18, 34, 9, 8, 0, 121, 9, 3, 0, 0, 1, 8, 0, 139, 1, 0, 0, 82, 10, 0, 0, 25, 11, 10, 16, 82, 12, 11, 0, 38, 16, 12, 127, 1, 18, 0, 0, 1, 17, 2, 0, 135, 13, 13, 0, 16, 0, 18, 17, 82, 3, 0, 0, 25, 4, 3, 16, 82, 5, 4, 0, 38, 17, 5, 127, 1, 18, 0, 0, 135, 16, 13, 0, 17, 0, 8, 18, 0, 1, 13, 0, 139, 1, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 1, 14, 104, 3, 85, 0, 14, 0, 25, 1, 0, 16, 1, 14, 5, 0, 135, 4, 45, 0, 14, 1, 0, 0, 25, 5, 0, 28, 82, 6, 5, 0, 1, 14, 0, 0, 13, 7, 6, 14, 121, 7, 2, 0, 139, 0, 0, 0, 25, 8, 6, 8, 82, 9, 8, 0, 1, 14, 0, 0, 132, 1, 0, 14, 135, 14, 24, 0, 9, 1, 0, 0, 130, 14, 1, 0, 0, 10, 14, 0, 1, 14, 0, 0, 132, 1, 0, 14, 38, 14, 10, 1, 0, 11, 14, 0, 121, 11, 7, 0, 135, 2, 19, 0, 128, 14, 0, 0, 0, 3, 14, 0, 135, 14, 20, 0, 2, 0, 0, 0, 119, 0, 2, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 20, 0, 0, 0, 0, 0, 1, 14, 0, 0, 136, 16, 0, 0, 0, 15, 16, 0, 82, 1, 0, 0, 1, 16, 140, 0, 3, 6, 1, 16, 82, 7, 6, 0, 25, 8, 1, 124, 82, 9, 8, 0, 38, 16, 9, 127, 135, 10, 8, 0, 16, 0, 0, 0, 82, 11, 0, 0, 1, 16, 128, 0, 3, 12, 11, 16, 82, 13, 12, 0, 38, 16, 13, 127, 135, 2, 8, 0, 16, 0, 0, 0, 25, 3, 0, 30, 80, 4, 3, 0, 2, 16, 0, 0, 255, 255, 0, 0, 19, 16, 4, 16, 0, 5, 16, 0, 38, 17, 7, 127, 1, 18, 0, 0, 1, 19, 0, 0, 135, 16, 11, 0, 17, 0, 18, 19, 10, 2, 5, 0, 139, 0, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 8, 0, 0, 136, 10, 0, 0, 0, 9, 10, 0, 32, 2, 0, 0, 1, 10, 1, 0, 125, 1, 2, 10, 0, 0, 0, 0, 135, 3, 4, 0, 1, 0, 0, 0, 1, 10, 0, 0, 13, 4, 3, 10, 120, 4, 3, 0, 1, 8, 6, 0, 119, 0, 12, 0, 134, 5, 0, 0, 108, 208, 0, 0, 1, 10, 0, 0, 13, 6, 5, 10, 121, 6, 3, 0, 1, 8, 5, 0, 119, 0, 5, 0, 38, 11, 5, 127, 135, 10, 46, 0, 11, 0, 0, 0, 119, 0, 239, 255, 32, 10, 8, 5, 121, 10, 12, 0, 1, 10, 4, 0, 135, 7, 47, 0, 10, 0, 0, 0, 134, 10, 0, 0, 56, 212, 0, 0, 7, 0, 0, 0, 1, 11, 48, 1, 1, 12, 94, 0, 135, 10, 48, 0, 7, 11, 12, 0, 119, 0, 4, 0, 32, 10, 8, 6, 121, 10, 2, 0, 139, 3, 0, 0, 1, 10, 0, 0, 139, 10, 0, 0, 140, 3, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 60, 182, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 4, 8, 0, 85, 4, 0, 0, 25, 5, 4, 4, 85, 5, 1, 0, 25, 6, 4, 8, 85, 6, 2, 0, 1, 10, 84, 21, 134, 9, 0, 0, 28, 196, 0, 0, 10, 4, 0, 0, 1, 9, 6, 0, 135, 3, 49, 0, 9, 0, 0, 0, 137, 8, 0, 0, 139, 0, 0, 0, 140, 3, 15, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 136, 13, 0, 0, 25, 13, 13, 16, 137, 13, 0, 0, 130, 13, 0, 0, 136, 14, 0, 0, 49, 13, 13, 14, 180, 182, 0, 0, 1, 14, 16, 0, 135, 13, 0, 0, 14, 0, 0, 0, 0, 4, 12, 0, 82, 5, 2, 0, 85, 4, 5, 0, 82, 6, 0, 0, 25, 7, 6, 16, 82, 8, 7, 0, 38, 13, 8, 127, 135, 9, 13, 0, 13, 0, 1, 4, 38, 13, 9, 1, 0, 10, 13, 0, 121, 9, 3, 0, 82, 3, 4, 0, 85, 2, 3, 0, 137, 12, 0, 0, 139, 10, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 26, 1, 0, 4, 1, 11, 248, 3, 85, 1, 11, 0, 25, 2, 1, 4, 1, 11, 88, 4, 85, 2, 11, 0, 25, 3, 1, 20, 82, 4, 3, 0, 134, 11, 0, 0, 224, 109, 0, 0, 4, 0, 0, 0, 1, 11, 0, 0, 132, 1, 0, 11, 1, 12, 64, 0, 135, 11, 24, 0, 12, 2, 0, 0, 130, 11, 1, 0, 0, 5, 11, 0, 1, 11, 0, 0, 132, 1, 0, 11, 38, 11, 5, 1, 0, 6, 11, 0, 121, 6, 10, 0, 135, 7, 19, 0, 128, 11, 0, 0, 0, 8, 11, 0, 134, 11, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 135, 11, 20, 0, 7, 0, 0, 0, 119, 0, 5, 0, 134, 11, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 16, 0, 0, 0, 0, 0, 1, 12, 0, 0, 136, 14, 0, 0, 0, 13, 14, 0, 82, 4, 0, 0, 25, 5, 4, 80, 82, 6, 5, 0, 38, 15, 6, 127, 135, 14, 31, 0, 15, 0, 0, 0, 82, 7, 0, 0, 25, 8, 7, 68, 82, 9, 8, 0, 38, 14, 9, 127, 135, 10, 32, 0, 14, 0, 1, 0, 82, 11, 0, 0, 25, 2, 11, 84, 82, 3, 2, 0, 38, 15, 3, 127, 135, 14, 31, 0, 15, 0, 0, 0, 139, 10, 0, 0, 140, 1, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 1, 11, 248, 3, 85, 0, 11, 0, 25, 1, 0, 4, 1, 11, 88, 4, 85, 1, 11, 0, 25, 2, 0, 20, 82, 3, 2, 0, 134, 11, 0, 0, 224, 109, 0, 0, 3, 0, 0, 0, 25, 4, 0, 4, 1, 11, 0, 0, 132, 1, 0, 11, 1, 12, 64, 0, 135, 11, 24, 0, 12, 4, 0, 0, 130, 11, 1, 0, 0, 5, 11, 0, 1, 11, 0, 0, 132, 1, 0, 11, 38, 11, 5, 1, 0, 6, 11, 0, 121, 6, 10, 0, 135, 7, 19, 0, 128, 11, 0, 0, 0, 8, 11, 0, 134, 11, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 11, 20, 0, 7, 0, 0, 0, 119, 0, 5, 0, 134, 11, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 6, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 25, 6, 1, 8, 82, 7, 6, 0, 134, 8, 0, 0, 100, 206, 0, 0, 0, 7, 5, 0, 121, 8, 6, 0, 1, 12, 0, 0, 134, 11, 0, 0, 92, 106, 0, 0, 12, 1, 2, 3, 4, 0, 0, 0, 139, 0, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 36, 185, 0, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 0, 4, 2, 0, 1, 8, 0, 0, 85, 4, 8, 0, 1, 9, 0, 0, 109, 4, 4, 9, 1, 8, 0, 0, 109, 4, 8, 8, 1, 9, 0, 0, 109, 4, 12, 9, 1, 8, 0, 0, 109, 4, 16, 8, 1, 9, 0, 0, 109, 4, 20, 9, 0, 5, 3, 0, 134, 9, 0, 0, 164, 200, 0, 0, 4, 5, 0, 0, 137, 7, 0, 0, 139, 0, 0, 0, 140, 0, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 180, 185, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 4, 6, 0, 1, 7, 184, 53, 1, 8, 108, 0, 135, 0, 50, 0, 7, 8, 0, 0, 32, 1, 0, 0, 121, 1, 8, 0, 1, 8, 188, 53, 82, 2, 8, 0, 135, 3, 51, 0, 2, 0, 0, 0, 137, 6, 0, 0, 139, 3, 0, 0, 119, 0, 5, 0, 1, 7, 36, 33, 134, 8, 0, 0, 120, 197, 0, 0, 7, 4, 0, 0, 1, 8, 0, 0, 139, 8, 0, 0, 140, 3, 16, 0, 0, 0, 0, 0, 1, 13, 0, 0, 136, 15, 0, 0, 0, 14, 15, 0, 25, 6, 0, 16, 82, 7, 6, 0, 25, 8, 0, 20, 82, 9, 8, 0, 0, 10, 9, 0, 4, 11, 7, 10, 16, 12, 2, 11, 125, 3, 12, 2, 11, 0, 0, 0, 135, 15, 14, 0, 9, 1, 3, 0, 82, 4, 8, 0, 3, 5, 4, 3, 85, 8, 5, 0, 139, 2, 0, 0, 140, 4, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 25, 4, 1, 8, 82, 5, 4, 0, 1, 9, 0, 0, 134, 6, 0, 0, 100, 206, 0, 0, 0, 5, 9, 0, 121, 6, 5, 0, 1, 10, 0, 0, 134, 9, 0, 0, 92, 170, 0, 0, 10, 1, 2, 3, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 212, 186, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 25, 1, 0, 60, 82, 2, 1, 0, 134, 3, 0, 0, 188, 215, 0, 0, 2, 0, 0, 0, 85, 6, 3, 0, 1, 9, 6, 0, 135, 4, 22, 0, 9, 6, 0, 0, 134, 5, 0, 0, 20, 202, 0, 0, 4, 0, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 140, 4, 13, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 25, 4, 1, 4, 82, 5, 4, 0, 13, 6, 5, 2, 121, 6, 6, 0, 25, 7, 1, 28, 82, 8, 7, 0, 32, 9, 8, 1, 120, 9, 2, 0, 85, 7, 3, 0, 139, 0, 0, 0, 140, 0, 13, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 136, 11, 0, 0, 25, 11, 11, 16, 137, 11, 0, 0, 130, 11, 0, 0, 136, 12, 0, 0, 49, 11, 11, 12, 136, 187, 0, 0, 1, 12, 16, 0, 135, 11, 0, 0, 12, 0, 0, 0, 0, 0, 10, 0, 1, 12, 0, 0, 135, 11, 52, 0, 12, 0, 0, 0, 82, 1, 0, 0, 76, 11, 1, 0, 58, 2, 11, 0, 60, 11, 0, 0, 0, 202, 154, 59, 65, 3, 2, 11, 25, 4, 0, 4, 82, 5, 4, 0, 76, 11, 5, 0, 58, 6, 11, 0, 63, 7, 3, 6, 75, 8, 7, 0, 137, 10, 0, 0, 139, 8, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 12, 188, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 4, 6, 0, 135, 7, 30, 0, 0, 0, 0, 0, 1, 7, 188, 53, 82, 1, 7, 0, 1, 7, 0, 0, 135, 2, 53, 0, 1, 7, 0, 0, 32, 3, 2, 0, 121, 3, 4, 0, 137, 6, 0, 0, 139, 0, 0, 0, 119, 0, 5, 0, 1, 8, 135, 33, 134, 7, 0, 0, 120, 197, 0, 0, 8, 4, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 8, 0, 0, 136, 10, 0, 0, 0, 9, 10, 0, 25, 2, 0, 16, 25, 3, 0, 28, 82, 4, 3, 0, 1, 10, 0, 0, 13, 5, 4, 10, 121, 5, 10, 0, 1, 11, 68, 19, 1, 12, 73, 19, 1, 13, 14, 2, 134, 10, 0, 0, 0, 182, 0, 0, 11, 12, 13, 0, 82, 1, 3, 0, 0, 7, 1, 0, 119, 0, 2, 0, 0, 7, 4, 0, 82, 6, 7, 0, 38, 13, 6, 127, 135, 10, 31, 0, 13, 2, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 82, 1, 0, 0, 25, 3, 1, 124, 82, 4, 3, 0, 38, 13, 4, 127, 135, 5, 8, 0, 13, 0, 0, 0, 25, 6, 0, 48, 82, 7, 6, 0, 25, 8, 7, 1, 78, 9, 8, 0, 1, 13, 255, 0, 19, 13, 9, 13, 0, 10, 13, 0, 6, 13, 5, 10, 38, 13, 13, 255, 0, 2, 13, 0, 139, 2, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 0, 2, 0, 0, 25, 3, 2, 12, 82, 4, 3, 0, 1, 11, 0, 0, 13, 5, 4, 11, 121, 5, 10, 0, 1, 12, 68, 19, 1, 13, 73, 19, 1, 14, 14, 2, 134, 11, 0, 0, 0, 182, 0, 0, 12, 13, 14, 0, 82, 1, 3, 0, 0, 7, 1, 0, 119, 0, 2, 0, 0, 7, 4, 0, 82, 6, 7, 0, 0, 8, 0, 0, 38, 14, 6, 127, 135, 11, 31, 0, 14, 8, 0, 0, 139, 0, 0, 0, 140, 1, 15, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 0, 2, 0, 0, 25, 3, 2, 12, 82, 4, 3, 0, 1, 11, 0, 0, 13, 5, 4, 11, 121, 5, 10, 0, 1, 12, 68, 19, 1, 13, 73, 19, 1, 14, 14, 2, 134, 11, 0, 0, 0, 182, 0, 0, 12, 13, 14, 0, 82, 1, 3, 0, 0, 7, 1, 0, 119, 0, 2, 0, 0, 7, 4, 0, 82, 6, 7, 0, 0, 8, 0, 0, 38, 14, 6, 127, 135, 11, 31, 0, 14, 8, 0, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 82, 1, 0, 0, 1, 13, 128, 0, 3, 3, 1, 13, 82, 4, 3, 0, 38, 13, 4, 127, 135, 5, 8, 0, 13, 0, 0, 0, 25, 6, 0, 48, 82, 7, 6, 0, 25, 8, 7, 2, 78, 9, 8, 0, 1, 13, 255, 0, 19, 13, 9, 13, 0, 10, 13, 0, 6, 13, 5, 10, 38, 13, 13, 255, 0, 2, 13, 0, 139, 2, 0, 0, 140, 4, 12, 0, 0, 0, 0, 0, 1, 8, 0, 0, 136, 10, 0, 0, 0, 9, 10, 0, 25, 4, 0, 75, 1, 10, 255, 255, 83, 4, 10, 0, 1, 10, 1, 0, 1, 11, 2, 0, 138, 2, 10, 11, 128, 190, 0, 0, 140, 190, 0, 0, 119, 0, 8, 0, 1, 10, 10, 0, 83, 4, 10, 0, 119, 0, 5, 0, 25, 5, 0, 48, 1, 10, 0, 0, 85, 5, 10, 0, 119, 0, 1, 0, 82, 6, 0, 0, 39, 10, 6, 64, 0, 7, 10, 0, 85, 0, 7, 0, 1, 10, 0, 0, 139, 10, 0, 0, 140, 2, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 240, 190, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 2, 6, 0, 1, 7, 196, 53, 78, 3, 7, 0, 41, 7, 3, 24, 42, 7, 7, 24, 32, 4, 7, 0, 121, 4, 13, 0, 1, 7, 196, 53, 1, 8, 1, 0, 83, 7, 8, 0, 85, 2, 1, 0, 134, 8, 0, 0, 0, 211, 0, 0, 0, 2, 0, 0, 1, 7, 1, 0, 134, 8, 0, 0, 208, 209, 0, 0, 7, 0, 0, 0, 119, 0, 3, 0, 137, 6, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 4, 17, 0, 0, 0, 0, 0, 1, 11, 0, 0, 136, 13, 0, 0, 0, 12, 13, 0, 82, 5, 0, 0, 1, 13, 148, 0, 3, 6, 5, 13, 82, 7, 6, 0, 41, 13, 1, 3, 0, 8, 13, 0, 41, 13, 2, 3, 0, 9, 13, 0, 26, 10, 3, 31, 1, 13, 38, 15, 41, 14, 10, 3, 3, 4, 13, 14, 38, 13, 7, 127, 1, 15, 8, 0, 1, 16, 8, 0, 135, 14, 11, 0, 13, 0, 8, 9, 15, 16, 4, 0, 139, 0, 0, 0, 140, 1, 14, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 25, 1, 0, 68, 1, 12, 0, 0, 1, 13, 0, 16, 135, 11, 2, 0, 1, 12, 13, 0, 1, 11, 76, 16, 3, 2, 0, 11, 82, 3, 2, 0, 1, 11, 80, 16, 3, 4, 0, 11, 82, 5, 4, 0, 1, 11, 84, 16, 3, 6, 0, 11, 82, 7, 6, 0, 1, 11, 0, 0, 135, 8, 28, 0, 11, 3, 5, 7, 1, 0, 0, 0, 139, 0, 0, 0, 140, 2, 13, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 1, 12, 0, 0, 13, 3, 1, 12, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 8, 0, 82, 4, 1, 0, 25, 5, 1, 4, 82, 6, 5, 0, 134, 7, 0, 0, 212, 67, 0, 0, 4, 6, 0, 0, 0, 2, 7, 0, 1, 12, 0, 0, 14, 8, 2, 12, 125, 9, 8, 2, 0, 0, 0, 0, 139, 9, 0, 0, 140, 0, 7, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 136, 5, 0, 0, 25, 5, 5, 16, 137, 5, 0, 0, 130, 5, 0, 0, 136, 6, 0, 0, 49, 5, 5, 6, 156, 192, 0, 0, 1, 6, 16, 0, 135, 5, 0, 0, 6, 0, 0, 0, 0, 2, 4, 0, 1, 5, 188, 53, 1, 6, 109, 0, 135, 0, 54, 0, 5, 6, 0, 0, 32, 1, 0, 0, 121, 1, 4, 0, 137, 4, 0, 0, 139, 0, 0, 0, 119, 0, 5, 0, 1, 5, 85, 33, 134, 6, 0, 0, 120, 197, 0, 0, 5, 2, 0, 0, 139, 0, 0, 0, 140, 2, 12, 0, 0, 0, 0, 0, 1, 8, 0, 0, 136, 10, 0, 0, 0, 9, 10, 0, 136, 10, 0, 0, 25, 10, 10, 16, 137, 10, 0, 0, 130, 10, 0, 0, 136, 11, 0, 0, 49, 10, 10, 11, 20, 193, 0, 0, 1, 11, 16, 0, 135, 10, 0, 0, 11, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 0, 4, 2, 0, 82, 5, 4, 0, 0, 6, 3, 0, 1, 10, 8, 0, 135, 7, 55, 0, 10, 5, 6, 0, 137, 9, 0, 0, 139, 0, 0, 0, 140, 1, 12, 0, 0, 0, 0, 0, 1, 9, 0, 0, 136, 11, 0, 0, 0, 10, 11, 0, 1, 11, 76, 16, 3, 1, 0, 11, 82, 2, 1, 0, 1, 11, 80, 16, 3, 3, 0, 11, 82, 4, 3, 0, 1, 11, 84, 16, 3, 5, 0, 11, 82, 6, 5, 0, 25, 7, 0, 68, 1, 11, 0, 0, 135, 8, 28, 0, 11, 2, 4, 6, 7, 0, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 26, 1, 0, 4, 1, 8, 0, 0, 132, 1, 0, 8, 1, 9, 1, 0, 135, 8, 24, 0, 9, 1, 0, 0, 130, 8, 1, 0, 0, 2, 8, 0, 1, 8, 0, 0, 132, 1, 0, 8, 38, 8, 2, 1, 0, 3, 8, 0, 121, 3, 10, 0, 135, 4, 19, 0, 128, 8, 0, 0, 0, 5, 8, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 135, 8, 20, 0, 4, 0, 0, 0, 119, 0, 5, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 26, 1, 0, 4, 1, 8, 0, 0, 132, 1, 0, 8, 1, 9, 1, 0, 135, 8, 24, 0, 9, 1, 0, 0, 130, 8, 1, 0, 0, 2, 8, 0, 1, 8, 0, 0, 132, 1, 0, 8, 38, 8, 2, 1, 0, 3, 8, 0, 121, 3, 10, 0, 135, 4, 19, 0, 128, 8, 0, 0, 0, 5, 8, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 135, 8, 20, 0, 4, 0, 0, 0, 119, 0, 5, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 134, 1, 0, 0, 4, 214, 0, 0, 82, 2, 1, 0, 25, 3, 0, 56, 85, 3, 2, 0, 82, 4, 1, 0, 1, 9, 0, 0, 13, 5, 4, 9, 120, 5, 3, 0, 25, 6, 4, 52, 85, 6, 0, 0, 85, 1, 0, 0, 134, 9, 0, 0, 24, 215, 0, 0, 139, 0, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 26, 1, 0, 4, 1, 8, 0, 0, 132, 1, 0, 8, 1, 9, 1, 0, 135, 8, 24, 0, 9, 1, 0, 0, 130, 8, 1, 0, 0, 2, 8, 0, 1, 8, 0, 0, 132, 1, 0, 8, 38, 8, 2, 1, 0, 3, 8, 0, 121, 3, 10, 0, 135, 4, 19, 0, 128, 8, 0, 0, 0, 5, 8, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 135, 8, 20, 0, 4, 0, 0, 0, 119, 0, 5, 0, 134, 8, 0, 0, 132, 215, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 4, 7, 0, 0, 0, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 0, 4, 5, 0, 134, 6, 0, 0, 20, 51, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 137, 5, 0, 0, 106, 6, 4, 4, 129, 6, 0, 0, 82, 6, 4, 0, 139, 6, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 1, 8, 1, 0, 135, 7, 24, 0, 8, 0, 0, 0, 130, 7, 1, 0, 0, 1, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 38, 7, 1, 1, 0, 2, 7, 0, 121, 2, 10, 0, 135, 3, 19, 0, 128, 7, 0, 0, 0, 4, 7, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 7, 20, 0, 3, 0, 0, 0, 119, 0, 5, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 88, 196, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 2, 6, 0, 85, 2, 1, 0, 1, 7, 212, 5, 82, 3, 7, 0, 134, 4, 0, 0, 172, 82, 0, 0, 3, 0, 2, 0, 137, 6, 0, 0, 139, 4, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 1, 8, 1, 0, 135, 7, 24, 0, 8, 0, 0, 0, 130, 7, 1, 0, 0, 1, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 38, 7, 1, 1, 0, 2, 7, 0, 121, 2, 10, 0, 135, 3, 19, 0, 128, 7, 0, 0, 0, 4, 7, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 7, 20, 0, 3, 0, 0, 0, 119, 0, 5, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 130, 2, 3, 0, 1, 3, 255, 0, 19, 3, 0, 3, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 2, 0, 139, 1, 0, 0, 130, 2, 3, 0, 42, 3, 0, 8, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 8, 139, 2, 0, 0, 130, 2, 3, 0, 42, 3, 0, 16, 1, 4, 255, 0, 19, 3, 3, 4, 90, 1, 2, 3, 34, 2, 1, 8, 121, 2, 3, 0, 25, 2, 1, 16, 139, 2, 0, 0, 130, 2, 3, 0, 43, 3, 0, 24, 90, 2, 2, 3, 25, 2, 2, 24, 139, 2, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 136, 6, 0, 0, 25, 6, 6, 16, 137, 6, 0, 0, 130, 6, 0, 0, 136, 7, 0, 0, 49, 6, 6, 7, 180, 197, 0, 0, 1, 7, 16, 0, 135, 6, 0, 0, 7, 0, 0, 0, 0, 2, 5, 0, 85, 2, 1, 0, 1, 6, 96, 4, 82, 3, 6, 0, 134, 6, 0, 0, 172, 82, 0, 0, 3, 0, 2, 0, 1, 7, 10, 0, 134, 6, 0, 0, 128, 102, 0, 0, 7, 3, 0, 0, 135, 6, 56, 0, 139, 0, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 1, 8, 1, 0, 135, 7, 24, 0, 8, 0, 0, 0, 130, 7, 1, 0, 0, 1, 7, 0, 1, 7, 0, 0, 132, 1, 0, 7, 38, 7, 1, 1, 0, 2, 7, 0, 121, 2, 10, 0, 135, 3, 19, 0, 128, 7, 0, 0, 0, 4, 7, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 135, 7, 20, 0, 3, 0, 0, 0, 119, 0, 5, 0, 134, 7, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 139, 0, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 160, 198, 0, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 0, 4, 2, 0, 0, 5, 3, 0, 134, 8, 0, 0, 28, 199, 0, 0, 4, 5, 0, 0, 137, 7, 0, 0, 139, 4, 0, 0, 140, 3, 9, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 136, 7, 0, 0, 25, 7, 7, 16, 137, 7, 0, 0, 130, 7, 0, 0, 136, 8, 0, 0, 49, 7, 7, 8, 0, 199, 0, 0, 1, 8, 16, 0, 135, 7, 0, 0, 8, 0, 0, 0, 0, 3, 6, 0, 85, 3, 2, 0, 134, 4, 0, 0, 32, 207, 0, 0, 0, 1, 3, 0, 137, 6, 0, 0, 139, 4, 0, 0, 140, 2, 10, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 136, 8, 0, 0, 25, 8, 8, 16, 137, 8, 0, 0, 130, 8, 0, 0, 136, 9, 0, 0, 49, 8, 8, 9, 88, 199, 0, 0, 1, 9, 16, 0, 135, 8, 0, 0, 9, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1, 0, 0, 4, 2, 0, 0, 5, 3, 0, 134, 8, 0, 0, 216, 192, 0, 0, 4, 5, 0, 0, 137, 7, 0, 0, 139, 0, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 1, 8, 0, 0, 13, 1, 0, 8, 121, 1, 3, 0, 1, 4, 0, 0, 119, 0, 10, 0, 1, 8, 8, 1, 1, 9, 80, 1, 1, 10, 0, 0, 134, 2, 0, 0, 64, 76, 0, 0, 0, 8, 9, 10, 1, 10, 0, 0, 14, 5, 2, 10, 0, 4, 5, 0, 38, 10, 4, 1, 0, 3, 10, 0, 139, 3, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 26, 1, 0, 4, 1, 7, 248, 3, 85, 1, 7, 0, 25, 2, 1, 4, 1, 7, 88, 4, 85, 2, 7, 0 ], eb + 40960);
 HEAPU8.set([ 25, 3, 1, 20, 82, 4, 3, 0, 134, 7, 0, 0, 224, 109, 0, 0, 4, 0, 0, 0, 134, 7, 0, 0, 84, 116, 0, 0, 2, 0, 0, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 248, 3, 85, 0, 7, 0, 25, 1, 0, 4, 1, 7, 88, 4, 85, 1, 7, 0, 25, 2, 0, 20, 82, 3, 2, 0, 134, 7, 0, 0, 224, 109, 0, 0, 3, 0, 0, 0, 25, 4, 0, 4, 134, 7, 0, 0, 84, 116, 0, 0, 4, 0, 0, 0, 139, 0, 0, 0, 140, 3, 10, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 82, 3, 0, 0, 25, 4, 3, 16, 82, 5, 4, 0, 38, 9, 5, 127, 135, 6, 13, 0, 9, 0, 1, 2, 139, 6, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 85, 0, 1, 0, 32, 2, 1, 255, 121, 2, 2, 0, 139, 0, 0, 0, 25, 3, 0, 4, 85, 3, 1, 0, 1, 7, 7, 0, 135, 4, 55, 0, 7, 0, 1, 0, 139, 0, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 1, 0, 0, 25, 2, 1, 124, 82, 3, 2, 0, 38, 8, 3, 127, 135, 4, 8, 0, 8, 0, 0, 0, 28, 8, 4, 8, 38, 8, 8, 255, 0, 5, 8, 0, 139, 5, 0, 0, 140, 1, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 1, 0, 0, 1, 8, 128, 0, 3, 2, 1, 8, 82, 3, 2, 0, 38, 8, 3, 127, 135, 4, 8, 0, 8, 0, 0, 0, 28, 8, 4, 8, 38, 8, 8, 255, 0, 5, 8, 0, 139, 5, 0, 0, 140, 3, 10, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 2, 9, 0, 0, 255, 255, 0, 0, 19, 9, 1, 9, 0, 3, 9, 0, 25, 4, 0, 24, 84, 4, 3, 0, 2, 9, 0, 0, 255, 255, 0, 0, 19, 9, 2, 9, 0, 5, 9, 0, 25, 6, 0, 26, 84, 6, 5, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 160, 34, 134, 2, 0, 0, 96, 175, 0, 0, 3, 0, 0, 0, 1, 2, 192, 34, 1, 3, 104, 3, 85, 2, 3, 0, 1, 3, 208, 34, 1, 2, 0, 0, 85, 3, 2, 0, 1, 2, 208, 34, 1, 3, 0, 0, 109, 2, 4, 3, 1, 3, 208, 34, 1, 2, 0, 0, 109, 3, 8, 2, 1, 2, 208, 34, 1, 3, 0, 0, 109, 2, 12, 3, 1, 3, 224, 34, 1, 2, 1, 0, 83, 3, 2, 0, 139, 0, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 240, 16, 2, 7, 0, 121, 2, 8, 0, 1, 7, 0, 0, 4, 3, 7, 0, 134, 4, 0, 0, 64, 209, 0, 0, 85, 4, 3, 0, 1, 1, 255, 255, 119, 0, 2, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 2, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 134, 2, 0, 0, 180, 80, 0, 0, 0, 1, 0, 0, 78, 3, 2, 0, 1, 9, 255, 0, 19, 9, 1, 9, 0, 4, 9, 0, 41, 9, 3, 24, 42, 9, 9, 24, 41, 10, 4, 24, 42, 10, 10, 24, 13, 5, 9, 10, 1, 10, 0, 0, 125, 6, 5, 2, 10, 0, 0, 0, 139, 6, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 25, 2, 0, 56, 82, 3, 2, 0, 1, 6, 0, 0, 1, 7, 3, 0, 138, 3, 6, 7, 232, 202, 0, 0, 224, 202, 0, 0, 240, 202, 0, 0, 1, 1, 32, 0, 119, 0, 4, 0, 1, 1, 128, 0, 119, 0, 2, 0, 119, 0, 254, 255, 139, 1, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 25, 2, 0, 56, 82, 3, 2, 0, 1, 6, 0, 0, 1, 7, 3, 0, 138, 3, 6, 7, 52, 203, 0, 0, 44, 203, 0, 0, 60, 203, 0, 0, 1, 1, 128, 0, 119, 0, 4, 0, 1, 1, 32, 0, 119, 0, 2, 0, 119, 0, 254, 255, 139, 1, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 82, 1, 0, 0, 25, 2, 1, 16, 82, 3, 2, 0, 38, 7, 3, 127, 1, 8, 0, 0, 1, 9, 1, 0, 135, 4, 13, 0, 7, 0, 8, 9, 139, 4, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 82, 1, 0, 0, 25, 2, 1, 24, 82, 3, 2, 0, 38, 7, 3, 127, 135, 4, 8, 0, 7, 0, 0, 0, 139, 4, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 82, 1, 0, 0, 25, 2, 1, 40, 82, 3, 2, 0, 38, 7, 3, 127, 135, 4, 8, 0, 7, 0, 0, 0, 139, 4, 0, 0, 140, 2, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 135, 2, 12, 0, 0, 0, 0, 0, 1, 8, 1, 0, 134, 3, 0, 0, 180, 174, 0, 0, 0, 8, 2, 1, 14, 5, 3, 2, 41, 8, 5, 31, 42, 8, 8, 31, 0, 4, 8, 0, 139, 4, 0, 0, 140, 1, 10, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 82, 1, 0, 0, 25, 2, 1, 16, 82, 3, 2, 0, 38, 7, 3, 127, 1, 8, 0, 0, 1, 9, 0, 0, 135, 6, 13, 0, 7, 0, 8, 9, 139, 0, 0, 0, 140, 3, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 136, 8, 0, 0, 0, 7, 8, 0, 82, 3, 0, 0, 38, 8, 3, 32, 0, 4, 8, 0, 32, 5, 4, 0, 121, 5, 4, 0, 134, 8, 0, 0, 236, 87, 0, 0, 1, 2, 0, 0, 139, 0, 0, 0, 140, 1, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 127, 5, 0, 0, 87, 5, 0, 0, 127, 5, 0, 0, 82, 1, 5, 0, 127, 5, 0, 0, 106, 2, 5, 4, 129, 2, 0, 0, 139, 1, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 0, 13, 3, 0, 7, 121, 3, 3, 0, 1, 2, 0, 0, 119, 0, 6, 0, 1, 7, 0, 0, 134, 4, 0, 0, 52, 78, 0, 0, 0, 1, 7, 0, 0, 2, 4, 0, 139, 2, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 134, 1, 0, 0, 248, 211, 0, 0, 1, 7, 188, 0, 3, 2, 1, 7, 82, 3, 2, 0, 134, 4, 0, 0, 96, 115, 0, 0, 0, 3, 0, 0, 139, 4, 0, 0, 140, 3, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 25, 3, 0, 60, 85, 3, 1, 0, 25, 4, 0, 64, 85, 4, 2, 0, 139, 0, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 4, 4, 0, 2, 4, 5, 1, 3, 4, 6, 1, 3, 16, 7, 0, 2, 4, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 1, 6, 3, 0, 135, 1, 45, 0, 6, 0, 0, 0, 76, 6, 1, 0, 58, 2, 6, 0, 59, 6, 100, 0, 66, 3, 2, 6, 139, 3, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 1, 6, 4, 0, 135, 1, 45, 0, 6, 0, 0, 0, 76, 6, 1, 0, 58, 2, 6, 0, 59, 6, 100, 0, 66, 3, 2, 6, 139, 3, 0, 0, 140, 3, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 1, 6, 2, 0, 135, 3, 29, 0, 6, 0, 1, 2, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 112, 168, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 32, 3, 1, 0, 134, 4, 0, 0, 0, 213, 0, 0, 0, 0, 0, 0, 125, 2, 3, 0, 4, 0, 0, 0, 139, 2, 0, 0, 140, 3, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 13, 3, 0, 1, 139, 3, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 60, 6, 0, 0, 64, 66, 15, 0, 65, 1, 0, 6, 75, 2, 1, 0, 1, 6, 232, 3, 6, 6, 2, 6, 38, 6, 6, 255, 0, 3, 6, 0, 135, 6, 57, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 2, 8, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 1, 6, 0, 0, 14, 2, 1, 6, 1, 6, 0, 0, 1, 7, 2, 0, 125, 3, 2, 6, 7, 0, 0, 0, 1, 6, 0, 4, 134, 7, 0, 0, 72, 190, 0, 0, 0, 1, 3, 6, 139, 0, 0, 0, 140, 4, 6, 0, 0, 0, 0, 0, 1, 5, 0, 0, 134, 4, 0, 0, 20, 51, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0, 139, 4, 0, 0, 140, 3, 7, 0, 0, 0, 0, 0, 1, 4, 0, 0, 136, 6, 0, 0, 0, 5, 6, 0, 2, 6, 0, 0, 255, 255, 255, 127, 134, 3, 0, 0, 0, 97, 0, 0, 0, 6, 1, 2, 139, 3, 0, 0, 140, 4, 8, 0, 0, 0, 0, 0, 3, 4, 0, 2, 3, 6, 1, 3, 16, 7, 4, 0, 3, 5, 6, 7, 129, 5, 0, 0, 139, 4, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 3, 0, 0, 232, 212, 0, 0, 0, 0, 0, 0, 134, 3, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 3, 0, 0, 232, 212, 0, 0, 0, 0, 0, 0, 134, 3, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 25, 2, 0, 28, 84, 2, 1, 0, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 25, 2, 0, 30, 84, 2, 1, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 3, 0, 0, 232, 212, 0, 0, 0, 0, 0, 0, 134, 3, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 134, 2, 0, 0, 100, 209, 0, 0, 134, 2, 0, 0, 108, 211, 0, 0, 134, 2, 0, 0, 40, 211, 0, 0, 139, 0, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 4, 192, 53, 82, 0, 4, 0, 1, 4, 192, 53, 25, 5, 0, 0, 85, 4, 5, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 4, 212, 6, 82, 0, 4, 0, 1, 4, 212, 6, 25, 5, 0, 0, 85, 4, 5, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 26, 1, 0, 4, 134, 4, 0, 0, 36, 200, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 26, 1, 0, 4, 134, 4, 0, 0, 36, 200, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 8, 192, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 0, 0, 0, 24, 212, 0, 0, 25, 1, 0, 64, 139, 1, 0, 0, 140, 0, 10, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 12, 35, 1, 4, 9, 0, 1, 5, 7, 0, 1, 6, 8, 0, 1, 7, 6, 0, 1, 8, 18, 0, 1, 9, 6, 22, 134, 2, 0, 0, 232, 104, 0, 0, 3, 4, 5, 6, 7, 8, 9, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 26, 1, 0, 4, 134, 4, 0, 0, 36, 200, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 32, 1, 0, 0, 120, 1, 3, 0, 134, 4, 0, 0, 32, 216, 0, 0, 119, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 135, 3, 38, 0, 0, 0, 0, 0, 134, 3, 0, 0, 108, 160, 0, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 4, 0, 0, 134, 3, 0, 0, 192, 206, 0, 0, 0, 4, 0, 0, 139, 0, 0, 0, 140, 2, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 139, 0, 0, 0, 140, 3, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 1, 5, 0, 0, 139, 5, 0, 0, 140, 2, 2, 0, 0, 0, 0, 0, 137, 0, 0, 0, 132, 0, 0, 1, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 3, 0, 0, 108, 215, 0, 0, 0, 0, 0, 0, 134, 3, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 3, 0, 0, 136, 5, 0, 0, 0, 4, 5, 0, 134, 2, 0, 0, 40, 119, 0, 0, 0, 1, 0, 0, 139, 2, 0, 0, 140, 2, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 4, 255, 255, 139, 4, 0, 0, 140, 2, 6, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 5, 186, 21, 134, 4, 0, 0, 220, 154, 0, 0, 5, 0, 0, 0, 139, 0, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 100, 51, 1, 4, 50, 0, 134, 2, 0, 0, 232, 184, 0, 0, 3, 4, 0, 0, 139, 0, 0, 0, 140, 6, 8, 0, 0, 0, 0, 0, 1, 7, 8, 0, 135, 6, 58, 0, 7, 0, 0, 0, 139, 0, 0, 0, 140, 0, 6, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 197, 53, 1, 4, 10, 0, 1, 5, 11, 0, 134, 2, 0, 0, 236, 205, 0, 0, 3, 4, 5, 0, 139, 0, 0, 0, 140, 2, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 1, 4, 17, 0, 139, 4, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 176, 216, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 176, 216, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 176, 216, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 176, 216, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 48, 7, 85, 0, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 1, 0, 0, 76, 181, 0, 0, 0, 0, 0, 0, 139, 1, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 3, 0, 0, 132, 215, 0, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 255, 0, 19, 1, 0, 1, 41, 1, 1, 24, 42, 2, 0, 8, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 16, 20, 1, 1, 2, 42, 2, 0, 16, 1, 3, 255, 0, 19, 2, 2, 3, 41, 2, 2, 8, 20, 1, 1, 2, 43, 2, 0, 24, 20, 1, 1, 2, 139, 1, 0, 0, 140, 5, 7, 0, 0, 0, 0, 0, 1, 6, 1, 0, 135, 5, 59, 0, 6, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 22, 34, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 2, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 255, 255, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 172, 53, 135, 2, 60, 0, 3, 0, 0, 0, 1, 2, 180, 53, 139, 2, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 108, 53, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 172, 53, 135, 2, 61, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 135, 3, 30, 0, 0, 0, 0, 0, 139, 0, 0, 0, 140, 4, 6, 0, 0, 0, 0, 0, 1, 5, 10, 0, 135, 4, 62, 0, 5, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 161, 21, 134, 2, 0, 0, 220, 154, 0, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 116, 3, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 0, 0, 135, 3, 63, 0, 4, 0, 0, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 224, 4, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 139, 0, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 6, 0, 135, 3, 64, 0, 4, 0, 0, 0, 139, 0, 0, 0, 140, 2, 4, 0, 0, 0, 0, 0, 1, 3, 9, 0, 135, 2, 65, 0, 3, 0, 0, 0, 1, 2, 0, 0, 139, 2, 0, 0, 140, 2, 4, 0, 0, 0, 0, 0, 1, 3, 4, 0, 135, 2, 66, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 0, 1, 0, 0, 0, 0, 0, 135, 0, 67, 0, 139, 0, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 5, 0, 135, 1, 68, 0, 2, 0, 0, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 0, 1, 0, 0, 0, 0, 0, 135, 0, 69, 0, 139, 0, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 3, 0, 135, 1, 70, 0, 2, 0, 0, 0, 139, 0, 0, 0, 140, 0, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 135, 0, 71, 0, 1, 0, 0, 0, 1, 0, 0, 0, 139, 0, 0, 0, 140, 0, 2, 0, 0, 0, 0, 0, 1, 1, 7, 0, 135, 0, 72, 0, 1, 0, 0, 0, 139, 0, 0, 0 ], eb + 51200);
 var relocations = [];
 relocations = relocations.concat([ 80, 780, 1976, 2284, 2464, 2568, 2868, 3044, 3128, 3232, 4452, 4516, 4584, 4676, 4832, 4900, 5236, 5488, 6116, 6300, 6304, 6308, 6312, 6316, 6320, 6324, 6328, 6332, 6336, 6340, 6344, 6348, 6352, 6356, 6360, 6364, 6368, 6372, 6376, 6380, 6384, 6388, 6392, 6396, 6400, 6404, 6408, 6412, 6416, 6420, 6424, 6428, 6432, 6436, 6440, 6444, 6448, 6684, 7684, 8312, 8476, 8712, 8772, 8916, 8920, 8924, 8928, 8932, 8936, 8940, 8944, 8948, 8952, 8956, 8960, 8964, 8968, 8972, 8976, 8980, 8984, 8988, 8992, 8996, 9e3, 9004, 9008, 9012, 9016, 9020, 9024, 9028, 9032, 9036, 9040, 9044, 9048, 9052, 9056, 9060, 9064, 9068, 9072, 9076, 9080, 9084, 9088, 9092, 9096, 9100, 9104, 9108, 9112, 9116, 9120, 9124, 9128, 9132, 9136, 9740, 9744, 9748, 9752, 9756, 9760, 9764, 9768, 10660, 11604, 11912, 11916, 11920, 11924, 11928, 11932, 11936, 11940, 11944, 11948, 15528, 15692, 16884, 18540, 19564, 19684, 19856, 19860, 21212, 21272, 22100, 23328, 23676, 23784, 23788, 23792, 23796, 23800, 23804, 23808, 23812, 23816, 23820, 23824, 23828, 23832, 23836, 23840, 23844, 23848, 23852, 23856, 23860, 23864, 23868, 23872, 24512, 24880, 24936, 25216, 27860, 28e3, 28480, 28964, 29224, 30616, 30620, 30624, 30628, 30632, 30636, 30640, 30644, 30648, 30652, 30656, 30660, 30664, 30668, 30672, 30676, 30680, 30684, 30688, 30692, 30696, 30700, 30704, 30708, 30712, 30716, 30720, 30724, 30728, 30732, 30736, 30740, 30744, 30748, 30752, 30756, 30760, 30764, 30768, 30772, 30776, 30780, 30784, 30788, 30792, 30796, 30800, 30804, 30808, 30812, 30816, 30820, 30824, 30828, 30832, 30836, 30840, 30844, 30848, 30852, 30856, 30860, 30864, 30868, 30872, 30876, 30880, 30884, 30888, 30892, 30896, 30900, 30904, 30908, 30912, 30916, 30920, 30924, 30928, 30932, 30936, 30940, 30944, 30948, 30952, 30956, 30960, 30964, 30968, 30972, 30976, 30980, 30984, 30988, 30992, 30996, 31e3, 31004, 31008, 31012, 31016, 31020, 31024, 31028, 31032, 31036, 31040, 31044, 31048, 31052, 31056, 31060, 31064, 31068, 31072, 31076, 31080, 31084, 31088, 31092, 31096, 31100, 31104, 31108, 31112, 31116, 31120, 31124, 31128, 31132, 31136, 31140, 31144, 31148, 31152, 31156, 31160, 31164, 31168, 31172, 31176, 31180, 31184, 31188, 31192, 31196, 31200, 31204, 31208, 31212, 31216, 31220, 31224, 31228, 31232, 31236, 31240, 31244, 31248, 31252, 31256, 31260, 31264, 31268, 31272, 31276, 31280, 31284, 31288, 31292, 31296, 31300, 31304, 31308, 31312, 31316, 31320, 31324, 31328, 31332, 31336, 31340, 31344, 31348, 31352, 31356, 31360, 31364, 31368, 31372, 31376, 31380, 31384, 31388, 31392, 31396, 31400, 31404, 31408, 31412, 31416, 31420, 31424, 31428, 31432, 31436, 31440, 31444, 31448, 31452, 31456, 31460, 31464, 31468, 31472, 31476, 31480, 31484, 31488, 31492, 31496, 31500, 31504, 31508, 31512, 31516, 31520, 31524, 31528, 31532, 31536, 31540, 31544, 31548, 31552, 31556, 31560, 31564, 31568, 31572, 31576, 31580, 31584, 31588, 31592, 31596, 31600, 31604, 31608, 31612, 31616, 31620, 31624, 31628, 31632, 31636, 31640, 31644, 31648, 31652, 31656, 31660, 31664, 31668, 31672, 31676, 31680, 31684, 31688, 31692, 31696, 31700, 31704, 31708, 31712, 31716, 31720, 31724, 31728, 31732, 31736, 31740, 31744, 31748, 31752, 31756, 31760, 31764, 31768, 31772, 31776, 31780, 31784, 31788, 31792, 31796, 31800, 31804, 31808, 31812, 31816, 31820, 31824, 31828, 31832, 31836, 31840, 31844, 31848, 31852, 31856, 31860, 31864, 31868, 31872, 31876, 31880, 31884, 31888, 31892, 31896, 31900, 31904, 31908, 31912, 31916, 31920, 31924, 31928, 31932, 31936, 31940, 31944, 31948, 31952, 31956, 31960, 31964, 31968, 31972, 31976, 31980, 31984, 31988, 31992, 31996, 32e3, 32004, 32008, 32012, 32016, 32020, 32024, 32028, 32032, 32036, 32040, 32044, 32048, 32052, 32056, 32060, 32064, 32068, 32072, 32076, 32080, 32084, 32088, 32092, 32096, 32100, 32104, 32108, 32112, 32116, 32120, 32124, 32128, 32132, 32136, 32140, 32144, 32148, 32152, 32156, 32160, 32164, 32168, 32172, 32176, 32180, 32184, 32188, 32192, 32196, 32200, 32204, 32208, 32212, 32216, 32220, 32224, 32228, 32232, 32236, 32240, 32244, 32248, 32252, 32256, 32260, 32264, 32268, 32272, 32276, 32280, 32284, 32288, 32292, 32296, 32300, 32304, 32308, 32312, 32316, 32320, 32324, 32328, 32332, 32336, 32340, 32344, 32348, 32352, 32356, 32360, 32364, 32368, 32372, 32376, 32380, 32384, 32388, 32392, 32396, 32400, 32404, 32408, 32412, 32416, 32420, 32424, 32428, 32432, 32436, 32440, 32444, 32448, 32452, 32456, 32460, 32464, 32468, 32472, 32476, 32480, 32484, 32488, 32492, 32496, 32500, 32504, 32508, 32512, 32516, 32520, 32524, 32528, 32532, 32536, 32540, 32544, 32548, 32552, 32556, 32560, 32564, 32568, 32572, 32576, 32580, 32584, 32588, 32592, 32596, 32600, 32604, 32608, 32612, 32616, 32620, 32624, 32628, 32632, 32636, 32640, 32644, 32648, 32652, 32656, 32660, 32664, 32668, 32672, 32676, 32680, 32684, 32688, 32692, 32696, 32700, 32704, 32708, 32712, 32716, 32720, 32724, 32728, 32732, 32736, 32740, 32744, 32748, 32752, 32756, 32760, 32764, 32768, 32772, 32776, 32780, 32784, 32788, 32792, 32796, 32800, 32804, 32808, 32812, 32816, 32820, 32824, 32828, 32832, 32836, 32840, 32844, 32848, 32852, 32856, 32860, 32864, 32868, 32872, 32876, 32880, 32884, 32888, 32892, 32896, 32900, 32904, 32908, 32912, 32916, 32920, 32924, 32928, 32932, 32936, 32940, 32944, 32948, 32952, 32956, 32960, 32964, 32968, 32972, 32976, 32980, 32984, 32988, 32992, 32996, 33e3, 33004, 33008, 33012, 33016, 33020, 33024, 33028, 33032, 33036, 33040, 33044, 33048, 33052, 33056, 33060, 33064, 33068, 33072, 33076, 33080, 33084, 33088, 33092, 33096, 33100, 33104, 33108, 33112, 33116, 33120, 33124, 33128, 33132, 33136, 33140, 33144, 33148, 33152, 33156, 33160, 33164, 33168, 33172, 33176, 33180, 33184, 33188, 33192, 33196, 33200, 33204, 33208, 33212, 33216, 33220, 33224, 33228, 33232, 33236, 33240, 33244, 33248, 33252, 33256, 33260, 33264, 33268, 33272, 33276, 33280, 33284, 33288, 33292, 33296, 33300, 33304, 33308, 33312, 33316, 33320, 33324, 33328, 33332, 33336, 33340, 33344, 33348, 33352, 33356, 33360, 33364, 33368, 33372, 33376, 33380, 33384, 33388, 33392, 33396, 33400, 33404, 33408, 33412, 33416, 33420, 33424, 33428, 33432, 33436, 33440, 33444, 33448, 33452, 33456, 33460, 33464, 33468, 33472, 33476, 33480, 33484, 33488, 33492, 33496, 33500, 33504, 33508, 33512, 33516, 33520, 33524, 33528, 33532, 33536, 33540, 33544, 33548, 33552, 33556, 33560, 33564, 33568, 33572, 33576, 33580, 33584, 33588, 33592, 33596, 33600, 33604, 33608, 33612, 33616, 33620, 33624, 33628, 33632, 33636, 33640, 33644, 33648, 33652, 33656, 33660, 33664, 33668, 33672, 33676, 33680, 33684, 33688, 33692, 33696, 33700, 33704, 33708, 33712, 33716, 33720, 33724, 33728, 33732, 33736, 33740, 33744, 33748, 33752, 33756, 33760, 33764, 33768, 33772, 33776, 33780, 33784, 33788, 33792, 33796, 33800, 33804, 33808, 33812, 33816, 33820, 33824, 33828, 33832, 33836, 33840, 33844, 33848, 33852, 33856, 33860, 33864, 33868, 33872, 33876, 33880, 33884, 33888, 33892, 33896, 33900, 33904, 33908, 33912, 33916, 33920, 33924, 33928, 33932, 33936, 33940, 33944, 33948, 33952, 33956, 33960, 33964, 33968, 33972, 33976, 33980, 33984, 33988, 33992, 33996, 34e3, 34004, 34008, 34012, 34016, 34020, 34024, 34028, 34032, 34036, 34040, 34044, 34048, 34052, 34056, 34060, 34064, 34068, 34072, 34076, 34080, 34084, 34088, 34092, 34096, 34100, 34104, 34108, 34112, 34116, 34120, 34124, 34128, 34132, 34136, 34140, 34144, 34148, 34152, 34156, 34160, 34164, 34168, 34172, 34176, 34180, 34184, 34188, 34192, 34196, 34200, 34204, 34208, 34212, 34216, 34220, 34224, 34228, 34232, 34236, 34240, 34244, 34248, 34252, 34256, 34260, 34264, 34268, 34272, 34276, 34280, 34284, 34288, 34292, 34296, 34300, 34304, 34308, 34312, 34316, 34320, 34324, 34328, 34332, 34336, 34340, 34344, 34348, 34352, 34356, 34360, 34364, 34368, 34372, 34376, 34380, 34384, 34388, 34392, 34396, 34400, 34404, 34408, 34412, 34416, 34420, 34424, 34428, 34432, 34436, 34440, 34444, 34448, 34452, 34456, 34460, 34464, 34468, 34472, 34476, 34480, 34484, 34488, 34492, 34496, 34500, 34504, 34508, 34512, 34516, 34520, 34524, 34528, 34532, 34536, 34540, 34544, 34548, 34552, 34556, 34560, 34564, 34568, 34572, 34576, 34580, 34584, 34588, 34592, 34596, 34600, 34604, 34608, 34612, 34616, 34620, 34624, 34628, 34632, 34636, 34640, 34644, 34648, 34652, 34656, 34660, 34664, 34668, 34672, 34676, 34680, 34684, 34688, 34692, 34696, 34700, 34704, 34708, 34712, 34716, 34720, 34724, 34728, 34732, 34736, 34740, 34744, 34748, 34752, 34756, 34760, 34764, 34768, 34772, 34776, 34780, 34784, 34788, 34792, 34796, 34800, 34804, 34808, 34812, 34816, 34820, 34824, 34828, 34832, 34836, 34840, 34844, 34848, 34852, 34856, 34860, 34864, 34868, 34872, 34876, 34880, 34884, 34888, 34892, 34896, 34900, 34904, 34908, 34912, 34916, 34920, 34924, 34928, 34932, 34936, 34940, 34944, 34948, 34952, 34956, 34960, 34964, 34968, 34972, 34976, 34980, 34984, 34988, 34992, 34996, 35e3, 35004, 35008, 35012, 35016, 35020, 35024, 35028, 35032, 35036, 35040, 35044, 35048, 35052, 35056, 35060, 35064, 35068, 35072, 35076, 35080, 35084, 35088, 35092, 35096, 35100, 35104, 35108, 35112, 35116, 35120, 35124, 35128, 35132, 35136, 35140, 35144, 35148, 35152, 35156, 35160, 35164, 35168, 35172, 35176, 35180, 35184, 35188, 35192, 35196, 35200, 35204, 35208, 35212, 35216, 35220, 35224, 35228, 35232, 35236, 35240, 35244, 35248, 35252, 35256, 35260, 35264, 35268, 35272, 35276, 35280, 35284, 35288, 35292, 35296, 35300, 35304, 35308, 35312, 35316, 35320, 35324, 35328, 35332, 35336, 35340, 35344, 35348, 35352, 35356, 35360, 35364, 35368, 35372, 35376, 35380, 35384, 35388, 35392, 35396, 35400, 35404, 35408, 35412, 35416, 35420, 35424, 35428, 35432, 35436, 35440, 35444, 35448, 35452, 35456, 35460, 35464, 35468, 35472, 35476, 35480, 35484, 35488, 35492, 35496, 35500, 35504, 35508, 35512, 35516, 35520, 35524, 35528, 35532, 35536, 35540, 35544, 35548, 35552, 35556, 35560, 35564, 35568, 35572, 35576, 35580, 35584, 35588, 35592, 35596, 35600, 35604, 35608, 35612, 35616, 35620, 35624, 35628, 35632, 35636, 35640, 35644, 35648, 35652, 35656, 35660, 35664, 35668, 35672, 35676, 35680, 35684, 35688, 35692, 35696, 35700, 35704, 35708, 35712, 35716, 35720, 35724, 35728, 35732, 35736, 35740, 35744, 35748, 35752, 35756, 35760, 35764, 35768, 35772, 35776, 35780, 35784, 35788, 35792, 35796, 35800, 35804, 35808, 35812, 35816, 35820, 35824, 35828, 35832, 35836, 35840, 35844, 35848, 35852, 35856, 35860, 35864, 35868, 35872, 35876, 35880, 35884, 35888, 35892, 35896, 35900, 35904, 35908, 35912, 35916, 35920, 35924, 35928, 35932, 35936, 35940, 35944, 35948, 35952, 35956, 35960, 35964, 35968, 35972, 35976, 35980, 35984, 35988, 35992, 35996, 36e3, 36004, 36008, 36012, 36016, 36020, 36024, 36028, 36032, 36036, 36040, 36044, 36048, 36052, 36056, 36060, 36064, 36068, 36072, 36076, 36080, 36084, 36088, 36092, 36096, 36100, 36104, 36108, 36112, 36116, 36120, 36124, 36128, 36132, 36136, 36140, 36144, 36148, 36152, 36156, 36160, 36164, 36168, 36172, 36176, 36180, 36184, 36188, 36192, 36196, 36200, 36204, 36208, 36212, 36216, 36220, 36224, 36228, 36232, 36236, 36240, 36244, 36248, 36252, 36256, 36260, 36264, 36268, 36272, 36276, 36280, 36284, 36288, 36292, 36296, 36300, 36304, 36308, 36312, 36316, 36320, 36324, 36328, 36332, 36336, 36340, 36344, 36348, 36352, 36356, 36360, 36364, 36368, 36372, 36376, 36380, 36384, 36388, 36392, 36396, 36400, 36404, 36408, 36412, 36416, 36420, 36424, 36428, 36432, 36436, 36440, 36444, 36448, 36452, 36456, 36460, 36464, 36468, 36472, 36476, 36480, 36484, 36488, 36492, 36496, 36500, 36504, 36508, 36512, 36516, 36520, 36524, 36528, 36532, 36536, 36540, 36544, 36548, 36552, 36556, 36560, 36564, 36568, 36572, 36576, 36580, 36584, 36588, 36592, 36596, 36600, 36604, 36608, 36612, 36616, 36620, 36624, 36628, 36632, 36636, 36640, 36644, 36648, 36652, 36656, 36660, 36664, 36668, 36672, 36676, 36680, 36684, 36688, 36692, 36696, 36700, 36704, 36708, 36712, 36716, 36720, 36724, 36728, 36732, 36736, 36740, 36744, 36748, 36752, 36756, 36760, 36764, 36768, 36772, 36776, 36780, 36784, 36788, 36792, 36796, 36800, 36804, 36808, 36812, 36816, 36820, 36824, 36828, 36832, 36836, 36840, 36844, 36848, 36852, 36856, 36860, 36864, 36868, 36872, 36876, 36880, 36884, 36888, 36892, 36896, 36900, 36904, 36908, 36912, 36916, 36920, 36924, 36928, 36932, 36936, 36940, 36944, 36948, 36952, 36956, 36960, 36964, 36968, 36972, 36976, 36980, 36984, 36988, 36992, 36996, 37e3, 37004, 37008, 37012, 37016, 37020, 37024, 37028, 37032, 37036, 37040, 37044, 37048, 37052, 37056, 37060, 37064, 37068, 37072, 37076, 37080, 37084, 37088, 37092, 37096, 37100, 37104, 37108, 37112, 37116, 37120, 37124, 37128, 37132, 37136, 37140, 37144, 37148, 37152, 37156, 37160, 37164, 37168, 37172, 37176, 37180, 37184, 37188, 37192, 37196, 37200, 37204, 37208, 37212, 37216, 37220, 37224, 37228, 37232, 37236, 37240, 37244, 37248, 37252, 37256, 37260, 37264, 37268, 37272, 37276, 37280, 37284, 37288, 37292, 37296, 37300, 37304, 37308, 37312, 37316, 37320, 37324, 37328, 37332, 37336, 37340, 37344, 37348, 37352, 37356, 37360, 37364, 37368, 37372, 37376, 37380, 37384, 37388, 37392, 37396, 37400, 37404, 37408, 37412, 37416, 37420, 37424, 37428, 37432, 37436, 37440, 37444, 37448, 37452, 37456, 37460, 37464, 37468, 37472, 37476, 37480, 37484, 37488, 37492, 37496, 37500, 37504, 37508, 37512, 37516, 37520, 37524, 37528, 37532, 37536, 37540, 37544, 37548, 37552, 37556, 37560, 37564, 37568, 37572, 37576, 37580, 37584, 37588, 37592, 37596, 37600, 37604, 37608, 37612, 37616, 37620, 37624, 37628, 37632, 37636, 37640, 37644, 37648, 37652, 37656, 37660, 37664, 37668, 37672, 37676, 37680, 37684, 37688, 37692, 37696, 37700, 37704, 37708, 37712, 37716, 37720, 37724, 37728, 37732, 37736, 37740, 37744, 37748, 37752, 37756, 37760, 37764, 37768, 37772, 37776, 37780, 37784, 37788, 37792, 37796, 37800, 37804, 37808, 37812, 37816, 37820, 37824, 37828, 37832, 37836, 37840, 37844, 37848, 37852, 37856, 37860, 37864, 37868, 37872, 37876, 37880, 37884, 37888, 37892, 37896, 37900, 37904, 37908, 37912, 37916, 37920, 37924, 37928, 37932, 37936, 37940, 37944, 37948, 37952, 37956, 37960, 37964, 37968, 37972, 37976, 37980, 37984, 37988, 37992, 37996, 38e3, 38004, 38008, 38012, 38016, 38020, 38024, 38028, 38032, 38036, 38040, 38044, 38048, 38052, 38056, 38060, 38064, 38068, 38072, 38076, 38080, 38084, 38088, 38092, 38096, 38100, 38104, 38108, 38112, 38116, 38120, 38124, 38128, 38132, 38136, 38140, 38144, 38148, 38152, 38156, 38160, 38164, 38168, 38172, 38176, 38180, 38184, 38188, 38192, 38196, 38200, 38204, 38208, 38212, 38216, 38220, 38224, 38228, 38232, 38236, 38240, 38244, 38248, 38252, 38256, 38260, 38264, 38268, 38272, 38276, 38280, 38284, 38288, 38292, 38296, 38300, 38304, 38308, 38312, 38316, 38320, 38324, 38328, 38332, 38336, 38340, 38344, 38348, 38352, 38356, 38360, 38364, 38368, 38372, 38376, 38380, 38384, 38388, 38392, 38396, 38400, 38404, 38408, 38412, 38416, 38420, 38424, 38428, 38432, 38436, 38440, 38444, 38448, 38452, 38456, 38460, 38464, 38468, 38472, 38476, 38480, 38484, 38488, 38492, 38496, 38500, 38504, 38508, 38512, 38516, 38520, 38524, 38528, 38532, 38536, 38540, 38544, 38548, 38552, 38556, 38560, 38564, 38568, 38572, 38576, 38580, 38584, 38588, 38592, 38596, 38600, 38604, 38608, 38612, 38616, 38620, 38624, 38628, 38632, 38636, 38640, 38644, 38648, 38652, 38656, 38660, 38664, 38668, 38672, 38676, 38680, 38684, 38688, 38692, 38696, 38700, 38704, 38708, 38712, 38716, 38720, 38724, 38728, 38732, 38736, 38740, 38744, 38748, 38752, 38756, 38760, 38764, 38768, 38772, 38776, 38780, 38784, 38788, 38792, 38796, 38800, 38804, 39920, 40276, 40564, 40924, 41364, 43164, 45576, 46636, 46756, 47380, 47524, 47812, 47992, 48124, 48756, 48760, 48864, 49292, 49412, 50248, 50596, 50832, 50928, 51016, 51924, 51928, 51932, 52e3, 52004, 52008, 140, 260, 352, 760, 1252, 1272, 1300, 1336, 1376, 1404, 1428, 1784, 1808, 1836, 4012, 4276, 4292, 4324, 4404, 4652, 4712, 4804, 4972, 5100, 5204, 5312, 5364, 5588, 5708, 5740, 5768, 5928, 5944, 5960, 5988, 6204, 6704, 7936, 8104, 8736, 9296, 9460, 9620, 9668, 9680, 10092, 10396, 10560, 10636, 10800, 10908, 10996, 11048, 11320, 11428, 11444, 11476, 11504, 11524, 11552, 11704, 13384, 13992, 14116, 14224, 14348, 14580, 14600, 14620, 14676, 14808, 14896, 14960, 15128, 15592, 15616, 15704, 15764, 16188, 17012, 17188, 17412, 17432, 17452, 17596, 17624, 17708, 17796, 17824, 18568, 18600, 18624, 18760, 18796, 18872, 18892, 19004, 19044, 19072, 19124, 19144, 19164, 19712, 20108, 20188, 20636, 21292, 21344, 21480, 21612, 21680, 21732, 21752, 21828, 22012, 22140, 22268, 22444, 22480, 22496, 22552, 22956, 22972, 23032, 23080, 23120, 23172, 23208, 23228, 23244, 23268, 23464, 23988, 24164, 24312, 24340, 24428, 24452, 24568, 24592, 24616, 24684, 24776, 24988, 25100, 25256, 25620, 25676, 25696, 25716, 26312, 26432, 26448, 26544, 26880, 27204, 27568, 27620, 27888, 27944, 28172, 28196, 28228, 28316, 28324, 28404, 28536, 28764, 28784, 28824, 28860, 29036, 29248, 29412, 29512, 29768, 29880, 30052, 30196, 38924, 39696, 39720, 39824, 39864, 40188, 40204, 40316, 40328, 40340, 40356, 40380, 40408, 40428, 40456, 40492, 40508, 40656, 41052, 41160, 41284, 41296, 41304, 41480, 41544, 41584, 41812, 42164, 42284, 42768, 43252, 43328, 43372, 43432, 43476, 44356, 44376, 44788, 44804, 44828, 44848, 44968, 44996, 45164, 45404, 45424, 45688, 45712, 45784, 45868, 45948, 45972, 46480, 46544, 46684, 46892, 46964, 46988, 47152, 47228, 47252, 47300, 47320, 47464, 47604, 47736, 47756, 47844, 47872, 48200, 48272, 48464, 48572, 48928, 48944, 49216, 49356, 49636, 49660, 49764, 49788, 49828, 49876, 49972, 49996, 50048, 50164, 50188, 50284, 50384, 50408, 50632, 50648, 50748, 50772, 50868, 50956, 51052, 51124, 51212, 51224, 51288, 51304, 51648, 51776, 51824, 52224, 52352, 52464, 52504, 52524, 52776, 52816, 52980, 53008, 53056, 53124, 53136, 53172, 53184, 53284, 53296, 53332, 53340, 53348, 53480, 53520, 53556, 53592, 53656, 53700, 53744, 53784, 53820, 53928, 53940, 53976, 54044, 54088, 54160, 54224, 54256, 54288, 54320, 54408, 54492, 55356 ]);
 for (var i = 0; i < relocations.length; i++) {
  assert(relocations[i] % 4 === 0);
  assert(relocations[i] >= 0 && relocations[i] < eb + 55736);
  assert(HEAPU32[eb + relocations[i] >> 2] + eb < -1 >>> 0, [ i, relocations[i] ]);
  HEAPU32[eb + relocations[i] >> 2] = HEAPU32[eb + relocations[i] >> 2] + eb;
 }
}));
function _emscripten_get_now() {
 abort();
}
function _emscripten_get_now_is_monotonic() {
 return ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"];
}
var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else Module.printErr("failed to set errno from JS");
 return value;
}
function _clock_gettime(clk_id, tp) {
 var now;
 if (clk_id === 0) {
  now = Date.now();
 } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
  now = _emscripten_get_now();
 } else {
  ___setErrNo(ERRNO_CODES.EINVAL);
  return -1;
 }
 HEAP32[tp >> 2] = now / 1e3 | 0;
 HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
 return 0;
}
var ERRNO_MESSAGES = {
 0: "Success",
 1: "Not super-user",
 2: "No such file or directory",
 3: "No such process",
 4: "Interrupted system call",
 5: "I/O error",
 6: "No such device or address",
 7: "Arg list too long",
 8: "Exec format error",
 9: "Bad file number",
 10: "No children",
 11: "No more processes",
 12: "Not enough core",
 13: "Permission denied",
 14: "Bad address",
 15: "Block device required",
 16: "Mount device busy",
 17: "File exists",
 18: "Cross-device link",
 19: "No such device",
 20: "Not a directory",
 21: "Is a directory",
 22: "Invalid argument",
 23: "Too many open files in system",
 24: "Too many open files",
 25: "Not a typewriter",
 26: "Text file busy",
 27: "File too large",
 28: "No space left on device",
 29: "Illegal seek",
 30: "Read only file system",
 31: "Too many links",
 32: "Broken pipe",
 33: "Math arg out of domain of func",
 34: "Math result not representable",
 35: "File locking deadlock error",
 36: "File or path name too long",
 37: "No record locks available",
 38: "Function not implemented",
 39: "Directory not empty",
 40: "Too many symbolic links",
 42: "No message of desired type",
 43: "Identifier removed",
 44: "Channel number out of range",
 45: "Level 2 not synchronized",
 46: "Level 3 halted",
 47: "Level 3 reset",
 48: "Link number out of range",
 49: "Protocol driver not attached",
 50: "No CSI structure available",
 51: "Level 2 halted",
 52: "Invalid exchange",
 53: "Invalid request descriptor",
 54: "Exchange full",
 55: "No anode",
 56: "Invalid request code",
 57: "Invalid slot",
 59: "Bad font file fmt",
 60: "Device not a stream",
 61: "No data (for no delay io)",
 62: "Timer expired",
 63: "Out of streams resources",
 64: "Machine is not on the network",
 65: "Package not installed",
 66: "The object is remote",
 67: "The link has been severed",
 68: "Advertise error",
 69: "Srmount error",
 70: "Communication error on send",
 71: "Protocol error",
 72: "Multihop attempted",
 73: "Cross mount point (not really error)",
 74: "Trying to read unreadable message",
 75: "Value too large for defined data type",
 76: "Given log. name not unique",
 77: "f.d. invalid for this operation",
 78: "Remote address changed",
 79: "Can   access a needed shared lib",
 80: "Accessing a corrupted shared lib",
 81: ".lib section in a.out corrupted",
 82: "Attempting to link in too many libs",
 83: "Attempting to exec a shared library",
 84: "Illegal byte sequence",
 86: "Streams pipe error",
 87: "Too many users",
 88: "Socket operation on non-socket",
 89: "Destination address required",
 90: "Message too long",
 91: "Protocol wrong type for socket",
 92: "Protocol not available",
 93: "Unknown protocol",
 94: "Socket type not supported",
 95: "Not supported",
 96: "Protocol family not supported",
 97: "Address family not supported by protocol family",
 98: "Address already in use",
 99: "Address not available",
 100: "Network interface is not configured",
 101: "Network is unreachable",
 102: "Connection reset by network",
 103: "Connection aborted",
 104: "Connection reset by peer",
 105: "No buffer space available",
 106: "Socket is already connected",
 107: "Socket is not connected",
 108: "Can't send after socket shutdown",
 109: "Too many references",
 110: "Connection timed out",
 111: "Connection refused",
 112: "Host is down",
 113: "Host is unreachable",
 114: "Socket already connected",
 115: "Connection already in progress",
 116: "Stale file handle",
 122: "Quota exceeded",
 123: "No medium (in tape drive)",
 125: "Operation canceled",
 130: "Previous owner died",
 131: "State not recoverable"
};
var PATH = {
 splitPath: (function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 }),
 normalizeArray: (function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (; up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 }),
 normalize: (function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 }),
 dirname: (function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 }),
 basename: (function(path) {
  if (path === "/") return "/";
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 }),
 extname: (function(path) {
  return PATH.splitPath(path)[3];
 }),
 join: (function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 }),
 join2: (function(l, r) {
  return PATH.normalize(l + "/" + r);
 }),
 resolve: (function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path !== "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function(p) {
   return !!p;
  })), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 }),
 relative: (function(from, to) {
  from = PATH.resolve(from).substr(1);
  to = PATH.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (; start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (; end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 })
};
var TTY = {
 ttys: [],
 init: (function() {}),
 shutdown: (function() {}),
 register: (function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 }),
 stream_ops: {
  open: (function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   stream.tty = tty;
   stream.seekable = false;
  }),
  close: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  flush: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  read: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  }),
  write: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   for (var i = 0; i < length; i++) {
    try {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  })
 },
 default_tty_ops: {
  get_char: (function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = new Buffer(BUFSIZE);
     var bytesRead = 0;
     var isPosixPlatform = process.platform != "win32";
     var fd = process.stdin.fd;
     if (isPosixPlatform) {
      var usingDevice = false;
      try {
       fd = fs.openSync("/dev/stdin", "r");
       usingDevice = true;
      } catch (e) {}
     }
     try {
      bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
     } catch (e) {
      if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e;
     }
     if (usingDevice) {
      fs.closeSync(fd);
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  }),
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 },
 default_tty1_ops: {
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 }
};
var MEMFS = {
 ops_table: null,
 mount: (function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 }),
 getFileDataAsRegularArray: (function(node) {
  if (node.contents && node.contents.subarray) {
   var arr = [];
   for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
   return arr;
  }
  return node.contents;
 }),
 getFileDataAsTypedArray: (function(node) {
  if (!node.contents) return new Uint8Array;
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 }),
 expandFileStorage: (function(node, newCapacity) {
  if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
   node.contents = MEMFS.getFileDataAsRegularArray(node);
   node.usedBytes = node.contents.length;
  }
  if (!node.contents || node.contents.subarray) {
   var prevCapacity = node.contents ? node.contents.length : 0;
   if (prevCapacity >= newCapacity) return;
   var CAPACITY_DOUBLING_MAX = 1024 * 1024;
   newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
   if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
   var oldContents = node.contents;
   node.contents = new Uint8Array(newCapacity);
   if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
   return;
  }
  if (!node.contents && newCapacity > 0) node.contents = [];
  while (node.contents.length < newCapacity) node.contents.push(0);
 }),
 resizeFileStorage: (function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
   return;
  }
  if (!node.contents || node.contents.subarray) {
   var oldContents = node.contents;
   node.contents = new Uint8Array(new ArrayBuffer(newSize));
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
   return;
  }
  if (!node.contents) node.contents = [];
  if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
  node.usedBytes = newSize;
 }),
 node_ops: {
  getattr: (function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  }),
  setattr: (function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  }),
  lookup: (function(parent, name) {
   throw FS.genericErrors[ERRNO_CODES.ENOENT];
  }),
  mknod: (function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  }),
  rename: (function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   old_node.parent = new_dir;
  }),
  unlink: (function(parent, name) {
   delete parent.contents[name];
  }),
  rmdir: (function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
   }
   delete parent.contents[name];
  }),
  readdir: (function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  }),
  symlink: (function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  }),
  readlink: (function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return node.link;
  })
 },
 stream_ops: {
  read: (function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  }),
  write: (function(stream, buffer, offset, length, position, canOwn) {
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     assert(position === 0, "canOwn must imply no weird position inside the file");
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  }),
  allocate: (function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  }),
  mmap: (function(stream, buffer, offset, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < stream.node.usedBytes) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = _malloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
    }
    buffer.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  }),
  msync: (function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  })
 }
};
var IDBFS = {
 dbs: {},
 indexedDB: (function() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  var ret = null;
  if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBFS used, but indexedDB not supported");
  return ret;
 }),
 DB_VERSION: 21,
 DB_STORE_NAME: "FILE_DATA",
 mount: (function(mount) {
  return MEMFS.mount.apply(null, arguments);
 }),
 syncfs: (function(mount, populate, callback) {
  IDBFS.getLocalSet(mount, (function(err, local) {
   if (err) return callback(err);
   IDBFS.getRemoteSet(mount, (function(err, remote) {
    if (err) return callback(err);
    var src = populate ? remote : local;
    var dst = populate ? local : remote;
    IDBFS.reconcile(src, dst, callback);
   }));
  }));
 }),
 getDB: (function(name, callback) {
  var db = IDBFS.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  if (!req) {
   return callback("Unable to connect to IndexedDB");
  }
  req.onupgradeneeded = (function(e) {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
   }
   if (!fileStore.indexNames.contains("timestamp")) {
    fileStore.createIndex("timestamp", "timestamp", {
     unique: false
    });
   }
  });
  req.onsuccess = (function() {
   db = req.result;
   IDBFS.dbs[name] = db;
   callback(null, db);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 getLocalSet: (function(mount, callback) {
  var entries = {};
  function isRealDir(p) {
   return p !== "." && p !== "..";
  }
  function toAbsolute(root) {
   return (function(p) {
    return PATH.join2(root, p);
   });
  }
  var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  while (check.length) {
   var path = check.pop();
   var stat;
   try {
    stat = FS.stat(path);
   } catch (e) {
    return callback(e);
   }
   if (FS.isDir(stat.mode)) {
    check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
   }
   entries[path] = {
    timestamp: stat.mtime
   };
  }
  return callback(null, {
   type: "local",
   entries: entries
  });
 }),
 getRemoteSet: (function(mount, callback) {
  var entries = {};
  IDBFS.getDB(mount.mountpoint, (function(err, db) {
   if (err) return callback(err);
   var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readonly");
   transaction.onerror = (function(e) {
    callback(this.error);
    e.preventDefault();
   });
   var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
   var index = store.index("timestamp");
   index.openKeyCursor().onsuccess = (function(event) {
    var cursor = event.target.result;
    if (!cursor) {
     return callback(null, {
      type: "remote",
      db: db,
      entries: entries
     });
    }
    entries[cursor.primaryKey] = {
     timestamp: cursor.key
    };
    cursor.continue();
   });
  }));
 }),
 loadLocalEntry: (function(path, callback) {
  var stat, node;
  try {
   var lookup = FS.lookupPath(path);
   node = lookup.node;
   stat = FS.stat(path);
  } catch (e) {
   return callback(e);
  }
  if (FS.isDir(stat.mode)) {
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode
   });
  } else if (FS.isFile(stat.mode)) {
   node.contents = MEMFS.getFileDataAsTypedArray(node);
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode,
    contents: node.contents
   });
  } else {
   return callback(new Error("node type not supported"));
  }
 }),
 storeLocalEntry: (function(path, entry, callback) {
  try {
   if (FS.isDir(entry.mode)) {
    FS.mkdir(path, entry.mode);
   } else if (FS.isFile(entry.mode)) {
    FS.writeFile(path, entry.contents, {
     encoding: "binary",
     canOwn: true
    });
   } else {
    return callback(new Error("node type not supported"));
   }
   FS.chmod(path, entry.mode);
   FS.utime(path, entry.timestamp, entry.timestamp);
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 removeLocalEntry: (function(path, callback) {
  try {
   var lookup = FS.lookupPath(path);
   var stat = FS.stat(path);
   if (FS.isDir(stat.mode)) {
    FS.rmdir(path);
   } else if (FS.isFile(stat.mode)) {
    FS.unlink(path);
   }
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 loadRemoteEntry: (function(store, path, callback) {
  var req = store.get(path);
  req.onsuccess = (function(event) {
   callback(null, event.target.result);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 storeRemoteEntry: (function(store, path, entry, callback) {
  var req = store.put(entry, path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 removeRemoteEntry: (function(store, path, callback) {
  var req = store.delete(path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 reconcile: (function(src, dst, callback) {
  var total = 0;
  var create = [];
  Object.keys(src.entries).forEach((function(key) {
   var e = src.entries[key];
   var e2 = dst.entries[key];
   if (!e2 || e.timestamp > e2.timestamp) {
    create.push(key);
    total++;
   }
  }));
  var remove = [];
  Object.keys(dst.entries).forEach((function(key) {
   var e = dst.entries[key];
   var e2 = src.entries[key];
   if (!e2) {
    remove.push(key);
    total++;
   }
  }));
  if (!total) {
   return callback(null);
  }
  var completed = 0;
  var db = src.type === "remote" ? src.db : dst.db;
  var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readwrite");
  var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return callback(err);
    }
    return;
   }
   if (++completed >= total) {
    return callback(null);
   }
  }
  transaction.onerror = (function(e) {
   done(this.error);
   e.preventDefault();
  });
  create.sort().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.loadRemoteEntry(store, path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeLocalEntry(path, entry, done);
    }));
   } else {
    IDBFS.loadLocalEntry(path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeRemoteEntry(store, path, entry, done);
    }));
   }
  }));
  remove.sort().reverse().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.removeLocalEntry(path, done);
   } else {
    IDBFS.removeRemoteEntry(store, path, done);
   }
  }));
 })
};
var NODEFS = {
 isWindows: false,
 staticInit: (function() {
  NODEFS.isWindows = !!process.platform.match(/^win/);
 }),
 mount: (function(mount) {
  assert(ENVIRONMENT_IS_NODE);
  return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = FS.createNode(parent, name, mode);
  node.node_ops = NODEFS.node_ops;
  node.stream_ops = NODEFS.stream_ops;
  return node;
 }),
 getMode: (function(path) {
  var stat;
  try {
   stat = fs.lstatSync(path);
   if (NODEFS.isWindows) {
    stat.mode = stat.mode | (stat.mode & 146) >> 1;
   }
  } catch (e) {
   if (!e.code) throw e;
   throw new FS.ErrnoError(ERRNO_CODES[e.code]);
  }
  return stat.mode;
 }),
 realPath: (function(node) {
  var parts = [];
  while (node.parent !== node) {
   parts.push(node.name);
   node = node.parent;
  }
  parts.push(node.mount.opts.root);
  parts.reverse();
  return PATH.join.apply(null, parts);
 }),
 flagsToPermissionStringMap: {
  0: "r",
  1: "r+",
  2: "r+",
  64: "r",
  65: "r+",
  66: "r+",
  129: "rx+",
  193: "rx+",
  514: "w+",
  577: "w",
  578: "w+",
  705: "wx",
  706: "wx+",
  1024: "a",
  1025: "a",
  1026: "a+",
  1089: "a",
  1090: "a+",
  1153: "ax",
  1154: "ax+",
  1217: "ax",
  1218: "ax+",
  4096: "rs",
  4098: "rs+"
 },
 flagsToPermissionString: (function(flags) {
  flags &= ~2097152;
  flags &= ~2048;
  flags &= ~32768;
  flags &= ~524288;
  if (flags in NODEFS.flagsToPermissionStringMap) {
   return NODEFS.flagsToPermissionStringMap[flags];
  } else {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
 }),
 node_ops: {
  getattr: (function(node) {
   var path = NODEFS.realPath(node);
   var stat;
   try {
    stat = fs.lstatSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (NODEFS.isWindows && !stat.blksize) {
    stat.blksize = 4096;
   }
   if (NODEFS.isWindows && !stat.blocks) {
    stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
   }
   return {
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime,
    blksize: stat.blksize,
    blocks: stat.blocks
   };
  }),
  setattr: (function(node, attr) {
   var path = NODEFS.realPath(node);
   try {
    if (attr.mode !== undefined) {
     fs.chmodSync(path, attr.mode);
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     var date = new Date(attr.timestamp);
     fs.utimesSync(path, date, date);
    }
    if (attr.size !== undefined) {
     fs.truncateSync(path, attr.size);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  lookup: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   var mode = NODEFS.getMode(path);
   return NODEFS.createNode(parent, name, mode);
  }),
  mknod: (function(parent, name, mode, dev) {
   var node = NODEFS.createNode(parent, name, mode, dev);
   var path = NODEFS.realPath(node);
   try {
    if (FS.isDir(node.mode)) {
     fs.mkdirSync(path, node.mode);
    } else {
     fs.writeFileSync(path, "", {
      mode: node.mode
     });
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return node;
  }),
  rename: (function(oldNode, newDir, newName) {
   var oldPath = NODEFS.realPath(oldNode);
   var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
   try {
    fs.renameSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  unlink: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.unlinkSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  rmdir: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.rmdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readdir: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    return fs.readdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  symlink: (function(parent, newName, oldPath) {
   var newPath = PATH.join2(NODEFS.realPath(parent), newName);
   try {
    fs.symlinkSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readlink: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    path = fs.readlinkSync(path);
    path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
    return path;
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  })
 },
 stream_ops: {
  open: (function(stream) {
   var path = NODEFS.realPath(stream.node);
   try {
    if (FS.isFile(stream.node.mode)) {
     stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  close: (function(stream) {
   try {
    if (FS.isFile(stream.node.mode) && stream.nfd) {
     fs.closeSync(stream.nfd);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  read: (function(stream, buffer, offset, length, position) {
   if (length === 0) return 0;
   var nbuffer = new Buffer(length);
   var res;
   try {
    res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (res > 0) {
    for (var i = 0; i < res; i++) {
     buffer[offset + i] = nbuffer[i];
    }
   }
   return res;
  }),
  write: (function(stream, buffer, offset, length, position) {
   var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
   var res;
   try {
    res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return res;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     try {
      var stat = fs.fstatSync(stream.nfd);
      position += stat.size;
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
     }
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  })
 }
};
var WORKERFS = {
 DIR_MODE: 16895,
 FILE_MODE: 33279,
 reader: null,
 mount: (function(mount) {
  assert(ENVIRONMENT_IS_WORKER);
  if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync;
  var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
  var createdParents = {};
  function ensureParent(path) {
   var parts = path.split("/");
   var parent = root;
   for (var i = 0; i < parts.length - 1; i++) {
    var curr = parts.slice(0, i + 1).join("/");
    if (!createdParents[curr]) {
     createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
    }
    parent = createdParents[curr];
   }
   return parent;
  }
  function base(path) {
   var parts = path.split("/");
   return parts[parts.length - 1];
  }
  Array.prototype.forEach.call(mount.opts["files"] || [], (function(file) {
   WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
  }));
  (mount.opts["blobs"] || []).forEach((function(obj) {
   WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
  }));
  (mount.opts["packages"] || []).forEach((function(pack) {
   pack["metadata"].files.forEach((function(file) {
    var name = file.filename.substr(1);
    WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end));
   }));
  }));
  return root;
 }),
 createNode: (function(parent, name, mode, dev, contents, mtime) {
  var node = FS.createNode(parent, name, mode);
  node.mode = mode;
  node.node_ops = WORKERFS.node_ops;
  node.stream_ops = WORKERFS.stream_ops;
  node.timestamp = (mtime || new Date).getTime();
  assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
  if (mode === WORKERFS.FILE_MODE) {
   node.size = contents.size;
   node.contents = contents;
  } else {
   node.size = 4096;
   node.contents = {};
  }
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 }),
 node_ops: {
  getattr: (function(node) {
   return {
    dev: 1,
    ino: undefined,
    mode: node.mode,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: undefined,
    size: node.size,
    atime: new Date(node.timestamp),
    mtime: new Date(node.timestamp),
    ctime: new Date(node.timestamp),
    blksize: 4096,
    blocks: Math.ceil(node.size / 4096)
   };
  }),
  setattr: (function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
  }),
  lookup: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }),
  mknod: (function(parent, name, mode, dev) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  rename: (function(oldNode, newDir, newName) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  unlink: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  rmdir: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  readdir: (function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  }),
  symlink: (function(parent, newName, oldPath) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  readlink: (function(node) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  })
 },
 stream_ops: {
  read: (function(stream, buffer, offset, length, position) {
   if (position >= stream.node.size) return 0;
   var chunk = stream.node.contents.slice(position, position + length);
   var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
   buffer.set(new Uint8Array(ab), offset);
   return chunk.size;
  }),
  write: (function(stream, buffer, offset, length, position) {
   throw new FS.ErrnoError(ERRNO_CODES.EIO);
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.size;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  })
 }
};
STATICTOP += 16;
STATICTOP += 16;
STATICTOP += 16;
var FS = {
 root: null,
 mounts: [],
 devices: [ null ],
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 trackingDelegate: {},
 tracking: {
  openFlags: {
   READ: 1,
   WRITE: 2
  }
 },
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 handleFSError: (function(e) {
  if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
  return ___setErrNo(e.errno);
 }),
 lookupPath: (function(path, opts) {
  path = PATH.resolve(FS.cwd(), path);
  opts = opts || {};
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
  }
  var parts = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 }),
 getPath: (function(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 }),
 hashName: (function(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 }),
 hashAddNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 }),
 hashRemoveNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 }),
 lookupNode: (function(parent, name) {
  var err = FS.mayLookup(parent);
  if (err) {
   throw new FS.ErrnoError(err, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 }),
 createNode: (function(parent, name, mode, rdev) {
  if (!FS.FSNode) {
   FS.FSNode = (function(parent, name, mode, rdev) {
    if (!parent) {
     parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
   });
   FS.FSNode.prototype = {};
   var readMode = 292 | 73;
   var writeMode = 146;
   Object.defineProperties(FS.FSNode.prototype, {
    read: {
     get: (function() {
      return (this.mode & readMode) === readMode;
     }),
     set: (function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
     })
    },
    write: {
     get: (function() {
      return (this.mode & writeMode) === writeMode;
     }),
     set: (function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
     })
    },
    isFolder: {
     get: (function() {
      return FS.isDir(this.mode);
     })
    },
    isDevice: {
     get: (function() {
      return FS.isChrdev(this.mode);
     })
    }
   });
  }
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 }),
 destroyNode: (function(node) {
  FS.hashRemoveNode(node);
 }),
 isRoot: (function(node) {
  return node === node.parent;
 }),
 isMountpoint: (function(node) {
  return !!node.mounted;
 }),
 isFile: (function(mode) {
  return (mode & 61440) === 32768;
 }),
 isDir: (function(mode) {
  return (mode & 61440) === 16384;
 }),
 isLink: (function(mode) {
  return (mode & 61440) === 40960;
 }),
 isChrdev: (function(mode) {
  return (mode & 61440) === 8192;
 }),
 isBlkdev: (function(mode) {
  return (mode & 61440) === 24576;
 }),
 isFIFO: (function(mode) {
  return (mode & 61440) === 4096;
 }),
 isSocket: (function(mode) {
  return (mode & 49152) === 49152;
 }),
 flagModes: {
  "r": 0,
  "rs": 1052672,
  "r+": 2,
  "w": 577,
  "wx": 705,
  "xw": 705,
  "w+": 578,
  "wx+": 706,
  "xw+": 706,
  "a": 1089,
  "ax": 1217,
  "xa": 1217,
  "a+": 1090,
  "ax+": 1218,
  "xa+": 1218
 },
 modeStringToFlags: (function(str) {
  var flags = FS.flagModes[str];
  if (typeof flags === "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 }),
 flagsToPermissionString: (function(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 }),
 nodePermissions: (function(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
   return ERRNO_CODES.EACCES;
  }
  return 0;
 }),
 mayLookup: (function(dir) {
  var err = FS.nodePermissions(dir, "x");
  if (err) return err;
  if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
  return 0;
 }),
 mayCreate: (function(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return ERRNO_CODES.EEXIST;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 }),
 mayDelete: (function(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var err = FS.nodePermissions(dir, "wx");
  if (err) {
   return err;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return ERRNO_CODES.ENOTDIR;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return ERRNO_CODES.EBUSY;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return 0;
 }),
 mayOpen: (function(node, flags) {
  if (!node) {
   return ERRNO_CODES.ENOENT;
  }
  if (FS.isLink(node.mode)) {
   return ERRNO_CODES.ELOOP;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 }),
 MAX_OPEN_FDS: 4096,
 nextfd: (function(fd_start, fd_end) {
  fd_start = fd_start || 0;
  fd_end = fd_end || FS.MAX_OPEN_FDS;
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
 }),
 getStream: (function(fd) {
  return FS.streams[fd];
 }),
 createStream: (function(stream, fd_start, fd_end) {
  if (!FS.FSStream) {
   FS.FSStream = (function() {});
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: (function() {
      return this.node;
     }),
     set: (function(val) {
      this.node = val;
     })
    },
    isRead: {
     get: (function() {
      return (this.flags & 2097155) !== 1;
     })
    },
    isWrite: {
     get: (function() {
      return (this.flags & 2097155) !== 0;
     })
    },
    isAppend: {
     get: (function() {
      return this.flags & 1024;
     })
    }
   });
  }
  var newStream = new FS.FSStream;
  for (var p in stream) {
   newStream[p] = stream[p];
  }
  stream = newStream;
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 }),
 closeStream: (function(fd) {
  FS.streams[fd] = null;
 }),
 chrdev_stream_ops: {
  open: (function(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  }),
  llseek: (function() {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  })
 },
 major: (function(dev) {
  return dev >> 8;
 }),
 minor: (function(dev) {
  return dev & 255;
 }),
 makedev: (function(ma, mi) {
  return ma << 8 | mi;
 }),
 registerDevice: (function(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 }),
 getDevice: (function(dev) {
  return FS.devices[dev];
 }),
 getMounts: (function(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 }),
 syncfs: (function(populate, callback) {
  if (typeof populate === "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(err) {
   assert(FS.syncFSRequests > 0);
   FS.syncFSRequests--;
   return callback(err);
  }
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(err);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach((function(mount) {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  }));
 }),
 mount: (function(type, opts, mountpoint) {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 }),
 unmount: (function(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach((function(hash) {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.indexOf(current.mount) !== -1) {
     FS.destroyNode(current);
    }
    current = next;
   }
  }));
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 }),
 lookup: (function(parent, name) {
  return parent.node_ops.lookup(parent, name);
 }),
 mknod: (function(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.mayCreate(parent, name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 }),
 create: (function(path, mode) {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 }),
 mkdir: (function(path, mode) {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 }),
 mkdirTree: (function(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != ERRNO_CODES.EEXIST) throw e;
   }
  }
 }),
 mkdev: (function(path, mode, dev) {
  if (typeof dev === "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 }),
 symlink: (function(oldpath, newpath) {
  if (!PATH.resolve(oldpath)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var newname = PATH.basename(newpath);
  var err = FS.mayCreate(parent, newname);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 }),
 rename: (function(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  try {
   lookup = FS.lookupPath(old_path, {
    parent: true
   });
   old_dir = lookup.node;
   lookup = FS.lookupPath(new_path, {
    parent: true
   });
   new_dir = lookup.node;
  } catch (e) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  relative = PATH.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var err = FS.mayDelete(old_dir, old_name, isdir);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (new_dir !== old_dir) {
   err = FS.nodePermissions(old_dir, "w");
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  try {
   if (FS.trackingDelegate["willMovePath"]) {
    FS.trackingDelegate["willMovePath"](old_path, new_path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
  try {
   if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
  } catch (e) {
   console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
 }),
 rmdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, true);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  return node.node_ops.readdir(node);
 }),
 unlink: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, false);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readlink: (function(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 }),
 stat: (function(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return node.node_ops.getattr(node);
 }),
 lstat: (function(path) {
  return FS.stat(path, true);
 }),
 chmod: (function(path, mode, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 }),
 lchmod: (function(path, mode) {
  FS.chmod(path, mode, true);
 }),
 fchmod: (function(fd, mode) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chmod(stream.node, mode);
 }),
 chown: (function(path, uid, gid, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 }),
 lchown: (function(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 }),
 fchown: (function(fd, uid, gid) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chown(stream.node, uid, gid);
 }),
 truncate: (function(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.nodePermissions(node, "w");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 }),
 ftruncate: (function(fd, len) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  FS.truncate(stream.node, len);
 }),
 utime: (function(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 }),
 open: (function(path, flags, mode, fd_start, fd_end) {
  if (path === "") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode === "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path === "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  if (!created) {
   var err = FS.mayOpen(node, flags);
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
    Module["printErr"]("read file: " + path);
   }
  }
  try {
   if (FS.trackingDelegate["onOpenFile"]) {
    var trackingFlags = 0;
    if ((flags & 2097155) !== 1) {
     trackingFlags |= FS.tracking.openFlags.READ;
    }
    if ((flags & 2097155) !== 0) {
     trackingFlags |= FS.tracking.openFlags.WRITE;
    }
    FS.trackingDelegate["onOpenFile"](path, trackingFlags);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
  }
  return stream;
 }),
 close: (function(stream) {
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
 }),
 llseek: (function(stream, offset, whence) {
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 }),
 read: (function(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 }),
 write: (function(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if (stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  try {
   if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
  } catch (e) {
   console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message);
  }
  return bytesWritten;
 }),
 allocate: (function(stream, offset, length) {
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
  }
  stream.stream_ops.allocate(stream, offset, length);
 }),
 mmap: (function(stream, buffer, offset, length, position, prot, flags) {
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EACCES);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
 }),
 msync: (function(stream, buffer, offset, length, mmapFlags) {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 }),
 munmap: (function(stream) {
  return 0;
 }),
 ioctl: (function(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 }),
 readFile: (function(path, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "r";
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 }),
 writeFile: (function(path, data, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "w";
  opts.encoding = opts.encoding || "utf8";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var stream = FS.open(path, opts.flags, opts.mode);
  if (opts.encoding === "utf8") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
  } else if (opts.encoding === "binary") {
   FS.write(stream, data, 0, data.length, 0, opts.canOwn);
  }
  FS.close(stream);
 }),
 cwd: (function() {
  return FS.currentPath;
 }),
 chdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  var err = FS.nodePermissions(lookup.node, "x");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  FS.currentPath = lookup.path;
 }),
 createDefaultDirectories: (function() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 }),
 createDefaultDevices: (function() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: (function() {
    return 0;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    return length;
   })
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device;
  if (typeof crypto !== "undefined") {
   var randomBuffer = new Uint8Array(1);
   random_device = (function() {
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0];
   });
  } else if (ENVIRONMENT_IS_NODE) {
   random_device = (function() {
    return require("crypto").randomBytes(1)[0];
   });
  } else {
   random_device = (function() {
    return Math.random() * 256 | 0;
   });
  }
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 }),
 createSpecialDirectories: (function() {
  FS.mkdir("/proc");
  FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: (function() {
    var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: (function(parent, name) {
      var fd = +name;
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: (function() {
         return stream.path;
        })
       }
      };
      ret.parent = ret;
      return ret;
     })
    };
    return node;
   })
  }, {}, "/proc/self/fd");
 }),
 createStandardStreams: (function() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", "r");
  assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
  var stdout = FS.open("/dev/stdout", "w");
  assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
  var stderr = FS.open("/dev/stderr", "w");
  assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
 }),
 ensureErrnoError: (function() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = (function(errno) {
    this.errno = errno;
    for (var key in ERRNO_CODES) {
     if (ERRNO_CODES[key] === errno) {
      this.code = key;
      break;
     }
    }
   });
   this.setErrno(errno);
   this.message = ERRNO_MESSAGES[errno];
   if (this.stack) this.stack = demangleAll(this.stack);
  };
  FS.ErrnoError.prototype = new Error;
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ ERRNO_CODES.ENOENT ].forEach((function(code) {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  }));
 }),
 staticInit: (function() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS,
   "IDBFS": IDBFS,
   "NODEFS": NODEFS,
   "WORKERFS": WORKERFS
  };
 }),
 init: (function(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 }),
 quit: (function() {
  FS.init.initialized = false;
  var fflush = Module["_fflush"];
  if (fflush) fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 }),
 getMode: (function(canRead, canWrite) {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 }),
 joinPath: (function(parts, forceRelative) {
  var path = PATH.join.apply(null, parts);
  if (forceRelative && path[0] == "/") path = path.substr(1);
  return path;
 }),
 absolutePath: (function(relative, base) {
  return PATH.resolve(base, relative);
 }),
 standardizePath: (function(path) {
  return PATH.normalize(path);
 }),
 findObject: (function(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   ___setErrNo(ret.error);
   return null;
  }
 }),
 analyzePath: (function(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 }),
 createFolder: (function(parent, name, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.mkdir(path, mode);
 }),
 createPath: (function(parent, path, canRead, canWrite) {
  parent = typeof parent === "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 }),
 createFile: (function(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 }),
 createDataFile: (function(parent, name, data, canRead, canWrite, canOwn) {
  var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data === "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, "w");
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 }),
 createDevice: (function(parent, name, input, output) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: (function(stream) {
    stream.seekable = false;
   }),
   close: (function(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   }),
   read: (function(stream, buffer, offset, length, pos) {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   })
  });
  return FS.mkdev(path, mode, dev);
 }),
 createLink: (function(parent, name, target, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  return FS.symlink(target, path);
 }),
 forceLoadFile: (function(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  var success = true;
  if (typeof XMLHttpRequest !== "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (Module["read"]) {
   try {
    obj.contents = intArrayFromString(Module["read"](obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    success = false;
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
  if (!success) ___setErrNo(ERRNO_CODES.EIO);
  return success;
 }),
 createLazyFile: (function(parent, name, url, canRead, canWrite) {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest;
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (function(from, to) {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   });
   var lazyArray = this;
   lazyArray.setDataGetter((function(chunkNum) {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] === "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   }));
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest !== "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array;
   Object.defineProperties(lazyArray, {
    length: {
     get: (function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     })
    },
    chunkSize: {
     get: (function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     })
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: (function() {
     return this.contents.length;
    })
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach((function(key) {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    return fn.apply(null, arguments);
   };
  }));
  stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
   if (!FS.forceLoadFile(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EIO);
   }
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  };
  node.stream_ops = stream_ops;
  return node;
 }),
 createPreloadedFile: (function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
  Browser.init();
  var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   var handled = false;
   Module["preloadPlugins"].forEach((function(plugin) {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
     plugin["handle"](byteArray, fullname, finish, (function() {
      if (onerror) onerror();
      removeRunDependency(dep);
     }));
     handled = true;
    }
   }));
   if (!handled) finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   Browser.asyncLoad(url, (function(byteArray) {
    processData(byteArray);
   }), onerror);
  } else {
   processData(url);
  }
 }),
 indexedDB: (function() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 }),
 DB_NAME: (function() {
  return "EM_FS_" + window.location.pathname;
 }),
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
   console.log("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  };
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = function putRequest_onsuccess() {
     ok++;
     if (ok + fail == total) finish();
    };
    putRequest.onerror = function putRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 }),
 loadFilesFromDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var getRequest = files.get(path);
    getRequest.onsuccess = function getRequest_onsuccess() {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    };
    getRequest.onerror = function getRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 })
};
var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 mappings: {},
 umask: 511,
 calculateAt: (function(dirfd, path) {
  if (path[0] !== "/") {
   var dir;
   if (dirfd === -100) {
    dir = FS.cwd();
   } else {
    var dirstream = FS.getStream(dirfd);
    if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    dir = dirstream.path;
   }
   path = PATH.join2(dir, path);
  }
  return path;
 }),
 doStat: (function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -ERRNO_CODES.ENOTDIR;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  HEAP32[buf + 36 >> 2] = stat.size;
  HEAP32[buf + 40 >> 2] = 4096;
  HEAP32[buf + 44 >> 2] = stat.blocks;
  HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 52 >> 2] = 0;
  HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ino;
  return 0;
 }),
 doMsync: (function(addr, stream, len, flags) {
  var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
  FS.msync(stream, buffer, 0, len, flags);
 }),
 doMkdir: (function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 }),
 doMknod: (function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;
  default:
   return -ERRNO_CODES.EINVAL;
  }
  FS.mknod(path, mode, dev);
  return 0;
 }),
 doReadlink: (function(path, buf, bufsize) {
  if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 }),
 doAccess: (function(path, amode) {
  if (amode & ~7) {
   return -ERRNO_CODES.EINVAL;
  }
  var node;
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  node = lookup.node;
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -ERRNO_CODES.EACCES;
  }
  return 0;
 }),
 doDup: (function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 }),
 doReadv: (function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 }),
 doWritev: (function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 }),
 varargs: 0,
 get: (function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 }),
 getStr: (function() {
  var ret = Pointer_stringify(SYSCALLS.get());
  return ret;
 }),
 getStreamFromFD: (function() {
  var stream = FS.getStream(SYSCALLS.get());
  if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return stream;
 }),
 getSocketFromFD: (function() {
  var socket = SOCKFS.getSocket(SYSCALLS.get());
  if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return socket;
 }),
 getSocketAddress: (function(allowNull) {
  var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
  if (allowNull && addrp === 0) return null;
  var info = __read_sockaddr(addrp, addrlen);
  if (info.errno) throw new FS.ErrnoError(info.errno);
  info.addr = DNS.lookup_addr(info.addr) || info.addr;
  return info;
 }),
 get64: (function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0) assert(high === 0); else assert(high === -1);
  return low;
 }),
 getZero: (function() {
  assert(SYSCALLS.get() === 0);
 })
};
function ___syscall63(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get();
  if (old.fd === suggestFD) return suggestFD;
  return SYSCALLS.doDup(old.path, old.flags, suggestFD);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function __ZSt18uncaught_exceptionv() {
 return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
var EXCEPTIONS = {
 last: 0,
 caught: [],
 infos: {},
 deAdjust: (function(adjusted) {
  if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
  for (var ptr in EXCEPTIONS.infos) {
   var info = EXCEPTIONS.infos[ptr];
   if (info.adjusted === adjusted) {
    return ptr;
   }
  }
  return adjusted;
 }),
 addRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount++;
 }),
 decRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  assert(info.refcount > 0);
  info.refcount--;
  if (info.refcount === 0 && !info.rethrown) {
   if (info.destructor) {
    Module["dynCall_vi"](info.destructor, ptr);
   }
   delete EXCEPTIONS.infos[ptr];
   ___cxa_free_exception(ptr);
  }
 }),
 clearRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount = 0;
 })
};
function ___resumeException(ptr) {
 if (!EXCEPTIONS.last) {
  EXCEPTIONS.last = ptr;
 }
 throw ptr;
}
function ___cxa_find_matching_catch() {
 var thrown = EXCEPTIONS.last;
 if (!thrown) {
  return (Runtime.setTempRet0(0), 0) | 0;
 }
 var info = EXCEPTIONS.infos[thrown];
 var throwntype = info.type;
 if (!throwntype) {
  return (Runtime.setTempRet0(0), thrown) | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 var pointer = Module["___cxa_is_pointer_type"](throwntype);
 if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
 HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
 thrown = ___cxa_find_matching_catch.buffer;
 for (var i = 0; i < typeArray.length; i++) {
  if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
   thrown = HEAP32[thrown >> 2];
   info.adjusted = thrown;
   return (Runtime.setTempRet0(typeArray[i]), thrown) | 0;
  }
 }
 thrown = HEAP32[thrown >> 2];
 return (Runtime.setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_throw(ptr, type, destructor) {
 EXCEPTIONS.infos[ptr] = {
  ptr: ptr,
  adjusted: ptr,
  type: type,
  destructor: destructor,
  refcount: 0,
  caught: false,
  rethrown: false
 };
 EXCEPTIONS.last = ptr;
 if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
  __ZSt18uncaught_exceptionv.uncaught_exception = 1;
 } else {
  __ZSt18uncaught_exceptionv.uncaught_exception++;
 }
 throw ptr;
}
function _abort() {
 Module["abort"]();
}
function ___cxa_free_exception(ptr) {
 try {
  return _free(ptr);
 } catch (e) {
  Module.printErr("exception during cxa_free_exception: " + e);
 }
}
function ___cxa_end_catch() {
 Module["setThrew"](0);
 var ptr = EXCEPTIONS.caught.pop();
 if (ptr) {
  EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
  EXCEPTIONS.last = 0;
 }
}
function _pthread_once(ptr, func) {
 if (!_pthread_once.seen) _pthread_once.seen = {};
 if (ptr in _pthread_once.seen) return;
 Module["dynCall_v"](func);
 _pthread_once.seen[ptr] = 1;
}
function ___lock() {}
function ___unlock() {}
var PTHREAD_SPECIFIC = {};
function _pthread_getspecific(key) {
 return PTHREAD_SPECIFIC[key] || 0;
}
var PTHREAD_SPECIFIC_NEXT_KEY = 1;
function _pthread_key_create(key, destructor) {
 if (key == 0) {
  return ERRNO_CODES.EINVAL;
 }
 HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
 PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
 PTHREAD_SPECIFIC_NEXT_KEY++;
 return 0;
}
function ___syscall330(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(!flags);
  if (old.fd === suggestFD) return -ERRNO_CODES.EINVAL;
  return SYSCALLS.doDup(old.path, old.flags, suggestFD);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _pthread_setspecific(key, value) {
 if (!(key in PTHREAD_SPECIFIC)) {
  return ERRNO_CODES.EINVAL;
 }
 PTHREAD_SPECIFIC[key] = value;
 return 0;
}
function ___cxa_allocate_exception(size) {
 return _malloc(size);
}
function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
  switch (op) {
  case 21505:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  case 21506:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  case 21519:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }
  case 21520:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return -ERRNO_CODES.EINVAL;
   }
  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }
  case 21523:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___cxa_pure_virtual() {
 ABORT = true;
 throw "Pure virtual function called!";
}
function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (!window["setImmediate"]) {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   function Browser_setImmediate_messageHandler(event) {
    if (event.source === window && event.data === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   }
   window.addEventListener("message", Browser_setImmediate_messageHandler, true);
   window["setImmediate"] = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     window.postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else window.postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   window["setImmediate"](Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = (function() {
   Module["dynCall_vi"](func, arg);
  });
 } else {
  browserIterationFunc = (function() {
   Module["dynCall_v"](func);
  });
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  checkStackCookie();
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}
var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: (function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  }),
  resume: (function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  }),
  updateStatus: (function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  }),
  runIter: (function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  })
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: (function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob;
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder;
    bb.append((new Uint8Array(byteArray)).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var img = new Image;
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio;
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    assert(typeof url == "string", "createObjectURL must return a url as a string");
    var audio = new Audio;
    audio.addEventListener("canplaythrough", (function() {
     finish(audio);
    }), false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout((function() {
     finish(audio);
    }), 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", (function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }), false);
   }
  }
 }),
 createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   contextHandle = GL.createContext(canvas, contextAttributes);
   if (contextHandle) {
    ctx = GL.getContext(contextHandle).GLctx;
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
    callback();
   }));
   Browser.init();
  }
  return ctx;
 }),
 destroyContext: (function(canvas, useWebGL, setInModule) {}),
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (function() {});
    canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize();
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
   Browser.updateCanvasDimensions(canvas);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? (function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null) || (canvasContainer["webkitRequestFullScreen"] ? (function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 }),
 requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
  Browser.requestFullScreen = (function(lockPointer, resizeCanvas, vrDevice) {
   return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
  });
  return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
 }),
 nextRAF: 0,
 fakeRequestAnimationFrame: (function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 }),
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: (function(func) {
  return (function() {
   if (!ABORT) return func.apply(null, arguments);
  });
 }),
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = false;
 }),
 resumeAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach((function(func) {
    func();
   }));
  }
 }),
 safeRequestAnimationFrame: (function(func) {
  return Browser.requestAnimationFrame((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }));
 }),
 safeSetTimeout: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }), timeout);
 }),
 safeSetInterval: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }), timeout);
 }),
 getMimetype: (function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 }),
 getUserMedia: (function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 }),
 getMovementX: (function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 }),
 getMovementY: (function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 }),
 getMouseWheelDelta: (function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;
  case "mousewheel":
   delta = event.wheelDelta;
   break;
  case "wheel":
   delta = event["deltaY"];
   break;
  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 }),
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: (function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 }),
 asyncLoad: (function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  Module["readAsync"](url, (function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }), (function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  }));
  if (dep) addRunDependency(dep);
 }),
 resizeListeners: [],
 updateResizeListeners: (function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach((function(listener) {
   listener(canvas.width, canvas.height);
  }));
 }),
 setCanvasSize: (function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 }),
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 setWindowedCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 updateCanvasDimensions: (function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }),
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: (function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 })
};
var EmterpreterAsync = {
 initted: false,
 state: 0,
 saveStack: "",
 yieldCallbacks: [],
 postAsync: null,
 asyncFinalizers: [],
 ensureInit: (function() {
  if (this.initted) return;
  this.initted = true;
  abortDecorators.push((function(output, what) {
   if (EmterpreterAsync.state !== 0) {
    return output + "\nThis error happened during an emterpreter-async save or load of the stack. Was there non-emterpreted code on the stack during save (which is unallowed)? You may want to adjust EMTERPRETIFY_BLACKLIST, EMTERPRETIFY_WHITELIST.\nThis is what the stack looked like when we tried to save it: " + [ EmterpreterAsync.state, EmterpreterAsync.saveStack ];
   }
   return output;
  }));
 }),
 setState: (function(s) {
  this.ensureInit();
  this.state = s;
  Module["asm"].setAsyncState(s);
 }),
 handle: (function(doAsyncOp, yieldDuring) {
  Module["noExitRuntime"] = true;
  if (EmterpreterAsync.state === 0) {
   var stack = new Int32Array(HEAP32.subarray(EMTSTACKTOP >> 2, Module["asm"].emtStackSave() >> 2));
   var stacktop = Module["asm"].stackSave();
   var resumedCallbacksForYield = false;
   function resumeCallbacksForYield() {
    if (resumedCallbacksForYield) return;
    resumedCallbacksForYield = true;
    EmterpreterAsync.yieldCallbacks.forEach((function(func) {
     func();
    }));
    Browser.resumeAsyncCallbacks();
   }
   var callingDoAsyncOp = 1;
   doAsyncOp(function resume(post) {
    if (callingDoAsyncOp) {
     assert(callingDoAsyncOp === 1);
     callingDoAsyncOp++;
     setTimeout((function() {
      resume(post);
     }), 0);
     return;
    }
    assert(EmterpreterAsync.state === 1 || EmterpreterAsync.state === 3);
    EmterpreterAsync.setState(3);
    if (yieldDuring) {
     resumeCallbacksForYield();
    }
    HEAP32.set(stack, EMTSTACKTOP >> 2);
    assert(stacktop === Module["asm"].stackSave());
    EmterpreterAsync.setState(2);
    if (Browser.mainLoop.func) {
     Browser.mainLoop.resume();
    }
    assert(!EmterpreterAsync.postAsync);
    EmterpreterAsync.postAsync = post || null;
    Module["asm"].emterpret(stack[0]);
    if (!yieldDuring && EmterpreterAsync.state === 0) {
     Browser.resumeAsyncCallbacks();
    }
    if (EmterpreterAsync.state === 0) {
     EmterpreterAsync.asyncFinalizers.forEach((function(func) {
      func();
     }));
     EmterpreterAsync.asyncFinalizers.length = 0;
    }
   });
   callingDoAsyncOp = 0;
   EmterpreterAsync.setState(1);
   EmterpreterAsync.saveStack = (new Error).stack;
   if (Browser.mainLoop.func) {
    Browser.mainLoop.pause();
   }
   if (yieldDuring) {
    setTimeout((function() {
     resumeCallbacksForYield();
    }), 0);
   } else {
    Browser.pauseAsyncCallbacks();
   }
  } else {
   assert(EmterpreterAsync.state === 2);
   EmterpreterAsync.setState(0);
   if (EmterpreterAsync.postAsync) {
    var ret = EmterpreterAsync.postAsync();
    EmterpreterAsync.postAsync = null;
    return ret;
   }
  }
 })
};
function _emscripten_sleep_with_yield(ms) {
 EmterpreterAsync.handle((function(resume) {
  Browser.safeSetTimeout(resume, ms);
 }), true);
}
function ___cxa_find_matching_catch_2() {
 return ___cxa_find_matching_catch.apply(null, arguments);
}
function ___cxa_find_matching_catch_3() {
 return ___cxa_find_matching_catch.apply(null, arguments);
}
function ___cxa_begin_catch(ptr) {
 var info = EXCEPTIONS.infos[ptr];
 if (info && !info.caught) {
  info.caught = true;
  __ZSt18uncaught_exceptionv.uncaught_exception--;
 }
 if (info) info.rethrown = false;
 EXCEPTIONS.caught.push(ptr);
 EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
 return ptr;
}
function ___syscall5(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
function ___syscall6(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
var cttz_i8 = allocate([ 8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0 ], "i8", ALLOC_STATIC);
function ___gxx_personality_v0() {}
function ___syscall140(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
  var offset = offset_low;
  FS.llseek(stream, offset, whence);
  HEAP32[result >> 2] = stream.position;
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall146(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doWritev(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall221(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -ERRNO_CODES.EINVAL;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }
  case 1:
  case 2:
   return 0;
  case 3:
   return stream.flags;
  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }
  case 12:
  case 12:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }
  case 13:
  case 14:
  case 13:
  case 14:
   return 0;
  case 16:
  case 8:
   return -ERRNO_CODES.EINVAL;
  case 9:
   ___setErrNo(ERRNO_CODES.EINVAL);
   return -1;
  default:
   {
    return -ERRNO_CODES.EINVAL;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall145(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doReadv(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
 _emscripten_get_now = (function() {
  return self["performance"]["now"]();
 });
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
 _emscripten_get_now = (function() {
  return performance["now"]();
 });
} else {
 _emscripten_get_now = Date.now;
}
FS.staticInit();
__ATINIT__.unshift((function() {
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
}));
__ATMAIN__.push((function() {
 FS.ignorePermissions = false;
}));
__ATEXIT__.push((function() {
 FS.quit();
}));
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
__ATINIT__.unshift((function() {
 TTY.init();
}));
__ATEXIT__.push((function() {
 TTY.shutdown();
}));
if (ENVIRONMENT_IS_NODE) {
 var fs = require("fs");
 var NODEJS_PATH = require("path");
 NODEFS.staticInit();
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
 Module["requestFullScreen"] = Module["requestFullscreen"];
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
function nullFunc_iiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_viiiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_i(x) {
 Module["printErr"]("Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_vi(x) {
 Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_vii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_ii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_viii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_v(x) {
 Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_viiiiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_iii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_viiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function invoke_iiii(index, a1, a2, a3) {
 try {
  return Module["dynCall_iiii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
 try {
  Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_i(index) {
 try {
  return Module["dynCall_i"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vi(index, a1) {
 try {
  Module["dynCall_vi"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vii(index, a1, a2) {
 try {
  Module["dynCall_vii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_ii(index, a1) {
 try {
  return Module["dynCall_ii"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viii(index, a1, a2, a3) {
 try {
  Module["dynCall_viii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_v(index) {
 try {
  Module["dynCall_v"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iii(index, a1, a2) {
 try {
  return Module["dynCall_iii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiii(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_viiii"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "enlargeMemory": enlargeMemory,
 "getTotalMemory": getTotalMemory,
 "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
 "abortStackOverflow": abortStackOverflow,
 "nullFunc_iiii": nullFunc_iiii,
 "nullFunc_viiiii": nullFunc_viiiii,
 "nullFunc_i": nullFunc_i,
 "nullFunc_vi": nullFunc_vi,
 "nullFunc_vii": nullFunc_vii,
 "nullFunc_ii": nullFunc_ii,
 "nullFunc_viii": nullFunc_viii,
 "nullFunc_v": nullFunc_v,
 "nullFunc_viiiiii": nullFunc_viiiiii,
 "nullFunc_iii": nullFunc_iii,
 "nullFunc_viiii": nullFunc_viiii,
 "invoke_iiii": invoke_iiii,
 "invoke_viiiii": invoke_viiiii,
 "invoke_i": invoke_i,
 "invoke_vi": invoke_vi,
 "invoke_vii": invoke_vii,
 "invoke_ii": invoke_ii,
 "invoke_viii": invoke_viii,
 "invoke_v": invoke_v,
 "invoke_viiiiii": invoke_viiiiii,
 "invoke_iii": invoke_iii,
 "invoke_viiii": invoke_viiii,
 "___syscall221": ___syscall221,
 "_emscripten_get_now_is_monotonic": _emscripten_get_now_is_monotonic,
 "_emscripten_asm_const_iiiii": _emscripten_asm_const_iiiii,
 "_pthread_key_create": _pthread_key_create,
 "___syscall63": ___syscall63,
 "_abort": _abort,
 "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
 "___gxx_personality_v0": ___gxx_personality_v0,
 "___cxa_free_exception": ___cxa_free_exception,
 "___cxa_find_matching_catch_2": ___cxa_find_matching_catch_2,
 "___cxa_find_matching_catch": ___cxa_find_matching_catch,
 "_emscripten_asm_const_ii": _emscripten_asm_const_ii,
 "_emscripten_asm_const_i": _emscripten_asm_const_i,
 "_clock_gettime": _clock_gettime,
 "___setErrNo": ___setErrNo,
 "___syscall330": ___syscall330,
 "___cxa_begin_catch": ___cxa_begin_catch,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "___cxa_end_catch": ___cxa_end_catch,
 "___resumeException": ___resumeException,
 "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv,
 "_pthread_getspecific": _pthread_getspecific,
 "___cxa_find_matching_catch_3": ___cxa_find_matching_catch_3,
 "_pthread_once": _pthread_once,
 "_emscripten_sleep_with_yield": _emscripten_sleep_with_yield,
 "___syscall54": ___syscall54,
 "___unlock": ___unlock,
 "_emscripten_set_main_loop": _emscripten_set_main_loop,
 "_emscripten_asm_const_iii": _emscripten_asm_const_iii,
 "_pthread_setspecific": _pthread_setspecific,
 "_emscripten_asm_const_iiii": _emscripten_asm_const_iiii,
 "___cxa_throw": ___cxa_throw,
 "___lock": ___lock,
 "___syscall6": ___syscall6,
 "___syscall5": ___syscall5,
 "___cxa_pure_virtual": ___cxa_pure_virtual,
 "_emscripten_get_now": _emscripten_get_now,
 "___cxa_allocate_exception": ___cxa_allocate_exception,
 "___syscall140": ___syscall140,
 "___syscall145": ___syscall145,
 "___syscall146": ___syscall146,
 "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "cttz_i8": cttz_i8
};
Module.asmLibraryArg["EMTSTACKTOP"] = EMTSTACKTOP;
Module.asmLibraryArg["EMT_STACK_MAX"] = EMT_STACK_MAX;
Module.asmLibraryArg["eb"] = eb;
// EMSCRIPTEN_START_ASM

var asm = (function(global,env,buffer) {

'almost asm';


  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var cttz_i8=env.cttz_i8|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var enlargeMemory=env.enlargeMemory;
  var getTotalMemory=env.getTotalMemory;
  var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;
  var abortStackOverflow=env.abortStackOverflow;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_viiiii=env.nullFunc_viiiii;
  var nullFunc_i=env.nullFunc_i;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_v=env.nullFunc_v;
  var nullFunc_viiiiii=env.nullFunc_viiiiii;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_i=env.invoke_i;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var ___syscall221=env.___syscall221;
  var _emscripten_get_now_is_monotonic=env._emscripten_get_now_is_monotonic;
  var _emscripten_asm_const_iiiii=env._emscripten_asm_const_iiiii;
  var _pthread_key_create=env._pthread_key_create;
  var ___syscall63=env.___syscall63;
  var _abort=env._abort;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var ___cxa_free_exception=env.___cxa_free_exception;
  var ___cxa_find_matching_catch_2=env.___cxa_find_matching_catch_2;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var _emscripten_asm_const_ii=env._emscripten_asm_const_ii;
  var _emscripten_asm_const_i=env._emscripten_asm_const_i;
  var _clock_gettime=env._clock_gettime;
  var ___setErrNo=env.___setErrNo;
  var ___syscall330=env.___syscall330;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___cxa_end_catch=env.___cxa_end_catch;
  var ___resumeException=env.___resumeException;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _pthread_getspecific=env._pthread_getspecific;
  var ___cxa_find_matching_catch_3=env.___cxa_find_matching_catch_3;
  var _pthread_once=env._pthread_once;
  var _emscripten_sleep_with_yield=env._emscripten_sleep_with_yield;
  var ___syscall54=env.___syscall54;
  var ___unlock=env.___unlock;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var _emscripten_asm_const_iii=env._emscripten_asm_const_iii;
  var _pthread_setspecific=env._pthread_setspecific;
  var _emscripten_asm_const_iiii=env._emscripten_asm_const_iiii;
  var ___cxa_throw=env.___cxa_throw;
  var ___lock=env.___lock;
  var ___syscall6=env.___syscall6;
  var ___syscall5=env.___syscall5;
  var ___cxa_pure_virtual=env.___cxa_pure_virtual;
  var _emscripten_get_now=env._emscripten_get_now;
  var ___cxa_allocate_exception=env.___cxa_allocate_exception;
  var ___syscall140=env.___syscall140;
  var ___syscall145=env.___syscall145;
  var ___syscall146=env.___syscall146;
  var tempFloat = 0.0;
  var asyncState = 0;

var EMTSTACKTOP = env.EMTSTACKTOP|0;
var EMT_STACK_MAX = env.EMT_STACK_MAX|0;
var eb = env.eb|0;
// EMSCRIPTEN_START_FUNCS

function _malloc($0) {
 $0 = $0 | 0;
 var $$$0172$i = 0, $$$0173$i = 0, $$$4236$i = 0, $$$4329$i = 0, $$$i = 0, $$0 = 0, $$0$i = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i20$i = 0, $$01$i$i = 0, $$0172$lcssa$i = 0, $$01726$i = 0, $$0173$lcssa$i = 0, $$01735$i = 0, $$0192 = 0, $$0194 = 0, $$0201$i$i = 0, $$0202$i$i = 0, $$0206$i$i = 0, $$0207$i$i = 0, $$024370$i = 0, $$0260$i$i = 0, $$0261$i$i = 0, $$0262$i$i = 0, $$0268$i$i = 0, $$0269$i$i = 0, $$0320$i = 0, $$0322$i = 0, $$0323$i = 0, $$0325$i = 0, $$0331$i = 0, $$0336$i = 0, $$0337$$i = 0, $$0337$i = 0, $$0339$i = 0, $$0340$i = 0, $$0345$i = 0, $$1176$i = 0, $$1178$i = 0, $$124469$i = 0, $$1264$i$i = 0, $$1266$i$i = 0, $$1321$i = 0, $$1326$i = 0, $$1341$i = 0, $$1347$i = 0, $$1351$i = 0, $$2234243136$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2333$i = 0, $$3$i = 0, $$3$i$i = 0, $$3$i200 = 0, $$3328$i = 0, $$3349$i = 0, $$4$lcssa$i = 0, $$4$ph$i = 0, $$411$i = 0, $$4236$i = 0, $$4329$lcssa$i = 0, $$432910$i = 0, $$4335$$4$i = 0, $$4335$ph$i = 0, $$43359$i = 0, $$723947$i = 0, $$748$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i17$i = 0, $$pre$i195 = 0, $$pre$i210 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i18$iZ2D = 0, $$pre$phi$i211Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phiZ2D = 0, $$sink1$i = 0, $$sink1$i$i = 0, $$sink14$i = 0, $$sink2$i = 0, $$sink2$i204 = 0, $$sink3$i = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $98 = 0, $99 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i208 = 0, $exitcond$i$i = 0, $not$$i = 0, $not$$i$i = 0, $not$$i197 = 0, $not$$i209 = 0, $not$1$i = 0, $not$1$i203 = 0, $not$3$i = 0, $not$5$i = 0, $or$cond$i = 0, $or$cond$i201 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond11$i = 0, $or$cond11$not$i = 0, $or$cond12$i = 0, $or$cond2$i = 0, $or$cond2$i199 = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond50$i = 0, $or$cond7$i = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0), asyncState ? abort(-12) | 0 : 0;
 $1 = sp;
 $2 = $0 >>> 0 < 245;
 do {
  if ($2) {
   $3 = $0 >>> 0 < 11;
   $4 = $0 + 11 | 0;
   $5 = $4 & -8;
   $6 = $3 ? 16 : $5;
   $7 = $6 >>> 3;
   $8 = HEAP32[3295] | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 13220 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = $18 + 8 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = ($16 | 0) == ($20 | 0);
    if ($21) {
     $22 = 1 << $14;
     $23 = $22 ^ -1;
     $24 = $8 & $23;
     HEAP32[3295] = $24;
    } else {
     $25 = $20 + 12 | 0;
     HEAP32[$25 >> 2] = $16;
     HEAP32[$17 >> 2] = $20;
    }
    $26 = $14 << 3;
    $27 = $26 | 3;
    $28 = $18 + 4 | 0;
    HEAP32[$28 >> 2] = $27;
    $29 = $18 + $26 | 0;
    $30 = $29 + 4 | 0;
    $31 = HEAP32[$30 >> 2] | 0;
    $32 = $31 | 1;
    HEAP32[$30 >> 2] = $32;
    $$0 = $19;
    STACKTOP = sp;
    return $$0 | 0;
   }
   $33 = HEAP32[13188 >> 2] | 0;
   $34 = $6 >>> 0 > $33 >>> 0;
   if ($34) {
    $35 = ($9 | 0) == 0;
    if (!$35) {
     $36 = $9 << $7;
     $37 = 2 << $7;
     $38 = 0 - $37 | 0;
     $39 = $37 | $38;
     $40 = $36 & $39;
     $41 = 0 - $40 | 0;
     $42 = $40 & $41;
     $43 = $42 + -1 | 0;
     $44 = $43 >>> 12;
     $45 = $44 & 16;
     $46 = $43 >>> $45;
     $47 = $46 >>> 5;
     $48 = $47 & 8;
     $49 = $48 | $45;
     $50 = $46 >>> $48;
     $51 = $50 >>> 2;
     $52 = $51 & 4;
     $53 = $49 | $52;
     $54 = $50 >>> $52;
     $55 = $54 >>> 1;
     $56 = $55 & 2;
     $57 = $53 | $56;
     $58 = $54 >>> $56;
     $59 = $58 >>> 1;
     $60 = $59 & 1;
     $61 = $57 | $60;
     $62 = $58 >>> $60;
     $63 = $61 + $62 | 0;
     $64 = $63 << 1;
     $65 = 13220 + ($64 << 2) | 0;
     $66 = $65 + 8 | 0;
     $67 = HEAP32[$66 >> 2] | 0;
     $68 = $67 + 8 | 0;
     $69 = HEAP32[$68 >> 2] | 0;
     $70 = ($65 | 0) == ($69 | 0);
     if ($70) {
      $71 = 1 << $63;
      $72 = $71 ^ -1;
      $73 = $8 & $72;
      HEAP32[3295] = $73;
      $90 = $73;
     } else {
      $74 = $69 + 12 | 0;
      HEAP32[$74 >> 2] = $65;
      HEAP32[$66 >> 2] = $69;
      $90 = $8;
     }
     $75 = $63 << 3;
     $76 = $75 - $6 | 0;
     $77 = $6 | 3;
     $78 = $67 + 4 | 0;
     HEAP32[$78 >> 2] = $77;
     $79 = $67 + $6 | 0;
     $80 = $76 | 1;
     $81 = $79 + 4 | 0;
     HEAP32[$81 >> 2] = $80;
     $82 = $79 + $76 | 0;
     HEAP32[$82 >> 2] = $76;
     $83 = ($33 | 0) == 0;
     if (!$83) {
      $84 = HEAP32[13200 >> 2] | 0;
      $85 = $33 >>> 3;
      $86 = $85 << 1;
      $87 = 13220 + ($86 << 2) | 0;
      $88 = 1 << $85;
      $89 = $90 & $88;
      $91 = ($89 | 0) == 0;
      if ($91) {
       $92 = $90 | $88;
       HEAP32[3295] = $92;
       $$pre = $87 + 8 | 0;
       $$0194 = $87;
       $$pre$phiZ2D = $$pre;
      } else {
       $93 = $87 + 8 | 0;
       $94 = HEAP32[$93 >> 2] | 0;
       $$0194 = $94;
       $$pre$phiZ2D = $93;
      }
      HEAP32[$$pre$phiZ2D >> 2] = $84;
      $95 = $$0194 + 12 | 0;
      HEAP32[$95 >> 2] = $84;
      $96 = $84 + 8 | 0;
      HEAP32[$96 >> 2] = $$0194;
      $97 = $84 + 12 | 0;
      HEAP32[$97 >> 2] = $87;
     }
     HEAP32[13188 >> 2] = $76;
     HEAP32[13200 >> 2] = $79;
     $$0 = $68;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $98 = HEAP32[13184 >> 2] | 0;
    $99 = ($98 | 0) == 0;
    if ($99) {
     $$0192 = $6;
    } else {
     $100 = 0 - $98 | 0;
     $101 = $98 & $100;
     $102 = $101 + -1 | 0;
     $103 = $102 >>> 12;
     $104 = $103 & 16;
     $105 = $102 >>> $104;
     $106 = $105 >>> 5;
     $107 = $106 & 8;
     $108 = $107 | $104;
     $109 = $105 >>> $107;
     $110 = $109 >>> 2;
     $111 = $110 & 4;
     $112 = $108 | $111;
     $113 = $109 >>> $111;
     $114 = $113 >>> 1;
     $115 = $114 & 2;
     $116 = $112 | $115;
     $117 = $113 >>> $115;
     $118 = $117 >>> 1;
     $119 = $118 & 1;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $120 + $121 | 0;
     $123 = 13484 + ($122 << 2) | 0;
     $124 = HEAP32[$123 >> 2] | 0;
     $125 = $124 + 4 | 0;
     $126 = HEAP32[$125 >> 2] | 0;
     $127 = $126 & -8;
     $128 = $127 - $6 | 0;
     $129 = $124 + 16 | 0;
     $130 = HEAP32[$129 >> 2] | 0;
     $not$3$i = ($130 | 0) == (0 | 0);
     $$sink14$i = $not$3$i & 1;
     $131 = ($124 + 16 | 0) + ($$sink14$i << 2) | 0;
     $132 = HEAP32[$131 >> 2] | 0;
     $133 = ($132 | 0) == (0 | 0);
     if ($133) {
      $$0172$lcssa$i = $124;
      $$0173$lcssa$i = $128;
     } else {
      $$01726$i = $124;
      $$01735$i = $128;
      $135 = $132;
      while (1) {
       $134 = $135 + 4 | 0;
       $136 = HEAP32[$134 >> 2] | 0;
       $137 = $136 & -8;
       $138 = $137 - $6 | 0;
       $139 = $138 >>> 0 < $$01735$i >>> 0;
       $$$0173$i = $139 ? $138 : $$01735$i;
       $$$0172$i = $139 ? $135 : $$01726$i;
       $140 = $135 + 16 | 0;
       $141 = HEAP32[$140 >> 2] | 0;
       $not$$i = ($141 | 0) == (0 | 0);
       $$sink1$i = $not$$i & 1;
       $142 = ($135 + 16 | 0) + ($$sink1$i << 2) | 0;
       $143 = HEAP32[$142 >> 2] | 0;
       $144 = ($143 | 0) == (0 | 0);
       if ($144) {
        $$0172$lcssa$i = $$$0172$i;
        $$0173$lcssa$i = $$$0173$i;
        break;
       } else {
        $$01726$i = $$$0172$i;
        $$01735$i = $$$0173$i;
        $135 = $143;
       }
      }
     }
     $145 = $$0172$lcssa$i + $6 | 0;
     $146 = $$0172$lcssa$i >>> 0 < $145 >>> 0;
     if ($146) {
      $147 = $$0172$lcssa$i + 24 | 0;
      $148 = HEAP32[$147 >> 2] | 0;
      $149 = $$0172$lcssa$i + 12 | 0;
      $150 = HEAP32[$149 >> 2] | 0;
      $151 = ($150 | 0) == ($$0172$lcssa$i | 0);
      do {
       if ($151) {
        $156 = $$0172$lcssa$i + 20 | 0;
        $157 = HEAP32[$156 >> 2] | 0;
        $158 = ($157 | 0) == (0 | 0);
        if ($158) {
         $159 = $$0172$lcssa$i + 16 | 0;
         $160 = HEAP32[$159 >> 2] | 0;
         $161 = ($160 | 0) == (0 | 0);
         if ($161) {
          $$3$i = 0;
          break;
         } else {
          $$1176$i = $160;
          $$1178$i = $159;
         }
        } else {
         $$1176$i = $157;
         $$1178$i = $156;
        }
        while (1) {
         $162 = $$1176$i + 20 | 0;
         $163 = HEAP32[$162 >> 2] | 0;
         $164 = ($163 | 0) == (0 | 0);
         if (!$164) {
          $$1176$i = $163;
          $$1178$i = $162;
          continue;
         }
         $165 = $$1176$i + 16 | 0;
         $166 = HEAP32[$165 >> 2] | 0;
         $167 = ($166 | 0) == (0 | 0);
         if ($167) {
          break;
         } else {
          $$1176$i = $166;
          $$1178$i = $165;
         }
        }
        HEAP32[$$1178$i >> 2] = 0;
        $$3$i = $$1176$i;
       } else {
        $152 = $$0172$lcssa$i + 8 | 0;
        $153 = HEAP32[$152 >> 2] | 0;
        $154 = $153 + 12 | 0;
        HEAP32[$154 >> 2] = $150;
        $155 = $150 + 8 | 0;
        HEAP32[$155 >> 2] = $153;
        $$3$i = $150;
       }
      } while (0);
      $168 = ($148 | 0) == (0 | 0);
      do {
       if (!$168) {
        $169 = $$0172$lcssa$i + 28 | 0;
        $170 = HEAP32[$169 >> 2] | 0;
        $171 = 13484 + ($170 << 2) | 0;
        $172 = HEAP32[$171 >> 2] | 0;
        $173 = ($$0172$lcssa$i | 0) == ($172 | 0);
        if ($173) {
         HEAP32[$171 >> 2] = $$3$i;
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $174 = 1 << $170;
          $175 = $174 ^ -1;
          $176 = $98 & $175;
          HEAP32[13184 >> 2] = $176;
          break;
         }
        } else {
         $177 = $148 + 16 | 0;
         $178 = HEAP32[$177 >> 2] | 0;
         $not$1$i = ($178 | 0) != ($$0172$lcssa$i | 0);
         $$sink2$i = $not$1$i & 1;
         $179 = ($148 + 16 | 0) + ($$sink2$i << 2) | 0;
         HEAP32[$179 >> 2] = $$3$i;
         $180 = ($$3$i | 0) == (0 | 0);
         if ($180) {
          break;
         }
        }
        $181 = $$3$i + 24 | 0;
        HEAP32[$181 >> 2] = $148;
        $182 = $$0172$lcssa$i + 16 | 0;
        $183 = HEAP32[$182 >> 2] | 0;
        $184 = ($183 | 0) == (0 | 0);
        if (!$184) {
         $185 = $$3$i + 16 | 0;
         HEAP32[$185 >> 2] = $183;
         $186 = $183 + 24 | 0;
         HEAP32[$186 >> 2] = $$3$i;
        }
        $187 = $$0172$lcssa$i + 20 | 0;
        $188 = HEAP32[$187 >> 2] | 0;
        $189 = ($188 | 0) == (0 | 0);
        if (!$189) {
         $190 = $$3$i + 20 | 0;
         HEAP32[$190 >> 2] = $188;
         $191 = $188 + 24 | 0;
         HEAP32[$191 >> 2] = $$3$i;
        }
       }
      } while (0);
      $192 = $$0173$lcssa$i >>> 0 < 16;
      if ($192) {
       $193 = $$0173$lcssa$i + $6 | 0;
       $194 = $193 | 3;
       $195 = $$0172$lcssa$i + 4 | 0;
       HEAP32[$195 >> 2] = $194;
       $196 = $$0172$lcssa$i + $193 | 0;
       $197 = $196 + 4 | 0;
       $198 = HEAP32[$197 >> 2] | 0;
       $199 = $198 | 1;
       HEAP32[$197 >> 2] = $199;
      } else {
       $200 = $6 | 3;
       $201 = $$0172$lcssa$i + 4 | 0;
       HEAP32[$201 >> 2] = $200;
       $202 = $$0173$lcssa$i | 1;
       $203 = $145 + 4 | 0;
       HEAP32[$203 >> 2] = $202;
       $204 = $145 + $$0173$lcssa$i | 0;
       HEAP32[$204 >> 2] = $$0173$lcssa$i;
       $205 = ($33 | 0) == 0;
       if (!$205) {
        $206 = HEAP32[13200 >> 2] | 0;
        $207 = $33 >>> 3;
        $208 = $207 << 1;
        $209 = 13220 + ($208 << 2) | 0;
        $210 = 1 << $207;
        $211 = $8 & $210;
        $212 = ($211 | 0) == 0;
        if ($212) {
         $213 = $8 | $210;
         HEAP32[3295] = $213;
         $$pre$i = $209 + 8 | 0;
         $$0$i = $209;
         $$pre$phi$iZ2D = $$pre$i;
        } else {
         $214 = $209 + 8 | 0;
         $215 = HEAP32[$214 >> 2] | 0;
         $$0$i = $215;
         $$pre$phi$iZ2D = $214;
        }
        HEAP32[$$pre$phi$iZ2D >> 2] = $206;
        $216 = $$0$i + 12 | 0;
        HEAP32[$216 >> 2] = $206;
        $217 = $206 + 8 | 0;
        HEAP32[$217 >> 2] = $$0$i;
        $218 = $206 + 12 | 0;
        HEAP32[$218 >> 2] = $209;
       }
       HEAP32[13188 >> 2] = $$0173$lcssa$i;
       HEAP32[13200 >> 2] = $145;
      }
      $219 = $$0172$lcssa$i + 8 | 0;
      $$0 = $219;
      STACKTOP = sp;
      return $$0 | 0;
     } else {
      $$0192 = $6;
     }
    }
   } else {
    $$0192 = $6;
   }
  } else {
   $220 = $0 >>> 0 > 4294967231;
   if ($220) {
    $$0192 = -1;
   } else {
    $221 = $0 + 11 | 0;
    $222 = $221 & -8;
    $223 = HEAP32[13184 >> 2] | 0;
    $224 = ($223 | 0) == 0;
    if ($224) {
     $$0192 = $222;
    } else {
     $225 = 0 - $222 | 0;
     $226 = $221 >>> 8;
     $227 = ($226 | 0) == 0;
     if ($227) {
      $$0336$i = 0;
     } else {
      $228 = $222 >>> 0 > 16777215;
      if ($228) {
       $$0336$i = 31;
      } else {
       $229 = $226 + 1048320 | 0;
       $230 = $229 >>> 16;
       $231 = $230 & 8;
       $232 = $226 << $231;
       $233 = $232 + 520192 | 0;
       $234 = $233 >>> 16;
       $235 = $234 & 4;
       $236 = $235 | $231;
       $237 = $232 << $235;
       $238 = $237 + 245760 | 0;
       $239 = $238 >>> 16;
       $240 = $239 & 2;
       $241 = $236 | $240;
       $242 = 14 - $241 | 0;
       $243 = $237 << $240;
       $244 = $243 >>> 15;
       $245 = $242 + $244 | 0;
       $246 = $245 << 1;
       $247 = $245 + 7 | 0;
       $248 = $222 >>> $247;
       $249 = $248 & 1;
       $250 = $249 | $246;
       $$0336$i = $250;
      }
     }
     $251 = 13484 + ($$0336$i << 2) | 0;
     $252 = HEAP32[$251 >> 2] | 0;
     $253 = ($252 | 0) == (0 | 0);
     L74 : do {
      if ($253) {
       $$2333$i = 0;
       $$3$i200 = 0;
       $$3328$i = $225;
       label = 57;
      } else {
       $254 = ($$0336$i | 0) == 31;
       $255 = $$0336$i >>> 1;
       $256 = 25 - $255 | 0;
       $257 = $254 ? 0 : $256;
       $258 = $222 << $257;
       $$0320$i = 0;
       $$0325$i = $225;
       $$0331$i = $252;
       $$0337$i = $258;
       $$0340$i = 0;
       while (1) {
        $259 = $$0331$i + 4 | 0;
        $260 = HEAP32[$259 >> 2] | 0;
        $261 = $260 & -8;
        $262 = $261 - $222 | 0;
        $263 = $262 >>> 0 < $$0325$i >>> 0;
        if ($263) {
         $264 = ($262 | 0) == 0;
         if ($264) {
          $$411$i = $$0331$i;
          $$432910$i = 0;
          $$43359$i = $$0331$i;
          label = 61;
          break L74;
         } else {
          $$1321$i = $$0331$i;
          $$1326$i = $262;
         }
        } else {
         $$1321$i = $$0320$i;
         $$1326$i = $$0325$i;
        }
        $265 = $$0331$i + 20 | 0;
        $266 = HEAP32[$265 >> 2] | 0;
        $267 = $$0337$i >>> 31;
        $268 = ($$0331$i + 16 | 0) + ($267 << 2) | 0;
        $269 = HEAP32[$268 >> 2] | 0;
        $270 = ($266 | 0) == (0 | 0);
        $271 = ($266 | 0) == ($269 | 0);
        $or$cond2$i199 = $270 | $271;
        $$1341$i = $or$cond2$i199 ? $$0340$i : $266;
        $272 = ($269 | 0) == (0 | 0);
        $not$5$i = $272 ^ 1;
        $273 = $not$5$i & 1;
        $$0337$$i = $$0337$i << $273;
        if ($272) {
         $$2333$i = $$1341$i;
         $$3$i200 = $$1321$i;
         $$3328$i = $$1326$i;
         label = 57;
         break;
        } else {
         $$0320$i = $$1321$i;
         $$0325$i = $$1326$i;
         $$0331$i = $269;
         $$0337$i = $$0337$$i;
         $$0340$i = $$1341$i;
        }
       }
      }
     } while (0);
     if ((label | 0) == 57) {
      $274 = ($$2333$i | 0) == (0 | 0);
      $275 = ($$3$i200 | 0) == (0 | 0);
      $or$cond$i201 = $274 & $275;
      if ($or$cond$i201) {
       $276 = 2 << $$0336$i;
       $277 = 0 - $276 | 0;
       $278 = $276 | $277;
       $279 = $223 & $278;
       $280 = ($279 | 0) == 0;
       if ($280) {
        $$0192 = $222;
        break;
       }
       $281 = 0 - $279 | 0;
       $282 = $279 & $281;
       $283 = $282 + -1 | 0;
       $284 = $283 >>> 12;
       $285 = $284 & 16;
       $286 = $283 >>> $285;
       $287 = $286 >>> 5;
       $288 = $287 & 8;
       $289 = $288 | $285;
       $290 = $286 >>> $288;
       $291 = $290 >>> 2;
       $292 = $291 & 4;
       $293 = $289 | $292;
       $294 = $290 >>> $292;
       $295 = $294 >>> 1;
       $296 = $295 & 2;
       $297 = $293 | $296;
       $298 = $294 >>> $296;
       $299 = $298 >>> 1;
       $300 = $299 & 1;
       $301 = $297 | $300;
       $302 = $298 >>> $300;
       $303 = $301 + $302 | 0;
       $304 = 13484 + ($303 << 2) | 0;
       $305 = HEAP32[$304 >> 2] | 0;
       $$4$ph$i = 0;
       $$4335$ph$i = $305;
      } else {
       $$4$ph$i = $$3$i200;
       $$4335$ph$i = $$2333$i;
      }
      $306 = ($$4335$ph$i | 0) == (0 | 0);
      if ($306) {
       $$4$lcssa$i = $$4$ph$i;
       $$4329$lcssa$i = $$3328$i;
      } else {
       $$411$i = $$4$ph$i;
       $$432910$i = $$3328$i;
       $$43359$i = $$4335$ph$i;
       label = 61;
      }
     }
     if ((label | 0) == 61) {
      while (1) {
       label = 0;
       $307 = $$43359$i + 4 | 0;
       $308 = HEAP32[$307 >> 2] | 0;
       $309 = $308 & -8;
       $310 = $309 - $222 | 0;
       $311 = $310 >>> 0 < $$432910$i >>> 0;
       $$$4329$i = $311 ? $310 : $$432910$i;
       $$4335$$4$i = $311 ? $$43359$i : $$411$i;
       $312 = $$43359$i + 16 | 0;
       $313 = HEAP32[$312 >> 2] | 0;
       $not$1$i203 = ($313 | 0) == (0 | 0);
       $$sink2$i204 = $not$1$i203 & 1;
       $314 = ($$43359$i + 16 | 0) + ($$sink2$i204 << 2) | 0;
       $315 = HEAP32[$314 >> 2] | 0;
       $316 = ($315 | 0) == (0 | 0);
       if ($316) {
        $$4$lcssa$i = $$4335$$4$i;
        $$4329$lcssa$i = $$$4329$i;
        break;
       } else {
        $$411$i = $$4335$$4$i;
        $$432910$i = $$$4329$i;
        $$43359$i = $315;
        label = 61;
       }
      }
     }
     $317 = ($$4$lcssa$i | 0) == (0 | 0);
     if ($317) {
      $$0192 = $222;
     } else {
      $318 = HEAP32[13188 >> 2] | 0;
      $319 = $318 - $222 | 0;
      $320 = $$4329$lcssa$i >>> 0 < $319 >>> 0;
      if ($320) {
       $321 = $$4$lcssa$i + $222 | 0;
       $322 = $$4$lcssa$i >>> 0 < $321 >>> 0;
       if (!$322) {
        $$0 = 0;
        STACKTOP = sp;
        return $$0 | 0;
       }
       $323 = $$4$lcssa$i + 24 | 0;
       $324 = HEAP32[$323 >> 2] | 0;
       $325 = $$4$lcssa$i + 12 | 0;
       $326 = HEAP32[$325 >> 2] | 0;
       $327 = ($326 | 0) == ($$4$lcssa$i | 0);
       do {
        if ($327) {
         $332 = $$4$lcssa$i + 20 | 0;
         $333 = HEAP32[$332 >> 2] | 0;
         $334 = ($333 | 0) == (0 | 0);
         if ($334) {
          $335 = $$4$lcssa$i + 16 | 0;
          $336 = HEAP32[$335 >> 2] | 0;
          $337 = ($336 | 0) == (0 | 0);
          if ($337) {
           $$3349$i = 0;
           break;
          } else {
           $$1347$i = $336;
           $$1351$i = $335;
          }
         } else {
          $$1347$i = $333;
          $$1351$i = $332;
         }
         while (1) {
          $338 = $$1347$i + 20 | 0;
          $339 = HEAP32[$338 >> 2] | 0;
          $340 = ($339 | 0) == (0 | 0);
          if (!$340) {
           $$1347$i = $339;
           $$1351$i = $338;
           continue;
          }
          $341 = $$1347$i + 16 | 0;
          $342 = HEAP32[$341 >> 2] | 0;
          $343 = ($342 | 0) == (0 | 0);
          if ($343) {
           break;
          } else {
           $$1347$i = $342;
           $$1351$i = $341;
          }
         }
         HEAP32[$$1351$i >> 2] = 0;
         $$3349$i = $$1347$i;
        } else {
         $328 = $$4$lcssa$i + 8 | 0;
         $329 = HEAP32[$328 >> 2] | 0;
         $330 = $329 + 12 | 0;
         HEAP32[$330 >> 2] = $326;
         $331 = $326 + 8 | 0;
         HEAP32[$331 >> 2] = $329;
         $$3349$i = $326;
        }
       } while (0);
       $344 = ($324 | 0) == (0 | 0);
       do {
        if ($344) {
         $426 = $223;
        } else {
         $345 = $$4$lcssa$i + 28 | 0;
         $346 = HEAP32[$345 >> 2] | 0;
         $347 = 13484 + ($346 << 2) | 0;
         $348 = HEAP32[$347 >> 2] | 0;
         $349 = ($$4$lcssa$i | 0) == ($348 | 0);
         if ($349) {
          HEAP32[$347 >> 2] = $$3349$i;
          $cond$i208 = ($$3349$i | 0) == (0 | 0);
          if ($cond$i208) {
           $350 = 1 << $346;
           $351 = $350 ^ -1;
           $352 = $223 & $351;
           HEAP32[13184 >> 2] = $352;
           $426 = $352;
           break;
          }
         } else {
          $353 = $324 + 16 | 0;
          $354 = HEAP32[$353 >> 2] | 0;
          $not$$i209 = ($354 | 0) != ($$4$lcssa$i | 0);
          $$sink3$i = $not$$i209 & 1;
          $355 = ($324 + 16 | 0) + ($$sink3$i << 2) | 0;
          HEAP32[$355 >> 2] = $$3349$i;
          $356 = ($$3349$i | 0) == (0 | 0);
          if ($356) {
           $426 = $223;
           break;
          }
         }
         $357 = $$3349$i + 24 | 0;
         HEAP32[$357 >> 2] = $324;
         $358 = $$4$lcssa$i + 16 | 0;
         $359 = HEAP32[$358 >> 2] | 0;
         $360 = ($359 | 0) == (0 | 0);
         if (!$360) {
          $361 = $$3349$i + 16 | 0;
          HEAP32[$361 >> 2] = $359;
          $362 = $359 + 24 | 0;
          HEAP32[$362 >> 2] = $$3349$i;
         }
         $363 = $$4$lcssa$i + 20 | 0;
         $364 = HEAP32[$363 >> 2] | 0;
         $365 = ($364 | 0) == (0 | 0);
         if ($365) {
          $426 = $223;
         } else {
          $366 = $$3349$i + 20 | 0;
          HEAP32[$366 >> 2] = $364;
          $367 = $364 + 24 | 0;
          HEAP32[$367 >> 2] = $$3349$i;
          $426 = $223;
         }
        }
       } while (0);
       $368 = $$4329$lcssa$i >>> 0 < 16;
       do {
        if ($368) {
         $369 = $$4329$lcssa$i + $222 | 0;
         $370 = $369 | 3;
         $371 = $$4$lcssa$i + 4 | 0;
         HEAP32[$371 >> 2] = $370;
         $372 = $$4$lcssa$i + $369 | 0;
         $373 = $372 + 4 | 0;
         $374 = HEAP32[$373 >> 2] | 0;
         $375 = $374 | 1;
         HEAP32[$373 >> 2] = $375;
        } else {
         $376 = $222 | 3;
         $377 = $$4$lcssa$i + 4 | 0;
         HEAP32[$377 >> 2] = $376;
         $378 = $$4329$lcssa$i | 1;
         $379 = $321 + 4 | 0;
         HEAP32[$379 >> 2] = $378;
         $380 = $321 + $$4329$lcssa$i | 0;
         HEAP32[$380 >> 2] = $$4329$lcssa$i;
         $381 = $$4329$lcssa$i >>> 3;
         $382 = $$4329$lcssa$i >>> 0 < 256;
         if ($382) {
          $383 = $381 << 1;
          $384 = 13220 + ($383 << 2) | 0;
          $385 = HEAP32[3295] | 0;
          $386 = 1 << $381;
          $387 = $385 & $386;
          $388 = ($387 | 0) == 0;
          if ($388) {
           $389 = $385 | $386;
           HEAP32[3295] = $389;
           $$pre$i210 = $384 + 8 | 0;
           $$0345$i = $384;
           $$pre$phi$i211Z2D = $$pre$i210;
          } else {
           $390 = $384 + 8 | 0;
           $391 = HEAP32[$390 >> 2] | 0;
           $$0345$i = $391;
           $$pre$phi$i211Z2D = $390;
          }
          HEAP32[$$pre$phi$i211Z2D >> 2] = $321;
          $392 = $$0345$i + 12 | 0;
          HEAP32[$392 >> 2] = $321;
          $393 = $321 + 8 | 0;
          HEAP32[$393 >> 2] = $$0345$i;
          $394 = $321 + 12 | 0;
          HEAP32[$394 >> 2] = $384;
          break;
         }
         $395 = $$4329$lcssa$i >>> 8;
         $396 = ($395 | 0) == 0;
         if ($396) {
          $$0339$i = 0;
         } else {
          $397 = $$4329$lcssa$i >>> 0 > 16777215;
          if ($397) {
           $$0339$i = 31;
          } else {
           $398 = $395 + 1048320 | 0;
           $399 = $398 >>> 16;
           $400 = $399 & 8;
           $401 = $395 << $400;
           $402 = $401 + 520192 | 0;
           $403 = $402 >>> 16;
           $404 = $403 & 4;
           $405 = $404 | $400;
           $406 = $401 << $404;
           $407 = $406 + 245760 | 0;
           $408 = $407 >>> 16;
           $409 = $408 & 2;
           $410 = $405 | $409;
           $411 = 14 - $410 | 0;
           $412 = $406 << $409;
           $413 = $412 >>> 15;
           $414 = $411 + $413 | 0;
           $415 = $414 << 1;
           $416 = $414 + 7 | 0;
           $417 = $$4329$lcssa$i >>> $416;
           $418 = $417 & 1;
           $419 = $418 | $415;
           $$0339$i = $419;
          }
         }
         $420 = 13484 + ($$0339$i << 2) | 0;
         $421 = $321 + 28 | 0;
         HEAP32[$421 >> 2] = $$0339$i;
         $422 = $321 + 16 | 0;
         $423 = $422 + 4 | 0;
         HEAP32[$423 >> 2] = 0;
         HEAP32[$422 >> 2] = 0;
         $424 = 1 << $$0339$i;
         $425 = $426 & $424;
         $427 = ($425 | 0) == 0;
         if ($427) {
          $428 = $426 | $424;
          HEAP32[13184 >> 2] = $428;
          HEAP32[$420 >> 2] = $321;
          $429 = $321 + 24 | 0;
          HEAP32[$429 >> 2] = $420;
          $430 = $321 + 12 | 0;
          HEAP32[$430 >> 2] = $321;
          $431 = $321 + 8 | 0;
          HEAP32[$431 >> 2] = $321;
          break;
         }
         $432 = HEAP32[$420 >> 2] | 0;
         $433 = ($$0339$i | 0) == 31;
         $434 = $$0339$i >>> 1;
         $435 = 25 - $434 | 0;
         $436 = $433 ? 0 : $435;
         $437 = $$4329$lcssa$i << $436;
         $$0322$i = $437;
         $$0323$i = $432;
         while (1) {
          $438 = $$0323$i + 4 | 0;
          $439 = HEAP32[$438 >> 2] | 0;
          $440 = $439 & -8;
          $441 = ($440 | 0) == ($$4329$lcssa$i | 0);
          if ($441) {
           label = 97;
           break;
          }
          $442 = $$0322$i >>> 31;
          $443 = ($$0323$i + 16 | 0) + ($442 << 2) | 0;
          $444 = $$0322$i << 1;
          $445 = HEAP32[$443 >> 2] | 0;
          $446 = ($445 | 0) == (0 | 0);
          if ($446) {
           label = 96;
           break;
          } else {
           $$0322$i = $444;
           $$0323$i = $445;
          }
         }
         if ((label | 0) == 96) {
          HEAP32[$443 >> 2] = $321;
          $447 = $321 + 24 | 0;
          HEAP32[$447 >> 2] = $$0323$i;
          $448 = $321 + 12 | 0;
          HEAP32[$448 >> 2] = $321;
          $449 = $321 + 8 | 0;
          HEAP32[$449 >> 2] = $321;
          break;
         } else if ((label | 0) == 97) {
          $450 = $$0323$i + 8 | 0;
          $451 = HEAP32[$450 >> 2] | 0;
          $452 = $451 + 12 | 0;
          HEAP32[$452 >> 2] = $321;
          HEAP32[$450 >> 2] = $321;
          $453 = $321 + 8 | 0;
          HEAP32[$453 >> 2] = $451;
          $454 = $321 + 12 | 0;
          HEAP32[$454 >> 2] = $$0323$i;
          $455 = $321 + 24 | 0;
          HEAP32[$455 >> 2] = 0;
          break;
         }
        }
       } while (0);
       $456 = $$4$lcssa$i + 8 | 0;
       $$0 = $456;
       STACKTOP = sp;
       return $$0 | 0;
      } else {
       $$0192 = $222;
      }
     }
    }
   }
  }
 } while (0);
 $457 = HEAP32[13188 >> 2] | 0;
 $458 = $457 >>> 0 < $$0192 >>> 0;
 if (!$458) {
  $459 = $457 - $$0192 | 0;
  $460 = HEAP32[13200 >> 2] | 0;
  $461 = $459 >>> 0 > 15;
  if ($461) {
   $462 = $460 + $$0192 | 0;
   HEAP32[13200 >> 2] = $462;
   HEAP32[13188 >> 2] = $459;
   $463 = $459 | 1;
   $464 = $462 + 4 | 0;
   HEAP32[$464 >> 2] = $463;
   $465 = $462 + $459 | 0;
   HEAP32[$465 >> 2] = $459;
   $466 = $$0192 | 3;
   $467 = $460 + 4 | 0;
   HEAP32[$467 >> 2] = $466;
  } else {
   HEAP32[13188 >> 2] = 0;
   HEAP32[13200 >> 2] = 0;
   $468 = $457 | 3;
   $469 = $460 + 4 | 0;
   HEAP32[$469 >> 2] = $468;
   $470 = $460 + $457 | 0;
   $471 = $470 + 4 | 0;
   $472 = HEAP32[$471 >> 2] | 0;
   $473 = $472 | 1;
   HEAP32[$471 >> 2] = $473;
  }
  $474 = $460 + 8 | 0;
  $$0 = $474;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $475 = HEAP32[13192 >> 2] | 0;
 $476 = $475 >>> 0 > $$0192 >>> 0;
 if ($476) {
  $477 = $475 - $$0192 | 0;
  HEAP32[13192 >> 2] = $477;
  $478 = HEAP32[13204 >> 2] | 0;
  $479 = $478 + $$0192 | 0;
  HEAP32[13204 >> 2] = $479;
  $480 = $477 | 1;
  $481 = $479 + 4 | 0;
  HEAP32[$481 >> 2] = $480;
  $482 = $$0192 | 3;
  $483 = $478 + 4 | 0;
  HEAP32[$483 >> 2] = $482;
  $484 = $478 + 8 | 0;
  $$0 = $484;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $485 = HEAP32[3413] | 0;
 $486 = ($485 | 0) == 0;
 if ($486) {
  HEAP32[13660 >> 2] = 4096;
  HEAP32[13656 >> 2] = 4096;
  HEAP32[13664 >> 2] = -1;
  HEAP32[13668 >> 2] = -1;
  HEAP32[13672 >> 2] = 0;
  HEAP32[13624 >> 2] = 0;
  $487 = $1;
  $488 = $487 & -16;
  $489 = $488 ^ 1431655768;
  HEAP32[$1 >> 2] = $489;
  HEAP32[3413] = $489;
  $493 = 4096;
 } else {
  $$pre$i195 = HEAP32[13660 >> 2] | 0;
  $493 = $$pre$i195;
 }
 $490 = $$0192 + 48 | 0;
 $491 = $$0192 + 47 | 0;
 $492 = $493 + $491 | 0;
 $494 = 0 - $493 | 0;
 $495 = $492 & $494;
 $496 = $495 >>> 0 > $$0192 >>> 0;
 if (!$496) {
  $$0 = 0;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $497 = HEAP32[13620 >> 2] | 0;
 $498 = ($497 | 0) == 0;
 if (!$498) {
  $499 = HEAP32[13612 >> 2] | 0;
  $500 = $499 + $495 | 0;
  $501 = $500 >>> 0 <= $499 >>> 0;
  $502 = $500 >>> 0 > $497 >>> 0;
  $or$cond1$i = $501 | $502;
  if ($or$cond1$i) {
   $$0 = 0;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $503 = HEAP32[13624 >> 2] | 0;
 $504 = $503 & 4;
 $505 = ($504 | 0) == 0;
 L167 : do {
  if ($505) {
   $506 = HEAP32[13204 >> 2] | 0;
   $507 = ($506 | 0) == (0 | 0);
   L169 : do {
    if ($507) {
     label = 118;
    } else {
     $$0$i20$i = 13628;
     while (1) {
      $508 = HEAP32[$$0$i20$i >> 2] | 0;
      $509 = $508 >>> 0 > $506 >>> 0;
      if (!$509) {
       $510 = $$0$i20$i + 4 | 0;
       $511 = HEAP32[$510 >> 2] | 0;
       $512 = $508 + $511 | 0;
       $513 = $512 >>> 0 > $506 >>> 0;
       if ($513) {
        break;
       }
      }
      $514 = $$0$i20$i + 8 | 0;
      $515 = HEAP32[$514 >> 2] | 0;
      $516 = ($515 | 0) == (0 | 0);
      if ($516) {
       label = 118;
       break L169;
      } else {
       $$0$i20$i = $515;
      }
     }
     $539 = $492 - $475 | 0;
     $540 = $539 & $494;
     $541 = $540 >>> 0 < 2147483647;
     if ($541) {
      $542 = (tempInt = _sbrk($540 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $543 = HEAP32[$$0$i20$i >> 2] | 0;
      $544 = HEAP32[$510 >> 2] | 0;
      $545 = $543 + $544 | 0;
      $546 = ($542 | 0) == ($545 | 0);
      if ($546) {
       $547 = ($542 | 0) == (-1 | 0);
       if ($547) {
        $$2234243136$i = $540;
       } else {
        $$723947$i = $540;
        $$748$i = $542;
        label = 135;
        break L167;
       }
      } else {
       $$2247$ph$i = $542;
       $$2253$ph$i = $540;
       label = 126;
      }
     } else {
      $$2234243136$i = 0;
     }
    }
   } while (0);
   do {
    if ((label | 0) == 118) {
     $517 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $518 = ($517 | 0) == (-1 | 0);
     if ($518) {
      $$2234243136$i = 0;
     } else {
      $519 = $517;
      $520 = HEAP32[13656 >> 2] | 0;
      $521 = $520 + -1 | 0;
      $522 = $521 & $519;
      $523 = ($522 | 0) == 0;
      $524 = $521 + $519 | 0;
      $525 = 0 - $520 | 0;
      $526 = $524 & $525;
      $527 = $526 - $519 | 0;
      $528 = $523 ? 0 : $527;
      $$$i = $528 + $495 | 0;
      $529 = HEAP32[13612 >> 2] | 0;
      $530 = $$$i + $529 | 0;
      $531 = $$$i >>> 0 > $$0192 >>> 0;
      $532 = $$$i >>> 0 < 2147483647;
      $or$cond$i = $531 & $532;
      if ($or$cond$i) {
       $533 = HEAP32[13620 >> 2] | 0;
       $534 = ($533 | 0) == 0;
       if (!$534) {
        $535 = $530 >>> 0 <= $529 >>> 0;
        $536 = $530 >>> 0 > $533 >>> 0;
        $or$cond2$i = $535 | $536;
        if ($or$cond2$i) {
         $$2234243136$i = 0;
         break;
        }
       }
       $537 = (tempInt = _sbrk($$$i | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
       $538 = ($537 | 0) == ($517 | 0);
       if ($538) {
        $$723947$i = $$$i;
        $$748$i = $517;
        label = 135;
        break L167;
       } else {
        $$2247$ph$i = $537;
        $$2253$ph$i = $$$i;
        label = 126;
       }
      } else {
       $$2234243136$i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 126) {
     $548 = 0 - $$2253$ph$i | 0;
     $549 = ($$2247$ph$i | 0) != (-1 | 0);
     $550 = $$2253$ph$i >>> 0 < 2147483647;
     $or$cond7$i = $550 & $549;
     $551 = $490 >>> 0 > $$2253$ph$i >>> 0;
     $or$cond10$i = $551 & $or$cond7$i;
     if (!$or$cond10$i) {
      $561 = ($$2247$ph$i | 0) == (-1 | 0);
      if ($561) {
       $$2234243136$i = 0;
       break;
      } else {
       $$723947$i = $$2253$ph$i;
       $$748$i = $$2247$ph$i;
       label = 135;
       break L167;
      }
     }
     $552 = HEAP32[13660 >> 2] | 0;
     $553 = $491 - $$2253$ph$i | 0;
     $554 = $553 + $552 | 0;
     $555 = 0 - $552 | 0;
     $556 = $554 & $555;
     $557 = $556 >>> 0 < 2147483647;
     if (!$557) {
      $$723947$i = $$2253$ph$i;
      $$748$i = $$2247$ph$i;
      label = 135;
      break L167;
     }
     $558 = (tempInt = _sbrk($556 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $559 = ($558 | 0) == (-1 | 0);
     if ($559) {
      (tempInt = _sbrk($548 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $$2234243136$i = 0;
      break;
     } else {
      $560 = $556 + $$2253$ph$i | 0;
      $$723947$i = $560;
      $$748$i = $$2247$ph$i;
      label = 135;
      break L167;
     }
    }
   } while (0);
   $562 = HEAP32[13624 >> 2] | 0;
   $563 = $562 | 4;
   HEAP32[13624 >> 2] = $563;
   $$4236$i = $$2234243136$i;
   label = 133;
  } else {
   $$4236$i = 0;
   label = 133;
  }
 } while (0);
 if ((label | 0) == 133) {
  $564 = $495 >>> 0 < 2147483647;
  if ($564) {
   $565 = (tempInt = _sbrk($495 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $566 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $567 = ($565 | 0) != (-1 | 0);
   $568 = ($566 | 0) != (-1 | 0);
   $or$cond5$i = $567 & $568;
   $569 = $565 >>> 0 < $566 >>> 0;
   $or$cond11$i = $569 & $or$cond5$i;
   $570 = $566;
   $571 = $565;
   $572 = $570 - $571 | 0;
   $573 = $$0192 + 40 | 0;
   $574 = $572 >>> 0 > $573 >>> 0;
   $$$4236$i = $574 ? $572 : $$4236$i;
   $or$cond11$not$i = $or$cond11$i ^ 1;
   $575 = ($565 | 0) == (-1 | 0);
   $not$$i197 = $574 ^ 1;
   $576 = $575 | $not$$i197;
   $or$cond49$i = $576 | $or$cond11$not$i;
   if (!$or$cond49$i) {
    $$723947$i = $$$4236$i;
    $$748$i = $565;
    label = 135;
   }
  }
 }
 if ((label | 0) == 135) {
  $577 = HEAP32[13612 >> 2] | 0;
  $578 = $577 + $$723947$i | 0;
  HEAP32[13612 >> 2] = $578;
  $579 = HEAP32[13616 >> 2] | 0;
  $580 = $578 >>> 0 > $579 >>> 0;
  if ($580) {
   HEAP32[13616 >> 2] = $578;
  }
  $581 = HEAP32[13204 >> 2] | 0;
  $582 = ($581 | 0) == (0 | 0);
  do {
   if ($582) {
    $583 = HEAP32[13196 >> 2] | 0;
    $584 = ($583 | 0) == (0 | 0);
    $585 = $$748$i >>> 0 < $583 >>> 0;
    $or$cond12$i = $584 | $585;
    if ($or$cond12$i) {
     HEAP32[13196 >> 2] = $$748$i;
    }
    HEAP32[13628 >> 2] = $$748$i;
    HEAP32[13632 >> 2] = $$723947$i;
    HEAP32[13640 >> 2] = 0;
    $586 = HEAP32[3413] | 0;
    HEAP32[13216 >> 2] = $586;
    HEAP32[13212 >> 2] = -1;
    $$01$i$i = 0;
    while (1) {
     $587 = $$01$i$i << 1;
     $588 = 13220 + ($587 << 2) | 0;
     $589 = $588 + 12 | 0;
     HEAP32[$589 >> 2] = $588;
     $590 = $588 + 8 | 0;
     HEAP32[$590 >> 2] = $588;
     $591 = $$01$i$i + 1 | 0;
     $exitcond$i$i = ($591 | 0) == 32;
     if ($exitcond$i$i) {
      break;
     } else {
      $$01$i$i = $591;
     }
    }
    $592 = $$723947$i + -40 | 0;
    $593 = $$748$i + 8 | 0;
    $594 = $593;
    $595 = $594 & 7;
    $596 = ($595 | 0) == 0;
    $597 = 0 - $594 | 0;
    $598 = $597 & 7;
    $599 = $596 ? 0 : $598;
    $600 = $$748$i + $599 | 0;
    $601 = $592 - $599 | 0;
    HEAP32[13204 >> 2] = $600;
    HEAP32[13192 >> 2] = $601;
    $602 = $601 | 1;
    $603 = $600 + 4 | 0;
    HEAP32[$603 >> 2] = $602;
    $604 = $600 + $601 | 0;
    $605 = $604 + 4 | 0;
    HEAP32[$605 >> 2] = 40;
    $606 = HEAP32[13668 >> 2] | 0;
    HEAP32[13208 >> 2] = $606;
   } else {
    $$024370$i = 13628;
    while (1) {
     $607 = HEAP32[$$024370$i >> 2] | 0;
     $608 = $$024370$i + 4 | 0;
     $609 = HEAP32[$608 >> 2] | 0;
     $610 = $607 + $609 | 0;
     $611 = ($$748$i | 0) == ($610 | 0);
     if ($611) {
      label = 145;
      break;
     }
     $612 = $$024370$i + 8 | 0;
     $613 = HEAP32[$612 >> 2] | 0;
     $614 = ($613 | 0) == (0 | 0);
     if ($614) {
      break;
     } else {
      $$024370$i = $613;
     }
    }
    if ((label | 0) == 145) {
     $615 = $$024370$i + 12 | 0;
     $616 = HEAP32[$615 >> 2] | 0;
     $617 = $616 & 8;
     $618 = ($617 | 0) == 0;
     if ($618) {
      $619 = $581 >>> 0 >= $607 >>> 0;
      $620 = $581 >>> 0 < $$748$i >>> 0;
      $or$cond50$i = $620 & $619;
      if ($or$cond50$i) {
       $621 = $609 + $$723947$i | 0;
       HEAP32[$608 >> 2] = $621;
       $622 = HEAP32[13192 >> 2] | 0;
       $623 = $581 + 8 | 0;
       $624 = $623;
       $625 = $624 & 7;
       $626 = ($625 | 0) == 0;
       $627 = 0 - $624 | 0;
       $628 = $627 & 7;
       $629 = $626 ? 0 : $628;
       $630 = $581 + $629 | 0;
       $631 = $$723947$i - $629 | 0;
       $632 = $622 + $631 | 0;
       HEAP32[13204 >> 2] = $630;
       HEAP32[13192 >> 2] = $632;
       $633 = $632 | 1;
       $634 = $630 + 4 | 0;
       HEAP32[$634 >> 2] = $633;
       $635 = $630 + $632 | 0;
       $636 = $635 + 4 | 0;
       HEAP32[$636 >> 2] = 40;
       $637 = HEAP32[13668 >> 2] | 0;
       HEAP32[13208 >> 2] = $637;
       break;
      }
     }
    }
    $638 = HEAP32[13196 >> 2] | 0;
    $639 = $$748$i >>> 0 < $638 >>> 0;
    if ($639) {
     HEAP32[13196 >> 2] = $$748$i;
    }
    $640 = $$748$i + $$723947$i | 0;
    $$124469$i = 13628;
    while (1) {
     $641 = HEAP32[$$124469$i >> 2] | 0;
     $642 = ($641 | 0) == ($640 | 0);
     if ($642) {
      label = 153;
      break;
     }
     $643 = $$124469$i + 8 | 0;
     $644 = HEAP32[$643 >> 2] | 0;
     $645 = ($644 | 0) == (0 | 0);
     if ($645) {
      break;
     } else {
      $$124469$i = $644;
     }
    }
    if ((label | 0) == 153) {
     $646 = $$124469$i + 12 | 0;
     $647 = HEAP32[$646 >> 2] | 0;
     $648 = $647 & 8;
     $649 = ($648 | 0) == 0;
     if ($649) {
      HEAP32[$$124469$i >> 2] = $$748$i;
      $650 = $$124469$i + 4 | 0;
      $651 = HEAP32[$650 >> 2] | 0;
      $652 = $651 + $$723947$i | 0;
      HEAP32[$650 >> 2] = $652;
      $653 = $$748$i + 8 | 0;
      $654 = $653;
      $655 = $654 & 7;
      $656 = ($655 | 0) == 0;
      $657 = 0 - $654 | 0;
      $658 = $657 & 7;
      $659 = $656 ? 0 : $658;
      $660 = $$748$i + $659 | 0;
      $661 = $640 + 8 | 0;
      $662 = $661;
      $663 = $662 & 7;
      $664 = ($663 | 0) == 0;
      $665 = 0 - $662 | 0;
      $666 = $665 & 7;
      $667 = $664 ? 0 : $666;
      $668 = $640 + $667 | 0;
      $669 = $668;
      $670 = $660;
      $671 = $669 - $670 | 0;
      $672 = $660 + $$0192 | 0;
      $673 = $671 - $$0192 | 0;
      $674 = $$0192 | 3;
      $675 = $660 + 4 | 0;
      HEAP32[$675 >> 2] = $674;
      $676 = ($668 | 0) == ($581 | 0);
      do {
       if ($676) {
        $677 = HEAP32[13192 >> 2] | 0;
        $678 = $677 + $673 | 0;
        HEAP32[13192 >> 2] = $678;
        HEAP32[13204 >> 2] = $672;
        $679 = $678 | 1;
        $680 = $672 + 4 | 0;
        HEAP32[$680 >> 2] = $679;
       } else {
        $681 = HEAP32[13200 >> 2] | 0;
        $682 = ($668 | 0) == ($681 | 0);
        if ($682) {
         $683 = HEAP32[13188 >> 2] | 0;
         $684 = $683 + $673 | 0;
         HEAP32[13188 >> 2] = $684;
         HEAP32[13200 >> 2] = $672;
         $685 = $684 | 1;
         $686 = $672 + 4 | 0;
         HEAP32[$686 >> 2] = $685;
         $687 = $672 + $684 | 0;
         HEAP32[$687 >> 2] = $684;
         break;
        }
        $688 = $668 + 4 | 0;
        $689 = HEAP32[$688 >> 2] | 0;
        $690 = $689 & 3;
        $691 = ($690 | 0) == 1;
        if ($691) {
         $692 = $689 & -8;
         $693 = $689 >>> 3;
         $694 = $689 >>> 0 < 256;
         L237 : do {
          if ($694) {
           $695 = $668 + 8 | 0;
           $696 = HEAP32[$695 >> 2] | 0;
           $697 = $668 + 12 | 0;
           $698 = HEAP32[$697 >> 2] | 0;
           $699 = ($698 | 0) == ($696 | 0);
           if ($699) {
            $700 = 1 << $693;
            $701 = $700 ^ -1;
            $702 = HEAP32[3295] | 0;
            $703 = $702 & $701;
            HEAP32[3295] = $703;
            break;
           } else {
            $704 = $696 + 12 | 0;
            HEAP32[$704 >> 2] = $698;
            $705 = $698 + 8 | 0;
            HEAP32[$705 >> 2] = $696;
            break;
           }
          } else {
           $706 = $668 + 24 | 0;
           $707 = HEAP32[$706 >> 2] | 0;
           $708 = $668 + 12 | 0;
           $709 = HEAP32[$708 >> 2] | 0;
           $710 = ($709 | 0) == ($668 | 0);
           do {
            if ($710) {
             $715 = $668 + 16 | 0;
             $716 = $715 + 4 | 0;
             $717 = HEAP32[$716 >> 2] | 0;
             $718 = ($717 | 0) == (0 | 0);
             if ($718) {
              $719 = HEAP32[$715 >> 2] | 0;
              $720 = ($719 | 0) == (0 | 0);
              if ($720) {
               $$3$i$i = 0;
               break;
              } else {
               $$1264$i$i = $719;
               $$1266$i$i = $715;
              }
             } else {
              $$1264$i$i = $717;
              $$1266$i$i = $716;
             }
             while (1) {
              $721 = $$1264$i$i + 20 | 0;
              $722 = HEAP32[$721 >> 2] | 0;
              $723 = ($722 | 0) == (0 | 0);
              if (!$723) {
               $$1264$i$i = $722;
               $$1266$i$i = $721;
               continue;
              }
              $724 = $$1264$i$i + 16 | 0;
              $725 = HEAP32[$724 >> 2] | 0;
              $726 = ($725 | 0) == (0 | 0);
              if ($726) {
               break;
              } else {
               $$1264$i$i = $725;
               $$1266$i$i = $724;
              }
             }
             HEAP32[$$1266$i$i >> 2] = 0;
             $$3$i$i = $$1264$i$i;
            } else {
             $711 = $668 + 8 | 0;
             $712 = HEAP32[$711 >> 2] | 0;
             $713 = $712 + 12 | 0;
             HEAP32[$713 >> 2] = $709;
             $714 = $709 + 8 | 0;
             HEAP32[$714 >> 2] = $712;
             $$3$i$i = $709;
            }
           } while (0);
           $727 = ($707 | 0) == (0 | 0);
           if ($727) {
            break;
           }
           $728 = $668 + 28 | 0;
           $729 = HEAP32[$728 >> 2] | 0;
           $730 = 13484 + ($729 << 2) | 0;
           $731 = HEAP32[$730 >> 2] | 0;
           $732 = ($668 | 0) == ($731 | 0);
           do {
            if ($732) {
             HEAP32[$730 >> 2] = $$3$i$i;
             $cond$i$i = ($$3$i$i | 0) == (0 | 0);
             if (!$cond$i$i) {
              break;
             }
             $733 = 1 << $729;
             $734 = $733 ^ -1;
             $735 = HEAP32[13184 >> 2] | 0;
             $736 = $735 & $734;
             HEAP32[13184 >> 2] = $736;
             break L237;
            } else {
             $737 = $707 + 16 | 0;
             $738 = HEAP32[$737 >> 2] | 0;
             $not$$i$i = ($738 | 0) != ($668 | 0);
             $$sink1$i$i = $not$$i$i & 1;
             $739 = ($707 + 16 | 0) + ($$sink1$i$i << 2) | 0;
             HEAP32[$739 >> 2] = $$3$i$i;
             $740 = ($$3$i$i | 0) == (0 | 0);
             if ($740) {
              break L237;
             }
            }
           } while (0);
           $741 = $$3$i$i + 24 | 0;
           HEAP32[$741 >> 2] = $707;
           $742 = $668 + 16 | 0;
           $743 = HEAP32[$742 >> 2] | 0;
           $744 = ($743 | 0) == (0 | 0);
           if (!$744) {
            $745 = $$3$i$i + 16 | 0;
            HEAP32[$745 >> 2] = $743;
            $746 = $743 + 24 | 0;
            HEAP32[$746 >> 2] = $$3$i$i;
           }
           $747 = $742 + 4 | 0;
           $748 = HEAP32[$747 >> 2] | 0;
           $749 = ($748 | 0) == (0 | 0);
           if ($749) {
            break;
           }
           $750 = $$3$i$i + 20 | 0;
           HEAP32[$750 >> 2] = $748;
           $751 = $748 + 24 | 0;
           HEAP32[$751 >> 2] = $$3$i$i;
          }
         } while (0);
         $752 = $668 + $692 | 0;
         $753 = $692 + $673 | 0;
         $$0$i$i = $752;
         $$0260$i$i = $753;
        } else {
         $$0$i$i = $668;
         $$0260$i$i = $673;
        }
        $754 = $$0$i$i + 4 | 0;
        $755 = HEAP32[$754 >> 2] | 0;
        $756 = $755 & -2;
        HEAP32[$754 >> 2] = $756;
        $757 = $$0260$i$i | 1;
        $758 = $672 + 4 | 0;
        HEAP32[$758 >> 2] = $757;
        $759 = $672 + $$0260$i$i | 0;
        HEAP32[$759 >> 2] = $$0260$i$i;
        $760 = $$0260$i$i >>> 3;
        $761 = $$0260$i$i >>> 0 < 256;
        if ($761) {
         $762 = $760 << 1;
         $763 = 13220 + ($762 << 2) | 0;
         $764 = HEAP32[3295] | 0;
         $765 = 1 << $760;
         $766 = $764 & $765;
         $767 = ($766 | 0) == 0;
         if ($767) {
          $768 = $764 | $765;
          HEAP32[3295] = $768;
          $$pre$i17$i = $763 + 8 | 0;
          $$0268$i$i = $763;
          $$pre$phi$i18$iZ2D = $$pre$i17$i;
         } else {
          $769 = $763 + 8 | 0;
          $770 = HEAP32[$769 >> 2] | 0;
          $$0268$i$i = $770;
          $$pre$phi$i18$iZ2D = $769;
         }
         HEAP32[$$pre$phi$i18$iZ2D >> 2] = $672;
         $771 = $$0268$i$i + 12 | 0;
         HEAP32[$771 >> 2] = $672;
         $772 = $672 + 8 | 0;
         HEAP32[$772 >> 2] = $$0268$i$i;
         $773 = $672 + 12 | 0;
         HEAP32[$773 >> 2] = $763;
         break;
        }
        $774 = $$0260$i$i >>> 8;
        $775 = ($774 | 0) == 0;
        do {
         if ($775) {
          $$0269$i$i = 0;
         } else {
          $776 = $$0260$i$i >>> 0 > 16777215;
          if ($776) {
           $$0269$i$i = 31;
           break;
          }
          $777 = $774 + 1048320 | 0;
          $778 = $777 >>> 16;
          $779 = $778 & 8;
          $780 = $774 << $779;
          $781 = $780 + 520192 | 0;
          $782 = $781 >>> 16;
          $783 = $782 & 4;
          $784 = $783 | $779;
          $785 = $780 << $783;
          $786 = $785 + 245760 | 0;
          $787 = $786 >>> 16;
          $788 = $787 & 2;
          $789 = $784 | $788;
          $790 = 14 - $789 | 0;
          $791 = $785 << $788;
          $792 = $791 >>> 15;
          $793 = $790 + $792 | 0;
          $794 = $793 << 1;
          $795 = $793 + 7 | 0;
          $796 = $$0260$i$i >>> $795;
          $797 = $796 & 1;
          $798 = $797 | $794;
          $$0269$i$i = $798;
         }
        } while (0);
        $799 = 13484 + ($$0269$i$i << 2) | 0;
        $800 = $672 + 28 | 0;
        HEAP32[$800 >> 2] = $$0269$i$i;
        $801 = $672 + 16 | 0;
        $802 = $801 + 4 | 0;
        HEAP32[$802 >> 2] = 0;
        HEAP32[$801 >> 2] = 0;
        $803 = HEAP32[13184 >> 2] | 0;
        $804 = 1 << $$0269$i$i;
        $805 = $803 & $804;
        $806 = ($805 | 0) == 0;
        if ($806) {
         $807 = $803 | $804;
         HEAP32[13184 >> 2] = $807;
         HEAP32[$799 >> 2] = $672;
         $808 = $672 + 24 | 0;
         HEAP32[$808 >> 2] = $799;
         $809 = $672 + 12 | 0;
         HEAP32[$809 >> 2] = $672;
         $810 = $672 + 8 | 0;
         HEAP32[$810 >> 2] = $672;
         break;
        }
        $811 = HEAP32[$799 >> 2] | 0;
        $812 = ($$0269$i$i | 0) == 31;
        $813 = $$0269$i$i >>> 1;
        $814 = 25 - $813 | 0;
        $815 = $812 ? 0 : $814;
        $816 = $$0260$i$i << $815;
        $$0261$i$i = $816;
        $$0262$i$i = $811;
        while (1) {
         $817 = $$0262$i$i + 4 | 0;
         $818 = HEAP32[$817 >> 2] | 0;
         $819 = $818 & -8;
         $820 = ($819 | 0) == ($$0260$i$i | 0);
         if ($820) {
          label = 194;
          break;
         }
         $821 = $$0261$i$i >>> 31;
         $822 = ($$0262$i$i + 16 | 0) + ($821 << 2) | 0;
         $823 = $$0261$i$i << 1;
         $824 = HEAP32[$822 >> 2] | 0;
         $825 = ($824 | 0) == (0 | 0);
         if ($825) {
          label = 193;
          break;
         } else {
          $$0261$i$i = $823;
          $$0262$i$i = $824;
         }
        }
        if ((label | 0) == 193) {
         HEAP32[$822 >> 2] = $672;
         $826 = $672 + 24 | 0;
         HEAP32[$826 >> 2] = $$0262$i$i;
         $827 = $672 + 12 | 0;
         HEAP32[$827 >> 2] = $672;
         $828 = $672 + 8 | 0;
         HEAP32[$828 >> 2] = $672;
         break;
        } else if ((label | 0) == 194) {
         $829 = $$0262$i$i + 8 | 0;
         $830 = HEAP32[$829 >> 2] | 0;
         $831 = $830 + 12 | 0;
         HEAP32[$831 >> 2] = $672;
         HEAP32[$829 >> 2] = $672;
         $832 = $672 + 8 | 0;
         HEAP32[$832 >> 2] = $830;
         $833 = $672 + 12 | 0;
         HEAP32[$833 >> 2] = $$0262$i$i;
         $834 = $672 + 24 | 0;
         HEAP32[$834 >> 2] = 0;
         break;
        }
       }
      } while (0);
      $959 = $660 + 8 | 0;
      $$0 = $959;
      STACKTOP = sp;
      return $$0 | 0;
     }
    }
    $$0$i$i$i = 13628;
    while (1) {
     $835 = HEAP32[$$0$i$i$i >> 2] | 0;
     $836 = $835 >>> 0 > $581 >>> 0;
     if (!$836) {
      $837 = $$0$i$i$i + 4 | 0;
      $838 = HEAP32[$837 >> 2] | 0;
      $839 = $835 + $838 | 0;
      $840 = $839 >>> 0 > $581 >>> 0;
      if ($840) {
       break;
      }
     }
     $841 = $$0$i$i$i + 8 | 0;
     $842 = HEAP32[$841 >> 2] | 0;
     $$0$i$i$i = $842;
    }
    $843 = $839 + -47 | 0;
    $844 = $843 + 8 | 0;
    $845 = $844;
    $846 = $845 & 7;
    $847 = ($846 | 0) == 0;
    $848 = 0 - $845 | 0;
    $849 = $848 & 7;
    $850 = $847 ? 0 : $849;
    $851 = $843 + $850 | 0;
    $852 = $581 + 16 | 0;
    $853 = $851 >>> 0 < $852 >>> 0;
    $854 = $853 ? $581 : $851;
    $855 = $854 + 8 | 0;
    $856 = $854 + 24 | 0;
    $857 = $$723947$i + -40 | 0;
    $858 = $$748$i + 8 | 0;
    $859 = $858;
    $860 = $859 & 7;
    $861 = ($860 | 0) == 0;
    $862 = 0 - $859 | 0;
    $863 = $862 & 7;
    $864 = $861 ? 0 : $863;
    $865 = $$748$i + $864 | 0;
    $866 = $857 - $864 | 0;
    HEAP32[13204 >> 2] = $865;
    HEAP32[13192 >> 2] = $866;
    $867 = $866 | 1;
    $868 = $865 + 4 | 0;
    HEAP32[$868 >> 2] = $867;
    $869 = $865 + $866 | 0;
    $870 = $869 + 4 | 0;
    HEAP32[$870 >> 2] = 40;
    $871 = HEAP32[13668 >> 2] | 0;
    HEAP32[13208 >> 2] = $871;
    $872 = $854 + 4 | 0;
    HEAP32[$872 >> 2] = 27;
    HEAP32[$855 >> 2] = HEAP32[13628 >> 2] | 0;
    HEAP32[$855 + 4 >> 2] = HEAP32[13628 + 4 >> 2] | 0;
    HEAP32[$855 + 8 >> 2] = HEAP32[13628 + 8 >> 2] | 0;
    HEAP32[$855 + 12 >> 2] = HEAP32[13628 + 12 >> 2] | 0;
    HEAP32[13628 >> 2] = $$748$i;
    HEAP32[13632 >> 2] = $$723947$i;
    HEAP32[13640 >> 2] = 0;
    HEAP32[13636 >> 2] = $855;
    $874 = $856;
    while (1) {
     $873 = $874 + 4 | 0;
     HEAP32[$873 >> 2] = 7;
     $875 = $874 + 8 | 0;
     $876 = $875 >>> 0 < $839 >>> 0;
     if ($876) {
      $874 = $873;
     } else {
      break;
     }
    }
    $877 = ($854 | 0) == ($581 | 0);
    if (!$877) {
     $878 = $854;
     $879 = $581;
     $880 = $878 - $879 | 0;
     $881 = HEAP32[$872 >> 2] | 0;
     $882 = $881 & -2;
     HEAP32[$872 >> 2] = $882;
     $883 = $880 | 1;
     $884 = $581 + 4 | 0;
     HEAP32[$884 >> 2] = $883;
     HEAP32[$854 >> 2] = $880;
     $885 = $880 >>> 3;
     $886 = $880 >>> 0 < 256;
     if ($886) {
      $887 = $885 << 1;
      $888 = 13220 + ($887 << 2) | 0;
      $889 = HEAP32[3295] | 0;
      $890 = 1 << $885;
      $891 = $889 & $890;
      $892 = ($891 | 0) == 0;
      if ($892) {
       $893 = $889 | $890;
       HEAP32[3295] = $893;
       $$pre$i$i = $888 + 8 | 0;
       $$0206$i$i = $888;
       $$pre$phi$i$iZ2D = $$pre$i$i;
      } else {
       $894 = $888 + 8 | 0;
       $895 = HEAP32[$894 >> 2] | 0;
       $$0206$i$i = $895;
       $$pre$phi$i$iZ2D = $894;
      }
      HEAP32[$$pre$phi$i$iZ2D >> 2] = $581;
      $896 = $$0206$i$i + 12 | 0;
      HEAP32[$896 >> 2] = $581;
      $897 = $581 + 8 | 0;
      HEAP32[$897 >> 2] = $$0206$i$i;
      $898 = $581 + 12 | 0;
      HEAP32[$898 >> 2] = $888;
      break;
     }
     $899 = $880 >>> 8;
     $900 = ($899 | 0) == 0;
     if ($900) {
      $$0207$i$i = 0;
     } else {
      $901 = $880 >>> 0 > 16777215;
      if ($901) {
       $$0207$i$i = 31;
      } else {
       $902 = $899 + 1048320 | 0;
       $903 = $902 >>> 16;
       $904 = $903 & 8;
       $905 = $899 << $904;
       $906 = $905 + 520192 | 0;
       $907 = $906 >>> 16;
       $908 = $907 & 4;
       $909 = $908 | $904;
       $910 = $905 << $908;
       $911 = $910 + 245760 | 0;
       $912 = $911 >>> 16;
       $913 = $912 & 2;
       $914 = $909 | $913;
       $915 = 14 - $914 | 0;
       $916 = $910 << $913;
       $917 = $916 >>> 15;
       $918 = $915 + $917 | 0;
       $919 = $918 << 1;
       $920 = $918 + 7 | 0;
       $921 = $880 >>> $920;
       $922 = $921 & 1;
       $923 = $922 | $919;
       $$0207$i$i = $923;
      }
     }
     $924 = 13484 + ($$0207$i$i << 2) | 0;
     $925 = $581 + 28 | 0;
     HEAP32[$925 >> 2] = $$0207$i$i;
     $926 = $581 + 20 | 0;
     HEAP32[$926 >> 2] = 0;
     HEAP32[$852 >> 2] = 0;
     $927 = HEAP32[13184 >> 2] | 0;
     $928 = 1 << $$0207$i$i;
     $929 = $927 & $928;
     $930 = ($929 | 0) == 0;
     if ($930) {
      $931 = $927 | $928;
      HEAP32[13184 >> 2] = $931;
      HEAP32[$924 >> 2] = $581;
      $932 = $581 + 24 | 0;
      HEAP32[$932 >> 2] = $924;
      $933 = $581 + 12 | 0;
      HEAP32[$933 >> 2] = $581;
      $934 = $581 + 8 | 0;
      HEAP32[$934 >> 2] = $581;
      break;
     }
     $935 = HEAP32[$924 >> 2] | 0;
     $936 = ($$0207$i$i | 0) == 31;
     $937 = $$0207$i$i >>> 1;
     $938 = 25 - $937 | 0;
     $939 = $936 ? 0 : $938;
     $940 = $880 << $939;
     $$0201$i$i = $940;
     $$0202$i$i = $935;
     while (1) {
      $941 = $$0202$i$i + 4 | 0;
      $942 = HEAP32[$941 >> 2] | 0;
      $943 = $942 & -8;
      $944 = ($943 | 0) == ($880 | 0);
      if ($944) {
       label = 216;
       break;
      }
      $945 = $$0201$i$i >>> 31;
      $946 = ($$0202$i$i + 16 | 0) + ($945 << 2) | 0;
      $947 = $$0201$i$i << 1;
      $948 = HEAP32[$946 >> 2] | 0;
      $949 = ($948 | 0) == (0 | 0);
      if ($949) {
       label = 215;
       break;
      } else {
       $$0201$i$i = $947;
       $$0202$i$i = $948;
      }
     }
     if ((label | 0) == 215) {
      HEAP32[$946 >> 2] = $581;
      $950 = $581 + 24 | 0;
      HEAP32[$950 >> 2] = $$0202$i$i;
      $951 = $581 + 12 | 0;
      HEAP32[$951 >> 2] = $581;
      $952 = $581 + 8 | 0;
      HEAP32[$952 >> 2] = $581;
      break;
     } else if ((label | 0) == 216) {
      $953 = $$0202$i$i + 8 | 0;
      $954 = HEAP32[$953 >> 2] | 0;
      $955 = $954 + 12 | 0;
      HEAP32[$955 >> 2] = $581;
      HEAP32[$953 >> 2] = $581;
      $956 = $581 + 8 | 0;
      HEAP32[$956 >> 2] = $954;
      $957 = $581 + 12 | 0;
      HEAP32[$957 >> 2] = $$0202$i$i;
      $958 = $581 + 24 | 0;
      HEAP32[$958 >> 2] = 0;
      break;
     }
    }
   }
  } while (0);
  $960 = HEAP32[13192 >> 2] | 0;
  $961 = $960 >>> 0 > $$0192 >>> 0;
  if ($961) {
   $962 = $960 - $$0192 | 0;
   HEAP32[13192 >> 2] = $962;
   $963 = HEAP32[13204 >> 2] | 0;
   $964 = $963 + $$0192 | 0;
   HEAP32[13204 >> 2] = $964;
   $965 = $962 | 1;
   $966 = $964 + 4 | 0;
   HEAP32[$966 >> 2] = $965;
   $967 = $$0192 | 3;
   $968 = $963 + 4 | 0;
   HEAP32[$968 >> 2] = $967;
   $969 = $963 + 8 | 0;
   $$0 = $969;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $970 = (tempInt = ___errno_location() | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
 HEAP32[$970 >> 2] = 12;
 $$0 = 0;
 STACKTOP = sp;
 return $$0 | 0;
}
function emterpret(pc) {
 pc = pc | 0;
 var sp = 0, inst = 0, lx = 0, ly = 0, lz = 0;
 var ld = 0.0;
 HEAP32[EMTSTACKTOP >> 2] = pc;
 sp = EMTSTACKTOP + 8 | 0;
 assert(HEAPU8[pc >> 0] >>> 0 == 140 | 0);
 lx = HEAPU16[pc + 2 >> 1] | 0;
 EMTSTACKTOP = EMTSTACKTOP + (lx + 1 << 3) | 0;
 assert((EMTSTACKTOP | 0) <= (EMT_STACK_MAX | 0) | 0);
 if ((asyncState | 0) != 2) {} else {
  pc = (HEAP32[sp - 4 >> 2] | 0) - 8 | 0;
 }
 pc = pc + 4 | 0;
 while (1) {
  pc = pc + 4 | 0;
  inst = HEAP32[pc >> 2] | 0;
  lx = inst >> 8 & 255;
  ly = inst >> 16 & 255;
  lz = inst >>> 24;
  switch (inst & 255) {
  case 0:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 1:
   HEAP32[sp + (lx << 3) >> 2] = inst >> 16;
   break;
  case 2:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[pc >> 2] | 0;
   break;
  case 3:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 4:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) - (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 5:
   HEAP32[sp + (lx << 3) >> 2] = Math_imul(HEAP32[sp + (ly << 3) >> 2] | 0, HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 6:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) / (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 7:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) / (HEAP32[sp + (lz << 3) >> 2] >>> 0) >>> 0;
   break;
  case 9:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) % (HEAP32[sp + (lz << 3) >> 2] >>> 0) >>> 0;
   break;
  case 13:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 14:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 15:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 16:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0 | 0;
   break;
  case 19:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 20:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 21:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) ^ (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 22:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) << (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 24:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >>> (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 25:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) | 0;
   break;
  case 26:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) - (inst >> 24) | 0;
   break;
  case 27:
   HEAP32[sp + (lx << 3) >> 2] = Math_imul(HEAP32[sp + (ly << 3) >> 2] | 0, inst >> 24) | 0;
   break;
  case 28:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) / (inst >> 24) | 0;
   break;
  case 29:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) / (lz >>> 0) >>> 0;
   break;
  case 30:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) % (inst >> 24) | 0;
   break;
  case 31:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] >>> 0) % (lz >>> 0) >>> 0;
   break;
  case 32:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == inst >> 24 | 0;
   break;
  case 33:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) != inst >> 24 | 0;
   break;
  case 34:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < inst >> 24 | 0;
   break;
  case 35:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 < lz >>> 0 | 0;
   break;
  case 37:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 <= lz >>> 0 | 0;
   break;
  case 38:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & inst >> 24;
   break;
  case 39:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | inst >> 24;
   break;
  case 40:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) ^ inst >> 24;
   break;
  case 41:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) << lz;
   break;
  case 42:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >> lz;
   break;
  case 43:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >>> lz;
   break;
  case 45:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) == (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 46:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 47:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 48:
   if (HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 49:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) <= (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 53:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) != (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 54:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 55:
   if (HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0) {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   } else {
    pc = pc + 4 | 0;
   }
   break;
  case 58:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 59:
   HEAPF64[sp + (lx << 3) >> 3] = +(inst >> 16);
   break;
  case 60:
   pc = pc + 4 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[pc >> 2] | 0);
   break;
  case 61:
   pc = pc + 4 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF32[pc >> 2];
   break;
  case 62:
   HEAP32[tempDoublePtr >> 2] = HEAP32[pc + 4 >> 2];
   HEAP32[tempDoublePtr + 4 >> 2] = HEAP32[pc + 8 >> 2];
   pc = pc + 8 | 0;
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[tempDoublePtr >> 3];
   break;
  case 63:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] + +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 64:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] - +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 65:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] * +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 66:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (ly << 3) >> 3] / +HEAPF64[sp + (lz << 3) >> 3];
   break;
  case 68:
   HEAPF64[sp + (lx << 3) >> 3] = -+HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 69:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] == +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 70:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] != +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 73:
   HEAP32[sp + (lx << 3) >> 2] = +HEAPF64[sp + (ly << 3) >> 3] > +HEAPF64[sp + (lz << 3) >> 3] | 0;
   break;
  case 75:
   HEAP32[sp + (lx << 3) >> 2] = ~~+HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 76:
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[sp + (ly << 3) >> 2] | 0);
   break;
  case 77:
   HEAPF64[sp + (lx << 3) >> 3] = +(HEAP32[sp + (ly << 3) >> 2] >>> 0);
   break;
  case 78:
   HEAP32[sp + (lx << 3) >> 2] = HEAP8[HEAP32[sp + (ly << 3) >> 2] >> 0];
   break;
  case 80:
   HEAP32[sp + (lx << 3) >> 2] = HEAP16[HEAP32[sp + (ly << 3) >> 2] >> 1];
   break;
  case 82:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[HEAP32[sp + (ly << 3) >> 2] >> 2];
   break;
  case 83:
   HEAP8[HEAP32[sp + (lx << 3) >> 2] >> 0] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 84:
   HEAP16[HEAP32[sp + (lx << 3) >> 2] >> 1] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 85:
   HEAP32[HEAP32[sp + (lx << 3) >> 2] >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 86:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[HEAP32[sp + (ly << 3) >> 2] >> 3];
   break;
  case 87:
   HEAPF64[HEAP32[sp + (lx << 3) >> 2] >> 3] = +HEAPF64[sp + (ly << 3) >> 3];
   break;
  case 90:
   HEAP32[sp + (lx << 3) >> 2] = HEAP8[(HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) >> 0];
   break;
  case 97:
   HEAP32[(HEAP32[sp + (lx << 3) >> 2] | 0) + (HEAP32[sp + (ly << 3) >> 2] | 0) >> 2] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 106:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[(HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) >> 2];
   break;
  case 107:
   HEAP8[(HEAP32[sp + (lx << 3) >> 2] | 0) + (ly << 24 >> 24) >> 0] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 108:
   HEAP16[(HEAP32[sp + (lx << 3) >> 2] | 0) + (ly << 24 >> 24) >> 1] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 109:
   HEAP32[(HEAP32[sp + (lx << 3) >> 2] | 0) + (ly << 24 >> 24) >> 2] = HEAP32[sp + (lz << 3) >> 2] | 0;
   break;
  case 119:
   pc = pc + (inst >> 16 << 2) | 0;
   pc = pc - 4 | 0;
   continue;
   break;
  case 120:
   if (HEAP32[sp + (lx << 3) >> 2] | 0) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 121:
   if (!(HEAP32[sp + (lx << 3) >> 2] | 0)) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 125:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 ? HEAP32[sp + (lz << 3) >> 2] | 0 : HEAP32[sp + ((HEAPU8[pc >> 0] | 0) << 3) >> 2] | 0;
   break;
  case 127:
   HEAP32[sp + (lx << 3) >> 2] = tempDoublePtr;
   break;
  case 128:
   HEAP32[sp + (lx << 3) >> 2] = tempRet0;
   break;
  case 129:
   tempRet0 = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 130:
   switch (ly | 0) {
   case 0:
    {
     HEAP32[sp + (lx << 3) >> 2] = STACK_MAX;
     continue;
    }
   case 1:
    {
     HEAP32[sp + (lx << 3) >> 2] = __THREW__;
     continue;
    }
   case 2:
    {
     HEAP32[sp + (lx << 3) >> 2] = DYNAMICTOP_PTR;
     continue;
    }
   case 3:
    {
     HEAP32[sp + (lx << 3) >> 2] = cttz_i8;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 132:
   switch (inst >> 8 & 255) {
   case 0:
    {
     STACK_MAX = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 1:
    {
     __THREW__ = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 2:
    {
     DYNAMICTOP_PTR = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 3:
    {
     cttz_i8 = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 134:
   lz = HEAPU8[(HEAP32[pc + 4 >> 2] | 0) + 1 | 0] | 0;
   ly = 0;
   assert((EMTSTACKTOP + 8 | 0) <= (EMT_STACK_MAX | 0) | 0);
   if ((asyncState | 0) != 2) {
    while ((ly | 0) < (lz | 0)) {
     HEAP32[EMTSTACKTOP + (ly << 3) + 8 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) >> 2] | 0;
     HEAP32[EMTSTACKTOP + (ly << 3) + 12 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) + 4 >> 2] | 0;
     ly = ly + 1 | 0;
    }
   }
   HEAP32[sp - 4 >> 2] = pc;
   emterpret(HEAP32[pc + 4 >> 2] | 0);
   if ((asyncState | 0) == 1) {
    EMTSTACKTOP = sp - 8 | 0;
    return;
   }
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[EMTSTACKTOP >> 2] | 0;
   HEAP32[sp + (lx << 3) + 4 >> 2] = HEAP32[EMTSTACKTOP + 4 >> 2] | 0;
   pc = pc + (4 + lz + 3 >> 2 << 2) | 0;
   break;
  case 135:
   switch (inst >>> 16 | 0) {
   case 0:
    {
     HEAP32[sp - 4 >> 2] = pc;
     abortStackOverflow(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 1:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _bitshift64Shl(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 2:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _memset(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 3:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = Math_clz32(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 4:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _malloc(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 5:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall221(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 6:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall54(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 7:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall146(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 8:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_ii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 9:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_viiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 8 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 8 | 0;
     continue;
    }
   case 10:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_viiiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 8 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 9 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 8 | 0;
     continue;
    }
   case 11:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_viiiiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 8 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 9 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 10 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 8 | 0;
     continue;
    }
   case 12:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _strlen(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 13:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_iiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 14:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _memcpy(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 15:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall145(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 16:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall330(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 17:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall63(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 18:
    {
     HEAP32[sp - 4 >> 2] = pc;
     invoke_viii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 19:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___cxa_find_matching_catch_2() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 20:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___resumeException(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 21:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall5(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 22:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall6(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 23:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = invoke_iii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 24:
    {
     HEAP32[sp - 4 >> 2] = pc;
     invoke_vi(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 25:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = invoke_i(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 26:
    {
     HEAP32[sp - 4 >> 2] = pc;
     invoke_vii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 27:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___cxa_find_matching_catch_3(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 28:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_iiiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 8 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 8 | 0;
     continue;
    }
   case 29:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_iiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 30:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _free(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 31:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_vi[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 32:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_iii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 33:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = invoke_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 34:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_viii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 35:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_vii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 36:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _bitshift64Lshr(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 37:
    {
     HEAP32[sp - 4 >> 2] = pc;
     invoke_v(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 38:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___cxa_begin_catch(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 39:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall140(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 40:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_i[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127]() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 41:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = abortOnCannotGrowMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 42:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___setErrNo(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 43:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = getTotalMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 44:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = enlargeMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 45:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 46:
    {
     HEAP32[sp - 4 >> 2] = pc;
     FUNCTION_TABLE_v[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 127]();
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 47:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___cxa_allocate_exception(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 48:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___cxa_throw(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 49:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_i(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 50:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _pthread_once(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 51:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _pthread_getspecific(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 52:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _clock_gettime(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 53:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _pthread_setspecific(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 54:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _pthread_key_create(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 55:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_iii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 56:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _abort();
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     continue;
    }
   case 57:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _emscripten_sleep_with_yield(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 58:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_viiiiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 59:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_viiiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 60:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___lock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 61:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___unlock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 62:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_viiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 63:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_iiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 64:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_viii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 65:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_iii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 66:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_vii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 67:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___cxa_pure_virtual();
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     continue;
    }
   case 68:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 69:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___cxa_end_catch();
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     continue;
    }
   case 70:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_vi(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 71:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_i(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 72:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_v(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 136:
   HEAP32[sp + (lx << 3) >> 2] = STACKTOP;
   break;
  case 137:
   STACKTOP = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 138:
   lz = HEAP32[sp + (lz << 3) >> 2] | 0;
   lx = (HEAP32[sp + (lx << 3) >> 2] | 0) - (HEAP32[sp + (ly << 3) >> 2] | 0) >>> 0;
   if (lx >>> 0 >= lz >>> 0) {
    pc = pc + (lz << 2) | 0;
    continue;
   }
   pc = HEAP32[pc + 4 + (lx << 2) >> 2] | 0;
   pc = pc - 4 | 0;
   continue;
   break;
  case 139:
   EMTSTACKTOP = sp - 8 | 0;
   HEAP32[EMTSTACKTOP >> 2] = HEAP32[sp + (lx << 3) >> 2] | 0;
   HEAP32[EMTSTACKTOP + 4 >> 2] = HEAP32[sp + (lx << 3) + 4 >> 2] | 0;
   return;
   break;
  case 141:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (inst >>> 16 << 3) >> 2] | 0;
   break;
  case 142:
   HEAPF64[sp + (lx << 3) >> 3] = +HEAPF64[sp + (inst >>> 16 << 3) >> 3];
   break;
  case 143:
   HEAP32[sp + (inst >>> 16 << 3) >> 2] = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 144:
   HEAPF64[sp + (inst >>> 16 << 3) >> 3] = +HEAPF64[sp + (lx << 3) >> 3];
   break;
  default:
   assert(0);
  }
 }
 assert(0);
}

function _free($0) {
 $0 = $0 | 0;
 var $$0195$i = 0, $$0195$in$i = 0, $$0348 = 0, $$0349 = 0, $$0361 = 0, $$0368 = 0, $$1 = 0, $$1347 = 0, $$1352 = 0, $$1355 = 0, $$1363 = 0, $$1367 = 0, $$2 = 0, $$3 = 0, $$3365 = 0, $$pre = 0, $$pre$phiZ2D = 0, $$sink3 = 0, $$sink5 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond374 = 0, $cond375 = 0, $not$ = 0, $not$370 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $1 = ($0 | 0) == (0 | 0);
 asyncState ? abort(-12) | 0 : 0;
 if ($1) {
  return;
 }
 $2 = $0 + -8 | 0;
 $3 = HEAP32[13196 >> 2] | 0;
 $4 = $0 + -4 | 0;
 $5 = HEAP32[$4 >> 2] | 0;
 $6 = $5 & -8;
 $7 = $2 + $6 | 0;
 $8 = $5 & 1;
 $9 = ($8 | 0) == 0;
 do {
  if ($9) {
   $10 = HEAP32[$2 >> 2] | 0;
   $11 = $5 & 3;
   $12 = ($11 | 0) == 0;
   if ($12) {
    return;
   }
   $13 = 0 - $10 | 0;
   $14 = $2 + $13 | 0;
   $15 = $10 + $6 | 0;
   $16 = $14 >>> 0 < $3 >>> 0;
   if ($16) {
    return;
   }
   $17 = HEAP32[13200 >> 2] | 0;
   $18 = ($14 | 0) == ($17 | 0);
   if ($18) {
    $78 = $7 + 4 | 0;
    $79 = HEAP32[$78 >> 2] | 0;
    $80 = $79 & 3;
    $81 = ($80 | 0) == 3;
    if (!$81) {
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    }
    $82 = $14 + $15 | 0;
    $83 = $14 + 4 | 0;
    $84 = $15 | 1;
    $85 = $79 & -2;
    HEAP32[13188 >> 2] = $15;
    HEAP32[$78 >> 2] = $85;
    HEAP32[$83 >> 2] = $84;
    HEAP32[$82 >> 2] = $15;
    return;
   }
   $19 = $10 >>> 3;
   $20 = $10 >>> 0 < 256;
   if ($20) {
    $21 = $14 + 8 | 0;
    $22 = HEAP32[$21 >> 2] | 0;
    $23 = $14 + 12 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    $25 = ($24 | 0) == ($22 | 0);
    if ($25) {
     $26 = 1 << $19;
     $27 = $26 ^ -1;
     $28 = HEAP32[3295] | 0;
     $29 = $28 & $27;
     HEAP32[3295] = $29;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    } else {
     $30 = $22 + 12 | 0;
     HEAP32[$30 >> 2] = $24;
     $31 = $24 + 8 | 0;
     HEAP32[$31 >> 2] = $22;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
     break;
    }
   }
   $32 = $14 + 24 | 0;
   $33 = HEAP32[$32 >> 2] | 0;
   $34 = $14 + 12 | 0;
   $35 = HEAP32[$34 >> 2] | 0;
   $36 = ($35 | 0) == ($14 | 0);
   do {
    if ($36) {
     $41 = $14 + 16 | 0;
     $42 = $41 + 4 | 0;
     $43 = HEAP32[$42 >> 2] | 0;
     $44 = ($43 | 0) == (0 | 0);
     if ($44) {
      $45 = HEAP32[$41 >> 2] | 0;
      $46 = ($45 | 0) == (0 | 0);
      if ($46) {
       $$3 = 0;
       break;
      } else {
       $$1352 = $45;
       $$1355 = $41;
      }
     } else {
      $$1352 = $43;
      $$1355 = $42;
     }
     while (1) {
      $47 = $$1352 + 20 | 0;
      $48 = HEAP32[$47 >> 2] | 0;
      $49 = ($48 | 0) == (0 | 0);
      if (!$49) {
       $$1352 = $48;
       $$1355 = $47;
       continue;
      }
      $50 = $$1352 + 16 | 0;
      $51 = HEAP32[$50 >> 2] | 0;
      $52 = ($51 | 0) == (0 | 0);
      if ($52) {
       break;
      } else {
       $$1352 = $51;
       $$1355 = $50;
      }
     }
     HEAP32[$$1355 >> 2] = 0;
     $$3 = $$1352;
    } else {
     $37 = $14 + 8 | 0;
     $38 = HEAP32[$37 >> 2] | 0;
     $39 = $38 + 12 | 0;
     HEAP32[$39 >> 2] = $35;
     $40 = $35 + 8 | 0;
     HEAP32[$40 >> 2] = $38;
     $$3 = $35;
    }
   } while (0);
   $53 = ($33 | 0) == (0 | 0);
   if ($53) {
    $$1 = $14;
    $$1347 = $15;
    $87 = $14;
   } else {
    $54 = $14 + 28 | 0;
    $55 = HEAP32[$54 >> 2] | 0;
    $56 = 13484 + ($55 << 2) | 0;
    $57 = HEAP32[$56 >> 2] | 0;
    $58 = ($14 | 0) == ($57 | 0);
    if ($58) {
     HEAP32[$56 >> 2] = $$3;
     $cond374 = ($$3 | 0) == (0 | 0);
     if ($cond374) {
      $59 = 1 << $55;
      $60 = $59 ^ -1;
      $61 = HEAP32[13184 >> 2] | 0;
      $62 = $61 & $60;
      HEAP32[13184 >> 2] = $62;
      $$1 = $14;
      $$1347 = $15;
      $87 = $14;
      break;
     }
    } else {
     $63 = $33 + 16 | 0;
     $64 = HEAP32[$63 >> 2] | 0;
     $not$370 = ($64 | 0) != ($14 | 0);
     $$sink3 = $not$370 & 1;
     $65 = ($33 + 16 | 0) + ($$sink3 << 2) | 0;
     HEAP32[$65 >> 2] = $$3;
     $66 = ($$3 | 0) == (0 | 0);
     if ($66) {
      $$1 = $14;
      $$1347 = $15;
      $87 = $14;
      break;
     }
    }
    $67 = $$3 + 24 | 0;
    HEAP32[$67 >> 2] = $33;
    $68 = $14 + 16 | 0;
    $69 = HEAP32[$68 >> 2] | 0;
    $70 = ($69 | 0) == (0 | 0);
    if (!$70) {
     $71 = $$3 + 16 | 0;
     HEAP32[$71 >> 2] = $69;
     $72 = $69 + 24 | 0;
     HEAP32[$72 >> 2] = $$3;
    }
    $73 = $68 + 4 | 0;
    $74 = HEAP32[$73 >> 2] | 0;
    $75 = ($74 | 0) == (0 | 0);
    if ($75) {
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
    } else {
     $76 = $$3 + 20 | 0;
     HEAP32[$76 >> 2] = $74;
     $77 = $74 + 24 | 0;
     HEAP32[$77 >> 2] = $$3;
     $$1 = $14;
     $$1347 = $15;
     $87 = $14;
    }
   }
  } else {
   $$1 = $2;
   $$1347 = $6;
   $87 = $2;
  }
 } while (0);
 $86 = $87 >>> 0 < $7 >>> 0;
 if (!$86) {
  return;
 }
 $88 = $7 + 4 | 0;
 $89 = HEAP32[$88 >> 2] | 0;
 $90 = $89 & 1;
 $91 = ($90 | 0) == 0;
 if ($91) {
  return;
 }
 $92 = $89 & 2;
 $93 = ($92 | 0) == 0;
 if ($93) {
  $94 = HEAP32[13204 >> 2] | 0;
  $95 = ($7 | 0) == ($94 | 0);
  $96 = HEAP32[13200 >> 2] | 0;
  if ($95) {
   $97 = HEAP32[13192 >> 2] | 0;
   $98 = $97 + $$1347 | 0;
   HEAP32[13192 >> 2] = $98;
   HEAP32[13204 >> 2] = $$1;
   $99 = $98 | 1;
   $100 = $$1 + 4 | 0;
   HEAP32[$100 >> 2] = $99;
   $101 = ($$1 | 0) == ($96 | 0);
   if (!$101) {
    return;
   }
   HEAP32[13200 >> 2] = 0;
   HEAP32[13188 >> 2] = 0;
   return;
  }
  $102 = ($7 | 0) == ($96 | 0);
  if ($102) {
   $103 = HEAP32[13188 >> 2] | 0;
   $104 = $103 + $$1347 | 0;
   HEAP32[13188 >> 2] = $104;
   HEAP32[13200 >> 2] = $87;
   $105 = $104 | 1;
   $106 = $$1 + 4 | 0;
   HEAP32[$106 >> 2] = $105;
   $107 = $87 + $104 | 0;
   HEAP32[$107 >> 2] = $104;
   return;
  }
  $108 = $89 & -8;
  $109 = $108 + $$1347 | 0;
  $110 = $89 >>> 3;
  $111 = $89 >>> 0 < 256;
  do {
   if ($111) {
    $112 = $7 + 8 | 0;
    $113 = HEAP32[$112 >> 2] | 0;
    $114 = $7 + 12 | 0;
    $115 = HEAP32[$114 >> 2] | 0;
    $116 = ($115 | 0) == ($113 | 0);
    if ($116) {
     $117 = 1 << $110;
     $118 = $117 ^ -1;
     $119 = HEAP32[3295] | 0;
     $120 = $119 & $118;
     HEAP32[3295] = $120;
     break;
    } else {
     $121 = $113 + 12 | 0;
     HEAP32[$121 >> 2] = $115;
     $122 = $115 + 8 | 0;
     HEAP32[$122 >> 2] = $113;
     break;
    }
   } else {
    $123 = $7 + 24 | 0;
    $124 = HEAP32[$123 >> 2] | 0;
    $125 = $7 + 12 | 0;
    $126 = HEAP32[$125 >> 2] | 0;
    $127 = ($126 | 0) == ($7 | 0);
    do {
     if ($127) {
      $132 = $7 + 16 | 0;
      $133 = $132 + 4 | 0;
      $134 = HEAP32[$133 >> 2] | 0;
      $135 = ($134 | 0) == (0 | 0);
      if ($135) {
       $136 = HEAP32[$132 >> 2] | 0;
       $137 = ($136 | 0) == (0 | 0);
       if ($137) {
        $$3365 = 0;
        break;
       } else {
        $$1363 = $136;
        $$1367 = $132;
       }
      } else {
       $$1363 = $134;
       $$1367 = $133;
      }
      while (1) {
       $138 = $$1363 + 20 | 0;
       $139 = HEAP32[$138 >> 2] | 0;
       $140 = ($139 | 0) == (0 | 0);
       if (!$140) {
        $$1363 = $139;
        $$1367 = $138;
        continue;
       }
       $141 = $$1363 + 16 | 0;
       $142 = HEAP32[$141 >> 2] | 0;
       $143 = ($142 | 0) == (0 | 0);
       if ($143) {
        break;
       } else {
        $$1363 = $142;
        $$1367 = $141;
       }
      }
      HEAP32[$$1367 >> 2] = 0;
      $$3365 = $$1363;
     } else {
      $128 = $7 + 8 | 0;
      $129 = HEAP32[$128 >> 2] | 0;
      $130 = $129 + 12 | 0;
      HEAP32[$130 >> 2] = $126;
      $131 = $126 + 8 | 0;
      HEAP32[$131 >> 2] = $129;
      $$3365 = $126;
     }
    } while (0);
    $144 = ($124 | 0) == (0 | 0);
    if (!$144) {
     $145 = $7 + 28 | 0;
     $146 = HEAP32[$145 >> 2] | 0;
     $147 = 13484 + ($146 << 2) | 0;
     $148 = HEAP32[$147 >> 2] | 0;
     $149 = ($7 | 0) == ($148 | 0);
     if ($149) {
      HEAP32[$147 >> 2] = $$3365;
      $cond375 = ($$3365 | 0) == (0 | 0);
      if ($cond375) {
       $150 = 1 << $146;
       $151 = $150 ^ -1;
       $152 = HEAP32[13184 >> 2] | 0;
       $153 = $152 & $151;
       HEAP32[13184 >> 2] = $153;
       break;
      }
     } else {
      $154 = $124 + 16 | 0;
      $155 = HEAP32[$154 >> 2] | 0;
      $not$ = ($155 | 0) != ($7 | 0);
      $$sink5 = $not$ & 1;
      $156 = ($124 + 16 | 0) + ($$sink5 << 2) | 0;
      HEAP32[$156 >> 2] = $$3365;
      $157 = ($$3365 | 0) == (0 | 0);
      if ($157) {
       break;
      }
     }
     $158 = $$3365 + 24 | 0;
     HEAP32[$158 >> 2] = $124;
     $159 = $7 + 16 | 0;
     $160 = HEAP32[$159 >> 2] | 0;
     $161 = ($160 | 0) == (0 | 0);
     if (!$161) {
      $162 = $$3365 + 16 | 0;
      HEAP32[$162 >> 2] = $160;
      $163 = $160 + 24 | 0;
      HEAP32[$163 >> 2] = $$3365;
     }
     $164 = $159 + 4 | 0;
     $165 = HEAP32[$164 >> 2] | 0;
     $166 = ($165 | 0) == (0 | 0);
     if (!$166) {
      $167 = $$3365 + 20 | 0;
      HEAP32[$167 >> 2] = $165;
      $168 = $165 + 24 | 0;
      HEAP32[$168 >> 2] = $$3365;
     }
    }
   }
  } while (0);
  $169 = $109 | 1;
  $170 = $$1 + 4 | 0;
  HEAP32[$170 >> 2] = $169;
  $171 = $87 + $109 | 0;
  HEAP32[$171 >> 2] = $109;
  $172 = HEAP32[13200 >> 2] | 0;
  $173 = ($$1 | 0) == ($172 | 0);
  if ($173) {
   HEAP32[13188 >> 2] = $109;
   return;
  } else {
   $$2 = $109;
  }
 } else {
  $174 = $89 & -2;
  HEAP32[$88 >> 2] = $174;
  $175 = $$1347 | 1;
  $176 = $$1 + 4 | 0;
  HEAP32[$176 >> 2] = $175;
  $177 = $87 + $$1347 | 0;
  HEAP32[$177 >> 2] = $$1347;
  $$2 = $$1347;
 }
 $178 = $$2 >>> 3;
 $179 = $$2 >>> 0 < 256;
 if ($179) {
  $180 = $178 << 1;
  $181 = 13220 + ($180 << 2) | 0;
  $182 = HEAP32[3295] | 0;
  $183 = 1 << $178;
  $184 = $182 & $183;
  $185 = ($184 | 0) == 0;
  if ($185) {
   $186 = $182 | $183;
   HEAP32[3295] = $186;
   $$pre = $181 + 8 | 0;
   $$0368 = $181;
   $$pre$phiZ2D = $$pre;
  } else {
   $187 = $181 + 8 | 0;
   $188 = HEAP32[$187 >> 2] | 0;
   $$0368 = $188;
   $$pre$phiZ2D = $187;
  }
  HEAP32[$$pre$phiZ2D >> 2] = $$1;
  $189 = $$0368 + 12 | 0;
  HEAP32[$189 >> 2] = $$1;
  $190 = $$1 + 8 | 0;
  HEAP32[$190 >> 2] = $$0368;
  $191 = $$1 + 12 | 0;
  HEAP32[$191 >> 2] = $181;
  return;
 }
 $192 = $$2 >>> 8;
 $193 = ($192 | 0) == 0;
 if ($193) {
  $$0361 = 0;
 } else {
  $194 = $$2 >>> 0 > 16777215;
  if ($194) {
   $$0361 = 31;
  } else {
   $195 = $192 + 1048320 | 0;
   $196 = $195 >>> 16;
   $197 = $196 & 8;
   $198 = $192 << $197;
   $199 = $198 + 520192 | 0;
   $200 = $199 >>> 16;
   $201 = $200 & 4;
   $202 = $201 | $197;
   $203 = $198 << $201;
   $204 = $203 + 245760 | 0;
   $205 = $204 >>> 16;
   $206 = $205 & 2;
   $207 = $202 | $206;
   $208 = 14 - $207 | 0;
   $209 = $203 << $206;
   $210 = $209 >>> 15;
   $211 = $208 + $210 | 0;
   $212 = $211 << 1;
   $213 = $211 + 7 | 0;
   $214 = $$2 >>> $213;
   $215 = $214 & 1;
   $216 = $215 | $212;
   $$0361 = $216;
  }
 }
 $217 = 13484 + ($$0361 << 2) | 0;
 $218 = $$1 + 28 | 0;
 HEAP32[$218 >> 2] = $$0361;
 $219 = $$1 + 16 | 0;
 $220 = $$1 + 20 | 0;
 HEAP32[$220 >> 2] = 0;
 HEAP32[$219 >> 2] = 0;
 $221 = HEAP32[13184 >> 2] | 0;
 $222 = 1 << $$0361;
 $223 = $221 & $222;
 $224 = ($223 | 0) == 0;
 do {
  if ($224) {
   $225 = $221 | $222;
   HEAP32[13184 >> 2] = $225;
   HEAP32[$217 >> 2] = $$1;
   $226 = $$1 + 24 | 0;
   HEAP32[$226 >> 2] = $217;
   $227 = $$1 + 12 | 0;
   HEAP32[$227 >> 2] = $$1;
   $228 = $$1 + 8 | 0;
   HEAP32[$228 >> 2] = $$1;
  } else {
   $229 = HEAP32[$217 >> 2] | 0;
   $230 = ($$0361 | 0) == 31;
   $231 = $$0361 >>> 1;
   $232 = 25 - $231 | 0;
   $233 = $230 ? 0 : $232;
   $234 = $$2 << $233;
   $$0348 = $234;
   $$0349 = $229;
   while (1) {
    $235 = $$0349 + 4 | 0;
    $236 = HEAP32[$235 >> 2] | 0;
    $237 = $236 & -8;
    $238 = ($237 | 0) == ($$2 | 0);
    if ($238) {
     label = 73;
     break;
    }
    $239 = $$0348 >>> 31;
    $240 = ($$0349 + 16 | 0) + ($239 << 2) | 0;
    $241 = $$0348 << 1;
    $242 = HEAP32[$240 >> 2] | 0;
    $243 = ($242 | 0) == (0 | 0);
    if ($243) {
     label = 72;
     break;
    } else {
     $$0348 = $241;
     $$0349 = $242;
    }
   }
   if ((label | 0) == 72) {
    HEAP32[$240 >> 2] = $$1;
    $244 = $$1 + 24 | 0;
    HEAP32[$244 >> 2] = $$0349;
    $245 = $$1 + 12 | 0;
    HEAP32[$245 >> 2] = $$1;
    $246 = $$1 + 8 | 0;
    HEAP32[$246 >> 2] = $$1;
    break;
   } else if ((label | 0) == 73) {
    $247 = $$0349 + 8 | 0;
    $248 = HEAP32[$247 >> 2] | 0;
    $249 = $248 + 12 | 0;
    HEAP32[$249 >> 2] = $$1;
    HEAP32[$247 >> 2] = $$1;
    $250 = $$1 + 8 | 0;
    HEAP32[$250 >> 2] = $248;
    $251 = $$1 + 12 | 0;
    HEAP32[$251 >> 2] = $$0349;
    $252 = $$1 + 24 | 0;
    HEAP32[$252 >> 2] = 0;
    break;
   }
  }
 } while (0);
 $253 = HEAP32[13212 >> 2] | 0;
 $254 = $253 + -1 | 0;
 HEAP32[13212 >> 2] = $254;
 $255 = ($254 | 0) == 0;
 if ($255) {
  $$0195$in$i = 13636;
 } else {
  return;
 }
 while (1) {
  $$0195$i = HEAP32[$$0195$in$i >> 2] | 0;
  $256 = ($$0195$i | 0) == (0 | 0);
  $257 = $$0195$i + 8 | 0;
  if ($256) {
   break;
  } else {
   $$0195$in$i = $257;
  }
 }
 HEAP32[13212 >> 2] = -1;
 return;
}

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0, aligned_dest_end = 0, block_aligned_dest_end = 0, dest_end = 0;
 if ((num | 0) >= 8192) {
  return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 }
 ret = dest | 0;
 dest_end = dest + num | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  aligned_dest_end = dest_end & -4 | 0;
  block_aligned_dest_end = aligned_dest_end - 64 | 0;
  while ((dest | 0) <= (block_aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   HEAP32[dest + 4 >> 2] = HEAP32[src + 4 >> 2] | 0;
   HEAP32[dest + 8 >> 2] = HEAP32[src + 8 >> 2] | 0;
   HEAP32[dest + 12 >> 2] = HEAP32[src + 12 >> 2] | 0;
   HEAP32[dest + 16 >> 2] = HEAP32[src + 16 >> 2] | 0;
   HEAP32[dest + 20 >> 2] = HEAP32[src + 20 >> 2] | 0;
   HEAP32[dest + 24 >> 2] = HEAP32[src + 24 >> 2] | 0;
   HEAP32[dest + 28 >> 2] = HEAP32[src + 28 >> 2] | 0;
   HEAP32[dest + 32 >> 2] = HEAP32[src + 32 >> 2] | 0;
   HEAP32[dest + 36 >> 2] = HEAP32[src + 36 >> 2] | 0;
   HEAP32[dest + 40 >> 2] = HEAP32[src + 40 >> 2] | 0;
   HEAP32[dest + 44 >> 2] = HEAP32[src + 44 >> 2] | 0;
   HEAP32[dest + 48 >> 2] = HEAP32[src + 48 >> 2] | 0;
   HEAP32[dest + 52 >> 2] = HEAP32[src + 52 >> 2] | 0;
   HEAP32[dest + 56 >> 2] = HEAP32[src + 56 >> 2] | 0;
   HEAP32[dest + 60 >> 2] = HEAP32[src + 60 >> 2] | 0;
   dest = dest + 64 | 0;
   src = src + 64 | 0;
  }
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 } else {
  aligned_dest_end = dest_end - 4 | 0;
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   HEAP8[dest + 1 >> 0] = HEAP8[src + 1 >> 0] | 0;
   HEAP8[dest + 2 >> 0] = HEAP8[src + 2 >> 0] | 0;
   HEAP8[dest + 3 >> 0] = HEAP8[src + 3 >> 0] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 }
 while ((dest | 0) < (dest_end | 0)) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 }
 return ret | 0;
}

function _strlen($0) {
 $0 = $0 | 0;
 var $$0 = 0, $$015$lcssa = 0, $$01519 = 0, $$1$lcssa = 0, $$pn = 0, $$pre = 0, $$sink = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $1 = $0;
 $2 = $1 & 3;
 $3 = ($2 | 0) == 0;
 L1 : do {
  if ($3) {
   $$015$lcssa = $0;
   label = 4;
  } else {
   $$01519 = $0;
   $23 = $1;
   while (1) {
    $4 = HEAP8[$$01519 >> 0] | 0;
    $5 = $4 << 24 >> 24 == 0;
    if ($5) {
     $$sink = $23;
     break L1;
    }
    $6 = $$01519 + 1 | 0;
    $7 = $6;
    $8 = $7 & 3;
    $9 = ($8 | 0) == 0;
    if ($9) {
     $$015$lcssa = $6;
     label = 4;
     break;
    } else {
     $$01519 = $6;
     $23 = $7;
    }
   }
  }
 } while (0);
 if ((label | 0) == 4) {
  $$0 = $$015$lcssa;
  while (1) {
   $10 = HEAP32[$$0 >> 2] | 0;
   $11 = $10 + -16843009 | 0;
   $12 = $10 & -2139062144;
   $13 = $12 ^ -2139062144;
   $14 = $13 & $11;
   $15 = ($14 | 0) == 0;
   $16 = $$0 + 4 | 0;
   if ($15) {
    $$0 = $16;
   } else {
    break;
   }
  }
  $17 = $10 & 255;
  $18 = $17 << 24 >> 24 == 0;
  if ($18) {
   $$1$lcssa = $$0;
  } else {
   $$pn = $$0;
   while (1) {
    $19 = $$pn + 1 | 0;
    $$pre = HEAP8[$19 >> 0] | 0;
    $20 = $$pre << 24 >> 24 == 0;
    if ($20) {
     $$1$lcssa = $19;
     break;
    } else {
     $$pn = $19;
    }
   }
  }
  $21 = $$1$lcssa;
  $$sink = $21;
 }
 $22 = $$sink - $1 | 0;
 return $22 | 0;
}

function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
 end = ptr + num | 0;
 value = value & 255;
 if ((num | 0) >= 67) {
  while ((ptr & 3) != 0) {
   HEAP8[ptr >> 0] = value;
   ptr = ptr + 1 | 0;
  }
  aligned_end = end & -4 | 0;
  block_aligned_end = aligned_end - 64 | 0;
  value4 = value | value << 8 | value << 16 | value << 24;
  while ((ptr | 0) <= (block_aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   HEAP32[ptr + 4 >> 2] = value4;
   HEAP32[ptr + 8 >> 2] = value4;
   HEAP32[ptr + 12 >> 2] = value4;
   HEAP32[ptr + 16 >> 2] = value4;
   HEAP32[ptr + 20 >> 2] = value4;
   HEAP32[ptr + 24 >> 2] = value4;
   HEAP32[ptr + 28 >> 2] = value4;
   HEAP32[ptr + 32 >> 2] = value4;
   HEAP32[ptr + 36 >> 2] = value4;
   HEAP32[ptr + 40 >> 2] = value4;
   HEAP32[ptr + 44 >> 2] = value4;
   HEAP32[ptr + 48 >> 2] = value4;
   HEAP32[ptr + 52 >> 2] = value4;
   HEAP32[ptr + 56 >> 2] = value4;
   HEAP32[ptr + 60 >> 2] = value4;
   ptr = ptr + 64 | 0;
  }
  while ((ptr | 0) < (aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (end | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return end - num | 0;
}

function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 21700 | 0);
}

function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 44324 | 0);
}

function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47268 | 0);
}

function __ZN15GraphicsDisplay7blitbitEiiiiPKc($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 30280 | 0);
}

function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 14548 | 0);
}

function __ZN15GraphicsDisplay4blitEiiiiPKi($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 43744 | 0);
}

function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 19092 | 0);
}

function __ZN15GraphicsDisplay4fillEiiiii($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = $5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 44596 | 0);
}

function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 25644 | 0);
}

function b8(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = p3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = p4;
  HEAP32[EMTSTACKTOP + 48 >> 2] = p5;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54100 | 0);
}

function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 28728 | 0);
}

function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45368 | 0);
}

function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47700 | 0);
}

function __ZN15GraphicsDisplay6windowEiiii($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = $4;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45200 | 0);
}

function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $a$0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $a$1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $b$0;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $b$1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50012 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $a$0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $a$1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $b$0;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $b$1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52992 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function runPostSets() {}
function _i64Subtract(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = a;
  HEAP32[EMTSTACKTOP + 16 >> 2] = b;
  HEAP32[EMTSTACKTOP + 24 >> 2] = c;
  HEAP32[EMTSTACKTOP + 32 >> 2] = d;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52576 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b1(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = p3;
  HEAP32[EMTSTACKTOP + 40 >> 2] = p4;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54600 | 0);
}

function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 27816 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN15GraphicsDisplay9characterEiii($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48968 | 0);
}

function _i64Add(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = a;
  HEAP32[EMTSTACKTOP + 16 >> 2] = b;
  HEAP32[EMTSTACKTOP + 24 >> 2] = c;
  HEAP32[EMTSTACKTOP + 32 >> 2] = d;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53068 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN6C128329characterEiii($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 17936 | 0);
}

function __ZN6C128325pixelEiii($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = $3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 44164 | 0);
}

function __ZN4mbed10FileHandle5lseekEii($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51316 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream5writeEPKvj($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 40704 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream4readEPvj($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 38984 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream4seekEii($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53856 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b10(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  HEAP32[EMTSTACKTOP + 32 >> 2] = p3;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55204 | 0);
}

function ___cxa_can_catch($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46712 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdout_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 40880 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 16832 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high << bits | (low & ander << 32 - bits) >>> 32 - bits;
  return low << bits;
 }
 tempRet0 = low << bits - 32;
 return 0;
}

function ___stdio_seek($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 40520 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_read($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 23284 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _sn_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47620 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  tempRet0 = high >>> bits;
  return low >>> bits | (high & ander) << 32 - bits;
 }
 tempRet0 = 0;
 return high >>> bits - 32 | 0;
}

function b0(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55444 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN11TextDisplay6locateEii($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51548 | 0);
}

function _mbed_assert_internal($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46592 | 0);
}

function __ZN6C128326locateEii($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52536 | 0);
}

function __ZN4mbed6fdopenEPNS_10FileHandleEPKc($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52752 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle12set_blockingEb($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53988 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN11TextDisplay5claimEP8_IO_FILE($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45624 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function establishStackSpace(stackBase, stackMax) {
 stackBase = stackBase | 0;
 stackMax = stackMax | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = stackBase;
  HEAP32[EMTSTACKTOP + 16 >> 2] = stackMax;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53884 | 0);
}

function __ZNK4mbed10FileHandle4pollEs($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54172 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN11TextDisplay5_putcEi($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 25868 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b6(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55524 | 0);
}

function __ZN6C128325_putcEi($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 26560 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle5sigioENS_8CallbackIFvvEEE($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53832 | 0);
}

function b9(p0, p1) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55548 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _abort_message($0, $varargs) {
 $0 = $0 | 0;
 $varargs = $varargs | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $varargs;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50552 | 0);
}

function __ZN11TextDisplay10foregroundEt($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53196 | 0);
}

function __ZN11TextDisplay10backgroundEt($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53228 | 0);
}

function _error($0, $varargs) {
 $0 = $0 | 0;
 $varargs = $varargs | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $varargs;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48820 | 0);
}

function __ZN15GraphicsDisplay4putpEi($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 39408 | 0);
}

function _handle_interrupt_in($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54708 | 0);
}

function dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 a6 = a6 | 0;
 FUNCTION_TABLE_viiiiii[index & 127](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0, a6 | 0);
}

function _sbrk(increment) {
 increment = increment | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = increment;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45476 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN15GraphicsDisplay7columnsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51424 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle6isattyEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54652 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle5fsyncEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52092 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle4tellEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52036 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle4syncEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54680 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle4sizeEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45988 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed10FileHandle4flenEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52140 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN15GraphicsDisplay4rowsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51484 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream6isattyEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54760 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN11TextDisplay5_getcEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54732 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZNKSt9bad_alloc4whatEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54624 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream5closeEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54828 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream4tellEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54904 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream4syncEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54932 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed6Stream4sizeEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54960 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___cxa_is_pointer_type($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51068 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN6C128327columnsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48316 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b4(p0, p1) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55576 | 0);
}

function __ZN6C128326heightEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51884 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 15 & -16;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(size | 0);
 return ret | 0;
}

function __ZN6C128325widthEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51960 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN6C128324rowsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48620 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_close($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47768 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _llvm_bswap_i32(x) {
 x = x | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = x;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54528 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed26mbed_set_unbuffered_streamEP8_IO_FILE($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53792 | 0);
}

function dynCall_viiiii(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 FUNCTION_TABLE_viiiii[index & 127](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0);
}

function __Znaj($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54384 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN4mbed11NonCopyableINS_10FileHandleEED2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54360 | 0);
}

function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54420 | 0);
}

function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54444 | 0);
}

function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53100 | 0);
}

function __ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48080 | 0);
}

function __ZN10__cxxabiv120__si_class_type_infoD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53148 | 0);
}

function b5(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55616 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __ZN10__cxxabiv117__class_type_infoD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53260 | 0);
}

function __ZN10__cxxabiv116__shim_type_infoD2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54504 | 0);
}

function __ZThn4_N15GraphicsDisplayD1Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53452 | 0);
}

function __ZThn4_N15GraphicsDisplayD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49548 | 0);
}

function __ZN4mbed10FileHandle6rewindEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 52252 | 0);
}

function __ZN4mbed7Timeout7handlerEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48212 | 0);
}

function __ZN15GraphicsDisplay3clsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46276 | 0);
}

function __ZThn4_N11TextDisplayD1Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53492 | 0);
}

function __ZThn4_N11TextDisplayD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49676 | 0);
}

function __ZThn4_N4mbed6StreamD1Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51156 | 0);
}

function __ZThn4_N4mbed6StreamD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46836 | 0);
}

function __ZN4mbed6Stream6unlockEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54856 | 0);
}

function __ZN4mbed6Stream6rewindEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54880 | 0);
}

function __ZN4mbed10FileHandleD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54468 | 0);
}

function __ZN15GraphicsDisplayD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50080 | 0);
}

function _us_ticker_set_interrupt($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 54988 | 0);
}

function __ZN4mbed6Stream4lockEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55012 | 0);
}

function __ZN11TextDisplay3clsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 30064 | 0);
}

function __ZN4mbed8FileBaseD2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 29780 | 0);
}

function __ZN4mbed8FileBaseD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 24004 | 0);
}

function __ZN4mbed7TimeoutD2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 46124 | 0);
}

function __ZN4mbed7TimeoutD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 45800 | 0);
}

function __ZN11TextDisplayD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50300 | 0);
}

function __ZThn4_N6C12832D1Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53672 | 0);
}

function __ZThn4_N6C12832D0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49884 | 0);
}

function __ZNSt9bad_allocD2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55148 | 0);
}

function __ZNSt9bad_allocD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53904 | 0);
}

function __ZN6C128326_flushEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49468 | 0);
}

function __ZN4mbed6StreamD2Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51236 | 0);
}

function __ZN4mbed6StreamD0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47100 | 0);
}

function dynCall_viiii(index, a1, a2, a3, a4) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 FUNCTION_TABLE_viiii[index & 127](a1 | 0, a2 | 0, a3 | 0, a4 | 0);
}

function __ZN6C128323clsEv($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49064 | 0);
}

function _invoke_timeout($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48404 | 0);
}

function __ZN6C12832D0Ev($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 50664 | 0);
}

function _invoke_ticker($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 48512 | 0);
}

function _emscripten_get_global_libc() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55036 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___cxa_get_globals_fast() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47480 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 127](a1 | 0, a2 | 0, a3 | 0) | 0;
}

function b3(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55660 | 0);
}

function ___errno_location() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53568 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _us_ticker_read() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 47948 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function dynCall_viii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 FUNCTION_TABLE_viii[index & 127](a1 | 0, a2 | 0, a3 | 0);
}

function __ZN10__cxxabiv112_GLOBAL__N_110construct_Ev() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 49248 | 0);
}

function _main() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 40216 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b2() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55684 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function __GLOBAL__sub_I_arm_hal_timer_cpp() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 51620 | 0);
}

function __ZL25default_terminate_handlerv() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 22056 | 0);
}

function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}

function _us_ticker_disable_interrupt() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55304 | 0);
}

function ___cxa_pure_virtual__wrapper() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55600 | 0);
}

function dynCall_iii(index, a1, a2) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 return FUNCTION_TABLE_iii[index & 127](a1 | 0, a2 | 0) | 0;
}

function _us_ticker_clear_interrupt() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55396 | 0);
}

function _us_ticker_fire_interrupt() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55420 | 0);
}

function ___cxa_end_catch__wrapper() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55644 | 0);
}

function __GLOBAL__sub_I_main_cpp() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 53308 | 0);
}

function dynCall_vii(index, a1, a2) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 FUNCTION_TABLE_vii[index & 127](a1 | 0, a2 | 0);
}

function _us_ticker_init() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55500 | 0);
}

function b7() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 55712 | 0);
}

function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 127](a1 | 0) | 0;
}

function dynCall_vi(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 FUNCTION_TABLE_vi[index & 127](a1 | 0);
}

function dynCall_i(index) {
 index = index | 0;
 return FUNCTION_TABLE_i[index & 127]() | 0;
}

function emtStackSave() {
 asyncState ? abort(-12) | 0 : 0;
 return EMTSTACKTOP | 0;
}

function dynCall_v(index) {
 index = index | 0;
 FUNCTION_TABLE_v[index & 127]();
}

function getTempRet0() {
 asyncState ? abort(-12) | 0 : 0;
 return tempRet0 | 0;
}

function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}

function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}

function emtStackRestore(x) {
 x = x | 0;
 EMTSTACKTOP = x;
}

function setAsyncState(x) {
 x = x | 0;
 asyncState = x;
}

function stackSave() {
 return STACKTOP | 0;
}

// EMSCRIPTEN_END_FUNCS

var FUNCTION_TABLE_iiii = [b0,b0,b0,__ZN4mbed6Stream4readEPvj,__ZN4mbed6Stream5writeEPKvj,__ZN4mbed6Stream4seekEii,b0,b0,b0,b0,b0,b0,__ZN4mbed10FileHandle5lseekEii,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,___stdio_write,___stdio_seek,___stdout_write,_sn_write,b0,b0,b0,b0,b0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,b0,b0
,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,___stdio_read,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
,b0,b0,b0,b0,b0,b0,b0,b0,b0];
var FUNCTION_TABLE_viiiii = [b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
,b1,b1,b1,b1,b1,__ZN15GraphicsDisplay6windowEiiii,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib
,b1,b1,b1,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b1,b1,b1,b1,b1,b1,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
,b1,b1,b1,b1,b1,b1,b1,b1,b1];
var FUNCTION_TABLE_i = [b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
,_us_ticker_read,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,___errno_location,b2,b2,b2,b2,___cxa_get_globals_fast,b2,b2,b2,b2,b2,b2,b2,b2
,b2,b2,b2,b2,b2,b2,b2,b2,b2];
var FUNCTION_TABLE_vi = [b3,__ZN4mbed6StreamD2Ev,__ZN6C12832D0Ev,b3,b3,b3,b3,b3,b3,b3,__ZN4mbed6Stream6rewindEv,b3,b3,b3,b3,b3,b3,b3,b3,b3,__ZN6C128326_flushEv,__ZN4mbed6Stream4lockEv,__ZN4mbed6Stream6unlockEv,b3,b3,b3,b3,__ZN6C128323clsEv,b3
,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,__ZThn4_N6C12832D1Ev,__ZThn4_N6C12832D0Ev,__ZN15GraphicsDisplayD0Ev,b3,b3,b3,b3,b3,__ZN15GraphicsDisplay3clsEv,b3,__ZThn4_N15GraphicsDisplayD1Ev,__ZThn4_N15GraphicsDisplayD0Ev,__ZN11TextDisplayD0Ev,__ZN11TextDisplay3clsEv,__ZThn4_N11TextDisplayD1Ev,__ZThn4_N11TextDisplayD0Ev,__ZN4mbed7TimeoutD2Ev,__ZN4mbed7TimeoutD0Ev,__ZN4mbed7Timeout7handlerEv,b3
,b3,b3,b3,_us_ticker_set_interrupt,b3,__ZN4mbed8FileBaseD2Ev,__ZN4mbed8FileBaseD0Ev,__ZN4mbed11NonCopyableINS_10FileHandleEED2Ev,__ZN4mbed10FileHandleD0Ev,b3,b3,b3,__ZN4mbed10FileHandle6rewindEv,b3,__ZN4mbed6StreamD0Ev,__ZThn4_N4mbed6StreamD1Ev,__ZThn4_N4mbed6StreamD0Ev,b3,b3,b3,b3,b3,b3,__ZN10__cxxabiv116__shim_type_infoD2Ev,__ZN10__cxxabiv117__class_type_infoD0Ev,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,b3,b3,b3
,b3,__ZN10__cxxabiv120__si_class_type_infoD0Ev,b3,b3,b3,__ZNSt9bad_allocD2Ev,__ZNSt9bad_allocD0Ev,b3,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,b3,b3,b3,b3,b3,b3,__ZN4mbed26mbed_set_unbuffered_streamEP8_IO_FILE,b3,b3,b3,b3,__ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv,b3,b3,b3,b3,b3,b3,b3,b3,b3
,b3,b3,b3,b3,b3,b3,b3,b3,b3];
var FUNCTION_TABLE_vii = [b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,__ZN4mbed10FileHandle5sigioENS_8CallbackIFvvEEE,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
,__ZN11TextDisplay10foregroundEt,__ZN11TextDisplay10backgroundEt,b4,b4,b4,b4,__ZN15GraphicsDisplay4putpEi,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,_error,b4,b4,b4,b4,_abort_message,b4,b4,b4,b4,b4,b4,b4
,b4,b4,b4,b4,b4,b4,b4,b4,b4];
var FUNCTION_TABLE_ii = [b5,b5,b5,b5,b5,b5,__ZN4mbed6Stream5closeEv,__ZN4mbed6Stream4syncEv,__ZN4mbed6Stream6isattyEv,__ZN4mbed6Stream4tellEv,b5,__ZN4mbed6Stream4sizeEv,b5,__ZN4mbed10FileHandle5fsyncEv,__ZN4mbed10FileHandle4flenEv,b5,b5,b5,b5,__ZN11TextDisplay5_getcEv,b5,b5,b5,b5,__ZN6C128324rowsEv,__ZN6C128327columnsEv,b5,b5,b5
,b5,b5,b5,__ZN6C128325widthEv,__ZN6C128326heightEv,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,__ZN15GraphicsDisplay4rowsEv,__ZN15GraphicsDisplay7columnsEv,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
,b5,b5,b5,b5,b5,b5,b5,b5,b5,__ZN4mbed10FileHandle4syncEv,__ZN4mbed10FileHandle6isattyEv,__ZN4mbed10FileHandle4tellEv,b5,__ZN4mbed10FileHandle4sizeEv,b5,b5,b5,___stdio_close,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
,b5,b5,b5,b5,b5,b5,b5,__ZNKSt9bad_alloc4whatEv,b5,b5,b5,b5,__Znaj,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
,b5,b5,b5,b5,b5,b5,b5,b5,b5];
var FUNCTION_TABLE_viii = [b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN6C128326locateEii
,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN11TextDisplay6locateEii,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,_mbed_assert_internal,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
,b6,b6,b6,b6,b6,b6,b6,b6,b6];
var FUNCTION_TABLE_v = [b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,___cxa_pure_virtual__wrapper,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,_us_ticker_init
,b7,_us_ticker_disable_interrupt,_us_ticker_clear_interrupt,b7,_us_ticker_fire_interrupt,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,__ZL25default_terminate_handlerv,b7,b7,b7,b7,b7,b7,b7
,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,__ZN10__cxxabiv112_GLOBAL__N_110construct_Ev,b7,b7,b7,___cxa_end_catch__wrapper,b7,b7,b7,b7,b7,b7
,b7,b7,b7,b7,b7,b7,b7,b7,b7];
var FUNCTION_TABLE_viiiiii = [b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
,b8,b8,b8,b8,b8,b8,b8,__ZN15GraphicsDisplay4fillEiiiii,__ZN15GraphicsDisplay4blitEiiiiPKi,__ZN15GraphicsDisplay7blitbitEiiiiPKc,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b8
,b8,b8,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b8,b8,b8,b8,b8,b8,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
,b8,b8,b8,b8,b8,b8,b8,b8,b8];
var FUNCTION_TABLE_iii = [b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN4mbed10FileHandle12set_blockingEb,__ZNK4mbed10FileHandle4pollEs,b9,__ZN6C128325_putcEi,b9,b9,b9,b9,b9,b9,b9,__ZN11TextDisplay5claimEP8_IO_FILE,b9,b9
,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN11TextDisplay5_putcEi,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN4mbed6fdopenEPNS_10FileHandleEPKc,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
,b9,b9,b9,b9,b9,b9,b9,b9,b9];
var FUNCTION_TABLE_viiii = [b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,__ZN6C128329characterEiii,b10,b10,b10,b10,b10
,b10,b10,__ZN6C128325pixelEiii,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,__ZN15GraphicsDisplay9characterEiii,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b10,b10,b10,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b10,b10,b10,b10,b10,b10,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
,b10,b10,b10,b10,b10,b10,b10,b10,b10];

  return { _llvm_bswap_i32: _llvm_bswap_i32, _main: _main, stackSave: stackSave, _i64Subtract: _i64Subtract, ___udivdi3: ___udivdi3, setThrew: setThrew, dynCall_viii: dynCall_viii, _bitshift64Lshr: _bitshift64Lshr, _bitshift64Shl: _bitshift64Shl, _invoke_ticker: _invoke_ticker, ___cxa_is_pointer_type: ___cxa_is_pointer_type, dynCall_iii: dynCall_iii, _memset: _memset, emterpret: emterpret, _sbrk: _sbrk, _memcpy: _memcpy, stackAlloc: stackAlloc, dynCall_vii: dynCall_vii, ___uremdi3: ___uremdi3, emtStackSave: emtStackSave, setAsyncState: setAsyncState, dynCall_vi: dynCall_vi, getTempRet0: getTempRet0, __GLOBAL__sub_I_arm_hal_timer_cpp: __GLOBAL__sub_I_arm_hal_timer_cpp, setTempRet0: setTempRet0, _i64Add: _i64Add, dynCall_iiii: dynCall_iiii, dynCall_ii: dynCall_ii, __GLOBAL__sub_I_main_cpp: __GLOBAL__sub_I_main_cpp, _emscripten_get_global_libc: _emscripten_get_global_libc, emtStackRestore: emtStackRestore, dynCall_i: dynCall_i, dynCall_viiii: dynCall_viiii, _invoke_timeout: _invoke_timeout, ___errno_location: ___errno_location, dynCall_viiiii: dynCall_viiiii, ___cxa_can_catch: ___cxa_can_catch, _free: _free, runPostSets: runPostSets, dynCall_viiiiii: dynCall_viiiiii, establishStackSpace: establishStackSpace, stackRestore: stackRestore, _malloc: _malloc, _handle_interrupt_in: _handle_interrupt_in, dynCall_v: dynCall_v };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__main = asm["_main"];
asm["_main"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__main.apply(null, arguments);
});
var real_stackSave = asm["stackSave"];
asm["stackSave"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackSave.apply(null, arguments);
});
var real___GLOBAL__sub_I_main_cpp = asm["__GLOBAL__sub_I_main_cpp"];
asm["__GLOBAL__sub_I_main_cpp"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real___GLOBAL__sub_I_main_cpp.apply(null, arguments);
});
var real____udivdi3 = asm["___udivdi3"];
asm["___udivdi3"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____udivdi3.apply(null, arguments);
});
var real_getTempRet0 = asm["getTempRet0"];
asm["getTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_getTempRet0.apply(null, arguments);
});
var real__bitshift64Lshr = asm["_bitshift64Lshr"];
asm["_bitshift64Lshr"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__bitshift64Lshr.apply(null, arguments);
});
var real__bitshift64Shl = asm["_bitshift64Shl"];
asm["_bitshift64Shl"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__bitshift64Shl.apply(null, arguments);
});
var real__invoke_ticker = asm["_invoke_ticker"];
asm["_invoke_ticker"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__invoke_ticker.apply(null, arguments);
});
var real____cxa_is_pointer_type = asm["___cxa_is_pointer_type"];
asm["___cxa_is_pointer_type"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____cxa_is_pointer_type.apply(null, arguments);
});
var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__sbrk.apply(null, arguments);
});
var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
asm["_llvm_bswap_i32"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__llvm_bswap_i32.apply(null, arguments);
});
var real____uremdi3 = asm["___uremdi3"];
asm["___uremdi3"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____uremdi3.apply(null, arguments);
});
var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackAlloc.apply(null, arguments);
});
var real__i64Subtract = asm["_i64Subtract"];
asm["_i64Subtract"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__i64Subtract.apply(null, arguments);
});
var real___GLOBAL__sub_I_arm_hal_timer_cpp = asm["__GLOBAL__sub_I_arm_hal_timer_cpp"];
asm["__GLOBAL__sub_I_arm_hal_timer_cpp"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real___GLOBAL__sub_I_arm_hal_timer_cpp.apply(null, arguments);
});
var real_setTempRet0 = asm["setTempRet0"];
asm["setTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setTempRet0.apply(null, arguments);
});
var real__i64Add = asm["_i64Add"];
asm["_i64Add"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__i64Add.apply(null, arguments);
});
var real__emscripten_get_global_libc = asm["_emscripten_get_global_libc"];
asm["_emscripten_get_global_libc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__emscripten_get_global_libc.apply(null, arguments);
});
var real__invoke_timeout = asm["_invoke_timeout"];
asm["_invoke_timeout"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__invoke_timeout.apply(null, arguments);
});
var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____errno_location.apply(null, arguments);
});
var real____cxa_can_catch = asm["___cxa_can_catch"];
asm["___cxa_can_catch"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____cxa_can_catch.apply(null, arguments);
});
var real__free = asm["_free"];
asm["_free"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__free.apply(null, arguments);
});
var real_setThrew = asm["setThrew"];
asm["setThrew"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setThrew.apply(null, arguments);
});
var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_establishStackSpace.apply(null, arguments);
});
var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackRestore.apply(null, arguments);
});
var real__malloc = asm["_malloc"];
asm["_malloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__malloc.apply(null, arguments);
});
var real__handle_interrupt_in = asm["_handle_interrupt_in"];
asm["_handle_interrupt_in"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__handle_interrupt_in.apply(null, arguments);
});
var _main = Module["_main"] = asm["_main"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var __GLOBAL__sub_I_main_cpp = Module["__GLOBAL__sub_I_main_cpp"] = asm["__GLOBAL__sub_I_main_cpp"];
var ___udivdi3 = Module["___udivdi3"] = asm["___udivdi3"];
var getTempRet0 = Module["getTempRet0"] = asm["getTempRet0"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var _invoke_ticker = Module["_invoke_ticker"] = asm["_invoke_ticker"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var _memset = Module["_memset"] = asm["_memset"];
var _sbrk = Module["_sbrk"] = asm["_sbrk"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
var ___uremdi3 = Module["___uremdi3"] = asm["___uremdi3"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var __GLOBAL__sub_I_arm_hal_timer_cpp = Module["__GLOBAL__sub_I_arm_hal_timer_cpp"] = asm["__GLOBAL__sub_I_arm_hal_timer_cpp"];
var setTempRet0 = Module["setTempRet0"] = asm["setTempRet0"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = asm["_emscripten_get_global_libc"];
var _invoke_timeout = Module["_invoke_timeout"] = asm["_invoke_timeout"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var setThrew = Module["setThrew"] = asm["setThrew"];
var establishStackSpace = Module["establishStackSpace"] = asm["establishStackSpace"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _handle_interrupt_in = Module["_handle_interrupt_in"] = asm["_handle_interrupt_in"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = Module["stackAlloc"];
Runtime.stackSave = Module["stackSave"];
Runtime.stackRestore = Module["stackRestore"];
Runtime.establishStackSpace = Module["establishStackSpace"];
Runtime.setTempRet0 = Module["setTempRet0"];
Runtime.getTempRet0 = Module["getTempRet0"];
Module["asm"] = asm;
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 var initialEmtStackTop = Module["asm"].emtStackSave();
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   Module["asm"].emtStackRestore(initialEmtStackTop);
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   Module.printErr("exception thrown: " + toLog);
   Module["quit"](1, e);
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 writeStackCookie();
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
   Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms");
  }
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
 checkStackCookie();
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)");
  return;
 }
 if (Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)");
 } else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["exit"](status);
 }
 Module["quit"](status, new ExitStatus(status));
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
Module["noExitRuntime"] = true;
run();




