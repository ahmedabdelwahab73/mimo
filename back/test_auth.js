const testAuth = async () => {
	const baseUrl = 'http://localhost:5000/api';

	try {
		console.log('--- 1. Registering/Updating User ---');
		// First clear and create user to ensure hashing happens
		// Note: Our current routes might need a fix if we want to update password properly, 
		// but a new user will definitely be hashed.
		const username = 'admin_' + Date.now();
		const password = 'mySecretPassword123';

		const regRes = await fetch(`${baseUrl}/users`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const userData = await regRes.json();
		console.log('Registration Success (Password should be hashed in DB):', userData.username);

		console.log('\n--- 2. Logging In ---');
		const loginRes = await fetch(`${baseUrl}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const tokens = await loginRes.json();
		console.log('Login Success! Received Tokens:', !!tokens.accessToken, !!tokens.refreshToken);

		console.log('\n--- 3. Refreshing Token ---');
		const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken: tokens.refreshToken })
		});
		const newToken = await refreshRes.json();
		console.log('Refresh Success! New Access Token:', !!newToken.accessToken);

		console.log('\n--- 4. Logging Out ---');
		const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken: tokens.refreshToken })
		});
		console.log('Logout Status:', logoutRes.status);

	} catch (err) {
		console.error('Auth Test Failed:', err.message);
	}
};

testAuth();
