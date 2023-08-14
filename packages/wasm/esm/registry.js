export var IMAGES = [];
/**
 * Returns the extracted meta information from a web assembly module that
 * Sentry uses to identify debug images.
 *
 * @param module
 */
export function getModuleInfo(module) {
    var buildIds = WebAssembly.Module.customSections(module, 'build_id');
    var buildId = null;
    var debugFile = null;
    if (buildIds.length > 0) {
        var firstBuildId = new Uint8Array(buildIds[0]);
        buildId = Array.from(firstBuildId).reduce(function (acc, x) {
            return acc + x.toString(16).padStart(2, '0');
        }, '');
    }
    var externalDebugInfo = WebAssembly.Module.customSections(module, 'external_debug_info');
    if (externalDebugInfo.length > 0) {
        var firstExternalDebugInfo = new Uint8Array(externalDebugInfo[0]);
        var decoder = new TextDecoder('utf-8');
        debugFile = decoder.decode(firstExternalDebugInfo);
    }
    return { buildId: buildId, debugFile: debugFile };
}
/**
 * Records a module
 */
export function registerModule(module, url) {
    var _a = getModuleInfo(module), buildId = _a.buildId, debugFile = _a.debugFile;
    if (buildId) {
        var oldIdx = IMAGES.findIndex(function (img) { return img.code_file === url; });
        if (oldIdx >= 0) {
            IMAGES.splice(oldIdx, 1);
        }
        IMAGES.push({
            type: 'wasm',
            code_id: buildId,
            code_file: url,
            debug_file: debugFile ? new URL(debugFile, url).href : null,
            debug_id: buildId.padEnd(32, '0').substr(0, 32) + "0",
        });
    }
}
/**
 * Returns all known images.
 */
export function getImages() {
    return IMAGES;
}
/**
 * Looks up an image by URL.
 *
 * @param url the URL of the WebAssembly module.
 */
export function getImage(url) {
    return IMAGES.findIndex(function (img) { return img.code_file === url; });
}
//# sourceMappingURL=registry.js.map