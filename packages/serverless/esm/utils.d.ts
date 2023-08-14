/// <reference types="node" />
import { Event } from '@sentry/node';
import * as domain from 'domain';
/**
 * Event processor that will override SDK details to point to the serverless SDK instead of Node,
 * as well as set correct mechanism type, which should be set to `handled: false`.
 * We do it like this, so that we don't introduce any side-effects in this module, which makes it tree-shakeable.
 * @param event Event
 * @param integration Name of the serverless integration ('AWSLambda', 'GCPFunction', etc)
 */
export declare function serverlessEventProcessor(event: Event): Event;
/**
 * @returns Current active domain with a correct type.
 */
export declare function getActiveDomain(): domain.Domain | null;
/**
 * @param fn function to run
 * @returns function which runs in the newly created domain or in the existing one
 */
export declare function domainify<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R | void;
/**
 * @param source function to be wrapped
 * @param wrap wrapping function that takes source and returns a wrapper
 * @param overrides properties to override in the source
 * @returns wrapped function
 */
export declare function proxyFunction<A extends any[], R, F extends (...args: A) => R>(source: F, wrap: (source: F) => F, overrides?: Record<PropertyKey, unknown>): F;
//# sourceMappingURL=utils.d.ts.map