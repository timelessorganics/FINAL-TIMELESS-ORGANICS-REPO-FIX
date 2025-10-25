import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'timelessorganics';
const REPO = 'Timeless-Organics-Fouding-100';

const octokit = new Octokit({ auth: TOKEN });

const EXCLUDE = [
  'node_modules',
  'dist',
  '.git',
  'attached_assets',
  'upload-to-github.js',
  '.replit',
  'replit.nix',
  '.cache',
  '.config',
  'package-lock.json',
  '.npm',
  '.local'
];

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (EXCLUDE.some(ex => relativePath.startsWith(ex) || item === ex)) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        path: relativePath,
        content: fs.readFileSync(fullPath)
      });
    }
  }
  
  return files;
}

async function createBlobs(files) {
  console.log(`Creating ${files.length} blobs...`);
  const blobs = [];
  
  for (const file of files) {
    try {
      const { data } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: file.content.toString('base64'),
        encoding: 'base64'
      });
      blobs.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: data.sha
      });
      console.log(`✓ ${file.path}`);
    } catch (error) {
      console.error(`✗ ${file.path}:`, error.message);
    }
  }
  
  return blobs;
}

async function uploadToGitHub() {
  try {
    console.log('🔍 Collecting files...');
    const files = await getAllFiles('.');
    console.log(`📦 Found ${files.length} files to upload\n`);

    console.log('☁️  Uploading to GitHub...');
    const blobs = await createBlobs(files);

    console.log('\n🌳 Creating tree...');
    const { data: tree } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      tree: blobs
    });

    console.log('💾 Creating commit...');
    const { data: commit } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: 'Initial commit: Timeless Organics Founding 100 launch site',
      tree: tree.sha,
      parents: []
    });

    console.log('🚀 Updating main branch...');
    await octokit.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: 'refs/heads/main',
      sha: commit.sha
    });

    console.log('\n✅ SUCCESS! Code pushed to GitHub!');
    console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
  } catch (error) {
    if (error.message.includes('Reference already exists')) {
      console.log('⚠️  Main branch exists. Updating instead...');
      
      const { data: ref } = await octokit.git.getRef({
        owner: OWNER,
        repo: REPO,
        ref: 'heads/main'
      });

      const files = await getAllFiles('.');
      const blobs = await createBlobs(files);
      
      const { data: tree } = await octokit.git.createTree({
        owner: OWNER,
        repo: REPO,
        tree: blobs
      });

      const { data: commit } = await octokit.git.createCommit({
        owner: OWNER,
        repo: REPO,
        message: 'Update: Timeless Organics Founding 100 launch site',
        tree: tree.sha,
        parents: [ref.object.sha]
      });

      await octokit.git.updateRef({
        owner: OWNER,
        repo: REPO,
        ref: 'heads/main',
        sha: commit.sha
      });

      console.log('\n✅ SUCCESS! Code updated on GitHub!');
      console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

uploadToGitHub();
