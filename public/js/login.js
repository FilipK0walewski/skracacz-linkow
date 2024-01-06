const loginForm = document.getElementById('login-form')
const message = document.getElementById('message')

const displayMessage = (text, isSuccess) => {
    message.classList = []
    message.classList.add(isSuccess === true ? 'success' : 'error')
    message.textContent = text
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(loginForm);
    const body = JSON.stringify({ username: formData.get('username'), password: formData.get('password') })
    try {
        const response = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        const data = await response.json()
        if (response.status !== 200) {
            displayMessage(data.message)
            return
        }
        window.location.href = '/';
    } catch {
        displayMessage('Coś poszło nie tak.')
    }
})

const checkNewUser = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const newUserName = params.get('newUserName');
    if (newUserName) {
        displayMessage(`Gratulacje ${newUserName}! Twoje konto zostało utworzone, teraz mozesz się zalogować.`, true)
    }
}

window.onload = () => {
    checkNewUser()
}