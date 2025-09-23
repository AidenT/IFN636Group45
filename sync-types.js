#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CLI script to sync shared types between backend and frontend with decorator support
 * Uses decorators (@Frontend, @Backend, @Shared) at the top of files to determine distribution:
 * - @Frontend: Copy only to frontend/src/types
 * - @Backend: Copy only to backend/types  
 * - @Shared: Copy to both locations
 * - No decorator: Copy to both locations (default behavior)
 */

const SHARED_TYPES_DIR = path.join(__dirname, 'shared', 'types');
const BACKEND_TYPES_DIR = path.join(__dirname, 'backend', 'types');
const FRONTEND_TYPES_DIR = path.join(__dirname, 'frontend', 'src', 'types');

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to ensure
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dirPath}`);
    }
}

/**
 * Parse file content to extract decorator information
 * @param {string} filePath - Path to the file to parse
 * @returns {Array<string>} - Array of targets: ['frontend'], ['backend'], or ['frontend', 'backend']
 */
function parseFileDecorators(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').slice(0, 10); // Only check first 10 lines for performance
        
        const decorators = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('// @Frontend') || trimmedLine.startsWith('//@Frontend')) {
                decorators.push('frontend');
            } else if (trimmedLine.startsWith('// @Backend') || trimmedLine.startsWith('//@Backend')) {
                decorators.push('backend');
            } else if (trimmedLine.startsWith('// @Shared') || trimmedLine.startsWith('//@Shared')) {
                decorators.push('frontend', 'backend');
                break; // @Shared overrides any other decorators
            }
        }
        
        // If no decorators found, default to both (shared behavior)
        return decorators.length > 0 ? decorators : ['frontend', 'backend'];
    } catch (error) {
        console.warn(`⚠️  Could not parse decorators for ${filePath}, defaulting to shared`);
        return ['frontend', 'backend'];
    }
}

/**
 * Generate warning header for copied files
 * @param {string} sourceFile - Original source file path for reference
 * @returns {string} - Warning header comment
 */
function generateWarningHeader(sourceFile) {
    const relativePath = path.relative(__dirname, sourceFile).replace(/\\/g, '/');
    const timestamp = new Date().toISOString();
    
    return `/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: ${relativePath}
 * Generated on: ${timestamp}
 * 
 * To make changes:
 * 1. Edit the source file: ${relativePath}
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

