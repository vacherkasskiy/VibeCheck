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
COPY ["Gateway/ReviewService.Gateway.Api/ReviewService.Gateway.Api.csproj", "Gateway/ReviewService.Gateway.Api/"]
COPY ["Implementations/ReviewService.MessageBroker/ReviewService.MessageBroker.csproj", "Implementations/ReviewService.MessageBroker/"]
COPY ["Abstractions/ReviewService.MessageBroker.Abstractions/ReviewService.MessageBroker.Abstractions.csproj", "Abstractions/ReviewService.MessageBroker.Abstractions/"]
COPY ["Abstractions/ReviewService.Core.Abstractions/ReviewService.Core.Abstractions.csproj", "Abstractions/ReviewService.Core.Abstractions/"]
COPY ["Implementations/Storages/ReviewService.CacheStorage/ReviewService.CacheStorage.csproj", "Implementations/Storages/ReviewService.CacheStorage/"]
COPY ["Abstractions/Storages/ReviewService.CacheStorage.Abstractions/ReviewService.CacheStorage.Abstractions.csproj", "Abstractions/Storages/ReviewService.CacheStorage.Abstractions/"]
COPY ["Implementations/Storages/ReviewService.CloudStorage/ReviewService.CloudStorage.csproj", "Implementations/Storages/ReviewService.CloudStorage/"]
COPY ["Abstractions/Storages/ReviewService.CloudStorage.Abstractions/ReviewService.CloudStorage.Abstractions.csproj", "Abstractions/Storages/ReviewService.CloudStorage.Abstractions/"]
COPY ["Implementations/Storages/ReviewService.PersistentStorage/ReviewService.PersistentStorage.csproj", "Implementations/Storages/ReviewService.PersistentStorage/"]
COPY ["Abstractions/Storages/ReviewService.PersistentStorage.Abstractions/ReviewService.PersistentStorage.Abstractions.csproj", "Abstractions/Storages/ReviewService.PersistentStorage.Abstractions/"]
COPY ["Implementations/ReviewService.Core/ReviewService.Core.csproj", "Implementations/ReviewService.Core/"]
RUN dotnet restore "Gateway/ReviewService.Gateway.Api/ReviewService.Gateway.Api.csproj"
COPY . .
WORKDIR "/src/Gateway/ReviewService.Gateway.Api"
RUN dotnet build "./ReviewService.Gateway.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ReviewService.Gateway.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReviewService.Gateway.Api.dll"]
