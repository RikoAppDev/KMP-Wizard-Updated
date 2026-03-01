export function generatePlatformCode(zip, config, packagePath) {
    const { targets, projectId } = config

    // Common Compose UI (App.kt)
    const hasCompose = targets.android?.enabled || targets.ios?.enabled || targets.desktop?.enabled || targets.web?.enabled
    if (hasCompose) {
        zip.file(
            `composeApp/src/commonMain/kotlin/${packagePath}/App.kt`,
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
    }

    // Android
    if (targets.android?.enabled) {
        zip.file(
            `composeApp/src/androidMain/kotlin/${packagePath}/MainActivity.kt`,
            `package ${projectId}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
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

        // Android resources
        zip.file(
            `composeApp/src/androidMain/res/values/strings.xml`,
            `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${config.projectName}</string>
</resources>
`
        )

        zip.file(
            `composeApp/src/androidMain/res/values/themes.xml`,
            `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.AppCompat.Light.NoActionBar" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`
        )
    }

    // iOS
    if (targets.ios?.enabled) {
        if (targets.ios.uiFramework === 'compose') {
            zip.file(
                `composeApp/src/iosMain/kotlin/${packagePath}/MainViewController.kt`,
                `package ${projectId}

import androidx.compose.ui.window.ComposeUIViewController

fun MainViewController() = ComposeUIViewController { App() }
`
            )
        }

        // iosApp SwiftUI entry point
        zip.file(
            `iosApp/iosApp/iOSApp.swift`,
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

        if (targets.ios.uiFramework === 'compose') {
            zip.file(
                `iosApp/iosApp/ContentView.swift`,
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
            .ignoresSafeArea(.keyboard)
    }
}
`
            )
        } else {
            zip.file(
                `iosApp/iosApp/ContentView.swift`,
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
            `iosApp/iosApp/Info.plist`,
            `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>${config.projectName}</string>
    <key>CFBundleIdentifier</key>
    <string>${projectId}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
</dict>
</plist>
`
        )
    }

    // Desktop
    if (targets.desktop?.enabled) {
        zip.file(
            `composeApp/src/desktopMain/kotlin/${packagePath}/main.kt`,
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

    // Web
    if (targets.web?.enabled) {
        zip.file(
            `composeApp/src/wasmJsMain/kotlin/${packagePath}/main.kt`,
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

        zip.file(
            `composeApp/src/wasmJsMain/resources/index.html`,
            `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${config.projectName}</title>
    <script src="composeApp.js"></script>
</head>
<body>
</body>
</html>
`
        )
    }

    // Server
    if (targets.server?.enabled) {
        zip.file(
            `server/src/main/kotlin/${packagePath}/Application.kt`,
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
}
