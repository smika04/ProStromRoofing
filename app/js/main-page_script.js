window.mainPageScript = function () {
    const reviewSlider = $('.review_slider');

    if (reviewSlider.length && $.fn.slick && !reviewSlider.hasClass('slick-initialized')) {
        reviewSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            arrows: false,
            dots: true,
            autoplay: true,
            autoplaySpeed: 5000,
            draggable: true,
            swipe: true,
            touchMove: true,
            accessibility: false,
            adaptiveHeight: true,
            speed: 420,
            cssEase: 'ease',
            pauseOnHover: true,
            pauseOnFocus: true
        });
    }
};