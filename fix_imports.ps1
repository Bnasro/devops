# PowerShell script to fix mongoose imports
$files = Get-ChildItem -Path "src\models\*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace named imports with default import
    $content = $content -replace "import \{ Schema, model \} from 'mongoose';", "import mongoose from 'mongoose';`nconst { Schema, model } = mongoose;"
    $content = $content -replace "import \{ Schema, model, Types \} from 'mongoose';", "import mongoose from 'mongoose';`nconst { Schema, model, Types } = mongoose;"
    
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Fixed imports in $($file.Name)"
}