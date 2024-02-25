<script setup lang="ts">
defineProps({
    title: { type: String },
    subtitle: { type: String }
});
</script>

<template>
    <div class="box container">
        <div class="media">
            <div class="media-content">
                <p class="title is-4">{{ title }}</p>
                <p class="subtitle is-6">{{ subtitle }}</p>
            </div>
        </div>
        <div class="mt-4">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.box.container {
    max-width: 42rem;
}
</style>
