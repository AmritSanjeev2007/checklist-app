document.querySelectorAll('span#info-link').forEach(el=>el.addEventListener('click', function(){
    window.electronAPI.formatinfo();
}))