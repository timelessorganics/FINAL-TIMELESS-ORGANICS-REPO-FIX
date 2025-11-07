import { Octokit } from '@octokit/rest';
import fs from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const BRANCH = 'timeless-organics-founding-100';

const octokit = new Octokit({ auth: TOKEN });

async function updateEnvDocs() {
  try {
    console.log('📝 Adding FRONTEND_URL documentation...');
    
    const content = `# Environment Variables Required

## Railway Backend
These must be set in Railway Variables tab:

\`\`\`
FRONTEND_URL=https://www.timeless.organic
BACKEND_URL=https://timeless-organics-fouding-100-production.up.railway.app

PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_MODE=production

DATABASE_URL=your_supabase_url
SESSION_SECRET=your_session_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=studio@timeless.organic
SMTP_PASS=your_gmail_app_password
MAILCHIMP_API_KEY=your_key
MAILCHIMP_SERVER=your_server
MAILCHIMP_LIST_ID=033fba3146
\`\`\`

## Critical Fix
**FRONTEND_URL must be explicitly set** - without it, PayFast return/cancel URLs may be incorrect.
`;
    
    // Get current branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    
    // Create blob
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(content).toString('base64'),
      encoding: 'base64'
    });
    
    // Get current commit tree
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: ref.object.sha
    });
    
    // Create new tree
    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: currentCommit.tree.sha,
      tree: [{
        path: 'RAILWAY_ENV_SETUP.md',
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      }]
    });
    
    // Create commit
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Add Railway environment variable documentation - FRONTEND_URL required',
      tree: tree.sha,
      parents: [ref.object.sha]
    });
    
    // Update branch
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: commit.sha
    });
    
    console.log('\n✅ Documentation added');
    console.log('\n🚨 CRITICAL: Add this to Railway Variables NOW:');
    console.log('   FRONTEND_URL=https://www.timeless.organic');
    console.log('\nWithout it, PayFast receives wrong return/cancel URLs and rejects payment.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateEnvDocs();
