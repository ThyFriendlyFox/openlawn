#!/usr/bin/env node
/**
 * Seed Auth + Firestore emulators for Ralph UI testing.
 * Uses Admin SDK (bypasses security rules on emulators).
 */
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const PROJECT_ID = 'demo-openlawn';
const COMPANY_ID = 'company-ralph-test';
const COMPANY_NAME = 'Ralph Test Lawn Co';

if (!admin.getApps().length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const auth = getAuth();
const db = getFirestore();

async function ensureUser(email, password, displayName) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName });
    return existing.uid;
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      const created = await auth.createUser({ email, password, displayName, emailVerified: true });
      return created.uid;
    }
    throw e;
  }
}

async function main() {
  const managerUid = await ensureUser('manager@ralph.test', 'password123', 'Ralph Manager');
  const employeeUid = await ensureUser('employee@ralph.test', 'password123', 'Ralph Employee');
  const pendingUid = await ensureUser('pending@ralph.test', 'password123', 'Ralph Pending');

  const now = Timestamp.now();

  await db.collection('companies').doc(COMPANY_ID).set({
    name: COMPANY_NAME,
    owner: managerUid,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('users').doc(managerUid).set({
    name: 'Ralph Manager',
    email: 'manager@ralph.test',
    phone: '',
    role: 'manager',
    status: 'available',
    accountStatus: 'active',
    companyId: COMPANY_ID,
    displayName: 'Ralph Manager',
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('users').doc(employeeUid).set({
    name: 'Ralph Employee',
    email: 'employee@ralph.test',
    phone: '',
    role: 'employee',
    status: 'available',
    accountStatus: 'active',
    companyId: COMPANY_ID,
    displayName: 'Ralph Employee',
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('users').doc(pendingUid).set({
    name: 'Ralph Pending',
    email: 'pending@ralph.test',
    phone: '',
    role: 'employee',
    status: 'available',
    accountStatus: 'pending',
    companyId: COMPANY_ID,
    displayName: 'Ralph Pending',
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('customers').doc('customer-ralph-1').set({
    name: 'Acme Yard',
    address: '123 Green St, Austin, TX',
    lat: 30.2672,
    lng: -97.7431,
    status: 'active',
    companyId: COMPANY_ID,
    createdBy: managerUid,
    services: [],
    createdAt: now,
    updatedAt: now,
  });

  console.log(JSON.stringify({
    ok: true,
    companyId: COMPANY_ID,
    companyName: COMPANY_NAME,
    accounts: {
      manager: { email: 'manager@ralph.test', password: 'password123', uid: managerUid },
      employee: { email: 'employee@ralph.test', password: 'password123', uid: employeeUid },
      pending: { email: 'pending@ralph.test', password: 'password123', uid: pendingUid },
    },
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
