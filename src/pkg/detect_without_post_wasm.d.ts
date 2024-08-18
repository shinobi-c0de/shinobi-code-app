/* tslint:disable */
/* eslint-disable */
/**
*/
export function main(): void;
/**
* @param {Uint8Array} image_data
* @param {number} image_width
* @param {number} image_height
* @returns {any}
*/
export function preprocess(image_data: Uint8Array, image_width: number, image_height: number): any;
/**
* @param {Float32Array} js_array
* @param {Uint32Array} arr_size
* @param {number} ratio
* @param {number} max_width
* @param {number} max_height
* @returns {any}
*/
export function postprocess(js_array: Float32Array, arr_size: Uint32Array, ratio: number, max_width: number, max_height: number): any;
/**
*/
export class ImageData {
  free(): void;
}
/**
*/
export class ProcessedData {
  free(): void;
}
/**
*/
export class ProcessedImage {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_imagedata_free: (a: number) => void;
  readonly __wbg_processeddata_free: (a: number) => void;
  readonly main: () => void;
  readonly preprocess: (a: number, b: number, c: number, d: number) => number;
  readonly postprocess: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly __wbg_processedimage_free: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
