'use strict';
/**
 * cluster-translations.js — Phase 8E Spanish first-production-cluster
 * translation data.
 *
 * Each entry is an ORDERED array of [englishText, spanishText] pairs.
 * scripts/generate-spanish-cluster.js applies them via exact substring
 * replacement (String.split(find).join(replace) -- replaces every
 * occurrence, no regex), in the order listed, and throws if a `find`
 * string is not present in the source file (catches drift immediately if
 * the English source is ever edited without updating this file -- see
 * docs/PHASE-8E-SPANISH-ROLLOUT.md Section on generator architecture).
 *
 * Order matters: longer/more-specific strings are listed before shorter
 * ones they contain, so a specific phrase is never partially clobbered by
 * a later, more generic rule. Calculation logic (variable names, function
 * calls, arithmetic, control flow, dataset-driven product labels from
 * js/calculator.js and js/calc-utils.js) is never touched -- only
 * human-readable display text and the display-string-building lines
 * explicitly listed here.
 *
 * Terminology is held consistent across the whole cluster deliberately:
 * this file is the single place every Spanish string is authored, so the
 * same English phrase always gets the same Spanish translation everywhere
 * it appears in the cluster.
 */

// ---------------------------------------------------------------------
// Shared across all 5 pages (identical header/breadcrumb/printables/
// chart-crosslinks/credibility/trust-panel-chrome/footer markup).
// ---------------------------------------------------------------------
const SHARED = [
  // Header nav (link text only -- hrefs handled by the generator's own
  // link-rewrite step, not here)
  ['aria-label="Primary navigation"', 'aria-label="Navegación principal"'],
  ['<a href="/calculators/chemical-calculator">Calculator</a>', '<a href="/es/calculators/chemical-calculator">Calculadora</a>'],
  ['>Resources<', '>Recursos<'],
  ['>Charts<', '>Gráficos<'],
  ['>Academy<', '>Academia<'],
  ['>Guides<', '>Guías<'],
  ['>About<', '>Acerca de<'],
  ['aria-label="Search site"', 'aria-label="Buscar en el sitio"'],
  ['aria-label="Open menu"', 'aria-label="Abrir menú"'],
  ['aria-label="Breadcrumb"', 'aria-label="Ruta de navegación"'],
  ['<span itemprop="name">Home</span>', '<span itemprop="name">Inicio</span>'],
  ['<span itemprop="name">Calculators</span>', '<span itemprop="name">Calculadoras</span>'],
  ['"name":"Home"', '"name":"Inicio"'],
  ['"name":"Calculators"', '"name":"Calculadoras"'],

  // Printable resources (identical block on every cluster page)
  ['Free Printable Resources', 'Recursos Imprimibles Gratuitos'],
  ['Pool Maintenance Checklist', 'Lista de Mantenimiento de Piscina'],
  ['Hot Tub Maintenance Log', 'Registro de Mantenimiento de Spa'],
  ['Pool Chemical Log Sheet', 'Hoja de Registro Químico de Piscina'],
  ['Vacation Rental Turnover Checklist', 'Lista de Verificación de Cambio para Alquiler Vacacional'],
  ['&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;One Page', '&#10003;&nbsp;Imprimible &middot; &#10003;&nbsp;Gratis &middot; &#10003;&nbsp;Una Página'],
  ['&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;Letter &amp; A4', '&#10003;&nbsp;Imprimible &middot; &#10003;&nbsp;Gratis &middot; &#10003;&nbsp;Carta y A4'],

  // Chart crosslinks
  ['Recommended Levels', 'Niveles Recomendados'],
  ['See the full reference chart:', 'Consulte la tabla de referencia completa:'],
  ['Pool Chemical Levels Chart', 'Tabla de Niveles Químicos de Piscina'],
  ['Chlorine Levels Chart', 'Tabla de Niveles de Cloro'],
  ['pH Levels Chart', 'Tabla de Niveles de pH'],

  // Credibility strip
  ['Typical range: 1–3 ppm chlorine', 'Rango típico: 1–3 ppm de cloro'],
  ['Recommended pH: 7.2–7.6', 'pH recomendado: 7.2–7.6'],
  ['Test water regularly', 'Analice el agua regularmente'],
  [
    'WaterBalanceTools provides practical calculators and guides for pool and hot tub water chemistry.\nThese tools are designed to help maintain safe chlorine, pH, and total alkalinity within a healthy water balance.',
    'WaterBalanceTools ofrece calculadoras y guías prácticas para la química del agua de piscinas y spas.\nEstas herramientas están diseñadas para ayudar a mantener niveles seguros de cloro, pH y alcalinidad total dentro de un balance saludable del agua.',
  ],

  // Trust panel chrome (structural labels, identical across all 5 pages)
  ['About This Calculation', 'Acerca de Este Cálculo'],
  ['<dt>Formula Version</dt>', '<dt>Versión de Fórmula</dt>'],
  ['<dt>Dataset Version</dt>', '<dt>Versión de Conjunto de Datos</dt>'],
  ['<dt>Knowledge Graph</dt>', '<dt>Grafo de Conocimiento</dt>'],
  ['<dt>Last Reviewed</dt>', '<dt>Última Revisión</dt>'],
  ['<dt>Confidence</dt>', '<dt>Confianza</dt>'],
  ['<dt>Formulas Used</dt>', '<dt>Fórmulas Utilizadas</dt>'],
  ['<dt>Dataset Sources</dt>', '<dt>Fuentes de Datos</dt>'],
  ['>Methodology<', '>Metodología<'],
  ['>Assumptions<', '>Supuestos<'],
  ['>Known Limitations<', '>Limitaciones Conocidas<'],
  ['>Rounding Policy<', '>Política de Redondeo<'],
  ['>Revision History<', '>Historial de Revisiones<'],

  // Footer
  ['<a href="/calculators/pool-volume-calculator">Pool Volume Calculator</a>', '<a href="/es/calculators/pool-volume-calculator">Calculadora de Volumen de Piscina</a>'],
  ['<a href="/calculators/pool-chlorine-calculator">Pool Chlorine Calculator</a>', '<a href="/es/calculators/pool-chlorine-calculator">Calculadora de Cloro para Piscina</a>'],
  ['<a href="/calculators/pool-shock-calculator">Pool Shock Calculator</a>', '<a href="/es/calculators/pool-shock-calculator">Calculadora de Choque para Piscina</a>'],
  ['<a href="/calculators/pool-ph-calculator">Pool pH Calculator</a>', '<a href="/es/calculators/pool-ph-calculator">Calculadora de pH para Piscina</a>'],
  ['<a href="/guides/pool-chemistry-basics">Pool Chemistry Guide</a>', '<a href="/guides/pool-chemistry-basics">Guía de Química de Piscina</a>'],
  ['<a href="/all-pages">All Pages</a>', '<a href="/all-pages">Todas las Páginas</a>'],
  ['<a href="/legal/ownership">Ownership</a>', '<a href="/legal/ownership">Propiedad</a>'],
  ['<a href="/legal/legal">Legal</a>', '<a href="/legal/legal">Aviso Legal</a>'],
  ['&copy; 2026 Albor Digital LLC. All rights reserved.', '&copy; 2026 Albor Digital LLC. Todos los derechos reservados.'],
  ['WaterBalanceTools.com is an independent educational website owned and operated by Albor Digital LLC.', 'WaterBalanceTools.com es un sitio web educativo independiente, propiedad de y operado por Albor Digital LLC.'],
  ['Platform version: v1.0.0 (Foundation) · Production Certified', 'Versión de la plataforma: v1.0.0 (Foundation) · Certificado para Producción'],

  // Related Calculators grid (identical card grid on every cluster page)
  ['Related Calculators', 'Calculadoras Relacionadas'],
  ['Pool Calculators (5)', 'Calculadoras de Piscina (5)'],
  ['Hot Tub Calculators (3)', 'Calculadoras de Spa (3)'],
  ['Water Chemistry (5)', 'Química del Agua (5)'],
  // Related-calculators grid: NON-active cards (all 13 cluster members as
  // of Phase 8I) are handled by SHARED_OPTIONAL below (see its own
  // comment) since each rule is legitimately absent on exactly the one
  // file that IS that calculator.

  // Related tools / guides section chrome (headings + generic labels)
  ['Related Pool Chemistry Tools', 'Herramientas Relacionadas de Química de Piscina'],
  ['Related Pool Chemistry Guides', 'Guías Relacionadas de Química de Piscina'],
  ['Related in this topic', 'Relacionado con este tema'],
  ['Related topics', 'Temas relacionados'],
  ['>Tools<', '>Herramientas<'],
  ['Hub guide', 'Guía central'],

  // Common form / result chrome
  ['>Calculate<', '>Calcular<'],
];

// Phase 8G: related-calculators grid, NON-active cards (class="calc-card",
// no "--active" modifier) -- href AND text rewritten together so a
// now-translated cluster member is linked Spanish -> Spanish (spec
// Section 23) instead of falling back to English merely because the grid
// component doesn't otherwise distinguish translated from untranslated
// siblings. Each page's own ACTIVE (self-referencing) card uses a
// separate, per-file, strictly-required rule instead (see each
// XXX_CALCULATOR array above) -- these entries are optional (applied only
// when present) because each is legitimately absent on exactly the one
// file that IS that calculator (which instead has the "--active" form).
const SHARED_OPTIONAL = [
  ['<a href="/calculators/chemical-calculator" class="calc-card">Pool Chemical Calculator</a>', '<a href="/es/calculators/chemical-calculator" class="calc-card">Calculadora Química de Piscina</a>'],
  ['<a href="/calculators/pool-chlorine-calculator" class="calc-card">Pool Chlorine Calculator</a>', '<a href="/es/calculators/pool-chlorine-calculator" class="calc-card">Calculadora de Cloro para Piscina</a>'],
  ['<a href="/calculators/pool-ph-calculator" class="calc-card">Pool pH Calculator</a>', '<a href="/es/calculators/pool-ph-calculator" class="calc-card">Calculadora de pH para Piscina</a>'],
  ['<a href="/calculators/pool-shock-calculator" class="calc-card">Pool Shock Calculator</a>', '<a href="/es/calculators/pool-shock-calculator" class="calc-card">Calculadora de Choque para Piscina</a>'],
  ['<a href="/calculators/pool-volume-calculator" class="calc-card">Pool Volume Calculator</a>', '<a href="/es/calculators/pool-volume-calculator" class="calc-card">Calculadora de Volumen de Piscina</a>'],
  ['<a href="/calculators/hot-tub-chlorine-calculator" class="calc-card">Hot Tub Chlorine Calculator</a>', '<a href="/es/calculators/hot-tub-chlorine-calculator" class="calc-card">Calculadora de Cloro para Spa</a>'],
  ['<a href="/calculators/hot-tub-ph-calculator" class="calc-card">Hot Tub pH Calculator</a>', '<a href="/es/calculators/hot-tub-ph-calculator" class="calc-card">Calculadora de pH para Spa</a>'],
  ['<a href="/calculators/hot-tub-shock-calculator" class="calc-card">Hot Tub Shock Calculator</a>', '<a href="/es/calculators/hot-tub-shock-calculator" class="calc-card">Calculadora de Choque para Spa</a>'],
  ['<a href="/calculators/spa-volume-calculator" class="calc-card">Spa Volume Calculator</a>', '<a href="/es/calculators/spa-volume-calculator" class="calc-card">Calculadora de Volumen de Spa</a>'],
  // Phase 8I: the 4 newly-translated Water Chemistry cluster members.
  ['<a href="/calculators/saltwater-pool-salt-calculator" class="calc-card">Salt Calculator</a>', '<a href="/es/calculators/saltwater-pool-salt-calculator" class="calc-card">Calculadora de Sal</a>'],
  ['<a href="/calculators/pool-alkalinity-calculator" class="calc-card">Alkalinity Calculator</a>', '<a href="/es/calculators/pool-alkalinity-calculator" class="calc-card">Calculadora de Alcalinidad</a>'],
  ['<a href="/calculators/pool-cyanuric-acid-calculator" class="calc-card">CYA Calculator</a>', '<a href="/es/calculators/pool-cyanuric-acid-calculator" class="calc-card">Calculadora de Ácido Cianúrico</a>'],
  ['<a href="/calculators/pool-turnover-rate-calculator" class="calc-card">Turnover Rate Calculator</a>', '<a href="/es/calculators/pool-turnover-rate-calculator" class="calc-card">Calculadora de Tasa de Recirculación</a>'],
];

// ---------------------------------------------------------------------
// Per-page content, headings, form fields, FAQs, and JS display strings.
// ---------------------------------------------------------------------

const LIMITED_CONFIDENCE_TOOLTIP = [
  'title="Value derived from sparse sources, editorial interpretation, or emerging guidance not yet widely adopted. May vary significantly between manufacturers, regions, or pool conditions.">! Limited</span>',
  'title="Valor derivado de fuentes limitadas, interpretación editorial, u orientación emergente aún no ampliamente adoptada. Puede variar significativamente entre fabricantes, regiones o condiciones de la piscina.">! Limitada</span>',
];
const VERY_HIGH_CONFIDENCE_TOOLTIP = [
  'title="Value or calculation is derived from peer-reviewed scientific literature or formally adopted consensus standards (e.g., CDC, WHO, PHTA/ANSI, FINA). Multiple independent sources agree.">✓✓ Very High</span>',
  'title="El valor o cálculo se deriva de literatura científica revisada por pares o de estándares de consenso formalmente adoptados (p. ej., CDC, OMS, PHTA/ANSI, FINA). Múltiples fuentes independientes coinciden.">✓✓ Muy Alta</span>',
];
// Chemistry-sources block chrome: present on chemical-calculator,
// pool-chlorine-calculator, pool-ph-calculator, and pool-shock-calculator,
// but NOT on pool-volume-calculator (which has no chemistry-sources
// section at all).
const SOURCES_HEADING = ['<h3>Sources</h3>', '<h3>Fuentes</h3>'];
const GOV_AUTHORITY_LABEL = ['(Government / public health authority)', '(Autoridad gubernamental / de salud pública)'];
const SEE_ASSUMPTIONS_LINK = ['see the Assumptions link above.', 'consulte el enlace de Supuestos arriba.'];

const MODERATE_CONFIDENCE_TOOLTIP = [
  'title="Value based on common practice supported by limited peer-reviewed evidence, or derived from industry guidance that has not been universally standardized. Some variation between sources.">~ Moderate</span>',
  'title="Valor basado en la práctica común respaldada por evidencia limitada revisada por pares, o derivado de orientación de la industria que no ha sido universalmente estandarizada. Alguna variación entre fuentes.">~ Moderada</span>',
];

