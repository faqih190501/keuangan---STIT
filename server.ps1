# Lightweight Static HTTP Server for SIMPEL-IF
param([int]$Port = 8080)

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "SIMPEL-IF Web Server running at $prefix"
} catch {
    Write-Error "Failed to start listener on $prefix : $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
}

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $localPath = Join-Path $rootDir ($urlPath.TrimStart("/\").Replace("/", "\"))

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }

        $response.OutputStream.Close()
    } catch {
        # continue loop
    }
}
