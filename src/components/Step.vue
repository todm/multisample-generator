<script setup lang="ts">
defineProps<{
    step: string;
    name: string;
    disabled?: boolean;
}>();
</script>

<template>
    <div :class="{ disabled }">
        <div class="is-flex is-align-items-center is-gap mt-5">
            <span class="tag mr-3">{{ step }}</span>
            <h6 class="title is-6">{{ name }}</h6>
        </div>
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
