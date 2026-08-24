import { Recipe } from './types';
import { mockAdaiRecipe } from './mockRecipe';

export const mockPaneerButterMasalaRecipe: Recipe = {
  id: 'recipe_pbm_002',
  name: 'Paneer Butter Masala',
  baseYield: 4,
  mealSlots: ['lunch', 'dinner'],
  dietary: ['vegetarian', 'gluten_free', 'high_protein'],
  difficulty: 'medium',
  versionHistory: [
    {
      versionName: 'Restaurant Style Royal Gravy',
      author: 'Chef Ranveer',
      timestamp: '2023-05-10T00:00:00Z',
    },
  ],
  masterIngredients: [
    { id: 'ing_paneer', defaultName: 'Fresh Malai Paneer', translations: [{ language: 'Tamil', name: 'பனீர்' }, { language: 'Hindi', name: 'पनीर' }] },
    { id: 'ing_butter', defaultName: 'Salted Butter', translations: [{ language: 'Tamil', name: 'வெண்ணெய்' }, { language: 'Hindi', name: 'मक्खन' }] },
    { id: 'ing_cream', defaultName: 'Fresh Cream', translations: [{ language: 'Tamil', name: 'பிரெஷ் கிரீம்' }, { language: 'Hindi', name: 'ताजी मलाई' }] },
    { id: 'ing_tomatoes', defaultName: 'Ripe Red Tomatoes', translations: [{ language: 'Tamil', name: 'தக்காளி' }, { language: 'Hindi', name: 'टमाटर' }] },
    { id: 'ing_onions', defaultName: 'Red Onions', translations: [{ language: 'Tamil', name: 'வெங்காயம்' }, { language: 'Hindi', name: 'प्याज' }] },
    { id: 'ing_cashews', defaultName: 'Cashew Nuts', translations: [{ language: 'Tamil', name: 'முந்திரி' }, { language: 'Hindi', name: 'काजू' }] },
    { id: 'ing_ginger_garlic_paste', defaultName: 'Ginger Garlic Paste', translations: [{ language: 'Tamil', name: 'இஞ்சி பூண்டு விழுது' }, { language: 'Hindi', name: 'अदरक लहसुन पेस्ट' }] },
    { id: 'ing_kashmiri_chilli_powder', defaultName: 'Kashmiri Red Chilli Powder', translations: [{ language: 'Tamil', name: 'காஷ்மீரி மிளகாய்த்தூள்' }, { language: 'Hindi', name: 'कश्मीरी लाल मिर्च पाउडर' }] },
    { id: 'ing_garam_masala', defaultName: 'Garam Masala', translations: [{ language: 'Tamil', name: 'கரம் மசாலா' }, { language: 'Hindi', name: 'गरम मसाला' }] },
    { id: 'ing_kasuri_methi', defaultName: 'Kasuri Methi (Dried Fenugreek)', translations: [{ language: 'Tamil', name: 'கசூரி மேத்தி' }, { language: 'Hindi', name: 'कसूरी मेथी' }] },
    { id: 'ing_sugar', defaultName: 'Sugar', translations: [{ language: 'Tamil', name: 'சர்க்கரை' }, { language: 'Hindi', name: 'चीनी' }] },
    { id: 'ing_salt', defaultName: 'Salt', translations: [{ language: 'Tamil', name: 'உப்பு' }, { language: 'Hindi', name: 'नमक' }] },
  ],
  requiredEquipment: [
    'Heavy Bottom Pan / Kadai',
    'High-Speed Blender',
    'Fine Mesh Strainer',
    'Spatula',
  ],
  pairings: ['Butter Naan', 'Jeera Rice', 'Tandoori Roti'],
  ratioGroups: [
    {
      id: 'ratio_tomato_onion',
      name: 'Makhani Base Ratio (2:1 Tomato to Onion)',
      members: [
        { ingredientId: 'ing_tomatoes', parts: 2 },
        { ingredientId: 'ing_onions', parts: 1 },
      ],
      isStrict: true,
    },
  ],
  prepBlocks: [
    {
      name: 'Makhani Puree Prep',
      totalDurationInMinutes: 15,
      ingredients: [
        { ingredientId: 'ing_tomatoes', quantity: 400, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_onions', quantity: 200, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_cashews', quantity: 30, unit: 'g', isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: 'Roughly chop tomatoes and onions.',
          duration: { value: 5, isYieldDependent: true },
          isCritical: false,
        },
        {
          text: 'Boil tomatoes, onions, and cashews in 200ml water for 10 minutes until mushy and soft.',
          duration: { value: 10, isYieldDependent: false },
          heat: { intensity: 'Medium' },
          isCritical: true,
        },
      ],
    },
    {
      name: 'Paneer Prep',
      totalDurationInMinutes: 5,
      ingredients: [
        { ingredientId: 'ing_paneer', quantity: 250, unit: 'g', isOptional: false, isCritical: true, tags: [] },
      ],
      steps: [
        {
          text: 'Cut paneer into 1-inch uniform cubes. Soak in warm salted water to keep ultra soft.',
          duration: { value: 5, isYieldDependent: true },
          isCritical: false,
        },
      ],
    },
  ],
  passiveBlocks: [
    {
      name: 'Puree Cooling & Straining',
      totalDurationInMinutes: 10,
      ingredients: [],
      steps: [
        {
          text: 'Allow boiled tomato-onion mixture to cool completely before blending into silk-smooth puree. Strain through mesh for velvet texture.',
          duration: { value: 10, isYieldDependent: false },
          isCritical: true,
        },
      ],
    },
  ],
  cookBlocks: [
    {
      name: 'Gravy Velvet Simmer',
      totalDurationInMinutes: 15,
      ingredients: [
        { ingredientId: 'ing_butter', quantity: 40, unit: 'g', isOptional: false, isCritical: true, tags: [] },
        { ingredientId: 'ing_ginger_garlic_paste', quantity: 15, unit: 'g', isOptional: false, tags: ['spice'] },
        { ingredientId: 'ing_kashmiri_chilli_powder', quantity: 8, unit: 'g', isOptional: false, tags: ['spice'] },
        { ingredientId: 'ing_garam_masala', quantity: 4, unit: 'g', isOptional: false, tags: ['spice'] },
        { ingredientId: 'ing_kasuri_methi', quantity: 3, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_sugar', quantity: 5, unit: 'g', isOptional: true, tags: ['sweet'] },
        { ingredientId: 'ing_cream', quantity: 30, unit: 'ml', isOptional: true, tags: ['sweet'] },
        { ingredientId: 'ing_salt', quantity: 6, unit: 'g', isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: 'Melt half the butter in a pan over medium heat. Sauté ginger-garlic paste and Kashmiri chilli powder for 60 seconds.',
          duration: { value: 2, isYieldDependent: false },
          heat: { intensity: 'Medium' },
          isCritical: true,
        },
        {
          text: 'Pour in strained makhani gravy. Simmer covered for 8 minutes until butter surfaces on top.',
          duration: { value: 8, isYieldDependent: false },
          heat: { intensity: 'Low' },
          isCritical: true,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
              caption: 'Velvety orange-red makhani gravy simmering with butter droplets on top',
              stage: 'while_cooking',
            },
          ],
        },
        {
          text: 'Add drained paneer cubes, crushed kasuri methi, sugar, salt, garam masala, and fresh cream. Cook for 3 final minutes.',
          duration: { value: 5, isYieldDependent: true },
          heat: { intensity: 'Low' },
          isCritical: false,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
              caption: 'Luxurious creamy restaurant finish garnished with fresh cream swirl',
              stage: 'after_step',
            },
          ],
        },
      ],
    },
  ],
};

