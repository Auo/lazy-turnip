const fs = require('fs');
const path = require('path');

class View {
	constructor(view) {
		this.view = view;
		const templatePath = path.join(__dirname, '../views', view + '.html');
		this.source = fs.readFileSync(templatePath,'utf-8');
	}

	toHtml() {
		return this.source;
	}
}

module.exports = View;