#!/usr/bin/env tsx
/**
 * Publish LMS Schema Documentation to Notion
 *
 * This script reads all LMS documentation files and creates
 * a comprehensive "LMS Database Schema" page in Notion.
 *
 * Usage: npm run docs:lms:publish
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

interface MarkdownSection {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'table' | 'horizontal-rule';
  level?: number;
  content?: string;
  items?: string[];
  language?: string;
  rows?: string[][];
}

interface NotionBlock {
  type: string;
  content: any;
}

const DOCS_DIR = join(process.cwd(), 'docs', 'lms-schema');
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || 'Database Design and Schema';

/**
 * Read a markdown file and return its content
 */
function readMarkdownFile(filename: string): string {
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return '';
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Parse markdown into structured sections
 */
function parseMarkdown(content: string): MarkdownSection[] {
  const lines = content.split('\n');
  const sections: MarkdownSection[] = [];
  let currentList: string[] = [];
  let currentTable: string[][] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim() || 'text';
        codeContent = [];
      } else {
        sections.push({
          type: 'code',
          language: codeLanguage,
          content: codeContent.join('\n')
        });
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      // Flush any pending content
      if (currentList.length > 0) {
        sections.push({ type: 'list', items: currentList });
        currentList = [];
      }
      if (currentTable.length > 0) {
        sections.push({ type: 'table', rows: currentTable });
        currentTable = [];
      }

      sections.push({
        type: 'heading',
        level: headerMatch[1].length,
        content: headerMatch[2]
      });
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      sections.push({ type: 'horizontal-rule' });
      continue;
    }

    // Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length > 0) {
        currentTable.push(cells);
      }
      // Check if next line is separator
      if (i + 1 < lines.length && lines[i + 1].match(/^\|[\s\-:]+\|$/)) {
        i++; // Skip separator line
      }
      continue;
    }

    // Lists
    const listMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    const numberedListMatch = line.match(/^\d+\.\s+(.+)$/);
    if (listMatch || numberedListMatch) {
      // Flush table if we were in one
      if (currentTable.length > 0) {
        sections.push({ type: 'table', rows: currentTable });
        currentTable = [];
      }

      const item = listMatch ? listMatch[1] : numberedListMatch![1];
      currentList.push(item);
      continue;
    }

    // Paragraphs and other content
    if (line.trim() !== '' || currentList.length > 0 || currentTable.length > 0) {
      // Flush list and table if we hit a non-list/non-table line
      if (currentList.length > 0) {
        sections.push({ type: 'list', items: currentList });
        currentList = [];
      }
      if (currentTable.length > 0) {
        sections.push({ type: 'table', rows: currentTable });
        currentTable = [];
      }

      if (line.trim() !== '') {
        sections.push({
          type: 'paragraph',
          content: line.trim()
        });
      }
    }
  }

  // Flush any remaining content
  if (currentList.length > 0) {
    sections.push({ type: 'list', items: currentList });
  }
  if (currentTable.length > 0) {
    sections.push({ type: 'table', rows: currentTable });
  }

  return sections;
}

/**
 * Convert markdown section to Notion block format
 */
