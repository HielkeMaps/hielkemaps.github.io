$(function () {
    // Handle newsletter form submission
    const newsletterForm = document.querySelector('#newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission
            
            const emailInput = this.querySelector('input[name="email"]');
            const hpInput = this.querySelector('input[name="hp"]');
            const listInput = this.querySelector('input[name="list"]');
            const subformInput = this.querySelector('input[name="subform"]');
            
            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('hp', hpInput.value);
            formData.append('list', listInput.value);
            formData.append('subform', subformInput.value);
            
            // Show loading state
            const submitBtn = this.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn.value;
            submitBtn.value = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Send the form data using fetch
            fetch('https://newsletter.hielkemaps.com/subscribe', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    newsletterForm.innerHTML = '<div class="text-center"><img src="/media/home/yay.gif" alt="Yay!" style="border-radius: 50%; width: 150px;"><br>Thanks for subscribing!</div>'
                }
            })
            .catch(error => {
                submitBtn.value = 'Try again later...';
                setTimeout(() => {
                    submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            });
        });
    }
});