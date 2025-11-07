import { Octokit } from '@octokit/rest';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const FEATURE_BRANCH = 'timeless-organics-founding-100';
const MAIN_BRANCH = 'main';

const octokit = new Octokit({ auth: TOKEN });

async function forceResetToMain() {
  try {
    console.log('⚠️  FORCE RESET TO MAIN BRANCH');
    console.log('================================');
    console.log('WARNING: This will OVERWRITE main branch completely!\n');
    
    console.log(`📋 Step 1: Get feature branch reference`);
    const { data: featureRef } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${FEATURE_BRANCH}`
    });
    
    console.log(`   ✓ Feature branch SHA: ${featureRef.object.sha.substring(0, 7)}\n`);
    
    console.log(`📋 Step 2: FORCE UPDATE main to match feature branch`);
    console.log(`   Overwriting main with ${FEATURE_BRANCH}...`);
    
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${MAIN_BRANCH}`,
      sha: featureRef.object.sha,
      force: true // FORCE PUSH - overwrites main
    });
    
    console.log(`   ✅ Main branch FORCE UPDATED to ${featureRef.object.sha.substring(0, 7)}\n`);
    
    console.log(`📋 Step 3: Delete feature branch`);
    console.log(`   Removing ${FEATURE_BRANCH}...`);
    
    await octokit.git.deleteRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${FEATURE_BRANCH}`
    });
    
    console.log(`   ✅ Branch ${FEATURE_BRANCH} deleted\n`);
    
    console.log('🎉 SUCCESS - Repository now has ONE branch (main)!');
    console.log('================================\n');
    console.log('✅ COMPLETED:');
    console.log('   • Main branch = complete copy of feature branch');
    console.log('   • All PayFast fixes included');
    console.log('   • Feature branch deleted');
    console.log('   • Repository now has ONLY main branch\n');
    
    console.log('⚠️  RAILWAY UPDATE REQUIRED (DO THIS NOW):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Go to: https://railway.app/dashboard');
    console.log('2. Select: Timeless-Organics-Fouding-100-production');
    console.log('3. Click: Settings');
    console.log('4. Under "Source" section:');
    console.log('   → Change "Branch" from "timeless-organics-founding-100" to "main"');
    console.log('5. Click: "Redeploy" button');
    console.log('6. Wait ~90 seconds for deployment\n');
    
    console.log('📝 FROM NOW ON:');
    console.log('   • Push to main branch ONLY');
    console.log('   • Railway auto-deploys from main');
    console.log('   • NO MORE BRANCHES! ✨');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

forceResetToMain();
