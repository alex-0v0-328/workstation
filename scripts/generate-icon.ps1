Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '../resources'
[System.IO.Directory]::CreateDirectory($iconDirectory) | Out-Null
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(0, 103, 192))
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$graphics.FillRectangle($whiteBrush, 55, 58, 26, 140)
$graphics.FillRectangle($whiteBrush, 115, 108, 26, 90)
$graphics.FillRectangle($whiteBrush, 175, 58, 26, 140)
$pngPath = Join-Path $iconDirectory 'icon.png'
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$whiteBrush.Dispose()
$bitmap.Dispose()
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoStream = [System.IO.File]::Create((Join-Path $iconDirectory 'icon.ico'))
$writer = New-Object System.IO.BinaryWriter $icoStream
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]1)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([uint16]1)
$writer.Write([uint16]32)
$writer.Write([uint32]$pngBytes.Length)
$writer.Write([uint32]22)
$writer.Write($pngBytes)
$writer.Dispose()
