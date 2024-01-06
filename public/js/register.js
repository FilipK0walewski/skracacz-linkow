const registerForm = document.getElementById('register-form')
const message = document.getElementById('message')

const displayMessage = (text) => {
    message.textContent = text
    if (!message.classList.contains('error')) message.classList.add('error')
    if (message.classList.contains('hidden')) message.classList.remove('hidden')
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(registerForm);
    try {
        const body = JSON.stringify({
            username: formData.get('username'),
            password0: formData.get('password0'),
            password1: formData.get('password1')
        })
        const response = await fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        const data = await response.json()
        if (response.status === 201) {
            console.log(data)
            window.location.href = `/login?newUserName=${data.username}`;
            return
        } else if (data.message) {
            displayMessage(data.message)
        } else {
            displayMessage('Coś nie tak.')
        }
    } catch (error) {
        displayMessage('Coś nie tak.')
    }
})