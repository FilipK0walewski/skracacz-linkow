const urlForm = document.getElementById('url-form')
const serverResult = document.getElementById('server-result')
const shortUrlResult = document.getElementById('short-url-result')
const userData = document.getElementById('user-data')

const longUrlInput = document.getElementById('long-url-input')
const urlNameInput = document.getElementById('url-name-input')

const errorMessage = document.getElementById('error-message')
const urlError = document.getElementById('url-error')
const urlNameError = document.getElementById('url-name-error')
const expireDateError = document.getElementById('expire-date-error')

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

const displayExpireDateError = (text) => {
    toogleVisibility(expireDateError, false)
    expireDateError.textContent = text
}

const hideUrlError = () => {
    toogleVisibility(urlError, true)
    urlError.textContent = ''
}

const hideErrors = () => {
    toogleVisibility(urlError, true)
    toogleVisibility(urlNameError, true)
    toogleVisibility(expireDateError, true)
}

urlForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    hideErrors()

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

    if (expirationDate) {
        const expiresAt = new Date(expirationDate)
        const currentDate = new Date()
        if (currentDate >= expiresAt) {
            console.log('Wybierz datę z przyszłości')
            displayExpireDateError('Wybierz datę z przyszłości.')
            return
        }
        console.log('expirationDate', expirationDate)
        body['expiresAt'] = expiresAt.toISOString();
    }

    try {
        const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await response.json()
        console.log(data)
        if (response.status === 201) {
            toogleVisibility(urlForm, true)
            toogleVisibility(serverResult, false)
            toogleVisibility(errorMessage, true)
            shortUrlResult.value = data.shortUrl
        } else {
            if (data.errorCode === 'VALUE_ALREADY_USED') {
                displayUrlNameError(data.message)
            } else {
                displayUrlError(data.message)
            }
        }
    } catch (error) {
        console.log('error catched')
        console.log(error)
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
            <span>Chesz zapisywać swoje linki? <a href="/login">Zaloguj się</a> a3lbo <a href="/register">załóż konto</a>.</span> 
        `
    }
}

const logout = async () => {
    await fetch('/logout')
    localStorage.removeItem('username')
    userData.innerHTML = `
        <span>Chesz zapisywać swoje linki? <a href="/login">Zaloguj się</a> albo <a href="/register">załóż konto</a>.</span> 
    `
}

window.onload = async () => {
    await setUserData()
}