import { NextRequest, NextResponse } from 'next/server';

interface PushPayload {
  token: string;
  repoName: string;
  isPrivate: boolean;
  files: Record<string, string>;
  commitMessage: string;
  workspaceName: string;
  workspaceDescription?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PushPayload;
  const { token, repoName, isPrivate, files, commitMessage, workspaceName, workspaceDescription } = body;

  if (!token || !repoName) {
    return NextResponse.json({ success: false, message: 'Token e nome do repositorio sao obrigatorios.' }, { status: 400 });
  }

  const ghHeaders = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const userRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
  if (!userRes.ok) {
    return NextResponse.json({ success: false, message: 'Token do GitHub invalido ou expirado.' }, { status: 401 });
  }
  const user = await userRes.json() as { login: string };
  const username = user.login;

  const repoCheck = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers: ghHeaders });
  let defaultBranch = 'main';

  if (repoCheck.status === 404) {
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        name: repoName,
        description: workspaceDescription || `Workspace "${workspaceName}" - AnjosDevOS`,
        private: isPrivate,
        auto_init: true,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json() as { message: string };
      return NextResponse.json({ success: false, message: `Falha ao criar repositorio: ${err.message}` }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 1500));
  } else {
    const repoData = await repoCheck.json() as { default_branch?: string };
    defaultBranch = repoData.default_branch ?? 'main';
  }

  const branchRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/ref/heads/${defaultBranch}`, { headers: ghHeaders });
  if (!branchRes.ok) {
    return NextResponse.json({ success: false, message: 'Falha ao obter referencia da branch.' }, { status: 500 });
  }
  const branchData = await branchRes.json() as { object: { sha: string } };
  const latestSha = branchData.object.sha;

  const fileEntries = Object.entries(files);
  const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  for (const [path, fileContent] of fileEntries) {
    const blobRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/blobs`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ content: Buffer.from(fileContent).toString('base64'), encoding: 'base64' }),
    });
    if (!blobRes.ok) continue;
    const blob = await blobRes.json() as { sha: string };
    treeItems.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const treeRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/trees`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ base_tree: latestSha, tree: treeItems }),
  });
  if (!treeRes.ok) {
    return NextResponse.json({ success: false, message: 'Falha ao criar tree no GitHub.' }, { status: 500 });
  }
  const tree = await treeRes.json() as { sha: string };

  const commitRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/commits`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      message: commitMessage || `feat: sync workspace "${workspaceName}" via AnjosDevOS`,
      tree: tree.sha,
      parents: [latestSha],
    }),
  });
  if (!commitRes.ok) {
    return NextResponse.json({ success: false, message: 'Falha ao criar commit.' }, { status: 500 });
  }
  const commit = await commitRes.json() as { sha: string };

  const updateRef = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/refs/heads/${defaultBranch}`, {
    method: 'PATCH',
    headers: ghHeaders,
    body: JSON.stringify({ sha: commit.sha }),
  });
  if (!updateRef.ok) {
    return NextResponse.json({ success: false, message: 'Falha ao atualizar a branch.' }, { status: 500 });
  }

  const repoUrl = `https://github.com/${username}/${repoName}`;
  return NextResponse.json({
    success: true,
    repoUrl,
    username,
    commitSha: commit.sha,
    filesCount: fileEntries.length,
    message: `Workspace sincronizado: ${fileEntries.length} arquivo(s) para ${repoUrl}`,
  });
}