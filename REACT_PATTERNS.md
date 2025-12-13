# React Patterns Guide (with Vue Comparisons)

A pattern reference for understanding React's approach, using this todo app as a concrete example.

---

## Mental Model: The Core Difference

**Vue:** Reactive references that you mutate directly
**React:** Immutable state snapshots that you replace

This single difference explains most of React's "syntactic heaviness."

---

## 1. State Management

### Vue Pattern (src/App.vue:11-12)
```typescript
const todos = ref<Todo[]>([])
const loading = ref(true)
```

- `ref()` creates a reactive container
- Access value with `.value`
- Mutation triggers reactivity: `todos.value = newArray`

### React Pattern (react:src/App.tsx:12-13)
```typescript
const [todos, setTodos] = useState<Todo[]>([]);
const [loading, setLoading] = useState(true);
```

**Critical React Concepts:**

1. **Array destructuring syntax** - `useState` returns `[currentValue, setterFunction]`
2. **You MUST use the setter** - `todos = newArray` won't work, must use `setTodos(newArray)`
3. **State is read-only** - treat `todos` as immutable during render
4. **Naming convention** - `[thing, setThing]` is universal

**Why the setter?** React needs to know when to re-render. Direct mutation bypasses this.

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

### Complex Updates (Array Transformations)

**Vue (src/App.vue:26-28, 32):**
```typescript
todos.value = todos.value.map(t =>
  t.id === id ? { ...t, completed: !t.completed } : t
)

todos.value = todos.value.filter(t => t.id !== id)
```

**React (react:src/App.tsx:31-36, 39-40):**
```typescript
setTodos((todos) =>
  todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
);

setTodos((todos) => todos.filter((t) => t.id !== id));
```

**Key React Pattern: Functional Updates**

```typescript
setTodos((previousTodos) => {
  // previousTodos is the current state
  // return the new state
  return previousTodos.filter(...)
})
```

**When to use functional updates:**
- When new state depends on previous state
- Inside async callbacks or event handlers
- When you need guaranteed latest state

**Why?** State updates may be batched/async. Functional form guarantees you get the latest value.

**Gotcha:**
```typescript
// DON'T - may use stale state
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1); // both use same `count` - only increments by 1!
}

// DO - uses latest state each time
const handleClick = () => {
  setCount(c => c + 1);
  setCount(c => c + 1); // increments by 2
}
```

---

## 3. Lifecycle & Side Effects

### Vue Pattern (src/App.vue:14-23)
```typescript
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
```

Simple: "Run this when component mounts."

### React Pattern (react:src/App.tsx:15-28)
```typescript
useEffect(() => {
  const fetchTodos = async (): Promise<void> => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchTodos();
}, []);
```

**Critical React Concepts:**

1. **Dependency Array** - `[]` at the end
2. **Effect runs after every render by default** - dependencies control this
3. **Empty array `[]`** - run once on mount (like `onMounted`)
4. **With dependencies `[count, user]`** - run when those values change
5. **No array** - runs after every render (usually wrong!)

**Common Pattern: Can't use async directly**
```typescript
// DON'T - useEffect callback can't be async
useEffect(async () => {
  await fetch(...)  // ❌ Error!
}, [])

// DO - define async function inside
useEffect(() => {
  const fetchData = async () => {
    await fetch(...)
  }
  fetchData()
}, [])
```

**Dependency Array Rules:**

```typescript
useEffect(() => {
  // If you use ANY variable from outside the effect,
  // it should be in the dependency array
  console.log(todos)  // `todos` should be in dependencies
}, [todos])  // ✓ Correct

useEffect(() => {
  // Only constant values used, no dependencies needed
  fetch('https://api.example.com')
}, [])  // ✓ Correct
```

**Gotcha:** Missing dependencies causes stale values
```typescript
const [count, setCount] = useState(0)

// BAD - uses stale count
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count)  // always logs 0!
  }, 1000)
  return () => clearInterval(timer)
}, [])  // Missing count dependency

// GOOD
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count)  // logs current count
  }, 1000)
  return () => clearInterval(timer)
}, [count])  // ✓ Includes count
```

---

## 4. Event Handlers

### Vue Pattern (src/App.vue:49, 52)
```vue
<input @change="toggleTodo(todo.id)">
<button @click="deleteTodo(todo.id)">×</button>
```

**Simple:** Call function directly with arguments.

### React Pattern (react:src/App.tsx:58, 61)
```jsx
<input onChange={() => toggleTodo(todo.id)} />
<button onClick={() => deleteTodo(todo.id)}>×</button>
```

**Arrow function wrapper required** when passing arguments.

**Why?** Without the arrow function:
```jsx
// DON'T - calls immediately during render!
<button onClick={deleteTodo(todo.id)}>

// DO - creates function to call later
<button onClick={() => deleteTodo(todo.id)}>
```

