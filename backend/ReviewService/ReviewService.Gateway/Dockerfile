FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 9464

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["ReviewService/ReviewService.Gateway/ReviewService.Gateway.csproj", "ReviewService/ReviewService.Gateway/"]
COPY ["ReviewService/Implementations/ReviewService.MessageBroker/ReviewService.MessageBroker.csproj", "ReviewService/Implementations/ReviewService.MessageBroker/"]
COPY ["ReviewService/Abstractions/ReviewService.MessageBroker.Abstractions/ReviewService.MessageBroker.Abstractions.csproj", "ReviewService/Abstractions/ReviewService.MessageBroker.Abstractions/"]
COPY ["ReviewService/Implementations/Storages/ReviewService.CacheStorage/ReviewService.CacheStorage.csproj", "ReviewService/Implementations/Storages/ReviewService.CacheStorage/"]
COPY ["ReviewService/Abstractions/Storages/ReviewService.CacheStorage.Abstractions/ReviewService.CacheStorage.Abstractions.csproj", "ReviewService/Abstractions/Storages/ReviewService.CacheStorage.Abstractions/"]
COPY ["ReviewService/Implementations/Storages/ReviewService.CloudStorage/ReviewService.CloudStorage.csproj", "ReviewService/Implementations/Storages/ReviewService.CloudStorage/"]
COPY ["ReviewService/Abstractions/Storages/ReviewService.CloudStorage.Abstractions/ReviewService.CloudStorage.Abstractions.csproj", "ReviewService/Abstractions/Storages/ReviewService.CloudStorage.Abstractions/"]
COPY ["ReviewService/Implementations/Storages/ReviewService.PersistentStorage/ReviewService.PersistentStorage.csproj", "ReviewService/Implementations/Storages/ReviewService.PersistentStorage/"]
COPY ["ReviewService/Abstractions/Storages/ReviewService.PersistentStorage.Abstractions/ReviewService.PersistentStorage.Abstractions.csproj", "ReviewService/Abstractions/Storages/ReviewService.PersistentStorage.Abstractions/"]
COPY ["ReviewService/Implementations/ReviewService.Core/ReviewService.Core.csproj", "ReviewService/Implementations/ReviewService.Core/"]
COPY ["ReviewService/Abstractions/ReviewService.Core.Abstractions/ReviewService.Core.Abstractions.csproj", "ReviewService/Abstractions/ReviewService.Core.Abstractions/"]

RUN dotnet restore "ReviewService/ReviewService.Gateway/ReviewService.Gateway.csproj"

COPY . .

WORKDIR "/src/ReviewService/ReviewService.Gateway"
RUN dotnet build "./ReviewService.Gateway.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ReviewService.Gateway.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:KafkaContractsDir=/src/contracts/kafka

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReviewService.Gateway.dll"]
