"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAndroid = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = require("path");
const colors_1 = tslib_1.__importDefault(require("../colors"));
const common_1 = require("../common");
const native_run_1 = require("../util/native-run");
const subprocess_1 = require("../util/subprocess");
const debug = debug_1.default('capacitor:android:run');
async function runAndroid(config, { target: selectedTarget }) {
    var _a;
    const target = await common_1.promptForPlatformTarget(await native_run_1.getPlatformTargets('android'), selectedTarget);
    const arg = `assemble${((_a = config.android) === null || _a === void 0 ? void 0 : _a.flavor) || ''}Debug`;
    const gradleArgs = [arg];
    debug('Invoking ./gradlew with args: %O', gradleArgs);
    try {
        await common_1.runTask('Running Gradle build', async () => subprocess_1.runCommand('./gradlew', gradleArgs, {
            cwd: config.android.platformDirAbs,
        }));
    }
    catch (e) {
        if (e.includes('EACCES')) {
            throw `gradlew file does not have executable permissions. This can happen if the Android platform was added on a Windows machine. Please run ${colors_1.default.strong(`chmod +x ./${config.android.platformDir}/gradlew`)} and try again.`;
        }
        else {
            throw e;
        }
    }
    const apkPath = path_1.resolve(config.android.buildOutputDirAbs, config.android.apkName);
    const nativeRunArgs = ['android', '--app', apkPath, '--target', target.id];
    debug('Invoking native-run with args: %O', nativeRunArgs);
    await common_1.runTask(`Deploying ${colors_1.default.strong(config.android.apkName)} to ${colors_1.default.input(target.id)}`, async () => native_run_1.runNativeRun(nativeRunArgs));
}
exports.runAndroid = runAndroid;
