import { Octokit } from '@octokit/rest';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';

const octokit = new Octokit({ auth: TOKEN });

async function cleanBranches() {
  try {
    console.log('🧹 CLEANING GITHUB BRANCHES');
    console.log('================================\n');
    
    console.log('📋 Step 1: List all branches');
    const { data: branches } = await octokit.repos.listBranches({
      owner: OWNER,
      repo: REPO
    });
    
    console.log(`Found ${branches.length} branches:\n`);
    branches.forEach(branch => {
      console.log(`   - ${branch.name}`);
    });
    console.log('');
    
    console.log('📋 Step 2: Ensure main is default branch');
    const { data: repo } = await octokit.repos.get({
      owner: OWNER,
      repo: REPO
    });
    
    if (repo.default_branch !== 'main') {
      console.log(`⚠️  Current default branch: ${repo.default_branch}`);
      console.log('   Updating to main...');
      
      await octokit.repos.update({
        owner: OWNER,
        repo: REPO,
        default_branch: 'main'
      });
      
      console.log('   ✅ Default branch changed to main\n');
    } else {
      console.log('   ✅ Default branch is already main\n');
    }
    
    console.log('📋 Step 3: Delete all branches except main');
    const branchesToDelete = branches.filter(b => b.name !== 'main');
    
    if (branchesToDelete.length === 0) {
      console.log('   ✅ No branches to delete - repository is clean!\n');
    } else {
      console.log(`   Deleting ${branchesToDelete.length} branches...\n`);
      
      for (const branch of branchesToDelete) {
        try {
          await octokit.git.deleteRef({
            owner: OWNER,
            repo: REPO,
            ref: `heads/${branch.name}`
          });
          console.log(`   ✅ Deleted: ${branch.name}`);
        } catch (error) {
          console.log(`   ❌ Failed to delete ${branch.name}: ${error.message}`);
        }
      }
      console.log('');
    }
    
    console.log('🎉 GITHUB CLEANUP COMPLETE!');
    console.log('================================\n');
    console.log('✅ Repository now has ONE branch: main');
    console.log('✅ Main branch contains all latest code + PayFast fixes');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Follow FRESH-START-GUIDE.md');
    console.log('   2. Deploy Railway from main branch');
    console.log('   3. Deploy Netlify from main branch');
    console.log('   4. Test payment flow');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

cleanBranches();
