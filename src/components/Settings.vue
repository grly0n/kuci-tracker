<template>
  <button class="pl-4 pr-4 rounded-xl hover:bg-slate-400" @click="isOpen = !isOpen">Open</button>
  <div class="bg-slate-500 text-black rounded-xl ml-4 w-1/4 min-w-[500px] h-2/3 min-h-[350px]">
    <div class="flex h-full" x-data="{{ isOpen: false }}">
      <main class="w-full border-black border-4 rounded-xl p-4">
        <h1 class="text-xl font-bold text-center pb-3">Settings</h1>
        <label for="freq-select">Update frequency</label>
        <select name="freq" id="freq-select" v-model="freq" @change="$emit('freqSelect', Number(freq))">
          <option value=10>10 seconds</option>
          <option value=30>30 seconds</option>
          <option value=60>1 minute</option>
          <option value=180>3 minutes</option>
          <option value=300>5 minutes</option>
        </select>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineEmits(['freqSelect'])
  let freq: number = 30;
  let isOpen: Boolean = true;
  
</script>