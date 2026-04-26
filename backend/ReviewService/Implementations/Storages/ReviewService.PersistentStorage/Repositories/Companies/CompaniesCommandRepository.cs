using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using ReviewService.PersistentStorage.Entities;

namespace ReviewService.PersistentStorage.Repositories.Companies;

internal sealed class CompaniesCommandRepository(AppDbContext dbContext) : ICompaniesCommandRepository
{ 
    public async Task<CreateCompanyRequestRepositoryOutputModel> CreateCompanyRequestAsync(
        CreateCompanyRequestRepositoryInputModel model,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        var entity = new CompanyRequestEntity
        {
            Id = Guid.NewGuid(),
            RequesterUserId = model.RequesterUserId,
            Name = model.Name.Trim(),
            SiteUrl = model.SiteUrl,
            Status = "pending",
            CreatedAt = now,
            DecidedAt = null,
            DecidedByUserId = null
        };

        dbContext.CompanyRequests.Add(entity);
        await dbContext.SaveChangesAsync(ct);

        return new CreateCompanyRequestRepositoryOutputModel
        {
            RequestId = entity.Id,
            Status = entity.Status,
            CreatedAtUtc = entity.CreatedAt
        };
    }
}