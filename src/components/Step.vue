<script setup lang="ts">
defineProps<{
    step: string;
    name: string;
    disabled?: boolean;
}>();
</script>

<template>
    <div :class="{ disabled }" class="mt-4">
        <h6 class="title is-6">
            <span class="badge text-bg-dark">{{ step }}</span>
            {{ name }}
        </h6>
        <div class="mt-3">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.disabled {
    opacity: 0.25;
    user-select: none;
    pointer-events: none;
}
</style>