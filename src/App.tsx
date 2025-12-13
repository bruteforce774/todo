import { useEffect, useState } from 'react'
import './App.css'

interface Todo {
    userId: number
    id: number
    title: string
    completed: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

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


  const toggleTodo = (id: number) => {
    setTodos((todos) =>
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((todos) => todos.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1>Todos</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {todos.map((todo: Todo) => (
            <li
              key={todo.id}
              className={todo.completed ? "completed" : ""}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              {todo.title}
              <button onClick={() => deleteTodo(todo.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App