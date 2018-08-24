const ko = require('knockout');
const shell = require('electron').shell;
let self = null;
class SearchViewModel {
	constructor(app) {
		this.app = app;

		this.search = ko.observable('');
		this.searchResults = ko.observableArray([]);
		this.installedAddons = ko.observableArray([]);

		this.isSearching = ko.observable(false);
		this.categoryHolder = [];
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
		]);

		this.app.on('search-completed', addons => {
			addons.forEach(add => {
				add.installing = ko.observable(false);
				add.installed = ko.observable(false);
				add.downloads = add.downloads.toLocaleString();
				this.searchResults.push(add);
			});

			this.verifyInstalledAddons();
			this.isSearching(false);
		});

		this.app.on('installation-completed', data => {
			const matching = this.searchResults().filter(sr => sr.name == data.name && sr.portal == data.portal);

			if (matching == null || matching.length == 0) return;

			const index = this.searchResults.indexOf(matching[0]);
			this.searchResults()[index].installing(false);
			this.verifyInstalledAddons();
		});
		this.app.on('delete-completed', () => this.verifyInstalledAddons());

		self = this;
	}

	showMoreInfo() {
		shell.openExternal(this.link);
	}

	findAddonsInCategory() {
		if (self.isSearching()) return;

		self.isSearching(true);
		self.search('');
		self.searchResults.removeAll();

		const cat = arguments[1].target.textContent;

		self.getAddonsByCategory(cat, addons => {
			addons.forEach(add => {
				add.installing = ko.observable(false);
				add.installed = ko.observable(false);
				add.downloads = add.downloads.toLocaleString();
				self.searchResults.push(add);
			});

			self.isSearching(false);
		});
	}

	verifyInstalledAddons() {
		this.getInstalledAddons(() => {
			for (let i = 0; i < this.searchResults().length; i++) {
				const sr = this.searchResults()[i];
				const installed = this.installedAddons().filter(ia => ia.name == sr.name && ia.portal == sr.portal);
				this.searchResults()[i].installed(installed.length > 0);
			}
		});
	}


	installAddon() {
		const data = this;
		data.installing(true);
		self.app.emit('install-addon', data);
	}

	searchPortals() {
		self.searchResults.removeAll();
		self.isSearching(true);
		self.app.emit('search-for-addon', self.search());
	}

	getInstalledAddons(cb) {
		this.app.getManager(manager => {
			if (!manager) return;
			manager.listAddons(addons => {
				this.installedAddons.removeAll();
				addons.forEach(add => this.installedAddons.push(add));
				if (cb != null) cb();
			});
		});
	}

	getClassCategories(cb) {
		this.app.getManager(manager => {
			if (!manager) return;
			const p = manager.portals.availablePortals;
			let results = [];
			let completedSearches = 0;

			for (let i = 0; i < p.length; i++)
				manager.portals[p[i]].getCategories((err, categories) => {
					completedSearches++;
					const classCategory = categories.filter(cat =>
						cat.name == 'Class & Role Specific' ||
						cat.name == 'Class');

					if (classCategory.length > 0) results = results.concat(classCategory[0].subCategories);
					if (completedSearches == p.length) return cb(results);
				});
		});
	}

	getAddonsByCategory(name, cb) {
		this.app.getManager(manager => {
			let results = [];
			let completedSearches = 0;
			const categoryMatches = this.categoryHolder.filter(cat =>
				cat.name.toLowerCase() == name.toLowerCase() ||
				cat.name.toLowerCase() + 's' == name.toLowerCase());

			for (let i = 0; i < categoryMatches.length; i++)
				manager.portals[categoryMatches[i].portal].getAddonsFromCategory(categoryMatches[i], (err, addons) => {
					completedSearches++;

					results = results.concat(addons);
					if (completedSearches == categoryMatches.length)
						cb(results.sort((a, b) => b.downloads - a.downloads));
				});
		});
	}

	init() {
		this.verifyInstalledAddons();
		this.getClassCategories(cats => this.categoryHolder = cats);
	}
}

module.exports = (app) => new SearchViewModel(app);
