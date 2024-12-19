const savedTheme = localStorage.getItem('theme')
const themeSwitch = document.getElementById('theme-switch')

if (savedTheme === 'dark') {
    document.documentElement.setAttribute('theme', 'dark')
    themeSwitch.checked = true
} else {
    document.documentElement.setAttribute('theme', 'light')
}

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.documentElement.setAttribute('theme', 'dark')
        localStorage.setItem('theme', 'dark')
    } else {
        document.documentElement.setAttribute('theme', 'light')
        localStorage.setItem('theme', 'light')
    }
})

window.addEventListener('load', function() {
    const fast = getComputedStyle(document.documentElement).getPropertyValue('--transition-fast-default');
    const slow = getComputedStyle(document.documentElement).getPropertyValue('--transition-slow-default');
    document.documentElement.style.setProperty('--transition-fast', fast);
    document.documentElement.style.setProperty('--transition-slow', slow);
});