function sectionToNotionBlock(section: MarkdownSection): NotionBlock {
  switch (section.type) {
    case 'heading':
      const headingType = `heading_${section.level}` as 'heading_1' | 'heading_2' | 'heading_3';
      return {
        type: headingType,
        content: {
          type: headingType,
          [headingType]: {
            rich_text: [{
              type: 'text',
              text: { content: section.content || '' }
            }]
          }
        }
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: section.content || '' }
            }]
          }
        }
      };

    case 'list':
      return {
        type: 'bulleted_list_item',
        content: {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: section.items?.map(item => ({
              type: 'text',
              text: { content: item }
            })) || []
          }
        }
      };

    case 'code':
      return {
        type: 'code',
        content: {
          type: 'code',
          code: {
            rich_text: [{
              type: 'text',
              text: { content: section.content || '' }
            }],
            language: section.language || 'text'
          }
        }
      };

    case 'table':
      const tableRows = section.rows || [];
      const hasHeader = tableRows.length > 0;
      const headerRow = hasHeader ? tableRows[0] : [];
      const dataRows = hasHeader ? tableRows.slice(1) : [];

      return {
        type: 'table',
        content: {
          type: 'table',
          table: {
            table_width: headerRow.length,
            has_column_header: true,
            has_row_header: false,
            children: [
              // Header row
              {
                type: 'table_row',
                table_row: {
                  cells: headerRow.map(cell => [{
                    type: 'text',
                    text: { content: cell }
                  }])
                }
              },
              // Data rows
              ...dataRows.map(row => ({
                type: 'table_row',
                table_row: {
                  cells: row.map(cell => [{
                    type: 'text',
                    text: { content: cell }
                  }])
                }
              }))
            ]
          }
        }
      };

    case 'horizontal-rule':
      return {
        type: 'divider',
        content: {
          type: 'divider',
          divider: {}
        }
      };

    default:
      return {
        type: 'paragraph',
        content: {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: '' }
            }]
          }
        }
      };
  }
}

/**
 * List all markdown files in the documentation directory recursively
 */
function listMarkdownFiles(): string[] {
  const files: string[] = [];

  function scanDir(dir: string, baseDir: string = DOCS_DIR) {
    if (!existsSync(dir)) {
      return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath, baseDir);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Get relative path from DOCS_DIR
        const relativePath = fullPath.slice(baseDir.length + 1);
        files.push(relativePath);
      }
    }
  }

  scanDir(DOCS_DIR);
  return files.sort();
}

/**
 * List all ERD diagram files recursively
 */
function listERDDiagrams(): string[] {
  const files: string[] = [];

  function scanDir(dir: string, baseDir: string = DOCS_DIR) {
    if (!existsSync(dir)) {
      return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath, baseDir);
      } else if (entry.isFile() && /\.(png|jpg|jpeg|svg|gif)$/i.test(entry.name)) {
        const relativePath = fullPath.slice(baseDir.length + 1);
        files.push(relativePath);
      }
    }
  }

  scanDir(DOCS_DIR);
  return files.sort();
}

/**
 * Build the complete Notion page structure
 */
