const reviewForm = document.querySelector('.review-form');

const review= document.querySelector('#review-text');

reviewForm.addEventListener('submit', (e) => {
    let valid = true;
    
        const lookGood=review.nextElementSibling;
        review.addEventListener('input', () => {
            if (!review.value) {
                review.style.border = "3px #ff394a solid";
                lookGood.classList.remove('visible')
            } else {
                review.style.border = "3px rgb(3, 178, 3) solid";
                lookGood.classList.add('visible')
            }
        });

        if (!review.value) {
            review.style.border = "3px #ff394a solid";
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
        }

});