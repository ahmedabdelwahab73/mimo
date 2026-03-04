const testSlider = async () => {
	const baseUrl = 'http://localhost:5000/api';
	let accessToken = '';
	let sliderId = '';

	try {
		// ============================================
		// STEP 0: Prove that login works WITHOUT token
		// ============================================
		console.log('=== STEP 0: Login (no token needed, only lang) ===');
		const loginRes = await fetch(`${baseUrl}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'lang': 'en',
			},
			body: JSON.stringify({ username: 'admin', password: 'hashed_password_here' }),
		});
		const loginData = await loginRes.json();
		console.log('Login Status:', loginRes.status);
		console.log('Login Response:', loginData);
		accessToken = loginData.accessToken;

		// ============================================
		// STEP 1: Prove lang header is REQUIRED
		// ============================================
		console.log('\n=== STEP 1: Request WITHOUT lang header → should get 400 ===');
		const noLangRes = await fetch(`${baseUrl}/sliders`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const noLangData = await noLangRes.json();
		console.log('Status:', noLangRes.status, '| Response:', noLangData);

		// ============================================
		// STEP 2: Prove token is REQUIRED (except login)
		// ============================================
		console.log('\n=== STEP 2: Request WITHOUT token → should get 401 ===');
		const noTokenRes = await fetch(`${baseUrl}/sliders`, {
			headers: {
				'lang': 'en',
			},
		});
		const noTokenData = await noTokenRes.json();
		console.log('Status:', noTokenRes.status, '| Response:', noTokenData);

		// ============================================
		// STEP 3: ADD slider
		// ============================================
		console.log('\n=== STEP 3: ADD Slider ===');
		const addRes = await fetch(`${baseUrl}/sliders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				image: '/images/slider/summer.jpg',
				sort: 1,
				active: true,
			}),
		});
		const addData = await addRes.json();
		sliderId = addData._id;
		console.log('Status:', addRes.status, '| Slider:', addData);

		// ============================================
		// STEP 4: LIST all sliders
		// ============================================
		console.log('\n=== STEP 4: LIST All Sliders ===');
		const listRes = await fetch(`${baseUrl}/sliders`, {
			headers: {
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const listData = await listRes.json();
		console.log('Status:', listRes.status, '| Count:', listData.length, '| Sliders:', listData);

		// ============================================
		// STEP 5: SHOW single slider (info)
		// ============================================
		console.log('\n=== STEP 5: SHOW Single Slider ===');
		const showRes = await fetch(`${baseUrl}/sliders/${sliderId}`, {
			headers: {
				'lang': 'ar',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const showData = await showRes.json();
		console.log('Status:', showRes.status, '| Slider:', showData);

		// ============================================
		// STEP 6: UPDATE slider (edit)
		// ============================================
		console.log('\n=== STEP 6: UPDATE Slider ===');
		const updateRes = await fetch(`${baseUrl}/sliders/${sliderId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				image: '/images/slider/winter.jpg',
				sort: 2,
			}),
		});
		const updateData = await updateRes.json();
		console.log('Status:', updateRes.status, '| Updated:', updateData);

		// ============================================
		// STEP 7: TOGGLE active status
		// ============================================
		console.log('\n=== STEP 7: TOGGLE Active ===');
		const toggleRes = await fetch(`${baseUrl}/sliders/${sliderId}/active`, {
			method: 'PATCH',
			headers: {
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const toggleData = await toggleRes.json();
		console.log('Status:', toggleRes.status, '| Active now:', toggleData.active);

		// ============================================
		// STEP 8: GET active sliders only
		// ============================================
		console.log('\n=== STEP 8: GET Active Sliders Only ===');
		const activeRes = await fetch(`${baseUrl}/sliders/active`, {
			headers: {
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const activeData = await activeRes.json();
		console.log('Status:', activeRes.status, '| Active Sliders:', activeData);

		// ============================================
		// STEP 9: DELETE slider
		// ============================================
		console.log('\n=== STEP 9: DELETE Slider ===');
		const deleteRes = await fetch(`${baseUrl}/sliders/${sliderId}`, {
			method: 'DELETE',
			headers: {
				'lang': 'en',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const deleteData = await deleteRes.json();
		console.log('Status:', deleteRes.status, '| Response:', deleteData);

		console.log('\n✅ ALL TESTS COMPLETED!');

	} catch (err) {
		console.error('❌ Test Error:', err.message);
	}
};

testSlider();
