// ============================================================
// 🔹 REGISTRING SERVICE WORKER
// ============================================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(err => console.log('SW registration failed', err));
}


// ============================================================
// 🔹 BASIC ELEMENTS & INITIAL SETUP
// ============================================================

const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearAllBtn = document.getElementById('clearAllBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const themeLabel = document.getElementById('theme-label');
const filterButtons = document.querySelectorAll('#filter-section button');
const taskDate = document.getElementById('taskDate');
const todayBtn = document.getElementById('todayBtn');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const taskSummary  = document.getElementById('taskSummary');
// const taskTimeValue = document.getElementById('taskTime');
taskDate.valueAsDate = new Date();


// ============================================================
// 🔹 SOUND EFFECTS SETUP
// ============================================================

const sounds = {
  click: new Audio('sounds/click.mp3'),
  add: new Audio('sounds/added.mp3'),
  delete: new Audio('sounds/delete.mp3'),
  complete: new Audio('sounds/complete.mp3'),
  success: new Audio('sounds/success.mp3'),
  switch: new Audio('sounds/switch.mp3')
};

let soundEnabled = true;

function playSound(sound){
  if(!soundEnabled || !sound) return;
  sound.currentTime = 0;
  sound.play();
}


// ============================================================
// 🔹 INITIAL LOAD & EVENT LISTENERS
// ============================================================

window.addEventListener('load', loadTasks);
addBtn.addEventListener('click', addTask);

todayBtn.addEventListener('click', () =>{
  playSound(sounds.click);
  const today = new Date().toISOString().split('T')[0];
  taskDate.value = today;
  loadTasks();
});

taskInput.addEventListener('keypress', function(e){
  if(e.key === 'Enter') addTask();
});

taskDate.addEventListener('change', loadTasks);


// ============================================================
// 🔹 TASK SUMMARY UPDATE
// ============================================================

function updateTaskSummary(){
  const key = getStorageKey();
  const tasks = JSON.parse(localStorage.getItem(key)) || [];
  const totalTasks = tasks.length;
  const totalcompleted = tasks.filter(t => t.completed).length;
  const totalPending = totalTasks - totalcompleted;

  taskSummary.textContent = `Total: ${totalTasks} | Completed: ${totalcompleted} | Pending: ${totalPending}`;
}


// ============================================================
// 🔹 LOCAL STORAGE KEY MANAGEMENT
// ============================================================

function getStorageKey(){
  return `tasks-${taskDate.value}`;
}


// ============================================================
// 🔹 ADD NEW TASK
// ============================================================

function addTask(){
  const taskText = taskInput.value.trim();
  if(!taskText) return alert("Please enter something...");

  const task =  {
    text: taskText,
    completed : false,
  };

  playSound(sounds.add);
  saveTask(task);
  renderTask(task);
  updateTaskSummary();
  taskInput.value = "";
}


// ============================================================
// 🔹 RENDER TASK ELEMENT
// ============================================================

function renderTask(task){
  const btnGroup = document.createElement('div');
  btnGroup.classList.add('btn-group');

  const li = document.createElement('li');
  if(task.completed) li.classList.add('completed');

  const span = document.createElement('span');
  span.textContent = task.text;

  // Task Completion Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.classList.add('task-checkbox');

  checkbox.addEventListener('change', () =>{
    playSound(sounds.click);
    task.completed = checkbox.checked;
    li.classList.toggle('completed', task.completed);
    playSound(sounds.complete);
    updateLocalStorage();
    updateTaskSummary();
    if(checkAllCompleted()){
      playSound(sounds.success);
      celebrate();
    }
  });

  // Edit Task Button
  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => {
    playSound(sounds.click);
    const newText = prompt("Edit your tasks:", task.text);
    if(newText && newText.trim() !== ''){
      task.text = newText.trim();
      span.textContent = task.text;
      updateLocalStorage();
      updateTaskSummary();
    }
  });

  // Delete Task Button
  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑️';
  delBtn.addEventListener('click', () => {
    playSound(sounds.click);
    const confirmDelete = confirm(`Are you sure to delete ${task.text}?`);
    if(confirmDelete){
      playSound(sounds.delete);
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        li.remove();
        removeTask(task.text);
        updateTaskSummary();
      });
    }
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(delBtn);
  li.appendChild(btnGroup);
  taskList.appendChild(li);
}


// ============================================================
// 🔹 SAVE, REMOVE, LOAD TASKS
// ============================================================

