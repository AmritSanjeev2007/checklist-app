import {currentTaskData} from "./task-display.js";
import { renderFormattedString } from "./formatter.js";

/** @type {HTMLDivElement | null} */
let currentSelectedTask = null;

/** @type {undefined | {"task-id": string; "task-name": string; "task-description": string; "task-deadline": string; "task-goals": {"goal-ids":string[];"goal-texts":string[];"goal-deadlines":string[];"goals-completed":boolean[]};}} */
let currentFullTaskData;

export const TaskDataManager = {
    getCurrentFullTaskData: () => currentFullTaskData,

    /**
     * @param {string} goalText
     * @param {string} goalDeadline
     */
    addGoalToCurrentFullTaskData: (goalText, goalDeadline) => {
        currentFullTaskData["task-goals"]["goal-ids"].push(window.electronAPI.getRandomUUID());
        currentFullTaskData["task-goals"]["goal-texts"].push(goalText);
        currentFullTaskData["task-goals"]["goal-deadlines"].push(goalDeadline);
        currentFullTaskData["task-goals"]["goals-completed"].push(false);

        renderTaskData(currentFullTaskData);
    },

    /**@param {string} goalId*/
    removeGoalFromCurrentFullTaskData: (goalId) => {
        const index = currentFullTaskData["task-goals"]["goal-ids"].indexOf(goalId);

        currentFullTaskData["task-goals"]["goal-ids"].splice(index, 1);
        currentFullTaskData["task-goals"]["goal-texts"].splice(index, 1);
        currentFullTaskData["task-goals"]["goal-deadlines"].splice(index, 1);
        currentFullTaskData["task-goals"]["goals-completed"].splice(index, 1);

        renderTaskData(currentFullTaskData);
    },

    /** 
     * @param {string} goalId 
     * @param {boolean | undefined} goalId `true` by default.
    */
    markGoalCompletedOrUncompleted: (goalId, completed=true) => {
        const index = currentFullTaskData["task-goals"]["goal-ids"].indexOf(goalId);
        currentFullTaskData["task-goals"]["goals-completed"][index] = completed;

        renderTaskData(currentFullTaskData);
    },

    saveGoalsInfo: () => {
        if(currentFullTaskData != undefined) { 
            window.electronAPI.saveTaskInfo(currentFullTaskData); 
            console.log('Saved Data')
        }
    },
    
    /**
     * Changes the order of the current goals to the order of the provided `goalIds` array.
     * @param {string[]} goalIds 
     */
    changeGoalsOrder: (goalIds) => {
        let oldGoalsOrder = currentFullTaskData["task-goals"];

        const newGoalIdsOrder = goalIds;
        const newGoalTextsOrder = new Array(goalIds.length).fill().map((v,i) => oldGoalsOrder["goal-texts"][oldGoalsOrder["goal-ids"].indexOf(goalIds[i])])
        const newGoalDeadlinesOrder = new Array(goalIds.length).fill().map((v,i) => oldGoalsOrder["goal-deadlines"][oldGoalsOrder["goal-ids"].indexOf(goalIds[i])])
        const newGoalsCompletedOrder = new Array(goalIds.length).fill().map((v,i) => oldGoalsOrder["goals-completed"][oldGoalsOrder["goal-ids"].indexOf(goalIds[i])])

        currentFullTaskData["task-goals"] = {
            'goal-ids': newGoalIdsOrder,
            'goal-texts': newGoalTextsOrder,
            'goal-deadlines': newGoalDeadlinesOrder,
            'goals-completed': newGoalsCompletedOrder
        }

        // console.log(currentFullTaskData["task-goals"])
    },

    /** @type {(()=>void)[]} */
    onGoalsRedraw: []
}

export function getCurrentSelectedTask()
{
    return currentSelectedTask;
}
/** @param {HTMLDivElement} el */
export function setCurrentSelectedTask(el) {
    currentSelectedTask = el;
}


/**
 * @param {string} taskId A `uuid`
 * @returns {Promise<{"goal-ids":string[];"goal-texts":string[];"goal-deadlines":string[];"goals-completed":boolean[]}>}
 */
function __loadGoals(taskId)
{
    return window.electronAPI.fetchGoals(taskId);
}

