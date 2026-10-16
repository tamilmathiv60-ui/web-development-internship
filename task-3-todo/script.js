"use strict";

const STORAGE_KEY = "offscript.tasks.v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const emptyTitle = document.getElementById("empty-title");
const emptyMessage = document.getElementById("empty-message");
const statusMessage = document.getElementById("status-message");

const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const progressCaption = document.getElementById("progress-caption");
const listCount = document.getElementById("list-count");
const clearCompletedButton = document.getElementById("clear-completed");
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
    console.error("Unable to load tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Unable to save tasks:", error);
    statusMessage.textContent =
      "Your browser could not save the changes. Check storage settings.";
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
  tasks.unshift({
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now()
  });

  saveTasks();
  renderTasks();
  statusMessage.textContent = `Added task: ${text}`;
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
  const task = tasks.find((item) => item.id === id);
  tasks = tasks.filter((item) => item.id !== id);

  saveTasks();
  renderTasks();

  if (task) {
    statusMessage.textContent = `Deleted task: ${task.text}`;
  }
}

function clearCompletedTasks() {
  const before = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  const removed = before - tasks.length;

  if (removed === 0) {
    statusMessage.textContent = "There are no completed tasks to clear.";
    return;
  }

  saveTasks();
  renderTasks();
  statusMessage.textContent = `Cleared ${removed} completed tasks.`;
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

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "task-check";
  check.textContent = task.completed ? "✓" : "";
  check.setAttribute("aria-pressed", String(task.completed));
  check.setAttribute(
    "aria-label",
    task.completed
      ? `Mark ${task.text} as not completed`
      : `Mark ${task.text} as completed`
  );
  check.addEventListener("click", () => toggleTask(task.id));

  const textWrap = document.createElement("div");
  textWrap.className = "task-text";

  const text = document.createElement("span");
  text.textContent = task.text;
  textWrap.appendChild(text);

  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = task.completed ? "Done and dusted ✓" : "One step at a time";
  textWrap.appendChild(meta);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Delete ${task.text}`);
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(check, textWrap, remove);
  return item;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const pending = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - pending;
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  list.replaceChildren();

  visibleTasks.forEach((task) => {
    list.appendChild(createTaskElement(task));
  });

  pendingCount.textContent = pending;
  completedCount.textContent = completed;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;

  progressCaption.textContent = tasks.length === 0
    ? "Your first step starts here."
    : percentage === 100
      ? "Everything is done. Iconic."
      : `${pending} ${pending === 1 ? "task" : "tasks"} to go. You got this.`;

  listCount.textContent =
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyTitle.textContent = "Your next chapter starts here.";
    emptyMessage.textContent =
      "Add a task above and turn that plan into action.";
  } else if (currentFilter === "pending") {
    emptyTitle.textContent = "Nothing left pending.";
    emptyMessage.textContent = "You're all caught up. Take a little breather.";
  } else if (currentFilter === "completed") {
    emptyTitle.textContent = "Your wins will show up here.";
    emptyMessage.textContent = "Complete a task and give yourself credit.";
  } else {
    emptyTitle.textContent = "All clear.";
    emptyMessage.textContent = "Add another task whenever you're ready.";
  }

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  clearCompletedButton.disabled = completed === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    statusMessage.textContent = "Please enter a task.";
    input.focus();
    return;
  }

  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

const now = new Date();

document.getElementById("today-date").textContent =
  now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).toUpperCase();

document.getElementById("year").textContent = now.getFullYear();

renderTasks();