export const mockFilterCoffeeRecipe: Recipe = {
  id: 'recipe_coffee_003',
  name: 'Madras Filter Coffee',
  baseYield: 2,
  versionHistory: [
    {
      versionName: 'Mylapore Degree Coffee',
      author: 'Kumbakonam Master',
      timestamp: '2023-08-01T00:00:00Z',
    },
  ],
  masterIngredients: [
    { id: 'ing_coffee_powder', defaultName: 'Plantation A Coffee Powder', translations: [{ language: 'Tamil', name: 'காபி தூள்' }, { language: 'Hindi', name: 'कॉफी पाउडर' }] },
    { id: 'ing_chicory', defaultName: 'Chicory Powder', translations: [{ language: 'Tamil', name: 'சிக்கரி' }, { language: 'Hindi', name: 'चिकोरी' }] },
    { id: 'ing_milk', defaultName: 'Full Fat Fresh Milk', translations: [{ language: 'Tamil', name: 'பசும்பால்' }, { language: 'Hindi', name: 'ताजा दूध' }] },
    { id: 'ing_water', defaultName: 'Purified Water', translations: [{ language: 'Tamil', name: 'தண்ணீர்' }, { language: 'Hindi', name: 'पानी' }] },
    { id: 'ing_sugar', defaultName: 'Raw Cane Sugar / Sugar', translations: [{ language: 'Tamil', name: 'நாட்டுச் சர்க்கரை' }, { language: 'Hindi', name: 'चीनी' }] },
  ],
  requiredEquipment: [
    'Traditional Brass / Stainless Steel Coffee Filter',
    'Brass Davarah and Tumbler',
    'Milk Boiling Saucepan',
  ],
  mealSlots: ['breakfast', 'snack', 'late_night', 'anytime'],
  dietary: ['vegetarian', 'gluten_free'],
  difficulty: 'easy',
  pairings: ['Medhu Vada', 'Mysore Pak', 'Butter Biscuit'],
  ratioGroups: [
    {
      id: 'ratio_coffee_chicory',
      name: 'Degree Coffee Blend (80% Coffee : 20% Chicory)',
      members: [
        { ingredientId: 'ing_coffee_powder', parts: 4 },
        { ingredientId: 'ing_chicory', parts: 1 },
      ],
      isStrict: true,
    },
    {
      id: 'ratio_decoction_milk',
      name: 'Beverage Ratio (1 Part Decoction : 2 Parts Milk)',
      members: [
        { ingredientId: 'ing_water', parts: 1 },
        { ingredientId: 'ing_milk', parts: 2 },
      ],
      isStrict: false,
    },
  ],
  prepBlocks: [
    {
      name: 'Filter Assembly & Powder Bedding',
      totalDurationInMinutes: 3,
      ingredients: [
        { ingredientId: 'ing_coffee_powder', quantity: 20, unit: 'g', isOptional: false, isCritical: true, tags: [] },
        { ingredientId: 'ing_chicory', quantity: 5, unit: 'g', isOptional: false, isCritical: false, tags: [] },
      ],
      steps: [
        {
          text: 'Add coffee powder and chicory into the upper chamber of the filter. Tamp lightly with the pressing disc without compressing too tightly.',
          duration: { value: 3, isYieldDependent: true },
          isCritical: true,
        },
      ],
    },
  ],
  passiveBlocks: [
    {
      name: 'First Decoction Extraction',
      totalDurationInMinutes: 15,
      ingredients: [
        { ingredientId: 'ing_water', quantity: 80, unit: 'ml', isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: 'Bring water to rolling boil. Pour directly over the pressing disc. Close lid and let thick first decoction drip down.',
          duration: { value: 15, isYieldDependent: false },
          heat: { intensity: 'High', precisionTemp: 100 },
          isCritical: true,
        },
      ],
    },
  ],
  cookBlocks: [
    {
      name: 'Milk Frothing & Davarah Metering',
      totalDurationInMinutes: 4,
      ingredients: [
        { ingredientId: 'ing_milk', quantity: 160, unit: 'ml', isOptional: false, isCritical: true, tags: [] },
        { ingredientId: 'ing_sugar', quantity: 10, unit: 'g', isOptional: true, tags: ['sweet'] },
      ],
      steps: [
        {
          text: 'Boil full cream milk until frothy and hot. Do not dilute milk with water.',
          duration: { value: 3, isYieldDependent: false },
          heat: { intensity: 'Medium' },
          isCritical: true,
        },
        {
          text: 'Pour 30ml thick decoction, hot milk, and sugar into davarah tumbler. Pull coffee back and forth from a height to form creamy golden froth.',
          duration: { value: 1, isYieldDependent: true },
          isCritical: false,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
              caption: 'Aerated golden froth crowning traditional brass davarah tumbler',
              stage: 'after_step',
            },
          ],
        },
      ],
    },
  ],
};

