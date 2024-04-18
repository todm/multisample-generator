<script setup lang="ts">
defineProps({
    title: { type: String },
    subtitle: { type: String }
});
</script>

<template>
    <div class="card container mb-3">
        <slot name="img"></slot>
        <div class="card-body">
            <h5 class="card-title">{{ title }}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">{{ subtitle }}</h6>
            <hr>
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.card {
    max-width: 64rem;
}
</style>
