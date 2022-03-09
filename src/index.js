#!/usr/bin/env node

import { GetHtmlSEOString } from './Seo';
import { promises as fs } from 'fs';

const version = '1.0.0';
const help = process.argv.includes('--help');
const verbose = process.argv.includes('--verbose');
const waitkey = process.argv.includes('--waitkey');
const basePath = !process.argv.includes('--base-path') ? process.cwd() : process.argv[process.argv.indexOf('--base-path') + 1];
const buildDir = !process.argv.includes('--build-dir') ? 'build' : process.argv[process.argv.indexOf('--build-dir') + 1];
const fileName = !process.argv.includes('--file') ? 'index.html' : process.argv[process.argv.indexOf('--file') + 1];
const configFile = !process.argv.includes('--config') ? 'seo.json' : process.argv[process.argv.indexOf('--config') + 1];
const example = !process.argv.includes('--example');

const seoExample = {
    title: "Example Title",
    description: "Example Description",
    keywords: "Example Keywords",
    author: "Example Author",
    openGraph: {
        url: "https://example.com",
        title: "Example Title",
        description: "Example Description",
        image: "https://example.com/image.jpg",
        site_name: "Example Site Name",
        type: "website",
        locale: "it_IT",
    },
    twitter: {
        image: "https://example.com/image.jpg",
        url: "https://example.com",
        card: "summary_large_image",
        title: "Example Title",
        description: "Example Description",
    },
    favicon: undefined,
    manifest: undefined
};

const seoProps = {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    keywords: { type: 'string', required: true },
    author: { type: 'string', required: true },
    openGraph: {
        type: 'object',
        required: false,
        props: {
            url: { type: 'string', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string', required: true },
            image: { type: 'string', required: true },
            site_name: { type: 'string', required: true },
            type: { type: 'string', required: true },
            locale: { type: 'string', required: true },
        }
    },
    twitter: {
        type: 'object',
        required: false,
        props: {
            image: { type: 'string', required: true },
            url: { type: 'string', required: true },
            card: { type: 'string', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string', required: true },
        }
    },
    favicon: { type: 'string', required: false },
    manifest: { type: 'string', required: false },
};

/**
 * @description 
 */
const ingectSEOData = async() => {
    if (process.argv.length > 2) {
        try {
            let config = {};
            if (example) {
                config = seoExample;
            } else {
                config = JSON.parse(await fs.readFile(`${basePath}/${configFile}`, 'utf8'));
            }
            // Check if the config file is valid using the seoProps object
            Object.keys(seoProps).forEach(key => {
                if (seoProps[key].required && !config[key]) {
                    throw new Error(`Missing required property: ${key}`);
                }
                if (config[key]) {
                    if (seoProps[key].type === 'string') {
                        if (typeof config[key] !== 'string') {
                            throw new Error(`Property ${key} is not a string`);
                        }
                    } else if (seoProps[key].type === 'object') {
                        if (typeof config[key] !== 'object') {
                            throw new Error(`Property ${key} is not an object`);
                        }
                        Object.keys(seoProps[key].props).forEach(prop => {
                            if (seoProps[key].props[prop].required && !config[key][prop]) {
                                throw new Error(`Missing required property: ${key}.${prop}`);
                            }
                        });
                    }
                }
            });
            // Inject the SEO data into the html file
            const html = await fs.readFile(`${basePath}/${buildDir}/${fileName}`, 'utf8');
            const seoString = GetHtmlSEOString(config);
            const newHtml = html.replace(/<\/head>/, `${seoString}</head>`);
            await fs.writeFile(`${basePath}/${buildDir}/${fileName}`, newHtml);
            log(`SEO data injected into ${fileName}`);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else {
        console.error('Missing required arguments');
        process.exit(1);
    }
}

/**
 * 
 * @param {*} message - The message to log to the console
 * @description Logs a message to the console if verbose mode is enabled
 */
function log(message) {
    if (verbose) {
        console.log(message);
    }
}

/**
 * 
 * @returns {string} - The help text for the program in the console
 */
function printHelp() {
    return `\n\nJS SEO Ingector - v${version}\n\n` +
        `A Javascript command to automatically modify the main html file (like index.html) to add the provided SEO meta tags and more. Designed for Create React App.\n` +
        'It does not replace the existing meta tags, but adds them to the head of the html file.\n\n' +
        `Usage: npx js-seo-ingector [options]\n\n` +
        `Options:\n` +
        `  --help                 Print this help message\n` +
        `  --version              Print the version of this tool\n` +
        `  --verbose              Print verbose output\n` +
        `  --waitkey              Wait for a keypress before exiting\n` +
        `  --base-path            The base path to the project (defaults to current working directory)\n` +
        `  --build-dir            The build directory (defaults to build)\n` +
        `  --file                 The file to inject the SEO data into (defaults to index.html)\n` +
        `  --config               The config file to use (defaults to seo.json)\n` +
        `  --example              Use the example config file\n` +
        `\n\n` +
        `Example config file (seo.json):\n` +
        `{\n` +
        `  "title": "Example Title",\n` +
        `  "description": "Example Description",\n` +
        `  "keywords": "Example Keywords",\n` +
        `  "author": "Example Author",\n` +
        `  "openGraph": {\n` +
        `    "url": "https://example.com",\n` +
        `    "title": "Example Title",\n` +
        `    "description": "Example Description",\n` +
        `    "image": "https://example.com/image.jpg",\n` +
        `    "site_name": "Example Site Name",\n` +
        `    "type": "website",\n` +
        `    "locale": "it_IT"\n` +
        `  },\n` +
        `  "twitter": {\n` +
        `    "image": "https://example.com/image.jpg",\n` +
        `    "url": "https://example.com",\n` +
        `    "card": "summary_large_image",\n` +
        `    "title": "Example Title",\n` +
        `    "description": "Example Description"\n` +
        `  },\n` +
        `  "favicon": "https://example.com/favicon.ico",\n` +
        `  "manifest": "https://example.com/manifest.json"\n` +
        `}\n\n` +
        `Examples:\n` +
        `  npx js-seo-ingector --verbose\n` +
        `  npx js-seo-ingector --base-path=./my-project --build-dir=build --file=index.html --config=seo.json\n` +
        `\n\n`;
}


(async() => {
    if (help) {
        console.log(printHelp());
    }
    if (process.argv.includes('--version')) {
        console.log(version);
    }
    await ingectSEOData();
    // wait for user input to exit
    if (waitkey) {
        console.log('\n\nPress any key to exit...');
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function(text) {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
})()