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
    precisionHandling: {
      alt: 'Horizontal linear axis and Z-axis positioning a parallel gripper around the outside diameter of a cylindrical workpiece on a fixture',
      caption: 'Representative precision-handling view: the motion and load relationship between linear axes, a parallel gripper, workpiece and fixture.',
    },
    fieldCommissioning: {
      alt: 'Two engineers in hard hats and safety glasses commissioning an automation system, one at the control panel and wired pendant while the other inspects the machine',
      caption: 'Representative field-commissioning view: control-side setup and machine-side visual verification within a shared validation and handoff workflow.',
    },
  },
  hero: {
    eyebrow: 'Industrial Automation Integration',
    headline: 'Integrate equipment, controls and process needs\ninto an automation system built to run.',
    body: 'Starting with the part, cycle time and site constraints, FORGEON integrates mechanics,\ncontrols, sensing and station interfaces—so the solution can be evaluated before deployment\nand verified at handover.',
    ctaPrimary: 'Discuss an Automation Project',
    ctaSecondary: 'Review Integration Requirements',
    imageAlt: 'Automation production floor with large guarded machinery on the right and one operator working beside the equipment',
    imageDisclosure: 'Concept brand imagery',
    ledger: {
      input: { heading: 'Project Inputs', detail: 'Part drawings, target cycle time, site constraints' },
      evaluation: { heading: 'Evaluation Scope', detail: 'Positioning, inspection, assembly and station integration' },
      output: { heading: 'Project Outputs', detail: 'System architecture, module configuration, acceptance criteria' },
    },
    processRail: {
      step1: 'INPUT',
      step2: 'EVALUATE',
      step3: 'CONFIGURE',
      step4: 'VERIFY',
      railLabel: 'Process stages',
      stateLabels: { unconnected: 'Pending', aligned: 'Preparing', connected: 'In progress' },
    },
  },
};
