interface TodoFormProps {
  onAddTodo: (title: string) => void;
}

function TodoForm({ onAddTodo }: TodoFormProps) {
  return (
    <form
      action={(formData) => {
        const title = formData.get("title") as string;
        if (!title.trim()) return;
        onAddTodo(title);
      }}
    >
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}

export default TodoForm;
