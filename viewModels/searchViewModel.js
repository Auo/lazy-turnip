const ko = require('knockout')
const shell = require('electron').shell

const SearchViewModel = function (app) {
	app.on('search-completed', addons => {
		addons.forEach(add => {
			add.installing = ko.observable(false)
			add.installed = ko.observable(false)
			add.downloads = add.downloads.toLocaleString()

			this.searchResults.push(add)
		})
		this.verifyInstalledAddons()

		self.isSearching(false)
	})

	app.on('installation-completed', data => {
		let matching = this.searchResults().filter(sr => {
			return sr.name == data.name && sr.portal == data.portal
		})

		if (matching == null || matching.length == 0) {
			return
		}
		const index = this.searchResults.indexOf(matching[0])
		this.searchResults()[index].installing(false)
		this.verifyInstalledAddons()
	})

	app.on('delete-completed', data => {
		this.verifyInstalledAddons()
	})

	this.showMoreInfo = function () {
		shell.openExternal(this.link)
	}

	this.findAddonsInCategory = function () {

		if (self.isSearching()) { return; }

		self.isSearching(true);
		self.search('')
		self.searchResults.removeAll()


		const cat = arguments[1].target.textContent;

		self.getAddonsByCategory(cat, addons => {
			addons.forEach(add => {
				add.installing = ko.observable(false)
				add.installed = ko.observable(false)
				self.searchResults.push(add)
			})

			self.isSearching(false)
		})
	}

	this.verifyInstalledAddons = function () {
		this.getInstalledAddons(() => {
			for (let i = 0; i < this.searchResults().length; i++) {
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
	this.isSearching = ko.observable(false)
	this.categoryHolder = []
	this.classes = ko.observableArray([
		'Death Knight',
		'Demon Hunters',
		'Druid',
		'Hunter',
		'Mage',
		'Monk',
		'Paladin',
		'Priest',
		'Rogue',
		'Shaman',
		'Warlock',
		'Warrior'
	])

	this.installAddon = function () {
		var data = this
		data.installing(true)
		app.emit('install-addon', data)
	}

	this.searchPortals = function (data, event) {
		this.searchResults.removeAll()
		self.isSearching(true)
		app.emit('search-for-addon', this.search())
	}

	this.getInstalledAddons = function (cb) {
		app.getManager(manager => {
			if (!manager) { return }
			manager.listAddons(addons => {
				this.installedAddons.removeAll()
				addons.forEach(add => { this.installedAddons.push(add) })
				if (cb != null) {
					cb()
				}
			})
		})
	}

	this.getClassCategories = function (cb) {
		const self = this
		app.getManager(manager => {
			if (!manager) { return }
			const p = manager.portals.availablePortals
			let results = []
			let completedSearches = 0

			for (let i = 0; i < p.length; i++) {
				manager.portals[p[i]].getCategories((err, categories) => {
					completedSearches++

					var classCategory = categories.filter(cat => {
						return cat.name == 'Class & Role Specific' || cat.name == 'Class'
					});

					if (classCategory.length > 0) {
						results = results.concat(classCategory[0].subCategories)
					}

					if (completedSearches == p.length) {
						return cb(results)
					}
				})
			}
		})
	}

	this.getAddonsByCategory = function (name, cb) {
		const self = this;

		app.getManager(manager => {
			let results = []
			let completedSearches = 0
			var categoryMatches = self.categoryHolder.filter(cat => {
				return cat.name.toLowerCase() == name.toLowerCase() || cat.name.toLowerCase() + 's' == name.toLowerCase()
			})

			for (let i = 0; i < categoryMatches.length; i++) {
				manager.portals[categoryMatches[i].portal].getAddonsFromCategory(categoryMatches[i], (err, addons) => {
					completedSearches++

					results = results.concat(addons)
					if (completedSearches == categoryMatches.length) {
						return cb(results.sort((a, b) => { return b.downloads - a.downloads }))
					}
				})
			}
		})
	}

	this.init = function () {
		this.verifyInstalledAddons()


		this.getClassCategories(cats => {
			this.categoryHolder = cats
		});
	}
}

module.exports = function (app) { return new SearchViewModel(app) }
