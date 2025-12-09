# Overview
[Website](https://da8re62zge7z0.cloudfront.net)

An open source obsidian plugin with basic syncing. Supports both desktop and mobile. Go to the website for more details.

NOTE:
- You will need to create a free account to use this plugin, using an email and password
- Your data will be encrypted as a zip in an AWS S3 bucket. It's not read or used for anything else
- Use under your own discretion

[Backend repo](https://github.com/fDirham/fbd-obsidian-sync__monorepo)

## Tech caveats
-   Jwt credentials stored in local storage, which can be insecure
-   Syncing logic very simplistic, upload all files as zips, download a zip and delete current vault before extracting
-   .obsidian folder won't get synced
