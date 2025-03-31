import { TaskDataManager } from "./task-viewer.js";

const taskOptionsToggleButton = document.getElementById('task-options-dropdown-button');
const taskOptionsContainer = document.getElementById('options-container');

taskOptionsToggleButton.addEventListener('click', function(){
    taskOptionsContainer.ariaExpanded = taskOptionsContainer.ariaExpanded === 'true' ? 'false' : 'true';
    taskOptionsToggleButton.ariaExpanded = taskOptionsContainer.ariaExpanded;
})

const editTaskBtn = document.getElementById('edit-task-btn');
const deleteTaskBtn = document.getElementById('delete-task-btn');

editTaskBtn.addEventListener('click', function(){
    if(TaskDataManager.getCurrentFullTaskData() == undefined) return;
    window.electronAPI.createTaskEditor(TaskDataManager.getCurrentFullTaskData()["task-id"]);
})

deleteTaskBtn.addEventListener('click', function(){
    if(confirm("Are you sure you want to delete the task?") && (TaskDataManager.getCurrentFullTaskData() != undefined)) {
        window.electronAPI.deleteTask(TaskDataManager.getCurrentFullTaskData()["task-id"]);
        window.electronAPI.reload(0);
    }
})