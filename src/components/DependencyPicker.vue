<template>
  <div class="section">
    <h2 class="section-title">Dependencies</h2>
    <p class="section-desc">Select popular KMP & Compose Multiplatform libraries to include</p>

    <div class="dep-categories">
      <div v-for="category in categories" :key="category.name" class="dep-category">
        <h3 class="category-name">{{ category.name }}</h3>
        <div class="dep-grid">
          <div
            v-for="lib in category.libs"
            :key="lib.id"
            class="dep-card"
            :class="{ active: selectedDeps[lib.id] }"
            @click="toggle(lib.id)"
          >
            <div class="dep-header">
              <span class="dep-name">{{ lib.name }}</span>
              <div class="dep-check">
                <svg v-if="selectedDeps[lib.id]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div class="dep-desc">{{ lib.description }}</div>
            <div class="dep-version">{{ lib.version }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { LIB_CATEGORIES } from '../generator/libraryDefs.js'

const props = defineProps({
  dependencies: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:dependencies'])

const categories = LIB_CATEGORIES

const selectedDeps = reactive({ ...props.dependencies })

function toggle(id) {
  selectedDeps[id] = !selectedDeps[id]
  emit('update:dependencies', { ...selectedDeps })
}
</script>

<style scoped>
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.dep-category {
  margin-bottom: 20px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.dep-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.dep-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dep-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--text-muted);
}

.dep-card.active {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.dep-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dep-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.dep-check {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dep-card.active .dep-check {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.dep-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.dep-version {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

@media (max-width: 640px) {
  .dep-grid {
    grid-template-columns: 1fr;
  }
}
</style>
