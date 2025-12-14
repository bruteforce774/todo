import type { Todo } from '../types'

interface TodoItemProps {
    todo: Todo
    onToggleTodo: (id: number) => void
    onDeleteTodo: (id: number) => void
 }