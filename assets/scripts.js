$(function() {
	$('[data-toggle="tooltip"]').tooltip()
})

$(document).on('click', '[data-toggle="lightbox"]', function(event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});

//bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on('hidden.bs.modal', function () {
	if($('.modal.show').length)
	{
	  $('body').addClass('modal-open');
	}
  });