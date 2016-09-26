const autoUpdater = require('electron').autoUpdater
const app = require('electron').app
const dialog = require('electron').dialog
const os = require('os')

module.exports = function() {
  const platform = os.platform()
  const version = app.getVersion()
  if(platform == 'win32') { app.setAppUserModelId('com.squirrel.auo.turnip') }

  autoUpdater.addListener("update-available", (event) => {
     console.log("A new update is available")
     showInfo('a new update is available')
   })
   autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName, releaseDate, updateURL) => {
     //notify("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`)
     showInfo('update downloaded, it will be installed on quit')
   })
   autoUpdater.addListener("error", (error) => {
     console.log(error, ' test ')
     showInfo(error)
   })
   autoUpdater.addListener("checking-for-update", (event) => {
     console.log("checking-for-update")
     showInfo('checking for updates')
   })
   autoUpdater.addListener("update-not-available", () => {
     console.log("update-not-available")
     showInfo('update-not-available')

   })

  //autoUpdater.setFeedURL(`http://localhost:3000/update/${platform}/${version}`)
	 const path = 'http://update.lazyturnip.com/update/' + platform + '/' + version
	 autoUpdater.setFeedURL(path)
   autoUpdater.checkForUpdates()


   function showInfo(msg) {
     dialog.showMessageBox({
       buttons: [],
       message: msg.toString()
     })
   }
}
