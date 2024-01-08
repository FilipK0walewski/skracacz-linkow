const urlForm = document.getElementById('url-form')
const serverResult = document.getElementById('server-result')
const userData = document.getElementById('user-data')

const copyToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('new-url-input').value);
}

urlForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(urlForm);
    const body = { url: formData.get('url') }

    if (formData.get('name') && formData.get('name').trim().length != 0) {
        body['name'] = formData.get('name')
    }

    try {
        const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await response.json()
        if (response.status === 201) {
            serverResult.innerHTML = `
                <span>Proszę, to twój skrócony link:</span>
                <input id="new-url-input" type="text" class="input-0" value="${data.niceUrl}" readonly/>
                <button class="btn-0" onclick="copyToClipboard()">Kopiuj</button>
            `
        } else {
            serverResult.innerHTML = `<p class="error">${data.message}</p>`
        }
    } catch {
        serverResult.innerHTML = `<p class="error">Coś nie tak.</p>`
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