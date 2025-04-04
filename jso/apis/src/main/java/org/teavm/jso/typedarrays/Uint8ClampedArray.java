/*
 *  Copyright 2014 Alexey Andreev.
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
package org.teavm.jso.typedarrays;

import java.nio.Buffer;
import org.teavm.jso.JSBody;
import org.teavm.jso.JSBuffer;
import org.teavm.jso.JSBufferType;
import org.teavm.jso.JSClass;
import org.teavm.jso.JSIndexer;

@JSClass
public class Uint8ClampedArray extends TypedArray {
    public Uint8ClampedArray(int length) {
    }

    public Uint8ClampedArray(ArrayBuffer buffer) {
    }

    public Uint8ClampedArray(TypedArray buffer) {
    }

    public Uint8ClampedArray(ArrayBuffer buffer, int offset, int length) {
    }

    public Uint8ClampedArray(ArrayBuffer buffer, int offset) {
    }

    @JSIndexer
    public native short get(int index);

    @JSIndexer
    public native void set(int index, int value);

    @JSBody(params = "length", script = "return new Uint8ClampedArray(length);")
    @Deprecated
    public static native Uint8ClampedArray create(int length);

    @JSBody(params = "buffer", script = "return new Uint8ClampedArray(buffer);")
    @Deprecated
    public static native Uint8ClampedArray create(ArrayBuffer buffer);

    @JSBody(params = "buffer", script = "return new Uint8ClampedArray(buffer);")
    @Deprecated
    public static native Uint8ClampedArray create(TypedArray buffer);

    @JSBody(params = { "buffer", "offset", "length" }, script = "return new "
            + "Uint8ClampedArray(buffer, offset, length);")
    @Deprecated
    public static native Uint8ClampedArray create(ArrayBuffer buffer, int offset, int length);

    @JSBody(params = { "buffer", "offset" }, script = "return new Uint8ClampedArray(buffer, offset);")
    @Deprecated
    public static native Uint8ClampedArray create(ArrayBuffer buffer, int offset);

    @JSBody(params = "buffer", script = "return buffer;")
    public static native Uint8ClampedArray fromJavaBuffer(@JSBuffer(JSBufferType.UINT8) Buffer buffer);
}
