# React Forms Guide

A concise guide to the three main approaches for handling forms in React.

---

## The Three Approaches

1. **Controlled Components** - React manages the form state (traditional)
2. **Uncontrolled Components** - DOM manages the state, React reads it when needed
3. **Form Actions** - React 19's new approach using FormData (simplest)

---

## 1. Controlled Components (Traditional React)

**Pattern:** React state controls the input value at all times.

```tsx
import { useState } from 'react';

function TodoForm({ onAddTodo }: { onAddTodo: (title: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddTodo(text);
    setText(''); // Clear after submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

**How it works:**
1. `useState` holds the input value
2. `value={text}` sets the input's value from state
3. `onChange` updates state on every keystroke
4. `onSubmit` reads from state

**Pros:**
- React always knows the current value
- Easy to validate as user types
- Can disable submit button based on input
- Can transform input (e.g., uppercase)

**Cons:**
- More code (state + onChange handler)
- Re-renders on every keystroke
- Verbose for simple forms

**When to use:**
- Need real-time validation
- Need to control/transform input as user types
- Building complex forms with interdependent fields
- Need to enable/disable buttons based on input

---

## 2. Uncontrolled Components (Refs)

**Pattern:** DOM manages the state, React reads it only when needed.

```tsx
import { useRef } from 'react';

function TodoForm({ onAddTodo }: { onAddTodo: (title: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value || '';
    if (!value.trim()) return;
    onAddTodo(value);
    if (inputRef.current) inputRef.current.value = ''; // Clear
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} required />
      <button type="submit">Add</button>
    </form>
  );
}
```

**How it works:**
1. `useRef` creates a reference to the DOM element
2. No `value` prop - input manages its own state
3. Read `inputRef.current.value` when needed (on submit)
4. Directly manipulate DOM to clear: `inputRef.current.value = ''`

**Pros:**
- Less code than controlled
- No re-renders on typing
- Simpler for basic forms
- Closer to plain HTML forms

**Cons:**
- Can't easily validate while typing
- Can't transform input in real-time
- Accessing refs feels less "React-like"
- Mixing controlled and uncontrolled can cause bugs

**When to use:**
- Simple forms that just need final value
- Performance matters (many inputs)
- Integrating with non-React code
- Don't need real-time validation

---

## 3. Form Actions (React 19)

**Pattern:** Pass function to form's `action` prop, receive FormData automatically.

```tsx
function TodoForm({ onAddTodo }: { onAddTodo: (title: string) => void }) {
  return (
    <form action={(formData) => {
      const title = formData.get('title') as string;
      if (!title.trim()) return;
      onAddTodo(title);
    }}>
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

**How it works:**
1. Form's `action` prop receives a function (not a URL)
2. React automatically calls it with `FormData` on submit
3. Use `formData.get('name')` to read values
4. Input needs `name` attribute (not `value`)

**Key differences from controlled:**
- No `useState`
- No `onChange`
- No `e.preventDefault()` needed
- Input has `name`, not `value`

**Pros:**
- Cleanest, least code
- No state management needed
- Works without JavaScript (progressive enhancement)
- Form auto-clears after submit

**Cons:**
- Can't validate while typing (without adding state)
- Can't disable button based on input (without state)
- Newer pattern (React 19+)

**When to use:**
- Simple forms that just submit data
- Want clean, minimal code
- Don't need real-time validation
- Using React 19+

---

## Form Actions with Loading State

If you need to show loading state while submitting:

```tsx
import { useActionState } from 'react';

function TodoForm({ onAddTodo }: { onAddTodo: (title: string) => void }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const title = formData.get('title') as string;
      if (!title.trim()) return { error: 'Title required' };

      await onAddTodo(title); // Can be async
      return { success: true };
    },
    { success: false }
  );

  return (
    <form action={formAction}>
      <input name="title" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Todo'}
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

**`useActionState` returns:**
- `state` - current state/result
- `formAction` - function to pass to form's `action`
- `isPending` - whether action is running

---

## Common Form Patterns

### Text Input

**Controlled:**
```tsx
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
```

**Uncontrolled:**
```tsx
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
// Read: inputRef.current?.value
```

**Form Action:**
```tsx
<input name="username" />
// Read: formData.get('username')
```

---

### Checkbox

**Controlled:**
```tsx
const [checked, setChecked] = useState(false);
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}  // Note: .checked not .value
/>
```

**Uncontrolled:**
```tsx
const checkboxRef = useRef<HTMLInputElement>(null);
<input type="checkbox" ref={checkboxRef} />
// Read: checkboxRef.current?.checked
```

**Form Action:**
```tsx
<input type="checkbox" name="completed" />
// Read: formData.get('completed') === 'on'
```

---

### Select Dropdown

**Controlled:**
```tsx
const [selected, setSelected] = useState('');
<select value={selected} onChange={(e) => setSelected(e.target.value)}>
  <option value="todo">Todo</option>
  <option value="done">Done</option>
</select>
```

**Uncontrolled:**
```tsx
const selectRef = useRef<HTMLSelectElement>(null);
<select ref={selectRef}>
  <option value="todo">Todo</option>
  <option value="done">Done</option>
</select>
// Read: selectRef.current?.value
```

**Form Action:**
```tsx
<select name="status">
  <option value="todo">Todo</option>
  <option value="done">Done</option>
</select>
// Read: formData.get('status')
```

---

## Multiple Inputs in One Form

### Controlled (Complex)
```tsx
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'low'
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

<form onSubmit={handleSubmit}>
  <input name="title" value={formData.title} onChange={handleChange} />
  <input name="description" value={formData.description} onChange={handleChange} />
  <select name="priority" value={formData.priority} onChange={handleChange}>
    <option value="low">Low</option>
    <option value="high">High</option>
  </select>
</form>
```

### Form Action (Simple!)
```tsx
<form action={(formData) => {
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string
  };
  onSubmit(data);
}}>
  <input name="title" required />
  <input name="description" />
  <select name="priority">
    <option value="low">Low</option>
    <option value="high">High</option>
  </select>
  <button type="submit">Submit</button>
