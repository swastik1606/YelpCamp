const form = document.querySelector('.regForm');
const btn = document.querySelector('.regForm .submit-btn');
const mainDiv = document.querySelector('.reg-main');

const email=document.querySelector('#email')
const username=document.querySelector('#username')
const password=document.querySelector('#password')
const lookGood=document.querySelector('#lookGood')

form.addEventListener('submit', (e) => {
    let allValid = true;

    const inputs = [email,username,password];

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
