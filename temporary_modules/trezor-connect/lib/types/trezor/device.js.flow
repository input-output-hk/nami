/* @flow */
import { DEVICE } from '../../constants';
import type { Features } from './protobuf';

export type DeviceStateResponse = {
    state: string,
};

export type DeviceStatus = 'available' | 'occupied' | 'used';

export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';

export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required' | 'unknown' | 'none';

export type UnavailableCapability =
    | 'no-capability'
    | 'no-support'
    | 'update-required'
    | 'trezor-connect-outdated';

// NOTE: unavailableCapabilities is an object with information what is NOT supported by this device.
// in ideal/expected setup this object should be empty but given setup might have exceptions.
// key = coin shortcut lowercase (ex: btc, eth, xrp) OR field declared in coins.json "supportedFirmware.capability"
export type UnavailableCapabilities = { [key: string]: UnavailableCapability };

export type FirmwareRange = {
    '1': {
        min: string,
        max: string,
    },
    '2': {
        min: string,
        max: string,
    },
};

type Release = {
    required: true,
    version: number[],
    min_bridge_version: number[],
    min_firmware_version: number[],
    bootloader_version: number[],
    min_bootloader_version: number[],
    url: string,
    channel: string,
    fingerprint: string,
    changelog: string,
    channel?: string,
};

export type FirmwareRelease = {
    changelog: Release[] | null,
    release: Release,
    isLatest: boolean | null,
    isRequired: boolean | null,
    isNewer: boolean | null,
};

export type KnownDevice = {|
    type: 'acquired',
    id: string | null,
    path: string,
    label: string,
    error?: typeof undefined,
    firmware: DeviceFirmwareStatus,
    firmwareRelease: ?FirmwareRelease,
    status: DeviceStatus,
    mode: DeviceMode,
    state: ?string,
    features: Features,
    unavailableCapabilities: UnavailableCapabilities,
|};

export type UnknownDevice = {|
    type: 'unacquired',
    id?: null,
    path: string,
    label: string,
    error?: typeof undefined,
    features?: typeof undefined,
    firmware?: typeof undefined,
    firmwareRelease?: typeof undefined,
    status?: typeof undefined,
    mode?: typeof undefined,
    state?: typeof undefined,
    unavailableCapabilities?: typeof undefined,
|};

export type UnreadableDevice = {|
    type: 'unreadable',
    id?: null,
    path: string,
    label: string,
    error: string,
    features?: typeof undefined,
    firmware?: typeof undefined,
    firmwareRelease?: typeof undefined,
    status?: typeof undefined,
    mode?: typeof undefined,
    state?: typeof undefined,
    unavailableCapabilities?: typeof undefined,
|};

export type Device = KnownDevice | UnknownDevice | UnreadableDevice;

export type DeviceEvent = {
    type:
        | typeof DEVICE.CONNECT
        | typeof DEVICE.CONNECT_UNACQUIRED
        | typeof DEVICE.CHANGED
        | typeof DEVICE.DISCONNECT,
    payload: Device,
};

export type { Features } from './protobuf';
