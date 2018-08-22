const ko = require('knockout')
const {shell} = require('electron')

const HomeViewModel = function(app) {
	var self = this
	var {dialog} = require('electron').remote
	this.isConfigMissing = ko.observable(false)
	this.folderChangeCallback = null
	this.version = ko.observable(require('electron').remote.app.getVersion())

	this.selectFolder = function() {
		const directories = dialog.showOpenDialog({ properties: ['openDirectory'] })

		if(!!directories) {
			app.storage.getConfig(config => {
					config.addonfolder = directories[0]
					app.storage.setConfig(config, () => {
							this.isConfigMissing(false)

							if(this.folderChangeCallback != null && typeof this.folderChangeCallback == 'function') {
								this.folderChangeCallback()
							}
					})
			})
		}
	}

	this.openFolder = function() {
		app.storage.getConfig(config=> {
			shell.openItem(config.addonfolder)
		})
	}

	this.visitProject = function() {
		shell.openExternal('https://github.com/auo/lazy-turnip')
	}

	this.init = function(cb) {
		app.storage.getConfig(config => {
			self.isConfigMissing(app.storage.missingConfig(config))
		})
		this.folderChangeCallback = cb
	}
}

module.exports =  function(app) { return new HomeViewModel(app) }
