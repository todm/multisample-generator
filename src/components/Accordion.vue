<script setup lang="ts">
import { InjectionKey, Ref, provide, ref } from 'vue';

const selected: any = ref();
provide(selectedItemSymbol, selected);
</script>

<script lang="ts">
export const selectedItemSymbol: InjectionKey<Ref<any>> = Symbol();
</script>

<template>
    <div class="accordion">
        <slot></slot>
    </div>
</template>
