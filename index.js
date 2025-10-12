//  Basic Elements

const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

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
  taskInput.value = "";
}

function renderTask(task){
  const li = document.createElement('li');
  if(task.completed) li.classList.add('completed');

  const span = document.createElement('span');
  span.textContent = task.text;

  span.addEventListener('click', () => {
    task.completed = !task.completed;
    li.classList.toggle('completed');
    updateLocalStorage();
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => {
    li.remove();
    removeTask(task.text);
  });

  li.appendChild(span);
  li.appendChild(delBtn);
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
}



function updateLocalStorage(){
  const tasks = [];
  taskList.querySelectorAll('li').forEach( li => {
    const span = li.querySelector('span');
    tasks.push({text : span.textContent, completed: li.classList.contains('completed')});
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}