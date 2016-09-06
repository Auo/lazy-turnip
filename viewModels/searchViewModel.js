const ko = require('knockout')

const SearchViewModel = function(app) {
	app.on('search-completed', addons => {
		addons.forEach(add => {
				add.installing = ko.observable(false)
				add.installed = ko.observable(false)
				this.searchResults.push(add)
			 })
			 this.verifyInstalledAddons()
	})

	app.on('installation-completed', data => {
		let matching = this.searchResults().filter(sr => {
			return sr.name == data.name && sr.portal == data.portal
		})

		if(matching == null || matching.length == 0) {
			return
		}
		const index = this.searchResults.indexOf(matching[0])
		this.searchResults()[index].installing(false)
		this.verifyInstalledAddons()
	})

	this.verifyInstalledAddons = function() {
		this.getInstalledAddons(() => {
			for(let i = 0; i < this.searchResults().length; i++) {
				const sr = this.searchResults()[i]

				let installed = this.installedAddons().filter(ia => {
					return ia.name == sr.name && ia.portal == sr.portal
				})

				this.searchResults()[i].installed(installed.length > 0)
				}
			})
	}

	var self = this
	this.search = ko.observable('')
	this.searchResults = ko.observableArray([])
	this.installedAddons = ko.observableArray([])

	this.installAddon = function() {
		var data = this
		data.installing(true)
		app.emit('install-addon', data)
	}

	this.searchPortals = function(data, event) {
		this.searchResults.removeAll()
		app.emit('search-for-addon', this.search())
	}

	this.getInstalledAddons = function(cb) {
		app.getManager(manager => {
			if(!manager) { return }
			manager.listAddons(addons => {
				this.installedAddons.removeAll()
				addons.forEach(add => { this.installedAddons.push(add) })
				if(cb != null) {
					cb()
				}
			})
		})
	}

	this.init = function() {
			this.verifyInstalledAddons()
	}


}

module.exports = function(app) { return new SearchViewModel(app) }
