'use strict';
const electron = require('electron');
const path = require('path');
const os = require('os');
const updater = require('./lib/appUpdater.js');
const app = electron.app;

if (require('electron-squirrel-startup')) return;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();
require('electron-reload')(__dirname);

// prevent window being garbage collected
// eslint-disable-next-line
let mainWindow = null;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		webPreferences: {
            nodeIntegration: true
        },
		width: 857,
		height: 720,
		icon: path.join(__dirname, 'images', 'logo.ico'),
		minWidth: 200,
		minHeight: 150,
		titleBarStyle: 'hidden',
		frame: os.platform() !== 'win32'
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});


const gotAppLock = app.requestSingleInstanceLock();
if (!gotAppLock) {
	app.quit();
} else {

	app.on('second-instance', (event, argv, cwd) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	app.on('ready', () => {
		mainWindow = createMainWindow();
		//We should check if there is a new version available.
		//For now, let's not check since the server isn't running anymore (uncomment this if you want auto-update)
		updater();
	});
}
