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
    <div class="modal fade" :class="{ show: active }">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5">{{ title }}</h1>
                    <button class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.show {
    display: block;
    background-color: #0000009a;
}
</style>
