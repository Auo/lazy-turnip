const Emitter = require('events').EventEmitter;
const util = require('util');
const View = require('./view');
const addon = require('node-wow-addon');
const storage = require('./storage');

class App {
	constructor() {
		this.storage = storage;

		this.on('view-selected', viewName => {
			const view = new View(viewName);
			this.emit('rendered', view.toHtml());
		});

		this.on('delete-addon', addon => {
			this.getManager(manager => {
				manager.deleteAddon(addon.name, err => {
					if (err) console.log(err, ' deletion failed ');
					else this.emit('delete-completed', addon);
				});
			});
		});

		//Events that might be interested for several view-models
		this.on('install-addon', data => {
			this.getManager(manager => {
				manager.portals[data.portal].getAddonInfo(data, (err, info) => {
					manager.installAddon(info, err => {
						if (err) console.log(err, ' installation failed');
						else this.emit('installation-completed', data);
					});
				});
			});
		});

		this.on('check-for-updates', () => {
			this.getManager(manager => {
				const addonsToUpdate = [];

				manager.listAddons(addons => {
					if (addons.length == 0) this.emit('update-check-completed', addonsToUpdate);
					else {
						let addonsChecked = 0;

						for (let i = 0; i < addons.length; i++)
							manager.checkForAddonUpdate(addons[i], (err, versionInfo) => {
								if (versionInfo.newVersionAvailable) addonsToUpdate.push(addons[i]);
								addonsChecked++;
								if (addonsChecked == addons.length) this.emit('update-check-completed', addonsToUpdate);
							});
					}
				});
			});
		});

		this.on('update-addons', (toUpdate) => {
			this.getManager(manager => {
				const addonsToUpdate = [];

				manager.listAddons(addons => {
					if (addons.length == 0) this.emit('update-addons-completed', addonsToUpdate);
					else {
						const toBeInstalled = addons.filter(add => toUpdate.map(tu => tu.name)
							.indexOf(add.name) !== -1);

						if (toBeInstalled.length == 0) {
							this.emit('update-addons-completed');
							return;
						}

						let addonsChecked = 0;

						const getInfoAndInstall = () => manager.portals[toBeInstalled[addonsChecked].portal]
							.getAddonInfo(toBeInstalled[addonsChecked], (err, info) => {
								manager.installAddon(info, (err, versionInfo) => {
									if (versionInfo.newVersionAvailable)
										addonsToUpdate.push(toBeInstalled[addonsChecked]);
									addonsChecked++;

									if (addonsChecked == toBeInstalled.length) this.emit('update-addons-completed');
									else getInfoAndInstall(toBeInstalled[addonsChecked]);
								});
							});

						getInfoAndInstall(toBeInstalled[addonsChecked]);
					}
				});
			});
		});

		this.on('search-for-addon', name => {
			this.getManager(manager => {
				const p = manager.portals.availablePortals;
				let results = [];
				let completedSearches = 0;

				for (let i = 0; i < p.length; i++)
					manager.portals[p[i]].search(name, (err, addons) => {
						completedSearches++;
						if (addons != null) results = results.concat(addons);
						if (completedSearches == p.length)
							this.emit('search-completed', results.sort((a, b) => b.downloads - a.downloads));
					});
			});
		});
	}

	getManager(cb) {
		this.storage.getConfig(config => {
			//this.storage.missingConfig(config) ? cb(null) : cb(addon(config.addonfolder))
			if (this.storage.missingConfig(config)) {
				cb(null);
			} else {
				cb(addon(config.folders[config.selected].path));
			}
		});
	}
}

util.inherits(App, Emitter);
module.exports = new App();
