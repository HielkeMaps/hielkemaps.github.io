// Select all accordion buttons
const accordionButtons = document.querySelectorAll('.btn.btn-primary.version-button');

// Function to toggle panel visibility
const togglePanel = (button) => {
  button.classList.toggle('active');
  const panel = button.nextElementSibling;
  panel.style.maxHeight = panel.style.maxHeight ? null : `${panel.scrollHeight}px`;
};

// Add click event listeners to all accordion buttons
accordionButtons.forEach(button => {
  button.addEventListener('click', () => togglePanel(button));
});

// Open the first panel by default
if (accordionButtons.length > 0) {
  togglePanel(accordionButtons[0]);
}