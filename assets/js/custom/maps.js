$(document).ready(function () {
    $('#searchInput').on('input', function () {
        var filter = $(this).val().toLowerCase();
        $('.card-deck .card').each(function () {
            if ($(this).find('.card-title').text().toLowerCase().indexOf(filter) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});