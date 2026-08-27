import type { Dictionary } from './zh-tw';

/**
 * English UI string dictionary. Mirrors zh-tw.ts key-for-key so missing
 * translations fail a type check rather than silently falling through.
 */
export const en: Dictionary = {
  nav: {
    home: 'Home',
    solutions: 'Solutions',
    products: 'Products',
    industries: 'Industries',
    about: 'About',
    insights: 'Insights',
    contact: 'Contact',
    ctaPrimary: 'Discuss Your Project',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skipToContent: 'Skip to content',
  },
  cta: {
    primary: 'Discuss Your Project',
    secondary: 'Request Technical Advice',
    viewSolutions: 'View Solutions',
    viewProducts: 'View Product Specs',
    downloadSpec: 'Download Datasheet',
    contactEngineering: 'Contact Engineering',
    learnMore: 'Learn More',
    viewDetail: 'View Details',
    backHome: 'Back to Home',
    backSolutions: 'View Solutions',
    relatedSolutions: 'Related Solutions',
    relatedProducts: 'Compatible Products',
    downloadDatasheet: 'Download Datasheet PDF (sample file)',
  },
  footer: {
    solutionsHeading: 'Solutions',
    productsHeading: 'Products',
    companyHeading: 'Company',
    resourcesHeading: 'Insights',
    contactHeading: 'Contact',
    legalNotice:
      'Concept website created for portfolio demonstration. All company names, products, specifications and project information are fictional.',
    rights: 'All rights reserved',
    langSwitch: '中文',
  },
  breadcrumb: {
    home: 'Home',
  },
  form: {
    companyName: 'Company Name',
    contactName: 'Full Name',
    jobTitle: 'Job Title',
    email: 'Email',
    phone: 'Phone',
    country: 'Country / Region',
    industry: 'Industry',
    projectType: 'Project Type',
    requirement: 'Project Requirements',
    timeline: 'Target Timeline',
    budget: 'Budget Range',
    hasSpec: 'Do you have technical specifications?',
    needNda: 'Do you require an NDA?',
    attachmentNote: 'Have drawings, spec sheets, or line photos to share? Email them as attachments to the address below after submitting.',
    privacyConsent:
      'I have read and agree to the {privacyLink} and consent to being contacted by FORGEON AUTOMATION regarding this inquiry.',
    privacyLinkLabel: 'privacy policy',
    submit: 'Submit Request',
    submitting: 'Submitting…',
    yes: 'Yes',
    no: 'No',
    selectPlaceholder: 'Select an option',
    requiredMark: 'required',
    errors: {
      required: 'This field is required',
      email: 'Enter a valid email address',
      phone: 'Enter a valid phone number',
      consent: 'Please agree to the privacy policy to continue',
      minLength: 'Please provide more detail (at least 20 characters)',
    },
    successTitle: 'Request Received',
    successBody: 'Thank you for reaching out. Our engineering team will follow up within 2 business days.',
    demoModeNotice:
      'Demo mode: this page demonstrates the full RFQ form validation flow. Nothing you enter is sent or stored, and there is no reply commitment. See README for production API setup.',
    demoModeSubmitTitle: 'Validation flow demonstrated',
    demoModeSubmitBody:
      'Form validation passed, demonstrating the complete RFQ validation experience. Because this is a demo environment, no data was actually sent or stored, and no one will follow up. That is expected behavior for a portfolio showcase site, not an error.',
    errorTitle: 'Submission Failed',
    errorBody: 'Please try again later, or email our engineering team directly.',
  },
  states: {
    loading: 'Loading…',
    empty: 'No related content yet',
    error: 'Something went wrong. Please try again.',
  },
  demoNotice: {
    specLabel: 'Concept Demonstration Data',
    specBody:
      'Specifications shown on this page are fictional demonstration data. Actual configurations require engineering review.',
  },
  misc: {
    faqHeading: 'Frequently Asked Questions',
    processHeading: 'Implementation Process',
    specTableHeading: 'Technical Specifications',
    optionsHeading: 'Optional Configurations',
    relatedHeading: 'Related',
    readMore: 'Read Article',
    publishedOn: 'Published',
    demoDataBadge: 'Demo Data',
    conceptImageBadge: 'Concept Illustration',
  },
  contactIntent: {
    projectHeading: 'Submit Your Project Request',
    projectBody: 'Fill out the form below with your process background and requirements. This page demonstrates the full RFQ validation flow; as a portfolio demo, nothing you submit is sent or stored, and there is no reply commitment.',
    technicalHeading: 'Request Technical Advice',
    technicalBody: "Not ready to submit a full project brief yet? Describe the technical question you're facing and we'll help evaluate a starting direction. This page demonstrates the RFQ form's validation flow; nothing you submit is sent or stored.",
  },
  productionImagery: {
    automationIntegration: {
      alt: 'Enclosed automation cell with a robotic arm working across a conveyor, locating fixtures, sensing station and control cabinet',
      caption: 'Representative system integration view: conveyor, locating fixtures, robotic operation, sensing and output.',
    },
    controlEngineering: {
      alt: 'Engineer using a digital multimeter at an automation control cabinet with terminal wiring, PLC and I/O modules, and drives visible',
      caption: 'Representative control engineering view: cabinet wiring, terminal measurement, PLC and I/O, and on-site commissioning.',
    },
    machineVisionInspection: {
      alt: 'Industrial camera, lens and ring light aligned above precision metal workpieces held in a machine-vision inspection fixture',
      caption: 'Representative machine-vision inspection view: a fixed camera, lens and ring-light geometry aligned with fixtured workpieces.',
    },
    visionGuidedAssembly: {
      alt: 'Enclosed assembly workstation with an industrial camera and ring light aligned to a fixtured part while a robotic gripper performs positioning and assembly',
      caption: 'Representative vision-guided assembly view: camera and ring light acquire the part position, then the robot performs picking, alignment and assembly at the fixture.',
    },
    precisionHandling: {
      alt: 'Horizontal linear axis and Z-axis positioning a parallel gripper around the outside diameter of a cylindrical workpiece on a fixture',
      caption: 'Representative precision-handling view: the motion and load relationship between linear axes, a parallel gripper, workpiece and fixture.',
    },
    modularWorkstation: {
      alt: 'Modular automation workstation with a robotic process module on the left, shared transfer interface at centre and vertical process module on the right',
      caption: 'Concept demonstration image: robotic process module, shared transfer interface and vertical process module integrated on one workstation platform.',
    },
    existingLineRetrofit: {
      alt: 'Engineer using a wired pendant beside an existing production machine linked through a physical handoff to a new aluminium-frame automation module and control cabinet',
      caption: 'Representative existing-line retrofit view: retained equipment connects through a physical handoff to a new automation module, updated controls and on-site commissioning.',
    },
    semiconductorElectronics: {
      alt: 'Electronics assembly station with an industrial camera and ring light aligned to a PCB fixture, a precision process head above the board, and component trays and tape nearby',
      caption: 'Representative semiconductor and electronics assembly view: vision, a precision process head, PCB fixture and component feeding working within one station.',
    },
    automotiveComponents: {
      alt: 'Yellow industrial robot positioning a cast metal component on a fixture with an inspection light and surrounding sensors aimed at the work area',
      caption: 'Representative automotive-component automation view: robot, cast part, locating fixture and inspection light forming a handling and inspection station.',
    },
    metalMachining: {
      alt: 'White industrial robot holding a precision metal workpiece at a CNC machine while a measurement probe aligns with another fixtured part on the right',
      caption: 'Representative metal-machining automation view: a robot linking the machine tool, workpiece buffer fixtures and an external measurement position.',
    },
    packagingLogistics: {
      alt: 'Cartons moving across intersecting conveyors with a vision sensing station on the left and a robot using vacuum grippers to handle a carton at the rear',
      caption: 'Representative packaging and logistics automation view: conveying, routing, vision sensing and robotic carton handling in one continuous workflow.',
    },
    fieldCommissioning: {
      alt: 'Two engineers in hard hats and safety glasses commissioning an automation system, one at the control panel and wired pendant while the other inspects the machine',
      caption: 'Representative field-commissioning view: control-side setup and machine-side visual verification within a shared validation and handoff workflow.',
    },
  },
  engineeringDiagrams: {
    visionGuidedAssembly: {
      eyebrow: 'System Architecture',
      title: 'Signal Path from Image Capture to Assembly Confirmation',
      description: 'A concept-level view of how vision, controls and execution modules exchange signals. Actual equipment, communication interfaces and safety design depend on the part and site conditions.',
      flowLabel: 'Primary signal flow for vision-guided automated assembly',
      input: {
        label: 'Part and Station Trigger',
        detail: 'Part arrival, fixture-ready state and trigger conditions',
      },
      stages: [
        { code: 'VIS', title: 'Image Capture', detail: 'Camera, lens and lighting acquire part features' },
        { code: 'LOC', title: 'Position Decision', detail: 'Image processing determines position, orientation and acceptance state' },
        { code: 'MOT', title: 'Coordinates and Motion', detail: 'Position data becomes robot or motion-module commands' },
        { code: 'VER', title: 'Process Confirmation', detail: 'Assembly or inspection completion returns the station state' },
      ],
      output: {
        label: 'Station Output',
        detail: 'Completion signal, fault state and required traceability data',
      },
      support: [
        { title: 'Control and Synchronisation', detail: 'Coordination among the PLC, motion controller and station cycle.' },
        { title: 'Safety and Interlocks', detail: 'Guarding, door locks, emergency stops and safety circuits require site risk assessment.' },
      ],
      disclosure: 'Conceptual system architecture only. It does not represent a specific equipment brand, protocol, control program or completed customer project.',
    },
    lineUpgrade: {
      eyebrow: 'Integration Boundaries',
      title: 'Interface Boundaries Between Retained and New Equipment',
      description: 'A localized upgrade is more than adding equipment. The retained mechanics, signals and control functions are identified first, then the handoff to the new module is defined.',
      flowLabel: 'Primary integration flow for an existing-line localized upgrade',
      input: {
        label: 'Retained Equipment',
        detail: 'Usable process, mechanical and control assets',
      },
      stages: [
        { code: 'AUD', title: 'Current-State Survey', detail: 'Confirm mechanical handoff, electrical signals and controller versions' },
        { code: 'IFC', title: 'Interface Definition', detail: 'Separate retained, replaced and bridged boundaries' },
        { code: 'ADD', title: 'Added Module', detail: 'Configure sensing, motion, handling and required control functions' },
        { code: 'VAL', title: 'Combined Validation', detail: 'Check sequence, interlocks and fault handling against agreed conditions' },
      ],
      output: {
        label: 'Verifiable Integration Conditions',
        detail: 'Handoff interfaces, operating sequence and acceptance items',
      },
      support: [
        { title: 'Mechanical Boundary', detail: 'Part-transfer position, installation space and whether existing fixtures remain in use.' },
        { title: 'Control Boundary', detail: 'Signal ownership, interlock conditions, fault codes and maintenance approach.' },
      ],
      disclosure: 'Conceptual integration boundary only. It does not represent a real factory layout, existing-equipment condition, retrofit result or performance improvement.',
    },
  },
  hero: {
    eyebrow: 'VISION-X2 · Precision Vision Positioning',
    headline: 'Tolerance is measured in microns,\nnot adjectives.',
    body: 'FORGEON integrates vision positioning, defect inspection and precision motion into one system, so every position has a verifiable basis.',
    ctaPrimary: 'Submit a Project Request',
    ctaSecondary: 'Browse Product Line',
    imageAlt: 'VISION-X2 vision module suspended above a robotic arm, its ring light illuminating a precision machined workpiece in the fixture below',
  },
  visionSignature: {
    eyebrow: 'VISION-X2',
    positioning: 'Vision Positioning Module',
    macroValue: 'Every lens element and focus ring exists so the recognition result can be traced back to its source.',
    macroCta: 'View Full Specification',
    macroImageAlt: 'Close-up of the VISION-X2 lens against a dark background, showing focus ring markings, optical coating, and the edge of the ring light',
    wholeTitle: 'Vision Positioning Module',
    wholeDesc: 'For workpiece positioning, defect detection, and barcode/feature recognition, deployed standalone or integrated into an automated assembly system.',
    wholeFeatures: [
      'Supports workpiece positioning and angular offset calculation',
      'Performs surface defect inspection',
      'Lighting module selectable per material characteristics',
    ],
    wholeCta: 'View full details →',
    wholeImageAlt: 'VISION-X2 camera and lens mounted above a robotic arm, its ring light illuminating precision machined workpieces arranged in the fixture below',
  },
  industrialReality: {
    eyebrow: 'Deployed on the Line',
    statement: 'From a precision component to a complete production system, FORGEON’s modular equipment works together on a real production line.',
    closing: 'FORGEON does not just showcase a single precision component — it brings precision motion, vision positioning, and modular equipment into a real production-line environment.',
    imageAlt: 'Enclosed automation cell with a robotic arm working across a conveyor, locating fixtures, sensing station and control cabinet',
    labels: {
      arm: 'Six-axis robotic arm',
      fixture: 'Locating fixture',
      conveyor: 'Conveyor line',
      control: 'Control cabinet & HMI',
    },
  },
  integrationLogic: {
    eyebrow: 'Deployment Process',
    title: 'From Requirements to On-Site Acceptance',
    statement: 'Beyond the precision component and the production system, FORGEON treats the deployment process itself as an engineering deliverable — each stage has a defined input, decision point, and handoff condition.',
    imageAlt: 'Two engineers wearing hard hats and safety glasses collaborating beside automation equipment, one operating a control panel and wired pendant, the other inspecting the machine',
  },
  homeFinalCta: {
    eyebrow: 'Start Here',
    title: 'Ready to discuss your automation project?',
    description: 'Submit your project background and requirements, and our engineering team will help evaluate a workable solution.',
  },
  productDetailVisionX2: {
    breadcrumbProducts: 'Products',
    heroEyebrow: 'Product / Vision Positioning Module',
    heroPositioning: 'Vision Positioning Module',
    heroValue: 'For workpiece positioning, defect detection, and barcode/feature recognition, deployed standalone or integrated into an automated assembly system.',
    heroPrimaryCta: 'Discuss Your Project',
    heroSecondaryCta: 'View Technical Specifications',
    heroMacroImageAlt: 'VISION-X2 lens close-up against a dark background, showing the focus-ring markings, optical coating, and the glowing edge of the ring light',
  },
  productDetailVisionX2CoreCapabilities: {
    eyebrow: 'Core Capabilities',
    title: 'Five Capabilities, From Positioning to Recognition',
    statement: 'Each capability corresponds to an actual production-line scenario.',
    applicationLabel: 'Application',
    items: [
      {
        title: 'Workpiece Positioning and Angular Offset Calculation',
        description: 'Confirms the workpiece’s actual position and angle on the fixture, giving downstream robotic arms or motion modules the data to correct their path.',
        application: 'Pre-assembly workpiece position confirmation',
      },
      {
        title: 'Surface Defect Inspection',
        description: 'Inspects the workpiece surface for visual anomalies, providing the basis for production-line quality control decisions.',
        application: 'Inline surface inspection stations',
      },
      {
        title: 'Barcode and Feature Recognition',
        description: 'Reads barcodes or workpiece features as the basis for batch traceability and process logging.',
        application: 'Barcode scanning and traceability logging',
      },
      {
        title: 'Lighting Module Selectable per Material Characteristics',
        description: 'Pairs coaxial, ring, or other lighting approaches to the workpiece surface material (reflective, matte, transparent, etc.) to keep recognition stable.',
        application: 'Vision-guided assembly integrated with motion modules',
      },
      {
        title: 'Inspection Result Export',
        description: 'Inspection and recognition results can be exported for quality traceability and production-line records.',
        application: 'Quality traceability and production-line records',
      },
    ],
  },
  productDetailVisionX2WholeProduct: {
    eyebrow: 'System Context',
    title: 'Mounted Above the Fixture, Facing Real Production-Line Workpieces',
    imageAlt: 'VISION-X2 camera and lens mounted above a robotic arm, its ring light illuminating precision machined workpieces arranged in the fixture below',
    points: [
      'Supports workpiece positioning and angular offset calculation',
      'Performs surface defect inspection',
      'Lighting module selectable per material characteristics',
    ],
  },
  productDetailVisionX2OpticalLighting: {
    eyebrow: 'Optical & Lighting Logic',
    title: 'Lighting Selected per Material, Not a Single Fixed Approach',
    statement: 'Recognition stability depends on how the lighting is matched to the workpiece surface, not on camera specifications alone.',
    items: [
      {
        label: 'Coaxial Light',
        description: 'Used for reflective metal surfaces, reducing recognition interference caused by surface reflection.',
      },
      {
        label: 'Ring Light',
        description: 'Provides even illumination angle, suited to general surface inspection and positioning scenarios.',
      },
      {
        label: 'Selection Basis',
        description: 'The pairing is confirmed during project evaluation based on the workpiece material characteristics (reflective, matte, transparent, etc.).',
      },
    ],
  },
  productDetailVisionX2Integration: {
    eyebrow: 'System Integration',
    title: 'Communication and Integration',
    rows: [
      'VISION-X2 supports a standard industrial communication interface, and can be integrated into an existing automated assembly system or operate as a standalone inspection/positioning station.',
      'Recognition results can be exported for quality traceability and production-line records.',
    ],
  },
  productDetailVisionX2TechnicalSpecification: {
    eyebrow: 'Technical Specifications',
    title: 'Specifications',
    groups: [
      {
        label: 'IMAGING',
        rows: [
          { label: 'Camera Resolution', value: 'Application-dependent configuration' },
          { label: 'Recognition Types', value: 'Positioning / Defect / Barcode / Feature' },
        ],
      },
      {
        label: 'LIGHTING',
        rows: [
          { label: 'Lighting Type', value: 'Selected per material (coaxial, ring light, etc.)' },
        ],
      },
      {
        label: 'PROCESSING & INTEGRATION',
        rows: [
          { label: 'Processing Speed', value: 'Determined by processing configuration' },
          { label: 'Communication Interface', value: 'Standard industrial communication interface' },
          { label: 'Compute Architecture', value: 'On-device integrated image capture and recognition processing, deployable as a standalone inspection station or integrated into an automated system' },
          { label: 'Communication Integration', value: 'Supports industrial Ethernet communication integration; actual protocol confirmed per project requirements and system architecture' },
          { label: 'Trigger Method', value: 'Supports hardware trigger signals and software/PLC triggering' },
          { label: 'Installation Environment', value: 'Suited to fixed-machine/fixture integration; dust, oil mist, temperature/humidity, and other environmental protection needs evaluated per actual site conditions' },
        ],
      },
    ],
  },
};
