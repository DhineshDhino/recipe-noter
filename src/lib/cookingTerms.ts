export interface CookingTerm {
  term: string;
  category: 'Heat & Fry' | 'Liquid & Moisture' | 'Prep & Knife' | 'Baking & Dough' | 'Finishing & Aroma' | 'Indian Traditional';
  tamilEquiv?: string;
  hint?: string;
}

export const masterCookingTerms: CookingTerm[] = [
  // Indian Traditional & Tempering
  { term: 'Tempering (Thalippu)', category: 'Indian Traditional', tamilEquiv: 'தாளிப்பு', hint: 'Popping mustard seeds, cumin & curry leaves in hot oil/ghee' },
  { term: 'Roasting (Varuval)', category: 'Indian Traditional', tamilEquiv: 'வறுத்தல்', hint: 'Dry or oil roasting dals and whole spices till fragrant' },
  { term: 'Sautéing (Vazhakal)', category: 'Indian Traditional', tamilEquiv: 'வதக்கல்', hint: 'Cooking onions, ginger-garlic and tomatoes until soft and fragrant' },
  { term: 'Simmering (Kodhika Vaikavum)', category: 'Indian Traditional', tamilEquiv: 'கொதிக்க வைத்தல்', hint: 'Gentle boiling of sambar, rasam or gravies on low flame' },
  { term: 'Grinding (Araithal)', category: 'Indian Traditional', tamilEquiv: 'அரைத்தல்', hint: 'Grinding to smooth paste or coarse texture in mixer/grinder' },
  { term: 'Soaking (Oora Vaikavum)', category: 'Indian Traditional', tamilEquiv: 'ஊற வைத்தல்', hint: 'Submerging rice, lentils or tamarind in water' },
  { term: 'Fermenting (Pulipparuthal)', category: 'Indian Traditional', tamilEquiv: 'புளிக்க வைத்தல்', hint: 'Leaving batter in warm place to rise and aerate' },
  { term: 'Tawa Roasting (Dosa Suduthal)', category: 'Indian Traditional', tamilEquiv: 'தோசை சுடுதல்', hint: 'Spreading batter in circular motion on hot greased griddle' },
  { term: 'Deep Frying (Porithal)', category: 'Indian Traditional', tamilEquiv: 'பொரித்தல்', hint: 'Submerging vadas, puris, or appalams in rolling hot oil' },
  { term: 'Steaming (Aviyal/Idli)', category: 'Indian Traditional', tamilEquiv: 'வேக வைத்தல் (ஆவி)', hint: 'Cooking idlis or kozhukattai with gentle steam in pot' },
  { term: 'Dum Cooking', category: 'Indian Traditional', tamilEquiv: 'தம்', hint: 'Slow sealed steam cooking on very low flame' },
  { term: 'Tamarind Extraction', category: 'Indian Traditional', tamilEquiv: 'புளி கரைசல்', hint: 'Squeezing soaked tamarind pulp with water' },
  { term: 'Kneading (Pisaithal)', category: 'Indian Traditional', tamilEquiv: 'பிசைதல்', hint: 'Working flour and water into pliable smooth dough' },

  // Heat & Fry
  { term: 'Sauté', category: 'Heat & Fry', hint: 'Cook quickly in a small amount of oil or butter over medium-high heat' },
  { term: 'Pan-Sear', category: 'Heat & Fry', hint: 'Brown food quickly on high surface heat to form a crust' },
  { term: 'Stir-Fry', category: 'Heat & Fry', hint: 'Fry rapidly over high heat while stirring constantly in a wok' },
  { term: 'Deep-Fry', category: 'Heat & Fry', hint: 'Fully submerge food in hot oil until golden crisp' },
  { term: 'Shallow-Fry', category: 'Heat & Fry', hint: 'Cook food in moderate layer of hot oil in a frying pan' },
  { term: 'Dry-Roast', category: 'Heat & Fry', hint: 'Heat dry ingredients in a pan with zero oil until fragrant and toasted' },
  { term: 'Caramelize', category: 'Heat & Fry', hint: 'Slowly brown natural sugars on low-medium heat' },
  { term: 'Char / Flame-Roast', category: 'Heat & Fry', hint: 'Expose directly to open flame for smoky charred aroma' },
  { term: 'Brown', category: 'Heat & Fry', hint: 'Cook surface until golden or deep amber' },
  { term: 'Sweat', category: 'Heat & Fry', hint: 'Cook aromatics gently in fat without letting them brown' },
  { term: 'Flash-Fry', category: 'Heat & Fry', hint: 'Very brief deep fry in smoking hot oil' },

  // Liquid & Moisture
  { term: 'Simmer', category: 'Liquid & Moisture', hint: 'Cook in liquid just below the boiling point with small gentle bubbles' },
  { term: 'Boil', category: 'Liquid & Moisture', hint: 'Cook in liquid at vigorous bubbling boiling temperature (100°C)' },
  { term: 'Blanch', category: 'Liquid & Moisture', hint: 'Scald in boiling water briefly then plunge into cold ice water' },
  { term: 'Poach', category: 'Liquid & Moisture', hint: 'Cook submerged in gently heated, barely moving liquid' },
  { term: 'Braise', category: 'Liquid & Moisture', hint: 'Sear first then cook slowly in a covered pot with small amount of liquid' },
  { term: 'Deglaze', category: 'Liquid & Moisture', hint: 'Add liquid to a hot pan to dissolve browned food residue fond' },
  { term: 'Reduce', category: 'Liquid & Moisture', hint: 'Boil liquid uncovered to thicken consistency and concentrate flavor' },
  { term: 'Steam', category: 'Liquid & Moisture', hint: 'Cook food bathed in hot vapor above boiling water' },
  { term: 'Parboil', category: 'Liquid & Moisture', hint: 'Boil food partially as an initial step before roasting or baking' },
  { term: 'Marinate', category: 'Liquid & Moisture', hint: 'Soak food in seasoned, acidic or spiced marinade before cooking' },
  { term: 'Infuse', category: 'Liquid & Moisture', hint: 'Steep spices or herbs in warm liquid to extract aromatic flavors' },

  // Prep & Knife Skills
  { term: 'Dice', category: 'Prep & Knife', hint: 'Cut food into small, uniform cubes (e.g. 5mm to 1cm)' },
  { term: 'Mince', category: 'Prep & Knife', hint: 'Chop food into extremely fine, tiny pieces (e.g. garlic, ginger)' },
  { term: 'Julienne', category: 'Prep & Knife', hint: 'Cut food into thin, matchstick-like strips' },
  { term: 'Finely Chop', category: 'Prep & Knife', hint: 'Cut into small irregular pieces with a chef knife' },
  { term: 'Roughly Chop', category: 'Prep & Knife', hint: 'Cut into coarse bite-sized chunks' },
  { term: 'Slice', category: 'Prep & Knife', hint: 'Cut across food into thin, uniform flat rounds or strips' },
  { term: 'Grate', category: 'Prep & Knife', hint: 'Rub food against a grater to shred into fine ribbons (e.g. coconut, paneer)' },
  { term: 'Crush', category: 'Prep & Knife', hint: 'Flatten or break up roughly with flat knife blade or pestle' },
  { term: 'Pound / Mortar & Pestle', category: 'Prep & Knife', hint: 'Coarsely crush whole spices or aromatics in a mortar' },
  { term: 'Peel', category: 'Prep & Knife', hint: 'Strip outer skin off vegetables or ginger' },
  { term: 'Core', category: 'Prep & Knife', hint: 'Remove central seed cavity or tough middle section' },
  { term: 'Score', category: 'Prep & Knife', hint: 'Make shallow cuts across the surface of food to absorb marinades' },

  // Baking & Dough
  { term: 'Knead', category: 'Baking & Dough', hint: 'Work dough with hands to develop gluten elasticity' },
  { term: 'Whisk', category: 'Baking & Dough', hint: 'Beat ingredients rapidly with a whisk to incorporate air' },
  { term: 'Fold', category: 'Baking & Dough', hint: 'Gently combine delicate ingredients without deflating air' },
  { term: 'Rest Dough / Batter', category: 'Baking & Dough', hint: 'Allow flour to hydrate and gluten to relax' },
  { term: 'Roll Out', category: 'Baking & Dough', hint: 'Flatten dough with a rolling pin to desired uniform thickness' },
  { term: 'Bake', category: 'Baking & Dough', hint: 'Cook food by dry heat in an enclosed oven' },
  { term: 'Proof', category: 'Baking & Dough', hint: 'Let dough rest and ferment to rise before baking' },
  { term: 'Blind Bake', category: 'Baking & Dough', hint: 'Pre-bake a pastry crust before adding wet filling' },

  // Finishing & Aroma
  { term: 'Garnish', category: 'Finishing & Aroma', hint: 'Decorate with fresh coriander, roasted nuts or microgreens' },
  { term: 'Drizzle', category: 'Finishing & Aroma', hint: 'Pour a thin stream of ghee, oil, or sauce over food' },
  { term: 'Season to Taste', category: 'Finishing & Aroma', hint: 'Adjust salt, pepper or acid in the final step' },
  { term: 'Emulsify', category: 'Finishing & Aroma', hint: 'Combine oil and water-based liquids into a stable smooth sauce' },
  { term: 'Aerate', category: 'Finishing & Aroma', hint: 'Pour liquid from height (e.g. meter chai / filter coffee aeration)' },
  { term: 'Glaze', category: 'Finishing & Aroma', hint: 'Coat food with glossy sweet or savory reduced sauce' },
];

/** Normalize string by stripping accents and lowercasing for fuzzy match */
export const normalizeText = (str: string): string =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/** Search matching cooking terms against user input */
export const searchCookingTerms = (query: string, limit = 5): CookingTerm[] => {
  const q = normalizeText(query);
  if (!q) return [];
  return masterCookingTerms
    .filter(
      item =>
        normalizeText(item.term).includes(q) ||
        (item.tamilEquiv && item.tamilEquiv.includes(q)) ||
        (item.hint && normalizeText(item.hint).includes(q)) ||
        normalizeText(item.category).includes(q)
    )
    .slice(0, limit);
};
