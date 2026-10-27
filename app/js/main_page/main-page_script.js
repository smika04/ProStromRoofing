window.mainPageScript = function () {
    const reviewSlider = $('.review_slider');

    if (!reviewSlider.length || !$.fn.slick) {
        return;
    }

    if (reviewSlider.data('review-slider-ready')) {
        return;
    }

    if (reviewSlider.hasClass('slick-initialized')) {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                reviewSlider
                    .addClass('review_slider--ready')
                    .data('review-slider-ready', true);
            });
        });

        return;
    }

    reviewSlider.on('init', function () {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                reviewSlider
                    .addClass('review_slider--ready')
                    .data('review-slider-ready', true);
            });
        });
    });

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
        adaptiveHeight: false,
        speed: 420,
        cssEase: 'ease',
        pauseOnHover: true,
        pauseOnFocus: true
    });
};