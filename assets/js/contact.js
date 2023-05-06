
$(function () {

    $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function ($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function ($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var form = $("#contactForm").get(0);
            var firstName = name; // For Success/Failure Message

            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $this = $("#sendMessageButton"); 1
            $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages
            $.ajax({
                url: "https://usebasin.com/f/db486153291f",
                type: "POST",
                crossDomain: true,
                data: new FormData(form),
                dataType: "json",
                contentType: "multipart/form-data",
                processData: false,
                contentType: false,
                headers: {
                    "Accept": "application/json"
                },
                cache: false,
                success: function () {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-bs-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
                    $('#success > .alert-success').append("<strong>Your message has been sent. </strong>");
                    $('#success > .alert-success').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function () {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-bs-dismiss='alert' aria-hidden='true'>&times;").append("</button>");
                    $('#success > .alert-danger').append($("<strong>").text("Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!"));
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                complete: function () {
                    setTimeout(function () {
                        $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
                    }, 1000);
                }
            });
        },
        filter: function () {
            return $(this).is(":visible");
        }
    });

    $("a[data-bs-toggle=\"tab\"]").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
    });
});

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function () {
    $('#success').html('');
});