document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const nextButton = document.querySelector('.carousel-btn.next');
  
    let currentSlide = 0;
    const totalSlides = track.children.length;

    if(totalSlides<2){
      prevButton.style.display='none'
      nextButton.style.display='none'
    }
  
    // Navigate to the next slide
    nextButton.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides; // Loop back to start
      updateCarousel();
    });
  
    // Navigate to the previous slide
    prevButton.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; // Loop back to end
      updateCarousel();
    });
  
    // Update the carousel position
    function updateCarousel() {
      const slideWidth = track.clientWidth;
      track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    }
  
    // Adjust carousel on window resize
    window.addEventListener('resize', updateCarousel);
  });
  