`;
}

/**
 * Copy a file from source to destination with verification and warning header
 * @param {string} srcFile - Source file path
 * @param {string} destFile - Destination file path
 * @param {string} reason - Reason for copying (for logging)
 */
function copyFile(srcFile, destFile, reason = '') {
    try {
        // Read source content
        const sourceContent = fs.readFileSync(srcFile, 'utf8');
        
        // Generate warning header
        const warningHeader = generateWarningHeader(srcFile);
        
        // Combine warning header with source content
        const finalContent = warningHeader + sourceContent;
        
        // Write to destination
        fs.writeFileSync(destFile, finalContent, 'utf8');
        
        // Verify the copy (check that destination contains both header and source)
        const destContent = fs.readFileSync(destFile, 'utf8');
        if (!destContent.includes(sourceContent)) {
            console.warn(`⚠️  Content verification failed for ${path.basename(srcFile)}`);
        }
        
        const reasonText = reason ? ` (${reason})` : '';
        console.log(`✓ Copied: ${path.basename(srcFile)} → ${path.relative(__dirname, destFile)}${reasonText}`);
    } catch (error) {
        console.error(`✗ Failed to copy ${srcFile} to ${destFile}:`, error.message);
    }
}

/**
 * Process and copy files based on their decorators
 * @param {string} srcDir - Source directory
 */
function processTypesWithDecorators(srcDir) {
    // Ensure destination directories exist
    ensureDirectoryExists(BACKEND_TYPES_DIR);
    ensureDirectoryExists(FRONTEND_TYPES_DIR);
    
    // Read all files in shared types directory
    const files = fs.readdirSync(srcDir).filter(file => 
        fs.statSync(path.join(srcDir, file)).isFile()
    );
    
    const stats = {
        frontend: 0,
        backend: 0,
        shared: 0,
        skipped: 0
    };
    
    console.log('\n🔍 Analyzing files and decorators...');
    
    files.forEach(file => {
        const srcFile = path.join(srcDir, file);
        const targets = parseFileDecorators(srcFile);
        
        let decoratorInfo = '';
        if (targets.includes('frontend') && targets.includes('backend')) {
            decoratorInfo = targets.length === 2 ? '@Shared or default' : '@Shared';
            stats.shared++;
        } else if (targets.includes('frontend')) {
            decoratorInfo = '@Frontend';
            stats.frontend++;
        } else if (targets.includes('backend')) {
            decoratorInfo = '@Backend';
            stats.backend++;
        } else {
            decoratorInfo = 'No valid targets';
            stats.skipped++;
        }
        
        console.log(`📄 ${file}: ${decoratorInfo}`);
        
        // Copy to appropriate destinations
        if (targets.includes('frontend')) {
            const frontendDestFile = path.join(FRONTEND_TYPES_DIR, file);
            copyFile(srcFile, frontendDestFile, 'frontend');
        }
        
        if (targets.includes('backend')) {
            const backendDestFile = path.join(BACKEND_TYPES_DIR, file);
            copyFile(srcFile, backendDestFile, 'backend');
        }
    });
    
    // Print summary
    console.log(`\n📊 Distribution Summary:`);
    console.log(`   Frontend-only: ${stats.frontend} files`);
    console.log(`   Backend-only:  ${stats.backend} files`);
    console.log(`   Shared:        ${stats.shared} files`);
    if (stats.skipped > 0) {
        console.log(`   Skipped:       ${stats.skipped} files`);
    }
}

/**
 * Main function to sync types
 */
function syncTypes() {
    console.log('🔄 Starting type synchronization...');
    console.log(`📂 Source: ${path.relative(__dirname, SHARED_TYPES_DIR)}`);
    
    // Check if shared types directory exists
    if (!fs.existsSync(SHARED_TYPES_DIR)) {
        console.error(`✗ Error: Shared types directory not found: ${SHARED_TYPES_DIR}`);
        process.exit(1);
    }
    
    // Get list of files to be copied
    const files = fs.readdirSync(SHARED_TYPES_DIR).filter(file => 
        fs.statSync(path.join(SHARED_TYPES_DIR, file)).isFile()
    );
    
    if (files.length === 0) {
        console.log('⚠️  No files found in shared types directory');
        return;
    }
    
    console.log(`📋 Found ${files.length} type files: ${files.join(', ')}`);
    
    // Process files with decorator support
    processTypesWithDecorators(SHARED_TYPES_DIR);
    
    console.log('\n✅ Type synchronization completed successfully!');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 Type Synchronization Script

Usage: node sync-types.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

Description:
  This script copies type definition files from the /shared/types directory
  to /backend/types and/or /frontend/src/types based on decorators.
  
  Decorator Usage:
  • // @Frontend    - Copy only to frontend/src/types
  • // @Backend     - Copy only to backend/types
  • // @Shared      - Copy to both locations
  • No decorator   - Default to shared (both locations)
  
  Features:
  • Create target directories if they don't exist
  • Parse decorator comments in first 10 lines of files
  • Add warning headers to prevent direct editing of generated files
  • Provide detailed logging with distribution statistics
  • Handle errors gracefully

Examples:
  node sync-types.js           # Sync all types
  npm run sync-types           # Using npm script
`);
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require('./package.json');
    console.log(`Type Sync Script v${packageJson.version}`);
    process.exit(0);
}

// Run the sync process
try {
    syncTypes();
} catch (error) {
    console.error('✗ Error during type synchronization:', error.message);
    process.exit(1);
}