import { Octokit } from '@octokit/rest';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';
const FEATURE_BRANCH = 'timeless-organics-founding-100';
const MAIN_BRANCH = 'main';

const octokit = new Octokit({ auth: TOKEN });

async function consolidateToMain() {
  try {
    console.log('🔄 CONSOLIDATING TO MAIN BRANCH');
    console.log('================================\n');
    
    console.log(`📋 Step 1: Get current state of both branches`);
    const { data: featureRef } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${FEATURE_BRANCH}`
    });
    
    const { data: mainRef } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${MAIN_BRANCH}`
    });
    
    console.log(`   ✓ Feature branch (${FEATURE_BRANCH}): ${featureRef.object.sha.substring(0, 7)}`);
    console.log(`   ✓ Main branch (${MAIN_BRANCH}): ${mainRef.object.sha.substring(0, 7)}\n`);
    
    console.log(`📋 Step 2: Create merge commit (preserves all history)`);
    console.log(`   Merging ${FEATURE_BRANCH} into ${MAIN_BRANCH}...`);
    
    const { data: merge } = await octokit.repos.merge({
      owner: OWNER,
      repo: REPO,
      base: MAIN_BRANCH,
      head: FEATURE_BRANCH,
      commit_message: `Merge ${FEATURE_BRANCH} into main - Consolidate to single branch\n\nConsolidates all Founding 100 work including:\n- PayFast Onsite Payments integration\n- Supabase authentication\n- Certificate generation\n- Email notifications\n- Admin panel\n- All bug fixes and improvements`
    });
    
    console.log(`   ✅ Merge successful: ${merge.sha.substring(0, 7)}\n`);
    
    console.log(`📋 Step 3: Delete old feature branch`);
    console.log(`   Removing ${FEATURE_BRANCH}...`);
    
    await octokit.git.deleteRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${FEATURE_BRANCH}`
    });
    
    console.log(`   ✅ Branch ${FEATURE_BRANCH} deleted\n`);
    
    console.log('🎉 SUCCESS - Repository consolidated to main branch!');
    console.log('================================\n');
    console.log('✅ COMPLETED ACTIONS:');
    console.log('   • All changes merged into main (merge commit)');
    console.log('   • Both branch histories preserved');
    console.log('   • Feature branch deleted');
    console.log('\n⚠️  CRITICAL - RAILWAY UPDATE REQUIRED:');
    console.log('   1. Go to https://railway.app/dashboard');
    console.log('   2. Select: Timeless-Organics-Fouding-100-production');
    console.log('   3. Settings → Source → Branch: Change from "timeless-organics-founding-100" to "main"');
    console.log('   4. Click "Redeploy" to trigger build from main');
    console.log('   5. Wait ~90 seconds for deployment');
    console.log('\n📝 FROM NOW ON:');
    console.log('   • Push ALL commits to main branch');
    console.log('   • Railway auto-deploys from main');
    console.log('   • NO MORE BRANCH CONFUSION! ✨');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔄 SAFETY NOTE:');
    console.log('   Your repository is safe - no destructive changes made');
    console.log('   Railway deployment continues from current branch');
  }
}

consolidateToMain();
