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
				// either no previous data or invalid previous data
				const config = { folders: [], selected: -1 };
				this.setConfig(config, () => cb(config));
			} else if (data.addonfolder != undefined) {
				// old format, convert
				const config = { folders: [], selected: 0 };

				if (data.addonfolder != null) {
					config.folders.push({
						path: data.addonfolder,
						addons: data.addons,
						name: 'old' //TODO: fix so old foldername is name of new config.
					});
				}

				this.setConfig(config, () => cb(config));
			} else {
				cb(data);
			}
		});
	}
};
