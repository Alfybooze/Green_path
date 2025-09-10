// Auth Validation JavaScript - Client-side Only
class AuthValidator {
    constructor() {
        this.initializeValidation();
    }

    initializeValidation() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Setup login form validation
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            this.setupLoginValidation(loginForm);
        }

        // Setup signup form validation
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            this.setupSignupValidation(signupForm);
        }
    }

    setupLoginValidation(form) {
        const username = document.getElementById('loginUsername');
        const password = document.getElementById('loginPassword');
        const roleInputs = document.querySelectorAll('input[name="role"]');

        // Real-time validation
        if (username) {
            username.addEventListener('blur', () => this.validateUsername(username, 'loginUsernameError'));
            username.addEventListener('input', () => this.clearError('loginUsernameError'));
        }

        if (password) {
            password.addEventListener('blur', () => this.validatePassword(password, 'loginPasswordError'));
            password.addEventListener('input', () => this.clearError('loginPasswordError'));
        }

        roleInputs.forEach(input => {
            input.addEventListener('change', () => this.clearError('loginRoleError'));
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!this.validateLoginForm(form)) {
                e.preventDefault();
                this.focusFirstError(form);
            }
        });
    }

    setupSignupValidation(form) {
        const username = document.getElementById('signupUsername');
        const firstName = document.getElementById('signupFirstName');
        const lastName = document.getElementById('signupLastName');
        const email = document.getElementById('signupEmail');
        const phone = document.getElementById('signupPhone');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const roleInputs = document.querySelectorAll('input[name="role"]');

        // Real-time validation
        if (username) {
            username.addEventListener('blur', () => this.validateUsername(username, 'signupUsernameError'));
            username.addEventListener('input', () => this.clearError('signupUsernameError'));
        }

        if (firstName) {
            firstName.addEventListener('blur', () => this.validateName(firstName, 'signupFirstNameError', 'First name'));
            firstName.addEventListener('input', () => this.clearError('signupFirstNameError'));
        }

        if (lastName) {
            lastName.addEventListener('blur', () => this.validateName(lastName, 'signupLastNameError', 'Last name'));
            lastName.addEventListener('input', () => this.clearError('signupLastNameError'));
        }

        if (email) {
            email.addEventListener('blur', () => this.validateEmail(email, 'signupEmailError'));
            email.addEventListener('input', () => this.clearError('signupEmailError'));
        }

        if (phone) {
            phone.addEventListener('blur', () => this.validatePhone(phone, 'signupPhoneError'));
            phone.addEventListener('input', () => this.clearError('signupPhoneError'));
        }

        if (password) {
            password.addEventListener('blur', () => this.validateSignupPassword(password, 'signupPasswordError'));
            password.addEventListener('input', () => this.clearError('signupPasswordError'));
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => this.validateConfirmPassword(password, confirmPassword, 'confirmPasswordError'));
            confirmPassword.addEventListener('input', () => this.clearError('confirmPasswordError'));
        }

        roleInputs.forEach(input => {
            input.addEventListener('change', () => this.clearError('signupRoleError'));
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!this.validateSignupForm(form)) {
                e.preventDefault();
                this.focusFirstError(form);
            }
        });
    }

    // Form Validation Methods
    validateLoginForm(form) {
        const username = document.getElementById('loginUsername');
        const password = document.getElementById('loginPassword');

        let isValid = true;

        // Validate all fields
        if (username) isValid = this.validateUsername(username, 'loginUsernameError') && isValid;
        if (password) isValid = this.validatePassword(password, 'loginPasswordError') && isValid;
        isValid = this.validateRole('loginForm', 'loginRoleError') && isValid;

        return isValid;
    }

    validateSignupForm(form) {
        const username = document.getElementById('signupUsername');
        const firstName = document.getElementById('signupFirstName');
        const lastName = document.getElementById('signupLastName');
        const email = document.getElementById('signupEmail');
        const phone = document.getElementById('signupPhone');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        let isValid = true;

        // Validate all fields
        if (username) isValid = this.validateUsername(username, 'signupUsernameError') && isValid;
        if (firstName) isValid = this.validateName(firstName, 'signupFirstNameError', 'First name') && isValid;
        if (lastName) isValid = this.validateName(lastName, 'signupLastNameError', 'Last name') && isValid;
        if (email) isValid = this.validateEmail(email, 'signupEmailError') && isValid;
        if (phone) isValid = this.validatePhone(phone, 'signupPhoneError') && isValid;
        if (password) isValid = this.validateSignupPassword(password, 'signupPasswordError') && isValid;
        if (confirmPassword) isValid = this.validateConfirmPassword(password, confirmPassword, 'confirmPasswordError') && isValid;
        isValid = this.validateRole('signupForm', 'signupRoleError') && isValid;

        return isValid;
    }

    // Individual Validation Methods
    validateUsername(input, errorId) {
        const value = input.value.trim();
        const errorElement = document.getElementById(errorId);

        if (!value) {
            this.showError(errorElement, 'Username is required');
            this.markInputInvalid(input);
            return false;
        }

        if (value.length < 3) {
            this.showError(errorElement, 'Username must be at least 3 characters');
            this.markInputInvalid(input);
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            this.showError(errorElement, 'Username can only contain letters, numbers, and underscores');
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validateName(input, errorId, fieldName) {
        const value = input.value.trim();
        const errorElement = document.getElementById(errorId);

        if (!value) {
            this.showError(errorElement, `${fieldName} is required`);
            this.markInputInvalid(input);
            return false;
        }

        if (value.length < 2) {
            this.showError(errorElement, `${fieldName} must be at least 2 characters`);
            this.markInputInvalid(input);
            return false;
        }

        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            this.showError(errorElement, `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validateEmail(input, errorId) {
        const value = input.value.trim();
        const errorElement = document.getElementById(errorId);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            this.showError(errorElement, 'Email address is required');
            this.markInputInvalid(input);
            return false;
        }

        if (!emailRegex.test(value)) {
            this.showError(errorElement, 'Please enter a valid email address');
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validatePhone(input, errorId) {
        const value = input.value.trim();
        const errorElement = document.getElementById(errorId);
        const phoneRegex = /^[0-9]{10,15}$/;

        if (!value) {
            this.showError(errorElement, 'Phone number is required');
            this.markInputInvalid(input);
            return false;
        }

        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            this.showError(errorElement, 'Phone number must be 10-15 digits');
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validatePassword(input, errorId) {
        const value = input.value;
        const errorElement = document.getElementById(errorId);

        if (!value) {
            this.showError(errorElement, 'Password is required');
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validateSignupPassword(input, errorId) {
        const value = input.value;
        const errorElement = document.getElementById(errorId);

        if (!value) {
            this.showError(errorElement, 'Password is required');
            this.markInputInvalid(input);
            return false;
        }

        if (value.length < 6) {
            this.showError(errorElement, 'Password must be at least 6 characters');
            this.markInputInvalid(input);
            return false;
        }

        if (!/(?=.*[a-zA-Z])/.test(value)) {
            this.showError(errorElement, 'Password must contain at least one letter');
            this.markInputInvalid(input);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(input);
        return true;
    }

    validateConfirmPassword(passwordInput, confirmInput, errorId) {
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const errorElement = document.getElementById(errorId);

        if (!confirmPassword) {
            this.showError(errorElement, 'Please confirm your password');
            this.markInputInvalid(confirmInput);
            return false;
        }

        if (password !== confirmPassword) {
            this.showError(errorElement, 'Passwords do not match');
            this.markInputInvalid(confirmInput);
            return false;
        }

        this.hideError(errorElement);
        this.markInputValid(confirmInput);
        return true;
    }

    validateRole(formId, errorId) {
        const roleInputs = document.querySelectorAll(`#${formId} input[name="role"]`);
        const errorElement = document.getElementById(errorId);
        const isSelected = Array.from(roleInputs).some(input => input.checked);

        if (!isSelected) {
            this.showError(errorElement, 'Please select your role');
            return false;
        }

        this.hideError(errorElement);
        return true;
    }

    // Utility Methods
    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            errorElement.style.color = '#dc3545';
        }
    }

    hideError(errorElement) {
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            this.hideError(errorElement);
        }
    }

    markInputValid(input) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }

    markInputInvalid(input) {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }

    clearValidationState(input) {
        input.classList.remove('valid', 'invalid');
    }

    clearAllValidationStates(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            this.clearValidationState(input);
        });

        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => {
            this.hideError(error);
        });
    }

    focusFirstError(form) {
        const firstError = form.querySelector('.error-message.show');
        if (firstError) {
            const inputId = firstError.id.replace('Error', '');
            const input = document.getElementById(inputId);
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Handle server-side validation errors (for when the server returns errors)
    handleServerErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}Error`);
            const input = document.getElementById(field);

            if (errorElement && input) {
                this.showError(errorElement, errors[field]);
                this.markInputInvalid(input);
            }
        });
    }
}

// Initialize the validator when the page loads
const authValidator = new AuthValidator();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthValidator;
}