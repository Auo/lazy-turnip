const jsonStorage = require('electron-json-storage');

class Storage {
	get(key) {
		return new Promise(resolve => {
			jsonStorage.get(key, (err, data) => resolve(data));
		});
	}

	set(key, data) {
		return new Promise(resolve => {
			jsonStorage.set(key, data, () => resolve());
		});
	}
}

module.exports = Storage;