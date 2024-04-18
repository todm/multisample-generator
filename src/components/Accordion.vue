<script setup lang="ts">
import { InjectionKey, Ref, provide, ref } from 'vue';

const props = defineProps<{
    mode?: 'exclusive' | 'multi';
}>();

const selected: any = ref();
provide(selectedItemSymbol, selected);
provide(modeSymbol, props.mode || 'multi');
</script>

<script lang="ts">
export const selectedItemSymbol: InjectionKey<Ref<any>> = Symbol();
export const modeSymbol: InjectionKey<'exclusive' | 'multi'> = Symbol();
</script>

<template>
    <div class="accordion">
        <slot></slot>
    </div>
</template>
