const toogleVisibility = (element, shouldBeHidden) => {
    if (shouldBeHidden) {
        if (!element.classList.contains('hidden')) {
            element.classList.add('hidden')
        }
    } else if (element.classList.contains('hidden')) {
        element.classList.remove('hidden')
    }
}

const isValidUrl = () => {
    return true
}

const getExpirationDatetime = (date, hour, minute) => {
    
}