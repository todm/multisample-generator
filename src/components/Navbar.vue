<script setup lang="ts">
import { Piano, Github, HelpCircle } from 'lucide-vue-next';
</script>

<template>
    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <a class="navbar-item" @click="$router.push({ name: 'home' })">
                <Piano />
                <span class="ml-3">Multisample Generator</span>
            </a>
        </div>
        <div class="navbar-end">
            <a class="navbar-item" href="https://github.com/todm/multisample-generator/tree/main/docs">
                <HelpCircle />
            </a>
            <a class="navbar-item" href="https://github.com/todm/multisample-generator">
                <Github />
                <span class="ml-3"> todm/multisample-generator </span>
            </a>
        </div>
    </nav>
</template>
