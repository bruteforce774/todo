<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import TodoForm from './components/TodoForm.vue';
  import type { Todo } from './types';

  const todos = ref<Todo[]>([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/')
      todos.value = await response.json() as Todo[]
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      loading.value = false
    }
  })

  function toggleTodo(id: number) {
    todos.value = todos.value.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    )
  }

  function deleteTodo(id: number) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function addTodo(title: string) {
    const length = todos.value.length
    const newTodo: Todo = {
      userId: 1,
      id: length ? (todos.value[length - 1]?.id ?? 0) + 1 : 1,
      title,
      completed: false
    }
    todos.value.push(newTodo)
  }
</script>

<template>
  <h1>Todos</h1>
  <TodoForm @add-todo="addTodo" />
  <div>
    <div v-if="loading">Loading...</div>
    <ul v-else>
      
      <li 
      v-for="todo in todos" 
      :key="todo.id" 
      :class="{ completed: todo.completed }">
        
      <input type="checkbox" 
        :checked="todo.completed" 
        @change="toggleTodo(todo.id)">
        {{ todo.title }}
      
        <button @click="deleteTodo(todo.id)">×</button>
      
      </li>
    </ul>
  </div>
</template>

<style>
  ul {
    list-style-type: none;
  }
  .completed {
    font-weight: bold;
  }
</style>