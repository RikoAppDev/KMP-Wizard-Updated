import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { generateGradleBuild } from './gradle.js'
import { generateAmperBuild } from './amper.js'
import { generateSharedCode } from './sharedCode.js'
import { generatePlatformCode } from './platformCode.js'

export async function generateProject(config) {
    const zip = new JSZip()
    const { projectName, projectId, buildSystem, agpVersion, targets } = config
    const packagePath = projectId.replace(/\./g, '/')

    if (buildSystem === 'gradle') {
        // Gradle: root files + shared module + platform code
        zip.file('.gitignore', generateGitignore())
        zip.file('gradle.properties', generateGradleProperties(config))
        generateGradleBuild(zip, config)

        // Shared / Common code
        generateSharedCode(zip, config, packagePath)

        // Platform-specific code
        generatePlatformCode(zip, config, packagePath)
    } else {
        // Amper: self-contained — generates its own files, sources, and .gitignore
        generateAmperBuild(zip, config)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${projectName}.zip`)
}

function generateGitignore() {
    return `*.iml
.gradle
/local.properties
/.idea
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
/kotlin-js-store
`
}

function generateGradleProperties(config) {
    const lines = [
        '#Gradle',
        'org.gradle.jvmargs=-Xmx2048M -Dfile.encoding=UTF-8 -Dkotlin.daemon.jvm.options\\="-Xmx2048M"',
        'org.gradle.caching=true',
        '',
        '#Kotlin',
        'kotlin.code.style=official',
        '',
        '#Compose',
        'org.jetbrains.compose.experimental.jscanvas.enabled=true',
        '',
        '#Android',
        'android.useAndroidX=true',
        'android.nonTransitiveRClass=true',
    ]

    if (config.buildSystem === 'gradle') {
        lines.push('', '#MPP', 'kotlin.mpp.androidSourceSetLayoutVersion=2')
    }

    return lines.join('\n') + '\n'
}
