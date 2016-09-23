'use strict';
const electron = require('electron');
const path = require('path')
const os = require('os')
const updater = require('./lib/appUpdater.js')
const app = electron.app;



if(require('electron-squirrel-startup')) return;



// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

require('electron-reload')(__dirname);


// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 857,
		height: 720,
		icon: path.join(__dirname,'images','logo.ico'),
    minWidth:200,
    minHeight:150,
    titleBarStyle: 'hidden',
    frame: os.platform() !== 'win32'
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.on('activate', () => {
// 	if (!mainWindow) {
// 		mainWindow = createMainWindow();
// 	}
// });
//


const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore();
    myWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
}

app.on('ready', () => {
	mainWindow = createMainWindow();

  //We should check if there is a new version available.
	//For now, let's not check
	//updater();

});
