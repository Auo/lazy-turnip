const ko = require('knockout');
const os = require('os');
const remote = require('electron').remote;

class TitlebarViewModel {
	constructor() {
		this.showbar = ko.observable(os.platform() === 'win32');
	}

	minimize() {
		const window = remote.getCurrentWindow();
		window.minimize();
	}

	maximize() {
		const window = remote.getCurrentWindow();
		!window.isMaximized() ? window.maximize() : window.unmaximize();
	}

	quit() {
		const window = remote.getCurrentWindow();
		window.close();
	}
}

module.exports = (app) => new TitlebarViewModel(app);
