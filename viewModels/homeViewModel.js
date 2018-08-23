const ko = require('knockout');
const { dialog } = require('electron').remote;
const { shell } = require('electron');

class HomeViewModel {
	constructor(app) {
		this.app = app;
		this.isConfigMissing = ko.observable(false);
		this.folderChangeCallback = null;
		this.version = ko.observable(require('electron').remote.app.getVersion());
	}

	selectFolder() {
		const directories = dialog.showOpenDialog({ properties: ['openDirectory'] });

		if (!!directories)
			this.app.storage.getConfig(config => {
				config.addonfolder = directories[0];
				this.app.storage.setConfig(config, () => {
					this.isConfigMissing(false);
					if (this.folderChangeCallback != null && typeof this.folderChangeCallback == 'function')
						this.folderChangeCallback();
				});
			});
	}

	openFolder() {
		this.app.storage.getConfig(config => shell.openItem(config.addonfolder));
	}

	visitProject() {
		shell.openExternal('https://github.com/auo/lazy-turnip');
	}

	init(cb) {
		this.app.storage.getConfig(config => this.isConfigMissing(this.app.storage.missingConfig(config)));
		this.folderChangeCallback = cb;
	}
}

module.exports = (app) => new HomeViewModel(app);
