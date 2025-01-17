const form = document.querySelector('.newForm');
const btn = document.querySelector('.newForm .submit-btn');
const mainDiv = document.querySelector('.new-main');

const title = document.querySelector('#title');
const campLocation = document.querySelector('#location');
const price = document.querySelector('#price');
// const image = document.querySelector('#image');
const description = document.querySelector('#description');
const lookGood=document.querySelector('#lookGood')

form.addEventListener('submit', (e) => {
    let allValid = true;

    const inputs = [title, campLocation, price, description];

    inputs.forEach(input => {
        const lookGood=input.nextElementSibling;
        input.addEventListener('input', () => {
            if (!input.value) {
                input.style.border = "3px #ff394a solid";
                lookGood.classList.remove('visible')
            } else {
                input.style.border = "3px rgb(3, 178, 3) solid";
                lookGood.classList.add('visible')
            }
        });

        if (!input.value) {
            input.style.border = "3px #ff394a solid";
            allValid = false;
        }
    });

    if (!allValid) {
        e.preventDefault();
    }
});
