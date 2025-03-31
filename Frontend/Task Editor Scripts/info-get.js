const submitBtn = document.getElementById('create-task');

/** @type {HTMLInputElement | null} */
const title = document.getElementById('title-input');
/** @type {HTMLTextAreaElement | null} */
const description = document.getElementById('description-input');
/** @type {HTMLInputElement | null} */
const deadline = document.getElementById('deadline');

/** @type {null | {"task-id": string; "task-name": string; "task-description": string; "task-deadline": string;}} */
export let originalTaskInfo = null;

document.addEventListener('DOMContentLoaded', function(){
    window.electronAPI.getTaskDataOfTaskToEdit().then(function(data){
        if(data == null) {
            alert("Couldn't load data of task to edit.");
            return window.close();
        }

        console.log(data)

        originalTaskInfo = data;

        title.value = originalTaskInfo["task-name"];
        description.value = originalTaskInfo["task-description"];
        deadline.value = originalTaskInfo["task-deadline"];

    }).catch(function(err){})
})


description.addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
  
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);
  
      // put caret at right position again
      this.selectionStart =
        this.selectionEnd = start + 1;
    }
});