const CHEMICAL_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/chemical-calculator" class="calc-card calc-card--active">Pool Chemical Calculator</a>', '<a href="/es/calculators/chemical-calculator" class="calc-card calc-card--active">Calculadora Química de Piscina</a>'],
  ['>Liquid chlorine (10%)<', '>Cloro líquido (10%)<'],
  SOURCES_HEADING,
  GOV_AUTHORITY_LABEL,
  SEE_ASSUMPTIONS_LINK,
  ['Pool Chemical Calculator (Chlorine and pH) | WaterBalanceTools', 'Calculadora Química de Piscina (Cloro y pH) | WaterBalanceTools'],
  [
    'Get a chlorine dose and pH adjustment guidance in seconds—enter gallons + test readings. Avoid over-treatment, cut guesswork, and keep water swim-ready.',
    'Obtenga una dosis de cloro y orientación para ajustar el pH en segundos: ingrese los galones y los resultados de sus pruebas. Evite el sobretratamiento, elimine las conjeturas y mantenga el agua lista para nadar.',
  ],
  [
    'Get a chlorine dose and pH adjustment guidance in seconds—enter gallons + test readings. Avoid over-treatment and keep water swim-ready.',
    'Obtenga una dosis de cloro y orientación para ajustar el pH en segundos: ingrese los galones y los resultados de sus pruebas. Evite el sobretratamiento y mantenga el agua lista para nadar.',
  ],
  ['"name":"Pool & Hot Tub Chemical Calculator"', '"name":"Calculadora Química de Piscina y Spa"'],
  ['Pool &amp; Hot Tub Chemical Calculator</span>', 'Calculadora Química de Piscina y Spa</span>'],
  ['<h1>Pool & Hot Tub Chemical Calculator</h1>', '<h1>Calculadora Química de Piscina y Spa</h1>'],
  [
    'Enter your water volume and test results to get a chlorine dose and pH adjustment guidance.',
    'Ingrese el volumen de agua y los resultados de sus pruebas para obtener una dosis de cloro y orientación para ajustar el pH.',
  ],
  ['<h2>Water Type</h2>', '<h2>Tipo de Agua</h2>'],
  ['<label for="water-type">Type</label>', '<label for="water-type">Tipo</label>'],
  ['>Swimming Pool<', '>Piscina<'],
  ['>Hot Tub / Spa<', '>Spa / Jacuzzi<'],
  ['<h2>Water Volume</h2>', '<h2>Volumen de Agua</h2>'],
  ['<label for="volume-gallons">Volume (US gallons)</label>', '<label for="volume-gallons">Volumen (galones EE. UU.)</label>'],
  [
    'Don\'t know? Use the <a href="volume-calculator.html">Volume Calculator</a>.',
    '¿No lo sabe? Use la <a href="pool-volume-calculator.html">Calculadora de Volumen</a>.',
  ],
  ['<h2>Water Test Results</h2>', '<h2>Resultados de las Pruebas de Agua</h2>'],
  ['<label for="current-chlorine">Current chlorine (ppm)</label>', '<label for="current-chlorine">Cloro actual (ppm)</label>'],
  ['<label for="current-ph">Current pH</label>', '<label for="current-ph">pH actual</label>'],
  ['<label for="alkalinity">Total alkalinity (optional, ppm)</label>', '<label for="alkalinity">Alcalinidad total (opcional, ppm)</label>'],
  ['<h2>Target Levels</h2>', '<h2>Niveles Objetivo</h2>'],
  [
    'Pools: Chlorine 1–3 ppm, pH 7.2–7.6. You can override below.',
    'Piscinas: Cloro 1–3 ppm, pH 7.2–7.6. Puede modificar estos valores abajo.',
  ],
  ['<label for="target-chlorine-min">Target chlorine min (ppm)</label>', '<label for="target-chlorine-min">Cloro objetivo mínimo (ppm)</label>'],
  ['<label for="target-chlorine-max">Target chlorine max (ppm)</label>', '<label for="target-chlorine-max">Cloro objetivo máximo (ppm)</label>'],
  ['<label for="target-ph-min">Target pH min</label>', '<label for="target-ph-min">pH objetivo mínimo</label>'],
  ['<label for="target-ph-max">Target pH max</label>', '<label for="target-ph-max">pH objetivo máximo</label>'],
  ['<h2 id="ph">Chemical Type</h2>', '<h2 id="ph">Tipo de Producto Químico</h2>'],
  ['<label for="chlorine-type">Chlorine type</label>', '<label for="chlorine-type">Tipo de cloro</label>'],
  ['>Chlorine tablets (trichlor)<', '>Tabletas de cloro (tricloro)<'],
  ['>Granular: Calcium Hypochlorite (65%)<', '>Granular: Hipoclorito de calcio (65%)<'],
  ['>Granular: Calcium Hypochlorite (73%)<', '>Granular: Hipoclorito de calcio (73%)<'],
  ['>Granular: Sodium Dichlor (56%)<', '>Granular: Dicloro de sodio (56%)<'],
  ['<label for="ph-chemical">pH adjustment</label>', '<label for="ph-chemical">Ajuste de pH</label>'],
  ['>pH increaser<', '>Elevador de pH<'],
  ['>pH reducer<', '>Reductor de pH<'],
  ['<h3>Recommendations</h3>', '<h3>Recomendaciones</h3>'],
  ['Re-test water after 20–30 minutes with pump running.', 'Vuelva a analizar el agua después de 20–30 minutos con la bomba en funcionamiento.'],
  ['<h2>Maintenance Schedule</h2>', '<h2>Programa de Mantenimiento</h2>'],
  ['<label for="usage-level">Usage level</label>', '<label for="usage-level">Nivel de uso</label>'],
  ['>Low<', '>Bajo<'],
  ['>Medium<', '>Medio<'],
  ['>Heavy<', '>Intenso<'],
  ['<h3>Schedule</h3>', '<h3>Programa</h3>'],
  ['Download Maintenance Plan (PDF)', 'Descargar Plan de Mantenimiento (PDF)'],
  ['<h2>Quick Answers</h2>', '<h2>Respuestas Rápidas</h2>'],
  ['<h3>What should pool chlorine be?</h3><p>Keep free chlorine between 1–3 ppm for most swimming pools. Below 1 ppm sanitizer may be too weak; above 3 ppm can irritate swimmers—test and dose in small steps.</p>',
   '<h3>¿Cuál debe ser el nivel de cloro de la piscina?</h3><p>Mantenga el cloro libre entre 1–3 ppm para la mayoría de las piscinas. Por debajo de 1 ppm el sanitizante puede ser demasiado débil; por encima de 3 ppm puede irritar a los nadadores: analice y dosifique en pasos pequeños.</p>'],
  ['<h3>How often should I test pool water?</h3><p>Test chlorine and pH at least 2–3 times per week during swim season. Test alkalinity weekly and after heavy rain or large water changes.</p>',
   '<h3>¿Con qué frecuencia debo analizar el agua de la piscina?</h3><p>Analice el cloro y el pH al menos 2–3 veces por semana durante la temporada de natación. Analice la alcalinidad semanalmente y después de lluvias fuertes o grandes cambios de agua.</p>'],
  ['<h2>People Also Ask</h2>', '<h2>Preguntas Frecuentes de Otros Usuarios</h2>'],
  ['<summary>What happens if pool chlorine is too low?</summary>\n        <p>Below about 1 ppm, bacteria and algae can grow and water may turn cloudy or green. Raise sanitizer in small steps, run the pump, and retest—avoid doubling doses without testing after circulation.</p>',
   '<summary>¿Qué sucede si el cloro de la piscina está demasiado bajo?</summary>\n        <p>Por debajo de aproximadamente 1 ppm, pueden crecer bacterias y algas, y el agua puede volverse turbia o verde. Eleve el sanitizante en pasos pequeños, haga funcionar la bomba y vuelva a analizar; evite duplicar las dosis sin analizar después de la circulación.</p>'],
  ['<summary>Can I use the same chemicals for pools and hot tubs?</summary>\n        <p>Many products overlap, but hot tubs need higher sanitizer (often 3–5 ppm) and smaller volumes mean tiny errors matter. Select hot tub in this calculator when dosing a spa.</p>',
   '<summary>¿Puedo usar los mismos productos químicos para piscinas y spas?</summary>\n        <p>Muchos productos se superponen, pero los spas necesitan más sanitizante (a menudo 3–5 ppm) y, al ser volúmenes más pequeños, los pequeños errores importan más. Seleccione spa en esta calculadora al dosificar un spa.</p>'],
  ['<summary>Should I balance pH before adding chlorine?</summary>\n        <p>Often yes. High pH weakens chlorine effectiveness; very low pH can irritate skin and corrode equipment. Get pH near 7.2–7.6, then fine-tune free chlorine based on test readings.</p>',
   '<summary>¿Debo equilibrar el pH antes de agregar cloro?</summary>\n        <p>En general, sí. Un pH alto debilita la eficacia del cloro; un pH muy bajo puede irritar la piel y corroer el equipo. Lleve el pH cerca de 7.2–7.6 y luego ajuste el cloro libre según los resultados de las pruebas.</p>'],
  ['<summary>Does rain lower pool chlorine?</summary>\n        <p>Rain can dilute sanitizer and introduce contaminants that consume chlorine. After heavy rain, test free chlorine and pH, run the filter, and adjust chemistry before heavy swimming.</p>',
   '<summary>¿La lluvia reduce el cloro de la piscina?</summary>\n        <p>La lluvia puede diluir el sanitizante e introducir contaminantes que consumen cloro. Después de lluvias fuertes, analice el cloro libre y el pH, haga funcionar el filtro y ajuste la química antes de nadar intensamente.</p>'],
  ['<summary>What is the difference between shock and chlorine?</summary>\n        <p>Routine chlorine maintains daily sanitizer; shock is a larger dose to oxidize waste, algae, or chloramines. Use the shock calculator for big raises; use this tool for ongoing balance.</p>',
   '<summary>¿Cuál es la diferencia entre el choque y el cloro?</summary>\n        <p>El cloro de rutina mantiene el sanitizante diario; el choque es una dosis mayor para oxidar residuos, algas o cloraminas. Use la calculadora de choque para elevaciones grandes; use esta herramienta para el balance continuo.</p>'],
  ['<summary>How much chlorine per 10,000 gallons?</summary>\n        <p>It depends on current ppm and product strength—not a single fixed ounce. Enter your gallons and test results here, or open the chlorine-by-size guides linked from your volume.</p>',
   '<summary>¿Cuánto cloro por 10,000 galones?</summary>\n        <p>Depende del ppm actual y de la concentración del producto; no es una cantidad fija de onzas. Ingrese sus galones y resultados de pruebas aquí, o abra las guías de cloro por tamaño enlazadas según su volumen.</p>'],
  ['<li><a href="../reference/datasets/dosage-matrices/index.html">Index</a></li>', '<li><a href="../reference/datasets/dosage-matrices/index.html">Índice</a></li>'],
  ['<li><a href="../reference/datasets/hot-tub-ranges/index.html">Index — 1</a></li>', '<li><a href="../reference/datasets/hot-tub-ranges/index.html">Índice — 1</a></li>'],
  ['<li><a href="../reference/datasets/index.html">Index — 2</a></li>', '<li><a href="../reference/datasets/index.html">Índice — 2</a></li>'],
  ['<li><a href="../reference/datasets/maintenance-schedules/index.html">Index — 3</a></li>', '<li><a href="../reference/datasets/maintenance-schedules/index.html">Índice — 3</a></li>'],
  ['<li><a href="../reference/datasets/pool-types/index.html">Index — 4</a></li>', '<li><a href="../reference/datasets/pool-types/index.html">Índice — 4</a></li>'],
  ['<li><a href="pool-cyanuric-acid-calculator.html">Pool Cyanuric Acid Calculator</a></li>', '<li><a href="pool-cyanuric-acid-calculator.html">Calculadora de Ácido Cianúrico para Piscina</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué es la alcalinidad de la piscina</a></li>'],
  ['<li><a href="pool-volume-calculator.html">Pool volume calculator</a></li>', '<li><a href="pool-volume-calculator.html">Calculadora de volumen de piscina</a></li>'],
  ['<li><a href="../guides/pool-chemistry-basics.html">Pool chemistry basics (hub)</a></li>', '<li><a href="../guides/pool-chemistry-basics.html">Fundamentos de química de piscina (guía central)</a></li>'],
  [
    '<em>Computes a chlorine dose (numeric) and pH direction/adjustment-size guidance (qualitative, not a dose) -- see pool-ph-calculator\'s trust panel for why pH does not get a numeric dose. The free-chlorine and pH target ranges are CDC-supported. "Liquid" and "Chlorine tablets" use the Phase 7S-approved product-specific constants; the 3 "Granular" options (calcium hypochlorite 65%/73%, sodium dichlor 56%) use the same approved mass-balance formula as the shock calculators (Phase 7W), each with its own dataset-verified available-chlorine percentage. This calculator reads total alkalinity as optional context only -- it does NOT compute an alkalinity dose, a calcium-hardness dose, or the Langelier Saturation Index (LSI), despite earlier trust-panel text claiming otherwise; Phase 7S corrected this. See /formulas/lsi-formula for the LSI formula and its lookup tables, which currently require manual calculation.</em>',
    '<em>Calcula una dosis de cloro (numérica) y orientación sobre la dirección/magnitud del ajuste de pH (cualitativa, no una dosis); consulte el panel de confianza de la calculadora de pH para saber por qué el pH no recibe una dosis numérica. Los rangos objetivo de cloro libre y pH cuentan con el respaldo de los CDC. "Líquido" y "Tabletas de cloro" usan las constantes específicas de producto aprobadas en la Fase 7S; las 3 opciones "Granular" (hipoclorito de calcio 65%/73%, dicloro de sodio 56%) usan la misma fórmula de balance de masa aprobada que las calculadoras de choque (Fase 7W), cada una con su propio porcentaje de cloro disponible verificado en el conjunto de datos. Esta calculadora lee la alcalinidad total solo como contexto opcional; NO calcula una dosis de alcalinidad, una dosis de dureza cálcica, ni el Índice de Saturación de Langelier (LSI), a pesar de que un texto anterior del panel de confianza afirmaba lo contrario; la Fase 7S corrigió esto. Consulte /formulas/lsi-formula para la fórmula del LSI y sus tablas de referencia, que actualmente requieren cálculo manual.</em>',
  ],
  [
    'The pH, free chlorine, total alkalinity, and calcium hardness target ranges used by this calculator are supported by the sources below. Its cyanuric acid and salt target ranges, and every dosing formula\'s product-concentration assumptions, have not been independently verified against a primary source --',
    'Los rangos objetivo de pH, cloro libre, alcalinidad total y dureza cálcica utilizados por esta calculadora cuentan con el respaldo de las fuentes a continuación. Sus rangos objetivo de ácido cianúrico y sal, y los supuestos de concentración de producto de cada fórmula de dosificación, no han sido verificados de forma independiente contra una fuente primaria;',
  ],
  // Inline JS display-text (calculation logic itself is never touched)
  [
    "type === 'hotTub'\n          ? 'Hot tubs: Chlorine 3–5 ppm, pH 7.2–7.8. You can override below.'\n          : 'Pools: Chlorine 1–3 ppm, pH 7.2–7.6. You can override below.';",
    "type === 'hotTub'\n          ? 'Spas: Cloro 3–5 ppm, pH 7.2–7.8. Puede modificar estos valores abajo.'\n          : 'Piscinas: Cloro 1–3 ppm, pH 7.2–7.6. Puede modificar estos valores abajo.';",
  ],
  ["var daily = ['Check chlorine', 'Check pH'];", "var daily = ['Revisar el cloro', 'Revisar el pH'];"],
  ["var weekly = ['Clean skimmer', 'Test alkalinity', 'Adjust chemicals as needed'];", "var weekly = ['Limpiar el skimmer', 'Analizar la alcalinidad', 'Ajustar los productos químicos según sea necesario'];"],
  ["var monthly = ['Clean filter', 'Full water test', 'Balance water'];", "var monthly = ['Limpiar el filtro', 'Análisis completo del agua', 'Equilibrar el agua'];"],
  ["daily.push('Add chlorine if needed');", "daily.push('Agregar cloro si es necesario');"],
  ["weekly.push('Backwash/clean filter');", "weekly.push('Retrolavar/limpiar el filtro');"],
  ["weekly = ['Clean skimmer', 'Test alkalinity'];", "weekly = ['Limpiar el skimmer', 'Analizar la alcalinidad'];"],
  ["html += '<li><strong>Daily</strong> ' + daily.join('; ') + '</li>';", "html += '<li><strong>Diario</strong> ' + daily.join('; ') + '</li>';"],
  ["html += '<li><strong>Weekly</strong> ' + weekly.join('; ') + '</li>';", "html += '<li><strong>Semanal</strong> ' + weekly.join('; ') + '</li>';"],
  ["html += '<li><strong>Monthly</strong> ' + monthly.join('; ') + '</li>';", "html += '<li><strong>Mensual</strong> ' + monthly.join('; ') + '</li>';"],
  [
    "outputContent.innerHTML = '<p>Please enter a valid volume in gallons.</p>';",
    "outputContent.innerHTML = '<p>Ingrese un volumen válido en galones.</p>';",
  ],
  [
    "var label = type === 'hotTub' ? 'hot tub' : 'pool';\n        var lines = [];\n        lines.push('For a ' + Math.round(gallons).toLocaleString() + ' gallon ' + label + ':');",
    "var label = type === 'hotTub' ? 'un spa' : 'una piscina';\n        var lines = [];\n        lines.push('Para ' + label + ' de ' + Math.round(gallons).toLocaleString() + ' galones:');",
  ],
  [
    "lines.push('Add: ' + tablets + ' chlorine tablet(s) (approx ' + chlorineOz.toFixed(1) + ' oz equivalent)');",
    "lines.push('Agregar: ' + tablets + ' tableta(s) de cloro (aprox. ' + chlorineOz.toFixed(1) + ' oz equivalentes)');",
  ],
  [
    "lines.push('Add: ' + chlorineOz.toFixed(1) + ' oz liquid chlorine');",
    "lines.push('Agregar: ' + chlorineOz.toFixed(1) + ' oz de cloro líquido');",
  ],
  [
    "var granularLine = 'Add: ' + chlorineOz.toFixed(1) + ' oz ' + granularResult.product.label;",
    "var granularLine = 'Agregar: ' + chlorineOz.toFixed(1) + ' oz de ' + granularResult.product.label;",
  ],
  [
    "lines.push('Chlorine is in range. No chlorine addition needed.');",
    "lines.push('El cloro está dentro del rango. No se necesita agregar cloro.');",
  ],
  [
    "var PH_MAGNITUDE_TEXT = { small: 'a small adjustment', moderate: 'a moderate adjustment', substantial: 'a substantial adjustment' };",
    "var PH_MAGNITUDE_TEXT = { small: 'un ajuste pequeño', moderate: 'un ajuste moderado', substantial: 'un ajuste sustancial' };",
  ],
  [
    "lines.push('pH needs to be raised (' + PH_MAGNITUDE_TEXT[phGuidance.magnitude] + '): add pH increaser per the product label, a little at a time, and retest 30–60 minutes after each addition.');",
    "lines.push('El pH debe elevarse (' + PH_MAGNITUDE_TEXT[phGuidance.magnitude] + '): agregue elevador de pH según la etiqueta del producto, poco a poco, y vuelva a analizar 30–60 minutos después de cada adición.');",
  ],
  [
    "lines.push('pH needs to be lowered (' + PH_MAGNITUDE_TEXT[phGuidance.magnitude] + '): add pH reducer per the product label, a little at a time, and retest 30–60 minutes after each addition.');",
    "lines.push('El pH debe reducirse (' + PH_MAGNITUDE_TEXT[phGuidance.magnitude] + '): agregue reductor de pH según la etiqueta del producto, poco a poco, y vuelva a analizar 30–60 minutos después de cada adición.');",
  ],
  ["if (type === 'hotTub') lines.push('Run jets for 20 minutes.');", "if (type === 'hotTub') lines.push('Haga funcionar los chorros durante 20 minutos.');"],
  ["lines.push('Re-test water after 20–30 minutes.');", "lines.push('Vuelva a analizar el agua después de 20–30 minutos.');"],
  [
    "var type = waterType.value === 'hotTub' ? 'Hot Tub / Spa' : 'Swimming Pool';",
    "var type = waterType.value === 'hotTub' ? 'Spa / Jacuzzi' : 'Piscina';",
  ],
  [
    "recommendations: recHtml || 'Complete the calculator for chemical recommendations.',",
    "recommendations: recHtml || 'Complete la calculadora para obtener recomendaciones químicas.',",
  ],
];

