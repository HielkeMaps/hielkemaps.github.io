// Bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on('hidden.bs.modal', function () {
	if ($('.modal.show').length) {
		$('body').addClass('modal-open');
	}
});

function toggleMobileMenu() {
    var $toggleBtn = $('[data-toggle="toggle-menu"]');
    var $navMenuCont = $($toggleBtn.data('target'));
    var isOpen = $toggleBtn.data('isopen');
    var isAnimating = $navMenuCont.is(':animated');

    if (isAnimating) {
        return;
    }

    if (isOpen) {
        closeMobileMenu();
        $toggleBtn.data('isopen', false);
    } else {
        openMobileMenu();
        $toggleBtn.data('isopen', true);
    }

    function openMobileMenu() {
        $('body').addClass('navbar-open');
        $('.hamburger').addClass('active');

        $navMenuCont.css('display', 'block');

        let $navItems = $navMenuCont.find('.nav-item');
        $navItems.removeClass('animate__fadeOutUp').addClass('animate__fadeInDown');
        $navMenuCont.animate({ 'height': '100vh' ,'opacity': '1'}, 350);
    }

    function closeMobileMenu() {
        $('body').removeClass('navbar-open');
        $('.hamburger').removeClass('active');

        let $navItems = $navMenuCont.find('.nav-item');
        $navItems.removeClass('animate__fadeInDown').addClass('animate__fadeOutUp');
		
        $navMenuCont.removeClass('slide-in').delay(100).animate({ 'height': '0vh','opacity': '0' }, 350, function () {
            $navMenuCont.css('display', 'none');
        });
    }
}

$('[data-toggle="toggle-menu"]').on('click', toggleMobileMenu);
