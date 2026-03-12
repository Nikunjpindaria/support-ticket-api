# Git Green Square Bot 🟩

This is a simple Node.js bot designed to make an automated daily commit to your repository. This ensures that your Git contribution graph has a "green square" every single day!

## How it works

1. The bot runs a Node.js script (`index.js`).
2. It appends the current date and time to `commit_log.txt`.
3. It automatically runs `git add`, `git commit`, and `git push` to upload the changes.

## Running Locally

To run the bot manually on your computer:

```bash
cd bot
npm start
```

## Automatic Daily Commits via GitHub Actions

You don't need to keep your computer turned on for this to work!

A GitHub Action workflow has been set up at `../.github/workflows/bot.yml`. It will automatically run this script **every day** using GitHub's servers without any manual intervention.

You can also trigger it manually anytime by going to the **Actions** tab on your GitHub repository page on the web, selecting **Daily Green Square Bot**, and clicking **Run workflow**.
