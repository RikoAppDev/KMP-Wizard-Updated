import { getSelectedLibs } from './libraryDefs.js'

export function generateAmperBuild(zip, config) {
    const { projectName, projectId, targets } = config

    // Root project.yaml — list all modules
    zip.file('project.yaml', generateProjectYaml(config))

    // libs.versions.toml (version catalog)
    zip.file('libs.versions.toml', generateVersionCatalog(config))

    // .gitignore
    zip.file('.gitignore', `*.iml
.gradle
.kotlin
**/build/
xcuserdata
!src/**/build/
local.properties
.idea
.DS_Store
captures
.externalNativeBuild
.cxx
*.xcodeproj/*
!*.xcodeproj/project.pbxproj
!*.xcodeproj/xcshareddata/
!*.xcodeproj/project.xcworkspace/
!*.xcworkspace/contents.xcworkspacedata
**/xcshareddata/WorkspaceSettings.xcsettings
`)

    // Amper wrapper scripts
    zip.file('amper', generateAmperShellScript())
    zip.file('amper.bat', generateAmperBatScript())

    // composeApp module (Compose Multiplatform — shared lib)
    zip.file('composeApp/module.yaml', generateComposeAppModuleYaml(config))
    generateComposeAppSources(zip, config)

    // androidApp module
    if (targets.android?.enabled) {
        zip.file('androidApp/module.yaml', generateAndroidAppModuleYaml(config))
        generateAndroidAppSources(zip, config)
    }

    // iosApp module
    if (targets.ios?.enabled) {
        zip.file('iosApp/module.yaml', generateIosAppModuleYaml(config))
        generateIosAppSources(zip, config)
    }

    // server module
    if (targets.server?.enabled) {
        zip.file('server/module.yaml', generateServerModuleYaml(config))
        generateServerSources(zip, config)
    }
}

function generateProjectYaml(config) {
    const { targets } = config
    const modules = ['  - composeApp']

    if (targets.android?.enabled) modules.push('  - androidApp')
    if (targets.ios?.enabled) modules.push('  - iosApp')
    if (targets.server?.enabled) modules.push('  - server')

    return `modules:
${modules.join('\n')}
`
}