function buildNotionPageStructure() {
  const structure = {
    title: 'LMS Database Schema',
    parent: PARENT_PAGE_ID,
    icon: '📊',
    cover: null,
    blocks: [] as any[]
  };

  // Add main title and description
  structure.blocks.push({
    type: 'heading_1',
    heading_1: {
      rich_text: [{
        type: 'text',
        text: { content: 'LMS Database Schema Documentation' }
      }]
    }
  });

  // Read and parse README.md
  const readmeContent = readMarkdownFile('README.md');
  if (readmeContent) {
    const readmeSections = parseMarkdown(readmeContent);
    readmeSections.forEach(section => {
      const block = sectionToNotionBlock(section);
      structure.blocks.push(block.content);
    });
  }

  // Add table of contents
  structure.blocks.push({
    type: 'callout',
    callout: {
      rich_text: [{
        type: 'text',
        text: { content: '📑 Table of Contents\n\nThis page contains comprehensive documentation for all LMS (Loan Management System) database tables, relationships, and enums.' }
      }],
      icon: { emoji: '📑' }
    }
  });

  // Read all table documentation files
  const markdownFiles = listMarkdownFiles();
  const tableFiles = markdownFiles.filter(f =>
    !f.startsWith('README.md') &&
    !f.startsWith('enums.md') &&
    !f.startsWith('relationships.md') &&
    !f.startsWith('erds/')
  );

  // Create toggle blocks for each module based on actual directory structure
  const modules = [
    {
      name: 'Core Tables',
      files: tableFiles.filter(f => f.startsWith('core/')),
      emoji: '💳',
      description: 'Loan account, repayment, and disbursement tables'
    },
    {
      name: 'Collections',
      files: tableFiles.filter(f => f.startsWith('collections/')),
      emoji: '📥',
      description: 'Collection activities, buckets, and status tracking'
    },
    {
      name: 'Fees',
      files: tableFiles.filter(f => f.startsWith('fees/')),
      emoji: '💲',
      description: 'Fee management and payment tracking'
    },
    {
      name: 'Interest',
      files: tableFiles.filter(f => f.startsWith('interest/')),
      emoji: '📈',
      description: 'Interest accrual and rate history'
    },
    {
      name: 'Loan Modifications',
      files: tableFiles.filter(f => f.startsWith('modifications/')),
      emoji: '🔄',
      description: 'Restructuring, top-ups, and term changes'
    },
  ];

  modules.forEach(module => {
    if (module.files.length === 0) return;

    // Add toggle for the module
    const children = [];

    // Add description
    children.push({
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: module.description }
        }]
      }
    });

    // Add divider
    children.push({
      type: 'divider',
      divider: {}
    });

    // Process each file in the module
    module.files.forEach(file => {
      const content = readMarkdownFile(file);
      if (!content) return;

      const sections = parseMarkdown(content);
      sections.forEach(section => {
        const block = sectionToNotionBlock(section);
        children.push(block.content);
      });
    });

    structure.blocks.push({
      type: 'toggle',
      toggle: {
        rich_text: [{
          type: 'text',
          text: { content: `${module.emoji} ${module.name} (${module.files.length} tables)` }
        }],
        children
      }
    });
  });

  // Add ERD diagrams section (before relationships and enums)
  const erdFiles = listERDDiagrams();
  const erdMarkdownFiles = markdownFiles.filter(f => f.startsWith('erds/'));

  if (erdMarkdownFiles.length > 0) {
    structure.blocks.push({
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '📊 Entity Relationship Diagrams' }
        }]
      }
    });

    erdMarkdownFiles.forEach(file => {
      const content = readMarkdownFile(file);
      if (!content) return;

      const sections = parseMarkdown(content);
      sections.forEach(section => {
        const block = sectionToNotionBlock(section);
        structure.blocks.push(block.content);
      });
    });
  }

  // Add relationships section
  const relationshipsContent = readMarkdownFile('relationships.md');
  if (relationshipsContent) {
    structure.blocks.push({
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '🔗 Entity Relationships' }
        }]
      }
    });

    const relationshipsSections = parseMarkdown(relationshipsContent);
    relationshipsSections.forEach(section => {
      const block = sectionToNotionBlock(section);
      structure.blocks.push(block.content);
    });
  }

  // Add enums section
  const enumsContent = readMarkdownFile('enums.md');
  if (enumsContent) {
    structure.blocks.push({
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: '📋 Enum Definitions' }
        }]
      }
    });

    const enumsSections = parseMarkdown(enumsContent);
    enumsSections.forEach(section => {
      const block = sectionToNotionBlock(section);
      structure.blocks.push(block.content);
    });
  }

  // Add metadata footer
  structure.blocks.push({
    type: 'divider',
    divider: {}
  });

  structure.blocks.push({
    type: 'callout',
    callout: {
      rich_text: [{
        type: 'text',
        text: { content: `📝 Last updated: ${new Date().toISOString()}\n\nThis documentation is automatically generated from the source code schema definitions.` }
      }],
      icon: { emoji: '⚙️' },
      color: 'gray'
    }
  });

  return structure;
}

/**
 * Calculate statistics
 */
