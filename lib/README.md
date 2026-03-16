# Schema Engine

Centralized structured data for WaterBalanceTools. Ensures **one schema per type per page** (no duplicate FAQPage).

## Browser (static HTML)

```html
<script src="../lib/schemaEngine.js"></script>
<script>
(function(){
  var S = window.WaterBalanceSchema;
  var html = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: "Tool Name",
      description: "Description.",
      url: S.BASE_URL + "/calculators/tool-page.html"
    }),
    faq: [
      { question: "Q?", answer: "A." }
    ],
    breadcrumb: [
      { name: "Home", url: "/" },
      { name: "Calculators", url: "/calculators/" },
      { name: "Tool Name", url: "/calculators/tool-page.html" }
    ],
    howTo: { title: "How to...", steps: ["Step 1", "Step 2"] }
  });
  document.head.insertAdjacentHTML("beforeend", html);
})();
</script>
```

## Node (generators)

```js
const schemaEngine = require('../lib/schemaEngine.js');
const faqSchema = schemaEngine.generateFAQSchema([{ question: 'Q?', answer: 'A.' }]);
const scriptTag = schemaEngine.renderSchemaScript(faqSchema);
// Inject scriptTag into HTML
```

## API

- `generateWebApplicationSchema({ name, description, url })`
- `generateFAQSchema(faqs)` — faqs: `[{ question, answer }]` or `[{ q, a }]`
- `generateBreadcrumbSchema(breadcrumbs)` — `[{ name, url }]`
- `generateHowToSchema(title, steps)` — steps: array of strings
- `generateOrganizationSchema({ name, url })` — use once globally (e.g. homepage)
- `renderSchemaScript(schema)` — returns one `<script type="application/ld+json">` string
- `renderAllSchemas({ webApplication, faq, breadcrumb, howTo })` — each type at most once
