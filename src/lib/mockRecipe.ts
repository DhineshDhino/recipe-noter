import { Recipe } from './types'; // Assuming we export the schema types

export const mockAdaiRecipe: Recipe = {
  id: "recipe_adai_001",
  name: "Adai",
  baseYield: 4, // Assuming this serves 4 people
  versionHistory: [
    {
      versionName: "Amma's Soft Version",
      author: "Amma",
      timestamp: "2023-01-01T00:00:00Z",
    }
  ],
  masterIngredients: [
    { id: "ing_raw_rice", defaultName: "Raw Rice", translations: [{ language: "Tamil", name: "Pacha Arisi" }] },
    { id: "ing_boiled_rice", defaultName: "Boiled Rice", translations: [{ language: "Tamil", name: "Puzhungal Arisi" }] },
    { id: "ing_toor_dal", defaultName: "Toor Dal", translations: [{ language: "Tamil", name: "Thoram Parupu" }] },
    { id: "ing_urad_dal", defaultName: "Urad Dal", translations: [{ language: "Tamil", name: "Ulutham Parupu" }] },
    { id: "ing_moong_dal", defaultName: "Moong Dal", translations: [{ language: "Tamil", name: "Paasi Parupu" }] },
    { id: "ing_chana_dal", defaultName: "Chana Dal", translations: [{ language: "Tamil", name: "Kadala Parupu" }] },
    { id: "ing_ginger", defaultName: "Ginger", translations: [{ language: "Tamil", name: "Inji" }] },
    { id: "ing_asafoetida", defaultName: "Asafoetida", translations: [{ language: "Tamil", name: "Perungayam" }] },
    { id: "ing_green_chilli", defaultName: "Green Chilli", translations: [{ language: "Tamil", name: "Pacha Molaga" }] },
    { id: "ing_dry_red_chilli", defaultName: "Dry Red Chilli", translations: [{ language: "Tamil", name: "Vara Molaga" }] },
    { id: "ing_curry_leaves", defaultName: "Curry Leaves", translations: [{ language: "Tamil", name: "Karuvepillai" }] },
    { id: "ing_salt", defaultName: "Salt", translations: [{ language: "Tamil", name: "Uppu" }] },
    { id: "ing_coriander", defaultName: "Coriander Leaves", translations: [{ language: "Tamil", name: "Kothamalli" }] },
    { id: "ing_drumstick_leaves", defaultName: "Drumstick Leaves", translations: [{ language: "Tamil", name: "Murunga Keera" }] },
    { id: "ing_onion", defaultName: "Onion", translations: [{ language: "Tamil", name: "Vengayam" }] },
  ],
  requiredEquipment: [
    "Grinder / Mixer Grinder",
    "Dosa Tawa",
    "Spatula",
    "Multiple soaking bowls"
  ],
  ratioGroups: [
    {
      id: "ratio_rice",
      name: "Rice Blend (1:1)",
      members: [
        { ingredientId: "ing_raw_rice", parts: 1 },
        { ingredientId: "ing_boiled_rice", parts: 1 }
      ],
      isStrict: true
    },
    {
      id: "ratio_dal",
      name: "Dal Blend (1:1:1:1)",
      members: [
        { ingredientId: "ing_toor_dal", parts: 1 },
        { ingredientId: "ing_urad_dal", parts: 1 },
        { ingredientId: "ing_moong_dal", parts: 1 },
        { ingredientId: "ing_chana_dal", parts: 1 }
      ],
      isStrict: true
    },
    {
      id: "ratio_rice_to_dal",
      name: "Rice to Dal Ratio (1:0.5)",
      members: [
        { ingredientId: "ing_raw_rice", parts: 1 }, // Representing the rice group
        { ingredientId: "ing_toor_dal", parts: 0.5 } // Representing the dal group
      ],
      isStrict: false
    }
  ],
  prepBlocks: [
    {
      name: "Soaking",
      totalDurationInMinutes: 240, // 4 hours from CSV
      ingredients: [
        { ingredientId: "ing_raw_rice", quantity: 100, unit: "g", isOptional: false, tags: [] },
        { ingredientId: "ing_boiled_rice", quantity: 100, unit: "g", isOptional: false, tags: [] },
        { ingredientId: "ing_toor_dal", quantity: 25, unit: "g", isOptional: false, tags: [] },
        { ingredientId: "ing_urad_dal", quantity: 25, unit: "g", isOptional: false, tags: [] },
        { ingredientId: "ing_moong_dal", quantity: 25, unit: "g", isOptional: true, tags: [] }, // CSV noted as optional
        { ingredientId: "ing_chana_dal", quantity: 25, unit: "g", isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: "Wash all ingredients thoroughly.",
          duration: { value: 5, isYieldDependent: true },
          isCritical: false
        },
        {
          text: "Soak all prep ingredients separately in bowls.",
          duration: { value: 5, isYieldDependent: false },
          isCritical: false
        }
      ]
    },
    {
      name: "Grinding the Batter",
      totalDurationInMinutes: 22, // Estimated time for grinding
      ingredients: [
        { ingredientId: "ing_green_chilli", quantity: 3, unit: "count", isOptional: false, tags: ["spice"] },
        { ingredientId: "ing_dry_red_chilli", quantity: 3, unit: "count", isOptional: false, tags: ["spice"] },
        { ingredientId: "ing_ginger", quantity: 15, unit: "g", isOptional: false, tags: ["spice"] },
        { ingredientId: "ing_curry_leaves", quantity: 1, unit: "handful", isOptional: false, tags: [] },
        { ingredientId: "ing_asafoetida", quantity: 0.5, unit: "tsp", isOptional: false, tags: [] },
        { ingredientId: "ing_salt", quantity: 10, unit: "g", isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: "Put green chilli, ginger, curry leaves, and dry red chilli in grinder and grind until smushy.",
          duration: { value: 5, isYieldDependent: false },
          isCritical: true // Important process step noted in CSV
        },
        {
          text: "Add both soaked rice types into the grinder. Grind until coarse.",
          duration: { value: 10, isYieldDependent: true },
          isCritical: true // The order is critical
        },
        {
          text: "Add all the soaked dal varieties. Grind until the correct slightly coarse consistency.",
          duration: { value: 5, isYieldDependent: true },
          isCritical: true
        },
        {
          text: "Add asafoetida and salt right before taking it out of the grinder.",
          duration: { value: 2, isYieldDependent: false },
          isCritical: false
        }
      ]
    }
  ],
  passiveBlocks: [
    {
      name: "Batter Fermentation / Resting",
      totalDurationInMinutes: 720, // 12 hours from CSV
      ingredients: [],
      steps: [
        {
          text: "Allow the batter to rest before cooking.",
          duration: { value: 720, isYieldDependent: false }, // 12 hours from CSV "prep time to cooking"
          isCritical: false
        }
      ]
    }
  ],
  cookBlocks: [
    {
      name: "Making Adai",
      totalDurationInMinutes: 15, // 15 mins from CSV
      ingredients: [
        { ingredientId: "ing_onion", quantity: 100, unit: "g", isOptional: false, tags: [] },
        { ingredientId: "ing_drumstick_leaves", quantity: 1, unit: "handful", isOptional: false, tags: [] },
        { ingredientId: "ing_coriander", quantity: 1, unit: "handful", isOptional: false, tags: [] },
      ],
      steps: [
        {
          text: "Mix chopped onions, drumstick leaves, and coriander into the rested batter.",
          duration: { value: 2, isYieldDependent: true },
          isCritical: false
        },
        {
          text: "Heat Dosa Tawa. Pour a ladle of batter and spread it like a thick dosa.",
          duration: { value: 1, isYieldDependent: false },
          heat: { intensity: "Medium" },
          isCritical: false
        },
        {
          text: "Cook until golden brown on both sides.",
          duration: { value: 5, isYieldDependent: false },
          isCritical: false
        }
      ]
    }
  ],
  pairings: [
    "Vellam and butter",
    "Idly molaga podi",
    "Avial"
  ]
};
