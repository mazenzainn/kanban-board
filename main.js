const columnsContainer = document.querySelector(".container");

const read = [
  {
    id: 1,
    title: "not started",
  },
  {
    id: 2,
    title: "in progress",
  },
  {
    id: 3,
    title: "completed",
  },
];

const tasks = JSON.parse(localStorage.getItem("tasks")) || {
  "not started": [],
  "in progress": [],
  completed: [],
};

function createParentCard(col) {
  const parentCard = document.createElement("div");
  parentCard.classList.add("parent-card");
  parentCard.setAttribute("id", col.title);
  parentCard.innerHTML = `
    <p class="title">${col.title}</p>
    <div class="add-task">
      <input type="text" placeholder=" + Add" id="${col.title}-task"/>
      <button>+</button>
    </div>
  `;
  parentCard
    .querySelector("button")
    .addEventListener("click", () => addTask(col.title));
  return parentCard;
}

function addTask(title) {
  const input = document.getElementById(`${title}-task`);
  const task = input.value.trim();
  if (task.length > 0) {
    tasks[title].push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    input.value = "";
  }
}

for (const col of read) {
  const parentCard = createParentCard(col);
  columnsContainer.appendChild(parentCard);
}

function addTask(columnId) {
  const taskInput = document.getElementById(`${columnId}-task`);
  const taskName = taskInput.value.trim();
  // Guard Clause
  if (!taskName) {
    return;
  }

  tasks[columnId].push(taskName);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  createTask(taskName, columnId);
  taskInput.value = "";

  window.location.reload();
}

function createTask(taskName, columnId) {
  const task = document.createElement("div");
  task.classList.add("div-task");
  task.draggable = true;
  task.id = taskName;
  task.innerHTML = `
    <input type="text" value="${taskName}" disabled>
    <div class="icon">
      <ion-icon name="create-outline" class="edit"></ion-icon>
      <ion-icon name="close-outline" class="delete"></ion-icon>
    </div>
  `;
  const editIcon = task.querySelector(".edit");
  const deleteIcon = task.querySelector(".delete");
  editIcon.addEventListener("click", () => enableEdit(taskName));
  deleteIcon.addEventListener("click", () => deleteTask(taskName));
  const listTask = document.getElementById(columnId);
  listTask.insertBefore(task, listTask.children[1]);
}
function enableEdit(taskName) {
  const task = document.getElementById(taskName);
  const input = task.querySelector("input[type='text']");
  input.removeAttribute("disabled");
  input.style.border = "1px solid #fff";
  input.style.borderRadius = "0.3rem";
  input.focus();
  const editIcon = task.querySelector(".edit");
  editIcon.setAttribute("onclick", `saveEdit('${taskName}')`);
}

function saveEdit(taskName) {
  const task = document.getElementById(taskName);
  const input = task.querySelector("input[type='text']");
  const newTaskName = input.value;
  const columnId = getTaskColumn(taskName);
  tasks[columnId].push(newTaskName);
  task.setAttribute("id", newTaskName);
  input.setAttribute("disabled", true);
  const editIcon = task.querySelector(".edit");
  editIcon.setAttribute("onclick", `enableEdit('${newTaskName}')`);
  for (const col in tasks) {
    tasks[col] = tasks[col].filter((task) => task !== taskName);
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
  window.location.reload();
}

function getTaskColumn(taskName) {
  for (const column in tasks) {
    if (tasks[column].includes(taskName)) {
      return column;
    }
  }
}
function deleteTask(taskName) {
  const task = document.getElementById(taskName);
  const column = getTaskColumn(taskName);
  tasks[column] = tasks[column].filter((task) => task !== taskName);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  task.remove();
}

// Define constants for the task columns
const notStartedColumn = document.getElementById("not started");
const inProgressColumn = document.getElementById("in progress");
const completedColumn = document.getElementById("completed");

// Function to initialize the app
function initApp() {
  // Create tasks in each column
  tasks["not started"].forEach((taskName) =>
    createTask(taskName, "not started")
  );
  tasks["in progress"].forEach((taskName) =>
    createTask(taskName, "in progress")
  );
  tasks["completed"].forEach((taskName) => createTask(taskName, "completed"));

  // Add event listeners for dragging tasks
  const allColumns = document.querySelectorAll(".parent-card");
  allColumns.forEach((column) => {
    column.addEventListener("dragover", handleDragOver);
    column.addEventListener("dragleave", handleDragLeave);
    column.addEventListener("drop", handleDrop);
  });

  const allTasks = document.querySelectorAll(".div-task");
  allTasks.forEach((task) => {
    task.addEventListener("dragstart", handleDragStart);
    task.addEventListener("dragend", handleDragEnd);
  });
}

// Function to handle drag start event
function handleDragStart(event) {
  event.currentTarget.style.opacity = "0.5";
  drag = event.currentTarget;
}

// Function to handle drag end event
function handleDragEnd(event) {
  event.currentTarget.style.opacity = "1";
  drag = null;
}

// Function to handle drag over event
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
}

// Function to handle drag leave event
function handleDragLeave(event) {
  event.currentTarget.style.background = "none";
}

// Function to handle drop event
function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.insertBefore(drag, event.currentTarget.children[1]);

  // Update the tasks array and local storage
  const taskColumn = getTaskColumn(drag.id);
  tasks[taskColumn] = tasks[taskColumn].filter((task) => task !== drag.id);
  tasks[event.currentTarget.id].push(
    drag.querySelector("input[type='text']").value
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));

  event.currentTarget.style.background = "none";
}

// Call initApp function to start the app
initApp();
