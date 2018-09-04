
let app = document.getElementById('app');
let oDiv = document.createElement('div');
oDiv.className = 'dialog';
oDiv.innerHTML = `<div style="background: #00a1f5;">对话框</div>`;

Event.on('switch', flag => {
    if (flag) {
        app.appendChild(oDiv);
    } else {
        app.removeChild(oDiv);
    }
});
