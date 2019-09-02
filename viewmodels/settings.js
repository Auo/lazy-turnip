const ko = require('knockout');
const { dialog } = require('electron').remote;
const { shell } = require('electron');
const path = require('path');

let self = null;
class SettingsViewModel {
	constructor(app) {
		this.app = app;

		this.folderChangeCallback = null;
		this.version = ko.observable(require('electron').remote.app.getVersion());
		this.folders = ko.observableArray([]);
		this.selectedIndex = ko.observable(-1);

		self = this;
	}

	async activate(config) {
		const ix = self.folders().findIndex(f => f.path == config.path);

		if (await self.app.config.setIndexAsActive(ix))
			self.selectedIndex(ix);

		self.folderChangeCallback();
	}

	async delete(config) {
		await self.app.config.removeLine(config);
		const updConf = await self.app.config.get();

		self.folders(updConf.folders);
		self.selectedIndex(updConf.selected);
	}

	async newConfig() {
		const data = await dialog.showOpenDialog({ properties: ['openDirectory'] });
		if (data.canceled) return;

		const dirPath = data.filePaths[0];
		let name = path.parse(dirPath).base;

		if (dirPath.indexOf('_retail_') > -1) {
			name = 'retail';
		} else if (dirPath.indexOf('_classic_') > -1) {
			name = 'classic';
		}

		await this.app.config.addLine({ name, path: dirPath });

		if (this.selectedIndex() == -1) await this.app.config.setIndexAsActive(0);

		const updConf = await this.app.config.get();
		this.folders(updConf.folders);
		this.selectedIndex(updConf.selected);

		this.folderChangeCallback();
	}

	visitProject() {
		shell.openExternal('https://github.com/auo/lazy-turnip');
	}

	init(cb) {
		if (cb == null || cb == undefined) throw new Error('cb must be a function');

		this.app.config.get().then(data => {
			this.folders(data.folders);
			this.selectedIndex(data.selected);
		});
		this.folderChangeCallback = cb;
	}
}

module.exports = (app) => new SettingsViewModel(app);
