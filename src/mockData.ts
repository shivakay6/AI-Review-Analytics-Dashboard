import { Visit, StoreInfo } from './types';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STORES: StoreInfo[] = [
  // Required 9 stores from prompt
  { name: 'Jadavpur - Kolkata', city: 'Kolkata', state: 'West Bengal', tier: 'strong', manager: 'Anirban Mukherjee' },
  { name: 'KONNI', city: 'Konni', state: 'Kerala', tier: 'strong', manager: 'George Thomas' },
  { name: 'Jasdan - GU', city: 'Jasdan', state: 'Gujarat', tier: 'medium', manager: 'Bhavik Patel' },
  { name: 'Chandipur, WB', city: 'Chandipur', state: 'West Bengal', tier: 'strong', manager: 'Subhashish Roy' },
  { name: 'Tollygunge', city: 'Kolkata', state: 'West Bengal', tier: 'medium', manager: 'Debolina Sen' },
  { name: 'PALANI- GANDHI MARKET', city: 'Palani', state: 'Tamil Nadu', tier: 'strong', manager: 'Senthil Kumar' },
  { name: 'Nager Bazar-Kolkatta', city: 'Kolkata', state: 'West Bengal', tier: 'medium', manager: 'Rituparna Das' },
  { name: 'Tamluk - WB', city: 'Tamluk', state: 'West Bengal', tier: 'medium', manager: 'Bikramaditya Ghosh' },
  { name: 'Kotdwara - Uttrakhand', city: 'Kotdwar', state: 'Uttarakhand', tier: 'weak', manager: 'Virender Rawat' },
  // 28 additional Indian branch names
  { name: 'Andheri East - Mumbai', city: 'Mumbai', state: 'Maharashtra', tier: 'medium', manager: 'Rajesh Sharma' },
  { name: 'Connaught Place - New Delhi', city: 'New Delhi', state: 'Delhi', tier: 'strong', manager: 'Amit Verma' },
  { name: 'Koramangala - Bangalore', city: 'Bengaluru', state: 'Karnataka', tier: 'medium', manager: 'Sandeep Rao' },
  { name: 'Anna Nagar - Chennai', city: 'Chennai', state: 'Tamil Nadu', tier: 'medium', manager: 'Karthik Narayanan' },
  { name: 'Banjara Hills - Hyderabad', city: 'Hyderabad', state: 'Telangana', tier: 'strong', manager: 'Venkat Reddy' },
  { name: 'Viman Nagar - Pune', city: 'Pune', state: 'Maharashtra', tier: 'medium', manager: 'Nilesh Kulkarni' },
  { name: 'Salt Lake Sector V - Kolkata', city: 'Kolkata', state: 'West Bengal', tier: 'medium', manager: 'Arindam Bose' },
  { name: 'MG Road - Kochi', city: 'Kochi', state: 'Kerala', tier: 'medium', manager: 'Manoj Varma' },
  { name: 'Alkapuri - Vadodara', city: 'Vadodara', state: 'Gujarat', tier: 'medium', manager: 'Paresh Mehta' },
  { name: 'C-Scheme - Jaipur', city: 'Jaipur', state: 'Rajasthan', tier: 'medium', manager: 'Mahendra Singh' },
  { name: 'Hazratganj - Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', tier: 'weak', manager: 'Alok Srivastava' },
  { name: 'Bistupur - Jamshedpur', city: 'Jamshedpur', state: 'Jharkhand', tier: 'medium', manager: 'Rakesh Pandey' },
  { name: 'Paltan Bazaar - Guwahati', city: 'Guwahati', state: 'Assam', tier: 'weak', manager: 'Dipankar Barua' },
  { name: 'Boring Road - Patna', city: 'Patna', state: 'Bihar', tier: 'weak', manager: 'Santosh Kumar' },
  { name: 'Arera Colony - Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', tier: 'medium', manager: 'Dharmendra Tiwari' },
  { name: 'Sector 17 - Chandigarh', city: 'Chandigarh', state: 'Punjab', tier: 'medium', manager: 'Harpreet Singh' },
  { name: 'Thampanoor - Trivandrum', city: 'Thiruvananthapuram', state: 'Kerala', tier: 'medium', manager: 'Anoop Pillai' },
  { name: 'Rani Bazaar - Bikaner', city: 'Bikaner', state: 'Rajasthan', tier: 'weak', manager: 'Gajendra Rathore' },
  { name: 'Dharampeth - Nagpur', city: 'Nagpur', state: 'Maharashtra', tier: 'medium', manager: 'Sachin Deshmukh' },
  { name: 'Navrangpura - Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', tier: 'medium', manager: 'Chirag Shah' },
  { name: 'Town Hall - Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', tier: 'medium', manager: 'Murugan Swamy' },
  { name: 'Residency Road - Srinagar', city: 'Srinagar', state: 'Jammu and Kashmir', tier: 'medium', manager: 'Tariq Ahmad Lone' },
  { name: 'Saheed Nagar - Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', tier: 'medium', manager: 'Biswajit Mohapatra' },
  { name: 'Pandri - Raipur', city: 'Raipur', state: 'Chhattisgarh', tier: 'weak', manager: 'Manish Agrawal' },
  { name: 'Sayajigunj - Vadodara', city: 'Vadodara', state: 'Gujarat', tier: 'medium', manager: 'Jatin Trivedi' },
  { name: 'Civil Lines - Allahabad', city: 'Prayagraj', state: 'Uttar Pradesh', tier: 'medium', manager: 'Ashish Shukla' },
  { name: 'Kanke Road - Ranchi', city: 'Ranchi', state: 'Jharkhand', tier: 'medium', manager: 'Pradeep Murmu' },
  { name: 'The Mall - Shimla', city: 'Shimla', state: 'Himachal Pradesh', tier: 'medium', manager: 'Rohit Chauhan' },
];

