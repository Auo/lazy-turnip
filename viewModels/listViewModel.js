const ko = require('knockout');
const shell = require('electron').shell;
let self = null;

class ListViewModel {
	constructor(app) {
		this.app = app;
		this.installedAddons = ko.observableArray([]);
		this.possibleUpdates = ko.observableArray([]);
		this.checkingForUpdates = ko.observable(false);
		this.updating = ko.observable(false);
		this.scanning = ko.observable(false);

		app.on('installation-completed', () => this.getInstalledAddons());

		app.on('delete-completed', () => this.getInstalledAddons());

		app.on('update-check-completed', data => {
			this.possibleUpdates.removeAll();
			data.forEach(add => this.possibleUpdates.push(add));
			this.checkingForUpdates(false);
		});

		app.on('update-addons-completed', () => {
			this.possibleUpdates.removeAll();
			this.getInstalledAddons();
		});

		self = this;
	}

	getInstalledAddons(cb) {
		this.app.getManager(manager => {
			if (!manager) return;
			manager.listAddons(addons => {

				this.installedAddons.removeAll();
				addons.forEach(add => this.installedAddons.push(add));

				if (cb) return cb();
			});
		});
	}

	scanAddonFolder() {
		self.scanning(true);
		self.app.getManager(manager => {
			if (!manager) {
				self.scanning(false);
				return;
			}

			manager.scanAddonFolder(() => self.getInstalledAddons(() => self.scanning(false)));
		});
	}

	removeAddon() {
		self.app.emit('delete-addon', this);
	}

	checkForUpdates() {
		this.checkingForUpdates(true);
		this.app.emit('check-for-updates');
	}

	showMoreInfo() {
		shell.openExternal(this.link);
	}

	updateAddons() {
		this.updating(true);
		this.app.emit('update-addons', this.possibleUpdates());
	}

	init() {
		this.getInstalledAddons();
	}
}

module.exports = (app) => new ListViewModel(app);
