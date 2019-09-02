const Storage = require('./storage');

class Config {
    constructor() {
        this.storage = new Storage();
        this.key = 'config';
    }

    get() {
        return this.storage.get(this.key);
    }

    async init() {
        if (await this.exists()) return;
        const config = { folders: [], selected: -1 };
        await this.storage.set(this.key, config);
    }

    async setIndexAsActive(ix) {
        const config = await this.storage.get(this.key);

        if (config.folders[ix] == null) return false;

        config.selected = ix;

        await this.storage.set(this.key, config);
        return true;
    }

    async addLine(line) {
        const config = await this.storage.get(this.key);

        const existingIx = config.folders.findIndex(f => f.path === line.path);
        if (existingIx !== -1) return;
        config.folders.push(line);
        await this.storage.set(this.key, config);
    }

    async removeLine(line) {
        const config = await this.storage.get(this.key);
        const existingIx = config.folders.findIndex(f => f.path === line.path);

        if (existingIx === -1) return;

        if (config.folders.length - 1 <= existingIx) {
            if (config.folders.length - 1 !== 0) {
                config.selected = -1;
            } else {
                config.selected = existingIx -1;
            }
        }

        config.folders.splice(existingIx, 1);
        await this.storage.set(this.key, config);
    }

    async exists() {
        const config = await this.get();
        return config != null;
    }

    async hasFolderSetup() {
        const config = await this.get();
        return config != null && config.selected != -1 && config.folders.length > 0;
    }
}

module.exports = Config;