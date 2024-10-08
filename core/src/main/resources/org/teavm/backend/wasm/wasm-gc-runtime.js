/*
 *  Copyright 2024 Alexey Andreev.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var TeaVM = TeaVM || {};
TeaVM.wasm = function() {
    let exports;
    let getGlobalName = function(name) {
        return eval(name);
    }

    function defaults(imports) {
        dateImports(imports);
        consoleImports(imports);
        coreImports(imports);
        jsoImports(imports);
        imports.teavmMath = Math;
    }

    function dateImports(imports) {
        imports.teavmDate = {
            currentTimeMillis: () => new Date().getTime(),
            dateToString: timestamp => stringToJava(new Date(timestamp).toString()),
            getYear: timestamp =>new Date(timestamp).getFullYear(),
            setYear(timestamp, year) {
                let date = new Date(timestamp);
                date.setFullYear(year);
                return date.getTime();
            },
            getMonth: timestamp =>new Date(timestamp).getMonth(),
            setMonth(timestamp, month) {
                let date = new Date(timestamp);
                date.setMonth(month);
                return date.getTime();
            },
            getDate: timestamp =>new Date(timestamp).getDate(),
            setDate(timestamp, value) {
                let date = new Date(timestamp);
                date.setDate(value);
                return date.getTime();
            },
            create: (year, month, date, hrs, min, sec) => new Date(year, month, date, hrs, min, sec).getTime(),
            createFromUTC: (year, month, date, hrs, min, sec) => Date.UTC(year, month, date, hrs, min, sec)
        };
    }

    function consoleImports(imports) {
        let stderr = "";
        let stdout = "";
        imports.teavmConsole = {
            putcharStderr(c) {
                if (c === 10) {
                    console.error(stderr);
                    stderr = "";
                } else {
                    stderr += String.fromCharCode(c);
                }
            },
            putcharStdout(c) {
                if (c === 10) {
                    console.log(stdout);
                    stdout = "";
                } else {
                    stdout += String.fromCharCode(c);
                }
            },
        };
    }

    function coreImports(imports) {
        imports.teavm = {
            createWeakRef(value, heldValue) {
                let weakRef = new WeakRef(value);
                if (heldValue !== null) {
                    finalizationRegistry.register(value, heldValue)
                }
                return weakRef;
            },
            deref: weakRef => weakRef.deref(),
            createStringWeakRef(value, heldValue) {
                let weakRef = new WeakRef(value);
                stringFinalizationRegistry.register(value, heldValue)
                return weakRef;
            },
            stringDeref: weakRef => weakRef.deref()
        };
    }

    function jsoImports(imports) {
        new FinalizationRegistry(heldValue => {
            if (typeof exports.reportGarbageCollectedValue === "function") {
                exports.reportGarbageCollectedValue(heldValue)
            }
        });
        new FinalizationRegistry(heldValue => {
            exports.reportGarbageCollectedString(heldValue);
        });

        let javaObjectSymbol = Symbol("javaObject");
        let functionsSymbol = Symbol("functions");
        let functionOriginSymbol = Symbol("functionOrigin");

        let jsWrappers = new WeakMap();
        let javaWrappers = new WeakMap();
        let primitiveWrappers = new Map();
        let primitiveFinalization = new FinalizationRegistry(token => primitiveFinalization.delete(token));
        let hashCodes = new WeakMap();
        let lastHashCode = 2463534242;
        let nextHashCode = () => {
            let x = lastHashCode;
            x ^= x << 13;
            x ^= x >>> 17;
            x ^= x << 5;
            lastHashCode = x;
            return x;
        }

        function identity(value) {
            return value;
        }
        function sanitizeName(str) {
            let result = "";
            let firstChar = str.charAt(0);
            result += isIdentifierStart(firstChar) ? firstChar : '_';
            for (let i = 1; i < str.length; ++i) {
                let c = str.charAt(i)
                result += isIdentifierPart(c) ? c : '_';
            }
            return result;
        }
        function isIdentifierStart(s) {
            return s >= 'A' && s <= 'Z' || s >= 'a' && s <= 'z' || s === '_' || s === '$';
        }
        function isIdentifierPart(s) {
            return isIdentifierStart(s) || s >= '0' && s <= '9';
        }
        imports.teavmJso = {
            emptyString: () => "",
            stringFromCharCode: code => String.fromCharCode(code),
            concatStrings: (a, b) => a + b,
            stringLength: s => s.length,
            charAt: (s, index) => s.charCodeAt(index),
            emptyArray: () => [],
            appendToArray: (array, e) => array.push(e),
            unwrapBoolean: value => value ? 1 : 0,
            wrapBoolean: value => !!value,
            getProperty: (obj, prop) => obj !== null ? obj[prop] : getGlobalName(prop),
            getPropertyPure: (obj, prop) => obj !== null ? obj[prop] : getGlobalName(prop),
            setProperty: (obj, prop, value) => obj[prop] = value,
            setPropertyPure: (obj, prop) => obj[prop] = value,
            global: getGlobalName,
            createClass(name) {
                let fn = new Function(
                    "javaObjectSymbol",
                    "functionsSymbol",
                    `return function JavaClass_${sanitizeName(name)}(javaObject) {
                        this[javaObjectSymbol] = javaObject;
                        this[functionsSymbol] = null;
                    };`
                );
                return fn(javaObjectSymbol, functionsSymbol, functionOriginSymbol);
            },
            defineMethod(cls, name, fn) {
                cls.prototype[name] = function(...args) {
                    return fn(this, ...args);
                }
            },
            defineProperty(cls, name, getFn, setFn) {
                let descriptor = {
                    get() {
                        return getFn(this);
                    }
                };
                if (setFn !== null) {
                    descriptor.set = function(value) {
                        setFn(this, value);
                    }
                }
                Object.defineProperty(cls.prototype, name, descriptor);
            },
            javaObjectToJS(instance, cls) {
                let existing = jsWrappers.get(instance);
                if (typeof existing != "undefined") {
                    let result = existing.deref();
                    if (typeof result !== "undefined") {
                        return result;
                    }
                }
                let obj = new cls(instance);
                jsWrappers.set(instance, new WeakRef(obj));
                return obj;
            },
            unwrapJavaObject(instance) {
                return instance[javaObjectSymbol];
            },
            asFunction(instance, propertyName) {
                let functions = instance[functionsSymbol];
                if (functions === null) {
                    functions = Object.create(null);
                    instance[functionsSymbol] = functions;
                }
                let result = functions[propertyName];
                if (typeof result !== 'function') {
                    result = function() {
                        return instance[propertyName].apply(instance, arguments);
                    }
                    result[functionOriginSymbol] = instance;
                    functions[propertyName] = result;
                }
                return result;
            },
            functionAsObject(fn, property) {
                let origin = fn[functionOriginSymbol];
                if (typeof origin !== 'undefined') {
                    let functions = origin[functionsSymbol];
                    if (functions !== void 0 && functions[property] === fn) {
                        return origin;
                    }
                }
                return { [property]: fn };
            },
            wrapObject(obj) {
                if (obj === null) {
                    return null;
                }
                if (typeof obj === "object" || typeof obj === "function" || typeof "obj" === "symbol") {
                    let result = obj[javaObjectSymbol];
                    if (typeof result === "object") {
                        return result;
                    }
                    result = javaWrappers.get(obj);
                    if (result !== void 0) {
                        result = result.deref();
                        if (result !== void 0) {
                            return result;
                        }
                    }
                    result = exports["teavm.jso.createWrapper"](obj);
                    javaWrappers.set(obj, new WeakRef(result));
                    return result;
                } else {
                    let result = primitiveWrappers.get(obj);
                    if (result !== void 0) {
                        result = result.deref();
                        if (result !== void 0) {
                            return result;
                        }
                    }
                    result = exports["teavm.jso.createWrapper"](obj);
                    primitiveWrappers.set(obj, new WeakRef(result));
                    primitiveFinalization.register(result, obj);
                    return result;
                }
            },
            isPrimitive: (value, type) => typeof value === type,
            instanceOf: (value, type) => value instanceof type,
            instanceOfOrNull: (value, type) => value === null || value instanceof type,
            sameRef: (a, b) => a === b,
            hashCode: (obj) => {
                if (typeof obj === "object" || typeof obj === "function" || typeof obj === "symbol") {
                    let code = hashCodes.get(obj);
                    if (typeof code === "number") {
                        return code;
                    }
                    code = nextHashCode();
                    hashCodes.set(obj, code);
                    return code;
                } else if (typeof obj === "number") {
                    return obj | 0;
                } else if (typeof obj === "bigint") {
                    return BigInt.asIntN(obj, 32);
                } else if (typeof obj === "boolean") {
                    return obj ? 1 : 0;
                } else {
                    return 0;
                }
            }
        };
        for (let name of ["wrapByte", "wrapShort", "wrapChar", "wrapInt", "wrapFloat", "wrapDouble", "unwrapByte",
            "unwrapShort", "unwrapChar", "unwrapInt", "unwrapFloat", "unwrapDouble"]) {
            imports.teavmJso[name] = identity;
        }
        for (let i = 0; i < 32; ++i) {
            imports.teavmJso["createFunction" + i] = (...args) => new Function(...args);
            imports.teavmJso["callFunction" + i] = (fn, ...args) => fn(...args);
            imports.teavmJso["callMethod" + i] = (instance, method, ...args) =>
                instance !== null ? instance[method](...args) : getGlobalName(method)(...args);
            imports.teavmJso["construct" + i] = (constructor, ...args) => new constructor(...args);
        }
    }

    function load(path, options) {
        if (!options) {
            options = {};
        }

        const importObj = {};
        defaults(importObj);
        if (typeof options.installImports !== "undefined") {
            options.installImports(importObj);
        }

        return WebAssembly.instantiateStreaming(fetch(path), importObj).then((obj => {
            let teavm = {};
            teavm.main = createMain(obj.instance);
            teavm.instance = obj.instance;
            return teavm;
        }));
    }

    function stringToJava(str) {
        let sb = exports.createStringBuilder();
        for (let i = 0; i < str.length; ++i) {
            exports.appendChar(sb, str.charCodeAt(i));
        }
        return exports.buildString(sb);
    }

    function createMain(instance) {
        return args => {
            if (typeof args === "undefined") {
                args = [];
            }
            return new Promise((resolve, reject) => {
                exports = instance.exports;
                let javaArgs = exports.createStringArray(args.length);
                for (let i = 0; i < args.length; ++i) {
                    exports.setToStringArray(javaArgs, i, stringToJava(args[i]));
                }
                try {
                    exports.main(javaArgs);
                } catch (e) {
                    reject(e);
                }
            });
        }
    }

    return { load };
}();
