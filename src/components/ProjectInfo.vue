<template>
  <section class="section">
    <div class="field-row">
      <div class="field">
        <label class="field-label">Project Name</label>
        <input
          type="text"
          class="field-input"
          :value="projectName"
          @input="$emit('update:projectName', $event.target.value)"
          placeholder="KotlinProject"
        />
      </div>
      <div class="field">
        <label class="field-label">Project ID</label>
        <input
          type="text"
          class="field-input"
          :value="projectId"
          @input="$emit('update:projectId', $event.target.value)"
          placeholder="org.example.project"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  projectName: String,
  projectId: String,
})
defineEmits(['update:projectName', 'update:projectId'])
</script>

<style scoped>
.section {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.field-input:focus {
  border-color: var(--accent);
}

@media (max-width: 640px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
