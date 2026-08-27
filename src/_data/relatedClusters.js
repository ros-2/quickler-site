// Topical clusters for internal linking. Each cluster is a family of related
// workflow pages; the story layout auto-injects a "Related workflows" cards
// block linking a page to a few siblings in its cluster. This spreads internal
// link equity (PageRank) and tells Google which pages form a topic group -- the
// single biggest on-page lever for a young site whose pages were previously
// islands with zero cross-links.
//
// Keyed by page fileSlug (filename without .njk). A page only gets a block if
// its slug appears in exactly one cluster here. Titles are the human label
// shown on the card; kept short. Add a page to a cluster to wire it in.

const clusters = {
  electrical: {
    label: "Electrical compliance",
    pages: [
      ["eicr-software-uk", "EICR software"],
      ["eicr-checklist-uk", "EICR checklist"],
      ["eicr-codes-explained-uk", "EICR codes explained"],
      ["eicr-rental-property-uk", "EICR for rentals"],
      ["eicr-from-whatsapp", "EICR from WhatsApp"],
      ["epc-assessor-report-app-uk", "EPC assessor app"],
      ["ev-charger-installation-report-uk", "EV charger reports"],
      ["solar-pv-commissioning-report-uk", "Solar PV commissioning"],
      ["battery-storage-inspection-report-uk", "Battery storage reports"],
    ],
  },
  gas: {
    label: "Gas safety",
    pages: [
      ["cp12-gas-safety-software-uk", "CP12 software"],
      ["cp12-report-template-uk", "CP12 template"],
      ["cp12-gas-safety-whatsapp", "CP12 from WhatsApp"],
      ["gas-engineer-field-reporting", "Gas engineer reporting"],
      ["heat-pump-commissioning-checklist-uk", "Heat pump commissioning"],
      ["hvac-commissioning-form-template-uk", "HVAC commissioning form"],
    ],
  },
  fleet: {
    label: "Fleet and vehicle checks",
    pages: [
      ["van-check-app-uk", "Van check app"],
      ["van-defect-report-uk", "Van defect report"],
      ["van-safety-check-template", "Van safety template"],
      ["van-safety-checks", "Van safety checks"],
      ["dvsa-walkaround-check-free-template-uk", "DVSA walkaround check"],
      ["fleet-vehicle-inspection-checklist-uk", "Fleet inspection checklist"],
    ],
  },
  care: {
    label: "Care and CQC",
    pages: [
      ["care-home-audit-software-uk", "Care home audit software"],
      ["care-home-compliance-checklist-monthly-uk", "Monthly compliance checklist"],
      ["cqc-compliance-audit-checklist-uk", "CQC audit checklist"],
      ["care-inspectorate-self-evaluation-scotland", "Care Inspectorate self-evaluation"],
      ["care-home-health-safety-audit-uk", "Care home H&S audit"],
      ["safeguarding-audit-care-home-uk", "Safeguarding audit"],
      ["accident-incident-riddor-care-home-uk", "RIDDOR in care"],
      ["care-plan-audit-review-uk", "Care plan audit"],
      ["staff-training-supervision-matrix-care-uk", "Training & supervision matrix"],
      ["ipc-audit-care-home-uk", "IPC audit"],
      ["medication-storage-audit-care-uk", "Medication storage audit"],
      ["care-home-kitchen-food-hygiene-audit-uk", "Kitchen food hygiene audit"],
      ["domiciliary-care-audit-app-uk", "Domiciliary care audit"],
    ],
  },
  construction: {
    label: "Construction and site safety",
    pages: [
      ["construction-site-inspection-report-uk", "Site inspection report"],
      ["construction-daily-report-app-uk", "Daily site report"],
      ["construction-software-small-firms-uk", "Construction software"],
      ["site-safety-inspection-uk", "Site safety inspection"],
      ["near-miss-reporting-construction-uk", "Near-miss reporting"],
      ["h-and-s-site-walkround-checklist-uk", "H&S site walkround"],
      ["how-to-write-site-inspection-report-uk", "Writing a site report"],
      ["snagging-inspection-report-app-uk", "Snagging reports"],
    ],
  },
  survey: {
    label: "Surveying and property",
    pages: [
      ["building-survey-report-app-uk", "Building survey app"],
      ["structural-engineer-report-software-uk", "Structural report software"],
      ["structural-site-report-template", "Structural report template"],
      ["surveyor-site-report-software-uk", "Surveyor report software"],
      ["party-wall-survey-app-uk", "Party wall survey"],
      ["dilapidations-schedule-of-condition-uk", "Dilapidations"],
      ["property-maintenance-inspection-report-uk", "Property maintenance"],
      ["flood-risk-survey-app-uk", "Flood risk survey"],
    ],
  },
  insurance: {
    label: "Insurance surveys",
    pages: [
      ["insurance-risk-survey-report-uk", "Insurance risk survey"],
      ["insurance-survey-software-uk", "Insurance survey software"],
      ["fire-risk-assessment-insurance-uk", "Fire risk assessment"],
      ["plant-machinery-insurance-inspection-uk", "Plant machinery insurance"],
      ["property-risk-assessment-insurance-uk", "Property risk assessment"],
      ["loss-adjuster-site-report-app-uk", "Loss adjuster reports"],
    ],
  },
  retail: {
    label: "Retail and hospitality",
    pages: [
      ["retail-store-audit-app-uk", "Retail store audit"],
      ["retail-health-safety-inspection-uk", "Retail H&S inspection"],
      ["retail-fire-safety-check-uk", "Retail fire safety"],
      ["merchandising-compliance-audit-uk", "Merchandising audit"],
      ["opening-closing-checklist-app-uk", "Opening/closing checklist"],
      ["hotel-room-inspection-app-uk", "Hotel room inspection"],
      ["pub-cellar-safety-checklist-uk", "Pub cellar safety"],
    ],
  },
  food: {
    label: "Food safety",
    pages: [
      ["food-safety-audit-app-uk", "Food safety audit"],
      ["food-retail-hygiene-audit-uk", "Food retail hygiene"],
      ["due-diligence-food-hygiene-uk", "Food hygiene due diligence"],
      ["haccp-checklist-app-uk", "HACCP checklist"],
      ["kitchen-temperature-log-app-uk", "Kitchen temperature log"],
    ],
  },
  plant: {
    label: "Plant and machinery",
    pages: [
      ["forklift-inspection-checklist-uk", "Forklift inspection"],
      ["machine-safety-inspection-checklist-uk", "Machine safety"],
      ["conveyor-inspection-checklist-uk", "Conveyor inspection"],
      ["loto-lockout-tagout-audit-uk", "Lockout/tagout audit"],
      ["rigging-inspection-report-uk", "Rigging inspection"],
      ["permit-to-work-system-app-uk", "Permit to work"],
      ["confined-space-entry-log-app-uk", "Confined space log"],
    ],
  },
  quarry: {
    label: "Quarry and extractives",
    pages: [
      ["quarry-inspection-software-uk", "Quarry inspection"],
      ["quarry-plant-inspection-checklist-uk", "Quarry plant checklist"],
      ["mines-quarries-safety-audit-uk", "Mines and quarries audit"],
      ["tip-tailings-inspection-report-uk", "Tip and tailings"],
      ["dust-monitoring-record-app-uk", "Dust monitoring"],
    ],
  },
  school: {
    label: "Schools and premises",
    pages: [
      ["school-premises-inspection-software-uk", "School premises inspection"],
      ["school-health-safety-audit-uk", "School H&S audit"],
      ["school-fire-safety-record-uk", "School fire safety"],
      ["asbestos-management-check-schools-uk", "School asbestos check"],
      ["legionella-water-check-schools-uk", "School legionella check"],
      ["playground-equipment-inspection-uk", "Playground inspection"],
    ],
  },
  telecoms: {
    label: "Telecoms and data",
    pages: [
      ["telecoms-inspection-software-uk", "Telecoms inspection"],
      ["antenna-rf-safety-audit-uk", "Antenna RF safety"],
      ["mast-tower-inspection-checklist-uk", "Mast and tower inspection"],
      ["structured-cabling-test-report-uk", "Structured cabling test"],
      ["fibre-installation-sign-off-app-uk", "Fibre installation sign-off"],
      ["comms-room-inspection-checklist-uk", "Comms room inspection"],
      ["data-centre-audit-software-uk", "Data centre audit"],
      ["cctv-access-control-inspection-uk", "CCTV and access control"],
      ["iso-27001-physical-security-audit-uk", "ISO 27001 physical security"],
      ["it-asset-audit-app-uk", "IT asset audit"],
    ],
  },
  environment: {
    label: "Environment and quality",
    pages: [
      ["environmental-inspection-software-uk", "Environmental inspection"],
      ["environmental-permit-compliance-audit-uk", "Environmental permit audit"],
      ["iso-14001-audit-checklist-uk", "ISO 14001 audit"],
      ["carbon-energy-audit-app-uk", "Carbon and energy audit"],
      ["waste-duty-of-care-audit-uk", "Waste duty of care"],
      ["spill-response-inspection-report-uk", "Spill response"],
      ["capa-corrective-action-tracking-uk", "CAPA tracking"],
      ["layered-process-audit-app-uk", "Layered process audit"],
      ["factory-audit-software-uk", "Factory audit"],
      ["5s-workplace-audit-app-uk", "5S workplace audit"],
    ],
  },
  farm: {
    label: "Farm and rural",
    pages: [
      ["farm-risk-assessment-app-uk", "Farm risk assessment"],
      ["farm-safety-inspection-app-uk", "Farm safety inspection"],
      ["farm-machinery-inspection-checklist-uk", "Farm machinery check"],
      ["livestock-transport-check-uk", "Livestock transport"],
      ["slurry-store-inspection-uk", "Slurry store inspection"],
      ["red-tractor-assurance-records-uk", "Red Tractor records"],
    ],
  },
  fire: {
    label: "Fire safety",
    pages: [
      ["fire-door-inspection-checklist-uk", "Fire door inspection"],
      ["retail-fire-safety-check-uk", "Retail fire safety"],
      ["school-fire-safety-record-uk", "School fire safety"],
    ],
  },
  alternatives: {
    label: "Compare and switch",
    pages: [
      ["iauditor-alternative-uk", "iAuditor alternative"],
      ["safetyculture-alternative-uk", "SafetyCulture alternative"],
      ["goaudits-alternative-uk", "GoAudits alternative"],
      ["lumiform-alternative-uk", "Lumiform alternative"],
      ["fleetcheck-alternative-uk", "FleetCheck alternative"],
      ["simpro-alternative-uk", "SimPro alternative"],
      ["joblogic-alternative-uk", "Joblogic alternative"],
      ["fergus-alternative-uk", "Fergus alternative"],
      ["fieldwire-alternative-uk", "Fieldwire alternative"],
      ["iauditor-cost-uk", "iAuditor cost"],
      ["how-to-replace-iauditor-uk", "Replace iAuditor"],
      ["no-subscription-compliance", "Only pay for active users"],
    ],
  },
  general: {
    label: "Field compliance",
    pages: [
      ["inspection-software-uk-sme", "Inspection software for SMEs"],
      ["field-reporting-software-uk", "Field reporting software"],
      ["compliance-audit-software-uk", "Compliance audit software"],
      ["compliance-software-uk-trades", "Compliance software for trades"],
      ["inspection-report-template-uk", "Inspection report template"],
      ["inspection-checklist-software-any-trade", "Checklist software"],
      ["risk-assessment-software-uk-sme", "Risk assessment software"],
      ["lone-worker-check-in-software-uk", "Lone worker check-in"],
      ["contractor-compliance-audit-uk", "Contractor compliance"],
      ["internal-audit-checklist-app-uk", "Internal audit checklist"],
      ["facilities-management-inspection-software-uk", "Facilities management"],
      ["paperless-inspections-uk-trades", "Paperless inspections"],
      ["voice-notes-site-reports-uk", "Voice-note reporting"],
      ["uk-compliance-inspection-frequency-guide", "Inspection frequency guide"],
    ],
  },
};

// Invert to a slug -> {clusterLabel, related:[{href,title}]} lookup, capping
// related links at 5 per page (enough for equity flow, not a link farm).
module.exports = function () {
  const bySlug = {};
  for (const key of Object.keys(clusters)) {
    const { label, pages } = clusters[key];
    for (const [slug] of pages) {
      const related = pages
        .filter(([s]) => s !== slug)
        .slice(0, 5)
        .map(([s, title]) => ({ href: `/pages/${s}.html`, title }));
      if (related.length) bySlug[slug] = { label, related };
    }
  }
  return bySlug;
};
