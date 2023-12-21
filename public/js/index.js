const urlInput = document.getElementById('url-input')
const saveBtn = document.getElementById('save-btn')
const serverResult = document.getElementById('server-result')

const checkbox = document.getElementById('user-url-name-checkbox')
const urlNameInput = document.getElementById('user-url-name-input')

checkbox.addEventListener('change', () => {
    if (!checkbox.checked) {
        urlNameInput.value = null
    }
    urlNameInput.classList.toggle('hidden', !checkbox.checked)
})

saveBtn.addEventListener('click', async () => {
    let tmpErrorMessage = null
    const requestBody = { url: urlInput.value }
    if (urlInput.value === '') {
        tmpErrorMessage = 'Nie podałeś linku gościu.'
    } else if (checkbox.checked === true && urlNameInput.value === '') {
        tmpErrorMessage = 'Nie podałeś nazwy do skróconego linku.'
    } else if (checkbox.checked === true && urlNameInput.value !== '') {
        requestBody['name'] = urlNameInput.value
    }

    if (tmpErrorMessage !== null) {
        serverResult.innerHTML = ``
        return
    }

    const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) })
    if (res.status >= 400) {
        serverResult.innerHTML = `<p class="error">Coś nie tak.</p>`
        return
    }
    const data = await res.json()

    if (res.status !== 201) {
        serverResult.innerHTML = `<p class="error">${data.message}</p>`
        return
    }
    serverResult.innerHTML = `
        <p>Proszę, to twój skrucony link:</p>
        <input type="text" class="input-0" value="${data.niceUrl}" readonly/>
    `
})
