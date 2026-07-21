export const normalizeName = (name?: string): string => {
  if (!name) return "";
  const norm = name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(
      /\bjp\s*morgan\s*chase\b|\bjp\s*morgan\b|\bjpmc\b|\bj\.p\.\s*morgan\s*chase\b|\bj\.p\.\s*morgan\b/g,
      "jpmorganchase",
    )
    .replace(/\bibm\s*india\b|\bibm\b/g, "ibmindia")
    .replace(/\btexas\s*instruments?\b|\bti\b/g, "texasinstrument")
    .replace(/\bfast\s*retailing\s*\(japan\)|\bfast\s*retailing\b/g, "fastretailing")
    .replace(/\bgoogle\s*silicon\b/g, "googlesilicon")
    .replace(/\bde\s*shaw\s*&\s*co\b|\bde\s*shaw\b/g, "deshaw")
    .replace(/\bsamsung\s*bangalore\b|\bsamsung\s*delhi\b|\bsamsung\s*india\b|\bsamsung\b/g, "samsung")
    .replace(/\bbharat\s*petroleum\b/g, "bpcl")
    .replace(/\bnxp\s*semiconductors?\b/g, "nxpsemiconductor")
    .replace(/\bz\s*scal[ae]r\b/g, "zscaler")
    .replace(/\beil\s*psu\b|\beil\b/g, "eil")
    .replace(/\bhcl\s*tech\b|\bhcl\b/g, "hcl")
    .replace(/\bzs\s*associates?\b|\bzs\b/g, "zsassociate")
    .replace(/\bsiemens\s*eda\b|\bsiemens\b/g, "siemens")
    .replace(/\baccenture\s*interview\s*problems\s*all\b|\baccenture\b/g, "accenture")
    .replace(/[^a-z0-9]/g, "");
  return norm;
};

