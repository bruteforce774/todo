const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];

function render() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.textContent = todo;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
      todos.splice(index, 1);
      save();
    };

    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
  render();
}

addBtn.onclick = () => {
  if (input.value.trim() !== "") {
    todos.push(input.value.trim());
    input.value = "";
    save();
  }
};

// Initial render
render();
