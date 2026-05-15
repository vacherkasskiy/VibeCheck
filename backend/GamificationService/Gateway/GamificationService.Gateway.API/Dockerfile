FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["GamificationService/Gateway/GamificationService.Gateway.API/GamificationService.Gateway.API.csproj", "GamificationService/Gateway/GamificationService.Gateway.API/"]
COPY ["GamificationService/Abstractions/Infrastructure/GamificatonService.PersistentStorage.Abstractions/GamificatonService.PersistentStorage.Abstractions.csproj", "GamificationService/Abstractions/Infrastructure/GamificatonService.PersistentStorage.Abstractions/"]
COPY ["GamificationService/Abstractions/GamificatonService.Core.Abstractions/GamificatonService.Core.Abstractions.csproj", "GamificationService/Abstractions/GamificatonService.Core.Abstractions/"]
COPY ["GamificationService/Abstractions/Infrastructure/GamificatonService.MessageBroker.Abstractions/GamificatonService.MessageBroker.Abstractions.csproj", "GamificationService/Abstractions/Infrastructure/GamificatonService.MessageBroker.Abstractions/"]
COPY ["GamificationService/Abstractions/Infrastructure/GamificatonService.CloudStorage.Abstractions/GamificatonService.CloudStorage.Abstractions.csproj", "GamificationService/Abstractions/Infrastructure/GamificatonService.CloudStorage.Abstractions/"]
COPY ["GamificationService/Implementations/GamificatonService.Core/GamificatonService.Core.csproj", "GamificationService/Implementations/GamificatonService.Core/"]
COPY ["GamificationService/Abstractions/Infrastructure/GamificatonService.CacheStorage.Abstractions/GamificatonService.CacheStorage.Abstractions.csproj", "GamificationService/Abstractions/Infrastructure/GamificatonService.CacheStorage.Abstractions/"]
COPY ["GamificationService/Implementations/Infrastructure/GamificatonService.PersistentStorage/GamificatonService.PersistentStorage.csproj", "GamificationService/Implementations/Infrastructure/GamificatonService.PersistentStorage/"]
COPY ["GamificationService/Implementations/Infrastructure/GamificatonService.CloudStorage/GamificatonService.CloudStorage.csproj", "GamificationService/Implementations/Infrastructure/GamificatonService.CloudStorage/"]
COPY ["GamificationService/Implementations/Infrastructure/GamificatonService.CacheStorage/GamificatonService.CacheStorage.csproj", "GamificationService/Implementations/Infrastructure/GamificatonService.CacheStorage/"]
RUN dotnet restore "GamificationService/Gateway/GamificationService.Gateway.API/GamificationService.Gateway.API.csproj"
COPY . .
WORKDIR "/src/GamificationService/Gateway/GamificationService.Gateway.API"
RUN dotnet build "./GamificationService.Gateway.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./GamificationService.Gateway.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GamificationService.Gateway.API.dll"]
