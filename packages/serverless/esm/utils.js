import { addExceptionMechanism } from '@sentry/utils';
import * as domain from 'domain';
/**
 * Event processor that will override SDK details to point to the serverless SDK instead of Node,
 * as well as set correct mechanism type, which should be set to `handled: false`.
 * We do it like this, so that we don't introduce any side-effects in this module, which makes it tree-shakeable.
 * @param event Event
 * @param integration Name of the serverless integration ('AWSLambda', 'GCPFunction', etc)
 */
export function serverlessEventProcessor(event) {
    addExceptionMechanism(event, {
        handled: false,
    });
    return event;
}
/**
 * @returns Current active domain with a correct type.
 */
export function getActiveDomain() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return domain.active;
}
/**
 * @param fn function to run
 * @returns function which runs in the newly created domain or in the existing one
 */
export function domainify(fn) {
    return (...args) => {
        if (getActiveDomain()) {
            return fn(...args);
        }
        const dom = domain.create();
        return dom.run(() => fn(...args));
    };
}
/**
 * @param source function to be wrapped
 * @param wrap wrapping function that takes source and returns a wrapper
 * @param overrides properties to override in the source
 * @returns wrapped function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxyFunction(source, wrap, overrides) {
    const wrapper = wrap(source);
    const handler = {
        apply: (_target, thisArg, args) => {
            return wrapper.apply(thisArg, args);
        },
    };
    if (overrides) {
        handler.get = (target, prop) => {
            if (Object.prototype.hasOwnProperty.call(overrides, prop)) {
                return overrides[prop];
            }
            return target[prop];
        };
    }
    return new Proxy(source, handler);
}
//# sourceMappingURL=utils.js.map