export async function getFullTaskDataOfSelectedElement() {
    let index = currentTaskData["task-ids"].indexOf(currentSelectedTask?.id);
    let goalsData = await __loadGoals(currentTaskData["task-ids"][index]);
    
    return currentFullTaskData = {
        "task-id": currentTaskData["task-ids"][index],
        "task-name": currentTaskData["task-names"][index],
        "task-description": currentTaskData["task-descriptions"][index],
        "task-deadline": currentTaskData["task-deadlines"][index],
        "task-goals": JSON.parse(goalsData)
    }
}

const taskView = document.getElementById('task-view');
const taskTitle = document.getElementById('task-title');
const taskDeadline = document.getElementById('task-deadline');
const taskUUID = document.getElementById('task-uuid');
const taskDescription = document.getElementById('task-description');
const taskGoals = document.getElementById('task-goals');
const completedTaskGoals = document.getElementById('completed-task-goals');

function __calculateColorBasedOnDaysLeft(daysLeft) {
    if(daysLeft > 10) return `rgb(0,255,0)`;
    else if(daysLeft > 5) return `rgb(255,255,0)`;
    else if(daysLeft > 1) return `rgb(255,127,0)`;
    else if(daysLeft > 0) return `rgb(255,0,0)`;
    else return `rgb(0,0,0)`;
}

/**
 * @param {{"goal-id":string;"goal-text":string;"goal-deadline":string;"goal-completed":boolean}} goalData 
 */
function __createGoal(goalData)
{
    const goal = document.createElement('div');
    goal.className = 'task-goal';
    goal.id = goalData["goal-id"];
    goalData["goal-completed"] ? completedTaskGoals.appendChild(goal) : taskGoals.appendChild(goal);

    const goalMarker = document.createElement('div');
    goalMarker.className = 'task-goal-marker';
    goalMarker.title = 'Deadline: '+goalData["goal-deadline"].split('T').join(' ');
    goal.appendChild(goalMarker);

    let daysDifference = (new Date(goalData["goal-deadline"]) - new Date())/(1000*60*60*24); // ms -> days
    goalMarker.style.backgroundColor = __calculateColorBasedOnDaysLeft(daysDifference);

    const goalText = document.createElement('p');
    goalText.className = 'task-goal-name';
    goal.appendChild(goalText);
    goalText.textContent = goalData["goal-text"];

    const goalEditables = document.createElement('div');
    goalEditables.className = 'task-goal-editables';
    goal.appendChild(goalEditables);

    const markingBtn = document.createElement('button');
    markingBtn.className = goalData["goal-completed"] ? 'task-goal-uncomplete-btn' : 'task-goal-complete-btn';
    markingBtn.title = goalData["goal-completed"] ? 'Mark Uncomplete' : 'Mark Complete';
    goalEditables.appendChild(markingBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'task-goal-delete-btn';
    clearBtn.title = `Clear Goal`;
    goalEditables.appendChild(clearBtn);
}

function __clearAllGoals()
{
    document.querySelectorAll('div.task-goal').forEach(v=>v.remove());
}

/**
 * @param {{"task-id": string; "task-name": string; "task-description": string; "task-deadline": string; "task-goals": {"goal-ids":string[];"goal-texts":string[];"goal-deadlines":string[];"goals-completed":boolean[]};}} taskdata 
 */
export function renderTaskData(taskdata)
{
    taskTitle.textContent = taskdata["task-name"];
    taskDeadline.textContent = `Deadline: ${taskdata["task-deadline"]}`;
    taskUUID.textContent = taskdata["task-id"];
    taskDescription.innerHTML = renderFormattedString(taskdata["task-description"]);
    taskView.ariaSelected = "true";
    
    __clearAllGoals();

    const goals = taskdata["task-goals"];
    for(let i=0; i<goals["goal-ids"].length; i++){
        const goal = {
            'goal-id': goals["goal-ids"][i],
            'goal-text': goals["goal-texts"][i],
            'goal-deadline': goals['goal-deadlines'][i],
            'goal-completed': goals["goals-completed"][i]
        }
        __createGoal(goal);
    }

    TaskDataManager.onGoalsRedraw.forEach(fn => fn());
}