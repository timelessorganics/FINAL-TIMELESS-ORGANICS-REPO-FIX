import { Octokit } from '@octokit/rest';
import fs from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const BRANCH = 'timeless-organics-founding-100';

const octokit = new Octokit({ auth: TOKEN });

async function pushFix() {
  try {
    console.log('🔧 Pushing PayFast user_ip and user_agent fix...');
    
    // Read both files
    const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
    const onsiteContent = fs.readFileSync('server/utils/payfast-onsite.ts', 'utf8');
    
    // Get current branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    
    // Create blobs for both files
    const { data: routesBlob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(routesContent).toString('base64'),
      encoding: 'base64'
    });
    
    const { data: onsiteBlob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(onsiteContent).toString('base64'),
      encoding: 'base64'
    });
    
    // Get current commit
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: ref.object.sha
    });
    
    // Create tree with both files
    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: currentCommit.tree.sha,
      tree: [
        {
          path: 'server/routes.ts',
          mode: '100644',
          type: 'blob',
          sha: routesBlob.sha
        },
        {
          path: 'server/utils/payfast-onsite.ts',
          mode: '100644',
          type: 'blob',
          sha: onsiteBlob.sha
        }
      ]
    });
    
    // Create commit
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'CRITICAL FIX: Add user_ip/user_agent to PayFast Onsite API (resolves 400 error)',
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
    
    console.log('\n✅ PayFast user context fix deployed!');
    console.log('🚂 Railway will auto-redeploy in ~60 seconds');
    console.log('\n📋 Changes applied:');
    console.log('   ✓ Capture user IP and User-Agent in /api/purchase/initiate');
    console.log('   ✓ Include user_ip, user_agent, payment_method in PayFast signature');
    console.log('   ✓ Send all required fields to PayFast Onsite API');
    console.log('\n🎯 This fixes the "400 Bad Request" error from PayFast');
    console.log('⏳ Wait for Railway deployment, then test payment on www.timeless.organic');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

pushFix();
