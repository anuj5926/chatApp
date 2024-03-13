const form = document.getElementById('registrationForm');
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const userData = {};
    formData.forEach((value, key) => {
        userData[key] = value;
    });
    try {
        const response = await fetch('http://localhost:3000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const responseData = await response;
        if (responseData.status === 201) {
            alert('Data saved successfully!');
            form.reset();

            window.location.href = '/chatroom';
        }
        else {
            const errorData = await response.json();
            errorMessageElement.textContent = errorData.message;

        }

    } catch (error) {
        toastr.error('Something Went Wrong')
        console.error('Error registering user:', error.message);
    }
});
