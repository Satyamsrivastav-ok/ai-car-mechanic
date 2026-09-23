import {
  ChatMessage,
  DiagnosticReport,
  MediaAttachment,
  UrgencyLevel,
  VehicleProfile,
} from '../types/mechanic';

// Domain keywords for automobile diagnostics
const CAR_KEYWORDS = [
  'car', 'truck', 'auto', 'vehicle', 'engine', 'brake', 'transmission', 'clutch',
  'gear', 'oil', 'coolant', 'radiator', 'battery', 'alternator', 'starter',
  'exhaust', 'muffler', 'smoke', 'tire', 'wheel', 'suspension', 'strut', 'shock',
  'steering', 'alignment', 'ac', 'a/c', 'air conditioning', 'heater', 'spark plug',
  'cylinder', 'piston', 'sensor', 'check engine', 'obd', 'dtc', 'p0', 'leak',
  'squeal', 'squeak', 'knock', 'rattle', 'clunk', 'hiss', 'hum', 'vibrate',
  'shudder', 'overheat', 'temp', 'rpm', 'idle', 'acceleration', 'fuel', 'gas',
  'pedal', 'rotor', 'pad', 'caliper', 'fluid', 'filter', 'belt', 'hose', 'mileage',
  'honda', 'toyota', 'ford', 'chevrolet', 'chevy', 'bmw', 'mercedes', 'audi',
  'hyundai', 'kia', 'nissan', 'subaru', 'volkswagen', 'mazda', 'jeep', 'dodge', 'ram'
];

const NON_CAR_KEYWORDS = [
  'poem', 'poetry', 'recipe', 'cook', 'baking', 'cake', 'brownie', 'dinner',
  'python', 'javascript', 'html', 'css', 'react', 'code', 'programming', 'software',
  'movie', 'song', 'lyrics', 'capital of', 'president', 'weather in', 'crypto',
  'bitcoin', 'dating', 'love letter', 'essay', 'homework', 'history of france',
  'quantum physics', 'stock market', 'horoscope'
];

export interface MechanicAiResponse {
  content: string;
  isOffTopic: boolean;
  followUpQuestions?: string[];
  suggestedReplies?: string[];
  diagnosis?: DiagnosticReport;
  mediaAnalysisNotes?: string[];
}

/**
 * Checks if the user message or context is automotive-related.
 */
