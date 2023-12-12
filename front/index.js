const apiUrl = 'http://127.0.0.1:3000'

const urlInput = document.getElementById('url-input')
const saveBtn = document.getElementById('save-btn')
const message = document.getElementById('message')

const checkbox = document.getElementById('user-url-name-checkbox')
const urlNameInput = document.getElementById('user-url-name-input')

checkbox.addEventListener('change', () => {
    if (!checkbox.checked) {
        urlNameInput.value = null
    }
    urlNameInput.classList.toggle('hidden', !checkbox.checked)
})

saveBtn.addEventListener('click', async () => {
    console.log('saving')
    let tmpErrorMessage = null
    const queryParams = {url: urlInput.value}
    if (urlInput.value === '') {
        tmpErrorMessage = 'Nie podałeś linku gościu.'
    } else if (checkbox.checked === true && urlNameInput.value === '') {
        tmpErrorMessage = 'Nie podałeś nazwy do skróconego linku.'
    } else if (checkbox.checked === true && urlNameInput.value !== '') {
        queryParams['short_name'] = urlNameInput.value
    }

    if (tmpErrorMessage !== null) {
        message.textContent = tmpErrorMessage
        if (message.classList.contains('hidden')) message.classList.remove('hidden')
        return
    }

    const url = new URL(`${apiUrl}/add`)
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]))
    const res = await fetch(url)
    const data = await res.json()
    console.log(data)
    message.textContent = `${apiUrl}/get/${data.short_name}`
    message.classList.add('success')
    message.classList.remove('hidden')
})

const redirectoToPage = () => {
    console.log('redirecting...')
}

window.onload = redirectoToPage