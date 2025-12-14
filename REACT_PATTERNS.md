# React Patterns Guide (with Vue Comparisons)

A learning reference for understanding React's approach, using the refactored todo app as a concrete example.

---

## Mental Model: The Core Difference

**Vue:** Reactive references that you mutate directly
**React:** Immutable state snapshots that you replace

This single difference explains most of React's "syntactic heaviness."

---

## 1. State Management

### Vue Pattern (App.vue)
```typescript
const todos = ref<Todo[]>([])
const loading = ref(true)
```

- `ref()` creates a reactive container
- Access value with `.value`
- Mutation triggers reactivity: `todos.value = newArray`

### React Pattern
```typescript
const [todos, setTodos] = useState<Todo[]>([]);
const [loading, setLoading] = useState(true);
```

**Key Concepts:**
- `useState` returns `[currentValue, setterFunction]`
- You MUST use the setter - `todos = newArray` won't work
- Naming convention: `[thing, setThing]`

---

## 2. Updating State

### Simple Updates

**Vue:**
```typescript
loading.value = false  // Direct assignment
```

**React:**
```typescript
setLoading(false)  // Must use setter
```

### Array Transformations

**Vue (App.vue):**
```typescript
todos.value = todos.value.map(t =>
  t.id === id ? { ...t, completed: !t.completed } : t
)

todos.value = todos.value.filter(t => t.id !== id)
```

**React:**
```typescript
setTodos((todos) =>
  todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
);

setTodos((todos) => todos.filter((t) => t.id !== id));
```

**Functional Updates Pattern:**
```typescript
setTodos((previousTodos) => {
  // previousTodos is the current state
  // return the new state
  return previousTodos.filter(...)
})
```

Use functional updates when new state depends on previous state.

---

## 3. Lifecycle & Side Effects

### Vue Pattern (App.vue)
```typescript
onMounted(async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
    todos.value = await response.json()
  } catch (error) {
    console.error('Error fetching todos:', error)
  } finally {
    loading.value = false
  }
})
```

Simple: "Run this when component mounts."

### React Pattern
```typescript
useEffect(() => {
  const fetchTodos = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchTodos();
}, []);
```

**Key Concepts:**
- **Dependency Array** - `[]` at the end controls when effect runs
- **Empty array `[]`** - run once on mount (like `onMounted`)
- **With dependencies `[count]`** - run when those values change
- **Can't use async directly** - define async function inside instead

---

## 4. Event Handlers

### Vue Pattern (TodoItem.vue)
```vue
<input @change="emit('toggle-todo', todo.id)">
<button @click="emit('delete-todo', todo.id)">×</button>
```

Child emits events to parent.

### React Pattern (TodoItem.tsx)
```jsx
// Component receives callback props from parent
function TodoItem({ todo, onToggleTodo, onDeleteTodo }) {
  return (
    <>
      <input onChange={() => onToggleTodo(todo.id)} />
      <button onClick={() => onDeleteTodo(todo.id)}>×</button>
    </>
  );
}
```

Child calls callback props passed from parent.

**Arrow function wrapper required** when passing arguments.

**Why?**
```jsx
// DON'T - calls immediately during render!
<button onClick={onDeleteTodo(todo.id)}>

// DO - creates function to call later
<button onClick={() => onDeleteTodo(todo.id)}>
```

**Key Difference:** React has no `emit()`. Instead, parent passes callback functions as props, and child calls them directly.

---

## 5. Conditional Rendering

### Vue Pattern (App.vue)
```vue
<div v-if="loading">Loading...</div>
<TodoList v-else :todos="todos" />
```

Directives - declarative, template-based

### React Pattern
```jsx
{loading ? (
  <div>Loading...</div>
) : (
  <TodoList todos={todos} />
)}
```

JavaScript expressions - use ternary operator inside `{}`

**React Patterns:**
```jsx
// Ternary (if/else)
{loading ? <Spinner /> : <Content />}

// Logical AND (if only)
{error && <ErrorMessage />}
{todos.length > 0 && <TodoList todos={todos} />}
```

---

## 6. List Rendering

### Vue Pattern (TodoList.vue)
```vue
<TodoItem
  v-for="todo in todos"
  :key="todo.id"
  :todo="todo"
  @toggle-todo="emit('toggle-todo', $event)"
  @delete-todo="emit('delete-todo', $event)"
/>
```

Directive: `v-for` iterates, `:key` is attribute. Child events bubble up via `emit`.

### React Pattern (TodoList.tsx)
```jsx
function TodoList({ todos, onToggleTodo, onDeleteTodo }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleTodo={onToggleTodo}
          onDeleteTodo={onDeleteTodo}
        />
      ))}
    </ul>
  );
}
```

JavaScript `.map()` - transforms array to JSX elements. Callback props are passed down to children.

**Key Concepts:**
- `.map()` returns array of JSX - React renders arrays automatically
- `key` is a prop - helps React identify items
- Use `()` for implicit return or `{}` with explicit `return`

---

## 7. Component Props & Events

### Vue Pattern

**Parent (App.vue):**
```vue
<TodoForm @add-todo="addTodo" />
<TodoList
  :todos="todos"
  @toggle-todo="toggleTodo"
  @delete-todo="deleteTodo" />
```

**Child (TodoForm.vue):**
```typescript
const emit = defineEmits<{
  (e: 'add-todo', title: string): void
}>()

// In template, child emits event
emit('add-todo', newTitle.value)
```

Vue: Parent listens with `@event-name`, child emits with `emit('event-name', data)`

### React Pattern

