import { useState, useEffect } from "react";
import type { Todo } from "./types";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos?_limit=10"
        );
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      } finally {
        setLoading(false);
      }
    };
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
  }

   const addTodo = (title: string) => {
      const length = todos.length
      const newTodo: Todo = {
        userId: 1,
        id: length ? (todos[length - 1]?.id ?? 0) + 1 : 1,
        title,
        completed: false,
      }
      setTodos((todos) => [...todos, newTodo])
    }

    return (
      <>
        <h1>Todos</h1>
        <TodoForm onAddTodo={addTodo} />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TodoList
            todos={todos}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
          />
        )}
      </>
    )
}

export default App;