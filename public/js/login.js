const loginForm = document.getElementById('login-form')
const errorMessage = document.getElementById('error-message')
const successMessage = document.getElementById('success-message')

const setErrorMessage = (text) => {
    let messageText = text.toUpperCase()
    if (messageText.charAt(messageText.length - 1) !== '!') {
        messageText += '!'
    }
    if (errorMessage.classList.contains('hidden')) errorMessage.classList.remove('hidden')
    errorMessage.textContent = messageText
}

const setSuccessMessage = (text) => {
    if (successMessage.classList.contains('hidden')) successMessage.classList.remove('hidden')
    successMessage.textContent = text
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(loginForm);
    const body = JSON.stringify({ username: formData.get('username'), password: formData.get('password') })
    try {
        const response = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        const data = await response.json()
        if (response.status !== 200) {
            setErrorMessage(data.message)
        } else {
            window.location.href = '/';
        }
    } catch {
        setErrorMessage('Coś poszło nie tak')
    }
})

const checkNewUser = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const newUserName = params.get('newUserName');
    if (newUserName) {
        setSuccessMessage(`Gratulacje ${newUserName}! Twoje konto zostało utworzone, teraz mozesz się zalogować.`)
    }
}

window.onload = () => {
    checkNewUser()
}