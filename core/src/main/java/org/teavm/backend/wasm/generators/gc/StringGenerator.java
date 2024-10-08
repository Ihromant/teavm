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
package org.teavm.backend.wasm.generators.gc;

import org.teavm.backend.wasm.model.WasmFunction;
import org.teavm.backend.wasm.model.WasmLocal;
import org.teavm.backend.wasm.model.expression.WasmCall;
import org.teavm.backend.wasm.model.expression.WasmGetLocal;
import org.teavm.backend.wasm.runtime.StringInternPool;
import org.teavm.model.MethodReference;
import org.teavm.model.ValueType;

public class StringGenerator implements WasmGCCustomGenerator {
    @Override
    public void apply(MethodReference method, WasmFunction function, WasmGCCustomGeneratorContext context) {
        var worker = context.functions().forStaticMethod(new MethodReference(StringInternPool.class,
                "query", String.class, String.class));
        var instanceLocal = new WasmLocal(context.typeMapper().mapType(ValueType.parse(String.class)), "this");
        function.add(instanceLocal);
        function.getBody().add(new WasmCall(worker, new WasmGetLocal(instanceLocal)));
    }
}
