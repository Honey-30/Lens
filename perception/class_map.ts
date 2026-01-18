/**
 * class_map.ts
 * Semantic expansion layer for food-aware detection.
 * Maps generic categories to specific items and provides scientific taxonomy.
 */

export const FOOD_CLASS_MAP: Record<string, string[]> = {
  'fruit': [
    'apple', 'banana', 'orange', 'pear', 'strawberry', 'blueberry', 
    'raspberry', 'mango', 'pineapple', 'grape', 'lemon', 'lime', 
    'avocado', 'pomegranate', 'kiwi', 'peach', 'plum'
  ],
  'vegetable': [
    'spinach', 'kale', 'lettuce', 'tomato', 'carrot', 'broccoli', 
    'onion', 'garlic', 'shallot', 'leek', 'bell pepper', 'chili', 
    'zucchini', 'eggplant', 'cucumber', 'potato', 'sweet potato',
    'ginger', 'celery', 'asparagus', 'cauliflower', 'mushroom'
  ],
  'protein': [
    'chicken', 'beef', 'pork', 'lamb', 'egg', 'tofu', 'salmon', 
    'shrimp', 'cheese', 'yogurt', 'milk', 'tempeh', 'beans', 'lentils'
  ],
  'condiment': [
    'butter', 'mayo', 'ketchup', 'soy sauce', 'mustard', 'olive oil', 
    'vinegar', 'honey', 'maple syrup', 'miso', 'tahini'
  ],
  'herb': [
    'basil', 'cilantro', 'parsley', 'thyme', 'rosemary', 'oregano',
    'mint', 'dill', 'chives', 'sage'
  ]
};

export const SCIENTIFIC_MAP: Record<string, string> = {
  // Fruits
  'apple': 'Malus domestica',
  'banana': 'Musa acuminata',
  'orange': 'Citrus sinensis',
  'pear': 'Pyrus communis',
  'strawberry': 'Fragaria × ananassa',
  'blueberry': 'Vaccinium corymbosum',
  'raspberry': 'Rubus idaeus',
  'mango': 'Mangifera indica',
  'pineapple': 'Ananas comosus',
  'grape': 'Vitis vinifera',
  'lemon': 'Citrus limon',
  'lime': 'Citrus aurantiifolia',
  'avocado': 'Persea americana',
  'pomegranate': 'Punica granatum',
  'kiwi': 'Actinidia deliciosa',
  'peach': 'Prunus persica',
  'plum': 'Prunus domestica',

  // Vegetables
  'spinach': 'Spinacia oleracea',
  'kale': 'Brassica oleracea var. sabellica',
  'lettuce': 'Lactuca sativa',
  'tomato': 'Solanum lycopersicum',
  'carrot': 'Daucus carota subsp. sativus',
  'broccoli': 'Brassica oleracea var. italica',
  'onion': 'Allium cepa',
  'garlic': 'Allium sativum',
  'shallot': 'Allium cepa gr. aggregatum',
  'leek': 'Allium ampeloprasum',
  'bell pepper': 'Capsicum annuum',
  'chili': 'Capsicum frutescens',
  'zucchini': 'Cucurbita pepo',
  'eggplant': 'Solanum melongena',
  'cucumber': 'Cucumis sativus',
  'potato': 'Solanum tuberosum',
  'sweet potato': 'Ipomoea batatas',
  'ginger': 'Zingiber officinale',
  'celery': 'Apium graveolens',
  'asparagus': 'Asparagus officinalis',
  'cauliflower': 'Brassica oleracea var. botrytis',
  'mushroom': 'Agaricus bisporus',

  // Proteins & Dairy
  'chicken': 'Gallus gallus domesticus',
  'beef': 'Bos taurus',
  'pork': 'Sus scrofa domesticus',
  'lamb': 'Ovis aries',
  'egg': 'Gallus gallus domesticus (Ovum)',
  'tofu': 'Glycine max (Curd)',
  'salmon': 'Salmo salar',
  'shrimp': 'Caridea',
  'cheese': 'Caseus',
  'yogurt': 'Oxygala',
  'milk': 'Lac',
  'tempeh': 'Glycine max (Fermented)',
  'beans': 'Phaseolus vulgaris',
  'lentils': 'Lens culinaris',

  // Condiments
  'butter': 'Butyrum',
  'mayo': 'Mayonensis',
  'ketchup': 'Solanum lycopersicum (Condimentum)',
  'soy sauce': 'Glycine max (Liquamen)',
  'mustard': 'Sinapis alba',
  'olive oil': 'Olea europaea (Oleum)',
  'vinegar': 'Acetum',
  'honey': 'Mel',
  'maple syrup': 'Acer saccharum (Sirupus)',
  'miso': 'Glycine max (Miso)',
  'tahini': 'Sesamum indicum (Pasta)',

  // Herbs
  'basil': 'Ocimum basilicum',
  'cilantro': 'Coriandrum sativum',
  'parsley': 'Petroselinum crispum',
  'thyme': 'Thymus vulgaris',
  'rosemary': 'Salvia rosmarinus',
  'oregano': 'Origanum vulgare',
  'mint': 'Mentha',
  'dill': 'Anethum graveolens',
  'chives': 'Allium schoenoprasum',
  'sage': 'Salvia officinalis'
};
