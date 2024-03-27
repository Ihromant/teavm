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
package org.teavm.jso.file;

import org.teavm.jso.JSClass;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSArray;

@JSClass(name = "File")
public class JSFile extends JSBlob implements JSObject {
    public JSFile(JSArray<?> array, String fileName) {
        super(array);
    }

    public JSFile(JSArray<?> array, String fileName, JSObject options) {
        super(array, options);
    }

    @JSProperty
    public native double getLastModified();

    @JSProperty
    public native String getName();

    @JSProperty
    public native String getWebkitRelativePath();
}
