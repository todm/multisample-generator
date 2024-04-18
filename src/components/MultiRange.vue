<script setup lang="ts">
import { watch } from 'vue';

defineProps<{
    min: number;
    max: number;
}>();

const v1 = defineModel<number>('v1', { required: true, set: v => +v });
const v2 = defineModel<number>('v2', { required: true, set: v => +v });

watch([v1, v2], () => {
    if (v1.value >= v2.value) v1.value = v2.value;
});
</script>

<template>
    <div class="wrapper">
        <input class="form-range" type="range" v-model="v1" :min="min" :max="max" />
        <input class="form-range" type="range" v-model="v2" :min="min" :max="max" />
    </div>
</template>

<style scoped>
.wrapper {
    min-height: 24px;
    position: relative;
}
input[type='range'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent;
}

input[type='range']:last-child::-webkit-slider-runnable-track {
    background: transparent;
}

input[type='range']::-webkit-slider-thumb {
    pointer-events: all;
}

input[type='range']::-moz-range-thumb {
    pointer-events: all;
}

input[type='range'] {
    position: absolute;
    pointer-events: none;
}
</style>
