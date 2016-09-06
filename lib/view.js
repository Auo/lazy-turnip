const fs = require('fs')
const path = require('path')
// const Handlebars = require('handlebars')

module.exports = function(viewName) {
	const templatePath = path.join(__dirname, '../views', viewName + '.html')
	const source = fs.readFileSync(templatePath,'utf-8')
	// const template = Handlebars.compile(source)

	this.toHtml = function(data) {
		return source
		//return template(data)
	}
}