**Optimization Pattern:** If no arguments needed, pass function reference directly:
```jsx
// Both work, but second is slightly better (no new function per render)
<button onClick={() => handleClick()}>Click</button>
<button onClick={handleClick}>Click</button>
```

**With Event Object:**
```jsx
// Vue
<input @change="handleChange">
// handleChange receives event automatically

// React - event is first parameter
<input onChange={handleChange} />
// OR with custom args
<input onChange={(e) => handleChange(e, todo.id)} />
```

---

## 5. Conditional Rendering

### Vue Pattern (src/App.vue:39-55)
```vue
<div v-if="loading">Loading...</div>
<ul v-else>
  <!-- content -->
</ul>
```

**Directives** - declarative, template-based

### React Pattern (react:src/App.tsx:46-64)
```jsx
{loading ? (
  <div>Loading...</div>
) : (
  <ul>
    {/* content */}
  </ul>
)}
```

**JavaScript expressions** - use ternary operator inside `{}`

**React Conditional Patterns:**

```jsx
// 1. Ternary (if/else)
{loading ? <Spinner /> : <Content />}

// 2. Logical AND (if only, no else)
{error && <ErrorMessage />}
{todos.length > 0 && <TodoList />}

// 3. Nullish coalescing (default value)
{title ?? 'Untitled'}

// 4. Early return (in component body)
if (loading) return <Spinner />
return <Content />

// 5. Variable assignment (complex logic)
let content;
if (loading) content = <Spinner />;
else if (error) content = <Error />;
else content = <TodoList />;
return <div>{content}</div>
```

**Gotcha:** Falsy values render
```jsx
// BAD - renders "0" when empty
{todos.length && <TodoList />}  // 0 is falsy but still renders!

// GOOD - explicit boolean
{todos.length > 0 && <TodoList />}
{!!todos.length && <TodoList />}
```

---

## 6. List Rendering

### Vue Pattern (src/App.vue:42-54)
```vue
<li
  v-for="todo in todos"
  :key="todo.id"
  :class="{ completed: todo.completed }">
  {{ todo.title }}
</li>
```

**Directive:** `v-for` iterates, `:key` is attribute

### React Pattern (react:src/App.tsx:50-63)
```jsx
{todos.map((todo: Todo) => (
  <li
    key={todo.id}
    className={todo.completed ? "completed" : ""}
  >
    {todo.title}
  </li>
))}
```

**JavaScript `.map()`** - transforms array to JSX elements

**Key React Concepts:**

1. **`.map()` returns array of JSX** - React renders arrays automatically
2. **`key` is a prop** - helps React identify items (same concept as Vue)
3. **Must return JSX** - use `()` for implicit return or `{}` with explicit `return`

**Common Patterns:**

```jsx
// Implicit return (no curly braces)
{todos.map(todo => (
  <div>{todo.title}</div>
))}

// Explicit return (with curly braces) - needed for multi-line logic
{todos.map(todo => {
  const isImportant = todo.priority > 5;
  return <div className={isImportant ? 'important' : ''}>{todo.title}</div>
})}

// Filter then map
{todos
  .filter(t => !t.completed)
  .map(t => <TodoItem key={t.id} todo={t} />)
}
```

**Gotcha:** Curly braces without return
```jsx
// BAD - nothing renders!
{todos.map(todo => {
  <div>{todo.title}</div>  // ❌ No return statement
})}

// GOOD - implicit return with parentheses
{todos.map(todo => (
  <div>{todo.title}</div>  // ✓
))}

// GOOD - explicit return with braces
{todos.map(todo => {
  return <div>{todo.title}</div>  // ✓
})}
```

---

## 7. Dynamic Classes & Attributes

### Vue Pattern (src/App.vue:45, 48)
```vue
:class="{ completed: todo.completed }"
:checked="todo.completed"
```

**Object syntax** for conditional classes, `:attr` for dynamic attributes

### React Pattern (react:src/App.tsx:53, 57)
```jsx
className={todo.completed ? "completed" : ""}
checked={todo.completed}
```

**JavaScript expressions** - ternary for conditional, direct for boolean

**React Attribute Patterns:**

```jsx
// Conditional class
className={isActive ? "active" : ""}
className={isActive ? "active" : "inactive"}

// Multiple classes
className={`base-class ${isActive ? "active" : ""}`}
className={["base-class", isActive && "active"].filter(Boolean).join(" ")}

// Library approach (classnames package)
className={classNames("base-class", { active: isActive, disabled })}

// Boolean attributes (checked, disabled, etc.)
checked={todo.completed}
disabled={isLoading}

// Dynamic attributes
style={{ color: todo.color, fontSize: "14px" }}
data-id={todo.id}
```

**Important Differences:**

