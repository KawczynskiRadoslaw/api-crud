const apiUrl = 'http://localhost:3000/excursions';

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('DOM');

    loadExcursions();
    removeExcursions();
    addExcursions();
    updateExcursions();
    numberOnly();
    alphaOnly();
}

// input z name 'price': można wpisać tylko cyfry
const inputPrice = document.querySelectorAll("input[name='price']");

inputPrice.forEach(e => {
	e.value = '';
	e.setAttribute('autocomplete','off');
	e.setAttribute('onkeydown','return numberOnly(event)');
	e.setAttribute('maxlength','3');
	console.log(e);
});

const numberOnly = (event => {
	let key = event.keyCode;
	return ((key >= 48 && key <= 57) || key == 8); // only 0-9 characters
});

// input z name 'name': można wpisać tylko litery
const inputName = document.querySelectorAll("input[name='name']");

inputName.forEach(e => {
	e.value = '';
	e.setAttribute('autocomplete','off');
	e.setAttribute('onkeydown','return alphaOnly(event)');
	e.setAttribute('maxlength','30');
	console.log(e);
});

const alphaOnly = (event => {
	let key = event.keyCode;
	return ((key >= 65 && key <= 90) || key == 8); // only A-Z characters
});

function loadExcursions() {
    fetch(apiUrl)
        .then(resp => {
            if(resp.ok) { return resp.json(); }
            return Promise.reject(resp);
        })
        .then(data => {
            insertExcursions( data );
        })
        .catch(err => console.error(err));
}

function insertExcursions(excursionsArr) {
    const ulEl = document.querySelector('.excursions');
    ulEl.innerHTML = '';
    // wyczyść zawartość przed dodaniem elementów 
    excursionsArr.forEach( item => {
        const liEl = document.createElement('li');
        liEl.dataset.id = item.id;
        liEl.classList.add('excursions__item');
        liEl.innerHTML = `
            [<a href="#">usuń</a>]
            <span>${item.name}</span>: 
            <span>${item.price}</span> PLN
            <button>edytuj</button>
        `;

        ulEl.appendChild( liEl );
    });
}

function removeExcursions() {
    const ulEl = document.querySelector('.excursions');
    ulEl.addEventListener('click', e => {
        const targetEl = e.target;
        if(targetEl.tagName === 'A') {
            const parentEl = targetEl.parentElement;
            const id = parentEl.dataset.id;
            const options = { method: 'DELETE' };
            fetch(`${apiUrl}/${id}`, options)
                .then(resp => console.log(resp))
                .catch(err => console.error(err))
                .finally( loadExcursions );
        }
    })
}

function addExcursions() {
    const form = document.querySelector('form');
    form.addEventListener('submit', e => {
        e.preventDefault();

        const {name, price} = e.target.elements;
        const data = {
            name: name.value, price: price.value
        };

        const options = { 
            method: 'POST',
            body: JSON.stringify( data ),
            headers: { 'Content-Type': 'application/json' } 
        };
        fetch(apiUrl, options)
            .then(resp => console.log(resp))
            .catch(err => console.error(err))
            .finally( loadExcursions );
    });
}

function updateExcursions() {
    const ulEl = document.querySelector('.excursions');
    ulEl.addEventListener('click', e => {
        const targetEl = e.target;
        console.log(targetEl)
        if(targetEl.tagName === 'BUTTON') {
            const parentEl = targetEl.parentElement;
            const spanList = 
                parentEl.querySelectorAll('span');
            const isEditable = [...spanList].every( 
                span => span.isContentEditable
            );

            if(isEditable) {
                // zapisz zmanę w API
                const id = parentEl.dataset.id;
                const data = {
                    name: spanList[0].innerText,
                    price: spanList[1].innerText,
                }
                const options = { 
                    method: 'PUT',
                    body: JSON.stringify( data ),
                    headers: { 'Content-Type': 'application/json' } 
                };
                fetch(`${apiUrl}/${id}`, options)
                    .then(resp => console.log(resp))
                    .catch(err => console.error(err))
                    .finally( () => {
                        targetEl.innerText = 'edytuj';
                        spanList.forEach(
                            span => span.contentEditable = false
                        );
                    });

            } else {
                // ustaw [contentEditable] na [true]
                targetEl.innerText = 'zapisz';
                spanList.forEach(
                    span => span.contentEditable = true
                );
            }
        }
    });
}