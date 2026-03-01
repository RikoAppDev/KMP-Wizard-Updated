export function generateSharedCode(zip, config, packagePath) {
    // Common shared code
    zip.file(
        `shared/src/commonMain/kotlin/${packagePath}/Greeting.kt`,
        `package ${config.projectId}

class Greeting {
    private val platform = getPlatform()

    fun greet(): String {
        return "Hello, \${platform.name}!"
    }
}
`
    )

    zip.file(
        `shared/src/commonMain/kotlin/${packagePath}/Platform.kt`,
        `package ${config.projectId}

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
`
    )

    const { targets } = config

    // Android actual
    if (targets.android?.enabled) {
        zip.file(
            `shared/src/androidMain/kotlin/${packagePath}/Platform.android.kt`,
            `package ${config.projectId}

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android \${Build.VERSION.SDK_INT}"
}

actual fun getPlatform(): Platform = AndroidPlatform()
`
        )
    }

    // iOS actual
    if (targets.ios?.enabled) {
        zip.file(
            `shared/src/iosMain/kotlin/${packagePath}/Platform.ios.kt`,
            `package ${config.projectId}

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
`
        )
    }

    // Desktop actual
    if (targets.desktop?.enabled) {
        zip.file(
            `shared/src/desktopMain/kotlin/${packagePath}/Platform.desktop.kt`,
            `package ${config.projectId}

class DesktopPlatform : Platform {
    override val name: String = "Java \${System.getProperty("java.version")}"
}

actual fun getPlatform(): Platform = DesktopPlatform()
`
        )
    }

    // Web actual
    if (targets.web?.enabled) {
        zip.file(
            `shared/src/wasmJsMain/kotlin/${packagePath}/Platform.wasmJs.kt`,
            `package ${config.projectId}

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()
`
        )
    }

    // Server actual
    if (targets.server?.enabled) {
        zip.file(
            `shared/src/serverMain/kotlin/${packagePath}/Platform.server.kt`,
            `package ${config.projectId}

class ServerPlatform : Platform {
    override val name: String = "Server JVM \${System.getProperty("java.version")}"
}

actual fun getPlatform(): Platform = ServerPlatform()
`
        )
    }
}
