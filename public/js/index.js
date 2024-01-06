const urlForm = document.getElementById('url-form')
const serverResult = document.getElementById('server-result')

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
        } else if (data.message) {
            serverResult.innerHTML = `<p class="error">${data.message}</p>`
        } else {
            serverResult.innerHTML = `<p class="error">Coś nie tak.</p>`
        }
    } catch {
        console.log('error catched')
        serverResult.innerHTML = `<p class="error">Coś nie tak.</p>`
    }
})