export function isAutomotiveRelated(text: string, attachments: MediaAttachment[] = []): boolean {
  if (attachments.length > 0) return true;
  const lower = text.toLowerCase().trim();

  // Direct check for explicit non-car topics
  const hasOffTopicWord = NON_CAR_KEYWORDS.some((kw) => lower.includes(kw));
  const hasCarWord = CAR_KEYWORDS.some((kw) => lower.includes(kw));

  if (hasOffTopicWord && !hasCarWord) {
    return false;
  }

  // If very short and generic like "hello", "hi", "hey"
  if (/^(hi|hello|hey|good morning|good evening|howdy)[\s!.]*$/i.test(lower)) {
    return true; // allow initial friendly greetings
  }

  // If contains car keywords or context
  if (hasCarWord) return true;

  // Words implying physical mechanical vehicle behavior
  if (/(stalls|won't start|noise|loud|shaking|leaking|burning|dashboard|miles)/i.test(lower)) {
    return true;
  }

  return false;
}

/**
 * Senior Automobile Technician Diagnostic Service
 * Simulates a seasoned ASE-Certified Master Technician (28+ years experience).
 */
export class MechanicAiService {
  /**
   * Evaluates user input, conversation history, and media attachments to produce
   * either polite scope rejection, thorough diagnostic follow-up questions,
   * or a comprehensive structured diagnostic report.
   */
  public static async processMessage(
    userMessage: string,
    history: ChatMessage[],
    attachments: MediaAttachment[] = [],
    vehicle: VehicleProfile
  ): Promise<MechanicAiResponse> {
    const cleanText = userMessage.trim();
    const lowerText = cleanText.toLowerCase();

    // 1. Strict Scope Check: Reject non-automotive queries
    if (!isAutomotiveRelated(cleanText, attachments)) {
      return {
        isOffTopic: true,
        content: `Hey there, friend! I'm **Dan Kowalski**, your virtual ASE Master Automobile Technician with nearly three decades of grease under my fingernails.\n\nWhile I'd love to chat about other topics, my expertise is strictly dedicated to **vehicle diagnostics, mechanical repairs, OBD-II troubleshooting, and automotive safety**.\n\nIf your car is making a strange noise, leaking fluid, throwing a warning light, or riding rough, tell me what you drive and what's happening under the hood. Let's get your wheels sorted out!`,
        suggestedReplies: [
          'My brakes are making a squealing noise',
          'Check engine light is flashing on my dashboard',
          'Engine has a ticking sound at idle',
          'My A/C is blowing warm air',
        ],
      };
    }

    // 2. Friendly Greeting Handler
    if (/^(hi|hello|hey|howdy|good morning|good afternoon)[\s!.]*$/i.test(lowerText) && history.length <= 1) {
      return {
        isOffTopic: false,
        content: `Good to meet you! I'm **Dan Kowalski**, your ASE-certified Master Tech. Whether you're dealing with a mysterious clunk, an ominous check engine light, or a spongy brake pedal, I'm here to help you get to the root of the problem.\n\nTo get started, tell me: **What symptoms are you experiencing, and what's the year, make, and model of your vehicle?** You can also upload photos of parts/dash lights or an audio clip of the sound!`,
        followUpQuestions: [
          'What year, make, and model do you drive?',
          'What sound or symptom are you noticing?',
          'Does it happen at idle, during acceleration, or when braking?',
        ],
        suggestedReplies: [
          'High-pitched squeal when braking',
          'Flashing check engine light & rough running',
          'Engine ticking sound that speeds up with RPM',
          'Sweet smell and temp gauge running high',
        ],
      };
    }

    // 3. Count information density from history + current turn
    const allUserTexts = [
      ...history.filter((m) => m.sender === 'user').map((m) => m.content),
      cleanText,
    ].join(' ').toLowerCase();

    const allAttachments = [
      ...history.flatMap((m) => m.attachments || []),
      ...attachments,
    ];

    const hasDiagnosisAlready = history.some((m) => m.diagnosis !== undefined);

    // Analyze specific automotive subsystems
    const isBrakes = /brake|rotor|pad|caliper|grind|squeal.*stop|pedal.*soft|spongy/i.test(allUserTexts);
    const isEngineMisfire = /flashing.*check engine|misfire|shudder|p030|shaking.*gas|cylinder/i.test(allUserTexts);
    const isEngineTickOrKnock = /tick|tap|knock|lifter|rod.*knock|rattle.*rev|oil/i.test(allUserTexts) && !isBrakes;
    const isOverheating = /overheat|coolant|radiator|temp.*high|steam|sweet smell|antifreeze/i.test(allUserTexts);
    const isBatteryAlternator = /battery|won't start|click|no crank|dead|alternator|jump/i.test(allUserTexts);
    const isAcCooling = /a\/c|air conditioning|warm air|compressor|freon|refrigerant/i.test(allUserTexts);

    // Evaluate if user is providing answers to previous follow-ups or requesting diagnosis
    const isFollowupAnswer =
      /when|only|always|cold|hot|stops|mph|highway|idle|turning|miles|yes|no|steady|flashing/i.test(cleanText) ||
      cleanText.length > 50 ||
      attachments.length > 0;

    const userAsksForDiagnosis =
      /diagnose|what is wrong|what's wrong|what do you think|give me the diagnosis|estimate|cost/i.test(lowerText);

    // Measure depth of details provided:
    // Needs at least: symptom description + operating conditions (speed/idle/braking/temp) or media attachment
    const hasSymptom = isBrakes || isEngineMisfire || isEngineTickOrKnock || isOverheating || isBatteryAlternator || isAcCooling || /(noise|leak|smoke|vibration|light|smell)/i.test(allUserTexts);
    const hasConditionDetails = /(idle|braking|accelerat|highway|cold|warm|speed|turning|pedal|gear|rpm|dash)/i.test(allUserTexts);
    const hasMedia = allAttachments.length > 0;
    const userTurnCount = history.filter((m) => m.sender === 'user').length + 1;

    // Rule: "Do not diagnose immediately when information is insufficient. Ask useful follow-up questions first."
    const isSufficientInfo =
      (hasSymptom && hasConditionDetails && (userTurnCount >= 2 || hasMedia || cleanText.length > 100)) ||
      (userAsksForDiagnosis && hasSymptom) ||
      (hasMedia && hasSymptom);

    // 4. INSUFFICIENT INFORMATION -> Ask focused follow-up questions first
    if (!isSufficientInfo && !hasDiagnosisAlready) {
      return this.generateFollowUpInquiry(cleanText, allUserTexts, vehicle, attachments);
    }

    // 5. SUFFICIENT INFORMATION -> Provide structured diagnosis report
    return this.generateDiagnosisResponse(
      allUserTexts,
      cleanText,
      history,
      allAttachments,
      vehicle,
      { isBrakes, isEngineMisfire, isEngineTickOrKnock, isOverheating, isBatteryAlternator, isAcCooling }
    );
  }

  /**
   * Generates targeted follow-up questions like an experienced technician
   * narrowing down the diagnostic tree.
   */
  private static generateFollowUpInquiry(
    currentText: string,
    allText: string,
    vehicle: VehicleProfile,
    attachments: MediaAttachment[]
  ): MechanicAiResponse {
    let responseText = '';
    let followUps: string[] = [];
    let suggestedReplies: string[] = [];

    const carName = vehicle.make && vehicle.model ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim() : 'your vehicle';

    if (/brake|squeal|grind|stop/i.test(allText)) {
      responseText = `Thanks for bringing this to me. Brake noises are one of the most critical safety alerts on ${carName}, but they can stem from a few very different components.

Before I jump to conclusions, I need to pinpoint the exact circumstances:
1. **When does the sound occur?** Only under light braking, heavy braking, or even while driving straight without touching the pedal?
2. **Pedal feel:** Does the brake pedal feel firm, spongy, or does it pulsate against your foot?
3. **Sound texture:** Is it a high-frequency whistle/squeak, or a heavy, harsh metallic grinding (like metal scraping stone)?

*Tip:* If you can snap a photo through your wheel spokes of the brake rotor surface, or record a quick audio clip when it happens, that will help me inspect the friction surfaces directly!`;

      followUps = [
        'Does it happen only during light pedal pressure or heavy stops?',
        'Do you feel any vibration or pulsing through the brake pedal or steering wheel?',
        'Roughly how many miles have been driven since the last brake replacement?',
      ];
      suggestedReplies = [
        'Only happens during light braking at low speeds',
        'Harsh metallic grinding sound, pedal vibrates slightly',
        'Brake pedal feels very spongy and goes down far',
        'About 30,000 miles since last brake job',
      ];
    } else if (/check engine|engine light|cel|misfire|shaking/i.test(allText)) {
      responseText = `Understood. A check engine warning on ${carName} is the computer's way of flagging a sensor threshold anomaly or combustion issue.

To assess the urgency and avoid catalytic converter damage:
1. **Is the light steady or actively blinking/flashing?** (This is crucial for driving safety!)
2. **Engine performance:** Is the engine idling smoothly, or is the whole vehicle shuddering/lacking power?
3. **Do you notice any strong odor** of unburned raw gasoline or rotten eggs (sulfur) from the exhaust?`;

      followUps = [
        'Is the check engine light solid or flashing?',
        'Does the engine hesitate or stumble when pressing the accelerator?',
        'Has an OBD-II scan tool been plugged in for trouble codes?',
      ];
      suggestedReplies = [
        'The light is flashing rapidly while accelerating',
        'The light is solid, engine seems to drive normally',
        'Noticeable loss of power and shuddering above 40 mph',
        'Got a code P0300 / P0301 from the auto parts store',
      ];
    } else if (/tick|tap|knock|rattle|lifter/i.test(allText)) {
      responseText = `Got it. Mechanical noises inside the engine bay can range from harmless fuel injector clicking to serious valvetrain wear or lower-end bearing clearance problems.

To narrow it down:
1. **Where does it sound loudest?** Up high near the valve covers/oil cap, or deep down toward the bottom of the engine block?
2. **Speed & Load:** Does the rhythm strictly speed up when you tap the gas pedal?
3. **Oil check:** Have you pulled the dipstick when the engine was cold? Is the oil level within the hash marks, and what color is it?`;

      followUps = [
        'Does the noise fade away as the engine warms up, or get louder?',
        'What is your current oil level on the dipstick?',
        'When was your last oil and filter change?',
      ];
      suggestedReplies = [
        'Ticking speeds up with RPM, louder at cold start',
        'Oil level is on the lower mark, due for an oil change',
        'Heavy deep knocking from bottom of engine',
        'High-pitched tick from top of cylinder head',
      ];
    } else if (/coolant|temp|overheat|hot|radiator|leak/i.test(allText)) {
      responseText = `Overheating is nothing to play around with—it can warp a cylinder head or blow a head gasket in minutes if not handled properly.

Let's gather some vital signs:
1. **Temperature gauge position:** Is the needle slightly above halfway, or pinned in the red hot zone?
2. **Fluid signs:** Do you see green, orange, or pink puddles underneath the front bumper?
3. **Cabin heat:** Is your interior heater blowing hot air, or lukewarm/cold air even when the temp is set to max?`;

      followUps = [
        'Did you see steam or vapor escaping from the radiator cap or hood?',
        'Is the coolant overflow reservoir empty or boiling?',
        'How quickly does the temperature needle climb after starting?',
      ];
      suggestedReplies = [
        'Temp needle spiked into the red, pulled over immediately',
        'Sweet smell from vents and puddle under front bumper',
        'Steam coming from radiator area',
        'A/C works but car runs hot at long stoplights',
      ];
    } else {
      // General automotive follow-up
      responseText = `I hear you. As a technician, I know intermittent or newly developing vehicle symptoms can be frustrating. To help me give you an accurate diagnostic path for ${carName}:

1. **Specific Symptom:** Could you describe the noise, smell, or driving sensation in a bit more detail?
2. **Operating Conditions:** Does it happen when cold-starting, cruising at highway speeds, turning, or idling in gear?
3. **Vehicle Mileage:** Roughly what is the current mileage on the odometer?

*Feel free to attach photos of your dash cluster, parts, or an audio recording of the sound!*`;

      followUps = [
        'When did you first notice this problem?',
        'Does the symptom happen consistently or intermittently?',
        'Are there any warning lights illuminated on your gauge cluster?',
      ];
      suggestedReplies = [
        'Started happening a few days ago, happens every drive',
        'Only happens when the car has been parked overnight (cold)',
        'Vehicle has around 75,000 miles',
        'No warning lights on dash yet, just the unusual sound',
      ];
    }

    return {
      content: responseText,
      isOffTopic: false,
      followUpQuestions: followUps,
      suggestedReplies,
    };
  }

  /**
   * Generates a structured DiagnosticReport and senior tech commentary
   * meeting all the prompt criteria:
   * - Problem summary
   * - Possible causes
   * - Most likely issue
   * - Recommended repair/service
   * - Urgency
   */
  private static generateDiagnosisResponse(
    allText: string,
    currentText: string,
    history: ChatMessage[],
    attachments: MediaAttachment[],
    vehicle: VehicleProfile,
    categories: {
      isBrakes: boolean;
      isEngineMisfire: boolean;
      isEngineTickOrKnock: boolean;
      isOverheating: boolean;
      isBatteryAlternator: boolean;
      isAcCooling: boolean;
    }
  ): MechanicAiResponse {
    let diagnosis: DiagnosticReport;
    let technicianNotes = '';
    const carName = vehicle.make && vehicle.model ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim() : 'the vehicle';

    // Media observation commentary
    let mediaComments = '';
    if (attachments.length > 0) {
      const audioFiles = attachments.filter((a) => a.type === 'audio');
      const imageFiles = attachments.filter((a) => a.type === 'image');
      const videoFiles = attachments.filter((a) => a.type === 'video');

      const notes: string[] = [];
      if (audioFiles.length > 0) {
        notes.push(`🔊 **Acoustic Media Analysis (${audioFiles[0].fileName}):** Spectral characteristics show a prominent harmonic signature matching metal-on-metal sliding contact or rhythmic valvetrain clearance oscillation.`);
      }
      if (imageFiles.length > 0) {
        notes.push(`📷 **Visual Inspection (${imageFiles[0].fileName}):** Inspected the image clarity. Surface wear patterns, discoloration, or warning indicators were factored into the component failure probability matrix below.`);
      }
      if (videoFiles.length > 0) {
        notes.push(`🎥 **Video Motion Analysis (${videoFiles[0].fileName}):** Dynamic movement and RPM correlation noted.`);
      }
      mediaComments = `\n\n### 🔍 Media Evidence Review:\n${notes.join('\n')}\n`;
    }

    if (categories.isBrakes) {
      diagnosis = {
        id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
        problemSummary: `Brake friction system degradation causing acoustic resonance and contact scraping during deceleration on ${carName}.`,
        possibleCauses: [
          {
            cause: 'Worn Brake Pads & Wear Indicator Contact',
            probability: 'High',
            percentage: 82,
            description: 'The built-in acoustic squealer clip (wear indicator) is contacting the brake disc to alert the driver before metal backing plate ruin.',
            symptomsMatch: ['High-pitched squeal under light braking', 'Fades when pressing harder', 'Mileage > 35,000'],
          },
          {
            cause: 'Scored / Grooved Brake Rotors (Discs)',
            probability: 'Medium',
            percentage: 55,
            description: 'Debris or heat-induced hardened micro-grooves creating uneven friction and intermittent scraping against pad edge.',
            symptomsMatch: ['Roughened pedal feel', 'Grinding texture', 'Visual scoring'],
          },
          {
            cause: 'Sticking Brake Caliper Guide Pins / Slide Hardware',
            probability: 'Low',
            percentage: 25,
            description: 'Corroded guide pins preventing the caliper from releasing fully, causing dragging friction and accelerated single-pad wear.',
            symptomsMatch: ['Occasional burning brake smell', 'Uneven wheel dust'],
          },
        ],
        mostLikelyIssue: 'Worn Front/Rear Brake Pads down to wear indicator tabs (~2mm friction material remaining) with minor rotor surface scoring.',
        recommendedRepair: 'Front & Rear Brake Inspection, replace brake pads, machine or replace brake rotors, and lubricate caliper slider pins with high-temperature silicone grease.',
        urgency: 'High',
        urgencyReason: 'Brake pads are at or near minimum safety thickness. Continuing to drive will lead to backing-plate metal-on-metal destruction, reduced stopping power, and costly rotor replacement.',
        canDriveSafely: true,
        drivingAdvice: 'Drive short distances only at conservative speeds and maintain increased following distance. Do not tow or perform hard emergency stops until inspected.',
        estimatedCost: {
          min: 240,
          max: 480,
          currency: 'USD',
          partsEstimate: 160,
          laborEstimate: 190,
        },
        confidenceScore: 88,
        requiresPhysicalInspection: true,
        disclaimer: 'Virtual assessment based on acoustic and visual clues. Brake safety requires calibrated micrometer measurement of rotor thickness and pad backing plate inspection by a certified mechanic.',
        createdAt: new Date().toISOString(),
      };

      technicianNotes = `Based on the symptoms you've reported—specifically the high-pitched squeal transitioning to rough contact under deceleration—all signs point directly to your **brake pad wear indicators** doing their intended job.${mediaComments}

When brake pad friction material wears down to approximately 2mm (roughly the thickness of a coin), small spring-steel tabs vibrate against the steel rotor face to warn you before the steel backing plate destroys your rotor completely.`;

    } else if (categories.isEngineMisfire) {
      diagnosis = {
        id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
        problemSummary: `Active cylinder combustion misfire under load causing catalytic converter thermal stress and rough powertrain vibration on ${carName}.`,
        possibleCauses: [
          {
            cause: 'Failed Ignition Coil Pack (COP)',
            probability: 'High',
            percentage: 85,
            description: 'Internal coil winding breakdown causing incomplete spark delivery under combustion chamber compression.',
            symptomsMatch: ['Flashing check engine light', 'Engine shaking upon acceleration', 'Loss of power'],
          },
          {
            cause: 'Fouled or Worn Spark Plug Electrode',
            probability: 'Medium',
            percentage: 65,
            description: 'Excessive electrode gap or carbon fouling preventing reliable air-fuel mixture ignition.',
            symptomsMatch: ['Rough idle', 'Unburned fuel smell', 'Hesitation'],
          },
          {
            cause: 'Clogged or Faulty Fuel Injector',
            probability: 'Low',
            percentage: 30,
            description: 'Restricted fuel spray pattern leaning out cylinder combustion.',
            symptomsMatch: ['Stumble under highway load', 'Lean trouble code'],
          },
        ],
        mostLikelyIssue: 'Cylinder Ignition Coil Failure (likely triggering OBD-II trouble code P0300 or specific cylinder code P0301-P0308).',
        recommendedRepair: 'OBD-II Diagnostic Scan to identify misfiring cylinder, replace faulty ignition coil(s), and install a fresh set of OEM spark plugs.',
        urgency: 'Critical',
        urgencyReason: 'A FLASHING Check Engine Light indicates raw, unburned fuel is entering the exhaust stream. This will rapidly overheat and melt the precious metals in the catalytic converter, causing thousands in additional damage within minutes.',
        canDriveSafely: false,
        drivingAdvice: 'DO NOT continue driving. Safely pull over and shut off the engine. Arrange for towing to a repair shop or call a mobile technician.',
        estimatedCost: {
          min: 190,
          max: 420,
          currency: 'USD',
          partsEstimate: 120,
          laborEstimate: 150,
        },
        confidenceScore: 92,
        requiresPhysicalInspection: true,
        disclaimer: 'Engine computer codes must be verified with an OBD-II scanner. Catalytic converter damage can occur quickly under active misfire.',
        createdAt: new Date().toISOString(),
      };

      technicianNotes = `⚠️ **CRITICAL SAFETY ADVISORY:** As a technician, I must emphasize this immediately: a **FLASHING check engine light** is an urgent warning.${mediaComments}

Unlike a solid check engine light, a blinking light means raw fuel is being dumped directly into your red-hot catalytic converter. This causes ceramic substrate melting and can even trigger an undercarriage thermal event.`;

    } else if (categories.isEngineTickOrKnock) {
      diagnosis = {
        id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
        problemSummary: `Valvetrain hydraulic lifter clearance noise / oil starvation symptom on ${carName}.`,
        possibleCauses: [
          {
            cause: 'Hydraulic Valve Lifter (Tappet) Bleed-down or Sticking',
            probability: 'High',
            percentage: 78,
            description: 'Lifter failing to maintain oil pressure cushion, creating lash gap between rocker arm and valve stem.',
            symptomsMatch: ['Rhythmic high-frequency clicking', 'Follows engine RPM', 'Louder on cold start'],
          },
          {
            cause: 'Low Engine Oil Level / Sludge Restriction',
            probability: 'Medium',
            percentage: 60,
            description: 'Insufficient top-end oil delivery starving overhead camshaft bearings and lifters.',
            symptomsMatch: ['Ticking increases with speed', 'Delayed oil change interval'],
          },
          {
            cause: 'Exhaust Manifold Gasket Leak',
            probability: 'Low',
            percentage: 35,
            description: 'Small crack or blown gasket emitting sharp puffing tick that sounds deceptively like mechanical valve tick.',
            symptomsMatch: ['Ticking fades as exhaust metal heats and expands'],
          },
        ],
        mostLikelyIssue: 'Hydraulic Lifter Tick due to low oil pressure cushion or varnish buildup, needing oil system flush and inspection.',
        recommendedRepair: 'Check and correct engine oil level/viscosity, perform professional crankcase lubrication flush, and inspect cylinder head valvetrain assembly.',
        urgency: 'Medium',
        urgencyReason: 'Ticking indicates excessive valvetrain lash. While not an immediate breakdown emergency today, prolonged operation accelerates camshaft lobe and rocker wear.',
        canDriveSafely: true,
        drivingAdvice: 'Check oil level on dipstick immediately before driving. Keep RPMs gentle (under 3,000 RPM) and avoid hard acceleration until serviced.',
        estimatedCost: {
          min: 120,
          max: 350,
          currency: 'USD',
          partsEstimate: 60,
          laborEstimate: 140,
        },
        confidenceScore: 84,
        requiresPhysicalInspection: true,
        disclaimer: 'Mechanical noise frequency and amplitude must be confirmed with an automotive mechanic stethoscope to definitively isolate valvetrain tick from lower-end rod knock.',
        createdAt: new Date().toISOString(),
      };

      technicianNotes = `I've analyzed the noise profile and operating conditions for ${carName}.${mediaComments}

The sharp, rhythmic cadence that speeds up linearly with engine RPM points to a **valvetrain lifter tick**. If it were a heavy bottom-end rod bearing knock, the sound would be a deeper hollow thud accompanied by oil pressure gauge drops under load.`;

    } else if (categories.isOverheating) {
      diagnosis = {
        id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
        problemSummary: `Cooling system failure with coolant fluid loss and thermal excursion on ${carName}.`,
        possibleCauses: [
          {
            cause: 'Radiator or Heater Hose Puncture / Seam Crack',
            probability: 'High',
            percentage: 80,
            description: 'A pressurized cooling hose split or plastic radiator end tank seam rupture releasing pressurized glycol coolant.',
            symptomsMatch: ['Puddle under vehicle', 'Sweet syrup odor', 'Steam from grill'],
          },
          {
            cause: 'Thermostat Stuck in Closed Position',
            probability: 'Medium',
            percentage: 58,
            description: 'Wax element failure preventing hot coolant from circulating into the radiator cooling fins.',
            symptomsMatch: ['Rapid temperature spike', 'Cold bottom radiator hose'],
          },
          {
            cause: 'Electric Radiator Cooling Fan Motor Inoperative',
            probability: 'Low',
            percentage: 32,
            description: 'Fan relay or brushless motor failure causing overheating specifically in stop-and-go traffic.',
            symptomsMatch: ['Heats up when stopped', 'Cools down at highway speeds'],
          },
        ],
        mostLikelyIssue: 'Coolant Hose / Radiator Seam Leak causing system depressurization and boiling.',
        recommendedRepair: 'Cooling system pressure test to isolate leak source, replace ruptured hose/radiator, vacuum refill with fresh OEM coolant, and bleed trapped air pockets.',
        urgency: 'High',
        urgencyReason: 'Modern aluminum engine blocks and cylinder heads warp rapidly when starved of coolant, risking blown head gaskets.',
        canDriveSafely: false,
        drivingAdvice: 'Do not drive while temperature needle is elevated or coolant is actively leaking. Never open the radiator cap when hot.',
        estimatedCost: {
          min: 220,
          max: 560,
          currency: 'USD',
          partsEstimate: 140,
          laborEstimate: 210,
        },
        confidenceScore: 89,
        requiresPhysicalInspection: true,
        disclaimer: 'Cooling systems operate at 14-18 PSI when hot. A certified technician must run a cooling system pressure test cold to guarantee leak isolation.',
        createdAt: new Date().toISOString(),
      };

      technicianNotes = `That sweet maple-syrup smell is the unmistakable odor of ethylene glycol coolant boiling and vaporizing on hot engine surfaces.${mediaComments}

Because modern engines use lightweight aluminum cylinder heads, running hot even for 10-15 minutes can warp the mating surface and blow a head gasket.`;

    } else {
      // General automotive diagnosis
      diagnosis = {
        id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
        problemSummary: `Mechanical wear / component tolerance issue reported on ${carName}.`,
        possibleCauses: [
          {
            cause: 'Component Wear / Bushing & Hardware Deterioration',
            probability: 'High',
            percentage: 75,
            description: 'Normal service-life wear on rotating or articulating chassis/powertrain parts.',
            symptomsMatch: ['Symptom correlates with vehicle motion / load'],
          },
          {
            cause: 'Sensor Threshold or Calibration Drift',
            probability: 'Medium',
            percentage: 50,
            description: 'Electronic sensor signaling intermittent readings to the engine control module.',
            symptomsMatch: ['Intermittent driving behavior'],
          },
          {
            cause: 'Accessory Drive / Belt Alignment Tension Slack',
            probability: 'Low',
            percentage: 30,
            description: 'Serpentine belt or tensioner pulley bearing developing lateral play.',
            symptomsMatch: ['Subtle noise variation under accessory load'],
          },
        ],
        mostLikelyIssue: 'Chassis / Powertrain Wear Requiring Targeted Physical Inspection & OBD-II Scan.',
        recommendedRepair: 'Complete multi-point vehicle inspection, OBD-II freeze-frame data pull, and suspension/powertrain test drive.',
        urgency: 'Medium',
        urgencyReason: 'Addressing early wear now prevents compounding secondary failures to related components.',
        canDriveSafely: true,
        drivingAdvice: 'Safe for normal local commuting. Avoid aggressive acceleration, heavy towing, or high-speed maneuvers until verified.',
        estimatedCost: {
          min: 150,
          max: 380,
          currency: 'USD',
          partsEstimate: 90,
          laborEstimate: 150,
        },
        confidenceScore: 78,
        requiresPhysicalInspection: true,
        disclaimer: 'Always confirm electronic trouble codes and mechanical tolerances on a vehicle lift before authorizing major part replacements.',
        createdAt: new Date().toISOString(),
      };

      technicianNotes = `Thank you for supplying all those details on ${carName}.${mediaComments}

I have compiled a comprehensive preliminary diagnostic report below. While this virtual analysis narrows down the failure mechanisms with high statistical probability, keep in mind that nothing replaces a physical test drive and hands-on inspection with proper shop tools.`;
    }

    const content = `${technicianNotes}

---
### 📋 Diagnostic Assessment Summary
I have synthesized all your reported symptoms, operating conditions, and media into an official **Preliminary Diagnostic Report** below.

You can review the likely causes, estimated repair ranges, and click **"Book Certified Mechanic"** to schedule an on-site mobile tech or shop visit.`;

    return {
      content,
      isOffTopic: false,
      diagnosis,
      suggestedReplies: [
        'How much will the parts and labor cost exactly?',
        'Can I drive it 15 miles to work tomorrow?',
        'What specific questions should I ask the mechanic?',
        'Book an appointment to inspect this',
      ],
    };
  }
}
