import {TaskDataManager, setCurrentSelectedTask, getFullTaskDataOfSelectedElement, renderTaskData} from "./task-viewer.js";

const taskListPanel = document.getElementById('tasks');

/** @type {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} */
export let currentTaskData = {};

/**
 * @param {string} id A random uuid
 * @param {string} taskname 
 * @param {string} deadline YYYY-MM-DD
 */
function __createTaskName(id, taskname, deadline) {
    const dings = deadline.split('-').map(s => parseInt(s));
    let deadlineDate = new Date(dings[0], dings[1]-1, dings[2]);
    let currDate = new Date();

    let dt = deadlineDate - currDate;
    let timeInDays = dt/(1000*60*60*24);

    let color;
    if(timeInDays > 10) color = 'rgb(0,255,0)';
    else if(timeInDays > 5) color = `rgb(255,255,0)`;
    else if(timeInDays > 1) color = `rgb(255,127,0)`;
    else if(timeInDays > 0) color = 'rgb(255,0,0)';
    else color = 'black';

    const task = document.createElement('div');
    task.id = id;
    taskListPanel.appendChild(task);
    task.className = 'task';
    task.title = "Time left: " + Math.max(Math.floor(timeInDays),0) + " days";

    const marker = document.createElement('div');
    task.appendChild(marker);
    marker.className = 'marker';
    marker.style.backgroundColor = color;

    const taskName = document.createElement('p');
    task.appendChild(taskName);
    taskName.className = 'task-name';
    taskName.innerHTML = taskname;

    return task;
}

function __clearTaskList() {
    taskListPanel.querySelectorAll('div.task').forEach(el => el.remove());
}

/** @param {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} jsonParsedData */
export function updateTaskListView(jsonParsedData) {
    currentTaskData = jsonParsedData;

    __clearTaskList(); // Clear task list for a new updated one.
    for(let i=0; i<currentTaskData["task-names"].length; i++)
    {
        const task = __createTaskName(currentTaskData["task-ids"][i], currentTaskData["task-names"][i], currentTaskData["task-deadlines"][i])
        task.addEventListener('click', function(){
            TaskDataManager.saveGoalsInfo();
            
            setCurrentSelectedTask(task);

            getFullTaskDataOfSelectedElement().then(function(data){
                renderTaskData(data);
            }).catch(function(err){
                if(err) console.error(err);
            })
        });
    }

    if(TaskDataManager.getCurrentFullTaskData() != undefined) {
        getFullTaskDataOfSelectedElement().then(function(data){
            renderTaskData(data);
        }).catch(function(err){
            if(err) console.error(err);
        })
    }
}