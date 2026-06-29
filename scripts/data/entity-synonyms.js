'use strict';

// aliases.json: term → canonical entity ID
// Every alias/abbreviation that maps to a canonical entity
const aliases = {
  // Free Chlorine
  'FC': 'free-chlorine',
  'available chlorine': 'free-chlorine',
  'available free chlorine': 'free-chlorine',
  'FAC': 'free-chlorine',
  'residual chlorine': 'free-chlorine',
  'free available chlorine': 'free-chlorine',

  // Combined Chlorine
  'CC': 'combined-chlorine',
  'chloramine': 'combined-chlorine',
  'chloramines': 'combined-chlorine',
  'bound chlorine': 'combined-chlorine',
  'combined available chlorine': 'combined-chlorine',

  // Total Chlorine
  'TC': 'total-chlorine',
  'total available chlorine': 'total-chlorine',

  // CYA
  'CYA': 'cyanuric-acid',
  'stabilizer': 'cyanuric-acid',
  'conditioner': 'cyanuric-acid',
  'isocyanuric acid': 'cyanuric-acid',
  'chlorine stabilizer': 'cyanuric-acid',
  'pool conditioner': 'cyanuric-acid',
  'pool stabilizer': 'cyanuric-acid',

  // pH
  'potential hydrogen': 'ph',
  'water pH': 'ph',
  'hydrogen ion concentration': 'ph',

  // Alkalinity
  'TA': 'alkalinity',
  'total alkalinity': 'alkalinity',
  'bicarbonate alkalinity': 'alkalinity',
  'carbonate alkalinity': 'alkalinity',
  'pH buffering capacity': 'alkalinity',
  'alkalinity': 'alkalinity',

  // LSI
  'LSI': 'lsi',
  'Langelier Saturation Index': 'lsi',
  'saturation index': 'lsi',
  'Langelier index': 'lsi',
  'water balance index': 'lsi',
  'LSIP': 'lsi',

  // ORP
  'ORP': 'orp',
  'oxidation-reduction potential': 'orp',
  'redox potential': 'orp',
  'redox': 'orp',

  // TDS
  'TDS': 'total-dissolved-solids',
  'dissolved solids': 'total-dissolved-solids',
  'total dissolved matter': 'total-dissolved-solids',

  // Calcium Hardness
  'CH': 'calcium-hardness',
  'calcium': 'calcium-hardness',
  'water hardness': 'calcium-hardness',
  'hardness': 'calcium-hardness',
  'total hardness': 'calcium-hardness',

  // Salt
  'NaCl': 'salt',
  'pool salt': 'salt',
  'sodium chloride': 'salt',
  'salt level': 'salt',
  'saltwater': 'salt',

  // Bromine
  'Br': 'bromine',
  'BCDMH': 'bromine',
  'spa bromine': 'bromine',

  // Phosphate
  'PO4': 'phosphate',
  'phosphates': 'phosphate',
  'phosphorus': 'phosphate',

  // Copper
  'Cu': 'copper',

  // Iron
  'Fe': 'iron',
  'ferrous iron': 'iron',
  'ferric iron': 'iron',

  // Ozone
  'O3': 'ozone',
  'ozone generator': 'ozone',

  // Hydrogen Peroxide
  'H2O2': 'hydrogen-peroxide',
  'peroxide': 'hydrogen-peroxide',

  // Temperature
  'water temp': 'temperature',
  'pool temperature': 'temperature',

  // Gallons
  'gal': 'gallons',
  'US gallons': 'gallons',

  // ppm
  'parts per million': 'ppm',
  'mg/L': 'ppm',
  'milligrams per liter': 'ppm',

  // Flow Rate
  'GPM': 'flow-rate',
  'gallons per minute': 'flow-rate',
  'pump flow': 'flow-rate',

  // Turnover
  'turnover rate': 'turnover-time',
  'pump turnover': 'turnover-time',
  'filter turnover': 'turnover-time',
  'recirculation time': 'turnover-time',

  // Pump
  'circulation pump': 'pump',
  'VSP': 'pump',
  'variable speed pump': 'pump',
  'pool pump': 'pump',

  // Salt Chlorinator
  'SWCG': 'salt-chlorinator',
  'saltwater generator': 'salt-chlorinator',
  'chlorine generator': 'salt-chlorinator',
  'salt cell': 'salt-chlorinator',

  // Automatic Chlorinator
  'chlorinator': 'automatic-chlorinator',
  'erosion feeder': 'automatic-chlorinator',
  'tablet feeder': 'automatic-chlorinator',

  // Shock
  'shock': 'shock-treatment',
  'pool shock': 'shock-treatment',
  'superchlorination': 'shock-treatment',
  'hyperchlorination': 'shock-treatment',

  // BPC
  'BPC': 'breakpoint-chlorination',
  'breakpoint': 'breakpoint-chlorination',

  // Backwash
  'backwash': 'backwashing',
  'filter backwash': 'backwashing',

  // Filtration
  'pool filtration': 'filtration',
  'water filtration': 'filtration',

  // Water Replacement
  'drain and refill': 'water-replacement',
  'partial drain': 'water-replacement',
  'water change': 'water-replacement',

  // Processes
  'pool opening': 'pool-opening',
  'spring opening': 'pool-opening',
  'pool closing': 'winterization',
  'winterize': 'winterization',

  // Hot Tub
  'spa': 'hot-tub',
  'jacuzzi': 'hot-tub',

  // Saltwater Pool
  'salt pool': 'saltwater-pool',

  // Liquid Chlorine
  'sodium hypochlorite': 'liquid-chlorine',
  'bleach': 'liquid-chlorine',
  'pool bleach': 'liquid-chlorine',

  // Cal-hypo
  'cal-hypo': 'calcium-hypochlorite',
  '65% shock': 'calcium-hypochlorite',
  'granular shock': 'calcium-hypochlorite',

  // Trichlor
  'chlorine tablets': 'trichlor-tablets',
  '3-inch tablets': 'trichlor-tablets',

  // Dichlor
  'dichlor': 'sodium-dichlor',

  // Muriatic Acid
  'HCl': 'muriatic-acid',
  'hydrochloric acid': 'muriatic-acid',
  'pool acid': 'muriatic-acid',
  'pH down': 'muriatic-acid',
  'acid': 'muriatic-acid',

  // Soda Ash
  'sodium carbonate': 'soda-ash',
  'pH up': 'soda-ash',
  'pH increaser': 'soda-ash',

  // Baking Soda
  'sodium bicarbonate': 'baking-soda',
  'bicarb': 'baking-soda',
  'alkalinity increaser': 'baking-soda',

  // Organizations
  'CDC': 'cdc',
  'Centers for Disease Control': 'cdc',
  'EPA': 'epa',
  'Environmental Protection Agency': 'epa',
  'PHTA': 'phta',
  'Pool & Hot Tub Alliance': 'phta',
  'APSP': 'phta',
  'NSF': 'nsf',
  'Taylor': 'taylor-technologies',
  'LaMotte': 'lamotte',
};

