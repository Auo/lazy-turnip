const ko = require('knockout')
const shell = require('electron').shell


const ListViewModel = function (app) {
	this.installedAddons = ko.observableArray([])
	this.possibleUpdates = ko.observableArray([])
	this.checkingForUpdates = ko.observable(false)
	this.updating = ko.observable(false)
	this.scanning = ko.observable(false)

	app.on('installation-completed', data => {
		this.getInstalledAddons()
	})

	app.on('delete-completed', data => {
		this.getInstalledAddons()
	})

	app.on('update-check-completed', data => {
		this.possibleUpdates.removeAll()
		data.forEach(add => { this.possibleUpdates.push(add) })
		this.checkingForUpdates(false)
	})

	app.on('update-addons-completed', updatedAddons => {
		this.possibleUpdates.removeAll()
		this.getInstalledAddons()
	})

	this.getInstalledAddons = function () {
		app.getManager(manager => {
			if (!manager) { return }
			manager.listAddons(addons => {
				this.installedAddons.removeAll()
				addons.forEach(add => { this.installedAddons.push(add) })
			})
		})
	}

	this.scanAddonFolder = function () {
		this.scanning(true)
		app.getManager(manager => {
			if (!manager) { return }
			manager.scanAddonFolder((err, info) => {
				this.getInstalledAddons()
				this.scanning(false)
			})
		})
	}

	this.removeAddon = function () {
		app.emit('delete-addon', this)
	}

	this.checkForUpdates = function () {
		this.checkingForUpdates(true)
		app.emit('check-for-updates')
	}
	this.showMoreInfo = function () {
		shell.openExternal(this.link)
	}

	this.updateAddons = function () {
		this.updating(true)
		app.emit('update-addons', this.possibleUpdates())
	}

	this.init = function () {
		this.getInstalledAddons()
	}
}

module.exports = function (app) { return new ListViewModel(app) }