export const POSITIVE_KEYWORDS = [
  'Documentation & Paperwork',
  'Interest Rates & Charges',
  'Transparency & Communication',
  'Overall Service Experience',
  'Staff assistance & Guidance',
  'Loan Processing Time',
];

export const NEGATIVE_KEYWORDS = [
  'Staff Support',
  'Waiting Time',
  'Interest & EMI',
  'Loan Approval',
  'Process / Documentation',
  'Others',
];

const POSITIVE_KEYWORD_SENTENCES: Record<string, string[]> = {
  'Documentation & Paperwork': [
    'The documentation and paperwork was completely hassle-free with minimal formalities required.',
    'I was pleasantly surprised at how smooth and paperless the verification steps were conducted.',
    'All KYC and pledge documentation were wrapped up in under ten minutes without unnecessary forms.',
  ],
  'Interest Rates & Charges': [
    'The interest rates and processing charges were very competitive and clearly itemized upfront.',
    'I appreciated the transparent rate structure with zero hidden penalty charges or surprises.',
    'Compared to other NBFCs and banks, their gold loan interest slabs offered remarkable value.',
  ],
  'Transparency & Communication': [
    'Complete transparency in weighing the ornaments right in front of me with high precision digital scales.',
    'The team communicated every stage of evaluation openly, ensuring complete peace of mind.',
    'Clear breakdown of valuation, purity testing, and repayment tenure was explained patiently.',
  ],
  'Overall Service Experience': [
    'Overall service experience was welcoming, respectful, and thoroughly professional throughout.',
    'From stepping in to disbursement, the branch maintained an exceptional standard of hospitality.',
    'Easily one of the most reassuring branch experiences I have encountered for personal financing.',
  ],
  'Staff assistance & Guidance': [
    'The branch staff provided courteous guidance and answered all my queries with great patience.',
    'Special thanks to the front desk team for their attentive assistance and warm conduct.',
    'Staff members guided me through digital app access and flexible repayment schedules smoothly.',
  ],
  'Loan Processing Time': [
    'Disbursement happened directly into my bank account within 15 minutes of ornament verification.',
    'Incredibly fast processing time that resolved my urgent business funding requirement immediately.',
    'The rapid turnaround time from entry to loan sanction was truly commendable.',
  ],
};