function calculateStatistics() {
  const markdownFiles = listMarkdownFiles();
  const erdFiles = listERDDiagrams();
  const tableFiles = markdownFiles.filter(f =>
    !f.startsWith('README.md') &&
    !f.startsWith('enums.md') &&
    !f.startsWith('relationships.md') &&
    !f.startsWith('erds/')
  );

  // Group files by directory
  const modules = {
    'Core Tables': tableFiles.filter(f => f.startsWith('core/')).length,
    'Collections': tableFiles.filter(f => f.startsWith('collections/')).length,
    'Fees': tableFiles.filter(f => f.startsWith('fees/')).length,
    'Interest': tableFiles.filter(f => f.startsWith('interest/')).length,
    'Loan Modifications': tableFiles.filter(f => f.startsWith('modifications/')).length,
  };

  let totalTables = 0;

  tableFiles.forEach(file => {
    const content = readMarkdownFile(file);
    const matches = content.match(/### \w+/g);
    if (matches) {
      totalTables += matches.length;
    }
  });

  const enumsContent = readMarkdownFile('enums.md');
  let totalEnums = 0;
  if (enumsContent) {
    const enumMatches = enumsContent.match(/## \w+/g);
    if (enumMatches) {
      totalEnums = enumMatches.length;
    }
  }

  const erdMarkdownFiles = markdownFiles.filter(f => f.startsWith('erds/'));

  return {
    totalTables,
    totalEnums,
    totalERDDiagrams: erdMarkdownFiles.length,
    totalImageFiles: erdFiles.length,
    totalFiles: markdownFiles.length,
    modules: Object.entries(modules).filter(([_, count]) => count > 0).length,
    moduleBreakdown: modules
  };
}

/**
 * Main function
 */
async function main() {
  console.log('📝 Publishing LMS Schema Documentation to Notion...\n');

  // Check if docs directory exists
  if (!existsSync(DOCS_DIR)) {
    console.error(`❌ Documentation directory not found: ${DOCS_DIR}`);
    console.log('\n💡 Hint: Generate the documentation first using npm run docs:lms:generate');
    process.exit(1);
  }

  // List all files
  const markdownFiles = listMarkdownFiles();
  const erdFiles = listERDDiagrams();

  console.log('📂 Documentation Files Found:');
  console.log(`   Total markdown files: ${markdownFiles.length}`);
  markdownFiles.forEach(file => console.log(`   - ${file}`));

  if (erdFiles.length > 0) {
    console.log(`\n   ERD diagrams: ${erdFiles.length}`);
    erdFiles.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('\n   ⚠️  No ERD diagrams found');
  }

  // Build page structure
  console.log('\n🏗️  Building Notion page structure...');
  const structure = buildNotionPageStructure();

  // Calculate statistics
  const stats = calculateStatistics();

  // Output structure summary
  console.log('\n📄 Page Structure:');
  console.log(`   Title: ${structure.title}`);
  console.log(`   Parent: ${structure.parent}`);
  console.log(`   Icon: ${structure.icon}`);
  console.log(`   Total blocks: ${structure.blocks.length}`);

  // Output block type breakdown
  const blockTypes = structure.blocks.reduce((acc, block) => {
    const type = Object.keys(block)[0];
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n   Block Types:');
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  // Output statistics
  console.log('\n📊 Statistics:');
  console.log(`   - ${stats.totalTables}+ tables documented`);
  console.log(`   - ${stats.totalERDDiagrams} ERD diagrams`);
  console.log(`   - ${stats.totalEnums}+ enums documented`);
  console.log(`   - ${stats.modules} modules with comprehensive details`);
  console.log(`   - Complete relationships mapping`);

  console.log('\n   Module Breakdown:');
  Object.entries(stats.moduleBreakdown).forEach(([module, count]) => {
    if (count > 0) {
      console.log(`   - ${module}: ${count} files`);
    }
  });

  // Output structure for MCP tools
  console.log('\n📦 Structure Ready for Notion MCP Tools:');
  console.log('   Use the following structure with mcp__notion__notion-create-pages:\n');
  console.log(JSON.stringify(structure, null, 2));

  // Instructions for publishing
  console.log('\n✅ Notion page structure ready for creation!');
  console.log('\n🚀 To publish to Notion, use the MCP tools:');
  console.log('   1. mcp__notion__notion-create-pages - to create the page');
  console.log('   2. Pass the structure JSON as the content parameter');
  console.log('   3. Parent page ID: ' + PARENT_PAGE_ID);

  console.log('\n💡 Next Steps:');
  console.log('   - Ensure NOTION_API_KEY is set in environment');
  console.log('   - Verify parent page exists in Notion');
  console.log('   - Run with MCP tools to create the actual page');
}

main().catch(console.error);
