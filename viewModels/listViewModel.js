const ko = require('knockout')

const ListViewModel = function(app) {
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
			console.log(data, ' addons that can be updated')
		})

		app.on('update-addons-completed', updatedAddons => {
			console.log(updatedAddons, 'updated addons')
			this.possibleUpdates.removeAll()
			this.getInstalledAddons()
		})

		this.getInstalledAddons = function() {
			app.getManager(manager => {
				if(!manager) { return }
				manager.listAddons(addons => {
					this.installedAddons.removeAll()
					addons.forEach(add => { this.installedAddons.push(add) })
				})
			})
		}

		this.scanAddonFolder = function() {
			this.scanning(true)
			app.getManager(manager => {
				if(!manager) { return }
				manager.scanAddonFolder((err, info) => {
					this.getInstalledAddons()
					this.scanning(false)
					console.log(err, ' error scanning')
					console.log(info, ' info from scanning')
				})
			})
		}

		this.removeAddon = function() {
			app.emit('delete-addon', this)
		}

		this.checkForUpdates = function() {
			this.checkingForUpdates(true)
			console.log('start update, check for them.')
			app.emit('check-for-updates')
		}

		this.updateAddons = function() {
			this.updating(true)
			console.log('time to install!')
			app.emit('update-addons', this.possibleUpdates())
		}


		this.init = function() {
				this.getInstalledAddons()
		}

}

module.exports =  function(app) { return new ListViewModel(app) }
