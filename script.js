document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const progressText = document.getElementById('progressText');
  const progressPercent = document.getElementById('progressPercent');
  const progressFill = document.getElementById('progressFill');

  let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
  let currentFilter = 'all';

  function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    renderTasks();
  }

  function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
          <span class="task-text">${escapeHtml(task.title)}</span>
          <button class="delete-btn" data-id="${task.id}" aria-label="Delete task">&times;</button>
        `;
        taskList.appendChild(li);
      });
    }

    // Update Progress
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} of ${total} completed`;
    progressPercent.textContent = `${pct}%`;
    progressFill.style.width = `${pct}%`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Add task
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    tasks.unshift({
      id: Date.now(),
      title,
      completed: false
    });

    taskInput.value = '';
    saveTasks();
  });

  // Task list click delegations (toggle & delete)
  taskList.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('task-checkbox')) {
      tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveTasks();
    } else if (e.target.classList.contains('delete-btn')) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
    }
  });

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
  });

  // Initial render
  renderTasks();
});
