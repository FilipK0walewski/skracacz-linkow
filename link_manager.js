const DumbDB = require("./dumb_db")


class LinkManager {
    constructor() {
        this.dumb_db = new DumbDB()
    }

addShortcutFromUrl(short_name, url) {
        console.log(short_name)
        console.log(url)
        this.dumb_db.saveValue(short_name, url)
    } 

    getUrlFromShortcut(short_name) {
        return this.dumb_db.getValue(short_name)
    }
}

module.exports = LinkManager