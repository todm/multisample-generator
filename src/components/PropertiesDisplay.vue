<script setup lang="ts">
defineProps<{
    options: Record<string, string>;
}>();
</script>

<template>
    <div class="grid">
        <template v-for="[key, val] of Object.entries(options)">
            <b>{{ key }}:</b>
            <span>{{ val }}</span>
        </template>
    </div>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: min-content min-content;
    gap: 0 1rem;
    white-space: nowrap;
}
</style>
