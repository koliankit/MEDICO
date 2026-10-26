import { jsPDF } from 'jspdf';

export function generateLabReportPdf(report: any) {
  const doc = new jsPDF();

  // Hospital Header
  doc.setFillColor(11, 37, 69); // #0B2545 Hospital Navy
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY HOSPITAL PUNE', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Department of Clinical Pathology & Diagnostic Medicine', 14, 23);
  doc.text('NABL Accredited Laboratory | Shivajinagar, Pune 411005 | Phone: +91 20 2567 8900', 14, 30);

  // Document Title
  doc.setTextColor(11, 37, 69);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL DIAGNOSTIC LABORATORY REPORT', 14, 46);

  // Divider
  doc.setDrawColor(0, 168, 150);
  doc.setLineWidth(0.8);
  doc.line(14, 49, 196, 49);

  // Patient & Order Meta Table
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 53, 182, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(14, 53, 182, 34, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT NAME:', 18, 60);
  doc.text('PATIENT ID:', 18, 67);
  doc.text('AGE / GENDER:', 18, 74);
  doc.text('ABHA ID:', 18, 81);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.patient?.name || 'Rahul Sharma', 55, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(report.patient?.patientId || 'CHP-2026-0041', 55, 67);
  doc.text(`${report.patient?.age || 38} Y / ${report.patient?.gender || 'Male'} (${report.patient?.bloodGroup || 'B+'})`, 55, 74);
  doc.text(report.patient?.abhaId || '91-8842-1049-3321', 55, 81);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ORDER NUMBER:', 115, 60);
  doc.text('REFERRING DOCTOR:', 115, 67);
  doc.text('COLLECTION DATE:', 115, 74);
  doc.text('REPORT STATUS:', 115, 81);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.orderNumber || 'LAB-2026-0812', 155, 60);
  doc.text(report.referringDoctor?.name || 'Dr. Anita Joshi', 155, 67);
  doc.text(new Date(report.sampleCollectedAt || report.orderDate).toLocaleDateString(), 155, 74);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Green
  doc.text(report.status || 'VERIFIED', 155, 81);

  // Table Header for Results
  let y = 98;
  doc.setFillColor(19, 64, 116); // Hospital Blue
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST PARAMETER', 18, y + 5.5);
  doc.text('OBSERVED VALUE', 95, y + 5.5);
  doc.text('UNIT', 130, y + 5.5);
  doc.text('REFERENCE INTERVAL', 155, y + 5.5);

  y += 10;

  // Results rows
  const results = report.results || [];
  results.forEach((r: any, idx: number) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 2, 182, 9, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(r.testName, 18, y + 4);

    // Value with bold if abnormal
    const isAbnormal = r.flag === 'HIGH' || r.flag === 'LOW';
    if (isAbnormal) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`${r.value} [${r.flag}]`, 95, y + 4);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(r.value, 95, y + 4);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(r.unit || '-', 130, y + 4);
    doc.text(r.referenceRange || 'Refer to text', 155, y + 4);

    y += 10;
  });

  // Clinical Indication & Notes
  y += 5;
  if (report.clinicalIndication) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CLINICAL INDICATION:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(report.clinicalIndication, 58, y);
    y += 10;
  }

  // Verification & Sign-off Stamp
  y = Math.max(y + 10, 220);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ELECTRONICALLY VERIFIED BY:', 14, y);
  doc.text('DIGITAL VERIFICATION HASH:', 120, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. Amit Shinde, MD (Pathology)', 14, y);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(report.verificationHash || 'SHA256:4f8a3d1b9e2c7a5f', 120, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Chief Pathologist & Laboratory Director', 14, y);
  doc.text('ABDM-Linked Validated Digital Health Artifact', 120, y);

  // Footer Disclaimer
  y += 12;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Notice: This diagnostic report is confidential and protected by applicable health privacy laws. Results should be interpreted by an authorized clinician in correlation with clinical history. Demo record.',
    14,
    y
  );

  doc.save(`CityHospitalPune_LabReport_${report.orderNumber || 'LAB'}.pdf`);
}

