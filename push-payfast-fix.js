import { Octokit } from '@octokit/rest';
import fs from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const BRANCH = 'timeless-organics-founding-100';

const octokit = new Octokit({ auth: TOKEN });

async function pushPayFastFix() {
  try {
    console.log('🔧 Pushing PayFast URL fix to GitHub...');
    
    // Get current branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    
    console.log(`📍 Current commit: ${ref.object.sha.substring(0, 7)}`);
    
    // Read the fixed payfast.ts file
    const fileContent = fs.readFileSync('server/utils/payfast.ts', 'utf8');
    
    // Create blob for the file
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(fileContent).toString('base64'),
      encoding: 'base64'
    });
    
    console.log('✓ Created blob for payfast.ts');
    
    // Get the current commit's tree
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: ref.object.sha
    });
    
    // Create new tree with updated file
    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: currentCommit.tree.sha,
      tree: [{
        path: 'server/utils/payfast.ts',
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      }]
    });
    
    console.log('✓ Created tree');
    
    // Create commit
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Fix PayFast URLs: Use frontend for return/cancel, backend for notify',
      tree: tree.sha,
      parents: [ref.object.sha]
    });
    
    console.log(`✓ Created commit: ${commit.sha.substring(0, 7)}`);
    
    // Update branch reference
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: commit.sha
    });
    
    console.log(`\n✅ SUCCESS! PayFast fix pushed to ${BRANCH}`);
    console.log(`🔗 https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`);
    console.log('\n⏳ Railway will auto-deploy in ~2 minutes');
    console.log('💰 Payment will work after deployment completes!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

pushPayFastFix();
