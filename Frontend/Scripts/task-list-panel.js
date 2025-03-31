const panel = document.getElementById('task-list-panel');
const toggle = document.getElementById('task-list-panel-toggle-btn');

toggle.addEventListener('click', () => {
    panel.ariaExpanded = (panel.ariaExpanded === 'true' ? 'false' : 'true');
});