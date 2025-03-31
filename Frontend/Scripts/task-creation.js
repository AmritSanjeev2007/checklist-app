const taskCreatorButton = document.getElementById("create-task-btn");

taskCreatorButton.addEventListener("click", () => {
    window.electronAPI.createTaskCreator();
});