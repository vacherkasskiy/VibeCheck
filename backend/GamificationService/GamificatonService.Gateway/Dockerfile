FROM --platform=$TARGETPLATFORM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["GamificationService/GamificatonService.Gateway/GamificatonService.Gateway.csproj", "GamificationService/GamificatonService.Gateway/"]
COPY ["GamificationService/Implementations/GamificatonService.MessageBroker/GamificatonService.MessageBroker.csproj", "GamificationService/Implementations/GamificatonService.MessageBroker/"]
COPY ["GamificationService/Abstractions/GamificatonService.Core.Abstractions/GamificatonService.Core.Abstractions.csproj", "GamificationService/Abstractions/GamificatonService.Core.Abstractions/"]
COPY ["GamificationService/Abstractions/GamificatonService.MessageBroker.Abstractions/GamificatonService.MessageBroker.Abstractions.csproj", "GamificationService/Abstractions/GamificatonService.MessageBroker.Abstractions/"]
COPY ["GamificationService/Implementations/Storages/GamificatonService.CacheStorage/GamificatonService.CacheStorage.csproj", "GamificationService/Implementations/Storages/GamificatonService.CacheStorage/"]
COPY ["GamificationService/Abstractions/Storages/GamificatonService.CacheStorage.Abstractions/GamificatonService.CacheStorage.Abstractions.csproj", "GamificationService/Abstractions/Storages/GamificatonService.CacheStorage.Abstractions/"]
COPY ["GamificationService/Implementations/Storages/GamificatonService.CloudStorage/GamificatonService.CloudStorage.csproj", "GamificationService/Implementations/Storages/GamificatonService.CloudStorage/"]
COPY ["GamificationService/Abstractions/Storages/GamificatonService.CloudStorage.Abstractions/GamificatonService.CloudStorage.Abstractions.csproj", "GamificationService/Abstractions/Storages/GamificatonService.CloudStorage.Abstractions/"]
COPY ["GamificationService/Implementations/Storages/GamificatonService.PersistentStorage/GamificatonService.PersistentStorage.csproj", "GamificationService/Implementations/Storages/GamificatonService.PersistentStorage/"]
COPY ["GamificationService/Abstractions/Storages/GamificatonService.PersistentStorage.Abstractions/GamificatonService.PersistentStorage.Abstractions.csproj", "GamificationService/Abstractions/Storages/GamificatonService.PersistentStorage.Abstractions/"]
COPY ["GamificationService/Implementations/GamificatonService.Core/GamificatonService.Core.csproj", "GamificationService/Implementations/GamificatonService.Core/"]

RUN dotnet restore "GamificationService/GamificatonService.Gateway/GamificatonService.Gateway.csproj"

COPY . .

WORKDIR "/src/GamificationService/GamificatonService.Gateway"
RUN dotnet build "./GamificatonService.Gateway.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./GamificatonService.Gateway.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GamificatonService.Gateway.dll"]
