import { SupportedLanguage } from './conversions';

export interface UiTranslations {
  cookMode: string;
  noterStudio: string;
  library: string;
  whatToCook: string;
  tamilAi: string;
  focusMode: string;
  groceryList: string;
  newRecipe: string;
  servings: string;
  targetYield: string;
  totalTime: string;
  activeTime: string;
  passiveTime: string;
  prepPhase: string;
  restPhase: string;
  cookPhase: string;
  setupPhase: string;
  ingredients: string;
  criticalCore: string;
  optional: string;
  spiceLevel: string;
  sweetLevel: string;
  stoveSideActive: string;
  version: string;
  byAuthor: string;
  noTriesYet: string;
  logTry: string;
  communityDiscussion: string;
  postComment: string;
  ratioWarning: string;
  autoScale: string;
  confirmBreak: string;
  allStepsDone: string;
  resetProgress: string;
  startFocus: string;
  step: string;
  of: string;
}

export const uiTranslations: Record<SupportedLanguage, UiTranslations> = {
  en: {
    cookMode: 'Cook Mode',
    noterStudio: 'Noter Studio',
    library: 'Library',
    whatToCook: 'What to Cook',
    tamilAi: 'Tamil AI',
    focusMode: 'Focus Mode',
    groceryList: 'Grocery List',
    newRecipe: 'New Recipe',
    servings: 'Servings',
    targetYield: 'Target Yield',
    totalTime: 'Total Time',
    activeTime: 'Active Cooking',
    passiveTime: 'Rest / Soak',
    prepPhase: 'Preparation Phase',
    restPhase: 'Rest & Soaking Phase',
    cookPhase: 'Cooking Phase',
    setupPhase: 'Setup & Metadata',
    ingredients: 'Ingredients',
    criticalCore: 'Critical Core',
    optional: 'Optional',
    spiceLevel: 'Spice Tolerance',
    sweetLevel: 'Sweetness Level',
    stoveSideActive: 'Stove-side Active',
    version: 'Version',
    byAuthor: 'By',
    noTriesYet: 'No cooking attempts logged yet',
    logTry: 'Log a Try',
    communityDiscussion: 'Community Discussion & Tips',
    postComment: 'Post Comment',
    ratioWarning: 'Strict Ratio Mismatch',
    autoScale: 'Auto-Scale Group',
    confirmBreak: 'Confirm Break Ratio',
    allStepsDone: 'All Steps Completed',
    resetProgress: 'Reset Progress',
    startFocus: 'Start Cooking (Focus)',
    step: 'Step',
    of: 'of',
  },
  ta: {
    cookMode: 'சமையல் முறை',
    noterStudio: 'ரெசிபி ஸ்டுடியோ',
    library: 'ரெசிபி நூலகம்',
    whatToCook: 'என்ன சமைக்கலாம்',
    tamilAi: 'தமிழ் AI',
    focusMode: 'கவனம் செலுத்தும் முறை',
    groceryList: 'மளிகைப் பட்டியல்',
    newRecipe: 'புதிய ரெசிபி',
    servings: 'அளவுகள்',
    targetYield: 'தேவையான நபர்கள்',
    totalTime: 'மொத்த நேரம்',
    activeTime: 'நேரடி சமையல்',
    passiveTime: 'ஊறவைக்கும் நேரம்',
    prepPhase: 'தயாரிப்பு நிலை',
    restPhase: 'ஊறவைத்தல் / ஓய்வு நிலை',
    cookPhase: 'சமையல் நிலை',
    setupPhase: 'அமைப்பு மற்றும் விவரங்கள்',
    ingredients: 'பொருட்கள்',
    criticalCore: 'முக்கிய பொருள்',
    optional: 'விருப்பத்தேர்வு',
    spiceLevel: 'கார அளவு',
    sweetLevel: 'இனிப்பு அளவு',
    stoveSideActive: 'அடுப்பங்கரை தயார்',
    version: 'பதிப்பு',
    byAuthor: 'ஆக்கியவர்',
    noTriesYet: 'இதுவரை சமையல் முயற்சிகள் பதிவு செய்யப்படவில்லை',
    logTry: 'முயற்சியை பதிவு செய்',
    communityDiscussion: 'சமையல் குறிப்புகள் & கலந்துரையாடல்',
    postComment: 'கருத்தைப் பதிவு செய்',
    ratioWarning: 'அளவு விகித எச்சரிக்கை',
    autoScale: 'விகிதத்தை சமன் செய்',
    confirmBreak: 'இந்த அளவை உறுதி செய்',
    allStepsDone: 'அனைத்து நிலைகளும் முடிந்தது',
    resetProgress: 'மீண்டும் தொடங்கு',
    startFocus: 'சமையலைத் தொடங்கு',
    step: 'நிலை',
    of: '/',
  },
  hi: {
    cookMode: 'कुक मोड',
    noterStudio: 'रेसिपी स्टूडियो',
    library: 'रेसिपी लाइब्रेरी',
    whatToCook: 'क्या बनाएं',
    tamilAi: 'तमिल AI',
    focusMode: 'फोकस मोड',
    groceryList: 'किराना सूची',
    newRecipe: 'नई रेसिपी',
    servings: 'सर्विंग्स',
    targetYield: 'कुल मात्रा',
    totalTime: 'कुल समय',
    activeTime: 'पकाने का समय',
    passiveTime: 'भिगोने का समय',
    prepPhase: 'तैयारी का चरण',
    restPhase: 'भिगोने / विश्राम का चरण',
    cookPhase: 'पकाने का चरण',
    setupPhase: 'सेटअप और विवरण',
    ingredients: 'सामग्री',
    criticalCore: 'मुख्य सामग्री',
    optional: 'वैकल्पिक',
    spiceLevel: 'तीखापन स्तर',
    sweetLevel: 'मीठापन स्तर',
    stoveSideActive: 'रसोई में तैयार',
    version: 'संस्करण',
    byAuthor: 'द्वारा',
    noTriesYet: 'अभी तक कोई प्रयास दर्ज नहीं किया गया',
    logTry: 'प्रयास दर्ज करें',
    communityDiscussion: 'सामुदायिक चर्चा और सुझाव',
    postComment: 'टिप्पणी पोस्ट करें',
    ratioWarning: 'अनुपात असंतुलन चेतावनी',
    autoScale: 'अनुपात स्वतः संतुलित करें',
    confirmBreak: 'इस अनुपात की पुष्टि करें',
    allStepsDone: 'सभी चरण पूर्ण',
    resetProgress: 'रीसेट करें',
    startFocus: 'पकाना शुरू करें',
    step: 'चरण',
    of: 'का',
  },
};

export const getUiString = (key: keyof UiTranslations, lang: SupportedLanguage = 'en'): string => {
  return uiTranslations[lang]?.[key] || uiTranslations.en[key];
};
