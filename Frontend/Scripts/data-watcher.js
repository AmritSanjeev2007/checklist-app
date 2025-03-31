import {currentTaskData, updateTaskListView} from "./task-display.js";

function watchForFurtherChanges() {
    window.electronAPI.fetchTasksAfterChange().then(function(data){
        const JSONData = JSON.parse(data);

        // Do something with the data
        updateTaskListView(JSONData)

        watchForFurtherChanges();
    }).catch(function(reason){
        console.error(reason);
        watchForFurtherChanges();
    })
}

document.addEventListener('DOMContentLoaded', function(){
    window.electronAPI.fetchTasksInstant().then(function(data){
        const JSONData = JSON.parse(data);

        updateTaskListView(JSONData);
        // Do something with the data

    }).catch(function(reason){
        console.error(reason);
    })

    watchForFurtherChanges();
})