import { Router, Request, Response } from 'express';

const router = Router();

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  sourceOrganization: string;
  sourceUrl: string;
  publicationDate: string;
  verificationDate: string;
  reviewStatus: string;
  summary: string;
  keyPoints: string[];
}

export const curatedArticles: HealthArticle[] = [
  {
    id: 'edu-01',
    title: 'Recognizing Acute Cardiac Symptoms and Time-Critical Care',
    category: 'Cardiology',
    sourceOrganization: 'Ministry of Health and Family Welfare, Govt. of India',
    sourceUrl: 'https://mohfw.gov.in/',
    publicationDate: '2023-11-15',
    verificationDate: '2026-03-01',
    reviewStatus: 'Medically Reviewed by Clinical Panel',
    summary:
      'Cardiovascular disease remains the leading cause of mortality globally and in India. Early recognition of ischemic warning signs—such as retrosternal pressure, radiation to left arm or jaw, unexplained diaphoresis, and sudden dyspnea—allows rapid intervention within the "golden hour."',
    keyPoints: [
      'Call 112 immediately in India if crushing chest pain radiates to left arm or jaw with cold sweats.',
      'Do not attempt to drive yourself to the hospital during suspected cardiac distress.',
      'Control known modifiable risk factors: blood pressure (< 130/80 mmHg), LDL cholesterol, and smoking cessation.',
    ],
  },
  {
    id: 'edu-02',
    title: 'Ayushman Bharat Digital Mission (ABDM) & Your ABHA Health ID',
    category: 'Digital Health & ABDM',
    sourceOrganization: 'National Health Authority (NHA), Govt. of India',
    sourceUrl: 'https://abdm.gov.in/',
    publicationDate: '2024-01-10',
    verificationDate: '2026-02-15',
    reviewStatus: 'Official Government Clinical Guidance',
    summary:
      'The Ayushman Bharat Health Account (ABHA) is a 14-digit unique identifier that enables citizens to store, manage, and share electronic health records seamlessly across verified healthcare providers in India with explicit patient consent under the DPDP Act.',
    keyPoints: [
      'Your health records remain completely under your consent and control.',
      'Eliminates the risk of losing physical diagnostic reports or prescription slips.',
      'Interoperable across hospitals, diagnostic centers, and clinics throughout India.',
    ],
  },
  {
    id: 'edu-03',
    title: 'Hypertension Management: DASH Diet and Lifestyle Interventions',
    category: 'Preventive Medicine',
    sourceOrganization: 'World Health Organization (WHO)',
    sourceUrl: 'https://www.who.int/health-topics/hypertension',
    publicationDate: '2023-09-20',
    verificationDate: '2026-01-28',
    reviewStatus: 'Peer-Reviewed WHO Technical Series',
    summary:
      'High blood pressure is often termed the "silent killer" because it frequently produces no early symptoms until target organ damage occurs. Dietary sodium reduction, potassium-rich nutrition (DASH diet), and regular physical exercise significantly reduce cardiovascular event risk.',
    keyPoints: [
      'Target daily sodium intake below 2,000 mg (approximately 1 teaspoon of table salt).',
      'Engage in at least 150 minutes of moderate-intensity aerobic exercise per week.',
      'Maintain home blood pressure monitoring logs for your attending physician.',
    ],
  },
  {
    id: 'edu-04',
    title: 'Understanding Common Cold vs. Influenza vs. Respiratory Infections',
    category: 'Respiratory Health',
    sourceOrganization: 'National Health Service (NHS UK)',
    sourceUrl: 'https://www.nhs.uk/conditions/common-cold/',
    publicationDate: '2024-02-18',
    verificationDate: '2026-02-10',
    reviewStatus: 'Clinically Verified by NHS Primary Care Group',
    summary:
      'Distinguishing between mild viral upper respiratory tract infections and conditions requiring antimicrobial or supportive hospital care. Antibiotics do not cure viral infections and should never be taken without formal prescription.',
    keyPoints: [
      'Hydration, rest, and warm saline gargles remain the cornerstone of uncomplicated viral recovery.',
      'Red flags requiring urgent review include persistent high fever (>102°F) beyond 3 days, breathlessness, or chest pain.',
      'Never use leftover antibiotics for routine seasonal colds.',
    ],
  },
  {
    id: 'edu-05',
    title: 'Type 2 Diabetes: Glycemic Targets and Preventing Microvascular Complications',
    category: 'Endocrinology & Metabolism',
    sourceOrganization: 'MedlinePlus (US National Library of Medicine)',
    sourceUrl: 'https://medlineplus.gov/diabetes.html',
    publicationDate: '2024-01-05',
    verificationDate: '2026-03-05',
    reviewStatus: 'Reviewed by National Institutes of Health (NIH)',
    summary:
      'Consistent glycemic control measured via quarterly HbA1c testing dramatically decreases the incidence of diabetic retinopathy, nephropathy, and peripheral neuropathy. A multidisciplinary approach combining dietary fiber, exercise, and prescribed medications is essential.',
    keyPoints: [
      'Target HbA1c for most non-pregnant adults is typically under 7.0%, personalized by your physician.',
      'Annual dilated eye exams and urine microalbumin testing are recommended for all diabetic patients.',
      'Inspect feet daily for cuts, blisters, or loss of sensation.',
    ],
  },
  {
    id: 'edu-06',
    title: 'Emergency Medical Helplines & Response in Maharashtra & India',
    category: 'Emergency Medicine',
    sourceOrganization: 'India Emergency Response Support System (ERSS)',
    sourceUrl: 'https://112.gov.in/',
    publicationDate: '2024-01-01',
    verificationDate: '2026-01-01',
    reviewStatus: 'National Standard Protocol',
    summary:
      'Dial 112 for all-in-one emergency response across India (Police, Fire, and Ambulance). In medical crises, immediate notification of emergency dispatchers saves vital minutes for paramedic dispatch.',
    keyPoints: [
      '112 is toll-free and accessible even on phones without an active SIM card balance.',
      'State your precise location, landmarks in Pune, and primary patient condition clearly to the operator.',
      'City Hospital Pune Emergency OPD operates 24x7 with dedicated cardiac and trauma resuscitation suites.',
    ],
  },
];

router.get('/articles', (req: Request, res: Response) => {
  res.json(curatedArticles);
});

export default router;
