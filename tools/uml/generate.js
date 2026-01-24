#!/usr/bin/env node
import { SyntaxKind, createSourceFile, ScriptTarget, isClassDeclaration, isPropertyDeclaration, isPropertySignature, isMethodDeclaration, isConstructorDeclaration, forEachChild } from 'typescript';
import { readdirSync, statSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

function walkDir(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walkDir(full));
    else if (stat.isFile() && full.endsWith('.ts') && !full.endsWith('.d.ts')) files.push(full);
  }
  return files;
}

function visibilitySymbol(modifiers) {
  if (!modifiers) return '+';
  for (const m of modifiers) {
    if (m.kind === SyntaxKind.PrivateKeyword) return '-';
    if (m.kind === SyntaxKind.ProtectedKeyword) return '#';
  }
  return '+';
}

function getName(nameNode, sourceFile) {
  if (!nameNode) return '<<anonymous>>';
  return nameNode.getText(sourceFile);
}

function parseFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const sourceFile = createSourceFile(filePath, content, ScriptTarget.ESNext, true);
  const classes = [];

  function visit(node) {
    if (isClassDeclaration(node) && node.name) {
      const cls = { name: node.name.text, properties: [], methods: [], extends: [], implements: [] };

      if (node.heritageClauses) {
        for (const clause of node.heritageClauses) {
          const token = clause.token;
          for (const t of clause.types) {
            const txt = t.expression ? t.expression.getText(sourceFile) : t.getText(sourceFile);
            if (token === SyntaxKind.ExtendsKeyword) cls.extends.push(txt);
            else if (token === SyntaxKind.ImplementsKeyword) cls.implements.push(txt);
          }
        }
      }

      for (const member of node.members) {
        if (isPropertyDeclaration(member) || isPropertySignature(member)) {
          const name = getName(member.name, sourceFile);
          const type = member.type ? member.type.getText(sourceFile) : 'any';
          const vis = visibilitySymbol(member.modifiers);
          cls.properties.push({ name, type, vis });
        } else if (isMethodDeclaration(member)) {
          const name = getName(member.name, sourceFile);
          const params = (member.parameters || []).map(p => {
            const pn = p.name.getText(sourceFile);
            const pt = p.type ? p.type.getText(sourceFile) : 'any';
            return `${pn}: ${pt}`;
          }).join(', ');
          const ret = member.type ? member.type.getText(sourceFile) : 'void';
          const vis = visibilitySymbol(member.modifiers);
          cls.methods.push({ name, params, ret, vis });
        } else if (isConstructorDeclaration(member)) {
          const params = (member.parameters || []).map(p => {
            const pn = p.name.getText(sourceFile);
            const pt = p.type ? p.type.getText(sourceFile) : 'any';
            return `${pn}: ${pt}`;
          }).join(', ');
          cls.methods.push({ name: 'constructor', params, ret: '', vis: '+' });
        }
      }

      classes.push(cls);
    }
    forEachChild(node, visit);
  }

  visit(sourceFile);
  return classes;
}

function generatePlantUML(classes) {
  const lines = ['@startuml', 'skinparam classAttributeIconSize 0', ''];

  for (const c of classes) {
    lines.push(`class ${c.name} {`);
    for (const p of c.properties) {
      lines.push(`  ${p.vis}${p.name}: ${p.type}`);
    }
    for (const m of c.methods) {
      const sig = m.ret ? `${m.name}(${m.params}): ${m.ret}` : `${m.name}(${m.params})`;
      lines.push(`  ${m.vis}${sig}`);
    }
    lines.push('}');
    lines.push('');
  }

  // Relationships
  for (const c of classes) {
    for (const ext of c.extends) lines.push(`${c.name} --|> ${ext}`);
    for (const impl of c.implements) lines.push(`${c.name} ..|> ${impl}`);
  }

  lines.push('', '@enduml');
  return lines.join('\n');
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'lib', 'classes');
  if (!existsSync(root)) {
    console.error('Directory not found:', root);
    process.exit(1);
  }

  const files = walkDir(root);
  const allClasses = [];
  for (const f of files) {
    try {
      const cls = parseFile(f);
      allClasses.push(...cls);
    } catch (err) {
      console.error('Failed parsing', f, err.message);
    }
  }

  const puml = generatePlantUML(allClasses);
  const out = join(dirname(fileURLToPath(import.meta.url)), 'classes.puml');
  writeFileSync(out, puml, 'utf8');
  console.log('Wrote PlantUML to', out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();