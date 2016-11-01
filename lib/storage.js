const jsonStorage = require('electron-json-storage')

module.exports = {
	missingConfig: function(config) {
			return config == undefined || config.addonfolder == null || config.addonfolder == ''
	},
	getConfig: function(cb) {
		this._getConfig(config => {
			return cb(config)
		})
	},
	setConfig: function(config, cb) {
		jsonStorage.set('config', config, err => {
			return cb()
		})
	},
	_getConfig: function(cb) {
		jsonStorage.get('config', (err, data) => {
			if(!data.hasOwnProperty('addonfolder')) {
				const json = { addonfolder:null, addons:[] }
				this.setConfig(json, () => {
					return cb(json)
				})
			} else {
				return cb(data)
			}
		})
	}
}