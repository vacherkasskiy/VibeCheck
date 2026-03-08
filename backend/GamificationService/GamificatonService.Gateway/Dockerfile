FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["GamificatonService.Gateway/GamificatonService.Gateway.csproj", "GamificatonService.Gateway/"]
COPY ["Implementations/GamificatonService.MessageBroker/GamificatonService.MessageBroker.csproj", "Implementations/GamificatonService.MessageBroker/"]
COPY ["Abstractions/GamificatonService.MessageBroker.Abstractions/GamificatonService.MessageBroker.Abstractions.csproj", "Abstractions/GamificatonService.MessageBroker.Abstractions/"]
COPY ["Implementations/Storages/GamificatonService.CacheStorage/GamificatonService.CacheStorage.csproj", "Implementations/Storages/GamificatonService.CacheStorage/"]
COPY ["Abstractions/Storages/GamificatonService.CacheStorage.Abstractions/GamificatonService.CacheStorage.Abstractions.csproj", "Abstractions/Storages/GamificatonService.CacheStorage.Abstractions/"]
COPY ["Implementations/Storages/GamificatonService.CloudStorage/GamificatonService.CloudStorage.csproj", "Implementations/Storages/GamificatonService.CloudStorage/"]
COPY ["Abstractions/Storages/GamificatonService.CloudStorage.Abstractions/GamificatonService.CloudStorage.Abstractions.csproj", "Abstractions/Storages/GamificatonService.CloudStorage.Abstractions/"]
COPY ["Implementations/Storages/GamificatonService.PersistentStorage/GamificatonService.PersistentStorage.csproj", "Implementations/Storages/GamificatonService.PersistentStorage/"]
COPY ["Abstractions/Storages/GamificatonService.PersistentStorage.Abstractions/GamificatonService.PersistentStorage.Abstractions.csproj", "Abstractions/Storages/GamificatonService.PersistentStorage.Abstractions/"]
COPY ["Abstractions/GamificatonService.Core.Abstractions/GamificatonService.Core.Abstractions.csproj", "Abstractions/GamificatonService.Core.Abstractions/"]
COPY ["Implementations/GamificatonService.Core/GamificatonService.Core.csproj", "Implementations/GamificatonService.Core/"]
RUN dotnet restore "GamificatonService.Gateway/GamificatonService.Gateway.csproj"
COPY . .
WORKDIR "/src/GamificatonService.Gateway"
RUN dotnet build "./GamificatonService.Gateway.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./GamificatonService.Gateway.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GamificatonService.Gateway.dll"]
