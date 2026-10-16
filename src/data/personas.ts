import { Persona } from '../types';

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    title: 'Principal Cloud Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    company: 'Apex Payments Corp',
    location: 'Denver, Colorado',
    baselineScore: 89,
    breadcrumbs: [
      {
        id: 'bc-1',
        category: 'pii',
        rawText: 'So proud to join the Apex Payments family as Principal Cloud Architect! Day 1 complete! 🚀 [Attached: Selfie wearing company badge with lanyard and barcode visible]',
        sourcePlatform: 'LinkedIn',
        extractedFact: 'Employer: Apex Payments | Role: Principal Cloud Architect | Employee ID: #84920 | Badge Barcode: Decodable to Internal Building Access Sector 4',
        threatImplication: 'Physical and logical facility impersonation; barcode cloning allows badge forging.',
        severity: 'critical',
      },
      {
        id: 'bc-2',
        category: 'credential',
        rawText: 'Happy 4th birthday to my loyal golden retriever, Milo! You make remote working bearable every single day 🐾🎂',
        sourcePlatform: 'Instagram',
        extractedFact: 'Pet Name: Milo | Breed: Golden Retriever | Pet Age: 4',
        threatImplication: 'Common bank & email password recovery security question ("What was the name of your first pet?") completely compromised.',
        severity: 'high',
      },
      {
        id: 'bc-3',
        category: 'location',
        rawText: 'Wheels up! Denver -> Las Vegas for AWS re:Invent! Off the grid for the next 6 hours, catch you all at the Venetian! ✈️🎲',
        sourcePlatform: 'X/Twitter',
        extractedFact: 'Current Status: In-flight / Out of Office | Origin: Denver | Destination: Las Vegas (Venetian) | Unreachable Window: 6 Hours',
        threatImplication: 'Adversary executes timed spear-phishing while victim is offline and unable to verify out-of-band inquiries.',
        severity: 'critical',
      },
      {
        id: 'bc-4',
        category: 'relationship',
        rawText: 'Shoutout to my VP @sarah_jenkins_fintech for approving our multi-region Kubernetes migration budget today! Coffee is on me tomorrow ☕',
        sourcePlatform: 'X/Twitter',
        extractedFact: 'Direct Supervisor: Sarah Jenkins (VP) | Project: Multi-region Kubernetes migration | Financial relationship established',
        threatImplication: 'Enables targeted CEO/VP fraud and authority-based social engineering against junior engineers in Elena\'s org.',
        severity: 'high',
      },
      {
        id: 'bc-5',
        category: 'pattern',
        rawText: 'Public GitHub Commit History: git commit -m "fix: env parser" --author="Elena Rostova <elena.rostova.91@gmail.com>"',
        sourcePlatform: 'GitHub',
        extractedFact: 'Personal Email: elena.rostova.91@gmail.com | Probable Birth Year: 1991',
        threatImplication: 'Connects corporate identity to personal email for password reset hijacking and account takeover.',
        severity: 'medium',
      },
    ],
    securityQuestions: [
      {
        question: 'What is the name of your first pet?',
        inferredAnswer: 'Milo',
        sourceBreadcrumbId: 'bc-2',
        confidence: 98,
      },
      {
        question: 'What high school did you graduate from?',
        inferredAnswer: 'Denver East High (Class of 2009)',
        sourceBreadcrumbId: 'bc-5',
        confidence: 85,
      },
      {
        question: 'What was your first job?',
        inferredAnswer: 'Junior SysAdmin at Starline Telecomm',
        sourceBreadcrumbId: 'bc-1',
        confidence: 90,
      },
    ],
    attackVector: {
      id: 'atk-1',
      scenarioTitle: 'Urgent Wire Reroute During Out-of-Office Flight',
      senderSpoof: 'elena.rostova@apex-payments-corp.com (Spoofed Display)',
      targetRole: 'Finance & Payroll Specialist at Apex Payments',
      emailSubject: 'URGENT: Temporary Payroll Direct Deposit Adjustment Before Audit',
      emailBody: `Hi Finance Team,

I am currently en route to the AWS re:Invent conference in Las Vegas (in-flight Wi-Fi is spotty). Sarah Jenkins approved our vendor settlement disbursement this morning, but my primary account is currently locked due to travel alerts.

Could you please route my upcoming payroll allocation to my backup account ending in *4091 for this pay period? I won't have cell reception until I land at the Venetian at 8:00 PM PST.

Employee ID: #84920 (verified on file)
Thanks,
Elena Rostova
Principal Cloud Architect | Apex Payments`,
      baitHook: 'Exploits real-time flight blackout window + verified Employee ID from badge + Sarah Jenkins supervisor reference.',
      exploitedBreadcrumbs: ['bc-1', 'bc-3', 'bc-4'],
    },
    voiceCloneFeasibility: {
      score: 87,
      availableAudioMinutes: 24,
      cadenceMatchRate: '94.2% match across 3 keynote podcasts',
      sampleQuotes: [
        '"Our zero-trust architecture requires continuous validation across all VPC clusters..."',
        '"Hey everyone, Elena here from Apex Payments, super excited for today\'s panel..."',
      ],
    },
    remediationPlan: [
      {
        id: 'rem-1',
        platform: 'LinkedIn',
        action: 'Remove employee badge photo & redact employee ID #84920',
        impactScoreDrop: 24,
        completed: false,
      },
      {
        id: 'rem-2',
        platform: 'X/Twitter',
        action: 'Stop real-time travel broadcasts & delete in-flight status announcement',
        impactScoreDrop: 22,
        completed: false,
      },
      {
        id: 'rem-3',
        platform: 'Instagram',
        action: 'Make pet & family posts private to protect security question answers',
        impactScoreDrop: 18,
        completed: false,
      },
      {
        id: 'rem-4',
        platform: 'GitHub',
        action: 'Configure git email masking to prevent personal email and birth year leakage',
        impactScoreDrop: 11,
        completed: false,
      },
    ],
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    title: 'VP of Global Logistics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    company: 'Titan Freight & Marine',
    location: 'Chicago, Illinois',
    baselineScore: 92,
    breadcrumbs: [
      {
        id: 'bc-m1',
        category: 'pii',
        rawText: 'Celebrating 15 years at Titan Freight today! Proud of our maritime supply chain team in Rotterdam and Singapore.',
        sourcePlatform: 'LinkedIn',
        extractedFact: 'Tenure: 15 Years | Key Port Hubs: Rotterdam & Singapore | Title: VP Global Logistics',
        threatImplication: 'High-value executive target for Business Email Compromise (BEC) and vendor payment diversion.',
        severity: 'high',
      },
      {
        id: 'bc-m2',
        category: 'location',
        rawText: 'Checked in at Marina Bay Sands, Singapore with the family. Escaping the Chicago winter for the next two weeks!',
        sourcePlatform: 'Instagram',
        extractedFact: 'Location: Singapore | Vacation Duration: 14 Days | Family Traveling with Him',
        threatImplication: 'Time-zone offset (13 hours) allows fraudsters to strike headquarters during US business hours while Marcus is asleep.',
        severity: 'critical',
      },
      {
        id: 'bc-m3',
        category: 'relationship',
        rawText: 'Welcome aboard to our new regional procurement director, @kevin_tan_sg! Looking forward to finalizing the Q4 container lease contracts.',
        sourcePlatform: 'LinkedIn',
        extractedFact: 'Key Contact: Kevin Tan (Procurement Director) | Active Negotiation: Q4 Container Leases',
        threatImplication: 'Attacker crafts fake invoice approvals referencing the exact Singapore container lease contract.',
        severity: 'critical',
      },
    ],
    securityQuestions: [
      {
        question: 'In what city were you married?',
        inferredAnswer: 'Charleston, South Carolina',
        sourceBreadcrumbId: 'bc-m1',
        confidence: 92,
      },
      {
        question: 'What is your mother\'s maiden name?',
        inferredAnswer: 'Vance-Holloway',
        sourceBreadcrumbId: 'bc-m2',
        confidence: 81,
      },
    ],
    attackVector: {
      id: 'atk-2',
      scenarioTitle: 'Emergency Container Lease Escrow Wire Request',
      senderSpoof: 'marcus.vance@titan-freight-marine.com (High-Priority Flag)',
      targetRole: 'Senior Treasury Manager, Titan Freight',
      emailSubject: 'EXEC ACTION: Singapore Q4 Container Lease Escrow Release ($184,500)',
      emailBody: `Treasury Team,

I am on-site in Singapore with Kevin Tan for the Q4 container lease signing. Port authorities require the escrow bond release before 9:00 AM Singapore time (which is in 2 hours).

Because of the 13-hour time difference, I cannot place an outbound call without waking the hotel. Please wire the deposit of $184,500 to the attached verified maritime authority escrow account immediately to avoid demurrage penalties.

Marcus Vance
VP, Global Logistics | Titan Freight`,
      baitHook: 'Leverages genuine Singapore trip + references newly announced procurement director Kevin Tan + urgency with time zone gap.',
      exploitedBreadcrumbs: ['bc-m1', 'bc-m2', 'bc-m3'],
    },
    voiceCloneFeasibility: {
      score: 94,
      availableAudioMinutes: 45,
      cadenceMatchRate: '98.1% match from quarterly earnings calls',
      sampleQuotes: [
        '"We are maintaining our operating margin guidance across all European trade corridors..."',
        '"Let\'s ensure all vessel turnaround times remain strictly under 36 hours."',
      ],
    },
    remediationPlan: [
      {
        id: 'rem-m1',
        platform: 'Instagram',
        action: 'Delete real-time family vacation posts and delay travel media until return',
        impactScoreDrop: 30,
        completed: false,
      },
      {
        id: 'rem-m2',
        platform: 'LinkedIn',
        action: 'Remove active contract and procurement negotiation details from public posts',
        impactScoreDrop: 26,
        completed: false,
      },
      {
        id: 'rem-m3',
        platform: 'Corporate Ops',
        action: 'Mandate strict dual-custody voice authorization for international wires over $50k',
        impactScoreDrop: 22,
        completed: false,
      },
    ],
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    title: 'AI Security Fellow & Tech Creator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    company: 'University AI Lab / Freelance',
    location: 'Austin, Texas',
    baselineScore: 82,
    breadcrumbs: [
      {
        id: 'bc-p1',
        category: 'credential',
        rawText: 'Only 3 days until I turn 24! Birthday wishlist is live on my profile 🎂🎉 Can\'t wait to celebrate in Austin with the cohort!',
        sourcePlatform: 'Instagram',
        extractedFact: 'Exact Date of Birth Inferred | Age: 24 | City: Austin',
        threatImplication: 'Date of birth is the primary identity verification token for medical, banking, and government portal resets.',
        severity: 'critical',
      },
      {
        id: 'bc-p2',
        category: 'relationship',
        rawText: 'Big thanks to @OpenAI for sending over our lab grant API keys today! Testing our multimodal red-teaming benchmark all weekend.',
        sourcePlatform: 'X/Twitter',
        extractedFact: 'Active Project: AI Lab Grant & Benchmark | Tooling: OpenAI API Key access',
        threatImplication: 'Targeted for API token harvesting and malicious OAuth app authorization lures.',
        severity: 'high',
      },
      {
        id: 'bc-p3',
        category: 'pattern',
        rawText: 'Always working from my favorite booth at Mozarts Coffee on Lake Austin! Best cold brew in town ☕💻',
        sourcePlatform: 'Instagram',
        extractedFact: 'Daily Physical Location Pattern: Mozarts Coffee on Lake Austin',
        threatImplication: 'Physical stalking, Evil Twin Wi-Fi rogue access point targeting, and shoulder-surfing attack vector.',
        severity: 'high',
      },
    ],
    securityQuestions: [
      {
        question: 'What is your date of birth?',
        inferredAnswer: 'October 19, 2002',
        sourceBreadcrumbId: 'bc-p1',
        confidence: 96,
      },
      {
        question: 'What coffee shop do you visit most often?',
        inferredAnswer: 'Mozarts Coffee (Lake Austin)',
        sourceBreadcrumbId: 'bc-p3',
        confidence: 99,
      },
    ],
    attackVector: {
      id: 'atk-3',
      scenarioTitle: 'Fraudulent AI Lab Grant Revocation & Token Theft',
      senderSpoof: 'grants-support@openai-auth-security.io',
      targetRole: 'Priya Sharma',
      emailSubject: 'CRITICAL: Security Breach Detected on Austin University AI Lab Grant',
      emailBody: `Hi Priya,

Our automated systems detected anomalous API token activity originating from an unverified IP address in Austin, Texas matching your lab cluster.

To prevent suspension of your research grant credits, please verify your identity and rotate your API key within 24 hours at the secure lab portal:

[Verify Research Grant Credentials -> https://auth.openai-grant-portal.io/verify]

AI Grants Security Operations`,
      baitHook: 'References public tweet celebrating lab grant + targets Austin location + creates panic over grant credit loss.',
      exploitedBreadcrumbs: ['bc-p1', 'bc-p2', 'bc-p3'],
    },
    voiceCloneFeasibility: {
      score: 91,
      availableAudioMinutes: 120,
      cadenceMatchRate: '99.3% match across YouTube tutorials and reels',
      sampleQuotes: [
        '"Hey tech fam, in this video we are breaking down diffusion model latencies..."',
        '"Drop a comment below with your favorite open-source LLM stack!"',
      ],
    },
    remediationPlan: [
      {
        id: 'rem-p1',
        platform: 'Instagram',
        action: 'Remove exact birthdate countdowns and age references from public stories',
        impactScoreDrop: 28,
        completed: false,
      },
      {
        id: 'rem-p2',
        platform: 'X/Twitter',
        action: 'Mask research grant credentials and avoid tagging vendor grant accounts',
        impactScoreDrop: 24,
        completed: false,
      },
      {
        id: 'rem-p3',
        platform: 'Social',
        action: 'Cease geotagging repetitive daily physical work locations',
        impactScoreDrop: 16,
        completed: false,
      },
    ],
  },
];
