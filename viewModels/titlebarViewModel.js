const ko = require('knockout')
const os = require('os')
const remote = require('electron').remote;

const TitlebarViewModel = function(app) {
  this.showbar = ko.observable(os.platform() === 'win32')

  this.minimize = function() {
    const window = remote.getCurrentWindow()
     window.minimize()
  }

  this.maximize = function() {
    const window = remote.getCurrentWindow()
       if (!window.isMaximized()) {
           window.maximize()
       } else {
           window.unmaximize()
       }
  }

  this.quit = function() {
    const window = remote.getCurrentWindow()
    window.close()
  }



}

module.exports = function(app) { return new TitlebarViewModel(app) }
