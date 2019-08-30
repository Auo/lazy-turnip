const jsonStorage = require('electron-json-storage');
const path = require('path');

module.exports = {
	missingConfig: function (config) {
		return config == undefined || config.folders.length == 0;
	},
	getConfig: function (cb) {
		this._getConfig(config => cb(config));
	},
	setConfig: function (config, cb) {
		jsonStorage.set('config', config, () => cb());
	},
	_getConfig: function (cb) {
		jsonStorage.get('config', (err, data) => {

			if (data == null || data == undefined) {
				const config = { folders: [], selected: -1 };
				this.setConfig(config, () => cb(config));
			} else if (data.hasOwnProperty('addonfolder')) {
				// old format, convert
				const config = { folders: [], selected: 0 };

				config.folders.push({
					path: data.addonfolder,
					addons: data.addons,
					name: 'old'
				});

				this.setConfig(config, () => cb(config));
			} else {
				return cb(data);
			}
		});
	}
};
