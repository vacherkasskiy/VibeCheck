namespace ReviewService.CloudStorage.Abstractions.Services;

/// <summary>
/// минимальный контракт для работы с minio/s3: получить ссылку и (опционально) загрузить объект.
/// </summary>
public interface ICompanyIconsStorage
{
    /// <summary>
    /// возвращает presigned url для чтения иконки компании.
    /// </summary>
    Task<string> GetIconReadUrlAsync(Guid iconId, CancellationToken ct);

    /// <summary>
    /// загрузка иконки из base64 (пока не используете).
    /// base64 может быть как "AAAA..." так и data-uri "data:image/png;base64,AAAA..."
    /// </summary>
    Task PutIconFromBase64Async(
        Guid iconId,
        string base64,
        string contentType,
        CancellationToken ct);
}