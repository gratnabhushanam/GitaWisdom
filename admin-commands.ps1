param(
  [ValidateSet('help','login','stats','users','add-movie','add-story','add-video')]
  [string]$Action = 'help',

  [string]$BaseUrl = 'http://localhost:8888',
  [string]$Email = 'ratnabhushanam88@gmail.com',
  [SecureString]$Password = (ConvertTo-SecureString 'pavan@123' -AsPlainText -Force),

  [string]$Title = 'Krishna Wisdom Upload',
  [string]$Description = 'Uploaded via admin script',
  [string]$VideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  [int]$ReleaseYear = 2025,
  [int]$Chapter = 1,
  [string]$Summary = 'Short wisdom summary',
  [string]$Content = 'Full story content goes here.',
  [string]$Category = 'reels',
  [bool]$IsKids = $false,
  [string]$Tags = 'bhakti,gita'
)

$ErrorActionPreference = 'Stop'

function Show-Help {
  Write-Host 'Admin API Command Script' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Examples:' -ForegroundColor Cyan
  Write-Host '  .\admin-commands.ps1 -Action login'
  Write-Host '  .\admin-commands.ps1 -Action stats'
  Write-Host '  .\admin-commands.ps1 -Action users'
  Write-Host '  .\admin-commands.ps1 -Action add-movie -Title "Bhagavad Gita Intro"'
  Write-Host '  .\admin-commands.ps1 -Action add-story -Title "Arjuna Story" -Chapter 2'
  Write-Host '  .\admin-commands.ps1 -Action add-video -Title "Daily Sloka Reel" -Category reels -IsKids $true'
  Write-Host ''
  Write-Host 'Optional:' -ForegroundColor Cyan
  Write-Host '  -BaseUrl http://localhost:8888'
  Write-Host '  -Email ratnabhushanam88@gmail.com -Password pavan@123'
}

function Get-TagsArray([string]$TagString) {
  if ([string]::IsNullOrWhiteSpace($TagString)) { return @() }
  return ($TagString -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
}

function ConvertTo-PlainText {
  param([SecureString]$SecureString)

  if ($null -eq $SecureString) { return $null }

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Get-AdminLogin {
  $plainPassword = ConvertTo-PlainText -SecureString $Password
  $loginBody = @{ email = $Email; password = $plainPassword } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/login" -ContentType 'application/json' -Body $loginBody
  if (-not $login.token) {
    throw 'Login failed: token not returned.'
  }
  return $login
}

function Invoke-AdminApi {
  param(
    [string]$Method,
    [string]$Path,
    [hashtable]$Body
  )

  $login = Get-AdminLogin
  $headers = @{ Authorization = "Bearer $($login.token)" }

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri "$BaseUrl$Path" -Headers $headers -ContentType 'application/json' -Body ($Body | ConvertTo-Json -Depth 8)
  }

  return Invoke-RestMethod -Method $Method -Uri "$BaseUrl$Path" -Headers $headers
}

try {
  switch ($Action) {
    'help' {
      Show-Help
    }

    'login' {
      $result = Get-AdminLogin
      [PSCustomObject]@{
        id = $result.id
        name = $result.name
        email = $result.email
        role = $result.role
        tokenPreview = "$($result.token.Substring(0, [Math]::Min(24, $result.token.Length)))..."
      } | Format-List | Out-String | Write-Host
    }

    'stats' {
      $result = Invoke-AdminApi -Method 'Get' -Path '/api/auth/stats'
      $result | ConvertTo-Json -Depth 8
    }

    'users' {
      $result = Invoke-AdminApi -Method 'Get' -Path '/api/auth/users'
      $result | ConvertTo-Json -Depth 8
    }

    'add-movie' {
      $movie = @{
        title = $Title
        description = $Description
        videoUrl = $VideoUrl
        thumbnail = ''
        releaseYear = $ReleaseYear
        ownerHistory = 'Added via admin script'
        tags = (Get-TagsArray -TagString $Tags)
      }
      $result = Invoke-AdminApi -Method 'Post' -Path '/api/movies' -Body $movie
      $result | ConvertTo-Json -Depth 8
    }

    'add-story' {
      $story = @{
        title = $Title
        summary = $Summary
        content = $Content
        chapter = $Chapter
        thumbnail = ''
        tags = (Get-TagsArray -TagString $Tags)
      }
      $result = Invoke-AdminApi -Method 'Post' -Path '/api/stories' -Body $story
      $result | ConvertTo-Json -Depth 8
    }

    'add-video' {
      $video = @{
        title = $Title
        description = $Description
        videoUrl = $VideoUrl
        category = $Category
        isKids = $IsKids
        tags = (Get-TagsArray -TagString $Tags)
      }
      $result = Invoke-AdminApi -Method 'Post' -Path '/api/videos' -Body $video
      $result | ConvertTo-Json -Depth 8
    }
  }
}
catch {
  Write-Host "Command failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
