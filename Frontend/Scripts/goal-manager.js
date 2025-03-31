import { TaskDataManager } from "./task-viewer.js";

/** @type {HTMLDivElement | null} */
let currentDraggingGoal = null;
/** @type {HTMLDivElement | null} */
let currentDraggingGoal_CLONE = null;
/** @type {[number | undefined, number | undefined]} */
let mouseOffsetDragStart = [];

TaskDataManager.onGoalsRedraw.push(function(){
    document.querySelectorAll('button.task-goal-complete-btn').forEach(function(/**@type {HTMLButtonElement}*/el){
        el.addEventListener('click', function(){
            TaskDataManager.markGoalCompletedOrUncompleted(el.parentElement.parentElement.id, true);
        })
    })
    document.querySelectorAll('button.task-goal-delete-btn').forEach(function(/**@type {HTMLButtonElement}*/el){
        el.addEventListener('click', function(){
            TaskDataManager.removeGoalFromCurrentFullTaskData(el.parentElement.parentElement.id);
        })
    })
    document.querySelectorAll('button.task-goal-uncomplete-btn').forEach(function(/**@type {HTMLButtonElement}*/el){
        el.addEventListener('click', function(){
            TaskDataManager.markGoalCompletedOrUncompleted(el.parentElement.parentElement.id, false);
        })
    })

    ///====================================================================================================
    /// Drag management
    ///====================================================================================================

    document.querySelectorAll('p.task-goal-name').forEach(function(/**@type {HTMLParagraphElement}*/el){
        el.addEventListener('mousedown', function(ev){
            currentDraggingGoal = el.parentElement;
            currentDraggingGoal_CLONE = currentDraggingGoal.cloneNode(true);
            currentDraggingGoal.style.visibility = 'hidden';
            document.body.appendChild(currentDraggingGoal_CLONE)

            const OGclientRect = currentDraggingGoal.getBoundingClientRect();

            currentDraggingGoal_CLONE.style.position = 'absolute';
            currentDraggingGoal_CLONE.style.left = (OGclientRect.left - 40) + 'px';
            currentDraggingGoal_CLONE.style.top = OGclientRect.top + 'px';
            currentDraggingGoal_CLONE.style.width = OGclientRect.width + 'px';
            currentDraggingGoal_CLONE.style.height = OGclientRect.height + 'px';

            currentDraggingGoal_CLONE.style.backgroundColor = '#020013';
            
            currentDraggingGoal_CLONE.style.cursor = 'grabbing';

            mouseOffsetDragStart[0] = ev.offsetX;
            mouseOffsetDragStart[1] = ev.offsetY;

            /** @type {(this: Document, ev: MouseEvent) => any}*/
            let mouseMoveHandler = null;
            document.addEventListener('mousemove', mouseMoveHandler = function(ev_MouseMove){
                let posY = ev_MouseMove.pageY - mouseOffsetDragStart[1];

                let bounded = currentDraggingGoal.parentElement.getBoundingClientRect();

                let topYLimit = bounded.top - 50;
                let bottomYLimit = bounded.bottom - 50;

                function clamp(v, min, max)
                {
                    if(v<min) return min;
                    if(v>max) return max;
                    return v;
                }

                const clampedYPos = clamp(posY, topYLimit, bottomYLimit);

                currentDraggingGoal_CLONE.style.top = `${clampedYPos}px`;

                /**
                 * Changes the order the provided two nodes such that,
                 * @param {ChildNode} nA becomes the top node and
                 * @param {ChildNode} nB becomes the bottom node.
                 */
                function setAdjacentNodesOrder(nA, nB)
                {
                    nA.parentNode.insertBefore(nA, nB);
                }

                if(currentDraggingGoal.previousElementSibling) {
                    const previousSiblingBoundingRect = currentDraggingGoal.previousElementSibling.getBoundingClientRect();

                    if(clampedYPos < previousSiblingBoundingRect.top + 25)
                        setAdjacentNodesOrder(currentDraggingGoal, currentDraggingGoal.previousElementSibling)
                }

                if(currentDraggingGoal.nextElementSibling) {
                    const nextSiblingBoundingRect = currentDraggingGoal.nextElementSibling.getBoundingClientRect();

                    if(clampedYPos > nextSiblingBoundingRect.top)
                        setAdjacentNodesOrder(currentDraggingGoal.nextElementSibling, currentDraggingGoal)
                }
            })

            /** 
             * @param {MouseEvent} ev_MouseUp 
            */
            function finishDragging(ev_MouseUp)
            {
                if(currentDraggingGoal == null) return;

                document.removeEventListener('mousemove', mouseMoveHandler);

                currentDraggingGoal.style.visibility = 'visible';
                currentDraggingGoal_CLONE.remove();
                currentDraggingGoal = null;

                TaskDataManager.changeGoalsOrder(
                    [...document.querySelectorAll('div.task-goal')].map(el => el.id)
                )
            }

            document.addEventListener('mouseup', finishDragging, {once: true});
            window.addEventListener('focusout', finishDragging, {once: true});
            window.addEventListener('focus', finishDragging, {once: true});
        });
    })
})

window.addEventListener('close', function(ev) {
    TaskDataManager.saveGoalsInfo();
});

const newGoalBtn = document.getElementById('task-goals-heading-new-goal-btn');
const saveGoalsBtn = document.getElementById('task-goals-heading-save-btn');

saveGoalsBtn.addEventListener('click', function(){
    TaskDataManager.saveGoalsInfo();
})

/** @type {HTMLDialogElement | null} */
const goalCreationDialog = document.getElementById('create-goal-modal');
/** @type {HTMLInputElement | null} */
const goalNameInput = document.getElementById('create-goal-name-input');
/** @type {HTMLInputElement | null} */
const goalDeadlineInput = document.getElementById('create-goal-deadline-input');
const createGoalBtn = document.getElementById('create-goal-btn');
const cancelModalBtn = document.getElementById('cancel-goal-btn');

newGoalBtn.addEventListener('click', function(){
    if(TaskDataManager.getCurrentFullTaskData() != undefined) {
        goalCreationDialog.showModal();
    }
})

cancelModalBtn.addEventListener('click', function(){
    goalCreationDialog.close();
})

createGoalBtn.addEventListener('click', function(){
    TaskDataManager.addGoalToCurrentFullTaskData(goalNameInput.value, goalDeadlineInput.value);
    goalCreationDialog.close();
})

