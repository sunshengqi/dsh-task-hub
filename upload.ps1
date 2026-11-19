# 上传脚本：建仓 + 推送 dsh-task-hub 到你的 GitHub
# 用法：代理恢复后，双击或在 PowerShell 里执行  .\upload.ps1
# 依赖：git（已有）、本机代理 127.0.0.1:7897（可改 $Proxy 变量）

$ErrorActionPreference = "Stop"
$Proxy = $null          # 你的本地代理，变了就改这里
$Repo  = "dsh-task-hub"                    # 仓库名
$User  = "sunshengqi"                      # 你的 GitHub 用户名
$Token = $env:GH_TOKEN                     # 从环境变量读 token（见下方说明）

if (-not $Token) {
  Write-Host "请先设置 token 环境变量，例如："
  Write-Host '  $env:GH_TOKEN = "github_pat_xxxx"'
  Write-Host "（就是你刚才发我的那个 PAT；建议用完去 GitHub 上 revoke）"
  exit 1
}

$src  = $PSScriptRoot                       # 本目录（含 package.json / lib / test）
$work = Join-Path $env:TEMP "dsh-task-hub-repo"
$headers = @{ Authorization = "Bearer $Token"; Accept = "application/vnd.github+json"; "User-Agent" = "upload-script" }

# ---- 0) 代理连通性自检 ----
try {
  $null = Invoke-RestMethod -Uri "https://api.github.com/zen" -Headers @{ "User-Agent" = "probe" } -Proxy $Proxy -TimeoutSec 15
  Write-Host "[OK] 代理可达 api.github.com"
} catch {
  Write-Host "[FAIL] 代理 $Proxy 不可达：$($_.Exception.Message)"
  exit 1
}

# ---- 1) 建仓（已存在则跳过）----
try {
  $r = Invoke-RestMethod -Uri "https://api.github.com/repos/$User/$Repo" -Headers $headers -Proxy $Proxy -TimeoutSec 20
  Write-Host "[SKIP] 仓库已存在：$($r.html_url)"
} catch {
  $body = @{
    name        = $Repo
    description = "DeepSeek Harness 插件：跨对话任务中心（收件箱 + 看板）。聚合所有工作区会话的待确认问题与任务状态，支持拖拽交接与工作区归档同步。"
    private     = $true
    auto_init   = $false
  } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json" -Proxy $Proxy -TimeoutSec 30
  Write-Host "[OK] 仓库已创建：$($r.html_url)"
}

# ---- 2) 本地 git init + commit ----
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $work | Out-Null
Copy-Item (Join-Path $src "*") $work -Recurse -Force
Push-Location $work
try {
  git init -b main 2>$null | Out-Null
  git add -A
  git -c user.name="sunshengqi" -c user.email="sunshengqi823@outlook.com" commit -m "init: dsh-task-hub v0.2.0（收件箱 + 看板 + 归档同步 + 搜索）" 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host "[INFO] 无变更可提交（可能已 commit）" }

  # ---- 3) push（token 嵌入 URL，一次性，不落盘到 credential）----
  git remote remove origin 2>$null
  git remote add origin "https://x-access-token:$Token@github.com/$User/$Repo.git"
  git -c http.proxy=$Proxy push -u origin main
  if ($LASTEXITCODE -eq 0) { Write-Host "`n[DONE] 已推送：https://github.com/$User/$Repo" }
  else { throw "git push 失败" }
} finally {
  Pop-Location
}
