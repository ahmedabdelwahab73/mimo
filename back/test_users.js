const test = async () => {
	try {
		const postRes = await fetch('http://localhost:5000/api/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: 'admin',
				password: 'hashed_password_here',
				role: 'admin',
				refreshToken: 'token_will_go_here'
			}),
		});
		const postData = await postRes.json();
		console.log('POST Response:', postData);

		const getRes = await fetch('http://localhost:5000/api/users');
		const getData = await getRes.json();
		console.log('GET Response:', getData);
	} catch (err) {
		console.error('Test Error:', err.message);
	}
};

test();
