namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record CompanyLinksRepositoryModel
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}