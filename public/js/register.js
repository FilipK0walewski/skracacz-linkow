const registerForm = document.getElementById('register-form')
const message = document.getElementById('message')

const displayMessage = (text) => {
    let messageText = text.toUpperCase()
    if (messageText.charAt(messageText.length - 1) !== '!') {
        messageText += '!'
    }
    message.textContent = messageText 
    if (message.classList.contains('hidden')) message.classList.remove('hidden')
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(registerForm);

    const username = formData.get('username').trim()
    const password0 = formData.get('password0').trim()
    const password1 = formData.get('password1').trim()

    if (password0 !== password1) {
        displayMessage('Hasła nie są takie same')
        return
    }

    try {
        const body = JSON.stringify({username, password0, password1})
        const response = await fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        const data = await response.json()
        if (response.status === 201) {
            window.location.href = `/login?newUserName=${data.username}`;
        } else {
            displayMessage(data.message)
        }
    } catch (error) {
        displayMessage('Coś nie tak.')
    }
})