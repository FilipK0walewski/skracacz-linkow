fs = require('fs');
const DB_FILE_PATH = './db.json' 


class DumbDB {
    getValue(key) {
        let db = this.#loadDbContent()
        return db[key]
    }

    saveValue(key, value) {
        let db = this.#loadDbContent()
        console.log(db)
        console.log(key)

        console.log(value)

        db[key] = value
        this.#updateDbContent(db)
    }

    #loadDbContent(){
        if (!fs.existsSync(DB_FILE_PATH)) {
            return {}
        } else {
            return JSON.parse(fs.readFileSync(DB_FILE_PATH).toString());
        }
    }

    #updateDbContent(content){
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(content));
    }
}

module.exports = DumbDB