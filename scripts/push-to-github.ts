import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function pushToGitHub() {
  try {
    console.log('🔐 Getting GitHub access token...');
    const token = await getAccessToken();
    console.log('✅ GitHub authenticated successfully!');

    const owner = 'timelessorganics';
    const repo = 'Timeless-Organics-Fouding-100';
    
    console.log('\n📝 Configuring git...');
    
    // Set git config
    try {
      execSync('git config user.email "david@timeless.organic"', { stdio: 'inherit' });
      execSync('git config user.name "Timeless Organics"', { stdio: 'inherit' });
    } catch (error) {
      console.log('Git config already set or error setting it');
    }

    console.log('\n📦 Adding all files to git...');
    execSync('git add -A', { stdio: 'inherit' });

    console.log('\n💾 Creating commit...');
    try {
      execSync('git commit -m "Initial commit: Timeless Organics Founding 100 launch site"', { stdio: 'inherit' });
    } catch (error: any) {
      if (error.message.includes('nothing to commit')) {
        console.log('ℹ️  No changes to commit');
      } else {
        throw error;
      }
    }

    console.log('\n🚀 Pushing to GitHub...');
    const remoteUrl = `https://${token}@github.com/${owner}/${repo}.git`;
    
    // Update remote to use token
    execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'inherit' });
    
    // Push to main branch
    try {
      execSync('git push -u origin main', { stdio: 'inherit' });
    } catch (error: any) {
      // If main doesn't exist, try master or create main
      console.log('ℹ️  Main branch might not exist, trying to push and set upstream...');
      execSync('git branch -M main', { stdio: 'inherit' });
      execSync('git push -u origin main --force', { stdio: 'inherit' });
    }

    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`🌐 Repository: https://github.com/${owner}/${repo}`);
    
    // Reset remote URL to not include token (security)
    execSync(`git remote set-url origin https://github.com/${owner}/${repo}.git`, { stdio: 'inherit' });

  } catch (error: any) {
    console.error('❌ Error pushing to GitHub:', error.message);
    throw error;
  }
}

pushToGitHub();
