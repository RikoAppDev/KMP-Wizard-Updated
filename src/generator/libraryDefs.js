// Central library definitions for dependency picker
// Used by DependencyPicker.vue, gradle.js, and amper.js

export const LIB_CATEGORIES = [
  {
    name: 'Networking',
    libs: [
      {
        id: 'ktor-client',
        name: 'Ktor Client',
        description: 'Multiplatform HTTP client for API calls',
        version: '3.0.3',
        gradle: {
          versions: [{ key: 'ktor', value: '3.0.3' }],
          libraries: [
            { key: 'ktor-client-core', module: 'io.ktor:ktor-client-core', versionRef: 'ktor' },
            { key: 'ktor-client-content-negotiation', module: 'io.ktor:ktor-client-content-negotiation', versionRef: 'ktor' },
            { key: 'ktor-serialization-kotlinx-json', module: 'io.ktor:ktor-serialization-kotlinx-json', versionRef: 'ktor' },
          ],
          commonDeps: ['libs.ktor.client.core', 'libs.ktor.client.content.negotiation', 'libs.ktor.serialization.kotlinx.json'],
        },
        amper: {
          versions: [{ key: 'ktor', value: '3.0.3' }],
          libraries: [
            { key: 'ktor-client-core', module: 'io.ktor:ktor-client-core', versionRef: 'ktor' },
            { key: 'ktor-client-content-negotiation', module: 'io.ktor:ktor-client-content-negotiation', versionRef: 'ktor' },
            { key: 'ktor-serialization-kotlinx-json', module: 'io.ktor:ktor-serialization-kotlinx-json', versionRef: 'ktor' },
          ],
          deps: ['$libs.ktor.client.core', '$libs.ktor.client.content.negotiation', '$libs.ktor.serialization.kotlinx.json'],
        },
      },
    ],
  },
  {
    name: 'Serialization',
    libs: [
      {
        id: 'kotlinx-serialization',
        name: 'Kotlinx Serialization',
        description: 'Kotlin multiplatform serialization library',
        version: '1.7.3',
        gradle: {
          versions: [{ key: 'kotlinx-serialization', value: '1.7.3' }],
          plugins: [{ key: 'kotlinxSerialization', id: 'org.jetbrains.kotlin.plugin.serialization', versionRef: 'kotlin' }],
          libraries: [
            { key: 'kotlinx-serialization-json', module: 'org.jetbrains.kotlinx:kotlinx-serialization-json', versionRef: 'kotlinx-serialization' },
          ],
          commonDeps: ['libs.kotlinx.serialization.json'],
          rootPlugins: ['kotlinxSerialization'],
          sharedPlugins: ['    alias(libs.plugins.kotlinxSerialization)'],
          composeAppPlugins: ['    alias(libs.plugins.kotlinxSerialization)'],
        },
        amper: {
          versions: [{ key: 'kotlinx-serialization', value: '1.7.3' }],
          libraries: [
            { key: 'kotlinx-serialization-json', module: 'org.jetbrains.kotlinx:kotlinx-serialization-json', versionRef: 'kotlinx-serialization' },
          ],
          deps: ['$libs.kotlinx.serialization.json'],
          settings: ['  kotlin.serialization: json'],
        },
      },
    ],
  },
  {
    name: 'Async & Utilities',
    libs: [
      {
        id: 'kotlinx-coroutines',
        name: 'Kotlinx Coroutines',
        description: 'Multiplatform coroutines support',
        version: '1.9.0',
        gradle: {
          versions: [{ key: 'kotlinx-coroutines', value: '1.9.0' }],
          libraries: [
            { key: 'kotlinx-coroutines-core', module: 'org.jetbrains.kotlinx:kotlinx-coroutines-core', versionRef: 'kotlinx-coroutines' },
          ],
          commonDeps: ['libs.kotlinx.coroutines.core'],
        },
        amper: {
          versions: [{ key: 'kotlinx-coroutines', value: '1.9.0' }],
          libraries: [
            { key: 'kotlinx-coroutines-core', module: 'org.jetbrains.kotlinx:kotlinx-coroutines-core', versionRef: 'kotlinx-coroutines' },
          ],
          deps: ['$libs.kotlinx.coroutines.core'],
        },
      },
      {
        id: 'kotlinx-datetime',
        name: 'Kotlinx DateTime',
        description: 'Multiplatform date/time library',
        version: '0.6.1',
        gradle: {
          versions: [{ key: 'kotlinx-datetime', value: '0.6.1' }],
          libraries: [
            { key: 'kotlinx-datetime', module: 'org.jetbrains.kotlinx:kotlinx-datetime', versionRef: 'kotlinx-datetime' },
          ],
          commonDeps: ['libs.kotlinx.datetime'],
        },
        amper: {
          versions: [{ key: 'kotlinx-datetime', value: '0.6.1' }],
          libraries: [
            { key: 'kotlinx-datetime', module: 'org.jetbrains.kotlinx:kotlinx-datetime', versionRef: 'kotlinx-datetime' },
          ],
          deps: ['$libs.kotlinx.datetime'],
        },
      },
    ],
  },
  {
    name: 'DI & Navigation',
    libs: [
      {
        id: 'koin',
        name: 'Koin',
        description: 'Pragmatic lightweight dependency injection',
        version: '4.0.0',
        gradle: {
          versions: [{ key: 'koin', value: '4.0.0' }],
          libraries: [
            { key: 'koin-core', module: 'io.insert-koin:koin-core', versionRef: 'koin' },
            { key: 'koin-compose', module: 'io.insert-koin:koin-compose', versionRef: 'koin' },
          ],
          commonDeps: ['libs.koin.core', 'libs.koin.compose'],
        },
        amper: {
          versions: [{ key: 'koin', value: '4.0.0' }],
          libraries: [
            { key: 'koin-core', module: 'io.insert-koin:koin-core', versionRef: 'koin' },
            { key: 'koin-compose', module: 'io.insert-koin:koin-compose', versionRef: 'koin' },
          ],
          deps: ['$libs.koin.core', '$libs.koin.compose'],
        },
      },
      {
        id: 'navigation-compose',
        name: 'Navigation Compose',
        description: 'Official Compose Multiplatform navigation',
        version: '2.8.0-alpha10',
        gradle: {
          versions: [{ key: 'navigation-compose', value: '2.8.0-alpha10' }],
          libraries: [
            { key: 'navigation-compose', module: 'org.jetbrains.androidx.navigation:navigation-compose', versionRef: 'navigation-compose' },
          ],
          commonDeps: ['libs.navigation.compose'],
        },
        amper: {
          versions: [{ key: 'navigation-compose', value: '2.8.0-alpha10' }],
          libraries: [
            { key: 'navigation-compose', module: 'org.jetbrains.androidx.navigation:navigation-compose', versionRef: 'navigation-compose' },
          ],
          deps: ['$libs.navigation.compose'],
        },
      },
    ],
  },
  {
    name: 'Images & UI',
    libs: [
      {
        id: 'coil',
        name: 'Coil',
        description: 'Image loading for Compose Multiplatform',
        version: '3.0.4',
        gradle: {
          versions: [{ key: 'coil', value: '3.0.4' }],
          libraries: [
            { key: 'coil-compose', module: 'io.coil-kt.coil3:coil-compose', versionRef: 'coil' },
            { key: 'coil-network-ktor', module: 'io.coil-kt.coil3:coil-network-ktor3', versionRef: 'coil' },
          ],
          commonDeps: ['libs.coil.compose', 'libs.coil.network.ktor'],
        },
        amper: {
          versions: [{ key: 'coil', value: '3.0.4' }],
          libraries: [
            { key: 'coil-compose', module: 'io.coil-kt.coil3:coil-compose', versionRef: 'coil' },
            { key: 'coil-network-ktor', module: 'io.coil-kt.coil3:coil-network-ktor3', versionRef: 'coil' },
          ],
          deps: ['$libs.coil.compose', '$libs.coil.network.ktor'],
        },
      },
    ],
  },
  {
    name: 'Storage',
    libs: [
      {
        id: 'multiplatform-settings',
        name: 'Multiplatform Settings',
        description: 'Key-value storage (SharedPreferences / NSUserDefaults)',
        version: '1.2.0',
        gradle: {
          versions: [{ key: 'multiplatform-settings', value: '1.2.0' }],
          libraries: [
            { key: 'multiplatform-settings', module: 'com.russhwolf:multiplatform-settings-no-arg', versionRef: 'multiplatform-settings' },
          ],
          commonDeps: ['libs.multiplatform.settings'],
        },
        amper: {
          versions: [{ key: 'multiplatform-settings', value: '1.2.0' }],
          libraries: [
            { key: 'multiplatform-settings', module: 'com.russhwolf:multiplatform-settings-no-arg', versionRef: 'multiplatform-settings' },
          ],
          deps: ['$libs.multiplatform.settings'],
        },
      },
    ],
  },
  {
    name: 'Logging',
    libs: [
      {
        id: 'napier',
        name: 'Napier',
        description: 'Multiplatform logging library',
        version: '2.7.1',
        gradle: {
          versions: [{ key: 'napier', value: '2.7.1' }],
          libraries: [
            { key: 'napier', module: 'io.github.aakira:napier', versionRef: 'napier' },
          ],
          commonDeps: ['libs.napier'],
        },
        amper: {
          versions: [{ key: 'napier', value: '2.7.1' }],
          libraries: [
            { key: 'napier', module: 'io.github.aakira:napier', versionRef: 'napier' },
          ],
          deps: ['$libs.napier'],
        },
      },
    ],
  },
]

// Helper: get selected library definitions from deps map
export function getSelectedLibs(dependencies) {
  const selected = []
  for (const category of LIB_CATEGORIES) {
    for (const lib of category.libs) {
      if (dependencies[lib.id]) {
        selected.push(lib)
      }
    }
  }
  return selected
}
