/*
 *  Copyright 2024 ihromant.
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
package org.teavm.jso.streams;

import org.teavm.jso.JSClass;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSArray;
import org.teavm.jso.core.JSPromise;

@JSClass
public class ReadableStream implements JSObject {
    @JSProperty
    public native boolean isLocked();

    public native JSPromise<?> abort(String reason);

    public native JSPromise<?> cancel();

    public native JSPromise<?> cancel(String reason);

    public native JSPromise<?> pipeTo(WritableStream stream);

    public native JSPromise<?> pipeTo(WritableStream stream, JSObject options);

    public native JSArray<ReadableStream> tee();
}