// synonyms.json: canonical entity ID → array of all known search terms
const synonyms = {
  'free-chlorine': ['FC', 'free chlorine', 'available chlorine', 'FAC', 'residual chlorine', 'pool chlorine'],
  'combined-chlorine': ['CC', 'combined chlorine', 'chloramine', 'chloramines', 'bound chlorine', 'combined available chlorine'],
  'total-chlorine': ['TC', 'total chlorine', 'total available chlorine'],
  'cyanuric-acid': ['CYA', 'cyanuric acid', 'stabilizer', 'conditioner', 'isocyanuric acid', 'chlorine stabilizer', 'pool conditioner'],
  'ph': ['pH', 'potential hydrogen', 'water pH', 'acidity', 'alkalinity level'],
  'alkalinity': ['TA', 'total alkalinity', 'bicarbonate alkalinity', 'carbonate alkalinity', 'pH buffer'],
  'lsi': ['LSI', 'Langelier Saturation Index', 'saturation index', 'Langelier index', 'water balance index'],
  'orp': ['ORP', 'oxidation-reduction potential', 'redox', 'sanitizing capacity'],
  'total-dissolved-solids': ['TDS', 'total dissolved solids', 'dissolved solids'],
  'calcium-hardness': ['CH', 'calcium hardness', 'calcium', 'water hardness', 'hardness'],
  'salt': ['NaCl', 'pool salt', 'sodium chloride', 'salt level', 'saltwater'],
  'bromine': ['Br', 'BCDMH', 'bromine', 'spa bromine', 'hot tub bromine'],
  'phosphate': ['PO4', 'phosphate', 'phosphates', 'phosphorus'],
  'copper': ['Cu', 'copper', 'copper staining'],
  'iron': ['Fe', 'iron', 'ferrous iron', 'ferric iron', 'rust staining'],
  'ozone': ['O3', 'ozone', 'ozone generator', 'ozone sanitizer'],
  'hydrogen-peroxide': ['H2O2', 'hydrogen peroxide', 'peroxide'],
  'temperature': ['temperature', 'water temp', 'pool temperature', 'water temperature'],
  'gallons': ['gal', 'gallons', 'US gallons', 'pool volume'],
  'ppm': ['ppm', 'parts per million', 'mg/L', 'milligrams per liter'],
  'flow-rate': ['GPM', 'gallons per minute', 'pump flow', 'flow rate'],
  'turnover-time': ['turnover rate', 'pump turnover', 'filter turnover', 'turnover time'],
  'pump': ['pool pump', 'circulation pump', 'VSP', 'variable speed pump'],
  'salt-chlorinator': ['SWCG', 'saltwater generator', 'chlorine generator', 'salt cell'],
  'automatic-chlorinator': ['chlorinator', 'erosion feeder', 'tablet feeder', 'automatic chlorinator'],
  'shock-treatment': ['shock', 'pool shock', 'superchlorination', 'hyperchlorination'],
  'breakpoint-chlorination': ['BPC', 'breakpoint chlorination', 'breakpoint'],
  'backwashing': ['backwash', 'filter backwash', 'backwashing'],
  'hot-tub': ['hot tub', 'spa', 'jacuzzi', 'hydrotherapy spa'],
  'saltwater-pool': ['salt pool', 'saltwater pool', 'salt chlorinator pool'],
  'liquid-chlorine': ['sodium hypochlorite', 'bleach', 'pool bleach', 'liquid chlorine'],
  'calcium-hypochlorite': ['cal-hypo', 'calcium hypochlorite', 'granular shock', '65% shock'],
  'trichlor-tablets': ['chlorine tablets', 'trichlor', '3-inch tablets', 'stabilized tablets'],
  'sodium-dichlor': ['dichlor', 'sodium dichlor', 'stabilized shock'],
  'muriatic-acid': ['HCl', 'hydrochloric acid', 'muriatic acid', 'pool acid', 'pH down'],
  'soda-ash': ['sodium carbonate', 'soda ash', 'pH up', 'pH increaser'],
  'baking-soda': ['sodium bicarbonate', 'baking soda', 'bicarb', 'alkalinity increaser'],
  'phta': ['PHTA', 'Pool & Hot Tub Alliance', 'APSP', 'pool industry association'],
  'cdc': ['CDC', 'Centers for Disease Control', 'healthy swimming'],
  'taylor-technologies': ['Taylor Technologies', 'Taylor', 'Taylor test kits', 'K-2006'],
};

module.exports = { aliases, synonyms };