export const mockRavaUpmaRecipe: Recipe = {
  id: 'recipe_upma_003',
  name: 'Quick Rava Upma',
  baseYield: 2,
  mealSlots: ['breakfast', 'snack', 'dinner', 'late_night', 'anytime'],
  dietary: ['vegetarian', 'vegan'],
  difficulty: 'easy',
  versionHistory: [
    {
      versionName: '15-Minute Easy Morning Tiffin',
      author: 'Chef',
      timestamp: '2023-08-01T00:00:00Z',
    },
  ],
  masterIngredients: [
    { id: 'ing_rava', defaultName: 'Semolina / Roasted Rava', translations: [{ language: 'Tamil', name: 'ரவை' }, { language: 'Hindi', name: 'सूजी / रवा' }] },
    { id: 'ing_water', defaultName: 'Water', translations: [{ language: 'Tamil', name: 'தண்ணீர்' }, { language: 'Hindi', name: 'पानी' }] },
    { id: 'ing_onions', defaultName: 'Onions', translations: [{ language: 'Tamil', name: 'வெங்காயம்' }, { language: 'Hindi', name: 'प्याज' }] },
    { id: 'ing_green_chilli', defaultName: 'Green Chilli', translations: [{ language: 'Tamil', name: 'பச்சை மிளகாய்' }, { language: 'Hindi', name: 'हरी मिर्च' }] },
    { id: 'ing_ginger', defaultName: 'Ginger', translations: [{ language: 'Tamil', name: 'இஞ்சி' }, { language: 'Hindi', name: 'अदरक' }] },
    { id: 'ing_mustard_seeds', defaultName: 'Mustard Seeds', translations: [{ language: 'Tamil', name: 'கடுகு' }, { language: 'Hindi', name: 'राई / सरसों' }] },
    { id: 'ing_curry_leaves', defaultName: 'Curry Leaves', translations: [{ language: 'Tamil', name: 'கருவேப்பிலை' }, { language: 'Hindi', name: 'कढ़ी पत्ता' }] },
    { id: 'ing_ghee', defaultName: 'Pure Desi Ghee', translations: [{ language: 'Tamil', name: 'நெய்' }, { language: 'Hindi', name: 'शुद्ध घी' }] },
    { id: 'ing_salt', defaultName: 'Salt', translations: [{ language: 'Tamil', name: 'உப்பு' }, { language: 'Hindi', name: 'नमक' }] },
  ],
  requiredEquipment: ['Kadai / Heavy Pan', 'Spatula', 'Measuring Cup'],
  pairings: ['Coconut Chutney', 'Sugar', 'Filter Coffee'],
  ratioGroups: [
    {
      id: 'ratio_rava_water',
      name: 'Upma Consistency Ratio (1 Part Rava : 2.5 Parts Water)',
      members: [
        { ingredientId: 'ing_rava', parts: 1 },
        { ingredientId: 'ing_water', parts: 2.5 },
      ],
      isStrict: true,
    },
  ],
  prepBlocks: [
    {
      name: 'Aromatic Tadka & Chopping',
      totalDurationInMinutes: 5,
      ingredients: [
        { ingredientId: 'ing_onions', quantity: 60, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_green_chilli', quantity: 2, unit: 'count', isOptional: false, tags: ['spice'] },
        { ingredientId: 'ing_ginger', quantity: 10, unit: 'g', isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: 'Finely dice onions, slit green chillies, and mince fresh ginger.',
          duration: { value: 5, isYieldDependent: true },
          isCritical: false,
        },
      ],
    },
  ],
  passiveBlocks: [],
  cookBlocks: [
    {
      name: 'Tempering & Boiling',
      totalDurationInMinutes: 10,
      ingredients: [
        { ingredientId: 'ing_ghee', quantity: 20, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_mustard_seeds', quantity: 5, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_curry_leaves', quantity: 5, unit: 'count', isOptional: false, tags: [] },
        { ingredientId: 'ing_water', quantity: 400, unit: 'ml', isOptional: false, tags: [] },
        { ingredientId: 'ing_salt', quantity: 6, unit: 'g', isOptional: false, tags: [] },
        { ingredientId: 'ing_rava', quantity: 160, unit: 'g', isOptional: false, isCritical: true, tags: [] },
      ],
      steps: [
        {
          text: 'Heat ghee in a kadai. Splutter mustard seeds, curry leaves, and sauté onions with green chilli & ginger until translucent.',
          duration: { value: 3, isYieldDependent: false },
          heat: { intensity: 'Medium' },
          isCritical: false,
        },
        {
          text: 'Pour 400ml water and add salt. Bring to a rolling bubbling boil.',
          duration: { value: 3, isYieldDependent: false },
          heat: { intensity: 'High' },
          isCritical: true,
        },
        {
          text: 'Lower flame to gentle simmer. Slowly stream roasted rava with one hand while continuously whisking with the other to avoid any lumps. Cover with lid and steam for 3 mins until soft and fluffy.',
          duration: { value: 4, isYieldDependent: false },
          heat: { intensity: 'Low' },
          isCritical: true,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
              caption: 'Soft, steaming hot ghee roasted rava upma',
              stage: 'after_step',
            },
          ],
        },
      ],
    },
  ],
};

export const recipeLibrary: Recipe[] = [
  mockAdaiRecipe,
  mockPaneerButterMasalaRecipe,
  mockFilterCoffeeRecipe,
  mockRavaUpmaRecipe,
];