function generateVersionCatalog(config) {
    const { targets, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    let versions = `[versions]`
    let libraries = `\n[libraries]`

    if (targets.android?.enabled) {
        versions += `\nandroidx-activityCompose = "1.9.2"\nandroidx-ui-tooling = "1.8.2"`
        libraries += `\nandroidx-activity-compose = { module = "androidx.activity:activity-compose", version.ref = "androidx-activityCompose" }\nandroidx-compose-ui-tooling-preview = { module = "androidx.compose.ui:ui-tooling-preview", version.ref = "androidx-ui-tooling" }`
    }

    if (targets.desktop?.enabled) {
        versions += `\ncoroutines = "1.8.1"`
        libraries += `\nkotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "coroutines" }`
    }

    if (targets.server?.enabled) {
        versions += `\nktor = "3.0.3"\nlogback = "1.5.6"`
        libraries += `\nktor-server-core = { module = "io.ktor:ktor-server-core", version.ref = "ktor" }\nktor-server-netty = { module = "io.ktor:ktor-server-netty", version.ref = "ktor" }\nlogback = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }`
    }

    // Add selected library entries
    const addedVersions = new Set()
    for (const lib of selectedLibs) {
        const a = lib.amper
        if (a.versions) {
            for (const v of a.versions) {
                if (!addedVersions.has(v.key) && !versions.includes(v.key + ' =')) {
                    versions += `\n${v.key} = "${v.value}"`
                    addedVersions.add(v.key)
                }
            }
        }
        if (a.libraries) {
            for (const l of a.libraries) {
                libraries += `\n${l.key} = { module = "${l.module}", version.ref = "${l.versionRef}" }`
            }
        }
    }

    return `${versions}\n${libraries}\n`
}

function generateComposeAppModuleYaml(config) {
    const { targets, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    const platforms = []

    if (targets.android?.enabled) platforms.push('android')
    if (targets.ios?.enabled) {
        platforms.push('iosArm64')
        platforms.push('iosSimulatorArm64')
        platforms.push('iosX64')
    }
    if (targets.desktop?.enabled) platforms.push('jvm')
    if (targets.web?.enabled) platforms.push('wasmJs')

    const deps = [
        '  - $compose.runtime',
        '  - $compose.foundation',
        '  - $compose.material3',
    ]

    // Add selected library deps
    for (const lib of selectedLibs) {
        if (lib.amper.deps) {
            for (const dep of lib.amper.deps) {
                deps.push(`  - ${dep}`)
            }
        }
    }

    let extraSections = ''

    if (targets.desktop?.enabled) {
        extraSections += `\ndependencies@jvm:\n  - $libs.kotlinx.coroutines.swing\n`
    }

    // Collect extra settings from selected libs
    const extraSettings = []
    for (const lib of selectedLibs) {
        if (lib.amper.settings) {
            extraSettings.push(...lib.amper.settings)
        }
    }
    const settingsBlock = extraSettings.length > 0
        ? `\nsettings:\n  compose: enabled\n${extraSettings.join('\n')}\n`
        : `\nsettings:\n  compose: enabled\n`

    return `# Compose Multiplatform Application\n\nproduct:\n  type: lib\n  platforms: [${platforms.join(', ')}]\n\ndependencies:\n${deps.join('\n')}\n${extraSections}${settingsBlock}`
}

function generateAndroidAppModuleYaml(config) {
    const { projectId } = config

    return `product: android/app

dependencies:
  - ../composeApp
  - $libs.androidx.compose.ui.tooling.preview
  - $libs.androidx.activity.compose
  - $compose.foundation

settings:
  compose: enabled
  android:
    applicationId: ${projectId}
    namespace: ${projectId}
`
}

function generateIosAppModuleYaml(config) {
    return `product: ios/app

dependencies:
  - ../composeApp

settings:
  compose: enabled
`
}

function generateServerModuleYaml(config) {
    const { projectId } = config

    return `# Server module (Ktor)

product:
  type: app
  platforms:
    - jvm

dependencies:
  - ../composeApp
  - $libs.ktor.server.core
  - $libs.ktor.server.netty
  - $libs.logback

settings:
  kotlin:
    languageVersion: "2.1"
  jvm:
    mainClass: "${projectId}.ApplicationKt"
`
}

// ---------- Source file generators ----------

function generateComposeAppSources(zip, config) {
    const { projectId, targets } = config

    // App.kt — shared Compose UI
    zip.file(
        `composeApp/src/App.kt`,
        `package ${projectId}

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun App() {
    MaterialTheme {
        var showContent by remember { mutableStateOf(false) }
        Column(
            Modifier.fillMaxWidth().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Button(onClick = { showContent = !showContent }) {
                Text("Click me!")
            }
            AnimatedVisibility(showContent) {
                val greeting = remember { Greeting().greet() }
                Column(
                    Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("Compose: $greeting")
                }
            }
        }
    }
}
`
    )

    // Platform.kt — expect/actual
    zip.file(
        `composeApp/src/Platform.kt`,
        `package ${projectId}

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
`
    )

    // Greeting.kt
    zip.file(
        `composeApp/src/Greeting.kt`,
        `package ${projectId}

class Greeting {
    private val platform = getPlatform()

    fun greet(): String {
        return "Hello, \${platform.name}!"
    }
}
`
    )

    // Platform actual implementations per target
    if (targets.android?.enabled) {
        zip.file(
            `composeApp/src@android/Platform.android.kt`,
            `package ${projectId}

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android \${Build.VERSION.SDK_INT}"
}

actual fun getPlatform(): Platform = AndroidPlatform()
`
        )
    }

    if (targets.ios?.enabled) {
        zip.file(
            `composeApp/src@ios/Platform.ios.kt`,
            `package ${projectId}

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
`
        )
    }

    if (targets.desktop?.enabled) {
        zip.file(
            `composeApp/src@jvm/Platform.jvm.kt`,
            `package ${projectId}

class JVMPlatform : Platform {
    override val name: String = "Java \${System.getProperty("java.version")}"
}

actual fun getPlatform(): Platform = JVMPlatform()
`
        )

        zip.file(
            `composeApp/src@jvm/main.kt`,
            `package ${projectId}

import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "${config.projectName}",
    ) {
        App()
    }
}
`
        )
    }

    if (targets.web?.enabled) {
        zip.file(
            `composeApp/src@wasmJs/Platform.wasmJs.kt`,
            `package ${projectId}

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()
`
        )

        zip.file(
            `composeApp/src@wasmJs/main.kt`,
            `package ${projectId}

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import kotlinx.browser.document

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    ComposeViewport(document.body!!) {
        App()
    }
}
`
        )
    }

    // iOS MainViewController (in composeApp for Compose sharing)
    if (targets.ios?.enabled && targets.ios.uiFramework === 'compose') {
        zip.file(
            `composeApp/src@ios/MainViewController.kt`,
            `package ${projectId}

import androidx.compose.ui.window.ComposeUIViewController

fun MainViewController() = ComposeUIViewController { App() }
`
        )
    }
}

function generateAndroidAppSources(zip, config) {
    const { projectId, projectName } = config

    // AndroidManifest.xml
    zip.file(
        `androidApp/src/AndroidManifest.xml`,
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        <activity
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|mnc|colorMode|density|fontScale|fontWeightAdjustment|keyboard|layoutDirection|locale|mcc|navigation|smallestScreenSize|touchscreen|uiMode"
            android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
    )

    // MainActivity.kt
    zip.file(
        `androidApp/src/MainActivity.kt`,
        `package ${projectId}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()
        setContent {
            LaunchedEffect(isSystemInDarkTheme()) {
                enableEdgeToEdge()
            }
            App()
        }
    }
}

@Preview
@Composable
fun AppAndroidPreview() {
    App()
}
`
    )

    // strings.xml
    zip.file(
        `androidApp/res/values/strings.xml`,
        `<resources>
    <string name="app_name">${projectName}</string>
</resources>
`
    )
}

function generateIosAppSources(zip, config) {
    const { targets } = config

    if (targets.ios?.uiFramework === 'compose') {
        zip.file(
            `iosApp/src/ContentView.swift`,
            `import UIKit
import SwiftUI
import ComposeApp

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea()
    }
}
`
        )
    } else {
        zip.file(
            `iosApp/src/ContentView.swift`,
            `import SwiftUI

struct ContentView: View {
    @State private var showGreeting = false

    var body: some View {
        VStack {
            Button("Click me!") {
                showGreeting.toggle()
            }
            if showGreeting {
                Text("Hello from SwiftUI!")
            }
        }
        .padding()
    }
}
`
        )
    }

    zip.file(
        `iosApp/src/iOSApp.swift`,
        `import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`
    )
}

function generateServerSources(zip, config) {
    const { projectId } = config

    zip.file(
        `server/src/Application.kt`,
        `package ${projectId}

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    routing {
        get("/") {
            call.respondText("Ktor: \${Greeting().greet()}")
        }
    }
}
`
    )
}

function generateAmperShellScript() {
    return `#!/bin/sh
# Amper wrapper script
# This is a simplified wrapper. For the full version, visit:
# https://github.com/JetBrains/amper

set -e

AMPER_VERSION="0.9.1"

echo "Amper wrapper: please install Amper $AMPER_VERSION or use JetBrains Fleet/IntelliJ IDEA"
echo "See: https://github.com/JetBrains/amper#getting-started"
`
}

function generateAmperBatScript() {
    return `@echo off
rem Amper wrapper script
rem This is a simplified wrapper. For the full version, visit:
rem https://github.com/JetBrains/amper

set AMPER_VERSION=0.9.1

echo Amper wrapper: please install Amper %AMPER_VERSION% or use JetBrains Fleet/IntelliJ IDEA
echo See: https://github.com/JetBrains/amper#getting-started
`
}
