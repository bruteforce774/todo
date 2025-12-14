<script setup lang="ts">
  import { ref } from 'vue';

  const newTitle = ref('')

  const emit = defineEmits<{
    (e: 'add-todo', title: string): void
  }>()

  function addTodo(event: Event) {
    event.preventDefault()
    if (!newTitle.value.trim()) return
    emit('add-todo', newTitle.value)
    newTitle.value = ''
  }
</script>

<template>
  <div>
    <form @submit="addTodo">
      <label for="title">New Todo:</label>
      <input v-model="newTitle" id="title" type="text" required />
      <button type="submit">Add Todo</button>
    </form>
  </div>
</template>

<style>
</style>
