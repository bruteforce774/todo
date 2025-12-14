import type { Todo } from '../types'

interface TodoItemProps {
    todo: Todo
    onToggleTodo: (id: number) => void
    onDeleteTodo: (id: number) => void
 }

 function TodoItem({ todo, onToggleTodo, onDeleteTodo }: TodoItemProps) {
    return (
        <li className={todo.completed ? 'completed' : ''}>
            <input
            type='checkbox'
            checked={todo.completed}
            onChange={() => onToggleTodo(todo.id)}
            />
            { todo.title }
            <button onClick={() => onDeleteTodo(todo.id)}>x</button>
        </li>
    )  
 }

 export default TodoItem