const NEGATIVE_COMPLAINTS: Record<string, string[]> = {
  'Staff Support': [
    'Staff was dismissive and inattentive during my visit. Need better training in courteous customer care.',
    'Only two counters were operational despite a crowded floor. Staff seemed reluctant to answer queries.',
  ],
  'Waiting Time': [
    'Waiting time exceeded 45 minutes just for initial gold weighing. Kindly streamline the token management.',
    'Too much queue delay even on a weekday morning. The waiting lounge was crowded with no water or seating.',
  ],
  'Interest & EMI': [
    'Confusion regarding the monthly interest calculation slab. Terms differed from what was advertised.',
    'High processing fees deducted directly without prior notice before loan disbursement.',
  ],
  'Loan Approval': [
    'The loan approval process took over 2 hours due to system server lag. Very frustrating delay.',
    'Valuation seemed significantly lower than current market rates. Better appraisal parity needed.',
  ],
  'Process / Documentation': [
    'Excessive repetitive physical forms requested despite complete DigiLocker KYC verification.',
    'The documentation workflow felt chaotic and unorganized. Need a digitized tablet workflow.',
  ],
  'Others': [
    'Branch air conditioning was not working and cash counter had a broken biometric scanner.',
    'Parking facility was blocked and branch signage from the main road is very hard to locate.',
  ],
};

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Sunita', 'Rahul',
  'Deepa', 'Suresh', 'Pooja', 'Karan', 'Meera', 'Manoj', 'Kavita', 'Arjun', 'Swati', 'Devendra',
  'Shalini', 'Girish', 'Bhavna', 'Santosh', 'Nandini', 'Pradeep', 'Rekha', 'Ashok', 'Vidya', 'Harish'
];
const INDIAN_LAST_NAMES = [
  'Sharma', 'Mukherjee', 'Patel', 'Nair', 'Verma', 'Chatterjee', 'Gupta', 'Iyer', 'Singh', 'Banerjee',
  'Joshi', 'Menon', 'Reddy', 'Deshmukh', 'Mishra', 'Bose', 'Rathore', 'Choudhury', 'Pillai', 'Ghosh'
];

function generateReviewText(storeName: string, selectedKeywords: string[], rng: () => number): string {
  const intro = `I visited the ${storeName} branch for a Gold Loan and found the overall experience very reliable. `;
  let body = '';
  selectedKeywords.forEach(kw => {
    const sentences = POSITIVE_KEYWORD_SENTENCES[kw];
    if (sentences && sentences.length > 0) {
      const idx = Math.floor(rng() * sentences.length);
      body += sentences[idx] + ' ';
    }
  });
  const outro = `I would definitely recommend this branch to friends and family in need of quick, secure financial support.`;
  const fullText = (intro + body + outro).trim();
  // Ensure between 350 and 650 characters
  if (fullText.length > 650) {
    return fullText.slice(0, 647) + '...';
  }
  return fullText;
}

