const urlForm = document.getElementById('url-form')
const serverResult = document.getElementById('server-result')
const longUrlResult = document.getElementById('long-url-result')
const shortUrlResult = document.getElementById('short-url-result')
const userData = document.getElementById('user-data')
const errorMessage = document.getElementById('error-message')

const longUrlInput = document.getElementById('long-url-input')
const urlNameInput = document.getElementById('url-name-input')

const urlErrorMessage = document.getElementById('url-error')
const urlNameErrorMessage = document.getElementById('url-name-error')

const toogleVisibility = (element, shouldBeHidden) => {
    if (shouldBeHidden) {
        if (element.classList.contains('hidden'))
    } else {

    }
}

const reset = () => {
    urlForm.reset()
    if (urlForm.classList.contains('hidden')) urlForm.classList.remove('hidden')
    if (!serverResult.classList.contains('hidden')) serverResult.classList.add('hidden')
}

const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrlResult.value);
}

const displayErrorMessage = (text) => {
    if (errorMessage.classList.contains('hidden')) errorMessage.classList.remove('hidden')
    errorMessage.textContent = text
}

const displayUrlError = (text) => {
    if (urlErrorMessage.classList.contains('hidden')) urlErrorMessage.classList.remove('hidden')
    urlErrorMessage.textContent = text
    longUrlInput.focus()
}

const displayUrlNameError = (text) => {
    if (urlNameErrorMessage.classList.contains('hidden')) urlNameErrorMessage.classList.remove('hidden')
    urlNameErrorMessage.textContent = text
    urlNameInput.focus()
}

const hideUrlError = () => {
    if (!urlErrorMessage.classList.contains('hidden')) urlErrorMessage.classList.add('hidden')
    urlErrorMessage.textContent = ''
}

const isValidUrl = (str) => {
    console.log(str.length)
    if (str.length === 0) {
        displayUrlError('Wpisz coś')
        return false
    }
    hideUrlError()
    return true
}

urlForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(urlForm);
    const url = formData.get('url').trim()

    const isValid = isValidUrl(url)
    if (isValid === false) return

    const body = { url }

    if (formData.get('name') && formData.get('name').trim().length !== 0) {
        body['name'] = formData.get('name')
    }

    if (formData.get('date')) {
        body['date'] = formData.get('date')
    }

    console.log(body)
    // return


    try {
        const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await response.json()
        console.log(data.errorCode)
        if (response.status === 201) {
            if (!urlForm.classList.contains('hidden')) urlForm.classList.add('hidden')
            if (serverResult.classList.contains('hidden')) serverResult.classList.remove('hidden')
            if (!errorMessage.classList.contains('hidden')) errorMessage.classList.add('hidden')
            longUrlResult.value = data.longUrl
            shortUrlResult.value = data.shortUrl
        } else {
            if (data.errorCode === 'VALUE_ALREADY_USED') {
                displayUrlNameError(data.message)
            } else {
                displayUrlError(data.message)
            }
        }
    } catch {
        displayErrorMessage('Coś nie tak')
    }
})

const setUserData = async () => {
    try {
        const response = await fetch('/username', { headers: { 'Content-Type': 'application/json' } })
        const result = await response.json()
        if (response.status === 200 && result.username) {
            userData.innerHTML = `
                    <span>Jesteś zalogowany jako ${result.username}. <a href="your-urls">Zobacz swoje linki</a></span>
                    <a onclick="logout()" href="#">Wyloguj się</button>
                `
        }
        else {
            userData.innerHTML = `
                <span>Chesz zapisywać swoje linki? <a href="/login">Zaloguj się</a> albo <a href="/register">załóż konto</a>.</span> 
            `
        }
    } catch {
        userData.innerHTML = `
            <span>Chesz zapisywać swoje linki?<a href="/login">Zaloguj się</a> albo <a href="/register">załóż konto</a>.</span> 
        `
    }
}

const logout = async () => {
    await fetch('/logout')
    localStorage.removeItem('username')
    userData.innerHTML = `
        <span>Chesz zapisywać swoje linki?<a href="/login">Zaloguj się</a> albo <a href="/register">załóż konto</a>.</span> 
    `
}

window.onload = async () => {
    await setUserData()
}