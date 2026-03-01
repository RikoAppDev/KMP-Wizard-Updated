<template>
  <section class="section">
    <h3 class="section-title">Target Platforms</h3>
    <div class="targets-grid">
      <!-- Android -->
      <div
        class="target-card active locked"
      >
        <div class="target-header">
          <div class="target-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
          </div>
          <div class="target-check">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="target-name">Android</div>
        <div class="target-desc">
          With Compose Multiplatform UI framework based on Jetpack Compose
        </div>
        <div class="target-required">Required</div>
      </div>

      <!-- iOS -->
      <div
        class="target-card active locked"
      >
        <div class="target-header">
          <div class="target-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <div class="target-check">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="target-name">iOS</div>
        <div class="target-options" @click.stop>
          <label class="radio-option" :class="{ selected: targets.ios.uiFramework === 'compose' }">
            <input type="radio" v-model="targets.ios.uiFramework" value="compose" />
            <span class="radio-dot"></span>
            Share UI via Compose Multiplatform
          </label>
          <label class="radio-option" :class="{ selected: targets.ios.uiFramework === 'swiftui' }">
            <input type="radio" v-model="targets.ios.uiFramework" value="swiftui" />
            <span class="radio-dot"></span>
            Do not share UI – Use SwiftUI
          </label>
        </div>
        <div class="target-required">Required</div>
      </div>

      <!-- Desktop -->
      <div
        class="target-card"
        :class="{ active: targets.desktop.enabled }"
        @click="toggleTarget('desktop')"
      >
        <div class="target-header">
          <div class="target-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
            </svg>
          </div>
          <div class="target-check">
            <svg v-if="targets.desktop.enabled" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="target-name">Desktop</div>
        <div class="target-warning" v-if="targets.desktop.enabled">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Experimental — project structure not fully verified
        </div>
      </div>

      <!-- Web -->
      <div
        class="target-card"
        :class="{ active: targets.web.enabled }"
        @click="toggleTarget('web')"
      >
        <div class="target-header">
          <div class="target-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
            </svg>
          </div>
          <div class="target-check">
            <svg v-if="targets.web.enabled" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="target-name">Web</div>
        <div class="target-warning" v-if="targets.web.enabled">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Experimental — project structure not fully verified
        </div>
      </div>

      <!-- Server -->
      <div
        class="target-card"
        :class="{ active: targets.server.enabled }"
        @click="toggleTarget('server')"
      >
        <div class="target-header">
          <div class="target-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <div class="target-check">
            <svg v-if="targets.server.enabled" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="target-name">Server</div>
        <div class="target-warning" v-if="targets.server.enabled">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Experimental — project structure not fully verified
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  targets: Object,
})
const emit = defineEmits(['update:targets'])

function toggleTarget(key) {
  const updated = { ...props.targets }
  updated[key] = { ...updated[key], enabled: !updated[key].enabled }
  emit('update:targets', updated)
}
</script>

<style scoped>
.section {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.target-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.target-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--text-muted);
}

.target-card.active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.target-icon {
  color: var(--text-secondary);
  opacity: 0.7;
}

.target-card.active .target-icon {
  color: var(--accent);
  opacity: 1;
}

.target-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.target-card.active .target-check {
  background: var(--accent);
  color: white;
}

.target-card.locked {
  cursor: default;
  opacity: 0.9;
}

.target-card.locked:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.target-required {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.target-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: #ffb74d;
  line-height: 1.3;
}

.target-warning svg {
  flex-shrink: 0;
  color: #ffb74d;
}

.target-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.target-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 8px;
}

.target-options {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.radio-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.radio-option.selected {
  color: var(--text-primary);
}

.radio-option input {
  display: none;
}

.radio-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border);
  flex-shrink: 0;
  position: relative;
}

.radio-option.selected .radio-dot {
  border-color: var(--accent);
}

.radio-option.selected .radio-dot::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

@media (max-width: 640px) {
  .targets-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
