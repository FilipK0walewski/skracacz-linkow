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

const checkIfUrlNameIsValid = (urlName) => {
    const notAllowet = ['', 'login', 'logout', 'register', 'urls', 'username']
    if (notAllowet.includes(urlName)) return false
    return true
}

module.exports = {
    getRandomName,
    checkIfStringIsUrl,
    checkIfUrlNameIsValid
};