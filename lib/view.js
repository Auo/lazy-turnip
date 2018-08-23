const fs = require('fs');
const path = require('path');

module.exports = function(viewName) {
	const templatePath = path.join(__dirname, '../views', viewName + '.html');
	const source = fs.readFileSync(templatePath,'utf-8');
	this.toHtml = () => source;
};