**Parent (App.tsx):**
```tsx
function App() {
  const addTodo = (title: string) => {
    // handle adding todo
  };

  const toggleTodo = (id: number) => {
    // handle toggling
  };

  const deleteTodo = (id: number) => {
    // handle deleting
  };

  return (
    <>
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todos={todos}
        onToggleTodo={toggleTodo}
        onDeleteTodo={deleteTodo}
      />
    </>
  );
}
```

**Child (TodoForm.tsx):**
```tsx
interface Props {
  onAddTodo: (title: string) => void;
}

function TodoForm({ onAddTodo }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAddTodo(text);  // Call the callback prop
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
```

React: Parent passes functions as props, child calls them directly.

**Key Difference:**
- **Vue:** Child emits events (`emit('event-name', data)`), parent listens (`@event-name`)
- **React:** Parent passes callback functions as props, child calls them (`onCallback(data)`)

---

## 8. Two-Way Binding

### Vue Pattern (TodoForm.vue)
```vue
<input v-model="newTitle">
```

One directive handles both value and updates.

### React Pattern
```jsx
const [text, setText] = useState("");

<input
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

Explicit connection - value prop + onChange handler.

**Checkbox:**
```jsx
<input
  type="checkbox"
  checked={todo.completed}
  onChange={(e) => setCompleted(e.target.checked)}  // Note: .checked not .value
/>
```

---

## 9. Component Structure

### Vue Component (TodoItem.vue)
```vue
<script setup lang="ts">
  import type { Todo } from '../types'

  defineProps<{ todo: Todo }>()

  const emit = defineEmits<{
    (e: 'toggle-todo', id: number): void
    (e: 'delete-todo', id: number): void
  }>()
</script>

<template>
  <li :class="{ completed: todo.completed }">
    <input type="checkbox" :checked="todo.completed" @change="emit('toggle-todo', todo.id)" />
    {{ todo.title }}
    <button @click="emit('delete-todo', todo.id)">×</button>
  </li>
</template>

<style>
  .completed { font-weight: bold; }
</style>
```

### React Component
```tsx
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface Props {
  todo: Todo;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

function TodoItem({ todo, onToggleTodo, onDeleteTodo }: Props) {
  return (
    <li className={todo.completed ? "completed" : ""}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleTodo(todo.id)}
      />
      {todo.title}
      <button onClick={() => onDeleteTodo(todo.id)}>×</button>
    </li>
  );
}
```

**CSS in separate file:**
```css
.completed { font-weight: bold; }
```

---

## 10. Rules of Hooks (CRITICAL)

1. **Only call at top level** - not in loops, conditions, or nested functions
2. **Call in same order every render** - React tracks by call order
3. **Only in function components or custom hooks**

```jsx
// BAD
function Component() {
  if (condition) {
    const [state, setState] = useState(0);  // ❌ Conditional hook
  }
}

// GOOD
function Component() {
  const [state, setState] = useState(0);  // ✓ Top level

  useEffect(() => {
    if (condition) {
      // condition inside effect
    }
  }, [condition]);
}
```

---

## Quick Reference: Vue → React

| Task | Vue | React |
|------|-----|-------|
| **State** | `ref(value)` | `useState(value)` |
| **Access state** | `state.value` | `state` |
| **Update state** | `state.value = x` | `setState(x)` |
| **Mount hook** | `onMounted(() => {})` | `useEffect(() => {}, [])` |
| **Conditional** | `v-if / v-else` | `{cond ? <A/> : <B/>}` |
| **Loop** | `v-for="x in list"` | `{list.map(x => ...)}` |
| **Event** | `@click="fn(arg)"` | `onClick={() => fn(arg)}` |
| **Class** | `class` | `className` |
| **Prop** | `:prop` | `prop={value}` |
| **Two-way** | `v-model` | `value + onChange` |
| **Child events** | `emit('event', data)` | `onEvent(data)` (callback prop) |

---

## LocalStorage Integration

### Vue Pattern

```typescript
import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'todos';

// Helper functions
function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
}

// In component
const todos = ref<Todo[]>([]);

// Load on mount
onMounted(() => {
  todos.value = loadTodos();
});

// Save whenever todos change
watch(todos, (newTodos) => {
  saveTodos(newTodos);
}, { deep: true });  // deep: true watches nested changes
```

**Key Points:**
- `watch()` automatically syncs to localStorage on any change
- `deep: true` is crucial for detecting array/object mutations
- Always wrap in try-catch (localStorage can fail or be disabled)

### React Pattern

```typescript
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'todos';

// Helper functions (same as Vue)
function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
}

// In component
function App() {
  // Initialize from localStorage (lazy initialization)
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  // Save whenever todos change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // ... rest of component
}
```

**Key Points:**
- **Lazy initialization** - `useState(() => loadTodos())` only runs once
- Effect with `[todos]` dependency saves on every change
- Always wrap in try-catch

### Important Considerations

1. **Always use try-catch** - localStorage can be disabled, full, or fail
2. **Validate data** - Don't trust what's in localStorage
3. **Handle null** - Key might not exist yet

```typescript
function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];  // Handle null

    const parsed = JSON.parse(stored);

    // Validate it's an array
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    return [];  // Graceful fallback
  }
}
```

---

## Key Takeaways for React

1. **Think in immutable updates** - always return new objects/arrays
2. **Master functional updates** - `setState(prev => newValue)`
3. **Understand useEffect deps** - include everything you reference
4. **Arrow functions for event args** - `onClick={() => fn(arg)}`
5. **Use `.map()` for lists** - returns array of JSX
6. **JSX is JavaScript** - use expressions, not templates
7. **Hooks must be top-level** - same order every render
8. **Props for callbacks** - React uses props where Vue uses emit

The patterns may feel verbose initially, but they make React's behavior explicit and predictable.
