document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded")
  
    // Handle alert close buttons
    const closeButtons = document.querySelectorAll(".alert .close")
    closeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        this.parentElement.style.display = "none"
      })
    })
  
    // Handle dropdown toggle
    const userDropdown = document.getElementById("userDropdown")
    if (userDropdown) {
      console.log("User dropdown found")
      userDropdown.addEventListener("click", function (e) {
        e.preventDefault()
        console.log("Dropdown clicked")
        const dropdownMenu = this.nextElementSibling
        dropdownMenu.classList.toggle("show")
      })
  
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.matches("#userDropdown") && !e.target.closest("#userDropdown")) {
          const dropdowns = document.querySelectorAll(".dropdown-menu")
          dropdowns.forEach((dropdown) => {
            if (dropdown.classList.contains("show")) {
              dropdown.classList.remove("show")
            }
          })
        }
      })
    }
  })
  
  