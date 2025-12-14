<script setup lang="ts">
    import TodoItem from './TodoItem.vue'
    import type { Todo } from '../types'

    defineProps<{
        todos: Todo[]
    }>()

    const emit = defineEmits<{
    (e: 'toggle-todo', id: number): void
    (e: 'delete-todo', id: number): void
  }>()
</script>

<template>
    <ul>
       <TodoItem 
       v-for="todo in todos"
       :key="todo.id"
       :todo="todo"
       @toggle-todo="emit('toggle-todo', $event)"
       @delete-todo="emit('delete-todo', $event)" 
       />
    </ul>
</template>

<style>
    ul {
    list-style-type: none;
  }
</style>