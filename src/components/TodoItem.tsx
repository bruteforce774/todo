import type { Todo } from '../types'

interface TodoItemProps {
    todo: Todo
    onToggleTodo: (id: number) => void
    onDeleteTodo: (id: number) => void
 }

 function TodoItem({ todo, onToggleTodo, onDeleteTodo }: TodoItemProps) {
    return (
        <li className={todo.completed ? 'completed' : ''}>
        </li>
    )  
 }