| Vue | React |
|-----|-------|
| `class="..."` | `className="..."` |
| `@click` | `onClick` |
| `@change` | `onChange` |
| `:href` | `href` |
| `v-model` | `value` + `onChange` |

---

## 8. Two-Way Binding

### Vue Pattern
```vue
<input v-model="searchText">
```

**One directive** handles both value and updates.

### React Pattern
```jsx
const [searchText, setSearchText] = useState("");

<input
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
/>
```

**Explicit connection** - value prop + onChange handler

**React Form Patterns:**

```jsx
// Text input
const [name, setName] = useState("");
<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Checkbox
const [checked, setChecked] = useState(false);
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}  // Note: .checked not .value
/>

// Select dropdown
const [selected, setSelected] = useState("");
<select value={selected} onChange={(e) => setSelected(e.target.value)}>
  <option value="a">Option A</option>
</select>

// Controlled vs Uncontrolled
// Controlled (React manages state) ✓ Recommended
<input value={name} onChange={...} />

// Uncontrolled (DOM manages state) - use refs
<input defaultValue="initial" ref={inputRef} />
```

---

## 9. Component Function Structure

### React Component Anatomy (react:src/App.tsx:11-68)

```jsx
function App() {
  // 1. HOOKS (must be at top, in same order every render)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. EFFECTS
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 3. HANDLERS & LOGIC
  const toggleTodo = (id: number) => {
    setTodos((todos) => todos.map(...));
  };

  // 4. EARLY RETURNS (optional)
  if (error) return <ErrorScreen />;

  // 5. RETURN JSX
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Rules of Hooks (CRITICAL):**

1. **Only call at top level** - not in loops, conditions, or nested functions
2. **Call in same order every render** - React tracks by call order
3. **Only in function components or custom hooks**

```jsx
// BAD
function Component() {
  if (condition) {
    const [state, setState] = useState(0);  // ❌ Conditional hook
  }

  for (let i = 0; i < 10; i++) {
    useEffect(() => {});  // ❌ Hook in loop
  }
}

// GOOD
function Component() {
  const [state, setState] = useState(0);  // ✓ Top level

  useEffect(() => {
    if (condition) {
      // condition inside effect, not outside
    }
  }, [condition]);
}
```

---

## 10. Common Gotchas & Patterns

### State Updates Are Async

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count);  // Still 0! State hasn't updated yet
};

// Use functional update to get latest
setCount(prev => {
  console.log(prev);  // Current value
  return prev + 1;
});
```

### Stale Closures

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    // This captures `count` from when effect ran
    setCount(count + 1);  // Will always set to 1
  }, 1000);
  return () => clearInterval(timer);
}, []);  // Empty deps = stale count

// Fix 1: Add count to dependencies
}, [count]);

// Fix 2: Use functional update
setCount(c => c + 1);  // Always uses latest
```

### Event Handler Arrow Functions

```jsx
// Creates new function every render - usually fine
<button onClick={() => handleClick(id)}>

// Better if no args needed
<button onClick={handleClick}>

// For lists, consider callback in child component
{todos.map(todo => (
  <TodoItem
    key={todo.id}
    onToggle={() => toggleTodo(todo.id)}  // New function per item
  />
))}
```

### JSX Gotchas

```jsx
// Must wrap multi-line JSX in parentheses
return (
  <div>...</div>
)

// Can't return multiple elements (use Fragment)
return (
  <>
    <div>First</div>
    <div>Second</div>
  </>
)

// Comments in JSX
{/* This is a comment */}

// JavaScript expressions need curlies
<div>{title}</div>
<div className={classes}</div>

// Not expressions (won't work)
<div>{ if (x) { ... } }</div>  // ❌ if is statement, not expression
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
| **Bind** | `:prop` or `v-bind:prop` | `prop={value}` |
| **Two-way** | `v-model` | `value + onChange` |

---

## Why React Feels Heavier

1. **Explicit over implicit** - `onChange={() => fn(arg)}` vs `@click="fn(arg)"`
2. **JavaScript expressions** - ternaries/map vs directives
3. **Immutable updates** - must use setters, can't mutate
4. **Functional updates** - `setState(prev => ...)` pattern
5. **useEffect dependencies** - must track what values effect uses
6. **More boilerplate** - separate files, arrow functions for events

**The tradeoff:** React's explicitness makes data flow obvious. Once you internalize the patterns, the "heaviness" becomes predictability.

---

## Key Takeaways for React

1. **Think in immutable updates** - always return new objects/arrays
2. **Master functional updates** - `setState(prev => newValue)`
3. **Understand useEffect deps** - include everything you reference
4. **Arrow functions for event args** - `onClick={() => fn(arg)}`
5. **Use `.map()` for lists** - returns array of JSX
6. **JSX is JavaScript** - use expressions, not templates
7. **Hooks must be top-level** - same order every render

The patterns may feel verbose initially, but they make React's behavior explicit and predictable.
