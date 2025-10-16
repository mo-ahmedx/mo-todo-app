//  Basic Elements

const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearAllBtn = document.getElementById('clearAllBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const themeLabel = document.getElementById('theme-label');


window.addEventListener('load', loadTasks);

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function(e){
  if(e.key === 'Enter') addTask();
});

function addTask(){
  const taskText = taskInput.value.trim();

  if(!taskText) return alert("Please enter something...");

  const task =  {
    text: taskText,
    completed : false
  };
  saveTask(task);
  renderTask(task);
  updatTaskCounter();
  taskInput.value = "";
}

function renderTask(task){

  const btnGroup = document.createElement('div');
  btnGroup.classList.add('btn-group');

  const li = document.createElement('li');
  if(task.completed) li.classList.add('completed');

  const span = document.createElement('span');
  span.textContent = task.text;

  span.addEventListener('click', () => {
    task.completed = !task.completed;
    li.classList.toggle('completed');
    updateLocalStorage();
  });

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => {
    const newText = prompt("Edit your tasks:", task.text);
    if(newText && newText.trim() !== ''){

      task.text = newText.trim();


      span.textContent = task.text;
      updateLocalStorage();
      updatTaskCounter();
    }
    
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑️';
  delBtn.addEventListener('click', () => {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      li.remove();
    removeTask(task.text);
    updatTaskCounter();
    });
    
  });

  li.appendChild(span);
  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(delBtn);
  li.appendChild(btnGroup)
  taskList.appendChild(li);


}

function saveTask(task){
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

}

function removeTask(taskText){
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(t => t.text.trim() !== taskText.trim());
  localStorage.setItem('tasks', JSON.stringify(tasks));

}

function loadTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(renderTask);
  updatTaskCounter();
}



function updateLocalStorage(){
  const tasks = [];
  taskList.querySelectorAll('li').forEach( li => {
    const span = li.querySelector('span');
    tasks.push({text : span.textContent, completed: li.classList.contains('completed')});
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

const filterButtons = document.querySelectorAll('#filter-section button');


filterButtons.forEach(button =>{
  button.addEventListener('click', () => {
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
    type === 'all' ? 'flex':
    type === 'completed' && isCompleted ? 'flex' :
    type === 'pending' && !isCompleted ? 'flex' : 'none';
  });

  localStorage.setItem('activeFilter', type);
}

clearAllBtn.addEventListener('click', () =>{
  const confirmClear = confirm("Are you sure to clear all taks?");
  if(confirmClear){
    const tasks = document.querySelectorAll('#taskList li');
    tasks.forEach(li => li.classList.add('removing'));

    setTimeout(() => {
      taskList.innerHTML = '';
      localStorage.removeItem('tasks');
      updatTaskCounter(); 
    }, 400)
    
    
    
  }
});

if(localStorage.getItem('theme') === 'dark'){
  document.body.classList.add('dark');
  darkModeToggle.checked = true;
  themeLabel.textContent = '🌙 Dark Mode';
}

darkModeToggle.addEventListener('change', () =>{
  if(darkModeToggle.checked){
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeLabel.textContent = '🌙 Dark Mode';
  }else {
    document.body.classList.remove('dark');
  localStorage.setItem('theme', 'light');
  themeLabel.textContent = '🌞 Light Mode';
  }
  
});

function updatTaskCounter (){
  const count = taskList.querySelectorAll('li').length;
  document.getElementById('taskCounter').textContent = `Total Tasks: ${count}`;
}

window.addEventListener('load', () => {
  const savedFilter = localStorage.getItem('activeFilter') || 'all';
  document.getElementById(`filter-${savedFilter}`).classList.add('active');
  applyFilter(savedFilter);
});