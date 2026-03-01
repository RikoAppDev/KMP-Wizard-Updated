<template>
  <section class="section">
    <h3 class="section-title">Build Configuration</h3>

    <div class="config-row">
      <!-- Build System -->
      <div class="config-group">
        <label class="config-label">Build System</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: buildSystem === 'gradle' }"
            @click="$emit('update:buildSystem', 'gradle')"
          >
            <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Gradle
          </button>
          <button
            class="toggle-btn"
            :class="{ active: buildSystem === 'amper' }"
            @click="$emit('update:buildSystem', 'amper')"
          >
            <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Amper
          </button>
        </div>
      </div>

      <!-- AGP Version (only for Gradle) -->
      <div class="config-group" v-if="buildSystem === 'gradle'">
        <label class="config-label">Android Gradle Plugin</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: agpVersion === '9' }"
            @click="$emit('update:agpVersion', '9')"
          >
            AGP 9+
            <span class="badge new">New</span>
          </button>
          <button
            class="toggle-btn"
            :class="{ active: agpVersion === '8' }"
            @click="$emit('update:agpVersion', '8')"
          >
            AGP 8.x
            <span class="badge stable">Stable</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner" v-if="buildSystem === 'amper'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>
        Amper is JetBrains' new build system for Kotlin. It offers a declarative, YAML-based
        configuration — simpler than Gradle for many KMP projects.
        <a href="https://github.com/JetBrains/amper" target="_blank">Learn more ↗</a>
      </span>
    </div>

    <div class="info-banner" v-if="buildSystem === 'gradle' && agpVersion === '9'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>
        AGP 9+ uses the new declarative Android DSL and requires Gradle 8.11+.
        Some plugins may not be compatible yet.
      </span>
    </div>
  </section>
</template>

<script setup>
defineProps({
  buildSystem: String,
  agpVersion: String,
})
defineEmits(['update:buildSystem', 'update:agpVersion'])
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

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.toggle-btn.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--text-primary);
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.stable {
  background: rgba(76, 175, 80, 0.2);
  color: #81c784;
}

.badge.new {
  background: rgba(255, 152, 0, 0.2);
  color: #ffb74d;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--accent-dim);
  border: 1px solid rgba(127, 82, 255, 0.3);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-banner svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--accent);
}

.info-banner a {
  color: var(--accent);
  text-decoration: none;
}

.info-banner a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .config-row {
    grid-template-columns: 1fr;
  }
}
</style>
