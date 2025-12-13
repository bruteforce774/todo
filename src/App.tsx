import { useEffect, useState } from 'react';

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

return (
  <div>
    <h1>Todos</h1>
    {loading ? (
      <div>Loading...</div>
    ) : (
      <ul>
        {todos.map(todo => 
          <li key={todo.id}>{todo.title}</li>
        )}
      </ul>
    )}
  </div>
  )
}

export default App