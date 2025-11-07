import { Octokit } from '@octokit/rest';
import fs from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const BRANCH = 'timeless-organics-founding-100';

const octokit = new Octokit({ auth: TOKEN });

async function pushFix() {
  try {
    console.log('🔧 Pushing PayFast UUID fix (32-char limit)...');
    
    const fileContent = fs.readFileSync('server/utils/payfast.ts', 'utf8');
    
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    
    const { data: blob } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: Buffer.from(fileContent).toString('base64'),
      encoding: 'base64'
    });
    
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: ref.object.sha
    });
    
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
    
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Fix PayFast m_payment_id 32-char limit (strip UUID hyphens)',
      tree: tree.sha,
      parents: [ref.object.sha]
    });
    
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: commit.sha
    });
    
    console.log('\n✅ PayFast fix deployed!');
    console.log('🚂 Railway will auto-redeploy in ~60 seconds');
    console.log('\n📋 Fix applied:');
    console.log('   - Strip hyphens from UUID (36 → 32 chars)');
    console.log('   - PayFast m_payment_id now within limit');
    console.log('\n⏳ Wait for Railway deployment, then test payment on www.timeless.organic');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

pushFix();
