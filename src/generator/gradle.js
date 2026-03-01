import { getSelectedLibs } from './libraryDefs.js'

const KOTLIN_VERSION = '2.1.10'
const COMPOSE_PLUGIN_VERSION = '1.7.3'
const AGP8_VERSION = '8.7.3'
const AGP9_VERSION = '9.0.1'
const KTOR_VERSION = '3.0.3'

export function generateGradleBuild(zip, config) {
    const { projectName, projectId, agpVersion, targets, dependencies } = config
    const agpVer = agpVersion === '9' ? AGP9_VERSION : AGP8_VERSION
    const compileSdk = agpVersion === '9' ? 35 : 34
    const minSdk = agpVersion === '9' ? 24 : 21
    const targetSdk = compileSdk
    const selectedLibs = getSelectedLibs(dependencies || {})

    // settings.gradle.kts
    zip.file('settings.gradle.kts', generateSettings(projectName, targets))

    // Root build.gradle.kts
    zip.file('build.gradle.kts', generateRootBuild(agpVer, targets, selectedLibs))

    // Version catalog
    zip.file('gradle/libs.versions.toml', generateVersionCatalog(agpVer, targets, selectedLibs))

    // gradle/wrapper
    zip.file('gradle/wrapper/gradle-wrapper.properties', generateGradleWrapper(agpVersion))

    // gradlew scripts
    zip.file('gradlew', '#!/bin/sh\n# Gradle wrapper stub\nexec gradle "$@"\n')
    zip.file('gradlew.bat', '@echo off\nrem Gradle wrapper stub\ngradle %*\n')

    // Shared module
    zip.file('shared/build.gradle.kts', generateSharedBuild(config, compileSdk, minSdk))

    // composeApp module (main app)
    zip.file('composeApp/build.gradle.kts', generateComposeAppBuild(config, compileSdk, minSdk, targetSdk))

    // Android app manifest
    if (targets.android.enabled) {
        zip.file('composeApp/src/androidMain/AndroidManifest.xml', generateAndroidManifest(projectId))
    }

    // Server module
    if (targets.server.enabled) {
        zip.file('server/build.gradle.kts', generateServerBuild(config))
    }
}

function generateSettings(projectName, targets) {
    let modules = `include(":composeApp")\ninclude(":shared")`
    if (targets.server?.enabled) {
        modules += `\ninclude(":server")`
    }

    return `rootProject.name = "${projectName}"

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
    }
}

${modules}
`
}

function generateRootBuild(agpVer, targets, selectedLibs) {
    const plugins = [
        `    alias(libs.plugins.kotlinMultiplatform) apply false`,
        `    alias(libs.plugins.composeMultiplatform) apply false`,
        `    alias(libs.plugins.composeCompiler) apply false`,
    ]

    if (targets.android?.enabled) {
        plugins.push(`    alias(libs.plugins.androidApplication) apply false`)
        plugins.push(`    alias(libs.plugins.androidLibrary) apply false`)
    }

    if (targets.server?.enabled) {
        plugins.push(`    alias(libs.plugins.kotlinJvm) apply false`)
        plugins.push(`    alias(libs.plugins.ktor) apply false`)
    }

    // Add plugins from selected libraries
    for (const lib of selectedLibs) {
        if (lib.gradle.rootPlugins) {
            for (const pluginKey of lib.gradle.rootPlugins) {
                plugins.push(`    alias(libs.plugins.${pluginKey}) apply false`)
            }
        }
    }

    return `plugins {\n${plugins.join('\n')}\n}\n`
}

function generateVersionCatalog(agpVer, targets, selectedLibs) {
    const versions = [
        `kotlin = "${KOTLIN_VERSION}"`,
        `compose-plugin = "${COMPOSE_PLUGIN_VERSION}"`,
    ]
    const libraries = []
    const plugins = [
        `kotlinMultiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }`,
        `composeMultiplatform = { id = "org.jetbrains.compose", version.ref = "compose-plugin" }`,
        `composeCompiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`,
    ]

    if (targets.android?.enabled) {
        versions.push(`agp = "${agpVer}"`)
        plugins.push(`androidApplication = { id = "com.android.application", version.ref = "agp" }`)
        plugins.push(`androidLibrary = { id = "com.android.library", version.ref = "agp" }`)
    }

    if (targets.server?.enabled) {
        versions.push(`ktor = "${KTOR_VERSION}"`)
        versions.push(`logback = "1.5.6"`)
        plugins.push(`kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }`)
        plugins.push(`ktor = { id = "io.ktor.plugin", version.ref = "ktor" }`)
        libraries.push(`logback = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }`)
        libraries.push(`ktor-server-core = { module = "io.ktor:ktor-server-core-jvm", version.ref = "ktor" }`)
        libraries.push(`ktor-server-netty = { module = "io.ktor:ktor-server-netty-jvm", version.ref = "ktor" }`)
    }

    // Add selected library entries
    const addedVersions = new Set()
    for (const lib of selectedLibs) {
        const g = lib.gradle
        if (g.versions) {
            for (const v of g.versions) {
                if (!addedVersions.has(v.key) && !versions.some(s => s.startsWith(v.key + ' '))) {
                    versions.push(`${v.key} = "${v.value}"`)
                    addedVersions.add(v.key)
                }
            }
        }
        if (g.libraries) {
            for (const l of g.libraries) {
                libraries.push(`${l.key} = { module = "${l.module}", version.ref = "${l.versionRef}" }`)
            }
        }
        if (g.plugins) {
            for (const p of g.plugins) {
                plugins.push(`${p.key} = { id = "${p.id}", version.ref = "${p.versionRef}" }`)
            }
        }
    }

    let toml = `[versions]\n${versions.join('\n')}\n`
    if (libraries.length > 0) {
        toml += `\n[libraries]\n${libraries.join('\n')}\n`
    }
    toml += `\n[plugins]\n${plugins.join('\n')}\n`
    return toml
}

