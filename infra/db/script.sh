dotnet ef migrations add InitialCreate \
  --project Implementations/Storages/ReviewService.PersistentStorage/ReviewService.PersistentStorage.csproj \
  --startup-project ReviewService.Gateway/ReviewService.Gateway.csproj;
  
dotnet ef database update \
  --project Implementations/Storages/ReviewService.PersistentStorage/ReviewService.PersistentStorage.csproj \
  --startup-project ReviewService.Gateway/ReviewService.Gateway.csproj;