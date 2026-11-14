/**
 * ============================================================================
 * BRIGHTPATH HOME TUTORS — EDITABLE SITE CONFIGURATION
 * ============================================================================
 * Edit business details, phone numbers, email, business hours, copy, and
 * service prices (in Nigerian Naira) right here. Changes update across all
 * four pages automatically.
 */

export interface TutoringService {
  id: string;
  number: string;
  category: 'Primary' | 'Secondary' | 'Exam Prep';
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  samplePrice: string;
  billingCycle: string;
  priceNote: string;
  highlights: string[];
  featuredOnHome: boolean;
  imageKey: 'servicePrimaryTutoring' | 'serviceSecondaryTutoring' | 'heroHomeTutoring' | 'aboutPersonalisedLearning';
  imageAlt: string;
}

export const siteConfig = {
  brand: {
    name: 'BrightPath Home Tutors',
    shortName: 'BrightPath',
    tagline: 'Guiding Young Minds Towards a Brighter Future.',
    locationLabel: 'Surulere, Lagos · Nigeria',
  },

  // --------------------------------------------------------------------------
  // CONTACT DETAILS (Edit any field below to update header, footer & contact)
  // --------------------------------------------------------------------------
  contact: {
    phone: '08060677222',
    whatsapp: '0806060677222',
    email: 'ezea80214@gmail.com',
    address: '125 Itire Road, Lawson, Surulere, Lagos, Nigeria',
    // Editable Business Hours placeholders
    businessHours: [
      { days: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
      { days: 'Saturday', hours: '9:00 AM – 4:00 PM' },
      { days: 'Sunday', hours: 'Closed (WhatsApp enquiries welcome)' },
    ],
  },

  // --------------------------------------------------------------------------
  // HOME PAGE COPY
  // --------------------------------------------------------------------------
  home: {
    kicker: 'Home Tutoring · Surulere & Lagos',
    heroHeadline: 'Guiding Young Minds Towards a Brighter Future.',
    heroIntro:
      'BrightPath Home Tutors pairs primary and secondary school students with patient, qualified home tutors who build lasting confidence, steady study habits, and measurable classroom improvement in the safety of your home.',
    primaryCtaLabel: 'Book a Lesson',
    secondaryCtaLabel: 'Explore Services',
    proofStrip: [
      { label: 'Students Served', value: 'Primary 1 – SSS 3' },
      { label: 'Lesson Format', value: '1-on-1 Home Visits' },
      { label: 'Core Focus', value: 'Maths, English & Sciences' },
      { label: 'Parent Updates', value: 'Structured Monthly Feedback' },
    ],
    whyChooseTitle: 'Why Parents Choose BrightPath',
    whyChooseIntro:
      'Choosing a tutor to welcome into your home is an act of trust. Every BrightPath placement is designed around safety, clear communication with parents, and steady academic growth.',
    whyChooseReasons: [
      {
        number: '01',
        title: 'Carefully Vetted Tutors',
        description:
          'Every tutor is screened for subject mastery, classroom teaching experience, and calm temperament before visiting a family home.',
      },
      {
        number: '02',
        title: 'Tailored to Your Child’s Pace',
        description:
          'Rather than rushing through a crowded syllabus, lessons adapt to how your child learns best—reinforcing weak topics before moving ahead.',
      },
      {
        number: '03',
        title: 'Consistent Routine & Discipline',
        description:
          'Scheduled home sessions turn homework struggles into calm, structured study habits that carry back into the school classroom.',
      },
      {
        number: '04',
        title: 'Clear Feedback for Parents',
        description:
          'Parents receive regular updates on topics covered, quiz scores, and practical ways to support revision between lessons.',
      },
    ],
    successStoriesKicker: 'Parent & Student Voices',
    successStoriesTitle: 'Success Stories',
    successStoriesIntro:
      'Real experiences from Lagos families and students whose confidence, study habits, and term results grew through patient one-on-one home tutoring.',
    successStories: [
      {
        name: 'Mrs. Folake Adeyemi',
        role: 'Mother of Primary 5 Pupil',
        perspective: 'Parent Story',
        programme: 'Primary School Home Tutoring',
        location: 'Surulere, Lagos',
        outcome: 'Maths score rose from 54% to 86% in one term',
        quote:
          'Before BrightPath started visiting our home, my son rushed through fractions and dreaded reading aloud. His tutor was calm and methodical every afternoon. Within one term, his Mathematics mark moved from 54% to 86% and he now finishes homework without tears.',
      },
      {
        name: 'Chinedu Okafor',
        role: 'SSS 3 Science Candidate',
        perspective: 'Student Story',
        programme: 'Examination Preparation',
        location: 'Yaba, Lagos',
        outcome: 'Cleared WAEC mock papers with distinctions',
        quote:
          'Physics calculations and trigonometry used to overwhelm me in a large classroom. Working three times a week with my BrightPath tutor let me ask questions until every formula made sense, and I walked into my WAEC mock exams feeling genuinely prepared.',
      },
      {
        name: 'Mr. & Mrs. Babatunde Lawal',
        role: 'Parents of JSS 2 & Primary 4 Pupils',
        perspective: 'Parent Story',
        programme: 'Secondary & Primary Tutoring',
        location: 'Ikate, Surulere',
        outcome: 'Consistent homework routine and weekly progress notes',
        quote:
          'As working parents, we needed someone dependable, disciplined, and trustworthy in our home after school hours. BrightPath matched us with a punctual tutor who built real study structure for both children and sent clear Friday summaries every week.',
      },
      {
        name: 'Tomiwa Ogunleye',
        role: 'JSS 3 Student',
        perspective: 'Student Story',
        programme: 'Mathematics & English Coaching',
        location: 'Aguda, Surulere',
        outcome: '+22% term average ahead of BECE exams',
        quote:
          'I used to stay quiet whenever I missed a step in algebra or essay structure. Having a patient teacher sit beside me at our dining table changed how I study. My overall term average went up by 22 points before my Junior WAEC.',
      },
    ],
    parentTestimonialsKicker: 'Satisfied Parents',
    parentTestimonialsTitle: 'What Lagos Parents Say About BrightPath',
    parentTestimonialsIntro:
      'Mothers and fathers across Surulere and Lagos share how one-on-one home lessons brought calmer homework routines, stronger confidence, and measurable term results.',
    parentTestimonials: [
      {
        id: 'parent-ngozi-eze',
        parentName: 'Mrs. Ngozi Eze',
        parentRole: 'Mother of Primary 6 Pupil',
        location: 'Surulere, Lagos',
        stage: 'Primary' as const,
        programme: 'Common Entrance & Numeracy',
        tenure: '14 months with BrightPath',
        rating: '5.0 / 5',
        outcome: 'Maths rose from 58% to 89% · First-choice school admission',
        quote:
          'Before we called BrightPath, my daughter panicked whenever she saw multi-step word problems. Her tutor walked through each step calmly three afternoons a week. Not only did her Mathematics score rise from 58% to 89%, she sat her Common Entrance examination completely composed.',
      },
      {
        id: 'parent-kunle-adebayo',
        parentName: 'Mr. Kunle Adebayo',
        parentRole: 'Father of JSS 2 Student',
        location: 'Yaba, Lagos',
        stage: 'Secondary' as const,
        programme: 'Mathematics & Basic Science',
        tenure: '2 terms with BrightPath',
        rating: '5.0 / 5',
        outcome: 'Term average improved from 61% to 84%',
        quote:
          'What convinced me was the structure after every single lesson. Instead of guessing what my son was revising, I received clear homework targets and honest feedback. Within two terms his Basic Science and Maths grades moved into the top band of his class.',
      },
      {
        id: 'parent-hauwa-bello',
        parentName: 'Mrs. Hauwa Bello',
        parentRole: 'Mother of Primary 3 & Primary 5 Pupils',
        location: 'Ikeja GRA, Lagos',
        stage: 'Primary' as const,
        programme: 'Sibling Literacy & Study Habits',
        tenure: '1 academic year',
        rating: '5.0 / 5',
        outcome: 'Independent daily reading & calm weekday homework',
        quote:
          'Having one dependable, vetted teacher support both children back-to-back transformed our weekday evenings. My younger son now reads aloud fluently without prompting, and both notebooks come back from school neatly marked.',
      },
      {
        id: 'parent-chidi-nwankwo',
        parentName: 'Dr. & Mrs. Chidi Nwankwo',
        parentRole: 'Parents of SSS 3 Candidate',
        location: 'Ikoyi, Lagos',
        stage: 'Exam Prep' as const,
        programme: 'WAEC & JAMB Sciences',
        tenure: '6 months exam coaching',
        rating: '5.0 / 5',
        outcome: '+24 points in Physics & Chemistry mock papers',
        quote:
          'Our daughter needed targeted past-question strategy rather than general revision. Her BrightPath specialist pinpointed the exact electrochemistry and mechanics topics costing her marks, and her mock results improved by 24 points ahead of WAEC.',
      },
      {
        id: 'parent-sade-balogun',
        parentName: 'Mrs. Sade Balogun',
        parentRole: 'Mother of JSS 3 Student',
        location: 'Aguda, Surulere',
        stage: 'Exam Prep' as const,
        programme: 'BECE / Junior WAEC Prep',
        tenure: '9 months with BrightPath',
        rating: '4.9 / 5',
        outcome: 'Cleared Junior WAEC with 8 distinctions',
        quote:
          'Punctuality and respect in the home matter as much to us as subject knowledge. Every BrightPath tutor we worked with arrived prepared, dressed neatly, and left clear notes in our Parent Portal after each visit.',
      },
      {
        id: 'parent-femi-adesina',
        parentName: 'Mr. Femi Adesina',
        parentRole: 'Father of SSS 1 Student',
        location: 'Victoria Island, Lagos',
        stage: 'Secondary' as const,
        programme: 'Senior Secondary Maths & Physics',
        tenure: '1 academic year',
        rating: '5.0 / 5',
        outcome: 'Moved into top 5% in SSS 1 Mathematics',
        quote:
          'Transitioning from JSS 3 to senior secondary sciences can overwhelm teenagers. Having a calm, subject-specialist tutor sit with my son twice weekly turned his apprehension into genuine curiosity and top-five class rankings.',
      },
    ],
    faqKicker: 'Questions Parents Ask',
    faqTitle: 'Frequently Asked Questions',
    faqIntro:
      'Clear answers on how we vet our tutors, structure each home visit, track termly progress, and match the right teacher to your child.',
    faqs: [
      {
        question: 'How are BrightPath tutors vetted before visiting our home?',
        answer:
          'Every tutor undergoes identity verification, academic credential review, subject-competency screening, and character reference checks before being matched with a family. We select educators who demonstrate patience, strong subject mastery, and respectful conduct in a family home.',
      },
      {
        question: 'How long is each tutoring session, and how many days per week do tutors visit?',
        answer:
          'Most primary school lessons run for 1 hour per visit, while secondary and exam preparation lessons typically run for 1 to 1.5 hours. Standard schedules are 3 sessions per week—on weekday afternoons or weekends—though we adjust frequency around your family routine.',
      },
      {
        question: 'What happens during the first week of home lessons?',
        answer:
          'During the opening sessions, the tutor reviews your child’s current school notebooks, recent test scripts, and class scheme of work to spot any missed foundational concepts. From there, we follow a calm, structured study plan tailored to your child’s pace.',
      },
      {
        question: 'How do parents stay updated on their child’s progress?',
        answer:
          'Parents receive regular feedback summaries outlining topics covered, classwork accuracy, homework discipline, and upcoming areas of revision—so you always see measurable progress rather than guessing.',
      },
      {
        question: 'What if we feel a tutor is not the right match for our child?',
        answer:
          'Personality and trust matter deeply in one-on-one learning. If you ever feel the tutor is not the right fit for your child’s learning style, simply let us know and we will arrange a suitable replacement promptly at no extra placement charge.',
      },
      {
        question: 'Can one tutor support siblings or prepare a child for external examinations?',
        answer:
          'Yes. We offer dedicated Examination Preparation for Common Entrance, BECE/JSSCE, WAEC, NECO, JAMB, and IGCSE, and we can structure back-to-back sessions with sibling-friendly rates for households with more than one child.',
      },
    ],
    milestonesKicker: 'Track Record Across Lagos',
    milestonesTitle: 'Milestones',
    milestonesIntro:
      'Consistent one-on-one home instruction measured by student retention, termly score improvements, and national exam readiness.',
    milestones: [
      {
        label: 'Students Tutored',
        value: 450,
        suffix: '+',
        progressPercent: 90,
        progressLabel: '90% toward 500-student milestone',
        timeframe: 'Primary 1 – SSS 3',
        description:
          'Primary and secondary pupils guided through foundational literacy, numeracy, and secondary subject mastery.',
      },
      {
        label: 'Years of Excellence',
        value: 8,
        suffix: '+',
        progressPercent: 80,
        progressLabel: '8+ of 10-year Lagos legacy',
        timeframe: 'Surulere & Lagos',
        description:
          'Steady home tutoring service supporting Lagos families with vetted, patient subject specialists.',
      },
      {
        label: 'Success Rate',
        value: 96,
        suffix: '%',
        progressPercent: 96,
        progressLabel: '96% verified improvement rate',
        timeframe: 'Termly & Exam Outcomes',
        description:
          'Of tutored students advancing by at least one grade band or passing Common Entrance, BECE, and WAEC targets.',
      },
    ],
    resourcesKicker: 'Parent Resources & Study Tips',
    resourcesTitle: 'Practical Study Guides for Home Learning',
    resourcesIntro:
      'Short, proven techniques our tutors recommend to Lagos parents to make homework calmer, strengthen memory retention, and build steady exam confidence.',
    resources: [
      {
        id: 'daily-reading-habit',
        category: 'Primary Literacy',
        readTime: '3 min read',
        audience: 'Primary 1 – Primary 6 Parents',
        title: 'The 20-Minute Evening Reading Rule That Boosts Every Subject',
        summary:
          'Why twenty calm minutes of reading aloud—with three simple comprehension questions—improves not only English, but also mathematics word problems.',
        bodyParagraphs: [
          'Many pupils lose marks in Mathematics and Science not because they cannot calculate, but because they misread a single sentence in a word problem. Fluent reading comprehension is the quiet foundation behind every school subject.',
          'Rather than waiting until weekend revision, set aside twenty unhurried minutes before dinner where your child reads a short story or textbook passage aloud while you listen.',
        ],
        actionSteps: [
          'Ask your child to summarize the page in their own words instead of repeating sentences verbatim.',
          'When they meet an unfamiliar word, pause to explain it simply and write it in a small vocabulary notebook.',
          'Keep television and phones switched off during the 20-minute window so reading feels calm rather than rushed.',
        ],
      },
      {
        id: 'homework-without-tears',
        category: 'Study Habits',
        readTime: '3 min read',
        audience: 'All Primary & JSS Families',
        title: 'How to Support Difficult Homework Without Giving Away the Answers',
        summary:
          'A gentle three-question routine parents can use when a child says “I do not know how to solve this” at the dining table.',
        bodyParagraphs: [
          'When parents feel tired after Lagos traffic, it is tempting to solve a difficult assignment quickly so everyone can rest. However, stepping in too early accidentally teaches a child to give up at the first sign of difficulty.',
          'Our tutors use guided prompts—helping the student discover the next step themselves so confidence stays with the learner.',
        ],
        actionSteps: [
          'Start with: “Show me an example from your class note that looks similar to this question.”',
          'Ask the child to circle the exact step where they got stuck, rather than saying the whole topic is hard.',
          'Praise neat effort and careful checking before correcting any final arithmetic errors.',
        ],
      },
      {
        id: 'active-recall-exams',
        category: 'Exam Preparation',
        readTime: '4 min read',
        audience: 'Common Entrance, BECE & WAEC',
        title: 'Why Active Recall Beats Re-Reading Textbooks Before Examinations',
        summary:
          'How closed-book practice and timed past questions help secondary students remember formulas and essay points under real exam pressure.',
        bodyParagraphs: [
          'Reading the same notebook five times creates a false sense of familiarity: the page looks recognizable, yet the mind goes blank inside the examination hall. Real memory is built when a student pulls information out without looking.',
          'Four weeks before Common Entrance, BECE, or WAEC, shift from passive reading to short closed-book recall sessions and timed past-question drills.',
        ],
        actionSteps: [
          'After studying one topic for 25 minutes, close the book and write down key formulas or definitions from memory.',
          'Use a plain wristwatch to practice answering 10 objective questions in 10 minutes, then mark immediately.',
          'Keep an “error log” notebook recording tricky questions missed during practice and review it every Saturday morning.',
        ],
      },
      {
        id: 'distraction-free-study-corner',
        category: 'Home Routine',
        readTime: '3 min read',
        audience: 'All School Ages',
        title: 'Setting Up a Distraction-Free Study Corner in a Busy Household',
        summary:
          'Simple lighting, seating, and schedule adjustments that help children settle into focused study within five minutes.',
        bodyParagraphs: [
          'You do not need a separate library room to create strong study discipline at home. What matters most is consistency: studying at the same tidy table, at roughly the same hour, with all tools ready before lessons begin.',
          'When pens, rulers, textbooks, and drinking water are prepared ahead of time, your child avoids wandering around the house mid-assignment.',
        ],
        actionSteps: [
          'Choose a firm chair and clear table surface away from television noise and thoroughfare.',
          'Ensure bright overhead or desk lighting, especially for late-afternoon and evening study.',
          'Keep phones and tablets in another room until the 45- or 60-minute study block is completed.',
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // SERVICES & EDITABLE SAMPLE PRICES (Nigerian Naira - ₦)
  // --------------------------------------------------------------------------
  servicesPage: {
    kicker: 'Our Tutoring Programmes',
    headline: 'Structured Home Tutoring for Every Stage',
    intro:
      'All programmes take place in the comfort of your home with flexible afternoon or weekend schedules. Sample fees shown below are monthly starting guides in Nigerian Naira and can be adjusted based on weekly lesson frequency and number of children.',
    pricingDisclaimer:
      'Sample prices are editable estimates based on 3 one-hour sessions per week. Sibling discounts and custom schedules are available on request.',
    onboardingSteps: [
      {
        step: '01',
        title: 'Share Your Child’s Goals',
        description:
          'Complete our short enquiry form or send a WhatsApp message with your child’s class, subjects, and preferred days.',
      },
      {
        step: '02',
        title: 'Diagnostic Assessment & Tutor Match',
        description:
          'We review current schoolwork and match your family with a qualified subject specialist suited to your child’s learning style.',
      },
      {
        step: '03',
        title: 'Begin Structured Home Lessons',
        description:
          'Regular one-on-one home sessions begin, supported by guided homework supervision and periodic progress reviews for parents.',
      },
    ],
  },

  services: [
    {
      id: 'primary-tutoring',
      number: '01',
      category: 'Primary',
      title: 'Primary School Home Tutoring',
      shortTitle: 'Primary School Tutoring',
      summary:
        'Warm, foundational support in reading, numeracy, phonics, and daily homework for Primary 1–6 pupils.',
      description:
        'Designed to help young learners enjoy schoolwork without frustration. Tutors strengthen early literacy, mental arithmetic, neat handwriting, and daily assignment completion while nurturing curiosity and focus.',
      samplePrice: '₦35,000',
      billingCycle: 'per month (sample rate)',
      priceNote: 'Typical schedule: 3 sessions weekly · Primary 1 – Primary 6',
      highlights: [
        'Phonics, reading comprehension & neat handwriting',
        'Foundational arithmetic & word problems',
        'Calm, patient daily homework supervision',
      ],
      featuredOnHome: true,
      imageKey: 'servicePrimaryTutoring',
      imageAlt: 'Young Nigerian primary school pupil reading an English workbook and writing neatly at a wooden study desk',
    },
    {
      id: 'secondary-tutoring',
      number: '02',
      category: 'Secondary',
      title: 'Secondary School Home Tutoring',
      shortTitle: 'Secondary School Tutoring',
      summary:
        'Focused subject guidance for JSS 1–3 and SSS 1–3 students across core sciences, humanities, and quantitative subjects.',
      description:
        'Helps junior and senior secondary students stay ahead of demanding school curricula. Tutors break down complex concepts in Mathematics, Basic Science, Physics, Chemistry, Biology, Economics, and Government.',
      samplePrice: '₦45,000',
      billingCycle: 'per month (sample rate)',
      priceNote: 'Typical schedule: 3 sessions weekly · JSS 1 – SSS 3',
      highlights: [
        'Step-by-step coverage of school term schemes',
        'Physics, Chemistry, Biology & Commercial subjects',
        'Note organization & independent study techniques',
      ],
      featuredOnHome: true,
      imageKey: 'serviceSecondaryTutoring',
      imageAlt: 'Nigerian home tutor guiding a secondary school student through mathematics and science diagrams at a study table',
    },
    {
      id: 'maths-english-coaching',
      number: '03',
      category: 'Primary',
      title: 'Mathematics and English Coaching',
      shortTitle: 'Maths & English Coaching',
      summary:
        'Targeted mastery in the two gateway subjects essential for every primary and secondary promotion exam.',
      description:
        'Ideal for students who need dedicated reinforcement in numerical reasoning, algebra, grammar, essay composition, and reading fluency. Tutors close historical learning gaps and rebuild confidence quickly.',
      samplePrice: '₦40,000',
      billingCycle: 'per month (sample rate)',
      priceNote: 'Typical schedule: 3 sessions weekly · Primary & Secondary',
      highlights: [
        'Arithmetic, fractions, algebra & geometry drills',
        'Grammar, comprehension & structured essay writing',
        'Weekly timed practice exercises with corrections',
      ],
      featuredOnHome: true,
      imageKey: 'heroHomeTutoring',
      imageAlt: 'Home tutor working through a Primary Mathematics workbook alongside a smiling student',
    },
    {
      id: 'examination-preparation',
      number: '04',
      category: 'Exam Prep',
      title: 'Examination Preparation',
      shortTitle: 'Examination Preparation',
      summary:
        'Intensive, structured preparation for Common Entrance, BECE/JSSCE, WAEC, NECO, JAMB, and IGCSE.',
      description:
        'Combines syllabus revision, past-question strategy, and timed mock assessments so candidates enter the examination hall calm, thorough, and well-prepared under exam conditions.',
      samplePrice: '₦55,000',
      billingCycle: 'per month (sample rate)',
      priceNote: 'Typical schedule: 3–4 intensive sessions weekly · Exam candidates',
      highlights: [
        'Common Entrance, BECE, WAEC, NECO & IGCSE focus',
        'Past-question analysis & examiner marking expectations',
        'Timed mock tests & anxiety-reducing exam strategy',
      ],
      featuredOnHome: false,
      imageKey: 'aboutPersonalisedLearning',
      imageAlt: 'Neatly arranged academic textbooks, handwritten revision notes, and brass geometry compass on a wooden study desk',
    },
  ] as TutoringService[],

  // --------------------------------------------------------------------------
  // ABOUT PAGE COPY
  // --------------------------------------------------------------------------
  about: {
    kicker: 'About BrightPath Home Tutors',
    headline: 'Dedicated to Quiet Focus, Steady Character, and Real Academic Growth.',
    intro:
      'BrightPath Home Tutors was established in Surulere, Lagos to give parents a dependable alternative to overcrowded after-school coaching centres. We believe that every child can thrive when given patient explanation, consistent encouragement, and undivided attention in a calm home setting.',
    mission: {
      title: 'Our Mission',
      text: 'To connect families with trustworthy, subject-qualified home tutors who deliver patient, structured instruction tailored to each student’s pace—building genuine understanding, strong study discipline, and lasting confidence.',
    },
    vision: {
      title: 'Our Vision',
      text: 'To be Lagos families’ most trusted partner in foundational and secondary home education, known for integrity, measurable student improvement, and tutors who genuinely care about every young mind they mentor.',
    },
    personalisedLearningTitle: 'Why Personalised One-on-One Learning Matters',
    personalisedLearningParagraphs: [
      'In a busy classroom of thirty or more pupils, even the most dedicated teacher cannot pause whenever a single student misses a foundational step in fractions or struggles to structure a paragraph. Over time, small unanswered questions grow into hesitation and exam anxiety.',
      'Personalised home tutoring removes that pressure. In a one-on-one session, a student can ask the same question twice without embarrassment, work at a pace that respects how they process information, and receive immediate, encouraging correction before faulty habits take root.',
      'For high-achieving students, individual tutoring also prevents boredom—allowing them to explore deeper problem-solving and prepare early for competitive entrance and national examinations.',
    ],
    commitmentsTitle: 'Our Core Commitments to Every Family',
    commitments: [
      {
        number: '01',
        title: 'Patience',
        description:
          'We never shame a child for not knowing an answer. Our tutors explain concepts calmly from multiple angles until understanding clicks naturally.',
      },
      {
        number: '02',
        title: 'Discipline',
        description:
          'True academic confidence is built on routine. We cultivate punctuality, neat written work, attentive listening, and consistent revision habits.',
      },
      {
        number: '03',
        title: 'Academic Improvement',
        description:
          'Every lesson follows clear monthly targets aligned with your child’s school scheme and exam calendar, leading to visible progress in classwork and tests.',
      },
      {
        number: '04',
        title: 'Individual Attention',
        description:
          'No generic one-size-fits-all handouts. Lessons are planned around your child’s specific strengths, learning pace, and school textbooks.',
      },
    ],
    tutorsKicker: 'Vetted Teaching Staff',
    tutorsTitle: 'Meet Our Tutors',
    tutorsIntro:
      'Our educators combine formal teaching credentials with patience and steady encouragement. Below are four of the lead specialists guiding BrightPath families across Surulere and Lagos.',
    tutors: [
      {
        name: 'Adaeze Nwosu',
        role: 'Lead Primary Literacy & Numeracy Tutor',
        credentials: 'B.Ed. Primary Education · TRCN Certified',
        experience: '8 years classroom & home tutoring',
        specialties: ['Primary 1–6 Numeracy', 'Phonics & Reading Fluency', 'Common Entrance Prep'],
        bio: 'Specialises in helping young learners build early reading confidence, neat handwriting, and calm daily homework habits without pressure.',
        imageKey: 'tutorAdaeze' as const,
        imageAlt: 'Portrait of Adaeze Nwosu, Lead Primary Literacy and Numeracy Tutor',
      },
      {
        name: 'Tunde Bakare',
        role: 'Senior Mathematics & Physics Specialist',
        credentials: 'B.Sc. Mathematics · PGDE',
        experience: '9 years secondary & exam coaching',
        specialties: ['JSS & SSS Mathematics', 'Further Mathematics & Physics', 'WAEC, NECO & IGCSE'],
        bio: 'Breaks down complex algebra, geometry, and mechanics into clear step-by-step methods so secondary students gain confidence in timed exams.',
        imageKey: 'tutorTunde' as const,
        imageAlt: 'Portrait of Tunde Bakare, Senior Mathematics and Physics Specialist',
      },
      {
        name: 'Kemi Ogunsola',
        role: 'English Language & Literature Tutor',
        credentials: 'B.A. English · M.Ed. Curriculum Studies',
        experience: '6 years primary & secondary coaching',
        specialties: ['Grammar & Comprehension', 'Structured Essay Writing', 'BECE & WAEC English'],
        bio: 'Guides pupils and teenagers to read critically, organize clear arguments, and express themselves accurately in both schoolwork and national exams.',
        imageKey: 'tutorKemi' as const,
        imageAlt: 'Portrait of Kemi Ogunsola, English Language and Literature Tutor',
      },
      {
        name: 'Ibrahim Danjuma',
        role: 'Science & Examination Preparation Tutor',
        credentials: 'B.Sc. Industrial Chemistry · PGDE',
        experience: '7 years science & practical coaching',
        specialties: ['Basic Science (JSS 1–3)', 'Chemistry & Biology (SSS 1–3)', 'JAMB & WAEC Sciences'],
        bio: 'Connects scientific principles to everyday examples and structured past-question drills, helping science candidates improve accuracy and recall.',
        imageKey: 'tutorIbrahim' as const,
        imageAlt: 'Portrait of Ibrahim Danjuma, Science and Examination Preparation Tutor',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CONTACT PAGE COPY
  // --------------------------------------------------------------------------
  contactPage: {
    kicker: 'Enquiries & Lesson Bookings',
    headline: 'Speak With BrightPath Home Tutors',
    intro:
      'Ready to arrange a home tutor for your child, or have questions about availability and fees? Send us an enquiry below or message us directly on WhatsApp.',
    studentClassOptions: [
      'Primary 1 – Primary 3',
      'Primary 4 – Primary 6 (incl. Common Entrance)',
      'JSS 1 – JSS 3 (incl. BECE / JSSCE)',
      'SSS 1 – SSS 3 (incl. WAEC / NECO / JAMB)',
      'IGCSE / International Curriculum',
      'Multiple Children / Siblings',
    ],
  },
};

/**
 * Formats a Nigerian local phone/WhatsApp number into a wa.me international link.
 * Easily adaptable if you switch to an international format in siteConfig.contact.whatsapp.
 */
export function buildWhatsAppUrl(rawNumber: string, prefilledMessage?: string): string {
  const digits = rawNumber.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  const base = `https://wa.me/${international}`;
  if (!prefilledMessage) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`;
}
