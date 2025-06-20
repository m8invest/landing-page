document.addEventListener('DOMContentLoaded', function() {
    const getAccessBtn = document.getElementById('getAccessBtn');
    const modal = document.getElementById('waitlistModal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Function for creating toast notification
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <img class="toast-close" src="assets/icons/close.svg" alt="Clipboard icon">
        `;
        
        toastContainer.appendChild(toast);
        
        // Appearance animation
        setTimeout(() => {
            toast.style.opacity = 1;
        }, 10);
        
        // Handling closure
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));
        
        // Automatic hiding after 5 seconds
        setTimeout(() => removeToast(toast), 5000);
    }
    
    // Function for removing toast with animation
    function removeToast(toast) {
        toast.classList.add('toast-fadeout');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }
    
    // Opening the modal window when clicking on the "Get Access" button
    getAccessBtn.addEventListener('click', function() {
        // Reset scroll positions before showing the modal
        resetModalScroll();

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Preventing scrolling of the main page
    });

    function resetModalScroll() {
        // Try to reset scroll on different elements that might have scrolling
        const modalElements = [
            document.querySelector('.modal'),
            document.querySelector('.modal-content'),
            document.querySelector('.modal-body'),
            document.querySelector('.waitlist-form'),
            document.querySelector('.questions')
        ];
        
        modalElements.forEach(element => {
            if (element) {
                setTimeout(function () {
                    element.scrollTo({ behavior: 'smooth', left: 0, top: 0, });
                }, 2);
            }
        });
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        form.reset();

        // Reset all selected options
        document.querySelectorAll('.option-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Clear any validation error states
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        
       // We also reset scroll when closing to prepare for next opening
        setTimeout(resetModalScroll, 100);
    };

    // Closing the modal window when clicking on the X button
    closeModalBtn.addEventListener('click', function() {
        closeModal();
    });

    // Closing the modal window when clicking outside its content
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
    
    // Toggling selected answer options
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Finding all buttons in the current question group
            const parentQuestion = this.closest('.question');
            const siblings = parentQuestion.querySelectorAll('.option-btn');
            
            // Remove any error highlighting when an option is selected
            parentQuestion.classList.remove('error-highlight');
            const errorMsg = parentQuestion.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
            
            // If this is question 6, allow multiple selection
            if (parentQuestion.querySelector('.question-number').textContent === '6') {
                this.classList.toggle('selected');
            } else {
                // For other questions - only one answer
                siblings.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });
    
    // Remove error on textarea input
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const parentQuestion = this.closest('.question');
            parentQuestion.classList.remove('error-highlight');
            const errorMsg = parentQuestion.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    });
    
    // Remove error on email input
    document.getElementById('email').addEventListener('input', function() {
        const emailContainer = this.closest('.form-group');
        emailContainer.classList.remove('error-highlight');
        const errorMsg = emailContainer.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Processing form submission
    const form = document.getElementById('waitlistForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        
        let isValid = true;
        
        // Validate email
        const emailInput = document.getElementById('email');
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            showValidationError(emailInput.closest('.form-group'), 'Email is required');
            isValid = false;
        }
        
        // Validate all questions
        const questions = document.querySelectorAll('.question');
        questions.forEach(question => {
            const questionNumber = question.querySelector('.question-number').textContent;
            
            // For questions with text field
            if (questionNumber === '9') {
                const textarea = question.querySelector('textarea');
                if (!textarea.value.trim()) {
                    showValidationError(question, 'Please answer this question');
                    isValid = false;
                }
            } else {
                // For questions with answer options
                const selectedOptions = question.querySelectorAll('.option-btn.selected');
                if (selectedOptions.length === 0) {
                    showValidationError(question, 'Please select an answer');
                    isValid = false;
                }
            }
        });
        
        if (!isValid) {
            // Scroll to the first error
            const firstError = document.querySelector('.error-highlight');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Collecting form data
        const formData = {
            email: emailValue,
            telegram: document.getElementById('telegram').value,
            questions: []
        };
        
        // Collecting answers to all questions
        questions.forEach(question => {
            const questionNumber = question.querySelector('.question-number').textContent;
            const questionText = question.querySelector('p').textContent;
            
            // For questions with text field
            if (questionNumber === '9') {
                const textareaValue = question.querySelector('textarea').value;
                formData.questions.push({
                    number: parseInt(questionNumber),
                    question: questionText,
                    answer: textareaValue
                });
            } else {
                // For questions with answer options
                const selectedOptions = question.querySelectorAll('.option-btn.selected');
                const answers = Array.from(selectedOptions).map(option => option.textContent);
                
                formData.questions.push({
                    number: parseInt(questionNumber),
                    question: questionText,
                    answer: answers
                });
            }
        });
        
        // Showing the user that submission is in progress
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Sending data to the server
            const response = await fetch('/api/submit-waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Showing success message
                showToast('Thank you for joining the waitlist! We will contact you soon.', 'success');
                
                // Close modal
                closeModal();
            } else {
                showToast('Error: ' + (result.error || 'Failed to submit form'), 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Failed to submit form. Please try again later.', 'error');
        } finally {
            // Returning the button to its original state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Helper function to show validation errors
    function showValidationError(element, message) {
        element.classList.add('error-highlight');
        
        // Create error message if it doesn't exist
        if (!element.querySelector('.error-message')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            element.appendChild(errorDiv);
        }
    }
});
