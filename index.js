const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');

const fs = require('fs');
const { randomUUID } = require('crypto');
// fs.watchFile()

let taskIdOfCurrentlyEditingTask = '';

/** @type {electron.BrowserWindow | null} */
let mainWindow = null;
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
        minWidth: 600,
        minHeight: 400
    })
    mainWindow.setMenu(null)
    mainWindow.setIcon(path.join(__dirname, 'Favicon', 'favicon-256x256.png'))
    mainWindow.resizable = true;
  
    mainWindow.loadFile('Frontend/index.html');

    mainWindow.on('closed', e => app.quit());

    ipcMain.addListener('close', (event, id) => {
        if(!id) mainWindow.close();
    })
    ipcMain.addListener('maximize', (event, id) => {
        if(!id) mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    })
    ipcMain.addListener('minimize', (event, id) => {
        if(!id) mainWindow.minimize();
    })
    ipcMain.addListener('fullscreen', (event, id) => {
        if(!id) mainWindow.setFullScreen(!mainWindow.isFullScreen())
    })
    ipcMain.addListener('devtools', (event, id) => {
        if(!id) mainWindow.webContents.isDevToolsOpened() ? mainWindow.webContents.closeDevTools() : mainWindow.webContents.openDevTools({ mode: 'detach' });
    })
    ipcMain.addListener('reload', (event, id) => {
        if(!id) mainWindow.reload();
    })

    ipcMain.addListener('createTaskCreator', (event) => {
        createTaskCreatorWindow();
    })

    ipcMain.addListener('createTaskEditor', (event, taskId) => {
        taskIdOfCurrentlyEditingTask = taskId;
        createTaskEditorWindow();
    })

    ipcMain.addListener('saveTaskInfo', (event, /**@type {{"task-id": string; "task-name": string; "task-description": string; "task-deadline": string; "task-goals": {"goal-ids":string[];"goal-texts":string[];"goal-deadlines":string[];"goals-completed":boolean[]};}}*/data) => {
        fs.readFile(path.join(__dirname, 'task-data.json'), function(err, tasksdata){
            if (err) throw err;
            
            /** @type {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} */
            const TasksInfo = JSON.parse(tasksdata.toString());

            const taskIndex = TasksInfo['task-ids'].indexOf(data['task-id']);

            TasksInfo['task-names'][taskIndex] = data['task-name'];
            TasksInfo['task-descriptions'][taskIndex] = data['task-description'];
            TasksInfo['task-deadlines'][taskIndex] = data['task-deadline'];

            fs.writeFile(path.join(__dirname, 'task-data.json'), JSON.stringify(TasksInfo), function(err){
                if(err) console.error(err);
            })

            fs.writeFile(path.join(__dirname, 'Goals', data['task-id']+'.json'), JSON.stringify(data['task-goals']), function(err){
                if(err) console.error(err);
            });
        })
    });

    ipcMain.addListener('deleteTask', function(event, taskId) {
        fs.readFile(path.join(__dirname, 'task-data.json'), function(err, data){
            if(err) throw err;

            /** @type {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} */
            const TasksData = JSON.parse(data.toString());

            const taskIndex = TasksData['task-ids'].indexOf(taskId);

            TasksData['task-ids'].splice(taskIndex, 1);
            TasksData['task-names'].splice(taskIndex, 1);
            TasksData['task-descriptions'].splice(taskIndex, 1);
            TasksData['task-deadlines'].splice(taskIndex, 1);

            fs.writeFile(path.join(__dirname, 'task-data.json'), JSON.stringify(TasksData), function(err){
                if(err) console.error(err);
            })

            fs.unlink(path.join(__dirname, 'Goals', taskId+'.json'), function(err){
                if(err) console.error(err);
            });
        })
    });

    ipcMain.handle('fetchGoals', (event, taskId) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'Goals', taskId+'.json'), function(err, data){
                if(err) { reject(err); throw err;}
                resolve(data.toString());
            })
        });
    })
    ipcMain.handle('fetchTasksInstant', (event) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'task-data.json'), function(err, data){
                if(err) { reject(err); throw err;}
                resolve(data.toString());
            })
        });
    })
    ipcMain.handle('fetchTasksAfterChange', (event) => {
        return new Promise((resolve, reject) => {
            let statsTracker = fs.watchFile(path.join(__dirname, 'task-data.json'), function(curr, prev){
                if(curr.mtimeMs - prev.mtimeMs) {
                    fs.readFile(path.join(__dirname, 'task-data.json'), function(err, data) {
                        if(err) {reject(err); throw err;}
                        resolve(data.toString());

                        statsTracker.removeAllListeners();
                    })
                }
            })
        });
    })

    return mainWindow;
}

/** 
 * @param {string} serveFilePath 
*/
const createChildWindow = (serveFilePath) => {
    let childWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
        minWidth: 600,
        minHeight: 600
    })
    childWindow.setMenu(null)
    childWindow.setIcon(path.join(__dirname, 'Favicon', 'favicon-256x256.png'))
    childWindow.resizable = true;
  
    childWindow.loadFile(serveFilePath);

    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let closeListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let maximizeListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let minimizeListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let fullscreenListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let devtoolsListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let reloadListener = null;

    ipcMain.addListener('close', closeListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) childWindow.close();
    })
    ipcMain.addListener('maximize', maximizeListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) {
            if(childWindow.isFullScreen()) {
                childWindow.setFullScreen(false);
                childWindow.maximize();
                return;
            }
            childWindow.isMaximized() ? childWindow.unmaximize() : childWindow.maximize();
        }
    })
    ipcMain.addListener('minimize', minimizeListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) childWindow.minimize();
    })
    ipcMain.addListener('fullscreen', fullscreenListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) childWindow.setFullScreen(!childWindow.isFullScreen())
    })
    ipcMain.addListener('devtools', devtoolsListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) {
            childWindow.webContents.isDevToolsOpened() ? 
            childWindow.webContents.closeDevTools() : 
            childWindow.webContents.openDevTools({ mode: 'detach' });
        }
    })
    ipcMain.addListener('reload', reloadListener = (event, id) => {
        if(childWindow.webContents.getProcessId() == event.processId && id) childWindow.reload();
    })

    childWindow.addListener('close', function(){
        ipcMain.removeListener('close', closeListener)
        ipcMain.removeListener('maximize', maximizeListener)
        ipcMain.removeListener('minimize', minimizeListener)
        ipcMain.removeListener('fullscreen', fullscreenListener)
        ipcMain.removeListener('devtools', devtoolsListener)
        ipcMain.removeListener('reload', reloadListener)
    })

    return childWindow;
}

