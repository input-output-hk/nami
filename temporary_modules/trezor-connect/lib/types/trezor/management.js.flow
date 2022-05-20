/* @flow */

export type ResetDevice = {
    display_random?: boolean,
    strength?: number,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    label?: string,
    u2f_counter?: number,
    skip_backup?: boolean,
    no_backup?: boolean,
    backup_type?: 0 | 1,
};
export type ApplyFlags = {
    flags: number,
};

export type ChangePin = {
    remove?: boolean,
};

export type FirmwareUpdateBinary = {
    binary: ArrayBuffer,
    version?: typeof undefined,
    btcOnly?: typeof undefined,
    baseUrl?: typeof undefined,
    intermediary?: typeof undefined,
};

export type FirmwareUpdate = {
    binary?: typeof undefined,
    version: number[],
    btcOnly?: boolean,
    baseUrl?: string,
    intermediary?: boolean,
};

export type RecoveryDevice = {
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    label?: string,
    type?: 0 | 1,
    dry_run?: boolean,
    word_count?: 12 | 18 | 24,
    u2f_counter?: number,
    enforce_wordlist?: boolean,
    language?: string,
};
