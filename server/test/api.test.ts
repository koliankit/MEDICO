import app from '../src/app';
import http from 'http';
import { checkEmergencyRedFlags, evaluateSymptoms } from '../src/services/aiService';

let server: http.Server;
const TEST_PORT = 5001;

async function runTests() {
  console.log('--- Starting Automated City Hospital Pune Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✔ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✘ FAIL: ${testName}`);
      failed++;
    }
  }

  // Unit Test 1: Emergency Red Flag Screening (Cardiac Warning Signs)
  console.log('\n[1. Medical AI Safety Screening Tests]');
  const cardiacEmergency = checkEmergencyRedFlags({
    ageGroup: 'Adult',
    chiefComplaint: 'Crushing severe chest pain radiating to left arm with cold sweating',
    symptoms: [{ symptom: 'Chest pressure', severity: 'Severe', location: 'Mid chest' }],
  });
  assert(cardiacEmergency.isEmergency === true, 'Correctly identifies acute cardiac emergency red flags');
  assert(cardiacEmergency.helpline.includes('112'), 'Provides 112 India emergency helpline for immediate emergency intervention');

  // Unit Test 2: Emergency Red Flag Screening (Stroke FAST Signs)
  const strokeEmergency = checkEmergencyRedFlags({
    ageGroup: 'Senior',
    chiefComplaint: 'Sudden slurred speech and right side facial droop',
    symptoms: [{ symptom: 'Sudden weakness on one side of face', severity: 'Severe' }],
  });
  assert(strokeEmergency.isEmergency === true, 'Correctly identifies acute stroke FAST warning signs');

  // Unit Test 3: Routine Symptoms (No Emergency Triggered)
  const routineCold = checkEmergencyRedFlags({
    ageGroup: 'Adult',
    chiefComplaint: 'Runny nose and mild sore throat for 2 days',
    symptoms: [{ symptom: 'Sore throat', severity: 'Mild' }],
  });
  assert(routineCold.isEmergency === false, 'Allows routine outpatient non-emergency symptoms to proceed');

  // Unit Test 4: AI Decision Support Evaluation Output Structure
  const aiResult = await evaluateSymptoms({
    ageGroup: 'Adult',
    chiefComplaint: 'Sour acid taste in throat and mild heartburn after heavy meals',
    symptoms: [{ symptom: 'Acid reflux', severity: 'Mild' }],
  });
  assert(aiResult.aiUrgencyLevel !== 'EMERGENCY', 'Non-emergency symptom assigned non-emergency urgency level');
  assert(aiResult.possibleExplanations.length > 0, 'Generates differential possibilities to discuss with a clinician');
  assert(aiResult.questionsForDoctor.length > 0, 'Provides patient questions for doctor consultation');
  assert(aiResult.references.length > 0, 'Attaches authoritative medical references (WHO, NHS, MoHFW)');
  assert(aiResult.isAiGenerated === true, 'Properly flags output as AI-generated');
  assert(aiResult.disclaimer.includes('NOT a medical diagnosis'), 'Contains mandatory clinical decision support disclaimer');

  // API Integration Tests using server instance
  server = app.listen(TEST_PORT, async () => {
    try {
      console.log('\n[2. API Integration Tests]');

      // Test 5: Health Check
      const healthRes = await fetch(`http://localhost:${TEST_PORT}/api/health`);
      const healthData = await healthRes.json();
      assert(healthRes.status === 200 && healthData.status === 'ONLINE', 'GET /api/health returns 200 ONLINE');

      // Test 6: Demo Login for Doctor Role
      const loginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'DOCTOR' }),
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200 && loginData.user.role === 'DOCTOR', 'POST /api/auth/demo-login logs in as DOCTOR');
      const doctorToken = loginData.token;

      // Test 7: Demo Login for Patient Role
      const patientLoginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'PATIENT' }),
      });
      const patientLoginData = await patientLoginRes.json();
      assert(patientLoginRes.status === 200 && patientLoginData.user.role === 'PATIENT', 'POST /api/auth/demo-login logs in as PATIENT');
      const patientToken = patientLoginData.token;

      // Test 8: Patient Dashboard Data Isolation
      const patientMeRes = await fetch(`http://localhost:${TEST_PORT}/api/patients/me`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      const patientMeData = await patientMeRes.json();
      assert(patientMeRes.status === 200 && patientMeData.patientId === 'CHP-2026-0041', 'GET /api/patients/me returns authenticated patient record');
      assert(patientMeData.vitals.length > 0, 'Returns patient vitals timeline');
      assert(patientMeData.medications.length > 0, 'Returns active patient medications');

      // Test 9: Public Department Directory
      const deptRes = await fetch(`http://localhost:${TEST_PORT}/api/departments`);
      const deptData = await deptRes.json();
      assert(deptRes.status === 200 && Array.isArray(deptData) && deptData.length >= 6, 'GET /api/departments returns active medical departments');

      // Test 10: Public Verified Doctor Directory
      const docRes = await fetch(`http://localhost:${TEST_PORT}/api/doctors`);
      const docData = await docRes.json();
      assert(docRes.status === 200 && Array.isArray(docData) && docData.length >= 6, 'GET /api/doctors returns verified doctor profiles');

      // Test 11: Curated Medical Education Articles with Attribution
      const eduRes = await fetch(`http://localhost:${TEST_PORT}/api/education/articles`);
      const eduData = await eduRes.json();
      assert(eduRes.status === 200 && eduData.length >= 5, 'GET /api/education/articles returns educational articles citing WHO/MoHFW/NHS');
      assert(eduData.some((a: any) => a.sourceUrl.includes('who.int') || a.sourceUrl.includes('mohfw.gov.in')), 'Educational resources cite authoritative official sources');

      // Test 12: Laboratory Catalog
      const labCatRes = await fetch(`http://localhost:${TEST_PORT}/api/laboratory/catalog`);
      const labCatData = await labCatRes.json();
      assert(labCatRes.status === 200 && labCatData.length >= 4, 'GET /api/laboratory/catalog returns lab test catalog with reference intervals');

      // Test 13: Doctor Queue Today
      const queueRes = await fetch(`http://localhost:${TEST_PORT}/api/doctors/queue/today`, {
        headers: { Authorization: `Bearer ${doctorToken}` },
      });
      const queueData = await queueRes.json();
      assert(queueRes.status === 200 && Array.isArray(queueData), 'GET /api/doctors/queue/today returns doctor appointment queue');

      // Test 14: Role Isolation - Patient cannot access admin stats
      const forbiddenAdminRes = await fetch(`http://localhost:${TEST_PORT}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      assert(forbiddenAdminRes.status === 403, 'Enforces server-side RBAC: Patient forbidden from accessing /api/admin/stats');

      console.log(`\n====================================================`);
      console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
      console.log(`====================================================\n`);

      server.close(() => {
        if (failed > 0) {
          process.exit(1);
        } else {
          process.exit(0);
        }
      });
    } catch (err) {
      console.error('Test execution error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
