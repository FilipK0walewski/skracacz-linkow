const characters = 'abcdefghijklmnopqrstuvwxyz'

const getRandomName = () => {
    let randomName = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomName += characters.charAt(randomIndex);
    }
    return randomName
}

const checkIfStringIsUrl = (str) => {
    return /^.*\..*$/.test(str);
}

module.exports = {
    getRandomName,
    checkIfStringIsUrl
};