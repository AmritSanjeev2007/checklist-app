import { originalTaskInfo } from "./info-get.js";

const submitBtn = document.getElementById('create-task');

/** @type {HTMLInputElement | null} */
const title = document.getElementById('title-input');
/** @type {HTMLTextAreaElement | null} */
const description = document.getElementById('description-input');
/** @type {HTMLInputElement | null} */
const deadline = document.getElementById('deadline');

submitBtn.addEventListener('click', function(){
    if(deadline.value == '' || title.value == '') return alert(`Task ${title.value == '' ? 'title' : 'deadline'} is missing.`);

    if(confirm("Do you want to save the edits to the task?")) {
        const data = {
            "task-id": originalTaskInfo["task-id"],
            "task-name": title.value,
            "task-description": description.value,
            "task-deadline": deadline.value
        };

        window.electronAPI.saveEditedTaskInfo(data, 100);
    } else return;
})