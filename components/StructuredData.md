# StructuredData — usage

Static site: there is no React component. Schema is rendered by **lib/schemaEngine.js** and injected per page.

## Equivalent of `<StructuredData schema={...} />`

Use `WaterBalanceSchema.renderSchemaScript(schema)` for a single schema, or `WaterBalanceSchema.renderAllSchemas({ ... })` to output WebApplication, FAQPage, BreadcrumbList, and HowTo once each.

## If you add React/Next.js later

```tsx
// components/StructuredData.tsx
export default function StructuredData({ schema }: { schema: object | null }) {
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// In page: render each schema once
<StructuredData schema={webAppSchema} />
<StructuredData schema={faqSchema} />
<StructuredData schema={breadcrumbSchema} />
<StructuredData schema={howToSchema} />
```

**Rule:** Do not add schema in layout, _app, or global SEO. Only in page components so each page outputs each type once.
