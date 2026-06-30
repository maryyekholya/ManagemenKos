const fs = require('fs');

const API_BASE = 'http://127.0.0.1:8000/api/v1';

async function runTests() {
    console.log("=== STARTING SCENARIO TESTS ===");

    // helper
    const req = async (method, endpoint, body = null, token = null) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const text = await res.text();
        try {
            return { status: res.status, data: JSON.parse(text) };
        } catch (e) {
            return { status: res.status, data: text };
        }
    };

    // A1. Registrasi & Login
    console.log("\n[A1] Register & Login Test");
    const testEmail = `testuser_${Date.now()}@gmail.com`;
    let res = await req('POST', '/auth/register', {
        name: 'Test User',
        email: testEmail,
        password: 'password123',
        password_confirmation: 'password123',
        phone: '081234567890',
        address: 'Test Address'
    });
    console.log("Register:", res.status, res.data.message || 'Success');

    res = await req('POST', '/auth/login', {
        email: testEmail,
        password: 'password123'
    });
    console.log("Login User:", res.status, res.data.message || 'Success');
    const userToken = res.data.token;

    // Login Admin
    res = await req('POST', '/auth/login', {
        email: 'sari.dewi@gmail.com',
        password: 'password123'
    });
    const adminToken = res.data.token;
    console.log("Login Admin:", res.status, res.data.message || 'Success');

    // Login Manager
    res = await req('POST', '/auth/login', {
        email: 'hendra.wijaya@gmail.com',
        password: 'password123'
    });
    const managerToken = res.data.token;
    console.log("Login Manager:", res.status, res.data.message || 'Success');

    // C1. CRUD Kamar
    console.log("\n[C1] Kamar CRUD Test");
    res = await req('POST', '/admin/rooms', {
        nomor: `K-${Date.now()}`,
        tipe: 'Suite',
        fasilitas: 'AC, WiFi, Kasur',
        harga_dasar: 1500000,
        status: 'TERSEDIA'
    }, adminToken);
    console.log("Create Kamar:", res.status, res.data.message || 'Success');
    const kamarId1 = res.data.data.id;

    res = await req('POST', '/admin/rooms', {
        nomor: `K2-${Date.now()}`,
        tipe: 'Standard',
        fasilitas: 'Kipas, Kasur',
        harga_dasar: 1000000,
        status: 'TERSEDIA'
    }, adminToken);
    const kamarId2 = res.data.data.id;

    res = await req('PUT', `/admin/rooms/${kamarId1}`, {
        harga_dasar: 1600000
    }, adminToken);
    console.log("Update Kamar:", res.status, res.data.message || 'Success');

    // A2. Pemesanan via QRIS
    console.log("\n[A2] Booking via QRIS Test");
    res = await req('POST', '/bookings', {
        kamar_id: kamarId1,
        durasi_bulan: 3
    }, userToken);
    console.log("Create Booking (QRIS):", res.status, res.data.message || 'Success');
    const bookingQrisId = res.data.data.id;

    res = await req('PUT', `/bookings/${bookingQrisId}/proceed`, null, userToken);
    res = await req('PUT', `/bookings/${bookingQrisId}/pay`, {
        metode_pembayaran: 'QRIS'
    }, userToken);
    console.log("Pay QRIS:", res.status, res.data.message || 'Success');
    console.log("Status after QRIS:", res.data.data?.status); // should be DIHUNI

    // C3. Evict Kamar
    console.log("\n[C3] Evict Kamar Test");
    res = await req('PUT', `/admin/rooms/${kamarId1}/evict`, null, adminToken);
    console.log("Evict Kamar:", res.status, res.data.message || 'Success');

    // A3. Pemesanan via Cash/Transfer
    console.log("\n[A3] Booking via TRANSFER Test");
    res = await req('POST', '/bookings', {
        kamar_id: kamarId2,
        durasi_bulan: 2
    }, userToken);
    const bookingTransferId = res.data.data.id;

    res = await req('PUT', `/bookings/${bookingTransferId}/proceed`, null, userToken);
    res = await req('PUT', `/bookings/${bookingTransferId}/pay`, {
        metode_pembayaran: 'TRANSFER'
    }, userToken);
    console.log("Pay TRANSFER:", res.status, res.data.message || 'Success');
    console.log("Status after TRANSFER (Before manager):", res.data.data?.status); // should be DIKONFIRMASI

    // B1 & B2. Verifikasi Manager
    console.log("\n[B1 & B2] Manager Verification Test");
    res = await req('GET', '/admin/bookings', null, managerToken);
    if (!res.data || !res.data.data) {
        console.error("GET /admin/bookings failed:", res);
    }
    let pendingCount = res.data.data.filter(b => b.status === 'DIKONFIRMASI').length;
    console.log(`Manager sees ${pendingCount} pending verifications.`);

    res = await req('PUT', `/admin/bookings/${bookingTransferId}/approve`, null, managerToken);
    console.log("Manager Approve:", res.status, res.data.message || 'Success');
    console.log("Status after Approve:", res.data.data?.status); // should be DIHUNI

    // A4. Perpanjangan Kamar (Extend)
    console.log("\n[A4] Extend Booking Test");
    res = await req('POST', `/bookings/${bookingTransferId}/extend`, {
        tambahan_bulan: 1
    }, userToken);
    console.log("Extend Booking:", res.status, res.data.message || 'Success');

    // B3. Penanganan Keluhan
    console.log("\n[B3] Keluhan Test");
    res = await req('POST', '/complaints', {
        kategori: 'FASILITAS',
        deskripsi: 'Air AC menetes deras'
    }, userToken);
    const keluhanId = res.data.data?.id;
    if (keluhanId) {
        console.log("User create keluhan:", res.status, res.data.message || 'Success');
        res = await req('PUT', `/admin/complaints/${keluhanId}/respond`, {
            status: 'SELESAI',
            respon_manager: 'Sudah diperbaiki teknisi'
        }, adminToken);
        console.log("Admin resolve keluhan:", res.status, res.data.message || 'Success');
    }

    // C2. Manajemen Akun (Deaktivasi)
    console.log("\n[C2] Deactivate User Test");
    // get users
    res = await req('GET', '/admin/users', null, adminToken);
    const testUserObj = res.data.data.find(u => u.email === testEmail);

    if (testUserObj) {
        res = await req('PUT', `/admin/users/${testUserObj.id}/toggle-active`, null, adminToken);
        console.log("Admin toggle active:", res.status, res.data.message || 'Success');

        res = await req('POST', '/auth/login', {
            email: testEmail,
            password: 'password123'
        });
        console.log("Login Inactive User:", res.status, res.data.message || 'Success'); // should fail 403
    }

    console.log("\n=== ALL TESTS FINISHED ===");
}

runTests();
