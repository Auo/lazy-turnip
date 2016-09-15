const ko = require('knockout')
const shell = require('electron').shell

const SearchViewModel = function(app) {

	app.on('search-completed', addons => {
		addons.forEach(add => {
				add.installing = ko.observable(false)
				add.installed = ko.observable(false)

				// add.infoOpen = ko.observable(false)
				// add.infoLoading = ko.observable(false)
				// add.info = ko.observable({})

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

	app.on('delete-completed', data => {
		this.verifyInstalledAddons()
	})

	this.showMoreInfo = function() {
		shell.openExternal(this.link)
	}
	// this.openInfo = function() {
	// 	var data = this
	//
	// 	if(data.infoOpen()) {
	// 		data.infoOpen(false)
	// 		return
	// 	}
	//
	// 	// if(data.info() != null) {
	// 	// 		data.infoOpen(!data.infoOpen())
	// 	// } else {
	// 		data.infoLoading(true)
	// 		self.getAddonInfo(data, (info) => {
	// 				data.infoOpen(!data.infoOpen())
	// 				data.infoLoading(false)
	// 				data.info(info)
	// 				console.log(info)
	// 		})
	// 	// }
	// }

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

	// this.getAddonInfo = function(addon, cb) {
	// 	app.getManager(manager => {
	// 		if(!manager) { return }
	// 		// console.log(addon)
	// 		manager.portals[addon.portal].getAddonInfo(addon, (err, info) => {
	// 			if(err) { console.log(err, ' error getting addon info') }
	// 			return cb(info)
	// 		})
	// 	})
	// }

	this.init = function() {
			this.verifyInstalledAddons()
	}


}

module.exports = function(app) { return new SearchViewModel(app) }
