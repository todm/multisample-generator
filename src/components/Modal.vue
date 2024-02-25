<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    title: string;
}>();
defineExpose({
    open,
    close,
    getStatus
});

const active = ref(false);

function open() {
    active.value = true;
}

function close() {
    active.value = false;
}

function getStatus() {
    return active.value;
}
</script>

<template>
    <div class="modal" :class="{ 'is-active': active }">
        <div class="modal-background" @click="active = false"></div>
        <div class="modal-card">
            <div class="modal-card-head">
                <p class="modal-card-title">{{ title }}</p>
                <button class="delete" aria-label="close" @click="active = false"></button>
            </div>
            <section class="modal-card-body">
                <slot></slot>
            </section>
            <footer class="modal-card-foot">
                <slot name="footer"></slot>
            </footer>
        </div>
    </div>
</template>
