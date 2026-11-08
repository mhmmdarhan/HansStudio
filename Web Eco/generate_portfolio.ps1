$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$imageDirectory = Join-Path $root 'Images'
$outputPath = Join-Path $root 'portfolio-data.js'
$supportedExtensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif')
$categoryOrder = @{
  Nature = 0
  Animal = 1
  Interior = 2
  Fashion = 3
  Lainnya = 4
}
$knownItems = @{
  'Pemandangan Meteor 2.jpg' = @('Nature', 'Meteorfall', 'Pemandangan langit malam dengan meteor')
  'Pemandangan bukitt.jpg' = @('Nature', 'Above the hills', 'Pemandangan bukit dan alam terbuka')
  'Kucing Oren 2.jpg' = @('Animal', 'Orange day', 'Potret kucing oren')
  'Kucing abu abu.jpeg' = @('Animal', 'Soft focus', 'Potret kucing abu-abu')
  'interior 3.jpg' = @('Interior', 'Quiet geometry', 'Visual interior ruangan modern')
  'interior 2.jpg' = @('Interior', 'Warm minimal', 'Inspirasi interior rumah yang hangat')
  'Fashion Dark Clean Boy Outfit Idea _ Leather Jacket Streetwear Aesthetic.jpg' = @('Fashion', 'Dark streetwear', 'Visual outfit streetwear dengan jaket kulit hitam')
  'Fashion 1.jpg' = @('Fashion', 'Everyday editorial', 'Konsep outfit fashion dengan jaket kulit dan aksesori')
}

if (-not (Test-Path -LiteralPath $imageDirectory -PathType Container)) {
  throw "Folder gambar tidak ditemukan: $imageDirectory"
}

$items = @(
  Get-ChildItem -LiteralPath $imageDirectory -File |
    Where-Object { $supportedExtensions -contains $_.Extension.ToLowerInvariant() } |
    ForEach-Object {
      $file = $_
      if ($knownItems.ContainsKey($file.Name)) {
        $category, $title, $alt = $knownItems[$file.Name]
      } else {
        $category = 'Lainnya'
        $rules = @(
          @{ Name = 'Nature'; Keywords = @('nature', 'alam', 'pemandangan', 'landscape', 'gunung', 'pantai', 'meteor') },
          @{ Name = 'Animal'; Keywords = @('animal', 'hewan', 'kucing', 'anjing', 'satwa') },
          @{ Name = 'Interior'; Keywords = @('interior', 'ruangan', 'rumah', 'kamar') },
          @{ Name = 'Fashion'; Keywords = @('fashion', 'outfit', 'pakaian', 'baju', 'streetwear') }
        )
        foreach ($rule in $rules) {
          $matched = $false
          foreach ($keyword in $rule.Keywords) {
            if ($file.BaseName.IndexOf($keyword, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
              $category = $rule.Name
              $matched = $true
              break
            }
          }
          if ($matched) { break }
        }

        $title = ($file.BaseName -replace '[_-]+', ' ' -replace '\s+', ' ').Trim()
        $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLowerInvariant())
        $alt = $title
      }

      [pscustomobject]@{
        SortOrder = $categoryOrder[$category]
        FileName = $file.Name
        src = 'Images/' + [Uri]::EscapeDataString($file.Name)
        category = $category
        title = $title
        alt = $alt
      }
    } |
    Sort-Object SortOrder, @{ Expression = { $_.FileName.ToLowerInvariant() } } |
    ForEach-Object {
      [pscustomobject]@{
        src = $_.src
        category = $_.category
        title = $_.title
        alt = $_.alt
      }
    }
)

$json = ConvertTo-Json -InputObject $items -Depth 4
$content = "window.HANSSTUDIO_PORTFOLIO = $json;`r`n"
$encoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $content, $encoding)
Write-Output "Portofolio diperbarui: $($items.Count) gambar ditemukan."
Write-Output "File dibuat: portfolio-data.js"
