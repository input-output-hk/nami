import * as wasm from '../wasm/cardano_multiplatform_lib/cardano_multiplatform_lib.generated';
import * as wasm2 from '../wasm/cardano_message_signing/cardano_message_signing.generated';

/**
 * Loads the WASM modules
 */

class Loader {
  async load() {
    if (this._wasm && this._wasm2) return;
    try {
      await wasm.instantiate();
      await wasm2.instantiate();
    } catch (_e) {
      // Only happens when running with Jest (Node.js)
    }
    /**
     * @private
     */
    this._wasm = wasm;
    /**
     * @private
     */
    this._wasm2 = wasm2;
  }

  get Cardano() {
    return this._wasm;
  }

  get Message() {
    return this._wasm2;
  }
}

export default new Loader();
