<img src="https://auo.github.io/images/lazy-turnip/logo.png" alt="logo"/>

# Lazy Turnip
This is a World of Warcraft addon manager that uses Wowinterface and Curse for installing and updating addons.

I'm not in any way affiliated with Blizzard Entertainment, and neither is this program.

## What it can do
Download, Update, Search for addons.
Scan your current addon-folder to create a list of addons, for future updates.


## Why?
I wanted something that could get addons from both Wowinterface and Curse, and I wanted to give Electron a try.


## How does it do it?
It creates a `.json` file in your addons folder, this file keep track of your addon versions and which portal it was installed from.

## Images
<img src="https://auo.github.io/images/lazy-turnip/search.png" alt="search" style="width: 200px;"/>
<img src="https://auo.github.io/images/lazy-turnip/installed.png" alt="installed" style="width: 200px;"/>
<img src="https://auo.github.io/images/lazy-turnip/settings.png" alt="settings" style="width: 200px;"/>




## Usage
To install from source.
So far only scripts for windows.

* install node
* clone repo 'git clone https://github.com/Auo/lazy-turnip.git'
* run 'npm install'
* run 'npm run build-windows' creates and executable
* run 'npm run build-installer-windows' if you want to have an installer.
* either run .exe or install for later use!
