<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  interface Todo {
    userId: number
    id: number
    title: string
    completed: boolean
  }

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
</script>

<template>
  <div>
    <h1>Todos</h1>
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