</form>
```

**Form Actions shine with multiple inputs!** No state juggling needed.

---

## Quick Decision Guide

```
Do you need real-time validation or transformation as user types?
├─ YES → Use Controlled Components
└─ NO → Continue...

Are you using React 19?
├─ YES → Use Form Actions (simplest)
└─ NO → Continue...

Is it a simple form with just 1-2 inputs?
├─ YES → Use Uncontrolled (with refs)
└─ NO → Use Controlled (easier for complex forms)
```

---

## Common Mistakes

### 1. Mixing Controlled and Uncontrolled

```tsx
// BAD - starts uncontrolled (value undefined), then becomes controlled
const [text, setText] = useState(undefined);
<input value={text} onChange={(e) => setText(e.target.value)} />

// GOOD - always controlled
const [text, setText] = useState('');
<input value={text} onChange={(e) => setText(e.target.value)} />
```

**Rule:** If input has `value` prop, it must ALWAYS have a value (never undefined/null).

### 2. Forgetting preventDefault with onSubmit

```tsx
// BAD - form will submit and reload page
const handleSubmit = (e: React.FormEvent) => {
  onAddTodo(text);
};

// GOOD
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();  // Prevent default form submission
  onAddTodo(text);
};
```

**Note:** Form Actions don't need `preventDefault()` - React handles it.

### 3. Wrong event property for checkboxes

```tsx
// BAD - checkboxes use .checked, not .value
<input type="checkbox" onChange={(e) => setChecked(e.target.value)} />

// GOOD
<input type="checkbox" onChange={(e) => setChecked(e.target.checked)} />
```

### 4. Forgetting 'name' attribute with Form Actions

```tsx
// BAD - formData.get('title') returns null
<input />

// GOOD
<input name="title" />
```

**Rule:** Form Actions require `name` attribute on inputs.

---

## Summary

| Feature | Controlled | Uncontrolled | Form Actions |
|---------|-----------|--------------|--------------|
| **Code amount** | Most | Medium | Least |
| **Real-time validation** | ✓ Easy | ✗ Hard | ✗ Hard* |
| **Transform input** | ✓ Easy | ✗ Hard | ✗ Hard* |
| **Performance** | Re-renders | No re-renders | No re-renders |
| **Learning curve** | Medium | Easy | Easy |
| **React version** | Any | Any | 19+ |
| **Best for** | Complex forms | Simple forms | Simple forms |

*Can add state for real-time features if needed

---

## Your TodoForm Evolution

You've now seen all three approaches for the same form:

**Controlled (Traditional):**
```tsx
function TodoForm({ onAddTodo }) {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTodo(text);
    setText('');
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button>Add</button>
    </form>
  );
}
```

**Uncontrolled:**
```tsx
function TodoForm({ onAddTodo }) {
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTodo(inputRef.current.value);
    inputRef.current.value = '';
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} />
      <button>Add</button>
    </form>
  );
}
```

**Form Actions (React 19):**
```tsx
function TodoForm({ onAddTodo }) {
  return (
    <form action={(formData) => {
      onAddTodo(formData.get('title'));
    }}>
      <input name="title" />
      <button>Add</button>
    </form>
  );
}
```

**All do the same thing - pick the one that fits your needs!**

For learning React, start with **Controlled Components** to understand how React thinks. Once comfortable, **Form Actions** are the modern, simpler choice.
