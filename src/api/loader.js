import * as wasm from '@dcspark/cardano-multiplatform-lib-browser';
import * as wasm2 from '../wasm/cardano_message_signing/cardano_message_signing.generated';

/**
 * Loads the WASM modules
 */

class Loader {
  _wasm = wasm;

  /**
   * Instantiate message signing library.
   * Loader.Cardano is loaded synchronously and does not require async instantiation.
   */
  async load() {
    if (this._wasm2) return;
    try {
      await wasm2.instantiate();
    } catch (_e) {
      // Only happens when running with Jest (Node.js)
    }

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
