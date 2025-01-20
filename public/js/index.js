const urlForm = document.getElementById('url-form')
const serverResult = document.getElementById('server-result')
const longUrlResult = document.getElementById('long-url-result')
const shortUrlResult = document.getElementById('short-url-result')
const userData = document.getElementById('user-data')

const longUrlInput = document.getElementById('long-url-input')
const urlNameInput = document.getElementById('url-name-input')

const errorMessage = document.getElementById('error-message')
const urlError = document.getElementById('url-error')
const urlNameError = document.getElementById('url-name-error')

const reset = () => {
    urlForm.reset()
    toogleVisibility(urlForm, false)
    toogleVisibility(serverResult, true)
    toogleVisibility(errorMessage, true)
    toogleVisibility(urlError, true)
    toogleVisibility(urlNameError, true)
}

const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrlResult.value);
}

const displayErrorMessage = (text) => {
    toogleVisibility(errorMessage, false)
    errorMessage.textContent = text
}

const displayUrlError = (text) => {
    toogleVisibility(urlError, false)
    urlError.textContent = text
    longUrlInput.value = longUrlInput.value.trim()
    longUrlInput.focus()
}

const displayUrlNameError = (text) => {
    toogleVisibility(urlNameError, false)
    urlNameError.textContent = text
    urlNameInput.focus()
}

const hideUrlError = () => {
    toogleVisibility(urlError, true)
    urlError.textContent = ''
}

urlForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(urlForm);
    const url = formData.get('url').trim()

    if (url.length === 0) {
        displayUrlError('Wpisz coś')
        return
    } else if (!isValidUrl(url)) {
        displayUrlError('Niepoprawny link')
        return
    }

    const body = { url }

    const urlName = formData.get('name').trim()
    if (urlName.length > 32) {
        displayUrlNameError('Za długie')
        return
    } else if (urlName.length !== 0) {
        body['name'] = urlName
    }

    const expirationDate = formData.get('expirationDate')
    const date = new Date(expirationDate)

    console.log(expirationDate)

    
 

    console.log(body)

    try {
        const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await response.json()
        console.log(data)
        if (response.status === 201) {
            toogleVisibility(urlForm, true)
            toogleVisibility(serverResult, false)
            toogleVisibility(errorMessage, true)
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