export function generateVisitSummaryPdf(encounter: any) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(11, 37, 69);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY HOSPITAL PUNE', 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Outpatient Clinical Encounter & Prescription Record', 14, 22);
  doc.text('Shivajinagar, Pune 411005 | Emergency: 112 | Contact: +91 20 2567 8900', 14, 28);

  // Title
  doc.setTextColor(11, 37, 69);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL VISIT SUMMARY', 14, 42);

  doc.setDrawColor(0, 168, 150);
  doc.setLineWidth(0.8);
  doc.line(14, 45, 196, 45);

  // Meta box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 49, 182, 26, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 49, 182, 26, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT:', 18, 56);
  doc.text('DATE:', 18, 63);
  doc.text('DOCTOR:', 18, 70);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(encounter.patient?.name || 'Rahul Sharma', 45, 56);
  doc.text(new Date(encounter.date || encounter.createdAt).toLocaleDateString(), 45, 63);
  doc.text(`${encounter.doctor?.name || 'Dr. Anita Joshi'} (${encounter.doctor?.department || 'Cardiology'})`, 45, 70);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT ID:', 120, 56);
  doc.text('ENCOUNTER ID:', 120, 63);
  doc.text('LICENSE #:', 120, 70);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(encounter.patient?.patientId || 'CHP-2026-0041', 155, 56);
  doc.text(encounter.encounterId?.slice(0, 12) || 'ENC-901', 155, 63);
  doc.text(encounter.doctor?.licenseNumber || 'MCI-MH-45892', 155, 70);

  // Clinical Findings
  let y = 84;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 37, 69);
  doc.text('CLINICAL FINDINGS (SOAP NOTE)', 14, y);
  y += 6;

  const findings = [
    { label: 'Chief Complaint', val: encounter.clinicalFindings?.chiefComplaint || 'Follow up' },
    { label: 'History of Present Illness', val: encounter.clinicalFindings?.historyOfPresentIllness || 'Stable' },
    { label: 'Physical Examination', val: encounter.clinicalFindings?.examinationNotes || 'Normal' },
    { label: 'Final Diagnosis', val: `${encounter.clinicalFindings?.diagnosis || 'Essential Hypertension'} (ICD-10: ${encounter.clinicalFindings?.icdCode || 'I10'})` },
    { label: 'Treatment Plan', val: encounter.clinicalFindings?.treatmentPlan || 'Continue current medications' },
  ];

  findings.forEach((f) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${f.label.toUpperCase()}:`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitLines = doc.splitTextToSize(f.val, 140);
    doc.text(splitLines, 55, y);
    y += Math.max(splitLines.length * 5, 8);
  });

  // Prescriptions Table
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 37, 69);
  doc.text('PRESCRIBED MEDICATIONS', 14, y);
  y += 6;

  doc.setFillColor(19, 64, 116);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICATION', 18, y + 4.8);
  doc.text('DOSAGE & FREQUENCY', 80, y + 4.8);
  doc.text('DURATION', 130, y + 4.8);
  doc.text('INSTRUCTIONS', 155, y + 4.8);
  y += 8;

  const rxs = encounter.prescriptions || [];
  rxs.forEach((rx: any, idx: number) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 2, 182, 8, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(rx.medicationName, 18, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${rx.dosage || ''} - ${rx.frequency || ''}`, 80, y + 3.5);
    doc.text(rx.duration || 'As directed', 130, y + 3.5);
    doc.text(rx.instructions || 'After food', 155, y + 3.5);
    y += 8;
  });

  // Doctor Signature
  y = Math.max(y + 15, 240);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Digitally Signed by: ${encounter.doctor?.name || 'Dr. Anita Joshi'}`, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`License No: ${encounter.doctor?.licenseNumber || 'MCI-MH-45892'} | Timestamp: ${new Date().toLocaleString()}`, 14, y + 6);

  doc.save(`CityHospitalPune_Encounter_${encounter.patient?.patientId || 'REC'}.pdf`);
}
