$body = @{
    query = "{ events { id title description eventDate location organizer { fullName } category { name } } }"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/graphql" -Method POST -ContentType "application/json" -Body $body
