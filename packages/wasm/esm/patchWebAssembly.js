import { registerModule } from './registry';
/**
 * Patches the web assembly runtime.
 */
export function patchWebAssembly() {
    if ('instantiateStreaming' in WebAssembly) {
        var origInstantiateStreaming_1 = WebAssembly.instantiateStreaming;
        WebAssembly.instantiateStreaming = function instantiateStreaming(response, importObject) {
            return Promise.resolve(response).then(function (response) {
                return origInstantiateStreaming_1(response, importObject).then(function (rv) {
                    if (response.url) {
                        registerModule(rv.module, response.url);
                    }
                    return rv;
                });
            });
        };
    }
    if ('compileStreaming' in WebAssembly) {
        var origCompileStreaming_1 = WebAssembly.compileStreaming;
        WebAssembly.compileStreaming = function compileStreaming(source) {
            return Promise.resolve(source).then(function (response) {
                return origCompileStreaming_1(response).then(function (module) {
                    if (response.url) {
                        registerModule(module, response.url);
                    }
                    return module;
                });
            });
        };
    }
}
//# sourceMappingURL=patchWebAssembly.js.map