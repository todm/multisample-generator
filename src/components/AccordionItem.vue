<script setup lang="ts">
import { inject } from 'vue';
import { selectedItemSymbol } from './Accordion.vue';

const props = defineProps<{
    header: string;
    val: any;
}>();

const selected = inject(selectedItemSymbol);

function onClick() {
    if (!selected) return;
    if (selected.value === props.val) return (selected.value = undefined);
    selected.value = props.val;
}
</script>

<template>
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button" :class="{ collapsed: selected !== val }" @click="onClick">{{ header }}</button>
        </h2>
        <div class="accordion-collapse" :class="{ collapse: selected !== val }">
            <div class="accordion-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
