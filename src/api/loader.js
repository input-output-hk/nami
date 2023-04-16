/**
 * Loads the WASM modules
 */

class Loader {
  async load() {
    if (this._wasm && this._wasm2) return;
    /**
     * @private
     */
    this._wasm = await import(
      '../../temporary_modules/@emurgo/cardano-multiplatform-lib-browser'
    );
    /**
     * @private
     */
    this._wasm2 = await import(
      '../../temporary_modules/@emurgo/cardano-message-signing-browser/emurgo_message_signing'
    );
  }

  get Cardano() {
    return this._wasm;
  }

  get Message() {
    return this._wasm2;
  }
}

export default new Loader();
