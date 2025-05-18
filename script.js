// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    
    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Add animation to the menu icon
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });
    
    // Add click event listener to each link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Prevent default anchor behavior
            e.preventDefault();
            
            // Get the target section id from href attribute
            const targetId = link.getAttribute('href');
            
            // Scroll to the target section smoothly
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu after clicking a link
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle')) {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});