const createTaskCreatorWindow = () => {
    let taskCreatorWin = createChildWindow('Frontend/task-creator.html');

    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let formatInfoListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let submitTaskIntoListener = null;

    ipcMain.addListener('formatInfo', formatInfoListener = (event) => {
        if(taskCreatorWin.webContents.getProcessId() == event.processId) {
            new BrowserWindow({
                width: 800,
                height: 600
            }).loadFile('format-info.html');
        }
    })

    ipcMain.addListener('submitTaskInfo', submitTaskIntoListener = (ev, data, id) => {
        fs.readFile(path.join(__dirname, 'task-data.json'), (err, taskDataString) => {
            if(err) throw err;

            const JSONTaskData = JSON.parse(taskDataString.toString());

            const taskId = randomUUID().toString();
            JSONTaskData['task-ids'].push(taskId);
            JSONTaskData['task-names'].push(data['task-name']);
            JSONTaskData['task-descriptions'].push(data['task-description']);
            JSONTaskData['task-deadlines'].push(data['task-deadline'])

            fs.writeFile(path.join(__dirname, 'task-data.json'), JSON.stringify(JSONTaskData), function(err){
                if(err) console.error(err);
            });

            const goalsTemplatedInitial = {
                'goal-ids': [],
                'goal-texts': [],
                'goal-deadlines': [],
                'goals-completed': []
            };
            fs.writeFile(path.join(__dirname, 'Goals', taskId+'.json'), JSON.stringify(goalsTemplatedInitial), function(err){
                if(err) console.error(err);
            });
        });

        if(taskCreatorWin.webContents.getProcessId() == ev.processId && id) { 
            // console.table([pid, taskCreatorWinId])
            taskCreatorWin.close();
        }
    });

    taskCreatorWin.addListener('close', function(){
        ipcMain.removeListener('formatInfo', formatInfoListener)
        ipcMain.removeListener('submitTaskInfo', submitTaskIntoListener)
    })
}

const createTaskEditorWindow = () => {
    let taskEditorWin = createChildWindow('Frontend/task-editor.html');

    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let formatInfoListener = null;
    /** @type {((ev: Electron.IpcMainEvent, ...args: any[]) => void) | null} */
    let saveEditedTaskIntoListener = null;

    ipcMain.addListener('formatInfo', formatInfoListener = (event) => {
        if(taskEditorWin.webContents.getProcessId() == event.processId) {
            new BrowserWindow({
                width: 800,
                height: 600
            }).loadFile('format-info.html');
        }
    });

    ipcMain.addListener('saveEditedTaskInfo', saveEditedTaskIntoListener = (ev, /** @type {{"task-id": string; "task-name": string; "task-description": string; "task-deadline": string;}} */ data, id) => {
        fs.readFile(path.join(__dirname, 'task-data.json'), (err, taskDataString) => {
            if(err) throw err;

            /** @type {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} */
            const JSONTaskData = JSON.parse(taskDataString.toString());

            const index = JSONTaskData['task-ids'].indexOf(data['task-id']);
            if(index === -1) return;

            JSONTaskData['task-names'][index] = data['task-name'];
            JSONTaskData['task-descriptions'][index] = data['task-description'];
            JSONTaskData['task-deadlines'][index] = data['task-deadline'];

            fs.writeFile(path.join(__dirname, 'task-data.json'), JSON.stringify(JSONTaskData), function(err){
                if(err) console.error(err);
            });
        });

        if(taskEditorWin.webContents.getProcessId() == ev.processId && id) { 
            // console.table([pid, taskCreatorWinId])
            taskEditorWin.close();
        }
    });

    taskEditorWin.addListener('close', function(){
        ipcMain.removeListener('formatInfo', formatInfoListener)
        ipcMain.removeListener('saveEditedTaskInfo', saveEditedTaskIntoListener)
    })
}

app.whenReady().then(() => {
    createMainWindow()

    ipcMain.handle('getTaskDataOfTaskToEdit', (event) => {
        return new Promise((resolve, reject) => {
            if(taskIdOfCurrentlyEditingTask == '') return resolve(null);

            fs.readFile(path.join(__dirname, 'task-data.json'), function(err, data){
                if(err) throw err;
                
                /** @type {{"task-ids": string[]; "task-names": string[]; "task-descriptions": string[]; "task-deadlines": string[];}} */
                const JSONTaskData = JSON.parse(data.toString());

                const index = JSONTaskData['task-ids'].indexOf(taskIdOfCurrentlyEditingTask);

                resolve({
                    'task-id': taskIdOfCurrentlyEditingTask,
                    'task-name': JSONTaskData['task-names'][index],
                    'task-description': JSONTaskData['task-descriptions'][index],
                    'task-deadline': JSONTaskData['task-deadlines'][index]
                })
            });
        });
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});