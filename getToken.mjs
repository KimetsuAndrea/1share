// Import the `fbkey` module
import fbkey from 'fbkey';

// Retrieve the email and password from the environment variables
const email = process.env.email;
const password = process.env.password;

// Check if email and password are available
if (email && password) {
    try {
        // Login to the account and get the token
        const token = await fbkey.getKey(email, password);
        console.log(token);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
} else {
    console.error('Please set the email and password environment variables.');
}
