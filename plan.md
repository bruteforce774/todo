# Todo App Component Planning (MVP)

## App
- **Responsibility:** Holds global state and orchestrates adding, toggling, and deleting todos.
- **State:** `todos[]` (array of objects with `id`, `text`, `completed`).
- **Props:** None (root component).
- **Emits:** None (root doesn’t emit upward).
- **Listens:** User input events (form submit, button clicks, checkbox changes).

---

## TodoForm (optional split)
- **Responsibility:** Collects new todo text and triggers add.
- **State:** Local input value.
- **Props:** None (unless you want to pass placeholder text).
- **Emits:** `addTodo(text)` event.
- **Listens:** Input change, form submit.

---

## TodoList
- **Responsibility:** Displays all todos.
- **State:** None (purely presentational).
- **Props:** `todos[]`.
- **Emits:** None.
- **Listens:** None (delegates to child items).

---

## TodoItem
- **Responsibility:** Displays a single todo with toggle + delete.
- **State:** None (stateless, relies on props).
- **Props:** `todo` object.
- **Emits:** `toggleTodo(id)`, `deleteTodo(id)`.
- **Listens:** Checkbox change, delete button click.

---

## Signature Line
**“Responsibility clear, state contained, props passed, events defined, listeners explicit.”**
