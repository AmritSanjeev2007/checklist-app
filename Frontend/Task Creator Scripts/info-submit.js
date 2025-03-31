const submitBtn = document.getElementById('create-task');

/** @type {HTMLInputElement | null} */
const title = document.getElementById('title-input');
/** @type {HTMLTextAreaElement | null} */
const description = document.getElementById('description-input');
/** @type {HTMLInputElement | null} */
const deadline = document.getElementById('deadline');

submitBtn.addEventListener('click', function(){
    if(deadline.value == '' || title.value == '') return alert(`Task ${title.value == '' ? 'title' : 'deadline'} is missing.`);

    if(confirm("Do you want to create the task?")) {
        const data = {
            "task-name": title.value,
            "task-description": description.value,
            "task-deadline": deadline.value
        };

        window.electronAPI.submitTaskInfo(data, 100);
    } else return;
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