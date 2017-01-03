#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

(function bambooJest() {

	console.log("Parsing Jest code coverage report: coverage-summary.json.");

	// Resolve app root relative to this script;
	const root = path.resolve( process.cwd() );

	// Need package.json and bamboo-jest configs
	const packageJsonPath = path.resolve(root, 'package.json');

	// These could throw exit code 1 errors if they 404;
	// If we can't find the files we want the build script to error out;
	const packageJson = require(packageJsonPath);

  // Get jest configs;
  const jest = packageJson && packageJson.jest;

  if (jest) {
    // Get the coverage directory path from config;
  	// and the coverage summary file;
  	const coverageDirectory = jest.coverageDirectory;
  	const coverageSummaryPath = (coverageDirectory)? path.resolve(root, coverageDirectory, 'coverage-summary.json'): null;

  	// Make sure we have code coverage thresholds in
    // the Jest configuration;
  	const thresholds = jest.coverageThreshold && jest.coverageThreshold.global;

  	if (thresholds && coverageSummaryPath) {
  		// Where we are writing the file;
  		const filename = path.resolve(root, 'coverage.json');

  		// Get the results of our jest code coverage;
  		const results = require(coverageSummaryPath);
  		const summary = results.total;

  		// Make our Mocha test object;
  		const output = {
  			stats: {
  				"tests": 0,
  				"passes": 0,
  				"failures": 0,
  				"duration": 0,
  				"start": new Date(),
  				"end": new Date()
  			},
  		    failures: [],
  		    passes: [],
  		    skipped: []
  		};

  		// Go through the summary object add process tests;
  		const tests = Object.keys(summary);
  		tests.forEach((test) => {
  			output.stats.tests++;
  			if (summary[test].pct >= thresholds[test]) { // Passed test;
  				output.stats.passes++;
  				output.passes.push({
  					"title": test,
  					"fullTitle": test.toUpperCase(),
  					"duration": 0,
  					"errorCount": 0
  				});
  			} else { // Failed test;
  				output.stats.failures++;
  				output.failures.push({
  					"title": test,
  					"fullTitle": test.toUpperCase(),
  					"duration": 0,
  					"errorCount": 1,
  					"error": `Coverage for ${test} (${summary[test].pct}%) does not meet threshold (${thresholds[test]}%).`
  				});
  			};
  		});

  		// Write the results of the test;
  		fs.writeFileSync(filename, JSON.stringify(output, null, 2), 'utf-8');
  		console.log("Parsed coverage-summary.json into coverage.json.");
  		console.log(`Results: ${output.stats.tests} tests, ${output.stats.failures} failures, ${output.stats.passes} passes`);
  	};
  } else {
    throw new Error('Missing jest object in package.json.');
  };
})();
