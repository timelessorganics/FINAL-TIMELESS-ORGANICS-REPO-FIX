import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const NEW_REPO_NAME = 'timeless-organics'; // Clean, simple name
const BRANCH = 'main';

const octokit = new Octokit({ auth: TOKEN });

// Files to exclude from upload
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.env',
  '.replit',
  'replit.nix',
  '.cache',
  '.next',
  'coverage',
  '.DS_Store'
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (shouldExclude(fullPath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function createFreshRepo() {
  try {
    console.log('🔥 CREATING BRAND NEW GITHUB REPOSITORY');
    console.log('==========================================\n');
    
    console.log(`📋 Step 1: Create new repository: ${NEW_REPO_NAME}`);
    
    let repo;
    try {
      const { data } = await octokit.repos.createForOrg({
        org: OWNER,
        name: NEW_REPO_NAME,
        description: 'Timeless Organics - Founding 100 Investor Launch Platform',
        private: false,
        auto_init: false
      });
      repo = data;
      console.log(`   ✅ Created: https://github.com/${OWNER}/${NEW_REPO_NAME}\n`);
    } catch (error) {
      if (error.status === 422) {
        console.log(`   ⚠️  Repository already exists, using it...\n`);
        const { data } = await octokit.repos.get({
          owner: OWNER,
          repo: NEW_REPO_NAME
        });
        repo = data;
      } else {
        throw error;
      }
    }
    
    console.log(`📋 Step 2: Prepare files for upload`);
    const files = getAllFiles('.');
    const codeFiles = files.filter(f => 
      !f.includes('push-') && 
      !f.includes('upload-') &&
      !f.includes('consolidate-') &&
      !f.includes('create-fresh-') &&
      !f.includes('clean-github-') &&
      !f.includes('FRESH-START-')
    );
    
    console.log(`   Found ${codeFiles.length} files to upload\n`);
    
    console.log(`📋 Step 3: Create blobs and tree`);
    const blobs = [];
    
    for (const filePath of codeFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: NEW_REPO_NAME,
        content: Buffer.from(content).toString('base64'),
        encoding: 'base64'
      });
      
      blobs.push({
        path: filePath.replace(/\\/g, '/').replace(/^\.\//, ''),
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    }
    
    console.log(`   ✅ Created ${blobs.length} blobs\n`);
    
    console.log(`📋 Step 4: Create tree`);
    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: NEW_REPO_NAME,
      tree: blobs
    });
    
    console.log(`   ✅ Tree created\n`);
    
    console.log(`📋 Step 5: Create initial commit`);
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: NEW_REPO_NAME,
      message: `Initial commit - Timeless Organics Founding 100\n\n✨ Fresh deployment with all fixes:\n- PayFast Onsite Payments integration (with user_ip/user_agent fix)\n- Supabase authentication\n- Certificate generation\n- Email notifications\n- Mailchimp integration\n- Admin panel\n- Complete UI/UX`,
      tree: tree.sha,
      parents: []
    });
    
    console.log(`   ✅ Commit created: ${commit.sha.substring(0, 7)}\n`);
    
    console.log(`📋 Step 6: Create main branch`);
    try {
      await octokit.git.createRef({
        owner: OWNER,
        repo: NEW_REPO_NAME,
        ref: `refs/heads/${BRANCH}`,
        sha: commit.sha
      });
      console.log(`   ✅ Main branch created\n`);
    } catch (error) {
      if (error.status === 422) {
        await octokit.git.updateRef({
          owner: OWNER,
          repo: NEW_REPO_NAME,
          ref: `heads/${BRANCH}`,
          sha: commit.sha,
          force: true
        });
        console.log(`   ✅ Main branch updated\n`);
      } else {
        throw error;
      }
    }
    
    console.log(`📋 Step 7: Set main as default branch`);
    await octokit.repos.update({
      owner: OWNER,
      repo: NEW_REPO_NAME,
      default_branch: BRANCH
    });
    console.log(`   ✅ Default branch set to main\n`);
    
    console.log('🎉 SUCCESS - BRAND NEW REPOSITORY READY!');
    console.log('==========================================\n');
    console.log('✅ Repository: https://github.com/' + OWNER + '/' + NEW_REPO_NAME);
    console.log('✅ Branch: main (only branch)');
    console.log('✅ All code uploaded with PayFast fixes');
    console.log('\n📝 NEXT STEPS:\n');
    console.log('1. DELETE OLD REPOSITORY:');
    console.log('   https://github.com/timelessorganics/Timeless-Organics-Fouding-100/settings');
    console.log('   → Scroll to bottom → "Delete this repository"\n');
    console.log('2. DELETE OLD RAILWAY SERVICE:');
    console.log('   https://railway.app/dashboard');
    console.log('   → Select old service → Settings → Delete\n');
    console.log('3. DELETE OLD NETLIFY SITE:');
    console.log('   https://app.netlify.com/sites');
    console.log('   → Select old site → Settings → Delete\n');
    console.log('4. CREATE NEW RAILWAY DEPLOYMENT:');
    console.log('   → New Project → Deploy from GitHub');
    console.log('   → Select: timelessorganics/timeless-organics');
    console.log('   → Branch: main');
    console.log('   → Add ALL environment variables (you have backup!)\n');
    console.log('5. CREATE NEW NETLIFY DEPLOYMENT:');
    console.log('   → New Site → Import from GitHub');
    console.log('   → Select: timelessorganics/timeless-organics');
    console.log('   → Branch: main');
    console.log('   → Add environment variables (VITE_* ones)\n');
    console.log('6. TEST PAYMENT FLOW:');
    console.log('   → Visit www.timeless.organic');
    console.log('   → Complete a test purchase');
    console.log('   → PayFast modal should work!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createFreshRepo();
