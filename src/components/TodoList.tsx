import type { Todo } from "../types";
import TodoItem from "./TodoItem";

type TodoListProps = {
    todos: Todo[]
    onToggleTodo: (id: number) => void
    onDeleteTodo: (id: number) => void
}

function TodoList({ todos, onToggleTodo, onDeleteTodo }: TodoListProps) {
    return (
        <ul>
        { todos.map((todo) => (
            <TodoItem
                key={todo.id}
                todo={todo}
                onToggleTodo={onToggleTodo}
                onDeleteTodo={onDeleteTodo}
            />
        ))}
        </ul>
    )
}

export default TodoList