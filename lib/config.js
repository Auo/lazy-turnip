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

        if (existingIx === config.selected)
            config.selected = config.folders.length > 1 ? config.selected - 1 : -1;

        if (existingIx === -1) return;

        config.folders.splice(existingIx);
        await this.storage.set(this.key, config);
    }

    async exists() {
        const config = await this.get();
        return config != null;
    }
}

module.exports = Config;