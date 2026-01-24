# UML Generator

This small script scans `lib/classes` for TypeScript `class` declarations and emits a PlantUML file at `tools/uml/classes.puml`.

## Usage

From the repository root run:

```bash
npm run generate:uml
```

This will create `tools/uml/classes.puml` which you can open with any PlantUML renderer (VS Code PlantUML extension, plantuml.com, etc.).

## Notes

- The parser uses the TypeScript compiler API to extract class names, properties, methods, inheritance and implementations.
- The script intentionally lives in `tools/uml` and does not modify any original source files.
