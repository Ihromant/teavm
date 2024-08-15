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
    function defaults(imports) {
        let stderr = "";
        let stdout = "";
        imports.teavm = {
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
            }
        };
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
            return teavm;
        }));
    }

    function createMain(instance) {
        return args => {
            if (typeof args === "undefined") {
                args = [];
            }
            return new Promise((resolve, reject) => {
                let exports = instance.exports;
                let javaArgs = exports.createStringArray(args.length);
                for (let i = 0; i < args.length; ++i) {
                    let arg = args[i];
                    let javaArg = exports.createStringBuilder();
                    for (let j = 0; j < arg.length; ++j) {
                        exports.appendChar(javaArg, arg.charCodeAt(j));
                    }
                    exports.setToStringArray(javaArgs, i, exports.buildString(javaArg));
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
