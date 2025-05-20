$(function () {
  // Handle all download buttons
  const downloadLinks = document.querySelectorAll(".java-download-btn");
  
  downloadLinks.forEach(link => {
    // Only add click handler to links without modal toggle
    if (!link.hasAttribute('data-bs-toggle')) {
      link.addEventListener("click", function (event) {
        $("#downloadModal").modal("hide");
        
        if (this.href) {
          window.location.href = this.href; //Open download link. We need to do this again because the modal toggle overrides it by default.
        }
      });
    }
  });
  
  // Handle modal download button
  const modalDownloadBtn = document.querySelector('.java-download-btn[data-bs-toggle="modal"]');
  if (modalDownloadBtn) {
    const downloadUrl = modalDownloadBtn.getAttribute('href');
    
    // When the modal is shown, trigger the download
    $('#thanksDownloadModal').on('shown.bs.modal', function () {
      window.location.href = downloadUrl;
    });
  }
});
