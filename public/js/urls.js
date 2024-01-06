let data;
let currentPage = 1;
let numberOfPages = 1;
const itemsPerPage = 10;

const paginationContainer = document.getElementById('pagination-container')
const tableBody = document.getElementById('table-body')
const tableContainer = document.getElementById('table-container')
const userDataContainer = document.getElementById('user-data-container')

const updateUserData = () => {
    const p = document.createElement('p')
    p.textContent = `${data.username}, liczba twoich skróconych linków to: ${data.count}`
    userDataContainer.appendChild(p)

    const homePage = document.createElement('a')
    homePage.textContent = 'Strona domowa'
    homePage.href = '/'
    userDataContainer.appendChild(homePage)
}

const updateTable = () => {
    if (tableContainer.classList.contains('hidden')) {
        tableContainer.classList.remove('hidden')
    }

    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const pageData = data.urls.slice(startIndex, endIndex)
    pageData.forEach(i => {
        const tr = document.createElement('tr');
        Object.values(i).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        })
        tableBody.appendChild(tr);
    })
}

const updatePagination = () => {
    numberOfPages = Math.floor(data.urls.length / itemsPerPage) + 1

    if (data.urls.length > itemsPerPage) {
        paginationContainer.classList.remove('hidden')
        document.getElementById('page-info').innerText = `strona ${currentPage} / ${numberOfPages}`

        document.getElementById('prev-button').addEventListener('click', () => {
            if (currentPage !== 1) {
                currentPage -= 1
                document.getElementById('page-info').innerText = `strona ${currentPage} / ${numberOfPages}`
                updateTable()
            }
        })

        document.getElementById('next-button').addEventListener('click', () => {
            if (currentPage !== numberOfPages) {
                currentPage += 1
                document.getElementById('page-info').innerText = `strona ${currentPage} / ${numberOfPages}`
                updateTable()
            }
        })
    }
}

const getUserUrls = async () => {
    try {
        const response = await fetch('/your-urls-data', { headers: { 'Content-Type': 'application/json' } })
        const result = await response.json()

        if (result.count == 0) {
            userDataContainer.innerHTML = `
                <p>${result.username} nie skracałeś jeszcze żadnych linków.</p>
                <a href="/">Strona domowa</a>
            `
        } else {
            data = result;
            updateUserData()
            updateTable()
            updatePagination()
        }
    } catch (error) {
        console.log(error)
        userDataContainer.innerHTML = `
            <p class="error">Błąd serwera.</p>
            <a href="/">Strona domowa</a>
        `
    }
}

window.onload = async () => {
    await getUserUrls()
}