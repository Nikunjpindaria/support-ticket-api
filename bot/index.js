const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const logFile = path.join(__dirname, 'commit_log.txt');
const dateStr = new Date().toISOString();

console.log(`[Bot] Starting daily commit process at ${dateStr}`);

try {
    // 1. Append date to the log file to ensure there's a file change
    fs.appendFileSync(logFile, `Automated commit on ${dateStr}\n`);
    console.log('[Bot] Wrote to log file.');

    // Check if Git is configured locally (Fallback if not run in GH actions)
    try {
        execSync('git config user.name');
    } catch (err) {
        console.log('[Bot] Git user not configured. Using default bot credentials.');
        execSync('git config --global user.name "github-actions[bot]"');
        execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
    }

    // 2. Git operations
    execSync(`git add "${logFile}"`);
    console.log('[Bot] Added file to git index.');

    execSync(`git commit -m "chore: daily green square robot 🤖 - ${dateStr}"`);
    console.log('[Bot] Committed changes.');

    execSync('git push');
    console.log('[Bot] Pushed changes successfully. Green square secured! 🟩');
} catch (error) {
    console.error('[Bot] Failed to run git commands automatically:', error.message);
    if (error.stdout) console.error('Output:', error.stdout.toString());
    if (error.stderr) console.error('Error:', error.stderr.toString());
}
