"use strict";

const STORAGE_KEY = "dailyTasks.v1";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const progressText = document.getElementById("progress-text");
const emptyState = document.getElementById("empty-state");
const emptyMessage = document.getElementById("empty-message");
const clearCompletedButton = document.getElementById("clear-completed");
const statusMessage = document.getElementById("status-message");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    statusMessage.textContent = "Tasks could not be saved in this browser.";
    return false;
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask(text) {
  const task = {
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  statusMessage.textContent = `Task added: ${text}`;
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const taskToDelete = tasks.find((task) => task.id === id);

  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();

  if (taskToDelete) {
    statusMessage.textContent = `Task deleted: ${taskToDelete.text}`;
  }
}

function clearCompletedTasks() {
  const completedCount = tasks.filter((task) => task.completed).length;

  if (completedCount === 0) {
    statusMessage.textContent = "There are no completed tasks to clear.";
    return;
  }

  tasks = tasks.filter((task) => !task.completed);

  saveTasks();
  renderTasks();
  statusMessage.textContent = `${completedCount} completed tasks cleared.`;
}

function getVisibleTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - pendingCount;

  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "task-check";
    checkButton.textContent = task.completed ? "✓" : "";
    checkButton.setAttribute(
      "aria-label",
      task.completed ? `Mark ${task.text} as pending` : `Complete ${task.text}`
    );
    checkButton.setAttribute("aria-pressed", String(task.completed));
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkButton, text, deleteButton);
    taskList.appendChild(item);
  });

  taskCount.textContent =
    `${pendingCount} ${pendingCount === 1 ? "task" : "tasks"} left`;

  progressText.textContent =
    `${completedCount} completed out of ${tasks.length} ${
      tasks.length === 1 ? "task" : "tasks"
    }`;

  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyMessage.textContent = "Add your first task and get going.";
  } else if (currentFilter === "pending") {
    emptyMessage.textContent = "No pending tasks. Nice work!";
  } else if (currentFilter === "completed") {
    emptyMessage.textContent = "No completed tasks yet.";
  } else {
    emptyMessage.textContent = "No tasks to show.";
  }

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  clearCompletedButton.disabled = completedCount === 0;
  clearCompletedButton.style.opacity = completedCount === 0 ? "0.5" : "1";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    statusMessage.textContent = "Please enter a task first.";
    taskInput.focus();
    return;
  }

  addTask(text);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

renderTasks();
