# KMP Wizard Updated

An open-source clone of the [Kotlin Multiplatform Wizard](https://kmp.jetbrains.com/) built with Vue 3, with additional configuration options.

## What's different?

- **Build system choice** — generate projects with **Gradle** or **Amper**
- **AGP version toggle** — choose between AGP 9+ (default) or AGP 8
- Amper projects are fully Gradle-free (uses `module.yaml`, `project.yaml`, and the Amper wrapper)
- Android & iOS are always included as required targets
- Desktop, Web (Wasm), and Server are optional (marked as experimental)

## Targets

| Target | Status | Notes |
|--------|--------|-------|
| Android | Required | Compose Multiplatform |
| iOS | Required | Compose Multiplatform or SwiftUI |
| Desktop | Optional | JVM with Compose Desktop |
| Web | Optional | Kotlin/Wasm with Compose |
| Server | Optional | Ktor |

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vite.dev/)
- [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/nicolo-ribaudo/FileSaver.js) for client-side ZIP generation

## Getting started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## License

MIT
