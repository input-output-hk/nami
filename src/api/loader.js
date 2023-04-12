import * as wasm from '../../temporary_modules/@emurgo/cardano-multiplatform-lib-browser';
import * as wasm2 from '../../temporary_modules/@emurgo/cardano-message-signing-browser/emurgo_message_signing';

/**
 * Loads the WASM modules
 */

class Loader {
  async load() {
    if (this._wasm && this._wasm2) return;
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
