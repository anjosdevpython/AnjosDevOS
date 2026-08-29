# AnjosDevOS Run Doc

## Reproduce uncommitted artifacts

This is the main checkout — no file copying needed. Dependencies are already installed in `node_modules/`.

If starting fresh:
```bash
npm install
```

## Run the dev server

Default port: 3000

### Windows (PowerShell detach)

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

stdout and stderr go to DIFFERENT files. Confirm pid survived:
```powershell
powershell -NoProfile -Command "Get-Process -Id <pid>"
```

### POSIX

```bash
npm run dev > <log> 2> <log>.err &
```

## Health check

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`