const companyLogos: Record<string, string> = {
  "Goldman Sachs": "Goldman Sachs Logo.png",
  LinkedIn: "LinkedIn.png",
  Adobe: "Adobe.png",
  "IBM India": "IBM.png",
  Atlassian: "Atlassian.png",
  Amazon: "Amazon.png",
  Cisco: "Cisco.png",
  "J.P. Morgan Chase": "JPMorganChase.png",
  Samsung: "Samsung.png",
  Expedia: "Expedia.png",
  Uber: "Uber.png",
  Google: "Google.png",
  Sprinklr: "Sprinklr.png",
  Autodesk: "Autodesk.png",
  Myntra: "Myntra.png",
  "Wells Fargo": "WellsFargo.png",
  MasterCard: "Mastercard.png",
  Optum: "Optum.png",
  "Texas Instrument": "TexasInstruments.png",
  NatWest: "Natwest.png",
  "Fast Retailing": "FastRetailing.png",
  MyKaarma: "MyKaarma.png",
  "AB InBev GCC": "ABInBev.png",
  Accenture: "Accenture.png",
  Accolite: "Accolite.png",
  "Adani Group": "AdaniGroup.png",
  Airtel: "Airtel.png",
  "Airtel Payment Bank": "AirtelPaymentBank.png",
  "Alvarez And Marsal": "AlvarezAndMarsal.png",
  Amdocs: "Amdocs.png",
  "Anand Group": "AnandGroup.png",
  Apple: "Apple.png",
  ARM: "ARM.png",
  ArmorCode: "ArmorCode.png",
  "Avant Garde": "AvantGarde.png",
  "Axis Bank": "AxisBank.png",
  "Bain & Company": "Bain&Company.png",
  "Bajaj Auto": "BajajAuto.png",
  BCG: "BCG.png",
  Bechtel: "Bechtel.png",
  Bharatpe: "BharatPe.png",
  BlackRock: "Blackrock.png",
  "BNP Paribas": "BNPParibas.png",
  BPCL: "BPCL.png",
  "Capital Power": "CapitalPower.png",
  ClearTax: "ClearTax.png",
  CoinSwitch: "CoinSwitch.png",
  Cvent: "Cvent.png",
  "DE Shaw": "D.EShaw&Co.png",
  "Deutsche Telekom": "DeutscheTelekom.png",
  DLF: "DLF.png",
  "DP World": "DPWorld.png",
  "DSP Mutual Fund": "DSPMutualFund.png",
  Dunnhumby: "DunnHumby.png",
  "Ebiz Solution": "EbizSolutions.png",
  "Eightfold AI": "EightFoldAI.png",
  EIL: "EIL.png",
  "Energy Infratech": "EnergyInfrastructure.png",
  Engineersmind: "EngineersMind.png",
  EY: "EY.png",
  Flipkart: "Flipkart.png",
  "Floor Daniel": "Fluor.png",
  "Future First": "FutureFirst.png",
  "GAIL PSU": "GailPSU.png",
  Gameskraft: "Gameskraft.png",
  "Ge Vernova": "GeVernova.png",
  GoDaddy: "GoDaddy.png",
  "GoodSpace AI": "GoodSpaceAI.png",
  "Google Silicon": "Google.png",
  "HCL Tech": "HCL.png",
  HeadLamp: "HeadLamp.png",
  Hike: "Hike.png",
  "Hindustan Power": "HindustanPower.png",
  Honda: "Honda.png",
  "HSBC Bank": "HSBC.png",
  IDEMITSU: "Idemitsu.png",
  Infoedge: "InfoEdge.png",
  Intuit: "Intuit.png",
  Kapstan: "Kapstan.png",
  Keysight: "Keysight.png",
  Kimbal: "Kimbal.png",
  KPMG: "KPMG.png",
  "Larsen And Toubro": "LarsenAndToubro.png",
  Macquarie: "Macquarie.png",
  magicpin: "MagicPin.png",
  MakeMyTrip: "MakeMyTrip.png",
  Mamaearth: "MamaEarth.png",
  MAQ: "MAQ.png",
  "Maruti Suzuki": "MarutiSuzuki.png",
  Mckinsey: "McKinsey&Company.png",
  "Media.net": "MediaNet.png",
  Meesho: "Meesho.png",
  Microsoft: "Microsoft.png",
  "Morgan Stanley": "MorganStanley.png",
  Motive: "Motive.png",
  NAB: "NAB.png",
  "Naik AI": "NaikAI.png",
  "NK Securities HFT": "NKSecurities.png",
  NMTRONICS: "NMTronics.png",
  Nvidia: "Nvidia.png",
  "NXP Semiconductors": "NXPSemiconductors.png",
  Nykaa: "Nykaa.png",
  Oracle: "Oracle.png",
  Oyo: "Oyo.png",
  "Paisa Bazar": "PaisaBazaar.png",
  PayPal: "PayPal.png",
  PharmEasy: "PharmEasy.png",
  PhonePe: "PhonePe.png",
  "Policy Bazar": "PolicyBazaar.png",
  Razorpay: "RazorPay.png",
  "Reliance Ltd": "Reliance.png",
  Rockman: "Rockman.png",
  Salesforce: "Salesforce.png",
  Samsara: "Samsara.png",
  Sedemac: "Sedemac.png",
  Shipsy: "Shipsy.png",
  "Siemens EDA": "Siemens.png",
  SiTime: "SiTime.png",
  Sunsire: "Sunrise.png",
  "Super AGI": "SuperAGI.png",
  Synopsys: "Synopsys.png",
  Syrma: "Syrma.png",
  TCIL: "TCIL.png",
  TCS: "TCS.png",
  "Tejas Network": "TejasNetwork.png",
  Thorogood: "Thorogood.png",
  "Times Internet": "TimesInternet.png",
  "Tower Research": "TowerResearch.png",
  Twilio: "Twilio.png",
  UKG: "UKG.png",
  UnivLabs: "UnivLabs.png",
  "Urban Company": "UrbanCompany.png",
  "Vecmocon Tech": "Vecmocon.png",
  Visa: "Visa.png",
  Voltas: "Voltas.png",
  Vyapar: "Vyapar.png",
  Wayfair: "Wayfair.png",
  WinZO: "Winzo.png",
  Wipro: "Wipro.png",
  WorkIndia: "WorkIndia.png",
  Zinnia: "Zinnia.png",
  Zomato: "Zomato.png",
  "Zs Associate": "Zs.png",
  Zscaler: "Zscaler.png",
  Zupee: "Zupee.png",
};

export const getCompanyLogoUrl = (name?: string, dbLogoUrl?: string | null): string | null => {
  if (dbLogoUrl) return dbLogoUrl;
  if (!name) return null;
  const normLookup = normalizeName(name);
  const matchingKey = Object.keys(companyLogos).find(
    (k) => normalizeName(k) === normLookup,
  );
  const filename = matchingKey ? companyLogos[matchingKey] : null;
  if (filename) {
    const normalizedFilename = filename.replace(/[\s&]+/g, "_");
    return `https://res.cloudinary.com/dufgdskxu/image/upload/${encodeURIComponent(normalizedFilename)}`;
  }
  return null;
};