function saveTask(task){
  const key = getStorageKey();
  const tasks = JSON.parse(localStorage.getItem(key)) || [];
  tasks.push(task);
  localStorage.setItem(key, JSON.stringify(tasks));
}

function removeTask(taskText){
  const key = getStorageKey();
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(t => t.text.trim() !== taskText.trim());
  localStorage.setItem(key, JSON.stringify(tasks));
}

function loadTasks(){
  const key = getStorageKey();
  const currentDate = new Date(taskDate.value);
  const tasks = JSON.parse(localStorage.getItem(key)) || [];
  tasks.sort((a, b) => a.completed - b.completed);
  taskList.innerHTML = "";
  selectedDateDisplay.textContent = `Tasks for ${currentDate.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`;
  tasks.forEach(renderTask);
  updateTaskSummary();
}


// ============================================================
// 🔹 UPDATE LOCAL STORAGE (AFTER CHANGES)
// ============================================================

function updateLocalStorage(){
  const key = getStorageKey();
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    const span = li.querySelector('span');
    tasks.push({text: span.textContent, completed: li.classList.contains('completed')});
  });
  localStorage.setItem(key, JSON.stringify(tasks));
  updateTaskSummary();
}


// ============================================================
// 🔹 FILTER SECTION (ALL / COMPLETED / PENDING)
// ============================================================

filterButtons.forEach(button =>{
  button.addEventListener('click', () => {
    playSound(sounds.click);
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filterType = button.id.replace('filter-', '');
    applyFilter(filterType);
  });
});

function applyFilter(type){
  const tasks = document.querySelectorAll('#taskList li');
  tasks.forEach(li => {
    const isCompleted = li.classList.contains('completed');
    li.style.display = 
      type === 'all' ? 'flex' :
      type === 'completed' && isCompleted ? 'flex' :
      type === 'pending' && !isCompleted ? 'flex' : 'none';
  });

  localStorage.setItem('activeFilter', type);
}


// ============================================================
// 🔹 CLEAR ALL TASKS
// ============================================================

clearAllBtn.addEventListener('click', () =>{
  playSound(sounds.click);
  const confirmClear = confirm("Are you sure to clear all taks?");
  if(confirmClear){
    playSound(sounds.delete);
    const tasks = document.querySelectorAll('#taskList li');
    tasks.forEach(li => li.classList.add('removing'));

    setTimeout(() => {
      taskList.innerHTML = '';
      localStorage.removeItem('tasks');
      updateTaskSummary(); 
    }, 400);
  }
});


// ============================================================
// 🔹 THEME (DARK / LIGHT MODE TOGGLE)
// ============================================================

if(localStorage.getItem('theme') === 'dark'){
  document.body.classList.add('dark');
  darkModeToggle.checked = true;
  themeLabel.textContent = '🌞';
}

darkModeToggle.addEventListener('change', () =>{
  playSound(sounds.switch);
  if(darkModeToggle.checked){
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeLabel.textContent = '🌞';
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeLabel.textContent = '🌙';
  }
});


// ============================================================
// 🔹 TASK COMPLETION CHECK & CELEBRATION EFFECT
// ============================================================

function checkAllCompleted(){
  const key = getStorageKey();
  const tasks = JSON.parse(localStorage.getItem(key)) || [];
  return tasks.length > 0 && tasks.every(t => t.completed);
}

function celebrate(){
  const confettiCount = 100;
  const colors = ['#FFC107', '#FF5722','#4CAF50', '#03A9F4', '#E91E63'];
  for (let i = 0; i < confettiCount; i++){
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.backgroundColor = colors[Math.floor(Math.random()* colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = 2 + Math.random() *3 + 's';
    confetti.style.opacity = Math.random();
    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}


// ============================================================
// 🔹 LOAD SAVED FILTER ON PAGE LOAD
// ============================================================

window.addEventListener('load', () => {
  const savedFilter = localStorage.getItem('activeFilter') || 'all';
  document.getElementById(`filter-${savedFilter}`).classList.add('active');
  applyFilter(savedFilter);
});


// ============================================================
// 🔸 OLD / UNUSED FUNCTIONS (COMMENTED FOR REFERENCE)
// ============================================================

// function updateTaskCounter (){
//   const count = taskList.querySelectorAll('li').length;
//   document.getElementById('taskCounter').textContent = `Total Tasks: ${count}`;
// }

// taskDate.addEventListener('change', loadTasks);