function generateGradleWrapper(agpVersion) {
    const gradleVer = agpVersion === '9' ? '8.12' : '8.9'
    return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${gradleVer}-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
}

function generateSharedBuild(config, compileSdk, minSdk) {
    const { targets, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    const targetBlocks = []

    if (targets.android?.enabled) {
        targetBlocks.push(`        androidTarget()`)
    }

    if (targets.ios?.enabled) {
        targetBlocks.push(`        iosX64()
        iosArm64()
        iosSimulatorArm64()`)
    }

    if (targets.desktop?.enabled) {
        targetBlocks.push(`        jvm("desktop")`)
    }

    if (targets.web?.enabled) {
        targetBlocks.push(`        wasmJs {
            browser()
        }`)
    }

    if (targets.server?.enabled) {
        targetBlocks.push(`        jvm("server")`)
    }

    const plugins = [`    alias(libs.plugins.kotlinMultiplatform)`]
    if (targets.android?.enabled) {
        plugins.push(`    alias(libs.plugins.androidLibrary)`)
    }
    // Add shared plugins from selected libraries
    for (const lib of selectedLibs) {
        if (lib.gradle.sharedPlugins) {
            plugins.push(...lib.gradle.sharedPlugins)
        }
    }

    // Collect commonMain deps from selected libraries
    const extraDeps = []
    for (const lib of selectedLibs) {
        if (lib.gradle.commonDeps) {
            for (const dep of lib.gradle.commonDeps) {
                extraDeps.push(`            implementation(${dep})`)
            }
        }
    }
    const depsBlock = extraDeps.length > 0
        ? `            // put your Multiplatform dependencies here\n${extraDeps.join('\n')}`
        : `            // put your Multiplatform dependencies here`

    let androidBlock = ''
    if (targets.android?.enabled) {
        androidBlock = `\n\nandroid {
    namespace = "${config.projectId}.shared"
    compileSdk = ${compileSdk}
    defaultConfig {
        minSdk = ${minSdk}
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}`
    }

    return `plugins {
${plugins.join('\n')}
}

kotlin {
${targetBlocks.join('\n\n')}

    sourceSets {
        commonMain.dependencies {
${depsBlock}
        }
    }
}${androidBlock}
`
}

function generateComposeAppBuild(config, compileSdk, minSdk, targetSdk) {
    const { targets, projectId, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    const targetBlocks = []
    const plugins = [
        `    alias(libs.plugins.kotlinMultiplatform)`,
        `    alias(libs.plugins.composeMultiplatform)`,
        `    alias(libs.plugins.composeCompiler)`,
    ]

    if (targets.android?.enabled) {
        plugins.push(`    alias(libs.plugins.androidApplication)`)
        targetBlocks.push(`        androidTarget()`)
    }

    if (targets.ios?.enabled) {
        targetBlocks.push(`        listOf(
            iosX64(),
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            iosTarget.binaries.framework {
                baseName = "ComposeApp"
                isStatic = true
            }
        }`)
    }

    if (targets.desktop?.enabled) {
        targetBlocks.push(`        jvm("desktop")`)
    }

    if (targets.web?.enabled) {
        targetBlocks.push(`        wasmJs {
            browser()
            binaries.executable()
        }`)
    }

    // Add composeApp plugins from selected libraries
    for (const lib of selectedLibs) {
        if (lib.gradle.composeAppPlugins) {
            plugins.push(...lib.gradle.composeAppPlugins)
        }
    }

    // Collect extra commonMain deps from selected libraries
    const extraDeps = []
    for (const lib of selectedLibs) {
        if (lib.gradle.commonDeps) {
            for (const dep of lib.gradle.commonDeps) {
                extraDeps.push(`            implementation(${dep})`)
            }
        }
    }
    const extraDepsStr = extraDeps.length > 0 ? '\n' + extraDeps.join('\n') : ''

    let androidBlock = ''
    if (targets.android?.enabled) {
        androidBlock = `
android {
    namespace = "${projectId}"
    compileSdk = ${compileSdk}

    defaultConfig {
        applicationId = "${projectId}"
        minSdk = ${minSdk}
        targetSdk = ${targetSdk}
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
`
    }

    let desktopBlock = ''
    if (targets.desktop?.enabled) {
        desktopBlock = `
compose.desktop {
    application {
        mainClass = "${projectId}.MainKt"
    }
}
`
    }

    return `plugins {
${plugins.join('\n')}
}

kotlin {
${targetBlocks.join('\n\n')}

    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(projects.shared)${extraDepsStr}
        }${targets.desktop?.enabled ? `

        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
            }
        }` : ''}
    }
}
${androidBlock}${desktopBlock}`
}

function generateAndroidManifest(projectId) {
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
}

function generateServerBuild(config) {
    return `plugins {
    alias(libs.plugins.kotlinJvm)
    alias(libs.plugins.ktor)
    application
}

group = "${config.projectId}"
version = "1.0.0"

application {
    mainClass.set("${config.projectId}.ApplicationKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=true")
}

dependencies {
    implementation(projects.shared)
    implementation(libs.logback)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
}
`
}
