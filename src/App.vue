<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="/kotlin.svg" alt="Kotlin" class="logo-icon" />
          <span class="logo-text">Kotlin Multiplatform Wizard</span>
        </div>
        <a
          href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html"
          target="_blank"
          class="docs-link"
        >
          Documentation ↗
        </a>
      </div>
    </header>

    <main class="main">
      <div class="wizard-container">
        <!-- Project Info -->
        <ProjectInfo
          :projectName="projectName"
          :projectId="projectId"
          @update:projectName="onProjectNameChange"
          @update:projectId="onProjectIdChange"
        />

        <!-- Build Configuration (NEW) -->
        <BuildConfig
          v-model:buildSystem="buildSystem"
          v-model:agpVersion="agpVersion"
        />

        <!-- Target Platforms -->
        <TargetPlatforms v-model:targets="targets" />

        <!-- Dependencies -->
        <DependencyPicker
          :dependencies="dependencies"
          @update:dependencies="val => dependencies = val"
        />

        <!-- Download Button -->
        <div class="download-section">
          <button class="download-btn" @click="downloadProject" :disabled="!hasAnyTarget">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            DOWNLOAD
          </button>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <a href="https://klibs.io/" target="_blank" class="klibs-banner">
          Find the KMP libraries you need on <strong>klibs.io</strong>
        </a>
        <div class="footer-links">
          <span>Open-source KMP Wizard clone · <a href="https://github.com/RikoAppDev/KMP-Wizard-Updated" target="_blank">GitHub</a></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProjectInfo from './components/ProjectInfo.vue'
import BuildConfig from './components/BuildConfig.vue'
import TargetPlatforms from './components/TargetPlatforms.vue'
import DependencyPicker from './components/DependencyPicker.vue'
import { generateProject } from './generator/projectGenerator.js'

const projectName = ref('KotlinProject')
const projectId = ref('org.example.project')
const projectIdManuallyEdited = ref(false)

function nameToPackageId(name) {
  return 'org.example.' + name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

watch(projectName, (newName) => {
  if (!projectIdManuallyEdited.value) {
    projectId.value = nameToPackageId(newName)
  }
})

function onProjectIdChange(val) {
  projectIdManuallyEdited.value = true
  projectId.value = val
}

function onProjectNameChange(val) {
  projectName.value = val
}

const buildSystem = ref('gradle')
const agpVersion = ref('9')

const targets = ref({
  android: { enabled: true, composeUI: true },
  ios: { enabled: true, uiFramework: 'compose' },
  desktop: { enabled: false },
  web: { enabled: false },
  server: { enabled: false },
})

const dependencies = ref({})

const hasAnyTarget = computed(() => {
  return Object.values(targets.value).some(t => t.enabled)
})

async function downloadProject() {
  if (!hasAnyTarget.value) return
  await generateProject({
    projectName: projectName.value,
    projectId: projectId.value,
    buildSystem: buildSystem.value,
    agpVersion: agpVersion.value,
    targets: targets.value,
    dependencies: dependencies.value,
  })
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.docs-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.docs-link:hover {
  color: var(--accent-hover);
}

.main {
  flex: 1;
  padding: 40px 24px;
}

.wizard-container {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.download-section {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--accent);
  color: white;
  border: none;
  padding: 14px 48px;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(127, 82, 255, 0.3);
}

.download-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 6px 24px rgba(127, 82, 255, 0.4);
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  padding: 24px;
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.klibs-banner {
  display: inline-block;
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
  transition: all 0.2s;
}

.klibs-banner:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.footer-links {
  color: var(--text-muted);
  font-size: 12px;
}

.footer-links a {
  color: var(--accent-hover);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .logo-text {
    font-size: 14px;
  }
  .main {
    padding: 24px 16px;
  }
}
</style>