function generateDataset(): Visit[] {
  const rng = mulberry32(133742);
  const visits: Visit[] = [];

  // Date range from 2026-07-01 to 2026-10-31 so both Aug, Sep, Oct 2026 have historical periods!
  // Oct 2026 is the primary target month with ~1,300 scans, Sep ~900, Aug ~700, Jul ~500. Total ~3,400 records.
  const startDate = new Date(2026, 6, 1, 8, 0, 0); // 1 July 2026
  const endDate = new Date(2026, 9, 31, 21, 0, 0); // 31 Oct 2026
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Store weighting: strong stores get more scans and higher conversion
  const storeWeights = STORES.map(s => {
    if (s.tier === 'strong') return { store: s, weight: 1.6, posChance: 0.94, proceedChance: 0.89, postChance: 0.91 };
    if (s.tier === 'weak') return { store: s, weight: 0.6, posChance: 0.68, proceedChance: 0.55, postChance: 0.62 };
    return { store: s, weight: 1.0, posChance: 0.88, proceedChance: 0.80, postChance: 0.85 };
  });

  const totalStoreWeight = storeWeights.reduce((a, b) => a + b.weight, 0);

  // Generate ~3,100 visits across the 4 months (July to Oct 2026)
  const targetVisits = 3150;

  for (let i = 0; i < targetVisits; i++) {
    // Pick day with higher density in Oct
    const dayRatio = rng();
    // Bias towards October
    const biasedRatio = Math.pow(dayRatio, 0.7);
    const dayOffset = Math.floor(biasedRatio * totalDays);
    const currentDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    // Pick hour: IST; more scans 10:00–13:00 and 16:00–19:00, fewer on Sundays
    const isSunday = currentDate.getDay() === 0;
    if (isSunday && rng() < 0.55) {
      // Skip some Sunday scans to reflect real-world footfall
      continue;
    }

    let hour = 11;
    const hourRoll = rng();
    if (hourRoll < 0.40) {
      // 10:00 - 13:00 peak
      hour = 10 + Math.floor(rng() * 4);
    } else if (hourRoll < 0.75) {
      // 16:00 - 19:00 peak
      hour = 16 + Math.floor(rng() * 4);
    } else {
      // 8:00 - 10:00 or 13:00 - 16:00 or 19:00 - 21:00
      const otherHours = [8, 9, 13, 14, 15, 19, 20];
      hour = otherHours[Math.floor(rng() * otherHours.length)];
    }

    const minute = Math.floor(rng() * 60);
    const second = Math.floor(rng() * 60);
    const scannedAt = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minute, second);

    // Pick store
    let storeRoll = rng() * totalStoreWeight;
    let selectedStoreConfig = storeWeights[0];
    for (const sw of storeWeights) {
      if (storeRoll <= sw.weight) {
        selectedStoreConfig = sw;
        break;
      }
      storeRoll -= sw.weight;
    }

    const store = selectedStoreConfig.store;

    // Sentiment selection: ~78% of scans choose sentiment
    const choosesSentiment = rng() < 0.78;
    let sentiment: 'positive' | 'negative' | null = null;
    let actionAt: Date | null = null;
    let secsScanToAction: number | null = null;
    let regenerations = 0;
    let keywords: string[] = [];
    let positiveReviewText: string | null = null;
    let proceededToGoogle = false;
    let postedToGoogle = false;
    let negativeFeedback: string | null = null;
    let contactName: string | null = null;
    let phoneNumber: string | null = null;

    if (choosesSentiment) {
      const isPositive = rng() < selectedStoreConfig.posChance;
      sentiment = isPositive ? 'positive' : 'negative';

      if (isPositive) {
        // Positive path
        // Scan to action: mostly 7–60s
        secsScanToAction = Math.floor(7 + rng() * 55 + (rng() < 0.1 ? rng() * 60 : 0));
        actionAt = new Date(scannedAt.getTime() + secsScanToAction * 1000);

        // Regenerations: 0 (~75%), 1 (~17%), 2+ (~8%)
        const regenRoll = rng();
        if (regenRoll < 0.75) {
          regenerations = 0;
        } else if (regenRoll < 0.92) {
          regenerations = 1;
        } else {
          regenerations = 2 + Math.floor(rng() * 2);
        }

        // Keywords selection: pick 2 to 4 keywords
        const numKw = 2 + Math.floor(rng() * 3);
        const shuffled = [...POSITIVE_KEYWORDS].sort(() => rng() - 0.5);
        keywords = shuffled.slice(0, numKw);

        positiveReviewText = generateReviewText(store.name, keywords, rng);

        // Proceeded to Google: ~80%
        proceededToGoogle = rng() < selectedStoreConfig.proceedChance;

        if (proceededToGoogle) {
          // Posted to Google: ~85%
          postedToGoogle = rng() < selectedStoreConfig.postChance;
        }
      } else {
        // Negative path (private)
        // Scan to action: 2–240s
        secsScanToAction = Math.floor(15 + rng() * 150);
        actionAt = new Date(scannedAt.getTime() + secsScanToAction * 1000);

        // Negative keywords
        const numKw = 1 + (rng() < 0.3 ? 1 : 0);
        const shuffled = [...NEGATIVE_KEYWORDS].sort(() => rng() - 0.5);
        keywords = shuffled.slice(0, numKw);

        // ~90% submit feedback
        const submitsFeedback = rng() < 0.90;
        if (submitsFeedback) {
          const primaryKw = keywords[0] || 'Staff Support';
          const complaints = NEGATIVE_COMPLAINTS[primaryKw] || NEGATIVE_COMPLAINTS['Others'];
          const sample = complaints[Math.floor(rng() * complaints.length)];
          negativeFeedback = `${primaryKw} — ${sample}`;

          // ~70% provide contact name & phone
          if (rng() < 0.70) {
            const fn = INDIAN_FIRST_NAMES[Math.floor(rng() * INDIAN_FIRST_NAMES.length)];
            const ln = INDIAN_LAST_NAMES[Math.floor(rng() * INDIAN_LAST_NAMES.length)];
            contactName = `${fn} ${ln}`;
            // 10-digit Indian phone starting with 7, 8, or 9
            const prefix = Math.floor(7 + rng() * 3);
            const rest = Math.floor(100000000 + rng() * 900000000);
            phoneNumber = `${prefix}${rest}`.slice(0, 10);
          }
        }
      }
    }

    visits.push({
      id: `vis_${(i + 1).toString().padStart(5, '0')}`,
      storeName: store.name,
      manager: store.manager,
      city: store.city,
      state: store.state,
      scannedAt,
      sentiment,
      actionAt,
      secsScanToAction,
      regenerations,
      keywords,
      positiveReviewText,
      proceededToGoogle,
      postedToGoogle,
      negativeFeedback,
      contactName,
      phoneNumber,
    });
  }

  // Sort chronologically
  return visits.sort((a, b) => a.scannedAt.getTime() - b.scannedAt.getTime());
}

export const ALL_VISITS: Visit[] = generateDataset();