const POOL_VOLUME_CALCULATOR = [
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  VERY_HIGH_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/pool-volume-calculator" class="calc-card calc-card--active">Pool Volume Calculator</a>', '<a href="/es/calculators/pool-volume-calculator" class="calc-card calc-card--active">Calculadora de Volumen de Piscina</a>'],
  ['Pool Volume Calculator (calculators) | WaterBalanceTools', 'Calculadora de Volumen de Piscina (calculators) | WaterBalanceTools'],
  ['Pool volume calculator. Rectangular, circular, and oval shapes. Get gallons and liters. Free and fast.', 'Calculadora de volumen de piscina. Formas rectangular, circular y ovalada. Obtenga galones y litros. Gratis y rápida.'],
  ['Pool Volume Calculator | WaterBalanceTools', 'Calculadora de Volumen de Piscina | WaterBalanceTools'],
  ['Calculate pool volume in gallons and liters for rectangular, circular, and oval pools.', 'Calcule el volumen de la piscina en galones y litros para piscinas rectangulares, circulares y ovaladas.'],
  ['"name":"Pool Volume Calculator"', '"name":"Calculadora de Volumen de Piscina"'],
  ['Pool Volume Calculator</span>', 'Calculadora de Volumen de Piscina</span>'],
  ['<h1>Pool Volume Calculator</h1>', '<h1>Calculadora de Volumen de Piscina</h1>'],
  ['Calculate pool volume in gallons and liters. Rectangular, circular, or oval.', 'Calcule el volumen de la piscina en galones y litros. Rectangular, circular u ovalada.'],
  ['<label for="shape">Shape</label>', '<label for="shape">Forma</label>'],
  ['>Rectangular<', '>Rectangular<'],
  ['>Circular<', '>Circular<'],
  ['>Oval<', '>Ovalada<'],
  ['<h2>Rectangular</h2>', '<h2>Rectangular</h2>'],
  ['<label for="length">Length (ft)</label>', '<label for="length">Longitud (pies)</label>'],
  ['<label for="width">Width (ft)</label>', '<label for="width">Ancho (pies)</label>'],
  ['<label for="shallow">Shallow depth (ft)</label>', '<label for="shallow">Profundidad mínima (pies)</label>'],
  ['<label for="deep">Deep depth (ft)</label>', '<label for="deep">Profundidad máxima (pies)</label>'],
  ['<h2>Circular</h2>', '<h2>Circular</h2>'],
  ['<label for="diameter">Diameter (ft)</label>', '<label for="diameter">Diámetro (pies)</label>'],
  ['<label for="depth-circ">Depth (ft)</label>', '<label for="depth-circ">Profundidad (pies)</label>'],
  ['<h2>Oval</h2>', '<h2>Ovalada</h2>'],
  ['<label for="length-oval">Length (ft)</label>', '<label for="length-oval">Longitud (pies)</label>'],
  ['<label for="width-oval">Width (ft)</label>', '<label for="width-oval">Ancho (pies)</label>'],
  ['<label for="depth-oval">Depth (ft)</label>', '<label for="depth-oval">Profundidad (pies)</label>'],
  ['Use in Chemical Calculator', 'Usar en la Calculadora Química'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['Measure length, width, and depth in feet. For variable depth, use shallow and deep end average.', 'Mida la longitud, el ancho y la profundidad en pies. Para profundidad variable, use el promedio entre el extremo poco profundo y el profundo.'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine dose for 10,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Dosis de cloro para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Lower pool pH 8.0 → 7.5</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Bajar el pH de la piscina 8.0 → 7.5</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../reference/chemical-compatibility.html">Chemical Compatibility</a></li>', '<li><a href="../reference/chemical-compatibility.html">Compatibilidad Química</a></li>'],
  ['<li><a href="../reference/chemical-conversion-tables.html">Chemical Conversion Tables</a></li>', '<li><a href="../reference/chemical-conversion-tables.html">Tablas de Conversión Química</a></li>'],
  ['<li><a href="../reference/chemical-safety.html">Chemical Safety</a></li>', '<li><a href="../reference/chemical-safety.html">Seguridad Química</a></li>'],
  ['<li><a href="../reference/chemical-storage-guide.html">Chemical Storage Guide</a></li>', '<li><a href="../reference/chemical-storage-guide.html">Guía de Almacenamiento Químico</a></li>'],
  ['<li><a href="../reference/common-pool-chemistry-mistakes.html">Common Pool Chemistry Mistakes</a></li>', '<li><a href="../reference/common-pool-chemistry-mistakes.html">Errores Comunes de Química de Piscina</a></li>'],
  ['<li><a href="../guides/ph/does-rain-lower-pool-ph.html">Does Rain Lower Pool Ph</a></li>', '<li><a href="../guides/ph/does-rain-lower-pool-ph.html">La lluvia reduce el pH de la piscina</a></li>'],
  ['<li><a href="../reference/total-alkalinity-explained.html">Total Alkalinity Explained</a></li>', '<li><a href="../reference/total-alkalinity-explained.html">Alcalinidad Total Explicada</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/pool-chemistry-basics.html">Pool chemistry basics (hub)</a></li>', '<li><a href="../guides/pool-chemistry-basics.html">Fundamentos de química de piscina (guía central)</a></li>'],
  [
    '<em>Volume formulas use exact ft³-to-gallon conversion factor (7.48051948) from conversion-factors.json.</em>',
    '<em>Las fórmulas de volumen usan el factor de conversión exacto de ft³ a galones (7.48051948) de conversion-factors.json.</em>',
  ],
  // Inline JS display-text
  ["document.getElementById('result-gallons').textContent = 'Enter valid dimensions.';", "document.getElementById('result-gallons').textContent = 'Ingrese dimensiones válidas.';"],
  [
    "document.getElementById('result-gallons').textContent = 'Volume: ' + Math.round(r.gallons).toLocaleString() + ' gallons';",
    "document.getElementById('result-gallons').textContent = 'Volumen: ' + Math.round(r.gallons).toLocaleString() + ' galones';",
  ],
  [
    "document.getElementById('result-liters').textContent = 'Volume: ' + Math.round(r.liters).toLocaleString() + ' liters';",
    "document.getElementById('result-liters').textContent = 'Volumen: ' + Math.round(r.liters).toLocaleString() + ' litros';",
  ],
];

const POOL_CHLORINE_CALCULATOR = [
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/pool-chlorine-calculator" class="calc-card calc-card--active">Pool Chlorine Calculator</a>', '<a href="/es/calculators/pool-chlorine-calculator" class="calc-card calc-card--active">Calculadora de Cloro para Piscina</a>'],
  ['>Liquid chlorine (10%)<', '>Cloro líquido (10%)<'],
  SOURCES_HEADING,
  GOV_AUTHORITY_LABEL,
  SEE_ASSUMPTIONS_LINK,
  ['Pool Chlorine Calculator (Oz by Volume) | WaterBalanceTools', 'Calculadora de Cloro para Piscina (Oz por Volumen) | WaterBalanceTools'],
  [
    'Pool chlorine calculator: gallons + ppm in → exact liquid or granular ounces out. For pH, alkalinity, and combined dosing, use the main Pool Chemical Calcula...',
    'Calculadora de cloro para piscina: galones + ppm → onzas exactas de cloro líquido o granular. Para pH, alcalinidad y dosificación combinada, use la Calculadora Química principal...',
  ],
  [
    'Pool chlorine calculator for dose by gallons and test readings. Full water balance: use the main Pool Chemical Calculator.',
    'Calculadora de cloro para piscina, dosis según galones y resultados de pruebas. Balance completo del agua: use la Calculadora Química principal.',
  ],
  ['"name":"Pool Chlorine Calculator"', '"name":"Calculadora de Cloro para Piscina"'],
  ['"description":"Calculate the exact chlorine dose required for your swimming pool."', '"description":"Calcule la dosis exacta de cloro necesaria para su piscina."'],
  [
    '"name":"How much chlorine should I add to my pool?","acceptedAnswer":{"@type":"Answer","text":"Most pools should maintain 1 to 3 ppm chlorine. Test 2–3 times per week."}',
    '"name":"¿Cuánto cloro debo agregar a mi piscina?","acceptedAnswer":{"@type":"Answer","text":"La mayoría de las piscinas deben mantener entre 1 y 3 ppm de cloro. Analice 2–3 veces por semana."}',
  ],
  [
    '"name":"What is the ideal chlorine level?","acceptedAnswer":{"@type":"Answer","text":"For pools aim for 1–3 ppm; for hot tubs 3–5 ppm."}',
    '"name":"¿Cuál es el nivel ideal de cloro?","acceptedAnswer":{"@type":"Answer","text":"Para piscinas, apunte a 1–3 ppm; para spas, 3–5 ppm."}',
  ],
  ['"name":"Pool Chlorine Calculator","item"', '"name":"Calculadora de Cloro para Piscina","item"'],
  ['<h1>Pool Chlorine Calculator</h1>', '<h1>Calculadora de Cloro para Piscina</h1>'],
  ['Calculate exactly how much chlorine your pool needs.', 'Calcule exactamente cuánto cloro necesita su piscina.'],
  ['<label for="volume">Pool volume (gallons)</label>', '<label for="volume">Volumen de la piscina (galones)</label>'],
  ['<label for="current">Current chlorine (ppm)</label>', '<label for="current">Cloro actual (ppm)</label>'],
  ['<label for="target">Target chlorine (ppm)</label>', '<label for="target">Cloro objetivo (ppm)</label>'],
  ['<label for="type">Chlorine type</label>', '<label for="type">Tipo de cloro</label>'],
  ['>Granular shock<', '>Choque granular<'],
  ['>Chlorine tablets<', '>Tabletas de cloro<'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal chlorine level for pools:</strong> 1–3 ppm. Test 2–3 times per week and add chlorine as needed.', '<strong>Nivel ideal de cloro para piscinas:</strong> 1–3 ppm. Analice 2–3 veces por semana y agregue cloro según sea necesario.'],
  ['<h2>Frequently Asked Questions</h2>', '<h2>Preguntas Frecuentes</h2>'],
  ['<summary>How much chlorine should I add to my pool?</summary>\n      <p>Most pools should maintain 1 to 3 ppm chlorine. Test 2–3 times per week.</p>',
   '<summary>¿Cuánto cloro debo agregar a mi piscina?</summary>\n      <p>La mayoría de las piscinas deben mantener entre 1 y 3 ppm de cloro. Analice 2–3 veces por semana.</p>'],
  ['<summary>What is the ideal chlorine level?</summary>\n      <p>For pools aim for 1–3 ppm; for hot tubs 3–5 ppm.</p>',
   '<summary>¿Cuál es el nivel ideal de cloro?</summary>\n      <p>Para piscinas, apunte a 1–3 ppm; para spas, 3–5 ppm.</p>'],
  ['<li><a href="/reference/pool-chemistry-reference">Pool chemistry reference</a></li>', '<li><a href="/reference/pool-chemistry-reference">Referencia de química de piscina</a></li>'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-15000-gallon-pool.html">Chlorine dose for 15,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-15000-gallon-pool.html">Dosis de cloro para 15,000 gal</a></li>'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">High chlorine: lower safely</a></li>', '<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">Cloro alto: cómo bajarlo con seguridad</a></li>'],
  ['<li><a href="../comparisons/chlorine-vs-bromine.html">Chlorine Vs Bromine</a></li>', '<li><a href="../comparisons/chlorine-vs-bromine.html">Cloro vs. Bromo</a></li>'],
  ['<li><a href="../comparisons/free-chlorine-vs-total-chlorine.html">Free Chlorine Vs Total Chlorine</a></li>', '<li><a href="../comparisons/free-chlorine-vs-total-chlorine.html">Cloro Libre vs. Cloro Total</a></li>'],
  ['<li><a href="../comparisons/liquid-chlorine-vs-tablets.html">Liquid Chlorine Vs Tablets</a></li>', '<li><a href="../comparisons/liquid-chlorine-vs-tablets.html">Cloro Líquido vs. Tabletas</a></li>'],
  ['<li><a href="../comparisons/pool-shock-vs-chlorine.html">Pool Shock Vs Chlorine</a></li>', '<li><a href="../comparisons/pool-shock-vs-chlorine.html">Choque vs. Cloro</a></li>'],
  ['<li><a href="../comparisons/salt-water-pool-vs-chlorine-pool.html">Salt Water Pool Vs Chlorine Pool</a></li>', '<li><a href="../comparisons/salt-water-pool-vs-chlorine-pool.html">Piscina de Agua Salada vs. Piscina de Cloro</a></li>'],
  ['<li><a href="pool-cyanuric-acid-calculator.html">Pool Cyanuric Acid Calculator</a></li>', '<li><a href="pool-cyanuric-acid-calculator.html">Calculadora de Ácido Cianúrico para Piscina</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué es la alcalinidad de la piscina</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/chlorine-guide.html">Chlorine guide (hub)</a></li>', '<li><a href="../guides/chlorine-guide.html">Guía de cloro (guía central)</a></li>'],
  [
    '<em>Target range (1-3 ppm / 2-4 ppm with CYA) is CDC-supported. Dosage coefficient from dosage-matrices.json is not independently verified against a manufacturer/regulatory reference.</em>',
    '<em>El rango objetivo (1-3 ppm / 2-4 ppm con ácido cianúrico) cuenta con el respaldo de los CDC. El coeficiente de dosificación de dosage-matrices.json no está verificado de forma independiente contra una referencia de fabricante/regulatoria.</em>',
  ],
  [
    'The target range this calculator doses toward (1-3 ppm, or 2-4 ppm with cyanuric acid) is supported by the sources below. The dosing formula\'s product-concentration assumptions have not been independently verified against a specific manufacturer reference --',
    'El rango objetivo hacia el que dosifica esta calculadora (1-3 ppm, o 2-4 ppm con ácido cianúrico) cuenta con el respaldo de las fuentes a continuación. Los supuestos de concentración de producto de la fórmula de dosificación no han sido verificados de forma independiente contra una referencia específica de fabricante;',
  ],
  // Inline JS display-text
  ["if (!g || parseFloat(g) <= 0) { text.textContent = 'Enter a valid pool volume.'; el.classList.remove('hidden'); return; }",
   "if (!g || parseFloat(g) <= 0) { text.textContent = 'Ingrese un volumen de piscina válido.'; el.classList.remove('hidden'); return; }"],
  ["if (r.ppm <= 0) { text.textContent = 'Target must be higher than current chlorine. No addition needed.'; el.classList.remove('hidden'); return; }",
   "if (r.ppm <= 0) { text.textContent = 'El objetivo debe ser mayor que el cloro actual. No se necesita agregar cloro.'; el.classList.remove('hidden'); return; }"],
  ["text.textContent = 'Add ' + r.ounces.toFixed(1) + ' oz chlorine to reach your target. Re-test after 30 minutes.';",
   "text.textContent = 'Agregue ' + r.ounces.toFixed(1) + ' oz de cloro para alcanzar su objetivo. Vuelva a analizar después de 30 minutos.';"],
];

const POOL_PH_CALCULATOR = [
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  MODERATE_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/pool-ph-calculator" class="calc-card calc-card--active">Pool pH Calculator</a>', '<a href="/es/calculators/pool-ph-calculator" class="calc-card calc-card--active">Calculadora de pH para Piscina</a>'],
  SOURCES_HEADING,
  GOV_AUTHORITY_LABEL,
  ['Pool pH Calculator (Target 7.2–7.6) | WaterBalanceTools', 'Calculadora de pH para Piscina (Objetivo 7.2–7.6) | WaterBalanceTools'],
  [
    "Find out whether to raise or lower your pool's pH and by how much (small, moderate, or substantial adjustment)—plus safe, incremental dosing guidance.",
    'Descubra si debe subir o bajar el pH de su piscina y en qué medida (ajuste pequeño, moderado o sustancial), además de orientación segura para la dosificación incremental.',
  ],
  [
    'Get pH direction and adjustment-size guidance from your gallons and test readings, plus safe incremental dosing steps.',
    'Obtenga la dirección del pH y orientación sobre la magnitud del ajuste a partir de sus galones y resultados de pruebas, además de pasos seguros de dosificación incremental.',
  ],
  ['"name":"Pool pH Calculator"', '"name":"Calculadora de pH para Piscina"'],
  ['"description":"Get pH direction and adjustment-size guidance from your gallons and test readings, plus safe incremental dosing steps."', '"description":"Obtenga la dirección del pH y orientación sobre la magnitud del ajuste a partir de sus galones y resultados de pruebas, además de pasos seguros de dosificación incremental."'],
  ['Pool pH Calculator</span>', 'Calculadora de pH para Piscina</span>'],
  [
    "Find out whether to raise or lower your pool's pH and by how much—plus safe, incremental dosing guidance.",
    'Descubra si debe subir o bajar el pH de su piscina y en qué medida, además de orientación segura para la dosificación incremental.',
  ],
  ['<h1>Pool pH Calculator</h1>', '<h1>Calculadora de pH para Piscina</h1>'],
  ["Find out whether your pool's pH needs to go up or down, and roughly by how much.", 'Descubra si el pH de su piscina necesita subir o bajar, y aproximadamente en qué medida.'],
  ['<label for="volume">Pool gallons</label>', '<label for="volume">Galones de la piscina</label>'],
  ['<label for="current">Current pH</label>', '<label for="current">pH actual</label>'],
  ['<label for="target">Target pH</label>', '<label for="target">pH objetivo</label>'],
  ['<strong>Safe pH:</strong> 7.2–7.6', '<strong>pH seguro:</strong> 7.2–7.6'],
  ['<strong>Alkalinity:</strong> 80–120 ppm', '<strong>Alcalinidad:</strong> 80–120 ppm'],
  ['Calculator updated monthly', 'Calculadora actualizada mensualmente'],
  ['<strong>Reference:</strong> <a href="/pool-ph-levels-chart">Pool pH Levels Chart</a>', '<strong>Referencia:</strong> <a href="/pool-ph-levels-chart">Tabla de Niveles de pH de Piscina</a>'],
  ['<h2>Quick Answers</h2>', '<h2>Respuestas Rápidas</h2>'],
  ['<h3>What is ideal pool pH?</h3><p>Most pools should stay between 7.2 and 7.6. In this range chlorine works better, water feels comfortable, and equipment is less likely to scale or corrode.</p>',
   '<h3>¿Cuál es el pH ideal de la piscina?</h3><p>La mayoría de las piscinas deben mantenerse entre 7.2 y 7.6. En este rango, el cloro funciona mejor, el agua se siente más cómoda y el equipo tiene menos probabilidades de incrustarse o corroerse.</p>'],
  ['<h3>How often should I test pool pH?</h3><p>Test pH 2–3 times per week when the pool is in use. Retest 30–60 minutes after any increaser or reducer dose before making another adjustment.</p>',
   '<h3>¿Con qué frecuencia debo analizar el pH de la piscina?</h3><p>Analice el pH 2–3 veces por semana cuando la piscina esté en uso. Vuelva a analizar 30–60 minutos después de cualquier dosis de elevador o reductor antes de hacer otro ajuste.</p>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal pool pH:</strong> 7.2–7.6. Low pH damages equipment; high pH reduces chlorine effectiveness.', '<strong>pH ideal de la piscina:</strong> 7.2–7.6. Un pH bajo daña el equipo; un pH alto reduce la eficacia del cloro.'],
  ['<h2>People Also Ask</h2>', '<h2>Preguntas Frecuentes de Otros Usuarios</h2>'],
  ['<summary>Why does pH rise after rain?</summary>\n        <p>Rain is often slightly acidic but can carry dust and alkalinity that push pH up over time, especially with aeration. Test after storms; adjust in small steps rather than guessing from rainfall alone.</p>',
   '<summary>¿Por qué sube el pH después de la lluvia?</summary>\n        <p>La lluvia suele ser ligeramente ácida, pero puede arrastrar polvo y alcalinidad que elevan el pH con el tiempo, especialmente con aireación. Analice después de las tormentas; ajuste en pasos pequeños en lugar de adivinar solo por la lluvia.</p>'],
  ['<summary>Can swimmers affect pool pH?</summary>\n        <p>Yes—sweat, sunscreen, and oils can lower pH and consume alkalinity. Heavy bather loads often need more frequent testing and smaller chemical corrections after parties.</p>',
   '<summary>¿Los nadadores pueden afectar el pH de la piscina?</summary>\n        <p>Sí: el sudor, el protector solar y los aceites pueden bajar el pH y consumir alcalinidad. Un uso intenso a menudo requiere pruebas más frecuentes y correcciones químicas más pequeñas después de fiestas.</p>'],
  ['<summary>What lowers pH naturally?</summary>\n        <p>Carbon dioxide from aeration and organic acids can slowly lower pH. Do not rely on “natural” drift—test and use measured increaser or reducer amounts for your pool volume.</p>',
   '<summary>¿Qué baja el pH de forma natural?</summary>\n        <p>El dióxido de carbono de la aireación y los ácidos orgánicos pueden bajar el pH lentamente. No confíe en la deriva "natural": analice y use cantidades medidas de elevador o reductor según el volumen de su piscina.</p>'],
  ['<summary>Does alkalinity affect pH?</summary>\n        <p>Total alkalinity buffers pH. Low alkalinity causes pH to bounce; high alkalinity can lock pH high. Stabilize alkalinity in the 80–120 ppm range before large pH moves when possible.</p>',
   '<summary>¿La alcalinidad afecta el pH?</summary>\n        <p>La alcalinidad total amortigua el pH. Una alcalinidad baja hace que el pH fluctúe; una alcalinidad alta puede mantener el pH fijo en un nivel alto. Estabilice la alcalinidad en el rango de 80–120 ppm antes de grandes cambios de pH cuando sea posible.</p>'],
  ['<summary>Why does pool pH keep drifting high?</summary>\n        <p>Salt cells, liquid chlorine, and aeration can raise pH over time. High alkalinity and plaster sources also push pH up—test weekly and correct both pH and alkalinity, not just acid doses.</p>',
   '<summary>¿Por qué el pH de la piscina sigue subiendo?</summary>\n        <p>Las células de sal, el cloro líquido y la aireación pueden elevar el pH con el tiempo. La alcalinidad alta y las fuentes de yeso también elevan el pH: analice semanalmente y corrija tanto el pH como la alcalinidad, no solo con dosis de ácido.</p>'],
  ['<summary>Can I swim if pH is 8.0?</summary>\n        <p>pH 8.0 is above the usual 7.2–7.6 comfort band and can reduce chlorine performance. Many owners lower pH before swimming; follow your test kit and local health guidance.</p>',
   '<summary>¿Puedo nadar si el pH es 8.0?</summary>\n        <p>Un pH de 8.0 está por encima del rango de comodidad habitual de 7.2–7.6 y puede reducir el rendimiento del cloro. Muchos propietarios bajan el pH antes de nadar; siga su kit de pruebas y las pautas locales de salud.</p>'],
  ['<li><a href="/reference/pool-chemistry-reference">Pool chemistry reference</a></li>', '<li><a href="/reference/pool-chemistry-reference">Referencia de química de piscina</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Adjust pool pH 7.8 → 7.4</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Ajustar el pH de la piscina 7.8 → 7.4</a></li>'],
  ['<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Why pH affects chlorine</a></li>', '<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Por qué el pH afecta al cloro</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Low alkalinity symptoms</a></li>', '<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Síntomas de alcalinidad baja</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-to-7-4.html">Adjust pH 7 → 7.4</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-to-7-4.html">Ajustar pH 7 → 7.4</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Adjust pH 8 → 7.5</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Ajustar pH 8 → 7.5</a></li>'],
  ['<li><a href="../reference/ph-table.html">Ph Table</a></li>', '<li><a href="../reference/ph-table.html">Tabla de pH</a></li>'],
  ['<li><a href="hot-tub-ph-calculator.html">Hot tub pH calculator</a></li>', '<li><a href="hot-tub-ph-calculator.html">Calculadora de pH para spa</a></li>'],
  ['<li><a href="pool-cyanuric-acid-calculator.html">Pool Cyanuric Acid Calculator</a></li>', '<li><a href="pool-cyanuric-acid-calculator.html">Calculadora de Ácido Cianúrico para Piscina</a></li>'],
  ['<li><a href="pool-alkalinity-calculator.html">Pool alkalinity calculator</a></li>', '<li><a href="pool-alkalinity-calculator.html">Calculadora de alcalinidad de piscina</a></li>'],
  ['<li><a href="hot-tub-chlorine-calculator.html">Hot tub chlorine calculator</a></li>', '<li><a href="hot-tub-chlorine-calculator.html">Calculadora de cloro para spa</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/ph-guide.html">pH guide (hub)</a></li>', '<li><a href="../guides/ph-guide.html">Guía de pH (guía central)</a></li>'],
  [
    '<em>Provides pH direction and a qualitative adjustment-size (small/moderate/substantial) based on how far current pH is from target -- it does NOT calculate a chemical dose. A precise dose depends on total alkalinity, cyanuric acid, and product concentration, none of which this tool collects (see reports/phase-7t/PH-AUDIT.md and reports/phase-7u/PH-ARCHITECTURE-DECISION.md). Use the recommended product\'s label instructions, add incrementally, and retest 30-60 minutes after each addition before adding more.</em>',
    '<em>Proporciona la dirección del pH y una magnitud de ajuste cualitativa (pequeño/moderado/sustancial) según qué tan lejos esté el pH actual del objetivo; NO calcula una dosis química. Una dosis precisa depende de la alcalinidad total, el ácido cianúrico y la concentración del producto, ninguno de los cuales recopila esta herramienta (consulte reports/phase-7t/PH-AUDIT.md y reports/phase-7u/PH-ARCHITECTURE-DECISION.md). Siga las instrucciones de la etiqueta del producto recomendado, agregue de forma incremental y vuelva a analizar 30-60 minutos después de cada adición antes de agregar más.</em>',
  ],
  [
    'The target range this calculator adjusts toward (7.0-7.8, commonly 7.2-7.6) is supported by the source below. The dosing formula is already disclosed in the UI as a simplified estimation that does not account for total alkalinity\'s buffering effect.',
    'El rango objetivo hacia el que ajusta esta calculadora (7.0-7.8, comúnmente 7.2-7.6) cuenta con el respaldo de la fuente a continuación. La fórmula de dosificación ya se indica en la interfaz como una estimación simplificada que no tiene en cuenta el efecto amortiguador de la alcalinidad total.',
  ],
  // Inline JS display-text
  ["var MAGNITUDE_TEXT = { small: 'a small adjustment', moderate: 'a moderate adjustment', substantial: 'a substantial adjustment' };",
   "var MAGNITUDE_TEXT = { small: 'un ajuste pequeño', moderate: 'un ajuste moderado', substantial: 'un ajuste sustancial' };"],
  ["if (!r.valid) { text.textContent = 'Enter valid pool gallons.'; el.classList.remove('hidden'); return; }",
   "if (!r.valid) { text.textContent = 'Ingrese galones de piscina válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.direction === 'balanced') { text.textContent = 'Your pH is already at (or very close to) your target. No adjustment is indicated.'; el.classList.remove('hidden'); return; }",
   "if (r.direction === 'balanced') { text.textContent = 'Su pH ya está en (o muy cerca de) su objetivo. No se indica ningún ajuste.'; el.classList.remove('hidden'); return; }"],
  ["var verb = r.direction === 'raise' ? 'raised' : 'lowered';",
   "var verb = r.direction === 'raise' ? 'elevado' : 'reducido';"],
  ["var product = r.direction === 'raise' ? 'pH increaser' : 'pH reducer';",
   "var product = r.direction === 'raise' ? 'elevador de pH' : 'reductor de pH';"],
  [
    "text.textContent = 'pH needs to be ' + verb + ' (' + MAGNITUDE_TEXT[r.magnitude] + '). Add ' + product + ' per the product label’s instructions, a little at a time. Retest 30–60 minutes after each addition before adding more.';",
    "text.textContent = 'El pH debe ser ' + verb + ' (' + MAGNITUDE_TEXT[r.magnitude] + '). Agregue ' + product + ' según las instrucciones de la etiqueta del producto, poco a poco. Vuelva a analizar 30–60 minutos después de cada adición antes de agregar más.';",
  ],
];

const POOL_SHOCK_CALCULATOR = [
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/pool-shock-calculator" class="calc-card calc-card--active">Pool Shock Calculator</a>', '<a href="/es/calculators/pool-shock-calculator" class="calc-card calc-card--active">Calculadora de Choque para Piscina</a>'],
  ['Pool Shock Calculator (Product-Specific Dose) | WaterBalanceTools', 'Calculadora de Choque para Piscina (Dosis por Producto) | WaterBalanceTools'],
  [
    'Pool shock calculator: select your shock product (liquid, cal-hypo, dichlor, or trichlor) for a product-specific dose from gallons + target ppm (5–20). For c...',
    'Calculadora de choque para piscina: seleccione su producto de choque (líquido, hipoclorito de calcio, dicloro o tricloro) para una dosis específica según galones + ppm objetivo (5–20). Para c...',
  ],
  [
    'Pool shock calculator: product-specific ounces by volume, ppm raise, and shock product. Full water balance: main Pool Chemical Calculator.',
    'Calculadora de choque para piscina: onzas específicas del producto según volumen, aumento en ppm y producto de choque. Balance completo del agua: Calculadora Química principal.',
  ],
  ['"name":"Pool Shock Calculator"', '"name":"Calculadora de Choque para Piscina"'],
  [
    '"description":"Pool shock calculator: product-specific ounces by volume, ppm raise, and shock product."',
    '"description":"Calculadora de choque para piscina: onzas específicas del producto según volumen, aumento en ppm y producto de choque."',
  ],
  ['Pool Shock Calculator</span>', 'Calculadora de Choque para Piscina</span>'],
  [
    'Pool shock calculator: select your shock product for a product-specific dose from gallons + target ppm. For combined chlorine, pH, and alkalinity dosing, use the main Pool Chemical ...',
    'Calculadora de choque para piscina: seleccione su producto de choque para una dosis específica según galones + ppm objetivo. Para dosificación combinada de cloro, pH y alcalinidad, use la Calculadora Química principal.',
  ],
  ['<h1>Pool Shock Calculator</h1>', '<h1>Calculadora de Choque para Piscina</h1>'],
  ['Calculate how much shock your pool needs based on volume, shock strength, and product.', 'Calcule cuánto choque necesita su piscina según el volumen, la intensidad del choque y el producto.'],
  ['<label for="volume">Pool gallons</label>', '<label for="volume">Galones de la piscina</label>'],
  ['<label for="strength">Shock strength (target ppm increase)</label>', '<label for="strength">Intensidad del choque (aumento objetivo en ppm)</label>'],
  ['>Light (5 ppm)<', '>Ligero (5 ppm)<'],
  ['>Standard (10 ppm)<', '>Estándar (10 ppm)<'],
  ['>Heavy (15 ppm)<', '>Intenso (15 ppm)<'],
  ['>Double shock (20 ppm)<', '>Doble choque (20 ppm)<'],
  ['<label for="product">Shock product</label>', '<label for="product">Producto de choque</label>'],
  ['>Liquid Chlorine (10%)<', '>Cloro Líquido (10%)<'],
  ['>Liquid Chlorine (12.5%)<', '>Cloro Líquido (12.5%)<'],
  ['>Calcium Hypochlorite (65%)<', '>Hipoclorito de Calcio (65%)<'],
  ['>Calcium Hypochlorite (73%)<', '>Hipoclorito de Calcio (73%)<'],
  ['>Sodium Dichlor (56%)<', '>Dicloro de Sodio (56%)<'],
  ['>Trichlor Tablets (90%)<', '>Tabletas de Tricloro (90%)<'],
  ["I don't know my product", 'No sé cuál es mi producto'],
  ['<strong>Shock raise:</strong> often 10–30 ppm (follow label)', '<strong>Aumento por choque:</strong> a menudo 10–30 ppm (siga la etiqueta)'],
  ['<strong>Swim-ready chlorine:</strong> 1–3 ppm', '<strong>Cloro listo para nadar:</strong> 1–3 ppm'],
  ['Calculator updated monthly', 'Calculadora actualizada mensualmente'],
  ['<a href="/pool-chlorine-levels-chart">Chlorine levels chart</a> · <a href="/pool-chemical-levels-chart">Full balance chart</a>', '<a href="/pool-chlorine-levels-chart">Tabla de niveles de cloro</a> · <a href="/pool-chemical-levels-chart">Tabla de balance completo</a>'],
  ['<h2>Quick Answers</h2>', '<h2>Respuestas Rápidas</h2>'],
  ['<h3>How much shock does a pool need?</h3><p>Shock dose depends on gallons and how many ppm you want to raise—often 10–30 ppm for algae or heavy use. Enter volume and target ppm here for granular ounces.</p>',
   '<h3>¿Cuánto choque necesita una piscina?</h3><p>La dosis de choque depende de los galones y de cuántos ppm desea elevar; a menudo 10–30 ppm para algas o uso intenso. Ingrese el volumen y el ppm objetivo aquí para obtener las onzas de granular.</p>'],
  ['<h3>When should I shock my pool?</h3><p>Shock after heavy bather load, visible algae, cloudy water with low chlorine, or when combined chlorine is high. Run the pump and retest before swimming.</p>',
   '<h3>¿Cuándo debo aplicar choque a mi piscina?</h3><p>Aplique choque después de uso intenso, algas visibles, agua turbia con cloro bajo, o cuando el cloro combinado esté alto. Haga funcionar la bomba y vuelva a analizar antes de nadar.</p>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>When to shock:</strong> After heavy use, rain, or if chlorine is low. Run pump for several hours after adding shock. Avoid swimming until chlorine returns to normal (1–3 ppm).',
   '<strong>Cuándo aplicar choque:</strong> Después de uso intenso, lluvia, o si el cloro está bajo. Haga funcionar la bomba varias horas después de agregar el choque. Evite nadar hasta que el cloro vuelva a la normalidad (1–3 ppm).'],
  ['<h2>People Also Ask</h2>', '<h2>Preguntas Frecuentes de Otros Usuarios</h2>'],
  ['<summary>Can you swim after shocking?</summary>\n        <p>Wait until free chlorine falls back to a safe swim range—often 1–3 ppm—and water is clear. Follow product label wait times; retest rather than guessing based on hours alone.</p>',
   '<summary>¿Se puede nadar después de aplicar choque?</summary>\n        <p>Espere hasta que el cloro libre vuelva a un rango seguro para nadar (a menudo 1–3 ppm) y el agua esté clara. Siga los tiempos de espera de la etiqueta del producto; vuelva a analizar en lugar de adivinar solo por las horas transcurridas.</p>'],
  ['<summary>What happens if you over-shock a pool?</summary>\n        <p>Very high chlorine can delay swimming, bleach liners, and irritate skin and eyes. If you overdosed, stop adding product, run the pump with good circulation, and retest every few hours.</p>',
   '<summary>¿Qué sucede si se aplica demasiado choque a una piscina?</summary>\n        <p>Un cloro muy alto puede retrasar el momento de nadar, decolorar el revestimiento e irritar la piel y los ojos. Si sobredosificó, deje de agregar producto, haga funcionar la bomba con buena circulación y vuelva a analizar cada pocas horas.</p>'],
  ['<summary>How long does pool shock take to work?</summary>\n        <p>Oxidation often shows results within hours, but filtration and brushing matter. Run the pump continuously during recovery; cloudy or green water may need 24–72 hours and retesting.</p>',
   '<summary>¿Cuánto tarda en funcionar el choque de la piscina?</summary>\n        <p>La oxidación a menudo muestra resultados en cuestión de horas, pero la filtración y el cepillado importan. Haga funcionar la bomba continuamente durante la recuperación; el agua turbia o verde puede necesitar 24–72 horas y nuevos análisis.</p>'],
  ['<summary>Is shock the same as chlorine?</summary>\n        <p>Shock products are high-strength chlorine or non-chlorine oxidizers. They raise sanitizer quickly to break down waste; daily chlorine keeps routine protection between shocks.</p>',
   '<summary>¿El choque es lo mismo que el cloro?</summary>\n        <p>Los productos de choque son cloro de alta concentración u oxidantes sin cloro. Elevan rápidamente el sanitizante para descomponer los residuos; el cloro diario mantiene la protección rutinaria entre choques.</p>'],
  ['<summary>Should I shock after a party?</summary>\n        <p>Heavy use often warrants shock to clear chloramines and organic load—test combined chlorine first. Shock at dusk when possible so UV does not burn off the dose immediately.</p>',
   '<summary>¿Debo aplicar choque después de una fiesta?</summary>\n        <p>El uso intenso a menudo justifica el choque para eliminar cloraminas y carga orgánica; analice primero el cloro combinado. Aplique el choque al atardecer cuando sea posible para que la radiación UV no consuma la dosis de inmediato.</p>'],
  ['<summary>Why is my pool cloudy after shock?</summary>\n        <p>Dead algae, fine particles, or high pH can cloud water after shock. Keep filtering, brush walls, confirm pH is in range, and retest chlorine—clarifier only helps once chemistry is balanced.</p>',
   '<summary>¿Por qué mi piscina está turbia después del choque?</summary>\n        <p>Las algas muertas, partículas finas o un pH alto pueden enturbiar el agua después del choque. Siga filtrando, cepille las paredes, confirme que el pH esté en rango y vuelva a analizar el cloro; el clarificador solo ayuda una vez que la química está balanceada.</p>'],
  ['<li><a href="/reference/pool-chemistry-reference">Pool chemistry reference</a></li>', '<li><a href="/reference/pool-chemistry-reference">Referencia de química de piscina</a></li>'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/behavior/when-to-add-chlorine.html">When to add chlorine</a></li>', '<li><a href="../programmatic/behavior/when-to-add-chlorine.html">Cuándo agregar cloro</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../guides/questions/why-is-my-pool-green-but-chlorine-is-high.html">Why Is My Pool Green But Chlorine Is</a></li>', '<li><a href="../guides/questions/why-is-my-pool-green-but-chlorine-is-high.html">Por qué mi piscina está verde pero el cloro está alto</a></li>'],
  ['<li><a href="../guides/seasonal/summer-high-chlorine-demand.html">Summer High Chlorine Demand</a></li>', '<li><a href="../guides/seasonal/summer-high-chlorine-demand.html">Alta demanda de cloro en verano</a></li>'],
  ['<li><a href="../programmatic/behavior/how-often-to-shock-pool.html">How Often To Shock Pool</a></li>', '<li><a href="../programmatic/behavior/how-often-to-shock-pool.html">Con qué frecuencia aplicar choque a la piscina</a></li>'],
  ['<li><a href="../programmatic/behavior/when-to-add-chlorine.html">When To Add Chlorine</a></li>', '<li><a href="../programmatic/behavior/when-to-add-chlorine.html">Cuándo agregar cloro</a></li>'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine for 10,000 gal pool</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Cloro para piscina de 10,000 gal</a></li>'],
  ['<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Can You Swim In High Ph Water</a></li>', '<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Se puede nadar en agua con pH alto</a></li>'],
  ['<li><a href="../reference/alkalinity-table.html">Alkalinity Table</a></li>', '<li><a href="../reference/alkalinity-table.html">Tabla de Alcalinidad</a></li>'],
  ['<li><a href="pool-chlorine-calculator.html">Pool chlorine dosing calculator</a></li>', '<li><a href="pool-chlorine-calculator.html">Calculadora de dosis de cloro para piscina</a></li>'],
  ['<li><a href="../guides/chlorine-guide.html">Chlorine guide (hub)</a></li>', '<li><a href="../guides/chlorine-guide.html">Guía de cloro (guía central)</a></li>'],
  [
    '<em>Dose is now product-specific: select a shock product (liquid chlorine, calcium hypochlorite, sodium dichlor, or trichlor) and the calculator applies the approved mass-balance formula (0.013344 x ppm x gallons / available-chlorine%) using that product\'s dataset-verified available-chlorine percentage, plus that product\'s safety notes (mixing hazards, CYA/calcium contribution). This calculator still does not read the user\'s actual combined-chlorine reading and does not compute a breakpoint-chlorination (10x CC) dose -- the preset ppm values (5/10/15/20) are flat target-FC-increase amounts, not breakpoint targets. The "I don\'t know my product" option gives qualitative guidance only, with no numeric dose.</em>',
    '<em>La dosis ahora es específica por producto: seleccione un producto de choque (cloro líquido, hipoclorito de calcio, dicloro de sodio o tricloro) y la calculadora aplica la fórmula de balance de masa aprobada (0.013344 x ppm x galones / % de cloro disponible) usando el porcentaje de cloro disponible de ese producto verificado en el conjunto de datos, más las notas de seguridad de ese producto (riesgos de mezcla, aporte de ácido cianúrico/calcio). Esta calculadora aún no lee la lectura real de cloro combinado del usuario ni calcula una dosis de cloración de ruptura (10x CC); los valores de ppm preestablecidos (5/10/15/20) son aumentos objetivo fijos de cloro libre, no objetivos de ruptura. La opción "No sé cuál es mi producto" ofrece únicamente orientación cualitativa, sin una dosis numérica.</em>',
  ],
  // Inline JS display-text
  ["if (!vol || parseFloat(vol) <= 0) { text.textContent = 'Enter valid pool gallons.'; el.classList.remove('hidden'); return; }",
   "if (!vol || parseFloat(vol) <= 0) { text.textContent = 'Ingrese galones de piscina válidos.'; el.classList.remove('hidden'); return; }"],
  [
    "text.textContent = 'Select your shock product above for a specific amount -- the correct dose varies substantially by product and strength. In general: follow your product label’s instructions, add gradually with the pump running, run the pump 4–6 hours, and re-test before swimming.';",
    "text.textContent = 'Seleccione su producto de choque arriba para obtener una cantidad específica; la dosis correcta varía sustancialmente según el producto y la intensidad. En general: siga las instrucciones de la etiqueta de su producto, agregue gradualmente con la bomba en funcionamiento, haga funcionar la bomba 4–6 horas y vuelva a analizar antes de nadar.';",
  ],
  ["if (!r.valid) { text.textContent = 'Enter valid pool gallons and select a product.'; el.classList.remove('hidden'); return; }",
   "if (!r.valid) { text.textContent = 'Ingrese galones de piscina válidos y seleccione un producto.'; el.classList.remove('hidden'); return; }"],
  [
    "var msg = 'Add ' + r.ounces.toFixed(1) + ' oz (' + r.pounds.toFixed(2) + ' lb) ' + r.product.label + '. Run pump 4–6 hours. Re-test before swimming.';",
    "var msg = 'Agregue ' + r.ounces.toFixed(1) + ' oz (' + r.pounds.toFixed(2) + ' lb) de ' + r.product.label + '. Haga funcionar la bomba 4–6 horas. Vuelva a analizar antes de nadar.';",
  ],
];

// =======================================================================
// Phase 8G: hot-tub/spa cluster. Canonical concept term is "spa" (per
// Phase 8F's terminology model -- this site's hot-tub calculators concern
// a continuously-filtered, chemically-treated vessel, matching "spa", not
// the drain-after-use "bañera/tina de hidromasaje" bathroom fixture).
// "jacuzzi"/"yacusi" are never used as the primary/canonical term here;
// they are reserved as search/lexical variants only (see docs/PHASE-8G-
// SPANISH-SPA-CLUSTER.md Section "page-specific SEO decision" for the
// explicit per-page terminology record required by spec Section 31).
// =======================================================================

const HOT_TUB_CHLORINE_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<a href="/calculators/hot-tub-chlorine-calculator" class="calc-card calc-card--active">Hot Tub Chlorine Calculator</a>', '<a href="/es/calculators/hot-tub-chlorine-calculator" class="calc-card calc-card--active">Calculadora de Cloro para Spa</a>'],
  SOURCES_HEADING,
  GOV_AUTHORITY_LABEL,
  SEE_ASSUMPTIONS_LINK,
  ['>Liquid chlorine (10%)<', '>Cloro líquido (10%)<'],
  ['Hot Tub Chlorine Calculator (30-Second Check) | WaterBalanceTools', 'Calculadora de Cloro para Spa (Revisión de 30 Segundos) | WaterBalanceTools'],
  [
    'Hit 3–5 ppm sanitizer in seconds: enter spa gallons + test strip readings for exact chlorine ounces. Avoid over-chlorination, rash risk, and cover damage.',
    'Alcance 3–5 ppm de sanitizante en segundos: ingrese los galones del spa y los resultados de la tira reactiva para obtener las onzas exactas de cloro. Evite el exceso de cloración, el riesgo de irritación y el daño a la cubierta.',
  ],
  [
    'Hit 3–5 ppm sanitizer in seconds: exact chlorine ounces from gallons + test readings. Safer soaks, fewer chemistry mistakes.',
    'Alcance 3–5 ppm de sanitizante en segundos: onzas exactas de cloro según los galones y los resultados de las pruebas. Baños más seguros, menos errores químicos.',
  ],
  ['"name":"Hot Tub Chlorine Calculator"', '"name":"Calculadora de Cloro para Spa"'],
  ['Hot Tub Chlorine Calculator</span>', 'Calculadora de Cloro para Spa</span>'],
  ['<h1>Hot Tub Chlorine Calculator</h1>', '<h1>Calculadora de Cloro para Spa</h1>'],
  ['Calculate exactly how much chlorine your hot tub needs.', 'Calcule exactamente cuánto cloro necesita su spa.'],
  ['<label for="volume">Hot tub gallons</label>', '<label for="volume">Galones del spa</label>'],
  ['<label for="current">Current chlorine (ppm)</label>', '<label for="current">Cloro actual (ppm)</label>'],
  ['<label for="target">Target chlorine (ppm)</label>', '<label for="target">Cloro objetivo (ppm)</label>'],
  ['<label for="type">Chlorine type</label>', '<label for="type">Tipo de cloro</label>'],
  ['>Granular shock<', '>Choque granular<'],
  ['>Chlorine tablets<', '>Tabletas de cloro<'],
  ['<strong>Safe chlorine:</strong> 3–5 ppm', '<strong>Cloro seguro:</strong> 3–5 ppm'],
  ['<strong>Safe pH:</strong> 7.2–7.8', '<strong>pH seguro:</strong> 7.2–7.8'],
  ['<strong>Reference:</strong> <a href="/hot-tub-chemical-levels-chart">Hot Tub Chemical Levels Guide</a>', '<strong>Referencia:</strong> <a href="/hot-tub-chemical-levels-chart">Guía de Niveles Químicos del Spa</a>'],
  ['<h2>Quick Answers</h2>', '<h2>Respuestas Rápidas</h2>'],
  ['<h3>What should hot tub chlorine be?</h3><p>Keep hot tub chlorine between 3–5 ppm. Levels below may allow bacteria growth while high chlorine may irritate skin and eyes.</p>',
   '<h3>¿Cuál debe ser el nivel de cloro del spa?</h3><p>Mantenga el cloro del spa entre 3–5 ppm. Niveles inferiores pueden permitir el crecimiento de bacterias, mientras que un cloro alto puede irritar la piel y los ojos.</p>'],
  ['<h3>How often should I test?</h3><p>Test before use and several times weekly. After heavy use or refills, test again before soaking.</p>',
   '<h3>¿Con qué frecuencia debo analizar el agua?</h3><p>Analice antes de usar el spa y varias veces por semana. Después de un uso intenso o de rellenar, vuelva a analizar antes de sumergirse.</p>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal chlorine for hot tubs:</strong> 3–5 ppm. Run jets 15–20 minutes after adding chemicals, then re-test.',
   '<strong>Cloro ideal para spas:</strong> 3–5 ppm. Haga funcionar los chorros 15–20 minutos después de agregar los productos químicos y luego vuelva a analizar.'],
  ['<h2>People Also Ask</h2>', '<h2>Preguntas Frecuentes de Otros Usuarios</h2>'],
  ['<summary>What chlorine is too high in a hot tub?</summary>\n        <p>Above about 5 ppm free chlorine often causes odor, skin or eye irritation, and can stress covers and plastics. If readings exceed 5 ppm, pause adding sanitizer, run jets with the cover open, and retest after circulation before soaking.</p>',
   '<summary>¿Qué nivel de cloro es demasiado alto en un spa?</summary>\n        <p>Por encima de aproximadamente 5 ppm, el cloro libre suele causar olor, irritación de la piel o los ojos, y puede afectar las cubiertas y los plásticos. Si las lecturas superan las 5 ppm, deje de agregar sanitizante, haga funcionar los chorros con la cubierta abierta y vuelva a analizar después de la circulación antes de sumergirse.</p>'],
  ['<summary>Can I use pool chlorine in a hot tub?</summary>\n        <p>Many pool chlorine products work in spas if label allows spa use, but dosing differs because volume is small. Use this calculator with your exact gallons—never pour a full pool-sized dose into a hot tub.</p>',
   '<summary>¿Puedo usar cloro de piscina en un spa?</summary>\n        <p>Muchos productos de cloro para piscina funcionan en spas si la etiqueta permite su uso en spas, pero la dosificación es diferente porque el volumen es pequeño. Use esta calculadora con sus galones exactos; nunca vierta una dosis del tamaño de una piscina en un spa.</p>'],
  ['<summary>Should I shock a hot tub weekly?</summary>\n        <p>Weekly shock is common for heavy use, but test first. Shock when combined chlorine is high, water smells, or after a drain-and-refill party—not on a fixed calendar if sanitizer already reads high.</p>',
   '<summary>¿Debo aplicar choque al spa semanalmente?</summary>\n        <p>El choque semanal es común con uso intenso, pero analice primero. Aplique choque cuando el cloro combinado esté alto, el agua tenga olor, o después de vaciar y rellenar tras una reunión; no según un calendario fijo si el sanitizante ya está alto.</p>'],
  ['<summary>Why does hot tub chlorine disappear?</summary>\n        <p>Heat, aeration, and bather load burn sanitizer faster than a pool. Low pH, high cyanuric acid, or biofilm on filters can also make chlorine seem to vanish—test pH and clean filters when levels drop quickly.</p>',
   '<summary>¿Por qué desaparece el cloro del spa?</summary>\n        <p>El calor, la aireación y la cantidad de bañistas consumen el sanitizante más rápido que en una piscina. Un pH bajo, un ácido cianúrico alto o el biofilm en los filtros también pueden hacer que el cloro parezca desaparecer; analice el pH y limpie los filtros cuando los niveles bajen rápidamente.</p>'],
  ['<summary>How often should I test hot tub chlorine?</summary>\n        <p>Test before each soak when possible and at least several times per week. After refills, storms of use, or when water smells, test again the same day before adding more chemical.</p>',
   '<summary>¿Con qué frecuencia debo analizar el cloro del spa?</summary>\n        <p>Analice antes de cada uso cuando sea posible y al menos varias veces por semana. Después de rellenar, un uso intenso o cuando el agua tenga olor, vuelva a analizar el mismo día antes de agregar más producto.</p>'],
  ['<summary>What pH should a hot tub stay at?</summary>\n        <p>Most spas target 7.2–7.8 pH. In range, chlorine works better and equipment is less stressed. Pair pH checks with sanitizer tests—fixing only chlorine while pH drifts often wastes product.</p>',
   '<summary>¿En qué pH debe mantenerse un spa?</summary>\n        <p>La mayoría de los spas apuntan a un pH de 7.2–7.8. Dentro de este rango, el cloro funciona mejor y el equipo sufre menos desgaste. Combine las pruebas de pH con las de sanitizante; corregir solo el cloro mientras el pH varía suele desperdiciar producto.</p>'],
  ['<li><a href="/reference/pool-chemistry-reference">Pool chemistry reference</a></li>', '<li><a href="/reference/pool-chemistry-reference">Referencia de química de piscina</a></li>'],
  ['<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Hot tub chemicals for 400 gal</a></li>', '<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Productos químicos para spa de 400 gal</a></li>'],
  ['<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">How often to test pool water</a></li>', '<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">Con qué frecuencia analizar el agua de la piscina</a></li>'],
  ['<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">High chlorine: lower safely</a></li>', '<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">Cloro alto: cómo bajarlo con seguridad</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../guides/hot-tub/hot-tub-ph-too-low.html">Hot Tub Ph Too Low</a></li>', '<li><a href="../guides/hot-tub/hot-tub-ph-too-low.html">pH del spa demasiado bajo</a></li>'],
  ['<li><a href="../guides/hot-tub/how-often-to-shock-a-hot-tub.html">How Often To Shock A Hot Tub</a></li>', '<li><a href="../guides/hot-tub/how-often-to-shock-a-hot-tub.html">Con qué frecuencia aplicar choque al spa</a></li>'],
  ['<li><a href="../guides/hot-tub/index.html">Index</a></li>', '<li><a href="../guides/hot-tub/index.html">Índice</a></li>'],
  ['<li><a href="../guides/questions/why-does-hot-tub-water-smell.html">Why Does Hot Tub Water Smell</a></li>', '<li><a href="../guides/questions/why-does-hot-tub-water-smell.html">Por qué huele el agua del spa</a></li>'],
  ['<li><a href="../guides/questions/why-is-my-hot-tub-foamy.html">Why Is My Hot Tub Foamy</a></li>', '<li><a href="../guides/questions/why-is-my-hot-tub-foamy.html">Por qué mi spa tiene espuma</a></li>'],
  ['<li><a href="../guides/ph/does-rain-lower-pool-ph.html">Does Rain Lower Pool Ph</a></li>', '<li><a href="../guides/ph/does-rain-lower-pool-ph.html">La lluvia reduce el pH de la piscina</a></li>'],
  ['<li><a href="../reference/total-alkalinity-explained.html">Total Alkalinity Explained</a></li>', '<li><a href="../reference/total-alkalinity-explained.html">Alcalinidad Total Explicada</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/hot-tub-chemistry.html">Hot tub chemistry (hub)</a></li>', '<li><a href="../guides/hot-tub-chemistry.html">Química del spa (guía central)</a></li>'],
  [
    'The target range this calculator doses toward (3-5 ppm) is supported by the source below. The dosing formula\'s product-concentration assumptions have not been independently verified against a specific manufacturer reference --',
    'El rango objetivo hacia el que dosifica esta calculadora (3-5 ppm) cuenta con el respaldo de la fuente a continuación. Los supuestos de concentración de producto de la fórmula de dosificación no han sido verificados de forma independiente contra una referencia específica de fabricante;',
  ],
  [
    '<em>Target range (3-5 ppm) is CDC-supported. Dosage coefficient from dosage-matrices.json is not independently verified against a manufacturer/regulatory reference.</em>',
    '<em>El rango objetivo (3-5 ppm) cuenta con el respaldo de los CDC. El coeficiente de dosificación de dosage-matrices.json no está verificado de forma independiente contra una referencia de fabricante/regulatoria.</em>',
  ],
  // Inline JS display-text
  ["text.textContent = 'Enter valid hot tub gallons.'; el.classList.remove('hidden'); return; }",
   "text.textContent = 'Ingrese galones de spa válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.ppm <= 0) { text.textContent = 'Target must be higher than current. No addition needed.'; el.classList.remove('hidden'); return; }",
   "if (r.ppm <= 0) { text.textContent = 'El objetivo debe ser mayor que el actual. No se necesita agregar.'; el.classList.remove('hidden'); return; }"],
  ["text.textContent = 'Add ' + r.ounces.toFixed(1) + ' oz chlorine. Run jets 20 min, then re-test.';",
   "text.textContent = 'Agregue ' + r.ounces.toFixed(1) + ' oz de cloro. Haga funcionar los chorros 20 min y luego vuelva a analizar.';"],
];

const HOT_TUB_PH_CALCULATOR = [
  MODERATE_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/hot-tub-ph-calculator" class="calc-card calc-card--active">Hot Tub pH Calculator</a>', '<a href="/es/calculators/hot-tub-ph-calculator" class="calc-card calc-card--active">Calculadora de pH para Spa</a>'],
  ['Hot Tub pH Calculator | WaterBalanceTools', 'Calculadora de pH para Spa | WaterBalanceTools'],
  [
    "Find out whether to raise or lower your hot tub's pH and by how much (small, moderate, or substantial adjustment)—plus safe, incremental dosing guidance.",
    'Descubra si debe subir o bajar el pH de su spa y en qué medida (ajuste pequeño, moderado o sustancial), además de orientación segura para la dosificación incremental.',
  ],
  [
    'Get pH direction and adjustment-size guidance for your hot tub, plus safe incremental dosing steps.',
    'Obtenga la dirección del pH y orientación sobre la magnitud del ajuste para su spa, además de pasos seguros de dosificación incremental.',
  ],
  ['"name":"Hot Tub pH Calculator"', '"name":"Calculadora de pH para Spa"'],
  ['Hot Tub pH Calculator</span>', 'Calculadora de pH para Spa</span>'],
  [
    "Find out whether to raise or lower your hot tub's pH and by how much—plus safe, incremental dosing guidance.",
    'Descubra si debe subir o bajar el pH de su spa y en qué medida, además de orientación segura para la dosificación incremental.',
  ],
  ['<h1>Hot Tub pH Calculator</h1>', '<h1>Calculadora de pH para Spa</h1>'],
  ["Find out whether your hot tub's pH needs to go up or down, and roughly by how much.", 'Descubra si el pH de su spa necesita subir o bajar, y aproximadamente en qué medida.'],
  ['<label for="volume">Hot tub gallons</label>', '<label for="volume">Galones del spa</label>'],
  ['<label for="current">Current pH</label>', '<label for="current">pH actual</label>'],
  ['<label for="target">Target pH</label>', '<label for="target">pH objetivo</label>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal hot tub pH:</strong> 7.2–7.8. Run jets after adding chemicals, then re-test.', '<strong>pH ideal del spa:</strong> 7.2–7.8. Haga funcionar los chorros después de agregar los productos químicos y luego vuelva a analizar.'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Adjust pool pH 7.8 → 7.4</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Ajustar el pH de la piscina 7.8 → 7.4</a></li>'],
  ['<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Hot tub chemicals for 400 gal</a></li>', '<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Productos químicos para spa de 400 gal</a></li>'],
  ['<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Why pH affects chlorine</a></li>', '<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Por qué el pH afecta al cloro</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Low alkalinity symptoms</a></li>', '<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Síntomas de alcalinidad baja</a></li>'],
  ['<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Why Ph Affects Chlorine</a></li>', '<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Por qué el pH afecta al cloro</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-6-8-to-7-2.html">Adjust pH 6.8 → 7.2</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-6-8-to-7-2.html">Ajustar pH 6.8 → 7.2</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Adjust pH 7.8 → 7.4</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html">Ajustar pH 7.8 → 7.4</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-to-7-4.html">Adjust pH 7 → 7.4</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-7-to-7-4.html">Ajustar pH 7 → 7.4</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Adjust pH 8 → 7.5</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Ajustar pH 8 → 7.5</a></li>'],
  ['<li><a href="../reference/alkalinity-table.html">Alkalinity Table</a></li>', '<li><a href="../reference/alkalinity-table.html">Tabla de Alcalinidad</a></li>'],
  ['<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Chlorine Vs Bromine Hot Tub</a></li>', '<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Cloro vs. Bromo para Spa</a></li>'],
  ['<li><a href="pool-ph-calculator.html">Pool pH adjustment calculator</a></li>', '<li><a href="pool-ph-calculator.html">Calculadora de ajuste de pH para piscina</a></li>'],
  ['<li><a href="../guides/ph-guide.html">pH guide (hub)</a></li>', '<li><a href="../guides/ph-guide.html">Guía de pH (guía central)</a></li>'],
  // Inline JS display-text
  ["var MAGNITUDE_TEXT = { small: 'a small adjustment', moderate: 'a moderate adjustment', substantial: 'a substantial adjustment' };",
   "var MAGNITUDE_TEXT = { small: 'un ajuste pequeño', moderate: 'un ajuste moderado', substantial: 'un ajuste sustancial' };"],
  ["if (!r.valid) { text.textContent = 'Enter valid hot tub gallons.'; el.classList.remove('hidden'); return; }",
   "if (!r.valid) { text.textContent = 'Ingrese galones de spa válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.direction === 'balanced') { text.textContent = 'Your pH is already at (or very close to) your target. No adjustment is indicated.'; el.classList.remove('hidden'); return; }",
   "if (r.direction === 'balanced') { text.textContent = 'Su pH ya está en (o muy cerca de) su objetivo. No se indica ningún ajuste.'; el.classList.remove('hidden'); return; }"],
  ["var verb = r.direction === 'raise' ? 'raised' : 'lowered';", "var verb = r.direction === 'raise' ? 'elevado' : 'reducido';"],
  ["var product = r.direction === 'raise' ? 'pH increaser' : 'pH reducer';", "var product = r.direction === 'raise' ? 'elevador de pH' : 'reductor de pH';"],
  [
    "text.textContent = 'pH needs to be ' + verb + ' (' + MAGNITUDE_TEXT[r.magnitude] + '). Add ' + product + ' per the product label’s instructions, a little at a time. Run jets 20 minutes, then retest 30–60 minutes after each addition before adding more.';",
    "text.textContent = 'El pH debe ser ' + verb + ' (' + MAGNITUDE_TEXT[r.magnitude] + '). Agregue ' + product + ' según las instrucciones de la etiqueta del producto, poco a poco. Haga funcionar los chorros 20 minutos y vuelva a analizar 30–60 minutos después de cada adición antes de agregar más.';",
  ],
];

const HOT_TUB_SHOCK_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/hot-tub-shock-calculator" class="calc-card calc-card--active">Hot Tub Shock Calculator</a>', '<a href="/es/calculators/hot-tub-shock-calculator" class="calc-card calc-card--active">Calculadora de Choque para Spa</a>'],
  ['Hot Tub Shock Calculator (By Product) | WaterBalanceTools', 'Calculadora de Choque para Spa (Por Producto) | WaterBalanceTools'],
  [
    'Hot tub shock calculator. Enter spa gallons, target ppm, and shock product for a product-specific dose. Free and fast.',
    'Calculadora de choque para spa. Ingrese los galones del spa, el ppm objetivo y el producto de choque para obtener una dosis específica. Gratis y rápida.',
  ],
  [
    'Calculate product-specific shock dosage for your hot tub or spa.',
    'Calcule la dosis de choque específica del producto para su spa.',
  ],
  ['"name":"Hot Tub Shock Calculator"', '"name":"Calculadora de Choque para Spa"'],
  ['Hot Tub Shock Calculator</span>', 'Calculadora de Choque para Spa</span>'],
  [
    'Hot Tub Shock Calculator | WaterBalanceTools',
    'Calculadora de Choque para Spa | WaterBalanceTools',
  ],
  ['<h1>Hot Tub Shock Calculator</h1>', '<h1>Calculadora de Choque para Spa</h1>'],
  ['Calculate shock dosage for your hot tub based on volume, shock strength, and product.', 'Calcule la dosis de choque para su spa según el volumen, la intensidad del choque y el producto.'],
  ['<label for="volume">Hot tub gallons</label>', '<label for="volume">Galones del spa</label>'],
  ['<label for="strength">Shock strength (target ppm increase)</label>', '<label for="strength">Intensidad del choque (aumento objetivo en ppm)</label>'],
  ['>Light (5 ppm)<', '>Ligero (5 ppm)<'],
  ['>Standard (10 ppm)<', '>Estándar (10 ppm)<'],
  ['>Heavy (15 ppm)<', '>Intenso (15 ppm)<'],
  ['<label for="product">Shock product</label>', '<label for="product">Producto de choque</label>'],
  ['>Liquid Chlorine (10%)<', '>Cloro Líquido (10%)<'],
  ['>Liquid Chlorine (12.5%)<', '>Cloro Líquido (12.5%)<'],
  ['>Calcium Hypochlorite (65%)<', '>Hipoclorito de Calcio (65%)<'],
  ['>Calcium Hypochlorite (73%)<', '>Hipoclorito de Calcio (73%)<'],
  ["I don't know my product", 'No sé cuál es mi producto'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>When to shock a hot tub:</strong> Weekly or after heavy use. Use spa shock (MPS or chlorine). Run jets 15–20 minutes. Wait until chlorine drops to 3–5 ppm before using.',
   '<strong>Cuándo aplicar choque a un spa:</strong> Semanalmente o después de un uso intenso. Use choque para spa (MPS o cloro). Haga funcionar los chorros 15–20 minutos. Espere hasta que el cloro baje a 3–5 ppm antes de usarlo.'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Hot tub chemicals for 400 gal</a></li>', '<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Productos químicos para spa de 400 gal</a></li>'],
  ['<li><a href="../programmatic/behavior/when-to-add-chlorine.html">When to add chlorine</a></li>', '<li><a href="../programmatic/behavior/when-to-add-chlorine.html">Cuándo agregar cloro</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-600-gallons.html">Hot tub chemicals — 600 gal</a></li>', '<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-600-gallons.html">Productos químicos para spa — 600 gal</a></li>'],
  ['<li><a href="../reference/ideal-spa-levels.html">Ideal Spa Levels</a></li>', '<li><a href="../reference/ideal-spa-levels.html">Niveles Ideales del Spa</a></li>'],
  ['<li><a href="spa-volume-calculator.html">Spa Volume Calculator</a></li>', '<li><a href="spa-volume-calculator.html">Calculadora de Volumen del Spa</a></li>'],
  ['<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Chlorine Vs Bromine Hot Tub</a></li>', '<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Cloro vs. Bromo para Spa</a></li>'],
  ['<li><a href="../guides/hot-tub/hot-tub-alkalinity-too-high.html">Hot Tub Alkalinity Too High</a></li>', '<li><a href="../guides/hot-tub/hot-tub-alkalinity-too-high.html">Alcalinidad del Spa Demasiado Alta</a></li>'],
  ['<li><a href="pool-cyanuric-acid-calculator.html">Pool Cyanuric Acid Calculator</a></li>', '<li><a href="pool-cyanuric-acid-calculator.html">Calculadora de Ácido Cianúrico para Piscina</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué es la alcalinidad de la piscina</a></li>'],
  ['<li><a href="hot-tub-chlorine-calculator.html">Hot tub chlorine calculator</a></li>', '<li><a href="hot-tub-chlorine-calculator.html">Calculadora de cloro para spa</a></li>'],
  ['<li><a href="../guides/hot-tub-chemistry.html">Hot tub chemistry (hub)</a></li>', '<li><a href="../guides/hot-tub-chemistry.html">Química del spa (guía central)</a></li>'],
  [
    '<em>Dose is now product-specific: select a shock product (liquid chlorine or calcium hypochlorite -- the 4 products this site\'s dataset lists as hot-tub-appropriate) and the calculator applies the approved mass-balance formula using that product\'s dataset-verified available-chlorine percentage, plus safety notes. Does not read combined chlorine and does not compute a breakpoint-chlorination dose. The "I don\'t know my product" option gives qualitative guidance only, with no numeric dose.</em>',
    '<em>La dosis ahora es específica por producto: seleccione un producto de choque (cloro líquido o hipoclorito de calcio; los 4 productos que el conjunto de datos de este sitio indica como adecuados para spa) y la calculadora aplica la fórmula de balance de masa aprobada usando el porcentaje de cloro disponible de ese producto verificado en el conjunto de datos, además de notas de seguridad. No lee el cloro combinado ni calcula una dosis de cloración de ruptura. La opción "No sé cuál es mi producto" ofrece únicamente orientación cualitativa, sin una dosis numérica.</em>',
  ],
  // Structural: load the shared Spanish product-label lookup (Section 18)
  // before the inline script that now calls it. Purely additive -- does
  // not touch js/calc-utils.js.
  [
    '<script src="../js/calc-utils.js"></script>\n  <script>',
    '<script src="../js/calc-utils.js"></script>\n  <script src="/js/i18n/es-product-labels.js"></script>\n  <script>',
  ],
  // Inline JS display-text -- product.label/mixingWarning localized via the
  // shared window.WaterBalance.esProductLabels lookup (spec Section 18),
  // never by modifying js/calc-utils.js itself.
  ["if (!vol || parseFloat(vol) <= 0) { text.textContent = 'Enter valid hot tub gallons.'; el.classList.remove('hidden'); return; }",
   "if (!vol || parseFloat(vol) <= 0) { text.textContent = 'Ingrese galones de spa válidos.'; el.classList.remove('hidden'); return; }"],
  [
    "text.textContent = 'Select your shock product above for a specific amount -- the correct dose varies substantially by product and strength. In general: follow your product label’s instructions, add gradually, run jets 15–20 minutes, and re-test before using the tub.';",
    "text.textContent = 'Seleccione su producto de choque arriba para obtener una cantidad específica; la dosis correcta varía sustancialmente según el producto y la intensidad. En general: siga las instrucciones de la etiqueta de su producto, agregue gradualmente, haga funcionar los chorros 15–20 minutos y vuelva a analizar antes de usar el spa.';",
  ],
  ["if (!r.valid) { text.textContent = 'Enter valid hot tub gallons and select a product.'; el.classList.remove('hidden'); return; }",
   "if (!r.valid) { text.textContent = 'Ingrese galones de spa válidos y seleccione un producto.'; el.classList.remove('hidden'); return; }"],
  [
    "var msg = 'Add ' + r.ounces.toFixed(1) + ' oz ' + r.product.label + '. Run jets 15–20 min. Re-test before using tub.';",
    "var esLabels = window.WaterBalance.esProductLabels;\n        var msg = 'Agregue ' + r.ounces.toFixed(1) + ' oz de ' + esLabels.label(r.product.label) + '. Haga funcionar los chorros 15–20 min. Vuelva a analizar antes de usar el spa.';",
  ],
  [
    "if (r.product.mixingWarning) msg += ' ' + r.product.mixingWarning;",
    "if (r.product.mixingWarning) msg += ' ' + esLabels.warning(r.product.mixingWarning);",
  ],
];

const SPA_VOLUME_CALCULATOR = [
  VERY_HIGH_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/spa-volume-calculator" class="calc-card calc-card--active">Spa Volume Calculator</a>', '<a href="/es/calculators/spa-volume-calculator" class="calc-card calc-card--active">Calculadora de Volumen del Spa</a>'],
  ['Spa Volume Calculator | WaterBalanceTools', 'Calculadora de Volumen del Spa | WaterBalanceTools'],
  ['Spa volume calculator. Enter diameter and depth to get hot tub volume in gallons. Free and fast.', 'Calculadora de volumen del spa. Ingrese el diámetro y la profundidad para obtener el volumen en galones. Gratis y rápida.'],
  ['Calculate spa or hot tub volume in gallons from diameter and depth.', 'Calcule el volumen de su spa en galones a partir del diámetro y la profundidad.'],
  ['"name":"Spa Volume Calculator"', '"name":"Calculadora de Volumen del Spa"'],
  ['Spa Volume Calculator</span>', 'Calculadora de Volumen del Spa</span>'],
  ['<h1>Spa Volume Calculator</h1>', '<h1>Calculadora de Volumen del Spa</h1>'],
  ['Calculate hot tub or spa volume from diameter and depth. Result in gallons.', 'Calcule el volumen de su spa a partir del diámetro y la profundidad. Resultado en galones.'],
  ['<label for="diameter">Diameter (ft)</label>', '<label for="diameter">Diámetro (pies)</label>'],
  ['<label for="depth">Depth (ft)</label>', '<label for="depth">Profundidad (pies)</label>'],
  ['Use in Chemical Calculator', 'Usar en la Calculadora Química'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['Most round spas: measure inside diameter and water depth in feet. Typical hot tubs are 300–500 gallons.', 'La mayoría de los spas redondos: mida el diámetro interior y la profundidad del agua en pies. Los spas típicos tienen entre 300 y 500 galones.'],
  ['<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Hot tub chemicals for 400 gal</a></li>', '<li><a href="../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html">Productos químicos para spa de 400 gal</a></li>'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine dose for 10,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Dosis de cloro para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">How often to test pool water</a></li>', '<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">Con qué frecuencia analizar el agua de la piscina</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">High chlorine: lower safely</a></li>', '<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">Cloro alto: cómo bajarlo con seguridad</a></li>'],
  ['<li><a href="../reference/ideal-spa-levels.html">Ideal Spa Levels</a></li>', '<li><a href="../reference/ideal-spa-levels.html">Niveles Ideales del Spa</a></li>'],
  ['<li><a href="hot-tub-shock-calculator.html">Hot Tub Shock Calculator</a></li>', '<li><a href="hot-tub-shock-calculator.html">Calculadora de Choque para Spa</a></li>'],
  ['<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Chlorine Vs Bromine Hot Tub</a></li>', '<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Cloro vs. Bromo para Spa</a></li>'],
  ['<li><a href="../guides/hot-tub/hot-tub-alkalinity-too-high.html">Hot Tub Alkalinity Too High</a></li>', '<li><a href="../guides/hot-tub/hot-tub-alkalinity-too-high.html">Alcalinidad del Spa Demasiado Alta</a></li>'],
  ['<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Can You Swim In High Ph Water</a></li>', '<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Se puede nadar en agua con pH alto</a></li>'],
  ['<li><a href="../reference/alkalinity-table.html">Alkalinity Table</a></li>', '<li><a href="../reference/alkalinity-table.html">Tabla de Alcalinidad</a></li>'],
  ['<li><a href="hot-tub-chlorine-calculator.html">Hot tub chlorine calculator</a></li>', '<li><a href="hot-tub-chlorine-calculator.html">Calculadora de cloro para spa</a></li>'],
  ['<li><a href="../guides/hot-tub-chemistry.html">Hot tub chemistry (hub)</a></li>', '<li><a href="../guides/hot-tub-chemistry.html">Química del spa (guía central)</a></li>'],
  // Inline JS display-text
  ["if (!gal || gal <= 0) { text.textContent = 'Enter valid diameter and depth.'; el.classList.remove('hidden'); return; }",
   "if (!gal || gal <= 0) { text.textContent = 'Ingrese un diámetro y una profundidad válidos.'; el.classList.remove('hidden'); return; }"],
  ["text.textContent = 'Volume: ' + Math.round(gal).toLocaleString() + ' gallons';",
   "text.textContent = 'Volumen: ' + Math.round(gal).toLocaleString() + ' galones';"],
];

// ---------------------------------------------------------------------
// Phase 8I: Water Chemistry cluster expansion (the 4 remaining members
// of the site's own existing "Water Chemistry (5)" related-calculators
// navigation group -- spa-volume-calculator, the 5th member, was already
// translated in Phase 8G). None of these 4 pages has a chemistry-sources
// block, and none of their calc-utils.js functions (calculateAlkalinity,
// calculateCYA, calculateTurnover, calculateSalt) returns a dataset-driven
// English display string (no SHOCK_PRODUCTS-style label/warning object),
// so no shared-calculator-string mechanism (cf. js/i18n/es-product-labels.js)
// is needed for this cluster -- see docs/PHASE-8I-SPANISH-CALCULATOR-EXPANSION.md
// Section on the calculator-specific string audit.
// ---------------------------------------------------------------------

const POOL_ALKALINITY_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/pool-alkalinity-calculator" class="calc-card calc-card--active">Alkalinity Calculator</a>', '<a href="/es/calculators/pool-alkalinity-calculator" class="calc-card calc-card--active">Calculadora de Alcalinidad</a>'],
  ['Pool Alkalinity Calculator | WaterBalanceTools', 'Calculadora de Alcalinidad para Piscina | WaterBalanceTools'],
  [
    'Pool alkalinity calculator. Enter pool gallons and current alkalinity to get alkalinity increaser amount. Free and fast.',
    'Calculadora de alcalinidad para piscina. Ingrese los galones de la piscina y la alcalinidad actual para obtener la cantidad de incrementador de alcalinidad. Gratis y rápida.',
  ],
  [
    'Calculate how much alkalinity increaser your pool needs.',
    'Calcule cuánto incrementador de alcalinidad necesita su piscina.',
  ],
  ['"name":"Pool Alkalinity Calculator"', '"name":"Calculadora de Alcalinidad para Piscina"'],
  ['Pool Alkalinity Calculator</span>', 'Calculadora de Alcalinidad para Piscina</span>'],
  ['<h1>Pool Alkalinity Calculator</h1>', '<h1>Calculadora de Alcalinidad para Piscina</h1>'],
  ['Calculate how much alkalinity increaser (sodium bicarbonate) your pool needs.', 'Calcule cuánto incrementador de alcalinidad (bicarbonato de sodio) necesita su piscina.'],
  ['<label for="volume">Pool gallons</label>', '<label for="volume">Galones de la piscina</label>'],
  ['<label for="current">Current alkalinity (ppm)</label>', '<label for="current">Alcalinidad actual (ppm)</label>'],
  ['<label for="target">Target alkalinity (ppm)</label>', '<label for="target">Alcalinidad objetivo (ppm)</label>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal total alkalinity:</strong> 80–120 ppm. It buffers pH. Adjust alkalinity before making large pH changes.',
   '<strong>Alcalinidad total ideal:</strong> 80–120 ppm. Actúa como amortiguador del pH. Ajuste la alcalinidad antes de hacer grandes cambios de pH.'],
  ['<li><a href="/reference/pool-chemistry-reference">Pool chemistry reference</a></li>', '<li><a href="/reference/pool-chemistry-reference">Referencia de química de piscina</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What is pool alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué es la alcalinidad de la piscina</a></li>'],
  ['<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Lower pool pH 8.0 → 7.5</a></li>', '<li><a href="../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html">Bajar el pH de la piscina 8.0 → 7.5</a></li>'],
  ['<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Low alkalinity symptoms</a></li>', '<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Síntomas de alcalinidad baja</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../reference/total-alkalinity-explained.html">Total Alkalinity Explained</a></li>', '<li><a href="../reference/total-alkalinity-explained.html">Alcalinidad Total Explicada</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué Es la Alcalinidad de la Piscina</a></li>'],
  ['<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Low Alkalinity Symptoms</a></li>', '<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Síntomas de Alcalinidad Baja</a></li>'],
  ['<li><a href="../reference/alkalinity-table.html">Alkalinity Table</a></li>', '<li><a href="../reference/alkalinity-table.html">Tabla de Alcalinidad</a></li>'],
  ['<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Can You Swim In High Ph Water</a></li>', '<li><a href="../guides/ph/can-you-swim-in-high-ph-water.html">Se puede nadar en agua con pH alto</a></li>'],
  ['<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Chlorine Vs Bromine Hot Tub</a></li>', '<li><a href="../comparisons/chlorine-vs-bromine-hot-tub.html">Cloro vs. Bromo para Spa</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/alkalinity-guide.html">Alkalinity guide (hub)</a></li>', '<li><a href="../guides/alkalinity-guide.html">Guía de alcalinidad (guía central)</a></li>'],
  ['title="Total Alkalinity Adjustment">Total Alkalinity Adjustment</a>', 'title="Ajuste de Alcalinidad Total">Ajuste de Alcalinidad Total</a>'],
  [
    '<em>Target range (80-120 ppm) is independently supported (PHTA fact sheet). Baking soda coefficient (24 oz per 10 ppm per 10,000 gal) is not independently verified.</em>',
    '<em>El rango objetivo (80-120 ppm) cuenta con respaldo independiente (ficha técnica de la PHTA). El coeficiente de bicarbonato de sodio (24 oz por cada 10 ppm por cada 10,000 gal) no está verificado de forma independiente.</em>',
  ],
  // Inline JS display-text
  ["if (!g || parseFloat(g) <= 0) { text.textContent = 'Enter valid pool gallons.'; el.classList.remove('hidden'); return; }",
   "if (!g || parseFloat(g) <= 0) { text.textContent = 'Ingrese galones de piscina válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.ppm <= 0) { text.textContent = 'Target should be higher than current. No addition needed.'; el.classList.remove('hidden'); return; }",
   "if (r.ppm <= 0) { text.textContent = 'El objetivo debe ser mayor que el valor actual. No se necesita agregar nada.'; el.classList.remove('hidden'); return; }"],
  [
    "text.textContent = 'Add ' + r.ounces.toFixed(0) + ' oz (' + r.pounds.toFixed(2) + ' lb) alkalinity increaser. Re-test after a few hours.';",
    "text.textContent = 'Agregue ' + r.ounces.toFixed(0) + ' oz (' + r.pounds.toFixed(2) + ' lb) de incrementador de alcalinidad. Vuelva a analizar después de unas horas.';",
  ],
];

const POOL_CYANURIC_ACID_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/pool-cyanuric-acid-calculator" class="calc-card calc-card--active">CYA Calculator</a>', '<a href="/es/calculators/pool-cyanuric-acid-calculator" class="calc-card calc-card--active">Calculadora de Ácido Cianúrico</a>'],
  ['Pool Cyanuric Acid Calculator | WaterBalanceTools', 'Calculadora de Ácido Cianúrico para Piscina | WaterBalanceTools'],
  [
    'Pool cyanuric acid (CYA) calculator. Enter pool gallons and current CYA to get stabilizer amount. Free and fast.',
    'Calculadora de ácido cianúrico (CYA) para piscina. Ingrese los galones de la piscina y el CYA actual para obtener la cantidad de estabilizador. Gratis y rápida.',
  ],
  [
    'Calculate how much cyanuric acid (stabilizer) your pool needs.',
    'Calcule cuánto ácido cianúrico (estabilizador) necesita su piscina.',
  ],
  ['"name":"Pool Cyanuric Acid Calculator"', '"name":"Calculadora de Ácido Cianúrico para Piscina"'],
  ['Pool Cyanuric Acid Calculator</span>', 'Calculadora de Ácido Cianúrico para Piscina</span>'],
  ['<h1>Pool Cyanuric Acid Calculator</h1>', '<h1>Calculadora de Ácido Cianúrico para Piscina</h1>'],
  ['Calculate how much stabilizer (cyanuric acid) your pool needs to reach target CYA.', 'Calcule cuánto estabilizador (ácido cianúrico) necesita su piscina para alcanzar el CYA objetivo.'],
  ['<label for="volume">Pool gallons</label>', '<label for="volume">Galones de la piscina</label>'],
  ['<label for="current">Current CYA (ppm)</label>', '<label for="current">CYA actual (ppm)</label>'],
  ['<label for="target">Target CYA (ppm)</label>', '<label for="target">CYA objetivo (ppm)</label>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Ideal CYA:</strong> 30–50 ppm for outdoor pools. Too high reduces chlorine effectiveness; too low lets chlorine burn off quickly. Add stabilizer slowly and re-test after a few days.',
   '<strong>CYA ideal:</strong> 30–50 ppm para piscinas exteriores. Un nivel demasiado alto reduce la eficacia del cloro; uno demasiado bajo hace que el cloro se degrade rápidamente. Agregue el estabilizador lentamente y vuelva a analizar después de unos días.'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine dose for 10,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Dosis de cloro para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Why pH affects chlorine</a></li>', '<li><a href="../programmatic/explanations/why-ph-affects-chlorine.html">Por qué el pH afecta al cloro</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">High chlorine: lower safely</a></li>', '<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">Cloro alto: cómo bajarlo con seguridad</a></li>'],
  ['<li><a href="../guides/ph/does-rain-lower-pool-ph.html">Does Rain Lower Pool Ph</a></li>', '<li><a href="../guides/ph/does-rain-lower-pool-ph.html">La Lluvia Baja el pH de la Piscina</a></li>'],
  ['<li><a href="../guides/ph/how-to-lower-pool-ph.html">How To Lower Pool Ph</a></li>', '<li><a href="../guides/ph/how-to-lower-pool-ph.html">Cómo Bajar el pH de la Piscina</a></li>'],
  ['<li><a href="../guides/ph/index.html">Index</a></li>', '<li><a href="../guides/ph/index.html">Índice</a></li>'],
  ['<li><a href="../guides/ph/what-causes-high-pool-ph.html">What Causes High Pool Ph</a></li>', '<li><a href="../guides/ph/what-causes-high-pool-ph.html">Qué Causa el pH Alto en la Piscina</a></li>'],
  ['<li><a href="../guides/ph/why-pool-ph-keeps-rising.html">Why Pool Ph Keeps Rising</a></li>', '<li><a href="../guides/ph/why-pool-ph-keeps-rising.html">Por Qué el pH de la Piscina Sigue Subiendo</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué Es la Alcalinidad de la Piscina</a></li>'],
  ['<li><a href="hot-tub-shock-calculator.html">Hot Tub Shock Calculator</a></li>', '<li><a href="hot-tub-shock-calculator.html">Calculadora de Choque para Spa</a></li>'],
  ['<li><a href="pool-ph-calculator.html">Pool pH adjustment calculator</a></li>', '<li><a href="pool-ph-calculator.html">Calculadora de ajuste de pH para piscina</a></li>'],
  ['<li><a href="../guides/ph-guide.html">pH guide (hub)</a></li>', '<li><a href="../guides/ph-guide.html">Guía de pH (guía central)</a></li>'],
  ['title="Cyanuric Acid Adjustment">Cyanuric Acid Adjustment</a>', 'title="Ajuste de Ácido Cianúrico">Ajuste de Ácido Cianúrico</a>'],
  [
    '<em>Neither the 30-50 ppm target range nor the dosing coefficient has a confirmed primary source (see chemistry-claims.js claim-cya-routine-outdoor). CYA dissolves slowly -- allow 24-48 hours for equilibration before retesting.</em>',
    '<em>Ni el rango objetivo de 30-50 ppm ni el coeficiente de dosificación cuentan con una fuente primaria confirmada (véase chemistry-claims.js claim-cya-routine-outdoor). El CYA se disuelve lentamente: espere de 24 a 48 horas para su equilibración antes de volver a analizar.</em>',
  ],
  // Inline JS display-text
  ["if (!g || parseFloat(g) <= 0) { text.textContent = 'Enter valid pool gallons.'; el.classList.remove('hidden'); return; }",
   "if (!g || parseFloat(g) <= 0) { text.textContent = 'Ingrese galones de piscina válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.ppm <= 0) { text.textContent = 'Target should be higher than current CYA. No addition needed.'; el.classList.remove('hidden'); return; }",
   "if (r.ppm <= 0) { text.textContent = 'El objetivo debe ser mayor que el CYA actual. No se necesita agregar nada.'; el.classList.remove('hidden'); return; }"],
  [
    "text.textContent = 'Add ' + r.ounces.toFixed(0) + ' oz stabilizer (cyanuric acid). Dissolve in a sock or add to skimmer. Re-test in a few days.';",
    "text.textContent = 'Agregue ' + r.ounces.toFixed(0) + ' oz de estabilizador (ácido cianúrico). Disuélvalo en una media o agréguelo al skimmer. Vuelva a analizar en unos días.';",
  ],
];

const POOL_TURNOVER_RATE_CALCULATOR = [
  VERY_HIGH_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/pool-turnover-rate-calculator" class="calc-card calc-card--active">Turnover Rate Calculator</a>', '<a href="/es/calculators/pool-turnover-rate-calculator" class="calc-card calc-card--active">Calculadora de Tasa de Recirculación</a>'],
  ['Pool Turnover Rate Calculator | WaterBalanceTools', 'Calculadora de Tasa de Recirculación para Piscina | WaterBalanceTools'],
  [
    'Pool turnover rate calculator. Enter pool volume and pump flow rate to get hours for full turnover. Free and fast.',
    'Calculadora de tasa de recirculación para piscina. Ingrese el volumen de la piscina y el caudal de la bomba para obtener las horas necesarias para una recirculación completa. Gratis y rápida.',
  ],
  [
    'Calculate how many hours your pump needs for one full pool turnover.',
    'Calcule cuántas horas necesita su bomba para una recirculación completa de la piscina.',
  ],
  ['"name":"Pool Turnover Rate Calculator"', '"name":"Calculadora de Tasa de Recirculación para Piscina"'],
  ['Pool Turnover Rate Calculator</span>', 'Calculadora de Tasa de Recirculación para Piscina</span>'],
  ['<h1>Pool Turnover Rate Calculator</h1>', '<h1>Calculadora de Tasa de Recirculación para Piscina</h1>'],
  ['Calculate hours required for one full pool turnover (volume ÷ flow rate).', 'Calcule las horas necesarias para una recirculación completa de la piscina (volumen ÷ caudal).'],
  ['<label for="volume">Pool volume (gallons)</label>', '<label for="volume">Volumen de la piscina (galones)</label>'],
  ['<label for="flow">Pump flow rate (GPH)</label>', '<label for="flow">Caudal de la bomba (GPH)</label>'],
  ['<small>If you have GPM, multiply by 60 to get GPH.</small>', '<small>Si tiene el valor en GPM, multiplíquelo por 60 para obtener GPH.</small>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Turnover:</strong> One full turnover = all pool water passing through the filter once. Many pools aim for 1–2 turnovers per day. Check your pump’s flow rate on the label or manual.',
   '<strong>Recirculación:</strong> Una recirculación completa equivale a que toda el agua de la piscina pase una vez por el filtro. Muchas piscinas buscan de 1 a 2 recirculaciones por día. Consulte el caudal de su bomba en la etiqueta o el manual.'],
  ['<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">How often to test pool water</a></li>', '<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">Con qué frecuencia analizar el agua de la piscina</a></li>'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine dose for 10,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Dosis de cloro para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Shock ounces for 10,000 gal</a></li>', '<li><a href="../programmatic/shock/how-much-shock-for-10000-gallon-pool.html">Onzas de choque para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/problems/cloudy-pool-fix.html">Cloudy pool fix</a></li>', '<li><a href="../programmatic/problems/cloudy-pool-fix.html">Solución para piscina turbia</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../reference/pool-volume-reference.html">Pool Volume Reference</a></li>', '<li><a href="../reference/pool-volume-reference.html">Referencia de Volumen de Piscina</a></li>'],
  ['<li><a href="../reference/printable-resources-index.html">Printable Resources Index</a></li>', '<li><a href="../reference/printable-resources-index.html">Índice de Recursos Imprimibles</a></li>'],
  ['<li><a href="../reference/pump-sizing.html">Pump Sizing</a></li>', '<li><a href="../reference/pump-sizing.html">Dimensionamiento de la Bomba</a></li>'],
  ['<li><a href="../reference/recommended-water-temperature.html">Recommended Water Temperature</a></li>', '<li><a href="../reference/recommended-water-temperature.html">Temperatura del Agua Recomendada</a></li>'],
  ['<li><a href="../reference/salt-matrix.html">Salt Matrix</a></li>', '<li><a href="../reference/salt-matrix.html">Matriz de Sal</a></li>'],
  ['<li><a href="pool-cyanuric-acid-calculator.html">Pool Cyanuric Acid Calculator</a></li>', '<li><a href="pool-cyanuric-acid-calculator.html">Calculadora de Ácido Cianúrico para Piscina</a></li>'],
  ['<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">What Is Pool Alkalinity</a></li>', '<li><a href="../programmatic/explanations/what-is-pool-alkalinity.html">Qué Es la Alcalinidad de la Piscina</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/pool-chemistry-basics.html">Pool chemistry basics (hub)</a></li>', '<li><a href="../guides/pool-chemistry-basics.html">Fundamentos de química de piscina (guía central)</a></li>'],
  ['title="Pool Turnover Rate">Pool Turnover Rate</a>', 'title="Tasa de Recirculación de la Piscina">Tasa de Recirculación de la Piscina</a>'],
  // Inline JS display-text
  ["if (!hours || hours <= 0) { text.textContent = 'Enter valid volume and flow rate (GPH).'; el.classList.remove('hidden'); return; }",
   "if (!hours || hours <= 0) { text.textContent = 'Ingrese un volumen y un caudal (GPH) válidos.'; el.classList.remove('hidden'); return; }"],
  ["text.textContent = 'One full turnover: ' + hours.toFixed(1) + ' hours.';",
   "text.textContent = 'Una recirculación completa: ' + hours.toFixed(1) + ' horas.';"],
];

const SALTWATER_POOL_SALT_CALCULATOR = [
  LIMITED_CONFIDENCE_TOOLTIP,
  ['<h2>Result</h2>', '<h2>Resultado</h2>'],
  ['<a href="/calculators/saltwater-pool-salt-calculator" class="calc-card calc-card--active">Salt Calculator</a>', '<a href="/es/calculators/saltwater-pool-salt-calculator" class="calc-card calc-card--active">Calculadora de Sal</a>'],
  ['Saltwater Pool Salt Calculator | WaterBalanceTools', 'Calculadora de Sal para Piscina de Agua Salada | WaterBalanceTools'],
  [
    'Saltwater pool salt calculator. Enter pool gallons and current salt level to get pounds of salt required. Free and fast.',
    'Calculadora de sal para piscina de agua salada. Ingrese los galones de la piscina y el nivel de sal actual para obtener las libras de sal necesarias. Gratis y rápida.',
  ],
  [
    'Calculate how much salt to add to your saltwater pool.',
    'Calcule cuánta sal debe agregar a su piscina de agua salada.',
  ],
  ['"name":"Saltwater Pool Salt Calculator"', '"name":"Calculadora de Sal para Piscina de Agua Salada"'],
  ['Saltwater Pool Salt Calculator</span>', 'Calculadora de Sal para Piscina de Agua Salada</span>'],
  ['<h1>Saltwater Pool Salt Calculator</h1>', '<h1>Calculadora de Sal para Piscina de Agua Salada</h1>'],
  ['Calculate how much salt to add to reach your target salt level.', 'Calcule cuánta sal debe agregar para alcanzar su nivel de sal objetivo.'],
  ['<label for="volume">Pool gallons</label>', '<label for="volume">Galones de la piscina</label>'],
  ['<label for="current">Current salt (ppm)</label>', '<label for="current">Sal actual (ppm)</label>'],
  ['<label for="target">Target salt (ppm)</label>', '<label for="target">Sal objetivo (ppm)</label>'],
  ['<h2>Quick tips</h2>', '<h2>Consejos Rápidos</h2>'],
  ['<strong>Typical salt level:</strong> 2,700–3,400 ppm (check your salt cell manual). Use pool-grade salt only. Add in the deep end and run pump for 24 hours. Re-test after salt dissolves.',
   '<strong>Nivel de sal típico:</strong> 2,700–3,400 ppm (consulte el manual de su celda salina). Use únicamente sal de grado para piscinas. Agréguela en la parte más profunda y haga funcionar la bomba durante 24 horas. Vuelva a analizar después de que la sal se disuelva.'],
  ['<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Chlorine dose for 10,000 gal</a></li>', '<li><a href="../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html">Dosis de cloro para 10,000 gal</a></li>'],
  ['<li><a href="../programmatic/behavior/when-to-add-chlorine.html">When to add chlorine</a></li>', '<li><a href="../programmatic/behavior/when-to-add-chlorine.html">Cuándo agregar cloro</a></li>'],
  ['<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">How often to test pool water</a></li>', '<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">Con qué frecuencia analizar el agua de la piscina</a></li>'],
  ['<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Green pool: chlorine &amp; shock</a></li>', '<li><a href="../programmatic/problems/green-pool-how-much-chlorine.html">Piscina verde: cloro y choque</a></li>'],
  ['<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">High chlorine: lower safely</a></li>', '<li><a href="../programmatic/problems/high-chlorine-how-to-lower.html">Cloro alto: cómo bajarlo con seguridad</a></li>'],
  ['<li><a href="../guides/seasonal/index.html">Index</a></li>', '<li><a href="../guides/seasonal/index.html">Índice</a></li>'],
  ['<li><a href="../guides/seasonal/opening-pool-chemistry-checklist.html">Opening Pool Chemistry Checklist</a></li>', '<li><a href="../guides/seasonal/opening-pool-chemistry-checklist.html">Lista de Verificación Química para la Apertura de la Piscina</a></li>'],
  ['<li><a href="../guides/seasonal/winter-pool-maintenance-chemistry.html">Winter Pool Maintenance Chemistry</a></li>', '<li><a href="../guides/seasonal/winter-pool-maintenance-chemistry.html">Química de Mantenimiento Invernal de la Piscina</a></li>'],
  ['<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">How Often To Test Pool Water</a></li>', '<li><a href="../programmatic/behavior/how-often-to-test-pool-water.html">Con Qué Frecuencia Analizar el Agua de la Piscina</a></li>'],
  ['<li><a href="../programmatic/behavior/index.html">Index — 1</a></li>', '<li><a href="../programmatic/behavior/index.html">Índice — 1</a></li>'],
  ['<li><a href="pool-ph-calculator.html">Pool pH adjustment calculator</a></li>', '<li><a href="pool-ph-calculator.html">Calculadora de ajuste de pH para piscina</a></li>'],
  ['<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Low Alkalinity Symptoms</a></li>', '<li><a href="../programmatic/problems/low-alkalinity-symptoms.html">Síntomas de Alcalinidad Baja</a></li>'],
  ['<li><a href="chemical-calculator.html">Full pool chemical calculator</a></li>', '<li><a href="chemical-calculator.html">Calculadora química de piscina completa</a></li>'],
  ['<li><a href="../guides/pool-chemistry-basics.html">Pool chemistry basics (hub)</a></li>', '<li><a href="../guides/pool-chemistry-basics.html">Fundamentos de química de piscina (guía central)</a></li>'],
  ['title="Salt Level Adjustment">Salt Level Adjustment</a>', 'title="Ajuste del Nivel de Sal">Ajuste del Nivel de Sal</a>'],
  [
    "<em>Salt targets are equipment/manufacturer-specific; no manufacturer-independent primary source was confirmed for the target range or dosing coefficient. Verify against your system's manufacturer spec.</em>",
    '<em>Los niveles objetivo de sal son específicos del equipo/fabricante; no se confirmó una fuente primaria independiente del fabricante para el rango objetivo ni para el coeficiente de dosificación. Verifique con la especificación del fabricante de su sistema.</em>',
  ],
  // Inline JS display-text
  ["if (!g || parseFloat(g) <= 0) { text.textContent = 'Enter valid pool gallons.'; el.classList.remove('hidden'); return; }",
   "if (!g || parseFloat(g) <= 0) { text.textContent = 'Ingrese galones de piscina válidos.'; el.classList.remove('hidden'); return; }"],
  ["if (r.ppm <= 0) { text.textContent = 'Target should be higher than current salt. No addition needed.'; el.classList.remove('hidden'); return; }",
   "if (r.ppm <= 0) { text.textContent = 'El objetivo debe ser mayor que el nivel de sal actual. No se necesita agregar nada.'; el.classList.remove('hidden'); return; }"],
  [
    "text.textContent = 'Add ' + r.pounds.toFixed(1) + ' lb pool salt. Run pump 24 hours and re-test.';",
    "text.textContent = 'Agregue ' + r.pounds.toFixed(1) + ' lb de sal para piscina. Haga funcionar la bomba durante 24 horas y vuelva a analizar.';",
  ],
];

module.exports = {
  SHARED,
  SHARED_OPTIONAL,
  'chemical-calculator.html': CHEMICAL_CALCULATOR,
  'pool-volume-calculator.html': POOL_VOLUME_CALCULATOR,
  'pool-chlorine-calculator.html': POOL_CHLORINE_CALCULATOR,
  'pool-ph-calculator.html': POOL_PH_CALCULATOR,
  'pool-shock-calculator.html': POOL_SHOCK_CALCULATOR,
  'hot-tub-chlorine-calculator.html': HOT_TUB_CHLORINE_CALCULATOR,
  'hot-tub-ph-calculator.html': HOT_TUB_PH_CALCULATOR,
  'hot-tub-shock-calculator.html': HOT_TUB_SHOCK_CALCULATOR,
  'spa-volume-calculator.html': SPA_VOLUME_CALCULATOR,
  'pool-alkalinity-calculator.html': POOL_ALKALINITY_CALCULATOR,
  'pool-cyanuric-acid-calculator.html': POOL_CYANURIC_ACID_CALCULATOR,
  'pool-turnover-rate-calculator.html': POOL_TURNOVER_RATE_CALCULATOR,
  'saltwater-pool-salt-calculator.html': SALTWATER_POOL_SALT_CALCULATOR,
};
