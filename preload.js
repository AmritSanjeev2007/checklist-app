const { randomUUID } = require('crypto');
const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
    maximize: (id) => ipcRenderer.send('maximize', id), // If id == 0 then MainWindow else TaskCreationWindows
    minimize: (id) => ipcRenderer.send('minimize', id),
    fullscreen: (id) => ipcRenderer.send('fullscreen', id),
    close: (id) => ipcRenderer.send('close', id),
    devtools: (id) => ipcRenderer.send('devtools', id),
    reload: (id) => ipcRenderer.send('reload', id),
    // we can also expose variables, not just functions

    formatinfo: () => {ipcRenderer.send("formatInfo")},
    submitTaskInfo: (data, pid) => {ipcRenderer.send("submitTaskInfo", data, pid)},

    saveTaskInfo: (data) => { ipcRenderer.send('saveTaskInfo', data); },
    saveEditedTaskInfo: (data, pid) => { ipcRenderer.send('saveEditedTaskInfo', data, pid) },

    createTaskCreator: () => ipcRenderer.send('createTaskCreator'),
    createTaskEditor: (taskId) => ipcRenderer.send('createTaskEditor', taskId),

    deleteTask: (taskId) => { ipcRenderer.send('deleteTask', taskId) },

    getRandomUUID: () => randomUUID(), 
    
    getTaskDataOfTaskToEdit: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('getTaskDataOfTaskToEdit').then((resp) => {
                resolve(resp);
            }).catch((err) => {
                reject(err);
            });
        });
    },

    fetchGoals: (taskId) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('fetchGoals', taskId).then((resp) => {
                resolve(resp);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    fetchTasksInstant: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('fetchTasksInstant').then((resp) => {
                resolve(resp);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    fetchTasksAfterChange: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('fetchTasksAfterChange').then((resp) => {
                resolve(resp);
            }).catch((err) => {
                reject(err);
            });
        });
    }
})