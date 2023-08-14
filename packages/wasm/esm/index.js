import { patchWebAssembly } from './patchWebAssembly';
import { getImage, getImages } from './registry';
/** plz don't */
function patchFrames(frames) {
    var haveWasm = false;
    frames.forEach(function (frame) {
        if (!frame.filename) {
            return;
        }
        var match = frame.filename.match(/^(.*?):wasm-function\[\d+\]:(0x[a-fA-F0-9]+)$/);
        if (match !== null) {
            var index = getImage(match[1]);
            if (index >= 0) {
                frame.instruction_addr = match[2];
                frame.addr_mode = "rel:" + index;
                frame.filename = match[1];
                frame.platform = 'native';
                haveWasm = true;
            }
        }
    });
    return haveWasm;
}
/**
 * Process WASM stack traces to support server-side symbolication.
 *
 * This also hooks the WebAssembly loading browser API so that module
 * registraitons are intercepted.
 */
var Wasm = /** @class */ (function () {
    function Wasm() {
        /**
         * @inheritDoc
         */
        this.name = Wasm.id;
    }
    /**
     * @inheritDoc
     */
    Wasm.prototype.setupOnce = function (addGlobalEventProcessor, _getCurrentHub) {
        patchWebAssembly();
        addGlobalEventProcessor(function (event) {
            var _a;
            var haveWasm = false;
            if (event.exception && event.exception.values) {
                event.exception.values.forEach(function (exception) {
                    var _a, _b;
                    if ((_b = (_a = exception) === null || _a === void 0 ? void 0 : _a.stacktrace) === null || _b === void 0 ? void 0 : _b.frames) {
                        haveWasm = haveWasm || patchFrames(exception.stacktrace.frames);
                    }
                });
            }
            if ((_a = event.stacktrace) === null || _a === void 0 ? void 0 : _a.frames) {
                haveWasm = haveWasm || patchFrames(event.stacktrace.frames);
            }
            if (haveWasm) {
                event.debug_meta = event.debug_meta || {};
                event.debug_meta.images = getImages();
            }
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    Wasm.id = 'Wasm';
    return Wasm;
}());
export { Wasm };
//# sourceMappingURL=index.js.map