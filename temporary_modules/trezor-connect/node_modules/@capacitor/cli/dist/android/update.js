"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCordovaPluginsGradle = exports.installGradlePlugins = exports.updateAndroid = void 0;
const tslib_1 = require("tslib");
const utils_fs_1 = require("@ionic/utils-fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = require("path");
const colors_1 = tslib_1.__importDefault(require("../colors"));
const common_1 = require("../common");
const cordova_1 = require("../cordova");
const errors_1 = require("../errors");
const plugin_1 = require("../plugin");
const copy_1 = require("../tasks/copy");
const fs_1 = require("../util/fs");
const node_1 = require("../util/node");
const template_1 = require("../util/template");
const common_2 = require("./common");
const platform = 'android';
const debug = debug_1.default('capacitor:android:update');
async function updateAndroid(config) {
    const plugins = await getPluginsTask(config);
    const capacitorPlugins = plugins.filter(p => plugin_1.getPluginType(p, platform) === 0 /* Core */);
    plugin_1.printPlugins(capacitorPlugins, 'android');
    await writePluginsJson(config, capacitorPlugins);
    await removePluginsNativeFiles(config);
    const cordovaPlugins = plugins.filter(p => plugin_1.getPluginType(p, platform) === 1 /* Cordova */);
    if (cordovaPlugins.length > 0) {
        await copyPluginsNativeFiles(config, cordovaPlugins);
    }
    if (!(await utils_fs_1.pathExists(config.android.webDirAbs))) {
        await copy_1.copy(config, platform);
    }
    await cordova_1.handleCordovaPluginsJS(cordovaPlugins, config, platform);
    await cordova_1.checkPluginDependencies(plugins, platform);
    await installGradlePlugins(config, capacitorPlugins, cordovaPlugins);
    await handleCordovaPluginsGradle(config, cordovaPlugins);
    await cordova_1.writeCordovaAndroidManifest(cordovaPlugins, config, platform);
    const incompatibleCordovaPlugins = plugins.filter(p => plugin_1.getPluginType(p, platform) === 2 /* Incompatible */);
    plugin_1.printPlugins(incompatibleCordovaPlugins, platform, 'incompatible');
    await common_1.checkPlatformVersions(config, platform);
}
exports.updateAndroid = updateAndroid;
function getGradlePackageName(id) {
    return id.replace('@', '').replace('/', '-');
}
async function writePluginsJson(config, plugins) {
    const classes = await findAndroidPluginClasses(plugins);
    const pluginsJsonPath = path_1.resolve(config.android.assetsDirAbs, 'capacitor.plugins.json');
    await utils_fs_1.writeJSON(pluginsJsonPath, classes, { spaces: '\t' });
}
async function findAndroidPluginClasses(plugins) {
    const entries = [];
    for (const plugin of plugins) {
        entries.push(...(await findAndroidPluginClassesInPlugin(plugin)));
    }
    return entries;
}
async function findAndroidPluginClassesInPlugin(plugin) {
    if (!plugin.android || plugin_1.getPluginType(plugin, platform) !== 0 /* Core */) {
        return [];
    }
    const srcPath = path_1.resolve(plugin.rootPath, plugin.android.path, 'src/main');
    const srcFiles = await utils_fs_1.readdirp(srcPath, {
        filter: entry => !entry.stats.isDirectory() &&
            ['.java', '.kt'].includes(path_1.extname(entry.path)),
    });
    const classRegex = /^@(?:CapacitorPlugin|NativePlugin)[\s\S]+?class ([\w]+)/gm;
    const packageRegex = /^package ([\w.]+);?$/gm;
    debug('Searching %O source files in %O by %O regex', srcFiles.length, srcPath, classRegex);
    const entries = await Promise.all(srcFiles.map(async (srcFile) => {
        const srcFileContents = await utils_fs_1.readFile(srcFile, { encoding: 'utf-8' });
        classRegex.lastIndex = 0;
        const classMatch = classRegex.exec(srcFileContents);
        if (classMatch) {
            const className = classMatch[1];
            debug('Searching %O for package by %O regex', srcFile, packageRegex);
            packageRegex.lastIndex = 0;
            const packageMatch = packageRegex.exec(srcFileContents.substring(0, classMatch.index));
            if (!packageMatch) {
                errors_1.fatal(`Package could not be parsed from Android plugin.\n` +
                    `Location: ${colors_1.default.strong(srcFile)}`);
            }
            const packageName = packageMatch[1];
            const classpath = `${packageName}.${className}`;
            debug('%O is a suitable plugin class', classpath);
            return {
                pkg: plugin.id,
                classpath,
            };
        }
    }));
    return entries.filter((entry) => !!entry);
}
async function installGradlePlugins(config, capacitorPlugins, cordovaPlugins) {
    const capacitorAndroidPackagePath = node_1.resolveNode(config.app.rootDir, '@capacitor/android', 'package.json');
    if (!capacitorAndroidPackagePath) {
        errors_1.fatal(`Unable to find ${colors_1.default.strong('node_modules/@capacitor/android')}.\n` +
            `Are you sure ${colors_1.default.strong('@capacitor/android')} is installed?`);
    }
    const capacitorAndroidPath = path_1.resolve(path_1.dirname(capacitorAndroidPackagePath), 'capacitor');
    const settingsPath = config.android.platformDirAbs;
    const dependencyPath = config.android.appDirAbs;
    const relativeCapcitorAndroidPath = fs_1.convertToUnixPath(path_1.relative(settingsPath, capacitorAndroidPath));
    const settingsLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('${relativeCapcitorAndroidPath}')
${capacitorPlugins
        .map(p => {
        if (!p.android) {
            return '';
        }
        const relativePluginPath = fs_1.convertToUnixPath(path_1.relative(settingsPath, p.rootPath));
        return `
include ':${getGradlePackageName(p.id)}'
project(':${getGradlePackageName(p.id)}').projectDir = new File('${relativePluginPath}/${p.android.path}')
`;
    })
        .join('')}`;
    const applyArray = [];
    const frameworksArray = [];
    let prefsArray = [];
    cordovaPlugins.map(p => {
        const relativePluginPath = fs_1.convertToUnixPath(path_1.relative(dependencyPath, p.rootPath));
        const frameworks = plugin_1.getPlatformElement(p, platform, 'framework');
        frameworks.map((framework) => {
            if (framework.$.custom &&
                framework.$.custom === 'true' &&
                framework.$.type &&
                framework.$.type === 'gradleReference') {
                applyArray.push(`apply from: "${relativePluginPath}/${framework.$.src}"`);
            }
            else if (!framework.$.type && !framework.$.custom) {
                frameworksArray.push(`    implementation "${framework.$.src}"`);
            }
        });
        prefsArray = prefsArray.concat(plugin_1.getAllElements(p, platform, 'preference'));
    });
    let frameworkString = frameworksArray.join('\n');
    frameworkString = await replaceFrameworkVariables(config, prefsArray, frameworkString);
    const dependencyLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN

android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
  }
}

apply from: "../capacitor-cordova-android-plugins/cordova.variables.gradle"
dependencies {
${capacitorPlugins
        .map(p => {
        return `    implementation project(':${getGradlePackageName(p.id)}')`;
    })
        .join('\n')}
${frameworkString}
}
${applyArray.join('\n')}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
`;
    await utils_fs_1.writeFile(path_1.join(settingsPath, 'capacitor.settings.gradle'), settingsLines);
    await utils_fs_1.writeFile(path_1.join(dependencyPath, 'capacitor.build.gradle'), dependencyLines);
}
exports.installGradlePlugins = installGradlePlugins;
async function handleCordovaPluginsGradle(config, cordovaPlugins) {
    var _a, _b, _c;
    const pluginsGradlePath = path_1.join(config.android.cordovaPluginsDirAbs, 'build.gradle');
    const kotlinNeeded = await kotlinNeededCheck(config, cordovaPlugins);
    const isKotlinVersionInVariablesGradle = (await getVariablesGradleFile(config)).includes('kotlin_version');
    const kotlinVersionString = (_c = (_b = (_a = config.app.extConfig.cordova) === null || _a === void 0 ? void 0 : _a.preferences) === null || _b === void 0 ? void 0 : _b.GradlePluginKotlinVersion) !== null && _c !== void 0 ? _c : '1.4.32';
    const frameworksArray = [];
    let prefsArray = [];
    const applyArray = [];
    applyArray.push(`apply from: "cordova.variables.gradle"`);
    cordovaPlugins.map(p => {
        const relativePluginPath = fs_1.convertToUnixPath(path_1.relative(config.android.cordovaPluginsDirAbs, p.rootPath));
        const frameworks = plugin_1.getPlatformElement(p, platform, 'framework');
        frameworks.map((framework) => {
            if (!framework.$.type && !framework.$.custom) {
                frameworksArray.push(framework.$.src);
            }
            else if (framework.$.custom &&
                framework.$.custom === 'true' &&
                framework.$.type &&
                framework.$.type === 'gradleReference') {
                applyArray.push(`apply from: "${relativePluginPath}/${framework.$.src}"`);
            }
        });
        prefsArray = prefsArray.concat(plugin_1.getAllElements(p, platform, 'preference'));
    });
    let frameworkString = frameworksArray
        .map(f => {
        return `    implementation "${f}"`;
    })
        .join('\n');
    frameworkString = await replaceFrameworkVariables(config, prefsArray, frameworkString);
    if (kotlinNeeded) {
        frameworkString += `\n    implementation "androidx.core:core-ktx:$androidxCoreKTXVersion"`;
        frameworkString += `\n    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"`;
    }
    const applyString = applyArray.join('\n');
    let buildGradle = await utils_fs_1.readFile(pluginsGradlePath, { encoding: 'utf-8' });
    buildGradle = buildGradle.replace(/(SUB-PROJECT DEPENDENCIES START)[\s\S]*(\/\/ SUB-PROJECT DEPENDENCIES END)/, '$1\n' + frameworkString.concat('\n') + '    $2');
    buildGradle = buildGradle.replace(/(PLUGIN GRADLE EXTENSIONS START)[\s\S]*(\/\/ PLUGIN GRADLE EXTENSIONS END)/, '$1\n' + applyString.concat('\n') + '$2');
    if (kotlinNeeded) {
        buildGradle = buildGradle.replace(/(buildscript\s{\n(\t|\s{4})repositories\s{\n((\t{2}|\s{8}).+\n)+(\t|\s{4})}\n(\t|\s{4})dependencies\s{\n(\t{2}|\s{8}).+)\n((\t|\s{4})}\n}\n)/, `$1\n        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:` +
            (isKotlinVersionInVariablesGradle
                ? '$kotlin_version'
                : kotlinVersionString) +
            `"\n$8`);
        buildGradle = buildGradle.replace(/(ext\s{)/, `$1\n    kotlin_version = project.hasProperty('kotlin_version') ? rootProject.ext.kotlin_version : '${kotlinVersionString}'\n    androidxCoreKTXVersion = project.hasProperty('androidxCoreKTXVersion') ? rootProject.ext.androidxCoreKTXVersion : '1.6.0'`);
        buildGradle = buildGradle.replace(/(apply\splugin:\s'com\.android\.library')/, `$1\napply plugin: 'kotlin-android'`);
        buildGradle = buildGradle.replace(/(compileOptions\s{\n((\t{2}|\s{8}).+\n)+(\t|\s{4})})\n(})/, `$1\n    sourceSets {\n        main.java.srcDirs += 'src/main/kotlin'\n    }\n$5`);
    }
    await utils_fs_1.writeFile(pluginsGradlePath, buildGradle);
    const cordovaVariables = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN
ext {
  cdvMinSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : ${config.android.minVersion}
  // Plugin gradle extensions can append to this to have code run at the end.
  cdvPluginPostBuildExtras = []
  cordovaConfig = [:]
}`;
    await utils_fs_1.writeFile(path_1.join(config.android.cordovaPluginsDirAbs, 'cordova.variables.gradle'), cordovaVariables);
}
exports.handleCordovaPluginsGradle = handleCordovaPluginsGradle;
async function kotlinNeededCheck(config, cordovaPlugins) {
    var _a, _b;
    if (((_b = (_a = config.app.extConfig.cordova) === null || _a === void 0 ? void 0 : _a.preferences) === null || _b === void 0 ? void 0 : _b.GradlePluginKotlinEnabled) !==
        'true') {
        for (const plugin of cordovaPlugins) {
            const androidPlatform = plugin_1.getPluginPlatform(plugin, platform);
            const sourceFiles = androidPlatform['source-file'];
            if (sourceFiles) {
                for (const srcFile of sourceFiles) {
                    if (/^.*\.kt$/.test(srcFile['$'].src)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    else {
        return true;
    }
}
async function copyPluginsNativeFiles(config, cordovaPlugins) {
    const pluginsPath = path_1.join(config.android.cordovaPluginsDirAbs, 'src', 'main');
    for (const p of cordovaPlugins) {
        const androidPlatform = plugin_1.getPluginPlatform(p, platform);
        if (androidPlatform) {
            const sourceFiles = androidPlatform['source-file'];
            if (sourceFiles) {
                for (const sourceFile of sourceFiles) {
                    const fileName = sourceFile.$.src.split('/').pop();
                    let baseFolder = 'java/';
                    if (fileName.split('.').pop() === 'aidl') {
                        baseFolder = 'aidl/';
                    }
                    const target = sourceFile.$['target-dir']
                        .replace('app/src/main/', '')
                        .replace('src/', baseFolder);
                    await utils_fs_1.copy(plugin_1.getFilePath(config, p, sourceFile.$.src), path_1.join(pluginsPath, target, fileName));
                }
            }
            const resourceFiles = androidPlatform['resource-file'];
            if (resourceFiles) {
                for (const resourceFile of resourceFiles) {
                    const target = resourceFile.$['target'];
                    if (resourceFile.$.src.split('.').pop() === 'aar') {
                        await utils_fs_1.copy(plugin_1.getFilePath(config, p, resourceFile.$.src), path_1.join(pluginsPath, 'libs', target.split('/').pop()));
                    }
                    else if (target !== '.') {
                        await utils_fs_1.copy(plugin_1.getFilePath(config, p, resourceFile.$.src), path_1.join(pluginsPath, target));
                    }
                }
            }
            const libFiles = plugin_1.getPlatformElement(p, platform, 'lib-file');
            for (const libFile of libFiles) {
                await utils_fs_1.copy(plugin_1.getFilePath(config, p, libFile.$.src), path_1.join(pluginsPath, 'libs', libFile.$.src.split('/').pop()));
            }
        }
    }
}
async function removePluginsNativeFiles(config) {
    await utils_fs_1.remove(config.android.cordovaPluginsDirAbs);
    await template_1.extractTemplate(config.cli.assets.android.cordovaPluginsTemplateArchiveAbs, config.android.cordovaPluginsDirAbs);
}
async function getPluginsTask(config) {
    return await common_1.runTask('Updating Android plugins', async () => {
        const allPlugins = await plugin_1.getPlugins(config, 'android');
        const androidPlugins = await common_2.getAndroidPlugins(allPlugins);
        return androidPlugins;
    });
}
async function getVariablesGradleFile(config) {
    const variablesFile = path_1.resolve(config.android.platformDirAbs, 'variables.gradle');
    let variablesGradle = '';
    if (await utils_fs_1.pathExists(variablesFile)) {
        variablesGradle = await utils_fs_1.readFile(variablesFile, { encoding: 'utf-8' });
    }
    return variablesGradle;
}
async function replaceFrameworkVariables(config, prefsArray, frameworkString) {
    const variablesGradle = await getVariablesGradleFile(config);
    prefsArray.map((preference) => {
        if (!variablesGradle.includes(preference.$.name)) {
            frameworkString = frameworkString.replace(new RegExp(('$' + preference.$.name).replace('$', '\\$&'), 'g'), preference.$.default);
        }
    });
    return frameworkString;
}
