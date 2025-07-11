/*
 *  Copyright 2018 Alexey Andreev.
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
package org.teavm.tooling.builder;

import java.util.List;
import java.util.Properties;
import org.teavm.backend.javascript.JSModuleType;
import org.teavm.backend.wasm.WasmDebugInfoLevel;
import org.teavm.backend.wasm.WasmDebugInfoLocation;
import org.teavm.backend.wasm.render.WasmBinaryVersion;
import org.teavm.tooling.TeaVMSourceFilePolicy;
import org.teavm.tooling.TeaVMTargetType;
import org.teavm.tooling.TeaVMToolLog;
import org.teavm.vm.TeaVMOptimizationLevel;
import org.teavm.vm.TeaVMProgressListener;

public interface BuildStrategy {
    void init();

    void setLog(TeaVMToolLog log);

    void addSourcesDirectory(String directory);

    void addSourcesJar(String jarFile);

    void setClassPathEntries(List<String> entries);

    void setTargetType(TeaVMTargetType targetType);

    void setMainClass(String mainClass);

    void setEntryPointName(String entryPointName);

    void setTargetDirectory(String targetDirectory);

    void setSourceMapsFileGenerated(boolean sourceMapsFileGenerated);

    void setDebugInformationGenerated(boolean debugInformationGenerated);

    @Deprecated
    void setSourceFilesCopied(boolean sourceFilesCopied);

    void setSourceFilePolicy(TeaVMSourceFilePolicy sourceFilePolicy);

    void setProgressListener(TeaVMProgressListener progressListener);

    void setIncremental(boolean incremental);

    void setObfuscated(boolean obfuscated);

    void setStrict(boolean strict);

    void setJsModuleType(JSModuleType jsModuleType);

    void setMaxTopLevelNames(int maxTopLevelNames);

    void setProperties(Properties properties);

    void setTransformers(String[] transformers);

    void setOptimizationLevel(TeaVMOptimizationLevel level);

    void setFastDependencyAnalysis(boolean value);

    void setTargetFileName(String targetFileName);

    void setClassesToPreserve(String[] classesToPreserve);

    void setCacheDirectory(String cacheDirectory);

    void setWasmVersion(WasmBinaryVersion wasmVersion);

    void setWasmExceptionsUsed(boolean wasmExceptionsUsed);

    void setWasmDebugInfoLevel(WasmDebugInfoLevel wasmDebugInfoLevel);

    void setWasmDebugInfoLocation(WasmDebugInfoLocation wasmDebugInfoLocation);

    void setMinHeapSize(int minHeapSize);

    void setMaxHeapSize(int maxHeapSize);

    void setMinDirectBuffersSize(int minDirectBuffersSize);

    void setMaxDirectBuffersSize(int maxDirectBuffersSize);

    void setImportedWasmMemory(boolean value);

    void setHeapDump(boolean heapDump);

    void setShortFileNames(boolean shortFileNames);

    void setAssertionsRemoved(boolean assertionsRemoved);

    BuildResult build() throws BuildException;
}
