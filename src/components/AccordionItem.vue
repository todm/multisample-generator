<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { modeSymbol, selectedItemSymbol } from './Accordion.vue';

const props = defineProps<{
    header: string;
    val: any;
}>();

const selected = inject(selectedItemSymbol);
const mode = inject(modeSymbol, 'exclusive');

const active = ref(false);

function onClick() {
    if (mode !== 'exclusive') return active.value = !active.value;
    if (!selected) return;
    if (selected.value === props.val) return (selected.value = undefined);
    selected.value = props.val;

}

selected &&
    watch(selected, () => {
        if (mode === 'exclusive') active.value = selected.value === props.val;
    });
</script>

<template>
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button" :class="{ collapsed: !active }" @click="onClick">{{ header }}</button>
        </h2>
        <div class="accordion-collapse" :class="{ collapse: !active }">
            <div class="accordion-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
