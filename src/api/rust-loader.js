class Module {
  async load() {
    if (this._wasm != null) return;
    this.wasm = await import('@emurgo/cardano-serialization-lib-browser');
  }
  get Cardano() {
    return this.wasm;
  }
}

export const CardanoModule = new Module();
