<script setup lang='ts'>
    import type { Todo } from '../types'

    defineProps<{
        todo: Todo
    }>()

    const emit = defineEmits<{
        (e: 'toggle-todo', id: number): void
        (e: 'delete-todo', id: number): void
    }>()
</script>

<template>
    <li 
      :class='{ completed: todo.completed }'>
        
      <input type='checkbox' 
        :checked='todo.completed' 
        @change="emit('toggle-todo', todo.id)" />
        {{ todo.title }}
      
        <button @click="emit('delete-todo', todo.id)">×</button>
      
      </li>
</template>

<style>
  .completed {
    font-weight: bold;
  }
</style>