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
    fileUpload: 'Attachment (optional)',
    fileUploadHint: 'Drawings, spec sheets, or line photos accepted. 10MB max per file.',
    privacyConsent:
      'I have read and agree to the privacy policy and consent to being contacted by FORGEON AUTOMATION regarding this inquiry.',
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
      'Demo mode: this form is not connected to a live submission endpoint. Nothing you enter is sent or stored. See README for production API setup.',
    demoModeSubmitTitle: 'Demo mode validated your submission',
    demoModeSubmitBody:
      'Form validation passed, but because this is a demo environment, no data was actually sent. This is expected behavior for a portfolio showcase site.',
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
};
